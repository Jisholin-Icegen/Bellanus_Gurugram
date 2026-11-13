var APP_CONFIG = {
    mealTimings: [],
    servings: [],
    servingCodeMap: {},
    servingInfo: {},
    wards: [],
    wardRoomMap: {},
    roomPatientMap: {},
    foodMaster: [],
    texts: {
        orderCountSuffix: ' orders today',
        ordersTableHeaders: ['Room / Ward', 'Patient & Diet', 'Order / Type', 'Serving', 'Items', 'Status', 'Confirmed at', 'Actions'],
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

var PAGE_STATE = { orders: { currentPage: 1, pageSize: 10 } };
var MAX_ROWS_PER_PAGE = 50;

var state = {
    currentServing: null,
    servingTabs: [],
    dietItemsCache: {},
    confirmedMeals: {},
    confirmedOrders: [],
    editingOrderIndex: -1,
    pendingDeleteOrderIndex: -1,
    cancelledDefaults: {}
};

function Encrypt(Value) {
    if (typeof CryptoKey === 'undefined' || typeof CryptoPwd === 'undefined') return Value;
    try {
        var key = CryptoJS.enc.Utf8.parse(CryptoKey);
        var iv = CryptoJS.enc.Utf8.parse(CryptoPwd);
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(Value), key,
            { keySize: 128 / 8, iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    } catch (e) { return Value; }
}

function escapeHtml(v) {
    if (!v) return '';
    return String(v).replace(/[&<>"']/g, function (c) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c];
    });
}

function ShowToast(msg, type) {
    type = type || 'success';
    var t = $('#dashToastNotification');
    if (t.length === 0) {
        $('body').append('<div class="dash-toast-notification" id="dashToastNotification">' +
            '<i class="fas fa-check-circle"></i><span id="dashToastMessage"></span>' +
            '<button class="toast-close" onclick="HideDashToast();">&times;</button></div>');
        t = $('#dashToastNotification');
    }
    var icon = type === 'error' ? 'fa-exclamation-circle'
        : type === 'warning' ? 'fa-exclamation-triangle'
            : type === 'info' ? 'fa-info-circle' : 'fa-check-circle';
    t.find('i').attr('class', 'fas ' + icon);
    $('#dashToastMessage').text(msg);
    t.addClass('show');
    clearTimeout(t.data('timer'));
    t.data('timer', setTimeout(HideDashToast, 2500));
}

function HideDashToast() { $('#dashToastNotification').removeClass('show'); }

function getNotificationIcon(t) {
    switch ((t || '').toLowerCase()) {
        case 'error': return '../images/notification/warning.png';
        case 'info': return '../images/notification/shield.png';
        case 'success': return '../images/notification/thumbs-up.png';
        default: return '../images/notification/bell-icon.png';
    }
}

function getNotificationUserParams() {
    return {
        userId: ($('#hfUserId').val() || sessionStorage.getItem('USERID') || '').toString(),
        roleId: (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '').toString(),
        departmentId: (sessionStorage.getItem('DEPARTMENTID') || sessionStorage.getItem('DEPARTMENT') || '').toString()
    };
}

function loadNotifications() {
    var p = getNotificationUserParams();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20"));
    if (p.userId) url += "&USERID=" + encodeURIComponent(Encrypt(p.userId));
    if (p.roleId) url += "&ROLEID=" + encodeURIComponent(Encrypt(p.roleId));
    if (p.departmentId) url += "&DEPARTMENTID=" + encodeURIComponent(Encrypt(p.departmentId));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) { renderNotifications(res || []); getUnreadCount(); },
        error: function (xhr, status, error) { console.log("Error loading notifications:", error); }
    });
}

function renderNotifications(list) {
    var html = '', unread = 0;
    if (list && list.length) {
        $.each(list, function (i, item) {
            var isRead = item.IS_READ === true || item.IS_READ === 1;
            if (!isRead) unread++;
            var cls = (item.NOTIFICATION_TYPE || 'info').toLowerCase();
            var icon = getNotificationIcon(cls);
            var id = item.NOTIFICATION_ID || item.ID || i;
            html += '<div class="notification-item' + (isRead ? ' read' : ' unread') + '" data-id="' + id + '">' +
                '<div class="notification-icon ' + cls + '"><img src="' + icon + '" alt="' + cls + '"></div>' +
                '<div class="notification-content">' +
                '<div class="notification-text"><h4>' + escapeHtml(item.NOTIFICATION_HEADER || '') + '</h4>' +
                '<p>' + escapeHtml(item.NOTIFICATION_MESSAGE || '') + '</p></div>' +
                '<div class="notification-time">' + escapeHtml(item.TIME_AGO || '') + '</div>' +
                '</div>' +
                (!isRead ? '<span class="unread-dot"></span>' : '') +
                '</div>';
        });
    } else {
        html = '<div class="notification-item" style="text-align:center;color:#888;padding:20px;">No new notifications</div>';
    }
    $('#notificationList').html(html);
    $('#notificationCount').text(unread).toggleClass('show', unread > 0);
}

function markNotificationAsRead(id) {
    var p = getNotificationUserParams();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(id));
    if (p.roleId) url += "&ROLEID=" + encodeURIComponent(Encrypt(p.roleId));
    if (p.departmentId) url += "&DEPARTMENTID=" + encodeURIComponent(Encrypt(p.departmentId));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: getUnreadCount,
        error: function () { loadNotifications(); }
    });
}

function getUnreadCount() {
    var p = getNotificationUserParams();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS"));
    if (p.userId) url += "&USERID=" + encodeURIComponent(Encrypt(p.userId));
    if (p.roleId) url += "&ROLEID=" + encodeURIComponent(Encrypt(p.roleId));
    if (p.departmentId) url += "&DEPARTMENTID=" + encodeURIComponent(Encrypt(p.departmentId));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            var n = (res && res.length) ? (res[0].UNREAD_COUNT || 0) : 0;
            $('#notificationCount').text(n).toggleClass('show', n > 0);
        },
        error: function (xhr, status, error) { console.log("Error getting unread count:", error); }
    });
}

