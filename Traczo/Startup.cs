using Microsoft.Owin;
using Microsoft.Owin.Security.OAuth;
using Owin;
using System;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using Traczo.OauthProvider;
using Traczo.Models;
[assembly: OwinStartup(typeof(Traczo.Startup))]
namespace Traczo
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            OAuthAuthorizationServerOptions options = new OAuthAuthorizationServerOptions
            {
                AllowInsecureHttp = true,
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(5),    
                TokenEndpointPath = new PathString("/Traczo/Authenticat"),
                Provider = new MyOAuthProvider()
                
            };
            app.UseOAuthAuthorizationServer(options);
            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions());

            HttpConfiguration config = new HttpConfiguration();
            config.Filters.Add(new GlobalExceptionFilter());

            var cors = new EnableCorsAttribute(
                    "http://localhost:8080",
                    "*",
                    "*");

            config.EnableCors(cors);

          config.MapHttpAttributeRoutes();
            config.Routes.MapHttpRoute(
                name: "Default",
                routeTemplate: "{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            //    config.Filters.Add(new CustomAuthorization()); //comment
            config.Formatters.JsonFormatter.SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
            // config.Formatters.JsonFormatter.SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/json"));
            app.UseWebApi(config);

        }
    }
}


//using Microsoft.Owin;
//using Microsoft.Owin.Security.OAuth;
//using Owin;
//using System;
//using System.Net.Http.Headers;
//using System.Threading.Tasks;
//using System.Web.Http;
//using Traczo.OauthProvider;
//using Traczo.Models;
//[assembly: OwinStartup(typeof(Traczo.Startup))]

//namespace Traczo
//{
//    public class Startup
//    {
//        public void Configuration(IAppBuilder app)
//        {
//            OAuthAuthorizationServerOptions options = new OAuthAuthorizationServerOptions
//            {
//                AllowInsecureHttp = true,
//                AccessTokenExpireTimeSpan = TimeSpan.FromDays(5),     //FromMinutes   FromDays3 days
//                TokenEndpointPath = new PathString("/Traczo/Authenticat"),
//                Provider = new MyOAuthProvider()
//                //, RefreshTokenProvider = new OAuthCustomRefreshTokenProvider()
//            };
//            app.UseOAuthAuthorizationServer(options);
//            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions());



//            HttpConfiguration config = new HttpConfiguration();


//            config.Filters.Add(new GlobalExceptionFilter());

//            // config.MapHttpAttributeRoutes();
//            config.Routes.MapHttpRoute(
//                name: "Default",
//                routeTemplate: "{controller}/{action}/{id}", 
//                defaults: new { id = RouteParameter.Optional }
//            );
//            //    config.Filters.Add(new CustomAuthorization()); //comment
//                config.Formatters.JsonFormatter.SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
//           // config.Formatters.JsonFormatter.SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/json"));

//            app.UseWebApi(config);


//        }
//    }
//}
