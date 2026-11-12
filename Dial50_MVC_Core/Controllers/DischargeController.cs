using Dial50_MVC_Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Dial50_MVC_Core.Controllers
{
    public class DischargeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private readonly LandingProtector _protector;
        private readonly LoocAISettings _loocAI;
        public DischargeController(ILogger<HomeController> logger, LandingProtector protector, IOptions<LoocAISettings> options)
        {
            _logger = logger;
            _protector = protector;
            _loocAI = options.Value;
        }

        public IActionResult Index(string? BedInfo)
        {

            string BedInfo_Actual = (string.IsNullOrEmpty(BedInfo) ? string.Empty : _protector.DecryptAES(Uri.UnescapeDataString(BedInfo)));

            if (!string.IsNullOrEmpty(BedInfo_Actual))
            {
                BedInfo _bedInfo = new BedInfo()
                {
                    BedID = BedInfo_Actual.Split("$$")[0].ToString(),
                    BedIDHIS = BedInfo_Actual.Split("$$")[1].ToString(),
                    BedNumber = BedInfo_Actual.Split("$$")[2].ToString(),
                    PatientName = BedInfo_Actual.Split("$$")[3].ToString(),
                    HospitalName = BedInfo_Actual.Split("$$")[4].ToString()
                };

                //ViewBag.IframeUrl = _loocAI.buildFullURL(_loocAI, (_bedInfo.BedIDHIS.Contains("402") ? "402" : (_bedInfo.BedIDHIS.Contains("403") ? "403" : _bedInfo.BedIDHIS)));
                ViewBag.bedInfoEncrypt = BedInfo;

                return View(_bedInfo);
            }
            else
                return RedirectToAction("Index", "PreLanding");
        }

    }
}
