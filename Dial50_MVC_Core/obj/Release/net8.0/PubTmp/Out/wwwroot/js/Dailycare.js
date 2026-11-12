const data = [
    {
        title: "Medications",
        description: "View your daily medication schedule",
        icon: "/images/ChildIcons/mdc_a.png",
        onclick_URL: "/Medication/Index?BedInfo="
    },
    {
        title: "Appointments",
        description: "Check upcoming doctors visits",
        icon: "/images/ChildIcons/mdc_b.png",
        onclick_URL: "/Appointments/Index?BedInfo="
    },
    {
        title: "My Library",
        description: "Educational resources for you",
        icon: "/images/ChildIcons/mdc_c.png",
        onclick_URL: "/MyLibrary/Index?BedInfo="
    },
    {
        title: "Discharge",
        description: "Track your discharge progress",
        icon: "/images/ChildIcons/mdc_d.png",
        onclick_URL: "/Discharge/Index?BedInfo="
    }
];

document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("pageContent");
    if (!container) return;

    container.innerHTML = "";

    const libraryItem = data.find(x => x.title === "My Library");
    const otherItems = data.filter(x => x.title !== "My Library");

    if (libraryItem) {
        const card = document.createElement("div");
        card.className = "card focused";
        card.innerHTML = `
            <div class="icon-box">
                <img src="${libraryItem.icon}" alt="${libraryItem.title}">
            </div>
            <h3>${libraryItem.title}</h3>
            <p>${libraryItem.description}</p>
        `;
        card.addEventListener("click", GoToChat);
        container.appendChild(card);
    }

    otherItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "card faded";
        card.innerHTML = `
            <div class="icon-box">
                <img src="${item.icon}" alt="${item.title}">
            </div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        `;
        container.appendChild(card);
    });
});

function GoToChat() {
    var overlay = document.getElementById('chatConfirmOverlay');
    if (overlay) overlay.classList.add('show');
}

function closeChatConfirm() {
    var overlay = document.getElementById('chatConfirmOverlay');
    if (overlay) overlay.classList.remove('show');
}

function confirmGoToChat() {
    closeChatConfirm();

    var urlParams = new URLSearchParams(window.location.search);

    var bedInfoEncrypt = sessionStorage.getItem('bedInfo')
        || urlParams.get('BedInfo')
        || '';

    if (!bedInfoEncrypt) {
        alert('Session expired. Please log in again.');
        return;
    }

    if (typeof window.connectToAvatarBackend !== 'function') {
        console.warn('[DailyCare] video-script.js not loaded — cannot start video call');
        return;
    }

    if (typeof window.setState === 'function') {
        window.setState('connecting');
    } else {
        document.body.setAttribute('data-state', 'connecting');
    }

    if (typeof window.setCallStatus === 'function') {
        window.setCallStatus('dialing');
    }

    window.connectToAvatarBackend();
}