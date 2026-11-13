var mySectionChart = null;
var myTrendChart = null;
var notificationPollTimer = null;
var NOTIFICATION_POLL_MS = 30000;

function StartNotificationAutoRefresh() {
    StopNotificationAutoRefresh();
    notificationPollTimer = setInterval(function () {
        if (document.hidden) return;
        LoadNotifications();
    }, NOTIFICATION_POLL_MS);
}

function StopNotificationAutoRefresh() {
    if (notificationPollTimer) {
        clearInterval(notificationPollTimer);
        notificationPollTimer = null;
    }
}

const barHoverPlugin = {
    id: 'barHoverPlugin',
    beforeDatasetsDraw(chart) {
        const {
            ctx,
            chartArea: { top, bottom },
            tooltip
        } = chart;
        if (tooltip && tooltip._active && tooltip._active.length) {
            const active = tooltip._active[0];
            const x = active.element.x;
            const width = active.element.width + 40;
            ctx.save();
            ctx.fillStyle = "#f3f7fb";
            ctx.fillRect(
                x - width / 2,
                top,
                width,
                bottom - top
            );
            ctx.restore();
        }
    }
};

const crossHairPlugin = {
    id: "crossHairPlugin",
    afterDraw(chart) {
        if (!chart.tooltip ||
            !chart.tooltip._active ||
            chart.tooltip._active.length === 0)
            return;
        const ctx = chart.ctx;
        const active = chart.tooltip._active[0];
        const x = active.element.x;
        const top = chart.scales.y.top;
        const bottom = chart.scales.y.bottom;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#d6dce5";
        ctx.stroke();
        ctx.restore();
    }
};

function showNoData(type) {
    if (type === "section") {
        $("#sectionChart").hide();
        $("#sectionNoData").css("display", "flex");
        if (mySectionChart) {
            mySectionChart.destroy();
            mySectionChart = null;
        }
    }
    else {
        $("#trendChart").hide();
        $("#trendNoData").css("display", "flex");
        if (myTrendChart) {
            myTrendChart.destroy();
            myTrendChart = null;
        }
    }
}

function hideNoData(type) {
    if (type === "section") {
        $("#sectionNoData").hide();
        $("#sectionChart").show();
    }
    else {
        $("#trendNoData").hide();
        $("#trendChart").show();
    }
}

function LoadDashboardCharts() {
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDISCHARGEDASHBOARD")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (!res || res.length === 0 || (res[0].Result || res[0].RESULT) !== "TRUE") {
                showNoData("section");
                showNoData("trend");
                return;
            }

            function pick(obj, key) {
                if (obj[key] !== undefined) return obj[key];
                var upper = key.toUpperCase();
                if (obj[upper] !== undefined) return obj[upper];
                var lower = key.toLowerCase();
                if (obj[lower] !== undefined) return obj[lower];
                return undefined;
            }

            function setStat($el, value, suffix) {
                if (value === null || value === undefined || value === "") {
                    $el.html(suffix ? ('0 ' + suffix) : '0');
                } else {
                    $el.html(suffix ? (value + ' ' + suffix) : value);
                }
            }

            var stats = res.filter(x => pick(x, "ChartType") === "STAT");
            stats.forEach(function (s) {
                var label = pick(s, "Label");
                var value = pick(s, "Value");
                switch (label) {
                    case "TODAY": setStat($('#stat-today'), value); break;
                    case "WEEK": setStat($('#stat-week'), value); break;
                    case "MONTH": setStat($('#stat-month'), value); break;
                    case "SATISFIED": setStat($('#stat-satisfied'), value, '<small>%</small>'); break;
                    case "RECOMMEND": setStat($('#statRecommend'), value, '<small>%</small>'); break;
                    case "OPEN_FLAGS": setStat($('#statFlagsOpen'), value); break;
                    case "RESOLVED_FLAGS": setStat($('#statFlagsResolved'), value); break;
                }
            });

            var sectionRows = res.filter(x => pick(x, "ChartType") === "SECTION");
            var trendRows = res.filter(x => pick(x, "ChartType") === "TREND");

            if (sectionRows.length === 0) showNoData("section"); else hideNoData("section");
            if (trendRows.length === 0) showNoData("trend"); else hideNoData("trend");

            if (sectionRows.length > 0) {
                initSectionChart(sectionRows.map(x => pick(x, "Label")), sectionRows.map(x => Number(pick(x, "Value"))));
            }
            if (trendRows.length > 0) {
                initTrendChart(trendRows.map(x => pick(x, "Label")), trendRows.map(x => Number(pick(x, "Value"))));
            }
        },
        error: function () {
            showNoData("section");
            showNoData("trend");
        }
    });
}

