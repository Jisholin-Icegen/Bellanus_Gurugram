using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
namespace Dial50_MVC_Core.Repositories
{
    public interface IBedRepository
    {
        Task<List<BedInfo>> GetBedInfo(string? BedNo);
        Task<List<BedInfo>> updateBedDetails(PatientResponse _patientResponse, string? _BedIDdial50, string? _bedIDHIS, string? _bedHIS, string? _Token);
        Task<List<TaskResponse>> InsertTask(TaskRequest _taskRequest, string? _Token);
        Task<List<TaskRequests>> GetTasks(string? BedID, string? BedNumber, string? _Token);
        Task<List<TrackResponseInfo>> GetTrackInfo(TrackReqInfo porterReqInfo);
        Task<List<TaskFBResponse>> submitFeedback(TaskFBReq taskFBReq);
        Task<List<TaskRequests>> GetTaskDetailsByID(string? RequestID);
        Task<List<ConversationQR>> ConversationProcess(ConvQRRequest porterReqInfo);
        Task<TrackingRequestModel?> GetTrackingRequest(string? roomNo, string? requestId = null);
        Task<List<TrackResponseInfo>> GetTrackInfoByOrderIds(TrackReqInfoByOrderIds porterReqInfo);
        Task<object> GetPatientInfo(string roomNo);
        Task<object> SubmitDischargeFeedback(DischargeFeedbackRequest feedbackRequest);
        Task<List<DischargeDepartmentInfo>> GetActiveDepartments(string roomNo = null, string bedNo = null);
        Task<DischargeFeedbackInfo> GetFeedbackByReference(string referenceNo);
        Task<List<DischargeFeedbackInfo>> GetFeedbackByBed(string bedNo);
        Task<List<DischargeFeedbackSummaryInfo>> GetFeedbackSummary(DateTime? startDate, DateTime? endDate);
        Task<List<DischargeDepartmentRatingInfo>> GetDepartmentRatings(string? referenceNo, string? bedNo);
        Task<List<DischargeDepartmentRatingInfo>> GetUnsatisfiedDepartments(DateTime? startDate, DateTime? endDate, string? bedNo);
        Task<List<DischargeDepartmentSummaryInfo>> GetDepartmentSummary(DateTime? startDate, DateTime? endDate, string? bedNo);
        Task<List<DischargePatientSummaryInfo>> GetPatientSummary(DateTime? startDate, DateTime? endDate, string? bedNo, string? patientName);
        Task<List<DischargeCompleteFeedbackInfo>> GetCompleteFeedback(string? referenceNo, string? bedNo, string? patientName);
        Task<List<AIFeedbackInfo>> GetLatestFeedback(string bedNo);
        Task<AIFeedbackSubmitInfo> SubmitAIFeedback(long feedbackId);
        Task<AIFeedbackSubmitInfo> CancelAIFeedback(long feedbackId);
        Task<LatestVideoTask> GetLatestVideoTaskByBed(string bedNo, DateTime sinceDate);
        Task<SubmitRatingResult> SubmitRatingAsync(int requestId, int rating);
        Task<int> InsertRoomComfortRequest(string bedNo, string category, string quantity, string remarks, string gender, string userId);
        Task<DataTable> GetFreshTask(string bedId = null, string bedNumber = null, string token = null, int windowSeconds = 60, string lastSeenTaskId = null);
        Task<GuestPassResult> InsertGuestPassAsync(
            string bedNo,
            int? patientId,
            string patientName,
            string roomBed,
            string guestName,
            string guestPhone,
            string additionalMembers,
            string passCode,
            string qrToken,
            string qrTokenHash,
            DateTime? requestTime,
            DateTime validFrom,
            DateTime validUntil,
            int? createdBy);

        Task<GuestPassMaster> GetGuestPassByIdAsync(int guestPassId);
        Task<GuestPassMaster> GetGuestPassByQrTokenHashAsync(string qrTokenHash);
        Task UpdateGuestPassSmsStatusAsync(int guestPassId, bool sent, string response);
        Task<bool> UpdateGuestPassDecisionAsync(int guestPassId, string process);
        Task<LoginPatientResult> LoginByRoomNoAsync(string roomNo);
    }
}
