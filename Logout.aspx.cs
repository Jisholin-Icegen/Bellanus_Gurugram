using System;
using System.Web.Security;

public partial class Logout : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string target = null;

        if (Session["LOGOUTURL"] != null)
            target = Session["LOGOUTURL"].ToString();

        FormsAuthentication.SignOut();
        Session.Clear();
        Session.Abandon();

        if (!string.IsNullOrEmpty(target))
            Response.Redirect(target, false);
        else
            Response.Redirect("~/Login.aspx", false);

        Context.ApplicationInstance.CompleteRequest();
    }
}