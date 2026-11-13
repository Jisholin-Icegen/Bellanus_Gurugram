using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Web.Services;

public class HospitalDto
{
    public string HospitalCode;
    public string DisplayName;
    public string Subtitle;
    public string LogoPath;
    public string TargetURL;
    public string LogoutURL;
    public int SortOrder;
}

public partial class Login : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);
        Response.Cache.SetNoStore();
    }


    [System.Web.Services.WebMethod]
    public static int GetIsMultiTenant()
    {
        int isMultiTenant = 0;
        try
        {
            using (var conn = new System.Data.SqlClient.SqlConnection(
                System.Configuration.ConfigurationManager.ConnectionStrings["CentralDB"].ConnectionString))
            using (var cmd = new System.Data.SqlClient.SqlCommand("dbo.SP_GET_APP_CONFIG", conn))
            {
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@APPNAME", "webapp");

                conn.Open();
                var result = cmd.ExecuteScalar();

                if (result != null && result != DBNull.Value)
                {
                    isMultiTenant = Convert.ToInt32(result);
                }
            }
        }
        catch
        {
            isMultiTenant = 0; 
        }
        return isMultiTenant;
    }

    [WebMethod]
    public static List<HospitalDto> GetHospitals()
    {
        var list = new List<HospitalDto>();

        using (var con = new SqlConnection(ConfigurationManager.ConnectionStrings["CentralDB"].ConnectionString))
        using (var cmd = new SqlCommand("dbo.SP_GET_HOSPITALS", con))
        {
            cmd.CommandType = CommandType.StoredProcedure;
            con.Open();

            using (var r = cmd.ExecuteReader())
            {
                while (r.Read())
                {
                    list.Add(new HospitalDto
                    {
                        HospitalCode = r["HospitalCode"].ToString(),
                        DisplayName = r["DisplayName"].ToString(),
                        Subtitle = r["Subtitle"].ToString(),
                        LogoPath = r["LogoPath"].ToString(),
                        TargetURL = r["TargetURL"].ToString(),
                        LogoutURL = r["LogoutURL"].ToString(),
                        SortOrder = Convert.ToInt32(r["SortOrder"])
                    });
                }
            }
        }
        return list;
    }

}