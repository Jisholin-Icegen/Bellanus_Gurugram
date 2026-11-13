var APP_CONFIG = {
    tabs: [
        { id: 'tab-staff', label: 'Staff Entry', active: true },
        { id: 'tab-order', label: 'Order Entry', active: false }
    ],
    servings: [],
    mealTimings: [],
    servingCodeMap: {},
    servingInfo: {},
    wards: [],
    wardRoomMap: {},
    roomPatientMap: {},
    foodMaster: [],
    texts: {
        sessionModalTitle: 'CREATE DIETITIAN RECORD',
        sessionModalTitleEdit: 'EDIT DIETITIAN RECORD',
        labelDate: 'DATE',
        labelTime: 'TIME',
        labelWard: 'WARD-',
        wardPlaceholder: 'Select',
        btnSaveNew: 'Start taking orders',
        btnSaveEdit: 'Update entry',
        btnCancel: 'Cancel',
        emptySession: 'No session entries yet. Click "Start Entry" to add one.',
        sessionTableHeaders: ['Date', 'Time', 'Servings', 'Wards', 'Actions'],
        orderEntryTitle: 'Order Entry',
        orderEntrySubtitle: 'Take one-time or prebooked meal orders by room.',
        orderCountSuffix: ' orders today',
        ordersTableHeaders: ['Room', 'Ward', 'Serving', 'Items', 'Confirmed at', 'Actions'],
        emptyOrders: 'No orders confirmed yet today.',
        overviewCards: [
            { id: 'cardOrdersToday', label: 'Orders today', value: '0' },
            { id: 'cardRoomsServed', label: 'Rooms served', value: '0' },
            { id: 'cardWardsActive', label: 'Wards active', value: '0' }
        ],
        orderModalTitle: 'Take order',
        orderModalSubtitle: 'Dietitian entry for patient room prebook order',
        labelWardSelect: 'Ward selection',
        labelRoomSelect: 'Room no',
        itemsLabelSuffix: ' serving items',
        confirmPrefix: 'Confirm ',
        hintText: 'Choose up to 4 foods for this serving. Use +/- to set quantity.',
        cancelOrderBtn: 'Cancel'
    }
};

var PAGE_STATE = {
    sessions: { currentPage: 1, pageSize: 10 },
    orders: { currentPage: 1, pageSize: 10 }
};

var MAX_ROWS_PER_PAGE = 50;

var state = {
    activeTab: 'tab-staff',
    selectedWards: [],
    sessionRecords: [],
    editingSessionIndex: -1,
    currentServing: null,
    servingTabs: [],
    dietServings: [],
    dietItemsCache: {},
    confirmedMeals: {},
    confirmedOrders: [],
    editingOrderIndex: -1,
    pendingDeleteType: '',
    pendingDeleteOrderIndex: -1,
    pendingDeleteSessionIndex: -1,
    cancelledDefaults: {}
};

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

    var icon = type === 'success' ? 'fa-check-circle'
        : type === 'error' ? 'fa-exclamation-circle'
            : type === 'warning' ? 'fa-exclamation-triangle'
                : 'fa-info-circle';

    toast.find('i').attr('class', 'fas ' + icon);
    $('#dashToastMessage').text(message);
    toast.addClass('show');

    clearTimeout(toast.data('timer'));
    toast.data('timer', setTimeout(function () { HideDashToast(); }, 2500));
}

function HideDashToast() {
    $('#dashToastNotification').removeClass('show');
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

function getDeliveryRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '').toString();
}

function getNotificationUserParams() {
    var userId = ($('#hfUserId').val() || sessionStorage.getItem('USERID') || '').toString();
    var roleId = getDeliveryRoleId();
    var departmentId = (sessionStorage.getItem('DEPARTMENTID') || sessionStorage.getItem('DEPARTMENT') || '').toString();
    return { userId: userId, roleId: roleId, departmentId: departmentId };
}

function loadNotifications() {
    var params = getNotificationUserParams();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20"));

    if (params.userId) url += "&USERID=" + encodeURIComponent(Encrypt(params.userId));
    if (params.roleId) url += "&ROLEID=" + encodeURIComponent(Encrypt(params.roleId));
    if (params.departmentId) url += "&DEPARTMENTID=" + encodeURIComponent(Encrypt(params.departmentId));

    $.ajax({
        url: url, type: "GET", dataType: "json",
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
                '<div class="notification-time">' + escapeHtml(item.TIME_AGO || '') + '</div>' +
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
    var params = getNotificationUserParams();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(NotificationID));

    if (params.roleId) url += "&ROLEID=" + encodeURIComponent(Encrypt(params.roleId));
    if (params.departmentId) url += "&DEPARTMENTID=" + encodeURIComponent(Encrypt(params.departmentId));

    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) { getUnreadCount(); },
        error: function (xhr, status, error) {
            console.log("Error marking notification as read:", error);
            loadNotifications();
        }
    });
}

function getUnreadCount() {
    var params = getNotificationUserParams();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS"));

    if (params.userId) url += "&USERID=" + encodeURIComponent(Encrypt(params.userId));
    if (params.roleId) url += "&ROLEID=" + encodeURIComponent(Encrypt(params.roleId));
    if (params.departmentId) url += "&DEPARTMENTID=" + encodeURIComponent(Encrypt(params.departmentId));

    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var count = res[0].UNREAD_COUNT || 0;
                var $orderBadge = $('#notificationCount');
                if ($orderBadge.length > 0) {
                    $orderBadge.text(count);
                    if (count > 0) { $orderBadge.addClass('show'); } else { $orderBadge.removeClass('show'); }
                }
            } else {
                $('#notificationCount').removeClass('show');
            }
        },
        error: function (xhr, status, error) {
            console.log("Error getting unread count:", error);
        }
    });
}

function markAllNotificationsAsRead() {
    var params = getNotificationUserParams();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD"));

    if (params.userId) url += "&USERID=" + encodeURIComponent(Encrypt(params.userId));
    if (params.roleId) url += "&ROLEID=" + encodeURIComponent(Encrypt(params.roleId));
    if (params.departmentId) url += "&DEPARTMENTID=" + encodeURIComponent(Encrypt(params.departmentId));

    $.ajax({
        url: url, type: "GET", dataType: "json",
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

function loadServingsFromServer(callback) {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETSERVINGS"));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.servings = [];
            APP_CONFIG.servingCodeMap = {};
            APP_CONFIG.servingInfo = {};

            (res || []).forEach(function (row) {
                var name = row.SERVINGNAME || row.ServingName || row.SERVINGLABEL || row.ServingLabel || '';
                var code = String(row.SERVINGCODE || row.ServingCode || '');
                var label = row.SERVINGLABEL || row.ServingLabel || '';
                var startTime = row.STARTTIME || row.StartTime || '';
                var endTime = row.ENDTIME || row.EndTime || '';
                var imgPath = row.IMGPATH || row.ImgPath || '';

                if (!name || !code) return;

                if (APP_CONFIG.servings.indexOf(name) === -1) {
                    APP_CONFIG.servings.push(name);
                }

                APP_CONFIG.servingCodeMap[name] = code;
                APP_CONFIG.servingInfo[name] = {
                    id: row.SERVINGID || row.ServingId,
                    code: code,
                    name: name,
                    label: label,
                    startTime: startTime,
                    endTime: endTime,
                    imgPath: imgPath
                };
            });

            if (typeof callback === 'function') callback();
        },
        error: function () {
            ShowToast('Failed to load servings.', 'error');
            if (typeof callback === 'function') callback();
        }
    });
}

function loadMealTimingsFromServer(callback) {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMEALTIMINGSS"));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.mealTimings = (res || []).map(function (r) {
                return r.MEALTIMINGNAME || r.MEALTIMING || '';
            }).filter(function (m) { return m && m.length > 0; });
            if (typeof callback === 'function') callback();
        },
        error: function () {
            ShowToast('Failed to load meal timings.', 'error');
            if (typeof callback === 'function') callback();
        }
    });
}

