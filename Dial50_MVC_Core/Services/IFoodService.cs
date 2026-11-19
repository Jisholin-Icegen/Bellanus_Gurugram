using Dial50_MVC_Core.Models;

namespace Dial50_MVC_Core.Services
{
    public interface IFoodService
    {
        Task<PatientVM> GetPatientDetailsByRoomAsync(string roomNo);

        Task<MyOrdersDashboardVM> GetMyOrdersDashboardAsync(string roomNo);
        Task<OrderSuccessVM> GetOrderSuccessDetailsAsync(string orderId);

        Task<List<ServingWindowVM>> GetActiveServingWindowsAsync();
        Task<List<string>> GetMenuVendorsAsync();

        Task<FoodResponse> GetMenuDetailsAsync(string orderType, string mealType, string pRoom,string servingTime);

        Task<bool> SaveCartItemAsync(FoodCartModel cart);
        Task<bool> DeleteCartItemAsync(string roomNo, int itemId, string mealType);
        Task<List<FoodCartModel>> GetCartItemsAsync(string roomNo);

        Task<List<string>> SubmitOrderAsync(string roomNo, string specialInstruction, string orddate, string isPreorder,string Calories);
        Task<bool> CancelPreorderAsync(string orderId);

        Task<string> SubmitRatingAsync(string orderId, int rating, string feedback);

        Task<string> CheckPatientNpoStatusAsync(string roomNo);

        Task<List<FoodServiceVM>> GetFoodServicesAsync();

        Task<ServiceRequestResult> InsertOtherServiceRequestAsync(string roomNo, int categoryId, string remarks, string userName);

        Task<bool> IsFoodOrderingShownAsync();
        Task<OrderOtpVM> GetOrderOtp(string orderId);
        Task<bool> UpdateDefaultFoodStatusAsync(string roomNo, int itemId, string mealType);

    }
}