function markAllNotificationsAsRead() {
    var p = getNotificationUserParams();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD"));
    if (p.userId) url += "&USERID=" + encodeURIComponent(Encrypt(p.userId));
    if (p.roleId) url += "&ROLEID=" + encodeURIComponent(Encrypt(p.roleId));
    if (p.departmentId) url += "&DEPARTMENTID=" + encodeURIComponent(Encrypt(p.departmentId));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function () { loadNotifications(); ShowToast('All notifications marked as read'); },
        error: function () { ShowToast('Failed to mark all as read', 'error'); }
    });
}

function loadServingsFromServer(cb) {
    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETSERVINGS_LO")), type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.servings = []; APP_CONFIG.servingCodeMap = {}; APP_CONFIG.servingInfo = {};
            (res || []).forEach(function (row) {
                var name = row.SERVINGNAME || row.ServingName || row.SERVINGLABEL || row.ServingLabel || '';
                var code = String(row.SERVINGCODE || row.ServingCode || '');
                if (!name || !code) return;
                if (APP_CONFIG.servings.indexOf(name) === -1) APP_CONFIG.servings.push(name);
                APP_CONFIG.servingCodeMap[name] = code;
                APP_CONFIG.servingInfo[name] = {
                    id: row.SERVINGID || row.ServingId, code: code, name: name,
                    label: row.SERVINGLABEL || row.ServingLabel || '',
                    startTime: row.STARTTIME || '', endTime: row.ENDTIME || ''
                };
            });
            cb && cb();
        }, error: function () { ShowToast('Failed to load servings.', 'error'); cb && cb(); }
    });
}

function loadMealTimingsFromServer(cb) {
    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMEALTIMINGS_LO")), type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.mealTimings = (res || []).map(function (r) { return r.MEALTIMINGNAME || r.MEALTIMING || ''; }).filter(Boolean);
            cb && cb();
        }, error: function () { ShowToast('Failed to load meal timings.', 'error'); cb && cb(); }
    });
}

function loadWardsFromServer(cb) {
    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDROOMS_LO")), type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.wards = []; APP_CONFIG.wardRoomMap = {};
            (res || []).forEach(function (row) {
                var label = row.WARDNAME || row.WardName || row.WARD_NAME || row.Ward_Name || row.WARD || '';
                if (label && APP_CONFIG.wards.indexOf(label) === -1) APP_CONFIG.wards.push(label);
            });
            cb && cb();
        }, error: function () { ShowToast('Failed to load wards.', 'error'); cb && cb(); }
    });
}

function loadRoomsFromServer(ward, cb) {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDROOMS_LO")) +
        (ward ? "&WARD=" + encodeURIComponent(Encrypt(ward)) : "");
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.roomPatientMap = {};
            (res || []).forEach(function (r) {
                APP_CONFIG.roomPatientMap[r.ROOM_NO] = {
                    patientId: r.PATIENT_ID || r.PatientID || null, patient: r.PATIENT || '',
                    diet: r.DIET_TYPE || '', allergy: r.ALLERGY || '', ward: r.WARD || ''
                };
                if (r.WARD) {
                    if (!APP_CONFIG.wardRoomMap[r.WARD]) APP_CONFIG.wardRoomMap[r.WARD] = [];
                    if (APP_CONFIG.wardRoomMap[r.WARD].indexOf(r.ROOM_NO) === -1) APP_CONFIG.wardRoomMap[r.WARD].push(r.ROOM_NO);
                }
            });
            cb && cb();
        }, error: function () { ShowToast('Failed to load rooms.', 'error'); cb && cb(); }
    });
}

function loadFoodMasterFromServer(cb) {
    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMENUMASTERITEMS_LO")), type: "GET", dataType: "json",
        success: function (res) {
            APP_CONFIG.foodMaster = (res || []).map(function (r) {
                return {
                    id: r.MENUITEMID || r.ID, name: r.ITEMNAME || r.FOODNAME, desc: r.ITEMDESC || r.DESCRIPTION || '',
                    serving: String(r.SERVINGCODE || ''), mealtiming: String(r.MEALTIMING || '').trim()
                };
            });
            cb && cb();
        }, error: function () { cb && cb(); }
    });
}

function loadOrdersFromServer() {
    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETORDERS_LO")), type: "GET", dataType: "json",
        success: function (res) {
            var flatData = (res || []).map(function (r) {
                return {
                    rowId: r.ID,
                    orderId: r.ORDERID,
                    patientId: r.PATIENTID,
                    room: r.ROOM_NO,
                    ward: r.WARD || '',
                    patientName: r.PATIENTNAME || r.ORDERBY,
                    serving: r.SERVING,
                    itemName: r.ITEMNAME,
                    quantity: r.QUANTITY,
                    status: r.STATUS,
                    isPreorder: r.ISPREORDER == 1,
                    isDenied: r.ISDENIED == 1 || r.STATUS === 'Denied',
                    deniedReason: r.DENIEDREASON,
                    isDefault: r.DEFAULT_PREORDER == 1,
                    time: r.ORDER_TIME,
                    allergens: r.ALLERGENS,  // MAPPING ALLERGENS
                    dietType: r.DIETTYPE,    // MAPPING DIETTYPE
                    menuChanged: r.MENUCHANGED == 1,
                    menuChangeReason: r.MENUCHANGE_REASON || ''
                };
            });

            var grouped = {};
            flatData.forEach(function (o) {
                if (!grouped[o.orderId]) {
                    grouped[o.orderId] = {
                        orderId: o.orderId,
                        room: o.room,
                        ward: o.ward,
                        patientName: o.patientName,
                        serving: o.serving,
                        time: o.time,
                        isPreorder: o.isPreorder,
                        dietType: o.dietType,     
                        allergens: o.allergens,   
                        items: []
                    };
                }
                grouped[o.orderId].items.push(o);
            });

            state.confirmedOrders = Object.values(grouped);
            PAGE_STATE.orders.currentPage = 1;
            renderConfirmedOrders();
        }, error: function () { ShowToast('Failed to load orders.', 'error'); }
    });
}

function computePageSize(total) { return total > MAX_ROWS_PER_PAGE ? MAX_ROWS_PER_PAGE : 10; }

