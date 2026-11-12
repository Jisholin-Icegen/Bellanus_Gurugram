using System.Net.Http;
using System.Text;
using Dial50_MVC_Core.Models;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Dial50_MVC_Core.Services
{
    public interface IGuestApiService
    {
        Task<string?> CreateGuestUser(string name, string bedInfo);
    }

    public class GuestApiService : IGuestApiService
    {
        private readonly LoocAISettings _settings;
        private readonly HttpClient _client;
        private readonly ILogger<GuestApiService> _logger;

        public GuestApiService(
            IOptions<LoocAISettings> settings,
            HttpClient client,
            ILogger<GuestApiService> logger)
        {
            _settings = settings.Value;
            _client = client;
            _logger = logger;
        }

        public async Task<string?> CreateGuestUser(string name, string bedInfo)
        {
            var url = _settings.BASE_URL!.TrimEnd('/') + _settings.GUEST_API_PATH;

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("token", _settings.GUEST_BEARER_TOKEN);

            var body = new
            {
                name = name,
                pass = _settings.GUEST_DEFAULT_PASSWORD,
                user = bedInfo
            };

            var requestJson = JsonConvert.SerializeObject(body);

            _logger.LogInformation("Guest API request body: {Body}", requestJson);

            request.Content = new StringContent(
                requestJson,
                Encoding.UTF8,
                "application/json");

            var response = await _client.SendAsync(request);
            var result = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("Guest API raw response: {Response}", result);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Guest API failed ({response.StatusCode}): {result}");

            var json = JObject.Parse(result);

            if (json["status"]?.Value<int>() != 0)
                throw new Exception($"Guest API returned status {json["status"]}: {json["msg"]}");

            var token = json["data"]?["token"]?.ToString();

            if (string.IsNullOrWhiteSpace(token))
                throw new Exception($"Guest API returned no token: {result}");

            _logger.LogInformation("Guest token for user={User}: {Token}", bedInfo, token);

            return token;
        }
    }
}