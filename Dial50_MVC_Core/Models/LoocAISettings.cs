public class LoocAISettings
{
    public string? LOOC_AI_URL { get; set; }
    public string? BASE_URL { get; set; }
    public string? CONV_ID { get; set; }
    public string? USER_ID { get; set; }
    public string? F_ID { get; set; }
    public string? AV_ID2 { get; set; }
    public string? AV_ID3 { get; set; }
    public string? AUTH_TOKEN { get; set; }
    public string? LOOC_AI_FULL_URL { get; set; }

    public string? GUEST_API_PATH { get; set; }
    public string? GUEST_DEFAULT_PASSWORD { get; set; }
    public string? GUEST_BEARER_TOKEN { get; set; }

    public string buildFullURL(LoocAISettings _loocAI, string _UserID, string? _PatientName, string guestToken)
    {
        var nameParam = string.IsNullOrWhiteSpace(_PatientName)
            ? ""
            : "&name=" + Uri.EscapeDataString(_PatientName);

        return _loocAI.LOOC_AI_URL + _loocAI.CONV_ID
             + "&user=" + _UserID
             + "&f=" + _loocAI.F_ID
             + nameParam
             + "#" + guestToken;
    }

    public string buildFullURL(LoocAISettings _loocAI, string _UserID, string? _PatientName = null)
    {
        return buildFullURL(_loocAI, _UserID, _PatientName, _loocAI.AUTH_TOKEN ?? "");
    }
}