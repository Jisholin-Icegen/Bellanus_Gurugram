document.addEventListener("DOMContentLoaded", function () {

    const loader = document.getElementById("pageLoader");

    // loadComponent("pageLoader-container", "partials/PageLoader.html");

    if (loader) {
        setTimeout(function () {
            // GoToAI();
        }, 2000);
    }

});

function loadComponent(id, file) {
    const target = document.getElementById(id);
    if (!target) return;

    fetch(file, { cache: "no-store" })
        .then(res => {
            if (!res.ok) throw new Error("Failed to load " + file);
            return res.text();
        })
        .then(data => {
            target.innerHTML = data;
        })
        .catch(err => {
            console.error("loadComponent error:", err);
        });
}

function confirmLogout() {
    if (confirm("Are you sure you want to logout?")) {
        const url = (window.APP_LOGOUT_URL) || "/Account/Logout";
        window.location = url;
    }
}