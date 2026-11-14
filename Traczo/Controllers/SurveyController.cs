using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using Newtonsoft.Json;



using Traczo.Models;
using System.Web.Script.Serialization;
using Newtonsoft.Json.Linq;
using System.Web;
using System.Security.Claims;
using Microsoft.Owin.Security;
using Microsoft.Owin.Infrastructure;
using Microsoft.AspNet.Identity;
using System.Web.Http.Hosting;
using System.Text;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading.Tasks;

namespace Traczo.Controllers
{
    public class SurveyController : ApiController
    {
        string conStr = string.Empty, hosID = string.Empty, rslt = string.Empty,rsltEmp= "{}"; bool rtnBool = false;


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
                hosID = loc.HospitalId.Split('_')[0]; conStr = DataAccess.HosIdC;// loc.HospitalId.Split('_')[1];
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
                       HisBedId= Convert.ToString(rw["bedid"]),
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

                            fileName = "QR_" + LocName + "_" + DateTime.Now.ToString().Replace("/", "_").Replace(":", "_").Replace(" ", "") + Path.GetExtension(file.FileName.ToLower());
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

                    if (dt != null && dt.Tables[0].Rows.Count > 0)
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


        [HttpPost]
        [Route("GetBranches")]
        public HttpResponseMessage GetBranches([FromBody] BranchesIP branch)
        {
            DataTable dt = new DataTable(); rslt = "FALSE"; RtnBranches rtnRst;
            List<BranchesOP> k = new List<BranchesOP>();
            try { 

            if (branch != null)
            {
                dt = DataAccess.SGetBranches(branch.ServerIp, "BRANCH", "traczomain");
                rslt = dt.Rows[0]["result"].ToString();
            }           
            if (dt !=null && rslt == "TRUE")
            {
                var branchs = (from rw in dt.AsEnumerable()
                               select new BranchesOP()
                               {
                                   HospitalId = AesOperation.EncryptString(Convert.ToString(rw["HospitalId"])),
                                   HospitalName = Convert.ToString(rw["HospitalName"]),
                                   HostingUrl = Convert.ToString(rw["HostingUrl"]),
                                   VoicePingUrl = "",
                                   SocketUrl = "",
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
        [Route("Floor")]
        public HttpResponseMessage Floor([FromBody] Floors flr)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            DataTable dt = new DataTable();
            rslt = "FALSE"; RtnList rtnRst;
            try { 
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


       


        [HttpPost]
        [Route("Location")]
        public HttpResponseMessage Location([FromBody] Locations loc) //  add update delete nearbyzone  6
         {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable(); string prs = loc.Process;  

            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                dt = DataAccess.SLocationMaster(loc, "USER", conStr);
                string[] columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToArray();
                IEnumerable<Dictionary<string, object>> result = dt.Rows.Cast<DataRow>()
                        .Select(dr => columns.ToDictionary(c => c, c => dr[c]));

                if (prs.ToUpper() == "GET"  )
                {
                    if (dt != null && dt.Rows.Count > 0)
                    {

                        rtnRst = new RtnList
                        {
                            status = (loc.Process.ToUpper() == "ADD" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true : ((loc.Process.ToUpper() == "ADD" || loc.Process.ToUpper() == "UPDATE") && dt.Rows[0]["result"].ToString().ToUpper() == "ALREADY EXISTS") ? false : (loc.Process.ToUpper() == "UPDATE" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true : (loc.Process.ToUpper() == "DELETE" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true : (loc.Process.ToUpper() == "DELETE" && dt.Rows[0]["result"].ToString().ToUpper() == "FALSE") ? false : true,
                            message = (loc.Process.ToUpper() == "ADD" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? "Location added successfully" : ((loc.Process.ToUpper() == "ADD" || loc.Process.ToUpper() == "UPDATE") && dt.Rows[0]["result"].ToString().ToUpper() == "ALREADY EXISTS") ? "Location or Mac already exists" : (loc.Process.ToUpper() == "UPDATE" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? "Location updated successfully" : (loc.Process.ToUpper() == "DELETE" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? "Location deleted successfully" : (loc.Process.ToUpper() == "DELETE" && dt.Rows[0]["result"].ToString().ToUpper() == "FALSE") ? GlobalVar.PlsChkData : result.Count().ToString() + GlobalVar.NoOfrecords,
                            data = (loc.Process.ToUpper() == "ADD" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? result : ((loc.Process.ToUpper() == "ADD" || loc.Process.ToUpper() == "UPDATE") && dt.Rows[0]["result"].ToString().ToUpper() == "ALREADY EXISTS") ? rows : (loc.Process.ToUpper() == "UPDATE" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? result : (loc.Process.ToUpper() == "DELETE" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? result : (loc.Process.ToUpper() == "DELETE" && dt.Rows[0]["result"].ToString().ToUpper() == "FALSE") ? rows : result,

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
                        message = GlobalVar.DumData,
                        data = rows
                    };


                    if (dt != null && dt.Rows.Count > 0)
                    {
                        rslt = (loc.Process.ToUpper() == "ADD" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? "Location added successfully" : ((loc.Process.ToUpper() == "ADD" || loc.Process.ToUpper() == "UPDATE") && dt.Rows[0]["result"].ToString().ToUpper() == "ALREADY EXISTS") ? "Location or Mac already exists" : (loc.Process.ToUpper() == "UPDATE" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? "Location updated successfully" : (loc.Process.ToUpper() == "DELETE" && dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? "Location deleted successfully" : (loc.Process.ToUpper() == "DELETE" && dt.Rows[0]["result"].ToString().ToUpper() == "FALSE") ? GlobalVar.PlsChkData : GlobalVar.PlsChkData;
                       
                        if (dt.Rows[0]["result"].ToString().ToUpper() == "TRUE")
                        {
                          
                            rslt = " {\"status\": true,\"message\": \"" + rslt + "\",\"data\": {\"RESULT\":\"TRUE\"}}";
                        }
                        else
                        {
                            rslt = " {\"status\": false,\"message\": \""+rslt+"\",\"data\": { } }";
                        }
                        
                    }

                    else
                    {
                        rslt = " {\"status\": false,\"message\": \"Please check the data\",\"data\": { } }";
                    }


                }
            }
            catch
            {
                if (prs.ToUpper() == "GET" )
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = rows
                    };
                }
                else
                {
                    rtnRst = new RtnList
                    {
                        status = false,
                        message = GlobalVar.DumData,
                        data = rows
                    };

                    rslt = " {\"status\": false,\"message\": \"Please check the data.\",\"data\": { } }";
                }
            }

           if (prs.ToUpper() == "GET" || prs.ToUpper() == "SELECTED")
            {
                return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
            }

            
        }

        [HttpPost]
        [Route("LocationList")]
        public HttpResponseMessage LocationList([FromBody] Locations loc) //get survey locationlist
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnLocationList rtnRst; DataSet dt = new DataSet(); 
            LocationMacList dumd = new LocationMacList();
            dumd.addedData= new List<LocationDetails> { };
            dumd.macIDData = new List<MacList> { };
            // dumd = null;
            try
            { 
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                loc.Process = "GET";
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                dt = DataAccess.DaLocationList(loc, "USER", conStr);
              
                if (loc.Process == "GET")
                {
                    if (dt != null && dt.Tables[0].Rows.Count > 0 && dt.Tables[0].Rows[0]["result"].ToString()=="TRUE")
                    {                                 

                        rslt = "FALSE"; 
                        rtnRst  =new RtnLocationList
                            {
                                status = true,
                                message = dt.Tables[0].Rows.Count.ToString()+" Records found",
                                data =  new LocationMacList()
                                {
                                    addedData = (from rw in dt.Tables[0].AsEnumerable()
                                                        select
                            new LocationDetails()
                            {
                                Id = Convert.ToInt32(rw["Id"]),
                                ZoneName = Convert.ToString(rw["Zonename"]),
                                FloorId = Convert.ToInt32(rw["FloorId"]),
                                FloorName = Convert.ToString(rw["FloorName"]),
                                Mac = Convert.ToString(rw["Mac"]),
                                APName = Convert.ToString(rw["APName"]),
                                DeviceType = Convert.ToString(rw["DeviceType"]),
                                NearByZoneId = Convert.ToString(rw["NearByZoneId"]),
                                Latitude = Convert.ToString(rw["Latitude"]),
                                Longitude = Convert.ToString(rw["Longitude"]),
                                IsActive = Convert.ToInt32(rw["IsActive"]),
                                Result = Convert.ToString(rw["Result"])

                            }).ToList(),
                                    macIDData = (from rw in dt.Tables[1].AsEnumerable()
                                                      select
                          new MacList()
                          {
                              
                              Mac = Convert.ToString(rw["MAC"]) 

                          }).ToList()
                                }   
                            };                  

                    }

                    else
                    {
                        rtnRst = new RtnLocationList
                        {
                            status = false,
                            message = GlobalVar.PlsChkData,
                            data = dumd
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnLocationList
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };


                }
            }
            catch(Exception ex)
            {

                rtnRst = new RtnLocationList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };

            }
 
                return Request.CreateResponse(HttpStatusCode.OK, rtnRst);
            


        }

        public HttpResponseMessage BleList([FromBody] Locations loc) //get survey locationlist
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnLocationList rtnRst; DataSet dt = new DataSet();
            LocationMacList dumd = new LocationMacList();
            dumd.addedData = new List<LocationDetails> { };
            dumd.macIDData = new List<MacList> { };
            // dumd = null;
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                loc.Process = "GETBLE";
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                dt = DataAccess.DaLocationList(loc, "USER", conStr);

                if (loc.Process == "GETBLE")
                {
                    if (dt != null && dt.Tables[0].Rows.Count > 0 && dt.Tables[0].Rows[0]["result"].ToString() == "TRUE")
                    {

                        rslt = "FALSE";
                        rtnRst = new RtnLocationList
                        {
                            status = true,
                            message = dt.Tables[0].Rows.Count.ToString() + " Records found",
                            data = new LocationMacList()
                            {
                                addedData = (from rw in dt.Tables[0].AsEnumerable()
                                             select
                 new LocationDetails()
                 {
                     Id = Convert.ToInt32(rw["Id"]),
                     ZoneName = Convert.ToString(rw["Zonename"]),
                     FloorId = Convert.ToInt32(rw["FloorId"]),
                     FloorName = Convert.ToString(rw["FloorName"]),
                     Mac = Convert.ToString(rw["Mac"]),
                     APName = Convert.ToString(rw["APName"]),
                     DeviceType = Convert.ToString(rw["DeviceType"]),
                     NearByZoneId = Convert.ToString(rw["NearByZoneId"]),
                     Latitude = Convert.ToString(rw["Latitude"]),
                     Longitude = Convert.ToString(rw["Longitude"]),
                     IsActive = Convert.ToInt32(rw["IsActive"]),
                     Result = Convert.ToString(rw["Result"])

                 }).ToList(),
                                macIDData = (from rw in dt.Tables[1].AsEnumerable()
                                             select
                 new MacList()
                 {

                     Mac = Convert.ToString(rw["MAC"])

                 }).ToList()
                            }
                        };

                    }

                    else
                    {
                        rtnRst = new RtnLocationList
                        {
                            status = false,
                            message = GlobalVar.PlsChkData,
                            data = dumd
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnLocationList
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };


                }
            }
            catch (Exception ex)
            {

                rtnRst = new RtnLocationList
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };

            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);



        }
        public List<InnerZoneList> SelectedZoneWithAll(DataTable dt)
        {
            List<NrZones> customers = new List<NrZones>();          
            
            var customers1 = (from rw in dt.AsEnumerable()
                              select
  new InnerZoneList()
  {
      Id = Convert.ToInt32(rw["Id"]),
      ZoneName = Convert.ToString(rw["Zonename"]),
      IsSelected = Convert.ToString(rw["IsSelected"])

  }).ToList();

            return customers1;
        }
        public List<SubZoneDetails> FunSubZoneDetails(DataSet dt)
        {
            List<NrZones> customers = new List<NrZones>();            
            var customers1 = (from rw in dt.Tables[0].AsEnumerable()
                              select
  new SubZoneDetails()
  {
      Id = Convert.ToInt32(rw["Id"]),
      ZoneName = Convert.ToString(rw["Zonename"]),
      FloorId = Convert.ToInt32(rw["FloorId"]),
      FloorName = Convert.ToString(rw["FloorName"]),
      Mac = Convert.ToString(rw["Mac"]),
      APName = Convert.ToString(rw["APName"]),
      DeviceType = Convert.ToString(rw["DeviceType"]),
      NearByZoneId = Convert.ToString(rw["NearByZoneId"]),
      IsActive = Convert.ToInt32(rw["IsActive"]),
      Result = Convert.ToString(rw["Result"]),
      NearByZoneList = SelectedZoneWithAll(dt.Tables[1])
  }).ToList();

            return customers1;
        }

        [HttpPost]
        [Route("LocationDetail")]
        public HttpResponseMessage LocationDetailo([FromBody] Locations loc) //selected
        {
             
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnSelectedLoc rtnRst; DataSet dt = new DataSet(); string prs = loc.Process;
            loc.Process = "SELECTED";
            var k = "";
           
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                dt = DataAccess.SelectedLocationMaster(loc, "USER", conStr);
              
                var branchs = dt.Tables[0].AsEnumerable()
                   .Select(dataRow => new RtnSelectedLoc
                   {
                       status = true,
                       message = "k",                      
                       data = FunSubZoneDetails(dt),

                   });



            /*    var query = from x in dt.Tables[0]
                        join y in dt.Tables[1] on x.TeamId equals y.TeamId
                        select new TeamsWithPlayers
                        {
                            TeamId = x.Id,
                            TeamName = x.TeamName,
                            Players = y
                        }.ToList();

                  var branchs = (from rw in dt.AsEnumerable()
                                     select new RtnSelectedLoc()
                                     {
                                         HospitalId = AesOperation.EncryptString(Convert.ToString(rw["HospitalId"])),
                                         HospitalName = Convert.ToString(rw["HospitalName"]),
                                         HostingUrl = Convert.ToString(rw["HostingUrl"]),
                                         data = se    

                                     }).ToList();

                      rtnRst = new RtnBranches
                      {
                          status = true,
                          message = branchs.Count().ToString() + GlobalVar.NoOfrecords,
                          data = branchs
                      };


                      if (dt != null && dt.Rows.Count > 0)
                      {
                          rtnRst = new RtnList
                          {
                              status = (dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? true : false,
                              message = (dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? result.Count().ToString() + GlobalVar.NoOfrecords : GlobalVar.PlsChkData,
                              data = (dt.Rows[0]["result"].ToString().ToUpper() == "TRUE") ? result : rows,
                          };
                      }

                      else
                      {
                          rtnRst = new RtnList
                          {
                              status = false,
                              message = GlobalVar.NoDataFound,
                              data = new { result, rows }
                          };
                      }
                      */



            return Request.CreateResponse(HttpStatusCode.OK, branchs);

          
        }




        public List<InnerZoneList> SelectedZoneWithAlln(DataTable dt)
        {
            List<NrZones> customers = new List<NrZones>();

            var customers1 = (from rw in dt.AsEnumerable()
                              select
  new InnerZoneList()
  {
      Id = Convert.ToInt32(rw["Id"]),
      ZoneName = Convert.ToString(rw["Zonename"]),
      IsSelected = Convert.ToString(rw["IsSelected"])

  }).ToList();

            return customers1;
        }

        public List<LocationDetails> SelectedZoneWithAlln1(DataTable dt)
        {
             

            var customers1 = (from rw in dt.AsEnumerable()
                              select
  new LocationDetails()
  {
      Id = Convert.ToInt32(rw["Id"]),
      ZoneName = Convert.ToString(rw["Zonename"]),
      FloorId = Convert.ToInt32(rw["FloorId"]),
      FloorName = Convert.ToString(rw["FloorName"]),
      Mac = Convert.ToString(rw["Mac"]),
      APName = Convert.ToString(rw["APName"]),
      DeviceType = Convert.ToString(rw["DeviceType"]),
      NearByZoneId = Convert.ToString(rw["NearByZoneId"]),
      IsActive = Convert.ToInt32(rw["IsActive"]),
      Result = Convert.ToString(rw["Result"])

  }).ToList();

            return customers1;
        }
        public List<SubZoneDetailsn> FunSubZoneDetailsn(DataSet dt)
        {
          
            var customers1 = (from rw in dt.Tables[0].AsEnumerable()
                              select
  new SubZoneDetailsn()
  {
       LocationDetails1= SelectedZoneWithAlln1(dt.Tables[0]),
      NearByZoneList = SelectedZoneWithAll(dt.Tables[1])
  }).ToList();

            return customers1;
        }
       
        
        
        [HttpPost]
        [Route("LocationDetail")]
        public HttpResponseMessage LocationDetail([FromBody] Locations loc) //selected
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();

            rslt = "FALSE"; RtnSelectedLocnn rtnRst; DataSet dt = new DataSet(); 
            SubZoneDetailsnn dumd = new SubZoneDetailsnn();
          //  dumd = null;
            try
            {string prs = loc.Process;
                loc.Process = "SELECTED";
                var k = "";

                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                dt = DataAccess.SelectedLocationMaster(loc, "USER", conStr);

                if (loc.Process == "SELECTED")
                {
                    if (dt != null && dt.Tables[0].Rows.Count > 0 && dt.Tables[0].Rows[0]["result"].ToString() == "TRUE")
                    {

                        /*  var branchs  =new RtnSelectedLocn
                            {
                                status = true,
                                message = "k",
                                data =  new SubZoneDetailsn()
                                {
                                    LocationDetails1 = SelectedZoneWithAlln1(dt.Tables[0]),
                                    NearByZoneList = SelectedZoneWithAll(dt.Tables[1])
                                }   
                            };
                          */

                        rtnRst = new RtnSelectedLocnn
                        {
                            status = true,
                            message = "1 Record found",
                            data = new SubZoneDetailsnn()
                            {
                                Id = Convert.ToInt32(dt.Tables[0].Rows[0]["Id"]),
                                ZoneName = Convert.ToString(dt.Tables[0].Rows[0]["Zonename"]),
                                FloorId = Convert.ToInt32(dt.Tables[0].Rows[0]["FloorId"]),
                                FloorName = Convert.ToString(dt.Tables[0].Rows[0]["FloorName"]),
                                Mac = Convert.ToString(dt.Tables[0].Rows[0]["Mac"]),
                                APName = Convert.ToString(dt.Tables[0].Rows[0]["APName"]),
                                DeviceType = Convert.ToString(dt.Tables[0].Rows[0]["DeviceType"]),
                                NearByZoneId = Convert.ToString(dt.Tables[0].Rows[0]["NearByZoneId"]),
                                IsActive = Convert.ToInt32(dt.Tables[0].Rows[0]["IsActive"]),
                                Xaxis = Convert.ToString(dt.Tables[0].Rows[0]["Xaxis"]),
                                Yaxis = Convert.ToString(dt.Tables[0].Rows[0]["Yaxis"]),
                                Latitude = Convert.ToString(dt.Tables[0].Rows[0]["Latitude"]),
                                Longitude = Convert.ToString(dt.Tables[0].Rows[0]["Longitude"]),
                                Result = Convert.ToString(dt.Tables[0].Rows[0]["Result"]),
                                NearByZoneList = SelectedZoneWithAll(dt.Tables[1])
                            }
                        };
                    }
                    else
                    {
                        rtnRst = new RtnSelectedLocnn
                        {
                            status = false,
                            message = GlobalVar.PlsChkData,
                            data = dumd
                        };
                    }
                }
                else
                {
                    rtnRst = new RtnSelectedLocnn
                    {
                        status = false,
                        message = GlobalVar.PlsChkData,
                        data = dumd
                    };
                }
            }
            catch(Exception ex)
            {
                rtnRst = new RtnSelectedLocnn
                {
                    status = false,
                    message = GlobalVar.PlsChkData,
                    data = dumd
                };
            }

            return Request.CreateResponse(HttpStatusCode.OK, rtnRst);


        }

        [HttpPost]
        [Route("NearByLocation")]
        public HttpResponseMessage NearByLocation([FromBody] Locations loc)
        {
            
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rslt = "FALSE"; RtnList rtnRst; DataTable dt = new DataTable();
            try
            {
                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
            hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
            
            dt = DataAccess.SLocationMaster(loc, "USER", conStr);
         
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
        [Route("DeleteDevice")]
        public HttpResponseMessage DeleteDevice([FromBody] DeleteDevice loc) //selected
        {

            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();

            rslt = "TRUE"; RtnData rtnRst; DataTable dt = new DataTable();
            SubZoneDetailsnn dumd = new SubZoneDetailsnn();
            dumd = null;
            try
            {
              

                loc.HospitalId = AesOperation.DecryptString(loc.HospitalId);
                hosID = loc.HospitalId.Split('_')[0]; conStr = loc.HospitalId.Split('_')[1];
                dt = DataAccess.DeleteDevicemaster(loc.IMEINo, conStr);

                rslt = dt.Rows[0]["result"].ToString().ToUpper() == "TRUE" ? "{\"status\": true,\"message\": \"Deleted successfully\",\"data\":{ \"Result\":\"" + rslt + "\"}}" : rslt.ToUpper() == "ALREADY EXISTS" ? "{\"status\": false,\"message\": \"Already exists\",\"data\":{}}" : "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}";
            }
            catch (Exception ex)
            {
                 rslt = "{\"status\": false,\"message\": \"Please check the data\",\"data\":{}}"; } return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.DeserializeObject(rslt));
        
           


        }
    }
}
