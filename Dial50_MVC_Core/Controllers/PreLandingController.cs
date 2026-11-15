using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Dial50_MVC_Core.Controllers
{
    public class PreLandingController : Controller
    {
        private readonly IPatientRepository _patientRepository;
        private readonly LandingProtector _protector;
        private readonly HospitalSettings _hospital;
        private readonly IConfiguration _config;
        private readonly ILogger<PreLandingController> _logger;

        public PreLandingController(
            IPatientRepository patientRepository,
            LandingProtector protector,
            IOptions<HospitalSettings> hospitalOptions,
            IConfiguration config,
            ILogger<PreLandingController> logger)
        {
            _patientRepository = patientRepository;
            _protector = protector;
            _hospital = hospitalOptions.Value;
            _config = config;
            _logger = logger;
        }

        public async Task<IActionResult> Index(string? BedInfo, [FromQuery(Name = "XTenentID")] string? XTenentID)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(BedInfo))
                    return RenderInvalid();

                bool isMultiTenant = IsMultiTenantApp();

                if (isMultiTenant && string.IsNullOrWhiteSpace(XTenentID))
                {
                    _logger.LogWarning("PreLanding: Blocked. Multi-tenant is ON but XTenentID is missing in URL.");
                    return RenderInvalid();
                }

                if (!string.IsNullOrWhiteSpace(XTenentID))
                {
                    HttpContext.Session.SetString("XTenentID", XTenentID);
                }

                string bedInfoActual = BedInfo;

                try
                {
                    var fixedBedInfo = BedInfo.Replace(" ", "+");
                    var decrypted = _protector.DecryptAES(fixedBedInfo);
                    if (!string.IsNullOrWhiteSpace(decrypted))
                    {
                        bedInfoActual = decrypted;
                    }
                }
                catch { }

                string bedId = bedInfoActual.Contains("$$") ? bedInfoActual.Split("$$")[0] : bedInfoActual;

                var patient = await _patientRepository.GetPatientBedDetailsByBedIdAsync(bedId);

                if (patient == null || string.IsNullOrEmpty(patient.PatientName))
                    return RenderInvalid();

                string bedNumber = patient.RoomBed ?? "";

                string bedInfoForHome = _protector.EncryptAES(
                    patient.BedId + "$$" + patient.BedId + "$$" + bedNumber + "$$"
                    + patient.PatientName + "$$" + _hospital.Name);

                ViewBag.IsInvalid = false;
                ViewBag.bedInfoEncrypt = Uri.EscapeDataString(bedInfoForHome);
                ViewBag.BedId = patient.BedId;
                ViewBag.TenantId = XTenentID ?? HttpContext.Session.GetString("XTenentID");
                ViewBag.Region = "IN";
                ViewBag.HospitalName = _hospital.Name;
                ViewBag.HospitalLogo = _hospital.LogoPath;

                var model = new List<BedInfo>
                {
                    new BedInfo
                    {
                        BedID        = patient.BedId,
                        BedIDHIS     = patient.BedId,
                        BedNumber    = bedNumber,
                        PatientName  = patient.PatientName,
                        HospitalName = _hospital.Name
                    }
                };

                return View("Index", model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PreLanding: Unhandled error");
                return RenderInvalid();
            }
        }

        private IActionResult RenderInvalid()
        {
            ViewData["Title"] = "Invalid QR Code - " + _hospital.Name;
            ViewBag.IsInvalid = true;
            ViewBag.bedInfoEncrypt = "";
            ViewBag.BedId = "";
            ViewBag.TenantId = "";
            ViewBag.Region = "IN";
            ViewBag.HospitalName = _hospital.Name;
            ViewBag.HospitalLogo = _hospital.LogoPath;
            return View("Index", new List<BedInfo>());
        }

        public IActionResult Invalid() => RenderInvalid();

        public IActionResult Logout(string? BedInfo)
        {
            ViewData["Title"] = "Session Ended - " + _hospital.Name;
            ViewBag.HospitalName = _hospital.Name;
            ViewBag.HospitalLogo = _hospital.LogoPath;
            ViewBag.IsInvalid = false;
            ViewBag.BedId = "";
            ViewBag.TenantId = "";
            ViewBag.Region = "IN";

            var model = new List<BedInfo>();

            if (!string.IsNullOrWhiteSpace(BedInfo))
            {
                var decrypted = _protector.DecryptAES(BedInfo);

                if (!string.IsNullOrWhiteSpace(decrypted))
                {
                    if (decrypted.Contains("$$"))
                    {
                        var parts = decrypted.Split("$$", StringSplitOptions.None);
                        string bedId = parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]) ? parts[1] : parts[0];
                        string bedNumber = parts.Length > 2 ? parts[2] : "";
                        string patientName = parts.Length > 3 ? parts[3] : "";

                        model.Add(new BedInfo
                        {
                            BedID = bedId,
                            BedIDHIS = bedId,
                            BedNumber = bedNumber,
                            PatientName = patientName,
                            HospitalName = _hospital.Name
                        });
                    }
                    else
                    {
                        model.Add(new BedInfo
                        {
                            BedID = decrypted,
                            BedIDHIS = decrypted,
                            BedNumber = "",
                            PatientName = "",
                            HospitalName = _hospital.Name
                        });
                    }
                }
                else
                {
                    model.Add(new BedInfo
                    {
                        BedID = BedInfo,
                        BedIDHIS = BedInfo,
                        BedNumber = "",
                        PatientName = "",
                        HospitalName = _hospital.Name
                    });
                }
            }

            return View("Logout", model);
        }

        private bool IsMultiTenantApp()
        {
            try
            {
                string centralConn = _config.GetConnectionString("CentralDB") ?? _config.GetConnectionString("Dial50");
                if (string.IsNullOrEmpty(centralConn)) return false;

                using (var conn = new SqlConnection(centralConn))
                using (var cmd = new SqlCommand("dbo.SP_GET_APP_CONFIG", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@APPNAME", "qr_app");
                    conn.Open();

                    var result = cmd.ExecuteScalar();
                    if (result != null && result != DBNull.Value)
                    {
                        return Convert.ToInt32(result) == 1;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PreLanding: Error checking APP_CONFIG. Defaulting to single-tenant.");
            }
            return false;
        }
    }
}