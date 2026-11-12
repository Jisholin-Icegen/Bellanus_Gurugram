namespace Dial50_MVC_Core.Repositories
{
    public interface IAuthService
    {
        Task<string> GetTokenAsync();
    }
}