function loadWardsFromServer(callback) {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDROOMS"));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.wards = [];
            APP_CONFIG.wardRoomMap = {};

            (res || []).forEach(function (row) {
                var label = row.WARDNAME || row.WardName || row.WARD_NAME || row.Ward_Name || row.WARD || '';
                if (!label) return;
                if (APP_CONFIG.wards.indexOf(label) === -1) APP_CONFIG.wards.push(label);
            });

            if (typeof callback === 'function') callback();
        },
        error: function () {
            ShowToast('Failed to load wards.', 'error');
            if (typeof callback === 'function') callback();
        }
    });
}

function loadRoomsFromServer(ward, callback) {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDROOMS")) +
        (ward ? "&WARD=" + encodeURIComponent(Encrypt(ward)) : "");
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.roomPatientMap = {};
            (res || []).forEach(function (r) {
                APP_CONFIG.roomPatientMap[r.ROOM_NO] = {
                    patientId: r.PATIENT_ID || r.PatientID || null,
                    patient: r.PATIENT || '',
                    diet: r.DIET_TYPE || '',
                    allergy: r.ALLERGY || '',
                    ward: r.WARD || ''
                };
                if (r.WARD && !APP_CONFIG.wardRoomMap[r.WARD]) {
                    APP_CONFIG.wardRoomMap[r.WARD] = [];
                }
                if (r.WARD && APP_CONFIG.wardRoomMap[r.WARD].indexOf(r.ROOM_NO) === -1) {
                    APP_CONFIG.wardRoomMap[r.WARD].push(r.ROOM_NO);
                }
            });
            if (typeof callback === 'function') callback();
        },
        error: function () {
            ShowToast('Failed to load rooms.', 'error');
            if (typeof callback === 'function') callback();
        }
    });
}

function loadFoodMasterFromServer(callback) {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMENUMASTERITEMS"));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.foodMaster = (res || []).map(function (r) {
                return {
                    id: r.MENUITEMID || r.ID,
                    name: r.ITEMNAME || r.FOODNAME,
                    desc: r.ITEMDESC || r.DESCRIPTION || '',
                    serving: String(r.SERVINGCODE || ''),
                    mealtiming: String(r.MEALTIMING || '').trim()
                };
            });
            if (typeof callback === 'function') callback();
        },
        error: function () {
            if (typeof callback === 'function') callback();
        }
    });
}

function loadSessionsFromServer() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDIETITIANSESSIONS"));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            state.sessionRecords = (res || []).map(function (r) {
                return {
                    sessionId: r.SESSIONID,
                    date: r.SESSIONDATE,
                    time: r.SESSIONTIME,
                    servings: r.SERVINGS,
                    wards: r.WARDS
                };
            });
            PAGE_STATE.sessions.currentPage = 1;
            renderSessionList();
        },
        error: function () { ShowToast('Failed to load sessions.', 'error'); }
    });
}

function loadOrdersFromServer() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDIETITIANORDERS"));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            state.confirmedOrders = (res || []).map(function (r) {
                return {
                    orderId: r.ORDERID,
                    room: r.ROOM_NO,
                    ward: r.WARD || '',
                    serving: r.SERVING,
                    items: r.ITEMS,
                    time: r.ORDER_TIME
                };
            });
            PAGE_STATE.orders.currentPage = 1;
            renderConfirmedOrders();
        },
        error: function () { ShowToast('Failed to load orders.', 'error'); }
    });
}

function getFoodsForServing(mealTimingName) {
    if (!mealTimingName) return [];

    var info = APP_CONFIG.servingInfo[mealTimingName] || {};
    var servingCode = String(info.code || '').trim();

    return APP_CONFIG.foodMaster.filter(function (f) {
        if (f.mealtiming === mealTimingName) return true;

        if (servingCode && f.serving) {
            var codes = String(f.serving).split(',').map(function (c) { return c.trim(); });
            if (codes.indexOf(servingCode) !== -1) return true;
        }

        return false;
    });
}

function computePageSize(total) {
    return total > MAX_ROWS_PER_PAGE ? MAX_ROWS_PER_PAGE : 10;
}

function buildPagination(currentPage, totalPages) {
    var pages = [];
    if (totalPages <= 7) {
        for (var i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 4) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentPage >= totalPages - 3) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
    }
    return pages;
}

function renderPagination(containerId, infoId, currentPage, totalRecords, pageSize, onChange) {
    var container = document.getElementById(containerId);
    var info = document.getElementById(infoId);
    if (!container || !info) return;

    var totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    var end = Math.min(currentPage * pageSize, totalRecords);
    info.innerHTML = 'Showing <span>' + start + '</span> to <span>' + end + '</span> of <span>' + totalRecords + '</span> entries';

    container.innerHTML = '';

    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '‹ Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = function () { onChange(currentPage - 1); };
    container.appendChild(prevBtn);

    var pages = buildPagination(currentPage, totalPages);
    pages.forEach(function (p) {
        if (p === '...') {
            var ell = document.createElement('span');
            ell.className = 'pagination-ellipsis';
            ell.textContent = '...';
            container.appendChild(ell);
        } else {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pagination-btn' + (p === currentPage ? ' active' : '');
            btn.textContent = p;
            btn.onclick = function () { onChange(p); };
            container.appendChild(btn);
        }
    });

    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Next ›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = function () { onChange(currentPage + 1); };
    container.appendChild(nextBtn);
}

function renderTabs() {
    var html = '';
    APP_CONFIG.tabs.forEach(function (tab) {
        var cls = 'tab-btn' + (tab.active ? ' active' : '');
        html += '<button type="button" class="' + cls + '" data-tab="' + tab.id + '">' + tab.label + '</button>';
    });
    document.getElementById('tabHeader').innerHTML = html;
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            switchTab(this.getAttribute('data-tab'));
        });
    });
}

function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll('.tab-content').forEach(function (el) { el.classList.remove('active'); });
    document.querySelectorAll('.tab-btn').forEach(function (btn) { btn.classList.remove('active'); });
    var content = document.getElementById(tabId);
    if (content) content.classList.add('active');
    var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    if (btn) btn.classList.add('active');
}

function renderSessionTableHeaders() {
    var html = '<tr>';
    APP_CONFIG.texts.sessionTableHeaders.forEach(function (h) { html += '<th>' + h + '</th>'; });
    html += '</tr>';
    document.getElementById('sessionTableHead').innerHTML = html;
}

function renderOrdersTableHeaders() {
    var html = '<tr>';
    APP_CONFIG.texts.ordersTableHeaders.forEach(function (h) { html += '<th>' + h + '</th>'; });
    html += '</tr>';
    document.getElementById('ordersTableHead').innerHTML = html;
}

function renderOverviewCards() {
    var counts = {
        cardOrdersToday: state.confirmedOrders.length,
        cardRoomsServed: (function () {
            var r = {};
            state.confirmedOrders.forEach(function (o) { r[o.room] = true; });
            return Object.keys(r).length;
        })(),
        cardWardsActive: APP_CONFIG.wards.length
    };
    var html = '';
    APP_CONFIG.texts.overviewCards.forEach(function (c) {
        var val = counts[c.id] !== undefined ? counts[c.id] : c.value;
        html += '<div class="overview-card">' +
            '<div class="overview-card-label">' + c.label + '</div>' +
            '<div class="overview-card-value" id="' + c.id + '">' + val + '</div>' +
            '</div>';
    });
    document.getElementById('overviewCards').innerHTML = html;
}

