using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;

[ApiController]
[Route("api/Push")]
public class PushController : ControllerBase
{
    private readonly IConfiguration _cfg;
    private readonly PushStore _store;
    private readonly PushSender _sender;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<PushController> _log;
    private readonly LandingProtector _protector;
    private readonly IPatientRepository _patientRepository;

    private static readonly string[] AllowedPushHosts =
    {
        "fcm.googleapis.com",
        "updates.push.services.mozilla.com",
        "push.services.mozilla.com",
        "web.push.apple.com",
        "push.apple.com",
        "notify.windows.com"
    };

    public PushController(
        IConfiguration cfg,
        PushStore store,
        PushSender sender,
        IWebHostEnvironment env,
        ILogger<PushController> log,
        LandingProtector protector,
        IPatientRepository patientRepository)
    {
        _cfg = cfg;
        _store = store;
        _sender = sender;
        _env = env;
        _log = log;
        _protector = protector;
        _patientRepository = patientRepository;
    }

    public class KeysDto
    {
        public string p256dh { get; set; } = "";
        public string auth { get; set; } = "";
    }

    public class SubDto
    {
        public string endpoint { get; set; } = "";
        public KeysDto keys { get; set; } = new();
    }

    public class SubscribeDto
    {
        public string RoomNo { get; set; } = "";
        public string BedInfo { get; set; } = "";
        public SubDto Subscription { get; set; } = new();
    }

    public class ResubscribeDto
    {
        public string OldEndpoint { get; set; } = "";
        public SubDto Subscription { get; set; } = new();
    }

    public class SendDto
    {
        public string RoomNo { get; set; } = "";
        public string Title { get; set; } = "";
        public string Body { get; set; } = "";
        public string Url { get; set; } = "";
        public string Tag { get; set; } = "";
    }

    public class RoomDto
    {
        public string RoomNo { get; set; } = "";
    }

    public class PromptDto
    {
        public string RoomNo { get; set; } = "";
        public string BedInfo { get; set; } = "";
    }

    private static string Clean(string? s, int max = 200)
    {
        if (string.IsNullOrEmpty(s)) return "";
        var t = s.Replace("\r", " ").Replace("\n", " ");
        return t.Length > max ? t.Substring(0, max) : t;
    }

    private static bool IsAllowedEndpoint(string? ep)
    {
        if (string.IsNullOrWhiteSpace(ep) || ep.Length > 1000) return false;
        if (!Uri.TryCreate(ep, UriKind.Absolute, out var u)) return false;
        if (u.Scheme != Uri.UriSchemeHttps || !u.IsDefaultPort) return false;

        var host = u.Host.ToLowerInvariant();
        return AllowedPushHosts.Any(h => host == h || host.EndsWith("." + h));
    }

    private static bool ValidKeys(SubDto? sub)
    {
        return sub != null
            && sub.keys != null
            && !string.IsNullOrWhiteSpace(sub.keys.p256dh)
            && !string.IsNullOrWhiteSpace(sub.keys.auth)
            && sub.keys.p256dh.Length <= 200
            && sub.keys.auth.Length <= 100;
    }

