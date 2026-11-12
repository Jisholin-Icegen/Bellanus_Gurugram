namespace Dial50_MVC_Core.Models
{
    public class VisitorPassViewModel
    {
        public int GuestPassId { get; set; }
        public string GuestName { get; set; }
        public string GuestPhone { get; set; }
        public string AdditionalMembers { get; set; }
        public string PatientName { get; set; }
        public string RoomBed { get; set; }
        public string PassCode { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public DateTime? RequestTime { get; set; }
        public string QrImageUrl { get; set; }

        public string Status { get; set; } = "VALID";

        public static VisitorPassViewModel Invalid()
        {
            return new VisitorPassViewModel
            {
                GuestName = "INVALID PASS",
                Status = "INVALID"
            };
        }
    }
}