using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class NotificationRequestModel
    {
        public string RoomNo { get; set; }
        public string NotificationId { get; set; } 
    }
}
