using Hospital.API.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class PatientController : ControllerBase
{
    [HttpPost("get_patientdetails")]
    //[Authorize]
    public IActionResult GetPatientDetails([FromBody] PatientRequest request)
    {
        if (request.BedID == "Room 402-A")
        {
            return Ok(new PatientResponse
            {
                status = true,
                message = "Patient Records Found",
                data = new PatientData
                {
                    UHID = "123456",
                    PatientName = "Aadam",
                    Gender = "male",
                    Age = "25"
                }
            });
        }
        else if (request.BedID == "Room 403-A")
        {
            return Ok(new PatientResponse
            {
                status = true,
                message = "Patient Records Found",
                data = new PatientData
                {
                    UHID = "67890",
                    PatientName = "Trump",
                    Gender = "male",
                    Age = "25"
                }
            });
        }

        return Ok(new
        {
            status = false,
            message = "No Records Found"
        });
    }
}