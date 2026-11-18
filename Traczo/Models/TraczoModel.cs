using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Collections;
using System.ComponentModel.DataAnnotations;

namespace Traczo.Models
{
    public class PatientRequest : TenantBase
    {
        public string userId { get; set; }
        public string LocationId { get; set; }
        public string Status { get; set; }
    }
    public class PatientHisRes
    {
        public bool status { get; set; }
        public string message { get; set; }
        public PatientData data { get; set; }
    }

    public class PatientData
    {
        public string uhid { get; set; }
        public string patientName { get; set; }
        public string gender { get; set; }
        public string age { get; set; }
        public string dateofAdmisison { get; set; }

        public string userId { get; set; }
        public string userName { get; set; }
    }
    public static class TokenCache
    {
        public static string Token { get; set; }
        public static DateTime Expiry { get; set; }

        public static bool IsValid()
        {
            return !string.IsNullOrEmpty(Token) && DateTime.UtcNow < Expiry;
        }
    }


    public class TokenResponse
    {
        public bool status { get; set; }
        public string message { get; set; }
        public string token { get; set; }
        public string expiresAt { get; set; }
    }



    //dial 50 start

    public class AIRequest : TenantBase
    {
        //public string Prompt { get; set; }
    }

    public class FeedbackSaveResponse
    {
        public List<FeedbackTaskResult> Tasks { get; set; }
    }

    public class FeedbackTaskResult
    {
        public string Department { get; set; }
        public string Status { get; set; }
        public string Result { get; set; }
    }


    public class FeedbackRequestJd : TenantBase
    {
        public string convId { get; set; }
        public string user { get; set; }   // Room 402-A (display value)
        public List<FeedbackItemReq> Feedback { get; set; }
    }

    public class FeedbackItemReq
    {
        public string Department { get; set; }
        public string Rating { get; set; }
        public string Remarks { get; set; }
    }


    public class FeedbackRequest : TenantBase
    {
        public string Uhid { get; set; }
        public string BedNo { get; set; }
        public string Process { get; set; }
    }
    public class UpdateResult
    {
        public string status { get; set; }
        public string Result { get; set; }
    }
    public class FeedbackItem
    {
        public string FeedbackId { get; set; }
        public string FeedbackDetailsId { get; set; }
        public string Description { get; set; }
        public string Question { get; set; }
        public string IsText { get; set; }
        public string Uhid { get; set; }
        public string BedNo { get; set; }
        public string Rating { get; set; }
        public string Remarks { get; set; }
        public string CreatedTime { get; set; }
    }
    public class OverFeedBackResponse<T>
    {
        public bool status { get; set; }
        public string message { get; set; }
        public T data { get; set; }
    }
    public class FeedbackResponse : TenantBase
    {
        public List<FeedbackItem> Feedback { get; set; }
    }



    public class BedTaskRequest : TenantBase
    {
        public string BedNo { get; set; }
        public string BedId { get; set; }
    }

    public class BedTaskResponse
    {
        public bool status { get; set; }
        public string message { get; set; }
        public BedTaskData data { get; set; }
    }


    public class BedTaskData
    {
        public List<BedTaskDataItem> userTask { get; set; }
    }
    public class BedTaskDataItem
    {
        public string RequestNo { get; set; }
        public string PorterName { get; set; }
        public string PorterId { get; set; }
        public string PorterImage { get; set; }


        public string SubPorterName { get; set; }
        public string SubPorterId { get; set; }
        public string SubPorterImage { get; set; }
        public string RequestStatus { get; set; }
        public string RequestStatusId { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string CategoryName { get; set; }
        public string CategoryDescription { get; set; }
        public string RequestDate { get; set; }
        public string Eta { get; set; }
        public string TaskTypeId { get; set; }
        public string Rating { get; set; }
        public string RequestDeskRemarks { get; set; }

    }
    public class RtnSaveAudioText
    {
        public bool status { get; set; }
        public string message { get; set; }
        public RtnSaveAudioTextData data { get; set; }
    }
    public class RtnSaveAudioTextData
    {
        public string Result { get; set; }
        public string StoragePath { get; set; }

    }

    public class DepCategoryI : TenantBase
    {


        public string LocationName { get; set; }
        public string ImeiNumber { get; set; }
        public string FcmToken { get; set; }
        public string HospitalId { get; set; }


    }


    public class CategoryResponse
    {
        public bool status { get; set; }
        public string message { get; set; }
        public CategoryData data { get; set; }
    }

    public class CategoryData
    {
        public DeviceStatus isActiveDevice { get; set; }
        public List<CategoryItem> My_Daily_Care { get; set; }
        public List<CategoryItem> Room_comfort { get; set; }
        public List<CategoryItem> food_drink { get; set; }
    }
    public class DeviceStatus
    {
        public string isActiveDevice { get; set; }
    }