function initSectionChart(labels, dataValues) {
    const canvas = document.getElementById("sectionChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (mySectionChart) {
        mySectionChart.destroy();
        mySectionChart = null;
    }
    mySectionChart = new Chart(ctx, {
        type: "bar",
        plugins: [barHoverPlugin],
        data: {
            labels: labels,
            datasets: [
                {
                    label: "% Satisfied",
                    data: dataValues,
                    backgroundColor: function (context) {
                        const chart = context.chart;
                        const active = chart.tooltip?._active;
                        if (active && active.length && active[0].dataIndex === context.dataIndex) {
                            return "#10b981";
                        }
                        return "#19c28a";
                    },
                    hoverBackgroundColor: "#10b981",
                    borderRadius: 8,
                    borderSkipped: false,
                    borderWidth: 0,
                    categoryPercentage: 0.72,
                    barPercentage: 0.82,
                    maxBarThickness: 120
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1200,
                easing: "easeOutQuart"
            },
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    mode: "index",
                    intersect: false,
                    backgroundColor: "#ffffff",
                    titleColor: "#0f172a",
                    bodyColor: "#10b981",
                    borderColor: "#e2e8f0",
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: false,
                    caretSize: 8,
                    caretPadding: 10,
                    titleFont: { size: 14, weight: "600" },
                    bodyFont: { size: 13 },
                    callbacks: {
                        title: function (items) { return items[0].label; },
                        label: function (context) { return "% Satisfied : " + context.raw + "%"; }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 25, color: "#64748b", font: { size: 12 } },
                    grid: { color: "#e8eef5", borderDash: [4, 4], drawBorder: false }
                },
                x: {
                    ticks: { color: "#334155", font: { size: 12, weight: "600" } },
                    grid: { display: false }
                }
            },
            onHover: function (event, activeElements) {
                event.native.target.style.cursor = activeElements.length ? "pointer" : "default";
            }
        }
    });

    setTimeout(function () {
        if (labels.length === 0) return;
        const meta = mySectionChart.getDatasetMeta(0);
        mySectionChart.setActiveElements([{ datasetIndex: 0, index: 0 }]);
        mySectionChart.tooltip.setActiveElements(
            [{ datasetIndex: 0, index: 0 }],
            { x: meta.data[0].x, y: meta.data[0].y }
        );
        mySectionChart.update();
    }, 150);
}

function initTrendChart(labels, dataValues) {
    const canvas = document.getElementById("trendChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (myTrendChart) {
        myTrendChart.destroy();
        myTrendChart = null;
    }
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, "rgba(34,211,238,0.25)");
    gradient.addColorStop(1, "rgba(34,211,238,0)");
    myTrendChart = new Chart(ctx, {
        type: "line",
        plugins: [crossHairPlugin],
        data: {
            labels: labels,
            datasets: [
                {
                    label: "% Satisfied",
                    data: dataValues,
                    borderColor: "#22d3ee",
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#22d3ee",
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: "#22d3ee",
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1200, easing: "easeOutQuart" },
            interaction: { intersect: false, mode: "index" },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    intersect: false,
                    mode: "index",
                    backgroundColor: "#ffffff",
                    titleColor: "#0f172a",
                    bodyColor: "#0891b2",
                    borderColor: "#e2e8f0",
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: false,
                    caretSize: 8,
                    callbacks: {
                        title: function (items) { return items[0].label; },
                        label: function (context) { return "% Satisfied : " + context.raw + "%"; }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 25, color: "#64748b", font: { size: 12 } },
                    grid: { color: "#e8eef5", borderDash: [4, 4], drawBorder: false }
                },
                x: {
                    ticks: { color: "#334155", font: { size: 12, weight: "600" } },
                    grid: { display: false }
                }
            },
            hover: { intersect: false, mode: "index" },
            onHover: function (event, activeElements) {
                event.native.target.style.cursor = activeElements.length ? "pointer" : "default";
            }
        }
    });

    setTimeout(function () {
        if (labels.length === 0) return;
        const meta = myTrendChart.getDatasetMeta(0);
        myTrendChart.setActiveElements([{ datasetIndex: 0, index: 0 }]);
        myTrendChart.tooltip.setActiveElements(
            [{ datasetIndex: 0, index: 0 }],
            { x: meta.data[0].x, y: meta.data[0].y }
        );
        myTrendChart.update();
    }, 200);
}

