var umCurrentPage = 1;
var umRowsPerPage = 10;
var umAllAudits = [];
var umFilteredAudits = [];
var umTotalPages = 1;

$(document).ready(function () {
    var $searchInput = $('#txtAuditSearch');
    if ($searchInput.length > 0) {
        $searchInput.val('');
        $searchInput.attr('autocomplete', 'off');
    }

    var userName = sessionStorage.getItem('NAME') || '';
    var userRole = sessionStorage.getItem('ROLENAME') || '';
    var roleId = parseInt(sessionStorage.getItem("ROLE")) || 0;

    $('#spndepNursname').text(userName);
    $('#spnUserTypeLabel').text(userRole);
    $('#spanUserName').text(userName);
    $('#hfUserName').val(userName);
    $('#hfUserRole').val(userRole);

    if (typeof InitChangePassword === 'function') { InitChangePassword(); }

    loadAuditActions();
    loadAudits();
    loadNotifications();

    $('#btnRefresh').off('click').on('click', function () {
        var btn = $(this);
        btn.find('i').addClass('fa-spin');
        loadAuditActions();
        loadAudits(function () {
            btn.find('i').removeClass('fa-spin');
            loadNotifications();
            ShowToast('Audit Log refreshed successfully!', 'success');
        });
    });

    var searchTimer;
    $('#txtAuditSearch').off('keyup').on('keyup', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () { filterAudits(); }, 300);
    });

    $('#ddlAuditAction').off('change').on('change', function () { filterAudits(); });

    $('#txtAuditSearch').off('keypress').on('keypress', function (e) {
        if (e.which === 13) { e.preventDefault(); }
    });

    $(document).off('keydown').on('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            $('#txtAuditSearch').focus();
        }
    });

    $(document).on('click', '#notificationBell', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#notificationDropdown').toggleClass('show');
        if ($('#notificationDropdown').hasClass('show')) { loadNotifications(); }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.notification-wrapper').length) {
            $('#notificationDropdown').removeClass('show');
        }
    });

    $(document).on('click', '#markAllRead', function (e) {
        e.preventDefault();
        e.stopPropagation();
        markAllNotificationsAsRead();
    });

    $(document).on('click', '.notification-item.unread', function (e) {
        var $this = $(this);
        var notificationId = $this.data('id');
        if (notificationId) {
            markNotificationAsRead(notificationId);
            $this.removeClass('unread');
            $this.find('.unread-dot').remove();

            var currentCount = parseInt($('#notificationCount').text()) || 0;
            var newCount = Math.max(0, currentCount - 1);
            $('#notificationCount').text(newCount);
            if (newCount <= 0) { $('#notificationCount').removeClass('show'); }
        }
    });
});

function loadAuditActions() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETAUDITACTIONS"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            var $dropdown = $('#ddlAuditAction');
            $dropdown.find('option:not(:first)').remove();

            if (response && response.length > 0) {
                $.each(response, function (i, item) {
                    var actionVal = item.ActionType || item;
                    if (actionVal && actionVal.trim() !== '') {
                        $dropdown.append('<option value="' + actionVal + '">' + actionVal + '</option>');
                    }
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading audit actions:', error);
        }
    });
}

function loadAudits(callback) {
    $('#tblAuditBody').html('<tr><td colspan="6" style="text-align:center; padding:30px; color:#888;"><i class="fas fa-spinner fa-spin"></i> Loading audit trail...</td></tr>');

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETAUDITLOGS"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response && response.length > 0) {
                umAllAudits = response;
                filterAudits();
                if (callback) callback();
            } else {
                $('#tblAuditBody').html('<tr><td colspan="6" style="text-align:center; padding:30px; color:#888;">No audit logs found</td></tr>');
                if (callback) callback();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading audit logs:', error);
            $('#tblAuditBody').html('<tr><td colspan="6" style="text-align:center; padding:30px; color:#888;">Error loading audit logs</td></tr>');
            if (callback) callback();
        }
    });
}

function filterAudits() {
    var searchTerm = $('#txtAuditSearch').val().toLowerCase().trim();
    var actionFilter = $('#ddlAuditAction').val();

    umFilteredAudits = umAllAudits.filter(function (log) {
        var action = (log.ActionLabel || '').toLowerCase();
        var actor = (log.Actor || '').toLowerCase();
        var details = (log.Details || '').toLowerCase();

        var matchSearch = !searchTerm || action.indexOf(searchTerm) > -1 || actor.indexOf(searchTerm) > -1 || details.indexOf(searchTerm) > -1;
        var matchAction = !actionFilter || action === actionFilter.toLowerCase();

        return matchSearch && matchAction;
    });

    umCurrentPage = 1;
    renderTable();
}

