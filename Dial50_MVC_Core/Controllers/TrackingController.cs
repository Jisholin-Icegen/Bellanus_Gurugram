using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

namespace Dial50_MVC_Core.Controllers
{
    public class TrackingController : Controller
    {
        private readonly ILogger<TrackingController> _logger;
        private readonly LandingProtector _protector;
        private readonly LoocAISettings _loocAI;
        private readonly IBedService _bedService;
        private readonly IPatientRepository _patientRepository;

        public TrackingController(
            ILogger<TrackingController> logger,
            LandingProtector protector,
            IOptions<LoocAISettings> options,
            IBedService bedService,
            IPatientRepository patientRepository)
        {
            _logger = logger;
            _protector = protector;
            _loocAI = options.Value;
            _bedService = bedService;
            _patientRepository = patientRepository;
        }

        public async Task<IActionResult> Index(string? BedInfo, string? RequestID, string? region)
        {
            if (string.IsNullOrEmpty(region))
                region = "IN";

            BedInfo ??= string.Empty;

            string resolvedBedId = BedInfo;

            if (!string.IsNullOrEmpty(BedInfo))
            {
                try
                {
                    var decrypted = _protector.DecryptAES(Uri.UnescapeDataString(BedInfo));

                    if (!string.IsNullOrWhiteSpace(decrypted))
                    {
                        if (decrypted.Contains("$$"))
                        {
                            var dParts = decrypted.Split("$$", StringSplitOptions.None);
                            resolvedBedId = dParts.Length > 1 && !string.IsNullOrWhiteSpace(dParts[1])
                                ? dParts[1]
                                : dParts[0];
                        }
                        else
                        {
                            resolvedBedId = decrypted;
                        }
                    }
                }
                catch
                {
                }
            }

            PatientBedDetails? patient = null;

            if (!string.IsNullOrWhiteSpace(resolvedBedId))
            {
                try
                {
                    patient = await _patientRepository.GetPatientBedDetailsByBedIdAsync(resolvedBedId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to load patient for BedId={BedId}", resolvedBedId);
                }
            }

            var model = new TrackingRequestModel
            {
                RequestNo = RequestID ?? ""
            };

            ViewBag.bedInfo = BedInfo;
            ViewBag.bedInfoEncrypt = BedInfo;
            ViewBag.UserId = BedInfo;
            ViewBag.Region = region;

            ViewBag.PatientName = patient?.PatientName ?? "";
            ViewBag.RoomNumber = patient?.RoomNumber ?? "";
            ViewBag.BedNumber = patient?.Bed ?? "";
            ViewBag.RoomBed = patient?.RoomBed ?? "";
            ViewBag.Ward = patient?.Ward ?? "";
            ViewBag.Uhid = patient?.Uhid ?? "";
            ViewBag.Gender = patient?.Gender ?? "";
            ViewBag.Age = patient?.Age ?? "";
            ViewBag.DietType = patient?.DietType ?? "";
            ViewBag.Allergies = patient?.Allergies ?? "";
            ViewBag.HasPatient = patient != null && !string.IsNullOrEmpty(patient.PatientName);

            ViewBag.RequestId = RequestID ?? "";

            TempData["Region"] = region;

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> SubmitRating([FromBody] SubmitRatingRequest model)
        {
            if (model == null)
                return Json(new { success = false, code = "INVALID_INPUT", message = "Payload missing" });

            if (model.RequestId <= 0)
                return Json(new { success = false, code = "INVALID_REQUEST_ID", message = "RequestId must be a positive integer." });

            if (model.Rating != 0 && model.Rating != 1)
                return Json(new { success = false, code = "INVALID_RATING", message = "Rating must be 1 (Satisfied) or 0 (Unsatisfied)." });

            try
            {
                var result = await _bedService.SubmitRatingAsync(model.RequestId, model.Rating);

                return Json(new
                {
                    success = result.Success == 1,
                    code = result.Code,
                    message = result.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SubmitRating failed for RequestId={RequestId}", model.RequestId);
                return Json(new { success = false, code = "EXCEPTION", message = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult ResolveBedInfo(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return Json(new { isFound = false, bedInfo = "" });

            try
            {
                var decrypted = _protector.DecryptAES(Uri.UnescapeDataString(token));

                if (string.IsNullOrWhiteSpace(decrypted))
                    return Json(new { isFound = false, bedInfo = "" });

                var parts = decrypted.Split("$$", StringSplitOptions.None);

                var bedNumber = parts.Length > 2 && !string.IsNullOrEmpty(parts[2])
                                ? parts[2]
                                : parts[0];

                return Json(new { isFound = true, bedInfo = bedNumber });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resolve BedInfo token");
                return Json(new { isFound = false, bedInfo = "" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> CheckLatestVideo(string bedNo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(bedNo))
                    return Json(new { hasVideo = false, error = "Bed number is required." });

                var result = await _bedService.GetLatestVideoTaskByBed(bedNo);

                if (result == null)
                    return Json(new { hasVideo = false, error = "No video task found." });

                if (string.IsNullOrWhiteSpace(result.VideoLinks))
                    return Json(new { hasVideo = false, error = "VideoLinks is empty.", requestId = result.RequestId });

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
                return StatusCode(500, new { hasVideo = false, error = "Unable to check the latest video task." });
            }
        }

        public IActionResult Privacy() => View();

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = System.Diagnostics.Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

    public class SubmitRatingRequest
    {
        public int RequestId { get; set; }
        public int Rating { get; set; }
    }
}