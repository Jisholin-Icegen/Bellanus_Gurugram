using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TrackingRequestByOrderIds
    {
        public string OrderIds { get; set; }
    }
}
