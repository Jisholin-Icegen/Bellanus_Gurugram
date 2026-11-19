using Dial50_MVC_Core.Controllers;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Services;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Globalization;

namespace Dial50_MVC_Core.Repositories
{
    public class FoodRepository : IFoodRepository
    {
        private readonly IConfiguration _configuration;
        private readonly TenantProvider _tenantProvider;
        private readonly ILogService _logService;
        private readonly ILogger<IFoodRepository> _logger;

        public FoodRepository(IConfiguration configuration, TenantProvider tenantProvider, ILogService logService, ILogger<IFoodRepository> logger)
        {
            _configuration = configuration;
            _tenantProvider = tenantProvider;
            _logService = logService;
            _logger = logger;
        }

        private string GetCs() => _tenantProvider.GetConnectionString();

        public async Task<PatientVM> GetPatientDetailsByRoomAsync(string roomNo)
        {
            PatientVM patient = new PatientVM { IsFound = false };
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_GET_PATIENT_DETAILS_BY_ROOM", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ROOMBED", roomNo);

                await con.OpenAsync();
                using SqlDataReader reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    string status = reader["Success"].ToString();
                    if (status == "TRUE")
                    {
                        patient.IsFound = true;
                        patient.PatientName = reader["PATIENTNAME"]?.ToString() ?? "";
                        patient.DietType = reader["DIETTYPE"]?.ToString() ?? "";
                        patient.Allergies = reader["ALLERGIES"]?.ToString() ?? "";
                        patient.RoomNo = roomNo;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientDetailsByRoomAsync");
                await _logService.LogAsync(ex.Message, "SP_GET_PATIENT_DETAILS_BY_ROOM");
            }
            return patient;
        }

        public async Task<bool> IsFoodOrderingShownAsync()
        {
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_GET_FOODORDERING_FLAG", con);
                cmd.CommandType = CommandType.StoredProcedure;

                await con.OpenAsync();
                var result = await cmd.ExecuteScalarAsync();

                return result != null && result != DBNull.Value && Convert.ToBoolean(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in IsFoodOrderingShownAsync");
                await _logService.LogAsync(ex.Message, "SP_GET_FOODORDERING_FLAG");
                return false;
            }
        }
        public async Task<MyOrdersDashboardVM> GetMyOrdersDashboardAsync(string roomNo)
        {
            MyOrdersDashboardVM dashboard = new MyOrdersDashboardVM();
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_GET_MY_ORDERS_DASHBOARD", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ROOMNO", roomNo);

