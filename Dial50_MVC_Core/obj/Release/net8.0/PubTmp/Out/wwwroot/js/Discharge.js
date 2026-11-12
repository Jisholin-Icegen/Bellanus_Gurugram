const dischargeData = {
    title: "My Discharge Plan",
    subtitle: "Track your progress towards going home. Estimated: Tomorrow, 10:00 AM.",
    progressTitle: "Ready for Discharge?",
    progressDesc: "Complete the steps below to finalize your discharge process.",
    progressPercent: 40,
    steps: [
        {
            title: "Doctor's Approval",
            description: "Final checkup with Dr. Smith.",
            status: "completed"
        },
        {
            title: "Medication Education",
            description: "Pharmacist review of home meds.",
            status: "completed"
        },
        {
            title: "Physical Therapy Assessment",
            description: "Mobility check for home safety.",
            status: "pending"
        },
        {
            title: "Transportation Arranged",
            description: "Confirm ride home with family or service.",
            status: "locked"
        },
        {
            title: "Hospital Bill Settled",
            description: "Review and settle any outstanding charges.",
            status: "locked"
        },
        {
            title: "Discharge Papers Signed",
            description: "Final administrative paperwork.",
            status: "locked"
        }
    ]
};

//// ✅ Load Header
//document.getElementById("title").innerText = dischargeData.title;
//document.getElementById("subtitle").innerText = dischargeData.subtitle;
document.getElementById("progressTitle").innerText = dischargeData.progressTitle;
document.getElementById("progressDesc").innerText = dischargeData.progressDesc;
document.getElementById("progressPercent").innerText = dischargeData.progressPercent + "%";

// ✅ Load Steps Dynamically
const stepsContainer = document.getElementById("stepsContainer");

dischargeData.steps.forEach(step => {

    let iconSymbol = "○";

    if (step.status === "completed") iconSymbol = "✔";
    if (step.status === "pending") iconSymbol = "⏳";

    const stepDiv = document.createElement("div");
    stepDiv.className = "step " + step.status;

    stepDiv.innerHTML = `
        <div class="icon ${step.status}">
            ${iconSymbol}
        </div>
        <div>
            <div class="step-title">${step.title}</div>
            <div class="step-desc">${step.description}</div>
        </div>
    `;

    stepsContainer.appendChild(stepDiv);
});

function goBack() {
    window.location.href = 'mydailycare.html';
}