function renderOrderEntryHeader() {
    document.getElementById('orderEntryTitle').textContent = APP_CONFIG.texts.orderEntryTitle;
    document.getElementById('orderEntrySubtitle').textContent = APP_CONFIG.texts.orderEntrySubtitle;
    document.getElementById('orderCount').textContent = state.confirmedOrders.length + APP_CONFIG.texts.orderCountSuffix;
    document.getElementById('emptyOrdersMessage').textContent = APP_CONFIG.texts.emptyOrders;
}

function renderSessionList() {
    var body = document.getElementById('tblSessionList');
    var empty = document.getElementById('emptySessionMessage');
    empty.textContent = APP_CONFIG.texts.emptySession;

    var total = state.sessionRecords.length;
    PAGE_STATE.sessions.pageSize = computePageSize(total);

    if (total === 0) {
        body.innerHTML = '';
        empty.classList.remove('hidden');
        renderPagination('sessionPagination', 'sessionPaginationInfo', 1, 0, PAGE_STATE.sessions.pageSize, function () { });
        return;
    }
    empty.classList.add('hidden');

    var totalPages = Math.ceil(total / PAGE_STATE.sessions.pageSize);
    if (PAGE_STATE.sessions.currentPage > totalPages) PAGE_STATE.sessions.currentPage = totalPages;
    var start = (PAGE_STATE.sessions.currentPage - 1) * PAGE_STATE.sessions.pageSize;
    var end = start + PAGE_STATE.sessions.pageSize;
    var pageItems = state.sessionRecords.slice(start, end);

    body.innerHTML = '';
    pageItems.forEach(function (rec, i) {
        var globalIndex = start + i;

        var servingsList = (rec.servings || '').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
        var wardsList = (rec.wards || '').split(',').map(function (w) { return w.trim(); }).filter(function (w) { return w.length > 0; });

        var servingsDisplay = servingsList.join(', ');
        var wardsDisplay = wardsList.join(', ');

        var row = document.createElement('tr');
        row.innerHTML =
            '<td>' + escapeHtml(rec.date) + '</td>' +
            '<td>' + escapeHtml(rec.time) + '</td>' +
            '<td>' + escapeHtml(servingsDisplay) + '</td>' +
            '<td>' + escapeHtml(wardsDisplay) + '</td>' +
            '<td><div class="session-actions">' +
            '<button type="button" class="session-action-btn edit-btn" title="Edit" onclick="editSession(' + globalIndex + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>' +
            '</svg>' +
            '</button>' +
            '<button type="button" class="session-action-btn delete-btn" title="Delete" onclick="deleteSession(' + globalIndex + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="3 6 5 6 21 6"></polyline>' +
            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
            '</svg>' +
            '</button>' +
            '</div></td>';
        body.appendChild(row);
    });

    renderPagination('sessionPagination', 'sessionPaginationInfo',
        PAGE_STATE.sessions.currentPage, total, PAGE_STATE.sessions.pageSize,
        function (page) {
            PAGE_STATE.sessions.currentPage = page;
            renderSessionList();
        });
}

function renderServingsRow() {
    var html = '';
    var slots = APP_CONFIG.servings.length;

    for (var i = 0; i < slots; i++) {
        var servingName = APP_CONFIG.servings[i];
        if (!servingName) continue;

        var info = APP_CONFIG.servingInfo[servingName] || {};

        var timeRange = '';
        if (info.startTime && info.endTime) {
            timeRange = info.startTime + ' – ' + info.endTime;
        } else if (info.startTime) {
            timeRange = 'From ' + info.startTime;
        } else if (info.endTime) {
            timeRange = 'Until ' + info.endTime;
        }

        html += '<div class="serving-cell serving-cell-checkbox">' +
            '<label class="serving-checkbox-label">' +
            '<input type="checkbox" class="serving-checkbox" ' +
            'data-serving="' + escapeHtml(servingName) + '" ' +
            'data-code="' + escapeHtml(info.code || '') + '">' +
            '<span class="serving-checkbox-text">' + escapeHtml(servingName) + '</span>' +
            '</label>' +
            (timeRange
                ? '<div class="serving-time-range">' + escapeHtml(timeRange) + '</div>'
                : '') +
            '</div>';
    }

    document.getElementById('sessionServingsRow').innerHTML = html;
}

function renderSessionModalLabels() {
    document.getElementById('sessionModalTitle').textContent = APP_CONFIG.texts.sessionModalTitle;
    document.getElementById('labelDate').textContent = APP_CONFIG.texts.labelDate;
    document.getElementById('labelTime').textContent = APP_CONFIG.texts.labelTime;
    document.getElementById('labelWard').textContent = APP_CONFIG.texts.labelWard;
    document.getElementById('wardMultiselectLabel').textContent = APP_CONFIG.texts.wardPlaceholder;
    document.getElementById('btnCancelSession').textContent = APP_CONFIG.texts.btnCancel;
    document.getElementById('btnSaveSession').textContent = APP_CONFIG.texts.btnSaveNew;
}

function renderOrderModalLabels() {
    document.getElementById('orderModalTitle').textContent = APP_CONFIG.texts.orderModalTitle;
    document.getElementById('orderModalSubtitle').textContent = APP_CONFIG.texts.orderModalSubtitle;
    document.getElementById('labelWardSelect').textContent = APP_CONFIG.texts.labelWardSelect;
    document.getElementById('labelRoomSelect').textContent = APP_CONFIG.texts.labelRoomSelect;
    document.getElementById('dietitianHint').textContent = APP_CONFIG.texts.hintText;
    document.getElementById('btnCancelOrder').textContent = APP_CONFIG.texts.cancelOrderBtn;
}

function renderWardOptions() {
    var menu = document.getElementById('wardMultiselectMenu');
    if (!menu) return;
    menu.innerHTML = '';

    if (!APP_CONFIG.wards || APP_CONFIG.wards.length === 0) {
        var emptyMsg = document.createElement('div');
        emptyMsg.className = 'multiselect-option';
        emptyMsg.style.color = '#94a3b8';
        emptyMsg.style.fontStyle = 'italic';
        emptyMsg.textContent = 'No wards available';
        menu.appendChild(emptyMsg);
        updateWardLabel();
        return;
    }

    APP_CONFIG.wards.forEach(function (ward) {
        var label = document.createElement('label');
        label.className = 'multiselect-option';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = ward;
        cb.checked = state.selectedWards.indexOf(ward) !== -1;
        cb.onchange = function () {
            if (this.checked) {
                if (state.selectedWards.indexOf(ward) === -1) state.selectedWards.push(ward);
            } else {
                state.selectedWards = state.selectedWards.filter(function (w) { return w !== ward; });
            }
            updateWardLabel();
            syncWardsToModal();
        };
        label.appendChild(cb);
        label.appendChild(document.createTextNode(ward));
        menu.appendChild(label);
    });
    updateWardLabel();
}

function updateWardLabel() {
    var label = document.getElementById('wardMultiselectLabel');
    if (state.selectedWards.length === 0) {
        label.textContent = APP_CONFIG.texts.wardPlaceholder;
    } else if (state.selectedWards.length === APP_CONFIG.wards.length) {
        label.textContent = 'All wards';
    } else {
        label.textContent = state.selectedWards.length + ' selected';
    }
}

function toggleWardDropdown(e) {
    e.stopPropagation();
    document.getElementById('wardMultiselect').classList.toggle('open');
}

function syncWardsToModal() {
    var menu = document.getElementById('dietWardMenu');
    if (!menu) return;
    menu.innerHTML = '';
    var wardsToShow = state.selectedWards.length > 0 ? state.selectedWards : APP_CONFIG.wards;
    wardsToShow.forEach(function (w) {
        var opt = document.createElement('div');
        opt.className = 'dietitian-select-option';
        opt.textContent = w;
        opt.setAttribute('data-value', w);
        opt.onclick = function () {
            selectDietWard(w);
        };
        menu.appendChild(opt);
    });
    clearDietWardSelection();
}

