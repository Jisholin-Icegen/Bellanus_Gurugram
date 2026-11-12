using System;
using System.Threading.Tasks;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dial50_MVC_Core.Controllers
{
    public class DischargeFeedbackController : Controller
    {
        private readonly IBedService _service;
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<DischargeFeedbackController> _logger;

        public DischargeFeedbackController(
            IBedService service,
            IPatientRepository patientRepository,
            ILogger<DischargeFeedbackController> logger)
        {
            _service = service;
            _patientRepository = patientRepository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Index(string? BedInfo)
        {
            await PopulatePatientViewBagAsync(BedInfo);
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> ThankYou(string? BedInfo)
        {
            await PopulatePatientViewBagAsync(BedInfo);
            return View();
        }

        private async Task PopulatePatientViewBagAsync(string? BedInfo)
        {
            string resolvedBedId = string.IsNullOrWhiteSpace(BedInfo)
                ? string.Empty
                : BedInfo.Trim();

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

            ViewBag.bedInfo = resolvedBedId;
            ViewBag.bedID = resolvedBedId;
            ViewBag.UserId = resolvedBedId;

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

            ViewBag.bedInfoEncrypt = resolvedBedId;
            ViewBag.fromLocationEncrypt = "DischargeFeedback";
        }
    }
}