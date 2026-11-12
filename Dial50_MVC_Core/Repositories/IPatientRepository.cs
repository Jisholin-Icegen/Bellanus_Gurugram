using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;

public interface IPatientRepository
{
    Task<PatientResponse> GetPatientDetailsAsync(PatientRequest _patientRequest);
    Task<PatientResponse> GetPatientDetailsStatic(PatientRequest _patientRequest);
    Task<PatientBedDetails?> GetPatientBedDetailsByBedIdAsync(string bedId);

}