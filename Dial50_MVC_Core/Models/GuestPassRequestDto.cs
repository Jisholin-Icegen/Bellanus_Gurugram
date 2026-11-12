namespace Dial50_MVC_Core.Models
{
    public class GuestPassRequestDto
    {
        public string BedInfo { get; set; }
        public string GuestName { get; set; }
        public string GuestPhone { get; set; }
        public List<string> Members { get; set; }
        public string VisitingPatient { get; set; }
        public string RequestTime { get; set; }
    }
}