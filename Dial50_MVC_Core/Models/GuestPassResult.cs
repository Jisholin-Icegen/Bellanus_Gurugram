namespace Dial50_MVC_Core.Models
{
    public class GuestPassResult
    {
        public bool Success { get; set; }
        public int GuestPassId { get; set; }
        public int RequestId { get; set; }
        public string PassCode { get; set; }
        public string QrToken { get; set; }
        public string Message { get; set; }
    }
}