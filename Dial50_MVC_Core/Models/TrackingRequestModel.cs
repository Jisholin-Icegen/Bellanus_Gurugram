using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

[Keyless]
public class TrackingRequestModel
{
    public string? RequestNo { get; set; }
    public string? PorterName { get; set; }
    public int? PorterId { get; set; }
    public string? SUBPorterName { get; set; }
    public int? SUBPorterId { get; set; }
    public string? PorterImage { get; set; }
    public string? SUBPorterImage { get; set; }
    public string? RequestStatus { get; set; }
    public string? RequestStatusId { get; set; }

    [Column("FROM")]
    public string? FROM { get; set; }

    [Column("TO")]
    public string? TO { get; set; }

    public string? CategoryName { get; set; }
    public string? CategoryDescription { get; set; }
    public DateTime? RequestDate { get; set; }
    public string? Eta { get; set; }
    public string? TaskTypeId { get; set; }
    public int? rating { get; set; }
    public int? ID { get; set; }
    public int? PATIENTID { get; set; }
    public int? ITEMID { get; set; }
    public string? ITEMNAME { get; set; }
    public string? ITEMDESC { get; set; }
    public int? QUANTITY { get; set; }
    public string? ORDERTYPE { get; set; }
    public string? MEALTYPE { get; set; }
    public string? SPECIALINSTRUCTION { get; set; }
    public string? ORDERBY { get; set; }
    public DateTime? ORDERDATE { get; set; }
    public DateTime? CREATEDON { get; set; }
    public int? ISPREORDER { get; set; }
    public int? ISAUTO { get; set; }
    public string? STATUS { get; set; }
    public string? ESTIMATED_TIME { get; set; }
    public string? CUSTOMER_NAME { get; set; }
    public string? TrackingPorterId { get; set; }
    public string? ETA_Display { get; set; }
    public string? HHMM { get; set; }
    public string? DeviceId { get; set; }
    public DateTime? LastUpdatedTime { get; set; }
    public string? Xaxis { get; set; }
    public string? Yaxis { get; set; }
    public int? FloorId { get; set; }
    public string? FloorName { get; set; }
    public string? Location { get; set; }
    public bool IsFound { get; set; } = false;
}

public class SubmitRatingResult
{
    public int Success { get; set; }
    public string Code { get; set; } = "";
    public string Message { get; set; } = "";
}