    public class CategoryItem
    {
        public string DepartmentId { get; set; }
        public string DepartmentKey { get; set; }
        public string DepartmentName { get; set; }
        public string CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string CategoryImage { get; set; }
        public string CategoryTitle { get; set; }
        public string CategoryDetails { get; set; }
        public string CategoryDescription { get; set; }
        public string DescriptionDetails { get; set; }

        public string HisUrl { get; set; }
        public string Dial50url { get; set; }

        public string TaskTypeId { get; set; }
        public string SubLeveLDepId { get; set; }


    }


    public class FeedbackIp : TenantBase
    {
        public string requestId { get; set; }
        public string convId { get; set; }
        public string rating { get; set; }
        public string remarks { get; set; }
        public string status { get; set; }
    }

    public class ConversationRequest : TenantBase
    {
        public string type { get; set; }
        public string status { get; set; }
        public string convId { get; set; }
        public string user { get; set; }
        public string userName { get; set; }
    }
    public class ConversationResponse
    {
        public bool status { get; set; }
        public string message { get; set; }
        public ConversationData data { get; set; }
    }
    public class ConversationData
    {
        public string Result { get; set; }
        public string ConversationID { get; set; }
    }

    public class GetProfileResponse
    {
        public bool status { get; set; }
        public string message { get; set; }
        public GetProfileData data { get; set; }

    }
    public class GetDepartmentData
    {

        public string DepartmentId { get; set; }
        public string DepartmentName { get; set; }


    }
    public class GetProfileDataDep
    {

        public string userName { get; set; }
        public string userId { get; set; }
        public string gender { get; set; }
        public string age { get; set; }
        public string uhid { get; set; }

    }
    public class GetProfileData
    {
        public string userName { get; set; }
        public string userId { get; set; }
        public string BedNo { get; set; }
        public string gender { get; set; }
        public string age { get; set; }
        public string uhid { get; set; }
        public string Language { get; set; }
        public string patientName { get; set; }
        public string Region { get; set; }
        public string dateofAdmisison { get; set; }
        public string tier { get; set; }
        public string tierCode { get; set; }
        public int tierLevel { get; set; }
    }

    public class GetProfileIP : TenantBase
    {
        public string userId { get; set; }
        public string Status { get; set; }

    }

    public class TaskResponse
    {
        public bool status { get; set; }
        public string message { get; set; }
        public TaskData data { get; set; }
    }

    public class TaskData
    {
        public List<TaskResult> Tasks { get; set; }
    }

    public class TaskResult
    {
        public string CategoryName { get; set; }
        public string Status { get; set; }
        public string Result { get; set; }
        public string RequestNo { get; set; }


    }
    public class TaskResultnew
    {
        public string Status { get; set; }
        public string Result { get; set; }
        public string RequestNo { get; set; }
        public string CategoryName { get; set; }


    }
    public class TaskRequest
    {
        public string HosId { get; set; }

        public string user { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string ConversationId { get; set; }
        public string Gender { get; set; }
        public string Language { get; set; }

        public List<TaskItem> Tasks { get; set; }
    }

    public class TaskItem
    {
        public string Category { get; set; }
        public string Quantity { get; set; }
        public string Remarks { get; set; }
        public string PorterId { get; set; }

    }

    //dial50 end

