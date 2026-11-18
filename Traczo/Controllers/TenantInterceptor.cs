using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Traczo.Models;

namespace Traczo.Controllers
{
    public class TenantInterceptorAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext ctx)
        {
            try
            {
                if (ctx.ActionDescriptor.GetCustomAttributes<SkipTenantAttribute>().Any())
                {
                    SetTenant(ctx, "van");
                    return;
                }

                if (!TenantModeConfig.IsMultiTenant)
                {
                    SetTenant(ctx, "van", "1");
                    return;
                }

                string raw = GetRawTenant(ctx);
                if (string.IsNullOrEmpty(raw))
                {
                    ctx.Response = ctx.Request.CreateErrorResponse(
                        HttpStatusCode.Unauthorized, "X-Tenant-ID header is required.");
                    return;
                }

                string decrypted;
                try { decrypted = AesOperation.DecryptString(raw.Replace(" ", "+")); }
                catch
                {
                    ctx.Response = ctx.Request.CreateErrorResponse(
                        HttpStatusCode.Unauthorized, "Invalid Tenant ID in header.");
                    return;
                }

                string resolved = ResolveHospitalConnection(decrypted, out string hospitalId);
                if (string.IsNullOrEmpty(resolved))
                {
                    ctx.Response = ctx.Request.CreateErrorResponse(
                        HttpStatusCode.Unauthorized, "Invalid Tenant ID: Database not found.");
                    return;
                }

                SetTenant(ctx, resolved, hospitalId);
            }
            catch (Exception ex)
            {
                Trace.TraceError("[Tenant] " + ex);
                ctx.Response = ctx.Request.CreateErrorResponse(
                    HttpStatusCode.InternalServerError, "Tenant resolution failed.");
            }
        }

        private static void SetTenant(HttpActionContext ctx, string dbName, string hospitalId = "")
        {
            ctx.Request.Properties["XTenantConnStr"] = dbName;
            ctx.Request.Properties["XTenantHospitalId"] = hospitalId;
            if (HttpContext.Current != null)
            {
                HttpContext.Current.Items["XTenantConnStr"] = dbName;
                HttpContext.Current.Items["XTenantHospitalId"] = hospitalId;
            }
        }

        private static string GetRawTenant(HttpActionContext ctx)
        {
            var header = ctx.Request.Headers.FirstOrDefault(x =>
                x.Key.Equals("X-Tenant-ID", StringComparison.OrdinalIgnoreCase));
            if (header.Value != null && header.Value.Any()) return header.Value.First();
            return null;
        }

        private string ResolveHospitalConnection(string tenant)
        {
            return ResolveHospitalConnection(tenant, out _);
        }

        private string ResolveHospitalConnection(string tenant, out string hospitalId)
        {
            hospitalId = "";
            if (string.IsNullOrWhiteSpace(tenant)) return null;
            if (tenant.Contains("$$"))
                tenant = tenant.Split(new[] { "$$" }, StringSplitOptions.None)[0].Trim();

            string dbName = null;
            int hid = 0;
            string hintDb = null;
            var parts = tenant.Split('_');
            if (parts.Length > 1 && int.TryParse(parts[0], out hid))
            {
                hospitalId = hid.ToString();
                hintDb = parts[1];
            }
            else if (int.TryParse(tenant, out hid))
            {
                hospitalId = hid.ToString();
            }

            if (hid > 0)
            {
                var entry = ConfigurationManager.ConnectionStrings["CentralDB"];
                if (entry == null) return null;
                using (var conn = new SqlConnection(entry.ConnectionString))
                using (var cmd = new SqlCommand("dbo.SP_GET_HOSPITAL_BY_ID", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@HospitalId", hid);
                    conn.Open();
                    var r = cmd.ExecuteScalar();
                    if (r != null && r != DBNull.Value)
                    {
                        var s = r.ToString().Trim();
                        if (s.IndexOf("Data Source=", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            s.IndexOf("Initial Catalog=", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            s.IndexOf("Server=", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            return s;
                        }
                        var p = s.Split('_');
                        dbName = p.Length > 1 ? p[1] : s;
                    }
                }

                if (string.IsNullOrEmpty(dbName) && !string.IsNullOrEmpty(hintDb))
                    dbName = hintDb;
            }
            else
            {
                var p = tenant.Split('_');
                dbName = p.Length > 1 ? p[1] : tenant;
            }

            if (!string.IsNullOrEmpty(dbName))
            {
                var e = ConfigurationManager.ConnectionStrings[dbName];
                if (e != null && !string.IsNullOrEmpty(e.ConnectionString)) return dbName;
                if (dbName.IndexOf("Data Source=", StringComparison.OrdinalIgnoreCase) >= 0 ||
                    dbName.IndexOf("Initial Catalog=", StringComparison.OrdinalIgnoreCase) >= 0)
                    return dbName;
            }
            return null;
        }
    }
}