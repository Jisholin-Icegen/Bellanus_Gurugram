using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;

public class LogService : ILogService
{
    private readonly ApplicationDbContext _context;

    public LogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string _procedureName, string _exception = null)
    {

        var _procedureNamesql = new SqlParameter("@PROC", _procedureName ?? (object)DBNull.Value);
        var _exceptionsql = new SqlParameter("@ERRORMSG", _exception ?? (object)DBNull.Value);

        await _context.Database.ExecuteSqlRawAsync(
            "EXEC [SP_ERRORLOG] @PROC, @ERRORMSG", _procedureNamesql, _exceptionsql);

    }
}