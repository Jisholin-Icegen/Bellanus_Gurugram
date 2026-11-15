using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using WebPush;

namespace Dial50_MVC_Core.Services
{
    public class PushSender
    {
        private readonly PushStore _store;
        private readonly WebPushClient _client = new WebPushClient();
        private readonly HttpClient _http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        private readonly ILogger<PushSender> _log;
        private static readonly ConcurrentDictionary<string, DateTime> _recent = new();

        public PushSender(PushStore store, IConfiguration cfg, ILogger<PushSender> log)
        {
            _store = store;
            _log = log;
            _client.SetVapidDetails(cfg["Vapid:Subject"], cfg["Vapid:PublicKey"], cfg["Vapid:PrivateKey"]);
        }

        private static bool IsDuplicate(string roomNo, string tag)
        {
            if (string.IsNullOrEmpty(tag)) return false;

            var now = DateTime.UtcNow;

            foreach (var k in _recent.Where(x => now - x.Value > TimeSpan.FromMinutes(10)).Select(x => x.Key).ToList())
                _recent.TryRemove(k, out _);

            var key = (roomNo ?? "").Trim().ToUpperInvariant() + "|" + tag;

            if (_recent.TryGetValue(key, out var last) && now - last < TimeSpan.FromSeconds(30))
                return true;

            _recent[key] = now;
            return false;
        }

        public async Task<int> SendToRoomAsync(string roomNo, string title, string body, string relativeUrl, string tag)
        {
            if (IsDuplicate(roomNo, tag)) return 0;

            var subs = await _store.GetByRoomAsync(roomNo);
            var sent = 0;

            _log.LogInformation("Push to room {Room}: {Count} subscription(s)", roomNo, subs.Count);

            var topic = Regex.Replace(tag ?? "", "[^A-Za-z0-9_-]", "");
            if (topic.Length > 32) topic = topic.Substring(0, 32);

            foreach (var s in subs)
            {
                var url = (relativeUrl ?? "").TrimStart('/');

                if (!string.IsNullOrEmpty(s.BedInfo))
                    url += (url.Contains('?') ? "&" : "?") + "BedInfo=" + Uri.EscapeDataString(s.BedInfo);

                var payload = JsonSerializer.Serialize(new { title, body, url, tag });

                try
                {
                    var request = _client.GenerateRequestDetails(new PushSubscription(s.Endpoint, s.P256dh, s.Auth), payload);

                    request.Headers.Remove("TTL");
                    request.Headers.TryAddWithoutValidation("TTL", "3600");
                    request.Headers.TryAddWithoutValidation("Urgency", "normal");

                    if (topic.Length > 0)
                        request.Headers.TryAddWithoutValidation("Topic", topic);

                    using var response = await _http.SendAsync(request);

                    if (response.IsSuccessStatusCode)
                    {
                        sent++;
                    }
                    else if (response.StatusCode == HttpStatusCode.Gone || response.StatusCode == HttpStatusCode.NotFound)
                    {
                        await _store.DeleteAsync(s.Endpoint);
                    }
                    else
                    {
                        var text = await response.Content.ReadAsStringAsync();
                        _log.LogWarning("Push rejected {Status} for room {Room}: {Body}", (int)response.StatusCode, roomNo, text);
                    }
                }
                catch (Exception ex)
                {
                    _log.LogWarning(ex, "Push failed for room {Room}", roomNo);
                }
            }

            return sent;
        }

        public async Task<int> SendToAllAsync(string title, string body, string relativeUrl, string tag)
        {
            var subs = await _store.GetAllAsync();
            var total = 0;

            foreach (var room in subs.Select(s => s.RoomNo.Trim()).Distinct(StringComparer.OrdinalIgnoreCase))
                total += await SendToRoomAsync(room, title, body, relativeUrl, tag);

            return total;
        }
    }
}