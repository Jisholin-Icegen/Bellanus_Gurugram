using System;
using System.Collections.Concurrent;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using System.Web;

public static class Tenant
{
    class Entry { public string Conn; public DateTime Exp; }
    static readonly ConcurrentDictionary<string, Entry> Cache =
        new ConcurrentDictionary<string, Entry>(StringComparer.OrdinalIgnoreCase);

    public static string GetConnectionString(string code)
    {
        if (string.IsNullOrWhiteSpace(code)) return null;

        Entry e;
        if (Cache.TryGetValue(code, out e) && e.Exp > DateTime.UtcNow) return e.Conn;

        string conn;
        using (var con = new SqlConnection(ConfigurationManager.ConnectionStrings["CentralDB"].ConnectionString))
        using (var cmd = new SqlCommand("dbo.SP_GET_HOSPITAL_CONNECTION", con) { CommandType = CommandType.StoredProcedure })
        {
            cmd.Parameters.AddWithValue("@HospitalCode", code);
            con.Open();
            conn = cmd.ExecuteScalar() as string;
        }
        if (string.IsNullOrEmpty(conn)) return null;

        Cache[code] = new Entry { Conn = conn, Exp = DateTime.UtcNow.AddMinutes(5) };
        return conn;
    }

    public static string CurrentCode
    {
        get
        {
            var ctx = HttpContext.Current;
            if (ctx == null) return null;

            var c = ctx.Items["HOSPITAL"] as string;
            if (!string.IsNullOrEmpty(c)) return c;

            return (ctx.Session != null) ? ctx.Session["HOSPITAL"] as string : null;
        }
    }

    public static string ConnectionString
    {
        get
        {
            var code = CurrentCode;
            if (!string.IsNullOrEmpty(code))
            {
                var cs = GetConnectionString(code);
                if (cs != null) return cs;
            }
            return ConfigurationManager.ConnectionStrings["cineConn"].ConnectionString;
        }
    }

    public static SqlConnection Open()
    {
        var con = new SqlConnection(ConnectionString);
        con.Open();
        return con;
    }

    public static void ResolveFromRequest(HttpRequest req)
    {
        string enc = req.Headers["X-Hospital"];
        if (string.IsNullOrEmpty(enc)) enc = req["HOSPITAL"];

        if (!string.IsNullOrEmpty(enc))
        {
            try
            {
                string code = Decrypt(enc);
                if (GetConnectionString(code) != null)
                {
                    HttpContext.Current.Items["HOSPITAL"] = code;

                    if (HttpContext.Current.Session != null)
                    {
                        HttpContext.Current.Session["HOSPITAL"] = code;
                    }
                }
            }
            catch { }
        }
    }

    public static string Decrypt(string b64)
    {
        byte[] data = Convert.FromBase64String(b64.Replace(' ', '+'));
        using (var aes = Aes.Create())
        {
            aes.Key = Encoding.UTF8.GetBytes(ConfigurationManager.AppSettings["CryptoKey"]);
            aes.IV = Encoding.UTF8.GetBytes(ConfigurationManager.AppSettings["CryptoIV"]);
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            using (var dec = aes.CreateDecryptor())
                return Encoding.UTF8.GetString(dec.TransformFinalBlock(data, 0, data.Length));
        }
    }
}