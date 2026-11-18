using System;
namespace Traczo.Controllers
{
    [AttributeUsage(AttributeTargets.Method)]
    public class SkipTenantAttribute : Attribute { }
}