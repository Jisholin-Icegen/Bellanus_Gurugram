namespace Dial50_MVC_Core.Models
{
    public class OrderSuccessVM
    {
        public string OrderId { get; set; }
        public string PatientName { get; set; }
        public string RoomNo { get; set; }
        public string MealType { get; set; }
        public string OrderType { get; set; }
        public string Status { get; set; }
        public DateTime OrderDate { get; set; }

        public string Estimatedtime { get; set; }
        public string Rating { get; set; }
        public List<OrderItemVM> Items { get; set; } = new();
        public List<OrderStatusLogVM> StatusLogs { get; set; } = new();
    }

    public class OrderItemVM
    {
        public string ItemName { get; set; }
        public int Quantity { get; set; }
        public string SpecialInstruction { get; set; }
        public bool IsDenied { get; set; }
        public string DeniedReason { get; set; }
        public bool MenuChanged { get; set; }
        public string OldMenu { get; set; }
    }

    public class OrderStatusLogVM
    {
        public string NewStatus { get; set; }
        public DateTime ChangedOn { get; set; }
    }
}