// JSON Collection
const medications = [
    {
        name: "Metformin",
        dose: "500mg",
        time: "08:00 AM",
        status: "taken"
    },
    {
        name: "Lisinopril",
        dose: "10mg",
        time: "08:00 AM",
        status: "taken"
    },
    {
        name: "Amoxicillin",
        dose: "500mg",
        time: "02:00 PM",
        status: "scheduled"
    },
    {
        name: "Vitamin D",
        dose: "1000IU",
        time: "08:00 PM",
        status: "scheduled"
    },
    {
        name: "Atorvastatin",
        dose: "20mg",
        time: "09:00 PM",
        status: "scheduled"
    }
];

const container = document.getElementById("medicationList");

medications.forEach(med => {

    const card = document.createElement("div");
    card.className = `card ${med.status}`;

    const iconColor = med.status === "taken" ? "green" : "purple";
    const statusLabel = med.status === "taken" ? "Taken" : "Scheduled";
    const statusIcon = med.status === "taken" ? "✔" : "🕒";

    card.innerHTML = `
      <div class="left">
        <div class="icon-box ${iconColor}">💊</div>
        <div>
          <div class="title">${med.name}</div>
          <div class="meta">${med.dose} • ${med.time}</div>
        </div>
      </div>
      <div class="status ${med.status}">
        ${statusIcon} <span>${statusLabel}</span>
      </div>
    `;

    container.appendChild(card);
});
