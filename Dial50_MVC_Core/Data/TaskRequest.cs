using Dial50_MVC_Core.Data;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TaskRequest
    {

        [JsonPropertyName("BedID")]
        public string? BedID { get; set; }

        [JsonPropertyName("CategoryId")]
        public string? CategoryId { get; set; }


        [JsonPropertyName("Remarks")]
        public string? Remarks { get; set; }


        [JsonPropertyName("quantity")]
        public string? quantity { get; set; }
    }
}

