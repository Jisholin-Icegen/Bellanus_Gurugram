using System;
using System.Collections.Generic;

namespace Dial50_MVC_Core.Models
{
    public class AIFeedbackQuestionModel
    {
        public string DepartmentName { get; set; }

        public string Answer { get; set; }

        public string Remarks { get; set; }
    }

    public class AIFeedbackDataModel
    {
        public List<AIFeedbackQuestionModel> Questions { get; set; } = new();
    }

    public class AIFeedbackInfo
    {
        public long FeedbackId { get; set; }

        public string ReferenceNo { get; set; }

        public string BedNo { get; set; }

        public string SessionId { get; set; }

        public string Uhid { get; set; }

        public string PatientName { get; set; }

        public string RoomNo { get; set; }

        public string Region { get; set; }

        public string FeedbackData { get; set; }

        public DateTime CreatedDate { get; set; }

        public bool IsCompleted { get; set; }

        public int IsSubmit { get; set; }
    }

    public class AIFeedbackSubmitInfo
    {
        public bool Success { get; set; }

        public string Message { get; set; }
    }
}