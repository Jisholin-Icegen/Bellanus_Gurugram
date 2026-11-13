using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

public class TenantSqlConnection : IDisposable
{
    private SqlConnection _connection;

    public TenantSqlConnection() : this("cineConn")
    {
    }

    public TenantSqlConnection(string connectionString)
    {
        string finalConnectionString = GetTenantString(connectionString);
        _connection = new SqlConnection(finalConnectionString);
    }

    private static string GetTenantString(string original)
    {
        if (string.IsNullOrEmpty(original)) return original;

        if (original.Equals("cineConn", StringComparison.OrdinalIgnoreCase))
        {
            return Tenant.ConnectionString;
        }

        var defaultCs = ConfigurationManager.ConnectionStrings["cineConn"];
        if (defaultCs != null && original == defaultCs.ConnectionString)
        {
            return Tenant.ConnectionString;
        }

        return original;
    }

    public string ConnectionString
    {
        get { return _connection.ConnectionString; }
        set { _connection.ConnectionString = GetTenantString(value); }
    }

    public int ConnectionTimeout { get { return _connection.ConnectionTimeout; } }
    public string Database { get { return _connection.Database; } }
    public string DataSource { get { return _connection.DataSource; } }
    public ConnectionState State { get { return _connection.State; } }
    public SqlConnection InnerConnection { get { return _connection; } }

    public void Open() { _connection.Open(); }
    public void Close() { _connection.Close(); }
    public void Dispose() { _connection.Dispose(); }

    public static implicit operator SqlConnection(TenantSqlConnection tenantConn)
    {
        return tenantConn._connection;
    }
}