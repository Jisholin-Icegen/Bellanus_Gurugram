namespace Dial50_MVC_Core.Models
{
    public class GuestPassSuccessVM
    {
        public int GuestPassId { get; set; }
        public int? RequestId { get; set; }

        public string BedNo { get; set; }
        public string RoomBed { get; set; }
        public string PatientName { get; set; }

        public string GuestName { get; set; }
        public string GuestPhone { get; set; }
        public string AdditionalMembers { get; set; }

        public string PassCode { get; set; }

        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }

        public bool IsUsed { get; set; }
        public DateTime? UsedAt { get; set; }
        public bool IsRevoked { get; set; }

        public bool SmsSent { get; set; }
        public DateTime? SmsSentAt { get; set; }
        public string SmsResponse { get; set; }

        public string QrImageUrl { get; set; }

        public static GuestPassSuccessVM FromEntity(GuestPassMaster e, string qrImageUrl = null)
        {
            if (e == null) return null;

            return new GuestPassSuccessVM
            {
                GuestPassId = e.GuestPassId,
                RequestId = e.RequestId,
                BedNo = e.BedNo,
                RoomBed = e.RoomBed,
                PatientName = e.PatientName,
                GuestName = e.GuestName,
                GuestPhone = e.GuestPhone,
                AdditionalMembers = e.AdditionalMembers,
                PassCode = e.PassCode,
                ValidFrom = e.ValidFrom,
                ValidUntil = e.ValidUntil,
                IsUsed = e.IsUsed,
                UsedAt = e.UsedAt,
                IsRevoked = e.IsRevoked,
                SmsSent = e.SmsSent,
                SmsSentAt = e.SmsSentAt,
                SmsResponse = e.SmsResponse,
                QrImageUrl = qrImageUrl ?? $"/GuestPass/Qr?id={e.GuestPassId}"
            };
        }
    }
}