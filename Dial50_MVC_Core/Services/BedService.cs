using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using Dial50_MVC_Core.Controllers;
using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using System.Data;
using System.Security.Cryptography;


public class BedService : IBedService
{
    private readonly IBedRepository _repository;
    private readonly ILogger<BedService> _logger;
    private readonly ISmsService _smsService;


    public BedService(
        IBedRepository repository,
        ISmsService smsService,
        ILogger<BedService> logger)
    {
        _repository = repository;
        _smsService = smsService;
        _logger = logger;
    }

    public async Task<List<BedInfo>> GetBedInfosAsync(string? BedNo)
    {
        var data = await _repository.GetBedInfo(BedNo);

        // Example business rule
        //foreach (var item in data)
        //{
        //    if (string.IsNullOrEmpty(item.Result))
        //        item.Result = "Pending";
        //}

        return data;
    }

    public async Task<int> InsertRoomComfortRequestAsync(string bedNo, string category, string quantity, string remarks, string gender, string userId)
    {
        return await _repository.InsertRoomComfortRequest(bedNo, category, quantity, remarks, gender, userId);
    }
    public async Task<TrackingRequestModel?> GetTrackingRequest(string? roomNo, string? requestId = null)
    {
        return await _repository.GetTrackingRequest(roomNo, requestId);
    }

    public async Task<List<BedInfo>> updateBedInfo(PatientResponse patientResponse, string? _BedIDdial50, string? _bedIDHIS, string? _bedHIS, string? _Token)
    {
        var data = await _repository.updateBedDetails(patientResponse, _BedIDdial50, _bedIDHIS, _bedHIS, _Token);

        // Example business rule
        //foreach (var item in data)
        //{
        //    if (string.IsNullOrEmpty(item.Result))
        //        item.Result = "Pending";
        //}

        return data;
    }



    public async Task<List<TaskResponse>> InsertTask(TaskRequest _taskRequest, string? _Token)
    {
        var data = await _repository.InsertTask(_taskRequest, _Token);

        return data;
    }

    public async Task<List<TaskRequests>> GetBedTasks(string? BedID, string? BedNumber, string? _Token)
    {
        var data = await _repository.GetTasks(BedID, BedNumber, _Token);

        // Example business rule
        //foreach (var item in data)
        //{
        //    if (string.IsNullOrEmpty(item.Result))
        //        item.Result = "Pending";
        //}

        return data;
    }

    public async Task<List<TaskRequests>> GetRequestDeatilsByID(string? RequestID)
    {
        var data = await _repository.GetTaskDetailsByID(RequestID);

        // Example business rule
        //foreach (var item in data)
        //{
        //    if (string.IsNullOrEmpty(item.Result))
        //        item.Result = "Pending";
        //}

        return data;
    }

    public async Task<List<TrackResponseInfo>> GetTrackInfo(TrackReqInfo porterReqInfo)
    {

        var data = await _repository.GetTrackInfo(porterReqInfo);


        return data;
    }

    public async Task<List<TrackResponseInfo>> GetTrackingRequestByOrderIds(string? orderIds)
    {
        var request = new TrackReqInfoByOrderIds
        {
            OrderIds = orderIds
        };

        return await _repository.GetTrackInfoByOrderIds(request);
    }

    public async Task<List<ConversationQR>> ConversationProcessQR(ConvQRRequest convQRRequest)
    {
        return await _repository.ConversationProcess(convQRRequest);
    }

    public async Task<object> GetPatientInfoAsync(string roomNo)
    {
        var patient = await _repository.GetPatientInfo(roomNo);
        return patient;
    }

    public async Task<List<TaskFBResponse>> SubmitFeedback(TaskFBReq taskFBReq)
    {
        return await _repository.submitFeedback(taskFBReq);
    }

