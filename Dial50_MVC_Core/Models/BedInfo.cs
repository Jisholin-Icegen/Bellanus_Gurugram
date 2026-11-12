using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class BedInfo
    {

        public string? BedID { get; set; }
        public string? BedIDHIS { get; set; }
        public string? BedNumber { get; set; }
        public string? PatientName { get; set; }

        public string? HospitalName { get; set; }
        public string? HospitalImage { get; set; }
        public string? Gender { get; set; }
        public string? Age { get; set; }
        public string? UHID { get; set; }
        public string? Token { get; set; }

        public string? userId { get; set; }
    }
}
