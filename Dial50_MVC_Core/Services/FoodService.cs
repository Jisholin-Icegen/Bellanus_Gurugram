using Microsoft.Data.SqlClient;
using System.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Repositories;

namespace Dial50_MVC_Core.Services
{
    public class FoodService : IFoodService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ITypeRepository> _logger;
        private readonly ILogService _logService;
        private readonly IFoodRepository _foodRepository;
        public FoodService(IConfiguration configuration, ILogger<ITypeRepository> logger, ILogService logService, IFoodRepository foodRepository)
        {
            _configuration = configuration;
            _logService = logService;
            _logger = logger;
            _logService = logService;
            _foodRepository = foodRepository;
        }


        public async Task<PatientVM> GetPatientDetailsByRoomAsync(string roomNo)
        {
            var data = await _foodRepository.GetPatientDetailsByRoomAsync(roomNo);
            return data;
        }

         public async Task<bool> IsFoodOrderingShownAsync()
        {
            return await _foodRepository.IsFoodOrderingShownAsync();
        }
        public async Task<MyOrdersDashboardVM> GetMyOrdersDashboardAsync(string roomNo)
        {
            var data = await _foodRepository.GetMyOrdersDashboardAsync(roomNo);
            return data;
        }

        public async Task<List<ServingWindowVM>> GetActiveServingWindowsAsync()
        {
            var data = await _foodRepository.GetActiveServingWindowsAsync();
            return data;
        }
        public async Task<List<string>> GetMenuVendorsAsync()
        {
            return await _foodRepository.GetMenuVendorsAsync();
        }
        public async Task<FoodResponse> GetMenuDetailsAsync(string orderType, string mealType, string pRoom,string servingTime)
        {
            var data = await _foodRepository.GetMenuDetailsAsync(orderType, mealType, pRoom, servingTime);
            return data;
        }

        public async Task<bool> SaveCartItemAsync(FoodCartModel cart)
        {
            var data = await _foodRepository.SaveCartItemAsync(cart);
            return data;
        }

        public async Task<bool> DeleteCartItemAsync(string roomNo, int itemId, string mealType)
        {
            var data = await _foodRepository.DeleteCartItemAsync(roomNo, itemId, mealType);
            return data;
        }

        public async Task<List<FoodCartModel>> GetCartItemsAsync(string roomNo)
        {
            var data = await _foodRepository.GetCartItemsAsync(roomNo);
            return data;
        }

        public async Task<List<string>> GetMenuVendorsAsync()
        {
            return await _foodRepository.GetMenuVendorsAsync();
        }

        public async Task<List<string>> SubmitOrderAsync(string roomNo, string specialInstruction, string orddate, string isPreorder, string Calories)
        {
            var data = await _foodRepository.SubmitOrderAsync(roomNo, specialInstruction, orddate, isPreorder, Calories);
            return data;
        }

        public async Task<OrderSuccessVM> GetOrderSuccessDetailsAsync(string orderId)
        {
            var data = await _foodRepository.GetOrderSuccessDetailsAsync(orderId);
            return data;
        }

        public async Task<bool> CancelPreorderAsync(string orderId)
        {
            var data = await _foodRepository.CancelPreorderAsync(orderId);
            return data;
        }

        public async Task<string> SubmitRatingAsync(string orderId, int rating, string feedback)
        {
            return await _foodRepository.SubmitRatingAsync(orderId, rating, feedback);
        }
        public async Task<string> CheckPatientNpoStatusAsync(string roomNo)
        {
            return await _foodRepository.CheckPatientNpoStatusAsync(roomNo);
        }

        public async Task<List<FoodServiceVM>> GetFoodServicesAsync()
        {
            return await _foodRepository.GetFoodServicesAsync();
        }
        public async Task<ServiceRequestResult> InsertOtherServiceRequestAsync(string roomNo, int categoryId, string remarks, string userName)
        {
            return await _foodRepository.InsertOtherServiceRequestAsync(roomNo, categoryId, remarks, userName);
        }

        public async Task<OrderOtpVM> GetOrderOtp(string orderId)
        {
            return await _foodRepository.GetOrderOtp(orderId);
        }

        public async Task<bool> UpdateDefaultFoodStatusAsync(string roomNo, int itemId, string mealType)
        {
            return await _foodRepository.UpdateDefaultFoodStatusAsync(roomNo, itemId, mealType);
        }
    }
}