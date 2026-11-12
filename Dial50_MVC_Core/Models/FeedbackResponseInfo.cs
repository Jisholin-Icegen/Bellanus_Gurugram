using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class FeedbackResponseInfo
    {
        public long FeedbackId { get; set; }
        public string ReferenceNo { get; set; }
        public string BedNo { get; set; }
        public string Uhid { get; set; }
        public string PatientName { get; set; }
        public string RoomNo { get; set; }
        public string Region { get; set; }
        public string FeedbackData { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class DepartmentResponseInfo
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public bool IsActive { get; set; }
        public int? ServiceId { get; set; }
        public string Description { get; set; }
        public string DepartmentKey { get; set; }
    }

    public class DepartmentRatingInfo
    {
        public string ReferenceNo { get; set; }
        public string PatientName { get; set; }
        public string BedNo { get; set; }
        public string RoomNo { get; set; }
        public string DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public string DepartmentKey { get; set; }
        public string Rating { get; set; }
        public string Remarks { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class FeedbackSummaryInfo
    {
        public int TotalFeedbacks { get; set; }
        public int UniquePatients { get; set; }
        public int CompletedFeedbacks { get; set; }
        public DateTime FeedbackDate { get; set; }
    }

    public class DepartmentSummaryInfo
    {
        public string DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public string DepartmentKey { get; set; }
        public int TotalRatings { get; set; }
        public int Satisfied { get; set; }
        public int Neutral { get; set; }
        public int Unsatisfied { get; set; }
        public decimal SatisfactionPercentage { get; set; }
    }

    public class PatientSummaryInfo
    {
        public string BedNo { get; set; }
        public string PatientName { get; set; }
        public string Uhid { get; set; }
        public string RoomNo { get; set; }
        public int TotalFeedbacks { get; set; }
        public DateTime LastFeedbackDate { get; set; }
        public DateTime FirstFeedbackDate { get; set; }
    }

    public class CompleteFeedbackInfo
    {
        public long FeedbackId { get; set; }
        public string ReferenceNo { get; set; }
        public string BedNo { get; set; }
        public string Uhid { get; set; }
        public string PatientName { get; set; }
        public string RoomNo { get; set; }
        public string Region { get; set; }
        public string FeedbackData { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsCompleted { get; set; }
        public string AdditionalComments { get; set; }
        public string SubmittedAt { get; set; }
        public string Questions { get; set; }
    }
}