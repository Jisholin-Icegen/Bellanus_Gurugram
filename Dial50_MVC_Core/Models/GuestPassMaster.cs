using System.ComponentModel.DataAnnotations;

namespace Dial50_MVC_Core.Models
{
    public class GuestPassMaster
    {
        [Key]
        public int GuestPassId { get; set; }

        public int? RequestId { get; set; }

        public string BedNo { get; set; }

        public int? PatientId { get; set; }

        public string PatientName { get; set; }

        public string RoomBed { get; set; }

        public string GuestName { get; set; }

        public string GuestPhone { get; set; }

        public string AdditionalMembers { get; set; }

        public string PassCode { get; set; }

        public string QrToken { get; set; }

        public string QrTokenHash { get; set; }

        public DateTime? RequestTime { get; set; }

        public DateTime ValidFrom { get; set; }

        public DateTime ValidUntil { get; set; }

        public bool IsUsed { get; set; }

        public DateTime? UsedAt { get; set; }

        public bool IsRevoked { get; set; }

        public bool SmsSent { get; set; }

        public DateTime? SmsSentAt { get; set; }

        public string SmsResponse { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}