function populateRoomDropdown(ward, onReady) {
    loadRoomsFromServer(ward, function () {
        var menu = document.getElementById('dietRoomMenu');
        if (!menu) return;
        menu.innerHTML = '';

        var rooms = [];
        if (ward && APP_CONFIG.wardRoomMap[ward]) {
            rooms = APP_CONFIG.wardRoomMap[ward];
        } else {
            var wardsToUse = state.selectedWards.length > 0 ? state.selectedWards : APP_CONFIG.wards;
            wardsToUse.forEach(function (w) {
                if (APP_CONFIG.wardRoomMap[w]) rooms = rooms.concat(APP_CONFIG.wardRoomMap[w]);
            });
        }

        rooms.forEach(function (r) {
            var opt = document.createElement('div');
            opt.className = 'dietitian-select-option';
            opt.textContent = r;
            opt.setAttribute('data-value', r);
            opt.onclick = function () {
                selectDietRoom(r);
            };
            menu.appendChild(opt);
        });

        if (typeof onReady === 'function') {
            onReady();
        } else {
            clearDietRoomSelection();
        }
    });
}

function selectDietWard(ward) {
    var wrap = document.getElementById('dietWardSelect');
    var valueSpan = wrap.querySelector('.dietitian-select-value');
    valueSpan.textContent = ward;
    valueSpan.classList.remove('placeholder');
    wrap.querySelectorAll('.dietitian-select-option').forEach(function (o) {
        o.classList.toggle('selected', o.getAttribute('data-value') === ward);
    });
    wrap.classList.remove('open');
    populateRoomDropdown(ward);
    updatePills();
}

function selectDietRoom(room) {
    var wrap = document.getElementById('dietRoomSelect');
    var valueSpan = wrap.querySelector('.dietitian-select-value');
    valueSpan.textContent = room;
    valueSpan.classList.remove('placeholder');
    wrap.querySelectorAll('.dietitian-select-option').forEach(function (o) {
        o.classList.toggle('selected', o.getAttribute('data-value') === room);
    });
    wrap.classList.remove('open');
    updatePills();

    var patientInfo = APP_CONFIG.roomPatientMap[room];
    if (patientInfo && patientInfo.patient) {
        var patientId = patientInfo.patientId || null;
        var currentMeal = state.currentServing ? state.currentServing.mealTiming : '';
        loadDefaultPreOrder(patientId, room, currentMeal, function (result) {
            if (result && result.hasDefault) {
                applyDefaultPreOrderToUI(result, currentMeal);
            }
        });
    }
}

function clearDietWardSelection() {
    var wrap = document.getElementById('dietWardSelect');
    if (!wrap) return;
    var valueSpan = wrap.querySelector('.dietitian-select-value');
    valueSpan.textContent = '-- Select Ward --';
    valueSpan.classList.add('placeholder');
    wrap.querySelectorAll('.dietitian-select-option').forEach(function (o) {
        o.classList.remove('selected');
    });
}

function clearDietRoomSelection() {
    var wrap = document.getElementById('dietRoomSelect');
    if (!wrap) return;
    var valueSpan = wrap.querySelector('.dietitian-select-value');
    valueSpan.textContent = '-- Select Room --';
    valueSpan.classList.add('placeholder');
    wrap.querySelectorAll('.dietitian-select-option').forEach(function (o) {
        o.classList.remove('selected');
    });
}

function getDietWardValue() {
    var wrap = document.getElementById('dietWardSelect');
    if (!wrap) return '';
    var span = wrap.querySelector('.dietitian-select-value');
    return span.classList.contains('placeholder') ? '' : span.textContent;
}

function getDietRoomValue() {
    var wrap = document.getElementById('dietRoomSelect');
    if (!wrap) return '';
    var span = wrap.querySelector('.dietitian-select-value');
    return span.classList.contains('placeholder') ? '' : span.textContent;
}

function onWardChangeInModal() {
    var ward = getDietWardValue();
    populateRoomDropdown(ward);
    updatePills();
}

function onRoomChangeInModal() {
    updatePills();
}

function updatePills() {
    var room = getDietRoomValue();
    var pillPatient = document.getElementById('pillPatient');
    var pillRow = document.getElementById('pillRow');
    var pillDiet = document.getElementById('pillDiet');
    var pillAllergy = document.getElementById('pillAllergy');

    if (!room || !APP_CONFIG.roomPatientMap[room]) {
        pillPatient.classList.add('hidden');
        pillRow.classList.add('hidden');
        return;
    }
    var info = APP_CONFIG.roomPatientMap[room];
    pillPatient.textContent = info.patient + ' · Room ' + room;
    pillPatient.classList.remove('hidden');

    if (info.diet) {
        pillDiet.textContent = info.diet;
        pillDiet.classList.remove('hidden');
    } else {
        pillDiet.classList.add('hidden');
    }
    if (info.allergy) {
        pillAllergy.textContent = info.allergy;
        pillAllergy.classList.remove('hidden');
    } else {
        pillAllergy.classList.add('hidden');
    }

    if (info.diet || info.allergy) {
        pillRow.classList.remove('hidden');
    } else {
        pillRow.classList.add('hidden');
    }
}

function openSessionModal() {
    state.editingSessionIndex = -1;
    document.getElementById('sessionModalTitle').textContent = APP_CONFIG.texts.sessionModalTitle;
    document.getElementById('btnSaveSession').textContent = APP_CONFIG.texts.btnSaveNew;
    clearSessionForm();
    document.getElementById('sessionModalOverlay').classList.add('show');
}

function openSessionModalForEdit(index) {
    state.editingSessionIndex = index;
    var rec = state.sessionRecords[index];
    document.getElementById('sessionModalTitle').textContent = APP_CONFIG.texts.sessionModalTitleEdit;
    document.getElementById('btnSaveSession').textContent = APP_CONFIG.texts.btnSaveEdit;
    document.getElementById('txtSessionDate').value = rec.date;
    document.getElementById('txtSessionTime').value = rec.time;

    var saved = (rec.servings || '').split(',').map(function (s) { return s.trim(); });

    document.querySelectorAll('.serving-checkbox').forEach(function (cb) {
        var val = cb.getAttribute('data-serving');
        cb.checked = saved.indexOf(val) !== -1;
    });

    state.selectedWards = (rec.wards || '').split(',').map(function (w) { return w.trim(); });
    renderWardOptions();
    document.getElementById('sessionModalOverlay').classList.add('show');
}

function clearSessionForm() {
    var now = new Date();
    var yyyy = now.getFullYear();
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    var hh = String(now.getHours()).padStart(2, '0');
    var min = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('txtSessionDate').value = yyyy + '-' + mm + '-' + dd;
    document.getElementById('txtSessionTime').value = hh + ':' + min;

    document.querySelectorAll('.serving-checkbox').forEach(function (cb) {
        cb.checked = false;
    });

    state.selectedWards = [];
    renderWardOptions();
}

function closeSessionModal() {
    document.getElementById('sessionModalOverlay').classList.remove('show');
    state.editingSessionIndex = -1;
}