    private bool ApiKeyOk()
    {
        var expected = _cfg["Push:ApiKey"] ?? "";
        var given = Request.Headers["X-Api-Key"].ToString();

        if (expected.Length == 0 || given.Length == 0)
            return false;

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expected),
            Encoding.UTF8.GetBytes(given));
    }

    private bool ValidPromptRequest(string roomNo, string bedInfo)
    {
        return !string.IsNullOrWhiteSpace(roomNo)
            && roomNo.Length <= 100
            && (bedInfo ?? "").Length <= 10000;
    }

    private async Task<bool> RoomMatchesBedInfoAsync(string roomNo, string bedInfo)
    {
        if (string.IsNullOrWhiteSpace(bedInfo)) return false;

        try
        {
            var resolved = bedInfo;
            var decrypted = _protector.DecryptAES(Uri.UnescapeDataString(bedInfo));

            if (!string.IsNullOrWhiteSpace(decrypted))
            {
                if (decrypted.Contains("$$"))
                {
                    var p = decrypted.Split("$$", StringSplitOptions.None);
                    resolved = p.Length > 1 && !string.IsNullOrWhiteSpace(p[1]) ? p[1] : p[0];
                }
                else
                {
                    resolved = decrypted;
                }
            }

            var patient = await _patientRepository.GetPatientBedDetailsByBedIdAsync(resolved);
            if (patient == null) return false;

            var room = roomNo.Trim();

            return string.Equals((patient.RoomBed ?? "").Trim(), room, StringComparison.OrdinalIgnoreCase)
                || string.Equals((patient.RoomNumber ?? "").Trim(), room, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    [HttpGet("PublicKey")]
    public IActionResult PublicKey()
    {
        return Ok(new { key = _cfg["Vapid:PublicKey"] });
    }

    [HttpPost("Subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeDto dto)
    {
        if (dto == null || dto.Subscription == null || dto.Subscription.keys == null)
        {
            _log.LogWarning("Subscribe rejected: empty body");
            return BadRequest();
        }

        var ep = dto.Subscription.endpoint ?? "";
        var room = (dto.RoomNo ?? "").Trim();
        var bedInfo = dto.BedInfo ?? "";

        _log.LogInformation("Subscribe room={Room} bedInfoLen={Len} ep={Ep}",
            Clean(room, 100), bedInfo.Length, Clean(ep, 60));

        if (string.IsNullOrWhiteSpace(room) ||
            room.Length > 100 ||
            bedInfo.Length > 2000 ||
            !IsAllowedEndpoint(ep) ||
            !ValidKeys(dto.Subscription))
        {
            _log.LogWarning("Subscribe rejected by validation for room={Room}", Clean(room, 100));
            return BadRequest();
        }

        if (_cfg.GetValue<bool>("Push:VerifyRoom") && !await RoomMatchesBedInfoAsync(room, bedInfo))
        {
            _log.LogWarning("Subscribe rejected: room {Room} does not match BedInfo", Clean(room, 100));
            return StatusCode(403);
        }

        try
        {
            await _store.UpsertAsync(new PushSub
            {
                RoomNo = room,
                BedInfo = bedInfo,
                Endpoint = ep,
                P256dh = dto.Subscription.keys.p256dh,
                Auth = dto.Subscription.keys.auth
            });
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Subscribe database error for room {Room}", Clean(room, 100));
            return StatusCode(500);
        }

        _log.LogInformation("Subscribe saved room={Room}", Clean(room, 100));
        return Ok(new { success = true });
    }

    [HttpPost("Resubscribe")]
    public async Task<IActionResult> Resubscribe([FromBody] ResubscribeDto dto)
    {
        if (dto == null ||
            string.IsNullOrWhiteSpace(dto.OldEndpoint) ||
            dto.OldEndpoint.Length > 1000 ||
            dto.Subscription == null ||
            !IsAllowedEndpoint(dto.Subscription.endpoint) ||
            !ValidKeys(dto.Subscription))
            return BadRequest();

        try
        {
            await _store.ReplaceAsync(dto.OldEndpoint, new PushSub
            {
                Endpoint = dto.Subscription.endpoint,
                P256dh = dto.Subscription.keys.p256dh,
                Auth = dto.Subscription.keys.auth
            });
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Resubscribe database error");
            return StatusCode(500);
        }

        return Ok(new { success = true });
    }

    [HttpPost("ClientLog")]
    public IActionResult ClientLog([FromBody] Dictionary<string, string> data)
    {
        if (data == null) return Ok();

        var line = string.Join(" | ", data.Take(10).Select(kv => Clean(kv.Key, 30) + "=" + Clean(kv.Value, 200)));
        _log.LogWarning("ClientLog {Line}", line);

        return Ok();
    }

    [HttpGet("Diag")]
    public async Task<IActionResult> Diag(string roomNo)
    {
        if (!_env.IsDevelopment() && !ApiKeyOk())
            return NotFound();

        if (string.IsNullOrWhiteSpace(roomNo)) return BadRequest();

        var subs = await _store.GetByRoomAsync(roomNo);
        var client = new WebPush.WebPushClient();
        client.SetVapidDetails(_cfg["Vapid:Subject"], _cfg["Vapid:PublicKey"], _cfg["Vapid:PrivateKey"]);
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        var results = new List<object>();

        foreach (var s in subs)
        {
            try
            {
                var payload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    title = "Diag test",
                    body = "Diagnostic push",
                    url = "",
                    tag = "diag-" + DateTime.UtcNow.Ticks
                });

                var req = client.GenerateRequestDetails(new WebPush.PushSubscription(s.Endpoint, s.P256dh, s.Auth), payload);
                req.Headers.Remove("TTL");
                req.Headers.TryAddWithoutValidation("TTL", "3600");
                req.Headers.TryAddWithoutValidation("Urgency", "high");

                using var res = await http.SendAsync(req);
                results.Add(new
                {
                    endpoint = s.Endpoint.Substring(0, Math.Min(50, s.Endpoint.Length)),
                    status = (int)res.StatusCode,
                    body = await res.Content.ReadAsStringAsync()
                });
            }
            catch (Exception ex)
            {
                results.Add(new { error = ex.Message });
            }
        }

        return Ok(new { count = subs.Count, results });
    }

    [HttpPost("Send")]
    public async Task<IActionResult> Send([FromBody] SendDto dto)
    {
        if (!ApiKeyOk())
            return Unauthorized();

        if (dto == null || string.IsNullOrWhiteSpace(dto.RoomNo))
            return BadRequest();

        var n = await _sender.SendToRoomAsync(
            dto.RoomNo,
            dto.Title,
            dto.Body,
            dto.Url,
            dto.Tag);

        return Ok(new { sent = n });
    }

    [HttpPost("ClearRoom")]
    public async Task<IActionResult> ClearRoom([FromBody] RoomDto dto)
    {
        if (!ApiKeyOk())
            return Unauthorized();

        if (dto == null || string.IsNullOrWhiteSpace(dto.RoomNo))
            return BadRequest();

        await _store.DeleteRoomAsync(dto.RoomNo);

        return Ok(new { success = true });
    }

    [HttpGet("GetPromptStatus")]
    public async Task<IActionResult> GetPromptStatus(string roomNo, string bedInfo)
    {
        if (string.IsNullOrWhiteSpace(roomNo) || roomNo.Length > 100)
            return BadRequest();

        try
        {
            var result = await _store.GetPromptStatusAsync(roomNo, bedInfo ?? "");

            return Ok(new
            {
                success = true,
                shouldShow = result.ShouldShow,
                status = result.Status,
                nextPromptAt = result.NextPromptAt
            });
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "GetPromptStatus error for room {Room}", roomNo);
            return StatusCode(500);
        }
    }

    [HttpPost("DeferPrompt")]
    public async Task<IActionResult> DeferPrompt([FromBody] PromptDto dto)
    {
        if (dto == null || !ValidPromptRequest(dto.RoomNo, dto.BedInfo))
            return BadRequest();

        await _store.DeferPromptAsync(dto.RoomNo, dto.BedInfo);

        return Ok(new { success = true, message = "Notification prompt deferred for 12 hours." });
    }

    [HttpPost("CompletePrompt")]
    public async Task<IActionResult> CompletePrompt([FromBody] PromptDto dto)
    {
        if (dto == null || !ValidPromptRequest(dto.RoomNo, dto.BedInfo))
            return BadRequest();

        await _store.CompletePromptAsync(dto.RoomNo, dto.BedInfo);

        return Ok(new { success = true, message = "Notification prompt completed." });
    }

    [HttpGet("Test")]
    public async Task<IActionResult> Test(string roomNo)
    {
        if (!_env.IsDevelopment() && !ApiKeyOk())
            return NotFound();

        if (string.IsNullOrWhiteSpace(roomNo))
            return BadRequest();

        var sentCount = await _sender.SendToRoomAsync(
            roomNo,
            "Test notification",
            "If you see this outside the app, push works.",
            "",
            "test-" + DateTime.UtcNow.Ticks);

        return Ok(new
        {
            sent = sentCount,
            message = sentCount >= 1
                ? "Success! Check your phone/screen."
                : "Failed. Check server logs."
        });
    }
}