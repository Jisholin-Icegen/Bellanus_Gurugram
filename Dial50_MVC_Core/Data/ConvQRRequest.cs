using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Data
{

    [Keyless]
    public class ConvQRRequest
    {
        public string? ConversationID { get; set; }

        public string? BedID { get; set; }

        public string? Process { get; set; }
    }
}
