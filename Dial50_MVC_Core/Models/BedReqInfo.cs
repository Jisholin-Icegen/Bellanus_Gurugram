using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class BedReqInfo
    {

        public string? BedID { get; set; }
        public string? BedNumber { get; set; }
        public string? Token { get; set; }
    }
}
