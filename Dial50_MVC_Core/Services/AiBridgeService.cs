using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Channels;

namespace Dial50_MVC_Core.Services
{
    /// <summary>One message pushed to a device (an action to run, or suggestions to show).</summary>
    public sealed class AiBridgeEvent
    {
        public long Id { get; init; }
        public string Type { get; init; } = "action";   // "action" | "suggestions"
        public string Json { get; init; } = "{}";       // single-line JSON
        public DateTime AtUtc { get; init; } = DateTime.UtcNow;
    }

    /// <summary>What the device reported after it tried to run an action.</summary>
    public sealed class AiBridgeResult
    {
        public long Seq { get; init; }
        public string? RequestId { get; init; }
        public string? Action { get; init; }
        public bool Success { get; init; }
        public string? Error { get; init; }
        public string? ResultJson { get; init; }
        public DateTime AtUtc { get; init; } = DateTime.UtcNow;
    }

    /// <summary>
    /// One browser tab / device. Everything is keyed by its own random SessionId, so two devices on the
    /// same bed never see each other's screen, actions or videos.
    /// </summary>
    public sealed class AiBridgeSession
    {
        public string SessionId { get; init; } = "";
        public string BedId { get; set; } = "";
        public string DeviceId { get; set; } = "";
        public string Route { get; set; } = "";
        public string Title { get; set; } = "";
        public bool CallActive { get; set; }
        public string ScreenJson { get; set; } = "{}";
        public long ScreenVersion { get; set; }
        public DateTime CreatedUtc { get; init; } = DateTime.UtcNow;
        public DateTime LastSeenUtc { get; set; } = DateTime.UtcNow;
        public DateTime ScreenUpdatedUtc { get; set; }

        internal long NextEventId;
        internal long NextResultSeq;
        internal readonly LinkedList<AiBridgeEvent> Backlog = new();
        internal readonly LinkedList<AiBridgeResult> Results = new();
        internal readonly List<Channel<AiBridgeEvent>> Subscribers = new();
        internal readonly object Gate = new();

        public int SubscriberCount
        {
            get { lock (Gate) { return Subscribers.Count; } }
        }
    }

    public sealed class AiBridgeService
    {
        private const int MaxSessions = 2000;
        private const int MaxBacklog = 100;
        private const int MaxResults = 200;
        private static readonly TimeSpan IdleExpiry = TimeSpan.FromHours(6);
        private static readonly TimeSpan ReplayWindow = TimeSpan.FromSeconds(10);

        private readonly ConcurrentDictionary<string, AiBridgeSession> _sessions = new();
        private DateTime _lastCleanupUtc = DateTime.UtcNow;

        public static bool IsValidSessionId(string? id)
        {
            if (string.IsNullOrEmpty(id) || id.Length < 16 || id.Length > 64) return false;
            foreach (var c in id)
            {
                if (!(char.IsAsciiLetterOrDigit(c) || c == '-' || c == '_')) return false;
            }
            return true;
        }

        public AiBridgeSession? Find(string sessionId)
        {
            return _sessions.TryGetValue(sessionId, out var session) ? session : null;
        }

        /// <summary>Returns the session, creating it on first use. Returns null when the server is full.</summary>
        public AiBridgeSession? GetOrCreate(string sessionId)
        {
            Cleanup();
            if (_sessions.TryGetValue(sessionId, out var existing)) return existing;
            if (_sessions.Count >= MaxSessions) return null;
            return _sessions.GetOrAdd(sessionId, id => new AiBridgeSession { SessionId = id });
        }

        public List<AiBridgeSession> List(string? bedId)
        {
            return _sessions.Values
                .Where(s => string.IsNullOrWhiteSpace(bedId) || s.BedId == bedId)
                .OrderByDescending(s => s.LastSeenUtc)
                .ToList();
        }