function saveSessionEntry() {
    var date = document.getElementById('txtSessionDate').value;
    var time = document.getElementById('txtSessionTime').value;
    if (!date) { ShowToast('Pick a date first.', 'error'); return; }
    if (!time) { ShowToast('Pick a time first.', 'error'); return; }

    var mealTimings = [];
    document.querySelectorAll('.serving-checkbox:checked').forEach(function (cb) {
        var val = cb.getAttribute('data-serving');
        if (val && mealTimings.indexOf(val) === -1) mealTimings.push(val);
    });

    if (mealTimings.length === 0) { ShowToast('Select at least one serving.', 'error'); return; }
    if (state.selectedWards.length === 0) { ShowToast('Select at least one ward.', 'error'); return; }

    state.dietServings = mealTimings.slice();

    var editingId = 0;
    if (state.editingSessionIndex >= 0 && state.sessionRecords[state.editingSessionIndex]) {
        editingId = state.sessionRecords[state.editingSessionIndex].sessionId || 0;
    }

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("SAVEDIETITIANSESSION")) +
        "&SESSIONID=" + encodeURIComponent(Encrypt(String(editingId))) +
        "&SESSIONDATE=" + encodeURIComponent(Encrypt(date)) +
        "&SESSIONTIME=" + encodeURIComponent(Encrypt(time)) +
        "&SERVINGS=" + encodeURIComponent(Encrypt(mealTimings.join(', '))) +
        "&WARDS=" + encodeURIComponent(Encrypt(state.selectedWards.join(', '))) +
        "&USERID=" + encodeURIComponent(Encrypt(($("#hfUserId").val() || "0")));

    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            var ok = res && res[0] && (res[0].RESULT === 'INSERTED' || res[0].RESULT === 'UPDATED');
            if (ok) {
                ShowToast(editingId > 0 ? 'Session updated.' : 'Session saved.', 'success');
                loadSessionsFromServer();
                syncWardsToModal();
                closeSessionModal();
            } else {
                ShowToast('Failed to save session.', 'error');
            }
        },
        error: function () { ShowToast('Network error saving session.', 'error'); }
    });
}

function editSession(index) { openSessionModalForEdit(index); }

function deleteSession(index) {
    state.pendingDeleteType = 'session';
    state.pendingDeleteSessionIndex = index;
    var rec = state.sessionRecords[index];
    document.getElementById('deleteModalTitle').textContent = 'Remove Session Entry?';
    document.getElementById('deleteUserName').textContent = rec.date + ' ' + rec.time;
    document.getElementById('btnYesDelete').textContent = 'Yes, remove entry';
    document.getElementById('deleteModalOverlay').classList.add('show');
    document.getElementById('deleteModalnew').classList.add('show');
}

function openDietitianOrder() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDIETITIANSESSIONS"));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            state.sessionRecords = (res || []).map(function (r) {
                return {
                    sessionId: r.SESSIONID,
                    date: r.SESSIONDATE,
                    time: r.SESSIONTIME,
                    servings: r.SERVINGS,
                    wards: r.WARDS
                };
            });
            buildAndShowOrderModal();
        },
        error: function () {
            buildAndShowOrderModal();
        }
    });
}

function buildAndShowOrderModal() {
    state.editingOrderIndex = -1;
    state.confirmedMeals = {};
    state.cancelledDefaults = {};
    clearDietWardSelection();
    clearDietRoomSelection();
    syncWardsToModal();
    populateRoomDropdown('');
    updatePills();

    var latestSession = (state.sessionRecords && state.sessionRecords.length > 0)
        ? state.sessionRecords[0]
        : null;

    var servingList = [];
    if (latestSession && latestSession.servings) {
        servingList = String(latestSession.servings)
            .split(',')
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s.length > 0; });
    }

    if (servingList.length === 0) {
        servingList = APP_CONFIG.mealTimings.slice();
    }

    state.servingTabs = servingList.map(function (name) {
        return { label: name, mealTiming: name };
    });

    state.dietServings = state.servingTabs.map(function (t) { return t.label; });
    state.dietItemsCache = {};

    state.servingTabs.forEach(function (tab) {
        state.dietItemsCache[tab.mealTiming] = [
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null }
        ];
    });

    state.currentServing = state.servingTabs[0] || null;
    renderDietServingTabs();

    if (state.currentServing) {
        selectDietServing(state.currentServing);
    }

    document.getElementById('dietitianOrderOverlay').classList.add('show');
}

function openDietitianOrderForEdit(index) {
    var order = state.confirmedOrders[index];
    state.editingOrderIndex = index;
    state.confirmedMeals = {};
    state.cancelledDefaults = {};

    var wardWrap = document.getElementById('dietWardSelect');
    var wardSpan = wardWrap.querySelector('.dietitian-select-value');
    wardSpan.textContent = order.ward || '-- Select Ward --';
    if (order.ward) {
        wardSpan.classList.remove('placeholder');
    } else {
        wardSpan.classList.add('placeholder');
    }
    wardWrap.querySelectorAll('.dietitian-select-option').forEach(function (o) {
        o.classList.toggle('selected', o.getAttribute('data-value') === order.ward);
    });
    wardWrap.classList.remove('open');

    populateRoomDropdown(order.ward, function () {
        selectDietRoom(order.room);
        updatePills();
    });

    var latestSession = (state.sessionRecords && state.sessionRecords.length > 0)
        ? state.sessionRecords[0]
        : null;

    var servingList = [];
    if (latestSession && latestSession.servings) {
        servingList = String(latestSession.servings)
            .split(',')
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s.length > 0; });
    }

    if (order.serving && servingList.indexOf(order.serving) === -1) {
        servingList.push(order.serving);
    }

    if (servingList.length === 0) {
        servingList = APP_CONFIG.mealTimings.slice();
    }

    state.servingTabs = servingList.map(function (name) {
        return { label: name, mealTiming: name };
    });

    state.dietItemsCache = {};
    state.servingTabs.forEach(function (tab) {
        state.dietItemsCache[tab.mealTiming] = [
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null }
        ];
    });

    var cache = state.dietItemsCache[order.serving];
    if (cache) {
        var foods = order.items.split(', ');
        foods.forEach(function (entry, idx) {
            if (idx >= 4) return;
            var parts = entry.split(' x');
            if (parts.length === 2) {
                cache[idx].selected = parts[0];
                cache[idx].qty = parseInt(parts[1], 10) || 1;
                cache[idx].isDefault = false;
            }
        });
    }

    state.currentServing = { label: order.serving, mealTiming: order.serving };
    state.confirmedMeals[order.serving] = true;
    renderDietServingTabs();
    selectDietServing(state.currentServing);

    document.getElementById('dietitianOrderOverlay').classList.add('show');
}

function closeDietitianOrder() {
    document.getElementById('dietitianOrderOverlay').classList.remove('show');
    state.editingOrderIndex = -1;
    state.confirmedMeals = {};
}

function renderDietServingTabs() {
    var container = document.getElementById('dietServingTabs');
    if (!container) return;
    container.innerHTML = '';

    state.servingTabs.forEach(function (tab) {
        var btn = document.createElement('div');
        var confirmed = state.confirmedMeals && state.confirmedMeals[tab.mealTiming];
        btn.className = 'dietitian-tab' + (confirmed ? ' confirmed' : '');
        btn.textContent = confirmed ? tab.label + ' ✓' : tab.label;
        btn.onclick = function () { selectDietServing(tab); };
        container.appendChild(btn);
    });

    updateActiveTab();
}

function updateActiveTab() {
    var current = state.currentServing ? state.currentServing.label : '';
    document.querySelectorAll('.dietitian-tab').forEach(function (t) {
        var text = t.textContent.replace(' ✓', '').trim();
        t.classList.toggle('active', text === current);
    });
}

function selectDietServing(tab) {
    state.currentServing = tab;
    updateActiveTab();

    var label = tab.label || '';
    var meal = tab.mealTiming || '';

    document.getElementById('dietItemsLabel').textContent = label + APP_CONFIG.texts.itemsLabelSuffix;
    document.getElementById('dietConfirmLabel').textContent = APP_CONFIG.texts.confirmPrefix + meal.toLowerCase();

    loadDietItems(meal);

    var room = getDietRoomValue();
    var patientInfo = room ? APP_CONFIG.roomPatientMap[room] : null;
    if (patientInfo && patientInfo.patient) {
        var patientId = patientInfo.patientId || null;
        loadDefaultPreOrder(patientId, room, meal, function (result) {
            if (result && result.hasDefault) {
                applyDefaultPreOrderToUI(result, meal);
            }
        });
    }
}

