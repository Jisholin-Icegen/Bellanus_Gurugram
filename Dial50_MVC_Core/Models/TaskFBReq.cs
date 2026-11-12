using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TaskFBReq
    {

        public string? RequestID { get; set; }
        public string? Rating { get; set; }
        public string? Remarks { get; set; }
        public string? Token { get; set; }
    }
}
