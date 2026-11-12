using System;

namespace Dial50_MVC_Core.Models
{
    public class LoginPatientResult
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string ROOM { get; set; }
        public string BED { get; set; }
        public string Ward { get; set; }
        public string Gender { get; set; }
        public int? Age { get; set; }
        public string DoctorName { get; set; }
        public string DietType { get; set; }
        public string Allergies { get; set; }
        public string MedicalNotes { get; set; }
        public string DietaryNotes { get; set; }
        public bool IsActive { get; set; }
        public int NpoFlag { get; set; }
        public string NpoReason { get; set; }
        public DateTime? NpoStartDate { get; set; }
        public DateTime? NpoEndDate { get; set; }
        public string NpoNotes { get; set; }
        public int IsFasting { get; set; }
        public DateTime? FastingStart { get; set; }
        public DateTime? FastingEnd { get; set; }
        public string FastingMenuId { get; set; }

        public int? BedId { get; set; }
        public string Uhid { get; set; }
        public string Region { get; set; }
        public string Language { get; set; }
        public DateTime? DateOfAdmission { get; set; }

        public string BedInfoEncrypted { get; set; }

        public string Tier { get; set; }
        public string TierCode { get; set; }
        public string TierLevel { get; set; }
    }
}