function loadDietItems(serving) {
    if (!state.dietItemsCache[serving]) {
        state.dietItemsCache[serving] = [
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null }
        ];
    }
    renderDietItems(state.dietItemsCache[serving]);
}

function renderDietItems(items) {
    var list = document.getElementById('dietItemsList');
    list.innerHTML = '';
    var foods = getFoodsForServing(state.currentServing ? state.currentServing.mealTiming : '');

    items.forEach(function (item, idx) {
        var row = document.createElement('div');
        row.className = 'dietitian-item-row' + (item.isDefault ? ' is-default' : '');

        var label = document.createElement('div');
        label.className = 'item-label';
        label.textContent = item.isDefault ? "Today's Food" : ('Item ' + (idx + 1));
        row.appendChild(label);

        var searchable = document.createElement('div');
        searchable.className = 'searchable-select';

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'searchable-trigger';

        var valueSpan = document.createElement('span');
        var hasValue = item.selected && item.selected.length > 0;
        if (hasValue) {
            valueSpan.className = 'searchable-value';
            valueSpan.textContent = item.selected;
        } else {
            valueSpan.className = 'searchable-value placeholder';
            valueSpan.textContent = 'Select Item ' + (idx + 1);
        }
        trigger.appendChild(valueSpan);

        var arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.innerHTML = '&#9660;';
        trigger.appendChild(arrow);

        var menu = document.createElement('div');
        menu.className = 'searchable-menu';
        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'searchable-input';
        searchInput.placeholder = 'Search food...';
        menu.appendChild(searchInput);
        var optionsWrap = document.createElement('div');

        foods.forEach(function (f) {
            var optEl = document.createElement('div');
            optEl.className = 'searchable-option' + (f.name === item.selected ? ' selected' : '');
            optEl.textContent = f.name;
            optEl.onclick = function (e) {
                e.stopPropagation();

                item.selected = f.name;
                item.isDefault = false;
                item.orderId = null;
                item.qty = item.qty || 1;

                valueSpan.textContent = f.name;
                valueSpan.classList.remove('placeholder');
                searchable.classList.remove('open');
                optionsWrap.querySelectorAll('.searchable-option').forEach(function (o) {
                    o.classList.toggle('selected', o.textContent === f.name);
                });

                renderDietItems(state.dietItemsCache[state.currentServing.mealTiming]);
            };
            optionsWrap.appendChild(optEl);
        });
        menu.appendChild(optionsWrap);

        searchInput.oninput = function () {
            var q = this.value.toLowerCase();
            optionsWrap.querySelectorAll('.searchable-option').forEach(function (o) {
                o.style.display = o.textContent.toLowerCase().indexOf(q) !== -1 ? 'block' : 'none';
            });
        };
        trigger.onclick = function (e) {
            e.stopPropagation();
            document.querySelectorAll('.searchable-select.open').forEach(function (s) {
                if (s !== searchable) s.classList.remove('open');
            });
            searchable.classList.toggle('open');
            if (searchable.classList.contains('open')) {
                searchInput.value = '';
                optionsWrap.querySelectorAll('.searchable-option').forEach(function (o) { o.style.display = 'block'; });
                setTimeout(function () { searchInput.focus(); }, 30);
            }
        };
        searchable.appendChild(trigger);
        searchable.appendChild(menu);
        row.appendChild(searchable);

        if (item.selected && item.selected.length > 0 && item.isDefault) {
            var delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'item-delete-btn';
            delBtn.title = 'Remove default pre-order';
            delBtn.innerHTML = '<img src="../images/delete-icon.png" alt="Remove">';
            delBtn.onclick = function (e) {
                e.stopPropagation();

                if (item.orderId) {
                    removeDefaultFood(item.orderId, function (ok) {
                        if (ok) {
                            item.selected = '';
                            item.qty = 1;
                            item.isDefault = false;
                            item.orderId = null;
                            renderDietItems(state.dietItemsCache[state.currentServing.mealTiming]);
                            ShowToast('Default pre-order removed.', 'success');
                        }
                    });
                } else {
                    item.selected = '';
                    item.qty = 1;
                    item.isDefault = false;
                    item.orderId = null;
                    renderDietItems(state.dietItemsCache[state.currentServing.mealTiming]);
                }
            };
            row.appendChild(delBtn);
        } else {
            var spacer = document.createElement('div');
            spacer.className = 'item-delete-spacer';
            row.appendChild(spacer);
        }

        var stepper = document.createElement('div');
        stepper.className = 'qty-stepper' + (item.isDefault ? ' is-locked' : '');
        var minus = document.createElement('button');
        minus.type = 'button';
        minus.textContent = '-';
        var qtySpan = document.createElement('span');
        qtySpan.textContent = item.qty;
        var plus = document.createElement('button');
        plus.type = 'button';
        plus.textContent = '+';

        if (item.isDefault) {
            minus.disabled = true;
            plus.disabled = true;
        } else {
            minus.onclick = function () {
                item.qty = Math.max(1, item.qty - 1);
                qtySpan.textContent = item.qty;
            };
            plus.onclick = function () {
                item.qty = item.qty + 1;
                qtySpan.textContent = item.qty;
            };
        }

        stepper.appendChild(minus);
        stepper.appendChild(qtySpan);
        stepper.appendChild(plus);
        row.appendChild(stepper);

        list.appendChild(row);
    });
}
function loadDefaultPreOrder(patientId, roomNo, mealType, callback) {
    var key = roomNo + '|' + mealType;
    if (state.cancelledDefaults && state.cancelledDefaults[key]) {
        if (typeof callback === 'function') callback(null);
        return;
    }

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDEFAULTPREORDER"));

    if (patientId) url += "&PATIENTID=" + encodeURIComponent(Encrypt(String(patientId)));
    if (roomNo) url += "&ROOMNO=" + encodeURIComponent(Encrypt(roomNo));
    if (mealType) url += "&MEALTYPE=" + encodeURIComponent(Encrypt(mealType));

    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var row = res[0];
                var items = [];
                if (row.DefaultPreOrderItems) {
                    try {
                        items = JSON.parse(row.DefaultPreOrderItems);
                    } catch (e) {
                        console.error('Failed to parse DefaultPreOrderItems', e);
                    }
                }
                var result = {
                    patientId: row.PatientID,
                    patientName: row.PatientName,
                    roomNo: row.RoomNo,
                    ward: row.Ward,
                    dietType: row.DietType,
                    allergies: row.Allergies,
                    mealType: row.MealType,
                    items: items,
                    hasDefault: items.length > 0
                };
                if (typeof callback === 'function') callback(result);
            } else {
                if (typeof callback === 'function') callback(null);
            }
        },
        error: function () {
            if (typeof callback === 'function') callback(null);
        }
    });
}

function applyDefaultPreOrderToUI(result, servingName) {
    if (!result || !result.items || result.items.length === 0) return;

    var meal = servingName || result.mealType;

    if (!state.dietItemsCache[meal]) {
        state.dietItemsCache[meal] = [
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null },
            { selected: '', qty: 1, isDefault: false, orderId: null }
        ];
    }

    var categoryName = meal;
    var info = APP_CONFIG.servingInfo[meal];
    if (info && info.label) {
        var cleaned = String(info.label).replace(/\s*Service\s*$/i, '').trim();
        if (cleaned) categoryName = cleaned;
    }

    var itemsForMeal = result.items.filter(function (it) {
        var itemMeal = String(it.MEALTYPE || '').toLowerCase();
        var itemCat = String(it.MEALTYPE_CATEGORY || '').toLowerCase();
        var itemSrv = String(it.MEALTYPE_SERVING || '').toLowerCase();

        return itemMeal === String(meal).toLowerCase()
            || itemMeal === String(categoryName).toLowerCase()
            || itemCat === String(categoryName).toLowerCase()
            || itemSrv === String(meal).toLowerCase();
    });

    var cache = state.dietItemsCache[meal];

    var slotIdx = 0;
    for (var i = 0; i < cache.length && slotIdx < itemsForMeal.length; i++) {
        if (cache[i].selected && cache[i].selected.length > 0 && !cache[i].isDefault) {
            continue;
        }
        var it = itemsForMeal[slotIdx];
        cache[i].selected = it.ITEMNAME;
        cache[i].qty = parseInt(it.QUANTITY, 10) || 1;
        cache[i].isDefault = true;
        cache[i].orderId = it.ORDERID || null;
        slotIdx++;
    }

    if (state.currentServing && state.currentServing.mealTiming === meal) {
        renderDietItems(cache);
    }
}

