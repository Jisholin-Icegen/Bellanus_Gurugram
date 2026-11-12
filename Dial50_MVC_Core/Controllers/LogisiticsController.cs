using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Dial50_MVC_Core.Controllers
{
    public class LogisiticsController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly LandingProtector _protector;
        private readonly LoocAISettings _loocAI;
        private readonly DepartmentSettings _departments;
        private readonly ITypeRepository _TypeRepository;
        private readonly IBedService _bedService;
        private readonly IPatientRepository _patientRepository;

        public LogisiticsController(
            ILogger<HomeController> logger,
            LandingProtector protector,
            IOptions<LoocAISettings> options,
            IOptions<DepartmentSettings> departments,
            ITypeRepository TypeRepository,
            IBedService bedService,
            IPatientRepository patientRepository)
        {
            _logger = logger;
            _protector = protector;
            _loocAI = options.Value;
            _departments = departments.Value;
            _TypeRepository = TypeRepository;
            _bedService = bedService;
            _patientRepository = patientRepository;
        }

        public async Task<IActionResult> Index(string? BedInfo, string? region)
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

            var model = new BedInfo
            {
                BedID = resolvedBedId,
                BedIDHIS = patient?.BedId ?? "",
                BedNumber = patient?.RoomBed ?? "",
                PatientName = patient?.PatientName ?? "",
                HospitalName = "Apollo Hospitals"
            };

            ViewBag.bedInfo = BedInfo;
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

            ViewBag.bedInfoEncrypt = BedInfo;
            ViewBag.fromLocationEncrypt = "Logisitics";
            ViewBag.DeptID = _departments.Logistics.ToString();

            TempData["Region"] = region;

            return View(model);
        }

        [HttpGet]
        public async Task<JsonResult> GetTasks(string? BedNumber, string? BedId)
        {
            var data = await _bedService.GetBedTasks(BedId, BedNumber, string.Empty);
            return Json(data);
        }

        [HttpGet]
        public async Task<IActionResult> GetTaskTypes()
        {
            var data = await _TypeRepository.getDeptTaskTypes(_departments.Logistics.ToString());
            return Json(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreateRequestDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.CategoryId))
                return Json(new { success = false, message = "Invalid category" });

            string bedNumber = dto.BedNo ?? "";

            if (string.IsNullOrWhiteSpace(bedNumber))
                return Json(new { success = false, message = "BedNo is required" });

            int requestId = await _bedService.InsertRoomComfortRequestAsync(
                bedNo: bedNumber,
                category: dto.CategoryId,
                quantity: dto.Quantity ?? "1",
                remarks: dto.Remarks ?? "",
                gender: "",
                userId: "");

            if (requestId <= 0)
                return Json(new { success = false, message = "Insert failed" });

            return Json(new { success = true, requestNo = requestId.ToString() });
        }

        public class CreateRequestDto
        {
            public string BedNo { get; set; }
            public string PatientName { get; set; }
            public string CategoryId { get; set; }
            public string Quantity { get; set; }
            public string Remarks { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateGuestPass([FromBody] GuestPassRequestDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.GuestName))
                    return Json(new { success = false, message = "Guest name is required." });

                if (string.IsNullOrWhiteSpace(dto.GuestPhone))
                    return Json(new { success = false, message = "Guest phone is required." });

                if (string.IsNullOrWhiteSpace(dto.BedInfo))
                    return Json(new { success = false, message = "Session expired. Please rescan QR." });

                string resolvedBedId = dto.BedInfo;

                try
                {
                    var decrypted = _protector.DecryptAES(Uri.UnescapeDataString(dto.BedInfo));

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
                catch { }

                var patient = await _patientRepository.GetPatientBedDetailsByBedIdAsync(resolvedBedId);

                string viewUrl = Url.Action("View", "GuestPass", null, Request.Scheme);
                var result = await _bedService.CreateGuestPassAsync(patient, dto, viewUrl);

                if (!result.Success)
                    return Json(new { success = false, message = "Could not create Guest Pass." });

                var vm = await _bedService.GetGuestPassSuccessAsync(result.GuestPassId);

                return Json(new
                {
                    success = true,
                    guestPassId = result.GuestPassId,
                    requestId = result.RequestId,
                    passCode = result.PassCode,
                    qrImageUrl = vm?.QrImageUrl,
                    validUntil = vm?.ValidUntil,
                    guestName = vm?.GuestName,
                    guestPhone = vm?.GuestPhone,
                    patientName = vm?.PatientName,
                    roomBed = vm?.RoomBed,
                    members = vm?.AdditionalMembers,
                    smsSent = vm?.SmsSent ?? false
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Guest Pass creation failed");
                return Json(new { success = false, message = "Something went wrong." });
            }
        }
    }
}