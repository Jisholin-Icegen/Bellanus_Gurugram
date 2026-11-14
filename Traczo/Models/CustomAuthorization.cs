using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace Traczo.Models
{
    public class CustomAuthorization : AuthorizeAttribute
    {
        protected override void HandleUnauthorizedRequest(HttpActionContext actionContext)
        {   var tokenHasExpired = false;
            var owinContext = OwinHttpRequestMessageExtensions.GetOwinContext(actionContext.Request);
            OauthProvider.MyOAuthProvider ProfileDetails = new OauthProvider.MyOAuthProvider();
            
             


            if (owinContext != null)
            {
                tokenHasExpired = owinContext.Environment.ContainsKey("oauth.token_expired");
            }

            actionContext.Response = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.Forbidden,
                Content = new StringContent(" {\"status\": false,\"message\": " + (tokenHasExpired == true ? "\"The Token has Expired\"" : "\"Please check the token.\"")+",\"data\": { } }", System.Text.Encoding.UTF8, "application/json")
            };
            
        }

        public bool IsTokenExpired(AuthenticationTicket ticket)
        {
            // Retrieve the token's expiration claim
            var expirationClaim = ticket.Properties.ExpiresUtc;

            // Check if the expiration claim exists
            if (expirationClaim != null)
            {
                // Compare the expiration date with the current date and time
                var currentDate = DateTimeOffset.UtcNow;
                var isExpired = expirationClaim.Value <= currentDate;

                return isExpired;
            }

            // If the expiration claim is not present, consider the token as expired
            return true;
        }
        protected override bool IsAuthorized(HttpActionContext actionContext)
        {
            // Get the token from the request (e.g., from Authorization header or query string)

            // Validate the token using your validation logic
            // Get the authentication ticket from the request context
            AuthenticationTicket ticket = actionContext.RequestContext.Principal?.Identity as AuthenticationTicket;
            bool isExpired = false;
            if (ticket != null)
            {
                // Access the properties of the authentication ticket
                // For example, you can check the token expiration
                  isExpired = IsTokenExpired(ticket);

                // Perform further actions based on the ticket
                // ...
            }
            else isExpired = false;
             

            if (isExpired)
            {
                // Handle token expiration
                // Return appropriate response indicating expired token
                actionContext.Response = new HttpResponseMessage(HttpStatusCode.Unauthorized)
                {
                    ReasonPhrase = "Token expired"
                };
                return false;
            }

            // Token is valid, perform further authorization checks
            return base.IsAuthorized(actionContext);
        }
    }
}