namespace Dial50_MVC_Core.Models
{
    public class VerificationViewModel
    {
        public string GuestName { get; set; }
        public string GuestPhone { get; set; }
        public string AdditionalMembers { get; set; }
        public string PatientName { get; set; }
        public string RoomBed { get; set; }
        public string PassCode { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public DateTime? RequestTime { get; set; }
        public string Status { get; set; }
        public bool CanAdmit { get; set; }
        public string Token { get; set; }
        public string Decision { get; set; }

        public static VerificationViewModel Invalid()
        {
            return new VerificationViewModel
            {
                Status = "INVALID",
                CanAdmit = false,
                Decision = "PENDING"
            };
        }
    }
}