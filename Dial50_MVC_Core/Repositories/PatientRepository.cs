using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Services;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class PatientRepository : IPatientRepository
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly TenantProvider _tenantProvider;
    private readonly ILogger<PatientRepository> _logger;

    public PatientRepository(HttpClient httpClient, IConfiguration config, TenantProvider tenantProvider, ILogger<PatientRepository> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _tenantProvider = tenantProvider;
        _logger = logger;
    }

    public async Task<PatientResponse> GetPatientDetailsAsync(PatientRequest _patientRequest)
    {
        var requestObj = new
        {
            BedID = _patientRequest.BedID,
            BedNumber = _patientRequest.BedNumber
        };

        var content = new StringContent(
            JsonSerializer.Serialize(requestObj),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.PostAsync(
            _config["ApiSettings:BaseUrl"] + "/api/Patient/get_patientdetails",
            content);

        var json = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize<PatientResponse>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    public async Task<PatientBedDetails?> GetPatientBedDetailsByBedIdAsync(string bedId)
    {
        _logger.LogInformation("PatientRepository: GetPatientBedDetailsByBedIdAsync called for BedId={BedId}", bedId);

        if (string.IsNullOrWhiteSpace(bedId))
            return null;

        var connectionString = _tenantProvider.GetConnectionString();

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            _logger.LogError("PatientRepository: Tenant Connection string not found.");
            throw new InvalidOperationException("Tenant Connection string not found.");
        }

        var builder = new SqlConnectionStringBuilder(connectionString);
        _logger.LogInformation("PatientRepository: Connecting to Database = {Database}", builder.InitialCatalog);

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_GET_PATIENT_DETAILS_BY_BED", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@BedId", bedId);

        using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
        {
            _logger.LogWarning("PatientRepository: No records found for BedId={BedId}", bedId);
            return null;
        }

        _logger.LogInformation("PatientRepository: Successfully found patient for BedId={BedId}", bedId);

        return new PatientBedDetails
        {
            PatientId = reader["PatientId"] is DBNull ? 0 : Convert.ToInt32(reader["PatientId"]),
            PatientName = reader["PatientName"] is DBNull ? "" : reader["PatientName"].ToString() ?? "",
            BedId = reader["BedId"] is DBNull ? "" : reader["BedId"].ToString() ?? "",
            RoomNumber = reader["RoomNumber"] is DBNull ? "" : reader["RoomNumber"].ToString() ?? "",
            Bed = reader["Bed"] is DBNull ? "" : reader["Bed"].ToString() ?? "",
            RoomBed = reader["RoomBed"] is DBNull ? "" : reader["RoomBed"].ToString() ?? "",
            Ward = reader["Ward"] is DBNull ? "" : reader["Ward"].ToString() ?? "",
            Uhid = reader["Uhid"] is DBNull ? "" : reader["Uhid"].ToString() ?? "",
            Gender = reader["Gender"] is DBNull ? "" : reader["Gender"].ToString() ?? "",
            Age = reader["Age"] is DBNull ? "" : reader["Age"].ToString() ?? "",
            DietType = reader["DietType"] is DBNull ? "" : reader["DietType"].ToString() ?? "",
            Allergies = reader["Allergies"] is DBNull ? "" : reader["Allergies"].ToString() ?? "",
            TierName = reader["TierName"] is DBNull ? "" : reader["TierName"].ToString() ?? "",
            TierCode = reader["TierCode"] is DBNull ? "" : reader["TierCode"].ToString() ?? "",
            TierLevel = reader["TierLevel"] is DBNull ? "" : reader["TierLevel"].ToString() ?? ""
        };
    }

    public async Task<PatientResponse> GetPatientDetailsStatic(PatientRequest request)
    {
        _logger.LogInformation("PatientRepository: GetPatientDetailsStatic called for BedId={BedId}", request.BedID);

        if (string.IsNullOrWhiteSpace(request.BedID))
        {
            return new PatientResponse
            {
                status = false,
                message = "No Records Found",
                data = new PatientData { UHID = "", PatientName = "", Gender = "", Age = "" }
            };
        }

        string connectionString = _tenantProvider.GetConnectionString();

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            _logger.LogError("PatientRepository: Tenant Connection string not found.");
            throw new InvalidOperationException("Tenant Connection string not found.");
        }

        var builder = new SqlConnectionStringBuilder(connectionString);
        _logger.LogInformation("PatientRepository: Connecting to Database = {Database}", builder.InitialCatalog);

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        string query = @"
            SELECT TOP 1 Uhid, PatientName, Gender, Age
            FROM HISDetails
            WHERE BedId = @UserID
            ORDER BY CreatedDateTime DESC";

        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@UserID", request.BedID);

        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new PatientResponse
            {
                status = true,
                message = "Patient Records Found",
                data = new PatientData
                {
                    UHID = reader["Uhid"]?.ToString() ?? "",
                    PatientName = reader["PatientName"]?.ToString() ?? "",
                    Gender = reader["Gender"]?.ToString() ?? "",
                    Age = reader["Age"]?.ToString() ?? ""
                }
            };
        }

        return new PatientResponse
        {
            status = false,
            message = "No Records Found",
            data = new PatientData { UHID = "", PatientName = "", Gender = "", Age = "" }
        };
    }
}