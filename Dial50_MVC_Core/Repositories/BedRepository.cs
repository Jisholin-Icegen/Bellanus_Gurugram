
//using Azure.Core;
using Dial50_MVC_Core.Controllers;
using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System.Data;
using System.Globalization;
using System.Reflection;
using System.Reflection.Metadata;
using System.Text.Json;

public class BedRepository : IBedRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BedRepository> _logger;
    private readonly IConfiguration _configuration;
    private readonly ILogService _logService;

    public BedRepository(IConfiguration configuration, ApplicationDbContext context, ILogger<BedRepository> logger, ILogService logService)
    {
        _configuration = configuration;
        _context = context;
        _logger = logger;
        _logService = logService;
    }

    public async Task<List<BedInfo>> GetBedInfo(string? _BedNo)
    {
        var result = new List<BedInfo>();
        try
        {
            string _process = "WITHHOSPITALINFO";

            _BedNo = (string.IsNullOrEmpty(_BedNo) ? string.Empty : _BedNo);
            _logger.LogInformation("Fetching BedInfos from database. BedNo :- {BedNo}", _BedNo);
            result = await _context.BedInfos
                                .FromSql($"EXEC SP_GETPATIENTINFO  @BEDID={_BedNo}, @PROCESS={_process}")
                                .ToListAsync();
            _logger.LogInformation("Successfully fetched {Count} records.", result.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while executing stored procedure GetHospitalInfos.");
            await _logService.LogAsync(ex.Message, "SP_GETPATIENTINFO");
        }

        return result;
    }

    public async Task<List<TaskRequests>> GetTasks(string? BedID, string? BedNumber, string? _Token)
    {
        var result = new List<TaskRequests>();

        try
        {
            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand("SP_GETTASKS_QR", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@Bedid", BedID ?? "");
            cmd.Parameters.AddWithValue("@BedNumber", BedNumber ?? "");
            cmd.Parameters.AddWithValue("@TOKEN", _Token ?? "");
            await con.OpenAsync();

            using SqlDataReader reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var task = new TaskRequests
                {
                    TaskId = reader["TaskId"] != DBNull.Value ? reader["TaskId"].ToString() : "",
                    FromRoom = reader["FromRoom"] != DBNull.Value ? reader["FromRoom"].ToString() : "",
                    TaskName = reader["TaskName"] != DBNull.Value ? reader["TaskName"].ToString() : "",
                    PorterName = reader["PorterName"] != DBNull.Value ? reader["PorterName"].ToString() : "",
                    Status = reader["Status"] != DBNull.Value ? reader["Status"].ToString() : "",
                    RequestDate = reader["RequestDate"] != DBNull.Value
                        ? Convert.ToDateTime(reader["RequestDate"], CultureInfo.InvariantCulture)
                        : (DateTime?)null,
                    Service = reader["Service"] != DBNull.Value ? reader["Service"].ToString() : null 
                };
                result.Add(task);
            }

            _logger.LogInformation("Successfully fetched {Count} records.", result.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error occurred while fetching Request details for the bed: {BedID}",
                BedID);

            await _logService.LogAsync(ex.Message, "SP_GETTASKS_QR");
        }

        return result;
    }

    public async Task<int> InsertRoomComfortRequest(string bedNo, string category, string quantity, string remarks, string gender, string userId)
    {
        var connectionString = _configuration.GetConnectionString("Dial50");

        using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();

        string categoryName = category;
        if (int.TryParse(category, out _))
        {
            using (var lookup = new SqlCommand("SELECT TOP 1 CategoryName FROM CategoryMaster WHERE Id = @Id", conn))
            {
                lookup.Parameters.AddWithValue("@Id", category);
                var res = await lookup.ExecuteScalarAsync();
                if (res != null && res != DBNull.Value)
                    categoryName = res.ToString();
            }
        }

        _logger.LogInformation("sp_InsertTaskRequest_Service → BedNo={BedNo}, CategoryId={CatId}, CategoryName={CatName}",
            bedNo, category, categoryName);

        using var cmd = new SqlCommand("sp_InsertTaskRequest_Service", conn)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };

        cmd.Parameters.AddWithValue("@FromLocation", bedNo ?? "");
        cmd.Parameters.AddWithValue("@ToLocation", bedNo ?? "");
        cmd.Parameters.AddWithValue("@ConversationId", "");
        cmd.Parameters.AddWithValue("@Gender", gender ?? "");
        cmd.Parameters.AddWithValue("@Category", categoryName ?? "");
        cmd.Parameters.AddWithValue("@Quantity", quantity ?? "1");
        cmd.Parameters.AddWithValue("@Remarks", remarks ?? "");
        cmd.Parameters.AddWithValue("@PORTERID", "");
        cmd.Parameters.AddWithValue("@UserId", userId ?? "");
        cmd.Parameters.AddWithValue("@Language", DBNull.Value);

        using var reader = await cmd.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            var requestNo = reader["RequestNo"]?.ToString() ?? "";
            var result = reader.FieldCount > 1 ? reader["Result"]?.ToString() : "";

            _logger.LogInformation("sp_InsertTaskRequest_Service → RequestNo={RequestNo}, Result={Result}", requestNo, result);

            if (int.TryParse(requestNo, out var id))
                return id;
        }

        return 0;
    }

    public async Task<List<TaskRequests>> GetTaskDetailsByID(string? RequestID)
    {
        var result = new List<TaskRequests>();
        try
        {
            _logger.LogInformation($"Fetching Task Details. RequestID={RequestID}");
            result = await _context.TaskRequests
                                .FromSql($"EXEC [SP_GETTASKS_QR]  @REQUESTID={(string.IsNullOrEmpty(RequestID) ? string.Empty : RequestID)}")
                                .ToListAsync();
            _logger.LogInformation("Successfully fetched {Count} records.", result.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while fetching Request details. RequestID={RequestID}");
            await _logService.LogAsync(ex.Message, "SP_GETTASKS_QR");
        }

        return result;
    }

    public async Task<List<TaskResponse>> InsertTask(TaskRequest _taskRequest, string? _Token)
    {
        var result = new List<TaskResponse>();
        try
        {
            _logger.LogInformation($"Inserting Task Details. BEDID={_taskRequest.BedID}, CATEGORYID={_taskRequest.CategoryId}, QUANTITY={_taskRequest.quantity}, REMARKS={_taskRequest.Remarks}, TOKEN={_Token}");
            result = await _context.TaskResponse
                                .FromSql($"EXEC [SP_INSERTREQUEST_QR]  @BEDID={_taskRequest.BedID}, @CATEGORYID={_taskRequest.CategoryId}, @QUANTITY={_taskRequest.quantity}, @REMARKS={_taskRequest.Remarks}, @TOKEN={_Token}")
                                .ToListAsync();
            _logger.LogInformation("Successfully fetched {Count} records.", result.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while Inserting service Request.");
            await _logService.LogAsync(ex.Message, "SP_INSERTREQUEST_QR");
        }

        return result;
    }

    public async Task<List<BedInfo>> updateBedDetails(PatientResponse _patientResponse, string? _BedIDdial50, string? _bedIDHIS, string? _bedHIS, string? _Token)
    {
        string _process = (_patientResponse.status == false) ? ((_patientResponse.message == "ENDSESSION") ? "ENDSESSION" : "GETWITHHOSPITALINFO") : "UPDATEANDGETWITHHOSPITALINFO";
        var result = new List<BedInfo>();
        try
        {
            _BedIDdial50 = (string.IsNullOrEmpty(_BedIDdial50) ? string.Empty : _BedIDdial50);
            _bedIDHIS = (string.IsNullOrEmpty(_bedIDHIS) ? string.Empty : _bedIDHIS);
            _bedHIS = (string.IsNullOrEmpty(_bedHIS) ? string.Empty : _bedHIS);
            _Token = (string.IsNullOrEmpty(_Token) ? string.Empty : _Token);

            PatientData patientData = (_patientResponse.data == null) ? new PatientData() { PatientName = string.Empty, Gender = string.Empty, Age = string.Empty, UHID = string.Empty } : _patientResponse.data;

            _logger.LogInformation($"Update & Fetching BedInfos from database. _BedIDdial50 :- {_BedIDdial50},BedNo :- {_bedIDHIS},");
            result = await _context.BedInfos
                                .FromSql($"EXEC SP_GETPATIENTINFO  @DIAL50BEDID={_BedIDdial50},@BEDIDHIS={_bedIDHIS},@BEDHIS={_bedHIS},@UHID={patientData.UHID},@PATIENTNAME={patientData.PatientName},@GENDER={patientData.Gender},@AGE={patientData.Age}, @PROCESS={_process}, @TOKEN={_Token}")
                                .ToListAsync();
            _logger.LogInformation("Successfully fetched {Count} records.", result.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while executing stored procedure GetHospitalInfos.");
            await _logService.LogAsync(ex.Message, "SP_GETPATIENTINFO" + "_" + _process);
        }

        return result;
    }

    public async Task<List<TrackResponseInfo>> GetTrackInfo(TrackReqInfo porterReqInfo)
    {
        var result = new List<TrackResponseInfo>();
        try
        {
            _logger.LogInformation("Fetching Porter/Request Details. RequestID={0},  PorterID={0}", porterReqInfo.RequestID, porterReqInfo.PorterID);
            result = await _context.TrackInfo
                                .FromSql($"EXEC [SP_GetTrackingInfo_QR]  @porterid={porterReqInfo.PorterID}, @requestid={porterReqInfo.RequestID}")
                                .ToListAsync();
            _logger.LogInformation("Successfully fetched {Count} records.", result.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while fetching Request details.@porterid={porterReqInfo.PorterID}, @requestid={porterReqInfo.RequestID}");
            await _logService.LogAsync(ex.Message, "SP_GetTrackingInfo_QR");
        }

        return result;
    }

    public async Task<List<TrackResponseInfo>> GetTrackInfoByOrderIds(TrackReqInfoByOrderIds porterReqInfo)
    {
        var result = new List<TrackResponseInfo>();
        try
        {
            string orderIds = porterReqInfo.OrderIds?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(orderIds))
            {
                _logger.LogWarning("GetTrackInfoByOrderIds called with empty OrderIds.");
                return result;
            }

            _logger.LogInformation("Fetching tracking information for OrderIds: {OrderIds}", orderIds);

            await using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            await using SqlCommand cmd = new SqlCommand("SP_GET_TRACKING_REQUEST_BY_ORDERIDS", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add("@OrderIds", SqlDbType.VarChar, -1).Value = orderIds;

            await con.OpenAsync();
            await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var trackingRequest = new TrackResponseInfo
                {
                    RequestNo = reader["RequestNo"] == DBNull.Value ? "" : reader["RequestNo"].ToString(),
                    PorterName = reader["PorterName"] == DBNull.Value ? null : reader["PorterName"].ToString(),
                    PorterId = reader["PorterId"] == DBNull.Value ? null : Convert.ToInt32(reader["PorterId"]),
                    SUBPorterName = reader["SUBPorterName"] == DBNull.Value ? null : reader["SUBPorterName"].ToString(),
                    SUBPorterId = reader["SUBPorterId"] == DBNull.Value ? null : Convert.ToInt32(reader["SUBPorterId"]),
                    PorterImage = reader["PorterImage"] == DBNull.Value ? null : reader["PorterImage"].ToString(),
                    SUBPorterImage = reader["SUBPorterImage"] == DBNull.Value ? null : reader["SUBPorterImage"].ToString(),
                    RequestStatus = reader["RequestStatus"] == DBNull.Value ? null : reader["RequestStatus"].ToString(),
                    RequestStatusId = reader["RequestStatusId"] == DBNull.Value ? null : reader["RequestStatusId"].ToString(),
                    FROM = reader["FROM"] == DBNull.Value ? null : reader["FROM"].ToString(),
                    TO = reader["TO"] == DBNull.Value ? null : reader["TO"].ToString(),
                    CategoryName = reader["CategoryName"] == DBNull.Value ? null : reader["CategoryName"].ToString(),
                    CategoryDescription = reader["CategoryDescription"] == DBNull.Value ? null : reader["CategoryDescription"].ToString(),
                    RequestDate = reader["RequestDate"] == DBNull.Value ? null : Convert.ToDateTime(reader["RequestDate"]),
                    Eta = reader["Eta"] == DBNull.Value ? null : reader["Eta"].ToString(),
                    TaskTypeId = reader["TaskTypeId"] == DBNull.Value ? null : reader["TaskTypeId"].ToString(),
                    rating = reader["rating"] == DBNull.Value ? null : Convert.ToInt32(reader["rating"]),
                    ID = reader["ID"] == DBNull.Value ? null : Convert.ToInt32(reader["ID"]),
                    PATIENTID = reader["PATIENTID"] == DBNull.Value ? null : Convert.ToInt32(reader["PATIENTID"]),
                    ITEMID = reader["ITEMID"] == DBNull.Value ? null : Convert.ToInt32(reader["ITEMID"]),
                    ITEMNAME = reader["ITEMNAME"] == DBNull.Value ? null : reader["ITEMNAME"].ToString(),
                    ITEMDESC = reader["ITEMDESC"] == DBNull.Value ? null : reader["ITEMDESC"].ToString(),
                    QUANTITY = reader["QUANTITY"] == DBNull.Value ? null : Convert.ToInt32(reader["QUANTITY"]),
                    ORDERTYPE = reader["ORDERTYPE"] == DBNull.Value ? null : reader["ORDERTYPE"].ToString(),
                    MEALTYPE = reader["MEALTYPE"] == DBNull.Value ? null : reader["MEALTYPE"].ToString(),
                    SPECIALINSTRUCTION = reader["SPECIALINSTRUCTION"] == DBNull.Value ? null : reader["SPECIALINSTRUCTION"].ToString(),
                    ORDERBY = reader["ORDERBY"] == DBNull.Value ? null : reader["ORDERBY"].ToString(),
                    ORDERDATE = reader["ORDERDATE"] == DBNull.Value ? null : Convert.ToDateTime(reader["ORDERDATE"]),
                    CREATEDON = reader["CREATEDON"] == DBNull.Value ? null : Convert.ToDateTime(reader["CREATEDON"]),
                    ISPREORDER = reader["ISPREORDER"] == DBNull.Value ? null : Convert.ToInt32(reader["ISPREORDER"]),
                    ISAUTO = reader["ISAUTO"] == DBNull.Value ? null : Convert.ToInt32(reader["ISAUTO"]),
                    STATUS = reader["STATUS"] == DBNull.Value ? null : reader["STATUS"].ToString(),
                    ESTIMATED_TIME = reader["ESTIMATED_TIME"] == DBNull.Value ? null : reader["ESTIMATED_TIME"].ToString(),
                    CUSTOMER_NAME = reader["CUSTOMER_NAME"] == DBNull.Value ? null : reader["CUSTOMER_NAME"].ToString(),
                    TrackingPorterId = reader["TrackingPorterId"] == DBNull.Value ? null : reader["TrackingPorterId"].ToString(),
                    ETA_Display = reader["ETA_Display"] == DBNull.Value ? null : reader["ETA_Display"].ToString(),
                    HHMM = reader["HHMM"] == DBNull.Value ? null : reader["HHMM"].ToString(),
                    DeviceId = reader["DeviceId"] == DBNull.Value ? null : reader["DeviceId"].ToString(),
                    LastUpdatedTime = reader["LastUpdatedTime"] == DBNull.Value ? null : Convert.ToDateTime(reader["LastUpdatedTime"]),
                    Xaxis = reader["Xaxis"] == DBNull.Value ? null : reader["Xaxis"].ToString(),
                    Yaxis = reader["Yaxis"] == DBNull.Value ? null : reader["Yaxis"].ToString(),
                    FloorId = reader["FloorId"] == DBNull.Value ? null : Convert.ToInt32(reader["FloorId"]),
                    FloorName = reader["FloorName"] == DBNull.Value ? null : reader["FloorName"].ToString(),
                    Location = reader["Location"] == DBNull.Value ? null : reader["Location"].ToString()
                };

                result.Add(trackingRequest);
            }

            _logger.LogInformation("Successfully fetched {Count} tracking records for OrderIds={OrderIds}", result.Count, orderIds);
        }
        catch (SqlException sqlEx)
        {
            _logger.LogError(sqlEx, "SQL Error in GetTrackInfoByOrderIds. OrderIds={OrderIds}", porterReqInfo.OrderIds);
            await _logService.LogAsync($"SQL Error: {sqlEx.Message}", "SP_GET_TRACKING_REQUEST_BY_ORDERIDS");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetTrackInfoByOrderIds. OrderIds={OrderIds}", porterReqInfo.OrderIds);
            await _logService.LogAsync(ex.Message, "SP_GET_TRACKING_REQUEST_BY_ORDERIDS");
        }

        return result;
    }

    public async Task<object> GetPatientInfo(string roomNo)
    {
        try
        {
            var patient = new { RoomNo = roomNo, PatientName = "", BedNo = "" };
            return patient;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetPatientInfo");
            await _logService.LogAsync(ex.Message, "GetPatientInfo");
            return null;
        }
    }

    public async Task<List<TaskFBResponse>> submitFeedback(TaskFBReq taskFBReq)
    {
        var result = new List<TaskFBResponse>();
        try
        {
            _logger.LogInformation("Updating FeedBack Details. RequestID={0},  PorterID={0}", taskFBReq.RequestID, taskFBReq.Rating);
            result = await _context.FeedBckInfo
                                .FromSql($"EXEC [SP_REQUEST_FEEDBACK]  @RequestId={taskFBReq.RequestID}, @Rating={taskFBReq.Rating}, @Remarks={taskFBReq.Remarks}")
                                .ToListAsync();
            _logger.LogInformation("Successfully fetched {Count} records.", result.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Updating FeedBack Details. .  @RequestId={taskFBReq.RequestID}, @Rating={taskFBReq.Rating}, @Remarks={taskFBReq.Remarks}");
            await _logService.LogAsync(ex.Message, "SP_REQUEST_FEEDBACK");
        }

        return result;
    }

    public async Task<TrackingRequestModel> GetTrackingRequest(string? roomNo, string? requestId = null)
    {
        var trackingRequest = new TrackingRequestModel();
        var isFound = false;

        try
        {
            roomNo = roomNo?.Trim() ?? string.Empty;

            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand("SP_GET_TRACKING_REQUEST", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@RoomNo", roomNo);
            cmd.Parameters.AddWithValue("@RequestId", (object)requestId ?? DBNull.Value);

            await con.OpenAsync();
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                isFound = true;

                trackingRequest.RequestNo = reader["RequestNo"]?.ToString() ?? "";
                trackingRequest.PorterName = reader["PorterName"] == DBNull.Value ? null : reader["PorterName"].ToString();
                trackingRequest.PorterId = reader["PorterId"] == DBNull.Value ? null : Convert.ToInt32(reader["PorterId"]);
                trackingRequest.SUBPorterName = reader["SUBPorterName"] == DBNull.Value ? null : reader["SUBPorterName"].ToString();
                trackingRequest.SUBPorterId = reader["SUBPorterId"] == DBNull.Value ? null : Convert.ToInt32(reader["SUBPorterId"]);
                trackingRequest.PorterImage = reader["PorterImage"] == DBNull.Value ? null : reader["PorterImage"].ToString();
                trackingRequest.SUBPorterImage = reader["SUBPorterImage"] == DBNull.Value ? null : reader["SUBPorterImage"].ToString();
                trackingRequest.RequestStatus = reader["RequestStatus"] == DBNull.Value ? null : reader["RequestStatus"].ToString();
                trackingRequest.RequestStatusId = reader["RequestStatusId"] == DBNull.Value ? null : reader["RequestStatusId"].ToString();
                trackingRequest.FROM = reader["FROM"] == DBNull.Value ? null : reader["FROM"].ToString();
                trackingRequest.TO = reader["TO"] == DBNull.Value ? null : reader["TO"].ToString();
                trackingRequest.CategoryName = reader["CategoryName"] == DBNull.Value ? null : reader["CategoryName"].ToString();
                trackingRequest.CategoryDescription = reader["CategoryDescription"] == DBNull.Value ? null : reader["CategoryDescription"].ToString();
                trackingRequest.RequestDate = reader["RequestDate"] == DBNull.Value ? null : Convert.ToDateTime(reader["RequestDate"]);
                trackingRequest.Eta = reader["Eta"] == DBNull.Value ? null : reader["Eta"].ToString();
                trackingRequest.TaskTypeId = reader["TaskTypeId"] == DBNull.Value ? null : reader["TaskTypeId"].ToString();
                trackingRequest.rating = reader["Rating"] == DBNull.Value ? null : Convert.ToInt32(reader["Rating"]);
                trackingRequest.ID = reader["ID"] == DBNull.Value ? null : Convert.ToInt32(reader["ID"]);
                trackingRequest.PATIENTID = reader["PATIENTID"] == DBNull.Value ? null : Convert.ToInt32(reader["PATIENTID"]);
                trackingRequest.ITEMID = reader["ITEMID"] == DBNull.Value ? null : Convert.ToInt32(reader["ITEMID"]);
                trackingRequest.ITEMNAME = reader["ITEMNAME"] == DBNull.Value ? null : reader["ITEMNAME"].ToString();
                trackingRequest.ITEMDESC = reader["ITEMDESC"] == DBNull.Value ? null : reader["ITEMDESC"].ToString();
                trackingRequest.QUANTITY = reader["QUANTITY"] == DBNull.Value ? null : Convert.ToInt32(reader["QUANTITY"]);
                trackingRequest.ORDERTYPE = reader["ORDERTYPE"] == DBNull.Value ? null : reader["ORDERTYPE"].ToString();
                trackingRequest.MEALTYPE = reader["MEALTYPE"] == DBNull.Value ? null : reader["MEALTYPE"].ToString();
                trackingRequest.SPECIALINSTRUCTION = reader["SPECIALINSTRUCTION"] == DBNull.Value ? null : reader["SPECIALINSTRUCTION"].ToString();
                trackingRequest.ORDERBY = reader["ORDERBY"] == DBNull.Value ? null : reader["ORDERBY"].ToString();
                trackingRequest.ORDERDATE = reader["ORDERDATE"] == DBNull.Value ? null : Convert.ToDateTime(reader["ORDERDATE"]);
                trackingRequest.CREATEDON = reader["CREATEDON"] == DBNull.Value ? null : Convert.ToDateTime(reader["CREATEDON"]);
                trackingRequest.ISPREORDER = reader["ISPREORDER"] == DBNull.Value ? null : Convert.ToInt32(reader["ISPREORDER"]);
                trackingRequest.ISAUTO = reader["ISAUTO"] == DBNull.Value ? null : Convert.ToInt32(reader["ISAUTO"]);
                trackingRequest.STATUS = reader["STATUS"] == DBNull.Value ? null : reader["STATUS"].ToString();
                trackingRequest.ESTIMATED_TIME = reader["ESTIMATED_TIME"] == DBNull.Value ? null : reader["ESTIMATED_TIME"].ToString();
                trackingRequest.CUSTOMER_NAME = reader["CUSTOMER_NAME"] == DBNull.Value ? null : reader["CUSTOMER_NAME"].ToString();
                trackingRequest.TrackingPorterId = reader["TrackingPorterId"] == DBNull.Value ? null : reader["TrackingPorterId"].ToString();
                trackingRequest.ETA_Display = reader["ETA_Display"] == DBNull.Value ? null : reader["ETA_Display"].ToString();
                trackingRequest.HHMM = reader["HHMM"] == DBNull.Value ? null : reader["HHMM"].ToString();
                trackingRequest.DeviceId = reader["DeviceId"] == DBNull.Value ? null : reader["DeviceId"].ToString();
                trackingRequest.LastUpdatedTime = reader["LastUpdatedTime"] == DBNull.Value ? null : Convert.ToDateTime(reader["LastUpdatedTime"]);
                trackingRequest.Xaxis = reader["Xaxis"] == DBNull.Value ? null : reader["Xaxis"].ToString();
                trackingRequest.Yaxis = reader["Yaxis"] == DBNull.Value ? null : reader["Yaxis"].ToString();
                trackingRequest.FloorId = reader["FloorId"] == DBNull.Value ? null : Convert.ToInt32(reader["FloorId"]);
                trackingRequest.FloorName = reader["FloorName"] == DBNull.Value ? null : reader["FloorName"].ToString();
                trackingRequest.Location = reader["Location"] == DBNull.Value ? null : reader["Location"].ToString();

                _logger.LogInformation($"Found tracking info for RoomNo: '{roomNo}', RequestNo: {trackingRequest.RequestNo}");
            }
            else
            {
                _logger.LogWarning($"No tracking information found for RoomNo: '{roomNo}'");
            }
        }
        catch (SqlException sqlEx)
        {
            _logger.LogError(sqlEx, "SQL Error in GetTrackingRequest. RoomNo={RoomNo}", roomNo);
            await _logService.LogAsync($"SQL Error: {sqlEx.Message}", "SP_GET_TRACKING_REQUEST");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetTrackingRequest. RoomNo={RoomNo}", roomNo);
            await _logService.LogAsync(ex.Message, "SP_GET_TRACKING_REQUEST");
        }

        trackingRequest.IsFound = isFound;
        return trackingRequest;
    }

    public async Task<List<ConversationQR>> ConversationProcess(ConvQRRequest convQRRequest)
    {
        var result = new List<ConversationQR>();
        try
        {
            _logger.LogInformation($"Processing Looc Conversation. ConversationID={convQRRequest.ConversationID},  BedID={convQRRequest.BedID}, Process={convQRRequest.Process}");
            result = await _context.ConversationInfo
                                .FromSql($"EXEC [SP_CONVERSATION_QR]  @ConversationID={convQRRequest.ConversationID}, @BedID={convQRRequest.BedID}, @PROCESS={convQRRequest.Process}")
                                .ToListAsync();
            _logger.LogInformation("Successfully fetched {Count} records.", result.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error Processing Looc Conversation. ConversationID={convQRRequest.ConversationID},  BedID={convQRRequest.BedID}, Process={convQRRequest.Process}");
            await _logService.LogAsync(ex.Message, "SP_CONVERSATION_QR");
        }

        return result;
    }

    public async Task<object> SubmitDischargeFeedback(DischargeFeedbackRequest feedbackRequest)
    {
        try
        {
            if (feedbackRequest == null || string.IsNullOrEmpty(feedbackRequest.ReferenceNo))
            {
                return new { success = false, message = "Invalid feedback data" };
            }

            if (feedbackRequest.FeedbackData == null || feedbackRequest.FeedbackData.Questions == null || feedbackRequest.FeedbackData.Questions.Count == 0)
            {
                return new { success = false, message = "No feedback questions found" };
            }

            string referenceNo = feedbackRequest.ReferenceNo;
            string bedInfo = feedbackRequest.BedInfo ?? "";
            string uhid = feedbackRequest.UserId ?? "";
            string patientName = feedbackRequest.PatientName ?? "";
            string roomNo = feedbackRequest.RoomNo ?? "";
            string region = feedbackRequest.Region ?? "IN";

            var feedbackData = new
            {
                questions = feedbackRequest.FeedbackData.Questions,
                additionalComments = feedbackRequest.FeedbackData.AdditionalComments ?? "",
                submittedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss")
            };

            string jsonData = JsonSerializer.Serialize(feedbackData);

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_PATIENTFEEDBACK", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@PROCESS", "SAVE");
                    cmd.Parameters.AddWithValue("@REFERENCENO", referenceNo);
                    cmd.Parameters.AddWithValue("@BEDNO", bedInfo);
                    cmd.Parameters.AddWithValue("@UHID", uhid);
                    cmd.Parameters.AddWithValue("@PATIENTNAME", patientName);
                    cmd.Parameters.AddWithValue("@ROOMNO", roomNo);
                    cmd.Parameters.AddWithValue("@REGION", region);
                    cmd.Parameters.AddWithValue("@FEEDBACKDATA", jsonData);

                    await cmd.ExecuteNonQueryAsync();
                }
            }

            return new
            {
                success = true,
                referenceNo = referenceNo,
                message = "Feedback submitted successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SubmitDischargeFeedback");
            await _logService.LogAsync(ex.Message, "SP_PATIENTFEEDBACK_SAVE");
            return new
            {
                success = false,
                message = ex.Message
            };
        }
    }

    public async Task<List<AIFeedbackInfo>> GetLatestFeedback(string bedNo)
    {
        var result = new List<AIFeedbackInfo>();

        try
        {
            using (SqlConnection conn = new SqlConnection(
                _configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();

                string query = @"
                EXEC [dbo].[SP_sessionFeedback]
                    @PROCESS = @PROCESS,
                    @BEDNO = @BEDNO";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.Add("@PROCESS", SqlDbType.VarChar, 20)
                        .Value = "GETLATEST";

                    cmd.Parameters.Add("@BEDNO", SqlDbType.VarChar, 50)
                        .Value = bedNo;

                    using (SqlDataReader reader =
                        await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(new AIFeedbackInfo
                            {
                                FeedbackId =
                                    Convert.ToInt64(reader["FEEDBACKID"]),

                                ReferenceNo =
                                    reader["REFERENCENO"]?.ToString(),

                                BedNo =
                                    reader["BEDNO"]?.ToString(),

                                SessionId =
                                    reader["SESSION_ID"]?.ToString(),

                                Uhid =
                                    reader["UHID"]?.ToString(),

                                PatientName =
                                    reader["PATIENTNAME"]?.ToString(),

                                RoomNo =
                                    reader["ROOMNO"]?.ToString(),

                                Region =
                                    reader["REGION"]?.ToString(),

                                FeedbackData =
                                    reader["FEEDBACKDATA"]?.ToString(),

                                CreatedDate =
                                    reader["CREATEDDATE"] != DBNull.Value
                                        ? Convert.ToDateTime(
                                            reader["CREATEDDATE"])
                                        : DateTime.MinValue,

                                IsCompleted =
                                    reader["ISCOMPLETED"] != DBNull.Value
                                        && Convert.ToBoolean(
                                            reader["ISCOMPLETED"]),

                                IsSubmit =
                                    reader["ISSUBMIT"] != DBNull.Value
                                        ? Convert.ToInt32(
                                            reader["ISSUBMIT"])
                                        : 0
                            });
                        }
                    }
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error in GetLatestFeedback");

            await _logService.LogAsync(
                ex.Message,
                "GetLatestFeedback");

            return result;
        }
    }
    public async Task<AIFeedbackSubmitInfo> SubmitAIFeedback(long feedbackId)
    {
        var result = new AIFeedbackSubmitInfo();

        try
        {
            using (SqlConnection conn = new SqlConnection(
                _configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();

                string statusQuery = @"
                EXEC [dbo].[SP_sessionFeedback]
                    @PROCESS = @PROCESS,
                    @FEEDBACKID = @FEEDBACKID";

                using (SqlCommand cmd = new SqlCommand(statusQuery, conn))
                {
                    cmd.Parameters.Add("@PROCESS", SqlDbType.VarChar, 20)
                        .Value = "STATUSUPDATE";

                    cmd.Parameters.Add("@FEEDBACKID", SqlDbType.BigInt)
                        .Value = feedbackId;

                    await cmd.ExecuteNonQueryAsync();
                }
            }

            result.Success = true;
            result.Message = "Feedback submitted successfully";

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SubmitAIFeedback");

            await _logService.LogAsync(ex.Message, "SubmitAIFeedback");

            result.Success = false;
            result.Message = ex.Message;

            return result;
        }
    }
    public async Task<List<DischargeDepartmentInfo>> GetActiveDepartments(string roomNo = null, string bedNo = null)
    {
        var result = new List<DischargeDepartmentInfo>();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();

                string query = @"EXEC [dbo].[SP_PATIENTFEEDBACK]
                                @PROCESS = @PROCESS,
                                @ROOMNO  = @ROOMNO,
                                @BEDNO   = @BEDNO";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.Add("@PROCESS", SqlDbType.VarChar, 20).Value = "GETDEPARTMENT";
                    cmd.Parameters.Add("@ROOMNO", SqlDbType.VarChar, 50).Value = (object)roomNo ?? DBNull.Value;
                    cmd.Parameters.Add("@BEDNO", SqlDbType.VarChar, 50).Value = (object)bedNo ?? DBNull.Value;

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(new DischargeDepartmentInfo
                            {
                                DepartmentId = Convert.ToInt32(reader["DEPARTMENTID"]),
                                DepartmentName = reader["DEPARTMENTNAME"].ToString(),
                                IsActive = Convert.ToBoolean(reader["ISACTIVE"]),
                                ServiceId = reader["ServiceId"] != DBNull.Value
                                                    ? Convert.ToInt32(reader["ServiceId"])
                                                    : (int?)null,
                                Description = reader["DESCRIPTION"]?.ToString(),
                                DepartmentKey = reader["DEPARTMENTKEY"]?.ToString()
                            });
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetActiveDepartments");
            await _logService.LogAsync(ex.Message, "GetActiveDepartments");
            return result;
        }
    }

    public async Task<DischargeFeedbackInfo> GetFeedbackByReference(string referenceNo)
    {
        var result = new DischargeFeedbackInfo();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_PATIENTFEEDBACK", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PROCESS", "GETBYREFERENCE");
                    cmd.Parameters.AddWithValue("@REFERENCENO", referenceNo);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            result = new DischargeFeedbackInfo
                            {
                                FeedbackId = Convert.ToInt64(reader["FEEDBACKID"]),
                                ReferenceNo = reader["REFERENCENO"].ToString(),
                                BedNo = reader["BEDNO"]?.ToString(),
                                Uhid = reader["UHID"]?.ToString(),
                                PatientName = reader["PATIENTNAME"]?.ToString(),
                                RoomNo = reader["ROOMNO"]?.ToString(),
                                Region = reader["REGION"]?.ToString(),
                                FeedbackData = reader["FEEDBACKDATA"]?.ToString(),
                                CreatedDate = Convert.ToDateTime(reader["CREATEDDATE"]),
                                IsCompleted = Convert.ToBoolean(reader["ISCOMPLETED"])
                            };
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetFeedbackByReference");
            await _logService.LogAsync(ex.Message, "SP_PATIENTFEEDBACK_GETBYREFERENCE");
            return result;
        }
    }

    public async Task<List<DischargeFeedbackInfo>> GetFeedbackByBed(string bedNo)
    {
        var result = new List<DischargeFeedbackInfo>();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_PATIENTFEEDBACK", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PROCESS", "GETBYBED");
                    cmd.Parameters.AddWithValue("@BEDNO", bedNo);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(new DischargeFeedbackInfo
                            {
                                FeedbackId = Convert.ToInt64(reader["FEEDBACKID"]),
                                ReferenceNo = reader["REFERENCENO"].ToString(),
                                BedNo = reader["BEDNO"]?.ToString(),
                                Uhid = reader["UHID"]?.ToString(),
                                PatientName = reader["PATIENTNAME"]?.ToString(),
                                RoomNo = reader["ROOMNO"]?.ToString(),
                                Region = reader["REGION"]?.ToString(),
                                FeedbackData = reader["FEEDBACKDATA"]?.ToString(),
                                CreatedDate = Convert.ToDateTime(reader["CREATEDDATE"]),
                                IsCompleted = Convert.ToBoolean(reader["ISCOMPLETED"])
                            });
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetFeedbackByBed");
            await _logService.LogAsync(ex.Message, "SP_PATIENTFEEDBACK_GETBYBED");
            return result;
        }
    }
    public async Task<AIFeedbackSubmitInfo> CancelAIFeedback(long feedbackId)
    {
        var result = new AIFeedbackSubmitInfo();

        try
        {
            using (SqlConnection conn = new SqlConnection(
                _configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();

                string query = @"
                EXEC [dbo].[SP_sessionFeedback]
                    @PROCESS = @PROCESS,
                    @FEEDBACKID = @FEEDBACKID";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.Add(
     "@PROCESS",
     SqlDbType.VarChar,
     20).Value = "CANCELLED";

                    cmd.Parameters.Add(
                        "@FEEDBACKID",
                        SqlDbType.BigInt).Value = feedbackId;

                    await cmd.ExecuteNonQueryAsync();
                }
            }

            result.Success = true;
            result.Message = "Feedback cancelled successfully";

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error in CancelAIFeedback. FeedbackId: {FeedbackId}",
                feedbackId);

            await _logService.LogAsync(
                ex.ToString(),
                "CancelAIFeedback");

            result.Success = false;

            // TEMPORARY: show the actual SQL error
            result.Message = ex.Message;

            return result;
        }
    }
    public async Task<List<DischargeFeedbackSummaryInfo>> GetFeedbackSummary(DateTime? startDate, DateTime? endDate)
    {
        var result = new List<DischargeFeedbackSummaryInfo>();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_PATIENTFEEDBACK", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PROCESS", "GETSUMMARY");
                    cmd.Parameters.AddWithValue("@STARTDATE", startDate ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@ENDDATE", endDate ?? (object)DBNull.Value);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(new DischargeFeedbackSummaryInfo
                            {
                                TotalFeedbacks = Convert.ToInt32(reader["TOTALFEEDBACKS"]),
                                UniquePatients = Convert.ToInt32(reader["UNIQUEPATIENTS"]),
                                CompletedFeedbacks = Convert.ToInt32(reader["COMPLETEDFEEDBACKS"]),
                                FeedbackDate = Convert.ToDateTime(reader["FEEDBACKDATE"])
                            });
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetFeedbackSummary");
            await _logService.LogAsync(ex.Message, "SP_PATIENTFEEDBACK_GETSUMMARY");
            return result;
        }
    }

    public async Task<List<DischargeDepartmentRatingInfo>> GetDepartmentRatings(string? referenceNo, string? bedNo)
    {
        var result = new List<DischargeDepartmentRatingInfo>();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_PATIENTFEEDBACK", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PROCESS", "GETDEPARTMENTRATINGS");
                    cmd.Parameters.AddWithValue("@REFERENCENO", referenceNo ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@BEDNO", bedNo ?? (object)DBNull.Value);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(new DischargeDepartmentRatingInfo
                            {
                                ReferenceNo = reader["REFERENCENO"].ToString(),
                                PatientName = reader["PATIENTNAME"].ToString(),
                                BedNo = reader["BEDNO"]?.ToString(),
                                RoomNo = reader["ROOMNO"]?.ToString(),
                                DepartmentId = reader["DEPARTMENTID"]?.ToString(),
                                DepartmentName = reader["DEPARTMENTNAME"]?.ToString(),
                                DepartmentKey = reader["DEPARTMENTKEY"]?.ToString(),
                                Rating = reader["RATING"]?.ToString(),
                                Remarks = reader["REMARKS"]?.ToString(),
                                CreatedDate = Convert.ToDateTime(reader["CREATEDDATE"])
                            });
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetDepartmentRatings");
            await _logService.LogAsync(ex.Message, "SP_PATIENTFEEDBACK_GETDEPARTMENTRATINGS");
            return result;
        }
    }

    public async Task<List<DischargeDepartmentRatingInfo>> GetUnsatisfiedDepartments(DateTime? startDate, DateTime? endDate, string? bedNo)
    {
        var result = new List<DischargeDepartmentRatingInfo>();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_PATIENTFEEDBACK", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PROCESS", "GETUNSATISFIED");
                    cmd.Parameters.AddWithValue("@STARTDATE", startDate ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@ENDDATE", endDate ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@BEDNO", bedNo ?? (object)DBNull.Value);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(new DischargeDepartmentRatingInfo
                            {
                                ReferenceNo = reader["REFERENCENO"].ToString(),
                                PatientName = reader["PATIENTNAME"].ToString(),
                                BedNo = reader["BEDNO"]?.ToString(),
                                RoomNo = reader["ROOMNO"]?.ToString(),
                                DepartmentId = reader["DEPARTMENTID"]?.ToString(),
                                DepartmentName = reader["DEPARTMENTNAME"]?.ToString(),
                                DepartmentKey = reader["DEPARTMENTKEY"]?.ToString(),
                                Rating = reader["RATING"]?.ToString(),
                                Remarks = reader["REMARKS"]?.ToString(),
                                CreatedDate = Convert.ToDateTime(reader["CREATEDDATE"])
                            });
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetUnsatisfiedDepartments");
            await _logService.LogAsync(ex.Message, "SP_PATIENTFEEDBACK_GETUNSATISFIED");
            return result;
        }
    }

    public async Task<List<DischargeDepartmentSummaryInfo>> GetDepartmentSummary(DateTime? startDate, DateTime? endDate, string? bedNo)
    {
        var result = new List<DischargeDepartmentSummaryInfo>();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_PATIENTFEEDBACK", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PROCESS", "GETDEPARTMENTSUMMARY");
                    cmd.Parameters.AddWithValue("@STARTDATE", startDate ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@ENDDATE", endDate ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@BEDNO", bedNo ?? (object)DBNull.Value);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(new DischargeDepartmentSummaryInfo
                            {
                                DepartmentId = reader["DEPARTMENTID"]?.ToString(),
                                DepartmentName = reader["DEPARTMENTNAME"]?.ToString(),
                                DepartmentKey = reader["DEPARTMENTKEY"]?.ToString(),
                                TotalRatings = Convert.ToInt32(reader["TOTALRATINGS"]),
                                Satisfied = Convert.ToInt32(reader["SATISFIED"]),
                                Neutral = Convert.ToInt32(reader["NEUTRAL"]),
                                Unsatisfied = Convert.ToInt32(reader["UNSATISFIED"]),
                                SatisfactionPercentage = reader["SATISFACTIONPERCENTAGE"] != DBNull.Value ? Convert.ToDecimal(reader["SATISFACTIONPERCENTAGE"]) : 0
                            });
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetDepartmentSummary");
            await _logService.LogAsync(ex.Message, "SP_PATIENTFEEDBACK_GETDEPARTMENTSUMMARY");
            return result;
        }
    }

    public async Task<SubmitRatingResult> SubmitRatingAsync(int requestId, int rating)
    {
        var result = new SubmitRatingResult();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_SUBMIT_RATING", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@RequestId", requestId);
                    cmd.Parameters.AddWithValue("@Rating", rating);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            result.Success = reader["Success"] != DBNull.Value
                                ? Convert.ToInt32(reader["Success"])
                                : 0;
                            result.Code = reader["Code"] as string ?? "";
                            result.Message = reader["Message"] as string ?? "";
                        }
                        else
                        {
                            result.Success = 0;
                            result.Code = "NO_RESULT";
                            result.Message = "Stored procedure returned no result.";
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SubmitRatingAsync");
            await _logService.LogAsync(ex.Message, "SP_SUBMIT_RATING");
            result.Success = 0;
            result.Code = "EXCEPTION";
            result.Message = ex.Message;
            return result;
        }
    }

    public async Task<List<DischargePatientSummaryInfo>> GetPatientSummary(DateTime? startDate, DateTime? endDate, string? bedNo, string? patientName)
    {
        var result = new List<DischargePatientSummaryInfo>();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_PATIENTFEEDBACK", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PROCESS", "GETPATIENTSUMMARY");
                    cmd.Parameters.AddWithValue("@STARTDATE", startDate ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@ENDDATE", endDate ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@BEDNO", bedNo ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@PATIENTNAME", patientName ?? (object)DBNull.Value);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(new DischargePatientSummaryInfo
                            {
                                BedNo = reader["BEDNO"]?.ToString(),
                                PatientName = reader["PATIENTNAME"]?.ToString(),
                                Uhid = reader["UHID"]?.ToString(),
                                RoomNo = reader["ROOMNO"]?.ToString(),
                                TotalFeedbacks = Convert.ToInt32(reader["TOTALFEEDBACKS"]),
                                LastFeedbackDate = Convert.ToDateTime(reader["LASTFEEDBACKDATE"]),
                                FirstFeedbackDate = Convert.ToDateTime(reader["FIRSTFEEDBACKDATE"])
                            });
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetPatientSummary");
            await _logService.LogAsync(ex.Message, "SP_PATIENTFEEDBACK_GETPATIENTSUMMARY");
            return result;
        }
    }

    public async Task<LatestVideoTask> GetLatestVideoTaskByBed(string bedNo, DateTime sinceDate)
    {
        LatestVideoTask result = null;
        try
        {
            if (string.IsNullOrWhiteSpace(bedNo))
            {
                _logger.LogWarning("GetLatestVideoTaskByBed called with empty BedNo.");
                return null;
            }

            _logger.LogInformation("Fetching latest video task for BedNo: {BedNo}, SinceDate: {SinceDate}", bedNo, sinceDate);

            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand("sp_GetLatestVideoTaskByBed", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@BedNo", bedNo);
            cmd.Parameters.AddWithValue("@SinceDate", sinceDate);

            await con.OpenAsync();
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                result = new LatestVideoTask
                {
                    RequestId = reader["RequestId"] == DBNull.Value ? "" : reader["RequestId"].ToString(),
                    CategoryId = reader["CategoryId"] == DBNull.Value ? 0 : Convert.ToInt32(reader["CategoryId"]),
                    CategoryName = reader["CategoryName"] == DBNull.Value ? null : reader["CategoryName"].ToString(),
                    VideoLinks = reader["VideoLinks"] == DBNull.Value ? "" : reader["VideoLinks"].ToString()
                };

                _logger.LogInformation("Found video task. RequestId={RequestId}, CategoryName={CategoryName}", result.RequestId, result.CategoryName);
            }
            else
            {
                _logger.LogInformation("No video task found for BedNo: {BedNo}", bedNo);
            }
        }
        catch (SqlException sqlEx)
        {
            _logger.LogError(sqlEx, "SQL Error in GetLatestVideoTaskByBed. BedNo={BedNo}", bedNo);
            await _logService.LogAsync($"SQL Error: {sqlEx.Message}", "sp_GetLatestVideoTaskByBed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetLatestVideoTaskByBed. BedNo={BedNo}", bedNo);
            await _logService.LogAsync(ex.Message, "sp_GetLatestVideoTaskByBed");
        }

        return result;
    }

    public async Task<DataTable> GetFreshTask(string bedId = null, string bedNumber = null, string token = null, int windowSeconds = 60, string lastSeenTaskId = null)
    {
        DataTable dt = new DataTable();
        try
        {
            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand("SP_GETFRESHTASK_QR", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add("@Bedid", SqlDbType.NVarChar, 50).Value = (object)bedId ?? DBNull.Value;
            cmd.Parameters.Add("@BedNumber", SqlDbType.NVarChar, 50).Value = (object)bedNumber ?? DBNull.Value;
            cmd.Parameters.Add("@TOKEN", SqlDbType.NVarChar, 500).Value = (object)token ?? DBNull.Value;
            cmd.Parameters.Add("@WindowSeconds", SqlDbType.Int).Value = windowSeconds;
            cmd.Parameters.Add("@LastSeenTaskId", SqlDbType.NVarChar, 50).Value = (object)lastSeenTaskId ?? DBNull.Value;

            await con.OpenAsync();

            using SqlDataAdapter da = new SqlDataAdapter(cmd);
            da.Fill(dt);

            _logger.LogInformation("GetFreshTask. Rows={Count}, BedId={BedId}, LastSeen={LastSeen}",
                dt.Rows.Count, bedId, lastSeenTaskId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetFreshTask");
            await _logService.LogAsync(ex.Message, "SP_GETFRESHTASK_QR");
            dt = new DataTable();
        }

        return dt;
    }

    public async Task<GuestPassResult> InsertGuestPassAsync(
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
    {
        var result = new GuestPassResult();

        try
        {
            _logger.LogInformation("Inserting Guest Pass. BedNo={BedNo}, Guest={Guest}, Phone={Phone}",
                bedNo, guestName, guestPhone);

            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand("sp_InsertGuestPass", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@BedNo", (object)bedNo ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@PatientId", (object)patientId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@PatientName", (object)patientName ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@RoomBed", (object)roomBed ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@GuestName", guestName);
            cmd.Parameters.AddWithValue("@GuestPhone", guestPhone);
            cmd.Parameters.AddWithValue("@AdditionalMembers", (object)additionalMembers ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@PassCode", passCode);
            cmd.Parameters.AddWithValue("@QrToken", qrToken);
            cmd.Parameters.AddWithValue("@QrTokenHash", qrTokenHash);
            cmd.Parameters.Add("@RequestTime", SqlDbType.DateTime).Value =
                (object)requestTime ?? DBNull.Value;
            cmd.Parameters.AddWithValue("@ValidFrom", validFrom);
            cmd.Parameters.AddWithValue("@ValidUntil", validUntil);
            cmd.Parameters.AddWithValue("@CreatedBy", (object)createdBy ?? DBNull.Value);

            var pGuestPassId = new SqlParameter("@NewGuestPassId", SqlDbType.Int) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(pGuestPassId);

            await con.OpenAsync();
            await cmd.ExecuteNonQueryAsync();

            result.Success = true;
            result.GuestPassId = pGuestPassId.Value != DBNull.Value ? Convert.ToInt32(pGuestPassId.Value) : 0;
            result.PassCode = passCode;
            result.QrToken = qrToken;

            _logger.LogInformation("Successfully inserted Guest Pass. GuestPassId={Id}", result.GuestPassId);
        }
        catch (SqlException sqlEx)
        {
            _logger.LogError(sqlEx, "SQL Error in InsertGuestPassAsync. Guest={Guest}", guestName);
            await _logService.LogAsync($"SQL Error: {sqlEx.Message}", "sp_InsertGuestPass");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in InsertGuestPassAsync. Guest={Guest}", guestName);
            await _logService.LogAsync(ex.Message, "sp_InsertGuestPass");
        }

        return result;
    }

    public async Task<GuestPassMaster> GetGuestPassByIdAsync(int guestPassId)
    {
        GuestPassMaster result = null;

        try
        {
            _logger.LogInformation("Fetching Guest Pass. GuestPassId={Id}", guestPassId);

            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand("SELECT * FROM GuestPassMaster WHERE GuestPassId = @Id", con);
            cmd.CommandType = CommandType.Text;
            cmd.Parameters.AddWithValue("@Id", guestPassId);

            await con.OpenAsync();

            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                result = MapGuestPass(reader);
                _logger.LogInformation("Found Guest Pass. PassCode={Code}", result.PassCode);
            }
            else
            {
                _logger.LogWarning("No Guest Pass found. GuestPassId={Id}", guestPassId);
            }
        }
        catch (SqlException sqlEx)
        {
            _logger.LogError(sqlEx, "SQL Error in GetGuestPassByIdAsync. GuestPassId={Id}", guestPassId);
            await _logService.LogAsync($"SQL Error: {sqlEx.Message}", "GetGuestPassByIdAsync");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetGuestPassByIdAsync. GuestPassId={Id}", guestPassId);
            await _logService.LogAsync(ex.Message, "GetGuestPassByIdAsync");
        }

        return result;
    }

    public async Task<GuestPassMaster> GetGuestPassByQrTokenHashAsync(string qrTokenHash)
    {
        GuestPassMaster result = null;

        try
        {
            _logger.LogInformation("Fetching Guest Pass by QR token hash.");

            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand("SELECT * FROM GuestPassMaster WHERE QrTokenHash = @Hash", con);
            cmd.CommandType = CommandType.Text;
            cmd.Parameters.AddWithValue("@Hash", qrTokenHash);

            await con.OpenAsync();

            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                result = MapGuestPass(reader);
                _logger.LogInformation("Found Guest Pass by hash. PassCode={Code}", result.PassCode);
            }
            else
            {
                _logger.LogWarning("No Guest Pass found for the given QR token hash.");
            }
        }
        catch (SqlException sqlEx)
        {
            _logger.LogError(sqlEx, "SQL Error in GetGuestPassByQrTokenHashAsync.");
            await _logService.LogAsync($"SQL Error: {sqlEx.Message}", "GetGuestPassByQrTokenHashAsync");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetGuestPassByQrTokenHashAsync.");
            await _logService.LogAsync(ex.Message, "GetGuestPassByQrTokenHashAsync");
        }

        return result;
    }

    public async Task UpdateGuestPassSmsStatusAsync(int guestPassId, bool sent, string response)
    {
        try
        {
            _logger.LogInformation("Updating Guest Pass SMS status. GuestPassId={Id}, Sent={Sent}",
                guestPassId, sent);

            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand(
                @"UPDATE GuestPassMaster
              SET SmsSent = @Sent,
                  SmsSentAt = GETDATE(),
                  SmsResponse = @Resp
              WHERE GuestPassId = @Id", con);
            cmd.CommandType = CommandType.Text;

            cmd.Parameters.AddWithValue("@Sent", sent);
            cmd.Parameters.AddWithValue("@Resp", (object)response ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Id", guestPassId);

            await con.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }
        catch (SqlException sqlEx)
        {
            _logger.LogError(sqlEx, "SQL Error in UpdateGuestPassSmsStatusAsync. GuestPassId={Id}", guestPassId);
            await _logService.LogAsync($"SQL Error: {sqlEx.Message}", "UpdateGuestPassSmsStatusAsync");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in UpdateGuestPassSmsStatusAsync. GuestPassId={Id}", guestPassId);
            await _logService.LogAsync(ex.Message, "UpdateGuestPassSmsStatusAsync");
        }
    }

    public async Task<bool> UpdateGuestPassDecisionAsync(int guestPassId, string process)
    {
        bool updated = false;

        try
        {
            _logger.LogInformation("Guest Pass decision. GuestPassId={Id}, Process={Process}",
                guestPassId, process);

            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand("sp_GuestPassDecision", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@GuestPassId", guestPassId);
            cmd.Parameters.AddWithValue("@Process", process);

            var pResult = new SqlParameter("@Result", SqlDbType.Int) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(pResult);

            await con.OpenAsync();
            await cmd.ExecuteNonQueryAsync();

            int result = pResult.Value != DBNull.Value ? Convert.ToInt32(pResult.Value) : 0;
            updated = result == 1;

            _logger.LogInformation("GuestPassDecision result. Id={Id}, Process={Process}, Result={Result}",
                guestPassId, process, result);
        }
        catch (SqlException sqlEx)
        {
            _logger.LogError(sqlEx, "SQL Error in UpdateGuestPassDecisionAsync. Id={Id}", guestPassId);
            await _logService.LogAsync($"SQL Error: {sqlEx.Message}", "sp_GuestPassDecision");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in UpdateGuestPassDecisionAsync. Id={Id}", guestPassId);
            await _logService.LogAsync(ex.Message, "sp_GuestPassDecision");
        }

        return updated;
    }

    private static GuestPassMaster MapGuestPass(SqlDataReader reader)
    {
        return new GuestPassMaster
        {
            GuestPassId = Convert.ToInt32(reader["GuestPassId"]),
            RequestId = reader["RequestId"] == DBNull.Value ? null : Convert.ToInt32(reader["RequestId"]),
            BedNo = reader["BedNo"] == DBNull.Value ? null : reader["BedNo"].ToString(),
            PatientId = reader["PatientId"] == DBNull.Value ? null : Convert.ToInt32(reader["PatientId"]),
            PatientName = reader["PatientName"] == DBNull.Value ? null : reader["PatientName"].ToString(),
            RoomBed = reader["RoomBed"] == DBNull.Value ? null : reader["RoomBed"].ToString(),
            GuestName = reader["GuestName"] == DBNull.Value ? null : reader["GuestName"].ToString(),
            GuestPhone = reader["GuestPhone"] == DBNull.Value ? null : reader["GuestPhone"].ToString(),
            AdditionalMembers = reader["AdditionalMembers"] == DBNull.Value ? null : reader["AdditionalMembers"].ToString(),
            PassCode = reader["PassCode"] == DBNull.Value ? null : reader["PassCode"].ToString(),
            QrToken = reader["QrToken"] == DBNull.Value ? null : reader["QrToken"].ToString(),
            QrTokenHash = reader["QrTokenHash"] == DBNull.Value ? null : reader["QrTokenHash"].ToString(),
            RequestTime = reader["RequestTime"] == DBNull.Value ? null : Convert.ToDateTime(reader["RequestTime"]),
            ValidFrom = Convert.ToDateTime(reader["ValidFrom"]),
            ValidUntil = Convert.ToDateTime(reader["ValidUntil"]),
            IsUsed = reader["IsUsed"] != DBNull.Value && Convert.ToBoolean(reader["IsUsed"]),
            UsedAt = reader["UsedAt"] == DBNull.Value ? null : Convert.ToDateTime(reader["UsedAt"]),
            IsRevoked = reader["IsRevoked"] != DBNull.Value && Convert.ToBoolean(reader["IsRevoked"]),
            SmsSent = reader["SmsSent"] != DBNull.Value && Convert.ToBoolean(reader["SmsSent"]),
            SmsSentAt = reader["SmsSentAt"] == DBNull.Value ? null : Convert.ToDateTime(reader["SmsSentAt"]),
            SmsResponse = reader["SmsResponse"] == DBNull.Value ? null : reader["SmsResponse"].ToString(),
            CreatedBy = reader["CreatedBy"] == DBNull.Value ? null : Convert.ToInt32(reader["CreatedBy"]),
            CreatedDate = reader["CreatedDate"] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(reader["CreatedDate"])
        };
    }

    public async Task<LoginPatientResult> LoginByRoomNoAsync(string roomNo)
    {
        LoginPatientResult result = null;
        try
        {
            using SqlConnection con = new SqlConnection(_configuration.GetConnectionString("Dial50"));
            using SqlCommand cmd = new SqlCommand("SP_LOGINBYROOMNO", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@RoomNo", roomNo);

            await con.OpenAsync();
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                result = new LoginPatientResult
                {
                    PatientId = Convert.ToInt32(reader["PatientId"]),
                    PatientName = reader["PatientName"]?.ToString(),
                    ROOM = reader["ROOM"]?.ToString(),
                    BED = reader["BED"]?.ToString(),
                    Ward = reader["WARD"]?.ToString(),
                    Gender = reader["GENDER"]?.ToString(),
                    Age = reader["AGE"] != DBNull.Value ? Convert.ToInt32(reader["AGE"]) : (int?)null,
                    DoctorName = reader["DOCTORNAME"]?.ToString(),
                    DietType = reader["DIETTYPE"]?.ToString(),
                    Allergies = reader["ALLERGIES"]?.ToString(),
                    MedicalNotes = reader["MEDICALNOTES"]?.ToString(),
                    DietaryNotes = reader["DIETARYNOTES"]?.ToString(),
                    IsActive = reader["ISACTIVE"] != DBNull.Value && Convert.ToBoolean(reader["ISACTIVE"]),
                    NpoFlag = reader["NPO_FLAG"] != DBNull.Value ? Convert.ToInt32(reader["NPO_FLAG"]) : 0,
                    NpoReason = reader["NPO_REASON"]?.ToString(),
                    NpoStartDate = reader["NPO_STARTDATE"] != DBNull.Value ? Convert.ToDateTime(reader["NPO_STARTDATE"]) : (DateTime?)null,
                    NpoEndDate = reader["NPO_ENDDATE"] != DBNull.Value ? Convert.ToDateTime(reader["NPO_ENDDATE"]) : (DateTime?)null,
                    NpoNotes = reader["NPO_NOTES"]?.ToString(),
                    IsFasting = reader["IS_FASTING"] != DBNull.Value ? Convert.ToInt32(reader["IS_FASTING"]) : 0,
                    FastingStart = reader["FASTING_START"] != DBNull.Value ? Convert.ToDateTime(reader["FASTING_START"]) : (DateTime?)null,
                    FastingEnd = reader["FASTING_END"] != DBNull.Value ? Convert.ToDateTime(reader["FASTING_END"]) : (DateTime?)null,
                    FastingMenuId = reader["FASTING_MENU_ID"]?.ToString(),

                    BedId = reader["BedId"] != DBNull.Value ? Convert.ToInt32(reader["BedId"]) : (int?)null,
                    Uhid = reader["Uhid"]?.ToString(),
                    Region = reader["Region"]?.ToString(),
                    Language = reader["Language"]?.ToString(),
                    DateOfAdmission = reader["DATEOFADMISSION"] != DBNull.Value ? Convert.ToDateTime(reader["DATEOFADMISSION"]) : (DateTime?)null,

                    BedInfoEncrypted = reader["BedInfoEncrypted"]?.ToString()
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in LoginByRoomNoAsync. RoomNo={RoomNo}", roomNo);
            await _logService.LogAsync(ex.Message, "SP_LOGINBYROOMNO");
        }

        return result;
    }
    public async Task<List<DischargeCompleteFeedbackInfo>> GetCompleteFeedback(string? referenceNo, string? bedNo, string? patientName)
    {
        var result = new List<DischargeCompleteFeedbackInfo>();
        try
        {
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("Dial50")))
            {
                await conn.OpenAsync();
                using (SqlCommand cmd = new SqlCommand("SP_PATIENTFEEDBACK", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PROCESS", "GETCOMPLETEFEEDBACK");
                    cmd.Parameters.AddWithValue("@REFERENCENO", referenceNo ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@BEDNO", bedNo ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@PATIENTNAME", patientName ?? (object)DBNull.Value);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(new DischargeCompleteFeedbackInfo
                            {
                                FeedbackId = Convert.ToInt64(reader["FEEDBACKID"]),
                                ReferenceNo = reader["REFERENCENO"].ToString(),
                                BedNo = reader["BEDNO"]?.ToString(),
                                Uhid = reader["UHID"]?.ToString(),
                                PatientName = reader["PATIENTNAME"]?.ToString(),
                                RoomNo = reader["ROOMNO"]?.ToString(),
                                Region = reader["REGION"]?.ToString(),
                                FeedbackData = reader["FEEDBACKDATA"]?.ToString(),
                                CreatedDate = Convert.ToDateTime(reader["CREATEDDATE"]),
                                IsCompleted = Convert.ToBoolean(reader["ISCOMPLETED"]),
                                AdditionalComments = reader["ADDITIONALCOMMENTS"]?.ToString(),
                                SubmittedAt = reader["SUBMITTEDAT"]?.ToString(),
                                Questions = reader["QUESTIONS"]?.ToString()
                            });
                        }
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetCompleteFeedback");
            await _logService.LogAsync(ex.Message, "SP_PATIENTFEEDBACK_GETCOMPLETEFEEDBACK");
            return result;
        }
    }
}