function getAuditColorIndex(actionLabel) {
    var hash = 0;
    var cleanAction = (actionLabel || '').toLowerCase().trim();
    for (var i = 0; i < cleanAction.length; i++) {
        hash = cleanAction.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 40;
}

function getAuditBadgeClass(actionLabel) {
    var colors = [
        'color-1', 'color-2', 'color-3', 'color-4', 'color-5',
        'color-6', 'color-7', 'color-8', 'color-9', 'color-10',
        'color-11', 'color-12', 'color-13', 'color-14', 'color-15',
        'color-16', 'color-17', 'color-18', 'color-19', 'color-20',
        'color-21', 'color-22', 'color-23', 'color-24', 'color-25',
        'color-26', 'color-27', 'color-28', 'color-29', 'color-30',
        'color-31', 'color-32', 'color-33', 'color-34', 'color-35',
        'color-36', 'color-37', 'color-38', 'color-39', 'color-40'
    ];
    var index = getAuditColorIndex(actionLabel);
    return colors[index % colors.length];
}

function renderTable() {
    var tbody = $('#tblAuditBody');
    tbody.empty();

    if (umFilteredAudits.length === 0) {
        tbody.html('<tr><td colspan="6" style="text-align:center; padding:30px; color:#888;">No audit logs found</td></tr>');
        updatePaginationInfo(0);
        return;
    }

    var start = (umCurrentPage - 1) * umRowsPerPage;
    var end = Math.min(start + umRowsPerPage, umFilteredAudits.length);
    var pageLogs = umFilteredAudits.slice(start, end);

    $.each(pageLogs, function (i, log) {
        var timeDisplay = log.Time || '';
        var minutesAgo = log.MinutesAgo || 0;
        var timeAgo = '';
        if (minutesAgo < 60) {
            timeAgo = 'about ' + minutesAgo + ' minutes ago';
        } else if (minutesAgo < 1440) {
            var hours = Math.round(minutesAgo / 60);
            timeAgo = 'about ' + hours + ' hours ago';
        } else {
            var days = Math.round(minutesAgo / 1440);
            timeAgo = days + ' days ago';
        }

        var actionLabel = log.ActionLabel || 'meal order status changed';
        var badgeClass = getAuditBadgeClass(actionLabel);

        var actor = log.Actor || '—';
        var entity = log.Entity || 'Meal Order';
        var details = log.Details || '—';
        var snapshotAvailable = log.SnapshotAvailable !== false;

        var row = `
            <tr>
                <td>
                    <div class="audit-time">
                        <div>${escapeHtml(timeDisplay)}</div>
                        <small>${escapeHtml(timeAgo)}</small>
                    </div>
                </td>
                <td>
                    <span class="audit-badge ${escapeHtml(badgeClass)}">
                        ${escapeHtml(actionLabel)}
                    </span>
                </td>
                <td>${escapeHtml(actor)}</td>
                <td>${escapeHtml(entity)}</td>
                <td>${escapeHtml(details)}</td>
                <td>
                    ${snapshotAvailable ? '<span class="snapshot-pill">Snapshot available</span>' : '—'}
                </td>
            </tr>
        `;
        tbody.append(row);
    });

    updatePaginationInfo(umFilteredAudits.length);
}

function updatePaginationInfo(total) {
    umTotalPages = Math.ceil(total / umRowsPerPage) || 1;
    var start = (umCurrentPage - 1) * umRowsPerPage + 1;
    var end = Math.min(umCurrentPage * umRowsPerPage, total);

    $('#startRecord').text(total > 0 ? start : 0);
    $('#endRecord').text(end);
    $('#totalRecords').text(total);

    var container = $('#paginationControls');
    container.empty();

    if (umTotalPages <= 1) {
        return;
    }

    var prevDisabled = umCurrentPage <= 1 ? 'disabled' : '';
    var html = `<button class="page-btn pagination-prev" data-page="${umCurrentPage - 1}" ${prevDisabled}>‹ Previous</button>`;

    var maxVisible = 5;
    var startPage = Math.max(1, umCurrentPage - Math.floor(maxVisible / 2));
    var endPage = Math.min(umTotalPages, startPage + maxVisible - 1);

    if (startPage > 1) {
        html += `<button class="page-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            html += `<span class="page-ellipsis">…</span>`;
        }
    }

    for (var i = startPage; i <= endPage; i++) {
        var active = i === umCurrentPage ? 'active' : '';
        html += `<button class="page-btn ${active}" data-page="${i}">${i}</button>`;
    }

    if (endPage < umTotalPages) {
        if (endPage < umTotalPages - 1) {
            html += `<span class="page-ellipsis">…</span>`;
        }
        html += `<button class="page-btn" data-page="${umTotalPages}">${umTotalPages}</button>`;
    }

    var nextDisabled = umCurrentPage >= umTotalPages ? 'disabled' : '';
    html += `<button class="page-btn pagination-next" data-page="${umCurrentPage + 1}" ${nextDisabled}>Next ›</button>`;

    container.html(html);
}

$(document).on('click', '#paginationControls .page-btn:not(.pagination-prev):not(.pagination-next)', function () {
    var page = parseInt($(this).data('page'));
    if (page > 0 && page <= umTotalPages) {
        umCurrentPage = page;
        renderTable();
    }
});

$(document).on('click', '#paginationControls .pagination-prev', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (umCurrentPage > 1) {
        umCurrentPage--;
        renderTable();
    }
});

$(document).on('click', '#paginationControls .pagination-next', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (umCurrentPage < umTotalPages) {
        umCurrentPage++;
        renderTable();
    }
});

function getNotificationIcon(type) {
    type = (type || '').toLowerCase();
    switch (type) {
        case "error": return "../images/notification/warning.png";
        case "info": return "../images/notification/shield.png";
        case "success": return "../images/notification/thumbs-up.png";
        default: return "../images/notification/bell-icon.png";
    }
}

function getAuditRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '0').toString();
}
function loadNotifications() {
    var roleId = getAuditRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            renderNotifications(res || []);
            getUnreadCount();
        },
        error: function (xhr, status, error) {
            console.log("Error loading notifications:", error);
        }
    });
}

function renderNotifications(notifications) {
    var html = '';
    var unreadCount = 0;

    if (notifications && notifications.length > 0) {
        $.each(notifications, function (i, item) {
            var isRead = item.IS_READ === true || item.IS_READ === 1;
            if (!isRead) unreadCount++;

            var iconClass = (item.NOTIFICATION_TYPE || 'info').toLowerCase();
            var icon = getNotificationIcon(iconClass);
            var notificationId = item.NOTIFICATION_ID || item.ID || i;

            html += '<div class="notification-item' + (isRead ? ' read' : ' unread') + '" data-id="' + notificationId + '">' +
                '<div class="notification-icon ' + iconClass + '">' +
                '<img src="' + icon + '" alt="' + iconClass + '">' +
                '</div>' +
                '<div class="notification-content">' +
                '<div class="notification-text">' +
                '<h4>' + escapeHtml(item.NOTIFICATION_HEADER || '') + '</h4>' +
                '<p>' + escapeHtml(item.NOTIFICATION_MESSAGE || '') + '</p>' +
                '</div>' +
                '<div class="notification-time">' +
                escapeHtml(item.TIME_AGO || '') +
                '</div>' +
                '</div>' +
                (!isRead ? '<span class="unread-dot"></span>' : '') +
                '</div>';
        });
    } else {
        html = '<div class="notification-item" style="text-align:center;color:#888;padding:20px;">No new notifications</div>';
    }

    $('#notificationList').html(html);
    $('#notificationCount').text(unreadCount);
    if (unreadCount > 0) { $('#notificationCount').addClass('show'); } else { $('#notificationCount').removeClass('show'); }
}

function markNotificationAsRead(NotificationID) {
    var roleId = getAuditRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(NotificationID)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) { getUnreadCount(); },
        error: function (xhr, status, error) {
            console.log("Error marking notification as read:", error);
            loadNotifications();
        }
    });
}

function getUnreadCount() {
    var roleId = getAuditRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var count = res[0].UNREAD_COUNT || 0;
                var $orderBadge = $('#notificationCount');
                if ($orderBadge.length > 0) {
                    $orderBadge.text(count);
                    if (count > 0) { $orderBadge.addClass('show'); } else { $orderBadge.removeClass('show'); }
                }
            } else { $('#notificationCount').removeClass('show'); }
        },
        error: function (xhr, status, error) {
            console.log("Error getting unread count:", error);
        }
    });
}
function markAllNotificationsAsRead() {
    var roleId = getAuditRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            loadNotifications();
            ShowToast('All notifications marked as read');
        },
        error: function (xhr, status, error) {
            console.log("Error marking all notifications as read:", error);
            ShowToast('Failed to mark all as read', 'error');
        }
    });
}
function Encrypt(Value) {
    if (typeof CryptoKey === 'undefined' || typeof CryptoPwd === 'undefined') return Value;
    try {
        var key = CryptoJS.enc.Utf8.parse(CryptoKey);
        var iv = CryptoJS.enc.Utf8.parse(CryptoPwd);
        var encryptedVal = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(Value), key, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encryptedVal;
    } catch (e) { return Value; }
}

function escapeHtml(value) {
    if (!value) return '';
    return String(value).replace(/[&<>"']/g, function (ch) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[ch];
    });
}

function ShowToast(message, type) {
    type = type || 'success';
    var toast = $('#dashToastNotification');

    if (toast.length === 0) {
        $('body').append(
            '<div class="dash-toast-notification" id="dashToastNotification">' +
            '<i class="fas fa-check-circle"></i>' +
            '<span id="dashToastMessage"></span>' +
            '<button class="toast-close" onclick="HideDashToast();">&times;</button>' +
            '</div>'
        );
        toast = $('#dashToastNotification');
    }

    var icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

    toast.find('i').attr('class', 'fas ' + icon);
    $('#dashToastMessage').text(message);
    toast.addClass('show');

    clearTimeout(toast.data('timer'));
    toast.data('timer', setTimeout(function () { HideDashToast(); }, 2500));
}

function HideDashToast() {
    $('#dashToastNotification').removeClass('show');
}

function ShowModalPopUp(modalId) {
    if (typeof $('#' + modalId).modal === 'function') {
        $('#' + modalId).modal('show');
    } else {
        $('#' + modalId).modal('toggle');
    }
}

function HideModalPopUp(modalId) {
    if (typeof $('#' + modalId).modal === 'function') {
        $('#' + modalId).modal('hide');
    }
}