function LoadNotifications() {
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 5000,
        success: function (res) {
            RenderNotifications(res || []);
        },
        error: function () { }
    });
}

function RenderNotifications(notifications) {
    var html = '';
    var unreadCount = 0;
    if (notifications && notifications.length > 0) {
        $.each(notifications, function (i, item) {
            var isRead = item.IS_READ === true || item.IS_READ === 1;
            if (!isRead) unreadCount++;
            var iconClass = (item.NOTIFICATION_TYPE || 'info').toLowerCase();
            var icon = getNotificationIcon(iconClass);
            var notificationId = item.NOTIFICATION_ID || item.ID || i;
            html += '<div class="notification-item' + (isRead ? ' read' : ' unread') + '" data-id="' + notificationId + '" style="display:flex;align-items:flex-start;gap:12px;padding:12px 18px;cursor:pointer;transition:all 0.2s;border-bottom:1px solid #f8fafc;position:relative;' + (!isRead ? 'background:#f0f7ff;border-left:3px solid #3b82f6;' : '') + '"><div class="notification-icon ' + iconClass + '" style="width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:' + getIconBackground(iconClass) + ';border:none;"><img src="' + icon + '" alt="' + iconClass + '" style="width:20px;height:20px;object-fit:contain;"></div><div class="notification-content" style="flex:1;min-width:0;"><div class="notification-text"><h4 style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 2px 0;">' + escapeHtml(item.NOTIFICATION_HEADER || '') + '</h4><p style="font-size:13px;color:#6b7280;margin:0;line-height:1.4;">' + escapeHtml(item.NOTIFICATION_MESSAGE || '') + '</p></div><div class="notification-time" style="font-size:11px;color:#9ca3af;margin-top:4px;">' + escapeHtml(item.TIME_AGO || '') + '</div></div>' + (!isRead ? '<span class="unread-dot" style="width:8px;height:8px;background:#3b82f6;border-radius:50%;flex-shrink:0;margin-top:4px;"></span>' : '') + '</div>';
        });
    } else {
        html = '<div class="notification-item" style="text-align:center;color:#888;padding:20px;">No new notifications</div>';
    }
    $('#notificationList').html(html);
    $('#notificationCount').text(unreadCount);
    if (unreadCount > 0) {
        $('#notificationCount').addClass('show');
    } else {
        $('#notificationCount').removeClass('show');
    }
}

$(document).on('click', '.notification-item.unread[data-id]', function () {
    var id = $(this).data('id');
    var $this = $(this);
    $this.removeClass('unread');
    $this.find('.unread-dot').remove();
    $this.css({
        'transition': 'opacity 0.5s ease, transform 0.3s ease',
        'opacity': '0',
        'transform': 'translateX(20px)'
    });
    MarkNotificationAsRead(id);
    setTimeout(function () {
        $this.remove();
        var currentCount = parseInt($('#notificationCount').text()) || 0;
        var newCount = Math.max(0, currentCount - 1);
        $('#notificationCount').text(newCount);
        if (newCount <= 0) {
            $('#notificationCount').removeClass('show');
        }
        if ($('.notification-item').length === 0) {
            $('#notificationList').html('<div class="notification-item" style="text-align:center;color:#888;padding:20px;">No new notifications</div>');
        }
    }, 600);
});

