using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Data
{

    [Keyless]
    public class ConversationQR
    {
        public string? ID { get; set; }

        public string? ConversationID { get; set; }

        public string? BedID { get; set; }

        public string? PrevRequestID { get; set; }

        public string? CurRequestID { get; set; }
    }
}
