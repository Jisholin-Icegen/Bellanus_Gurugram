<%@ Application Language="C#" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Data" %>
<%@ Import Namespace="System.Net" %>
<%@ Import Namespace="System.Web" %>
<%@ Import Namespace="System.Web.UI.HtmlControls" %>
<%@ Import Namespace="System.Configuration" %>

<script RunAt="server">

    private static System.Timers.Timer mTimer;

    void Application_Start(object sender, EventArgs e)
    {
        try
        {
            mTimer = new System.Timers.Timer();

            mTimer.Interval = 1000;
            mTimer.AutoReset = true;

            mTimer.Elapsed +=
                new System.Timers.ElapsedEventHandler(mTimer_Elapsed);

            mTimer.Start();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine(
                "Timer initialization error: " + ex.Message
            );
        }
    }


    protected void Application_BeginRequest(object sender, EventArgs e)
    {
        try
        {
            Tenant.ResolveFromRequest(Request);

            string hospitalCode = Tenant.CurrentCode;

            if (!string.IsNullOrEmpty(hospitalCode))
            {
                string tenantCs =
                    Tenant.GetConnectionString(hospitalCode);

                if (!string.IsNullOrEmpty(tenantCs))
                {

                    HttpContext.Current.Items["TenantCode"] =
                        hospitalCode;

                    HttpContext.Current.Items["TenantConnectionString"] =
                        tenantCs;
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine(
                "Tenant resolution error: " + ex.Message
            );

            throw;
        }
    }


    protected void Application_EndRequest(object sender, EventArgs e)
    {
        try
        {

            string path = Request.AppRelativeCurrentExecutionFilePath.ToLower();
            if (path.Contains("/service/") || path.EndsWith(".asmx") || path.EndsWith(".ashx"))
                return;

            if (Response.ContentType != null &&
                Response.ContentType.IndexOf("text/html", StringComparison.OrdinalIgnoreCase) >= 0 &&
                Response.StatusCode == 200 &&
                !Response.IsRequestBeingRedirected)
            {
                string script =
                    "<scr" + "ipt type='text/javascript'>" +
                    "(function() {" +
                    "if(typeof jQuery === 'undefined') return;" +
                    "if(window._hospPrefilter) return;" +
                    "window._hospPrefilter = true;" +
                    "jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {" +
                    "try {" +
                    "var h = sessionStorage.getItem('HOSPITAL');" +
                    "if(h && typeof Encrypt === 'function') {" +
                    "xhr.setRequestHeader('X-Hospital', Encrypt(h).toString());" +
                    "}" +
                    "} catch(e) {" +
                    "console.error('Hospital AJAX header error:', e);" +
                    "}" +
                    "});" +
                    "})();" +
                    "</scr" + "ipt>";

                Response.Write(script);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine("EndRequest error: " + ex.Message);
        }
    }

    public void mTimer_Elapsed(
        object sender,
        System.Timers.ElapsedEventArgs e)
    {
        try
        {
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine(
                "Timer elapsed error: " + ex.Message
            );
        }
    }


    void Application_End(object sender, EventArgs e)
    {
        try
        {
            if (mTimer != null)
            {
                mTimer.Stop();
                mTimer.Dispose();
                mTimer = null;
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine(ex.Message);
        }
    }


    void Application_Error(object sender, EventArgs e)
    {
    }


    void Session_Start(object sender, EventArgs e)
    {
    }


    void Session_End(object sender, EventArgs e)
    {
    }

</script>