function MarkNotificationAsRead(NotificationID) {
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(NotificationID)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 5000,
        success: function (res) {
            var currentCount = parseInt($('#notificationCount').text()) || 0;
            var newCount = Math.max(0, currentCount - 1);
            $('#notificationCount').text(newCount);
            if (newCount <= 0) {
                $('#notificationCount').removeClass('show');
            }
        },
        error: function (xhr, status, error) {
            console.log("Error marking notification as read:", error);
        }
    });
}

function getIconBackground(type) {
    switch (type) {
        case 'info': return 'rgba(37, 99, 235, 0.08)';
        case 'success': return 'rgba(22, 163, 74, 0.08)';
        case 'warning': return 'rgba(245, 158, 11, 0.08)';
        case 'error': return 'rgba(239, 68, 68, 0.08)';
        default: return 'rgba(37, 99, 235, 0.08)';
    }
}

function getNotificationIcon(type) {
    type = (type || '').toLowerCase();
    switch (type) {
        case "error": return "../images/notification/warning.png";
        case "info": return "../images/notification/shield.png";
        case "success": return "../images/notification/thumbs-up.png";
        default: return "../images/notification/bell-icon.png";
    }
}

function GetUnreadCount() {
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 5000,
        success: function (res) {
            if (res && res.length > 0) {
                var count = res[0].UNREAD_COUNT || 0;
                var $badge = $('#notificationCount');
                if ($badge.length > 0) {
                    $badge.text(count);
                    if (count > 0) {
                        $badge.addClass('show');
                    } else {
                        $badge.removeClass('show');
                    }
                }
            } else {
                $('#notificationCount').removeClass('show');
            }
        },
        error: function () { }
    });
}

function MarkAllNotificationsAsRead() {
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 5000,
        success: function () {
            $('.notification-item.unread').each(function () {
                var $this = $(this);
                $this.removeClass('unread');
                $this.find('.unread-dot').remove();
                $this.css({ 'background': '', 'border-left': '' });
            });
            $('#notificationCount').text(0);
            $('#notificationCount').removeClass('show');
            if ($('.notification-item').length === 0) {
                $('#notificationList').html('<div class="notification-item" style="text-align:center;color:#888;padding:20px;">No new notifications</div>');
            }
            ShowToast('All notifications marked as read', 'success');
            LoadNotifications();
        },
        error: function () {
            ShowToast('Failed to mark all as read', 'error');
        }
    });
}

function ShowToast(message, type) {
    type = type || 'success';
    var toast = $('#dashToastNotification');
    if (toast.length === 0) {
        $('body').append('<div class="dash-toast-notification" id="dashToastNotification"><i class="fas fa-check-circle"></i><span id="dashToastMessage"></span><button class="toast-close" onclick="HideDashToast();">&times;</button></div>');
        toast = $('#dashToastNotification');
    }
    var icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    toast.find('i').attr('class', 'fas ' + icon);
    toast.find('#dashToastMessage').text(message);
    toast.removeClass('success error warning info');
    toast.addClass(type);
    toast.addClass('show');
    clearTimeout(toast.data('timer'));
    toast.data('timer', setTimeout(function () {
        HideDashToast();
    }, 3000));
}

function HideDashToast() {
    var toast = $('#dashToastNotification');
    toast.removeClass('show');
    if (toast.data('timer')) {
        clearTimeout(toast.data('timer'));
        toast.data('timer', null);
    }
}

function escapeHtml(value) {
    if (!value) return '';
    return String(value).replace(/[&<>"']/g, function (ch) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[ch];
    });
}

function escapeXml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function Encrypt(Value) {
    var key = CryptoJS.enc.Utf8.parse(CryptoKey);
    var iv = CryptoJS.enc.Utf8.parse(CryptoPwd);
    var encryptedVal = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(Value), key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encryptedVal;
}

function ShowModalPopUp(ModalId) {
    $('#' + ModalId).modal('show');
}
function HideModalPopUp(ModalId) {
    $('#' + ModalId).modal('hide');
}

function getDashboardRoleId() {
    return (sessionStorage.getItem('ROLE') || '0').toString();
}

function LoadFlags(statusFilter, mode) {
    mode = (mode || 'FLAGS').toUpperCase();
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETPATIENTFLAGS")) +
        "&STATUS=" + encodeURIComponent(Encrypt(statusFilter)) +
        "&MODE=" + encodeURIComponent(Encrypt(mode)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) { RenderFlags(res || []); },
        error: function () { console.error("Error loading " + mode.toLowerCase()); }
    });
}

