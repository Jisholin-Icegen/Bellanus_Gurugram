namespace Dial50_MVC_Core.Services
{
    public interface ILogService
    {
        Task LogAsync(string ProcedureName, string Exception = null);
    }
}
