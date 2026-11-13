var feedbackData = [];
var currentFeedbackFilter = "all";

function LoadFeedback() {
    LoadNotifications();
    $("#feedback-list-container").html('<div class="text-center p-5"><i class="fas fa-spinner fa-spin fa-2x"></i></div>');
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETPATIENTFOODORDERFEEDBACKFORQUALITY"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            feedbackData = res || [];
            renderFeedback();
        }
    });
}

$(document).on('click', '.feedback-tab', function () {
    $('.feedback-tab').removeClass('active');
    $(this).addClass('active');
    currentFeedbackFilter = $(this).data('feedback-filter');
    renderFeedback();
});

function renderFeedback() {
    var $wrapper = $("#feedback-list-container");
    var $emptyState = $("#feedback-empty-state");
    $wrapper.empty();

    $("#total-feedback-count").text([...new Set(feedbackData.map(x => x.ORDERID))].length);
    $("#unsatisfied-count").text([...new Set(feedbackData.filter(x => x.RATING == 0).map(x => x.ORDERID))].length);
    $("#neutral-count").text([...new Set(feedbackData.filter(x => x.RATING == 1).map(x => x.ORDERID))].length);
    $("#satisfied-count").text([...new Set(feedbackData.filter(x => x.RATING == 2).map(x => x.ORDERID))].length);

    var filteredItems = feedbackData;
    if (currentFeedbackFilter !== "all") {
        filteredItems = feedbackData.filter(x => x.RATING == currentFeedbackFilter);
    }

    if (filteredItems.length === 0) {
        $wrapper.addClass("d-none");
        $emptyState.removeClass("d-none");
        return;
    }

    $wrapper.removeClass("d-none");
    $emptyState.addClass("d-none");

    filteredItems.sort((a, b) => parseInt(a.RATING) - parseInt(b.RATING));

    var renderedOrders = new Set();
    filteredItems.forEach(item => {
        if (!renderedOrders.has(item.ORDERID)) {
            var orderItems = filteredItems.filter(x => x.ORDERID === item.ORDERID);
            $wrapper.append(createFeedbackCard(orderItems));
            renderedOrders.add(item.ORDERID);
        }
    });
}

function createFeedbackCard(items) {
    var o = items[0];
    var rating = parseInt(o.RATING);
    var themeClass = "theme-mint", badgeClass = "badge-mint", ratingText = "SATISFIED", icon = "fa-smile";
    if (rating === 0) {
        themeClass = "theme-rose"; badgeClass = "badge-rose"; ratingText = "UNSATISFIED"; icon = "fa-frown";
    } else if (rating === 1) {
        themeClass = "theme-amber"; badgeClass = "badge-amber"; ratingText = "NEUTRAL"; icon = "fa-meh";
    }

    var itemsHtml = items.map(i => `
        <div class="feedback-item-line mb-1">
            <span class="qty" style="font-weight:700; color:#555;">${i.QUANTITY}x</span>
            <span class="name" style="font-weight:600; color:#333; margin-left:5px;">${i.ITEMNAME}</span>
        </div>
    `).join('');

    return `
    <div class="order-card feedback-master-card mb-3 ${themeClass}" id="card-${o.ORDERID}">
        <div class="order-card-header bg-transparent border-0 p-3 pb-0 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
                <span class="rating-pill ${badgeClass}"><i class="fas ${icon} me-1"></i> ${ratingText}</span>
                <span class="order-no-box">ORD-${o.ORDERID}</span>
                <span class="patient-info"><b>${o.ORDERBY}</b></span>
                <span class="room-info" style="color:#666;">Room ${o.ROOMNO}</span>
            </div>
            <div class="text-muted" style="font-size:11px;">Delivered: Today</div>
        </div>
        <div class="card-body p-3 pt-2">
            <div class="d-flex justify-content-between align-items-start">
                <div class="content-left">
                    <div class="items-list">${itemsHtml}</div>
                    <div class="comment-text mt-2" style="font-size:13px; color:#666; font-style:italic;">
                        <i class="fa-solid fa-quote-left me-1" style="opacity:0.5;"></i>${o.FeedBack || 'No comment provided.'}
                    </div>
                </div>
                <div class="action-right" id="action-container-${o.ORDERID}">
                    ${rating === 0 ?
            `<button type="button" class="btn-acknowledge" onclick="ExpandResolve('${o.ORDERID}')">Acknowledge</button>` :
            `<span class="text-success fw-bold" style="font-size:13px;"><i class="fa-solid fa-circle-check"></i> Reviewed</span>`
        }
                </div>
            </div>

            <!-- Resolution Expansion (Matches Image 2) -->
            <div class="resolve-area p-3" id="resolve-box-${o.ORDERID}" style="display:none;">
                <label class="resolution-label">Resolution Remark:</label>
                <textarea class="form-control resolve-textarea mb-3" id="remark-${o.ORDERID}" rows="3" placeholder="Explain how this was resolved with the patient..."></textarea>
                <div class="d-flex gap-2">
                    <button type="button" class="btn-submit-resolve" onclick="SubmitResolution('${o.ORDERID}')">Submit & Resolve</button>
                    <button type="button" class="btn-cancel-resolve" onclick="ExpandResolve('${o.ORDERID}')">Cancel</button>
                </div>
            </div>
        </div>
    </div>`;
}

function ExpandResolve(id) {
    $(`#action-container-${id}`).toggle();
    $(`#resolve-box-${id}`).slideToggle(200);
}

function SubmitResolution(orderId) {
    var remark = $(`#remark-${orderId}`).val();

    if (remark.trim() === "") {
        alert("Please enter resolution remarks.");
        return;
    }

    var user = sessionStorage.getItem('NAME');

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("ACKNOWLEDGEQUALITYFEEDBACK")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
        "&REMARK=" + encodeURIComponent(Encrypt(remark)) +
        "&USER=" + encodeURIComponent(Encrypt(user));

    $.ajax({
        url: url,
        type: "POST",
        success: function (res) {
            var data = JSON.parse(res);
            if (data[0].RESULT === "TRUE") {
                $('#LBLRequestResult').html('Patient feedback for order <b>ORD-' + orderId + '</b> has been acknowledged and resolved successfully.');
                ShowModalPopUp('modalSuccess');
                setTimeout(function () {
                    HideModalPopUp('modalSuccess');
                }, 2500);
                $(`#card-${orderId}`).fadeOut(400, function () {
                    $(this).remove();
                    LoadFeedback();
                });
            } else {
                alert("Failed to save resolution. Please try again.");
            }
        },
        error: function () {
            alert("Network error. Could not connect to server.");
        }
    });
}

function getOrderDashRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '0').toString();
}

function LoadNotifications() {
    var roleId = getOrderDashRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 5000,
        success: function (res) {
            RenderNotifications(res || []);
            GetUnreadCount();
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
    var roleId = getOrderDashRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
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
    var roleId = getOrderDashRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS")) +
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
    var roleId = getOrderDashRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD")) +
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
                $this.css({
                    'background': '',
                    'border-left': ''
                });
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