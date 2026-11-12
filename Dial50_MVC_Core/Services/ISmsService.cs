namespace Dial50_MVC_Core.Services
{
    public interface ISmsService
    {
        Task<string> SendSmsAsync(string phoneNumber, string message);
    }
}