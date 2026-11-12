using Dial50_MVC_Core.Data;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class TaskTypes
    {

        [JsonPropertyName("DepartmentId")]
        public string? DepartmentId { get; set; }

        [JsonPropertyName("SubLevelDepId")]
        public string? SubLevelDepId { get; set; }

        [JsonPropertyName("DepartmentName")]
        public string? DepartmentName { get; set; }

        [JsonPropertyName("CategoryId")]
        public string? CategoryId { get; set; }

        [JsonPropertyName("CategoryName")]
        public string? CategoryName { get; set; }

        [JsonPropertyName("CategoryDescription")]
        public string? CategoryDescription { get; set; }

        [JsonPropertyName("DescriptionDetails")]
        public string? DescriptionDetails { get; set; }

        [JsonPropertyName("CategoryImage")]
        public string? CategoryImage { get; set; }

        [JsonPropertyName("CategoryTitle")]
        public string? CategoryTitle { get; set; }

        [JsonPropertyName("CategoryDetails")]
        public string? CategoryDetails { get; set; }

        [JsonPropertyName("Dial50Url")]
        public string? Dial50Url { get; set; }

        [JsonPropertyName("HisUrl")]
        public string? HisUrl { get; set; }

        [JsonPropertyName("TaskTypeId")]
        public string? TaskTypeId { get; set; }
    }
}

