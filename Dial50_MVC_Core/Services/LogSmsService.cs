namespace Dial50_MVC_Core.Services
{
    public class LogSmsService : ISmsService
    {
        private readonly ILogger<LogSmsService> _logger;

        public LogSmsService(ILogger<LogSmsService> logger)
        {
            _logger = logger;
        }

        public Task<string> SendSmsAsync(string phoneNumber, string message)
        {
            _logger.LogInformation("SMS to {Phone}: {Message}", phoneNumber, message);
            return Task.FromResult("LOGGED");
        }
    }
}