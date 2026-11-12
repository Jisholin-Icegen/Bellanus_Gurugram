using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public class PatientRepository : IPatientRepository
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public PatientRepository(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
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
        if (string.IsNullOrWhiteSpace(bedId))
            return null;

        var connectionString = _config.GetConnectionString("Dial50");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Connection string 'Dial50' not found.");

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_GET_PATIENT_DETAILS_BY_BED", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@BedId", bedId);

        using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

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
        if (string.IsNullOrWhiteSpace(request.BedID))
        {
            return new PatientResponse
            {
                status = false,
                message = "No Records Found",
                data = new PatientData { UHID = "", PatientName = "", Gender = "", Age = "" }
            };
        }

        string connectionString = _config.GetConnectionString("Dial50");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'Dial50' was not found in configuration. " +
                "Check ConnectionStrings section in appsettings.json.");
        }

        using var connection = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
        await connection.OpenAsync();

        string query = @"
            SELECT TOP 1 Uhid, PatientName, Gender, Age
            FROM HISDetails
            WHERE BedId = @UserID
            ORDER BY CreatedDateTime DESC";

        using var command = new Microsoft.Data.SqlClient.SqlCommand(query, connection);
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