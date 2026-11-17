using Microsoft.Extensions.Caching.Memory;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using System;
using System.Data;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Dial50_MVC_Core.Controllers
{
    public class LoginController : Controller
    {
        private readonly IBedService _bedService;
        private readonly IPatientRepository _patientRepository;
        private readonly LandingProtector _protector;
        private readonly IMemoryCache _cache;
        private readonly ILogger<LoginController> _logger;
        private readonly IConfiguration _config;

        public LoginController(
            IBedService bedService,
            IPatientRepository patientRepository,
            LandingProtector protector,
            IMemoryCache cache,
            ILogger<LoginController> logger,
            IConfiguration config)
        {
            _bedService = bedService;
            _patientRepository = patientRepository;
            _protector = protector;
            _cache = cache;
            _logger = logger;
            _config = config;
        }

        [HttpGet]
        public IActionResult Index(string? XTenantID)
        {
            bool isMultiTenant = IsMultiTenantApp();
            string encryptedTenantId = ResolveAndPersistTenantId(XTenantID);

            if (string.IsNullOrWhiteSpace(XTenantID) && !string.IsNullOrWhiteSpace(encryptedTenantId))
            {
                return RedirectToAction("Index", new { XTenantID = encryptedTenantId });
            }

            if (string.IsNullOrWhiteSpace(encryptedTenantId) && isMultiTenant)
            {
                _logger.LogWarning("Login GET: Multi-tenant is ON, but no XTenantID in URL or Cookie.");
            }

            ViewData["XTenantID"] = encryptedTenantId;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(string roomNumber, string? XTenantID)
        {
            string encryptedTenantId = ResolveAndPersistTenantId(XTenantID);
            ViewData["XTenantID"] = encryptedTenantId;

            roomNumber = roomNumber?.Trim();
            bool isMultiTenant = IsMultiTenantApp();

            _logger.LogInformation("Login POST: isMultiTenant={Multi}, XTenantID='{Tenant}', Room='{Room}'", isMultiTenant, encryptedTenantId, roomNumber);

            if (isMultiTenant && string.IsNullOrWhiteSpace(encryptedTenantId))
            {
                _logger.LogWarning("Login POST: Blocked. Multi-tenant is ON but XTenantID is missing.");
                ViewData["Error"] = "Hospital identity is missing. Please use the proper link.";
                return View();
            }

            if (string.IsNullOrWhiteSpace(roomNumber))
            {
                ViewData["Error"] = "Please enter a room number.";
                return View();
            }

            if (!Regex.IsMatch(roomNumber, @"^[A-Za-z0-9\- ]{1,20}$"))
            {
                ViewData["Error"] = "Please enter a valid room number.";
                ViewData["RoomNumber"] = roomNumber;
                return View();
            }

            try
            {
                var patient = await _bedService.LoginByRoomNoAsync(roomNumber);

                if (patient == null || patient.PatientId == 0 || patient.BedId == null)
                {
                    _logger.LogWarning("Login POST: Room not found for '{Room}'.", roomNumber);
                    ViewData["Error"] = "Room not found. Please check your details.";
                    ViewData["RoomNumber"] = roomNumber;
                    return View();
                }

                var patientDetails = await _patientRepository.GetPatientBedDetailsByBedIdAsync(patient.BedId.ToString());

                if (patientDetails == null || string.IsNullOrEmpty(patientDetails.PatientName))
                {
                    _logger.LogWarning("Login POST: Patient details not found for BedId={BedId}.", patient.BedId);
                    ViewData["Error"] = "Patient details not found.";
                    ViewData["RoomNumber"] = roomNumber;
                    return View();
                }

                string bedNumber = patientDetails.RoomBed ?? (patient.ROOM + " " + patient.BED);

                string encryptedBedInfo = _protector.EncryptAES(
                    patientDetails.BedId + "$$" + patientDetails.BedId + "$$" + bedNumber + "$$"
                    + patientDetails.PatientName + "$$" + "IHH Healthcare");

                var newToken = Guid.NewGuid().ToString();
                _cache.Set("ActiveSession_" + patientDetails.BedId.ToString(), newToken, TimeSpan.FromHours(12));

                string redirectUrl = $"/PreLanding?BedInfo={Uri.EscapeDataString(encryptedBedInfo)}";
                if (!string.IsNullOrEmpty(encryptedTenantId))
                {
                    redirectUrl += $"&XTenantID={Uri.EscapeDataString(encryptedTenantId)}";
                }

                _logger.LogInformation("Login POST: Success for BedId={BedId}. Redirecting to '{Url}'", patient.BedId, redirectUrl);

                return Redirect(redirectUrl);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Login POST: Database error. Could not find SP or connection issue.");
                ViewData["Error"] = "Hospital identity is missing. Please use the proper link.";
                ViewData["RoomNumber"] = roomNumber;
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login POST: Unhandled exception.");
                ViewData["Error"] = "An unexpected error occurred. Please try again.";
                ViewData["RoomNumber"] = roomNumber;
                return View();
            }
        }

        private string ResolveAndPersistTenantId(string? tenantIdInput)
        {
            string tenantId = !string.IsNullOrWhiteSpace(tenantIdInput)
                ? tenantIdInput.Trim()
                : (Request.Cookies["XTenantID"] ?? "");

            if (string.IsNullOrWhiteSpace(tenantId))
                return "";

            string encryptedTenantId = int.TryParse(tenantId, out _)
                ? AesOperation.EncryptString($"{tenantId}$${tenantId}$$$$$$")
                : tenantId.Replace(" ", "+");

            Response.Cookies.Append("XTenantID", encryptedTenantId, new CookieOptions
            {
                Path = "/",
                HttpOnly = false,
                IsEssential = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return encryptedTenantId;
        }

        private bool IsMultiTenantApp()
        {
            try
            {
                string centralConn = _config.GetConnectionString("CentralDB") ?? _config.GetConnectionString("Dial50");
                if (string.IsNullOrEmpty(centralConn))
                {
                    _logger.LogWarning("Login: CentralDB or Dial50 connection string is missing. Defaulting to single-tenant.");
                    return false;
                }

                using (var conn = new SqlConnection(centralConn))
                using (var cmd = new SqlCommand("dbo.SP_GET_APP_CONFIG", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@APPNAME", "qr_app");
                    conn.Open();

                    var result = cmd.ExecuteScalar();
                    if (result != null && result != DBNull.Value)
                    {
                        bool isMulti = Convert.ToInt32(result) == 1;
                        _logger.LogInformation("Login: SP_GET_APP_CONFIG returned {Result}. IsMultiTenant={IsMulti}", result, isMulti);
                        return isMulti;
                    }
                    else
                    {
                        _logger.LogWarning("Login: SP_GET_APP_CONFIG returned NULL. Defaulting to single-tenant.");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login: Error checking APP_CONFIG. Defaulting to single-tenant.");
            }
            return false;
        }
    }
}