const appointmentsData = [
    {
        title: "MRI Scan",
        time: "11:30 AM",
        location: "Radiology Dept, Level 1",
        doctor: "Dr. Johnson",
        status: "upcoming"
    },
    {
        title: "Cardiology Consult",
        time: "02:00 PM",
        location: "Room 402-A",
        doctor: "Dr. Smith",
        status: "upcoming"
    },
    {
        title: "Physical Therapy",
        time: "04:30 PM",
        location: "Rehabilitation Center",
        doctor: "Sarah West",
        status: "upcoming"
    },
    {
        title: "Blood Work",
        time: "08:00 AM",
        location: "Lab Services",
        doctor: "Nurse Joy",
        status: "completed"
    }
];

const container = document.getElementById("appointmentsContainer");

function renderAppointments(data) {
    container.innerHTML = "";

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        if (item.status === "completed") {
            card.classList.add("completed");
        }

        card.innerHTML = `
        <div class="status ${item.status}">
          ${item.status.toUpperCase()}
        </div>

        <div class="card-title">${item.title}</div>

        <div class="row">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          ${item.time}
        </div>

        <div class="row">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${item.location}
        </div>

        <div class="row">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-3-3.87"/>
            <path d="M4 21v-2a4 4 0 013-3.87"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${item.doctor}
        </div>
      `;

        container.appendChild(card);
    });
}

renderAppointments(appointmentsData);
function goBack() {
    window.location.href = 'mydailycare.html';
}