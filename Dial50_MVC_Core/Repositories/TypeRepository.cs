using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System.Reflection;
using System.Reflection.Metadata;
public class TypeRepository : ITypeRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ITypeRepository> _logger;
    private readonly ILogService _logService;

    public TypeRepository(ApplicationDbContext context, ILogger<ITypeRepository> logger, ILogService logService)
    {
        _context = context;
        _logger = logger;
        _logService = logService;
    }
    public async Task<List<TaskTypes>> getDeptTaskTypes(string? DeptID)
    {
        var result = new List<TaskTypes>();
        try
        {

            DeptID = (string.IsNullOrEmpty(DeptID) ? string.Empty : DeptID);
            _logger.LogInformation("Fetch TaskType from database. DeptID :- {0}", DeptID);
            result = await _context.TaskTypeInfo
                                .FromSqlRaw("EXEC SP_GETTASKTYPES_BYDEPTID  @DEPTID={0}", DeptID)
                                .ToListAsync();
            _logger.LogInformation("Successfully fetched {Count} records.", result.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while executing stored procedure GetHospitalInfos.");
            await _logService.LogAsync(ex.Message, "SP_GETTASKTYPES_BYDEPTID");
            //throw; // IMPORTANT: Let service layer decide what to do
        }

        return result;
    }
}
