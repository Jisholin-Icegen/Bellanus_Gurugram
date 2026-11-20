using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json.Serialization;

namespace Dial50_MVC_Core.Services
{
    public class BedContext
    {
        public string BedInfo { get; set; } = "";
        public string Region { get; set; } = "IN";
        public bool IsValid { get; set; }
        public string BedId { get; set; } = "";
        public string UserId => BedId;
        public string BedIdHis { get; set; } = "";
        public bool HasPatient { get; set; }
        public string PatientName { get; set; } = "";
        public string RoomNumber { get; set; } = "";
        public string BedNumber { get; set; } = "";
        public string RoomBed { get; set; } = "";
        public string Ward { get; set; } = "";
        public string Uhid { get; set; } = "";
        public string Gender { get; set; } = "";
        public string Age { get; set; } = "";
        public string DietType { get; set; } = "";
        public string Allergies { get; set; } = "";

        [JsonPropertyName("tier")]
        public string Tier { get; set; } = "";

        [JsonPropertyName("tierCode")]
        public string TierCode { get; set; } = "";

        [JsonPropertyName("tierLevel")]
        public string TierLevel { get; set; } = "";

        public string HospitalName { get; set; } = "";
        public string HospitalLogo { get; set; } = "";
    }

    public class BedToken
    {
        public bool Decrypted { get; set; }
        public bool IsValid { get; set; }
        public string BedId { get; set; } = "";
        public string BedNumber { get; set; } = "";
    }

    public interface IBedContextAccessor
    {
        BedContext Current { get; }
        Task<BedContext> ResolveAsync(string? bedInfoToken, string? region);
        BedToken ParseToken(string? token);
    }

    public class BedContextAccessor : IBedContextAccessor
    {
        private const string ItemKey = "__BedContext";
        private readonly IHttpContextAccessor _http;
        private readonly LandingProtector _protector;
        private readonly IPatientRepository _patientRepository;
        private readonly HospitalSettings _hospital;
        private readonly ILogger<BedContextAccessor> _logger;

        public BedContextAccessor(IHttpContextAccessor http,
                                  LandingProtector protector,
                                  IPatientRepository patientRepository,
                                  IOptions<HospitalSettings> hospitalOptions,
                                  ILogger<BedContextAccessor> logger)
        {
            _http = http;
            _protector = protector;
            _patientRepository = patientRepository;
            _hospital = hospitalOptions.Value;
            _logger = logger;
        }

        public BedContext Current
        {
            get
            {
                var items = _http.HttpContext?.Items;
                if (items != null && items.TryGetValue(ItemKey, out var cached) && cached is BedContext c)
                    return c;

                return new BedContext { HospitalName = _hospital.Name ?? "", HospitalLogo = _hospital.LogoPath ?? "" };
            }
        }

        public BedToken ParseToken(string? token)
        {
            var result = new BedToken { BedId = token ?? "" };
            if (string.IsNullOrWhiteSpace(token))
                return result;

            try
            {
                var decrypted = _protector.DecryptAES(token);

                if (!string.IsNullOrWhiteSpace(decrypted))
                {
                    var parts = decrypted.Split("$$", StringSplitOptions.None);

                    if (decrypted.Contains("$$"))
                    {
                        result.BedId = !string.IsNullOrWhiteSpace(parts[0]) ? parts[0] : parts[1];
                    }
                    else
                    {
                        result.BedId = decrypted;
                    }

                    result.BedNumber = parts.Length > 2 && !string.IsNullOrEmpty(parts[2])
                                       ? parts[2]
                                       : parts[0];
                    result.Decrypted = true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "BedInfo token could not be decrypted");
            }

            result.IsValid = !string.IsNullOrWhiteSpace(result.BedId)
                             && (result.Decrypted || long.TryParse(result.BedId, out _));
            return result;
        }

