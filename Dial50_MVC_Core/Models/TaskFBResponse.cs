using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TaskFBResponse
    {

        public string? RequestID { get; set; }
        public string? Rating { get; set; }
        public string? Remarks { get; set; }
    }
}
