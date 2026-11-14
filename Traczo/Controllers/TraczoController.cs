using Microsoft.AspNet.Identity;
using Microsoft.Owin.Infrastructure;
using Microsoft.Owin.Security;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

using System.Web.Http.Hosting;
using System.Web.Http.Results;
using System.Web.Script.Serialization;
 

using Traczo.Models;
using static System.Net.Mime.MediaTypeNames;

namespace Traczo.Controllers
{
    [RoutePrefix("Traczo")]

    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class TraczoController : ApiController
    {
        string conStr = string.Empty, hosID = string.Empty, rslt = string.Empty; bool rtnBool = false;
        public TraczoController()
        {
            //<add name="traczomain" connectionString="Data Source=DESKTOP-6SCV78N;Initial Catalog=Trac;Timeout=1000;User ID=sa;Password=icegen;Connection Timeout=300;" />
        }

        /*    [Route("Authenticate")]
            [HttpPost]
            public HttpResponseMessage Authenticate([FromBody] Credentials credentials)
            {

                string username = credentials.Username;
                string password = credentials.Password;

                return Request.CreateResponse(HttpStatusCode.OK, "{a:d}");
            }
        */


        private static readonly HttpClient client = new HttpClient();


        [HttpPost]
        [Route("GetProfile")]
        public async Task<IHttpActionResult> GetProfile(PatientRequest req)
        {
            try
            {
                if (req == null || string.IsNullOrEmpty(req.userId))
                    return BadRequest("Invalid input");

                string token = string.Empty; 

                req.LocationId = "10201";


                var url = "https://traczo-api.apollonuat.com:8001/api/Patient/PatientRoomDetails";

             //   DataAccess.InsertError(HttpContext.Current.Request.Url.Host.ToString(), "hisv1 da", DataAccess.HosIdC);

                if (HttpContext.Current.Request.Url.Host.ToString().ToLower().Contains("devdial50"))
                {
                    var rst = "";

                    if (req.userId == "8792")
                        rst = "{\"status\": true,\"message\": \"1 Row Found\",\"data\": {\"uhid\": \"APJ1.1\",\"patientName\": \"Mrs. George\",\"gender\": \"MALE\",\"age\": \"53\",\"dateofAdmisison\": \"2025-10-16 02:19:12\",\"userId\": \"8792\",\"bedNo\": \"Room 402-A\",\"userName\": \"Mrs. George \"}}";
                    else if (req.userId == "8793")
                        rst = "{\"status\": true,\"message\": \"1 Row Found\",\"data\": {\"uhid\": \"APJ1.2\",\"patientName\": \"Mrs. Maria\",\"gender\": \"FEMALE\",\"age\": \"23\",\"dateofAdmisison\": \"2025-10-16 02:19:12\",\"userId\": \"8793\",\"bedNo\": \"Room 403-A\",\"userName\": \"Mrs. Maria \"}}";
                    else if (req.userId == "8805")
                        rst = "{\"status\": true,\"message\": \"1 Row Found\",\"data\": {\"uhid\": \"APJ1.3\",\"patientName\": \"Mrs. Peter\",\"gender\": \"MALE\",\"age\": \"33\",\"dateofAdmisison\": \"2025-10-16 02:19:12\",\"userId\": \"8805\",\"bedNo\": \"Room 404-A\",\"userName\": \"Mrs. Peter \"}}";

                    try
                    {
                        // Save to DB

                        var result = JsonConvert.DeserializeObject<PatientHisRes>(rst);

                        using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[DataAccess.HosIdC].ToString()))
                        {
                            using (SqlCommand cmd = new SqlCommand("sp_insertHISProfile", con))
                            {
                                cmd.Parameters.AddWithValue("@BedNumber", req.userId);
                                cmd.Parameters.AddWithValue("@LocationId", req.LocationId);
                                cmd.Parameters.AddWithValue("@uhid", result.data.uhid);
                                cmd.Parameters.AddWithValue("@PatientName", result.data.patientName);
                                cmd.Parameters.AddWithValue("@gender", result.data.gender);
                                cmd.Parameters.AddWithValue("@age", result.data.age);
                                cmd.Parameters.AddWithValue("@dateofAdmisison", result.data.dateofAdmisison);
                                cmd.CommandType = CommandType.StoredProcedure;
                                con.Open();
                                cmd.ExecuteNonQuery();
                                con.Close();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        DataAccess.InsertError(ex.Message, "his demo Call2 api da", DataAccess.HosIdC);
                    }

                    return Ok(JsonConvert.DeserializeObject(rst));

                }
                else
                {
                    token = await GetToken();

                    if (string.IsNullOrEmpty(token))
                        return BadRequest("Token not generated");

                    var  request = new HttpRequestMessage(HttpMethod.Post, url);
                    request.Headers.Authorization =
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                      request.Headers.Add("token", token);
                    string bed_no = string.Empty;

                 /*   using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[DataAccess.HosIdC].ToString()))
                    {
                        using (SqlCommand da = new SqlCommand("select bedno from locationmaster where id="+req.userId, con))
                        {
                            DataSet ds = new DataSet();
                            con.Open();

                            bed_no =(string) da.ExecuteScalar();
                            con.Close();
                        }
                    }
                    */
                    var body = new
                    {
                        BedNumber = req.userId,
                        LocationId = req.LocationId
                    };

                    string jsonBody = JsonConvert.SerializeObject(body);

                    request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                    var response = await client.SendAsync(request);

                    string json = await response.Content.ReadAsStringAsync();

                    // Convert JSON → Object
                    var result = JsonConvert.DeserializeObject<PatientHisRes>(json);

                    //   DataAccess.InsertError(req.BedNumber + " " + result.data.uhid, "his Call21 api da", DataAccess.HosIdC);
                    if (result != null && result.message.ToUpper() != "NO PATIENT FOUND")
                    {                        result.data.userName = result.data.patientName;
                        result.data.userId = req.userId;
                        result.message = "1 Row Found";

                        try
                        {
                            // Save to DB
                            using (SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[DataAccess.HosIdC].ToString()))
                            {
                                using (SqlCommand cmd = new SqlCommand("sp_insertHISProfile", con))
                                {
                                    cmd.Parameters.AddWithValue("@BedNumber", req.userId);
                                    cmd.Parameters.AddWithValue("@LocationId", req.LocationId);
                                    cmd.Parameters.AddWithValue("@uhid", result.data.uhid);
                                    cmd.Parameters.AddWithValue("@PatientName", result.data.patientName);
                                    cmd.Parameters.AddWithValue("@gender", result.data.gender);
                                    cmd.Parameters.AddWithValue("@age", result.data.age);
                                    cmd.Parameters.AddWithValue("@dateofAdmisison", result.data.dateofAdmisison);
                                    cmd.CommandType = CommandType.StoredProcedure;
                                    con.Open();
                                    cmd.ExecuteNonQuery();
                                    con.Close();
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            DataAccess.InsertError(ex.Message, "his Call2 api da", DataAccess.HosIdC);
                        }
                    }
                    else 
                    {
                        var el = new
                        {
                            status = false,
                            message = result.message,
                            data =new { }
                        };

                        return Ok(el);
                    }
                   




                    return Ok(result);
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "hisgetprofileapi", DataAccess.HosIdC);
                return InternalServerError(ex);
            }
        }






        private async Task<string> GetToken()
        {
            if (TokenCache.IsValid())
                return TokenCache.Token;

            var tokenApiUrl = "https://traczo-api.apollonuat.com:8001/api/Auth/GenerateToken";


            var request = new HttpRequestMessage(HttpMethod.Post, tokenApiUrl);


            var body = new
            {
                clientId = "d8c4f9a3-71be-47b6-b3f8-92c349e10f42",
                clientSecret = "p7JrQ9vLx3ZtA1cB9mS4uF8yV2kN0qR6dT5wB3xP8fF7gL2mR9sH4uJ0pN8rT3b"
            };

            string jsonBody = JsonConvert.SerializeObject(body);

            request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");


            var response = await client.SendAsync(request);

            // (Optional) check status
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception("Token API failed: " + error);
            }

            var json = await response.Content.ReadAsStringAsync();

            var tokenObj = JsonConvert.DeserializeObject<TokenResponse>(json);

            if (tokenObj != null && !string.IsNullOrEmpty(tokenObj.token))
            {
                TokenCache.Token = tokenObj.token;


                if (!string.IsNullOrEmpty(tokenObj.expiresAt))
                    TokenCache.Expiry = DateTime.Parse(tokenObj.expiresAt);
                else
                    TokenCache.Expiry = DateTime.UtcNow.AddMinutes(50);

                return TokenCache.Token;
            }

            return null;
        }





        //  [Authorize]
        [HttpPost]
        [Route("GetBranches")]        
        public HttpResponseMessage GetBranches([FromBody] BranchesIP branch)
        {
            DataTable dt = new DataTable(); rslt = "FALSE"; RtnBranches rtnRst; List<BranchesOP> k = new List<BranchesOP>();
            try
            {
                if (branch != null)
                {
                    dt = DataAccess.GetBranches(branch.AppType, branch.ServerIp, "BRANCH", "traczomain");
                    rslt = dt.Rows[0]["result"].ToString();
                }

                if (rslt == "TRUE")
                {
                    var branchs = (from rw in dt.AsEnumerable()
                                   select new BranchesOP()
                                   {
                                       HospitalId = AesOperation.EncryptString(Convert.ToString(rw["HospitalId"])),
                                       HospitalName = Convert.ToString(rw["HospitalName"]),
                                       HostingUrl = Convert.ToString(rw["HostingUrl"]),
                                       VoicePingUrl = Convert.ToString(rw["VoicePingUrl"]),
                                       SocketUrl = Convert.ToString(rw["SocketUrl"]),
                                       Result = Convert.ToString(rw["Result"])

                                   }).ToList();
                    rtnRst = new RtnBranches
                    {
                        status = true,
                        message = branchs.Count().ToString() + GlobalVar.NoOfrecords,
                        data = branchs
                    };
                }

                else
                {
                    rtnRst = new RtnBranches
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = k
                    };
                }
                /*     var identity = ((ClaimsPrincipal)User).Identity as ClaimsIdentity;
                var ticket = new AuthenticationTicket(identity, new AuthenticationProperties());
                DateTimeOffset currentUtc = new SystemClock().UtcNow;
                ticket.Properties.IssuedUtc = currentUtc;
                ticket.Properties.ExpiresUtc = currentUtc.AddSeconds(1);//different expiration times
                string token = Startup..AccessTokenFormat.Protect(ticket);
                return new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new ObjectContent<object>(new
                    {
                        accessToken = token,
                    }, Configuration.Formatters.JsonFormatter)
                };


                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result1 = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c])) ; */

                /*     Request.GetOwinContext().Authentication.SignOut();

                     Request.GetOwinContext().Authentication.SignOut(Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ApplicationCookie);

                    HttpContext.Current.GetOwinContext().Authentication.SignOut(Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ApplicationCookie);

                     if (Request.IsAuthenticated)
                     {
                         string userId = ClaimsPrincipal.Current.FindFirst(ClaimTypes.NameIdentifier).Value;

                         if (!string.IsNullOrEmpty(userId))
                         {
                             // Get the user's token cache and clear it
                             SessionTokenCache tokenCache = new SessionTokenCache(userId, HttpContext);

                             string sessionID = HttpContext.Session.SessionID;

                             tokenCache.Clear(sessionID);
                         }
                     } 

                HttpContext.Current.Request.GetOwinContext().Authentication.SignOut(Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ApplicationCookie,
                                Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ExternalCookie,
                                Microsoft.AspNet.Identity.DefaultAuthenticationTypes.TwoFactorRememberBrowserCookie,
                                Microsoft.AspNet.Identity.DefaultAuthenticationTypes.TwoFactorCookie);

                HttpContext.Current.Request.GetOwinContext().Authentication.SignOut(Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ExternalCookie);
                HttpContext.Current.Request.GetOwinContext().Authentication.SignOut(Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ApplicationCookie);
                HttpContext.Current.Request.GetOwinContext().Authentication.SignOut();


                HttpContext.Current.Request.GetOwinContext().Authentication.SignOut();

                HttpContext.Current.Request.GetOwinContext().Authentication.SignOut(Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ApplicationCookie);

                HttpContext.Current.GetOwinContext().Authentication.SignOut(Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ApplicationCookie);
                */


            }
            catch
            {
                rtnRst = new RtnBranches
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = k
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);

        }


        [HttpPost]
        [Route("GetDepCategory")]
        public HttpResponseMessage GetDepCategory([FromBody] DepCategoryI dpI)
        {
            DataTable dt = new DataTable(); rslt = "FALSE"; 
            try
            {
                if (dpI == null || string.IsNullOrEmpty(dpI.ImeiNumber))
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { status = false, message = "Invalid request" });
                }

                Dictionary<string, object> dynamicCategories = DataAccess.GetDynamicCategories(dpI.LocationName,dpI.ImeiNumber, dpI.FcmToken, DataAccess.HosIdC,"get");

               
                var response = new
                {
                    status = true,
                    message = dynamicCategories.Count(x => x.Value is List<CategoryItem>) +" Records found",
                    data =  
                        dynamicCategories
                    
                };
           