function RenderFlags(data) {
    var activeTab = $('#mainDashboardTabs .nav-link.active').data('tab');
    var isResponses = activeTab === 'responses';

    var $container = isResponses ? $('#responses-list-container') : $('#flags-list-container');
    var $counter = isResponses ? $('#resp-total-count') : $('#flag-total-count');

    var idPrefix = isResponses ? 'resp' : 'flag';
    var expPrefix = isResponses ? 'exp_resp' : 'exp';
    var notePrefix = isResponses ? 'resp_note' : 'note';
    var iconCls = isResponses ? 'fas fa-heart' : 'far fa-comment-dots';
    var iconBoxCls = isResponses ? 'flag-icon-box icon-box-satisfied' : 'flag-icon-box';
    var tagCls = isResponses ? 'badge-satisfied-tag' : 'badge-unsatisfied-tag';
    var tagText = isResponses ? 'Satisfied' : 'Unsatisfied';
    var tagIcon = isResponses ? 'far fa-smile' : 'far fa-frown';

    var html = '';
    $counter.text(data.length + (isResponses ? ' responses' : ' flags'));

    if (data.length === 0) {
        html = '<div class="text-center p-5 text-muted">No '
            + (isResponses ? 'responses' : 'flags')
            + ' found for this status.</div>';
    } else {
        data.forEach(function (item) {
            const status = (item.STATUS || 'OPEN').toUpperCase();
            const uniqueId = item.FLAG_ID;
            const safeId = uniqueId.replace(/[^a-zA-Z0-9_-]/g, '_');

            let actionButtons = '';
            if (status === 'OPEN') {
                actionButtons = `
                    <button type="button" class="btn-flag-action btn-outline-pill"
                        onclick="event.stopPropagation(); UpdateFlagStatus('${uniqueId}', 'IN PROGRESS')">
                        Mark In Progress
                    </button>
                    <button type="button" class="btn-flag-action btn-resolved-pill"
                        onclick="event.stopPropagation(); UpdateFlagStatus('${uniqueId}', 'RESOLVED')">
                        <i class="far fa-check-circle"></i> Mark Resolved
                    </button>`;
            } else if (status === 'IN PROGRESS') {
                actionButtons = `
                    <button type="button" class="btn-flag-action btn-resolved-pill"
                        onclick="event.stopPropagation(); UpdateFlagStatus('${uniqueId}', 'RESOLVED')">
                        <i class="far fa-check-circle"></i> Mark Resolved
                    </button>
                    <button type="button" class="btn-reopen-boxed"
                        onclick="event.stopPropagation(); UpdateFlagStatus('${uniqueId}', 'OPEN')">
                        Reopen
                    </button>`;
            } else if (status === 'RESOLVED') {
                actionButtons = `
                    <button type="button" class="btn-flag-action btn-outline-pill"
                        onclick="event.stopPropagation(); UpdateFlagStatus('${uniqueId}', 'IN PROGRESS')">
                        Mark In Progress
                    </button>
                    <button type="button" class="btn-reopen-boxed"
                        onclick="event.stopPropagation(); UpdateFlagStatus('${uniqueId}', 'OPEN')">
                        Reopen
                    </button>`;
            }

            html += `
            <div class="flag-card" id="${idPrefix}_${safeId}">
                <div class="flag-main-row" onclick="ToggleFlagExpansion('${uniqueId}', '${idPrefix}', '${expPrefix}')">
                    <div class="${iconBoxCls}"><i class="${iconCls}"></i></div>
                    <div class="flag-info">
                        <div class="flag-meta-top">
                            <span class="flag-id-small">${item.FLAG_ID}</span>
                            <span class="badge-category-tag">${item.CATEGORY}</span>
                            <span class="${tagCls}"><i class="${tagIcon}"></i> ${tagText}</span>
                            <span class="question-ref-label">· ${item.QUESTION_REF}</span>
                        </div>
                        <div class="flag-comment-text">${item.COMMENT || 'No specific remarks.'}</div>
                        <div class="flag-meta-bottom">
                            <span>${item.DATE_STR}</span> ·
                            <span>${item.PATIENT_NAME}</span> ·
                            <span>${item.WARD}</span> ·
                            <span>${item.DOCTOR}</span>
                            <span class="flag-meta-sep">·</span>
                            <span class="flag-reference-no">${item.ReferenceNo || ''}</span>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="status-pill ${status.toLowerCase().replace(' ', '-')}">${item.STATUS}</span>
                        <i class="fas fa-chevron-down text-muted chevron-icon"></i>
                    </div>
                </div>
                <div class="flag-expansion-panel" id="${expPrefix}_${safeId}">
                    <h6 class="res-notes-label">Resolution Notes</h6>
                    <textarea class="res-textarea" id="${notePrefix}_${uniqueId}"
                        placeholder="e.g. Spoke to team...">${item.RESOLUTION_NOTE || ''}</textarea>
                    <div class="d-flex align-items-center gap-4">${actionButtons}</div>
                </div>
            </div>`;
        });
    }
    $container.html(html);
}

