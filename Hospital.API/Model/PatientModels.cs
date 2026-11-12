namespace Hospital.API.Model
{
    public class PatientModels
    {
    }
    public class PatientRequest
{
    public string BedID { get; set; }
    public string BedNumber { get; set; }
}

public class PatientResponse
{
    public bool status { get; set; }
    public string message { get; set; }
    public PatientData data { get; set; }
}

public class PatientData
{
    public string UHID { get; set; }
    public string PatientName { get; set; }
    public string Gender { get; set; }
    public string Age { get; set; }
}
}