    public class RtnClnTaskDetail
    {
        public bool status { get; set; }
        public string message { get; set; }
        public Currentcleaningtaskdetail data { get; set; }
    }
    public class Currentcleaningtaskdetail
    {
        public string RequestId { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryImage { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public string RequestStatus { get; set; } = string.Empty;
        public string RequestDeskRemarks { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string RequestorName { get; set; } = string.Empty;
        public string PorterName { get; set; } = string.Empty;
        public string RequestTime { get; set; } = string.Empty;
        public string RequestStatusId { get; set; } = string.Empty;
        public string AssignedTime { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string ThresholdForStartTime { get; set; } = string.Empty;
        public string ThresholdForEndTime { get; set; } = string.Empty;
        public string RequestNo { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string PorterRemarks { get; set; } = string.Empty;
        public string Quantity { get; set; } = string.Empty;
        public string ContactNo { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;


    }

    public class MultiImageFiles : TenantBase
    {

        [Required]
        public string CheckListId { get; set; }
        [Required]
        public string Value { get; set; }
        [Required]
        public string Photo { get; set; }
        public string Before { get; set; }
        public string After { get; set; }
        public string InputType { get; set; }

    }

    public class RtnPorterTaskList
    {
        public bool status { get; set; }
        public string message { get; set; }
        public PorterTaskDetails data { get; set; }
    }



    public class RtnLogin
    {
        public bool status { get; set; }
        public string message { get; set; }
        public CateringGroupdata data { get; set; }
    }
    public class CateringGroupdata
    {
        public string AppType { get; set; }
        public string IsHaywood { get; set; }
        public string IsRoyalStoke { get; set; }
        public List<CateringGroup> CateringGroupNames { get; set; }
        public List<CleaningZone> CleaningZones { get; set; }


    }
    public class CateringGroup
    {
        public string CateringGroupId { get; set; }
        public string CateringGroupName { get; set; }
    }
    public class CleaningZone
    {
        public string CleaningZoneId { get; set; }
        public string CleaningZoneName { get; set; }
    }
    public class ReturnPorterTaskList
    {
        public bool status { get; set; }
        public string message { get; set; }
        public List<PorterTasksList> data { get; set; }


    }
    public class PorterTasksList
    {
        public string RequestId { get; set; }
        public string RequestNo { get; set; }
        public string CategoryName { get; set; }
        public string RequestorName { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string RequestStatus { get; set; }
        public string RequestDate { get; set; }
        public string RequestTime { get; set; }
        public string IsMultiPorter { get; set; }
        public string Quantity { get; set; }


    }


    public class GetCatCleanTaskHistory : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string PorterId { get; set; }
        public string RequestId { get; set; }
        public string ServiceId { get; set; }
        public string Process { get; set; }
    }
    public class GetPorterTaskHistory : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string PorterId { get; set; }
        public string RequestId { get; set; }
        public string Process { get; set; }
    }

    public class RtnPorterTaskHistory
    {
        public bool status { get; set; }
        public string message { get; set; }
        public PorterTasksHistory data { get; set; }
    }

    public class PorterTasksHistory
    {

        public string RequestId { get; set; }
        public string CategoryName { get; set; }
        public string CategoryImage { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string RequestStatus { get; set; }
        public string RequestDeskRemarks { get; set; }
        public string PatientName { get; set; }
        public string RequestorName { get; set; }
        public string PorterName { get; set; }
        public string RequestTime { get; set; }
        public string RequestStatusId { get; set; }
        public string MultiTaskFlag { get; set; }
        public string AssignedTime { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string ThresholdForStartTime { get; set; }
        public string ThresholdForEndTime { get; set; }
        public string NoResponseTime { get; set; }
        public string RequestNo { get; set; }
        public string Priority { get; set; }
        public string StartLocationMac { get; set; }
        public string EndLocationMac { get; set; }
        public string PorterRemarks { get; set; }
        public string PorterId { get; set; }
        public string SubPorterId { get; set; }
        public string IsMultiPorter { get; set; }

        public string TotalTat { get; set; }
        public string Quantity { get; set; }
        public string ContactNo { get; set; }
        public string Result { get; set; }


    }

    public class PorterTaskDetails
    {
        public List<Currentportertask> PorterTask { get; set; }

        public List<Previousportertask> PreviousPorterTask { get; set; }

        public string PorterEndShift { get; set; }
        public Buzzer Buzzer { get; set; }
    }
    public class Buzzer
    {
        public string Result { get; set; }
        public string BuzzerId { get; set; }
    }

    public class OtherMessage
    {

        public string MsgId { get; set; }
        public string Message { get; set; }

        public string RequestId { get; set; }
        public string RequestNo { get; set; }
    }
    public class PorterEndShift
    {


        public string EndShift { get; set; }
    }
    public class RtnCatTaskDetail
    {
        public bool status { get; set; }
        public string message { get; set; }
        public Currentcateringtaskdetail data { get; set; }
    }
    public class Currentcateringtaskdetail
    {
        public string RequestId { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryImage { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public string RequestStatus { get; set; } = string.Empty;
        public string RequestDeskRemarks { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string RequestorName { get; set; } = string.Empty;
        public string PorterName { get; set; } = string.Empty;
        public string RequestTime { get; set; } = string.Empty;
        public string RequestStatusId { get; set; } = string.Empty;
        public string AssignedTime { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string ThresholdForStartTime { get; set; } = string.Empty;
        public string ThresholdForEndTime { get; set; } = string.Empty;
        public string RequestNo { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string PorterRemarks { get; set; } = string.Empty;
        public string Quantity { get; set; } = string.Empty;
        public string ContactNo { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;


    }
    public class Currentportertask
    {
        public string RequestId { get; set; }
        public string CategoryName { get; set; }
        public string CategoryImage { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string RequestStatus { get; set; }
        public string RequestDeskRemarks { get; set; }
        public string PatientName { get; set; }
        public string RequestorName { get; set; }
        public string PorterName { get; set; }
        public string RequestTime { get; set; }
        public string RequestStatusId { get; set; }
        public string MultiTaskFlag { get; set; }
        public string AssignedTime { get; set; }
        public string StartTime { get; set; }
        public string ThresholdForStartTime { get; set; }
        public string ThresholdForEndTime { get; set; }
        public string NoResponseTime { get; set; }
        public string RequestNo { get; set; }
        public string Priority { get; set; }
        public string StartLocationMac { get; set; }
        public string EndLocationMac { get; set; }
        public string PorterRemarks { get; set; }
        public string PorterId { get; set; }
        public string SubPorterId { get; set; }
        public string IsAdhoc { get; set; }

        public string IsMultiPorter { get; set; }
        public string PorterStartFlag { get; set; }
        public string SubPorterStartFlag { get; set; }
        public string PorterEndFlag { get; set; }
        public string SubPorterEndFlag { get; set; }
        public string IsAlarm { get; set; }
        public string Quantity { get; set; }
        public string ContactNo { get; set; }
        public string Result { get; set; }


    }
    public class Previousportertask
    {
        public string RequestId { get; set; }
        public string RequestNo { get; set; }
        public string RequestStatus { get; set; }
        public string MessageId { get; set; }
    }




    public class RtnCateringTaskList
    {
        public bool status { get; set; }
        public string message { get; set; }
        public CateringTaskDetails data { get; set; }
    }

    public class CateringTaskDetails
    {
        public List<Currentcateringtask> CateringTask { get; set; }

        public List<Previouscateringtask> PreviousCateringTask { get; set; }

        public string PorterEndShift { get; set; }
        public Buzzer Buzzer { get; set; }
    }

    public class Currentcateringtask
    {
        public string RequestId { get; set; }
        public string CategoryName { get; set; }
        public string CategoryImage { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string RequestStatus { get; set; }
        public string RequestDeskRemarks { get; set; }
        public string PatientName { get; set; }
        public string RequestorName { get; set; }
        public string PorterName { get; set; }
        public string RequestTime { get; set; }
        public string RequestStatusId { get; set; }
        public string MultiTaskFlag { get; set; }
        public string AssignedTime { get; set; }
        public string StartTime { get; set; }
        public string ThresholdForStartTime { get; set; }
        public string ThresholdForEndTime { get; set; }
        public string NoResponseTime { get; set; }
        public string RequestNo { get; set; }
        public string Priority { get; set; }
        public string StartLocationMac { get; set; }
        public string EndLocationMac { get; set; }
        public string PorterRemarks { get; set; }
        public string PorterId { get; set; }
        public string SubPorterId { get; set; }
        public string IsAdhoc { get; set; }

        public string IsMultiPorter { get; set; }
        public string PorterStartFlag { get; set; }
        public string SubPorterStartFlag { get; set; }
        public string PorterEndFlag { get; set; }
        public string SubPorterEndFlag { get; set; }
        public string IsAlarm { get; set; }
        public string Quantity { get; set; }
        public string ContactNo { get; set; }
        public string Result { get; set; }
        public string ItemName { get; set; }
        public string IsSignRequired { get; set; }
        public string IsPhotoRequired { get; set; }


    }

    public class Previouscateringtask
    {
        public string RequestId { get; set; }
        public string RequestNo { get; set; }
        public string RequestStatus { get; set; }
        public string MessageId { get; set; }
    }

    public class Credentials : TenantBase
    {
        [JsonProperty("username")]
        public string Username { get; set; }

        [JsonProperty("password")]
        public string Password { get; set; }
    }
    public class Branches
    {
        public string HospitalId { get; set; }
        public string HospitalName { get; set; }
        public string ServerIp { get; set; }

        public string HostingUrl { get; set; }
        public string Result { get; set; }

    }

    public class BranchesOP
    {
        public string HospitalId { get; set; }
        public string HospitalName { get; set; }
        public string HostingUrl { get; set; }
        public string VoicePingUrl { get; set; }
        public string SocketUrl { get; set; }
        public string Result { get; set; }

    }
    public class BranchesIP : TenantBase
    {

        public string ServerIp { get; set; }
        public string AppType { get; set; }



    }

    public class RtnBranches
    {
        public bool status { get; set; }
        public string message { get; set; }
        public List<BranchesOP> data { get; set; }
    }

    public class RtnFloors
    {
        public bool status { get; set; }
        public string message { get; set; }
        public IEnumerable<Dictionary<string, object>> data { get; set; }
    }

    public class RtnData
    {
        public bool status { get; set; }
        public string message { get; set; }
        public string data { get; set; }
    }

    public class GetAdhocLocParam : TenantBase
    {
        public string HospitalId { get; set; }
        public string PorterId { get; set; }
        public string Process { get; set; }
    }

    public class ReqInfoReq : TenantBase
    {
        public string Department { get; set; }
        public string Category { get; set; }
        public string ConversationId { get; set; }
    }

    public class PorterTracReq : TenantBase
    {
        public string PorterId { get; set; }
        public string RequestId { get; set; }
        public string RequestStatusId { get; set; }
    }

    public class PTTCall : TenantBase
    {

        public string PrivateCallId { get; set; }
        public string HospitalId { get; set; }
        public string SenderId { get; set; }
        public string RecieverId { get; set; }
        public string Process { get; set; }
    }



    public class PorterMesssage : TenantBase
    {
        public string HospitalId { get; set; }
        public string PorterId { get; set; }
        public string MessageId { get; set; }
        public string Process { get; set; }
    }

    public class BTaskOnHold : TenantBase
    {
        public string HospitalId { get; set; }
        public string PorterId { get; set; }
        public string RequestId { get; set; }
        public string Remarks { get; set; }
        public string Process { get; set; }
    }

    public class RtnList
    {
        public bool status { get; set; }
        public string message { get; set; }
        public IEnumerable<Dictionary<string, object>> data { get; set; }
    }

    public class RtnCatClnRemarksList
    {
        public bool status { get; set; }
        public string message { get; set; }
        public CateringCleaningRemarks data { get; set; }
    }
    public class CateringCleaningRemarks
    {

        public List<CateringRem> CateringRemarks { get; set; }
        public List<CleaningRem> CleaningRemarks { get; set; }


    }
    public class CateringRem
    {
        public string RemarksId { get; set; }
        public string Remarks { get; set; }
    }
    public class CleaningRem
    {
        public string RemarksId { get; set; }
        public string Remarks { get; set; }
    }

    public class LocationDetails
    {

        public int Id { get; set; }
        public string ZoneName { get; set; }
        public int FloorId { get; set; }
        public string FloorName { get; set; }
        public string Mac { get; set; }
        public string APName { get; set; }
        public string DeviceType { get; set; }
        public string NearByZoneId { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public int IsActive { get; set; }
        public string Result { get; set; }
    }

    public class SubZoneDetailsn
    {
        public List<LocationDetails> LocationDetails1 { get; set; }

        public List<InnerZoneList> NearByZoneList { get; set; }
    }

    public class RtnPorterStartEnd
    {
        public bool status { get; set; }
        public string message { get; set; }
        public RtnPorterStartEndData data { get; set; }
    }
    public class RtnPorterStartEndData
    {
        public string Result { get; set; }
    }


    public class RtnLocationListQR
    {
        public bool status { get; set; }
        public string message { get; set; }
        public LocationMacListQR data { get; set; }
    }
    public class LocationMacListQR
    {
        public List<LocationDetailsQR> qrLocations { get; set; }

    }
    public class LocationDetailsQR
    {

        public int LocationId { get; set; }
        public string LocationName { get; set; }
        public string FloorName { get; set; }
        public string LoocAIUrl { get; set; }
        public string IntegrationUrl { get; set; }
        public string IsQRCode { get; set; }
        public string QRCode { get; set; }

        public int IsActive { get; set; }
        public string Result { get; set; }
        public string HisBedId { get; set; }
        public string HisBedNo { get; set; }
    }
    public class RtnLocationList
    {
        public bool status { get; set; }
        public string message { get; set; }
        public LocationMacList data { get; set; }
    }
    public class LocationMacList
    {
        public List<LocationDetails> addedData { get; set; }

        public List<MacList> macIDData { get; set; }
    }

    public class MacList
    {
        public string Mac { get; set; }

    }

    public class SubZoneDetailsnn
    {
        public int Id { get; set; }
        public string ZoneName { get; set; }
        public int FloorId { get; set; }
        public string FloorName { get; set; }
        public string Mac { get; set; }
        public string APName { get; set; }
        public string DeviceType { get; set; }
        public string NearByZoneId { get; set; }
        public int IsActive { get; set; }
        public string Result { get; set; }
        public string Xaxis { get; set; }
        public string Yaxis { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public List<InnerZoneList> NearByZoneList { get; set; }
    }



    public class RtnSelectedLocn
    {
        public bool status { get; set; }
        public string message { get; set; }
        public SubZoneDetailsn data { get; set; }
    }


    public class RtnSelectedLocnn
    {
        public bool status { get; set; }
        public string message { get; set; }
        public SubZoneDetailsnn data { get; set; }
    }
    public class RtnSelectedLoc
    {
        public bool status { get; set; }
        public string message { get; set; }
        public List<SubZoneDetails> data { get; set; }
    }

    public class SubZoneDetails
    {
        public int Id { get; set; }
        public string ZoneName { get; set; }
        public int FloorId { get; set; }
        public string FloorName { get; set; }
        public string Mac { get; set; }
        public string APName { get; set; }
        public string DeviceType { get; set; }
        public string NearByZoneId { get; set; }
        public int IsActive { get; set; }
        public string Result { get; set; }
        public List<InnerZoneList> NearByZoneList { get; set; }
    }

    public class InnerZoneList
    {
        public int Id { get; set; }
        public string ZoneName { get; set; }
        public string IsSelected { get; set; }

    }
    public class RtnMultiList
    {
        public bool status { get; set; }
        public string message { get; set; }
        public IEnumerable<Dictionary<string, object>> data { get; set; }
    }

    public class LocUpdateList
    {
        public bool status { get; set; }
        public string message { get; set; }
        public string data { get; set; }
    }

    public static class GlobalVar
    {
        public const string NoDataFound = "No records found";
        public const string NoOfrecords = " Records found";
        public const string PlsChkData = "Please check the data";
        public const string DumData = "Temp data";




    }

    public class DeleteDevice : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string IMEINo { get; set; }

    }

    public class AlarmOffM : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string IMEINumber { get; set; }

        public string Process { get; set; }

    }
    public class AutoAssginRequest : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        public string Process { get; set; }

    }
    public class RegisterDevice : TenantBase
    {
        public string DeviceId { get; set; }
        public string HospitalId { get; set; }
        public string IMEINo { get; set; }
        public string DeviceModel { get; set; }
        public string DeviceName { get; set; }
        public int AppType { get; set; }
        public string LocationName { get; set; }
        public string FCMToken { get; set; }
        public string Process { get; set; }
        public string Result { get; set; }

    }

    public class TenantBase
    {
        [JsonProperty(PropertyName = "X-Tenant-ID", NullValueHandling = NullValueHandling.Ignore)]
        public string XTenentID { get; set; }
    }

    public static class TenantModeConfig
    {
        private static Tuple<bool, string> _cached;
        private static DateTime _cachedAt = DateTime.MinValue;
        private static readonly object _lock = new object();

        public static bool IsMultiTenant
        {
            get { return Load().Item1; }
        }

        public static string SingleTenantId
        {
            get { return Load().Item2; }
        }

        public static void Reload()
        {
            lock (_lock)
            {
                _cached = null;
                _cachedAt = DateTime.MinValue;
            }
        }

        private static Tuple<bool, string> Load()
        {
            lock (_lock)
            {
                if (_cached != null && (DateTime.Now - _cachedAt).TotalSeconds < 5)
                    return _cached;
            }

            bool multi = false;
            string singleId = "van";
            var entry = ConfigurationManager.ConnectionStrings["CentralDB"];
            if (entry != null)
            {
                try
                {
                    using (var conn = new SqlConnection(entry.ConnectionString))
                    using (var cmd = new SqlCommand("dbo.SP_GET_APP_CONFIG", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@APPNAME", "api");
                        conn.Open();
                        object v = cmd.ExecuteScalar();
                        if (v != null && v != DBNull.Value)
                        {
                            if (v is bool b) multi = b;
                            else if (v is int i) multi = i == 1;
                            else multi = Convert.ToString(v).Trim() == "1" || Convert.ToString(v).Trim().ToLower() == "true";
                        }
                    }
                }
                catch
                {
                    multi = false;
                }
            }

            var result = Tuple.Create(multi, singleId);
            lock (_lock)
            {
                _cached = result;
                _cachedAt = DateTime.Now;
            }
            return result;
        }
    }

    public class UserLogin : TenantBase
    {
        public string HospitalId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string IMEINo { get; set; }
        public int AppType { get; set; }
        public string RoleName { get; set; }
        public string FullName { get; set; }
        public string FCMDeviceToken { get; set; }
        public string CateringGroupId { get; set; }
        public string CleaningZoneId { get; set; }
        public string Result { get; set; }

    }

    public class Floors : TenantBase
    {
        public string HospitalId { get; set; }
        public int FloorId { get; set; }
        public string MapId { get; set; }
        public string FloorName { get; set; }
        public string FloorOrder { get; set; }
        public int Isactive { get; set; }
        public string Result { get; set; }

    }

    public class GetPorterTasks : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string PorterId { get; set; }
        public string Process { get; set; }

    }
    public class GetBuzzerList : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string BuzzerId { get; set; }
        public string Process { get; set; }

    }
    public class ModelHospital : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string Process { get; set; }

    }

    public class UserAccount : TenantBase
    {
        public string HospitalId { get; set; }
        [Required]
        public string UserId { get; set; }
        public string EmailId { get; set; }
        public string Process { get; set; }

    }
    public class ProfileDetails : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string PorterId { get; set; }
        public string ProfilePicture { get; set; }

        public string Process { get; set; }

    }
    public class VoiceFbkMdl : TenantBase
    {

        public string HospitalId { get; set; }

        public string RequestId { get; set; }
        public string ConversationId { get; set; }
        public string Remarks { get; set; }
        public string Process { get; set; }

    }
    public class PTTLog : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string PorterId { get; set; }
        [Required]
        public string IMEINo { get; set; }
        [Required]
        public string Log { get; set; }

        public string Process { get; set; }

    }
    public class StartCompleteTask : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string RequestId { get; set; }
        [Required]
        public string PorterId { get; set; }

        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string RequestStatus { get; set; }
        public string PorterRemarks { get; set; }
        public string Name { get; set; }
        public string PhoneNo { get; set; }
        public string CateringSign { get; set; }
        public string CateringPhoto { get; set; }


        public string AckPhotoTimeStamp { get; set; }
        public string AckLocStamp { get; set; }

        public string Process { get; set; }

    }
    public class ErMsg : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string ErrorMessage { get; set; }
        public string Process { get; set; }

    }
    public class StartCompleteClnTask : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string RequestId { get; set; }
        [Required]
        public string PorterId { get; set; }

        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string RequestStatus { get; set; }
        public string PorterRemarks { get; set; }
        public string Name { get; set; }
        public string PhoneNo { get; set; }
        public string CleaningSign { get; set; }

        public string CleaningBefPhoto { get; set; }
        public string AckBefPhotoTimeStamp { get; set; }
        public string AckBefLocStamp { get; set; }

        public string CleaningAftPhoto { get; set; }
        public string AckAftPhotoTimeStamp { get; set; }
        public string AckAftLocStamp { get; set; }

        public string CleaningOtherPhoto { get; set; }
        public string AckOthPhotoTimeStamp { get; set; }
        public string AckOthLocStamp { get; set; }

        public string Process { get; set; }

    }

    public class RequestCreate : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        public string RequestId { get; set; }
        public string RequestDate { get; set; }
        public string PorterId { get; set; }
        public string SubPorterId { get; set; }
        public string RequestStatusId { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string Category { get; set; }
        public string Remarks { get; set; }
        public string UserId { get; set; }
        public string PatientName { get; set; }
        public string MultiTaskFlag { get; set; }

        public string ConversationId { get; set; }
        public string Gender { get; set; }
        public string Quantity { get; set; }

        public string Process { get; set; }

    }

    public class LocationUpdates : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        public string Porterid { get; set; }

        [Required]
        public string IMEINumber { get; set; }

        public string Mac { get; set; }
        public string BatteryLevel { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public string Process { get; set; }

    }

    public class SelectedZone : TenantBase
    {
        public int Id { get; set; }
        public string ZoneName { get; set; }
        public string IsSelectd { get; set; }


    }
    public class SelectedLocation : TenantBase
    {

        public int Id { get; set; }
        public string ZoneName { get; set; }
        public int FloorId { get; set; }
        public string FloorName { get; set; }
        public string Mac { get; set; }
        public string APName { get; set; }
        public string DeviceType { get; set; }
        public string NearByZoneId { get; set; }
        public int IsActive { get; set; }

        public string Result { get; set; }


    }

    public class Device : TenantBase
    {
        public string HospitalId { get; set; }
        public string IMEINumber { get; set; }


    }
    public class Locations : TenantBase
    {
        public string HospitalId { get; set; }
        public int Id { get; set; }
        public string ZoneName { get; set; }
        public string FloorName { get; set; }
        public string Mac { get; set; }
        public int FloorId { get; set; }
        public string ZoneArea { get; set; }
        public int ZoneId { get; set; }
        public int IsActive { get; set; }
        public string LocationType { get; set; }
        public string SHORTNAME { get; set; }
        public int DischargeFlag { get; set; }
        public string APName { get; set; }
        public string DeviceType { get; set; }
        public string NearByZoneId { get; set; }
        public string NearByMac { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public string Xaxis { get; set; }
        public string Yaxis { get; set; }
        public string Process { get; set; }
        public string Result { get; set; }

    }

    public class QRLocations : TenantBase
    {
        public string HospitalId { get; set; }
        public string Process { get; set; }
        public string Result { get; set; }

    }
    public class AesOperation
    {
        public static string EncryptString(string plainText)
        {
            string key = "b14ca5898a4e4133bbce2ea2315a1916";
            byte[] iv = new byte[16];
            byte[] array;

            using (Aes aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(key);
                aes.IV = iv;

                ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

                using (MemoryStream memoryStream = new MemoryStream())
                {
                    using (CryptoStream cryptoStream = new CryptoStream((Stream)memoryStream, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter streamWriter = new StreamWriter((Stream)cryptoStream))
                        {
                            streamWriter.Write(plainText);
                        }

                        array = memoryStream.ToArray();
                    }
                }
            }

            return Convert.ToBase64String(array);
        }

        public static string DecryptString(string cipherText)
        {
            string key = "b14ca5898a4e4133bbce2ea2315a1916";
            byte[] iv = new byte[16];
            byte[] buffer = Convert.FromBase64String(cipherText);

            using (Aes aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(key);
                aes.IV = iv;
                ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

                using (MemoryStream memoryStream = new MemoryStream(buffer))
                {
                    using (CryptoStream cryptoStream = new CryptoStream((Stream)memoryStream, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader streamReader = new StreamReader((Stream)cryptoStream))
                        {
                            return streamReader.ReadToEnd();
                        }
                    }
                }
            }
        }
    }
    public class CommandExecuted
    {

        public string Result { get; set; }

    }

    public class MultiZoneObjs
    {
        public List<NrZones> Zonelist1 { get; set; }
        public List<NrZones> Zonelist2 { get; set; }
    }

    public class NrZones
    {
        public int Id { get; set; }
        public string Location { get; set; }

    }
    public class AllZones
    {
        public int Id { get; set; }
        public string Location { get; set; }
        public string NearByZoneID { get; set; }
        public List<NrZones> NrZoness { get; set; }
    }

    public class AdhocRequestCreate : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string PorterId { get; set; }
        [Required]
        public string RequestDate { get; set; }
        [Required]
        public string RequestTime { get; set; }
        public string EndTime { get; set; }


        public string From { get; set; }
        public string To { get; set; }

        [Required]
        public string Category { get; set; }

        public string RequestStatusId { get; set; }
        public string Remarks { get; set; }
        public string Process { get; set; }
        public string FromMac { get; set; }
        public string ToMac { get; set; }

        public string RemarksId { get; set; }

    }

    public class AdHocCompleteTask : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string RequestId { get; set; }
        [Required]
        public string PorterId { get; set; }

        public string RequestStatus { get; set; }
        public string To { get; set; }
        public string ToMac { get; set; }
        [Required]
        public string EndTime { get; set; }
        public string PorterRemarks { get; set; }
        public string RemarksId { get; set; }
        public string Process { get; set; }

    }

    public class GenHosPorter : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        [Required]
        public string UserId { get; set; }
        public string Process { get; set; }
    }
    public class ProMessages : TenantBase
    {
        [Required]
        public string HospitalId { get; set; }
        public string MessageId { get; set; }
        public string TreeId { get; set; }
        public string FromUserId { get; set; }
        public string ToUserId { get; set; }
        public string Messages { get; set; }
        public string Flag { get; set; }
        public string Process { get; set; }
    }




    public class RtnCleaningTaskList
    {
        public bool status { get; set; }
        public string message { get; set; }
        public CleaningTaskDetails data { get; set; }
    }


    public class CleaningTaskDetails
    {
        public List<Currentcleaningtask> CleaningTask { get; set; }
        public List<CleaningCheckList> CheckList { get; set; }

        public List<Previouscleaningtask> PreviousCleaningTask { get; set; }

        public List<OtherCleaningMessage> OtherMessage { get; set; }
    }


    public class OtherCleaningMessage
    {

        public string MsgId { get; set; }
        public string Message { get; set; }
    }

    public class CleaningCheckList
    {
        public string RequestId { get; set; }
        public string CleaningType { get; set; }
        public string CheckListId { get; set; }
        public string CheckListName { get; set; }
        public string InputType { get; set; }
        public string Mandatory { get; set; }

    }

    public class Currentcleaningtask
    {
        public string RequestId { get; set; }

        public string Location { get; set; }
        public string RequestStatus { get; set; }
        public string RequestDeskRemarks { get; set; }
        public string PatientName { get; set; }
        public string RequestorName { get; set; }
        public string PorterName { get; set; }
        public string RequestTime { get; set; }
        public string RequestStatusId { get; set; }
        public string MultiTaskFlag { get; set; }
        public string AssignedTime { get; set; }
        public string StartTime { get; set; }
        public string ThresholdForStartTime { get; set; }
        public string ThresholdForEndTime { get; set; }
        public string NoResponseTime { get; set; }
        public string RequestNo { get; set; }
        public string Priority { get; set; }
        public string StartLocationMac { get; set; }
        public string EndLocationMac { get; set; }
        public string PorterRemarks { get; set; }
        public string PorterId { get; set; }
        public string SubPorterId { get; set; }
        public string IsAdhoc { get; set; }

        public string IsMultiPorter { get; set; }
        public string PorterStartFlag { get; set; }
        public string SubPorterStartFlag { get; set; }
        public string PorterEndFlag { get; set; }
        public string SubPorterEndFlag { get; set; }
        public string CleaningType { get; set; }



        public string Result { get; set; }

    }
    public class Previouscleaningtask
    {
        public string RequestId { get; set; }
        public string RequestNo { get; set; }
        public string RequestStatus { get; set; }
    }

    public class GetReqDepIP
    {
        public string PatID { get; set; }
        public string HosID { get; set; }
    }

    public class SendFeedbackIP
    {
        public string patient_id { get; set; }
        public string hospital_id { get; set; }
        public string session_id { get; set; }
        public Dictionary<string, FeedbackDetailM> feedback_list { get; set; }
        public Dictionary<string, FeedbackDetailM> feedback { get; set; }
    }

    public class FeedbackDetailM
    {
        public string patient_feedback_summary { get; set; }
        public string feedback_summary { get; set; }
        public string ratings { get; set; }
    }

    public class FeedbackDepartmentModel
    {
        public string key { get; set; }
        public string description { get; set; }
    }

    public class FeedbackDepartmentData
    {
        public List<FeedbackDepartmentModel> Departments { get; set; }
    }

    public class AdtEventRequest
    {
        public int PatientId { get; set; }
        public string EventType { get; set; }
        public string NewRoom { get; set; }
        public string NewBed { get; set; }
        public string NewBedID { get; set; }
        public string Reason { get; set; }
    }

    public class FoodOrderAISlimRow
    {
        public string ROOMNO { get; set; }
        public string ITEMID { get; set; }
        public string ITEMNAME { get; set; }
        public string ITEMDESC { get; set; }
        public int QUANTITY { get; set; }
        public string ORDERTYPE { get; set; }
        public string MEALTYPE { get; set; }
        public string SPECIALINSTRUCTION { get; set; }
        public string ORDERBY { get; set; }
        public string ISPREORDER { get; set; }
        public int? CALORIES { get; set; }
    }

    public class FoodOrderAISlimRequest
    {
        public string HospitalId { get; set; }

        public List<FoodOrderAISlimRow> Orders { get; set; }
    }
    public class FeedbackDepartmentResponse
    {
        public bool status { get; set; }
        public string message { get; set; }
        public FeedbackDepartmentData data { get; set; }
    }

}