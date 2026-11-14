using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Routing;

namespace Traczo
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            System.Net.ServicePointManager.SecurityProtocol =
      System.Net.SecurityProtocolType.Tls12;//newly added senthil

            GlobalConfiguration.Configure(WebApiConfig.Register);
             
        }
        
    }
}
