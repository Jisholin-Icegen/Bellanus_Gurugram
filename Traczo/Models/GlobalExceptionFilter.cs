using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
 
using System.Net;
using System.Net.Http;
using System.Web.Http.Filters;
using System.Data.Entity;
using System.Threading.Tasks;

namespace Traczo.Models
{
    public class GlobalExceptionFilter : ExceptionFilterAttribute

    {
      /*  public override async Task OnExceptionAsync(HttpActionExecutedContext context, System.Threading.CancellationToken cancellationToken)
        {
            var responseContent = await context.Response.Content.ReadAsStringAsync();

            // Log the response content
          //  LogResponseContent(responseContent);
            DataAccess.InsertError(responseContent.ToString(), "GlobalExceptionFilter", "van");

            // Create a response message
            var response = context.Request.CreateResponse(HttpStatusCode.InternalServerError, new
            {
                Message = "An error has occurred.",
                DetailedMessage = context.Exception.Message
            });

            context.Response = response;
        } */
        public override void OnException(HttpActionExecutedContext context)
        {
            // Log the exception to a database
            // LogExceptionToDatabase(context.Exception);
            DataAccess.InsertError(context.Exception.Message.ToString(), "GlobalExceptionFilter", "van");
            // Create a response message
            var response = context.Request.CreateResponse(HttpStatusCode.InternalServerError, new
            {
                Message = context.Exception.Message,
                DetailedMessage = context.Exception.Message
            });

            context.Response = response;
        }

    }
}