function buildPagination(currentPage, totalPages) {
    var pages = [];
    if (totalPages <= 7) { for (var i = 1; i <= totalPages; i++) pages.push(i); }
    else if (currentPage <= 4) pages = [1, 2, 3, 4, 5, '...', totalPages];
    else if (currentPage >= totalPages - 3) pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    else pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
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
    var prev = document.createElement('button'); prev.type = 'button'; prev.className = 'pagination-btn';
    prev.textContent = '‹ Previous'; prev.disabled = currentPage === 1;
    prev.onclick = function () { onChange(currentPage - 1); }; container.appendChild(prev);
    buildPagination(currentPage, totalPages).forEach(function (p) {
        if (p === '...') { var e = document.createElement('span'); e.className = 'pagination-ellipsis'; e.textContent = '...'; container.appendChild(e); }
        else {
            var b = document.createElement('button'); b.type = 'button';
            b.className = 'pagination-btn' + (p === currentPage ? ' active' : '');
            b.textContent = p; b.onclick = function () { onChange(p); }; container.appendChild(b);
        }
    });
    var next = document.createElement('button'); next.type = 'button'; next.className = 'pagination-btn';
    next.textContent = 'Next ›'; next.disabled = currentPage === totalPages;
    next.onclick = function () { onChange(currentPage + 1); }; container.appendChild(next);
}

function renderOrdersTableHeaders() {
    var head = document.getElementById('ordersTableHead');
    if (!head) return;
    head.innerHTML = '<tr>' + APP_CONFIG.texts.ordersTableHeaders.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>';
}

function renderOverviewCards() {
    var box = document.getElementById('overviewCards');
    if (!box) return;
    var counts = {
        cardOrdersToday: state.confirmedOrders.length,
        cardRoomsServed: (function () { var r = {}; state.confirmedOrders.forEach(function (o) { r[o.room] = true; }); return Object.keys(r).length; })(),
        cardWardsActive: APP_CONFIG.wards.length
    };
    box.innerHTML = APP_CONFIG.texts.overviewCards.map(function (c) {
        var v = counts[c.id] !== undefined ? counts[c.id] : c.value;
        return '<div class="overview-card"><div class="overview-card-label">' + c.label + '</div>' +
            '<div class="overview-card-value" id="' + c.id + '">' + v + '</div></div>';
    }).join('');
}

function renderOrderEntryHeader() {
    var c = document.getElementById('orderCount');
    if (c) c.textContent = state.confirmedOrders.length + APP_CONFIG.texts.orderCountSuffix;

    var e = document.getElementById('emptyOrdersMessage');
    if (e) e.textContent = APP_CONFIG.texts.emptyOrders;
}

function renderOrderModalLabels() {
    var set = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('orderModalTitle', APP_CONFIG.texts.orderModalTitle);
    set('orderModalSubtitle', APP_CONFIG.texts.orderModalSubtitle);
    set('labelWardSelect', APP_CONFIG.texts.labelWardSelect);
    set('labelRoomSelect', APP_CONFIG.texts.labelRoomSelect);
    set('dietitianHint', APP_CONFIG.texts.hintText);
    set('btnCancelOrder', APP_CONFIG.texts.cancelOrderBtn);
}

function syncWardsToModal() {
    var menu = document.getElementById('dietWardMenu');
    if (!menu) return;
    menu.innerHTML = '';
    APP_CONFIG.wards.forEach(function (w) {
        var opt = document.createElement('div');
        opt.className = 'dietitian-select-option';
        opt.textContent = w;
        opt.setAttribute('data-value', w);
        opt.onclick = function () { selectDietWard(w); };
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
            rooms = APP_CONFIG.wardRoomMap[ward].slice();
        } else {
            APP_CONFIG.wards.forEach(function (w) { if (APP_CONFIG.wardRoomMap[w]) rooms = rooms.concat(APP_CONFIG.wardRoomMap[w]); });
        }
        rooms.forEach(function (r) {
            var opt = document.createElement('div');
            opt.className = 'dietitian-select-option';
            opt.textContent = r;
            opt.setAttribute('data-value', r);
            opt.onclick = function () { selectDietRoom(r); };
            menu.appendChild(opt);
        });
        if (typeof onReady === 'function') onReady(); else clearDietRoomSelection();
    });
}

function selectDietWard(ward) {
    var wrap = document.getElementById('dietWardSelect');
    if (!wrap) return;
    var span = wrap.querySelector('.dietitian-select-value');
    span.textContent = ward; span.classList.remove('placeholder');
    wrap.querySelectorAll('.dietitian-select-option').forEach(function (o) {
        o.classList.toggle('selected', o.getAttribute('data-value') === ward);
    });
    wrap.classList.remove('open');
    populateRoomDropdown(ward);
    updatePills();
}

function selectDietRoom(room) {
    var wrap = document.getElementById('dietRoomSelect');
    if (!wrap) return;
    var span = wrap.querySelector('.dietitian-select-value');
    span.textContent = room; span.classList.remove('placeholder');
    wrap.querySelectorAll('.dietitian-select-option').forEach(function (o) {
        o.classList.toggle('selected', o.getAttribute('data-value') === room);
    });
    wrap.classList.remove('open');
    updatePills();
    var info = APP_CONFIG.roomPatientMap[room];
    if (info && info.patient) {
        var meal = state.currentServing ? state.currentServing.mealTiming : '';
        loadDefaultPreOrder(info.patientId || null, room, meal, function (result) {
            if (result && result.hasDefault) applyDefaultPreOrderToUI(result, meal);
        });
    }
}

function clearDietWardSelection() {
    var wrap = document.getElementById('dietWardSelect'); if (!wrap) return;
    var s = wrap.querySelector('.dietitian-select-value');
    s.textContent = '-- Select Ward --'; s.classList.add('placeholder');
    wrap.querySelectorAll('.dietitian-select-option').forEach(function (o) { o.classList.remove('selected'); });
}

function clearDietRoomSelection() {
    var wrap = document.getElementById('dietRoomSelect'); if (!wrap) return;
    var s = wrap.querySelector('.dietitian-select-value');
    s.textContent = '-- Select Room --'; s.classList.add('placeholder');
    wrap.querySelectorAll('.dietitian-select-option').forEach(function (o) { o.classList.remove('selected'); });
}

function getDietWardValue() {
    var w = document.getElementById('dietWardSelect'); if (!w) return '';
    var s = w.querySelector('.dietitian-select-value');
    return s.classList.contains('placeholder') ? '' : s.textContent;
}

function getDietRoomValue() {
    var w = document.getElementById('dietRoomSelect'); if (!w) return '';
    var s = w.querySelector('.dietitian-select-value');
    return s.classList.contains('placeholder') ? '' : s.textContent;
}

