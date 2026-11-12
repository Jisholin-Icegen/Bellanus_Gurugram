var urlParams = new URLSearchParams(window.location.search);

window.CLIENT_CONFIG = {
    backendUrl: "https://dial50-voice-agent-dev.bravemoss-bf12527e.centralindia.azurecontainerapps.io",
    defaultUserId: (window.BedContext && BedContext.get().bedId) || "",
    defaultLanguage: "English",
    defaultDialect: "United States"
};