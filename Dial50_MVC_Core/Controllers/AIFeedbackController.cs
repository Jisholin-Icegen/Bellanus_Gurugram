using System.Text.Json;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dial50_MVC_Core.Controllers
{
    public class AIFeedbackController : Controller
    {
        private readonly IBedService _service;
        private readonly ILogger<AIFeedbackController> _logger;
        private readonly LandingProtector _protector;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;

        public AIFeedbackController(
            ILogger<AIFeedbackController> logger,
            LandingProtector protector,
            IBedService service,
            IHttpClientFactory httpClientFactory,
            IConfiguration config)
        {
            _logger = logger;
            _protector = protector;
            _service = service;
            _httpClientFactory = httpClientFactory;
            _config = config;
        }

        public IActionResult Index(string? BedInfo, string? region)
        {
            BedInfo = string.IsNullOrEmpty(BedInfo) ? "" : BedInfo;
            region = string.IsNullOrEmpty(region) ? "IN" : region;

            string BedInfo_Actual = BedInfo;

            try
            {
                var decrypted = _protector.DecryptAES(Uri.UnescapeDataString(BedInfo));
                if (!string.IsNullOrWhiteSpace(decrypted))
                {
                    BedInfo_Actual = decrypted;
                }
            }
            catch
            {
                BedInfo_Actual = BedInfo;
            }

            var parts = BedInfo_Actual.Split("$$");

            var model = new BedInfo
            {
                BedID = parts.Length > 0 ? parts[0] : "",
                BedIDHIS = parts.Length > 1 ? parts[1] : "",
                BedNumber = parts.Length > 2 ? parts[2] : "",
                PatientName = parts.Length > 3 ? parts[3] : "",
                HospitalName = parts.Length > 4 ? parts[4] : ""
            };

            ViewBag.bedInfo = BedInfo;
            ViewBag.bedInfoEncrypt = BedInfo;
            ViewBag.BedId = model.BedID;
            ViewBag.Region = region;

            return View("AI_Feedback", model);
        }

        [HttpGet]
        public async Task<IActionResult> GetLatestFeedback(string bedNo)
        {
            if (string.IsNullOrEmpty(bedNo))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Bed number is required"
                });
            }

            try
            {
                var data = await _service.GetLatestFeedback(bedNo);

                return Json(new
                {
                    success = true,
                    data = data
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetLatestFeedback for bedNo {BedNo}", bedNo);

                return Json(new
                {
                    success = false,
                    message = "Unable to load feedback"
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> StartCall(
            string bedNo,
            string? language = "English",
            string? dialect = "United States",
            string? voice = null,
            string? speed = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(bedNo))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Bed number is required"
                });
            }

            var voiceAgentBaseUrl = _config["VoiceAgent:BaseUrl"];
            if (string.IsNullOrWhiteSpace(voiceAgentBaseUrl))
            {
                _logger.LogError("VoiceAgent:BaseUrl is not configured.");
                return Json(new
                {
                    success = false,
                    message = "AI voice service is not configured"
                });
            }

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(10);
                client.DefaultRequestHeaders.TryAddWithoutValidation("ngrok-skip-browser-warning", "true");

                var tokenEndpoint = $"{voiceAgentBaseUrl.TrimEnd('/')}/token";
                var tokenPayload = new
                {
                    user_id = bedNo.Trim(),
                    language = string.IsNullOrWhiteSpace(language) ? "English" : language.Trim(),
                    dialect = string.IsNullOrWhiteSpace(dialect) ? "United States" : dialect.Trim(),
                    voice = string.IsNullOrWhiteSpace(voice) ? null : voice.Trim(),
                    speed = string.IsNullOrWhiteSpace(speed) ? null : speed.Trim()
                };

                var tokenResponse = await client.PostAsJsonAsync(tokenEndpoint, tokenPayload, cancellationToken);
                var rawResponse = await tokenResponse.Content.ReadAsStringAsync(cancellationToken);

                _logger.LogInformation(
                    "Voice Agent token request for BedNo {BedNo} returned HTTP {StatusCode}",
                    bedNo,
                    (int)tokenResponse.StatusCode);

                if (!tokenResponse.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "Voice agent token request failed with status {StatusCode}: {Response}",
                        tokenResponse.StatusCode,
                        rawResponse);

                    return Json(new
                    {
                        success = false,
                        statusCode = (int)tokenResponse.StatusCode,
                        message = "Voice agent token request failed"
                    });
                }

                var tokenData = JsonSerializer.Deserialize<VoiceAgentTokenResponse>(
                    rawResponse,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (tokenData == null || string.IsNullOrWhiteSpace(tokenData.access_token))
                {
                    return Json(new
                    {
                        success = false,
                        message = "AI service did not return a valid access token"
                    });
                }

                var voiceAgentWsBase = voiceAgentBaseUrl
                    .Replace("https://", "wss://", StringComparison.OrdinalIgnoreCase)
                    .Replace("http://", "ws://", StringComparison.OrdinalIgnoreCase)
                    .TrimEnd('/');

                var wsEndpointPath = _config["VoiceAgent:WsEndpoint"] ?? "/feedback-assistant";
                if (!wsEndpointPath.StartsWith("/"))
                {
                    wsEndpointPath = "/" + wsEndpointPath;
                }

                var fullWsUrl = $"{voiceAgentWsBase}{wsEndpointPath}?token={Uri.EscapeDataString(tokenData.access_token)}";

                var playbackRateConfig = _config.GetValue<double?>("VoiceAgent:PlaybackRate") ?? 1.10;
                var playbackRate = Math.Clamp(playbackRateConfig, 0.5, 2.0);

                return Json(new
                {
                    success = true,
                    callId = tokenData.session_id ?? string.Empty,
                    accessToken = tokenData.access_token,
                    wsBaseUrl = voiceAgentWsBase,
                    wsUrl = fullWsUrl,
                    playbackRate = playbackRate
                });
            }
            catch (OperationCanceledException)
            {
                return StatusCode(499, new { success = false, message = "Client closed request" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initiating AI voice call session for bedNo {BedNo}", bedNo);

                return Json(new
                {
                    success = false,
                    message = "AI service is currently unavailable"
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SubmitAIFeedback(long feedbackId)
        {
            _logger.LogInformation("SubmitAIFeedback called with FeedbackId: {FeedbackId}", feedbackId);

            if (feedbackId <= 0)
            {
                return Json(new { success = false, message = "Feedback ID is required" });
            }

            try
            {
                var result = await _service.SubmitAIFeedback(feedbackId);
                return Json(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting AI feedback for FeedbackId {FeedbackId}", feedbackId);
                return Json(new { success = false, message = "Unable to submit AI feedback" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CancelAIFeedback(long feedbackId)
        {
            _logger.LogInformation("CancelAIFeedback called with FeedbackId: {FeedbackId}", feedbackId);

            if (feedbackId <= 0)
            {
                return Json(new { success = false, message = "Feedback ID is required" });
            }

            try
            {
                var result = await _service.CancelAIFeedback(feedbackId);
                return Json(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling AI feedback for FeedbackId {FeedbackId}", feedbackId);
                return Json(new { success = false, message = "Unable to cancel AI feedback" });
            }
        }

        private class VoiceAgentTokenResponse
        {
            public string access_token { get; set; } = "";
            public string? session_id { get; set; }
        }
    }
}