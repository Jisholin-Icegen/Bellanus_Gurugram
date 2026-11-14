
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Traczo.Models
{
    public class DataAccess
    {
        public const string HosIdC = "van";

        public static DataTable GetProfileDA(GetProfileIP req, string process)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GetProfilePatientDetails", Con);                
                cmd.Parameters.AddWithValue("@UserId", req.userId);//bedid
                cmd.Parameters.AddWithValue("@PROCESS", process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "ConversationUpdateJdDA " + req.userId, HosIdC); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataSet SaveFeedbackBulk(
    string convId,
    string userId,
    List<FeedbackItemReq> feedbackList)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("ConvId");
            dt.Columns.Add("UserId");
            dt.Columns.Add("Department");
            dt.Columns.Add("Rating");
            dt.Columns.Add("Remarks");

            foreach (var item in feedbackList)
            {
                dt.Rows.Add(convId, userId, item.Department, item.Rating, item.Remarks);
            }

            using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString()))
            using (SqlCommand cmd = new SqlCommand("SP_SAVE_FEEDBACK_BULK_INSERT", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@FeedbackDataJD", dt);

                SqlDataAdapter da = new SqlDataAdapter(cmd);
                DataSet ds = new DataSet();
                da.Fill(ds);
                return ds;
            }
        }
        public static DataTable FeedbackJdDA(FeedbackIp req, string process)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("sp_UpdatePatientFeedback", Con);
                cmd.Parameters.AddWithValue("@RequestId", req.requestId);
                cmd.Parameters.AddWithValue("@ConversationId", req.convId);
                cmd.Parameters.AddWithValue("@Rating", req.rating);
                cmd.Parameters.AddWithValue("@Remarks", req.remarks);
                cmd.Parameters.AddWithValue("@PROCESS", process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "ConversationUpdateJdDA " + req.convId, HosIdC); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable ConversationUpdateJdDA(ConversationRequest req, string process)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("sp_ConversationInsert", Con);
                cmd.Parameters.AddWithValue("@ConversationId", req.convId);
                cmd.Parameters.AddWithValue("@Status", req.status);
                cmd.Parameters.AddWithValue("@FromLocation", req.user);
                cmd.Parameters.AddWithValue("@PROCESS", process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "ConversationUpdateJdDA " + req.convId, HosIdC); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataSet SaveQRcodeDA(string lid, string lname,string imgname, string process)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_SaveQRCode", Con);
                cmd.Parameters.AddWithValue("@LocationId", lid);
                cmd.Parameters.AddWithValue("@LocationName", lname);
                cmd.Parameters.AddWithValue("@Filename", imgname);
                cmd.Parameters.AddWithValue("@PROCESS", process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SaveQRcodeDAda " + lid, HosIdC); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable SaveAudioFileDA(string conversationId,string filename, string process)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_AudioTextAdd", Con);
                cmd.Parameters.AddWithValue("@ConversationId", conversationId);
                cmd.Parameters.AddWithValue("@Filename", filename);                 
                cmd.Parameters.AddWithValue("@PROCESS", process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_SaveAudioFileda " + conversationId, HosIdC); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static void UpdateToken(string AccessToken, string IssuedToken, string expiresToken, string UserId, string conStr)
        {
            SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_UpdateToken", con);
                cmd.Parameters.AddWithValue("@AccessToken", AccessToken);
                cmd.Parameters.AddWithValue("@IssuedToken", IssuedToken);
                cmd.Parameters.AddWithValue("@expiresToken", expiresToken);
                cmd.Parameters.AddWithValue("@UserId", UserId);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                if (con.State == ConnectionState.Closed)
                    con.Open();
                cmd.ExecuteNonQuery();
                con.Close();
            }
            catch (Exception ex) { DataAccess.InsertError(ex.ToString(), "authenticate UpdateToken ", "van"); }
            finally
            {
                if (con.State == ConnectionState.Open)
                    con.Close();
            }
        }
        public static void InsertError(string ErrMsg, string SpName, string conStr)
        {
            SqlConnection TmpCon = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            SqlCommand cmd = new SqlCommand("SP_ERRORLOG", TmpCon);
            cmd.Parameters.AddWithValue("@PROC", SpName);
            cmd.Parameters.AddWithValue("@ERRORMSG", ErrMsg);
            cmd.CommandType = CommandType.StoredProcedure;
            SqlDataAdapter adpt = new SqlDataAdapter(cmd);
            if (TmpCon.State == ConnectionState.Closed)
                TmpCon.Open();
            cmd.ExecuteNonQuery();
            TmpCon.Close();
        }

        public static DataTable RegisterDevice(RegisterDevice reg, string process, string hosid, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("RegisterDevice", Con);

                cmd.Parameters.AddWithValue("@HospitalId", hosid);
                cmd.Parameters.AddWithValue("@IMEINumber", reg.IMEINo);
                cmd.Parameters.AddWithValue("@Model", reg.DeviceModel);
                cmd.Parameters.AddWithValue("@DeviceName", reg.DeviceName);
                cmd.Parameters.AddWithValue("@AppType", reg.AppType);

                cmd.Parameters.AddWithValue("@ROOMNO", reg.LocationName);
                cmd.Parameters.AddWithValue("@FCMToken", reg.FCMToken);

                cmd.Parameters.AddWithValue("@PROCESS",reg.Process );//process


                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                if (Con.State == ConnectionState.Closed)
                    Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex)
            {
                InsertError(ex.Message, "RegisterDevice DA", conStr);
            }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable SGetBranches(string HostingUrl, string process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SGetBranches", Con);
                cmd.Parameters.AddWithValue("@HostingUrl", HostingUrl);
                cmd.Parameters.AddWithValue("@PROCESS", process);


                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                if (Con.State == ConnectionState.Closed)
                    Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex)
            {
                InsertError(ex.Message, "SP_REQUESTMASTER", "traczomain");
            }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable mgroad(string HostingUrl, string process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings["mgroad"].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("select * from requestmaster_r where convert(date,requestdate)=convert(date,getdate()-1)", Con);

                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                if (Con.State == ConnectionState.Closed)
                    Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex)
            {
                InsertError(ex.Message, "SP_REQUESTMASTER", "traczomain");
            }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }



        public static DataSet getPorterLocation(string porterid,string reqid,string conStr)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            SqlCommand cmd = new SqlCommand("[GetPorterLocationByporterid]", Con);
            cmd.CommandTimeout = 1000;
            cmd.Parameters.AddWithValue("@porterid", porterid);
            cmd.Parameters.AddWithValue("@requestid", reqid);

            SqlDataAdapter adpt = new SqlDataAdapter(cmd);
            cmd.CommandType = CommandType.StoredProcedure;
            try
            {
                
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex)
            {
                InsertError(ex.Message, "GetDepCategory", conStr); 
                dt = new DataSet();

            }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;

        }
        public static DataSet SaveFeedbackBulkJd(List<FeedbackItem> feedbackList)
        {
            DataSet ds = new DataSet();

            using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString()))
            using (SqlCommand cmd = new SqlCommand("SP_SAVE_FEEDBACK_BULK_JD", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                DataTable dt = new DataTable();
                dt.Columns.Add("Feedbackid", typeof(int));
                dt.Columns.Add("feedbackDetailsid", typeof(int));
                dt.Columns.Add("Rating", typeof(string));
                dt.Columns.Add("Uhid", typeof(string));
                dt.Columns.Add("LocationId", typeof(string));
                dt.Columns.Add("Remarks", typeof(string));
                dt.Columns.Add("IsText", typeof(string));

                foreach (var item in feedbackList)
                {
                    dt.Rows.Add(
                        Convert.ToInt32(item.FeedbackId),
                        Convert.ToInt32(item.FeedbackDetailsId),
                        item.Rating,
                        item.Uhid,
                        item.BedNo,
                        item.Remarks,
                        item.IsText
                    );
                }

                SqlParameter tvp = cmd.Parameters.AddWithValue("@FeedbackData", dt);
                tvp.SqlDbType = SqlDbType.Structured;
                tvp.TypeName = "dbo.FeedbackTVP";

                SqlDataAdapter da = new SqlDataAdapter(cmd);
                da.Fill(ds);
            }

            return ds;
        }

        public static DataSet SaveFeedbackBulk(List<FeedbackItem> feedbackList)
        {
            DataSet ds = new DataSet();

            using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString()))
            using (SqlCommand cmd = new SqlCommand("SP_SAVE_FEEDBACK_BULK", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                DataTable dt = new DataTable();
                dt.Columns.Add("Feedbackid", typeof(int));
                dt.Columns.Add("feedbackDetailsid", typeof(int));
                dt.Columns.Add("Rating", typeof(string));
                dt.Columns.Add("Uhid", typeof(string));
                dt.Columns.Add("LocationId", typeof(string));
                dt.Columns.Add("Remarks", typeof(string));
                dt.Columns.Add("IsText", typeof(string));

                foreach (var item in feedbackList)
                {
                    dt.Rows.Add(
                        Convert.ToInt32(item.FeedbackId),
                        Convert.ToInt32(item.FeedbackDetailsId),
                        item.Rating,
                        item.Uhid,
                        item.BedNo,
                        item.Remarks,
                        item.IsText
                    );
                }

                SqlParameter tvp = cmd.Parameters.AddWithValue("@FeedbackData", dt);
                tvp.SqlDbType = SqlDbType.Structured;
                tvp.TypeName = "dbo.FeedbackTVP";

                SqlDataAdapter da = new SqlDataAdapter(cmd);
                da.Fill(ds);
            }

            return ds;
        }

        public static DataSet GetOverAllFdDa(FeedbackRequest request, string conStr, string prs)
        {
            DataSet ds = new DataSet();

            using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString()))
            {
                using (SqlCommand cmd = new SqlCommand("sp_GetOverAllFeedback", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Uhid", request.Uhid);
                    cmd.Parameters.AddWithValue("@Bedid", request.BedNo);
                    cmd.Parameters.AddWithValue("@Process", prs);


                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                }
            }

            return ds;
        }
        public static DataSet GetBedTasksStatus(string bedNo,string bedid, string conStr, string prs)
        {
            DataSet ds = new DataSet();

            using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString()))
            {
                using (SqlCommand cmd = new SqlCommand("sp_GetTasksByBedNo", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@BedNo", bedNo);
                    cmd.Parameters.AddWithValue("@Bedid", bedid);


                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                }
            }

            return ds;
        }
        //    public static Dictionary<string, object> GetDynamicCategories(string loc, string imeNumber, string fcm, string conStr, string prs)
        //    {

        //        List<CategoryItem> rows = new List<CategoryItem>();

        //        DataSet ds = new DataSet();


        //        using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString()))
        //        using (SqlCommand cmd = new SqlCommand("sp_GetCategoriesDep", con))
        //        {
        //            cmd.CommandType = CommandType.StoredProcedure;
        //            cmd.Parameters.AddWithValue("@Locationname", loc);
        //            cmd.Parameters.AddWithValue("@ImeNumber", imeNumber);
        //            cmd.Parameters.AddWithValue("@Fcmtoken", fcm);
        //            cmd.Parameters.AddWithValue("@Process", prs);

        //            using (SqlDataAdapter da = new SqlDataAdapter(cmd))
        //            {
        //                da.Fill(ds);
        //            }
        //        }
        //        if (ds.Tables.Count > 0)
        //        {
        //            DataTable dt = ds.Tables[0];

        //            foreach (DataRow dr in dt.Rows)
        //            {
        //                rows.Add(new CategoryItem
        //                {
        //                    DepartmentId = dr["DepartmentId"].ToString(),
        //                    DepartmentKey = dr["DepartmentKey"].ToString(),
        //                    DepartmentName = dr["DepartmentName"].ToString(),

        //                    CategoryId = dr["CategoryId"].ToString(),
        //                    CategoryName = dr["CategoryName"].ToString(),
        //                    CategoryImage = dr["CategoryImage"].ToString(),
        //                    CategoryTitle = dr["CategoryTitle"].ToString(),
        //                    CategoryDetails = dr["CategoryDetails"].ToString(),
        //                    CategoryDescription = dr["CategoryDescription"].ToString(),
        //                    DescriptionDetails = dr["DescriptionDetails"].ToString(),
        //                    HisUrl = dr["HisUrl"].ToString(),
        //                    Dial50url = dr["Dial50url"].ToString(),
        //                    TaskTypeId = dr["TaskTypeId"].ToString(),

        //                    SubLeveLDepId = dr["SubLeveLDepId"]?.ToString()

        //                });
        //            }
        //        }
        //        var dData = rows
        //.GroupBy(x => x.DepartmentKey)
        //.ToDictionary(
        //    g => g.Key,
        //    g => g.ToList()
        //);
        //        DataRow drp = null;
        //        Dictionary<string, object> data = null;// new Dictionary<string, object>();

        //        if (ds.Tables[2].Rows.Count > 0)
        //        {
        //            drp = ds.Tables[2].Rows[0];

        //            data = new Dictionary<string, object>
        //{
        //    { "DeviceStatus", new DeviceStatus
        //        {
        //            isActiveDevice = ds.Tables[1].Rows[0][0].ToString() == "1" ? "TRUE" : "FALSE"
        //        }
        //    },

        //    { "ProfileData", new GetProfileData
        //        {
        //            userName = drp["Patientname"].ToString(),
        //            gender = drp["Gender"].ToString(),
        //            userId = loc,
        //            age = drp["age"].ToString(),
        //            uhid = drp["uhid"].ToString()
        //        }


        //    },
        //     { "DepFiltersName", ds.Tables[3].AsEnumerable().Select(x=>new { DepartmentId= x["DepartmentId"] ,
        //     DepartmentName= x["DepartmentName"] , GroupName= x["GroupName"]
        //     })


        //    }
        //};

        //            foreach (var dept in dData)
        //            {
        //                data.Add(dept.Key, dept.Value);
        //            }
        //        }

        //        return data;
        //    }

        public static Dictionary<string, object> GetDynamicCategories(string loc, string imeNumber, string fcm, string conStr, string prs)
        {
            List<CategoryItem> rows = new List<CategoryItem>();
            DataSet ds = new DataSet();

            using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString()))
            using (SqlCommand cmd = new SqlCommand("sp_GetCategoriesDep", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Locationname", loc);
                cmd.Parameters.AddWithValue("@ImeNumber", imeNumber);
                cmd.Parameters.AddWithValue("@Fcmtoken", fcm);
                cmd.Parameters.AddWithValue("@Process", prs);

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(ds);
                }
            }

            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataTable dt = ds.Tables[0];

                foreach (DataRow dr in dt.Rows)
                {
                    rows.Add(new CategoryItem
                    {
                        DepartmentId = dr["DepartmentId"].ToString(),
                        DepartmentKey = dr["DepartmentKey"].ToString(),
                        DepartmentName = dr["DepartmentName"].ToString(),

                        CategoryId = dr["CategoryId"].ToString(),
                        CategoryName = dr["CategoryName"].ToString(),
                        CategoryImage = dr["CategoryImage"].ToString(),
                        CategoryTitle = dr["CategoryTitle"].ToString(),
                        CategoryDetails = dr["CategoryDetails"].ToString(),
                        CategoryDescription = dr["CategoryDescription"].ToString(),
                        DescriptionDetails = dr["DescriptionDetails"].ToString(),
                        HisUrl = dr["HisUrl"].ToString(),
                        Dial50url = dr["Dial50url"].ToString(),
                        TaskTypeId = dr["TaskTypeId"].ToString(),
                        SubLeveLDepId = dr["SubLeveLDepId"].ToString()
                    });
                }
            }

            // Group Categories Department Wise
            var departmentTasks = rows
                .GroupBy(x => x.DepartmentName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => new
                    {
                        x.CategoryId,
                        x.CategoryName,
                        x.CategoryImage,
                        x.CategoryTitle,
                        x.CategoryDetails,
                        x.CategoryDescription,
                        x.DescriptionDetails,
                        x.HisUrl,
                        x.Dial50url,
                        x.TaskTypeId,
                        x.SubLeveLDepId
                    }).ToList()
                );

            Dictionary<string, object> data = new Dictionary<string, object>();

            if (ds.Tables.Count > 2 && ds.Tables[2].Rows.Count > 0)
            {
                DataRow drp = ds.Tables[2].Rows[0];

                data.Add("DeviceStatus", new DeviceStatus
                {
                    isActiveDevice = ds.Tables[1].Rows[0][0].ToString() == "1" ? "TRUE" : "FALSE"
                });

                data.Add("ProfileData", new GetProfileDataDep
                {
                    userName = drp["Patientname"].ToString(),
                    gender = drp["Gender"].ToString(),
                    userId = loc,
                    age = drp["age"].ToString(),
                    uhid = drp["uhid"].ToString()
                   

                   
                });

                data.Add("activeDepNames",
                    ds.Tables[3].AsEnumerable()
                    .Select(x => new
                    {
                        DepartmentId = x["DepartmentId"],
                        DepartmentName = x["DepartmentName"],
                        GroupName = x["GroupName"],
                        DepartmentDescription = x.Table.Columns.Contains("DepartmentDescription")
                                                ? x["DepartmentDescription"].ToString()
                                                : ""
                    }).ToList());

                data.Add("DepartmentActiveSubTaskDetails", departmentTasks);
            }

            return data;
        }
        public static DataTable GetDepCategory(  string process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GetDepCategory", Con);
                 
                cmd.Parameters.AddWithValue("@PROCESS", process);


                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                if (Con.State == ConnectionState.Closed)
                    Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex)
            {
                InsertError(ex.Message, "GetDepCategory", conStr);
            }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable GetBranches(string AppType, string HostingUrl, string process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("GetBranches", Con);
                cmd.Parameters.AddWithValue("@AppType", AppType);
                cmd.Parameters.AddWithValue("@HostingUrl", HostingUrl);
                cmd.Parameters.AddWithValue("@PROCESS", process);


                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                if (Con.State == ConnectionState.Closed)
                    Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex)
            {
                InsertError(ex.Message, "SP_REQUESTMASTER", "traczomain");
            }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable OldCheckUser(UserLogin usl, string hospid, string process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_CHECKUSER", Con);
                cmd.Parameters.AddWithValue("@AppType", usl.AppType);
                cmd.Parameters.AddWithValue("@USERNAME", usl.UserName);
                cmd.Parameters.AddWithValue("@PASSWORD", usl.Password);
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                cmd.CommandType = CommandType.StoredProcedure;
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_CHECKUSER", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable CheckUser(string UserName, string Password, string AppType, string imeinumb, string conStr, string firstsec, string hospitalid, string FCMDevicetoken, string ClnZonId)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_CHECKUSER", Con);
                cmd.Parameters.AddWithValue("@AppType", AppType);
                cmd.Parameters.AddWithValue("@USERNAME", UserName);
                cmd.Parameters.AddWithValue("@PASSWORD", Password);
                cmd.Parameters.AddWithValue("@ImeiNumber", imeinumb);
                cmd.Parameters.AddWithValue("@flag", firstsec);
                cmd.Parameters.AddWithValue("@HospitalId", hospitalid);
                cmd.Parameters.AddWithValue("@FCMDevicetoken", FCMDevicetoken);
                cmd.Parameters.AddWithValue("@CleaningZoneId", ClnZonId);

                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                cmd.CommandType = CommandType.StoredProcedure;
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_CHECKUSER", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable TokenCheckUser(string AppType, string username, string password, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_CHECKUSER", Con);
                cmd.Parameters.AddWithValue("@AppType", AppType);
                cmd.Parameters.AddWithValue("@USERNAME", username);
                cmd.Parameters.AddWithValue("@PASSWORD", password);
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                cmd.CommandType = CommandType.StoredProcedure;
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_CHECKUSER", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable DeleteDevicemaster(string imei, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("DeleteDevice", Con);

                cmd.Parameters.AddWithValue("@Imeino", imei);
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                cmd.CommandType = CommandType.StoredProcedure;
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DeleteDevice", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable DaAutoAssign(string process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_DYNASSIGN", Con);

                cmd.Parameters.AddWithValue("@Process", process);
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                cmd.CommandType = CommandType.StoredProcedure;
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DaAutoAssign", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable DaLogout(GenHosPorter process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_Logout", Con);
                cmd.Parameters.AddWithValue("@UserId", process.UserId);
                cmd.Parameters.AddWithValue("@Process", process.Process);
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                cmd.CommandType = CommandType.StoredProcedure;
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DaLogout", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable DaAlarmOff(AlarmOffM process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("Sp_AlarmOff", Con);
                cmd.Parameters.AddWithValue("@IMEINumber", process.IMEINumber);
                cmd.Parameters.AddWithValue("@Process", process.Process);
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                cmd.CommandType = CommandType.StoredProcedure;
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DaLogout", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable LocationMaster(Locations loc, string Process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_LOCATIONMASTER", Con);
                cmd.Parameters.AddWithValue("@ID", loc.Id);
                cmd.Parameters.AddWithValue("@ZoneName", loc.ZoneName);
                cmd.Parameters.AddWithValue("@FLOOR", loc.FloorId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.Parameters.AddWithValue("@ACTIVE", loc.IsActive);
                cmd.Parameters.AddWithValue("@Mac", loc.Mac);
                cmd.Parameters.AddWithValue("@LOCATIONTYPE", loc.LocationType);
                cmd.Parameters.AddWithValue("@APName", loc.APName);
                cmd.Parameters.AddWithValue("@DeviceTYPE", loc.DeviceType);
                cmd.Parameters.AddWithValue("@NearByZoneId", loc.NearByZoneId);
                cmd.Parameters.AddWithValue("@NearByMac", loc.NearByMac);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_LOCATIONMASTER", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable FloorMasterUpdate(Floors flr, string hosID, string Process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_FLOORMASTER", Con);
                cmd.Parameters.AddWithValue("@ID", flr.FloorId);
                cmd.Parameters.AddWithValue("@FLOOR", flr.FloorName);
                cmd.Parameters.AddWithValue("@FLOORORDER", flr.FloorOrder);
                cmd.Parameters.AddWithValue("@PROCESS", Process);
                cmd.Parameters.AddWithValue("@ACTIVE", flr.Isactive);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_FLOORMASTER", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataSet SelectedLocationMaster(Locations loc, string Process, string conStr)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_LOCATIONMASTER", Con);
                cmd.Parameters.AddWithValue("@ID", loc.Id);
                cmd.Parameters.AddWithValue("@ZoneName", loc.ZoneName);
                cmd.Parameters.AddWithValue("@FLOOR", loc.FloorId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.Parameters.AddWithValue("@ACTIVE", loc.IsActive);
                cmd.Parameters.AddWithValue("@Mac", loc.Mac);
                cmd.Parameters.AddWithValue("@LOCATIONTYPE", loc.LocationType);
                cmd.Parameters.AddWithValue("@APName", loc.APName);
                cmd.Parameters.AddWithValue("@DeviceTYPE", loc.DeviceType);
                cmd.Parameters.AddWithValue("@NearByZoneId", loc.NearByZoneId);
                cmd.Parameters.AddWithValue("@NearByMac", loc.NearByMac);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_LOCATIONMASTER", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataSet DaLocationList(Locations loc, string Process, string conStr)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_LOCATIONMASTER", Con);
                cmd.Parameters.AddWithValue("@ID", loc.Id);
                cmd.Parameters.AddWithValue("@ZoneName", loc.ZoneName);
                cmd.Parameters.AddWithValue("@FLOOR", loc.FloorId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.Parameters.AddWithValue("@ACTIVE", loc.IsActive);
                cmd.Parameters.AddWithValue("@Mac", loc.Mac);
                cmd.Parameters.AddWithValue("@LOCATIONTYPE", loc.LocationType);
                cmd.Parameters.AddWithValue("@APName", loc.APName);
                cmd.Parameters.AddWithValue("@DeviceTYPE", loc.DeviceType);
                cmd.Parameters.AddWithValue("@NearByZoneId", loc.NearByZoneId);
                cmd.Parameters.AddWithValue("@NearByMac", loc.NearByMac);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DaLocationList", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable SLocationMaster(Locations loc, string Process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_LOCATIONMASTER", Con);
                cmd.Parameters.AddWithValue("@ID", loc.Id);
                cmd.Parameters.AddWithValue("@ZoneName", loc.ZoneName);
                cmd.Parameters.AddWithValue("@FLOOR", loc.FloorId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.Parameters.AddWithValue("@ACTIVE", loc.IsActive);
                cmd.Parameters.AddWithValue("@Mac", loc.Mac);
                cmd.Parameters.AddWithValue("@LOCATIONTYPE", loc.LocationType);
                cmd.Parameters.AddWithValue("@APName", loc.APName);
                cmd.Parameters.AddWithValue("@DeviceTYPE", loc.DeviceType);
                cmd.Parameters.AddWithValue("@NearByZoneId", loc.NearByZoneId);
                cmd.Parameters.AddWithValue("@NearByMac", loc.NearByMac);
                cmd.Parameters.AddWithValue("@Latitude", loc.Latitude);
                cmd.Parameters.AddWithValue("@Longitude", loc.Longitude);
                cmd.Parameters.AddWithValue("@Xaxis", loc.Xaxis);
                cmd.Parameters.AddWithValue("@Yaxis", loc.Yaxis);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_LOCATIONMASTER", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable DAAdhocLoc(GetAdhocLocParam loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GetAdHocLocation", Con);
                cmd.Parameters.AddWithValue("@PorterId", loc.PorterId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DAAdhocLoc", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable DAPorterMsg(PorterMesssage loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_PORTERMESSAGE", Con);
                cmd.Parameters.AddWithValue("@MessageId", loc.MessageId);
                cmd.Parameters.AddWithValue("@PorterId", loc.PorterId);
                cmd.Parameters.AddWithValue("@MODE", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DAAdhocLoc", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable DAPorterOnHold(BTaskOnHold loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_PORTERONHOLD", Con);
                cmd.Parameters.AddWithValue("@REQUESTID", loc.RequestId);
                cmd.Parameters.AddWithValue("@PorterId", loc.PorterId);
                cmd.Parameters.AddWithValue("@Remarks", loc.Remarks);
                cmd.Parameters.AddWithValue("@MODE", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DAAdhocLoc", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable LocationUpdate(LocationUpdates loc, string Process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_LOCATIONUPDATE", Con);
                cmd.Parameters.AddWithValue("@PORTERID", loc.Porterid);
                cmd.Parameters.AddWithValue("@IMEINUMBER", loc.IMEINumber);
                cmd.Parameters.AddWithValue("@MAC", loc.Mac);
                cmd.Parameters.AddWithValue("@bATTERYLEVEL", loc.BatteryLevel);
                cmd.Parameters.AddWithValue("@Latitude", loc.Latitude);
                cmd.Parameters.AddWithValue("@Longitude", loc.Longitude);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_LOCATIONUPDATE", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static string GetPrivateCall(PTTCall loc, string conStr)
        {

            string retVal = string.Empty;
            using (SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString()))
            {
                try
                {
                    SqlCommand cmd = new SqlCommand("SP_GetPTTUsers", Con);
                    cmd.Parameters.AddWithValue("@PrivateCallId", string.IsNullOrEmpty(loc.PrivateCallId) ? "0" : loc.PrivateCallId);
                    cmd.Parameters.AddWithValue("@HospitalId", string.IsNullOrEmpty(loc.HospitalId) ? "0" : loc.HospitalId);
                    cmd.Parameters.AddWithValue("@SenderId", string.IsNullOrEmpty(loc.SenderId) ? "0" : loc.SenderId);
                    cmd.Parameters.AddWithValue("@RecieverId", string.IsNullOrEmpty(loc.RecieverId) ? "0" : loc.RecieverId);
                    cmd.Parameters.AddWithValue("@Process", loc.Process);
                    cmd.CommandType = CommandType.StoredProcedure;
                    if (Con.State == ConnectionState.Closed)
                        Con.Open();
                    retVal = (string)cmd.ExecuteScalar();

                }
                catch (Exception ex)
                {
                    InsertError(ex.Message, "SP_GetPTTUsersAPI :" + loc.Process, conStr);

                }
                finally
                {
                    if (Con.State == ConnectionState.Open)
                        Con.Close();
                }
                return retVal;
            }
        }
        public static DataTable GetPrivateCallStatus(string usrid, string process, string hosID, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("GetPrivateCallStatus", Con);
                cmd.Parameters.AddWithValue("@HospitalId", hosID);
                cmd.Parameters.AddWithValue("@SenderId", usrid);
                cmd.Parameters.AddWithValue("@RecieverId", string.Empty);
                cmd.Parameters.AddWithValue("@Process", process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "GetPrivateCallStatus", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable UpdateRequestInfo(ReqInfoReq riq, string prs, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("sp_InsertConversation", Con);
                cmd.Parameters.AddWithValue("@CategoryName", riq.Category);
                cmd.Parameters.AddWithValue("@CONVERSATIONID", riq.ConversationId);
                cmd.Parameters.AddWithValue("@PROCESS", prs);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_UpdateSocketMsgUsr", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable Updateinactiveuser(string pid, string uptime, string prs, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_UpdateSocketMsgUsr", Con);
                cmd.Parameters.AddWithValue("@PORTERID", pid);
                cmd.Parameters.AddWithValue("@UPDATEDTIME", uptime);
                cmd.Parameters.AddWithValue("@PROCESS", prs);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_UpdateSocketMsgUsr", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static TaskResult ReqCreation(TaskItem item, string from, string to, string convid, string gender, string userid)
        {
            var result = new TaskResult();
            DataSet ds = new DataSet();
            string Rslt = string.Empty;
            try
            {
                using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString()))
                {
                    using (SqlCommand cmd = new SqlCommand("sp_InsertTaskRequest", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@FromLocation", from);
                        cmd.Parameters.AddWithValue("@ToLocation", to);
                        cmd.Parameters.AddWithValue("@ConversationId", convid);
                        cmd.Parameters.AddWithValue("@Gender", gender);
                        cmd.Parameters.AddWithValue("@Category", item.Category);
                        cmd.Parameters.AddWithValue("@Quantity", item.Quantity);
                        cmd.Parameters.AddWithValue("@Remarks", item.Remarks);
                        cmd.Parameters.AddWithValue("@PorterId", string.IsNullOrEmpty(item.PorterId) ? "" : item.PorterId);
                        cmd.Parameters.AddWithValue("@UserId", userid);
                       

                        SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                        con.Open();
                        adpt.Fill(ds);
                        Rslt = ds.Tables[0].Rows[0]["result"].ToString();
                        if (Rslt.ToUpper() == "TRUE")
                        {
                            result.Status = "true";
                            result.Result = "Request created successfully";
                            result.RequestNo = ds.Tables[0].Rows[0]["RequestNo"].ToString();
                        }
                        else
                        {
                            result.Status = "false";
                            result.Result = Rslt;
                            result.RequestNo = "";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                InsertError(ex.Message, "da requrstcr", HosIdC);
                result.Status = "false";
                result.Result = Rslt;
                result.RequestNo = "";
            }

            return result;
        }
        
    public static TaskResult ReqCreationNew(TaskItem item,string from, string to,string convid,string gender,string userid,string Language)
        {
            var result = new TaskResult();
            DataSet ds = new DataSet();
            string Rslt = string.Empty;

            try
            {
                using (SqlConnection con = new SqlConnection(
                    ConfigurationManager.ConnectionStrings[HosIdC].ToString()))
                {
                    using (SqlCommand cmd = new SqlCommand("sp_InsertRoomRequest", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@FromLocation", from);
                        cmd.Parameters.AddWithValue("@ToLocation", to);
                        cmd.Parameters.AddWithValue("@ConversationId", convid);
                        cmd.Parameters.AddWithValue("@Gender", gender);
                        cmd.Parameters.AddWithValue("@Category", item.Category);
                        cmd.Parameters.AddWithValue("@Quantity", item.Quantity);
                        cmd.Parameters.AddWithValue("@Remarks", item.Remarks);
                        cmd.Parameters.AddWithValue("@PorterId", string.IsNullOrEmpty(item.PorterId) ? "" : item.PorterId);
                        cmd.Parameters.AddWithValue("@UserId", userid);
                        cmd.Parameters.AddWithValue("@Language", Language);

                        SqlDataAdapter adpt = new SqlDataAdapter(cmd);

                        con.Open();
                        adpt.Fill(ds);

                        
                        if (ds.Tables.Count == 0 ||
                            ds.Tables[0].Rows.Count == 0)
                        {
                            result.Status = "false";
                            result.Result = "No response received from database";
                            result.RequestNo = "";
                            result.CategoryName = "";

                            return result;
                        }

                        
                        Rslt = ds.Tables[0].Rows[0]["Result"].ToString();

                        result.RequestNo =
                            ds.Tables[0].Rows[0]["RequestNo"].ToString();

                       
                        if (ds.Tables.Count > 1 &&
                            ds.Tables[1].Rows.Count > 0 &&
                            ds.Tables[1].Columns.Contains("Category"))
                        {
                            result.CategoryName =
                                ds.Tables[1].Rows[0]["Category"].ToString();
                        }
                        else
                        {
                            result.CategoryName = "";
                        }

                        
                        if (Rslt.Equals("TRUE",
                            StringComparison.OrdinalIgnoreCase))
                        {
                            result.Status = "true";
                            result.Result = "Request created successfully";
                        }
                        else
                        {
                            result.Status = "false";
                            result.Result = Rslt;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                InsertError(
                    ex.ToString(),
                    "da requrstcr",
                    HosIdC);

                result.Status = "false";

               
                result.Result = string.IsNullOrEmpty(Rslt)
                    ? "An error occurred while creating request"
                    : Rslt;

                result.RequestNo = "";
                result.CategoryName = "";
            }

            return result;
        }

        public static DataTable SubmitAIFoodOrders(List<FoodOrderAISlimRow> rows, string conStr)
        {
            DataTable result = new DataTable();

            using (SqlConnection con = new SqlConnection(
                ConfigurationManager.ConnectionStrings[conStr].ConnectionString))
            {
                con.Open();

                var grouped = rows.GroupBy(r => new
                {
                    ROOMNO = (r.ROOMNO ?? "").Trim(),
                    MEALTYPE = (r.MEALTYPE ?? "").Trim(),
                    ORDERTYPE = (r.ORDERTYPE ?? "").Trim()
                });

                foreach (var grp in grouped)
                {
                    var grpRows = grp.ToList();
                    var firstRow = grpRows[0];

                    using (SqlCommand cmd = new SqlCommand("dbo.SP_SUBMIT_AI_FOOD_ORDER", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 300;

                        cmd.Parameters.Add("@ROOMNO", SqlDbType.NVarChar, 20).Value = grp.Key.ROOMNO;
                        cmd.Parameters.Add("@ORDERTYPE", SqlDbType.NVarChar, 50).Value = grp.Key.ORDERTYPE;
                        cmd.Parameters.Add("@MEALTYPE", SqlDbType.NVarChar, 50).Value = grp.Key.MEALTYPE;
                        cmd.Parameters.Add("@ISPREORDER", SqlDbType.Bit).Value = (firstRow.ISPREORDER == "1");
                        cmd.Parameters.Add("@SPECIALINSTRUCTION", SqlDbType.NVarChar, 500).Value = (object)firstRow.SPECIALINSTRUCTION ?? DBNull.Value;
                        cmd.Parameters.Add("@ORDERBY", SqlDbType.NVarChar, 200).Value = (object)firstRow.ORDERBY ?? DBNull.Value;
                        cmd.Parameters.Add("@CALORIES", SqlDbType.Int).Value = (object)firstRow.CALORIES ?? DBNull.Value;

                        var tvp = new DataTable();
                        tvp.Columns.Add("ITEMID", typeof(string));
                        tvp.Columns.Add("ITEMNAME", typeof(string));
                        tvp.Columns.Add("ITEMDESC", typeof(string));
                        tvp.Columns.Add("QUANTITY", typeof(int));

                        foreach (var r in grpRows)
                            tvp.Rows.Add(r.ITEMID, r.ITEMNAME, r.ITEMDESC, r.QUANTITY);

                        var tvpParam = cmd.Parameters.AddWithValue("@ITEMS", tvp);
                        tvpParam.SqlDbType = SqlDbType.Structured;
                        tvpParam.TypeName = "dbo.FoodOrderItemType";

                        using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                            da.Fill(result);
                    }
                }
            }

            return result;
        }

        public static TaskResult VideoCreation(TaskItem item, string from, string to, string convid, string gender, string userid, string Language)
        {
            var result = new TaskResult();
            DataSet ds = new DataSet();
            string Rslt = string.Empty;

            try
            {
                using (SqlConnection con = new SqlConnection(
                    ConfigurationManager.ConnectionStrings[HosIdC].ToString()))
                {
                    using (SqlCommand cmd = new SqlCommand("sp_InsertVideoRequest", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@FromLocation", from);
                        cmd.Parameters.AddWithValue("@ToLocation", to);
                        cmd.Parameters.AddWithValue("@ConversationId", convid);
                        cmd.Parameters.AddWithValue("@Gender", gender);
                        cmd.Parameters.AddWithValue("@Category", item.Category);
                        cmd.Parameters.AddWithValue("@Quantity", item.Quantity);
                        cmd.Parameters.AddWithValue("@Remarks", item.Remarks);
                        cmd.Parameters.AddWithValue("@PorterId", string.IsNullOrEmpty(item.PorterId) ? "" : item.PorterId);
                        cmd.Parameters.AddWithValue("@UserId", userid);
                        cmd.Parameters.AddWithValue("@Language", Language);

                        SqlDataAdapter adpt = new SqlDataAdapter(cmd);

                        con.Open();
                        adpt.Fill(ds);

                        if (ds.Tables.Count == 0 ||
                            ds.Tables[0].Rows.Count == 0)
                        {
                            result.Status = "false";
                            result.Result = "No response received from database";
                            result.RequestNo = "";
                            result.CategoryName = "";

                            return result;
                        }

                        Rslt = ds.Tables[0].Rows[0]["Result"].ToString();

                        result.RequestNo =
                            ds.Tables[0].Rows[0]["RequestNo"].ToString();

                        if (ds.Tables.Count > 1 &&
                            ds.Tables[1].Rows.Count > 0 &&
                            ds.Tables[1].Columns.Contains("Category"))
                        {
                            result.CategoryName =
                                ds.Tables[1].Rows[0]["Category"].ToString();
                        }
                        else
                        {
                            result.CategoryName = "";
                        }

                        if (Rslt.Equals("TRUE",
                            StringComparison.OrdinalIgnoreCase))
                        {
                            result.Status = "true";
                            result.Result = "Video request created successfully";
                        }
                        else
                        {
                            result.Status = "false";
                            result.Result = Rslt;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                InsertError(
                    ex.ToString(),
                    "da videocr",
                    HosIdC);

                result.Status = "false";

                result.Result = string.IsNullOrEmpty(Rslt)
                    ? "An error occurred while creating video request"
                    : Rslt;

                result.RequestNo = "";
                result.CategoryName = "";
            }

            return result;
        }


        //public static TaskResult ReqCreationNew(TaskItem item,string from,string to,string convid,string gender,string userid, string Language)
        //{
        //    var result = new TaskResult();
        //    DataSet ds = new DataSet();
        //    string Rslt = string.Empty;
        //    try
        //    {
        //        using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString()))
        //        {
        //            using (SqlCommand cmd = new SqlCommand("sp_InsertTaskRequest", con))
        //            {
        //                cmd.CommandType = CommandType.StoredProcedure;

        //                cmd.Parameters.AddWithValue("@FromLocation", from);
        //                cmd.Parameters.AddWithValue("@ToLocation", to);
        //                cmd.Parameters.AddWithValue("@ConversationId", convid);
        //                cmd.Parameters.AddWithValue("@Gender", gender);
        //                cmd.Parameters.AddWithValue("@Category", item.Category);
        //                cmd.Parameters.AddWithValue("@Quantity", item.Quantity);
        //                cmd.Parameters.AddWithValue("@Remarks", item.Remarks);
        //                cmd.Parameters.AddWithValue("@PorterId", string.IsNullOrEmpty( item.PorterId)?"": item.PorterId);
        //                cmd.Parameters.AddWithValue("@UserId", userid);
        //                cmd.Parameters.AddWithValue("@Language", Language);

        //                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
        //                con.Open();
        //                adpt.Fill(ds);
        //                Rslt = ds.Tables[0].Rows[0]["result"].ToString();
        //                if (Rslt.ToUpper() == "TRUE")
        //                {
        //                    result.CategoryName = ds.Tables[1].Rows[0]["Category"].ToString();
        //                    result.Status = "true";
        //                    result.Result = "Request created successfully";
        //                    result.RequestNo = ds.Tables[0].Rows[0]["RequestNo"].ToString();

        //                }
        //                else
        //                {
        //                    result.CategoryName = ds.Tables[1].Rows[0]["Category"].ToString();
        //                    result.Status = "false";
        //                    result.Result = Rslt;
        //                    result.RequestNo = "";


        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        InsertError(ex.Message, "da requrstcr", HosIdC);
        //        result.Status = "false";
        //        result.Result = Rslt;
        //        result.RequestNo = "";
        //        result.CategoryName = ds.Tables[1].Rows[0]["Category"].ToString();
        //    }

        //    return result;
        //}
        public static DataTable RequestInsert(RequestCreate loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_REQUESTINSERT", Con);
                cmd.Parameters.AddWithValue("@REQUESTID", loc.RequestId);
                cmd.Parameters.AddWithValue("@REQUESTDATE", loc.RequestDate);
                cmd.Parameters.AddWithValue("@PORTERID", loc.PorterId);
                cmd.Parameters.AddWithValue("@SubPORTERID", loc.SubPorterId);
                cmd.Parameters.AddWithValue("@RequestStatusId", loc.RequestStatusId);

                cmd.Parameters.AddWithValue("@From", loc.From);
                cmd.Parameters.AddWithValue("@To", loc.To);
                cmd.Parameters.AddWithValue("@Category", loc.Category);

                cmd.Parameters.AddWithValue("@ConversationId", loc.ConversationId);
                cmd.Parameters.AddWithValue("@Gender", loc.Gender);
                cmd.Parameters.AddWithValue("@Quantity", loc.Quantity);

                cmd.Parameters.AddWithValue("@Remarks", loc.Remarks);
                cmd.Parameters.AddWithValue("@Userid", loc.UserId);
                cmd.Parameters.AddWithValue("@PatientName", loc.PatientName);
                cmd.Parameters.AddWithValue("@MultiTaskFlag", loc.MultiTaskFlag);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_REQUESTINSERT", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }


      

        public static DataSet AdhocRequestInsert(AdhocRequestCreate loc, string conStr)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_ADHOCREQUESTINSERT", Con);

                cmd.Parameters.AddWithValue("@REQUESTDATE", loc.RequestDate);
                cmd.Parameters.AddWithValue("@RequestTime", loc.RequestTime);
                cmd.Parameters.AddWithValue("@EndTime", loc.EndTime);
                cmd.Parameters.AddWithValue("@RequestStatusId", loc.RequestStatusId);

                cmd.Parameters.AddWithValue("@PORTERID", loc.PorterId);
                cmd.Parameters.AddWithValue("@From", loc.From);
                cmd.Parameters.AddWithValue("@To", loc.To);
                cmd.Parameters.AddWithValue("@Category", loc.Category);
                cmd.Parameters.AddWithValue("@Remarks", loc.Remarks);
                cmd.Parameters.AddWithValue("@FromMac", loc.FromMac);
                cmd.Parameters.AddWithValue("@ToMac", loc.ToMac);
                cmd.Parameters.AddWithValue("@RemarksId", Convert.ToInt32(loc.RemarksId));
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_ADHOCREQUESTINSERT", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable AdhocOfflineInsert(AdhocRequestCreate loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_ADHOCREQUESTINSERT", Con);

                cmd.Parameters.AddWithValue("@REQUESTDATE", loc.RequestDate);
                cmd.Parameters.AddWithValue("@RequestTime", loc.RequestTime);
                cmd.Parameters.AddWithValue("@EndTime", loc.EndTime);
                cmd.Parameters.AddWithValue("@RequestStatusId", loc.RequestStatusId);

                cmd.Parameters.AddWithValue("@PORTERID", loc.PorterId);
                cmd.Parameters.AddWithValue("@From", loc.From);
                cmd.Parameters.AddWithValue("@To", loc.To);
                cmd.Parameters.AddWithValue("@Category", loc.Category);
                cmd.Parameters.AddWithValue("@Remarks", loc.Remarks);
                cmd.Parameters.AddWithValue("@FromMac", loc.FromMac);
                cmd.Parameters.AddWithValue("@ToMac", loc.ToMac);
                cmd.Parameters.AddWithValue("@RemarksId", Convert.ToInt32(loc.RemarksId));
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_ADHOCREQUESTINSERT", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable DeleteUserAccount(UserAccount loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_DeleteUserAccount", Con);


                cmd.Parameters.AddWithValue("@UserID", loc.UserId);
                cmd.Parameters.AddWithValue("@EmailId", loc.EmailId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_DeleteUserAccount", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable PTTLogDa(PTTLog loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_AddPttLog", Con);


                cmd.Parameters.AddWithValue("@UserID", loc.PorterId);
                cmd.Parameters.AddWithValue("@IMEINo", loc.IMEINo);
                cmd.Parameters.AddWithValue("@Log", loc.Log); 

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "PTTLogDa", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable Updatevoicefeed(VoiceFbkMdl loc)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[HosIdC].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_updatevoicefeedback", Con);


                cmd.Parameters.AddWithValue("@RequestId", loc.RequestId);
                cmd.Parameters.AddWithValue("@ConversationId", loc.ConversationId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "Updatevoicefeed", HosIdC); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable ProfileDetails(ProfileDetails loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GetProfileDetails", Con);


                cmd.Parameters.AddWithValue("@UserID", loc.PorterId);
                cmd.Parameters.AddWithValue("@ProfilePicture", loc.ProfilePicture);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_REQUESTINSERT", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataSet AddCleaningRequest(string userid, string requestid, string checklistid, string val, string before, string after, string photo, string InputType, string alldata, string sts, string rmks, string starttim, string endtim, string process, string conStr)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("[SP_AddCleaningRequest]", Con);


                cmd.Parameters.AddWithValue("@UserID", userid);
                cmd.Parameters.AddWithValue("@RequestID", requestid);

                cmd.Parameters.AddWithValue("@CheckListId", checklistid);
                cmd.Parameters.AddWithValue("@Value", val);

                cmd.Parameters.AddWithValue("@Before", before);
                cmd.Parameters.AddWithValue("@After", after);
                cmd.Parameters.AddWithValue("@Photo", photo);

                cmd.Parameters.AddWithValue("@InputType", InputType);
                cmd.Parameters.AddWithValue("@AllData", alldata);

                cmd.Parameters.AddWithValue("@RequestStatus", sts);
                cmd.Parameters.AddWithValue("@PorterRemarks", rmks);
                cmd.Parameters.AddWithValue("@StartTime", starttim);
                cmd.Parameters.AddWithValue("@EndTime", endtim);

                cmd.Parameters.AddWithValue("@PROCESS", process);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_REQUESTINSERT", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable GetBuzzerList(string ptype, string alertid, string process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_ALERTRAISEDLIST", Con);
                cmd.Parameters.AddWithValue("@PTYPE", ptype);
                cmd.Parameters.AddWithValue("@ALERTID", alertid);
                cmd.Parameters.AddWithValue("@IMEINO", alertid);

                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "GetBuzzerList", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataSet DaCateringRemarks(string process, string conStr)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_CATERINGREMARKS", Con);
                cmd.Parameters.AddWithValue("@MODE", process);


                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_PORTERREMARKS", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable PorterRemarks(string process, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_PORTERREMARKS", Con);
                cmd.Parameters.AddWithValue("@MODE", process);


                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_PORTERREMARKS", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable StartEndCleanTask(StartCompleteClnTask loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_StartCompleteCleanTask", Con);
                cmd.Parameters.AddWithValue("@RequestID", loc.RequestId);
                cmd.Parameters.AddWithValue("@UserID", loc.PorterId);
                cmd.Parameters.AddWithValue("@RequestStatus", loc.RequestStatus);
                cmd.Parameters.AddWithValue("@PorterRemarks", loc.PorterRemarks);
                cmd.Parameters.AddWithValue("@StartTime", loc.StartTime);
                cmd.Parameters.AddWithValue("@EndTime", loc.EndTime);
                cmd.Parameters.AddWithValue("@Name", (loc.Name));
                cmd.Parameters.AddWithValue("@PhoneNo", (loc.PhoneNo));
                cmd.Parameters.AddWithValue("@CatSignFName", (loc.CleaningSign));

                cmd.Parameters.AddWithValue("@BeforePhotoFName", (loc.CleaningBefPhoto));
                cmd.Parameters.AddWithValue("@AckBefPhotoTimeStamp", (loc.AckBefPhotoTimeStamp));
                cmd.Parameters.AddWithValue("@AckBefLocStamp", (loc.AckBefLocStamp));

                cmd.Parameters.AddWithValue("@AfterPhotoFName", (loc.CleaningAftPhoto));
                cmd.Parameters.AddWithValue("@AckAftPhotoTimeStamp", (loc.AckAftPhotoTimeStamp));
                cmd.Parameters.AddWithValue("@AckAftLocStamp", (loc.AckAftLocStamp));

                cmd.Parameters.AddWithValue("@OthPhotoFName", (loc.CleaningOtherPhoto));
                cmd.Parameters.AddWithValue("@AckOthPhotoTimeStamp", (loc.AckOthPhotoTimeStamp));
                cmd.Parameters.AddWithValue("@AckOthLocStamp", (loc.AckOthLocStamp));

                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_StartCompleteCleanTask " + loc.RequestId, conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
         public static DataTable StartEndTask(StartCompleteTask loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_StartCompleteTask", Con);
                cmd.Parameters.AddWithValue("@RequestID", loc.RequestId);
                cmd.Parameters.AddWithValue("@UserID", loc.PorterId);
                cmd.Parameters.AddWithValue("@RequestStatus", loc.RequestStatus);
                cmd.Parameters.AddWithValue("@PorterRemarks", loc.PorterRemarks);
                cmd.Parameters.AddWithValue("@StartTime", loc.StartTime);
                cmd.Parameters.AddWithValue("@EndTime", loc.EndTime);
                //   cmd.Parameters.AddWithValue("@RemarksId", Convert.ToInt32(loc.RemarksId));
                cmd.Parameters.AddWithValue("@Name", (loc.Name));
                cmd.Parameters.AddWithValue("@PhoneNo", (loc.PhoneNo));
                cmd.Parameters.AddWithValue("@CatSignFName", (loc.CateringSign));
                cmd.Parameters.AddWithValue("@CatPhotoFName", (loc.CateringPhoto));
                cmd.Parameters.AddWithValue("@AckPhotoTimeStamp", (loc.AckPhotoTimeStamp));
                cmd.Parameters.AddWithValue("@AckLocStamp", (loc.AckLocStamp));
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_StartCompleteTask "+loc.Process+":" + loc.RequestId, conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable CleaningTaskHistory(GetCatCleanTaskHistory loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GETCLEANINGTASKHIS", Con);
                cmd.Parameters.AddWithValue("@PORTERID", loc.PorterId);
                cmd.Parameters.AddWithValue("@REQUESTID", loc.RequestId);
                cmd.Parameters.AddWithValue("@serviceId", loc.ServiceId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "daPorterTaskHistory", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataTable PorterTaskHistory(GetPorterTaskHistory loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GETPORTERTASKHIS", Con);
                cmd.Parameters.AddWithValue("@PORTERID", loc.PorterId);
                cmd.Parameters.AddWithValue("@REQUESTID", loc.RequestId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "daPorterTaskHistory", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataSet DACateringGroup(string prs, string conStr)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GETCATERINGGROUP", Con);

                cmd.Parameters.AddWithValue("@PROCESS", prs);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DACateringGroup", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataSet DACateringTasks(GetPorterTasks loc, string conStr)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GETCATERINGTASK", Con);
                cmd.Parameters.AddWithValue("@PORTERID", loc.PorterId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_GETCATERINGTASK", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        public static DataSet DAPorterTasks(GetPorterTasks loc, string conStr)
        {
            DataSet dt = new DataSet();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GETPORTERTASK", Con);
                cmd.Parameters.AddWithValue("@PORTERID", loc.PorterId);
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DAPorterTasks", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
        /*  public static DataSet getRecords(string SpName)
          {
              DataSet ds = new DataSet();
              SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings["cineConn"].ToString());
              SqlCommand cmd = new SqlCommand(SpName, Con);
              cmd.CommandType = CommandType.StoredProcedure;
              try
              {
                  SqlDataAdapter adpt = new SqlDataAdapter(cmd); Con.Open();
                  adpt.Fill(ds);
              }
              catch (Exception ex)
              {
                  InsertError(ex.Message, SpName,);
              }
              finally
              {
                  while (ds.Tables.Count == 0)
                  {
                      SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                      if (Con.State == ConnectionState.Closed)
                          Con.Open();
                      adpt.Fill(ds);
                  }
                  if (Con.State == ConnectionState.Open)
                      Con.Close();
              }
              return ds;
          }

      */

        public static DataTable DaMessage(ProMessages loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_MessageDetails", Con);
                cmd.Parameters.AddWithValue("@MessageID", loc.MessageId);
                cmd.Parameters.AddWithValue("@TreeId", loc.TreeId);
                cmd.Parameters.AddWithValue("@UserID", loc.FromUserId);
                cmd.Parameters.AddWithValue("@ToUserID", loc.ToUserId);
                cmd.Parameters.AddWithValue("@Messages", loc.Messages);
                cmd.Parameters.AddWithValue("@flag", loc.Flag);

                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "DaMessage", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable GetRequestedDepByPatientID(string patId, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GETREQUESTEDDEPBYPATIENTID", Con);
                cmd.Parameters.AddWithValue("@PATIENT_ID", patId);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_GETREQUESTEDDEPBYPATIENTID", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable GetVideoCategories(string conStr)
        {
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString()))
                {
                    using (SqlCommand cmd = new SqlCommand("sp_GetEducationCategories", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                        {
                            da.Fill(dt);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                InsertError(ex.ToString(), "GetVideoCategories", conStr);
            }
            return dt;
        }

        public static DataTable ProcessAdtEvent(int patientId, string eventType, string newRoom, string newBed, string newBedID, string reason, string conStr)
        {
            DataTable dt = new DataTable();
            using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString()))
            {
                try
                {
                    using (SqlCommand cmd = new SqlCommand("SP_PROCESS_ADT_FEED", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@PatientId", patientId);
                        cmd.Parameters.AddWithValue("@EventType", eventType);
                        cmd.Parameters.AddWithValue("@NewRoom", string.IsNullOrEmpty(newRoom) ? (object)DBNull.Value : newRoom);
                        cmd.Parameters.AddWithValue("@NewBed", string.IsNullOrEmpty(newBed) ? (object)DBNull.Value : newBed);
                        cmd.Parameters.AddWithValue("@NewBedID", string.IsNullOrEmpty(newBedID) ? (object)DBNull.Value : newBedID);
                        cmd.Parameters.AddWithValue("@Reason", string.IsNullOrEmpty(reason) ? (object)DBNull.Value : reason);

                        using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                        {
                            da.Fill(dt);
                        }
                    }
                }
                catch (Exception ex)
                {
                    InsertError(ex.ToString(), "SP_PROCESS_ADT_FEED", conStr);
                    throw;
                }
            }
            return dt;
        }

        //public static DataTable GetFeedbackDepartmentByPatientID(string patId, string conStr)
        //{   DataTable dt = new DataTable();
        //    SqlConnection Con = new SqlConnection(
        //    ConfigurationManager.ConnectionStrings[conStr].ToString());
        //    try
        //    {
        //        SqlCommand cmd = new SqlCommand("SP_GETFEEDBACKDEPARTMENTBYPATIENTID", Con);
        //        cmd.Parameters.AddWithValue("@PATIENT_ID", patId);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        SqlDataAdapter adpt = new SqlDataAdapter(cmd);
        //        Con.Open();
        //        adpt.Fill(dt);
        //    }
        //    catch (Exception ex)
        //    {  
        //        InsertError(
        //            ex.Message, "SP_GETFEEDBACKDEPARTMENTBYPATIENTID", conStr);
        //    }
        //    finally
        //    {
        //        if (Con.State == ConnectionState.Open)
        //            Con.Close();
        //    }
        //    return dt;
        //}

        public static DataTable GetAllFeedbackDepartments(string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_GETALLFEEDBACKDEPARTMENTS", Con);
                cmd.CommandType = CommandType.StoredProcedure;

                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex)
            {
                InsertError(ex.Message, "SP_GETALLFEEDBACKDEPARTMENTS", conStr);
            }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }

        public static DataTable SendFeedback(string patientId, string sessionId, string feedbackJson, string conStr)
        {
            DataTable dt = new DataTable();

            using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString()))
            using (SqlCommand cmd = new SqlCommand("SP_SENDFEEDBACK", con))
            using (SqlDataAdapter da = new SqlDataAdapter(cmd))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@PATIENT_ID", (object)patientId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@SESSION_ID", (object)sessionId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@FEEDBACKDATA", (object)feedbackJson ?? DBNull.Value);

                try
                {
                    da.Fill(dt);
                }
                catch (Exception ex)
                {
                    InsertError(ex.ToString(), "SP_SENDFEEDBACK", conStr);
                    throw;  
                }
            }

            return dt;
        }

        public static DataTable AdhocEndTask(AdHocCompleteTask loc, string conStr)
        {
            DataTable dt = new DataTable();
            SqlConnection Con = new SqlConnection(ConfigurationManager.ConnectionStrings[conStr].ToString());
            try
            {
                SqlCommand cmd = new SqlCommand("SP_AdhocComplete", Con);
                cmd.Parameters.AddWithValue("@RequestID", loc.RequestId);
                cmd.Parameters.AddWithValue("@UserID", loc.PorterId);
                cmd.Parameters.AddWithValue("@RequestStatus", loc.RequestStatus);
                cmd.Parameters.AddWithValue("@To", loc.To);
                cmd.Parameters.AddWithValue("@ToMac", loc.ToMac);
                cmd.Parameters.AddWithValue("@EndTime", loc.EndTime);
                cmd.Parameters.AddWithValue("@Remarks", loc.PorterRemarks);
                cmd.Parameters.AddWithValue("@RemarksId", Convert.ToInt32(loc.RemarksId));
                cmd.Parameters.AddWithValue("@PROCESS", loc.Process);
                cmd.CommandType = CommandType.StoredProcedure;
                SqlDataAdapter adpt = new SqlDataAdapter(cmd);
                Con.Open();
                adpt.Fill(dt);
            }
            catch (Exception ex) { InsertError(ex.Message, "SP_StartCompleteTask", conStr); }
            finally
            {
                if (Con.State == ConnectionState.Open)
                    Con.Close();
            }
            return dt;
        }
    }
}