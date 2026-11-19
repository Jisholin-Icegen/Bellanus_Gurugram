const data = [
    {
        title: "My Library",
        description: "Educational resources for you",
        icon: "/images/ChildIcons/mdc_c.png",
        onclick_URL: "/MyLibrary/Index?BedInfo="
    },
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
        title: "Discharge",
        description: "Track your discharge progress",
        icon: "/images/ChildIcons/mdc_d.png",
        onclick_URL: "/Discharge/Index?BedInfo="
    }
];

document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("pageContent");
    if (!container) return;
    const params = new URLSearchParams(window.location.search);
    const unifiedAI = !!window.UnifiedAIChild
        || params.get("UnifiedAI") === "1"
        || params.get("Unified") === "1";
    const bedInfo = sessionStorage.getItem("bedInfo")
        || new URLSearchParams(window.location.search).get("BedInfo")
        || "";

    function openDailyCareItem(item) {
        if (unifiedAI && window.UnifiedAIChild) {
            window.UnifiedAIChild.navigate(item.onclick_URL + encodeURIComponent(bedInfo));
            return;
        }
        if (unifiedAI) {
            const target = new URL(item.onclick_URL + encodeURIComponent(bedInfo), window.location.origin);
            target.searchParams.set("Unified", "1");
            target.searchParams.set("UnifiedAI", "1");
            window.location.href = target.toString();
            return;
        }
        if (item.title === "My Library") GoToChat();
    }

    container.innerHTML = "";

    data.forEach(function (item) {
        const card = document.createElement("div");
        card.className = unifiedAI || item.title === "My Library" ? "card focused" : "card faded";
        card.dataset.route = item.onclick_URL.split("?")[0];
        card.innerHTML = `
            <div class="icon-box">
                <img src="${item.icon}" alt="${item.title}">
            </div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        `;
        if (unifiedAI || item.title === "My Library") {
            card.addEventListener("click", function () {
                openDailyCareItem(item);
            });
        }
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