using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TrackReqInfoByOrderIds

        {
        public string? PorterID { get; set; }
        public string? RequestID { get; set; }
        public string? Token { get; set; }
        public string? RoomNo { get; set; }

        public string? OrderIds { get; set; }

    }
}