            return Request.CreateResponse(HttpStatusCode.OK, response);
 }
            catch(Exception ex)
            {
                DataAccess.InsertError(ex.Message, "getdepcategory", DataAccess.HosIdC);
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
               new { status = false, message = ex.Message });
            }
        }
        [HttpPost]
        [Route("GetDepartmentDetails")]
        public HttpResponseMessage GetDepartmentDetails([FromBody] DepCategoryI dpI)
        {
            DataTable dt = new DataTable(); rslt = "FALSE";
            try
            {
                if (dpI == null || string.IsNullOrEmpty(dpI.ImeiNumber))
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { status = false, message = "Invalid request" });
                }

                Dictionary<string, object> dynamicCategories = DataAccess.GetDynamicCategories(dpI.LocationName, dpI.ImeiNumber, dpI.FcmToken, DataAccess.HosIdC, "get");


                var response = new
                {
                    status = true,
                    message = dynamicCategories.Count(x => x.Value is List<CategoryItem>) + " Records found",
                    data =
                        dynamicCategories

                };


                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "getdepcategory", DataAccess.HosIdC);
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
               new { status = false, message = ex.Message });
            }
        }


        [HttpPost]
        [Route("CheckRegisterDevice")]
        public HttpResponseMessage CheckRegisterDevice([FromBody] RegisterDevice branch)
        {
            try
            {
                branch.HospitalId = AesOperation.DecryptString(branch.HospitalId);


                hosID = branch.HospitalId.Split('_')[0]; conStr = branch.HospitalId.Split('_')[1];

                // DataTable dt = new DataTable(); ;
                rslt = DataAccess.RegisterDevice(branch, "CHECKREGISTER", hosID, conStr).Rows[0]["Result"].ToString();

                /*  var branchs = dt.AsEnumerable()
                     .Select(dataRow => new CommandExecuted
                     {

                         Result = dataRow.Field<string>("Result")

                     }).Select(x => new { x.Result }).ToList(); */

                // "{\"status\": false,\"message\": \"Already exists\",\"data\":{}}";
                rslt = rslt.ToUpper() == "ALREADY EXISTS" ? "{\"status\": true,\"message\": \"Already exists\",\"data\":{ \"Result\":\"" + rslt + "\"}}" : rslt.ToUpper() == "DEVICE NOT AVAILABLE" ? "{\"status\": false,\"message\": \"Device not available\",\"data\":{}}" : "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}";
            }
            catch { rslt = "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}"; }


            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));

        }

         [HttpPost]
        [Route("PatientRegisterDevice")]
        public HttpResponseMessage PatientRegisterDevice([FromBody] RegisterDevice branch)
        {
            try
            {
                branch.HospitalId = AesOperation.DecryptString(branch.HospitalId);

                hosID = branch.HospitalId.Split('_')[0]; conStr = branch.HospitalId.Split('_')[1];

                DataTable dt = new DataTable(); ;
                dt = DataAccess.RegisterDevice(branch, "REGISTER", hosID, conStr);
                rslt = dt.Rows[0]["Result"].ToString();
                /*  var branchs = dt.AsEnumerable()
                     .Select(dataRow => new CommandExecuted
                     {

                         Result = dataRow.Field<string>("Result")

                     }).Select(x => new { x.Result }).ToList(); */

                // "{\"status\": false,\"message\": \"Already exists\",\"data\":{}}";
                rslt = rslt.ToUpper() == "TRUE" ? "{\"status\": true,\"message\": \"Registered successfully\",\"data\":{ \"Result\":\"" + rslt + "\",\"WifiName\":\"" + dt.Rows[0]["WifiName"].ToString() + "\"}}" : rslt.ToUpper() == "ALREADY EXISTS" ? "{\"status\": false,\"message\": \"Already exists\",\"data\":{}}" : "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}";
            }
            catch { rslt = "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}"; }


            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));

        }

        [HttpPost]
        [Route("Floor")]
        public HttpResponseMessage Floor([FromBody] Floors flr)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            DataTable dt = new DataTable();
            rslt = "FALSE"; RtnList rtnRst;
            try
            {
                flr.HospitalId = AesOperation.DecryptString(flr.HospitalId);
                hosID = flr.HospitalId.Split('_')[0]; conStr = flr.HospitalId.Split('_')[1];
                dt = DataAccess.SGetBranches(hosID, "Floor", conStr);
                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0)
                {
                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }



        // [Authorize]
        [HttpPost]
        [Route("RegisterDevice")]
        public HttpResponseMessage RegisterDevice([FromBody] RegisterDevice branch)
        {
            try
            {
                branch.HospitalId = AesOperation.DecryptString(branch.HospitalId);

                hosID = branch.HospitalId.Split('_')[0]; conStr = branch.HospitalId.Split('_')[1];

                DataTable dt = new DataTable(); ;
                dt = DataAccess.RegisterDevice(branch, "REGISTER", hosID, conStr);
                rslt = dt.Rows[0]["Result"].ToString();
                /*  var branchs = dt.AsEnumerable()
                     .Select(dataRow => new CommandExecuted
                     {

                         Result = dataRow.Field<string>("Result")

                     }).Select(x => new { x.Result }).ToList(); */

                // "{\"status\": false,\"message\": \"Already exists\",\"data\":{}}";
                if(branch.Process.ToUpper()== "REGISTERPATIENT")
                    rslt = rslt.ToUpper() == "TRUE" ? "{\"status\": true,\"message\": \"Registered successfully\",\"data\":{ \"Result\":\"" + rslt + "\",\"WifiName\":\"" + dt.Rows[0]["WifiName"].ToString() + "\",\"LocationId\":\"" + dt.Rows[0]["LocationId"].ToString() + "\",\"LocationName\":\"" + branch.LocationName + "\",\"HisBedNo\":\"" + dt.Rows[0]["hisbedno"].ToString() + "\"}}" : rslt.ToUpper() == "ALREADY EXISTS" ? "{\"status\": false,\"message\": \"Already exists\",\"data\":{ \"Result\":\"" + rslt + "\",\"WifiName\":\"" + dt.Rows[0]["WifiName"].ToString() + "\",\"LocationId\":\"" + dt.Rows[0]["LocationId"].ToString() + "\",\"LocationName\":\"" + branch.LocationName + "\",\"HisBedNo\":\"" + dt.Rows[0]["hisbedno"].ToString() + "\"}}" : "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}";
                else
                rslt = rslt.ToUpper() == "TRUE" ? "{\"status\": true,\"message\": \"Registered successfully\",\"data\":{ \"Result\":\"" + rslt + "\",\"WifiName\":\"" + dt.Rows[0]["WifiName"].ToString() + "\"}}" : rslt.ToUpper() == "ALREADY EXISTS" ? "{\"status\": false,\"message\": \"Already exists\",\"data\":{}}" : "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}";
            }
            catch(Exception ex) { rslt = "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}";

                DataAccess.InsertError(ex.Message, "registerdeviceapi"+branch.Process, conStr);
            }


            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));

        }

        //  [Authorize]
        [HttpPost]
        [Route("OnlineRegisterDevice")]
        public HttpResponseMessage OnlineRegisterDevice([FromBody] RegisterDevice branch)
        {
            try
            {
                branch.HospitalId = AesOperation.DecryptString(branch.HospitalId);
                hosID = branch.HospitalId.Split('_')[0]; conStr = branch.HospitalId.Split('_')[1];

                DataTable dt = new DataTable(); ;
                dt = DataAccess.RegisterDevice(branch, "REGISTER", hosID, "traczomain");
                rslt = dt.Rows[0]["Result"].ToString();
                /*  var branchs = dt.AsEnumerable()
                     .Select(dataRow => new CommandExecuted
                     {

                         Result = dataRow.Field<string>("Result")

                     }).Select(x => new { x.Result }).ToList();

                  */

                rslt = rslt.ToUpper() == "TRUE" ? "{\"status\": true,\"message\": \"Registered successfully\",\"data\":{ \"Result\":\"" + rslt + "\",\"WifiName\":\"" + dt.Rows[0]["WifiName"].ToString() + "\"}}" : rslt.ToUpper() == "ALREADY EXISTS" ? "{\"status\": false,\"message\": \"Already exists\",\"data\":{}}" : "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}";

            }
            catch { rslt = "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}"; }
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));

        }

        //  [Authorize]
        [HttpPost]
        [Route("Authenticate")]
        public HttpResponseMessage Authenticate([FromBody] UserLogin usrlgn)
        {
            try
            {
                string tmpurl = HttpContext.Current.Request.Url.ToString().Replace("Authenticate", "Authenticat");

                usrlgn.HospitalId = AesOperation.DecryptString(usrlgn.HospitalId);
                usrlgn.CleaningZoneId = string.IsNullOrEmpty(usrlgn.CleaningZoneId) ? "0" : usrlgn.CleaningZoneId;
                DataTable dt = new DataTable();
                dt = DataAccess.CheckUser(usrlgn.UserName, usrlgn.Password, usrlgn.CateringGroupId.ToString(), usrlgn.IMEINo, usrlgn.HospitalId.Split('_')[1], "1", usrlgn.HospitalId.Split('_')[0], usrlgn.FCMDeviceToken, usrlgn.CleaningZoneId);
                rslt = string.Empty; string tokendtl = string.Empty;
                if (dt.Rows[0]["Result"].ToString() == "TRUE")
                {
                    if (dt.Rows[0]["APPTYPE"].ToString() == "1" || (new[] { "2", "3" }.Contains(dt.Rows[0]["APPTYPE"].ToString()) && (Convert.ToInt32(usrlgn.CateringGroupId) > 0 || Convert.ToInt32(usrlgn.CleaningZoneId) > 0)))
                    {// && Convert.ToInt32( usrlgn.CateringGroupId)>0) || (dt.Rows[0]["APPTYPE"].ToString() == "3" && Convert.ToInt32(usrlgn.CateringGroupId) > 0)) {

                        rslt = GetToken(tmpurl, usrlgn.UserName, usrlgn.Password, usrlgn.HospitalId, usrlgn.AppType.ToString(), usrlgn.IMEINo, usrlgn.CateringGroupId, usrlgn.CleaningZoneId);
                        tokendtl = rslt.ToString();
                        rslt = " {\"status\": true,\"message\": \"Login successfully\",\"data\":" + rslt + "}";

                        //SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[usrlgn.HospitalId.Split('_')[1]].ToString());

                        try
                        {
                            JObject ob = JObject.Parse(tokendtl.ToString());
                            DataAccess.UpdateToken((string)ob["access_token"], (string)ob["issued"], (string)ob["expires"], (string)ob["UserId"], usrlgn.HospitalId.Split('_')[1].ToString());
                            //  DataAccess.UpdateToken(tokendtl,"", "", "", "");

                        }
                        catch (Exception ex) { DataAccess.InsertError(ex.ToString(), "authenticate tokenupdatejs ", "van"); }
                    }
                    else if (dt.Rows[0]["APPTYPE"].ToString() == "2" || dt.Rows[0]["APPTYPE"].ToString() == "3")
                    {


                        rslt = "FALSE"; RtnLogin rtnRst; CateringGroupdata rows = new CateringGroupdata();
                        rows.AppType = "";
                        rows.CateringGroupNames = new List<CateringGroup> { };

                        try
                        {


                            DataSet dts = DataAccess.DACateringGroup("GET", usrlgn.HospitalId.Split('_')[1]);



                                if (dts != null && dts.Tables.Count > 0)
                            {

                                rtnRst = new RtnLogin
                                {
                                    status = dts.Tables[0].Rows.Count > 0 ? true : false,
                                    message = dts.Tables[0].Rows.Count > 0 ? dts.Tables[0].Rows.Count.ToString() + GlobalVar.NoOfrecords : "No data found",
                                    data = new CateringGroupdata()
                                    {
                                        AppType = dt.Rows[0]["apptype"].ToString(),
                                        IsHaywood= dt.Rows[0]["IsHaywood"].ToString() ,
                                        IsRoyalStoke = dt.Rows[0]["IsRoyalStoke"].ToString(),
                                        CateringGroupNames = (from rw in dts.Tables[0].AsEnumerable()
                                                              select
                                  new CateringGroup()
                                  {
                                      CateringGroupId = Convert.ToString(rw["CateringGroupId"]),
                                      CateringGroupName = Convert.ToString(rw["CateringGroupName"]),

                                  }).ToList(),
                                        CleaningZones = (from rw in dts.Tables[1].AsEnumerable()
                                                         select
                             new CleaningZone()
                             {
                                 CleaningZoneId = Convert.ToString(rw["CleaningZoneId"]),
                                 CleaningZoneName = Convert.ToString(rw["CleaningZoneName"]),

                             }).ToList()
                                    }
                                };

                            }

                            else
                            {
                                rtnRst = new RtnLogin
                                {
                                    status = false,
                                    message = GlobalVar.NoDataFound,
                                    data = rows
                                };
                            }


                        }
                        catch (Exception ex)
                        {
                            DataAccess.InsertError(ex.Message, "AuthenticateGroup", conStr);

                            rtnRst = new RtnLogin
                            {
                                status = false,
                                message = GlobalVar.PlsChkData,
                                data = rows
                            };
                            rtnBool = false;
                        }

                        return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
                    }
                }
                else
                {
                    //string jsonString = "{\"Result\": \"FALSE\"}";

                    if (dt.Rows[0]["Result"].ToString().Split('_')[1] == "1")
                        rslt = " {\"status\": false,\"message\": \"You have already logged in device no. " + dt.Rows[0]["imei"].ToString() + "\",\"data\": { } }";
                    else
                        rslt = " {\"status\": false,\"message\": \"Wrong Credentials\",\"data\": { } }";


                }
            }
            catch (Exception ex)
            {

                DataAccess.InsertError(ex.ToString(), "Authenticate ui", "van");



                rslt = " {\"status\": false,\"message\": \"Please check the data\",\"data\": { } }";
            }
            //      List<Authenticat> js= JsonConvert.DeserializeObject<List<Authenticat>>(k);


            /*
                        hosID = usrlgn.HospitalId.Split('_')[0]; conStr = usrlgn.HospitalId.Split('_')[1];
                        DataTable dt = new DataTable();
                        dt = DataAccess.OldCheckUser(usrlgn, hosID, "USER", conStr);
                        var branchs = dt.AsEnumerable()
                             .Select(dataRow => new UserLogin
                             {
                                 UserId = dataRow.Field<string>("UserId"),
                                 FullName = dataRow.Field<string>("FullName"),
                                 RoleName = dataRow.Field<string>("RoleName"),
                                 Result = dataRow.Field<string>("Result")

                             }).Select(x => new { x.UserId,x.FullName,x.RoleName, x.Result }).ToList();
                        */
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }



        //string k = GetToken("", "10", "12345");
        static string GetToken(string url, string userName, string password, string hosid, string apptype, string IMEINo, string CatGpId, string CleanZonId)
        {
            //htt//stackoverflow.com/questions/38661090/token-based-authentication-in-web-api-without-any-user-interface 10 12345 "1_traczomain"
            var pairs = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>( "grant_type", "password" ),
                        new KeyValuePair<string, string>( "username", userName ),
                        new KeyValuePair<string, string> ( "password", password ),
                        new KeyValuePair<string, string> ( "hospitalid", hosid ),
                        new KeyValuePair<string, string> ( "apptype", CatGpId )
                        , new KeyValuePair<string, string> ( "IMEINo", IMEINo )
                        , new KeyValuePair<string, string> ( "CleaningZoneId", CleanZonId )



                    };
            var content = new FormUrlEncodedContent(pairs);

            //  ServicePointManager.SecurityProtocol = (SecurityProtocolType)(0xc0 | 0x300 | 0xc00);
             ServicePointManager.ServerCertificateValidationCallback += (sender, cert, chain, sslPolicyErrors) => true;
            using (var client = new HttpClient())
            {
                var response = client.PostAsync(url, content).Result;
                return response.Content.ReadAsStringAsync().Result;
            }
        }




        /*  [Authorize]
          [HttpGet]
          [Route("GetCustomerDetail")]
          public IEnumerable<string> GetCustomerDetails()
          {
             ds.Tables[0].AsEnumerable().Where(s => s.Field<string>("OEMName") != "us").ToArray().ToList();
          }
          */

        /*
        //  [Authorize]
        [HttpGet]
            [Route("GetLoads")]
            public HttpResponseMessage GetLoads()
            {
                DataSet ds = new DataSet();
                SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["cineConn2"].ToString());
                SqlDataAdapter da; da = new SqlDataAdapter("select OEMId as OEMIDMAsRdfH,OEMId, OEMCode,OEMName,(case when IsActive=1 then 'Live' when IsActive=2 then 'Archive' when IsActive=3 then 'Delete' else '' end) as IsActive from OEMMaster   ", con);

                da.Fill(ds);
                 var users = ds.Tables[0].AsEnumerable()
                    .Select(dataRow => new UserModels
                    {
                        UserId = dataRow.Field<int>("OEMId"),
                        UserName = dataRow.Field<string>("OEMCode"),
                        Company = dataRow.Field<string>("OEMName")

                    }).ToList();  

               //   var users = ds.Tables[0].AsEnumerable().Where(s => s.Field<string>("OEMName") != "us").ToArray().ToList();

                //  var users = GetUsers();
                //return Json()
                // Errors s = new Errors() { name = "error" };
                //return Json(users);


                //string JSONString = string.Empty;







                 return Request.CreateResponse(HttpStatusCode.OK, users, Configuration.Formatters.JsonFormatter);
            }
        } */
        public class UserModels
        {
            public int UserId { get; set; }
            public string UserName { get; set; }
            public string Company { get; set; }
        }

        [HttpPost]
        [Route("PrivateCall")]
        public HttpResponseMessage PrivateCall([FromBody] PTTCall loc)
        {
            string rtnStr = string.Empty; DataTable mydt = null;
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];

                    if (loc.Process == "PrivateCallStatus")
                        mydt = DataAccess.GetPrivateCallStatus(loc.SenderId, loc.Process, loc.HospitalId, conStr);
                    else
                        rtnStr = DataAccess.GetPrivateCall(loc, conStr);

                    switch (loc.Process)
                    {
                        case "PrivateCall":
                            rtnStr = (rtnStr.Split('_')[0] == "TRUE") ? ("{\"status\":  true,\"message\": \"1 record found\",\"data\":{\"Result\": \"" + rtnStr.Split('_')[0] + "\",\"PrivateCallId\": \"" + rtnStr.Split('_')[1] + "\"}}") :
                                             "{\"status\":  false,\"message\": \"No record found\",\"data\":{\"Result\": \"" + rtnStr.Split('_')[0] + "\",\"PrivateCallId\": \"0\"}}";
                            break;
                        case "SenderEndCall":
                            rtnStr = (rtnStr == "TRUE") ? ("{\"status\":  true,\"message\": \"1 record found\",\"data\":{\"Result\": \"" + rtnStr + "\"}}") :
                                              "{\"status\":  false,\"message\": \"No record found\",\"data\":{\"Result\": \"" + rtnStr + "\"}}";
                            break;

                        case "RecieverEndCall":
                            rtnStr = (rtnStr == "TRUE") ? ("{\"status\":  true,\"message\": \"1 record found\",\"data\":{\"Result\": \"" + rtnStr + "\"}}") :
                                              "{\"status\":  false,\"message\": \"No record found\",\"data\":{\"Result\": \"" + rtnStr + "\"}}";
                            break;
                        case "PrivateCallStatus":
                            rtnStr = (mydt != null && mydt.Rows.Count > 0 && Convert.ToString(mydt.Rows[0]["RESULT"]).ToUpper() == "TRUE") ? ("{\"status\":  true,\"message\": \"1 record found\",\"data\":{\"Result\": \"TRUE\",\"PrivateCallId\": \"" + mydt.Rows[0]["PrivateCallId"] + "\",\"SenderId\": \"" + mydt.Rows[0]["SENDERID"] + "\",\"RecieverId\": \"" + mydt.Rows[0]["RecieverId"] + "\",\"SenderStatusId\": \"" + mydt.Rows[0]["SenderStatusId"] + "\",\"ReceiverStatusId\": \"" + mydt.Rows[0]["ReceiverStatusId"] + "\"}}") :
                                            "{\"status\":  false,\"message\": \"No record found\",\"data\":{\"Result\": \"FALSE\",\"PrivateCallId\": \"1\"}}";
                            break;
                    }

                    rtnBool = rtnStr == "" ? false : true;


                }
                else
                {
                    rtnBool = false;
                }
            }
            catch
            {
                rtnBool = false;
            }

            rtnStr = rtnBool ? rtnStr : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rtnStr));
        }

        [HttpPost]
        [Route("PTTUserInActive")]
        public HttpResponseMessage PTTUserInActive([FromBody] GetAdhocLocParam loc)
        {
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "INACTIVEUSER";
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];

                    dt = DataAccess.Updateinactiveuser(loc.PorterId, string.Empty, loc.Process, conStr);


                    if (dt != null && dt.Rows.Count > 0)
                    {
                        rslt = " {\"status\": true,\"message\": \"Updated successfully\",\"data\": {\"Result\":\"TRUE\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch
            {
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        //dial50 start
        //ar
        public IHttpActionResult OverAllFeedback([FromBody] FeedbackRequestJd request)
        {
            conStr = DataAccess.HosIdC;
            try
            {
                        


                DataSet ds = DataAccess.SaveFeedbackBulk(
                    request.convId,
                    request.user,
                    request.Feedback
                );


                var taskResults = ds.Tables[0].AsEnumerable()
            .Select(r => new FeedbackTaskResult
            {
                Department = r["Department"].ToString(),
                Status = (r["Status"].ToString()),
                Result = r["Result"].ToString()
            }).ToList();

                var response = new OverFeedBackResponse<object>
                {
                    status = true,
                    message = $"{taskResults.Count} Records found",
                    data = new FeedbackSaveResponse
                    {
                        Tasks = taskResults
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            { 
                DataAccess.InsertError(ex.ToString(), "overall feedback api jd", conStr);

                return Content(HttpStatusCode.InternalServerError,
                    new OverFeedBackResponse<object>
                    {
                        status = false,
                        message = "Error while saving feedback",
                        data = null
                    });
            }
        }



        [HttpPost]
        [Route("UpdateOverAllFeedback")]
        public IHttpActionResult UpdateOverAllFeedback([FromBody] FeedbackResponse request)
        {
            try
            {
                if (request == null || request.Feedback == null || !request.Feedback.Any())
                {
                    return BadRequest("Feedback data is required");
                }

                DataSet ds = DataAccess.SaveFeedbackBulkJd(request.Feedback);

                var response = new OverFeedBackResponse<UpdateResult>
                {
                    status = true,
                    message = "1 Records found",
                    data = new UpdateResult
                    {
                        status = ds.Tables[0].Rows[0]["status"].ToString(),
                        Result = ds.Tables[0].Rows[0]["Result"].ToString()
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "SaveFeedback API", DataAccess.HosIdC);

                return Content(
                    HttpStatusCode.InternalServerError,
                    new OverFeedBackResponse<object>
                    {
                        status = false,
                        message = "Please check the data",
                        data = null
                    }
                );
            }
        }

        [HttpPost]
        [Route("UpdateOverAllFeedbackMob")]
        public IHttpActionResult UpdateOverAllFeedbackMob([FromBody] FeedbackResponse request)
        {
            try
            {
                if (request == null || request.Feedback == null || !request.Feedback.Any())
                {
                    return BadRequest("Feedback data is required");
                }

                DataSet ds = DataAccess.SaveFeedbackBulk(request.Feedback);

                var response = new OverFeedBackResponse<UpdateResult>
                {
                    status = true,
                    message = "1 Records found",
                    data = new UpdateResult
                    {
                        status = ds.Tables[0].Rows[0]["status"].ToString(),
                        Result = ds.Tables[0].Rows[0]["Result"].ToString()
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "UpdateOverAllFeedbackMob API", DataAccess.HosIdC);

                return Content(
                    HttpStatusCode.InternalServerError,
                    new OverFeedBackResponse<object>
                    {
                        status = false,
                        message = "Please check the data",
                        data = null
                    }
                );
            }
        }

        [HttpPost]
        [Route("GetOverAllFeedback")]
        public IHttpActionResult GetOverAllFeedback([FromBody] FeedbackRequest request)
        {
            try
            {
                DataSet ds = DataAccess.GetOverAllFdDa(request, DataAccess.HosIdC, request.Process);

                List<FeedbackItem> tasks = new List<FeedbackItem>();

                if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    tasks = ds.Tables[0]
                        .AsEnumerable()
                        .Select(row => new FeedbackItem
                        {
                            FeedbackId = row["Feedbackid"].ToString(),
                            FeedbackDetailsId = row["feedbackDetailsid"].ToString(),                            
                            Description = row["Description"].ToString(),
                            Question = row["Question"].ToString(),
                            IsText = row["Istext"].ToString(),
                            Uhid = row["Uhid"].ToString(),
                            BedNo = row["LocationId"].ToString(),
                            Rating = row["Rating"].ToString(),
                            Remarks = row["Remarks"].ToString(),
                            CreatedTime = row["CreatedTime"].ToString()
                        })
                        .ToList();

                    var response = new OverFeedBackResponse<FeedbackResponse>
                    {
                        status = true,
                        message = $"{tasks.Count} Records found",
                        data = new FeedbackResponse { Feedback = tasks }
                    };

                    return Ok(response);
                }

                
                return Ok(new OverFeedBackResponse<FeedbackResponse>
                {
                    status = false,
                    message = "No records found",
                    data = new FeedbackResponse
                    {
                        Feedback = new List<FeedbackItem>()
                    }
                });
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "getoverallfeedback api", DataAccess.HosIdC);

                return Content(HttpStatusCode.InternalServerError,
                    new OverFeedBackResponse<object>
                    {
                        status = false,
                        message = "Please check the data",
                        data = null
                    });
            }
        }

        [HttpPost]
        [Route("BedStatus")]
        public HttpResponseMessage BedStatus([FromBody] BedTaskRequest loc)
        {
            try { 
            DataSet ds = DataAccess.GetBedTasksStatus(loc.BedNo,loc.BedId,  DataAccess.HosIdC, "get");
            List<BedTaskDataItem> tasks = new List<BedTaskDataItem>();


            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {

                    tasks = ds.Tables[0]
          .AsEnumerable()
          .Select(row => new BedTaskDataItem
          {
              RequestNo = row["RequestNo"]?.ToString(),
              PorterName = row["PorterName"]?.ToString(),
              PorterId = row["PorterId"]?.ToString(),
              PorterImage = row["PorterImage"]?.ToString(),


              SubPorterName = row["SubPorterName"]?.ToString(),
              SubPorterId = row["SubPorterId"]?.ToString(),
              SubPorterImage = row["SubPorterImage"]?.ToString(),

              RequestStatus = row["RequestStatus"]?.ToString(),
              RequestStatusId = row["RequestStatusId"]?.ToString(),

              From = row["From"]?.ToString(),
              To = row["To"]?.ToString(),
              CategoryName = row["CategoryName"]?.ToString(),
              CategoryDescription = row["CategoryDescription"]?.ToString(),
              RequestDate = row["RequestDate"]?.ToString(),  
              Eta= row["eta"]?.ToString(),
              TaskTypeId = row["TaskTypeId"]?.ToString(),
              Rating = row["Rating"]?.ToString(),
              RequestDeskRemarks= row["RequestDeskRemarks"]?.ToString()

          })
          .ToList();

                  
                var response = new BedTaskResponse
                {
                    status = true,
                    message = $"{tasks.Count} Records found",
                    data = new BedTaskData { userTask = tasks }
                };

                return Request.CreateResponse(HttpStatusCode.OK, response);

            }

            return Request.CreateResponse(HttpStatusCode.OK, new BedTaskResponse
            {
                status = false,
                message = "No Records found",
                data = new BedTaskData()
            });
        }
            catch (Exception ex)
            {
                BedTaskData dumd = new BedTaskData();

                DataAccess.InsertError(ex.Message, "bedstatus api", DataAccess.HosIdC);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new BedTaskResponse
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data =  new BedTaskData() 
                });
            }
        }


        
       [HttpPost]
       [Route("PorterTrack")]
       public HttpResponseMessage PorterTrack([FromBody] PorterTracReq loc)
       {
           rslt = "FALSE"; DataTable dt = new DataTable();
         //  string imgurl = "http://"+"localhost:1681/images/PorterTrack/";
           string mapurl=string.Empty , x=string.Empty,y=string.Empty,flr=string.Empty , mpath = @"C:\Websites\VirtualDirectory\Catering\Images\Map\", lpath = @"C:\Websites\VirtualDirectory\Catering\Images\Location\";
          //  live
           string    imgurl = "https://"+"apollodial50api.portzo.net/images/PorterTrack/";
           //old imgurl= "http://"+"localhost:1681/images/PorterTrack/"
           conStr = DataAccess.HosIdC;
           try
           {
             //  DataAccess.InsertError("1", "PorterTack api", conStr);

               imgurl = System.Configuration.ConfigurationManager.AppSettings["ClientsFilePath"];
                mapurl = System.Configuration.ConfigurationManager.AppSettings["ClientsFileMap"];
                // DataAccess.InsertError("2", "PorterTack api", conStr);
                if ((ModelState.IsValid))
               {
                   DataSet ds = new DataSet();
                   ds = DataAccess.getPorterLocation(loc.PorterId,loc.RequestId, DataAccess.HosIdC);
                //   DataAccess.InsertError("3", "PorterTack api", conStr);
                   if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                   {
                       string RequestStatusId = ds.Tables[0].Rows[0]["RequestStatusId"].ToString(), eta = ds.Tables[0].Rows[0]["eta"].ToString(), TagId = loc.PorterId, curtime;
                       x = ds.Tables[0].Rows[0]["Xaxis"].ToString(); y = ds.Tables[0].Rows[0]["Yaxis"].ToString(); flr = ds.Tables[0].Rows[0]["FloorName"].ToString();
                      // string fileName = loc.PorterId+ DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "")  ;

                     

                       rslt = " {\"status\": true,\"message\": \"1 Record found\",\"data\": {\"Map\":\"" +mapurl+ flr + "\",\"Eta\":\""+ eta + "\",\"RequestStatusId\":\"" + RequestStatusId + "\",\"Xaxis\":\"" + x + "\",\"Yaxis\":\"" + y + "\",\"FloorName\":\"" + flr + "\",\"Hhmm\":\"" + ds.Tables[0].Rows[0]["hhmm"].ToString() + "\",\"Location\":\"" + ds.Tables[0].Rows[0]["Location"].ToString() + "\"}}";
                       rtnBool = true;

                   }
                   else
                   {
                       rtnBool = false;

                   }






               }
               else
               {
                   rtnBool = false;
               }
           }
           catch(Exception ex)
           {
               DataAccess.InsertError(ex.Message, "PorterTack api er", conStr);

               rtnBool = false;
           }
           finally
           {
               ClearMap(lpath, DataAccess.HosIdC);
           }

           rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

           return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
       }

       

        /* old
        [HttpPost]
        [Route("PorterTrack")]
        public HttpResponseMessage PorterTrack([FromBody] PorterTracReq loc)
        {
            rslt = "FALSE"; DataTable dt = new DataTable();
          //  string imgurl = "http://"+"localhost:1681/images/PorterTrack/";
            string x=string.Empty,y=string.Empty,flr=string.Empty , mpath = @"C:\Websites\VirtualDirectory\Catering\Images\Map\", lpath = @"C:\Websites\VirtualDirectory\Catering\Images\Location\";
           //  live
            string    imgurl = "https://"+"apollodial50api.portzo.net/images/PorterTrack/";
            //old imgurl= "http://"+"localhost:1681/images/PorterTrack/"
            conStr = DataAccess.HosIdC;
            try
            {
              //  DataAccess.InsertError("1", "PorterTack api", conStr);

                imgurl = System.Configuration.ConfigurationManager.AppSettings["ClientsFilePath"];
               // DataAccess.InsertError("2", "PorterTack api", conStr);
                if ((ModelState.IsValid))
                {
                    DataSet ds = new DataSet();
                    ds = DataAccess.getPorterLocation(loc.PorterId,loc.RequestId, DataAccess.HosIdC);
                 //   DataAccess.InsertError("3", "PorterTack api", conStr);
                    if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        string RequestStatusId = ds.Tables[0].Rows[0]["RequestStatusId"].ToString(), eta = ds.Tables[0].Rows[0]["eta"].ToString(), TagId = loc.PorterId, curtime;
                        x = ds.Tables[0].Rows[0]["Xaxis"].ToString(); y = ds.Tables[0].Rows[0]["Yaxis"].ToString(); flr = ds.Tables[0].Rows[0]["FloorName"].ToString();
                        string fileName = loc.PorterId+ DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "")  ;

                       // DataAccess.InsertError("4", "PorterTack api", conStr);

                        //old     System.Drawing.Image img = System.Drawing.Image.FromFile(mpath + flr);
                        System.Drawing.Image img = System.Drawing.Image.FromFile(Path.Combine(
                            HttpContext.Current.Server.MapPath("~/Images/map"),flr
                        ) );
                        using (Graphics g = Graphics.FromImage(img))
                            {

                           // DataAccess.InsertError("5", "PorterTack api", conStr);

                            g.DrawImage(System.Drawing.Image.FromFile(Path.Combine(
                            HttpContext.Current.Server.MapPath("~/Images/map"), "porter1.png"
                        ) ), Convert.ToInt32(x) - 26, Convert.ToInt32(y) - 27, 150, 180);//90 100


                           // DataAccess.InsertError("6", "PorterTack api", conStr);


                            g.Dispose();

                              lpath = Path.Combine(
                            HttpContext.Current.Server.MapPath("~/Images/PorterTrack"),
                            fileName + ".jpg"


                        );
                           // DataAccess.InsertError("7", "PorterTack api", conStr);
                            // Save changes as output.jpg
                            //working   img.Save(lpath + fileName + ".jpg", ImageFormat.Jpeg);

                            img.Save(lpath , ImageFormat.Jpeg);
                           // DataAccess.InsertError("8", "PorterTack api", conStr);
                            img.Dispose();

                            }


                        //System.Drawing.Bitmap image = new System.Drawing.Bitmap(lpath + Curtim + ".jpg");
                        //ImageConverter imgCon = new ImageConverter();
                        //byte[] rPicture = (byte[])imgCon.ConvertTo(image, typeof(byte[]));
                        //string base64String = Convert.ToBase64String(rPicture, 0, rPicture.Length);
                        //string imgpath = "data:image/png;base64," + base64String;

                        rslt = " {\"status\": true,\"message\": \"1 Record found\",\"data\": {\"TrackUrl\":\"" +imgurl+fileName + ".jpg" + "\",\"Eta\":\""+ eta + "\",\"RequestStatusId\":\"" + RequestStatusId + "\",\"Xaxis\":\"" + x + "\",\"Yaxis\":\"" + RequestStatusId + "\",\"FloorName\":\"" + flr + "\"}}";
                        rtnBool = true;

                    }
                    else
                    {
                        rtnBool = false;
                         
                    }

                     

                     

                     
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch(Exception ex)
            {
                DataAccess.InsertError(ex.Message, "PorterTack api er", conStr);

                rtnBool = false;
            }
            finally
            {
                ClearMap(lpath, DataAccess.HosIdC);
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        */
        private void ClearMap(string lpath,string conStr)
        {

            //string[] files = Directory.GetFiles(lpath); working

            
                string[] files = Directory.GetFiles(HttpContext.Current.Server.MapPath("~/Images/PorterTrack"));

            foreach (string tfile in files)
            {
                try
                {
                    FileInfo fi = new FileInfo(tfile);
                    if (fi.CreationTime < DateTime.Now.AddSeconds(-40))
                        fi.Delete();
                }
                catch (Exception ex)
                {
                    DataAccess.InsertError(ex.Message, "PorterTack api ClearMap", conStr);
                }
            }
        }

        [HttpPost]
        [Route("RequestInfo")]
        public HttpResponseMessage RequestInfo([FromBody] ReqInfoReq loc)
        {
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    

                    dt = DataAccess.UpdateRequestInfo(loc, "JDREQINFO", DataAccess.HosIdC);


                    if (dt != null && dt.Rows.Count > 0)
                    {
                        rslt = " {\"status\": true,\"message\": \"Updated successfully\",\"data\": {\"Result\":\"TRUE\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch
            {
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        [HttpPost]
        [Route("RequestCreationMob")]
        public HttpResponseMessage RequestCreationMob([FromBody] TaskRequest request)
        {
            conStr = DataAccess.HosIdC;
            try
            {

                if (request == null || request.Tasks == null || request.Tasks.Count == 0)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                    new
                    {
                        status = false,
                        message = "No records received",
                        data = new { Tasks = new List<TaskResult>() }
                    });
                }

                int cod = 200;

                var results = new List<TaskResult>();
                foreach (var item in request.Tasks)
                {
                    TaskResult res = DataAccess.ReqCreation(item, request.From, request.To, request.ConversationId, request.Gender, request.user);
                    results.Add(res);
                    if (cod != 400)
                        cod = res.Status.ToUpper() == "FALSE" ? 400 : 200;
                }
                var response = new TaskResponse
                {
                    status = (cod == 400 ? false : true),
                    message = cod == 400 ? "invalid Category" : $"{results.Count} Records found",
                    data = new TaskData
                    {
                        Tasks = results
                    }
                };

                return Request.CreateResponse((HttpStatusCode)cod, response);
            }
            catch (Exception ex)
            {

                DataAccess.InsertError(ex.Message, "RequestcreationAPI", conStr);
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new
                    {
                        status = false,
                        message = "An error occurred while processing request",
                        // error = ex.Message,  // Optional - remove if not needed in output
                        data = new { Tasks = new List<TaskResult>() }
                    });
            }

        }

        [HttpPost]
        [Route("VoiceFeedback")]
        public HttpResponseMessage VoiceFeedback([FromBody] VoiceFbkMdl loc)
        {

            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                  //  loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "update";
                   // hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    dt = DataAccess.Updatevoicefeed(loc);
                    if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["RESULt"].ToString() == "TRUE")
                    {
                        rslt = " {\"status\": true,\"message\": \"Updated Successfully\",\"data\": {\"Result\":\"TRUE\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "VoiceFeedback", conStr);
                rtnBool = false;
            }
            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        //[HttpPost]
        //[Route("RequestCreation")]
        //public HttpResponseMessage RequestCreation([FromBody] TaskRequest request)
        //{
        //    conStr = DataAccess.HosIdC;
        //    try
        //    {

        //        DataAccess.InsertError(JsonConvert.SerializeObject(request).ToString(), "RequestcreationAPIReq", conStr);

        //        if (request == null || request.Tasks == null || request.Tasks.Count == 0)
        //        {
        //            return Request.CreateResponse(HttpStatusCode.BadRequest,
        //            new
        //            {
        //                status = false,
        //                message = "No records received",
        //                data = new { Tasks = new List<TaskResult>() }
        //            });
        //        }

        //        int cod = 200;
        //        string msg = string.Empty;
        //        var results = new List<TaskResult>();              
        //        foreach (var item in request.Tasks)
        //        {
        //            TaskResult res = DataAccess.ReqCreation(item, request.From, request.To, request.ConversationId, request.Gender, request.user);
        //            results.Add(res);
        //            if (cod != 400)
        //            {
        //                if (res.Result.Equals("Similar request already exists", StringComparison.OrdinalIgnoreCase))
        //                {
        //                    cod = 200; 
        //                }
        //                else
        //                {
        //                    cod = res.Status.ToUpper() == "FALSE" ? 400 : 200;
        //                }
        //            }
        //        }
        //        var response = new TaskResponse
        //        {
        //            status = (cod == 400 ?false: true),
        //            message = cod == 400 ?  msg : $"{results.Count} Records found",
        //            data = new TaskData
        //            {
        //                Tasks = results
        //            }
        //        };

        //        return Request.CreateResponse((HttpStatusCode)cod, response);
        //    }
        //    catch (Exception ex)
        //    {

        //        DataAccess.InsertError(ex.Message, "RequestcreationAPI", conStr);
        //        return Request.CreateResponse(HttpStatusCode.InternalServerError,
        //            new
        //            {
        //                status = false,
        //                message = "An error occurred while processing request",
        //               // error = ex.Message,  // Optional - remove if not needed in output
        //            data = new { Tasks = new List<TaskResult>() }
        //            });
        //    }

        //}

        //[HttpPost]
        //[Route("RequestCreation")]
        //public HttpResponseMessage RequestCreation([FromBody] TaskRequest request)
        //{
        //    conStr = DataAccess.HosIdC;
        //    try
        //    {

        //        DataAccess.InsertError(JsonConvert.SerializeObject(request).ToString(), "RequestcreationAPIReq", conStr);

        //        if (request == null || request.Tasks == null || request.Tasks.Count == 0)
        //        {
        //            return Request.CreateResponse(HttpStatusCode.BadRequest,
        //            new
        //            {
        //                status = false,
        //                message = "No records received",
        //                data = new { Tasks = new List<TaskResult>() }
        //            });
        //        }

        //        int cod = 200;
        //        string msg = string.Empty;
        //        var results = new List<TaskResult>();
        //        foreach (var item in request.Tasks)
        //        {
        //            TaskResult res = DataAccess.ReqCreationNew(item, request.From, request.To, request.ConversationId, request.Gender, request.user, request.Language);
        //            results.Add(res);

        //        }
        //        var response = new TaskResponse
        //        {
        //            status = (cod == 400 ? false : true),
        //            message = cod == 400 ? msg : $"{results.Count} Records found",
        //            data = new TaskData
        //            {
        //                Tasks = results,

        //            }


        //        };

        //        return Request.CreateResponse((HttpStatusCode)cod, response);
        //    }
        //    catch (Exception ex)
        //    {

        //        DataAccess.InsertError(ex.Message, "RequestcreationAPI", conStr);
        //        return Request.CreateResponse(HttpStatusCode.InternalServerError,
        //            new
        //            {
        //                status = false,
        //                message = "An error occurred while processing request",
        //                // error = ex.Message,  // Optional - remove if not needed in output
        //                data = new { Tasks = new List<TaskResult>() }

        //            });
        //    }

        //}


        //   [HttpPost]
        //   [Route("RequestCreation")]
        //  public HttpResponseMessage RequestCreation([FromBody] TaskRequest request)
        //    {
        //    conStr = DataAccess.HosIdC;

        //    try
        //    {
        //        DataAccess.InsertError(JsonConvert.SerializeObject(request),"RequestcreationAPIReq",conStr);

        //        if (request == null ||request.Tasks == null ||request.Tasks.Count == 0)
        //        {
        //            return Request.CreateResponse(HttpStatusCode.BadRequest,
        //                new
        //                {
        //                    status = false,
        //                    message = "No records received",
        //                    data = new
        //                    {
        //                        Tasks = new List<TaskResult>()
        //                    }
        //                });
        //        }

        //        var results = new List<TaskResult>();

        //        foreach (var item in request.Tasks)
        //        {
        //            TaskResult res = DataAccess.ReqCreationNew(item,request.From,request.To,request.ConversationId,request.Gender,request.user, request.Language);

        //            results.Add(res);
        //        }

        //        var response = new TaskResponse
        //        {
        //            status = true,
        //            message = $"{results.Count} Records found",
        //            data = new TaskData
        //            {
        //                Tasks = results
        //            }
        //        };

        //        return Request.CreateResponse(HttpStatusCode.OK,response);
        //    }
        //    catch (Exception ex)
        //    {
        //        DataAccess.InsertError(ex.ToString(),"RequestcreationAPI",conStr);

        //        return Request.CreateResponse(HttpStatusCode.InternalServerError,
        //            new
        //            {
        //                status = false,
        //                message = "An error occurred while processing request",
        //                data = new
        //                {
        //                    Tasks = new List<TaskResult>()
        //                }
        //            });
        //    }
        //}


        [HttpPost]
        [Route("RequestcreationAPIReq")]
        public HttpResponseMessage RequestCreationAI([FromBody] TaskRequest request)
        {
            conStr = DataAccess.HosIdC;

            try
            {
                DataAccess.InsertError(JsonConvert.SerializeObject(request), "RequestcreationAPIReq", conStr);

                if (request == null || request.Tasks == null || request.Tasks.Count == 0)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new
                        {
                            status = false,
                            message = "No records received",
                            data = new
                            {
                                Tasks = new List<TaskResult>()
                            }
                        });
                }

                var results = new List<TaskResult>();

                foreach (var item in request.Tasks)
                {
                    TaskResult res = DataAccess.ReqCreationNew(item, request.From, request.To, request.ConversationId, request.Gender, request.user, request.Language);

                    results.Add(res);
                }

                var response = new TaskResponse
                {
                    status = true,
                    message = $"{results.Count} Records found",
                    data = new TaskData
                    {
                        Tasks = results
                    }
                };

                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.ToString(), "RequestcreationAPI", conStr);

                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new
                    {
                        status = false,
                        message = "An error occurred while processing request",
                        data = new
                        {
                            Tasks = new List<TaskResult>()
                        }
                    });
            }
        }

        [HttpPost]
        [Route("FoodOrdering")]
        public HttpResponseMessage SubmitAIFoodOrders([FromBody] FoodOrderAISlimRequest request)
        {
            conStr = DataAccess.HosIdC;
            try
            {
                if (request == null || request.Orders == null || request.Orders.Count == 0)
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { status = false, message = "No rows received", data = new List<object>() });

                for (int i = 0; i < request.Orders.Count; i++)
                {
                    var r = request.Orders[i];

                    if (string.IsNullOrWhiteSpace(r.ROOMNO))
                        return Request.CreateResponse(HttpStatusCode.BadRequest,
                            new { status = false, message = $"Row {i + 1}: ROOMNO is required", data = new List<object>() });

                    if (string.IsNullOrWhiteSpace(r.ITEMID))
                        return Request.CreateResponse(HttpStatusCode.BadRequest,
                            new { status = false, message = $"Row {i + 1}: ITEMID (JSON_ID like BRK-001) is required", data = new List<object>() });

                    if (r.QUANTITY <= 0)
                        return Request.CreateResponse(HttpStatusCode.BadRequest,
                            new { status = false, message = $"Row {i + 1}: QUANTITY must be > 0", data = new List<object>() });
                }

                if (!string.IsNullOrWhiteSpace(request.HospitalId))
                {
                    var dec = AesOperation.DecryptString(request.HospitalId);
                    var parts = dec.Split('_');
                    if (parts.Length > 1) conStr = parts[1];
                }

                foreach (var r in request.Orders)
                    r.ISPREORDER = NormalizeBit(r.ISPREORDER);

                DataTable dt = DataAccess.SubmitAIFoodOrders(request.Orders, conStr);

                if (dt == null || dt.Rows.Count == 0)
                    return Request.CreateResponse(HttpStatusCode.OK,
                        new { status = false, message = "Insert failed", data = new List<object>() });

                var rows = dt.AsEnumerable().Select(rw => new
                {
                    ORDERID = Convert.ToString(rw["ORDERID"]),
                    ITEMNAME = Convert.ToString(rw["ITEMNAME"])
                }).ToList();

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    status = true,
                    message = $"{rows.Count} Row(s) inserted successfully",
                    data = rows
                });
            }
            catch (SqlException sqlEx)
            {
                DataAccess.InsertError(sqlEx.ToString(), "SubmitAIFoodOrders_SQL", conStr);

                string friendly;
                switch (sqlEx.Number)
                {
                    case 50000:
                        friendly = sqlEx.Message;
                        break;
                    default:
                        friendly = "Database error while submitting order.";
                        break;
                }

                return Request.CreateResponse(HttpStatusCode.OK,
                    new { status = false, message = friendly, data = new List<object>() });
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.ToString(), "SubmitAIFoodOrders", conStr);
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { status = false, message = "An error occurred while processing request", data = new List<object>() });
            }
        }

        private static string NormalizeBit(string v)
        {
            if (string.IsNullOrWhiteSpace(v)) return "0";
            v = v.Trim().ToLower();
            return (v == "yes" || v == "true" || v == "1" || v == "y") ? "1" : "0";
        }

        [HttpPost]
        [Route("VideoCreationAPIReq")]
        public HttpResponseMessage VideoCreationAPI([FromBody] TaskRequest request)
        {
            conStr = DataAccess.HosIdC;

            try
            {
                DataAccess.InsertError(JsonConvert.SerializeObject(request), "VideoCreationAPIReq", conStr);

                if (request == null || request.Tasks == null || request.Tasks.Count == 0)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new
                        {
                            status = false,
                            message = "No records received",
                            data = new
                            {
                                Tasks = new List<TaskResult>()
                            }
                        });
                }

                var results = new List<TaskResult>();

                foreach (var item in request.Tasks)
                {
                    TaskResult res = DataAccess.VideoCreation(
                        item,
                        request.From,
                        request.To,
                        request.ConversationId,
                        request.Gender,
                        request.user,
                        request.Language);

                    results.Add(res);
                }

                var response = new TaskResponse
                {
                    status = true,
                    message = $"{results.Count} Records found",
                    data = new TaskData
                    {
                        Tasks = results
                    }
                };

                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.ToString(), "VideoCreationAPI", conStr);

                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new
                    {
                        status = false,
                        message = "An error occurred while processing request",
                        data = new
                        {
                            Tasks = new List<TaskResult>()
                        }
                    });
            }
        }

        [HttpPost]
        [Route("RequestCreation")]
        public HttpResponseMessage RequestCreation([FromBody] TaskRequest request)
        {
            conStr = DataAccess.HosIdC;
            try
            {

                DataAccess.InsertError(JsonConvert.SerializeObject(request).ToString(), "RequestcreationAPIReq", conStr);

                if (request == null || request.Tasks == null || request.Tasks.Count == 0)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                    new
                    {
                        status = false,
                        message = "No records received",
                        data = new { Tasks = new List<TaskResult>() }
                    });
                }

                int cod = 200;
                string msg = string.Empty;
                var results = new List<TaskResult>();
                foreach (var item in request.Tasks)
                {
                    TaskResult res = DataAccess.ReqCreation(item, request.From, request.To, request.ConversationId, request.Gender, request.user);
                    results.Add(res);
                    if (cod != 400)
                        cod = res.Status.ToUpper() == "FALSE" ? 400 : 200;
                    msg = res.Result;
                }
                var response = new TaskResponse
                {
                    status = (cod == 400 ? false : true),
                    message = cod == 400 ? msg : $"{results.Count} Records found",
                    data = new TaskData
                    {
                        Tasks = results
                    }
                };

                return Request.CreateResponse((HttpStatusCode)cod, response);
            }
            catch (Exception ex)
            {

                DataAccess.InsertError(ex.Message, "RequestcreationAPI", conStr);
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new
                    {
                        status = false,
                        message = "An error occurred while processing request",
                        // error = ex.Message,  // Optional - remove if not needed in output
                        data = new { Tasks = new List<TaskResult>() }
                    });
            }

        }


        [HttpGet]
        [Route("EncryptBedId")]
        public HttpResponseMessage EncryptBedId(string value)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(value))
                {
                    return Request.CreateResponse(
                        HttpStatusCode.OK,
                        new
                        {
                            status = false,
                            message = "value is required",
                            data = new { }
                        });
                }

                string payload = value.Contains("$$")
                    ? value
                    : value + "$$" + value + "$$" + "$$" + "$$";

                string encrypted = AesOperation.EncryptString(payload);
                string urlEncoded = Uri.EscapeDataString(encrypted);

                return Request.CreateResponse(
                    HttpStatusCode.OK,
                    new
                    {
                        status = true,
                        message = "1 Record found",
                        data = new
                        {
                            plain = payload,
                            encrypted = encrypted,
                            urlEncoded = urlEncoded,
                            url = "/PreLanding?BedInfo=" + urlEncoded
                        }
                    });
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(
                    ex.Message,
                    "EncryptBedId",
                    DataAccess.HosIdC);

                return Request.CreateResponse(
                    HttpStatusCode.InternalServerError,
                    new
                    {
                        status = false,
                        message = "Please check the data",
                        data = new { }
                    });
            }
        }



        [HttpGet]
        [Route("GetRequestedDepByPatientID")]
        public HttpResponseMessage GetRequestedDepByPatientID(string PatID, string HosID)
        {
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if (!string.IsNullOrWhiteSpace(PatID))
                {
                    if (!string.IsNullOrWhiteSpace(HosID))
                    {
                        var dec = AesOperation.DecryptString(HosID);
                        hosID = dec.Split('_')[0];
                        conStr = dec.Split('_')[1];
                    }
                    else
                    {
                        conStr = DataAccess.HosIdC;
                    }

                    dt = DataAccess.GetRequestedDepByPatientID(PatID, conStr);

                    if (dt != null && dt.Rows.Count > 0)
                    {
                        var departments = dt.AsEnumerable()
                                            .Select(r => Convert.ToString(r["DEPARTMENTNAME"]))
                                            .Where(x => !string.IsNullOrEmpty(x))
                                            .ToList();

                        rslt = " {\"status\": true,\"message\": \"" + departments.Count + " Departments found\",\"data\": {\"Departments\":[\"" + string.Join("\",\"", departments) + "\"]}}";
                    }
                    else
                    {
                        rslt = " {\"status\": true,\"message\": \"No departments found\",\"data\": {\"Departments\":[]}}";
                    }
                    rtnBool = true;
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.ToString(), "GetRequestedDepByPatientID", conStr);
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        [HttpGet]
        [Route("GetVideoCategories")]
        public HttpResponseMessage GetVideoCategories(string HospitalID)
        {
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if (!string.IsNullOrWhiteSpace(HospitalID))
                {
                    var dec = AesOperation.DecryptString(HospitalID);
                    hosID = dec.Split('_')[0];
                    conStr = dec.Split('_')[1];
                }
                else
                {
                    conStr = DataAccess.HosIdC;
                }

                dt = DataAccess.GetVideoCategories(conStr);

                if (dt != null && dt.Rows.Count > 0)
                {
                    var videos = dt.AsEnumerable()
                                   .Select(r => new
                                   {
                                       Id = Convert.ToString(r["CategoryId"]),
                                       CategoryName = Convert.ToString(r["CategoryName"]),
                                       CategoryDescription = Convert.ToString(r["CategoryDescription"])
                                   })
                                   .ToList();

                    rslt = JsonConvert.SerializeObject(new
                    {
                        status = true,
                        message = videos.Count + " Video categories found",
                        data = new { Videos = videos }
                    });
                }
                else
                {
                    rslt = " {\"status\": true,\"message\": \"No video categories found\",\"data\": {\"Videos\":[]}}";
                }
                rtnBool = true;
            }
            catch (Exception ex)    
            {
                DataAccess.InsertError(ex.ToString(), "GetVideoCategories", conStr);
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        [HttpPost]
        [Route("ProcessAdtEvent")]
        public HttpResponseMessage ProcessAdtEvent([FromBody] AdtEventRequest request)
        {
            conStr = DataAccess.HosIdC;

            try
            {
                if (request == null || request.PatientId <= 0 || string.IsNullOrWhiteSpace(request.EventType))
                {
                    return Request.CreateResponse(HttpStatusCode.OK,
                        new { status = false, message = "Please check the data.", data = new { } });
                }

                DataTable dt = DataAccess.ProcessAdtEvent(
                    request.PatientId,
                    request.EventType,
                    request.NewRoom,
                    request.NewBed,
                    request.NewBedID,
                    request.Reason,
                    conStr
                );

                if (dt != null && dt.Rows.Count > 0 && Convert.ToString(dt.Rows[0]["RESULT"]) == "TRUE")
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new
                    {
                        status = true,
                        message = "ADT Event processed successfully.",
                        data = new { }
                    });
                }

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    status = false,
                    message = "Failed to process ADT event.",
                    data = new { }
                });
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.ToString(), "ProcessAdtEvent", conStr);

                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new
                    {
                        status = false,
                        message = "An error occurred while processing request",
                        data = new { }
                    });
            }
        }

        [HttpGet]
        [Route("GetFeedbackDepartments")]
        public HttpResponseMessage GetFeedbackDepartments(string HosID)
        {
            try
            {
                string conStrName = "";

                if (!string.IsNullOrWhiteSpace(HosID))
                {
                    var dec = AesOperation.DecryptString(HosID);
                    var parts = dec.Split('_');
                    if (parts.Length > 1)
                    {
                        conStrName = parts[1];
                    }
                }
                else
                {
                    conStrName = DataAccess.HosIdC;
                }

                DataTable dt = DataAccess.GetAllFeedbackDepartments(conStrName);

                var departments = dt.AsEnumerable()
                    .Where(r => !string.IsNullOrWhiteSpace(Convert.ToString(r["DEPARTMENTKEY"])))
                    .GroupBy(r => Convert.ToString(r["DEPARTMENTKEY"]))
                    .Select(g => new
                    {
                        key = g.Key,
                        description = Convert.ToString(g.First()["DESCRIPTION"])
                    })
                    .Cast<object>()
                    .ToList();

                departments.Add(new
                {
                    key = "other",
                    description = "Other"
                });

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    status = true,
                    message = departments.Count + " Departments found",
                    data = new { Departments = departments }
                });
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.ToString(), "GetFeedbackDepartments", HosID);

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    status = false,
                    message = "Please check the data.",
                    data = new { Error = ex.Message }
                });
            }
        }


        [HttpPost]
        [Route("sendFeedback")]
        public HttpResponseMessage SendFeedback([FromBody] SendFeedbackIP request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.patient_id))
                return Fail("patient_id is required");

            bool hasFeedback = request.feedback != null && request.feedback.Count > 0;
            bool hasFeedbackList = request.feedback_list != null && request.feedback_list.Count > 0;

            if (!hasFeedback && !hasFeedbackList)
                return Fail("No records received");

            var source = hasFeedback ? request.feedback : request.feedback_list;

            var missingFeedbackSummary = source
                .Where(kv => string.IsNullOrWhiteSpace(kv.Value?.feedback_summary))
                .Select(kv => kv.Key)
                .ToList();

            if (missingFeedbackSummary.Count > 0)
                return Fail($"feedback_summary is required for: {string.Join(", ", missingFeedbackSummary)}");

            var invalidRatings = source
                .Where(kv => !string.IsNullOrWhiteSpace(kv.Value?.ratings) &&
                             kv.Value.ratings != "satisfied" &&
                             kv.Value.ratings != "neutral" &&
                             kv.Value.ratings != "unsatisfied")
                .Select(kv => $"{kv.Key}='{kv.Value.ratings}'")
                .ToList();

            if (invalidRatings.Count > 0)
                return Fail($"Invalid ratings for: {string.Join(", ", invalidRatings)}. Allowed: satisfied, neutral, unsatisfied");

            string conStr = null;

            try
            {
                var dec = AesOperation.DecryptString(request.hospital_id);

                var parts = dec.Split('_');
                if (parts.Length < 2)
                    return Fail("Invalid hospital_id format");

                hosID = parts[0];
                conStr = parts[1];

                var normalized = source.ToDictionary(
                    kv => kv.Key,
                    kv => new
                    {
                        patient_feedback_summary = kv.Value.patient_feedback_summary,
                        feedback_summary = kv.Value.feedback_summary,
                        ratings = string.IsNullOrWhiteSpace(kv.Value.ratings)
                                                       ? "satisfied"
                                                       : kv.Value.ratings
                    });

                string payload = JsonConvert.SerializeObject(normalized);

                DataTable dt = DataAccess.SendFeedback(
                    request.patient_id, request.session_id, payload, conStr);

                var saved = new List<object>();

                if (dt != null && dt.Rows.Count > 0)
                {
                    saved.Add(new
                    {
                        feedback_id = dt.Rows[0]["FEEDBACKID"],
                        reference_no = dt.Rows[0]["REFERENCENO"].ToString(),
                        message = dt.Rows[0]["MESSAGE"].ToString()
                    });
                }

                return Request.CreateResponse(HttpStatusCode.OK,
                    new
                    {
                        status = true,
                        message = "Feedback saved successfully",
                        data = new { Feedback = saved }
                    });
            }
            catch (Exception ex)
            {
                if (!string.IsNullOrWhiteSpace(conStr))
                    DataAccess.InsertError(ex.ToString(), "sendFeedback", conStr);

                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new
                    {
                        status = false,
                        message = "An error occurred while processing request",
                        data = new { Feedback = new List<object>() }
                    });
            }
        }

        private HttpResponseMessage Fail(string msg) =>
            Request.CreateResponse(HttpStatusCode.BadRequest,
                new
                {
                    status = false,
                    message = msg,
                    data = new { Feedback = new List<object>() }
                });

        [HttpPost]
        [Route("SaveAudioFile")]
        public HttpResponseMessage SaveAudioFile()
        {
            conStr = DataAccess.HosIdC;
            RtnSaveAudioTextData dumd = new RtnSaveAudioTextData();
            rslt = "FALSE"; RtnSaveAudioText rtnRst; DataTable dt = new DataTable();
            string signimg = string.Empty;//, photoimg = string.Empty;            
            try
            {
                string conversationid = HttpContext.Current.Request.Form["ConversationId"].ToString() ;
                rtnBool = (!Request.Content.IsMimeMultipartContent() ? false : true);
                var fileName = string.Empty;
                if (!Request.Content.IsMimeMultipartContent())
                {
                    rtnBool = false;
                    //throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
                }
                rtnBool = true;
                rslt = "FALSE";
                try
                {
                    //  var file = HttpContext.Current.Request.Files.Count > 0 ?  HttpContext.Current.Request.Files[0] : null;
                    foreach (string fn in HttpContext.Current.Request.Files)
                    {
                        HttpPostedFile file = HttpContext.Current.Request.Files[fn];
                        if (rtnBool && file != null && file.ContentLength > 0 && (new[] { ".mp3" }.Contains(Path.GetExtension(file.FileName.ToLower())) ? true : false))
                        {
                              fileName = Path.GetFileName(file.FileName).ToUpper();
                            fileName =  conversationid + "_Audio_" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                            signimg = fileName;
                            var path = Path.Combine(
                                HttpContext.Current.Server.MapPath("~/Images/Profile"), 
                                fileName
                            );

                            //  path = @"C:\Websites\VirtualDirectory\Catering\" + fileName; //live
                            file.SaveAs(path);
                           
                            rtnBool = true;
                             

                        }
                    }
                }
                catch (Exception e)
                {
                    DataAccess.InsertError(e.Message, "SaveAudioFile1", conStr);
                    rtnBool = false;
                }

                if (rtnBool)
                {                    
                    dt = DataAccess.SaveAudioFileDA(signimg, conversationid, "audio");

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnSaveAudioText
                    {
                        status = (rslt.Split('_')[0].Equals("TRUE") ? true : false),
                        message = rslt.Split('_')[0].Equals("TRUE") ? "File saved successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnSaveAudioTextData
                        {
                            Result = rslt.Equals("TRUE") ? "TRUE" : rslt.Contains("_") ? rslt.Split('_')[1].ToString() : "FALSE",
                            StoragePath = rslt.Split('_')[0].Equals("TRUE") ? "" + signimg : ""
                        }
                    };

                }
                else
                {
                    rtnRst = new RtnSaveAudioText
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }

            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "SaveAudioFile2", conStr);
                rtnRst = new RtnSaveAudioText
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [HttpPost]
        [Route("SaveTextFile")]
        public HttpResponseMessage SaveTextFile()
        {
            conStr = DataAccess.HosIdC;
            RtnSaveAudioTextData dumd = new RtnSaveAudioTextData();
            rslt = "FALSE"; RtnSaveAudioText rtnRst; DataTable dt = new DataTable();
            string signimg = string.Empty;//, photoimg = string.Empty;

            try
            {
                string conversationid = HttpContext.Current.Request.Form["ConversationId"].ToString();
                rtnBool = (!Request.Content.IsMimeMultipartContent() ? false : true);
                var fileName = string.Empty;
                if (!Request.Content.IsMimeMultipartContent())
                {
                    rtnBool = false;
                    //throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
                }
                rtnBool = true;
                rslt = "FALSE";
                try
                {
                    //  var file = HttpContext.Current.Request.Files.Count > 0 ?  HttpContext.Current.Request.Files[0] : null;
                    foreach (string fn in HttpContext.Current.Request.Files)
                    {
                        HttpPostedFile file = HttpContext.Current.Request.Files[fn];
                        if (rtnBool && file != null && file.ContentLength > 0 && (new[] { ".txt" }.Contains(Path.GetExtension(file.FileName.ToLower())) ? true : false))
                        {
                            fileName = Path.GetFileName(file.FileName).ToUpper();
                            fileName = conversationid + "_Text_" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                            signimg = fileName;
                            var path = Path.Combine(
                                HttpContext.Current.Server.MapPath("~/Images/Profile"),
                                fileName
                            );

                            //  path = @"C:\Websites\VirtualDirectory\Catering\" + fileName; //live
                            file.SaveAs(path);

                            rtnBool = true;


                        }
                    }
                }
                catch (Exception e)
                {
                    DataAccess.InsertError(e.Message, "SaveAudioFile1", conStr);
                    rtnBool = false;
                }

                if (rtnBool)
                {
                    dt = DataAccess.SaveAudioFileDA(signimg, conversationid, "text");

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnSaveAudioText
                    {
                        status = (rslt.Split('_')[0].Equals("TRUE") ? true : false),
                        message = rslt.Split('_')[0].Equals("TRUE") ? "File saved successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnSaveAudioTextData { Result = rslt.Equals("TRUE") ? "TRUE" : rslt.Contains("_") ? rslt.Split('_')[1].ToString() : "FALSE" ,
                        StoragePath= rslt.Split('_')[0].Equals("TRUE") ? "" + signimg : ""}
                    };

                }
                else
                {
                    rtnRst = new RtnSaveAudioText
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }

            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "SaveAudioFile2", conStr);
                rtnRst = new RtnSaveAudioText
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }
            
            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        [HttpPost]
        [Route("Feedback")]
        public HttpResponseMessage Feedback([FromBody] FeedbackIp request)
        {
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {


                    dt = DataAccess.FeedbackJdDA(request,"update");


                    if (dt != null && dt.Rows.Count > 0 )
                    {
                        rslt = " {\"status\": true,\"message\": \"Updated successfully\",\"data\": {\"Result\":\"TRUE\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch
            {
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }
        /*
        [HttpPost]
        public HttpResponseMessage Feedback([FromBody] FeedbackIp request)//wokring not comp
        {
            bool Rslt = false;
            string sts = request.status.ToUpper() == "ended" ? "ended" : "initiated";
            conStr = DataAccess.HosIdC;
            try
            {
                if (request == null)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                    new { status = false, message = "Invalid request" });
                }

                Rslt = DataAccess.ConversationUpdateJdDA(request, sts).Rows[0]["result"].ToString().ToUpper() == "TRUE" ? true : false;


                if (Rslt)
                {
                    var response = new ConversationResponse
                    {
                        status = true,
                        message = "conversation " + sts,
                        data = new ConversationData
                        {
                            Result = "TRUE",
                            ConversationID = request.convId
                        }
                    };

                    return Request.CreateResponse(HttpStatusCode.OK, response);
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { status = false, message = "DB insert failed" });
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "SaveAudioFile2", conStr);
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { status = false, message = ex.Message });
            }
        }
        */



        [HttpPost]
        public HttpResponseMessage StatusUpdate([FromBody] ConversationRequest request)
        {
            bool Rslt = false;
            string sts = request.status.ToUpper() == "ENDED" ? "ended": "initiated" ;
            conStr = DataAccess.HosIdC;
            try
            {
                if (request == null)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                    new { status = false, message = "Invalid request" });
                }

                Rslt = DataAccess.ConversationUpdateJdDA(request, sts).Rows[0]["result"].ToString().ToUpper()=="TRUE"?true:false;
                
                
                if (Rslt)
                {
                    var response = new ConversationResponse
                    {
                        status = true,
                        message = "conversation "+ sts,
                        data = new ConversationData
                        {
                            Result = "TRUE",
                            ConversationID = request.convId
                        }
                    };

                    return Request.CreateResponse(HttpStatusCode.OK, response);
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { status = false, message = "DB insert failed" });
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "STATUSUPDATE JD", conStr);
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { status = false, message = ex.Message });
            }
        }


        [HttpPost]
        [Route("GetProfileOld")]
        public HttpResponseMessage GetProfileOld([FromBody] GetProfileIP request)
        {
            bool Rslt = false;
            string sts = "GET";
            conStr = DataAccess.HosIdC;
            try
            {
                if (request == null)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { status = false, message = "Invalid request" });
                }

                DataTable dt = DataAccess.GetProfileDA(request, sts);
                Rslt = dt.Rows[0]["result"].ToString().ToUpper() == "TRUE";

                if (Rslt)
                {
                    var response = new GetProfileResponse
                    {
                        status = true,
                        message = "1 Row Found ",
                        data = new GetProfileData
                        {
                            uhid = dt.Rows[0]["uhid"].ToString(),
                            patientName = dt.Rows[0]["Patientname"].ToString(),
                            gender = dt.Rows[0]["Gender"].ToString(),
                            userId = request.userId,
                            BedNo = request.userId,
                            age = dt.Rows[0]["age"].ToString(),
                            Language = dt.Rows[0]["Language"].ToString(),
                            dateofAdmisison = dt.Rows[0]["DATEOFADMISSION"].ToString(),
                            userName = dt.Rows[0]["Patientname"].ToString(),
                            Region = dt.Rows[0]["Region"].ToString(),
                            tier = dt.Rows[0]["TierName"].ToString(),
                            tierCode = dt.Rows[0]["TierCode"].ToString(),
                            tierLevel = Convert.ToInt32(dt.Rows[0]["TierLevel"])
                        }
                    };

                    return Request.CreateResponse(HttpStatusCode.OK, response);
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError,
                        new { status = false, message = "Please check data" });
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "getprofile1", conStr);
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { status = false, message = ex.Message });
            }
        }

        // commented 26 12 2025
        [HttpPost]
        [Route("RequestCreate")]
        public HttpResponseMessage RequestCreate([FromBody] RequestCreate loc)
        {
             
            rslt = "FALSE";   DataTable dt = new DataTable();
            try
            {
                if (ModelState.IsValid)
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "RequestInsert";
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    //  loc.RemarksId = String.IsNullOrEmpty(loc.RemarksId) ? "0" : loc.RemarksId;
                    dt = DataAccess.RequestInsert(loc, conStr);
                    if (dt != null && dt.Rows.Count > 0)
                    {
                        if(loc.RequestStatusId=="2")
                        rslt = " {\"status\": true,\"message\": \"Request Added successfully\",\"data\": {\"Result\":\"TRUE\",\"RequestNo\":\"" + dt.Rows[0]["Requestno"] + "\"}}";
                        else
                        rslt = " {\"status\": true,\"message\": \"Request updated successfully\",\"data\": {\"Result\":\"TRUE\",\"RequestNo\":\"" + dt.Rows[0]["Requestno"] + "\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch(Exception ex)
            {
                
                rtnBool = false;
                DataAccess. InsertError(ex.Message, "RequestCreate", conStr);
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        [HttpPost]
        [Route("QRLocationList")]
        public HttpResponseMessage QRLocationList([FromBody] Locations loc) //get survey locationlist
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnLocationListQR rtnRst; DataSet dt = new DataSet();
            LocationMacListQR dumd = new LocationMacListQR();
            dumd.qrLocations = new List<LocationDetailsQR> { };
            
            // dumd = null;
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                loc.Process = "GETQR";
                hosID = loc.HospitalId.Split('_')[0]; conStr =DataAccess.HosIdC ;// loc.HospitalId.Split('_')[1];
                dt = DataAccess.DaLocationList(loc, "USER", conStr);

                if (loc.Process == "GETQR")
                {
                    if (dt != null && dt.Tables[0].Rows.Count > 0 && dt.Tables[0].Rows[0]["result"].ToString() == "TRUE")
                    {

                        rslt = "FALSE";
                        rtnRst = new RtnLocationListQR
                        {
                            status = true,
                            message = dt.Tables[0].Rows.Count.ToString() + " Records found",
                            data = new LocationMacListQR()
                            {
                                qrLocations = (from rw in dt.Tables[0].AsEnumerable()
                                             select
                 new LocationDetailsQR()
                 {
                     LocationId = Convert.ToInt32(rw["Id"]),
                     LocationName = Convert.ToString(rw["Zonename"]),
                     FloorName = Convert.ToString(rw["floorname"]),
                     LoocAIUrl = Convert.ToString(rw["LoocAIUrl"]),
                     IntegrationUrl = Convert.ToString(rw["IntegrationUrl"]),    
                     IsQRCode = Convert.ToString(rw["IsQRCode"]),
                     QRCode = Convert.ToString(rw["QRCode"]),
                     IsActive = Convert.ToInt32(rw["IsActive"]),
                     Result = Convert.ToString(rw["Result"]),
                      HisBedId = Convert.ToString(rw["bedid"]),
                     HisBedNo = Convert.ToString(rw["bedno"])

                 }).ToList() 
                            }
                        };

                    }

                    else
                    {
                        rtnRst = new RtnLocationListQR
                        {
                            status = false,
                            message = GlobalVar.PlsChkData,
                            data = dumd
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnLocationListQR
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };


                }
            }
            catch (Exception ex)
            {

                rtnRst = new RtnLocationListQR
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };

            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);



        }

        [HttpPost]
        [Route("SaveQRCode")]
        public HttpResponseMessage SaveQRCode()
        {
            conStr = DataAccess.HosIdC;
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnLocationListQR rtnRst; DataSet dt = new DataSet();
            LocationMacListQR dumd = new LocationMacListQR();
            dumd.qrLocations = new List<LocationDetailsQR> { };

            rslt = "FALSE";    
            string signimg = string.Empty;//, photoimg = string.Empty;

            try
            {
                string LocId = HttpContext.Current.Request.Form["LocationId"].ToString(),
                    LocName = HttpContext.Current.Request.Form["LocationName"].ToString();
                 
                rtnBool = (!Request.Content.IsMimeMultipartContent() ? false : true);
                var fileName = string.Empty;
                if (!Request.Content.IsMimeMultipartContent())
                {
                    rtnBool = false;
                    //throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
                }
                else                
                rtnBool = true;

                rslt = "FALSE";
                try
                {
                    //  var file = HttpContext.Current.Request.Files.Count > 0 ?  HttpContext.Current.Request.Files[0] : null;
                    foreach (string fn in HttpContext.Current.Request.Files)
                    {
                        HttpPostedFile file = HttpContext.Current.Request.Files[fn];
                        fileName = Path.GetFileName(file.FileName).ToUpper();
                         
                            if (fileName.Substring(0, 6) == "QRCODE" && rtnBool && file != null && file.ContentLength > 0 && (new[] { ".jpg" }.Contains(Path.GetExtension(file.FileName.ToLower())) ? true : false))
                        {
                           
                            fileName = "QR_"+LocName + "_" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                            signimg = fileName;
                            var path = Path.Combine(
                                HttpContext.Current.Server.MapPath("~/Images/Profile"),
                                fileName
                            );

                            //  path = @"C:\Websites\VirtualDirectory\Catering\" + fileName; //live
                            file.SaveAs(path);

                            rtnBool = true;


                        }
                            else
                            rtnBool = false;
                    }
                }
                catch (Exception e)
                {
                    DataAccess.InsertError(e.Message, "SaveQRCode", conStr);
                    rtnBool = false;
                }

                if (rtnBool)
                {
                    dt = DataAccess.SaveQRcodeDA(LocId, LocName, signimg, "add");

                    if (dt != null && dt.Tables[0].Rows.Count > 0  )
                    {

                        rslt = "FALSE";
                        rtnRst = new RtnLocationListQR
                        {
                            status = true,
                            message = dt.Tables[0].Rows.Count.ToString() + " Records found",
                            data = new LocationMacListQR()
                            {
                                qrLocations = (from rw in dt.Tables[0].AsEnumerable()
                                             select
                 new LocationDetailsQR()
                 {
                     LocationId = Convert.ToInt32(rw["Id"]),
                     LocationName = Convert.ToString(rw["Zonename"]),
                     FloorName = Convert.ToString(rw["floorname"]),
                     LoocAIUrl = Convert.ToString(rw["LoocAIUrl"]),
                     IntegrationUrl = Convert.ToString(rw["IntegrationUrl"]),
                     IsQRCode = Convert.ToString(rw["IsQRCode"]),
                     QRCode = Convert.ToString(rw["QRCode"]),
                     IsActive = Convert.ToInt32(rw["IsActive"]),
                     Result = Convert.ToString(rw["Result"])

                 }).ToList()
                            }
                        };

                    }

                    else
                    {
                        rtnRst = new RtnLocationListQR
                        {
                            status = false,
                            message = GlobalVar.PlsChkData,
                            data = dumd
                        };
                    }

                }
                else
                {
                    rtnRst = new RtnLocationListQR
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }

            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "SaveQRCodeapi", conStr);
                rtnRst = new RtnLocationListQR
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        [Authorize]
        [HttpPost]
        [Route("CateringTask")]
        public HttpResponseMessage CateringTask([FromBody] GetPorterTasks loc)
        {

            rslt = "FALSE"; RtnCateringTaskList rtnRst; DataSet dt = new DataSet(); CateringTaskDetails rows = new CateringTaskDetails();
            rows.CateringTask = new List<Currentcateringtask> { };
            rows.PreviousCateringTask = new List<Previouscateringtask> { };
            rows.PorterEndShift = "FALSE";
            rows.Buzzer = new Buzzer { };
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "GETCATERINGTASK";
                    dt = DataAccess.DACateringTasks(loc, conStr);



                    if (dt != null && dt.Tables.Count > 0)
                    {

                        rtnRst = new RtnCateringTaskList
                        {
                            status = true,//(loc.Process.ToUpper() == "GETPORTERTASK" && dt.Tables[0].Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true :  false ,
                            message = (loc.Process.ToUpper() == "GETCATERINGTASK" && dt.Tables[0].Rows.Count > 0 && dt.Tables[0].Rows[0]["result"].ToString().ToUpper() == "TRUE") ? dt.Tables[0].Rows.Count.ToString() + GlobalVar.NoOfrecords : "No task found",
                            data = new CateringTaskDetails()
                            {
                                CateringTask = (from rw in dt.Tables[0].AsEnumerable()
                                                select
                    new Currentcateringtask()
                    {
                        RequestId = Convert.ToString(rw["RequestId"]),
                        CategoryName = Convert.ToString(rw["CategoryName"]),
                        CategoryImage = Convert.ToString(rw["CategoryImage"]),
                        From = Convert.ToString(rw["From"]),
                        To = Convert.ToString(rw["To"]),
                        RequestStatus = Convert.ToString(rw["RequestStatus"]),
                        RequestDeskRemarks = Convert.ToString(rw["RequestDeskRemarks"]),
                        PatientName = Convert.ToString(rw["PatientName"]),
                        RequestorName = Convert.ToString(rw["RequestorName"]),
                        PorterName = Convert.ToString(rw["PorterName"]),
                        RequestTime = Convert.ToString(rw["RequestTime"]),
                        RequestStatusId = Convert.ToString(rw["RequestStatusId"]),
                        MultiTaskFlag = Convert.ToString(rw["MultiTaskFlag"]),
                        AssignedTime = Convert.ToString(rw["AssignedTime"]),
                        StartTime = Convert.ToString(rw["StartTime"]),
                        ThresholdForStartTime = Convert.ToString(rw["ThresholdForStartTime"]),
                        ThresholdForEndTime = Convert.ToString(rw["ThresholdForEndTime"]),
                        NoResponseTime = Convert.ToString(rw["NoResponseTime"]),
                        RequestNo = Convert.ToString(rw["RequestNo"]),
                        Priority = Convert.ToString(rw["Priority"]),
                        StartLocationMac = Convert.ToString(rw["StartLocationMac"]),
                        EndLocationMac = Convert.ToString(rw["EndLocationMac"]),
                        PorterRemarks = Convert.ToString(rw["PorterRemarks"]),
                        PorterId = Convert.ToString(rw["PorterId"]),
                        SubPorterId = Convert.ToString(rw["SubPorterId"]),
                        IsAdhoc = Convert.ToString(rw["IsAdhoc"]),

                        IsMultiPorter = Convert.ToString(rw["IsMultiPorter"]),
                        PorterStartFlag = Convert.ToString(rw["PorterStartFlag"]),
                        SubPorterStartFlag = Convert.ToString(rw["SubPorterStartFlag"]),
                        PorterEndFlag = Convert.ToString(rw["PorterEndFlag"]),
                        SubPorterEndFlag = Convert.ToString(rw["SubPorterEndFlag"]),
                        IsAlarm = Convert.ToString(rw["IsAlarm"]),
                        Quantity = Convert.ToString(rw["Quantity"]),
                        ContactNo = Convert.ToString(rw["ContactNo"]),
                        ItemName = Convert.ToString(rw["ItemName"]),
                        IsSignRequired = Convert.ToString(rw["ISSIGNREQUIRED"]),
                        IsPhotoRequired = Convert.ToString(rw["ISPHOTOREQUIRED"]),

                        Result = Convert.ToString(rw["Result"])


                    }).ToList(),
                                PreviousCateringTask = (from rw in dt.Tables[1].AsEnumerable()
                                                        select
                            new Previouscateringtask()
                            {

                                RequestId = Convert.ToString(rw["RequestId"]),
                                RequestNo = Convert.ToString(rw["RequestNo"]),
                                RequestStatus = Convert.ToString(rw["RequestStatus"]),
                                MessageId = Convert.ToString(rw["MessageId"])

                            }).ToList(),
                                PorterEndShift = Convert.ToString(dt.Tables[2].Rows[0]["EndShift"])
                          ,
                                Buzzer = new Buzzer()
                                {
                                    Result = dt.Tables[3].Rows.Count > 0 ? "TRUE" : "FALSE",
                                    BuzzerId = (dt.Tables[3].Rows.Count > 0 ? Convert.ToString(dt.Tables[3].Rows[0]["BuzzerId"]) : "")
                                }

                            },

                        };
                    }

                    else
                    {
                        rtnRst = new RtnCateringTaskList
                        {
                            status = false,
                            message = GlobalVar.NoDataFound,
                            data = rows
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnCateringTaskList
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = rows
                    };
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "CateringTask api", conStr);

                rtnRst = new RtnCateringTaskList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
                rtnBool = false;
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [Authorize]
        [HttpPost]
        [Route("StartTask")]
        public HttpResponseMessage StartTask([FromBody] StartCompleteTask loc)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "STARTTASK";
                    loc.RequestStatus = "STARTTASK";
                    loc.EndTime = "";
                    //  loc.RemarksId = String.IsNullOrEmpty(loc.RemarksId) ? "0" : loc.RemarksId;
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    dt = DataAccess.StartEndTask(loc, conStr);

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Split('_')[0].Equals("TRUE") ? true : false),
                        message = rslt.Split('_')[0].Equals("TRUE") ? "Updated successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "Task started" : rslt.Split('_')[1].ToString() }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }
            }
            catch
            {
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        [Authorize]
        [HttpPost]
        [Route("CateringStartTask")]
        public HttpResponseMessage CateringStartTask([FromBody] StartCompleteTask loc)
        {
            rslt = "FALSE"; RtnCatTaskDetail rtnRst; Currentcateringtaskdetail rows = new Currentcateringtaskdetail();
            rows.Result = "FALSE";
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "CATERINGSTARTTASK";
                    loc.RequestStatus = "STARTTASK";
                    loc.EndTime = "";
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    DataTable dt = DataAccess.StartEndTask(loc, conStr);

                    if (dt != null && dt.Rows.Count > 0)
                    {
                        DataRow rw = dt.Rows[0];
                        rtnRst = new RtnCatTaskDetail
                        {
                            status = true,
                            message = (dt.Rows.Count > 0 && rw["result"].ToString().ToUpper() == "TRUE") ? dt.Rows.Count.ToString() + GlobalVar.NoOfrecords : "No task found",
                            data = new Currentcateringtaskdetail()
                            {
                                RequestId = Convert.ToString(rw["RequestId"]),
                                CategoryName = Convert.ToString(rw["CategoryName"]),
                                CategoryImage = Convert.ToString(rw["CategoryImage"]),
                                From = Convert.ToString(rw["From"]),
                                To = Convert.ToString(rw["To"]),
                                RequestStatus = Convert.ToString(rw["RequestStatus"]),
                                RequestDeskRemarks = Convert.ToString(rw["RequestDeskRemarks"]),
                                PatientName = Convert.ToString(rw["PatientName"]),
                                RequestorName = Convert.ToString(rw["RequestorName"]),
                                PorterName = Convert.ToString(rw["PorterName"]),
                                RequestTime = Convert.ToString(rw["RequestTime"]),
                                RequestStatusId = Convert.ToString(rw["RequestStatusId"]),
                                AssignedTime = Convert.ToString(rw["AssignedTime"]),
                                StartTime = Convert.ToString(rw["StartTime"]),
                                ThresholdForStartTime = Convert.ToString(rw["ThresholdForStartTime"]),
                                ThresholdForEndTime = Convert.ToString(rw["ThresholdForEndTime"]),
                                RequestNo = Convert.ToString(rw["RequestNo"]),
                                Priority = Convert.ToString(rw["Priority"]),
                                PorterRemarks = Convert.ToString(rw["PorterRemarks"]),
                                Quantity = Convert.ToString(rw["Quantity"]),
                                ContactNo = Convert.ToString(rw["ContactNo"]),
                                Result = Convert.ToString(rw["Result"])


                            }
                        };
                    }

                    else
                    {
                        rtnRst = new RtnCatTaskDetail
                        {
                            status = false,
                            message = GlobalVar.NoDataFound,
                            data = rows
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnCatTaskDetail
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = rows
                    };
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "cateringstarttask", conStr);

                rtnRst = new RtnCatTaskDetail
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
                rtnBool = false;
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }



        [Authorize]
        [HttpPost]
        [Route("PorterTask")]
        public HttpResponseMessage PorterTask([FromBody] GetPorterTasks loc)
        {

            rslt = "FALSE"; RtnPorterTaskList rtnRst; DataSet dt = new DataSet(); PorterTaskDetails rows = new PorterTaskDetails();
            rows.PorterTask = new List<Currentportertask> { };
            rows.PreviousPorterTask = new List<Previousportertask> { };
            rows.PorterEndShift = "FALSE";
            rows.Buzzer = new Buzzer { };
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "GETPORTERTASK";
                    dt = DataAccess.DAPorterTasks(loc, conStr);



                    if (dt != null && dt.Tables.Count > 0)
                    {

                        rtnRst = new RtnPorterTaskList
                        {
                            status = true,//(loc.Process.ToUpper() == "GETPORTERTASK" && dt.Tables[0].Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true :  false ,
                            message = (loc.Process.ToUpper() == "GETPORTERTASK" && dt.Tables[0].Rows.Count > 0 && dt.Tables[0].Rows[0]["result"].ToString().ToUpper() == "TRUE") ? dt.Tables[0].Rows.Count.ToString() + GlobalVar.NoOfrecords : "No task found",
                            data = new PorterTaskDetails()
                            {
                                PorterTask = (from rw in dt.Tables[0].AsEnumerable()
                                              select
                  new Currentportertask()
                  {
                      RequestId = Convert.ToString(rw["RequestId"]),
                      CategoryName = Convert.ToString(rw["CategoryName"]),
                      CategoryImage = Convert.ToString(rw["CategoryImage"]),
                      From = Convert.ToString(rw["From"]),
                      To = Convert.ToString(rw["To"]),
                      RequestStatus = Convert.ToString(rw["RequestStatus"]),
                      RequestDeskRemarks = Convert.ToString(rw["RequestDeskRemarks"]),
                      PatientName = Convert.ToString(rw["PatientName"]),
                      RequestorName = Convert.ToString(rw["RequestorName"]),
                      PorterName = Convert.ToString(rw["PorterName"]),
                      RequestTime = Convert.ToString(rw["RequestTime"]),
                      RequestStatusId = Convert.ToString(rw["RequestStatusId"]),
                      MultiTaskFlag = Convert.ToString(rw["MultiTaskFlag"]),
                      AssignedTime = Convert.ToString(rw["AssignedTime"]),
                      StartTime = Convert.ToString(rw["StartTime"]),
                      ThresholdForStartTime = Convert.ToString(rw["ThresholdForStartTime"]),
                      ThresholdForEndTime = Convert.ToString(rw["ThresholdForEndTime"]),
                      NoResponseTime = Convert.ToString(rw["NoResponseTime"]),
                      RequestNo = Convert.ToString(rw["RequestNo"]),
                      Priority = Convert.ToString(rw["Priority"]),
                      StartLocationMac = Convert.ToString(rw["StartLocationMac"]),
                      EndLocationMac = Convert.ToString(rw["EndLocationMac"]),
                      PorterRemarks = Convert.ToString(rw["PorterRemarks"]),
                      PorterId = Convert.ToString(rw["PorterId"]),
                      SubPorterId = Convert.ToString(rw["SubPorterId"]),
                      IsAdhoc = Convert.ToString(rw["IsAdhoc"]),

                      IsMultiPorter = Convert.ToString(rw["IsMultiPorter"]),
                      PorterStartFlag = Convert.ToString(rw["PorterStartFlag"]),
                      SubPorterStartFlag = Convert.ToString(rw["SubPorterStartFlag"]),
                      PorterEndFlag = Convert.ToString(rw["PorterEndFlag"]),
                      SubPorterEndFlag = Convert.ToString(rw["SubPorterEndFlag"]),
                      IsAlarm = Convert.ToString(rw["IsAlarm"]),
                      Quantity = Convert.ToString(rw["Quantity"]),
                      ContactNo = Convert.ToString(rw["ContactNo"]),
                      Result = Convert.ToString(rw["Result"])


                  }).ToList(),
                                PreviousPorterTask = (from rw in dt.Tables[1].AsEnumerable()
                                                      select
                          new Previousportertask()
                          {

                              RequestId = Convert.ToString(rw["RequestId"]),
                              RequestNo = Convert.ToString(rw["RequestNo"]),
                              RequestStatus = Convert.ToString(rw["RequestStatus"]),
                              MessageId = Convert.ToString(rw["MessageId"])

                          }).ToList(),
                                PorterEndShift = Convert.ToString(dt.Tables[2].Rows[0]["EndShift"])
                          ,
                                Buzzer = new Buzzer()
                                {
                                    Result = dt.Tables[3].Rows.Count > 0 ? "TRUE" : "FALSE",
                                    BuzzerId = (dt.Tables[3].Rows.Count > 0 ? Convert.ToString(dt.Tables[3].Rows[0]["BuzzerId"]) : "")
                                }

                            },

                        };
                    }

                    else
                    {
                        rtnRst = new RtnPorterTaskList
                        {
                            status = false,
                            message = GlobalVar.NoDataFound,
                            data = rows
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnPorterTaskList
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = rows
                    };
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "Portertask", conStr);

                rtnRst = new RtnPorterTaskList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
                rtnBool = false;
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [HttpPost]
        [Route("DeleteAccountData")]
        public HttpResponseMessage DeleteAccountData([FromBody] UserAccount loc)
        {

            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if (ModelState.IsValid)
                {
                    loc.HospitalId = "van";
                    loc.Process = string.IsNullOrEmpty(loc.Process) ? "APIDELETE" : loc.Process;
                    conStr = "van";
                    dt = DataAccess.DeleteUserAccount(loc, conStr);
                    if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["RESULt"].ToString() == "TRUE")
                    {
                        rslt = " {\"status\": true,\"message\": \"1 Record found\",\"data\": {\"RESULT\":\"" + dt.Rows[0]["Message"] + "\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "DeleteAccountData", conStr);
                rtnBool = false;
            }
            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }


        // [CustomAuthorization]
        [Authorize]
        [HttpPost]
        [Route("ProfileDetails")]
        public HttpResponseMessage ProfileDetails([FromBody] ProfileDetails loc)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "Get";
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    dt = DataAccess.ProfileDetails(loc, conStr);
                    if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["RESULt"].ToString() == "TRUE")
                    {
                        rslt = " {\"status\": true,\"message\": \"1 Record found\",\"data\": {\"Result\":\"TRUE\",\"FullName\":\"" + dt.Rows[0]["FullName"] + "\",\"ProfilePicture\":\"" + dt.Rows[0]["ProfilePicture"] + "\",\"EmployeeId\":\"" + dt.Rows[0]["EmployeeId"] + "\",\"RoleName\":\"" + dt.Rows[0]["RoleName"] + "\",\"DepartmentName\":\"" + dt.Rows[0]["DepartmentName"] + "\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "ProfileDetails", conStr);
                rtnBool = false;
            }
            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        
        // [Authorize]
        [HttpPost]
        [Route("CompleteTaskCatering")]
        public HttpResponseMessage CompleteTaskCatering()
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            string signimg = string.Empty, photoimg = string.Empty;
            StartCompleteTask loc = new StartCompleteTask();
            try
            {
                string endtime = HttpContext.Current.Request.Form["EndTime"].ToString(), hosid = HttpContext.Current.Request.Form["HospitalId"].ToString(), pid = HttpContext.Current.Request.Form["PorterId"].ToString(), reqId = HttpContext.Current.Request.Form["RequestId"].ToString();
                ;

                rtnBool = (!Request.Content.IsMimeMultipartContent() ? false : true);

                if (!Request.Content.IsMimeMultipartContent())
                {
                    rtnBool = false;
                    //throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
                }
                rtnBool = true;
                rslt = "FALSE";
                try
                {
                    //  var file = HttpContext.Current.Request.Files.Count > 0 ?  HttpContext.Current.Request.Files[0] : null;
                    foreach (string fn in HttpContext.Current.Request.Files)
                    {
                        HttpPostedFile file = HttpContext.Current.Request.Files[fn];
                        if (rtnBool && file != null && file.ContentLength > 0 && (new[] { ".jpg", ".jpeg", ".png", ".bmp" }.Contains(Path.GetExtension(file.FileName.ToLower())) ? true : false))
                        {
                            var fileName = Path.GetFileName(file.FileName).ToUpper();
                            if (fileName.Substring(0, 9) == "SIGNATURE")
                            {
                                fileName = pid + "_" + reqId + "_sign" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                                signimg = fileName;
                                var path = Path.Combine(
                                    HttpContext.Current.Server.MapPath("~/Images/Profile"), //RequestSign
                                    fileName
                                );
                                path = @"X:\Catering\" + fileName;
                                path = @"C:\Websites\VirtualDirectory\Catering\" + fileName;
                                file.SaveAs(path);
                                loc.CateringSign = fileName;
                                rtnBool = true;
                            }
                            if (fileName.Substring(0, 5) == "PHOTO")
                            {
                                fileName = pid + "_" + reqId + "_photo" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                                photoimg = fileName;
                                var path = Path.Combine(
                                    HttpContext.Current.Server.MapPath("~/Images/Profile"),//Requestphoto
                                    fileName
                                );
                                path = @"X:\Catering\" + fileName;// @"C:\Websites\VirtualDirectory\Catering\" + fileName;
                                path = @"C:\Websites\VirtualDirectory\Catering\" + fileName;
                                file.SaveAs(path);
                                loc.CateringPhoto = fileName;
                            }

                        }
                    }
                }
                catch (Exception e)
                {
                    DataAccess.InsertError(e.Message, "cateringimageupload", conStr);
                    rtnBool = false;
                }

                if (rtnBool)
                {


                    loc.HospitalId = AesOperation.DecryptString(hosid);
                    loc.Process = "CompleteTaskCatering";
                    loc.RequestStatus = "COMPLETETASK";
                    conStr = loc.HospitalId.Split('_')[1];
                    loc.RequestId = reqId;
                    loc.PorterId = HttpContext.Current.Request.Form["PorterId"].ToString();
                    loc.PorterRemarks = String.IsNullOrEmpty( HttpContext.Current.Request.Form["PorterRemarks"])?"": HttpContext.Current.Request.Form["PorterRemarks"].ToString();
                    loc.StartTime = "";
                    loc.EndTime = endtime;
                    loc.Name = String.IsNullOrEmpty(HttpContext.Current.Request.Form["Name"]) ? "" : HttpContext.Current.Request.Form["Name"].ToString();
                    loc.PhoneNo = String.IsNullOrEmpty(HttpContext.Current.Request.Form["PhoneNo"]) ? "" : HttpContext.Current.Request.Form["PhoneNo"].ToString();
                    loc.AckLocStamp = String.IsNullOrEmpty(HttpContext.Current.Request.Form["AckLocStamp"]) ? "" : HttpContext.Current.Request.Form["AckLocStamp"].ToString();
                    loc.AckPhotoTimeStamp = String.IsNullOrEmpty(HttpContext.Current.Request.Form["AckPhotoTimeStamp"]) ? "" : HttpContext.Current.Request.Form["AckPhotoTimeStamp"].ToString();
                   

                    dt = DataAccess.StartEndTask(loc, conStr);

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Split('_')[0].Equals("TRUE") ? true : false),
                        message = rslt.Split('_')[0].Equals("TRUE") ? "Updated successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "Task completed" : rslt.Contains("_") ? rslt.Split('_')[1].ToString() : "Please check the data" }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }

            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "dacompletetaskcater", conStr);
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [HttpPost]
        [Route("PTTLog")]
        public HttpResponseMessage PTTLog()
        {
            string hosid = HttpContext.Current.Request.Form["HospitalId"].ToString(), pid = HttpContext.Current.Request.Form["PorterId"].ToString()
             , imei = HttpContext.Current.Request.Form["IMEINo"].ToString();

            rtnBool = (!Request.Content.IsMimeMultipartContent() ? false : true);

            if (!Request.Content.IsMimeMultipartContent())
            {
                rtnBool = false;
                //throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                var file = HttpContext.Current.Request.Files.Count > 0 ?
        HttpContext.Current.Request.Files[0] : null;

                if (rtnBool && file != null && file.ContentLength > 0 && (new[] { ".txt" }.Contains(Path.GetExtension(file.FileName.ToLower())) ? true : false))
                {
                    var fileName = Path.GetFileName(file.FileName);
                    fileName = "Log_" + pid + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                    PTTLog loc = new PTTLog();
                    loc.HospitalId = AesOperation.DecryptString(hosid);
                    loc.PorterId = pid;
                    loc.IMEINo = imei;
                    loc.Log = fileName;
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    dt = DataAccess.PTTLogDa(loc, conStr);
                    var path = @"C:\Websites\VirtualDirectory\Catering\" + fileName; //new path 09212024

                    if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["RESULt"].ToString() == "TRUE")
                    {
                        file.SaveAs(path); rslt = " {\"status\": true,\"message\": \"Uploaded sucessfully\",\"data\": {\"Result\":\"TRUE\"}}";
                    }
                    rtnBool = true;
                }
            }
            catch (Exception e)
            {
                DataAccess.InsertError(e.Message, "PTTLog", conStr);
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }


        // [Authorize]
        [HttpPost]
        [Route("ProfileImage")]
        public HttpResponseMessage ProfileImage()
        {
            string hosid = HttpContext.Current.Request.Form["HospitalId"].ToString(), pid = HttpContext.Current.Request.Form["PorterId"].ToString()
               ;

            rtnBool = (!Request.Content.IsMimeMultipartContent() ? false : true);

            if (!Request.Content.IsMimeMultipartContent())
            {
                rtnBool = false;
                //throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                var file = HttpContext.Current.Request.Files.Count > 0 ?
        HttpContext.Current.Request.Files[0] : null;

                if (rtnBool && file != null && file.ContentLength > 0 && (new[] { ".jpg", ".jpeg", ".png", ".bmp" }.Contains(Path.GetExtension(file.FileName.ToLower())) ? true : false))
                {
                    var fileName = Path.GetFileName(file.FileName);
                    fileName = pid + "_Prof" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                    ProfileDetails loc = new ProfileDetails();
                    loc.HospitalId = AesOperation.DecryptString(hosid);
                    loc.PorterId = pid;
                    loc.Process = "updatepicture";
                    loc.ProfilePicture = fileName;
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    dt = DataAccess.ProfileDetails(loc, conStr);
                    var path = Path.Combine(
                        HttpContext.Current.Server.MapPath("~/Images/Profile"),
                        fileName
                    );


                    path = @"C:\Websites\VirtualDirectory\Catering\" + fileName; //new path 09212024

                    if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["RESULt"].ToString() == "TRUE")
                    {
                        file.SaveAs(path); rslt = " {\"status\": true,\"message\": \"Uploaded sucessfully\",\"data\": {\"Result\":\"TRUE\",\"ProfilePicture\":\"" + dt.Rows[0]["ProfilePicture"] + "\" }}";
                    }
                    rtnBool = true;
                }
            }
            catch (Exception e)
            {
                DataAccess.InsertError(e.Message, "ProfileImage", conStr);
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }


        [Authorize]
        [HttpPost]
        [Route("CompleteTask")]
        public HttpResponseMessage CompleteTask([FromBody] StartCompleteTask loc)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "CompleteTask";
                    loc.RequestStatus = "COMPLETETASK";
                    loc.StartTime = "";
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    //loc.RemarksId = String.IsNullOrEmpty(loc.RemarksId) ? "0" : loc.RemarksId;
                    dt = DataAccess.StartEndTask(loc, conStr);

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Split('_')[0].Equals("TRUE") ? true : false),
                        message = rslt.Split('_')[0].Equals("TRUE") ? "Updated successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "Task completed" : rslt.Split('_')[1].ToString() }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }
            }
            catch
            {
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


         
        [HttpPost]
        [Route("ErrorLog")]
        public HttpResponseMessage ErrorLog([FromBody] ErMsg loc)
        {
            
            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);         
                    
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    try
                    {
                        DataAccess.InsertError(loc.ErrorMessage, "API ERR LOG : " + loc.Process, conStr);
                        rslt = "TRUE";
                    }
                    catch
                    {

                        rslt = "FALSE";
                    }
                    
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Equals("TRUE") ? true : false),
                        message = rslt.Equals("TRUE") ? "1 Record found" :  GlobalVar.PlsChkData ,
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "Updated successfully" : GlobalVar.PlsChkData }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }
            }
            catch
            {
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }
            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        //  [Authorize]
        [HttpPost]
        [Route("ProfileMultiImage")]
        public HttpResponseMessage ProfileMultiImage()
        {
            string hosid = HttpContext.Current.Request.Form["HospitalId"].ToString(), pid = HttpContext.Current.Request.Form["PorterId"].ToString();
            List<MultiImageFiles> fdl = JsonConvert.DeserializeObject<List<MultiImageFiles>>(HttpContext.Current.Request.Form["MultiImageFiles"].ToString());

            foreach (var k in fdl)
            {

                foreach (HttpPostedFile ik in HttpContext.Current.Request.Files)
                {

                }

            }

            rtnBool = (!Request.Content.IsMimeMultipartContent() ? false : true);

            if (!Request.Content.IsMimeMultipartContent())
            {
                rtnBool = false;
                //throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                var file = HttpContext.Current.Request.Files.Count > 0 ?
        HttpContext.Current.Request.Files[0] : null;

                if (rtnBool && file != null && file.ContentLength > 0 && (new[] { ".jpg", ".jpeg", ".png", ".bmp" }.Contains(Path.GetExtension(file.FileName.ToLower())) ? true : false))
                {
                    var fileName = Path.GetFileName(file.FileName);
                    fileName = pid + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                    ProfileDetails loc = new ProfileDetails();
                    loc.HospitalId = AesOperation.DecryptString(hosid);
                    loc.PorterId = pid;
                    loc.Process = "updatepicture";
                    loc.ProfilePicture = fileName;
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    dt = DataAccess.ProfileDetails(loc, conStr);
                    var path = Path.Combine(
                        HttpContext.Current.Server.MapPath("~/Images/Profile"),
                        fileName
                    );
                    if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["RESULt"].ToString() == "TRUE")
                    {
                        file.SaveAs(path); rslt = " {\"status\": true,\"message\": \"Uploaded sucessfully\",\"data\": {\"Result\":\"TRUE\",\"ProfilePicture\":\"" + dt.Rows[0]["ProfilePicture"] + "\" }}";
                    }
                    rtnBool = true;
                }
            }
            catch (Exception e)
            {
                DataAccess.InsertError(e.Message, "ProfileImage", conStr);
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }


        [Authorize]
        [HttpPost]
        [Route("CleaningTaskHistory")]
        public HttpResponseMessage CleaningTaskHistory([FromBody] GetCatCleanTaskHistory loc)
        {

            rslt = "FALSE"; RtnPorterTaskHistory rtnRst; DataTable dt = new DataTable(); PorterTasksHistory rows = new PorterTasksHistory();


            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "GETCLEANINGTASKHIS";
                    dt = DataAccess.CleaningTaskHistory(loc, conStr);



                    if (dt != null && dt.Rows.Count > 0)
                    {

                        rtnRst = new RtnPorterTaskHistory
                        {
                            status = true,//(loc.Process.ToUpper() == "GETPORTERTASK" && dt.Tables[0].Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true :  false ,
                            message = (loc.Process.ToUpper() == "GETCLEANINGTASKHIS" && dt.Rows.Count > 0 && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? dt.Rows.Count.ToString() + GlobalVar.NoOfrecords : "No task found",
                            data = (from rw in dt.AsEnumerable()
                                    select
        new PorterTasksHistory()
        {
            RequestId = Convert.ToString(rw["RequestId"]),
            CategoryName = Convert.ToString(rw["CategoryName"]),
            CategoryImage = Convert.ToString(rw["CategoryImage"]),
            From = Convert.ToString(rw["From"]),
            To = Convert.ToString(rw["To"]),
            RequestStatus = Convert.ToString(rw["RequestStatus"]),
            RequestDeskRemarks = Convert.ToString(rw["RequestDeskRemarks"]),
            PatientName = Convert.ToString(rw["PatientName"]),
            RequestorName = Convert.ToString(rw["RequestorName"]),
            PorterName = Convert.ToString(rw["PorterName"]),
            RequestTime = Convert.ToString(rw["RequestTime"]),
            RequestStatusId = Convert.ToString(rw["RequestStatusId"]),
            MultiTaskFlag = Convert.ToString(rw["MultiTaskFlag"]),
            AssignedTime = Convert.ToString(rw["AssignedTime"]),
            StartTime = Convert.ToString(rw["StartTime"]),
            EndTime = Convert.ToString(rw["EndTime"]),
            ThresholdForStartTime = Convert.ToString(rw["ThresholdForStartTime"]),
            ThresholdForEndTime = Convert.ToString(rw["ThresholdForEndTime"]),
            NoResponseTime = Convert.ToString(rw["NoResponseTime"]),
            RequestNo = Convert.ToString(rw["RequestNo"]),
            Priority = Convert.ToString(rw["Priority"]),
            StartLocationMac = Convert.ToString(rw["StartLocationMac"]),
            EndLocationMac = Convert.ToString(rw["EndLocationMac"]),
            PorterRemarks = Convert.ToString(rw["PorterRemarks"]),
            PorterId = Convert.ToString(rw["PorterId"]),
            SubPorterId = Convert.ToString(rw["SubPorterId"]),
            TotalTat = Convert.ToString(rw["TotalTat"]),
            IsMultiPorter = Convert.ToString(rw["IsMultiPorter"]),
            Quantity = Convert.ToString(rw["Quantity"]),
            ContactNo = Convert.ToString(rw["ContactNo"]),
            Result = Convert.ToString(rw["Result"])


        }).FirstOrDefault()


                        };
                    }

                    else
                    {
                        rtnRst = new RtnPorterTaskHistory
                        {
                            status = false,
                            message = GlobalVar.NoDataFound,
                            data = null
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnPorterTaskHistory
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = null
                    };
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "CleaningTaskHistory", conStr);

                rtnRst = new RtnPorterTaskHistory
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = null
                };
                rtnBool = false;
            }
            dt = null;
            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }



        [Authorize]
        [HttpPost]
        [Route("PorterTaskHistory")]
        public HttpResponseMessage PorterTaskHistory([FromBody] GetPorterTaskHistory loc)
        {

            rslt = "FALSE"; RtnPorterTaskHistory rtnRst; DataTable dt = new DataTable(); PorterTasksHistory rows = new PorterTasksHistory();


            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "GETPORTERTASKHIS";
                    dt = DataAccess.PorterTaskHistory(loc, conStr);



                    if (dt != null && dt.Rows.Count > 0)
                    {

                        rtnRst = new RtnPorterTaskHistory
                        {
                            status = true,//(loc.Process.ToUpper() == "GETPORTERTASK" && dt.Tables[0].Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true :  false ,
                            message = (loc.Process.ToUpper() == "GETPORTERTASKHIS" && dt.Rows.Count > 0 && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? dt.Rows.Count.ToString() + GlobalVar.NoOfrecords : "No task found",
                            data = (from rw in dt.AsEnumerable()
                                    select
        new PorterTasksHistory()
        {
            RequestId = Convert.ToString(rw["RequestId"]),
            CategoryName = Convert.ToString(rw["CategoryName"]),
            CategoryImage = Convert.ToString(rw["CategoryImage"]),
            From = Convert.ToString(rw["From"]),
            To = Convert.ToString(rw["To"]),
            RequestStatus = Convert.ToString(rw["RequestStatus"]),
            RequestDeskRemarks = Convert.ToString(rw["RequestDeskRemarks"]),
            PatientName = Convert.ToString(rw["PatientName"]),
            RequestorName = Convert.ToString(rw["RequestorName"]),
            PorterName = Convert.ToString(rw["PorterName"]),
            RequestTime = Convert.ToString(rw["RequestTime"]),
            RequestStatusId = Convert.ToString(rw["RequestStatusId"]),
            MultiTaskFlag = Convert.ToString(rw["MultiTaskFlag"]),
            AssignedTime = Convert.ToString(rw["AssignedTime"]),
            StartTime = Convert.ToString(rw["StartTime"]),
            EndTime = Convert.ToString(rw["EndTime"]),
            ThresholdForStartTime = Convert.ToString(rw["ThresholdForStartTime"]),
            ThresholdForEndTime = Convert.ToString(rw["ThresholdForEndTime"]),
            NoResponseTime = Convert.ToString(rw["NoResponseTime"]),
            RequestNo = Convert.ToString(rw["RequestNo"]),
            Priority = Convert.ToString(rw["Priority"]),
            StartLocationMac = Convert.ToString(rw["StartLocationMac"]),
            EndLocationMac = Convert.ToString(rw["EndLocationMac"]),
            PorterRemarks = Convert.ToString(rw["PorterRemarks"]),
            PorterId = Convert.ToString(rw["PorterId"]),
            SubPorterId = Convert.ToString(rw["SubPorterId"]),
            TotalTat = Convert.ToString(rw["TotalTat"]),
            IsMultiPorter = Convert.ToString(rw["IsMultiPorter"]),
            Quantity = Convert.ToString(rw["Quantity"]),
            ContactNo = Convert.ToString(rw["ContactNo"]),
            Result = Convert.ToString(rw["Result"])


        }).FirstOrDefault()


                        };
                    }

                    else
                    {
                        rtnRst = new RtnPorterTaskHistory
                        {
                            status = false,
                            message = GlobalVar.NoDataFound,
                            data = null
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnPorterTaskHistory
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = null
                    };
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "Portertask", conStr);

                rtnRst = new RtnPorterTaskHistory
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = null
                };
                rtnBool = false;
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        [Authorize]
        [HttpPost]
        [Route("PorterTaskList")]
        public HttpResponseMessage PorterTaskList([FromBody] GetPorterTaskHistory loc)
        {

            rslt = "FALSE"; ReturnPorterTaskList rtnRst; DataTable dt = new DataTable(); ReturnPorterTaskList rows = new ReturnPorterTaskList();

            List<PorterTasksList> empD = new List<PorterTasksList>();

            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "GETPORTERTASKLIST";
                    dt = DataAccess.PorterTaskHistory(loc, conStr);



                    if (dt != null && dt.Rows.Count > 0)
                    {

                        rtnRst = new ReturnPorterTaskList
                        {
                            status = true,//(loc.Process.ToUpper() == "GETPORTERTASK" && dt.Tables[0].Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true :  false ,
                            message = (dt.Rows.Count > 0) ? dt.Rows.Count.ToString() + GlobalVar.NoOfrecords : "No task found",
                            data =
                                 (from rw in dt.AsEnumerable()
                                  select
      new PorterTasksList()
      {
          RequestId = Convert.ToString(rw["RequestId"]),
          RequestNo = Convert.ToString(rw["RequestNo"]),
          CategoryName = Convert.ToString(rw["CategoryName"]),
          RequestorName = Convert.ToString(rw["RequestorName"]),
          From = Convert.ToString(rw["From"]),
          To = Convert.ToString(rw["To"]),
          RequestStatus = Convert.ToString(rw["RequestStatus"]),
          RequestDate = Convert.ToString(rw["RequestDate"]),
          RequestTime = Convert.ToString(rw["RequestTime"]),
          IsMultiPorter = Convert.ToString(rw["IsMultiPorter"]),
          Quantity = Convert.ToString(rw["Quantity"]),

          //   , Result = Convert.ToString(rw["Result"])


      }).ToList()


                        };
                    }

                    else
                    {
                        rtnRst = new ReturnPorterTaskList
                        {
                            status = false,
                            message = GlobalVar.NoDataFound,
                            data = empD
                        };
                    }
                }
                else
                {
                    rtnRst = new ReturnPorterTaskList
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = empD
                    };
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "Portertask", conStr);

                rtnRst = new ReturnPorterTaskList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = empD
                };
                rtnBool = false;
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [Authorize]
        [HttpPost]
        [Route("AdHocTaskLocation")]
        public HttpResponseMessage AdHocTaskLocation([FromBody] GetAdhocLocParam loc)  // working 16 use both start and stop
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                loc.Process = "GetLocation";
                dt = DataAccess.DAAdhocLoc(loc, conStr);

                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["Result"].ToString() == "TRUE")
                {

                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }




        [HttpPost]
        [Route("Mgroad")]
        public HttpResponseMessage Mgroad([FromBody] GetAdhocLocParam loc)
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                loc.Process = "GetCategory";
                dt = DataAccess.mgroad("", "", "");

                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0)
                {

                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        [Authorize]
        [HttpPost]
        [Route("AdHocCategory")]
        public HttpResponseMessage AdHocCategory([FromBody] GetAdhocLocParam loc)  //working 16
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                loc.Process = "GetCategory";
                dt = DataAccess.DAAdhocLoc(loc, conStr);

                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["Result"].ToString() == "TRUE")
                {

                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        [Authorize]
        [HttpPost]
        [Route("AdHocRequestCreation")]
        public HttpResponseMessage AdHocRequestCreation([FromBody] AdhocRequestCreate loc)
        {
            rslt = "FALSE"; RtnPorterTaskList rtnRst; DataSet dt = new DataSet(); PorterTaskDetails rows = new PorterTaskDetails();
            rows.PorterTask = new List<Currentportertask> { };
            rows.PreviousPorterTask = new List<Previousportertask> { };
            rows.PorterEndShift = "FALSE";
            rows.Buzzer = new Buzzer { };
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "RequestInsert";
                    loc.RequestStatusId = "4";
                    loc.RemarksId = String.IsNullOrEmpty(loc.RemarksId) ? "0" : loc.RemarksId;
                    dt = DataAccess.AdhocRequestInsert(loc, conStr);



                    if (dt != null && dt.Tables.Count > 0)
                    {

                        rtnRst = new RtnPorterTaskList
                        {
                            status = true,//(loc.Process.ToUpper() == "GETPORTERTASK" && dt.Tables[0].Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true :  false ,
                            message = (dt.Tables[0].Rows.Count > 0 && dt.Tables[0].Rows[0]["result"].ToString().ToUpper() == "TRUE") ? dt.Tables[0].Rows.Count.ToString() + GlobalVar.NoOfrecords : "No task found",
                            data = new PorterTaskDetails()
                            {
                                PorterTask = (from rw in dt.Tables[0].AsEnumerable()
                                              select
                  new Currentportertask()
                  {
                      RequestId = Convert.ToString(rw["RequestId"]),
                      CategoryName = Convert.ToString(rw["CategoryName"]),
                      CategoryImage = Convert.ToString(rw["CategoryImage"]),
                      From = Convert.ToString(rw["From"]),
                      To = Convert.ToString(rw["To"]),
                      RequestStatus = Convert.ToString(rw["RequestStatus"]),
                      RequestDeskRemarks = Convert.ToString(rw["RequestDeskRemarks"]),
                      PatientName = Convert.ToString(rw["PatientName"]),
                      RequestorName = Convert.ToString(rw["RequestorName"]),
                      PorterName = Convert.ToString(rw["PorterName"]),
                      RequestTime = Convert.ToString(rw["RequestTime"]),
                      RequestStatusId = Convert.ToString(rw["RequestStatusId"]),
                      MultiTaskFlag = Convert.ToString(rw["MultiTaskFlag"]),
                      AssignedTime = Convert.ToString(rw["AssignedTime"]),
                      StartTime = Convert.ToString(rw["StartTime"]),
                      ThresholdForStartTime = Convert.ToString(rw["ThresholdForStartTime"]),
                      ThresholdForEndTime = Convert.ToString(rw["ThresholdForEndTime"]),
                      NoResponseTime = Convert.ToString(rw["NoResponseTime"]),
                      RequestNo = Convert.ToString(rw["RequestNo"]),
                      Priority = Convert.ToString(rw["Priority"]),
                      StartLocationMac = Convert.ToString(rw["StartLocationMac"]),
                      EndLocationMac = Convert.ToString(rw["EndLocationMac"]),
                      PorterRemarks = Convert.ToString(rw["PorterRemarks"]),
                      PorterId = Convert.ToString(rw["PorterId"]),
                      SubPorterId = Convert.ToString(rw["SubPorterId"]),
                      IsAdhoc = Convert.ToString(rw["IsAdhoc"]),

                      IsMultiPorter = Convert.ToString(rw["IsMultiPorter"]),
                      PorterStartFlag = Convert.ToString(rw["PorterStartFlag"]),
                      SubPorterStartFlag = Convert.ToString(rw["SubPorterStartFlag"]),
                      PorterEndFlag = Convert.ToString(rw["PorterEndFlag"]),
                      SubPorterEndFlag = Convert.ToString(rw["SubPorterEndFlag"]),
                      IsAlarm = Convert.ToString(rw["IsAlarm"]),
                      Result = Convert.ToString(rw["Result"])


                  }).ToList(),
                                PreviousPorterTask = (from rw in dt.Tables[1].AsEnumerable()
                                                      select
                          new Previousportertask()
                          {

                              RequestId = Convert.ToString(rw["RequestId"]),
                              RequestNo = Convert.ToString(rw["RequestNo"]),
                              RequestStatus = Convert.ToString(rw["RequestStatus"]),
                              MessageId = Convert.ToString(rw["MessageId"])

                          }).ToList(),
                                PorterEndShift = Convert.ToString(dt.Tables[2].Rows[0]["EndShift"])
                          ,
                                Buzzer = new Buzzer()
                                {
                                    Result = dt.Tables[3].Rows.Count > 0 ? "TRUE" : "FALSE",
                                    BuzzerId = (dt.Tables[3].Rows.Count > 0 ? Convert.ToString(dt.Tables[3].Rows[0]["BuzzerId"]) : "")
                                }



                            },

                        };
                    }

                    else
                    {
                        rtnRst = new RtnPorterTaskList
                        {
                            status = false,
                            message = GlobalVar.NoDataFound,
                            data = rows
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnPorterTaskList
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = rows
                    };
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "Adhocrequestinsert", conStr);

                rtnRst = new RtnPorterTaskList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
                rtnBool = false;
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        /*   [Authorize]
           [HttpPost]
           [Route("OldAdHocRequestCreation")]
           public HttpResponseMessage OldAdHocRequestCreation([FromBody] AdhocRequestCreate loc)
           {

               rslt = "FALSE";  DataTable dt = new DataTable();
               try
               {
                   if ((ModelState.IsValid))
                   {
                       loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                       loc.Process = "RequestInsert";
                       loc.RequestStatusId = "4";
                       hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                       dt = DataAccess.AdhocRequestInsert(loc, conStr);


                       if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["Result"].ToString().ToUpper() =="TRUE")
                       {
                           rslt = " {\"status\": true,\"message\": \"Task started successfully\",\"data\": {\"Result\":\"TRUE\",\"RequestNo\":\"" + dt.Rows[0]["Requestno"] + "\"}}";
                           rtnBool = true;
                       }

                       else
                       {
                           rtnBool = false;
                       }
                   }
                   else
                   {
                       rtnBool = false;
                   }
               }
               catch
               {
                   rtnBool = false;
               }

               rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

               return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
           }


           */
        [Authorize]
        [HttpPost]
        [Route("AdHocOffline")]
        public HttpResponseMessage AdHocOffline([FromBody] AdhocRequestCreate loc)
        {

            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "RequestOffline";
                    loc.RequestStatusId = "6";
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.RemarksId = String.IsNullOrEmpty(loc.RemarksId) ? "0" : loc.RemarksId;
                    dt = DataAccess.AdhocOfflineInsert(loc, conStr);


                    if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["Result"].ToString().ToUpper() == "TRUE")
                    {
                        rslt = " {\"status\": true,\"message\": \"Task completed successfully\",\"data\": {\"Result\":\"TRUE\",\"RequestNo\":\"" + dt.Rows[0]["Requestno"] + "\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch
            {
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        [Authorize]
        [HttpPost]
        [Route("LocationUpdate")]
        public HttpResponseMessage LocationUpdate([FromBody] LocationUpdates loc)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "LOCATIONUPDATE";
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    dt = DataAccess.LocationUpdate(loc, "USER", conStr);


                    if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["Result"].ToString().ToUpper() == "TRUE")
                    {
                        rslt = " {\"status\": true,\"message\": \"Location updated successfully\",\"data\": {\"RESULT\":\"TRUE\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch
            {
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }


        [Authorize]
        [HttpPost]
        [Route("AdHocCompleteTask")]
        public HttpResponseMessage AdHocCompleteTask([FromBody] AdHocCompleteTask loc)
        {

            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "CompleteTask";
                    loc.RequestStatus = "COMPLETETASK";
                    loc.RemarksId = String.IsNullOrEmpty(loc.RemarksId) ? "0" : loc.RemarksId;


                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    dt = DataAccess.AdhocEndTask(loc, conStr);

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Equals("TRUE") ? true : false),
                        message = rslt.Equals("TRUE") ? "Task completed successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "TRUE" : "FALSE" }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }
            }
            catch
            {
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [HttpPost]
        [Route("AutoAssign")]
        public HttpResponseMessage AutoAssign([FromBody] AutoAssginRequest loc) //selected
        {



            rslt = "TRUE"; DataTable dt = new DataTable();


            try
            {


                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                dt = DataAccess.DaAutoAssign(loc.Process, conStr);

                rslt = dt.Rows[0]["result"].ToString().ToUpper() == "TRUE" ? "{\"status\": true,\"message\": \"Request assigned successfully\",\"data\":{ \"Result\":\"" + rslt + "\"}}" : "{\"status\": false,\"message\": \"" + dt.Rows[0]["result"].ToString() + " Please check the data\",\"data\":{}}";
            }
            catch (Exception ex)
            {
                rslt = "{\"status\": false,\"message\": \"Please check the datas\",\"data\":{}}";
            }
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));




        }


        [Authorize]
        [HttpPost]
        [Route("Logout")]
        public HttpResponseMessage Logout([FromBody] GenHosPorter loc) // 
        {



            rslt = "TRUE"; DataTable dt = new DataTable();


            try
            {
                if ((ModelState.IsValid))
                {

                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "Logout";
                    dt = DataAccess.DaLogout(loc, conStr);

                    rslt = dt.Rows[0]["result"].ToString().ToUpper() == "TRUE" ? "{\"status\": true,\"message\": \"Logout successfully\",\"data\":{ \"Result\":\"" + rslt + "\"}}" : "{\"status\": false,\"message\": \"" + dt.Rows[0]["result"].ToString() + " \",\"data\":{}}";
                }
                else
                {
                    rslt = "{\"status\": false,\"message\": \"Please check the data.\",\"data\":{}}";
                }
            }
            catch (Exception ex)
            {
                rslt = "{\"status\": false,\"message\": \"Please check the datas\",\"data\":{}}";
            }
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));




        }


        [Authorize]
        [HttpPost]
        [Route("AlarmOff")]
        public HttpResponseMessage AlarmOff([FromBody] AlarmOffM loc) // 
        {



            rslt = "TRUE"; DataTable dt = new DataTable();


            try
            {
                if ((ModelState.IsValid))
                {

                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "AlarmOff";
                    dt = DataAccess.DaAlarmOff(loc, conStr);

                    rslt = dt.Rows[0]["result"].ToString().ToUpper() == "TRUE" ? "{\"status\": true,\"message\": \"Updated successfully\",\"data\":{ \"Result\":\"" + rslt + "\"}}" : "{\"status\": false,\"message\": \"" + dt.Rows[0]["result"].ToString() + " Please check the data\",\"data\":{}}";
                }
                else
                {
                    rslt = "{\"status\": false,\"message\": \"Please check the data.\",\"data\":{}}";
                }
            }
            catch (Exception ex)
            {
                rslt = "{\"status\": false,\"message\": \"Please check the datas\",\"data\":{}}";
            }
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));




        }


        [HttpPost]
        [Route("MessageDetails")]
        public HttpResponseMessage GetMessageDetails([FromBody] ProMessages loc)
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                loc.Process = "get";
                dt = DataAccess.DaMessage(loc, conStr);

                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0)
                {

                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [HttpPost]
        [Route("AddMessage")]
        public HttpResponseMessage AddMessage([FromBody] ProMessages loc)
        {

            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);

                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "NEWMESSAGE";
                    dt = DataAccess.DaMessage(loc, conStr);


                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Equals("TRUE") ? true : false),
                        message = rslt.Equals("TRUE") ? "Message added successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "TRUE" : "FALSE" }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }
            }
            catch
            {
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        //supervisortask app start

        [Authorize]
        [HttpPost]
        [Route("PorterTaskNotStarted")]
        public HttpResponseMessage PorterTaskNotStarted([FromBody] GetPorterTasks loc)  //june 3
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                loc.Process = "NOTSTARTED";
                dt = DataAccess.DAPorterTasks(loc, conStr).Tables[0];

                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["Result"].ToString() == "TRUE")
                {

                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [Authorize]
        [HttpPost]
        [Route("PorterTaskNotCompleted")]
        public HttpResponseMessage PorterTaskNotCompleted([FromBody] GetPorterTasks loc)  //working june 3
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                loc.Process = "NOTCOMPLETED";
                dt = DataAccess.DAPorterTasks(loc, conStr).Tables[0];

                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["Result"].ToString() == "TRUE")
                {

                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [Authorize]
        [HttpPost]
        [Route("PorterTaskNoResponse")]
        public HttpResponseMessage PorterTaskNoResponse([FromBody] GetPorterTasks loc)  //working jun3
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                loc.Process = "NORESPONSE";
                dt = DataAccess.DAPorterTasks(loc, conStr).Tables[0];

                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["Result"].ToString() == "TRUE")
                {

                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        //[Authorize]
        [HttpPost]
        [Route("PorterRequestCreation")]
        public HttpResponseMessage PorterRequestCreation([FromBody] RequestCreate loc)
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "CreateAssignRequest";
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    dt = DataAccess.RequestInsert(loc, conStr);


                    if (dt != null && dt.Rows.Count > 0)
                    {
                        rslt = " {\"status\": true,\"message\": \"Request Added successfully\",\"data\": {\"Result\":\"TRUE\",\"RequestNo\":\"" + dt.Rows[0]["Requestno"] + "\"}}";
                        rtnBool = true;
                    }

                    else
                    {
                        rtnBool = false;
                    }
                }
                else
                {
                    rtnBool = false;
                }
            }
            catch
            {
                rtnBool = false;
            }

            rslt = rtnBool ? rslt : " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";

            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        }

        //  [Authorize]
        [HttpPost]
        [Route("BuzzerList")]
        public HttpResponseMessage BuzzerList([FromBody] GetBuzzerList loc)  //working jun3
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                loc.Process = "NORESPONSE";
                dt = DataAccess.GetBuzzerList("1", loc.BuzzerId, string.Empty, conStr);

                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0 && dt.Rows[0]["Result"].ToString() == "TRUE")
                {

                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }



        //  [Authorize]
        [HttpPost]
        [Route("PorterRemarks")]
        public HttpResponseMessage PorterRemarks([FromBody] ModelHospital loc)  //working jun3
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    // loc.Process = "NORESPONSE";
                    dt = DataAccess.PorterRemarks(loc.Process, conStr);

                    string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                    IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                            .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                    if (dt != null && dt.Rows.Count > 0)
                    {

                        rtnRst = new RtnList
                        {
                            status = true,
                            message = result.Count().ToString() + GlobalVar.NoOfrecords,
                            data = result
                        };
                    }

                    else
                    {
                        rtnRst = new RtnList
                        {
                            status = false,
                            message = GlobalVar.NoDataFound,
                            data = rows
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

       // [Authorize]
        [HttpPost]
        [Route("Remarks")]
        public HttpResponseMessage Remarks([FromBody] ModelHospital loc)  // 
        {
            RtnCatClnRemarksList rtnRst; CateringCleaningRemarks rows = new CateringCleaningRemarks();
           
            rows.CateringRemarks = new List<CateringRem> { };
            rows.CleaningRemarks = new List<CleaningRem> { };
            loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
            try
            {
                DataSet dts = DataAccess.DaCateringRemarks("CATERINGCLEANINGREMARKS", loc.HospitalId.Split('_')[1]);

                if (dts != null && dts.Tables.Count > 0)
                {

                    rtnRst = new RtnCatClnRemarksList
                    {
                        status = dts.Tables[0].Rows.Count > 0 ? true : false,
                        message = dts.Tables[0].Rows.Count > 0 ? dts.Tables[0].Rows.Count.ToString() + GlobalVar.NoOfrecords : "No data found",
                        data = new CateringCleaningRemarks()
                        {

                            CateringRemarks = (from rw in dts.Tables[0].AsEnumerable()
                                                  select
                      new CateringRem()
                      {
                          RemarksId = Convert.ToString(rw["RemarksId"]),
                          Remarks = Convert.ToString(rw["Remarks"])

                      }).ToList(),
                            CleaningRemarks = (from rw in dts.Tables[1].AsEnumerable()
                                             select
                 new CleaningRem()
                 {
                     RemarksId = Convert.ToString(rw["RemarksId"]),
                     Remarks = Convert.ToString(rw["Remarks"])

                 }).ToList()
                        }
                    };

                }

                else
                {
                    rtnRst = new RtnCatClnRemarksList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }

                dts = null;
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "CateringRemarks", conStr);

                rtnRst = new RtnCatClnRemarksList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
                rtnBool = false;
            }
           

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        [Authorize]
        [HttpPost]
        [Route("PorterMessage")]
        public HttpResponseMessage PorterMessage([FromBody] PorterMesssage loc)  // 11 10 23
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                loc.Process = "GET";
                loc.MessageId = "0";
                dt = DataAccess.DAPorterMsg(loc, conStr);

                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (dt != null && dt.Rows.Count > 0)
                {

                    rtnRst = new RtnList
                    {
                        status = true,
                        message = result.Count().ToString() + GlobalVar.NoOfrecords,
                        data = result
                    };
                }

                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.NoDataFound,
                        data = rows
                    };
                }
            }
            catch
            {
                rtnRst = new RtnList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        // [Authorize]
        [HttpPost]
        [Route("TaskOnHold")]
        public HttpResponseMessage TaskOnHold([FromBody] BTaskOnHold loc)
        {

            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);

                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "ONHOLD";
                    dt = DataAccess.DAPorterOnHold(loc, conStr);

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Equals("TRUE") ? true : false),
                        message = rslt.Equals("TRUE") ? "Updated successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "TRUE" : "FALSE" }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }
            }
            catch
            {
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        // [Authorize]
        [HttpPost]
        [Route("MessageSent")]
        public HttpResponseMessage MessageSent([FromBody] PorterMesssage loc)
        {

            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);

                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "MESSAGESENT";
                    dt = DataAccess.DAPorterMsg(loc, conStr);

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Equals("TRUE") ? true : false),
                        message = rslt.Equals("TRUE") ? "Buzzer sent successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "TRUE" : "FALSE" }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }
            }
            catch
            {
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

        [Authorize]
        [HttpPost]
        [Route("BuzzerSent")]
        public HttpResponseMessage BuzzerSent([FromBody] GetBuzzerList loc)
        {

            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);

                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    loc.Process = "BUZZERSENT";
                    dt = DataAccess.GetBuzzerList("3", loc.BuzzerId, string.Empty, conStr);

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Equals("TRUE") ? true : false),
                        message = rslt.Equals("TRUE") ? "Buzzer sent successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "TRUE" : "FALSE" }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }
            }
            catch
            {
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }



        //supervisortask app end

        //cleaning start
        [Authorize]
        [HttpPost]
        [Route("CleaningStartTask")]
        public HttpResponseMessage CleaningStartTask([FromBody] StartCompleteClnTask loc)
        {
            rslt = "FALSE"; RtnClnTaskDetail rtnRst; Currentcleaningtaskdetail rows = new Currentcleaningtaskdetail();
            rows.Result = "FALSE";
            try
            {
                if ((ModelState.IsValid))
                {
                    loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                    loc.Process = "CLEANINGSTARTTASK";
                    loc.RequestStatus = "STARTTASK";
                    loc.EndTime = "";
                    hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                    DataTable dt = DataAccess.StartEndCleanTask(loc, conStr);

                    if (dt != null && dt.Rows.Count > 0)
                    {
                        DataRow rw = dt.Rows[0];
                        rtnRst = new RtnClnTaskDetail
                        {
                            status = true,
                            message = (dt.Rows.Count > 0 && rw["result"].ToString().ToUpper() == "TRUE") ? dt.Rows.Count.ToString() + GlobalVar.NoOfrecords : "No task found",
                            data = new Currentcleaningtaskdetail()
                            {
                                RequestId = Convert.ToString(rw["RequestId"]),
                                CategoryName = Convert.ToString(rw["CategoryName"]),
                                CategoryImage = Convert.ToString(rw["CategoryImage"]),
                                From = Convert.ToString(rw["From"]),
                                To = Convert.ToString(rw["To"]),
                                RequestStatus = Convert.ToString(rw["RequestStatus"]),
                                RequestDeskRemarks = Convert.ToString(rw["RequestDeskRemarks"]),
                                PatientName = Convert.ToString(rw["PatientName"]),
                                RequestorName = Convert.ToString(rw["RequestorName"]),
                                PorterName = Convert.ToString(rw["PorterName"]),
                                RequestTime = Convert.ToString(rw["RequestTime"]),
                                RequestStatusId = Convert.ToString(rw["RequestStatusId"]),
                                AssignedTime = Convert.ToString(rw["AssignedTime"]),
                                StartTime = Convert.ToString(rw["StartTime"]),
                                ThresholdForStartTime = Convert.ToString(rw["ThresholdForStartTime"]),
                                ThresholdForEndTime = Convert.ToString(rw["ThresholdForEndTime"]),
                                RequestNo = Convert.ToString(rw["RequestNo"]),
                                Priority = Convert.ToString(rw["Priority"]),
                                PorterRemarks = Convert.ToString(rw["PorterRemarks"]),
                                Quantity = Convert.ToString(rw["Quantity"]),
                                ContactNo = Convert.ToString(rw["ContactNo"]),
                                Result = Convert.ToString(rw["Result"])


                            }
                        };
                    }

                    else
                    {
                        rtnRst = new RtnClnTaskDetail
                        {
                            status = false,
                            message = GlobalVar.NoDataFound,
                            data = rows
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnClnTaskDetail
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = rows
                    };
                    rtnBool = false;
                }
            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "cleaingstarttask", conStr);

                rtnRst = new RtnClnTaskDetail
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = rows
                };
                rtnBool = false;
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }

       // [Authorize]
        [HttpPost]
        [Route("CleaningCompleteTask")]
        public HttpResponseMessage CleaningCompleteTask()
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            RtnPorterStartEndData dumd = new RtnPorterStartEndData();
            rslt = "FALSE"; RtnPorterStartEnd rtnRst; DataTable dt = new DataTable();
            string signimg = string.Empty, photoimg = string.Empty;
            StartCompleteClnTask loc = new StartCompleteClnTask();
            try
            {
                string endtime = HttpContext.Current.Request.Form["EndTime"].ToString(), hosid = HttpContext.Current.Request.Form["HospitalId"].ToString(), pid = HttpContext.Current.Request.Form["PorterId"].ToString(), reqId = HttpContext.Current.Request.Form["RequestId"].ToString();
                rtnBool = (!Request.Content.IsMimeMultipartContent() ? false : true);

                if (!Request.Content.IsMimeMultipartContent())
                {
                    rtnBool = false;
                    //throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
                }
                rtnBool = true;
                rslt = "FALSE";
                try
                {
                    //  var file = HttpContext.Current.Request.Files.Count > 0 ?  HttpContext.Current.Request.Files[0] : null;
                    foreach (string fn in HttpContext.Current.Request.Files)
                    {
                        HttpPostedFile file = HttpContext.Current.Request.Files[fn];
                        if (rtnBool && file != null && file.ContentLength > 0 && (new[] { ".jpg", ".jpeg", ".png", ".bmp" }.Contains(Path.GetExtension(file.FileName.ToLower())) ? true : false))
                        {
                            var fileName = Path.GetFileName(file.FileName).ToUpper();
                            if (fileName.Substring(0, 9) == "SIGNATURE")
                            {
                                fileName = pid + "_" + reqId + "_sign" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                                signimg = fileName;
                                var path = Path.Combine(
                                    HttpContext.Current.Server.MapPath("~/Images/Profile"), //RequestSign
                                    fileName
                                );
                                
                              //  path = @"C:\Websites\VirtualDirectory\Catering\" + fileName; //live
                                file.SaveAs(path);
                                loc.CleaningSign = fileName;
                                rtnBool = true;
                            }
                            if (fileName.Substring(0, 5) == "OTHER")
                            {
                                fileName = pid + "_" + reqId + "_photo" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                                photoimg = fileName;
                                var path = Path.Combine(
                                    HttpContext.Current.Server.MapPath("~/Images/Profile"),//Requestphoto
                                    fileName
                                );

                                //    path = @"C:\Websites\VirtualDirectory\Catering\" + fileName; //live

                                file.SaveAs(path);
                                loc.CleaningOtherPhoto = fileName;
                            }
                            if (fileName.Substring(0, 11) == "BEFOREPHOTO")
                            {
                                fileName = pid + "_" + reqId + "_beforephoto" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                                photoimg = fileName;
                                var path = Path.Combine(
                                    HttpContext.Current.Server.MapPath("~/Images/Profile"),//Requestphoto
                                    fileName
                                );

                                //   path = @"C:\Websites\VirtualDirectory\Catering\" + fileName; //live
                                file.SaveAs(path);
                                loc.CleaningBefPhoto = fileName;
                            }
                            if (fileName.Substring(0, 10) == "AFTERPHOTO")
                            {
                                fileName = pid + "_" + reqId + "_afterphoto" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
                                photoimg = fileName;
                                var path = Path.Combine(
                                    HttpContext.Current.Server.MapPath("~/Images/Profile"),//Requestphoto
                                    fileName
                                );

                                //  path = @"C:\Websites\VirtualDirectory\Catering\" + fileName; //live
                                file.SaveAs(path);
                                loc.CleaningAftPhoto = fileName;
                            }

                        }
                    }
                }
                catch (Exception e)
                {
                    DataAccess.InsertError(e.Message, "cleaningimageupload", conStr);
                    rtnBool = false;
                }

                if (rtnBool)
                {


                    loc.HospitalId = AesOperation.DecryptString(hosid);
                    loc.Process = "CompleteTaskCleaning";
                    loc.RequestStatus = "COMPLETETASK";
                    conStr = loc.HospitalId.Split('_')[1];
                    loc.RequestId = reqId;
                    loc.PorterId = HttpContext.Current.Request.Form["PorterId"].ToString();
                    loc.PorterRemarks = String.IsNullOrEmpty( HttpContext.Current.Request.Form["PorterRemarks"]) ? "" : HttpContext.Current.Request.Form["PorterRemarks"].ToString();
                    loc.StartTime = "";
                    loc.EndTime = endtime;
                    loc.Name = String.IsNullOrEmpty(HttpContext.Current.Request.Form["Name"]) ? "" : HttpContext.Current.Request.Form["Name"].ToString();
                    loc.PhoneNo = String.IsNullOrEmpty(HttpContext.Current.Request.Form["PhoneNo"]) ? "" : HttpContext.Current.Request.Form["PhoneNo"].ToString();
                  
                    loc.AckBefLocStamp = String.IsNullOrEmpty(HttpContext.Current.Request.Form["BeforeLocStamp"]) ? "" : HttpContext.Current.Request.Form["BeforeLocStamp"].ToString();
                    loc.AckBefPhotoTimeStamp = String.IsNullOrEmpty(HttpContext.Current.Request.Form["BeforeTimeStamp"]) ? "" : HttpContext.Current.Request.Form["BeforeTimeStamp"].ToString();

                    loc.AckAftLocStamp = String.IsNullOrEmpty(HttpContext.Current.Request.Form["AfterLocStamp"]) ? "" : HttpContext.Current.Request.Form["AfterLocStamp"].ToString();
                    loc.AckAftPhotoTimeStamp = String.IsNullOrEmpty(HttpContext.Current.Request.Form["AfterTimeStamp"]) ? "" : HttpContext.Current.Request.Form["AfterTimeStamp"].ToString();

                    loc.AckOthLocStamp = String.IsNullOrEmpty(HttpContext.Current.Request.Form["OtherLocStamp"]) ? "" : HttpContext.Current.Request.Form["OtherLocStamp"].ToString();
                    loc.AckOthPhotoTimeStamp = String.IsNullOrEmpty(HttpContext.Current.Request.Form["OtherTimeStamp"]) ? "" : HttpContext.Current.Request.Form["OtherTimeStamp"].ToString();
                                       
                    dt = DataAccess.StartEndCleanTask(loc, conStr);

                    rslt = dt.Rows[0]["RESULt"].ToString();
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = (rslt.Split('_')[0].Equals("TRUE") ? true : false),
                        message = rslt.Split('_')[0].Equals("TRUE") ? "Updated successfully" : rslt.Equals("FALSE") ? GlobalVar.PlsChkData : rslt.Split('_')[1].ToString(),
                        data = new RtnPorterStartEndData { Result = rslt.Equals("TRUE") ? "Task completed" : rslt.Contains("_") ? rslt.Split('_')[1].ToString() : "Please check the data" }
                    };

                }
                else
                {
                    rtnRst = new RtnPorterStartEnd
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }

            }
            catch (Exception ex)
            {
                DataAccess.InsertError(ex.Message, "dacompletetaskclean", conStr);
                rtnRst = new RtnPorterStartEnd
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }



            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
        }


        //end
    }
}



