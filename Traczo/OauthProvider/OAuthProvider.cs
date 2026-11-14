using Microsoft.Owin.Security.OAuth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Data;

using Traczo.Models;
using Microsoft.Owin.Security;
using Microsoft.Owin;
using Microsoft.Owin.Security.Infrastructure;

namespace Traczo.OauthProvider
{
    public class MyOAuthProvider : OAuthAuthorizationServerProvider
    {

        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {

            string hosid = context.OwinContext.Get<string>("hospitalid").ToString(), apptype = context.OwinContext.Get<string>("apptype").ToString();

            if (hosid.Contains("_"))
            {
                DataTable dt = new DataTable();
                dt = DataAccess.CheckUser(context.UserName, context.Password, apptype, context.OwinContext.Get<string>("IMEINo").ToString(), hosid.Split('_')[1], "2", hosid.Split('_')[0], "",  context.OwinContext.Get<string>("CleaningZoneId").ToString());


                // if (DataAccess.TokenCheckUser(apptype, context.UserName, context.Password, hosid.Split('_')[1]).Rows[0]["Result"].ToString() == "TRUE")
                if (dt.Rows[0]["Result"].ToString() == "TRUE")
                {
                    _UserDetails = dt.Rows[0]["Result"].ToString() + "$" + dt.Rows[0]["UserId"].ToString() + "$" + dt.Rows[0]["FullName"].ToString() + "$" + dt.Rows[0]["RoleName"].ToString() + "$" + dt.Rows[0]["Result"].ToString() + "$" + dt.Rows[0]["Adhoc"].ToString() + "$" + dt.Rows[0]["WifiName"].ToString() + "$" + dt.Rows[0]["GroupId"].ToString() + "$" + dt.Rows[0]["GroupName"].ToString() + "$" + dt.Rows[0]["IsSupervisor"].ToString() + "$" + dt.Rows[0]["apptype"].ToString() + "$" + dt.Rows[0]["CleaningZoneId"].ToString() + "$" + dt.Rows[0]["IsHaywood"].ToString();
                    var userIdentity = new ClaimsIdentity(context.Options.AuthenticationType);
                    userIdentity.AddClaim(new Claim(ClaimTypes.Name, "traczo"));
                    userIdentity.AddClaim(new Claim(ClaimTypes.Role, "admin"));
                    context.Validated(userIdentity);

                    return;
                }
                else
                {
                    _UserDetails = dt.Rows[0]["Result"].ToString();
                    var userIdentity = new ClaimsIdentity(context.Options.AuthenticationType);
                    userIdentity.AddClaim(new Claim(ClaimTypes.Name, "traczo"));
                    userIdentity.AddClaim(new Claim(ClaimTypes.Role, "admin"));
                    context.Validated(userIdentity);
                    return;
                }

                /*else
                {
                //    https://stackoverflow.com/questions/26336481/how-to-customize-error-message-of-oauthauthorizationserverprovider
                 //   https://stackoverflow.com/questions/26336481/how-to-customize-error-message-of-oauthauthorizationserverprovider

                        //      context.SetError("invalid_credential", "Client credentials could not be retrieved from the Authorization header");

                        string jsonString = "{\"Result\": \"FALSE\"}";

                        // This is just a work around to overcome an unknown internal bug. 
                        // In future releases of Owin, you may remove this.
                        context.SetError(new string(' ', jsonString.Length - 12));

                        context.Response.StatusCode = 400;
                        context.Response.Write(jsonString);
                        context.Rejected();
                        return;
                    } */

            }
            else
            {
                context.SetError("invalid_data", "Client credentials could not be retrieved from the Authorization header");
                context.Rejected();
                return;
            }
            //Guid.NewGuid
        }

