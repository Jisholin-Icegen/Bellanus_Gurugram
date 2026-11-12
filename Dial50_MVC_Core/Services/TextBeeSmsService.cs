using System.Text;
using System.Text.Json;

namespace Dial50_MVC_Core.Services
{
    public class TextBeeSmsService : ISmsService
    {
        private readonly HttpClient _http;
        private readonly ILogger<TextBeeSmsService> _logger;
        private readonly string _apiKey;
        private readonly string _deviceId;

        public TextBeeSmsService(
            HttpClient http,
            IConfiguration config,
            ILogger<TextBeeSmsService> logger)
        {
            _http = http;
            _logger = logger;
            _apiKey = config["TextBeeSettings:ApiKey"] ?? "";
            _deviceId = config["TextBeeSettings:DeviceId"] ?? "";
        }

        public async Task<string> SendSmsAsync(string phoneNumber, string message)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_apiKey) || string.IsNullOrWhiteSpace(_deviceId))
                    throw new InvalidOperationException("TextBee ApiKey or DeviceId missing.");

                var url = $"https://api.textbee.dev/api/v1/gateway/devices/{_deviceId}/send-sms";

                var payload = new
                {
                    recipients = new[] { phoneNumber },
                    message = message
                };

                var req = new HttpRequestMessage(HttpMethod.Post, url);
                req.Headers.Add("x-api-key", _apiKey);
                req.Content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json");

                var resp = await _http.SendAsync(req);
                var body = await resp.Content.ReadAsStringAsync();

                _logger.LogInformation("TextBee ({Code}): {Body}", (int)resp.StatusCode, body);
                return body;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "TextBee send failed for {Phone}", phoneNumber);
                throw;
            }
        }
    }
}