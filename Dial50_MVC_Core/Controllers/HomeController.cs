using Microsoft.Extensions.Caching.Memory;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Diagnostics;

namespace Dial50_MVC_Core.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly LoocAISettings _loocAI;
        private readonly IBedService _bedService;
        private readonly IBedContextAccessor _bed;
        private readonly IMemoryCache _cache;
        private readonly HospitalSettings _hospitalSettings;

        public HomeController(ILogger<HomeController> logger,
                              IOptions<LoocAISettings> options,
                              IBedService bedService,
                              IBedContextAccessor bed,
                              IMemoryCache cache,
                              IOptions<HospitalSettings> hospitalOptions)
        {
            _logger = logger;
            _loocAI = options.Value;
            _bedService = bedService;
            _bed = bed;
            _cache = cache;
            _hospitalSettings = hospitalOptions.Value;
        }

        public IActionResult Index(string? BedInfo, string? region)
        {
            if (string.IsNullOrWhiteSpace(BedInfo))
                return RedirectToAction("Index", "PreLanding");

            var ctx = _bed.Current;

            if (!ctx.IsValid)
                return RedirectToAction("Index", "PreLanding");

            var model = new BedInfo
            {
                BedID = ctx.BedId,
                BedIDHIS = ctx.BedIdHis,
                BedNumber = ctx.RoomBed,
                PatientName = ctx.PatientName,
                HospitalName = ctx.HospitalName
            };

            return View(model);
        }

        [HttpGet]
        public IActionResult ResolveBedInfo(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return Json(new { isFound = false, bedInfo = "" });

            var parsed = _bed.ParseToken(token);

            if (!parsed.Decrypted)
                return Json(new { isFound = false, bedInfo = "" });

            return Json(new { isFound = true, bedInfo = parsed.BedNumber });
        }

        [HttpGet]
        public async Task<IActionResult> CheckLatestVideo(string bedNo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(bedNo))
                {
                    return Json(new
                    {
                        hasVideo = false,
                        error = "Bed number is required."
                    });
                }

                var result = await _bedService.GetLatestVideoTaskByBed(bedNo);

                if (result == null)
                {
                    return Json(new
                    {
                        hasVideo = false,
                        error = "No video task found."
                    });
                }

                if (string.IsNullOrWhiteSpace(result.VideoLinks))
                {
                    return Json(new
                    {
                        hasVideo = false,
                        error = "VideoLinks is empty.",
                        requestId = result.RequestId
                    });
                }

                return Json(new
                {
                    hasVideo = true,
                    requestId = result.RequestId,
                    categoryId = result.CategoryId,
                    categoryName = result.CategoryName,
                    videoLinks = result.VideoLinks
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CheckLatestVideo. BedNo={BedNo}", bedNo);

                return StatusCode(500, new
                {
                    hasVideo = false,
                    error = "Unable to check the latest video task."
                });
            }
        }

        [HttpPost]
        public IActionResult ClaimSession(string bedInfo)
        {
            if (string.IsNullOrWhiteSpace(bedInfo))
                return Json(new { success = false, token = "" });

            var token = Guid.NewGuid().ToString();

            _cache.Set("ActiveSession_" + bedInfo, token, TimeSpan.FromHours(12));

            return Json(new { success = true, token = token });
        }

        [HttpGet]
        public IActionResult CheckSession(string bedInfo, string myToken)
        {
            if (string.IsNullOrWhiteSpace(bedInfo) || string.IsNullOrWhiteSpace(myToken))
                return Json(new { isActive = false });

            var activeToken = _cache.Get<string>("ActiveSession_" + bedInfo);

            bool isActive = (activeToken == myToken);

            return Json(new { isActive = isActive });
        }

        [HttpGet]
        public async Task<JsonResult> GetTasks(string? BedNumber, string? BedId)
        {
            var data = await _bedService.GetBedTasks(BedId, BedNumber, string.Empty);
            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetFreshTask(string? bedId, string? bedNumber, string? token, string? lastSeenTaskId)
        {
            try
            {
                var data = await _bedService.GetFreshTask(bedId, bedNumber, token ?? "", 60, lastSeenTaskId);

                if (data == null || data.Rows.Count == 0)
                    return Json(new { hasFreshTask = false });

                var row = data.Rows[0];

                return Json(new
                {
                    hasFreshTask = true,
                    taskId = row["TaskId"]?.ToString() ?? "",
                    fromRoom = row["FromRoom"]?.ToString() ?? "",
                    taskName = row["TaskName"]?.ToString() ?? "",
                    porterName = row["PorterName"]?.ToString() ?? "",
                    status = row["Status"]?.ToString() ?? "",
                    requestDate = row["RequestDate"]?.ToString() ?? "",
                    service = row["Service"]?.ToString() ?? "",
                    ageSeconds = Convert.ToInt32(row["AgeSeconds"] ?? 0)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "HomeController.GetFreshTask failed. BedId={BedId}, BedNumber={BedNumber}", bedId, bedNumber);
                return Json(new { hasFreshTask = false, error = ex.Message });
            }
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();

            ViewBag.HospitalName = _hospitalSettings?.Name ?? "Hospital";
            ViewBag.HospitalLogo = _hospitalSettings?.LogoPath ?? "images/ihh-logo.png";

            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}