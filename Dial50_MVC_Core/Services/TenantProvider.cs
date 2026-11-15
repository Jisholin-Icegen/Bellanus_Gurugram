using Dial50_MVC_Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Data;

namespace Dial50_MVC_Core.Services
{
    public class TenantProvider
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _config;
        private readonly ILogger<TenantProvider> _logger;

        public TenantProvider(IHttpContextAccessor httpContextAccessor, IConfiguration config, ILogger<TenantProvider> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _config = config;
            _logger = logger;
        }

        public string GetConnectionString()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null) return GetFallbackConnectionString();

            string centralConn = _config.GetConnectionString("CentralDB") ?? _config.GetConnectionString("Dial50");
            if (string.IsNullOrEmpty(centralConn)) return GetFallbackConnectionString();

            if (!IsMultiTenantApp(centralConn))
            {
                _logger.LogInformation("TenantProvider: App is in single-tenant mode (qr_app=0). Using Dial50.");
                return GetFallbackConnectionString();
            }

            string tenantId = "";

            if (context.Request.QueryString.HasValue)
            {
                var queryParams = System.Web.HttpUtility.ParseQueryString(context.Request.QueryString.Value);
                tenantId = queryParams["XTenentID"];
            }

            if (string.IsNullOrEmpty(tenantId))
            {
                tenantId = context.Session.GetString("XTenentID");
                if (string.IsNullOrEmpty(tenantId)) return GetFallbackConnectionString();
            }
            else
            {
                context.Session.SetString("XTenentID", tenantId);
            }

            string finalCode = tenantId;

            try
            {
                var protector = context.RequestServices.GetService(typeof(LandingProtector)) as LandingProtector;
                if (protector != null)
                {
                    string fixedEncryptedId = tenantId.Replace(" ", "+");
                    string decryptedCode = protector.DecryptAES(fixedEncryptedId);
                    if (!string.IsNullOrWhiteSpace(decryptedCode))
                    {
                        finalCode = decryptedCode;
                    }
                }
            }
            catch
            {
            }

            if (int.TryParse(finalCode, out int hospitalId))
            {
                try
                {
                    using (var conn = new SqlConnection(centralConn))
                    using (var cmd = new SqlCommand("dbo.SP_GET_HOSPITAL_BY_ID", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@HospitalId", hospitalId);
                        conn.Open();
                        var result = cmd.ExecuteScalar();

                        if (result != null && result != DBNull.Value)
                        {
                            _logger.LogInformation($"TenantProvider: Found DB for HospitalId {hospitalId}.");
                            return result.ToString();
                        }
                        else
                        {
                            _logger.LogError($"TenantProvider: SP returned NULL for HospitalId {hospitalId}.");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"TenantProvider: Error calling SP - {ex.Message}");
                }
            }
            else
            {
                _logger.LogError($"TenantProvider: Could not parse '{finalCode}' to an integer ID.");
            }

            return GetFallbackConnectionString();
        }

        private bool IsMultiTenantApp(string centralConn)
        {
            try
            {
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
                _logger.LogError($"TenantProvider: Failed to read APP_CONFIG - {ex.Message}");
            }
            return false;
        }

        private string GetFallbackConnectionString()
        {
            return _config.GetConnectionString("Dial50");
        }
    }
}