        public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {

            if (context.Parameters.Get("grant_type") == null)
            {
                //  context.SetClientAuthError("schema_validation_failed", "Validation failed", "grant_type", "field is missing");
                return;
            }

            if (context.Parameters["grant_type"] == null || context.Parameters["username"] == null || context.Parameters["password"] == null || context.Parameters["hospitalid"] == null || context.Parameters["apptype"] == null)
            {
                context.SetError("invalid_client", "Client credentials could not be retrieved from the Authorization header");
                context.Rejected();
            }
            else
            {
                context.OwinContext.Set<string>("hospitalid", context.Parameters["hospitalid"]);
                context.OwinContext.Set<string>("apptype", context.Parameters["apptype"]);
                context.OwinContext.Set<string>("IMEINo", context.Parameters["IMEINo"]);
                context.OwinContext.Set<string>("CleaningZoneId", context.Parameters["CleaningZoneId"]);


                context.Validated();
            }


        }

        private readonly string _publicClientId;
        private string _UserDetails;

        // public Action<AuthenticationTokenCreateContext> OnCreate { get; internal set; }
        // public Action<AuthenticationTokenCreateContext> OnReceive { get; internal set; }


        // public override   OnCreateAsync (){ get; set; }

        /*   public MyOAuthProvider(string publicClientId)
          {
              if (publicClientId == null)
                  throw new ArgumentNullException("publicClientId");

              _publicClientId = publicClientId;
          }
         public override Task ValidateClientRedirectUri(OAuthValidateClientRedirectUriContext context) //last added
          {
              if (context.ClientId == _publicClientId)
              {
                  var expectedRootUri = new Uri(context.Request.Uri, "/");

                  if (expectedRootUri.AbsoluteUri == context.RedirectUri)
                      context.Validated();
              }
              return Task.FromResult<object>(null);
          }  */

        public override Task TokenEndpointResponse(OAuthTokenEndpointResponseContext context)   //05/19/2023 newly
        {
            return base.TokenEndpointResponse(context);
        }
        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            if (_UserDetails.Split('$')[0] == "TRUE")
            {

                foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
                {
                    if (property.Key == ".issued")
                    {
                        context.AdditionalResponseParameters.Add("issued" //property.Key
                            , Convert.ToDateTime(context.Properties.IssuedUtc.Value.ToString()).ToString("MM/dd/yyyy HH:mm:ss tt"));
                    }
                    else if (property.Key == ".expires")
                    {
                        context.AdditionalResponseParameters.Add("expires" //property.Key
                            , Convert.ToDateTime(context.Properties.ExpiresUtc.Value.ToString()).ToString("MM/dd/yyyy HH:mm:ss tt"));
                    }
                    else
                    {
                        context.AdditionalResponseParameters.Add(property.Key, property.Value);
                    }
                    // context.AdditionalResponseParameters.Add(property.Key, property.Value);
                }

                context.AdditionalResponseParameters.Add("UserId", _UserDetails.Split('$')[1]);
                context.AdditionalResponseParameters.Add("FullName", _UserDetails.Split('$')[2]);
                context.AdditionalResponseParameters.Add("RoleName", _UserDetails.Split('$')[3]);
                context.AdditionalResponseParameters.Add("Result", _UserDetails.Split('$')[4]);
                context.AdditionalResponseParameters.Add("Adhoc", _UserDetails.Split('$')[5]);
                context.AdditionalResponseParameters.Add("WifiName", _UserDetails.Split('$')[6]);
                context.AdditionalResponseParameters.Add("GroupId", _UserDetails.Split('$')[7]);
                context.AdditionalResponseParameters.Add("GroupName", _UserDetails.Split('$')[8]);
                context.AdditionalResponseParameters.Add("IsSupervisor", _UserDetails.Split('$')[9]);
                context.AdditionalResponseParameters.Add("AppType", _UserDetails.Split('$')[10]);
                context.AdditionalResponseParameters.Add("CleaningZoneId", _UserDetails.Split('$')[11]);
                context.AdditionalResponseParameters.Add("IsHaywood", _UserDetails.Split('$')[12]);

            }
            return Task.FromResult<object>(null);
        }
    }
}
