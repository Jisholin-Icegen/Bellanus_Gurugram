using Dial50_MVC_Core.Models;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;

namespace Dial50_MVC_Core.Controllers
{
    public class LanguageController : Controller
    {
        private readonly HashSet<string> _cultures;

        public LanguageController(IConfiguration config)
        {
            var langs = config.GetSection("SupportedLanguages").Get<List<LanguageSetting>>() ?? new();
            _cultures = new HashSet<string>(langs.Select(l => l.Culture), StringComparer.OrdinalIgnoreCase);
        }

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public IActionResult SetLanguage(string culture, string returnUrl)
        {
            if (string.IsNullOrEmpty(culture) || !_cultures.Contains(culture))
                culture = "en-IN";

            Response.Cookies.Append(
                CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
                new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddYears(1),
                    Path = "/",
                    IsEssential = true,
                    SameSite = SameSiteMode.Lax,
                    Secure = Request.IsHttps
                });

            return LocalRedirect(!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl) ? returnUrl : "/");
        }
    }
}