    public async Task<object> SubmitDischargeFeedback(DischargeFeedbackRequest feedbackRequest)
    {
        return await _repository.SubmitDischargeFeedback(feedbackRequest);
    }
    public async Task<AIFeedbackSubmitInfo> CancelAIFeedback(long feedbackId)
    {
        return await _repository.CancelAIFeedback(feedbackId);
    }
    public async Task<List<DischargeDepartmentInfo>> GetActiveDepartments(string roomNo = null, string bedNo = null)
    {
        return await _repository.GetActiveDepartments(roomNo, bedNo);
    }

    public async Task<DischargeFeedbackInfo> GetFeedbackByReference(string referenceNo)
    {
        return await _repository.GetFeedbackByReference(referenceNo);
    }

    public async Task<List<DischargeFeedbackInfo>> GetFeedbackByBed(string bedNo)
    {
        return await _repository.GetFeedbackByBed(bedNo);
    }

    public async Task<List<DischargeFeedbackSummaryInfo>> GetFeedbackSummary(DateTime? startDate, DateTime? endDate)
    {
        return await _repository.GetFeedbackSummary(startDate, endDate);
    }

        public async Task<List<DischargeDepartmentRatingInfo>> GetDepartmentRatings(string? referenceNo, string? bedNo)
        {
            return await _repository.GetDepartmentRatings(referenceNo, bedNo);
        }

        public async Task<List<AIFeedbackInfo>> GetLatestFeedback(string bedNo)
        {
            return await _repository.GetLatestFeedback(bedNo);
        }

    public async Task<AIFeedbackSubmitInfo> SubmitAIFeedback(long feedbackId)
    {
        return await _repository.SubmitAIFeedback(feedbackId);
    }
    public async Task<List<DischargeDepartmentRatingInfo>> GetUnsatisfiedDepartments(DateTime? startDate, DateTime? endDate, string? bedNo)
    {
        return await _repository.GetUnsatisfiedDepartments(startDate, endDate, bedNo);
    }

    public async Task<List<DischargeDepartmentSummaryInfo>> GetDepartmentSummary(DateTime? startDate, DateTime? endDate, string? bedNo)
    {
        return await _repository.GetDepartmentSummary(startDate, endDate, bedNo);
    }

    public async Task<List<DischargePatientSummaryInfo>> GetPatientSummary(DateTime? startDate, DateTime? endDate, string? bedNo, string? patientName)
    {
        return await _repository.GetPatientSummary(startDate, endDate, bedNo, patientName);
    }

    public async Task<List<DischargeCompleteFeedbackInfo>> GetCompleteFeedback(string? referenceNo, string? bedNo, string? patientName)
    {
        return await _repository.GetCompleteFeedback(referenceNo, bedNo, patientName);
    }

    public Task<SubmitRatingResult> SubmitRatingAsync(int requestId, int rating)
    {
        return _repository.SubmitRatingAsync(requestId, rating);
    }
    public async Task<DataTable> GetFreshTask(string bedId = null, string bedNumber = null, string token = null, int windowSeconds = 60, string lastSeenTaskId = null)
    {
        return await _repository.GetFreshTask(bedId, bedNumber, token, windowSeconds, lastSeenTaskId);
    }

    public Task<GuestPassResult> InsertGuestPassAsync(
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
        int? createdBy)
        => _repository.InsertGuestPassAsync(
            bedNo, patientId, patientName, roomBed,
            guestName, guestPhone, additionalMembers,
            passCode, qrToken, qrTokenHash,
            requestTime, validFrom, validUntil, createdBy);

    public Task<GuestPassMaster> GetGuestPassByIdAsync(int guestPassId)
        => _repository.GetGuestPassByIdAsync(guestPassId);

    public Task<GuestPassMaster> GetGuestPassByQrTokenHashAsync(string qrTokenHash)
        => _repository.GetGuestPassByQrTokenHashAsync(qrTokenHash);

    public Task UpdateGuestPassSmsStatusAsync(int guestPassId, bool sent, string response)
        => _repository.UpdateGuestPassSmsStatusAsync(guestPassId, sent, response);

