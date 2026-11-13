using System;
using System.Collections.Generic;
using System.Configuration;
using System.Text;
using System.Web.Script.Serialization;
using System.Web.Security;

public partial class Index_Index : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string ticket = Request.QueryString["Redirectto"];

        if (!string.IsNullOrEmpty(ticket))
        {
            if (!TryLoginFromTicket(ticket))
            {
                RedirectToLogin();
                return;
            }

            Response.Redirect("~/Index/Index.aspx", false);
            Context.ApplicationInstance.CompleteRequest();
            return;
        }

        if (Session["NAME"] == null)
        {
            RedirectToLogin();
            return;
        }
    }

    private bool TryLoginFromTicket(string ticket)
    {
        try
        {
            byte[] raw = Convert.FromBase64String(ticket.Replace(' ', '+'));
            string json = Encoding.UTF8.GetString(raw);

            var t = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(json);

            long ts = Convert.ToInt64(t["ts"]);
            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            if (Math.Abs(now - ts) > 10 * 60 * 1000) return false;

            string[] p = Convert.ToString(t["u"]).Split('_');
            if (p.Length < 10) return false;

            Session.Clear();
            Session["ID"] = p[0];
            Session["NAME"] = p[1];
            Session["ROLE"] = p[3];
            Session["EXPIRY"] = p[4];
            Session["ROLENAME"] = p[5];
            Session["DEFAULTLOCID"] = p[6];
            Session["DEFAULTLOC"] = p[7];
            Session["SESSIONID"] = p[8];
            Session["LURL"] = p[9];
            Session["LOGOUTURL"] = Convert.ToString(t["lo"]);
            Session["HOSPITAL"] = Convert.ToString(t["h"]);

            FormsAuthentication.SetAuthCookie(p[1], false);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private void RedirectToLogin()
    {
        string central = ConfigurationManager.AppSettings["CentralLoginUrl"];
        Response.Redirect(string.IsNullOrEmpty(central) ? "~/Login.aspx" : central, false);
        Context.ApplicationInstance.CompleteRequest();
    }
}