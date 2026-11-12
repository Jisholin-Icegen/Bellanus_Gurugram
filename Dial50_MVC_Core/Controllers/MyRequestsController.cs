using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dial50_MVC_Core.Controllers
{
    public class MyRequestsController : Controller
    {
        private readonly IBedService _service;
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<MyRequestsController> _logger;
        private readonly LandingProtector _protector;

        public MyRequestsController(
            IBedService service,
            IPatientRepository patientRepository,
            ILogger<MyRequestsController> logger,
            LandingProtector protector) 
        {
            _service = service;
            _patientRepository = patientRepository;
            _logger = logger;
            _protector = protector; 
        }

        public async Task<IActionResult> Index(string? BedInfo)
        {
            string resolvedBedId = BedInfo;

            if (!string.IsNullOrEmpty(BedInfo))
            {
                try
                {
                    var decrypted = _protector.DecryptAES(Uri.UnescapeDataString(BedInfo).Replace(" ", "+"));

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
                catch { 
                }
            }

            string bedNumber = string.Empty;
            string patientName = string.Empty;
            string hospitalName = "Apollo Hospitals";

            PatientBedDetails? patientInfo = null;

            if (!string.IsNullOrWhiteSpace(resolvedBedId))
            {
                try
                {
                    patientInfo = await _patientRepository.GetPatientBedDetailsByBedIdAsync(resolvedBedId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "MyRequests.Index failed for BedId={BedId}", resolvedBedId);
                }
            }

            if (!string.IsNullOrWhiteSpace(patientInfo?.PatientName))
                patientName = patientInfo.PatientName;

            if (!string.IsNullOrWhiteSpace(patientInfo?.RoomBed))
                bedNumber = patientInfo.RoomBed;

            BedInfo _bedInfo = new BedInfo
            {
                BedID = resolvedBedId,
                BedIDHIS = patientInfo?.BedId ?? resolvedBedId,
                BedNumber = bedNumber,
                PatientName = patientName,
                HospitalName = hospitalName
            };

            ViewBag.bedInfoEncrypt = BedInfo; 
            ViewBag.bedInfo = resolvedBedId;  
            ViewBag.bedID = resolvedBedId;
            ViewBag.BedNumber = bedNumber;

            ViewBag.PatientName = patientName;
            ViewBag.RoomNumber = patientInfo?.RoomNumber ?? "";
            ViewBag.RoomBed = patientInfo?.RoomBed ?? "";
            ViewBag.Ward = patientInfo?.Ward ?? "";
            ViewBag.Uhid = patientInfo?.Uhid ?? "";
            ViewBag.Gender = patientInfo?.Gender ?? "";
            ViewBag.Age = patientInfo?.Age ?? "";
            ViewBag.DietType = patientInfo?.DietType ?? "";
            ViewBag.Allergies = patientInfo?.Allergies ?? "";
            ViewBag.HasPatient = patientInfo != null && !string.IsNullOrEmpty(patientInfo.PatientName);

            return View(_bedInfo);
        }

        [HttpGet]
        public async Task<JsonResult> GetTasks(string? BedNumber, string? BedId)
        {
            var data = await _service.GetBedTasks(BedId, BedNumber, string.Empty);
            return Json(data);
        }
    }
}