        public async Task<BedContext> ResolveAsync(string? bedInfoToken, string? region)
        {
            var httpCtx = _http.HttpContext;
            if (httpCtx != null && httpCtx.Items.TryGetValue(ItemKey, out var cached) && cached is BedContext done)
                return done;

            var ctx = new BedContext
            {
                BedInfo = bedInfoToken ?? "",
                Region = string.IsNullOrEmpty(region) ? "IN" : region,
                HospitalName = _hospital.Name ?? "",
                HospitalLogo = _hospital.LogoPath ?? ""
            };

            var token = ParseToken(bedInfoToken);
            ctx.IsValid = token.IsValid;
            ctx.BedId = token.IsValid ? token.BedId : "";

            if (ctx.IsValid)
            {
                PatientBedDetails? patient = null;
                try
                {
                    patient = await _patientRepository.GetPatientBedDetailsByBedIdAsync(ctx.BedId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to load patient for BedId={BedId}", ctx.BedId);
                }

                if (patient != null)
                {
                    ctx.BedIdHis = Convert.ToString(patient.BedId) ?? "";
                    ctx.PatientName = Convert.ToString(patient.PatientName) ?? "";
                    ctx.RoomNumber = Convert.ToString(patient.RoomNumber) ?? "";
                    ctx.BedNumber = Convert.ToString(patient.Bed) ?? "";
                    ctx.RoomBed = Convert.ToString(patient.RoomBed) ?? "";
                    ctx.Ward = Convert.ToString(patient.Ward) ?? "";
                    ctx.Uhid = Convert.ToString(patient.Uhid) ?? "";
                    ctx.Gender = Convert.ToString(patient.Gender) ?? "";
                    ctx.Age = Convert.ToString(patient.Age) ?? "";
                    ctx.DietType = Convert.ToString(patient.DietType) ?? "";
                    ctx.Allergies = Convert.ToString(patient.Allergies) ?? "";
                    ctx.Tier = Convert.ToString(patient.TierName) ?? "";
                    ctx.TierCode = Convert.ToString(patient.TierCode) ?? "";
                    ctx.TierLevel = Convert.ToString(patient.TierLevel) ?? "";
                    ctx.HasPatient = !string.IsNullOrEmpty(ctx.PatientName);
                }
            }

            if (httpCtx != null) httpCtx.Items[ItemKey] = ctx;
            return ctx;
        }
    }

    public class BedContextFilter : IAsyncActionFilter
    {
        private readonly IBedContextAccessor _accessor;
        public BedContextFilter(IBedContextAccessor accessor) => _accessor = accessor;

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var query = context.HttpContext.Request.Query;
            var token = query["BedInfo"].ToString();
            var tenantId = query["XTenantID"].ToString();
            var httpContext = context.HttpContext;

            if (httpContext.Session != null)
            {
                if (!string.IsNullOrWhiteSpace(tenantId))
                {
                    httpContext.Session.SetString("XTenantID", tenantId);
                    httpContext.Session.SetString("XTenentID", tenantId);
                }
                else
                {
                    tenantId = httpContext.Session.GetString("XTenantID")
                        ?? httpContext.Session.GetString("XTenentID")
                        ?? "";
                }
            }

            if (!string.IsNullOrWhiteSpace(token) && context.Controller is Controller c)
            {
                var b = await _accessor.ResolveAsync(token, query["region"].ToString());

                c.ViewBag.BedContext = b;
                c.ViewBag.bedInfo = b.BedInfo;
                c.ViewBag.BedId = b.BedId;
                c.ViewBag.UserId = b.UserId;
                c.ViewBag.Region = b.Region;
                c.ViewBag.PatientName = b.PatientName;
                c.ViewBag.RoomNumber = b.RoomNumber;
                c.ViewBag.BedNumber = b.BedNumber;
                c.ViewBag.RoomBed = b.RoomBed;
                c.ViewBag.Ward = b.Ward;
                c.ViewBag.Uhid = b.Uhid;
                c.ViewBag.Gender = b.Gender;
                c.ViewBag.Age = b.Age;
                c.ViewBag.DietType = b.DietType;
                c.ViewBag.Allergies = b.Allergies;
                c.ViewBag.HasPatient = b.HasPatient;
                c.ViewBag.HospitalName = b.HospitalName;
                c.ViewBag.HospitalLogo = b.HospitalLogo;
                c.ViewBag.Tier = b.Tier;
                c.ViewBag.TierCode = b.TierCode;
                c.ViewBag.TierLevel = b.TierLevel;
                c.TempData["Region"] = b.Region;
            }

            if (context.Controller is Controller controller)
            {
                controller.ViewBag.TenantId = tenantId;
            }

            await next();
        }
    }
}