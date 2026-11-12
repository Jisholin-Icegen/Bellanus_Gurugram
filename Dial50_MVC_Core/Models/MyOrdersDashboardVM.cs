namespace Dial50_MVC_Core.Models
{
    public class MyOrdersDashboardVM
    {
        public OrderSummaryVM Summary { get; set; } = new();
        public List<OrderDashboardItemVM> TomorrowOrders { get; set; } = new();
        public List<OrderDashboardItemVM> RecentOrders { get; set; } = new(); 
        public List<ServingTypeVM> ServingTypes { get; set; } = new List<ServingTypeVM>();
    }

    public class OrderSummaryVM
    {
        public int TotalOrders { get; set; }
        public int ActiveOrders { get; set; }
        public int DeliveredOrders { get; set; }
    }

    public class OrderDashboardItemVM
    {
        public string OrderId { get; set; }
        public string MealType { get; set; }
        public string OrderType { get; set; }
        public string Status { get; set; }

        public int Rating { get; set; }
        public string ItemsSummary { get; set; }
        public string SpecialInstruction { get; set; }
        public string AcknowledgeRemarks { get; set; }
        public string AckQtyRemarks { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime CreatedOn { get; set; }

        public int Quantity { get; set; }
        public string ItemName { get; set; }
        public bool IsDenied { get; set; }
        public string DeniedReason { get; set; }
        public bool MenuChanged { get; set; }
        public string MenuChangeReason { get; set; }
        public string OldMenu { get; set; }
    }

    public class ServingTypeVM
    {
        public string Type { get; set; }
        public string Time { get; set; }
    }
}