function removeDefaultFood(orderId, callback) {
    if (!orderId) {
        if (typeof callback === 'function') callback(false);
        return;
    }

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("REMOVEDEFAULTFOOD")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(String(orderId)));

    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            var result = null;
            if (res && res.length > 0) {
                result = res[0];
            } else if (res && res.Tables && res.Tables[0] && res.Tables[0].Rows && res.Tables[0].Rows.length > 0) {
                result = res.Tables[0].Rows[0];
            }

            var ok = result && String(result.Status).toLowerCase() === 'success';
            if (typeof callback === 'function') callback(ok);
        },
        error: function () {
            ShowToast('Failed to remove default pre-order.', 'error');
            if (typeof callback === 'function') callback(false);
        }
    });
}

function confirmDietServing() {
    var room = getDietRoomValue();
    var ward = getDietWardValue();
    if (ward === '') { ShowToast('Select a ward first.', 'error'); return; }
    if (room === '') { ShowToast('Select a room number first.', 'error'); return; }

    var currentMeal = state.currentServing ? state.currentServing.mealTiming : '';
    var servingLabel = state.currentServing ? state.currentServing.label : '';
    if (!currentMeal) return;

    var items = state.dietItemsCache[currentMeal] || [];
    var summary = items
        .filter(function (item) { return item.selected && item.qty > 0; })
        .map(function (item) { return item.selected + ' x' + item.qty; })
        .join(', ');
    if (summary === '') { ShowToast('Add at least one item.', 'error'); return; }

    var editingId = 0;
    if (state.editingOrderIndex >= 0 && state.confirmedOrders[state.editingOrderIndex]) {
        var editOrder = state.confirmedOrders[state.editingOrderIndex];
        if (editOrder.serving === servingLabel) {
            editingId = editOrder.orderId || 0;
        }
    }

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("SAVEDIETITIANORDER")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(String(editingId))) +
        "&SESSIONID=" + encodeURIComponent(Encrypt("0")) +
        "&ROOM=" + encodeURIComponent(Encrypt(room)) +
        "&WARD=" + encodeURIComponent(Encrypt(ward)) +
        "&SERVING=" + encodeURIComponent(Encrypt(servingLabel)) +
        "&ITEMS=" + encodeURIComponent(Encrypt(summary)) +
        "&USERID=" + encodeURIComponent(Encrypt(($("#hfUserId").val() || "0")));

    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            var ok = res && res[0] && (res[0].RESULT === 'INSERTED' || res[0].RESULT === 'UPDATED');
            if (!ok) {
                ShowToast((res && res[0] && (res[0].Message || res[0].RESULT)) || 'Failed to save order.', 'error');
                return;
            }

            state.confirmedMeals[currentMeal] = true;

            state.dietItemsCache[currentMeal] = [
                { selected: '', qty: 1, isDefault: false, orderId: null },
                { selected: '', qty: 1, isDefault: false, orderId: null },
                { selected: '', qty: 1, isDefault: false, orderId: null },
                { selected: '', qty: 1, isDefault: false, orderId: null }
            ];

            state.editingOrderIndex = -1;

            renderDietServingTabs();
            loadOrdersFromServer();
            ShowToast(servingLabel + ' confirmed for room ' + room + '.', 'success');

            var next = state.servingTabs.filter(function (t) {
                return !state.confirmedMeals[t.mealTiming];
            })[0];

            if (next) {
                selectDietServing(next);
            } else {
                ShowToast('All servings confirmed for room ' + room + '.', 'success');
            }
        },
        error: function () { ShowToast('Network error saving order.', 'error'); }
    });
}

function renderConfirmedOrders() {
    var body = document.getElementById('tblConfirmedOrders');
    var empty = document.getElementById('emptyOrdersMessage');

    var total = state.confirmedOrders.length;
    PAGE_STATE.orders.pageSize = computePageSize(total);

    if (total === 0) {
        body.innerHTML = '';
        empty.classList.remove('hidden');
        renderPagination('ordersPagination', 'ordersPaginationInfo', 1, 0, PAGE_STATE.orders.pageSize, function () { });
        renderOverviewCards();
        renderOrderEntryHeader();
        return;
    }
    empty.classList.add('hidden');

    var totalPages = Math.ceil(total / PAGE_STATE.orders.pageSize);
    if (PAGE_STATE.orders.currentPage > totalPages) PAGE_STATE.orders.currentPage = totalPages;
    var start = (PAGE_STATE.orders.currentPage - 1) * PAGE_STATE.orders.pageSize;
    var end = start + PAGE_STATE.orders.pageSize;
    var pageItems = state.confirmedOrders.slice(start, end);

    body.innerHTML = '';
    pageItems.forEach(function (o, i) {
        var globalIndex = start + i;
        var row = document.createElement('tr');
        row.innerHTML =
            '<td>' + o.room + '</td>' +
            '<td>' + o.ward + '</td>' +
            '<td><span class="serving-badge">' + o.serving + '</span></td>' +
            '<td>' + o.items + '</td>' +
            '<td>' + o.time + '</td>' +
            '<td><div class="order-actions">' +
            '<button type="button" class="session-action-btn edit-btn" title="Edit" onclick="editOrder(' + globalIndex + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>' +
            '</svg>' +
            '</button>' +
            '<button type="button" class="session-action-btn delete-btn" title="Delete" onclick="askDeleteOrder(' + globalIndex + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="3 6 5 6 21 6"></polyline>' +
            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
            '</svg>' +
            '</button>' +
            '</div></td>';
        body.appendChild(row);
    });

    renderPagination('ordersPagination', 'ordersPaginationInfo',
        PAGE_STATE.orders.currentPage, total, PAGE_STATE.orders.pageSize,
        function (page) {
            PAGE_STATE.orders.currentPage = page;
            renderConfirmedOrders();
        });

    renderOverviewCards();
    renderOrderEntryHeader();
}

function editOrder(index) {
    openDietitianOrderForEdit(index);
}

function askDeleteOrder(index) {
    state.pendingDeleteType = 'order';
    state.pendingDeleteOrderIndex = index;
    var order = state.confirmedOrders[index];
    document.getElementById('deleteModalTitle').textContent = "Remove Today's Selected Menu?";
    document.getElementById('deleteUserName').textContent = order.serving + ' (' + order.room + ')';
    document.getElementById('btnYesDelete').textContent = 'Yes, remove menu';
    document.getElementById('deleteModalOverlay').classList.add('show');
    document.getElementById('deleteModalnew').classList.add('show');
}

function closeDeleteOrderModal() {
    state.pendingDeleteType = '';
    state.pendingDeleteSessionIndex = -1;
    state.pendingDeleteOrderIndex = -1;
    document.getElementById('deleteModalOverlay').classList.remove('show');
    document.getElementById('deleteModalnew').classList.remove('show');
}