        public void UpdateScreen(AiBridgeSession session, string bedId, string deviceId, bool callActive, JsonElement screen)
        {
            lock (session.Gate)
            {
                session.BedId = bedId;
                session.DeviceId = deviceId;
                session.CallActive = callActive;
                session.ScreenJson = screen.GetRawText();
                session.Route = ReadString(screen, "route");
                session.Title = ReadString(screen, "title");
                session.ScreenVersion++;
                session.ScreenUpdatedUtc = DateTime.UtcNow;
                session.LastSeenUtc = DateTime.UtcNow;
            }
        }

        /// <summary>Queues an event and pushes it to every live stream of THIS session. Returns the number of live streams.</summary>
        public int Publish(AiBridgeSession session, string type, string json)
        {
            lock (session.Gate)
            {
                var evt = new AiBridgeEvent { Id = ++session.NextEventId, Type = type, Json = json };
                session.Backlog.AddLast(evt);
                while (session.Backlog.Count > MaxBacklog) session.Backlog.RemoveFirst();
                foreach (var channel in session.Subscribers) channel.Writer.TryWrite(evt);
                return session.Subscribers.Count;
            }
        }

        /// <summary>
        /// Opens a stream. When the browser reconnects (lastEventId &gt; 0) only events from the last few
        /// seconds are replayed, so an old click is never run twice.
        /// </summary>
        public (Channel<AiBridgeEvent> Channel, List<AiBridgeEvent> Replay) Subscribe(AiBridgeSession session, long lastEventId)
        {
            var channel = Channel.CreateUnbounded<AiBridgeEvent>(new UnboundedChannelOptions { SingleReader = true });
            var replay = new List<AiBridgeEvent>();
            lock (session.Gate)
            {
                session.Subscribers.Add(channel);
                session.LastSeenUtc = DateTime.UtcNow;
                if (lastEventId > 0)
                {
                    var cutoff = DateTime.UtcNow - ReplayWindow;
                    replay = session.Backlog.Where(e => e.Id > lastEventId && e.AtUtc >= cutoff).ToList();
                }
            }
            return (channel, replay);
        }

        public void Unsubscribe(AiBridgeSession session, Channel<AiBridgeEvent> channel)
        {
            lock (session.Gate)
            {
                session.Subscribers.Remove(channel);
                session.LastSeenUtc = DateTime.UtcNow;
            }
            channel.Writer.TryComplete();
        }

        public void AddResult(AiBridgeSession session, string? requestId, string? action, bool success, string? error, string? resultJson)
        {
            lock (session.Gate)
            {
                session.Results.AddLast(new AiBridgeResult
                {
                    Seq = ++session.NextResultSeq,
                    RequestId = requestId,
                    Action = action,
                    Success = success,
                    Error = error,
                    ResultJson = resultJson
                });
                while (session.Results.Count > MaxResults) session.Results.RemoveFirst();
                session.LastSeenUtc = DateTime.UtcNow;
            }
        }

        public List<AiBridgeResult> GetResults(AiBridgeSession session, long after)
        {
            lock (session.Gate)
            {
                return session.Results.Where(r => r.Seq > after).ToList();
            }
        }

        public void Touch(AiBridgeSession session)
        {
            lock (session.Gate) { session.LastSeenUtc = DateTime.UtcNow; }
        }

        private void Cleanup()
        {
            var now = DateTime.UtcNow;
            if (now - _lastCleanupUtc < TimeSpan.FromMinutes(1)) return;
            _lastCleanupUtc = now;
            var cutoff = now - IdleExpiry;
            foreach (var pair in _sessions)
            {
                if (pair.Value.LastSeenUtc < cutoff && pair.Value.SubscriberCount == 0)
                {
                    _sessions.TryRemove(pair.Key, out _);
                }
            }
        }

        private static string ReadString(JsonElement element, string name)
        {
            if (element.ValueKind == JsonValueKind.Object
                && element.TryGetProperty(name, out var value)
                && value.ValueKind == JsonValueKind.String)
            {
                return value.GetString() ?? "";
            }
            return "";
        }
    }
}
