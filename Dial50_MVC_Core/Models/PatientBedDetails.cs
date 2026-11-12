namespace Dial50_MVC_Core.Models
{
    public class PatientBedDetails
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; } = "";
        public string BedId { get; set; } = "";
        public string RoomNumber { get; set; } = "";
        public string Bed { get; set; } = "";
        public string RoomBed { get; set; } = "";
        public string Ward { get; set; } = "";
        public string Uhid { get; set; } = "";
        public string Gender { get; set; } = "";
        public string Age { get; set; } = "";
        public string DietType { get; set; } = "";
        public string Allergies { get; set; } = "";

        public string TierName { get; set; } = "";
        public string TierCode { get; set; } = "";
        public string TierLevel { get; set; } = "";
    }
}