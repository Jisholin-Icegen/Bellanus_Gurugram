using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Dial50_MVC_Core.Controllers
{
    public class OverAllFeedbackController : Controller
    {
        private readonly ILogger<OverAllFeedbackController> _logger;
        private readonly LandingProtector _protector;
        private readonly IBedService _service;
        private readonly IPatientRepository _patientRepository;

        public OverAllFeedbackController(
            ILogger<OverAllFeedbackController> logger,
            LandingProtector protector,
            IBedService service,
            IPatientRepository patientRepository)
        {
            _logger = logger;
            _protector = protector;
            _service = service;
            _patientRepository = patientRepository;
        }

        public async Task<IActionResult> Index(string? BedInfo)
        {
            await PopulatePatientViewBagAsync(BedInfo);
            return View(new BedInfo
            {
                BedID = ViewBag.BedID as string ?? "",
                BedIDHIS = ViewBag.BedIDHIS as string ?? "",
                BedNumber = ViewBag.RoomBed as string ?? "",
                PatientName = ViewBag.PatientName as string ?? "",
                HospitalName = "Apollo Hospitals"
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetActiveDepartments()
        {
            var departments = await _service.GetActiveDepartments();
            return Json(new { status = true, data = departments });
        }

        [HttpGet]
        public async Task<IActionResult> GetFeedbackByReference(string referenceNo)
        {
            var feedback = await _service.GetFeedbackByReference(referenceNo);
            return Json(new { success = true, data = feedback });
        }

        [HttpGet]
        public async Task<IActionResult> GetFeedbackByBed(string bedNo)
        {
            var feedback = await _service.GetFeedbackByBed(bedNo);
            return Json(new { success = true, data = feedback });
        }

        [HttpPost]
        public async Task<IActionResult> SubmitDischargeFeedback([FromBody] DischargeFeedbackRequest feedbackRequest)
        {
            var result = await _service.SubmitDischargeFeedback(feedbackRequest);
            return Json(result);
        }

        private async Task PopulatePatientViewBagAsync(string? BedInfo)
        {
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
                    // Not encrypted — treat BedInfo as plain value
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

            ViewBag.bedInfo = BedInfo;
            ViewBag.BedInfoEncrypt = BedInfo;
            ViewBag.UserId = BedInfo;

            ViewBag.BedID = patient?.BedId ?? resolvedBedId;
            ViewBag.BedIDHIS = patient?.BedId ?? "";
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

            ViewBag.RoomNo = patient?.RoomBed ?? "";
        }
    }
}