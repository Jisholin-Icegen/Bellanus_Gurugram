using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Dial50_MVC_Core.Controllers
{
    public class MyDailyCareController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly LandingProtector _protector;
        private readonly LoocAISettings _loocAI;
        private readonly DepartmentSettings _departments;
        private readonly ITypeRepository _TypeRepository;
        private readonly IBedService _bedService;
        private readonly IPatientRepository _patientRepository;

        public MyDailyCareController(
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
            ViewBag.UserId = resolvedBedId; 
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
            ViewBag.fromLocationEncrypt = "/MyDailyCare";
            ViewBag.DepartmentID = _departments.MyDailyCare.ToString();

            TempData["Region"] = region;

            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> GetTaskTypes()
        {
            var data = await _TypeRepository.getDeptTaskTypes(_departments.MyDailyCare.ToString());
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
    }
}