function confirmDeleteOrder() {
    if (state.pendingDeleteType === 'session') {
        var rec = state.sessionRecords[state.pendingDeleteSessionIndex];
        if (!rec) { closeDeleteOrderModal(); return; }
        var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("DELETEDIETITIANSESSION")) +
            "&SESSIONID=" + encodeURIComponent(Encrypt(String(rec.sessionId))) +
            "&USERID=" + encodeURIComponent(Encrypt(($("#hfUserId").val() || "0")));
        $.ajax({
            url: url, type: "GET", dataType: "json",
            success: function () {
                ShowToast('Session entry deleted.', 'success');
                loadSessionsFromServer();
                closeDeleteOrderModal();
            },
            error: function () { ShowToast('Failed to delete session.', 'error'); }
        });
    } else {
        var order = state.confirmedOrders[state.pendingDeleteOrderIndex];
        if (!order) { closeDeleteOrderModal(); return; }

        var cancelledServing = order.serving;
        var cancelledRoom = order.room;

        var url2 = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("DELETEDIETITIANORDER")) +
            "&ORDERID=" + encodeURIComponent(Encrypt(String(order.orderId)));

        $.ajax({
            url: url2, type: "GET", dataType: "json",
            success: function (res) {
                var result = (res && res[0] && res[0].RESULT) ? res[0].RESULT : 'TRUE';
                if (result === 'TRUE' || result === 'Success') {
                    var key = cancelledRoom + '|' + cancelledServing;
                    state.cancelledDefaults[key] = true;

                    if (state.confirmedMeals[cancelledServing]) {
                        delete state.confirmedMeals[cancelledServing];
                    }

                    state.dietItemsCache[cancelledServing] = [
                        { selected: '', qty: 1, isDefault: false, orderId: null },
                        { selected: '', qty: 1, isDefault: false, orderId: null },
                        { selected: '', qty: 1, isDefault: false, orderId: null },
                        { selected: '', qty: 1, isDefault: false, orderId: null }
                    ];

                    if (state.currentServing && state.currentServing.mealTiming === cancelledServing) {
                        loadDietItems(cancelledServing);
                    }

                    renderDietServingTabs();
                    ShowToast('Default pre-order removed. You can select new items now.', 'success');
                    loadOrdersFromServer();
                    closeDeleteOrderModal();
                } else {
                    var msg = (res && res[0] && res[0].MESSAGE) ? res[0].MESSAGE : 'Failed to delete order.';
                    ShowToast(msg, 'error');
                }
            },
            error: function () { ShowToast('Failed to delete order.', 'error'); }
        });
    }
}

$(document).ready(function () {
    var userName = sessionStorage.getItem('NAME') || (typeof currentUser !== 'undefined' ? currentUser.userName : '');
    var userRole = sessionStorage.getItem('ROLENAME') || (typeof currentUser !== 'undefined' ? currentUser.userRole : '');
    var userId = parseInt(sessionStorage.getItem("USERID")) || (typeof currentUser !== 'undefined' ? currentUser.userId : 0);

    $('#spndepNursname').text(userName);
    $('#spnUserTypeLabel').text(userRole);
    $('#spanUserName').text(userName);
    $('#hfUserName').val(userName);
    $('#hfUserRole').val(userRole);
    if ($('#hfUserId').length && !$('#hfUserId').val()) {
        $('#hfUserId').val(userId);
    }

    if (typeof InitChangePassword === 'function') { InitChangePassword(); }

    renderTabs();
    renderSessionTableHeaders();
    renderOrdersTableHeaders();
    renderOverviewCards();
    renderOrderEntryHeader();
    renderSessionModalLabels();
    renderOrderModalLabels();

    loadWardsFromServer(function () {
        renderWardOptions();

        loadServingsFromServer(function () {

            loadMealTimingsFromServer(function () {

                loadFoodMasterFromServer(function () {
                    renderServingsRow();

                    loadSessionsFromServer();
                    loadOrdersFromServer();
                    loadNotifications();
                    syncWardsToModal();
                    bindEvents();
                    bindNotification();
                    clearSessionForm();
                });
            });
        });
    });

    $('#btnRefresh').off('click').on('click', function () {
        var btn = $(this);
        btn.find('i,img').addClass('fa-spin');
        loadSessionsFromServer();
        loadOrdersFromServer();
        loadNotifications();
        setTimeout(function () {
            btn.find('i,img').removeClass('fa-spin');
            ShowToast('Refreshed successfully!', 'success');
        }, 400);
    });
});

function bindNotification() {
    $(document).off('click.dietitianBell', '#notificationBell').on('click.dietitianBell', '#notificationBell', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#notificationDropdown').toggleClass('show');
        if ($('#notificationDropdown').hasClass('show')) { loadNotifications(); }
    });

    $(document).off('click.dietitianBellOutside').on('click.dietitianBellOutside', function (e) {
        if (!$(e.target).closest('.notification-wrapper').length) {
            $('#notificationDropdown').removeClass('show');
        }
    });

    $(document).off('click.dietitianMarkAll', '#markAllRead').on('click.dietitianMarkAll', '#markAllRead', function (e) {
        e.preventDefault();
        e.stopPropagation();
        markAllNotificationsAsRead();
    });

    $(document).off('click.dietitianNotifItem', '.notification-item.unread').on('click.dietitianNotifItem', '.notification-item.unread', function (e) {
        var $this = $(this);
        var notificationId = $this.data('id');
        if (notificationId) {
            markNotificationAsRead(notificationId);
            $this.removeClass('unread').addClass('read');
            $this.find('.unread-dot').remove();

            var currentCount = parseInt($('#notificationCount').text()) || 0;
            var newCount = Math.max(0, currentCount - 1);
            $('#notificationCount').text(newCount);
            if (newCount <= 0) { $('#notificationCount').removeClass('show'); }
        }
    });
}

function bindEvents() {
    document.addEventListener('click', function (e) {
        var wardMulti = document.getElementById('wardMultiselect');
        if (wardMulti && !wardMulti.contains(e.target)) {
            wardMulti.classList.remove('open');
        }
        document.querySelectorAll('.searchable-select.open').forEach(function (s) {
            if (!s.contains(e.target)) s.classList.remove('open');
        });

        var wardSel = document.getElementById('dietWardSelect');
        if (wardSel && !wardSel.contains(e.target)) {
            wardSel.classList.remove('open');
        }
        var roomSel = document.getElementById('dietRoomSelect');
        if (roomSel && !roomSel.contains(e.target)) {
            roomSel.classList.remove('open');
        }
    });

    var wardTrigger = document.getElementById('dietWardSelect') ? document.getElementById('dietWardSelect').querySelector('.dietitian-select-trigger') : null;
    if (wardTrigger) {
        wardTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            var wrap = document.getElementById('dietWardSelect');
            document.getElementById('dietRoomSelect').classList.remove('open');
            wrap.classList.toggle('open');
        });
    }
    var roomTrigger = document.getElementById('dietRoomSelect') ? document.getElementById('dietRoomSelect').querySelector('.dietitian-select-trigger') : null;
    if (roomTrigger) {
        roomTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            var wrap = document.getElementById('dietRoomSelect');
            document.getElementById('dietWardSelect').classList.remove('open');
            wrap.classList.toggle('open');
        });
    }

    var sessionOverlay = document.getElementById('sessionModalOverlay');
    if (sessionOverlay) {
        sessionOverlay.addEventListener('click', function (e) {
            if (e.target === this) closeSessionModal();
        });
    }
    var orderOverlay = document.getElementById('dietitianOrderOverlay');
    if (orderOverlay) {
        orderOverlay.addEventListener('click', function (e) {
            if (e.target === this) closeDietitianOrder();
        });
    }
    var delOverlay = document.getElementById('deleteModalOverlay');
    if (delOverlay) {
        delOverlay.addEventListener('click', closeDeleteOrderModal);
    }
    var keepBtn = document.getElementById('btnKeepUser');
    if (keepBtn) keepBtn.addEventListener('click', closeDeleteOrderModal);
    var yesBtn = document.getElementById('btnYesDelete');
    if (yesBtn) yesBtn.addEventListener('click', confirmDeleteOrder);
}