                await con.OpenAsync();
                using SqlDataReader reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    dashboard.Summary.TotalOrders = Convert.ToInt32(reader["TotalOrders"]);
                    dashboard.Summary.ActiveOrders = Convert.ToInt32(reader["ActiveOrders"]);
                    dashboard.Summary.DeliveredOrders = Convert.ToInt32(reader["DeliveredOrders"]);
                }

                if (await reader.NextResultAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        dashboard.TomorrowOrders.Add(new OrderDashboardItemVM
                        {
                            OrderId = reader["OrderId"].ToString(),
                            MealType = reader["MealType"].ToString(),
                            Status = reader["STATUS"].ToString(),
                            ItemsSummary = reader["ItemsSummary"]?.ToString() ?? "",
                            IsDenied = reader["IsDenied"] != DBNull.Value && Convert.ToBoolean(reader["IsDenied"]),
                            OrderDate = Convert.ToDateTime(reader["OrderDate"]),
                            CreatedOn = Convert.ToDateTime(reader["CREATEDON"])
                        });
                    }
                }

                if (await reader.NextResultAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        dashboard.RecentOrders.Add(new OrderDashboardItemVM
                        {
                            OrderId = reader["OrderId"].ToString(),
                            MealType = reader["MealType"].ToString(),
                            OrderType = reader["OrderType"]?.ToString() ?? "patient",
                            Status = reader["STATUS"].ToString(),
                            OrderDate = Convert.ToDateTime(reader["OrderDate"]),
                            CreatedOn = Convert.ToDateTime(reader["CREATEDON"]),
                            SpecialInstruction = reader["SPECIALINSTRUCTION"] == DBNull.Value ? "" : reader["SPECIALINSTRUCTION"].ToString(),
                            Rating = reader["RATING"] == DBNull.Value ? -1 : Convert.ToInt32(reader["RATING"]),
                            AcknowledgeRemarks = reader["ACKNOWLEDGE_REMARKS"] == DBNull.Value ? "" : reader["ACKNOWLEDGE_REMARKS"].ToString(),
                            AckQtyRemarks = reader["ACK_QTY_REMARKS"] == DBNull.Value ? "" : reader["ACK_QTY_REMARKS"].ToString(),
                            Quantity = reader["Quantity"] == DBNull.Value ? 1 : Convert.ToInt32(reader["Quantity"]),
                            ItemName = reader["ItemName"].ToString(),
                            IsDenied = reader["ISDENIED"] != DBNull.Value && Convert.ToBoolean(reader["ISDENIED"]),
                            DeniedReason = reader["DENIEDREASON"] == DBNull.Value ? "" : reader["DENIEDREASON"].ToString(),
                            MenuChanged = reader["MENUCHANGED"] != DBNull.Value && Convert.ToBoolean(reader["MENUCHANGED"]),
                            MenuChangeReason = reader["MENUCHANGE_REASON"] == DBNull.Value ? "" : reader["MENUCHANGE_REASON"].ToString(),
                            OldMenu = reader["OLDMENU"] == DBNull.Value ? "" : reader["OLDMENU"].ToString()
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                throw;
            }
            return dashboard;
        }

        public async Task<List<ServingWindowVM>> GetActiveServingWindowsAsync()
        {
            List<ServingWindowVM> windows = new List<ServingWindowVM>();
            try
            {
                using (SqlConnection con = new SqlConnection(GetCs()))
                {
                    using (SqlCommand cmd = new SqlCommand("SP_GET_ACTIVE_SERVING_WINDOWS", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        await con.OpenAsync();
                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                windows.Add(new ServingWindowVM
                                {
                                    Id = Convert.ToInt32(reader["Id"]),
                                    CategoryName = reader["CategoryName"].ToString(),
                                    StartTime = reader["StartTime"].ToString(),
                                    EndTime = reader["EndTime"].ToString()
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching serving windows");
            }
            return windows; // Returning the List
        }

        public async Task<FoodResponse> GetMenuDetailsAsync(string orderType, string mealType, string pRoom, string servingTime)
        {
            var response = new FoodResponse();
            try
            {

                using (SqlConnection con = new SqlConnection(GetCs()))
                {
                    using (SqlCommand cmd = new SqlCommand("SP_GETMENUDETAILSFORFOODORDER", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@ORDERTYPE", orderType);
                        cmd.Parameters.AddWithValue("@CATEGORY", mealType);
                        cmd.Parameters.AddWithValue("@ROOMBED", pRoom);
                        cmd.Parameters.AddWithValue("@SERVINGTIME", servingTime);
                        await con.OpenAsync();

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                response.MenuItems.Add(new MenuItem
                                {
                                    Id = Convert.ToInt32(reader["ID"]),
                                    FoodName = reader["FOODNAME"].ToString(),
                                    Description = reader["DESCRIPTION"]?.ToString() ?? "",
                                    ImagePath = reader["IMAGEPATH"]?.ToString() ?? "/images/defaultfood.png",
                                    Allergens = reader["ALLERGENS"]?.ToString() ?? "",
                                    IsDefaultOrder = Convert.ToInt32(reader["ISDEFAULTORDER"]),
                                    Calories = reader["CALORIES"] != DBNull.Value ? Convert.ToInt32(reader["CALORIES"]) : (int?)null,
                                    Protein = reader["PROTEIN"]?.ToString() ?? "-",
                                    Carbs = reader["CARBS"]?.ToString() ?? "-",
                                    TotalFat = reader["TOTALFAT"]?.ToString() ?? "-",
                                    Sodium = reader["SODIUM"]?.ToString() ?? "-",
                                    Sugar = reader["SUGAR"]?.ToString() ?? "-",
                                    Ingredients = reader["INGREDIENTS"]?.ToString() ?? "No ingredients listed.",
                                    AllergensDietaryFlags = reader["ALLERGENSDIETARYFLAGS"]?.ToString() ?? "",
                                    DietaryType = reader["DIETARY_TYPE"]?.ToString() ?? "",
                                    Price = reader["PRICE"] != DBNull.Value ? Convert.ToDecimal(reader["PRICE"]) : (decimal?)null
                                });
                            }

                            if (await reader.NextResultAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    response.Recommendations.Add(new MenuItem
                                    {
                                        Id = Convert.ToInt32(reader["ID"]),
                                        FoodName = reader["FOODNAME"].ToString(),
                                        Description = reader["DESCRIPTION"]?.ToString() ?? "",
                                        ImagePath = reader["IMAGEPATH"]?.ToString() ?? "/images/defaultfood.png",
                                        Calories = reader["CALORIES"] != DBNull.Value ? Convert.ToInt32(reader["CALORIES"]) : (int?)null,
                                        Protein = reader["PROTEIN"]?.ToString() ?? "-",
                                        Carbs = reader["CARBS"]?.ToString() ?? "-",
                                        TotalFat = reader["TOTALFAT"]?.ToString() ?? "-",
                                        Sodium = reader["SODIUM"]?.ToString() ?? "-",
                                        Sugar = reader["SUGAR"]?.ToString() ?? "-",
                                        Ingredients = reader["INGREDIENTS"]?.ToString() ?? "No ingredients listed.",
                                        AllergensDietaryFlags = reader["ALLERGENSDIETARYFLAGS"]?.ToString() ?? "",
                                        DietaryType = reader["DIETARY_TYPE"]?.ToString() ?? "",
                                        Price = reader["PRICE"] != DBNull.Value ? Convert.ToDecimal(reader["PRICE"]) : (decimal?)null,
                                        AvgRating = reader["AVGRATING"] != DBNull.Value ? Convert.ToDecimal(reader["AVGRATING"]) : 0,
                                        TotalRatings = reader["TOTALRATINGS"] != DBNull.Value ? Convert.ToInt32(reader["TOTALRATINGS"]) : 0
                                    });
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching serving windows");
            }
            return response;
        }

        public async Task<List<string>> GetMenuVendorsAsync()
        {
            var vendors = new List<string>();
            using SqlConnection con = new SqlConnection(GetCs());
            using SqlCommand cmd = new SqlCommand("SP_GET_FOOD_MENU_VENDORS", con);
            cmd.CommandType = CommandType.StoredProcedure;
            await con.OpenAsync();
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var vendor = reader["Vendor"]?.ToString();
                if (!string.IsNullOrWhiteSpace(vendor))
                {
                    vendors.Add(vendor);
                }
            }
            return vendors;
        }
        public async Task<bool> SaveCartItemAsync(FoodCartModel cart)
        {
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_SAVEFOODCARTITEM", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ROOMNO", cart.RoomNo);
                cmd.Parameters.AddWithValue("@ITEMID", cart.ItemId);
                cmd.Parameters.AddWithValue("@ITEMNAME", cart.ItemName);
                cmd.Parameters.AddWithValue("@ITEMDESC", cart.ItemDesc ?? "");
                cmd.Parameters.AddWithValue("@QUANTITY", cart.Quantity);
                cmd.Parameters.AddWithValue("@ORDERTYPE", cart.OrderType);
                cmd.Parameters.AddWithValue("@MEALTYPE", cart.MealType);
                cmd.Parameters.AddWithValue("@CALORIES", cart.Calories);
                cmd.Parameters.AddWithValue("@PRICE", (object)cart.Price ?? DBNull.Value);                    
                cmd.Parameters.AddWithValue("@DIETARYTYPE", (object)cart.DietaryType ?? DBNull.Value);        
                await con.OpenAsync();
                await cmd.ExecuteNonQueryAsync();
                return true;
            }
            catch { return false; }
        }

        public async Task<List<FoodCartModel>> GetCartItemsAsync(string roomNo)
        {
            var list = new List<FoodCartModel>();
            using SqlConnection con = new SqlConnection(GetCs());
            using SqlCommand cmd = new SqlCommand("SP_GETFOODCARTITEMS", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@ROOMNO", roomNo);
            await con.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new FoodCartModel
                {
                    RoomNo = reader["ROOMNO"]?.ToString(),
                    ItemId = Convert.ToInt32(reader["ITEMID"]),
                    ItemName = reader["ITEMNAME"]?.ToString(),
                    ItemDesc = reader["ITEMDESC"]?.ToString(),
                    Quantity = Convert.ToInt32(reader["QUANTITY"]),
                    OrderType = reader["ORDERTYPE"]?.ToString(),
                    MealType = reader["MEALTYPE"]?.ToString(),
                    Calories = reader["CALORIES"] == DBNull.Value ? 0 : Convert.ToInt32(reader["CALORIES"]),
                    Price = reader["PRICE"] == DBNull.Value ? (decimal?)null : Convert.ToDecimal(reader["PRICE"]),   
                    DietaryType = reader["DIETARYTYPE"] == DBNull.Value ? "" : reader["DIETARYTYPE"].ToString()          
                });
            }
            return list;
        }

        public async Task<bool> DeleteCartItemAsync(string roomNo, int itemId, string mealType)
        {
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_DELETEFOODCARTITEM", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ROOMNO", roomNo);
                cmd.Parameters.AddWithValue("@ITEMID", itemId);
                cmd.Parameters.AddWithValue("@MEALTYPE", mealType);
                await con.OpenAsync();
                await cmd.ExecuteNonQueryAsync();
                return true;
            }
            catch { return false; }
        }

        public async Task<List<string>> SubmitOrderAsync(string roomNo, string specialInstruction, string orddate, string isPreorder, string Calories)
        {
            List<string> orderIds = new();
            try
            {
                if (!DateTime.TryParseExact(orddate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime orderDate))
                    throw new ArgumentException($"Invalid orddate '{orddate}'. Expected format: yyyy-MM-dd.");

                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_SUBMIT_FOOD_ORDER", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ORDERID", Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper());
                cmd.Parameters.AddWithValue("@ROOMNO", roomNo);
                cmd.Parameters.Add("@ORDERDATE", SqlDbType.DateTime2).Value = orderDate;
                cmd.Parameters.AddWithValue("@ISPREORDER", isPreorder);
                cmd.Parameters.AddWithValue("@CALORIES", Calories);
                cmd.Parameters.AddWithValue("@SPECIALINSTRUCTION", (object?)specialInstruction ?? DBNull.Value);

                await con.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                    orderIds.Add(reader["ORDERID"].ToString());
            }
            catch (Exception ex)
            {
                ex.Message.ToString();
            }
            return orderIds;
        }

        public async Task<OrderSuccessVM> GetOrderSuccessDetailsAsync(string orderId)
        {
            OrderSuccessVM model = new();
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_GET_ORDER_SUCCESS_DETAILS", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ORDERID", orderId);
                await con.OpenAsync();
                using SqlDataReader reader = await cmd.ExecuteReaderAsync();

                bool first = true;
                while (await reader.ReadAsync())
                {
                    if (first)
                    {
                        model.OrderId = reader["ORDERID"].ToString();
                        model.PatientName = reader["ORDERBY"].ToString();
                        model.RoomNo = reader["ROOMNO"].ToString();
                        model.MealType = reader["MEALTYPE"].ToString();
                        model.Status = reader["STATUS"].ToString();
                        model.OrderDate = Convert.ToDateTime(reader["ORDERDATE"]);
                        model.Rating = reader["RATING"].ToString();
                        model.Estimatedtime = reader["ESTIMATED_TIME"]?.ToString() ?? "";
                        first = false;
                    }

                    model.Items.Add(new OrderItemVM
                    {
                        ItemName = reader["ITEMNAME"].ToString(),
                        Quantity = Convert.ToInt32(reader["QUANTITY"]),
                        SpecialInstruction = reader["SPECIALINSTRUCTION"] == DBNull.Value ? "" : reader["SPECIALINSTRUCTION"].ToString(),

                        IsDenied = reader["ISDENIED"] != DBNull.Value && Convert.ToBoolean(reader["ISDENIED"]),
                        DeniedReason = reader["DENIEDREASON"] == DBNull.Value ? "" : reader["DENIEDREASON"].ToString(),
                        MenuChanged = reader["MENUCHANGED"] != DBNull.Value && Convert.ToBoolean(reader["MENUCHANGED"]),
                        OldMenu = reader["OLDMENU"] == DBNull.Value ? "" : reader["OLDMENU"].ToString()
                    });
                }

                if (await reader.NextResultAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        model.StatusLogs.Add(new OrderStatusLogVM { NewStatus = reader["NEW_STATUS"].ToString(), ChangedOn = Convert.ToDateTime(reader["CHANGED_ON"]) });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return model;
        }

        public async Task<bool> CancelPreorderAsync(string orderId)
        {
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_CANCEL_FOOD_ORDER", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ORDERID", orderId);
                await con.OpenAsync();
                var res = await cmd.ExecuteScalarAsync();
                return res != null && res.ToString().Equals("TRUE", StringComparison.OrdinalIgnoreCase);
            }
            catch { return false; }
        }

        public async Task<string> SubmitRatingAsync(string orderId, int rating, string feedback)
        {
            using SqlConnection con = new SqlConnection(GetCs());
            using SqlCommand cmd = new SqlCommand("SP_SUBMIT_FEEDBACK", con);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@ORDERID", orderId);
            cmd.Parameters.AddWithValue("@RATING", rating);
            cmd.Parameters.AddWithValue("@FEEDBACK", feedback ?? "");

            await con.OpenAsync();

            string result = "";

            using (SqlDataReader dr = await cmd.ExecuteReaderAsync())
            {
                if (await dr.ReadAsync())
                {
                    result = dr["RESULT"].ToString();
                }
            }

            return result;
        }

        public async Task<string> CheckPatientNpoStatusAsync(string roomNo)
        {
            string result = "FALSE|"; // Default
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_CHECK_PATIENT_NPO_STATUS", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ROOMBED", roomNo);

                await con.OpenAsync();
                using SqlDataReader reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    string isNpo = reader["IsNpo"].ToString();
                    string reason = reader["Reason"].ToString();
                    result = $"{isNpo}|{reason}";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CheckPatientNpoStatusAsync");
                await _logService.LogAsync(ex.Message, "SP_CHECK_PATIENT_NPO_STATUS");

            }
            return result;
        }


        public async Task<List<FoodServiceVM>> GetFoodServicesAsync()
        {
            List<FoodServiceVM> services = new();
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_GET_FOOD_SERVICES", con);
                cmd.CommandType = CommandType.StoredProcedure;

                await con.OpenAsync();
                using SqlDataReader reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    services.Add(new FoodServiceVM
                    {
                        categoryId = Convert.ToInt32(reader["categoryId"]),
                        categoryDescription = reader["categoryDescription"].ToString(),
                        categoryImage = reader["categoryImage"].ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetFoodServicesAsync");
            }
            return services;
        }


        public async Task<ServiceRequestResult> InsertOtherServiceRequestAsync(string roomNo, int categoryId, string remarks, string userName)
        {
            var result = new ServiceRequestResult { Success = false, RequestId = 0 };

            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_INSERT_FOOD_SERVICE_REQUEST", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@RoomNo", roomNo ?? "");
                cmd.Parameters.AddWithValue("@CategoryId", categoryId);
                cmd.Parameters.AddWithValue("@Remarks", remarks ?? "");
                cmd.Parameters.AddWithValue("@UserName", string.IsNullOrWhiteSpace(userName) ? "Patient" : userName);

                await con.OpenAsync();

                using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var res = reader["Result"]?.ToString();
                    result.Success = string.Equals(res, "TRUE", StringComparison.OrdinalIgnoreCase);

                    var idOrdinal = reader.GetOrdinal("RequestId");
                    if (!await reader.IsDBNullAsync(idOrdinal))
                        result.RequestId = Convert.ToInt64(reader.GetValue(idOrdinal));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in InsertOtherServiceRequestAsync");
                result.Success = false;
                result.RequestId = 0;
            }

            return result;
        }
        public async Task<OrderOtpVM> GetOrderOtp(string orderId)
        {
            try
            {
                using SqlConnection con = new SqlConnection(GetCs());
                using SqlCommand cmd = new SqlCommand("SP_GET_ORDER_OTP", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@OrderId", orderId);
                await con.OpenAsync();
                using SqlDataReader reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return new OrderOtpVM
                    {
                        HasOtp = reader["RESULT"].ToString() == "TRUE",
                        OTP = reader["OTP_RECEIVED"]?.ToString()
                    };
                }

                return new OrderOtpVM
                {
                    HasOtp = false,
                    OTP = ""
                };
            }
            catch (Exception ex)
            {
                ex.Message.ToString();
                return new OrderOtpVM
                {
                    HasOtp = false,
                    OTP = ""
                };
            }
        }


        public async Task<bool> UpdateDefaultFoodStatusAsync(string roomNo, int itemId, string mealType)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(GetCs()))
                {
                    using (SqlCommand cmd = new SqlCommand("SP_UPDATEDEFAULTFOODPREFERENCESTATUS", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@ROOMNO", roomNo);
                        cmd.Parameters.AddWithValue("@ITEMID", itemId);
                        cmd.Parameters.AddWithValue("@MEALTYPE", mealType);
                        await con.OpenAsync();
                        int rows = await cmd.ExecuteNonQueryAsync();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateDefaultFoodStatusAsync");
                return false;
            }
        }

    }
}