function ToggleFlagExpansion(id, idPrefix, expPrefix) {
    idPrefix = idPrefix || 'flag';
    expPrefix = expPrefix || 'exp';
    var safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');

    var $panel = $('#' + expPrefix + '_' + safeId);
    var $card = $('#' + idPrefix + '_' + safeId);
    var $icon = $card.find('.chevron-icon');

    $('.flag-expansion-panel').not($panel).slideUp();
    $('.chevron-icon').not($icon).removeClass('fa-chevron-up').addClass('fa-chevron-down');

    $panel.slideToggle(300);
    $icon.toggleClass('fa-chevron-down fa-chevron-up');
}

function UpdateFlagStatus(flagId, newStatus) {
    var note = $('#resp_note_' + flagId).val() || $('#note_' + flagId).val() || '';
    var roleId = getDashboardRoleId();

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("UPDATEFLAGSTATUS")) +
        "&FLAGID=" + encodeURIComponent(Encrypt(flagId)) +
        "&STATUS=" + encodeURIComponent(Encrypt(newStatus)) +
        "&NOTE=" + encodeURIComponent(Encrypt(note)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "POST",
        success: function () {
            ShowToast("Status updated", "success");
            var activeTab = $('#mainDashboardTabs .nav-link.active').data('tab');
            if (activeTab === 'responses') {
                LoadFlags($('.btn-filter-resp.active').data('filter'), 'RESPONSES');
            } else {
                LoadFlags($('.btn-filter.active').data('filter'), 'FLAGS');
            }
            LoadDashboardCharts();
            LoadFlagCount();
        },
        error: function () { ShowToast("Failed to update status", "error"); }
    });
}

function LoadFlagCount() {
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETOPENFLAGCOUNT")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var count = res[0].COUNT || 0;
            $('#openFlagsBadge').text(count + " open");
            $('#statFlagsOpen').text(count);
        }
    });
}

function RefreshCurrentTab(buttonEl) {
    var $btn = buttonEl ? $(buttonEl) : $('.btn-refresh');
    var $icon = $btn.find('i.fa-sync-alt');

    $btn.addClass('is-spinning');

    var startTime = Date.now();
    var minSpinTime = 800;

    var stopSpin = function () {
        var elapsed = Date.now() - startTime;
        var remaining = Math.max(0, minSpinTime - elapsed);
        setTimeout(function () {
            $btn.removeClass('is-spinning');
        }, remaining);
    };

    var activeTab = $('#mainDashboardTabs .nav-link.active').data('tab');

    if (activeTab === 'overview') {
        LoadDashboardCharts();
        stopSpin();
    } else if (activeTab === 'flags') {
        var f = $('#pane-flags .btn-filter.active').data('filter') || 'OPEN';
        LoadFlags(f, 'FLAGS');
        stopSpin();
    } else if (activeTab === 'responses') {
        var r = $('#pane-responses .btn-filter-resp.active').data('filter') || 'OPEN';
        LoadFlags(r, 'RESPONSES');
        stopSpin();
    } else {
        stopSpin();
    }

    LoadNotifications();
    GetUnreadCount();
}
$(document).ready(function () {
    $(document).on('click', '#btnExportCsv', ExportCurrentTab);

    LoadNotifications();
    LoadDashboardCharts();

    StartNotificationAutoRefresh();

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            StopNotificationAutoRefresh();
        } else {
            LoadNotifications();
            GetUnreadCount();
            StartNotificationAutoRefresh();
        }
    });
});

