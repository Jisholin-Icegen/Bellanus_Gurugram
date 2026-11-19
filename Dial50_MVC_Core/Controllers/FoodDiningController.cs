using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Dial50_MVC_Core.Controllers
{
    public class FoodDiningController : Controller
    {
        private readonly ILogger<FoodDiningController> _logger;
        private readonly LandingProtector _protector;
        private readonly LoocAISettings _loocAI;
        private readonly DepartmentSettings _departments;
        private readonly ITypeRepository _TypeRepository;
        private readonly IFoodService _foodService;
        private readonly IPatientRepository _patientRepository;
        private readonly PushSender _pushSender;

        public FoodDiningController(
            ILogger<FoodDiningController> logger,
            LandingProtector protector,
            IOptions<LoocAISettings> options,
            IOptions<DepartmentSettings> departments,
            IFoodService foodService,
            IPatientRepository patientRepository,
            PushSender pushSender)
        {
            _logger = logger;
            _protector = protector;
            _loocAI = options.Value;
            _pushSender = pushSender;
            _departments = departments.Value;
            _foodService = foodService;
            _patientRepository = patientRepository;
        }

        public IActionResult Index()
        {
            return RedirectToAction("FoodDining", "FoodDining");
        }

        public async Task<IActionResult> FoodDining(string? BedInfo)
        {
            await PopulatePatientViewBagAsync(BedInfo);
            ViewBag.IsFoodOrderingShown = await _foodService.IsFoodOrderingShownAsync();
            return View();
        }

        public async Task<IActionResult> FoodOrdering(string? BedInfo)
        {
            await PopulatePatientViewBagAsync(BedInfo);
            ViewBag.IsFoodOrderingShown = await _foodService.IsFoodOrderingShownAsync();
            return View();
        }

        public IActionResult PatientOrderMode()
        {
            return View();
        }

        public async Task<IActionResult> OtherServices(string? BedInfo)
        {
            await PopulatePatientViewBagAsync(BedInfo);
            ViewBag.IsFoodOrderingShown = await _foodService.IsFoodOrderingShownAsync();
            return View();
        }

        public IActionResult MenuItems(string orderType, string mode)
        {
            ViewBag.OrderType = orderType;
            ViewBag.Mode = mode;
            return View();
        }

        [HttpGet]
        public IActionResult ReviewOrder()
        {
            ViewBag.OrderType = TempData.Peek("OrderType");
            ViewBag.Mode = TempData.Peek("Mode");
            ViewBag.Meal = TempData.Peek("Meal");
            ViewBag.OrderDate = TempData.Peek("OrderDate");
            return View();
        }

        public async Task<IActionResult> MyOrdersAsync(string BedInfo)
        {
            await PopulatePatientViewBagAsync(BedInfo);
            ViewBag.IsFoodOrderingShown = await _foodService.IsFoodOrderingShownAsync();
            return View();
        }

        public async Task<IActionResult> OrderSuccess(string orderIds, int isPreorder = 0)
        {
            var ids = orderIds.Split(',');
            List<OrderSuccessVM> models = new();

            foreach (var id in ids)
            {
                var model = await _foodService.GetOrderSuccessDetailsAsync(id);
                if (model != null) models.Add(model);
            }
            var servingTimings = await _foodService.GetActiveServingWindowsAsync();
            ViewBag.IsFoodOrderingShown = await _foodService.IsFoodOrderingShownAsync();
            ViewBag.ServingTimings = servingTimings;
            ViewBag.IsPreorder = isPreorder;
            return View(models);
        }

        [HttpGet]
        public async Task<IActionResult> GetPatientInfo(string roomNo)
        {
            var patient = await _foodService.GetPatientDetailsByRoomAsync(roomNo);
            return Json(patient);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrdersDashboard(string roomNo)
        {
            var result = await _foodService.GetMyOrdersDashboardAsync(roomNo);
            return Json(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetOrderStatus(string orderId)
        {
            var model = await _foodService.GetOrderSuccessDetailsAsync(orderId);

            if (model == null)
                return Json(new { success = false });

            return Json(new
            {
                success = true,
                orderId = model.OrderId,
                status = model.Status,
                estimatedTime = model.Estimatedtime,
                rating = model.Rating,
                items = model.Items,
                statusLogs = model.StatusLogs.Select(x => new
                {
                    status = x.NewStatus,
                    time = x.ChangedOn.ToString("hh:mm:ss tt")
                })
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetMealTypes()
        {
            var mealTypes = await _foodService.GetActiveServingWindowsAsync();
            return Json(mealTypes);
        }

        [HttpGet]
        public async Task<IActionResult> GetMenuDetails(string orderType, string mealType, string pRoom, string servingTime)
        {
            FoodResponse result = await _foodService.GetMenuDetailsAsync(orderType, mealType, pRoom, servingTime);

            if (result == null)
            {
                return Json(new { menuItems = new List<MenuItem>(), recommendations = new List<MenuItem>() });
            }

            return Json(new
            {
                menuItems = result.MenuItems,
                recommendations = result.Recommendations
            });
        }

        [HttpPost]
        public async Task<IActionResult> SaveCartItem([FromBody] FoodCartModel cart)
        {
            var result = await _foodService.SaveCartItemAsync(cart);
            return Json(new { success = result });
        }

        [HttpPost]
        public async Task<IActionResult> DeleteCartItem(string roomNo, int itemId, string mealType)
        {
            var result = await _foodService.DeleteCartItemAsync(roomNo, itemId, mealType);
            return Json(new { success = result });
        }

        [HttpGet]
        public async Task<IActionResult> GetCartItems(string roomNo)
        {
            var result = await _foodService.GetCartItemsAsync(roomNo);
            return Json(result);
        }

        [HttpPost]
        public IActionResult PrepareReview(string orderType, string mode, string meal, string orderdate)
        {
            TempData["OrderType"] = orderType; TempData["Mode"] = mode; TempData["Meal"] = meal; TempData["OrderDate"] = orderdate;
            return Json(new { success = true, redirectUrl = Url.Action("ReviewOrder", "FoodDining") });
        }
        [HttpPost]
        public async Task<IActionResult> SubmitOrder(string roomNo, string specialInstruction, string orddate, string isPreorder, string Calories)
        {
            var orderIds = await _foodService.SubmitOrderAsync(roomNo, specialInstruction, orddate, isPreorder, Calories);

            if (orderIds != null && orderIds.Count > 0)
            {
                TempData["OrderToast"] = "Order Placed Successfully";

                return Json(new
                {
                    success = true,
                    orderIds
                });
            }

            return Json(new
            {
                success = false,
                message = "Failed to place order"
            });
        }

        [HttpPost]
        public async Task<IActionResult> CancelPreorder(string orderId)
        {
            var result = await _foodService.CancelPreorderAsync(orderId);
            return Json(new { success = result });
        }

        [HttpPost]
        public async Task<IActionResult> SubmitRating(string orderId, int rating, string feedback)
        {
            string result = await _foodService.SubmitRatingAsync(orderId, rating, feedback);

            return Json(new
            {
                result = result
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetNpoStatus(string roomNo)
        {
            var status = await _foodService.CheckPatientNpoStatusAsync(roomNo);

            var arr = status.Split('|');

            return Json(new
            {
                isNpo = arr[0].Equals("TRUE", StringComparison.OrdinalIgnoreCase),
                reason = arr.Length > 1 ? arr[1] : ""
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetFoodServices()
        {
            var services = await _foodService.GetFoodServicesAsync();
            return Json(services);
        }

        [HttpPost]
        public async Task<IActionResult> SubmitOtherServiceRequest(int categoryId, string remarks, string roomNo, string userName)
        {
            var result = await _foodService.InsertOtherServiceRequestAsync(roomNo, categoryId, remarks, userName);
            return Json(new
            {
                success = result.Success,
                requestId = result.RequestId
            });
        }

        [HttpGet]
        public async Task<IActionResult> CheckOrderOtp(string orderId)
        {
            var result = await _foodService.GetOrderOtp(orderId);
            return Json(new
            {
                success = true,
                hasOtp = result.HasOtp,
                otp = result.OTP
            });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateDefaultFoodStatus(string roomNo, int itemId, string mealType)
        {
            var result = await _foodService.UpdateDefaultFoodStatusAsync(roomNo, itemId, mealType);
            return Json(new { success = result });
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

            ViewBag.bedInfoEncrypt = BedInfo;
            ViewBag.fromLocationEncrypt = "FoodDining";
            ViewBag.DeptID = _departments.FoodDining.ToString();
        }
    }
}