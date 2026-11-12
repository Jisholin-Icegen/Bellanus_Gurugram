using Dial50_MVC_Core.Data;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TaskRequests
    {
        public string TaskId { get; set; } = "";

        public string? FromRoom { get; set; }

        public string? TaskName { get; set; }

        public string? PorterName { get; set; }

        public string? Status { get; set; }

        public DateTime? RequestDate { get; set; }

        public string? Service { get; set; }
    }
}