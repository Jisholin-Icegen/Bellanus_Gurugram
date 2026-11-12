namespace Dial50_MVC_Core.Repositories
{
    public class AuthService : IAuthService
    {
        private string _cachedToken;

        public async Task<string> GetTokenAsync()
        {
            if (!string.IsNullOrEmpty(_cachedToken))
                return _cachedToken;

            // Normally call login API here
            _cachedToken = "your-static-dummy-token";

            return _cachedToken;
        }
    }
}
