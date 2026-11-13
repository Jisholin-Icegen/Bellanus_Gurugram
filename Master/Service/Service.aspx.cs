using ClientsideEncryption;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

public partial class Service : System.Web.UI.Page
{
    public static string process { get; set; }
    protected void Page_Load(object sender, EventArgs e)
    {
        if (IsValidProtocol())
            FromWebMobile();
        else
            WriteInvalid();
    }

    public bool IsValidProtocol()
    {
        string ProtocolAllowed = ConfigurationManager.AppSettings["HTTP"].ToString(), RequestProtocol = (HttpContext.Current.Request.IsSecureConnection) ? "https" : "http";
        return true;// (ProtocolAllowed == RequestProtocol);
    }
    public void WriteInvalid()
    {

        DataTable table = generate(); DataRow row = table.NewRow(); row["RESULT"] = "Request Protocal is InValid"; table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);

        ResponseWrite(DS);
    }
    public DataSet GetEquipmentType()
    {
        string Search = string.IsNullOrEmpty(Request.QueryString["Search"]) ? string.Empty : Request.QueryString["Search"];
        string PageSize = string.IsNullOrEmpty(Request.QueryString["PageSize"]) ? "15" : Request.QueryString["PageSize"];
        string PageIndex = string.IsNullOrEmpty(Request.QueryString["PageIndex"]) ? "0" : Request.QueryString["PageIndex"];

        Search = AESEncrytDecry.DecryptStringAES(System.Web.HttpUtility.UrlDecode(Search));
        PageSize = AESEncrytDecry.DecryptStringAES(System.Web.HttpUtility.UrlDecode(PageSize));
        PageIndex = AESEncrytDecry.DecryptStringAES(System.Web.HttpUtility.UrlDecode(PageIndex));

        DataSet dt = DataAccess.GetRecordss("SP_GETEQUIPMENT_EQUANS", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize);
        return dt;
    }

    public DataSet GetDepartment()
    {
        string Search = string.IsNullOrEmpty(Request.QueryString["Search"]) ? string.Empty : Request.QueryString["Search"];
        string PageSize = string.IsNullOrEmpty(Request.QueryString["PageSize"]) ? "15" : Request.QueryString["PageSize"];
        string PageIndex = string.IsNullOrEmpty(Request.QueryString["PageIndex"]) ? "0" : Request.QueryString["PageIndex"];

        Search = AESEncrytDecry.DecryptStringAES(System.Web.HttpUtility.UrlDecode(Search));
        PageSize = AESEncrytDecry.DecryptStringAES(System.Web.HttpUtility.UrlDecode(PageSize));
        PageIndex = AESEncrytDecry.DecryptStringAES(System.Web.HttpUtility.UrlDecode(PageIndex));

        DataSet dt = DataAccess.GetRecordss("SP_GETDEPARTMENTS", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize);
        return dt;
    }

    private DataSet UpdateEquipment()
    {
        string name = DecryptQuery("NAME");
        string shortName = DecryptQuery("SHORT");
        string division = DecryptQuery("DIVISION");
        string isActive = DecryptQuery("ISACTIVE");
        string assistantRequired = DecryptQuery("ASSISTANTREQUIRED");
        string id = DecryptQuery("ID");

        DataSet ds = new DataSet();
        DataTable dt = DataAccess.UpdateEquipment(name, shortName, division, isActive, assistantRequired, id);
        ds.Tables.Add(dt);
        return ds;
    }

    protected void DeleteEquipment(string name)
    {
        Response.Clear();
        Response.ContentType = "application/json";

        try
        {
            string decryptedName = AESEncrytDecry.DecryptStringAES(System.Web.HttpUtility.UrlDecode(name ?? ""));

            System.Diagnostics.Debug.WriteLine("DELETE DEBUG - Decrypted Name: '" + decryptedName + "'");

            using (SqlConnection conn = new SqlConnection(Tenant.ConnectionString))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand("SP_EQUIPMENTDELETE_EQUANS", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Name", decryptedName);

                    object result = cmd.ExecuteScalar();
                    string resultStr = result != null ? result.ToString() : "FALSE";

                    System.Diagnostics.Debug.WriteLine("SP RESULT: '" + resultStr + "'");

                    var responseObj = new { result = resultStr };
                    string jsonResult = JsonConvert.SerializeObject(responseObj);
                    Response.Write(jsonResult);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("ERROR: " + ex.Message);
            var errorObj = new { result = "FALSE", error = ex.Message };
            Response.Write(JsonConvert.SerializeObject(errorObj));
        }
        Response.End();
    }

    private string DecryptQuery(string key)
    {
        string value = Request.QueryString[key];
        return !string.IsNullOrEmpty(value) ? AESEncrytDecry.DecryptStringAES(value) : string.Empty;
    }

    public void ResponseWrite(DataSet data)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer() { MaxJsonLength = int.MaxValue };
        List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
        Dictionary<string, object> row;

        foreach (DataTable table in data.Tables)
        {
            if (table.Rows.Count > 0)
            {
                foreach (DataRow dr in table.Rows)
                {
                    row = new Dictionary<string, object>();
                    foreach (DataColumn col in table.Columns)
                    {
                        row.Add(col.ColumnName, dr[col]);
                    }
                    rows.Add(row);
                }
            }
        }
        Response.Write(serializer.Serialize(rows));
    }
    private DataSet ChangePassword()
    {
        string password = ((!string.IsNullOrEmpty(Request.QueryString["PWD"])) ? Request.QueryString["PWD"].ToString() : ""),
               id = (string.IsNullOrEmpty(Request.QueryString["USERID"])) ? string.Empty : Request.QueryString["USERID"].ToString().ToUpper();
        bool result = (DataLayer.ChangePwd(id, password, "CHANGE").Rows[0]["RESULT"].ToString() == "TRUE");
        DataTable table = generate();
        DataRow row = table.NewRow();
        if (result)
            row["RESULT"] = "TRUE";
        else
            row["RESULT"] = "FALSE";
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
    public void FromWebMobile()
    {
        DataSet data = new DataSet();

        string process = Request.QueryString["Process"] ?? "";

        if (!string.IsNullOrEmpty(process) && IsEncryptedString(process))
            process = AESEncrytDecry.DecryptStringAES(process);

        switch (process)
        {
            case "UPLOADCATEGORYIMAGE":
                UploadCategoryImage();
                break;
            case "UPLOADPORTERIMAGE":
                UploadPorterImage();
                break;
            case "UPDATELOCATION":
                data = UpdateLocationss();
                break;
            case "GETFLOORNAME":
                data = GetFloor();
                break;
            case "GETDEVICE":
                data = GetDevice();
                break;
            case "GETSEARCHEDLOCATIONS":
                data = GetSearchedLocations();
                break;


            case "GETEQUIPMENT":
                data = GetEquipmentType();
                break;
            case "GETDEPARTMENT":
                data = GetDepartment();
                break;
            case "UPDATEDEPARTMENT":
                data = UpdateDepartment();
                break;
            case "UPDATEDEVICES":
                data = UpdateDevice();
                break;
            case "DELETEDEPARTMENT":
                data = DeleteDepartment();
                break;
            case "ChangePassword":
                HandleChangePassword();
                return;
            case "RESETPASSWORD":
                data = ResetPassword();
                break;
            case "GETUSERROLES":
                data = GetRoles();
                break;
            case "GETCATEGORYTYPES":
                data = GetCategoryTypes();
                break;
            case "GETROLESWEBUSER":
                data = GetRolesWebUser();
                break;
            case "DeleteEquipment":
                DeleteEquipment(Request["name"] ?? "");
                break;
            case "UPDATLOCATIONS":
                string encZoneName = Request.QueryString["ZoneName"] ?? "";
                string encShortName = Request.QueryString["ShortName"] ?? "";
                string encZone = Request.QueryString["Zone"] ?? "";
                string encDepartment = Request.QueryString["Department"] ?? "";
                string encAddress = Request.QueryString["Address"] ?? "";
                string encDivision = Request.QueryString["Division"] ?? "";
                string encDirectorate = Request.QueryString["Directorate"] ?? "";
                string encLicensed = Request.QueryString["Licensed"] ?? "";
                string encIsActive = Request.QueryString["IsActive"] ?? "";
                string encLogIdentifiers = Request.QueryString["LogIdentifiers"] ?? "";
                string encTurnaroundTime = Request.QueryString["TurnaroundTime"] ?? "";
                string encSkillRequiredSome = Request.QueryString["SkillRequiredSome"] ?? "";
                string encSkillRequiredAll = Request.QueryString["SkillRequiredAll"] ?? "";

                DataSet updateData = UpdateLocations(encZoneName, encShortName, encZone, encDepartment, encAddress,
                    encDivision, encDirectorate, encLicensed, encIsActive, encLogIdentifiers,
                    encTurnaroundTime, encSkillRequiredSome, encSkillRequiredAll);
                Console.WriteLine("UpdateData Tables: " + updateData.Tables.Count);
                if (updateData.Tables.Count > 0 && updateData.Tables[0].Rows.Count > 0)
                    Console.WriteLine("SP Result: " + updateData.Tables[0].Rows[0][0]);
                string updateResult = "FALSE";
                if (updateData.Tables.Count > 0 && updateData.Tables[0].Rows.Count > 0)
                    updateResult = updateData.Tables[0].Rows[0][0].ToString().ToUpper() == "TRUE" ? "TRUE" : "FALSE";
                var updateResponseObj = new { result = updateResult };
                string updateJsonResult = JsonConvert.SerializeObject(updateResponseObj);
                Response.ContentType = "application/json";
                Response.Write(updateJsonResult);
                Response.End();
                break;

            case "GETZONEDEPARTMENT":
                DataSet zoneData = GetZoneDepartment();

                var zones = new List<object>();
                var departments = new List<object>();

                if (zoneData.Tables.Count > 0)
                {
                    foreach (DataRow zoneRow in zoneData.Tables[0].Rows)
                    {
                        zones.Add(new
                        {
                            id = zoneRow["ZONEID"].ToString(),
                            name = zoneRow["ZONENAME"].ToString()
                        });
                    }
                }

                if (zoneData.Tables.Count > 1)
                {
                    foreach (DataRow deptRow in zoneData.Tables[1].Rows)
                    {
                        departments.Add(new
                        {
                            id = deptRow["DEPARTMENTID"].ToString(),
                            name = deptRow["DEPARTMENTNAME"].ToString()
                        });
                    }
                }

                var zoneResponse = new { zones = zones, departments = departments };
                string zoneJsonResult = JsonConvert.SerializeObject(zoneResponse);

                Response.ContentType = "application/json";
                Response.Write(zoneJsonResult);
                Response.End();
                break;

            case "GETZONE":
                DataSet zoneData1 = GetZoneDepartment("GETZONE");

                var zones1 = new List<object>();
                var departments1 = new List<object>();

                if (zoneData1.Tables.Count > 0)
                {
                    foreach (DataRow zoneRow in zoneData1.Tables[0].Rows)
                    {
                        zones1.Add(new
                        {
                            id = zoneRow["ZONEID"].ToString(),
                            name = zoneRow["ZONENAME"].ToString()
                        });
                    }
                }

                if (zoneData1.Tables.Count > 1)
                {
                    foreach (DataRow deptRow in zoneData1.Tables[1].Rows)
                    {
                        departments1.Add(new
                        {
                            id = deptRow["DEPARTMENTID"].ToString(),
                            name = deptRow["DEPARTMENTNAME"].ToString()
                        });
                    }
                }

                var zoneResponse1 = new { zones = zones1, departments = departments1 };
                string zoneJsonResult1 = JsonConvert.SerializeObject(zoneResponse1);

                Response.ContentType = "application/json";
                Response.Write(zoneJsonResult1);
                Response.End();
                break;

            case "DELETELOCATION":
                string deleteEncZoneName = Request.QueryString["ZoneName"] ?? "";

                DataSet deleteDataset = DeleteLocation(deleteEncZoneName);

                string deleteResultUnique = "FALSE";
                if (deleteDataset.Tables.Count > 0 && deleteDataset.Tables[0].Rows.Count > 0)
                    deleteResultUnique = deleteDataset.Tables[0].Rows[0][0].ToString().ToUpper() == "TRUE" ? "TRUE" : "FALSE";

                var deleteResponseUnique = new { result = deleteResultUnique };
                string deleteJsonUnique = JsonConvert.SerializeObject(deleteResponseUnique);

                Response.ContentType = "application/json";
                Response.Write(deleteJsonUnique);
                Response.End();
                break;

            case "UPDATEEQUIPMENT":
                {
                    DataSet dsUpdate = UpdateEquipment();

                    string resultUpdate = "FALSE";
                    if (dsUpdate.Tables.Count > 0 && dsUpdate.Tables[0].Rows.Count > 0)
                        resultUpdate = dsUpdate.Tables[0].Rows[0][0].ToString().ToUpper() == "TRUE" ? "TRUE" : "FALSE";

                    var responseObjUpdate = new { result = resultUpdate };
                    string jsonResultUpdate = JsonConvert.SerializeObject(responseObjUpdate);

                    Response.ContentType = "application/json";
                    Response.Write(jsonResultUpdate);
                    Response.End();
                }
                break;

            case "UPDATEROLE":
                data = UpdateRoleValus();
                break;

            case "SETROLE":
                data = setRoleValus();
                break;

            case "UPDATEUSER":
                DataSet ds = UpdateUser();

                string result = "FALSE";
                if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    result = ds.Tables[0].Rows[0][0].ToString().ToUpper() == "TRUE" ? "TRUE" : "FALSE";

                var responseObj = new { result = result };
                string jsonResult = JsonConvert.SerializeObject(responseObj);

                Response.ContentType = "application/json";
                Response.Write(jsonResult);
                Response.End();

                break;

            case "DELETEUSER":
                string encUsername = Request.QueryString["USERNAME"] ?? "";
                string encId = Request.QueryString["ID"] ?? "";

                string username = "";
                string id = "";

                if (!string.IsNullOrEmpty(encUsername))
                    username = AESEncrytDecry.DecryptStringAES(encUsername);

                if (!string.IsNullOrEmpty(encId))
                    id = AESEncrytDecry.DecryptStringAES(encId);

                DataTable dt = DataAccess.DeleteUser(username, id);

                string deleteResult = "FALSE";

                if (dt != null && dt.Rows.Count > 0 && dt.Rows[0][0] != null && dt.Rows[0][0] != DBNull.Value)
                {
                    deleteResult = dt.Rows[0][0].ToString().ToUpper() == "TRUE" ? "TRUE" : "FALSE";
                }

                Response.Write(JsonConvert.SerializeObject(new { result = deleteResult }));
                Response.End();
                break;

            case "GETFLOORS":
                data = GetFloors();
                break;
            case "GETDEVICEDETAIL":
                data = GetDeviceDetail();
                break;
            case "GETFLOORSLOCATION":
                data = GetFloorsLocations();
                break;
            case "GETFLOORANDKITCHEN":
                data = GetFloorsandKitchens();
                break;
            case "GETSEARCHEDLOCATION":
                data = GetSearchedLocation();
                break;
            case "LOCATIONGROUP":
                data = LocationGroup();
                break;
            case "GETSEARCHEDLOCATIONGM":
                data = GetSearchedLocationGM();
                break;

            case "UPDATECATEGORY":
                data = SetCategories();
                break;
            case "GETCATEGORY":
                data = GetCategories();
                break;

            case "GETPORTERS":
                data = GetPorters();
                break;

            case "GETPERFORMLOGS":
                data = GetPerformLogs();
                break;

            case "GETUSERS":
                data = GetUsers();
                break;

            case "GETUSER":
                data = GetUser();
                break;

            case "GETUSERSEQUANS":
                data = GetUsersEquans();
                break;

            case "GETCATEGORYS":
                data = GetCategory();
                break;

            case "GETUSERSP":
                data = GetUsersp();
                break;

            case "GETLOCATIONS":
                data = GetLocations();
                break;

            case "UPDATEPORTER":
                data = updatePorters();
                break;

            case "UPDATETASKTYPE":
                data = updatETasktype();
                break;

            case "GETPAGESBYROLE":
                data = GetPageByRole();
                break;
            case "SAVEROLE":
                data = SaveRole();
                break;
            case "DELETEROLE":
                data = DeleteRole();
                break;
            case "PORTERMAPPING":
                data = Mapping();
                break;
            case "UPDATEMAILSETTING":
                data = MailSettings();
                break;
            case "PRESET":
                data = PresetOperations();
                break;
            case "DEPARTMENT":
                data = departmentOperation();
                break;
            case "GETDEPTLOCATION":
                data = GetDeptLocation();
                break;
            case "GETDEPTUSER":
                data = GetDeptUser();
                break;
            case "GETDEPTPORTER":
                data = GetDeptPorters();
                break;
            case "UPDATEDEPT":
                data = UpdateDept();
                break;
            case "REMOVELOCATION":
                data = RemoveDept();
                break;
            case "GETDEPTDETAILS":
                data = GetDeptDetails();
                break;
            case "LOGOUT":
                data = LogOut();
                break;
            case "REQUESTGROUP":
                data = RequestGroupOperation();
                break;

            case "GETRGDETAILS":
                data = GetRGDetails();
                break;

            case "UPDATERG":
                data = UpdateRG();
                break;

            case "DELETERG":
                data = RemoveRG();
                break;

            case "SEARCHRG":
                data = SearchRG();
                break;

            case "CHANGEPWD":
                data = ChangePassword();
                break;
            case "GETPORTERLIST":
                data = GetPorterList();
                break;
            case "UPDATESCHBREAK":
                data = UpdateSchBreak();
                break;

            case "INSERTSCHBREAK":
                data = InsertSchBreak();
                break;
            case "GETPORTERBREAKS":
                data = GetPorterBreaks();
                break;

            case "GETPORTERNAME":
                data = SearchPorterName();
                break;



        }
        //data = getRecords();
        JavaScriptSerializer serializer = new JavaScriptSerializer() { MaxJsonLength = int.MaxValue };
        List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
        Dictionary<string, object> row;

        foreach (DataTable table in data.Tables)
        {
            if (table.Rows.Count > 0)
            {
                foreach (DataRow dr in table.Rows)
                {
                    row = new Dictionary<string, object>();
                    foreach (DataColumn col in table.Columns)
                    {
                        row.Add(col.ColumnName, dr[col]);
                    }
                    rows.Add(row);
                }
            }
        }
        Response.Write(serializer.Serialize(rows));
    }
    private DataSet GetSearchedLocations()
    {
        var sb = new StringBuilder();

        string Location = "", CurIds = "";

        if (!string.IsNullOrEmpty(Request.QueryString["LOCATION"]))
            Location = DecryptAES(Request.QueryString["LOCATION"]).ToUpper();

        if (!string.IsNullOrEmpty(Request.QueryString["CURIDS"]))
            CurIds = DecryptAES(Request.QueryString["CURIDS"]).ToUpper();

        HtmlTable Tmptable = new HtmlTable() { Width = "90%" };
        Tmptable.Attributes.Add("style", "margin-left:10%;");
        Tmptable.Attributes.Add("class", "ZoneLocation");

        HtmlGenericControl ul = new HtmlGenericControl("ul");
        ul.Attributes.Add("class", "LocationList");

        if (!string.IsNullOrEmpty(Location))
        {
            DataTable DtSearchedLocations = DataAccess.GetRecords("SP_SEARCHLOCATION", "@LOCATION", Location, "@CURIDS", CurIds);

            foreach (DataRow dr in DtSearchedLocations.Rows)
            {
                HtmlGenericControl li = new HtmlGenericControl("li")
                {
                    ID = "LMLoc-" + dr["Id"].ToString(),
                    ClientIDMode = ClientIDMode.Static
                };

                HtmlImage img = new HtmlImage() { Src = "../images/location.png", Width = 30 };
                img.Attributes.Add("style", "padding-right:15px;");

                HtmlGenericControl span = new HtmlGenericControl("span")
                {
                    InnerHtml = dr["ZONENAME"].ToString().Trim().ToUpper()
                };

                li.Controls.Add(img);
                li.Controls.Add(span);
                li.Attributes.Add(
                    "onclick",
                    string.Format("BindLocation('{0}', '{1}', '{2}')",
                        dr["Id"],
                        dr["ZONENAME"].ToString().Trim().ToUpper(),
                        dr["HAYWOOD"].ToString().Trim().ToUpper()
                    )
                );
                ul.Controls.Add(li);
            }
        }

        ul.RenderControl(new HtmlTextWriter(new StringWriter(sb)));

        DataTable table = generate();
        DataRow row = table.NewRow();
        row["RESULT"] = sb.ToString();
        table.Rows.Add(row);

        DataSet DS = new DataSet();
        DS.Tables.Add(table);
        return DS;
    }
    private void UploadPorterImage()
    {
        string imageName = "Default.png";
        HttpPostedFile file = Request.Files["IMAGEFILE"];

        if (file != null && file.ContentLength > 0)
        {
            string ext = Path.GetExtension(file.FileName).ToLower();
            if (ext == ".png" || ext == ".jpg" || ext == ".jpeg")
            {
                string folderPath = Server.MapPath("~/Master/Images/");
                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                string baseName = Path.GetFileNameWithoutExtension(file.FileName);
                string extension = Path.GetExtension(file.FileName);
                string finalName = baseName + extension;

                int i = 1;
                while (File.Exists(Path.Combine(folderPath, finalName)))
                {
                    finalName = baseName + "(" + i + ")" + extension;
                    i++;
                }

                file.SaveAs(Path.Combine(folderPath, finalName));
                imageName = finalName;
            }
        }

        Response.Clear();
        Response.ContentType = "application/json";
        Response.Write("[{\"IMAGE\":\"" + imageName + "\"}]");
        Response.End();
    }



    private void UploadCategoryImage()
    {
        string imageName = "Default.png";
        HttpPostedFile file = Request.Files["IMAGEFILE"];

        if (file != null && file.ContentLength > 0)
        {
            string ext = Path.GetExtension(file.FileName).ToLower();
            if (ext == ".png" || ext == ".jpg" || ext == ".jpeg")
            {
                string folderPath = Server.MapPath("~/Master/Images/Category/");
                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                string baseName = Path.GetFileNameWithoutExtension(file.FileName);
                string extension = Path.GetExtension(file.FileName);
                string finalName = baseName + extension;

                int i = 1;
                while (File.Exists(Path.Combine(folderPath, finalName)))
                {
                    finalName = baseName + "(" + i + ")" + extension;
                    i++;
                }

                file.SaveAs(Path.Combine(folderPath, finalName));
                imageName = finalName;
            }
        }

        Response.Clear();
        Response.ContentType = "application/json";
        Response.Write("[{\"IMAGE\":\"" + imageName + "\"}]");
        Response.End();
    }

    private DataSet UpdateLocationss()
    {

        string zonename = ((!string.IsNullOrEmpty(Request.QueryString["ZONENAME"])) ? Request.QueryString["ZONENAME"].ToString() : ""),
            macid = ((!string.IsNullOrEmpty(Request.QueryString["MACID"])) ? Request.QueryString["MACID"].ToString() : ""),
            apname = ((!string.IsNullOrEmpty(Request.QueryString["APNAME"])) ? Request.QueryString["APNAME"].ToString() : ""),
            floorid = ((!string.IsNullOrEmpty(Request.QueryString["FLOORID"])) ? Request.QueryString["FLOORID"].ToString() : ""),
            CATERGROUPID = ((!string.IsNullOrEmpty(Request.QueryString["CATERGROUPID"])) ? Request.QueryString["CATERGROUPID"].ToString() : ""),
            isactive = ((!string.IsNullOrEmpty(Request.QueryString["ISACTIVE"])) ? Request.QueryString["ISACTIVE"].ToString() : ""),
            ismultiporter = ((!string.IsNullOrEmpty(Request.QueryString["ISMULTIPORTER"])) ? Request.QueryString["ISMULTIPORTER"].ToString() : ""),
            action = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString() : ""),
            nearby = ((!string.IsNullOrEmpty(Request.QueryString["NEARBY"])) ? Request.QueryString["NEARBY"].ToString() : ""),
            Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString() : ""),
            //ISPORTERINGLOCATION, ISCATERINGLOCATION, ISCLEANINGLOCATION, ISSECURITYLOCATION, ISFEEDBACKLOCATION
            IsPorterLocation = ((!string.IsNullOrEmpty(Request.QueryString["ISPORTERINGLOCATION"])) ? Request.QueryString["ISPORTERINGLOCATION"].ToString() : ""),
            IsCateringLocation = ((!string.IsNullOrEmpty(Request.QueryString["ISCATERINGLOCATION"])) ? Request.QueryString["ISCATERINGLOCATION"].ToString() : ""),
            IsCleaningLocation = ((!string.IsNullOrEmpty(Request.QueryString["ISCLEANINGLOCATION"])) ? Request.QueryString["ISCLEANINGLOCATION"].ToString() : ""),
            IsSecurityLocaiton = ((!string.IsNullOrEmpty(Request.QueryString["ISSECURITYLOCATION"])) ? Request.QueryString["ISSECURITYLOCATION"].ToString() : ""),
            IsFeedbackLocation = ((!string.IsNullOrEmpty(Request.QueryString["ISFEEDBACKLOCATION"])) ? Request.QueryString["ISFEEDBACKLOCATION"].ToString() : ""),
            Device = ((!string.IsNullOrEmpty(Request.QueryString["DEVICE"])) ? Request.QueryString["DEVICE"].ToString() : ""),
            ShortName = ((!string.IsNullOrEmpty(Request.QueryString["SHORTNAME"])) ? Request.QueryString["SHORTNAME"].ToString() : ""),


            Tag = ((!string.IsNullOrEmpty(Request.QueryString["TAG"])) ? Request.QueryString["TAG"].ToString() : "");

        zonename = AESEncrytDecry.DecryptStringAES(zonename); macid = AESEncrytDecry.DecryptStringAES(macid); apname = AESEncrytDecry.DecryptStringAES(apname); floorid = AESEncrytDecry.DecryptStringAES(floorid);
        isactive = AESEncrytDecry.DecryptStringAES(isactive); ismultiporter = AESEncrytDecry.DecryptStringAES(ismultiporter); action = AESEncrytDecry.DecryptStringAES(action); nearby = AESEncrytDecry.DecryptStringAES(nearby);
        Id = AESEncrytDecry.DecryptStringAES(Id); IsPorterLocation = AESEncrytDecry.DecryptStringAES(IsPorterLocation); IsCateringLocation = AESEncrytDecry.DecryptStringAES(IsCateringLocation);
        IsCleaningLocation = AESEncrytDecry.DecryptStringAES(IsCleaningLocation); IsSecurityLocaiton = AESEncrytDecry.DecryptStringAES(IsSecurityLocaiton); IsFeedbackLocation = AESEncrytDecry.DecryptStringAES(IsFeedbackLocation);
        Tag = AESEncrytDecry.DecryptStringAES(Tag); CATERGROUPID = AESEncrytDecry.DecryptStringAES(CATERGROUPID);
        Device = AESEncrytDecry.DecryptStringAES(Device);
        ShortName = AESEncrytDecry.DecryptStringAES(ShortName);


        DataTable table = generate();
        DataRow row = table.NewRow();
        string Result = DataAccess.UpdateLocations(zonename, macid, apname, floorid, isactive, ismultiporter, action, nearby, Id, Tag, IsPorterLocation, IsCateringLocation, IsCleaningLocation, IsSecurityLocaiton, IsFeedbackLocation, CATERGROUPID, Device, ShortName).Rows[0]["RESULT"].ToString();
        row["RESULT"] = Result;
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
    private DataSet GetFloor()
    {
        DataTable table = new DataTable();
        table = DataAccess.getRecords("SP_GetFloorname").Tables[0].Copy();
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    } 
  private DataSet GetDevice()
    {
        DataTable table = new DataTable();
        table = DataAccess.getRecords("SP_GetDeviceNo").Tables[0].Copy();
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }

    private bool IsEncryptedString(string str)
    {
        return !string.IsNullOrEmpty(str) && (str.Contains("=") || str.Length % 4 == 0);
    }
    private void HandleChangePassword()
    {
        bool result = false;
        string error = null;

        try
        {
            string body;
            using (StreamReader reader = new StreamReader(Request.InputStream))
            {
                body = reader.ReadToEnd();
            }

            Dictionary<string, string> data =
                JsonConvert.DeserializeObject<Dictionary<string, string>>(body);

            string userId;
            string pwd;

            if (!data.TryGetValue("USERID", out userId) || string.IsNullOrEmpty(userId) ||
                !data.TryGetValue("PWD", out pwd) || string.IsNullOrEmpty(pwd))
            {
                error = "Missing USERID or PWD";
            }
            else
            {
                userId = AESEncrytDecry.DecryptStringAES(userId);
                pwd = AESEncrytDecry.DecryptStringAES(pwd);

                string connString =
                    Tenant.ConnectionString;

                using (SqlConnection conn = new SqlConnection(connString))
                using (SqlCommand cmd = new SqlCommand("dbo.SP_CHANGEPWD", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@USERID", userId);
                    cmd.Parameters.AddWithValue("@PASSWORD", pwd);
                    cmd.Parameters.AddWithValue("@PROCESS", "CHANGE");

                    conn.Open();

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            string spResult = reader["RESULT"].ToString();
                            result = string.Equals(spResult, "TRUE",
                                                   StringComparison.OrdinalIgnoreCase);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            error = ex.Message;
            result = false;
        }

        RespondWithJson(new
        {
            success = result,
            data = new
            {
                RESULT = result ? "TRUE" : "FALSE",
                ERROR = error
            }
        });
    }

    private void RespondWithJson(object responseObject)
    {
        var response = HttpContext.Current.Response;
        response.Clear();
        response.ContentType = "application/json";
        response.Write(JsonConvert.SerializeObject(responseObject));
        // NO Response.End()
    }

    private DataSet UpdateLocations(string encZoneName, string encShortName, string encZone,
        string encDepartment, string encAddress, string encDivision, string encDirectorate,
        string encLicensed, string encIsActive, string encLogIdentifiers, string encTurnaroundTime,
        string encSkillRequiredSome, string encSkillRequiredAll)
    {
        try
        {
            string zoneName = AESEncrytDecry.DecryptStringAES(encZoneName);
            string shortName = AESEncrytDecry.DecryptStringAES(encShortName);
            string zone = AESEncrytDecry.DecryptStringAES(encZone);
            string department = AESEncrytDecry.DecryptStringAES(encDepartment);
            string address = AESEncrytDecry.DecryptStringAES(encAddress);
            string division = AESEncrytDecry.DecryptStringAES(encDivision);
            string directorate = AESEncrytDecry.DecryptStringAES(encDirectorate);

            int licensed = 0;
            int.TryParse(AESEncrytDecry.DecryptStringAES(encLicensed), out licensed);
            int isActive = 0;
            int.TryParse(AESEncrytDecry.DecryptStringAES(encIsActive), out isActive);

            string logIdentifiers = AESEncrytDecry.DecryptStringAES(encLogIdentifiers);
            string turnaroundTime = AESEncrytDecry.DecryptStringAES(encTurnaroundTime);
            string skillRequiredSome = AESEncrytDecry.DecryptStringAES(encSkillRequiredSome);
            string skillRequiredAll = AESEncrytDecry.DecryptStringAES(encSkillRequiredAll);

            string connectionString = Tenant.ConnectionString;

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("dbo.SP_LOCATIONINSERTUPDATE_EQUANS", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@ZoneName", zoneName);
                cmd.Parameters.AddWithValue("@ShortName", shortName);
                cmd.Parameters.AddWithValue("@Zone", zone);
                cmd.Parameters.AddWithValue("@Department", department);
                cmd.Parameters.AddWithValue("@Address", address);
                cmd.Parameters.AddWithValue("@Division", division);
                cmd.Parameters.AddWithValue("@Directorate", directorate);
                cmd.Parameters.AddWithValue("@Licensed", licensed);
                cmd.Parameters.AddWithValue("@IsActive", isActive);
                cmd.Parameters.AddWithValue("@LogIdentifiers", logIdentifiers);
                cmd.Parameters.AddWithValue("@TurnaroundTime", turnaroundTime);
                cmd.Parameters.AddWithValue("@SkillRequiredSome", skillRequiredSome);
                cmd.Parameters.AddWithValue("@SkillRequiredAll", skillRequiredAll);

                conn.Open();

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    DataSet ds = new DataSet();
                    da.Fill(ds);

                    if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                        return ds;
                }
            }

            return CreateSuccessDataset();
        }
        catch (Exception ex)
        {
            Console.WriteLine("UpdateLocations ERROR: " + ex.Message);
            return CreateErrorDataset();
        }
    }

    private DataSet CreateSuccessDataset()
    {
        DataTable dt = new DataTable();
        dt.Columns.Add("Result");
        DataRow row = dt.NewRow();
        row["Result"] = "TRUE";
        dt.Rows.Add(row);
        DataSet ds = new DataSet();
        ds.Tables.Add(dt);
        return ds;
    }

    private DataSet CreateErrorDataset()
    {
        DataTable dt = new DataTable();
        dt.Columns.Add("Result");
        DataRow row = dt.NewRow();
        row["Result"] = "FALSE";
        dt.Rows.Add(row);
        DataSet ds = new DataSet();
        ds.Tables.Add(dt);
        return ds;
    }
    private static string DecryptParam(Dictionary<string, object> data, string key)
    {
        if (!data.ContainsKey(key) || data[key] == null)
            return "";

        string encryptedValue = data[key].ToString();
        if (string.IsNullOrEmpty(encryptedValue))
            return "";

        string urlDecoded = System.Web.HttpUtility.UrlDecode(encryptedValue);

        return AESEncrytDecry.DecryptStringAES(urlDecoded);
    }

    private DataSet DeleteLocation(string encZoneName)
    {
        try
        {
            string decryptedZoneName = AESEncrytDecry.DecryptStringAES(encZoneName);

            string connectionString = Tenant.ConnectionString;

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("SP_LOCATIONDELETE_EQUANS", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ZoneName", decryptedZoneName);

                conn.Open();

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    DataSet ds = new DataSet();
                    da.Fill(ds);

                    if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                        return ds;
                }
            }

            return CreateErrorDataset();
        }
        catch (Exception ex)
        {
            Console.WriteLine("DeleteLocation ERROR: " + ex.Message);
            return CreateErrorDataset();
        }
    }

    private DataSet UpdateDepartment()
    {
        string name = AESEncrytDecry.DecryptStringAES(Request.QueryString["NAME"] ?? "");
        string description = AESEncrytDecry.DecryptStringAES(Request.QueryString["DESCRIPTION"] ?? "");
        string isActive = AESEncrytDecry.DecryptStringAES(Request.QueryString["ISACTIVE"] ?? "");
        string id = AESEncrytDecry.DecryptStringAES(Request.QueryString["ID"] ?? "");
        string action = AESEncrytDecry.DecryptStringAES(Request.QueryString["ACTION"] ?? "");
        string parentDepartmentId = AESEncrytDecry.DecryptStringAES(Request.QueryString["PARENTDEPARTMENTID"] ?? ""); 

        DataSet ds = new DataSet();

        DataTable dt = DataAccess.UpdateDepartment(name, description, isActive, id, action, parentDepartmentId);

        if (dt.Rows.Count == 0)
        {
            dt.Columns.Add("RESULT");
            DataRow newRow = dt.NewRow();
            newRow["RESULT"] = "TRUE";
            dt.Rows.Add(newRow);
        }

        ds.Tables.Add(dt.Copy());
        return ds;
    }

    private DataSet DeleteDepartment()
    {
        string id = AESEncrytDecry.DecryptStringAES(Request.QueryString["ID"] ?? "");

        DataSet ds = new DataSet();
        DataTable dt = DataAccess.DeleteDepartment(id);

        if (dt.Rows.Count == 0)
        {
            dt.Columns.Add("RESULT");
            DataRow newRow = dt.NewRow();
            newRow["RESULT"] = "TRUE";
            dt.Rows.Add(newRow);
        }

        ds.Tables.Add(dt.Copy());
        return ds;
    }

    private DataSet UpdateDevice()
    {

        string DEVICENO = ((!string.IsNullOrEmpty(Request.QueryString["DEVICENO"])) ? Request.QueryString["DEVICENO"].ToString() : ""),

            action = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString() : ""),

            Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString() : "");


        DEVICENO = AESEncrytDecry.DecryptStringAES(DEVICENO); action = AESEncrytDecry.DecryptStringAES(action);
        Id = AESEncrytDecry.DecryptStringAES(Id);


        DataTable table = generate();
        DataRow row = table.NewRow();
        string Result = DataAccess.UpdateDevice(DEVICENO, action, Id).Rows[0]["RESULT"].ToString();
        row["RESULT"] = Result;
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }

    private DataSet GetCategoryTypes()
    {
        string departmentId = AESEncrytDecry.DecryptStringAES(Request.QueryString["DepartmentId"] ?? "0");

        DataSet ds = DataAccess.GetCategoryTypes(departmentId);

        if (ds.Tables.Count == 0)
        {
            ds.Tables.Add(new DataTable());
        }

        if (ds.Tables[0].Rows.Count == 0)
        {
            ds.Tables[0].Columns.Add("RESULT");
            DataRow newRow = ds.Tables[0].NewRow();
            newRow["RESULT"] = "TRUE";
            ds.Tables[0].Rows.Add(newRow);
        }

        return ds;
    }

    public DataSet GetFloors()
    {
        DataSet dt = DataAccess.GetFloors();
        return dt;
    }

    public DataSet GetDeviceDetail()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["Search"])) ? string.Empty : Request.QueryString["Search"].ToString(),
            ServiceID = (string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? string.Empty : Request.QueryString["SERVICEID"].ToString(),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString() : "15"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString() : "1"),
             AppType = ((!string.IsNullOrEmpty(Request.QueryString["APPTYPE"])) ? Request.QueryString["APPTYPE"].ToString() : "1");
        Search = AESEncrytDecry.DecryptStringAES(Search); PageIndex = AESEncrytDecry.DecryptStringAES(PageIndex); PageSize = AESEncrytDecry.DecryptStringAES(PageSize);
        ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID); AppType = AESEncrytDecry.DecryptStringAES(AppType);

        DataSet dt = DataAccess.GetRecordss("SP_GETDEVICE", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize, "@APPTYPE", AppType);
        return dt;

    }

    private DataSet UpdateUser()
    {
        string username = AESEncrytDecry.DecryptStringAES(Request.QueryString["USERNAME"] ?? "");
        string mid = AESEncrytDecry.DecryptStringAES(Request.QueryString["MID"] ?? "");
        string role = AESEncrytDecry.DecryptStringAES(Request.QueryString["ROLENAME"] ?? "");
        string isActive = AESEncrytDecry.DecryptStringAES(Request.QueryString["ISACTIVE"] ?? "1");
        string email = AESEncrytDecry.DecryptStringAES(Request.QueryString["EMAIL"] ?? "");
        string id = AESEncrytDecry.DecryptStringAES(Request.QueryString["ID"] ?? "");
        string shortName = AESEncrytDecry.DecryptStringAES(Request.QueryString["SHORT"] ?? "");
        string division = AESEncrytDecry.DecryptStringAES(Request.QueryString["DIVISION"] ?? "");
        string shift = AESEncrytDecry.DecryptStringAES(Request.QueryString["SHIFT"] ?? "");
        string device = AESEncrytDecry.DecryptStringAES(Request.QueryString["DEVICE"] ?? "");
        string nurseLocationId = AESEncrytDecry.DecryptStringAES(Request.QueryString["NURSELOCATIONID"] ?? "");
        string departmentIds = AESEncrytDecry.DecryptStringAES(Request.QueryString["DEPARTMENTIDS"] ?? "");

        string action = string.IsNullOrEmpty(id) ? "INSERT" : "UPDATE";

        DataSet ds = new DataSet();

        DataTable dt = DataAccess.UpdateUser(username, mid, role, isActive, email, id,
                                             division, shift, device, shortName, nurseLocationId, departmentIds);

        if (dt.Rows.Count == 0)
        {
            dt.Columns.Add("RESULT");
            DataRow newRow = dt.NewRow();
            newRow["RESULT"] = "TRUE";
            dt.Rows.Add(newRow);
        }

        ds.Tables.Add(dt.Copy());
        return ds;
    }

    private DataSet DeleteUser()
    {
        try
        {
            string encUsername = Request.QueryString["USERNAME"] ?? "";
            string encId = Request.QueryString["ID"] ?? "";

            string username = AESEncrytDecry.DecryptStringAES(encUsername);
            string id = AESEncrytDecry.DecryptStringAES(encId);

            DataSet ds = new DataSet();

            DataTable dt = DataAccess.DeleteUser(username, id);

            if (dt.Rows.Count == 0)
            {
                dt.Columns.Add("Result");
                DataRow newRow = dt.NewRow();
                newRow["Result"] = "FALSE";
                dt.Rows.Add(newRow);
            }

            ds.Tables.Add(dt);
            return ds;
        }
        catch (Exception ex)
        {
            DataTable errorDt = new DataTable();
            errorDt.Columns.Add("Result");
            DataRow errorRow = errorDt.NewRow();
            errorRow["Result"] = "FALSE";
            errorDt.Rows.Add(errorRow);

            DataSet ds = new DataSet();
            ds.Tables.Add(errorDt);
            return ds;
        }
    }

    private DataSet GetZoneDepartment(string process)
    {
        try
        {
            string connectionString = Tenant.ConnectionString;
            DataSet ds = new DataSet();

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("SP_GETZONEDEPARTMENT", conn))
            {
                cmd.Parameters.AddWithValue("@process", process ?? "");
                cmd.CommandType = CommandType.StoredProcedure;
                conn.Open();

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(ds);
                }
            }

            return ds;
        }
        catch (Exception ex)
        {
            DataTable errorDt = new DataTable();
            errorDt.Columns.Add("Result");
            DataRow errorRow = errorDt.NewRow();
            errorRow["Result"] = "FALSE";
            errorDt.Rows.Add(errorRow);

            DataSet errorDS = new DataSet();
            errorDS.Tables.Add(errorDt);
            return errorDS;
        }
    }

    private DataSet GetZoneDepartment()
    {
        try
        {
            string connectionString = Tenant.ConnectionString;
            DataSet ds = new DataSet();

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("SP_GETZONEDEPARTMENT", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                conn.Open();

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(ds);
                }
            }

            return ds;
        }
        catch (Exception ex)
        {
            DataTable errorDt = new DataTable();
            errorDt.Columns.Add("Result");
            DataRow errorRow = errorDt.NewRow();
            errorRow["Result"] = "FALSE";
            errorDt.Rows.Add(errorRow);

            DataSet errorDS = new DataSet();
            errorDS.Tables.Add(errorDt);
            return errorDS;
        }
    }

    private DataSet SearchPorterName()
    {
        var sb = new StringBuilder();
        string PorterName = ((!string.IsNullOrEmpty(Request.QueryString["PORTERNAME"])) ? Request.QueryString["PORTERNAME"].ToString() : ""),
            ServiceID = ((string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? string.Empty : Request.QueryString["SERVICEID"].ToString());

        HtmlTable Tmptable = new HtmlTable() { Width = "90%" }; Tmptable.Attributes.Add("style", "margin-left:10%;"); Tmptable.Attributes.Add("class", "ZoneLocation");


        HtmlGenericControl ul = new HtmlGenericControl("ul"); ul.Attributes.Add("class", "LocationList");


        if (!string.IsNullOrEmpty(PorterName))
        {
            PorterName = AESEncrytDecry.DecryptStringAES(PorterName); ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID);
            DataTable DtSearchedLocations = DataAccess.GetRecords("SP_SEARCHPORTER", "@PORTERNAME", PorterName, "@SERVICEID", ServiceID);
            foreach (DataRow dr in DtSearchedLocations.Rows)
            {
                HtmlGenericControl li = new HtmlGenericControl("li") { ID = "Loc-" + dr["Id"].ToString(), ClientIDMode = ClientIDMode.Static };
                HtmlImage img = new HtmlImage() { Src = "../images/location.png", Width = 30 }; img.Attributes.Add("style", "padding-right:15px;");
                HtmlGenericControl span = new HtmlGenericControl("span") { InnerHtml = dr["USERNAME"].ToString().Trim().ToUpper() };
                li.Controls.Add(img); li.Controls.Add(span);
                li.Attributes.Add("onclick", "BindPorter('" + dr["Id"] + "','" + dr["USERNAME"].ToString().Trim().ToUpper() + "','" + dr["SERVICE_ID"].ToString().Trim().ToUpper() + "')");
                ul.Controls.Add(li);
            }

        }
        ul.RenderControl(new HtmlTextWriter(new StringWriter(sb)));
        DataTable table = generate();
        DataRow row = table.NewRow();
        row["RESULT"] = sb.ToString();
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
    public DataSet GetPorterBreaks()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["Search"])) ? string.Empty : Request.QueryString["Search"].ToString().ToUpper(),
               ServiceID = ((string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? string.Empty : Request.QueryString["SERVICEID"].ToString()),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString().ToUpper() : "15"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString().ToUpper() : "1");
        ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID);
        DataSet dt = DataAccess.GetRecordss("SP_GETPORTERBREAKS", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize, "@SERVICEID", ServiceID);
        return dt;

    }
    public DataSet GetPorterList()
    {
        DataSet ds = new DataSet();
        string search = ((!string.IsNullOrEmpty(Request.QueryString["SEARCH"])) ? Request.QueryString["SEARCH"].ToString() : "");

        //   search = AESEncrytDecry.DecryptStringAES(search);

        DataTable dt = DataAccess.GetRecords("SP_GETPORTERLIST", "@SEARCH", search).Copy();
        ds.Tables.Add(dt);
        return ds;

    }

    private DataSet InsertSchBreak()
    {

        string porterid = ((!string.IsNullOrEmpty(Request.QueryString["PorterId"])) ? Request.QueryString["PorterId"].ToString() : ""),
            dur = ((!string.IsNullOrEmpty(Request.QueryString["Duration"])) ? Request.QueryString["Duration"].ToString() : ""),
            StartTime = ((!string.IsNullOrEmpty(Request.QueryString["StartTime"])) ? Request.QueryString["StartTime"].ToString() : ""),
            action = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString() : ""),
              updatedby = ((!string.IsNullOrEmpty(Request.QueryString["UPTBY"])) ? Request.QueryString["UPTBY"].ToString() : ""),

            Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString() : "");

        porterid = ((!string.IsNullOrEmpty(porterid)) ? AESEncrytDecry.DecryptStringAES(porterid) : string.Empty); dur = ((!string.IsNullOrEmpty(dur)) ? AESEncrytDecry.DecryptStringAES(dur) : string.Empty);
        StartTime = ((!string.IsNullOrEmpty(StartTime)) ? AESEncrytDecry.DecryptStringAES(StartTime) : string.Empty);
        action = ((!string.IsNullOrEmpty(action)) ? AESEncrytDecry.DecryptStringAES(action) : string.Empty);
        Id = ((!string.IsNullOrEmpty(Id)) ? AESEncrytDecry.DecryptStringAES(Id) : string.Empty);
        updatedby = ((!string.IsNullOrEmpty(updatedby)) ? AESEncrytDecry.DecryptStringAES(updatedby) : string.Empty);

        DataTable table = generate();
        DataRow row = table.NewRow();
        //string Result = DataAccess.UpdateSchBreak(porterid, dur, StartTime, action, Id, updatedby).Rows[0]["RESULT"].ToString();
        row["RESULT"] = "false";
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }

    private DataSet UpdateSchBreak()
    {

        string porterid = ((!string.IsNullOrEmpty(Request.QueryString["PorterId"])) ? Request.QueryString["PorterId"].ToString() : ""),
            dur = ((!string.IsNullOrEmpty(Request.QueryString["Duration"])) ? Request.QueryString["Duration"].ToString() : ""),
            StartTime = ((!string.IsNullOrEmpty(Request.QueryString["StartTime"])) ? Request.QueryString["StartTime"].ToString() : ""),
            action = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString() : ""),
              updatedby = ((!string.IsNullOrEmpty(Request.QueryString["UPTBY"])) ? Request.QueryString["UPTBY"].ToString() : ""),
              PorterName = ((!string.IsNullOrEmpty(Request.QueryString["PorterName"])) ? Request.QueryString["PorterName"].ToString() : ""),
               ServiceID = ((string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? string.Empty : Request.QueryString["SERVICEID"].ToString()),
            Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString() : "");

        porterid = AESEncrytDecry.DecryptStringAES(porterid); dur = AESEncrytDecry.DecryptStringAES(dur); StartTime = AESEncrytDecry.DecryptStringAES(StartTime); action = AESEncrytDecry.DecryptStringAES(action);
        Id = AESEncrytDecry.DecryptStringAES(Id); updatedby = AESEncrytDecry.DecryptStringAES(updatedby); PorterName = AESEncrytDecry.DecryptStringAES(PorterName); ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID);
        DataTable table = generate();
        DataRow row = table.NewRow();
        string Result = DataAccess.UpdateSchBreak(porterid, dur, StartTime, action, Id, updatedby, PorterName, ServiceID).Rows[0]["RESULT"].ToString();
        row["RESULT"] = Result;
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
    public DataSet LocationGroup()
    {
        string GroupId = "0", GroupName = "", UserIds = "", LocationIds = "", process = "";

        if (!string.IsNullOrEmpty(Request.QueryString["GROUPID"]))
            GroupId = DecryptAES(Request.QueryString["GROUPID"]).ToUpper();

        if (!string.IsNullOrEmpty(Request.QueryString["GROUPNAME"]))
            GroupName = DecryptAES(Request.QueryString["GROUPNAME"]).ToUpper();

        if (!string.IsNullOrEmpty(Request.QueryString["USERIDS"]))
            UserIds = DecryptAES(Request.QueryString["USERIDS"]);

        if (!string.IsNullOrEmpty(Request.QueryString["LOCATIONIDS"]))
            LocationIds = DecryptAES(Request.QueryString["LOCATIONIDS"]);

        if (!string.IsNullOrEmpty(Request.QueryString["Mode"]))
        {
            process = DecryptAES(Request.QueryString["Mode"]).ToUpper();
        }

        DataSet DS = new DataSet();
        DS = DataAccess.GroupDetails(GroupId, GroupName, UserIds, LocationIds, process);

        return DS;
    }

    public DataSet GetCategories()
    {
        DataSet ds = new DataSet();
        string ServiceID = ((string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? string.Empty : Request.QueryString["SERVICEID"].ToString()),
            search = ((!string.IsNullOrEmpty(Request.QueryString["SEARCH"])) ? Request.QueryString["SEARCH"].ToString() : "");
        search = AESEncrytDecry.DecryptStringAES(search); ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID);
        DataTable dt = DataAccess.GetRecords("SP_CATEGORYMASTER_GET", "@SEARCH", search, "@SERVICEID", ServiceID).Copy();
        ds.Tables.Add(dt);
        return ds;

    }
    public DataSet GetPorters()
    {
        DataSet ds = new DataSet();
        string
            ServiceID = ((string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? string.Empty : Request.QueryString["SERVICEID"].ToString()),
            search = ((!string.IsNullOrEmpty(Request.QueryString["SEARCH"])) ? Request.QueryString["SEARCH"].ToString() : "");

        search = AESEncrytDecry.DecryptStringAES(search); ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID);

        DataTable dt = DataAccess.GetRecords("SP_GETPORTER", "@SEARCH", search, "@SERVICEID", ServiceID).Copy();
        ds.Tables.Add(dt);
        return ds;

    }

    public DataSet ResetPassword()
    {
        DataSet ds = new DataSet();
        string encUserId = Request.QueryString["USERID"] ?? "";

        string UserID = AESEncrytDecry.DecryptStringAES(encUserId);

        DataTable dt = DataAccess.GetRecords("SP_RESETPASSWORD", "@USERID", UserID).Copy();

        if (dt.Rows.Count == 0)
        {
            dt.Columns.Add("RESULT");
            dt.Rows.Add("TRUE");
        }

        ds.Tables.Add(dt);
        return ds;
    }

    public DataSet GetLocations()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["Search"])) ? string.Empty : Request.QueryString["Search"].ToString(),
            ServiceID = (string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? string.Empty : Request.QueryString["SERVICEID"].ToString(),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString() : "15"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString() : "1");

        Search = AESEncrytDecry.DecryptStringAES(Search); PageIndex = AESEncrytDecry.DecryptStringAES(PageIndex); PageSize = AESEncrytDecry.DecryptStringAES(PageSize);
        ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID);

        DataSet dt = DataAccess.GetRecordss("SP_GETLOCATIONS_EQUANS", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize, "@SERVICEID", ServiceID);
        return dt;

    }
    public DataSet oldGetLocations()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["Search"])) ? string.Empty : Request.QueryString["Search"].ToString(),
            ServiceID = (string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? string.Empty : Request.QueryString["SERVICEID"].ToString(),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString() : "15"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString() : "1");

        Search = AESEncrytDecry.DecryptStringAES(Search); PageIndex = AESEncrytDecry.DecryptStringAES(PageIndex); PageSize = AESEncrytDecry.DecryptStringAES(PageSize);
        ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID);

        DataSet dt = DataAccess.GetRecordss("SP_GETLOCATIONS", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize, "@SERVICEID", ServiceID);
        return dt;

    }

    public DataSet GetUsers()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["Search"])) ? string.Empty : Request.QueryString["Search"].ToString(),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString() : "15"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString() : "1"),
               svc = ((!string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? Request.QueryString["SERVICEID"].ToString() : "1");

        Search = AESEncrytDecry.DecryptStringAES(Search);
        PageSize = AESEncrytDecry.DecryptStringAES(PageSize);
        PageIndex = AESEncrytDecry.DecryptStringAES(PageIndex);
        svc = AESEncrytDecry.DecryptStringAES(svc);


        DataSet dt = DataAccess.GetRecordss("SP_GETUSERS", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize, "@SERVICEID", svc);
        return dt;

    }

    public DataSet GetUser()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["Search"])) ? string.Empty : Request.QueryString["Search"].ToString(),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString() : "15"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString() : "1"),
               svc = ((!string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? Request.QueryString["SERVICEID"].ToString() : "1");

        Search = AESEncrytDecry.DecryptStringAES(Search);
        PageSize = AESEncrytDecry.DecryptStringAES(PageSize);
        PageIndex = AESEncrytDecry.DecryptStringAES(PageIndex);
        svc = AESEncrytDecry.DecryptStringAES(svc);


        DataSet dt = DataAccess.GetRecordss("SP_GETUSER", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize, "@SERVICEID", svc);
        return dt;

    }

    public DataSet GetUsersEquans()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["Search"])) ? string.Empty : Request.QueryString["Search"].ToString(),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString() : "15"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString() : "1"),
               svc = ((!string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? Request.QueryString["SERVICEID"].ToString() : "1");

        Search = AESEncrytDecry.DecryptStringAES(Search);
        PageSize = AESEncrytDecry.DecryptStringAES(PageSize);
        PageIndex = AESEncrytDecry.DecryptStringAES(PageIndex);
        svc = AESEncrytDecry.DecryptStringAES(svc);


        DataSet dt = DataAccess.GetRecordss("SP_GETUSERSEQ", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize, "@SERVICEID", svc);
        return dt;

    }

    public DataSet GetCategory()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["Search"])) ? string.Empty : Request.QueryString["Search"].ToString(),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString() : "15"),
              svc = ((!string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? Request.QueryString["SERVICEID"].ToString() : "1"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString() : "1");

        Search = AESEncrytDecry.DecryptStringAES(Search);
        PageSize = AESEncrytDecry.DecryptStringAES(PageSize);
        svc = AESEncrytDecry.DecryptStringAES(svc);
        PageIndex = AESEncrytDecry.DecryptStringAES(PageIndex);

        DataSet dt = DataAccess.GetRecordss("SP_GETTASKTYPEMASTER", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize, "@SERVICEID", svc);
        return dt;
    }

    public DataSet GetUsersp()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["Search"])) ? string.Empty : Request.QueryString["Search"].ToString().ToUpper(),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString().ToUpper() : "15"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString().ToUpper() : "1");

        DataSet dt = DataAccess.GetRecordss("SP_GETUSERSp", "@SEARCH", Search, "@PAGEINDEX", PageIndex, "@PAGESIZE", PageSize);
        return dt;

    }



    public DataSet GetPerformLogs()
    {
        string Search = (string.IsNullOrEmpty(Request.QueryString["SEARCH"])) ? string.Empty : Request.QueryString["SEARCH"].ToString(),
            ReqID = (string.IsNullOrEmpty(Request.QueryString["REQUESTID"])) ? string.Empty : Request.QueryString["REQUESTID"].ToString(),
            Status = (string.IsNullOrEmpty(Request.QueryString["STATUS"])) ? string.Empty : Request.QueryString["STATUS"].ToString(),
            From = (string.IsNullOrEmpty(Request.QueryString["FROM"])) ? string.Empty : Request.QueryString["FROM"].ToString(),
            To = (string.IsNullOrEmpty(Request.QueryString["TO"])) ? string.Empty : Request.QueryString["TO"].ToString(),
              PageSize = ((!string.IsNullOrEmpty(Request.QueryString["PageSize"])) ? Request.QueryString["PageSize"].ToString() : "15"),
              PageIndex = ((!string.IsNullOrEmpty(Request.QueryString["PageIndex"])) ? Request.QueryString["PageIndex"].ToString() : "1");

        Search = AESEncrytDecry.DecryptStringAES(Search); ReqID = AESEncrytDecry.DecryptStringAES(ReqID); Status = AESEncrytDecry.DecryptStringAES(Status);
        From = AESEncrytDecry.DecryptStringAES(From); To = AESEncrytDecry.DecryptStringAES(To); PageIndex = AESEncrytDecry.DecryptStringAES(PageIndex);
        PageSize = AESEncrytDecry.DecryptStringAES(PageSize);

        DataSet dt = DataAccess.PerformLogs("SP_GETPERFORMRESPONSES", Search, ReqID, Status, From, To, PageIndex, PageSize);
        return dt;

    }
    public DataSet GetPageByRole()
    {
        string ROLEID = ((!string.IsNullOrEmpty(Request.QueryString["ROLEID"])) ? Request.QueryString["ROLEID"].ToString().ToUpper() : "");

        DataTable dt = DataAccess.GetRecords("SP_GETPAGESBYROLE", "@ROLEID", ROLEID);
        DataSet DS = new DataSet(); DS.Tables.Add(dt);
        return DS;

    }

    private DataSet updatETasktype()
    {
        string CategoryName = (!string.IsNullOrEmpty(Request.QueryString["CATEGORYNAME"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["CATEGORYNAME"]) : ""),
               DepartmentId = (!string.IsNullOrEmpty(Request.QueryString["DEPARTMENTID"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["DEPARTMENTID"]) : ""),
               ThresholdForStartTime = (!string.IsNullOrEmpty(Request.QueryString["THRESHOLDFORSTARTTIME"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["THRESHOLDFORSTARTTIME"]) : ""),
               ThresholdForEndTime = (!string.IsNullOrEmpty(Request.QueryString["THRESHOLDFORENDTIME"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["THRESHOLDFORENDTIME"]) : ""),
               Orderwise = (!string.IsNullOrEmpty(Request.QueryString["ORDERWISE"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ORDERWISE"]) : ""),
               EscationTat1 = (!string.IsNullOrEmpty(Request.QueryString["ESCATIONTAT1"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ESCATIONTAT1"]) : ""),
               EscationTat2 = (!string.IsNullOrEmpty(Request.QueryString["ESCATIONTAT2"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ESCATIONTAT2"]) : ""),
               EscationTat3 = (!string.IsNullOrEmpty(Request.QueryString["ESCATIONTAT3"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ESCATIONTAT3"]) : ""),
               EscationContact1 = (!string.IsNullOrEmpty(Request.QueryString["ESCATIONCONTACT1"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ESCATIONCONTACT1"]) : ""),
               EscationContact2 = (!string.IsNullOrEmpty(Request.QueryString["ESCATIONCONTACT2"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ESCATIONCONTACT2"]) : ""),
               EscationContact3 = (!string.IsNullOrEmpty(Request.QueryString["ESCATIONCONTACT3"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ESCATIONCONTACT3"]) : ""),
               TaskTypeId = (!string.IsNullOrEmpty(Request.QueryString["TASKTYPEID"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["TASKTYPEID"]) : ""),
               HistUrl = (!string.IsNullOrEmpty(Request.QueryString["HISTURL"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["HISTURL"]) : ""),
               Dial50Url = (!string.IsNullOrEmpty(Request.QueryString["DIAL50URL"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["DIAL50URL"]) : ""),
               ComplaintContact = (!string.IsNullOrEmpty(Request.QueryString["COMPLAINTCONTACT"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["COMPLAINTCONTACT"]) : ""),
               ShortName = (!string.IsNullOrEmpty(Request.QueryString["SHORTNAME"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["SHORTNAME"]) : ""),
               Image = (!string.IsNullOrEmpty(Request.QueryString["IMAGE"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["IMAGE"]) : "Default.png"),
               CategoryDescription = (!string.IsNullOrEmpty(Request.QueryString["CATEGORYDESCRIPTION"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["CATEGORYDESCRIPTION"]) : ""),
               DescriptionDetails = (!string.IsNullOrEmpty(Request.QueryString["DESCRIPTIONDETAILS"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["DESCRIPTIONDETAILS"]) : ""),
               AdditionalUrl = (!string.IsNullOrEmpty(Request.QueryString["ADDITIONALURL"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ADDITIONALURL"]) : ""),
               Title = (!string.IsNullOrEmpty(Request.QueryString["TITLE"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["TITLE"]) : ""),
               Description = (!string.IsNullOrEmpty(Request.QueryString["DESCRIPTION"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["DESCRIPTION"]) : ""),
               IsSignRequired = (!string.IsNullOrEmpty(Request.QueryString["ISSIGNREQUIRED"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ISSIGNREQUIRED"]) : "0"),
               IsPhotoRequired = (!string.IsNullOrEmpty(Request.QueryString["ISPHOTOREQUIRED"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ISPHOTOREQUIRED"]) : "0"),
               IsTwoPorterTask = (!string.IsNullOrEmpty(Request.QueryString["ISTWOPORTERTASK"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ISTWOPORTERTASK"]) : "0"),
               IsActive = (!string.IsNullOrEmpty(Request.QueryString["ISACTIVE"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ISACTIVE"]) : "1"),
               Action = (!string.IsNullOrEmpty(Request.QueryString["action"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["action"]) : ""),
               ID = (!string.IsNullOrEmpty(Request.QueryString["ID"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["ID"]) : ""),
               ServiceID = (!string.IsNullOrEmpty(Request.QueryString["SERVICEID"]) ? AESEncrytDecry.DecryptStringAES(Request.QueryString["SERVICEID"]) : "1");

        DataTable table = generate();
        DataRow row = table.NewRow();

        try
        {
            if (Action.ToUpper() == "DELETE")
            {
                IsActive = "0";
            }

            DataTable spResult = DataAccess.UpdateTaskTypeMaster(
                CategoryName, DepartmentId, ThresholdForStartTime, ThresholdForEndTime,
                Orderwise, EscationTat1, EscationTat2, EscationTat3,
                EscationContact1, EscationContact2, EscationContact3,
                TaskTypeId, HistUrl, Dial50Url, ComplaintContact,
                ShortName, Image, CategoryDescription, DescriptionDetails, AdditionalUrl,
                Title, Description, IsSignRequired, IsPhotoRequired,
                IsTwoPorterTask, IsActive, Action, ID, ServiceID);

            string Result = "FALSE";
            string Message = "";
            string NewId = "";

            if (spResult != null && spResult.Rows.Count > 0)
            {
                Result = spResult.Rows[0]["RESULT"].ToString();

                if (spResult.Columns.Contains("MESSAGE"))
                    Message = spResult.Rows[0]["MESSAGE"].ToString();

                if (spResult.Columns.Contains("NEWID") && Action.ToUpper() == "INSERT")
                    NewId = spResult.Rows[0]["NEWID"].ToString();
            }

            row["RESULT"] = Result + "_" + Message + "_" + NewId;
        }
        catch (Exception ex)
        {
            row["RESULT"] = "FALSE_Error: " + ex.Message;
        }

        table.Rows.Add(row);
        DataSet DS = new DataSet();
        DS.Tables.Add(table);
        return DS;
    }



    private DataSet DeleteUser(string encUsername)
    {
        try
        {
            string decryptedUsername = AESEncrytDecry.DecryptStringAES(encUsername);

            DataSet ds = new DataSet();
            DataTable dt = DataAccess.GetRecords("SP_userDELETE_EQUANS", "@username", decryptedUsername);

            if (dt.Rows.Count == 0)
            {
                dt.Columns.Add("Result");
                DataRow newRow = dt.NewRow();
                newRow["Result"] = "FALSE";
                dt.Rows.Add(newRow);
            }

            ds.Tables.Add(dt);
            return ds;
        }
        catch (Exception ex)
        {
            DataTable errorDt = new DataTable();
            errorDt.Columns.Add("Result");
            DataRow errorRow = errorDt.NewRow();
            errorRow["Result"] = "FALSE";
            errorDt.Rows.Add(errorRow);

            DataSet ds = new DataSet();
            ds.Tables.Add(errorDt);
            return ds;
        }
    }

    private DataSet updatePorters()
    {
        string Action = Request.QueryString["ACTION"] ?? "SAVE";

        if (Action.ToUpper() == "DELETE")
        {
            return DeletePorter();
        }
        else
        {
            return InsertUpdatePorter();
        }
    }

    private DataSet InsertUpdatePorter()
    {
        string PorterName = Request.QueryString["PORTERNAME"] ?? "",
               UserID = Request.QueryString["USERID"] ?? "",
               Password = Request.QueryString["PASSWORD"] ?? "",
               GPShort = Request.QueryString["GPShort"] ?? "",
               IsActive = Request.QueryString["ISACTIVE"] ?? "",
               ServiceID = Request.QueryString["ServiceID"] ?? "",
               CategoryIds = Request.QueryString["CATEGORYIDS"] ?? "",
               FloorIds = Request.QueryString["FLOORIDS"] ?? "",
               ProfilePicture = Request.QueryString["PROFILEPICTURE"] ?? "",
               Gender = Request.QueryString["GENDER"] ?? "",
               AppId = Request.QueryString["APPID"] ?? "",
               Action = Request.QueryString["ACTION"] ?? "SAVE";

        string UserName = Request.QueryString["GPMId"] ?? "";

        try { PorterName = AESEncrytDecry.DecryptStringAES(PorterName); } catch { PorterName = ""; }
        try { UserID = AESEncrytDecry.DecryptStringAES(UserID); } catch { UserID = ""; }
        try { UserName = AESEncrytDecry.DecryptStringAES(UserName); } catch { UserName = ""; }
        try { Password = AESEncrytDecry.DecryptStringAES(Password); } catch { Password = ""; }
        try { GPShort = AESEncrytDecry.DecryptStringAES(GPShort); } catch { GPShort = ""; }
        try { IsActive = AESEncrytDecry.DecryptStringAES(IsActive); } catch { IsActive = ""; }
        try { ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID); } catch { ServiceID = ""; }
        try { CategoryIds = AESEncrytDecry.DecryptStringAES(CategoryIds); } catch { CategoryIds = ""; }
        try { FloorIds = AESEncrytDecry.DecryptStringAES(FloorIds); } catch { FloorIds = ""; }
        try { ProfilePicture = AESEncrytDecry.DecryptStringAES(ProfilePicture); } catch { ProfilePicture = ""; }
        try { Gender = AESEncrytDecry.DecryptStringAES(Gender); } catch { Gender = ""; }
        try { AppId = AESEncrytDecry.DecryptStringAES(AppId); } catch { AppId = ""; }
        try { Action = AESEncrytDecry.DecryptStringAES(Action); } catch { Action = "SAVE"; }

        if (PorterName == "Invalid Input") PorterName = "";
        if (UserID == "Invalid Input") UserID = "";
        if (UserName == "Invalid Input") UserName = "";
        if (Password == "Invalid Input") Password = "";
        if (GPShort == "Invalid Input") GPShort = "";
        if (IsActive == "Invalid Input") IsActive = "";
        if (ServiceID == "Invalid Input") ServiceID = "";
        if (CategoryIds == "Invalid Input") CategoryIds = "";
        if (FloorIds == "Invalid Input") FloorIds = "";
        if (ProfilePicture == "Invalid Input") ProfilePicture = "";
        if (Gender == "Invalid Input") Gender = "";
        if (AppId == "Invalid Input") AppId = "";
        if (Action == "Invalid Input") Action = "SAVE";

        DataTable table = generate();
        DataRow row = table.NewRow();

        try
        {
            string Result = DataAccess.UpdatePorterNew(
                PorterName,
                UserID,
                UserName,
                Password,
                IsActive,
                GPShort,
                ServiceID,
                CategoryIds,
                FloorIds,
                ProfilePicture,
                Gender,
                AppId,
                Action
            ).Rows[0]["RESULT"].ToString();

            row["RESULT"] = Result;
        }
        catch
        {
            row["RESULT"] = "FALSE";
        }

        table.Rows.Add(row);
        DataSet DS = new DataSet();
        DS.Tables.Add(table);
        return DS;
    }

    private DataSet DeletePorter()
    {
        string UserID = Request.QueryString["USERID"] ?? "";
        string PorterName = Request.QueryString["PORTERNAME"] ?? "";

        try { UserID = AESEncrytDecry.DecryptStringAES(UserID); } catch { UserID = ""; }
        try { PorterName = AESEncrytDecry.DecryptStringAES(PorterName); } catch { PorterName = ""; }

        DataTable table = generate();
        DataRow row = table.NewRow();

        try
        {
            string Result = DataAccess.UpdatePorterNew(
                PorterName,
                UserID,
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "DELETE"
            ).Rows[0]["RESULT"].ToString();

            row["RESULT"] = Result;
        }
        catch
        {
            row["RESULT"] = "FALSE - Error processing delete";
        }

        table.Rows.Add(row);
        DataSet DS = new DataSet();
        DS.Tables.Add(table);
        return DS;
    }


    private DataSet SetCategories()
    {
        string Category = ((!string.IsNullOrEmpty(Request.QueryString["CATEGORY"])) ? Request.QueryString["CATEGORY"].ToString() : ""),
            Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString() : ""),
            TAT = ((!string.IsNullOrEmpty(Request.QueryString["TAT"])) ? Request.QueryString["TAT"].ToString() : ""),
            TStart = ((!string.IsNullOrEmpty(Request.QueryString["THSTART"])) ? Request.QueryString["THSTART"].ToString() : ""),
            TEnd = ((!string.IsNullOrEmpty(Request.QueryString["THEND"])) ? Request.QueryString["THEND"].ToString() : ""),
            Priority = ((!string.IsNullOrEmpty(Request.QueryString["PRIORITY"])) ? Request.QueryString["PRIORITY"].ToString() : ""),
            Routine = ((!string.IsNullOrEmpty(Request.QueryString["ROUTINE"])) ? Request.QueryString["ROUTINE"].ToString() : ""),
            PorterTask = ((!string.IsNullOrEmpty(Request.QueryString["PORTERTASK"])) ? Request.QueryString["PORTERTASK"].ToString() : ""),
            Heavy = ((!string.IsNullOrEmpty(Request.QueryString["HEAVY"])) ? Request.QueryString["HEAVY"].ToString() : ""),
            IsActive = ((!string.IsNullOrEmpty(Request.QueryString["ISACTIVE"])) ? Request.QueryString["ISACTIVE"].ToString() : ""),
            TwoPorter = ((!string.IsNullOrEmpty(Request.QueryString["TWOPORTER"])) ? Request.QueryString["TWOPORTER"].ToString() : ""),
            IsHaywood = ((!string.IsNullOrEmpty(Request.QueryString["HAYWOOD"])) ? Request.QueryString["HAYWOOD"].ToString() : ""),
            IsRoyalStoke = ((!string.IsNullOrEmpty(Request.QueryString["ROYALSTOKE"])) ? Request.QueryString["ROYALSTOKE"].ToString() : ""),
            IsNoPI = ((!string.IsNullOrEmpty(Request.QueryString["NOPI"])) ? Request.QueryString["NOPI"].ToString() : ""),
            IsBP = ((!string.IsNullOrEmpty(Request.QueryString["BLOODPRODUCT"])) ? Request.QueryString["BLOODPRODUCT"].ToString() : ""),
            IsMGas = ((!string.IsNullOrEmpty(Request.QueryString["MEDICALGAS"])) ? Request.QueryString["MEDICALGAS"].ToString() : ""),
            IsWaste = ((!string.IsNullOrEmpty(Request.QueryString["WASTE"])) ? Request.QueryString["WASTE"].ToString() : ""),
            IsSupervisor = ((!string.IsNullOrEmpty(Request.QueryString["SUPERVISOR"])) ? Request.QueryString["SUPERVISOR"].ToString() : ""),
            IsPharmacy = ((!string.IsNullOrEmpty(Request.QueryString["PHARMACY"])) ? Request.QueryString["PHARMACY"].ToString() : ""),

            KPMK = ((!string.IsNullOrEmpty(Request.QueryString["KPMK"])) ? Request.QueryString["KPMK"].ToString() : ""),
            KP = ((!string.IsNullOrEmpty(Request.QueryString["KP"])) ? Request.QueryString["KP"].ToString() : ""),
            KPS = ((!string.IsNullOrEmpty(Request.QueryString["KPS"])) ? Request.QueryString["KPS"].ToString() : ""),
            KPR = ((!string.IsNullOrEmpty(Request.QueryString["KPR"])) ? Request.QueryString["KPR"].ToString() : ""),
            KPSA = ((!string.IsNullOrEmpty(Request.QueryString["KPSA"])) ? Request.QueryString["KPSA"].ToString() : ""),
            ISSIGN = ((!string.IsNullOrEmpty(Request.QueryString["ISSIGN"])) ? Request.QueryString["ISSIGN"].ToString() : ""),
            ISPHOTO = ((!string.IsNullOrEmpty(Request.QueryString["ISPHOTO"])) ? Request.QueryString["ISPHOTO"].ToString() : ""),
            ServiceID = ((!string.IsNullOrEmpty(Request.QueryString["ServiceID"])) ? Request.QueryString["ServiceID"].ToString() : ""),
            CHARGEGROUP = ((!string.IsNullOrEmpty(Request.QueryString["CHARGEGROUP"])) ? Request.QueryString["CHARGEGROUP"].ToString() : ""),

            IsSPECIMEN = ((!string.IsNullOrEmpty(Request.QueryString["SPECIMEN"])) ? Request.QueryString["SPECIMEN"].ToString() : ""),
            IsLIGHTTASK = ((!string.IsNullOrEmpty(Request.QueryString["LIGHTTASK"])) ? Request.QueryString["LIGHTTASK"].ToString() : ""),


            CLS = ((!string.IsNullOrEmpty(Request.QueryString["CLS"])) ? Request.QueryString["CLS"].ToString() : ""),
            CLRR = ((!string.IsNullOrEmpty(Request.QueryString["CLRR"])) ? Request.QueryString["CLRR"].ToString() : ""),

            IsDESEASEDPATIENT = ((!string.IsNullOrEmpty(Request.QueryString["DESEASEDPATIENT"])) ? Request.QueryString["DESEASEDPATIENT"].ToString() : "");



        Id = AESEncrytDecry.DecryptStringAES(Id); Category = AESEncrytDecry.DecryptStringAES(Category); TAT = AESEncrytDecry.DecryptStringAES(TAT); TStart = AESEncrytDecry.DecryptStringAES(TStart); TEnd = AESEncrytDecry.DecryptStringAES(TEnd); Priority = AESEncrytDecry.DecryptStringAES(Priority);
        Routine = AESEncrytDecry.DecryptStringAES(Routine); PorterTask = AESEncrytDecry.DecryptStringAES(PorterTask); Heavy = AESEncrytDecry.DecryptStringAES(Heavy); IsActive = AESEncrytDecry.DecryptStringAES(IsActive); TwoPorter = AESEncrytDecry.DecryptStringAES(TwoPorter);
        IsHaywood = AESEncrytDecry.DecryptStringAES(IsHaywood); IsRoyalStoke = AESEncrytDecry.DecryptStringAES(IsRoyalStoke); IsNoPI = AESEncrytDecry.DecryptStringAES(IsNoPI); IsPharmacy = AESEncrytDecry.DecryptStringAES(IsPharmacy); IsBP = AESEncrytDecry.DecryptStringAES(IsBP);
        IsMGas = AESEncrytDecry.DecryptStringAES(IsMGas); IsWaste = AESEncrytDecry.DecryptStringAES(IsWaste); IsSupervisor = AESEncrytDecry.DecryptStringAES(IsSupervisor);
        KPMK = AESEncrytDecry.DecryptStringAES(KPMK); KP = AESEncrytDecry.DecryptStringAES(KP); KPS = AESEncrytDecry.DecryptStringAES(KPS); KPR = AESEncrytDecry.DecryptStringAES(KPR); KPSA = AESEncrytDecry.DecryptStringAES(KPSA);
        ISSIGN = AESEncrytDecry.DecryptStringAES(ISSIGN); ISPHOTO = AESEncrytDecry.DecryptStringAES(ISPHOTO); ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID); CHARGEGROUP = AESEncrytDecry.DecryptStringAES(CHARGEGROUP);
        IsSPECIMEN = AESEncrytDecry.DecryptStringAES(IsSPECIMEN); IsLIGHTTASK = AESEncrytDecry.DecryptStringAES(IsLIGHTTASK); IsDESEASEDPATIENT = AESEncrytDecry.DecryptStringAES(IsDESEASEDPATIENT); CLS = AESEncrytDecry.DecryptStringAES(CLS); CLRR = AESEncrytDecry.DecryptStringAES(CLRR);

        DataTable table = generate();
        DataRow row = table.NewRow();

        if (Id != "Invalid Input" && Category != "Invalid Input" && TAT != "Invalid Input" && TStart != "Invalid Input" && TEnd != "Invalid Input" && Priority != "Invalid Input" && Routine != "Invalid Input" && PorterTask != "Invalid Input" && Heavy != "Invalid Input" && IsActive != "Invalid Input" && TwoPorter != "Invalid Input" && IsHaywood != "Invalid Input" && IsRoyalStoke != "Invalid Input"
            && IsNoPI != "Invalid Input" && IsPharmacy != "Invalid Input" && IsBP != "Invalid Input" && IsMGas != "Invalid Input" && IsWaste != "Invalid Input" && IsSupervisor != "Invalid Input" && IsSPECIMEN != "Invalid Input" && IsLIGHTTASK != "Invalid Input" && IsDESEASEDPATIENT != "Invalid Input"
            && KPMK != "Invalid Input" && KP != "Invalid Input" && KPS != "Invalid Input" && KPR != "Invalid Input" && KPSA != "Invalid Input" && ISSIGN != "Invalid Input" && ISPHOTO != "Invalid Input" && ServiceID != "Invalid Input" && CHARGEGROUP != "Invalid Input" && CLS != "Invalid Input" && CLRR != "Invalid Input")
        {
            string Result = DataAccess.UpdateCategoryNew(Id, Category, TAT, TStart, TEnd, Priority, Routine, PorterTask, Heavy, IsActive, TwoPorter, IsHaywood, IsRoyalStoke, IsNoPI, IsPharmacy, IsBP, IsMGas, IsWaste,
                                                      IsSupervisor, IsSPECIMEN, IsLIGHTTASK, IsDESEASEDPATIENT, KPMK, KP, KPS, KPR, KPSA, ISSIGN, ISPHOTO, ServiceID, CHARGEGROUP, CLS, CLRR).Rows[0]["RESULT"].ToString();
            row["RESULT"] = Result;
        }
        else
            row["RESULT"] = "FALSE";
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }


    //private DataSet UpdateLocations()
    //{

    //    string zonename = ((!string.IsNullOrEmpty(Request.QueryString["ZONENAME"])) ? Request.QueryString["ZONENAME"].ToString() : ""),
    //        macid = ((!string.IsNullOrEmpty(Request.QueryString["MACID"])) ? Request.QueryString["MACID"].ToString() : ""),
    //        apname = ((!string.IsNullOrEmpty(Request.QueryString["APNAME"])) ? Request.QueryString["APNAME"].ToString() : ""),
    //        floorid = ((!string.IsNullOrEmpty(Request.QueryString["FLOORID"])) ? Request.QueryString["FLOORID"].ToString() : ""),
    //        CATERGROUPID = ((!string.IsNullOrEmpty(Request.QueryString["CATERGROUPID"])) ? Request.QueryString["CATERGROUPID"].ToString() : ""),
    //        CLEAINGZONEID = ((!string.IsNullOrEmpty(Request.QueryString["CLEAINGZONEID"])) ? Request.QueryString["CLEAINGZONEID"].ToString() : ""),
    //        isactive = ((!string.IsNullOrEmpty(Request.QueryString["ISACTIVE"])) ? Request.QueryString["ISACTIVE"].ToString() : ""),
    //        ismultiporter = ((!string.IsNullOrEmpty(Request.QueryString["ISMULTIPORTER"])) ? Request.QueryString["ISMULTIPORTER"].ToString() : ""),
    //        action = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString() : ""),
    //        nearby = ((!string.IsNullOrEmpty(Request.QueryString["NEARBY"])) ? Request.QueryString["NEARBY"].ToString() : ""),
    //        Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString() : ""),
    //        //ISPORTERINGLOCATION, ISCATERINGLOCATION, ISCLEANINGLOCATION, ISSECURITYLOCATION, ISFEEDBACKLOCATION
    //        IsPorterLocation = ((!string.IsNullOrEmpty(Request.QueryString["ISPORTERINGLOCATION"])) ? Request.QueryString["ISPORTERINGLOCATION"].ToString() : ""),
    //        IsCateringLocation = ((!string.IsNullOrEmpty(Request.QueryString["ISCATERINGLOCATION"])) ? Request.QueryString["ISCATERINGLOCATION"].ToString() : ""),
    //        IsCleaningLocation = ((!string.IsNullOrEmpty(Request.QueryString["ISCLEANINGLOCATION"])) ? Request.QueryString["ISCLEANINGLOCATION"].ToString() : ""),
    //        IsSecurityLocaiton = ((!string.IsNullOrEmpty(Request.QueryString["ISSECURITYLOCATION"])) ? Request.QueryString["ISSECURITYLOCATION"].ToString() : ""),
    //        IsFeedbackLocation = ((!string.IsNullOrEmpty(Request.QueryString["ISFEEDBACKLOCATION"])) ? Request.QueryString["ISFEEDBACKLOCATION"].ToString() : ""),

    //        Tag = ((!string.IsNullOrEmpty(Request.QueryString["TAG"])) ? Request.QueryString["TAG"].ToString() : "");

    //    zonename = AESEncrytDecry.DecryptStringAES(zonename); macid = AESEncrytDecry.DecryptStringAES(macid); apname = AESEncrytDecry.DecryptStringAES(apname); floorid = AESEncrytDecry.DecryptStringAES(floorid);
    //    isactive = AESEncrytDecry.DecryptStringAES(isactive); ismultiporter = AESEncrytDecry.DecryptStringAES(ismultiporter); action = AESEncrytDecry.DecryptStringAES(action); nearby = AESEncrytDecry.DecryptStringAES(nearby);
    //    Id = AESEncrytDecry.DecryptStringAES(Id); IsPorterLocation = AESEncrytDecry.DecryptStringAES(IsPorterLocation); IsCateringLocation = AESEncrytDecry.DecryptStringAES(IsCateringLocation);
    //    IsCleaningLocation = AESEncrytDecry.DecryptStringAES(IsCleaningLocation); IsSecurityLocaiton = AESEncrytDecry.DecryptStringAES(IsSecurityLocaiton); IsFeedbackLocation = AESEncrytDecry.DecryptStringAES(IsFeedbackLocation);
    //    Tag = AESEncrytDecry.DecryptStringAES(Tag); CATERGROUPID = AESEncrytDecry.DecryptStringAES(CATERGROUPID); CLEAINGZONEID = AESEncrytDecry.DecryptStringAES(CLEAINGZONEID);


    //    DataTable table = generate();
    //    DataRow row = table.NewRow();
    //    string Result = DataAccess.UpdateLocationsNew(zonename, macid, apname, floorid, isactive, ismultiporter, action, nearby, Id, Tag, IsPorterLocation, IsCateringLocation, IsCleaningLocation, IsSecurityLocaiton, IsFeedbackLocation, CATERGROUPID, CLEAINGZONEID).Rows[0]["RESULT"].ToString();
    //    row["RESULT"] = Result;
    //    table.Rows.Add(row);
    //    DataSet DS = new DataSet(); DS.Tables.Add(table);
    //    return DS;
    //}



    private DataSet UpdateUserold()
    {

        string username = ((!string.IsNullOrEmpty(Request.QueryString["USERNAME"])) ? Request.QueryString["USERNAME"].ToString() : ""),
            mid = ((!string.IsNullOrEmpty(Request.QueryString["MID"])) ? Request.QueryString["MID"].ToString() : ""),
            RoleID = ((!string.IsNullOrEmpty(Request.QueryString["ROLENAME"])) ? Request.QueryString["ROLENAME"].ToString() : ""),
            isactive = ((!string.IsNullOrEmpty(Request.QueryString["ISACTIVE"])) ? Request.QueryString["ISACTIVE"].ToString() : ""),
            action = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString() : ""),
            nearby = ((!string.IsNullOrEmpty(Request.QueryString["NEARBY"])) ? Request.QueryString["NEARBY"].ToString() : ""),
            Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString() : "");

        username = ((!string.IsNullOrEmpty(username)) ? AESEncrytDecry.DecryptStringAES(username) : string.Empty); mid = ((!string.IsNullOrEmpty(mid)) ? AESEncrytDecry.DecryptStringAES(mid) : string.Empty); RoleID = ((!string.IsNullOrEmpty(RoleID)) ? AESEncrytDecry.DecryptStringAES(RoleID) : string.Empty);
        isactive = ((!string.IsNullOrEmpty(isactive)) ? AESEncrytDecry.DecryptStringAES(isactive) : string.Empty); action = ((!string.IsNullOrEmpty(action)) ? AESEncrytDecry.DecryptStringAES(action) : string.Empty); nearby = ((!string.IsNullOrEmpty(nearby)) ? AESEncrytDecry.DecryptStringAES(nearby) : string.Empty);
        Id = ((!string.IsNullOrEmpty(Id)) ? AESEncrytDecry.DecryptStringAES(Id) : string.Empty);

        DataTable table = generate();
        DataRow row = table.NewRow();
        string Result = DataAccess.UpdateUsers(username, mid, RoleID, isactive, action, nearby, Id).Rows[0]["RESULT"].ToString();
        row["RESULT"] = Result;
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }


    private static string DecryptAES(string cipherText)
    {
        if (string.IsNullOrWhiteSpace(cipherText))
            return string.Empty;

        try
        {
            string keyString = "9090909090909090";
            string ivString = "9090909090909090";

            byte[] key = Encoding.UTF8.GetBytes(keyString);
            byte[] iv = Encoding.UTF8.GetBytes(ivString);

            string decodedInput = Uri.UnescapeDataString(cipherText);

            int mod4 = decodedInput.Length % 4;
            if (mod4 > 0)
            {
                decodedInput += new string('=', 4 - mod4);
            }

            byte[] buffer = Convert.FromBase64String(decodedInput);

            using (Aes aes = Aes.Create())
            {
                aes.Key = key;
                aes.IV = iv;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                using (ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                using (MemoryStream ms = new MemoryStream(buffer))
                using (CryptoStream cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
                using (StreamReader reader = new StreamReader(cs))
                {
                    return reader.ReadToEnd();
                }
            }
        }
        catch (FormatException ex)
        {
            return string.Empty;
        }
        catch (CryptographicException ex)
        {
            return string.Empty;
        }
    }


    private DataSet setRoleValus()
    {
        string ROLEID = "", TREEID = "", Value = "", isactive = "";

        if (!string.IsNullOrEmpty(Request.QueryString["ROLEID"]))
            ROLEID = DecryptAES(Request.QueryString["ROLEID"]);

        if (!string.IsNullOrEmpty(Request.QueryString["TREEID"]))
            TREEID = DecryptAES(Request.QueryString["TREEID"]);

        if (!string.IsNullOrEmpty(Request.QueryString["VALUE"]))
            Value = DecryptAES(Request.QueryString["VALUE"]);

        if (!string.IsNullOrEmpty(Request.QueryString["ISACTIVE"]))
            isactive = DecryptAES(Request.QueryString["ISACTIVE"]);

        DataTable table = generate();
        DataRow row = table.NewRow();

        string Result = DataAccess.setRoleValues(ROLEID, TREEID, Value, isactive).Rows[0]["RESULT"].ToString();
        row["RESULT"] = Result;

        table.Rows.Add(row);
        DataSet DS = new DataSet();
        DS.Tables.Add(table);

        return DS;
    }

    private DataSet UpdateRoleValus()
    {
        //UPDATEROLE & ROLENAME = " + RoleName + " & ISACTIVE = " + Isactive + " & ACTION = " + Action + " & TREEID = " + ETreeID + " & ID = " + ERoleID,
        string ROLENAME = ((!string.IsNullOrEmpty(Request.QueryString["ROLENAME"])) ? Request.QueryString["ROLENAME"].ToString() : ""),
            TREEID = ((!string.IsNullOrEmpty(Request.QueryString["TREEID"])) ? Request.QueryString["TREEID"].ToString() : ""),
            ACTION = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString() : ""),
            ISACTIVE = ((!string.IsNullOrEmpty(Request.QueryString["ISACTIVE"])) ? Request.QueryString["ISACTIVE"].ToString() : ""),
            ID = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString() : "");

        ROLENAME = ((!string.IsNullOrEmpty(ROLENAME)) ? AESEncrytDecry.DecryptStringAES(ROLENAME) : string.Empty); ACTION = ((!string.IsNullOrEmpty(ACTION)) ? AESEncrytDecry.DecryptStringAES(ACTION) : string.Empty);
        TREEID = ((!string.IsNullOrEmpty(TREEID)) ? AESEncrytDecry.DecryptStringAES(TREEID) : string.Empty); ID = ((!string.IsNullOrEmpty(ID)) ? AESEncrytDecry.DecryptStringAES(ID) : string.Empty);
        ISACTIVE = ((!string.IsNullOrEmpty(ISACTIVE)) ? AESEncrytDecry.DecryptStringAES(ISACTIVE) : string.Empty);

        DataTable table = generate();
        DataRow row = table.NewRow();
        string Result = DataAccess.UpdateRoleValues(ROLENAME, TREEID, ACTION, ISACTIVE, ID).Rows[0]["RESULT"].ToString();
        row["RESULT"] = Result;
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }



    private DataSet GetSearchedLocationGM()
    {
        var sb = new StringBuilder();
        string Location = ((!string.IsNullOrEmpty(Request.QueryString["LOCATION"])) ? Request.QueryString["LOCATION"].ToString().ToUpper() : ""),
             Gpid = ((!string.IsNullOrEmpty(Request.QueryString["GROUPID"])) ? Request.QueryString["GROUPID"].ToString().ToUpper() : ""),
        sType = ((!string.IsNullOrEmpty(Request.QueryString["STYPE"])) ? Request.QueryString["STYPE"].ToString().ToUpper() : ""); ;
        HtmlTable Tmptable = new HtmlTable() { Width = "90%" }; Tmptable.Attributes.Add("style", "margin-left:10%;"); Tmptable.Attributes.Add("class", "ZoneLocation");


        HtmlGenericControl ul = new HtmlGenericControl("ul"); ul.Attributes.Add("class", "LocationList");


        if (!string.IsNullOrEmpty(Location))
        {
            DataTable DtSearchedLocations = DataLayer.GetGroupLocation(Location, Gpid, sType);
            foreach (DataRow dr in DtSearchedLocations.Rows)
            {
                HtmlGenericControl li = new HtmlGenericControl("li") { ID = sType + "Loc-" + dr["Id"].ToString(), ClientIDMode = ClientIDMode.Static };
                // HtmlImage img = new HtmlImage() { Src = "../images/location.png", Width = 30 }; img.Attributes.Add("style", "padding-right:15px;");
                HtmlGenericControl span = new HtmlGenericControl("span") { InnerHtml = dr["ZONENAME"].ToString().Trim().ToUpper() };
                HtmlImage Addimg = new HtmlImage() { Src = (dr["PROCESS"].ToString().Trim().ToUpper() == "1") ? "../images/add1.png" : "../images/adddis.png", Width = 35 }; Addimg.Attributes.Add("style", "padding-right:15px;");
                //  li.Controls.Add(img);
                if (dr["PROCESS"].ToString().Trim().ToUpper() == "1")
                    Addimg.Attributes.Add("onclick", "AddLocation('" + dr["Id"] + "','" + dr["ZONENAME"].ToString().Trim().ToUpper() + "','" + sType + "')");
                li.Controls.Add(Addimg); li.Controls.Add(span);

                ul.Controls.Add(li);
            }

        }
        ul.RenderControl(new HtmlTextWriter(new StringWriter(sb)));
        DataTable table = generate();
        DataRow row = table.NewRow();
        row["RESULT"] = sb.ToString();
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }

    private DataSet GetSearchedLocation()
    {
        var sb = new StringBuilder();
        string Location = ((!string.IsNullOrEmpty(Request.QueryString["LOCATION"])) ? Request.QueryString["LOCATION"].ToString().ToUpper() : ""),
            CurIds = ((!string.IsNullOrEmpty(Request.QueryString["CURIDS"])) ? Request.QueryString["CURIDS"].ToString().ToUpper() : "");
        HtmlTable Tmptable = new HtmlTable() { Width = "90%" }; Tmptable.Attributes.Add("style", "margin-left:10%;"); Tmptable.Attributes.Add("class", "ZoneLocation");


        HtmlGenericControl ul = new HtmlGenericControl("ul"); ul.Attributes.Add("class", "LocationList");


        if (!string.IsNullOrEmpty(Location))
        {
            DataTable DtSearchedLocations = DataAccess.GetRecords("SP_SEARCHLOCATION", "@LOCATION", Location, "@CURIDS", CurIds);
            foreach (DataRow dr in DtSearchedLocations.Rows)
            {
                HtmlGenericControl li = new HtmlGenericControl("li") { ID = "LMLoc-" + dr["Id"].ToString(), ClientIDMode = ClientIDMode.Static };
                HtmlImage img = new HtmlImage() { Src = "../images/location.png", Width = 30 }; img.Attributes.Add("style", "padding-right:15px;");
                HtmlGenericControl span = new HtmlGenericControl("span") { InnerHtml = dr["ZONENAME"].ToString().Trim().ToUpper() };
                li.Controls.Add(img); li.Controls.Add(span);
                li.Attributes.Add("onclick", "BindLocation('" + dr["Id"] + "','" + dr["ZONENAME"].ToString().Trim().ToUpper() + "','" + dr["HAYWOOD"].ToString().Trim().ToUpper() + "')");
                ul.Controls.Add(li);
            }

        }
        ul.RenderControl(new HtmlTextWriter(new StringWriter(sb)));
        DataTable table = generate();
        DataRow row = table.NewRow();
        row["RESULT"] = sb.ToString();
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
    private DataSet SaveRole()
    {
        string ROLENAME = ((!string.IsNullOrEmpty(Request.QueryString["ROLENAME"])) ? Request.QueryString["ROLENAME"].ToString().ToUpper() : ""),
            ROLEID = ((!string.IsNullOrEmpty(Request.QueryString["ROLEID"])) ? Request.QueryString["ROLEID"].ToString().ToUpper() : ""),
            TREEID = ((!string.IsNullOrEmpty(Request.QueryString["TREEID"])) ? Request.QueryString["TREEID"].ToString().ToUpper() : "");
        DataTable table = generate();
        DataRow row = table.NewRow();

        if (ROLEID.Length == 0)
        {
            string Result = DataAccess.RoleMaster(string.Empty, ROLENAME, true, "INSERTANDGET", string.Empty).Rows[0]["RESULT"].ToString();
            ROLEID = (Result == "FALSE") ? string.Empty : Result;
        }
        if (!string.IsNullOrEmpty(ROLEID))
        {
            string Result = DataAccess.RoleMaster(ROLEID, ROLENAME, true, "UPDATEROLENAME", string.Empty).Rows[0]["RESULT"].ToString();
            if (Result == "TRUE")
            {
                RemoveRole(ROLEID);
                foreach (string TID in TREEID.Split('_'))
                    BindPagewithRole(TID, ROLEID);
            }
            row["RESULT"] = Result;
        }
        else
        {
            row["RESULT"] = "FALSE";
        }
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
    private DataSet DeleteRole()
    {
        string ROLEID = ((!string.IsNullOrEmpty(Request.QueryString["ROLEID"])) ? Request.QueryString["ROLEID"].ToString().ToUpper() : "");
        DataTable table = generate();
        DataRow row = table.NewRow();
        if (!string.IsNullOrEmpty(ROLEID))
        {
            string Result = DataAccess.RoleMaster(ROLEID, string.Empty, true, "DELETE", string.Empty).Rows[0]["RESULT"].ToString();
            row["RESULT"] = Result;
            if (Result == "TRUE")
                RemoveRole(ROLEID);
        }
        else
        {
            row["RESULT"] = "FALSE";
        }
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
    private void BindPagewithRole(string TID, string ROLEID)
    {
        DataAccess.RoleMaster(ROLEID, string.Empty, true, "BINDPAGE", TID);
    }

    private void RemoveRole(string RoleID)
    {
        DataAccess.RoleMaster(RoleID, string.Empty, true, "REMOVEROLERELATION", string.Empty);
    }

    private DataSet Mapping()
    {
        string PorterId = ((!string.IsNullOrEmpty(Request.QueryString["PORTERID"])) ? Request.QueryString["PORTERID"].ToString().ToUpper() : ""),
            TagId = ((!string.IsNullOrEmpty(Request.QueryString["TAGID"])) ? Request.QueryString["TAGID"].ToString().ToUpper() : "");
        bool res = (DataAccess.TagMaster("MAPPING", PorterId, TagId, false).Rows[0]["RESULT"].ToString() == "TRUE");
        DataTable table = generate();
        DataRow row = table.NewRow();
        if (res)
            row["RESULT"] = "TRUE";
        else
            row["RESULT"] = "FALSE";
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }

    private DataSet GetMappingRecords()
    {
        int status = Convert.ToInt32(((!string.IsNullOrEmpty(Request.QueryString["STATUS"])) ? Request.QueryString["STATUS"].ToString().ToUpper() : "0"));
        DataTable table = new DataTable();
        table = DataAccess.getRecords("SP_GETMAPPINGRECORDS").Tables[status].Copy();
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }


    private DataSet GetFloorsLocations()
    {
        DataTable table = new DataTable();
        table = DataAccess.getRecords("SP_GETFLOORS_LOCATIONS").Tables[0].Copy();
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }



    private DataSet GetFloorsandKitchens()
    {

        //string ServiceID = ((!string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? Request.QueryString["SERVICEID"].ToString() : "");
        //ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID);
        //DataTable table = new DataTable();
        //table = DataAccess.GetRecord("SP_GETFLOORSKITCHENS", "@SERVICEID", ServiceID).Tables[0].Copy();
        DataSet DS = new DataSet(); //DS.Tables.Add(table);
        return DS;
    }


    private DataSet GetRoles()
    {
        DataTable table = new DataTable();
        table = DataAccess.getRecords("SP_GETROLES_USERS").Tables[0].Copy();
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }


    private DataSet GetRolesWebUser()
    {
        DataTable table = new DataTable();

        string search = "";

        if (!string.IsNullOrEmpty(Request.QueryString["SEARCH"]))
        {
            string encryptedSearch = Request.QueryString["SEARCH"];
            search = DecryptAES(encryptedSearch).ToUpper();
        }

        table = DataAccess.GetRecord("SP_GETROLES_WEBUSERS", "@SEARCH", search).Tables[0].Copy();
        DataSet DS = new DataSet();
        DS.Tables.Add(table);
        return DS;
    }

    private DataSet LogOut()
    {
        ClearSession();
        DataTable table = generate();
        DataRow row = table.NewRow();
        row["RESULT"] = "../Login.aspx";
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }

    private void ClearSession()
    {
        Session["ID"] = null;
        Session["NAME"] = null;
        Session["PASSWORD"] = null;
        Session["ROLE"] = null;
    }

    private DataSet ModifyIsEmpty(DataSet ds)
    {
        DataTable table, table2 = ds.Tables[1].Copy(); ; DataRow row;
        table = GenerateDynamic(ds.Tables[0]); row = table.NewRow();
        foreach (DataColumn col in table.Columns)
            row[col.ColumnName] = "0";
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table); DS.Tables.Add(table2);
        return DS;
    }

    private DataTable GenerateDynamic(DataTable dt)
    {
        DataColumn column;
        var table = new DataTable() { TableName = "TBDYN" };
        foreach (DataColumn col in dt.Columns)
        {
            column = new DataColumn();
            column.DataType = System.Type.GetType("System.String");
            column.ColumnName = col.ColumnName;
            table.Columns.Add(column);
        }
        return table;
    }
    private DataTable generate()
    {
        DataColumn column;
        DataRow row;
        var table = new DataTable() { TableName = "OptionAdd" };
        column = new DataColumn();
        column.DataType = System.Type.GetType("System.String");
        column.ColumnName = "RESULT";
        table.Columns.Add(column);
        return table;
    }

    private void setSession(string Role)
    {
        Session["ID"] = Role.Split('_')[0].ToString();
        Session["NAME"] = Role.Split('_')[1].ToString();
        Session["PASSWORD"] = Role.Split('_')[2].ToString();
        Session["ROLE"] = Role.Split('_')[3].ToString();
    }
    private DataSet UpdatePassword()
    {
        string password = ((!string.IsNullOrEmpty(Request.QueryString["PWD"])) ? Request.QueryString["PWD"].ToString() : ""),
               id = (string.IsNullOrEmpty(Request.QueryString["USERID"])) ? string.Empty : Request.QueryString["USERID"].ToString().ToUpper();
        bool result = (DataAccess.UserMaster(id, string.Empty, string.Empty, password, string.Empty, true, "UPDATE").Rows[0]["RESULT"].ToString() == "TRUE");
        DataTable table = generate();
        DataRow row = table.NewRow();
        if (result)
            row["RESULT"] = "TRUE";
        else
            row["RESULT"] = "FALSE";
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
    private DataSet MailSettings()
    {
        string fromMail = ((!string.IsNullOrEmpty(Request.QueryString["FROM"])) ? Request.QueryString["FROM"].ToString() : ""),
               To = ((!string.IsNullOrEmpty(Request.QueryString["TO"])) ? Request.QueryString["TO"].ToString() : ""),
               cc = ((!string.IsNullOrEmpty(Request.QueryString["CC"])) ? Request.QueryString["CC"].ToString() : ""),
               TATTo = ((!string.IsNullOrEmpty(Request.QueryString["TATTO"])) ? Request.QueryString["TATTO"].ToString() : ""),
               TATcc = ((!string.IsNullOrEmpty(Request.QueryString["TATCC"])) ? Request.QueryString["TATCC"].ToString() : ""),
               DailyTo = ((!string.IsNullOrEmpty(Request.QueryString["DAILYTO"])) ? Request.QueryString["DAILYTO"].ToString() : ""),
               Dailycc = ((!string.IsNullOrEmpty(Request.QueryString["DAILYCC"])) ? Request.QueryString["DAILYCC"].ToString() : ""),
               server = ((!string.IsNullOrEmpty(Request.QueryString["SERVER"])) ? Request.QueryString["SERVER"].ToString() : ""),
               Port = ((!string.IsNullOrEmpty(Request.QueryString["PORT"])) ? Request.QueryString["PORT"].ToString() : "");

        bool result = (DataAccess.MailMaster(fromMail, To, cc, TATTo, TATcc, DailyTo, Dailycc, server, Port, "UPDATE").Rows[0]["RESULT"].ToString() == "TRUE");
        DataTable table = generate();
        DataRow row = table.NewRow();
        if (result)
            row["RESULT"] = "TRUE";
        else
            row["RESULT"] = "FALSE";
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }


    public DataSet PresetOperations()
    {
        string Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString() : ""),
             Process = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString() : ""),
             Msg = ((!string.IsNullOrEmpty(Request.QueryString["MSG"])) ? Request.QueryString["MSG"].ToString() : ""),
             GroupName = ((!string.IsNullOrEmpty(Request.QueryString["GROUP"])) ? Request.QueryString["GROUP"].ToString() : ""),
             ServiceID = ((string.IsNullOrEmpty(Request.QueryString["SERVICEID"])) ? string.Empty : Request.QueryString["SERVICEID"].ToString());

        Msg = AESEncrytDecry.DecryptStringAES(Msg); GroupName = AESEncrytDecry.DecryptStringAES(GroupName); Id = AESEncrytDecry.DecryptStringAES(Id); Process = AESEncrytDecry.DecryptStringAES(Process); ServiceID = AESEncrytDecry.DecryptStringAES(ServiceID);


        DataTable dt = DataAccess.PersetMaster("SP_PRESETMASTER", Msg, GroupName, Id, Process, ServiceID).Tables[0];

        DataSet DS = new DataSet(); DS.Tables.Add(dt.Copy());
        return DS;
    }


    public DataSet RequestGroupOperation()
    {
        string Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString().ToUpper() : ""),
             Process = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString().ToUpper() : ""),
             GroupName = ((!string.IsNullOrEmpty(Request.QueryString["GROUP"])) ? Request.QueryString["GROUP"].ToString().ToUpper() : ""),
             Isactive = ((!string.IsNullOrEmpty(Request.QueryString["ISACTIVE"])) ? Request.QueryString["ISACTIVE"].ToString().ToUpper() : "");
        DataTable dt = DataAccess.RequestGroup(GroupName, Isactive, Id, Process).Tables[0];

        DataSet DS = new DataSet(); DS.Tables.Add(dt.Copy());
        return DS;
    }
    public DataSet departmentOperation()
    {
        string Id = ((!string.IsNullOrEmpty(Request.QueryString["ID"])) ? Request.QueryString["ID"].ToString().ToUpper() : ""),
             Process = ((!string.IsNullOrEmpty(Request.QueryString["ACTION"])) ? Request.QueryString["ACTION"].ToString().ToUpper() : ""),
             Dept = ((!string.IsNullOrEmpty(Request.QueryString["DEPT"])) ? Request.QueryString["DEPT"].ToString().ToUpper() : ""),
             Is24Hrs = ((!string.IsNullOrEmpty(Request.QueryString["IS24HRS"])) ? Request.QueryString["IS24HRS"].ToString().ToUpper() : "");
        DataTable dt = DataAccess.Departmentmaster("SP_DEPARTMENTMASTER", Dept, Is24Hrs, Id, Process).Tables[0];

        DataSet DS = new DataSet(); DS.Tables.Add(dt.Copy());
        return DS;
    }
    private DataSet GetDeptLocation()
    {
        var sb = new StringBuilder();
        string Location = ((!string.IsNullOrEmpty(Request.QueryString["LOCATION"])) ? Request.QueryString["LOCATION"].ToString().ToUpper() : ""),
               DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        HtmlTable Tmptable = new HtmlTable() { Width = "90%" }; Tmptable.Attributes.Add("style", "margin-left:10%;"); Tmptable.Attributes.Add("class", "ZoneLocation");
        DataTable DtSearchedLocations = new DataTable();
        if (!string.IsNullOrEmpty(Location))
        {
            DtSearchedLocations = DataAccess.GetRecords("SP_SEARCHLOCATION_DEPT", "@LOCATION", Location, "@DEPTID", DeptID);
            foreach (DataRow dr in DtSearchedLocations.Rows)
            {
                HtmlTableRow tr = new HtmlTableRow(); HtmlTableCell tc = new HtmlTableCell() { Align = "left" }; RadioButton RBtn = new RadioButton() { ID = "Loc-" + dr["Id"].ToString(), Text = dr["Location"].ToString().Trim().ToUpper(), ClientIDMode = ClientIDMode.Static, GroupName = dr["Location"].ToString() };
                RBtn.Attributes.Add("onclick", "BindDeptLocation('" + dr["Id"] + "','" + dr["Location"].ToString().Trim().ToUpper() + "','" + dr["BEDID"].ToString().Trim().ToUpper() + "')");
                RBtn.Attributes.Add("style", "font-family: monospace;font-weight: bold;color: rgb(30, 70, 129);padding:8px;font-size: 14px;");
                tr.Controls.Add(tc); tc.Controls.Add(RBtn); Tmptable.Controls.Add(tr);
            }
        }
        Tmptable.RenderControl(new HtmlTextWriter(new StringWriter(sb)));
        DataTable table = generate();
        DataRow row = table.NewRow();
        row["RESULT"] = sb.ToString();
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
    private DataSet GetDeptUser()
    {
        var sb = new StringBuilder();
        string User = ((!string.IsNullOrEmpty(Request.QueryString["USER"])) ? Request.QueryString["USER"].ToString().ToUpper() : ""),
        DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        HtmlTable Tmptable = new HtmlTable() { Width = "90%" }; Tmptable.Attributes.Add("style", "margin-left:10%;"); Tmptable.Attributes.Add("class", "ZoneLocation");
        DataTable DtSearchedLocations = new DataTable();
        if (!string.IsNullOrEmpty(User))
        {
            DtSearchedLocations = DataAccess.GetRecords("SP_SEARCHUSER_DEPT", "@USERNAME", User, "@DEPTID", DeptID);
            foreach (DataRow dr in DtSearchedLocations.Rows)
            {
                HtmlTableRow tr = new HtmlTableRow(); HtmlTableCell tc = new HtmlTableCell() { Align = "left" }; RadioButton RBtn = new RadioButton() { ID = "Loc-" + dr["Id"].ToString(), Text = dr["USERNAME"].ToString().Trim().ToUpper(), ClientIDMode = ClientIDMode.Static, GroupName = dr["USERNAME"].ToString() };
                RBtn.Attributes.Add("onclick", "BindUserLocation('" + dr["Id"] + "','" + dr["USERNAME"].ToString().Trim().ToUpper() + "')");
                RBtn.Attributes.Add("style", "font-family: monospace;font-weight: bold;color: rgb(30, 70, 129);padding:8px;font-size: 14px;");
                tr.Controls.Add(tc); tc.Controls.Add(RBtn); Tmptable.Controls.Add(tr);
            }
        }
        Tmptable.RenderControl(new HtmlTextWriter(new StringWriter(sb)));
        DataTable table = generate();
        DataRow row = table.NewRow();
        row["RESULT"] = sb.ToString();
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }


    private DataSet GetDeptPorters()
    {
        var sb = new StringBuilder();
        string Porter = ((!string.IsNullOrEmpty(Request.QueryString["PORTER"])) ? Request.QueryString["PORTER"].ToString().ToUpper() : ""),
        DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        HtmlTable Tmptable = new HtmlTable() { Width = "90%" }; Tmptable.Attributes.Add("style", "margin-left:10%;"); Tmptable.Attributes.Add("class", "ZoneLocation");
        DataTable DtSearchedLocations = new DataTable();
        if (!string.IsNullOrEmpty(Porter))
        {
            DtSearchedLocations = DataAccess.GetRecords("SP_SEARCHPORTER_DEPT", "@PORTERNAME", Porter, "@DEPTID", DeptID);
            foreach (DataRow dr in DtSearchedLocations.Rows)
            {
                HtmlTableRow tr = new HtmlTableRow(); HtmlTableCell tc = new HtmlTableCell() { Align = "left" }; RadioButton RBtn = new RadioButton() { ID = "Loc-" + dr["Id"].ToString(), Text = dr["PORTERNAME"].ToString().Trim().ToUpper(), ClientIDMode = ClientIDMode.Static, GroupName = dr["PORTERNAME"].ToString() };
                RBtn.Attributes.Add("onclick", "BindPorterLocation('" + dr["Id"] + "','" + dr["PORTERNAME"].ToString().Trim().ToUpper() + "')");
                RBtn.Attributes.Add("style", "font-family: monospace;font-weight: bold;color: rgb(30, 70, 129);padding:8px;font-size: 14px;");
                tr.Controls.Add(tc); tc.Controls.Add(RBtn); Tmptable.Controls.Add(tr);
            }
        }
        Tmptable.RenderControl(new HtmlTextWriter(new StringWriter(sb)));
        DataTable table = generate();
        DataRow row = table.NewRow();
        row["RESULT"] = sb.ToString();
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }

    public DataSet UpdateDept()
    {
        string LOCID = ((!string.IsNullOrEmpty(Request.QueryString["LOCID"])) ? Request.QueryString["LOCID"].ToString().ToUpper() : ""),
             TABLE = ((!string.IsNullOrEmpty(Request.QueryString["TABLE"])) ? Request.QueryString["TABLE"].ToString().ToUpper() : ""),
               DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        DataTable dt = DataAccess.GetRecords("SP_UPDATEDEPT", "@TABLE", TABLE, "@ID", LOCID, "@DEPTID", DeptID);

        DataSet DS = new DataSet(); DS.Tables.Add(dt.Copy());
        return DS;
    }
    public DataSet RemoveDept()
    {
        string LOCID = ((!string.IsNullOrEmpty(Request.QueryString["LOCID"])) ? Request.QueryString["LOCID"].ToString().ToUpper() : ""),
             TABLE = ((!string.IsNullOrEmpty(Request.QueryString["TABLE"])) ? Request.QueryString["TABLE"].ToString().ToUpper() : ""),
               DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        DataTable dt = DataAccess.GetRecords("SP_REMOVEDEPTLOCATION", "@TABLE", TABLE, "@ID", LOCID, "@DEPTID", DeptID);

        DataSet DS = new DataSet(); DS.Tables.Add(dt.Copy());
        return DS;
    }

    public DataSet GetDeptDetails()
    {
        string TABLE = ((!string.IsNullOrEmpty(Request.QueryString["TABLE"])) ? Request.QueryString["TABLE"].ToString().ToUpper() : ""),
               DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        DataTable dt = DataAccess.GetRecords("SP_GETDEPTDETAILS", "@TABLE", TABLE, "@DEPTID", DeptID);

        DataSet DS = new DataSet(); DS.Tables.Add(dt.Copy());
        return DS;
    }

    public DataSet GetRGDetails()
    {
        string TABLE = ((!string.IsNullOrEmpty(Request.QueryString["TABLE"])) ? Request.QueryString["TABLE"].ToString().ToUpper() : ""),
               DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        DataTable dt = DataAccess.GetRecords("SP_GETRGDETAILS", "@TABLE", TABLE, "@RGID", DeptID);

        DataSet DS = new DataSet(); DS.Tables.Add(dt.Copy());
        return DS;
    }


    public DataSet UpdateRG()
    {
        string LOCID = ((!string.IsNullOrEmpty(Request.QueryString["LOCID"])) ? Request.QueryString["LOCID"].ToString().ToUpper() : ""),
             TABLE = ((!string.IsNullOrEmpty(Request.QueryString["TABLE"])) ? Request.QueryString["TABLE"].ToString().ToUpper() : ""),
               DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        DataTable dt = DataAccess.GetRecords("SP_UPDATEREQUESTGROUP", "@TABLE", TABLE, "@ID", LOCID, "@RGID", DeptID);

        DataSet DS = new DataSet(); DS.Tables.Add(dt.Copy());
        return DS;
    }


    public DataSet RemoveRG()
    {
        string LOCID = ((!string.IsNullOrEmpty(Request.QueryString["LOCID"])) ? Request.QueryString["LOCID"].ToString().ToUpper() : ""),
             TABLE = ((!string.IsNullOrEmpty(Request.QueryString["TABLE"])) ? Request.QueryString["TABLE"].ToString().ToUpper() : ""),
               DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        DataTable dt = DataAccess.GetRecords("SP_REMOVERGDETAILS", "@TABLE", TABLE, "@ID", LOCID, "@DEPTID", DeptID);

        DataSet DS = new DataSet(); DS.Tables.Add(dt.Copy());
        return DS;
    }


    private DataSet SearchRG()
    {
        var sb = new StringBuilder();
        //string User = ((!string.IsNullOrEmpty(Request.QueryString["USER"])) ? Request.QueryString["USER"].ToString().ToUpper() : ""),
        //DeptID = ((!string.IsNullOrEmpty(Request.QueryString["DEPTID"])) ? Request.QueryString["DEPTID"].ToString().ToUpper() : "");
        string Value = ((!string.IsNullOrEmpty(Request.QueryString["VALUE"])) ? Request.QueryString["VALUE"].ToString().ToUpper() : ""),
             TABLE = ((!string.IsNullOrEmpty(Request.QueryString["TABLE"])) ? Request.QueryString["TABLE"].ToString().ToUpper() : ""),
               RGId = ((!string.IsNullOrEmpty(Request.QueryString["RGID"])) ? Request.QueryString["RGID"].ToString().ToUpper() : "");


        HtmlTable Tmptable = new HtmlTable() { Width = "90%" }; Tmptable.Attributes.Add("style", "margin-left:10%;"); Tmptable.Attributes.Add("class", "ZoneLocation");
        DataTable DtSearchedLocations = new DataTable();
        if (!string.IsNullOrEmpty(Value))
        {
            DtSearchedLocations = DataAccess.GetRecords("SP_SEARCH_REQUESTGROUP", "@VALUE", Value, "@TABLE", TABLE, "@RGID", RGId); //DataAccess.GetRecords("SP_SEARCHUSER_DEPT", "@USERNAME", User, "@DEPTID", DeptID);
            foreach (DataRow dr in DtSearchedLocations.Rows)
            {
                string ColumnName = (TABLE == "LOCATION") ? "LOCATION" : ((TABLE == "USER") ? "USERNAME" : "CATEGORYNAME");
                string BindFunction = ((TABLE == "LOCATION") ? "BindRGLocation" : ((TABLE == "USER") ? "BindRGUser" : "BindRGPorter")) + "('" + dr["Id"] + "','" + dr[ColumnName].ToString().Trim().ToUpper() + "')";
                HtmlTableRow tr = new HtmlTableRow(); HtmlTableCell tc = new HtmlTableCell() { Align = "left" }; RadioButton RBtn = new RadioButton() { ID = "Loc_" + dr["Id"].ToString(), Text = dr[ColumnName].ToString().Trim().ToUpper(), ClientIDMode = ClientIDMode.Static, GroupName = dr[ColumnName].ToString() };
                RBtn.Attributes.Add("onclick", BindFunction);
                RBtn.Attributes.Add("style", "font-family: monospace;font-weight: bold;color: rgb(30, 70, 129);padding:8px;font-size: 14px;");
                tr.Controls.Add(tc); tc.Controls.Add(RBtn); Tmptable.Controls.Add(tr);
            }
        }
        Tmptable.RenderControl(new HtmlTextWriter(new StringWriter(sb)));
        DataTable table = generate();
        DataRow row = table.NewRow();
        row["RESULT"] = sb.ToString();
        table.Rows.Add(row);
        DataSet DS = new DataSet(); DS.Tables.Add(table);
        return DS;
    }
}
