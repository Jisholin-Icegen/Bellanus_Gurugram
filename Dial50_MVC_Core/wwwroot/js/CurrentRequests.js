
// JSON DATA COLLECTION
//const requests = [
//    { id: 39, staff: "Alex", task: "Room cleaning", eta: "~5 Min", status: "Assigned" },
//    { id: 40, staff: "John", task: "Laundry service", eta: "~10 Min", status: "In-Progress" },
//    { id: 41, staff: "Emma", task: "Food delivery", eta: "~15 Min", status: "Pending" },
//    { id: 42, staff: "Emma", task: "Food delivery", eta: "~15 Min", status: "Pending" }
//];


const requests = getCurrentRequests();

let currentIndex = 0;

// Render UI
function renderRequest(index) {

    if (requests.length > 0) {
        const data = requests[index];

        var btn_Track = document.getElementById("track-btn");

        document.getElementById("requestId").textContent = '#' + data.RequestNo;
        if (data.RequestStatusId == '2') {
            document.querySelectorAll(".porterstatus_pending").forEach(function (el) {
                el.style.display = "inline-flex";
            });

            document.querySelector(".avatar").classList.add("pending");
            document.getElementById("staffName").textContent = "";
            btn_Track.style.display = "none";
        } else {
            document.querySelectorAll(".porterstatus_pending").forEach(function (el) {
                el.style.display = "none";
            });

            document.getElementById("staffName").textContent = data.PorterName + ((data.SUBPorterName.length > 0) ? ' & ' + data.SUBPorterName : '');

            document.querySelector(".avatar").classList.add("assigned");
            btn_Track.style.display = "inline-block";
            btn_Track.onclick = function () {
                TrackRequest(data.RequestNo)
            };
        }
        //document.getElementById("track-btn").style.display = ((data.RequestStatusId == '3' || data.RequestStatusId == '4') ? "inline-flex" : "none");

        
        document.getElementById("taskName").textContent = data.CategoryDescription;
        document.getElementById("eta").textContent = ((data.RequestStatusId == '3') ? data.Eta : '-');
        document.getElementById("statusText").textContent = data.RequestStatus;

        updatePagination();
        updateButtons();
    }
}


// Pagination Dots
function updatePagination() {
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    requests.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (i === currentIndex) dot.classList.add("active");
        container.appendChild(dot);
    });
}

// Enable / Disable Buttons
function updateButtons() {
    document.getElementById("prevBtn")
        .classList.toggle("disabled", currentIndex === 0);

    document.getElementById("nextBtn")
        .classList.toggle("disabled", currentIndex === requests.length - 1);
}

// Navigation
document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderRequest(currentIndex);
    }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentIndex < requests.length - 1) {
        currentIndex++;
        renderRequest(currentIndex);
    }
});

// Initial Load
renderRequest(currentIndex);


let touchStartX = 0;
let touchEndX = 0;

const popup = document.querySelector(".popup");

popup.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].screenX;
});

popup.addEventListener("touchend", function (e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {

    const swipeDistance = touchEndX - touchStartX;

    // Swipe Left → Next
    if (swipeDistance < -50) {
        if (currentIndex < requests.length - 1) {
            currentIndex++;
            renderRequest(currentIndex);
        }
    }

    // Swipe Right → Previous
    if (swipeDistance > 50) {
        if (currentIndex > 0) {
            currentIndex--;
            renderRequest(currentIndex);
        }
    }
}