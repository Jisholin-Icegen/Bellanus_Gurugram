using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Dial50_MVC_Core.Controllers
{
    public class AIController : Controller
    {
        private readonly LandingProtector _protector;
        private readonly LoocAISettings _loocAI;
        private readonly IBedService _service;
        private readonly IPatientRepository _patientRepository;
        private readonly IGuestApiService _guestApiService;
        private readonly ILogger<AIController> _logger;

        public AIController(
            LandingProtector protector,
            IOptions<LoocAISettings> options,
            IBedService service,
            IPatientRepository patientRepository,
            IGuestApiService guestApiService,
            ILogger<AIController> logger)
        {
            _protector = protector;
            _loocAI = options.Value;
            _service = service;
            _patientRepository = patientRepository;
            _guestApiService = guestApiService;
            _logger = logger;
        }

        public async Task<IActionResult> Chat(string? BedInfo, string? patient, string? bed, string? region)
        {
            if (string.IsNullOrWhiteSpace(region))
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

            PatientBedDetails? patientInfo = null;

            if (!string.IsNullOrWhiteSpace(resolvedBedId))
            {
                try
                {
                    patientInfo = await _patientRepository.GetPatientBedDetailsByBedIdAsync(resolvedBedId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "AIController.Chat failed to load patient for BedId={BedId}", resolvedBedId);
                }
            }

            string resolvedPatientName = patientInfo?.PatientName ?? "";
            string resolvedRoomBed = patientInfo?.RoomBed ?? "";
            string resolvedRoomNumber = patientInfo?.RoomNumber ?? "";
            string resolvedBed = patientInfo?.Bed ?? "";

            if (string.IsNullOrWhiteSpace(resolvedPatientName) && !string.IsNullOrWhiteSpace(patient))
                resolvedPatientName = patient;

            if (string.IsNullOrWhiteSpace(resolvedRoomBed) && !string.IsNullOrWhiteSpace(bed))
                resolvedRoomBed = bed;

            Models.BedInfo _bedInfo = new Models.BedInfo
            {
                BedID = resolvedBedId,
                BedIDHIS = patientInfo?.BedId ?? resolvedBedId,
                BedNumber = resolvedRoomBed,
                PatientName = resolvedPatientName,
                HospitalName = "Apollo"
            };

            _logger.LogInformation("STEP 1 - Resolved. BedId={BedId}, PatientName={Name}",
                resolvedBedId, resolvedPatientName);

            string? guestToken = null;

            if (!string.IsNullOrWhiteSpace(resolvedPatientName) && !string.IsNullOrWhiteSpace(resolvedBedId))
            {
                try
                {
                    guestToken = await _guestApiService.CreateGuestUser(resolvedPatientName, resolvedBedId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Guest API call failed for BedId={BedId}, PatientName={PatientName}",
                        resolvedBedId, resolvedPatientName);
                }
            }

            ViewBag.GuestToken = guestToken;
            ViewBag.IframeUrl = _loocAI.buildFullURL(
                _loocAI,
                _bedInfo.BedIDHIS,
                _bedInfo.PatientName,
                guestToken ?? "");

            ViewBag.bedInfoEncrypt = BedInfo;
            ViewBag.bedInfo = BedInfo;
            ViewBag.Region = region;
            ViewBag.UserId = BedInfo;

            ViewBag.PatientName = resolvedPatientName;
            ViewBag.RoomNumber = resolvedRoomNumber;
            ViewBag.BedNumber = resolvedBed;
            ViewBag.RoomBed = resolvedRoomBed;
            ViewBag.Ward = patientInfo?.Ward ?? "";
            ViewBag.Uhid = patientInfo?.Uhid ?? "";
            ViewBag.Gender = patientInfo?.Gender ?? "";
            ViewBag.Age = patientInfo?.Age ?? "";
            ViewBag.DietType = patientInfo?.DietType ?? "";
            ViewBag.Allergies = patientInfo?.Allergies ?? "";
            ViewBag.HasPatient = patientInfo != null && !string.IsNullOrEmpty(patientInfo.PatientName);

            ConvQRRequest convQRRequest = new ConvQRRequest()
            {
                BedID = _bedInfo.BedID,
                ConversationID = string.Empty,
                Process = "INSERT"
            };

            try
            {
                var data = await _service.ConversationProcessQR(convQRRequest);
                ViewBag.fromLocationEncrypt = "AI";
                ViewBag.ConversationID = data.FirstOrDefault()?.ConversationID;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AIController.Chat ConversationProcessQR failed for BedID='{BedID}'", _bedInfo.BedID);
                ViewBag.fromLocationEncrypt = "AI";
                ViewBag.ConversationID = null;
            }

            TempData["Region"] = region;

            return View(_bedInfo);
        }

        [HttpGet]
        public async Task<JsonResult> GetTasks(string? BedNumber, string? BedId)
        {
            var data = await _service.GetBedTasks(BedId, BedNumber, string.Empty);
            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetFreshTask(string? bedId, string? bedNumber, string? token, string? lastSeenTaskId)
        {
            try
            {
                var data = await _service.GetFreshTask(bedId, bedNumber, token ?? "", 60, lastSeenTaskId);

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
                _logger.LogError(ex, "GetFreshTask failed");
                return Json(new { hasFreshTask = false, error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ConversationStatus(string? ConvID)
        {
            if (string.IsNullOrWhiteSpace(ConvID))
                return Json(new { status = false, message = "ConvID is required." });

            ConvQRRequest convQRRequest = new ConvQRRequest()
            {
                BedID = string.Empty,
                ConversationID = ConvID,
                Process = "GETSTATUS"
            };

            try
            {
                var data = await _service.ConversationProcessQR(convQRRequest);
                return Json(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AIController.ConversationStatus failed for ConvID='{ConvID}'", ConvID);
                return Json(new { status = false, message = "Could not fetch conversation status." });
            }
        }
    }
}