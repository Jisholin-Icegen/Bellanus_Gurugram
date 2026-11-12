using System;
using System.Collections.Generic;

namespace Dial50_MVC_Core.Models
{
    public class DischargeFeedbackModel
    {
        public string BedInfo { get; set; }
        public string Region { get; set; }
        public string Category { get; set; }
        public int Rating { get; set; }
        public string Comments { get; set; }
        public DateTime SubmittedOn { get; set; } = DateTime.Now;
    }
}