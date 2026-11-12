using Dial50_MVC_Core.Data;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TaskResponse
    {
        [JsonPropertyName("RequestNo")]
        public string? RequestNo { get; set; }

        [JsonPropertyName("Result")]
        public string? Result { get; set; }


    }
}