    public async Task<GuestPassResult> CreateGuestPassAsync(
        PatientBedDetails patient,
        GuestPassRequestDto dto,
        string viewBaseUrl)
    {
        string passCode = "GP-" + Guid.NewGuid().ToString("N").Substring(0, 4).ToUpper();

        byte[] tokenBytes = RandomNumberGenerator.GetBytes(32);
        string qrToken = WebEncoders.Base64UrlEncode(tokenBytes);
        string qrTokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(qrToken)));

        string membersCsv = dto.Members != null && dto.Members.Count > 0
            ? string.Join(", ", dto.Members.Where(m => !string.IsNullOrWhiteSpace(m)))
            : null;

        DateTime requestTime;
        if (!DateTime.TryParse(dto.RequestTime, out requestTime))
            requestTime = DateTime.Now;

        DateTime validFrom = requestTime;
        DateTime validUntil = validFrom.AddHours(4);

        var result = await _repository.InsertGuestPassAsync(
            bedNo: patient?.RoomBed ?? patient?.Bed ?? "",
            patientId: patient?.PatientId,
            patientName: patient?.PatientName ?? dto.VisitingPatient ?? "",
            roomBed: patient?.RoomBed ?? "",
            guestName: dto.GuestName,
            guestPhone: dto.GuestPhone,
            additionalMembers: membersCsv,
            passCode: passCode,
            qrToken: qrToken,
            qrTokenHash: qrTokenHash,
            requestTime: requestTime,
            validFrom: validFrom,
            validUntil: validUntil,
            createdBy: patient?.PatientId);

        if (!result.Success)
            return result;

        string smsUrl = $"{viewBaseUrl}?token={Uri.EscapeDataString(qrToken)}";

        string smsMessage =
            $"Your visitor pass is ready. Pass Code: {passCode}. " +
            $"View your pass: {smsUrl}";

        try
        {
            string smsResponse = await _smsService.SendSmsAsync(dto.GuestPhone, smsMessage);
            await _repository.UpdateGuestPassSmsStatusAsync(result.GuestPassId, true, smsResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMS sending failed for GuestPassId={Id}", result.GuestPassId);
            await _repository.UpdateGuestPassSmsStatusAsync(result.GuestPassId, false, ex.Message);
        }

        return result;
    }

    public Task<bool> UpdateGuestPassDecisionAsync(int guestPassId, string process)
        => _repository.UpdateGuestPassDecisionAsync(guestPassId, process);

    public async Task<GuestPassSuccessVM> GetGuestPassSuccessAsync(int guestPassId)
    {
        var entity = await _repository.GetGuestPassByIdAsync(guestPassId);
        if (entity == null) return null;

        return GuestPassSuccessVM.FromEntity(entity);
    }

    public async Task<GuestPassMaster> GetGuestPassByQrTokenAsync(string qrToken)
    {
        if (string.IsNullOrWhiteSpace(qrToken)) return null;

        string hash = Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(qrToken)));

        return await _repository.GetGuestPassByQrTokenHashAsync(hash);
    }

    public async Task<string> GetGuestPassVerificationStatusAsync(string qrToken)
    {
        var pass = await GetGuestPassByQrTokenAsync(qrToken);
        if (pass == null) return "INVALID";

        var now = DateTime.Now;

        if (pass.IsRevoked) return "REVOKED";
        if (pass.IsUsed) return "ALREADY USED";
        if (now < pass.ValidFrom) return "NOT YET VALID";
        if (now >= pass.ValidUntil) return "EXPIRED";

        return "VALID";
    }
    public async Task<LatestVideoTask> GetLatestVideoTaskByBed(string bedNo)
    {
        if (string.IsNullOrWhiteSpace(bedNo))
            return null;

        if (_repository == null)
            return null;

        var sinceDate = DateTime.Now.AddMinutes(-2);
        return await _repository.GetLatestVideoTaskByBed(bedNo, sinceDate);
    }

    public async Task<LoginPatientResult> LoginByRoomNoAsync(string roomNo)
    {
        if (string.IsNullOrWhiteSpace(roomNo))
            return null;

        return await _repository.LoginByRoomNoAsync(roomNo);
    }
}