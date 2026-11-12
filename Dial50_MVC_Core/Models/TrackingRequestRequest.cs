using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TrackingRequestRequest
    {
        public string? RoomNo { get; set; }


        public string RequestId { get; set; }

    }
}