function ExportCurrentTab() {
    var tab = $('#mainDashboardTabs .nav-link.active').data('tab');
    if (tab === 'overview') ExportOverviewCsv();
    else if (tab === 'flags') ExportFlagsCsv('FLAGS', 'DischargeFlags.csv');
    else if (tab === 'responses') ExportFlagsCsv('RESPONSES', 'DischargeResponses.csv');
    else ShowToast('Nothing to export on this tab.', 'warning');
}

function ExportFlagsCsv(mode, filename) {
    mode = mode || 'FLAGS';

    var selector = (mode === 'RESPONSES')
        ? '#pane-responses .btn-filter-resp.active'
        : '#pane-flags .btn-filter.active';

    var filter = $(selector).data('filter') || 'OPEN';
    var roleId = getDashboardRoleId();

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETPATIENTFLAGS")) +
        "&STATUS=" + encodeURIComponent(Encrypt(filter)) +
        "&MODE=" + encodeURIComponent(Encrypt(mode)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (!res || res.length === 0) {
                ShowToast('No ' + (mode === 'RESPONSES' ? 'responses' : 'flags') + ' to export.', 'warning');
                return;
            }

            var rows = [[
                'FLAG_ID', 'ReferenceNo', 'CATEGORY', 'QUESTION_REF', 'COMMENT',
                'DATE_STR', 'PATIENT_NAME', 'WARD', 'DOCTOR', 'STATUS', 'RESOLUTION_NOTE'
            ]];

            res.forEach(function (r) {
                rows.push([
                    r.FLAG_ID || '',
                    r.ReferenceNo || '',
                    r.CATEGORY || '',
                    r.QUESTION_REF || '',
                    r.COMMENT || '',
                    r.DATE_STR || '',
                    r.PATIENT_NAME || '',
                    r.WARD || '',
                    r.DOCTOR || '',
                    r.STATUS || '',
                    r.RESOLUTION_NOTE || ''
                ]);
            });

            downloadCsv(rows, filename);
            ShowToast('Exported ' + res.length + ' row(s).', 'success');
        },
        error: function () {
            ShowToast('Export failed.', 'error');
        }
    });
}

function ExportOverviewCsv() {
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDISCHARGEDASHBOARD")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (!res || res.length === 0) {
                ShowToast('No data.', 'warning');
                return;
            }

            var stats = res.filter(function (x) { return x.ChartType === 'STAT'; });
            var sections = res.filter(function (x) { return x.ChartType === 'SECTION'; });
            var trends = res.filter(function (x) { return x.ChartType === 'TREND'; });

            var rows = [];

            rows.push(['STATISTICS', 'COUNT']);
            stats.forEach(function (r) {
                rows.push([r.Label || '', r.Value != null ? r.Value : '']);
            });

            rows.push([]);

            rows.push(['DEPARTMENT-WISE', 'COUNT']);
            sections.forEach(function (r) {
                rows.push([r.Label || '', r.Value != null ? r.Value : '']);
            });

            rows.push([]);

            rows.push(['SATISFACTION TREND LAST 14 DAYS', '']);
            trends.forEach(function (r) {
                rows.push([r.Label || '', r.Value != null ? r.Value : '']);
            });

            downloadCsv(rows, 'DischargeOverview.csv');
            ShowToast('Overview exported.', 'success');
        },
        error: function () {
            ShowToast('Export failed.', 'error');
        }
    });
}

function downloadCsv(rows, filename) {
    var csv = rows.map(function (row) {
        return row.map(function (cell) {
            var s = (cell == null ? '' : String(cell));
            if (s.indexOf('"') >= 0) s = s.replace(/"/g, '""');
            if (/[",\n\r]/.test(s)) s = '"' + s + '"';
            return s;
        }).join(',');
    }).join('\r\n');

    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}