function updatePills() {
    var room = getDietRoomValue();
    var pillPatient = document.getElementById('pillPatient');
    var pillRow = document.getElementById('pillRow');
    var pillDiet = document.getElementById('pillDiet');
    var pillAllergy = document.getElementById('pillAllergy');
    if (!room || !APP_CONFIG.roomPatientMap[room]) {
        pillPatient.classList.add('hidden'); pillRow.classList.add('hidden'); return;
    }
    var info = APP_CONFIG.roomPatientMap[room];
    pillPatient.textContent = info.patient + ' · Room ' + room;
    pillPatient.classList.remove('hidden');
    pillDiet.textContent = info.diet || ''; pillDiet.classList.toggle('hidden', !info.diet);
    pillAllergy.textContent = info.allergy || ''; pillAllergy.classList.toggle('hidden', !info.allergy);
    pillRow.classList.toggle('hidden', !info.diet && !info.allergy);
}

function resetCache(meal) {
    state.dietItemsCache[meal] = [
        { selected: '', qty: 1, isDefault: false, orderId: null, rowId: null, isDenied: false, denyReason: '' },
        { selected: '', qty: 1, isDefault: false, orderId: null, rowId: null, isDenied: false, denyReason: '' },
        { selected: '', qty: 1, isDefault: false, orderId: null, rowId: null, isDenied: false, denyReason: '' },
        { selected: '', qty: 1, isDefault: false, orderId: null, rowId: null, isDenied: false, denyReason: '' }
    ];
}

function openDietitianOrder() {
    state.editingOrderIndex = -1;
    state.confirmedMeals = {};
    state.cancelledDefaults = {};
    clearDietWardSelection(); clearDietRoomSelection();
    syncWardsToModal();
    populateRoomDropdown('');
    updatePills();

    state.servingTabs = APP_CONFIG.mealTimings.map(function (name) { return { label: name, mealTiming: name }; });
    if (!state.servingTabs.length) {
        state.servingTabs = APP_CONFIG.servings.map(function (name) { return { label: name, mealTiming: name }; });
    }
    state.dietItemsCache = {};
    state.servingTabs.forEach(function (t) { resetCache(t.mealTiming); });
    state.currentServing = state.servingTabs[0] || null;
    renderDietServingTabs();
    if (state.currentServing) selectDietServing(state.currentServing);

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
    wardSpan.classList.toggle('placeholder', !order.ward);

    populateRoomDropdown(order.ward, function () {
        selectDietRoom(order.room);
        updatePills();
    });

    state.servingTabs = [{ label: order.serving, mealTiming: order.serving }];
    state.dietItemsCache = {};
    resetCache(order.serving);

    var cache = state.dietItemsCache[order.serving];

    order.items.forEach(function (item, idx) {
        if (idx >= 4) return;
        cache[idx].selected = item.itemName;
        cache[idx].qty = item.quantity;
        cache[idx].isDefault = item.isDefault;
        cache[idx].orderId = item.orderId;
        cache[idx].rowId = item.rowId;
        cache[idx].isDenied = item.isDenied;
        cache[idx].denyReason = item.deniedReason;
    });

    state.currentServing = state.servingTabs[0];
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
    var c = document.getElementById('dietServingTabs'); if (!c) return;
    c.innerHTML = '';
    state.servingTabs.forEach(function (tab) {
        var confirmed = state.confirmedMeals && state.confirmedMeals[tab.mealTiming];
        var btn = document.createElement('div');
        btn.className = 'dietitian-tab' + (confirmed ? ' confirmed' : '');
        btn.textContent = confirmed ? tab.label + ' ✓' : tab.label;
        btn.onclick = function () { selectDietServing(tab); };
        c.appendChild(btn);
    });
    updateActiveTab();
}

function updateActiveTab() {
    var current = state.currentServing ? state.currentServing.label : '';
    document.querySelectorAll('.dietitian-tab').forEach(function (t) {
        t.classList.toggle('active', t.textContent.replace(' ✓', '').trim() === current);
    });
}

function selectDietServing(tab) {
    state.currentServing = tab;
    updateActiveTab();
    var label = tab.label || '', meal = tab.mealTiming || '';
    document.getElementById('dietItemsLabel').textContent = label + APP_CONFIG.texts.itemsLabelSuffix;
    document.getElementById('dietConfirmLabel').textContent = APP_CONFIG.texts.confirmPrefix + meal.toLowerCase();
    loadDietItems(meal);
    var room = getDietRoomValue();
    var info = room ? APP_CONFIG.roomPatientMap[room] : null;
    if (info && info.patient) {
        loadDefaultPreOrder(info.patientId || null, room, meal, function (result) {
            if (result && result.hasDefault) applyDefaultPreOrderToUI(result, meal);
        });
    }
}

function loadDietItems(serving) {
    if (!state.dietItemsCache[serving]) resetCache(serving);
    renderDietItems(state.dietItemsCache[serving]);
}

function getFoodsForServing(mealTimingName) {
    if (!mealTimingName) return [];
    var info = APP_CONFIG.servingInfo[mealTimingName] || {};
    var code = String(info.code || '').trim();
    return APP_CONFIG.foodMaster.filter(function (f) {
        if (f.mealtiming === mealTimingName) return true;
        if (code && f.serving) {
            var codes = String(f.serving).split(',').map(function (c) { return c.trim(); });
            if (codes.indexOf(code) !== -1) return true;
        }
        return false;
    });
}

