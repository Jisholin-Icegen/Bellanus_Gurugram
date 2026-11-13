using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class FoodDashboard_Assembler : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            // TODO: pull the logged-in staff member's identity from Session,
            // same way the other FoodDashboard pages do (see spanUserName in
            // DietTypeManagement.aspx / OMI-style session handling).
            // Example:
            // if (Session["UserID"] == null) { Response.Redirect("~/login.aspx"); return; }
            // HFStaffID.Value = Session["UserID"].ToString();
            // HFStaffRole.Value = Session["RoleName"].ToString();
        }
    }
}