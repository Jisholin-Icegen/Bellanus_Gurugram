let selectedTaskId = 0;
let rating = 0;

function renderTasks(data) {
    if (!Array.isArray(data)) data = [];

    data.sort((a, b) => {
        let aDate = new Date(a.requestDate ?? a.RequestDate ?? 0).getTime() || 0;
        let bDate = new Date(b.requestDate ?? b.RequestDate ?? 0).getTime() || 0;
        return bDate - aDate;
    });

    let activeHTML = "";
    let completedHTML = "";

    data.forEach(t => {
        if (!t) return;

        let rawStatus = String(
            t.status ?? t.Status ??
            t.requestStatus ?? t.RequestStatus ??
            t.REQUESTSTATUS ?? ""
        ).trim();

        let status = rawStatus.toLowerCase();

        let taskId = t.taskId ?? t.TaskId ?? t.RequestNo ?? t.requestId ?? "";
        let categoryName = t.taskName ?? t.TaskName ?? t.CategoryName ?? "";
        let porterName = t.porterName ?? t.PorterName ?? "";
        let fromRoom = t.fromRoom ?? t.FromRoom ?? t.FROM ?? "";
        let requestDate = t.requestDate ?? t.RequestDate ?? "";
        let serviceType = t.service ?? t.Service ?? "";

        let displayDate = "";
        if (requestDate) {
            let d = new Date(requestDate);
            if (!isNaN(d)) {
                displayDate = d.toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                }) + " " + d.toLocaleTimeString("en-GB", {
                    hour: "2-digit", minute: "2-digit"
                });
            }
        }

        let displayStatus = "PENDING";
        let pillClass = "pill-pending";

        switch (status) {
            case "pending":
            case "placed":
            case "accepted":
                displayStatus = "PENDING";
                pillClass = "pill-pending";
                break;
            case "ready":
                displayStatus = "READY";
                pillClass = "pill-assigned";
                break;
            case "ready-for-pickup":
            case "ready for pickup":
            case "readyforpickup":
                displayStatus = "READY-FOR-PICKUP";
                pillClass = "pill-assigned";
                break;
            case "assigned":
                displayStatus = "ASSIGNED";
                pillClass = "pill-assigned";
                break;
            case "in-progress":
            case "inprogress":
            case "in progress":
                displayStatus = "IN-PROGRESS";
                pillClass = "pill-inprogress";
                break;
            case "preparing":
                displayStatus = "PREPARING";
                pillClass = "pill-inprogress";
                break;
            case "assembling":
                displayStatus = "ASSEMBLING";
                pillClass = "pill-inprogress";
                break;
            case "confirmed":
                displayStatus = "CONFIRMED";
                pillClass = "pill-assigned";
                break;
            case "completed":
                displayStatus = "COMPLETED";
                pillClass = "pill-completed";
                break;
            case "delivered":
                displayStatus = "DELIVERED";
                pillClass = "pill-completed";
                break;
            case "cancelled":
            case "canceled":
                displayStatus = "CANCELLED";
                pillClass = "pill-cancelled";
                break;
            default:
                displayStatus = rawStatus ? rawStatus.toUpperCase() : "PENDING";
                pillClass = "pill-pending";
        }

        let porterDisplay = porterName && porterName.trim() !== ""
            ? porterName
            : "Not assigned";

        let porterClass = porterName && porterName.trim() !== "" ? "" : "muted";
        let hasPorter = porterName && porterName.trim() !== "" ? "1" : "0";

        let card = `
        <div class="task-card"
             onclick="handleActive('${status}','${taskId}','${hasPorter}','${serviceType}','${fromRoom}')">

            <div class="task-card__head">
                <div class="task-card__title">${categoryName}</div>
                <span class="status-pill ${pillClass}">${displayStatus}</span>
            </div>

            <div class="task-card__row">
                <span class="task-card__label">From Room</span>
                <span class="task-card__value">${fromRoom}</span>
            </div>

            <div class="task-card__row">
                <span class="task-card__label">Porter</span>
                <span class="task-card__value ${porterClass}">${porterDisplay}</span>
            </div>

            <div class="task-card__foot">
                <span class="task-card__id">REQ-${taskId}</span>
                <span class="task-card__date">${displayDate}</span>
            </div>
        </div>`;

        if (status === "completed" || status === "delivered" || status === "cancelled" || status === "canceled") {
            completedHTML += card;
        } else {
            activeHTML += card;
        }
    });

    document.getElementById("activeList").innerHTML = activeHTML;
    document.getElementById("completedList").innerHTML = completedHTML;
}

function handleActive(status, id, hasPorter, serviceType, fromRoom) {
    var statusKey = String(status || "").toLowerCase().trim();

    if (statusKey === "delivered") {
        if (typeof window.showToast === "function") window.showToast("Task was Delivered");
        return;
    }

    if (statusKey === "completed") {
        if (typeof window.showToast === "function") window.showToast("Task was Completed");
        return;
    }

    if (statusKey === "cancelled" || statusKey === "canceled") {
        if (typeof window.showToast === "function") window.showToast("Task was Cancelled");
        return;
    }

    if (hasPorter !== "1") {
        if (typeof window.showToast === "function") window.showToast("Porter not assigned yet");
        return;
    }

    var svc = String(serviceType || '').toUpperCase().trim();

    if (svc.indexOf('FOOD') !== -1) {
        BedContext.go('FoodDining/OrderSuccess', { orderIds: id });
        return;
    }

    if (!BedContext.get().bedInfo) {
        if (typeof window.showToast === "function") window.showToast("Session expired. Please scan the QR again.");
        return;
    }

    BedContext.go('Tracking', { RequestID: id });
}

function toggleCompleted(id) {
    let el = document.getElementById("detail_" + id);
    if (!el) return;
    el.style.display = el.style.display === "block" ? "none" : "block";
}

function openFeedback(id) {
    selectedTaskId = id;
    document.getElementById("feedbackModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("feedbackModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".star").forEach(star => {
        star.onclick = function () {
            rating = this.getAttribute("data");
            document.querySelectorAll(".star").forEach(s => s.classList.remove("active"));
            for (let i = 0; i < rating; i++) {
                document.querySelectorAll(".star")[i].classList.add("active");
            }
        };
    });
});

function submitFeedback() {
    let remarks = document.getElementById("remarks").value;

    fetch('/MyRequests/SubmitRating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            RequestNo: selectedTaskId,
            Rating: rating,
            Remarks: remarks
        })
    })
        .then(() => {
            if (typeof window.showToast === "function") {
                window.showToast("Thanks for your valuable feedback");
            }
            closeModal();
            loadTasks();
        });
}

function loadTasks() {
    var bc = BedContext.get();
    var bedId = encodeURIComponent(bc.bedId || '');
    var bedNumber = encodeURIComponent(bc.bedNumber || '');

    fetch('/MyRequests/GetTasks?BedId=' + bedId + '&BedNumber=' + bedNumber)
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data)) data = [];
            window.allTasks = data;
            renderTasks(data);
            if (typeof updateSectionVisibility === 'function') {
                updateSectionVisibility();
            }
        })
        .catch(() => {
            window.allTasks = [];
            renderTasks([]);
            if (typeof updateSectionVisibility === 'function') {
                updateSectionVisibility();
            }
        });
}

loadTasks();