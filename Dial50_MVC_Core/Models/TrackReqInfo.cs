using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TrackReqInfo
    {

        public string? PorterID { get; set; }
        public string? RequestID { get; set; }
        public string? Token { get; set; }
        public string? RoomNo { get; set; }

        public string? OrderIds { get; set; }

    }
}