function renderDietItems(items) {
    var list = document.getElementById('dietItemsList');
    if (!list) return;
    list.innerHTML = '';
    var foods = getFoodsForServing(state.currentServing ? state.currentServing.mealTiming : '');

    var isEditMode = (state.editingOrderIndex !== null && state.editingOrderIndex >= 0);

    items.forEach(function (item, idx) {
        var row = document.createElement('div');
        row.className = 'dietitian-item-row' + (item.isDefault ? ' is-default' : '');

        if (item.isDenied) {
            row.style.border = '1px solid #ef4444';
            row.style.background = '#fef2f2';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.padding = '12px 16px';

            var leftSide = document.createElement('div');
            leftSide.style.display = 'flex';
            leftSide.style.flexDirection = 'column';
            leftSide.innerHTML = '<span style="color:#ef4444; font-weight:800; font-size:13px; text-transform:uppercase;">Denied</span>' +
                '<span style="font-size:14px; font-weight:600; color:#0f172a; margin-top:2px;">' + escapeHtml(item.selected) + '</span>' +
                '<span style="color:#64748b; font-size:12px;">Reason: ' + escapeHtml(item.denyReason) + '</span>';

            row.appendChild(leftSide);

            var rightSide = document.createElement('div');
            var undoBtn = document.createElement('button');
            undoBtn.type = 'button';
            undoBtn.innerHTML = '<i class="fas fa-undo"></i> Change';
            undoBtn.style.background = '#fff';
            undoBtn.style.border = '1px solid #e2e8f0';
            undoBtn.style.padding = '4px 10px';
            undoBtn.style.borderRadius = '6px';
            undoBtn.style.fontSize = '12px';
            undoBtn.style.color = '#475569';
            undoBtn.style.cursor = 'pointer';
            undoBtn.onclick = function (e) {
                e.stopPropagation();
                item.isDenied = false;
                item.denyReason = '';
                item.selected = '';
                item.rowId = null;
                renderDietItems(items);
            };
            rightSide.appendChild(undoBtn);
            row.appendChild(rightSide);

            list.appendChild(row);
            return;
        }

        var lbl = document.createElement('div');
        lbl.className = 'item-label';
        lbl.textContent = item.isDefault ? "Today's Food" : ('Item ' + (idx + 1));
        row.appendChild(lbl);

        var wrap = document.createElement('div');
        wrap.className = 'searchable-select';
        wrap.style.flex = '1';
        wrap.style.minWidth = '0';

        var trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'searchable-trigger';
        var valueSpan = document.createElement('span');
        valueSpan.className = 'searchable-value' + (item.selected ? '' : ' placeholder');
        valueSpan.textContent = item.selected || ('Select Item ' + (idx + 1));
        trigger.appendChild(valueSpan);
        trigger.innerHTML += '<span class="arrow">&#9660;</span>';

        var menu = document.createElement('div'); menu.className = 'searchable-menu';
        var search = document.createElement('input'); search.type = 'text'; search.className = 'searchable-input';
        search.placeholder = 'Search food...'; menu.appendChild(search);
        var opts = document.createElement('div');
        foods.forEach(function (f) {
            var opt = document.createElement('div');
            opt.className = 'searchable-option' + (f.name === item.selected ? ' selected' : '');
            opt.textContent = f.name;
            opt.onclick = function (e) {
                e.stopPropagation();
                item.selected = f.name;
                item.isDefault = false;
                item.orderId = null;
                item.rowId = null;
                item.qty = item.qty || 1;
                item.isDenied = false;
                valueSpan.textContent = f.name;
                valueSpan.classList.remove('placeholder');
                wrap.classList.remove('open');
                renderDietItems(items);
            };
            opts.appendChild(opt);
        });
        menu.appendChild(opts);
        search.oninput = function () {
            var q = this.value.toLowerCase();
            opts.querySelectorAll('.searchable-option').forEach(function (o) {
                o.style.display = o.textContent.toLowerCase().indexOf(q) !== -1 ? 'block' : 'none';
            });
        };
        trigger.onclick = function (e) {
            e.stopPropagation();
            document.querySelectorAll('.searchable-select.open').forEach(function (s) { if (s !== wrap) s.classList.remove('open'); });
            wrap.classList.toggle('open');
            if (wrap.classList.contains('open')) {
                search.value = '';
                opts.querySelectorAll('.searchable-option').forEach(function (o) { o.style.display = 'block'; });
                setTimeout(function () { search.focus(); }, 30);
            }
        };
        wrap.appendChild(trigger);
        wrap.appendChild(menu);
        row.appendChild(wrap);

        var rightActionWrap = document.createElement('div');
        rightActionWrap.style.display = 'flex';
        rightActionWrap.style.alignItems = 'center';
        rightActionWrap.style.gap = '8px';
        rightActionWrap.style.width = '210px';
        rightActionWrap.style.flexShrink = '0';
        rightActionWrap.style.justifyContent = 'flex-end';

        var delBtnContainer = document.createElement('div');
        delBtnContainer.style.width = '24px';
        delBtnContainer.style.textAlign = 'center';

        if (item.selected && item.selected.length > 0) {
            var del = document.createElement('button');
            del.type = 'button';
            del.className = 'item-delete-btn';
            del.title = 'Remove item';
            del.innerHTML = '<img src="../images/delete-icon.png" alt="Remove">';
            del.onclick = function (e) {
                e.stopPropagation();
                if (item.isDefault && item.orderId) {
                    removeDefaultFood(item.orderId, function (ok) {
                        if (ok) {
                            item.selected = ''; item.qty = 1; item.isDefault = false; item.orderId = null; item.rowId = null;
                            renderDietItems(items);
                            ShowToast('Default pre-order removed.', 'success');
                        }
                    });
                } else {
                    item.selected = ''; item.qty = 1; item.isDefault = false; item.orderId = null; item.rowId = null;
                    renderDietItems(items);
                }
            };
            delBtnContainer.appendChild(del);
        }
        rightActionWrap.appendChild(delBtnContainer);

        var denyBtnContainer = document.createElement('div');
        denyBtnContainer.style.width = '60px';

        if (isEditMode) {
            var denyBtn = document.createElement('button');
            denyBtn.type = 'button';
            denyBtn.style.padding = '4px 0';
            denyBtn.style.fontSize = '11px';
            denyBtn.style.fontWeight = '600';
            denyBtn.style.borderRadius = '6px';
            denyBtn.style.border = '1px solid #ef4444';
            denyBtn.style.background = '#fff';
            denyBtn.style.color = '#ef4444';
            denyBtn.style.display = 'flex';
            denyBtn.style.alignItems = 'center';
            denyBtn.style.justifyContent = 'center';
            denyBtn.style.gap = '4px';
            denyBtn.style.width = '100%';
            denyBtn.style.transition = 'all 0.2s ease';
            denyBtn.innerHTML = '<i class="fas fa-ban" style="font-size: 10px;"></i> Deny';

            if (!item.selected || item.selected.length === 0) {
                denyBtn.style.visibility = 'hidden';
            } else {
                var actualRowId = item.rowId || item.orderId || null;
                denyBtn.onmouseover = function () { this.style.background = '#fef2f2'; };
                denyBtn.onmouseout = function () { this.style.background = '#fff'; };
                denyBtn.onclick = function (e) {
                    e.stopPropagation();
                    OpenDenyModal(actualRowId, item.selected);
                };
            }
            denyBtnContainer.appendChild(denyBtn);
        } else {
            var spacer = document.createElement('div');
            spacer.style.width = '60px';
            denyBtnContainer.appendChild(spacer);
        }

        rightActionWrap.appendChild(denyBtnContainer);

        var stepper = document.createElement('div');
        stepper.className = 'qty-stepper' + (item.isDefault ? ' is-locked' : '');
        var minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '-';
        var qty = document.createElement('span'); qty.textContent = item.qty;
        var plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+';

        if (item.isDefault) {
            minus.disabled = true; plus.disabled = true;
        } else {
            minus.onclick = function () { item.qty = Math.max(1, item.qty - 1); qty.textContent = item.qty; };
            plus.onclick = function () { item.qty = item.qty + 1; qty.textContent = item.qty; };
        }
        stepper.appendChild(minus);
        stepper.appendChild(qty);
        stepper.appendChild(plus);
        rightActionWrap.appendChild(stepper);

        row.appendChild(rightActionWrap);

        list.appendChild(row);
    });
}


