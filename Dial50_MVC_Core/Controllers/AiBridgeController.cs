using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dial50_MVC_Core.Controllers
{
    // ------------------------------------------------------------------------------------------------
    //  AI BRIDGE  -  see AI_BRIDGE_API_FOR_AI_TEAM.txt for the full contract.
    //
    //  AI team (header  X-Api-Key):
    //    GET  /api/ai-bridge/sessions?bed_id=9330                list the open screens (devices) of a bed
    //    GET  /api/ai-bridge/sessions/{id}/options               ALL buttons / controls on that device's current screen
    //    POST /api/ai-bridge/sessions/{id}/actions               the AI posts what the patient asked + suggestions
    //    GET  /api/ai-bridge/sessions/{id}/results?after=0       what the device did with those actions
    //
    //  Device (browser, same origin, no key - the random session id is the credential):
    //    PUT  /api/ai-bridge/sessions/{id}/screen                device publishes its current screen
    //    GET  /api/ai-bridge/sessions/{id}/events                server-sent events: actions + suggestions for THIS device only
    //    POST /api/ai-bridge/sessions/{id}/results               device reports the result of an action
    // ------------------------------------------------------------------------------------------------
    [ApiController]
    [Route("api/ai-bridge")]
    public class AiBridgeController : ControllerBase
    {
        private static readonly string[] AllowedActionPrefixes = { "ui.", "video.", "food.", "request.", "notification.", "feedback." };

        private readonly AiBridgeService _bridge;
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<AiBridgeController> _logger;

        public AiBridgeController(AiBridgeService bridge, IConfiguration config, IWebHostEnvironment env, ILogger<AiBridgeController> logger)
        {
            _bridge = bridge;
            _config = config;
            _env = env;
            _logger = logger;
        }

        // =============================================================================================
        //  AI TEAM ENDPOINTS
        // =============================================================================================

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new Dictionary<string, object> { ["ok"] = true, ["sessions"] = _bridge.List(null).Count });
        }

        // ---- THE ONLY TWO AI-FACING CALLS (both keyed by bed_id, no session id needed) ----
        //   GET  /api/ai-bridge/bed/{bedId}/options   -> screen controls + session_id + device_id + recent results
        //   POST /api/ai-bridge/bed/{bedId}/actions   -> run actions / show suggestions (echo session_id+device_id back to pin one tab)

        /// <summary>"getalloptions": every button / control the patient's CURRENT screen, found by bed_id alone.</summary>
        [HttpGet("bed/{bedId}/options")]
        public IActionResult BedOptions(string bedId, [FromQuery(Name = "include_raw")] bool includeRaw)
        {
            var denied = RequireApiKey();
            if (denied != null) return denied;

            var session = ResolveBedSession(bedId);
            if (session == null) return NotFound(new Dictionary<string, object> { ["error"] = "No device has published a screen for bed_id " + bedId + " yet." });
            return OptionsFor(session, includeRaw);
        }

        /// <summary>Post actions for a bed. Echo session_id + device_id from the GET response to pin ONE tab/device; omit them to auto-resolve.</summary>
        [HttpPost("bed/{bedId}/actions")]
        [RequestSizeLimit(65536)]
        public IActionResult BedActions(string bedId, [FromBody] AiActionsPost body)
        {
            var denied = RequireApiKey();
            if (denied != null) return denied;

            AiBridgeSession? session = null;
            if (body != null && AiBridgeService.IsValidSessionId(body.SessionId))
            {
                session = _bridge.Find(body.SessionId.Trim());
                if (session != null && !string.IsNullOrWhiteSpace(session.BedId)
                    && !string.IsNullOrWhiteSpace(bedId) && session.BedId != bedId)
                {
                    return Conflict(new Dictionary<string, object> { ["error"] = "session_id belongs to bed_id " + session.BedId + ", not " + bedId + "." });
                }
            }
            session ??= ResolveBedSession(bedId);
            if (session == null) return NotFound(new Dictionary<string, object> { ["error"] = "No device has published a screen for bed_id " + bedId + " yet." });
            return ActionsFor(session, body);
        }

        /// <summary>
        /// Picks the ONE device to drive for a bed when the caller only knows bed_id:
        /// the tab with a live voice call first, then any connected screen, then the
        /// most recently seen. With two tabs open, actions land on the call's tab.
        /// </summary>
        private AiBridgeSession? ResolveBedSession(string bedId)
        {
            var sessions = _bridge.List(bedId);
            return sessions.FirstOrDefault(s => s.CallActive && s.SubscriberCount > 0)
                ?? sessions.FirstOrDefault(s => s.SubscriberCount > 0)
                ?? sessions.FirstOrDefault(s => s.CallActive)
                ?? sessions.FirstOrDefault();
        }

        private IActionResult OptionsFor(AiBridgeSession session, bool includeRaw)
        {
            string screenJson;
            long version;
            DateTime updated;
            lock (session.Gate)
            {
                screenJson = session.ScreenJson;
                version = session.ScreenVersion;
                updated = session.ScreenUpdatedUtc;
            }

            using var doc = JsonDocument.Parse(screenJson);
            var screen = doc.RootElement;

            // the ONE GET also returns what the device did with earlier actions,
            // so the AI team never needs a third call
            var allResults = BuildResultRows(session, 0);
            var recentResults = allResults.Count > 20 ? allResults.GetRange(allResults.Count - 20, 20) : allResults;

            var response = new Dictionary<string, object>
            {
                ["session_id"] = session.SessionId,
                ["bed_id"] = session.BedId,
                ["device_id"] = session.DeviceId,
                ["call_active"] = session.CallActive,
                ["route"] = session.Route,
                ["title"] = session.Title,
                ["screen_version"] = version,
                ["updated_utc"] = updated == default ? "" : updated.ToString("o"),
                ["headings"] = ReadArrayOrEmpty(screen, "headings"),
                ["options"] = BuildOptions(screen),
                ["items"] = ReadArrayOrEmpty(screen, "items"),
                ["results"] = recentResults,
                ["last_seq"] = session.NextResultSeq
            };
            if (includeRaw) response["raw_screen"] = screen;

            // serialise here, while the JsonDocument is still alive
            return Content(JsonSerializer.Serialize(response), "application/json");
        }

        private IActionResult ActionsFor(AiBridgeSession session, AiActionsPost body)
        {
            if (body == null) return BadRequest(new Dictionary<string, object> { ["error"] = "A JSON body is required." });

            var actions = body.Actions ?? new List<JsonElement>();
            var suggestions = body.Suggestions ?? new List<AiSuggestionPost>();
            if (actions.Count == 0 && suggestions.Count == 0)
                return BadRequest(new Dictionary<string, object> { ["error"] = "Send at least one action or one suggestion." });
            if (actions.Count > 10) return BadRequest(new Dictionary<string, object> { ["error"] = "At most 10 actions per call." });
            if (suggestions.Count > 8) return BadRequest(new Dictionary<string, object> { ["error"] = "At most 8 suggestions per call." });

            var requestId = string.IsNullOrWhiteSpace(body.RequestId) ? "ai-" + Guid.NewGuid().ToString("N").Substring(0, 12) : body.RequestId.Trim();
            if (requestId.Length > 80) requestId = requestId.Substring(0, 80);

            // validate everything first, then publish, so a bad item never leaves the screen half-driven
            var actionJson = new List<string>();
            for (var i = 0; i < actions.Count; i++)
            {
                if (!TryBuildAction(actions[i], requestId + "-" + (i + 1), out var json, out var error))
                    return BadRequest(new Dictionary<string, object> { ["error"] = "actions[" + i + "]: " + error });
                actionJson.Add(json);
            }

            var suggestionRows = new List<Dictionary<string, object>>();
            for (var i = 0; i < suggestions.Count; i++)
            {
                var label = (suggestions[i].Label ?? "").Trim();
                if (label.Length == 0) return BadRequest(new Dictionary<string, object> { ["error"] = "suggestions[" + i + "]: label is required." });
                if (label.Length > 80) label = label.Substring(0, 80);
                if (!TryBuildAction(suggestions[i].Action, requestId + "-s" + (i + 1), out var json, out var error))
                    return BadRequest(new Dictionary<string, object> { ["error"] = "suggestions[" + i + "].action: " + error });
                using var parsed = JsonDocument.Parse(json);
                suggestionRows.Add(new Dictionary<string, object> { ["label"] = label, ["action"] = parsed.RootElement.Clone() });
            }

            var delivered = 0;
            foreach (var json in actionJson) delivered = _bridge.Publish(session, "action", json);

            if (suggestionRows.Count > 0)
            {
                var payload = new Dictionary<string, object>
                {
                    ["request_id"] = requestId,
                    ["transcript"] = (body.Transcript ?? "").Length > 300 ? body.Transcript.Substring(0, 300) : (body.Transcript ?? ""),
                    ["suggestions"] = suggestionRows
                };
                delivered = _bridge.Publish(session, "suggestions", JsonSerializer.Serialize(payload));
            }

            var result = new Dictionary<string, object>
            {
                ["accepted"] = true,
                ["request_id"] = requestId,
                ["actions"] = actionJson.Count,
                ["suggestions"] = suggestionRows.Count,
                ["delivered_to_streams"] = delivered
            };
            if (delivered == 0)
                result["warning"] = "The device has no open event stream right now. Events are kept for a few seconds and are delivered if it reconnects.";

            return StatusCode(202, result);
        }

        private List<Dictionary<string, object>> BuildResultRows(AiBridgeSession session, long after)
        {
            var rows = new List<Dictionary<string, object>>();
            foreach (var r in _bridge.GetResults(session, after))
            {
                var row = new Dictionary<string, object>
                {
                    ["seq"] = r.Seq,
                    ["request_id"] = r.RequestId ?? "",
                    ["action"] = r.Action ?? "",
                    ["success"] = r.Success,
                    ["error"] = r.Error ?? "",
                    ["at_utc"] = r.AtUtc.ToString("o")
                };
                if (!string.IsNullOrEmpty(r.ResultJson))
                {
                    try { row["result"] = JsonSerializer.Deserialize<JsonElement>(r.ResultJson); } catch (JsonException) { }
                }
                rows.Add(row);
            }
            return rows;
        }

        // =============================================================================================
        //  DEVICE ENDPOINTS (same origin; the random session id is the credential)
        // =============================================================================================

        [HttpPut("sessions/{sessionId}/screen")]
        [RequestSizeLimit(524288)]
        public IActionResult PutScreen(string sessionId, [FromBody] AiScreenPush body)
        {
            if (!AiBridgeService.IsValidSessionId(sessionId)) return BadRequest(new Dictionary<string, object> { ["error"] = "Invalid session id." });
            if (body == null || body.Screen.ValueKind != JsonValueKind.Object)
                return BadRequest(new Dictionary<string, object> { ["error"] = "screen must be a JSON object." });

            var session = _bridge.GetOrCreate(sessionId);
            if (session == null) return StatusCode(429, new Dictionary<string, object> { ["error"] = "Too many open sessions." });

            _bridge.UpdateScreen(session, Trim(body.BedId, 64), Trim(body.DeviceId, 64), body.CallActive, body.Screen);
            return Ok(new Dictionary<string, object> { ["ok"] = true, ["screen_version"] = session.ScreenVersion });
        }

        [HttpPost("sessions/{sessionId}/results")]
        [RequestSizeLimit(65536)]
        public IActionResult PostResult(string sessionId, [FromBody] AiResultPost body)
        {
            if (!AiBridgeService.IsValidSessionId(sessionId)) return BadRequest(new Dictionary<string, object> { ["error"] = "Invalid session id." });
            var session = _bridge.Find(sessionId);
            if (session == null || body == null) return NotFound(new Dictionary<string, object> { ["error"] = "Unknown session." });

            string resultJson = null;
            if (body.Result.ValueKind != JsonValueKind.Undefined && body.Result.ValueKind != JsonValueKind.Null)
            {
                var raw = body.Result.GetRawText();
                resultJson = raw.Length <= 8000 ? raw : null;
            }
            _bridge.AddResult(session, Trim(body.RequestId, 80), Trim(body.Action, 100), body.Success, Trim(body.Error, 500), resultJson);
            return Ok(new Dictionary<string, object> { ["ok"] = true });
        }

        /// <summary>Server-sent events for ONE device: its actions and suggestions only.</summary>
        [HttpGet("sessions/{sessionId}/events")]
        public async Task Events(string sessionId, CancellationToken cancellationToken)
        {
            if (!AiBridgeService.IsValidSessionId(sessionId))
            {
                Response.StatusCode = 400;
                return;
            }

            var session = _bridge.GetOrCreate(sessionId);
            if (session == null)
            {
                Response.StatusCode = 429;
                return;
            }

            long.TryParse(Request.Headers["Last-Event-ID"].ToString(), out var lastEventId);

            Response.StatusCode = 200;
            Response.ContentType = "text/event-stream";
            Response.Headers["Cache-Control"] = "no-cache";
            Response.Headers["X-Accel-Buffering"] = "no";

            var subscription = _bridge.Subscribe(session, lastEventId);
            try
            {
                await Response.WriteAsync("retry: 2000\n: connected\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);

                foreach (var replayed in subscription.Replay) await WriteEvent(replayed, cancellationToken);

                while (!cancellationToken.IsCancellationRequested)
                {
                    using var wait = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                    wait.CancelAfter(TimeSpan.FromSeconds(15));
                    try
                    {
                        if (!await subscription.Channel.Reader.WaitToReadAsync(wait.Token)) break;
                        while (subscription.Channel.Reader.TryRead(out var evt)) await WriteEvent(evt, cancellationToken);
                    }
                    catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
                    {
                        // 15 s without events: keep proxies and the browser from closing the idle stream
                        await Response.WriteAsync(": ping\n\n", cancellationToken);
                        await Response.Body.FlushAsync(cancellationToken);
                        _bridge.Touch(session);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // the browser closed the stream
            }
            finally
            {
                _bridge.Unsubscribe(session, subscription.Channel);
            }
        }

        // =============================================================================================
        //  helpers
        // =============================================================================================

        private async Task WriteEvent(AiBridgeEvent evt, CancellationToken cancellationToken)
        {
            await Response.WriteAsync("id: " + evt.Id + "\nevent: " + evt.Type + "\ndata: " + evt.Json + "\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }

        /// <summary>Returns null when allowed, or the error response to send.</summary>
        private IActionResult RequireApiKey()
        {
            var expected = _config["AiBridge:ApiKey"];
            if (string.IsNullOrWhiteSpace(expected))
            {
                if (_env.IsDevelopment()) return null;   // local testing without a key
                return StatusCode(503, new Dictionary<string, object> { ["error"] = "AiBridge:ApiKey is not configured on the server." });
            }

            var supplied = Request.Headers["X-Api-Key"].ToString();
            var a = Encoding.UTF8.GetBytes(expected);
            var b = Encoding.UTF8.GetBytes(supplied);
            if (a.Length == b.Length && CryptographicOperations.FixedTimeEquals(a, b)) return null;

            _logger.LogWarning("AiBridge: rejected a request with a missing or wrong X-Api-Key.");
            return Unauthorized(new Dictionary<string, object> { ["error"] = "Invalid or missing X-Api-Key." });
        }

        private static string Trim(string value, int max)
        {
            if (string.IsNullOrEmpty(value)) return "";
            value = value.Trim();
            return value.Length > max ? value.Substring(0, max) : value;
        }

        private static bool TryBuildAction(JsonElement element, string defaultRequestId, out string json, out string error)
        {
            json = "";
            error = "";

            if (element.ValueKind != JsonValueKind.Object)
            {
                error = "must be a JSON object.";
                return false;
            }

            var fields = new Dictionary<string, JsonElement>();
            foreach (var property in element.EnumerateObject()) fields[property.Name] = property.Value.Clone();

            if (!fields.TryGetValue("action", out var nameElement) || nameElement.ValueKind != JsonValueKind.String)
            {
                error = "needs a string \"action\" property (for example \"navigate\" or \"ui.click\").";
                return false;
            }

            var name = nameElement.GetString() ?? "";
            var allowed = name == "navigate" || AllowedActionPrefixes.Any(prefix => name.StartsWith(prefix, StringComparison.Ordinal));
            if (!allowed)
            {
                error = "action \"" + name + "\" is not allowed. Use navigate, ui.*, video.*, food.*, request.*, notification.* or feedback.*.";
                return false;
            }

            if (name == "navigate")
            {
                var path = fields.TryGetValue("path", out var pathElement) && pathElement.ValueKind == JsonValueKind.String ? pathElement.GetString() ?? "" : "";
                if (!path.StartsWith("/", StringComparison.Ordinal) || path.StartsWith("//", StringComparison.Ordinal) || path.Contains("://"))
                {
                    error = "navigate needs \"path\" as a same-site path such as \"/RoomComfort/Index\".";
                    return false;
                }
            }

            var hasRequestId = fields.TryGetValue("request_id", out var rid)
                               && rid.ValueKind == JsonValueKind.String
                               && !string.IsNullOrWhiteSpace(rid.GetString());
            if (!hasRequestId) fields["request_id"] = JsonSerializer.SerializeToElement(defaultRequestId);

            json = JsonSerializer.Serialize(fields);
            return true;
        }

        private static List<Dictionary<string, object>> BuildOptions(JsonElement screen)
        {
            var options = new List<Dictionary<string, object>>();

            foreach (var a in ArrayItems(screen, "actions"))
            {
                if (ReadBool(a, "disabled")) continue;
                var label = ReadString(a, "label");
                if (label.Length == 0) continue;
                var targetId = ReadString(a, "targetId");
                var route = ReadString(a, "route");

                if (route.Length > 0)
                {
                    options.Add(new Dictionary<string, object>
                    {
                        ["id"] = "nav:" + route,
                        ["type"] = "navigate",
                        ["label"] = label,
                        ["route"] = route,
                        ["action"] = new Dictionary<string, object> { ["action"] = "navigate", ["path"] = route }
                    });
                }
                else if (targetId.Length > 0)
                {
                    options.Add(new Dictionary<string, object>
                    {
                        ["id"] = targetId,
                        ["type"] = "click",
                        ["label"] = label,
                        ["action"] = new Dictionary<string, object> { ["action"] = "ui.click", ["targetId"] = targetId, ["label"] = label }
                    });
                }
            }

            foreach (var control in ArrayItems(screen, "controls"))
            {
                var controlId = ReadString(control, "id");
                var controlLabel = ReadString(control, "label");
                var key = controlId.Length > 0 ? controlId : controlLabel;
                if (key.Length == 0) continue;
                foreach (var option in ArrayItems(control, "options"))
                {
                    if (ReadBool(option, "disabled")) continue;
                    var value = ReadString(option, "value");
                    options.Add(new Dictionary<string, object>
                    {
                        ["id"] = "select:" + key + ":" + value,
                        ["type"] = "select",
                        ["label"] = ReadString(option, "label"),
                        ["group"] = controlLabel,
                        ["action"] = new Dictionary<string, object> { ["action"] = "ui.select", ["controlId"] = key, ["optionValue"] = value }
                    });
                }
            }

            foreach (var choice in ArrayItems(screen, "choices"))
            {
                if (ReadBool(choice, "disabled")) continue;
                var targetId = ReadString(choice, "targetId");
                if (targetId.Length == 0) continue;
                options.Add(new Dictionary<string, object>
                {
                    ["id"] = targetId,
                    ["type"] = "choice",
                    ["label"] = ReadString(choice, "label"),
                    ["checked"] = ReadBool(choice, "checked"),
                    ["action"] = new Dictionary<string, object> { ["action"] = "ui.set_choice", ["targetId"] = targetId, ["checked"] = true }
                });
            }

            foreach (var field in ArrayItems(screen, "fields"))
            {
                var targetId = ReadString(field, "targetId");
                if (targetId.Length == 0) continue;
                options.Add(new Dictionary<string, object>
                {
                    ["id"] = targetId,
                    ["type"] = "fill",
                    ["label"] = ReadString(field, "label"),
                    ["needs_value"] = true,
                    ["action"] = new Dictionary<string, object> { ["action"] = "ui.fill", ["targetId"] = targetId, ["value"] = "<text the patient said>" }
                });
            }

            return options;
        }

        private static IEnumerable<JsonElement> ArrayItems(JsonElement element, string name)
        {
            if (element.ValueKind == JsonValueKind.Object
                && element.TryGetProperty(name, out var array)
                && array.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in array.EnumerateArray()) yield return item;
            }
        }

        private static JsonElement ReadArrayOrEmpty(JsonElement element, string name)
        {
            if (element.ValueKind == JsonValueKind.Object
                && element.TryGetProperty(name, out var array)
                && array.ValueKind == JsonValueKind.Array)
            {
                return array;
            }
            return JsonSerializer.Deserialize<JsonElement>("[]");
        }

        private static string ReadString(JsonElement element, string name)
        {
            if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out var value))
            {
                if (value.ValueKind == JsonValueKind.String) return value.GetString() ?? "";
                if (value.ValueKind == JsonValueKind.Number || value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False)
                    return value.ToString() ?? "";
            }
            return "";
        }

        private static bool ReadBool(JsonElement element, string name)
        {
            return element.ValueKind == JsonValueKind.Object
                   && element.TryGetProperty(name, out var value)
                   && value.ValueKind == JsonValueKind.True;
        }
    }

    // ---------------------------------------------------------------------------------------------
    //  request bodies (snake_case, to match the voice WebSocket protocol)
    // ---------------------------------------------------------------------------------------------
    public sealed class AiScreenPush
    {
        [JsonPropertyName("bed_id")] public string BedId { get; set; }
        [JsonPropertyName("device_id")] public string DeviceId { get; set; }
        [JsonPropertyName("call_active")] public bool CallActive { get; set; }
        [JsonPropertyName("screen")] public JsonElement Screen { get; set; }
    }

    public sealed class AiActionsPost
    {
        [JsonPropertyName("request_id")] public string RequestId { get; set; }
        [JsonPropertyName("transcript")] public string Transcript { get; set; }
        // optional: echo these back from the GET response to pin ONE tab/device
        [JsonPropertyName("session_id")] public string SessionId { get; set; }
        [JsonPropertyName("device_id")] public string DeviceId { get; set; }
        [JsonPropertyName("actions")] public List<JsonElement> Actions { get; set; }
        [JsonPropertyName("suggestions")] public List<AiSuggestionPost> Suggestions { get; set; }
    }

    public sealed class AiSuggestionPost
    {
        [JsonPropertyName("label")] public string Label { get; set; }
        [JsonPropertyName("action")] public JsonElement Action { get; set; }
    }

    public sealed class AiResultPost
    {
        [JsonPropertyName("request_id")] public string RequestId { get; set; }
        [JsonPropertyName("action")] public string Action { get; set; }
        [JsonPropertyName("success")] public bool Success { get; set; }
        [JsonPropertyName("error")] public string Error { get; set; }
        [JsonPropertyName("result")] public JsonElement Result { get; set; }
    }
}