function loadDefaultPreOrder(patientId, roomNo, mealType, callback) {
    var key = roomNo + '|' + mealType;
    if (state.cancelledDefaults && state.cancelledDefaults[key]) { callback && callback(null); return; }
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDEFAULTPREORDER_LO"));
    if (patientId) url += "&PATIENTID=" + encodeURIComponent(Encrypt(String(patientId)));
    if (roomNo) url += "&ROOMNO=" + encodeURIComponent(Encrypt(roomNo));
    if (mealType) url += "&MEALTYPE=" + encodeURIComponent(Encrypt(mealType));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var row = res[0], items = [];
                if (row.DefaultPreOrderItems) {
                    try { items = JSON.parse(row.DefaultPreOrderItems); } catch (e) { console.error('parse fail', e); }
                }
                callback && callback({
                    patientId: row.PatientID, patientName: row.PatientName, roomNo: row.RoomNo,
                    ward: row.Ward, dietType: row.DietType, allergies: row.Allergies,
                    mealType: row.MealType, items: items, hasDefault: items.length > 0
                });
            } else callback && callback(null);
        }, error: function () { callback && callback(null); }
    });
}

function applyDefaultPreOrderToUI(result, servingName) {
    if (!result || !result.items || !result.items.length) return;
    var meal = servingName || result.mealType;
    if (!state.dietItemsCache[meal]) resetCache(meal);

    var categoryName = meal;
    var info = APP_CONFIG.servingInfo[meal];
    if (info && info.label) {
        var cleaned = String(info.label).replace(/\s*Service\s*$/i, '').trim();
        if (cleaned) categoryName = cleaned;
    }
    var itemsForMeal = result.items.filter(function (it) {
        var a = String(it.MEALTYPE || '').toLowerCase();
        var b = String(it.MEALTYPE_CATEGORY || '').toLowerCase();
        var c = String(it.MEALTYPE_SERVING || '').toLowerCase();
        return a === String(meal).toLowerCase() || a === String(categoryName).toLowerCase()
            || b === String(categoryName).toLowerCase() || c === String(meal).toLowerCase();
    });
    var cache = state.dietItemsCache[meal];
    var slot = 0;
    for (var i = 0; i < cache.length && slot < itemsForMeal.length; i++) {
        if (cache[i].selected && !cache[i].isDefault) continue;
        var it = itemsForMeal[slot];
        cache[i].selected = it.ITEMNAME;
        cache[i].qty = parseInt(it.QUANTITY, 10) || 1;
        cache[i].isDefault = true;
        cache[i].orderId = it.ORDERID || null;
        cache[i].rowId = it.ID || null;
        cache[i].isDenied = (it.ISDENIED == 1 || it.STATUS === 'Denied');
        cache[i].denyReason = it.DENIEDREASON || '';
        slot++;
    }
    if (state.currentServing && state.currentServing.mealTiming === meal) renderDietItems(cache);
}

function removeDefaultFood(orderId, callback) {
    if (!orderId) { callback && callback(false); return; }
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("REMOVEDEFAULTFOOD_LO")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(String(orderId)));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            var r = (res && res.length) ? res[0] : null;
            callback && callback(r && String(r.Status).toLowerCase() === 'success');
        }, error: function () { ShowToast('Failed to remove default pre-order.', 'error'); callback && callback(false); }
    });
}

function confirmDietServing() {
    var room = getDietRoomValue(), ward = getDietWardValue();
    if (ward === '') { ShowToast('Select a ward first.', 'error'); return; }
    if (room === '') { ShowToast('Select a room number first.', 'error'); return; }

    var currentMeal = state.currentServing ? state.currentServing.mealTiming : '';
    var servingLabel = state.currentServing ? state.currentServing.label : '';
    if (!currentMeal) return;

    var isPreorder = document.getElementById('chkIsPreorder').checked ? "1" : "0";

    var items = state.dietItemsCache[currentMeal] || [];

    var validItems = items.filter(function (i) {
        return i.selected && i.selected.trim() !== '' && !i.isDenied;
    });

    var summary = validItems.map(function (i) {
        return i.selected + ' x' + i.qty;
    }).join(', ');

    if (summary === '') {
        ShowToast('Add at least one active item to save.', 'error');
        return;
    }

    var editingId = 0;
    if (state.editingOrderIndex >= 0 && state.confirmedOrders[state.editingOrderIndex]) {
        editingId = state.confirmedOrders[state.editingOrderIndex].orderId || 0;
    }

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("SAVEORDER_LO")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(String(editingId))) +
        "&SESSIONID=" + encodeURIComponent(Encrypt("0")) +
        "&ROOM=" + encodeURIComponent(Encrypt(room)) +
        "&WARD=" + encodeURIComponent(Encrypt(ward)) +
        "&SERVING=" + encodeURIComponent(Encrypt(servingLabel)) +
        "&ITEMS=" + encodeURIComponent(Encrypt(summary)) +
        "&ISPREORDER=" + isPreorder +
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
            resetCache(currentMeal);
            state.editingOrderIndex = -1;
            renderDietServingTabs();
            loadOrdersFromServer();
            ShowToast(servingLabel + ' saved successfully.', 'success');

            var next = state.servingTabs.filter(function (t) {
                return !state.confirmedMeals[t.mealTiming];
            })[0];

            if (next) selectDietServing(next);
        }, error: function () {
            ShowToast('Network error saving order.', 'error');
        }
    });
}

function renderConfirmedOrders() {
    var body = document.getElementById('tblConfirmedOrders');
    var empty = document.getElementById('emptyOrdersMessage');
    var total = state.confirmedOrders.length;
    PAGE_STATE.orders.pageSize = computePageSize(total);

    if (total === 0) {
        body.innerHTML = ''; empty.classList.remove('hidden');
        renderPagination('ordersPagination', 'ordersPaginationInfo', 1, 0, PAGE_STATE.orders.pageSize, function () { });
        renderOverviewCards(); renderOrderEntryHeader(); return;
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

        // Build a neat list of items
        var itemsHtml = o.items.map(function (item) {
            var text = item.quantity + 'x ' + item.itemName;
            if (item.isDenied) {
                return '<div style="color: #ef4444; text-decoration: line-through; margin-bottom: 4px; font-weight:600;" title="Denied: ' + escapeHtml(item.deniedReason) + '">' + escapeHtml(text) + '</div>';
            } else if (item.menuChanged) {
                return '<div style="color: #f59e0b; font-weight: 600; margin-bottom: 4px;" title="Changed: ' + escapeHtml(item.menuChangeReason) + '">' + escapeHtml(text) + ' (Alt)</div>';
            }
            return '<div style="margin-bottom: 4px; color:#1e293b;">' + escapeHtml(text) + '</div>';
        }).join('');

        // Build a neat list of statuses (using pills)
        var statusHtml = o.items.map(function (item) {
            var statusClass = item.status === 'Placed' ? 'badge-placed' :
                item.status === 'Preparing' ? 'badge-preparing' :
                    item.status === 'Ready' ? 'badge-ready' :
                        item.status === 'Delivered' ? 'badge-delivered' :
                            item.status === 'Denied' ? 'badge-denied' : 'badge-placed';

            return '<div style="margin-bottom: 4px;"><span class="status-badge ' + statusClass + '">' + escapeHtml(item.status) + '</span></div>';
        }).join('');

        // Diet and Allergy Pills
        var dietPill = o.dietType ? '<span style="background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:700; margin-right:4px;">DIET: ' + escapeHtml(o.dietType) + '</span>' : '';
        var allergyPill = (o.allergens && o.allergens.toLowerCase() !== 'none') ? '<span style="background:#fee2e2; color:#b91c1c; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:700;">ALLERGY: ' + escapeHtml(o.allergens) + '</span>' : '';

        // Pre-order / Instant Badge
        var typeBadge = o.isPreorder
            ? '<span style="background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-right: 5px;">PRE-ORDER</span>'
            : '<span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-right: 5px;">INSTANT</span>';

        var row = document.createElement('tr');
        row.innerHTML =
            '<td><div style="font-weight:700; color:#0f172a;">' + escapeHtml(o.room) + '</div><div style="font-size:11px; color:#64748b;">' + escapeHtml(o.ward) + '</div></td>' +

            '<td>' +
            '<div style="font-weight:600; margin-bottom:6px;">' + escapeHtml(o.patientName) + '</div>' +
            '<div style="display:flex; gap:4px; flex-wrap:wrap;">' + dietPill + ' ' + allergyPill + '</div>' +
            '</td>' +

            '<td>' + typeBadge + ' <span style="font-weight:600;">#' + escapeHtml(o.orderId) + '</span></td>' +
            '<td><span class="serving-badge">' + escapeHtml(o.serving) + '</span></td>' +

            // Neatly grouped Items
            '<td>' + itemsHtml + '</td>' +

            // Neatly grouped Statuses
            '<td>' + statusHtml + '</td>' +

            '<td>' + escapeHtml(o.time) + '</td>' +
            '<td><div class="order-actions">' +
            '<button type="button" class="session-action-btn edit-btn" title="Edit" onclick="editOrder(' + globalIndex + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>' +
            '</button>' +
            '<button type="button" class="session-action-btn delete-btn" title="Delete" onclick="askDeleteOrder(' + globalIndex + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="3 6 5 6 21 6"></polyline>' +
            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
            '</button>' +
            '</div></td>';
        body.appendChild(row);
    });

    renderPagination('ordersPagination', 'ordersPaginationInfo',
        PAGE_STATE.orders.currentPage, total, PAGE_STATE.orders.pageSize,
        function (page) { PAGE_STATE.orders.currentPage = page; renderConfirmedOrders(); });
    renderOverviewCards();
    renderOrderEntryHeader();
}

function editOrder(index) { openDietitianOrderForEdit(index); }

function askDeleteOrder(index) {
    state.pendingDeleteOrderIndex = index;
    var o = state.confirmedOrders[index];
    document.getElementById('deleteModalTitle').textContent = "Remove Today's Selected Menu?";
    document.getElementById('deleteUserName').textContent = o.serving + ' (' + o.room + ')';
    document.getElementById('btnYesDelete').textContent = 'Yes, remove menu';
    document.getElementById('deleteModalOverlay').classList.add('show');
    document.getElementById('deleteModalnew').classList.add('show');
}

function closeDeleteOrderModal() {
    state.pendingDeleteOrderIndex = -1;
    document.getElementById('deleteModalOverlay').classList.remove('show');
    document.getElementById('deleteModalnew').classList.remove('show');
}

function confirmDeleteOrder() {
    var o = state.confirmedOrders[state.pendingDeleteOrderIndex];
    if (!o) { closeDeleteOrderModal(); return; }
    var cancelledServing = o.serving, cancelledRoom = o.room;
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("DELETEORDER_LO")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(String(o.orderId)));
    $.ajax({
        url: url, type: "GET", dataType: "json",
        success: function (res) {
            var r = (res && res[0] && res[0].RESULT) ? res[0].RESULT : 'TRUE';
            if (r === 'TRUE' || r === 'Success') {
                state.cancelledDefaults[cancelledRoom + '|' + cancelledServing] = true;
                if (state.confirmedMeals[cancelledServing]) delete state.confirmedMeals[cancelledServing];
                resetCache(cancelledServing);
                if (state.currentServing && state.currentServing.mealTiming === cancelledServing) loadDietItems(cancelledServing);
                renderDietServingTabs();
                ShowToast('Order removed.', 'success');
                loadOrdersFromServer();
                closeDeleteOrderModal();
            } else {
                ShowToast((res && res[0] && res[0].MESSAGE) || 'Failed to delete order.', 'error');
            }
        }, error: function () { ShowToast('Failed to delete order.', 'error'); }
    });
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
    if ($('#hfUserId').length && !$('#hfUserId').val()) $('#hfUserId').val(userId);

    if (typeof InitChangePassword === 'function') InitChangePassword();

    renderOrdersTableHeaders();
    renderOverviewCards();
    renderOrderEntryHeader();
    renderOrderModalLabels();

    loadWardsFromServer(function () {
        loadServingsFromServer(function () {
            loadMealTimingsFromServer(function () {
                loadFoodMasterFromServer(function () {
                    loadOrdersFromServer();
                    loadNotifications();
                    syncWardsToModal();
                    bindEvents();
                    bindNotification();
                });
            });
        });
    });

    $('#btnRefresh').off('click').on('click', function () {
        var btn = $(this);
        btn.find('i,img').addClass('fa-spin');
        loadOrdersFromServer();
        loadNotifications();
        setTimeout(function () {
            btn.find('i,img').removeClass('fa-spin');
            ShowToast('Refreshed successfully!', 'success');
        }, 400);
    });

    setInterval(function () {

        if (document.visibilityState === 'visible') {
            loadOrdersFromServer();
            loadNotifications();
        }
    }, 30000);

});

function bindNotification() {
    $(document).off('click.dietitianBell', '#notificationBell').on('click.dietitianBell', '#notificationBell', function (e) {
        e.preventDefault(); e.stopPropagation();
        $('#notificationDropdown').toggleClass('show');
        if ($('#notificationDropdown').hasClass('show')) loadNotifications();
    });
    $(document).off('click.dietitianBellOutside').on('click.dietitianBellOutside', function (e) {
        if (!$(e.target).closest('.notification-wrapper').length) $('#notificationDropdown').removeClass('show');
    });
    $(document).off('click.dietitianMarkAll', '#markAllRead').on('click.dietitianMarkAll', '#markAllRead', function (e) {
        e.preventDefault(); e.stopPropagation(); markAllNotificationsAsRead();
    });
    $(document).off('click.dietitianNotifItem', '.notification-item.unread').on('click.dietitianNotifItem', '.notification-item.unread', function () {
        var $this = $(this); var id = $this.data('id');
        if (id) {
            markNotificationAsRead(id);
            $this.removeClass('unread').addClass('read').find('.unread-dot').remove();
            var n = Math.max(0, (parseInt($('#notificationCount').text()) || 0) - 1);
            $('#notificationCount').text(n).toggleClass('show', n > 0);
        }
    });
}

function bindEvents() {
    document.addEventListener('click', function (e) {
        document.querySelectorAll('.searchable-select.open').forEach(function (s) {
            if (!s.contains(e.target)) s.classList.remove('open');
        });
        var w = document.getElementById('dietWardSelect');
        if (w && !w.contains(e.target)) w.classList.remove('open');
        var r = document.getElementById('dietRoomSelect');
        if (r && !r.contains(e.target)) r.classList.remove('open');
    });

    var wTrig = document.querySelector('#dietWardSelect .dietitian-select-trigger');
    if (wTrig) wTrig.addEventListener('click', function (e) {
        e.stopPropagation();
        document.getElementById('dietRoomSelect').classList.remove('open');
        document.getElementById('dietWardSelect').classList.toggle('open');
    });
    var rTrig = document.querySelector('#dietRoomSelect .dietitian-select-trigger');
    if (rTrig) rTrig.addEventListener('click', function (e) {
        e.stopPropagation();
        document.getElementById('dietWardSelect').classList.remove('open');
        document.getElementById('dietRoomSelect').classList.toggle('open');
    });

    var ov = document.getElementById('dietitianOrderOverlay');
    if (ov) ov.addEventListener('click', function (e) { if (e.target === this) closeDietitianOrder(); });

    var del = document.getElementById('deleteModalOverlay');
    if (del) del.addEventListener('click', closeDeleteOrderModal);
    var keep = document.getElementById('btnKeepUser');
    if (keep) keep.addEventListener('click', closeDeleteOrderModal);
    var yes = document.getElementById('btnYesDelete');
    if (yes) yes.addEventListener('click', confirmDeleteOrder);
}

function OpenDenyModal(rowId, itemName) {
    $('#hdnDenyRowId').val(rowId);
    $('#txtDenyItemName').val(itemName);
    $('#txtDenyReason').val('');
    new bootstrap.Modal(document.getElementById('denyFoodModal')).show();
}

function SubmitDenyFood() {
    var rowId = $('#hdnDenyRowId').val();
    var reason = $('#txtDenyReason').val().trim();

    if (!reason) {
        ShowToast('Please enter a reason for denial.', 'error');
        return;
    }

    var userName = sessionStorage.getItem('NAME') || 'System';
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("DENYFOOD_LO")) +
        "&ROWID=" + encodeURIComponent(Encrypt(String(rowId))) +
        "&REASON=" + encodeURIComponent(Encrypt(reason)) +
        "&USER=" + encodeURIComponent(Encrypt(userName));

    var $btn = $('#btnSubmitDeny');
    var originalText = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin me-1"></i> Processing...').prop('disabled', true);

    $.ajax({
        url: url,
        type: "POST",
        success: function (res) {
            $btn.html(originalText).prop('disabled', false);
            var ok = false;
            try {
                var data = JSON.parse(res);
                ok = (data[0] || {}).RESULT === "TRUE";
            } catch (e) { }

            if (ok) {
                bootstrap.Modal.getInstance(document.getElementById('denyFoodModal')).hide();
                ShowToast('Item successfully denied.', 'success');
                closeDietitianOrder();
                loadOrdersFromServer();
            } else {
                ShowToast('Failed to deny item.', 'error');
            }
        },
        error: function () {
            $btn.html(originalText).prop('disabled', false);
            ShowToast('Server connection error', 'error');
        }
    });
}