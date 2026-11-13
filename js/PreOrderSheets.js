var API_URL = '';
var CryptoKey = '';
var CryptoPwd = '';
var currentUser = {};
var preorderData = [];
var isLoadingPreOrders = false;
var isPrinting = false;
var printContentCache = null;
var printTimeout = null;

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
    } catch (e) {
        return Value;
    }
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

    var icon = type === 'success'
        ? 'fa-check-circle'
        : type === 'error'
            ? 'fa-exclamation-circle'
            : type === 'warning'
                ? 'fa-exclamation-triangle'
                : 'fa-info-circle';

    toast.find('i').attr('class', 'fas ' + icon);
    $('#dashToastMessage').text(message);
    toast.addClass('show');

    clearTimeout(toast.data('timer'));
    toast.data('timer', setTimeout(function () {
        HideDashToast();
    }, 2500));
}

function HideDashToast() {
    $('#dashToastNotification').removeClass('show');
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function updateLastSyncedTime() {
    var now = new Date();
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');
    var ampm = hours >= 12 ? 'PM' : 'AM';
    var hours12 = hours % 12;
    hours12 = hours12 ? hours12 : 12;
    var timeStr = String(hours12).padStart(2, '0') + ':' + minutes + ':' + seconds + ' ' + ampm;
    $('#lblLastSynced').text(timeStr);
}

function updateStats(data) {
    if (!data || data.length === 0) {
        $('#lblTotalSheets').text('0');
        $('#lblOpenSheets').text('0');
        $('#lblLockedSheets').text('0');
        return;
    }

    var total = data.length;
    var open = 0;
    var locked = 0;

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.STATUS === 'open') {
            open++;
        } else if (item.STATUS === 'locked' || item.STATUS === 'completed') {
            locked++;
        }
    }

    $('#lblTotalSheets').text(total);
    $('#lblOpenSheets').text(open);
    $('#lblLockedSheets').text(locked);
}

function parseDurationToMinutes(str) {
    if (!str) return null;
    var hMatch = String(str).match(/(\d+)\s*h/);
    var mMatch = String(str).match(/(\d+)\s*m/);
    var hours = hMatch ? parseInt(hMatch[1], 10) : 0;
    var minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
    if (!hMatch && !mMatch) return null;
    return hours * 60 + minutes;
}

function formatMinutesAsDuration(totalMinutes) {
    var h = Math.floor(totalMinutes / 60);
    var m = totalMinutes % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm';
}

function checkSessionAndRedirect() {
    var userName = sessionStorage.getItem('NAME') || '';
    var userRole = sessionStorage.getItem('ROLENAME') || '';
    var userId = sessionStorage.getItem('UserID') || '';

    if (!userName) {
        userName = $('#hfUserName').val() || '';
    }
    if (!userRole) {
        userRole = $('#hfUserRole').val() || '';
    }
    if (!userId) {
        userId = $('#hfUserId').val() || '';
    }

    if (!userName || userName === '' || userName === 'null' || userName === 'undefined') {
        window.location.href = '../login.aspx';
        return false;
    }

    return true;
}

function getNotificationIcon(type) {
    type = (type || '').toLowerCase();
    switch (type) {
        case "error":
            return "../images/notification/warning.png";
        case "info":
            return "../images/notification/shield.png";
        case "success":
            return "../images/notification/thumbs-up.png";
        default:
            return "../images/notification/bell-icon.png";
    }
}

function getDockRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '0').toString();
}

function LoadDockNotifications() {
    var roleId = getDockRoleId();
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 10000,
        success: function (res) {
            RenderDockNotifications(res || []);
            GetDockUnreadCount();
        },
        error: function (xhr, status, error) {
            console.log("Error loading notifications:", error);
            RenderDockNotifications([]);
        }
    });
}
function RenderDockNotifications(notifications) {
    var html = '';
    var unreadCount = 0;

    if (notifications && notifications.length > 0) {
        for (var i = 0; i < notifications.length; i++) {
            var item = notifications[i];
            var isRead = item.IS_READ === true || item.IS_READ === 1;

            if (!isRead) unreadCount++;

            var iconClass = (item.NOTIFICATION_TYPE || 'info').toLowerCase();
            var icon = getNotificationIcon(iconClass);
            var notificationId = item.NOTIFICATION_ID || item.ID || i;

            html +=
                '<div class="notification-item' + (isRead ? ' read' : ' unread') + '" data-id="' + notificationId + '">' +

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
        }
    } else {
        html = '<div class="notification-item" style="text-align:center;color:#888;padding:20px;">No new notifications</div>';
    }

    $('#preorderNotificationList').html(html);
    $('#preorderNotificationCount').text(unreadCount);

    if (unreadCount > 0) {
        $('#preorderNotificationCount').addClass('show').css('display', 'block');
    } else {
        $('#preorderNotificationCount').removeClass('show').css('display', 'none');
    }
}

function GetDockUnreadCount() {
    var roleId = getDockRoleId();
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var count = res[0].UNREAD_COUNT || 0;
                var $badge = $('#preorderNotificationCount');
                if ($badge.length > 0) {
                    $badge.text(count);
                    if (count > 0) {
                        $badge.show().addClass('show');
                    } else {
                        $badge.hide().removeClass('show');
                    }
                }
            } else {
                $('#preorderNotificationCount').hide().removeClass('show');
            }
        },
        error: function (xhr, status, error) {
            console.log("Error getting unread count:", error);
        }
    });
}

function MarkDockNotificationAsRead(NotificationID) {
    var roleId = getDockRoleId();
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(NotificationID)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            GetDockUnreadCount();
            ShowToast('Notification marked as read', 'success');
        },
        error: function (xhr, status, error) {
            console.log("Error marking notification as read:", error);
            LoadDockNotifications();
            ShowToast('Error marking notification as read', 'error');
        }
    });
}

function MarkAllDockNotificationsAsRead() {
    var roleId = getDockRoleId();
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var $unreadItems = $('.notification-item.unread');
            if ($unreadItems.length > 0) {
                $unreadItems.each(function () {
                    var $this = $(this);
                    $this.css({
                        'transition': 'opacity 0.5s ease, transform 0.3s ease',
                        'opacity': '0',
                        'transform': 'translateX(20px)'
                    });
                });
                setTimeout(function () {
                    $unreadItems.remove();
                    $('#preorderNotificationCount').text(0);
                    $('#preorderNotificationCount').removeClass('show').css('display', 'none');
                    if ($('.notification-item').length === 0) {
                        $('#preorderNotificationList').html(
                            '<div class="notification-item" style="text-align:center;color:#888;padding:20px;">' +
                            'No new notifications' +
                            '</div>'
                        );
                    }
                }, 600);
            } else {
                LoadDockNotifications();
            }
            ShowToast('All notifications marked as read', 'success');
        },
        error: function (xhr, status, error) {
            console.log("Error marking all notifications as read:", error);
            ShowToast('Failed to mark all as read', 'error');
        }
    });
}

function loadPreOrderSheets(callback) {
    if (!checkSessionAndRedirect()) {
        return;
    }

    if (isLoadingPreOrders) {
        if (callback) callback();
        return;
    }

    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETPREORDERSHEETS"));

    isLoadingPreOrders = true;

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 15000,
        success: function (res) {
            isLoadingPreOrders = false;
            if (res && res.length > 0) {
                preorderData = res;
                renderPreOrderCards(res);
                updateStats(res);
            } else {
                showEmptyState();
                updateStats([]);
            }
            updateLastSyncedTime();
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            isLoadingPreOrders = false;
            console.log("Error loading pre-order sheets:", error);

            if (xhr.status === 401) {
                window.location.href = '../login.aspx';
                return;
            }

            showEmptyState();
            updateStats([]);
            updateLastSyncedTime();
            if (callback) callback();
        }
    });
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    if (dateStr.indexOf('/') > -1) {
        var parts = dateStr.split('/');
        if (parts.length === 3) {
            return parts[2] + '-' + parts[0].padStart(2, '0') + '-' + parts[1].padStart(2, '0');
        }
    }
    return dateStr;
}

function renderPreOrderCards(data) {
    var container = $('#preorderCardsContainer');
    var html = '';

    if (!data || data.length === 0) {
        showEmptyState();
        return;
    }

    var grouped = {};
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var key = item.DATE + '_' + item.MEALTYPE;

        if (!grouped[key]) {
            grouped[key] = {
                date: item.DATE,
                mealType: item.MEALTYPE,
                totalPatients: 0,
                totalItems: 0,
                status: item.STATUS || 'open',
                lockedTime: item.LOCKEDTIME || null,
                closesIn: item.CLOSES_IN || null,
                categories: [],
                patients: [],
                sheets: [],
                imgPath: item.IMGPATH || null
            };
        }

        grouped[key].totalPatients += item.PATIENTCOUNT || 0;
        grouped[key].totalItems += item.ITEMCOUNT || 0;
        grouped[key].sheets.push(item);

        if (item.CATEGORIES) {
            try {
                var itemCats = (typeof item.CATEGORIES === 'string') ? JSON.parse(item.CATEGORIES) : item.CATEGORIES;
                if (!Array.isArray(itemCats)) itemCats = [itemCats];

                itemCats.forEach(function (cat) {
                    var existing = grouped[key].categories.find(function (c) {
                        return c.name.toUpperCase() === cat.name.toUpperCase();
                    });
                    if (existing) {
                        existing.items += (parseInt(cat.items) || 0);
                        existing.trays += (parseInt(cat.trays) || 0);
                    } else {
                        grouped[key].categories.push({
                            name: cat.name.toUpperCase(),
                            items: parseInt(cat.items) || 0,
                            trays: parseInt(cat.trays) || 0
                        });
                    }
                });
            } catch (e) {
                console.error("Category parse error", e);
            }
        }

        if (item.PATIENTS) {
            try {
                var pList = (typeof item.PATIENTS === 'string') ? JSON.parse(item.PATIENTS) : item.PATIENTS;
                if (Array.isArray(pList)) {
                    grouped[key].patients = grouped[key].patients.concat(pList);
                }
            } catch (e) {
                console.error("Patient parse error", e);
            }
        }
    }

    var mealOrder = {};
    var mealIconClasses = {};

    var uniqueMealTypes = [];
    for (var key in grouped) {
        if (grouped.hasOwnProperty(key)) {
            var mealType = grouped[key].mealType;
            if (uniqueMealTypes.indexOf(mealType) === -1) {
                uniqueMealTypes.push(mealType);
            }
        }
    }

    uniqueMealTypes.sort();
    for (var i = 0; i < uniqueMealTypes.length; i++) {
        mealOrder[uniqueMealTypes[i]] = i + 1;
        mealIconClasses[uniqueMealTypes[i]] = uniqueMealTypes[i].toLowerCase().replace(/\s+/g, '-');
    }

    var sortedKeys = Object.keys(grouped).sort(function (a, b) {
        var dateA = grouped[a].date;
        var dateB = grouped[b].date;
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return (mealOrder[grouped[a].mealType] || 0) - (mealOrder[grouped[b].mealType] || 0);
    });

    if (sortedKeys.length === 0) {
        showEmptyState();
        return;
    }

    for (var idx = 0; idx < sortedKeys.length; idx++) {
        var key = sortedKeys[idx];
        var group = grouped[key];
        var iconClass = mealIconClasses[group.mealType] || group.mealType.toLowerCase().replace(/\s+/g, '-');
        var statusClass = group.status.toLowerCase();
        var isLocked = group.status === 'locked' || group.status === 'completed';
        var canLock = group.status === 'open';
        var borderClass = isLocked ? ' locked-card' : '';
        var hasPatients = group.patients && group.patients.length > 0;
        var hasPatientsClass = hasPatients ? ' has-patients' : '';
        var hasCategories = group.categories && group.categories.length > 0;

        var showCategories = hasCategories && (isLocked || hasPatients);
        var showPatients = hasPatients;

        var minutesLeft = group.closesIn ? parseDurationToMinutes(group.closesIn) : null;
        var isExpired = group.status === 'open' && minutesLeft != null && minutesLeft <= 0;
        var deadlineAttr = '';
        if (group.status === 'open' && minutesLeft != null && minutesLeft > 0) {
            deadlineAttr = ' data-deadline="' + (Date.now() + minutesLeft * 60000) + '"';
        }

        var categoriesHtml = '';
        if (showCategories) {
            categoriesHtml = '<div class="category-grid">';
            for (var ci = 0; ci < group.categories.length; ci++) {
                var cat = group.categories[ci];
                categoriesHtml += `
                <div class="category-card">
                    <div class="category-title">${escapeHtml(cat.name)}</div>
                    <div class="category-count">${cat.items}</div>
                    <div class="category-subtitle">${cat.trays} trays</div>
                </div>`;
            }
            categoriesHtml += '</div>';
        }

        var patientsHtml = '';
        if (showPatients) {
            for (var pi = 0; pi < group.patients.length; pi++) {
                var patient = group.patients[pi];
                var dietWarning = patient.diet ? `
                        <span class="diet-warning">
                            <img class="warning-icon" src="../images/warning-icon.png" alt="Allergy" />
                            ${escapeHtml(patient.diet)}
                        </span>` : '';
                patientsHtml += `
                <div class="patient-card">
                    <div class="patient-header">
                        <div class="patient-name-row">
                            <span class="patient-name">${escapeHtml(patient.name || '')}</span>
                            <span class="patient-room">Room ${escapeHtml(patient.room || '')}</span>
                        </div>
                        ${dietWarning}
                    </div>
                    <div class="patient-food">${escapeHtml(patient.items || '')}</div>
                </div>`;
            }
        }

        var patientCountText = group.totalPatients + ' patient' + (group.totalPatients > 1 ? 's' : '');
        var patientId = 'patients-' + group.date.replace(/-/g, '').replace(/\//g, '') + '-' + group.mealType;

        var lockedMessage = '';
        if (isLocked && group.lockedTime && hasPatients) {
            lockedMessage = `
            <div class="locked-message has-patients">
                <span class="lock-icon">
                    <img src="../images/bell.png" alt="Locked" />
                </span>
                <span class="lock-text">
                    <strong>New batch ready.</strong> ${group.totalPatients} pre-orders are locked. Production can begin. Locked ${escapeHtml(group.lockedTime)}
                </span>
            </div>`;
        }

        var displayDate = formatDateDisplay(group.date);

        var closesInDisplay = '';
        if (group.closesIn && hasPatients) {
            var hasPatientsClassForCloses = hasPatients ? ' has-patients' : '';
            var isLockedClass = isLocked ? ' locked' : '';

            var closesInText = escapeHtml(group.closesIn);
            var displayText = closesInText;
            if (closesInText.indexOf('Closed') === 0 || closesInText.indexOf('ago') > -1) {
                displayText = closesInText;
            } else {
                displayText = 'Closes in ' + closesInText;
            }

            closesInDisplay = `
            <div class="meta-item closes-in${hasPatientsClassForCloses}${isLockedClass}${isExpired ? ' expired' : ''}">
                <img class="meta-icon" src="../images/clock.png" alt="Closes in" />
                <span class="stat-number">${displayText}</span>
            </div>`;
        }

        var lockIconHtml = isLocked ? `<img src="../images/lock-icon.png" alt="Locked" class="lock-icon-badge" />` : '';

        var disableButtons = !hasPatients || isExpired;

        var mealImagePath = group.imgPath || '../images/' + group.mealType.toLowerCase().replace(/\s+/g, '-') + '-icon.png';

        html += `
        <div class="meal-card${borderClass}${hasPatientsClass}" data-date="${group.date}" data-meal="${group.mealType}"${deadlineAttr}>
            <div class="meal-card-top">
                <div class="meal-card-left">
                    <div class="avatar-circle ${iconClass}">
                        <img src="${mealImagePath}" alt="${group.mealType}" onerror="this.src='../images/' + '${group.mealType.toLowerCase().replace(/\s+/g, '-')}' + '-icon.png'; this.onerror=null;" />
                    </div>
                    <div>
                        <h2 class="meal-title-row">
                            ${escapeHtml(group.mealType)} · <span class="meal-date-text">${escapeHtml(displayDate)}</span>
                        </h2>
                        <div class="meta-indicators">
                            <div class="meta-item">
                                <img class="meta-icon" src="../images/users.png" alt="Patients" />
                                <span class="stat-number">${group.totalPatients}</span> patients
                            </div>
                            <div class="meta-item">
                                <img class="meta-icon" src="../images/items-icon.png" alt="Items" />
                                <span class="stat-number">${group.totalItems}</span> items
                            </div>
                            ${closesInDisplay}
                        </div>
                    </div>
                </div>
                <div class="meal-card-right">
                    <span class="status-badge ${statusClass}">
                        ${lockIconHtml}
                        ${group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                    </span>
                </div>
            </div>

            ${lockedMessage}

            ${categoriesHtml}

            ${showPatients ? `
            <button class="view-patient-btn" data-patient="${patientId}">
                <span class="arrow">▼</span>
                <span class="view-patient-label">View ${patientCountText}</span>
            </button>
            <div class="patient-details" id="${patientId}">
                ${patientsHtml}
            </div>
            ` : ''}

            <div class="action-links-row">
                <button class="action-btn btn-print${disableButtons ? ' btn-disabled' : ''}"
                        ${disableButtons ? 'disabled' : ''}
                        onclick="${!disableButtons ? "printAllDockets('" + group.date + "', '" + group.mealType + "'); return false;" : "return false;"}">
                    <img class="action-icon" src="../images/printer.png" alt="Print" />
                    Print all dockets
                </button>
                ${canLock ? `
                <button class="action-btn btn-lock${disableButtons ? ' btn-disabled' : ''}"
                        ${disableButtons ? 'disabled' : ''}
                        onclick="${!disableButtons ? "lockMealSheet('" + group.date + "', '" + group.mealType + "'); return false;" : "return false;"}">
                    <img class="action-icon" src="../images/lock-icon.png" alt="Lock" />
                    Lock now
                </button>
                ` : ''}
                ${isLocked ? `
                <span class="locked-time">
                    <img class="action-icon" src="../images/clock.png" alt="Locked at" />
                    ${group.lockedTime || 'Locked'}
                </span>
                ` : ''}
            </div>
        </div>`;
    }

    container.html(html);
}

function lockMealSheet(date, mealType) {
    if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
    }

    var userName = sessionStorage.getItem('NAME') || 'System';

    var dateToSend = date;
    var dateParts = date.split('/');
    if (dateParts.length === 3) {
        dateToSend = dateParts[2] + '-' + dateParts[0].padStart(2, '0') + '-' + dateParts[1].padStart(2, '0');
    }

    ShowToast('Locking ' + mealType + ' for ' + date + '...', 'info');

    var encryptedDate = Encrypt(dateToSend);
    var encryptedMealType = Encrypt(mealType);
    var encryptedUser = Encrypt(userName);

    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("LOCKPREORDERSHEET")) +
        "&DATE=" + encodeURIComponent(encryptedDate) +
        "&MEALTYPE=" + encodeURIComponent(encryptedMealType) +
        "&UPDATEDBY=" + encodeURIComponent(encryptedUser);

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 30000,
        success: function (res) {
            if (res && res.length > 0 && res[0].RESULT === 'Success') {
                var now = new Date();
                var dateStr = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
                var timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                var lockedDateTime = dateStr + ', ' + timeStr;

                for (var i = 0; i < preorderData.length; i++) {
                    var item = preorderData[i];
                    if (item.DATE === date && item.MEALTYPE === mealType) {
                        item.STATUS = 'locked';
                        item.LOCKEDTIME = lockedDateTime;
                        item.ISLOCKED = 1;
                        break;
                    }
                }

                renderPreOrderCards(preorderData);
                updateStats(preorderData);
                ShowToast('Locked ' + mealType + ' for ' + date + ' successfully', 'success');
            } else {
                var errorMsg = res && res.length > 0 ? res[0].MESSAGE : 'Unknown error';
                ShowToast('Failed to lock ' + mealType + ': ' + errorMsg, 'error');
            }
        },
        error: function (xhr, status, error) {
            ShowToast('Failed to lock ' + mealType + '. Please try again.', 'error');
        }
    });

    return false;
}

function unlockMealSheet(date, mealType) {
    if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
    }

    var userName = sessionStorage.getItem('NAME') || 'System';

    var dateToSend = date;
    var dateParts = date.split('/');
    if (dateParts.length === 3) {
        dateToSend = dateParts[2] + '-' + dateParts[0].padStart(2, '0') + '-' + dateParts[1].padStart(2, '0');
    }

    ShowToast('Unlocking ' + mealType + ' for ' + date + '...', 'info');

    var encryptedDate = Encrypt(dateToSend);
    var encryptedMealType = Encrypt(mealType);
    var encryptedUser = Encrypt(userName);

    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("UNLOCKPREORDERSHEET")) +
        "&DATE=" + encodeURIComponent(encryptedDate) +
        "&MEALTYPE=" + encodeURIComponent(encryptedMealType) +
        "&UPDATEDBY=" + encodeURIComponent(encryptedUser);

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 30000,
        success: function (res) {
            if (res && res.length > 0 && res[0].RESULT === 'Success') {
                for (var i = 0; i < preorderData.length; i++) {
                    var item = preorderData[i];
                    if (item.DATE === date && item.MEALTYPE === mealType) {
                        item.STATUS = 'open';
                        item.LOCKEDTIME = null;
                        item.ISLOCKED = 0;
                        break;
                    }
                }

                renderPreOrderCards(preorderData);
                updateStats(preorderData);
                ShowToast('Unlocked ' + mealType + ' for ' + date + ' successfully', 'success');
            } else {
                var errorMsg = res && res.length > 0 ? res[0].MESSAGE : 'Unknown error';
                ShowToast('Failed to unlock ' + mealType + ': ' + errorMsg, 'error');
            }
        },
        error: function (xhr, status, error) {
            ShowToast('Failed to unlock ' + mealType + '. Please try again.', 'error');
        }
    });

    return false;
}
function printAllDockets(date, mealType) {
    if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
    }

    if (isPrinting) {
        ShowToast('Print already in progress, please wait...', 'warning');
        return false;
    }

    var group = null;
    for (var i = 0; i < preorderData.length; i++) {
        var item = preorderData[i];
        if (item.DATE === date && item.MEALTYPE === mealType) {
            group = item;
            break;
        }
    }

    if (!group) {
        ShowToast('No data found to print for ' + mealType + ' on ' + date, 'error');
        return false;
    }

    var categories = [];
    if (group.CATEGORIES) {
        try {
            if (typeof group.CATEGORIES === 'string') {
                categories = JSON.parse(group.CATEGORIES);
            } else if (Array.isArray(group.CATEGORIES)) {
                categories = group.CATEGORIES;
            } else if (typeof group.CATEGORIES === 'object') {
                categories = [group.CATEGORIES];
            }
        } catch (e) {
            categories = [];
        }
    }

    var patients = [];
    if (group.PATIENTS) {
        try {
            if (typeof group.PATIENTS === 'string') {
                patients = JSON.parse(group.PATIENTS);
            } else if (Array.isArray(group.PATIENTS)) {
                patients = group.PATIENTS;
            } else if (typeof group.PATIENTS === 'object') {
                patients = [group.PATIENTS];
            }
        } catch (e) {
            patients = [];
        }
    }

    if (!patients || patients.length === 0) {
        ShowToast('No patient dockets available to print for this sheet', 'error');
        return false;
    }

    isPrinting = true;
    var content = buildDocketContent(group, date, mealType, categories, patients);
    printContentCache = content;

    ShowToast('Preparing dockets for printing...', 'info');
    PrintDocketContentDirect(content);
    return false;
}

function buildDocketContent(group, date, mealType, categories, patients) {
    var catList = categories || [];
    var patientList = patients || [];

    var totalPatients = group.PATIENTCOUNT || patientList.length || 0;
    var totalItems = group.ITEMCOUNT || 0;

    var now = new Date();
    var stamp = (now.getMonth() + 1) + '/' + now.getDate() + '/' + String(now.getFullYear()).slice(2) +
        ', ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    var rollupRows = '';
    if (catList && catList.length > 0) {
        for (var ci = 0; ci < catList.length; ci++) {
            var cat = catList[ci];
            var itemCount = (cat.items != null) ? cat.items : (cat.trays || 0);
            rollupRows += '<tr><td>' + escapeHtml(cat.name || '') + '</td>' +
                '<td class="text-right">' + itemCount + '</td>' +
                '<td class="text-right">' + (cat.trays || 0) + '</td></tr>';
        }
    }

    var rollupBlock = '';
    if (rollupRows) {
        rollupBlock =
            '<div class="section-title">Station Roll-up</div>' +
            '<table class="item-table rollup-table">' +
            '<thead><tr><th>Station</th><th class="text-right">Items</th><th class="text-right">Trays</th></tr></thead>' +
            '<tbody>' + rollupRows + '</tbody></table>';
    }

    var pages = '';
    if (patientList && patientList.length > 0) {
        for (var pi = 0; pi < patientList.length; pi++) {
            var patient = patientList[pi];
            var itemList = patient.items || '';
            var itemRows = '';
            if (itemList) {
                var items = itemList.split(',').map(function (it) { return it.trim(); });
                for (var ii = 0; ii < items.length; ii++) {
                    var it = items[ii];
                    if (it) {
                        itemRows += '<tr><td>' + escapeHtml(it) + '</td></tr>';
                    }
                }
            }
            if (!itemRows) {
                itemRows = '<tr><td style="text-align:center;color:#999;">No items</td></tr>';
            }

            var allergyBox = patient.diet ?
                '<div class="allergy-box">' +
                '  <div class="box-title danger">⚠ Allergy: ' + escapeHtml(patient.diet) + '</div>' +
                '</div>' : '';

            pages += '' +
                '<div class="docket-page' + (pi > 0 ? ' page-break' : '') + '">' +
                '  <div class="company-header">' +
                '    <div><h1>Dial50</h1><span>Pre-order Sheet</span></div>' +
                '    <div class="text-right"><label>' + stamp + '</label>' +
                '      <h4>' + escapeHtml(mealType) + ' · ' + escapeHtml(date) + '</h4></div>' +
                '  </div>' +
                '  <hr>' +
                (pi === 0 ? rollupBlock : '') +
                '  <div class="patient-row">' +
                '    <div><small>PATIENT</small><h3>' + escapeHtml(patient.name || '') + '</h3>' +
                '      <span>Room ' + escapeHtml(patient.room || '') + '</span></div>' +
                '    <div class="text-right"><label>Docket</label>' +
                '      <h4>' + (pi + 1) + ' / ' + patientList.length + '</h4></div>' +
                '  </div>' +
                allergyBox +
                '  <div class="section-title">Items</div>' +
                '  <table class="item-table"><tbody>' + itemRows + '</tbody></table>' +
                '  <div class="bottom-info"><span>https://www.dial50.com</span>' +
                '    <span>' + totalPatients + ' patients · ' + totalItems + ' items</span></div>' +
                '</div>';
        }
    } else {
        pages = '<div class="docket-page"><p style="text-align:center;color:#999;">No patients available</p></div>';
    }

    return pages;
}

function PrintDocketContentDirect(content) {
    if (printTimeout) {
        clearTimeout(printTimeout);
        printTimeout = null;
    }

    if (!content) {
        content = printContentCache;
        if (!content) {
            ShowToast('No content to print', 'error');
            ResetPrintState();
            return;
        }
    }

    var printStyles = '' +
        'body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }' +
        '.print-content { max-width: 800px; margin: 0 auto; }' +
        '.company-header { display: flex; justify-content: space-between; align-items: flex-start; }' +
        '.company-header h1 { margin: 0; font-size: 32px; color: #1f2d45; font-weight: 700; }' +
        '.company-header span { color: #7b8798; font-size: 14px; }' +
        '.order-info label { display: block; color: #7b8798; font-size: 12px; font-weight: 600; }' +
        '.order-info h3 { margin: 2px 0; font-size: 24px; color: #24344d; }' +
        'hr { margin: 16px 0; border: none; border-top: 2px solid #23344f; }' +
        '.patient-row { display: flex; justify-content: space-between; margin-bottom: 20px; }' +
        '.patient-row small { color: #8d96a5; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }' +
        '.patient-row h3 { margin: 4px 0; font-size: 24px; color: #1d2b46; }' +
        '.patient-row span { color: #777; font-size: 18px; }' +
        '.text-right { text-align: right; }' +
        '.text-right h4 { margin-top: 4px; font-size: 20px; color: #1d2b46; }' +
        '.section-title { color: #8d96a5; font-size: 13px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }' +
        '.item-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }' +
        '.item-table th { text-align: left; color: #69758b; padding: 8px 0; border-bottom: 2px solid #ddd; font-size: 13px; font-weight: 600; }' +
        '.item-table td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 18px; color: #1a1a2e; }' +
        '.item-table tbody tr:last-child td { border-bottom: none; }' +
        '.allergy-box { border: 2px solid #FFE6E6; background: #fff9f9; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; }' +
        '.allergy-box .box-title { color: #8B0000; font-weight: 700; }' +
        '.diet-box { border: 2px solid #ffc53d; background: #fffbe8; border-radius: 12px; padding: 12px 16px; }' +
        '.box-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }' +
        '.danger { color: #8B0000; }' +
        '.warning { color: #b36b00; }' +
        '.bottom-info { margin-top: 16px; display: flex; justify-content: space-between; color: #8a96aa; font-size: 14px; font-weight: 500; padding-top: 12px; border-top: 1px solid #eee; }' +
        '.rollup-table td.text-right, .rollup-table th.text-right { text-align: right; }' +
        '.docket-page.page-break { page-break-before: always; break-before: page; padding-top: 20px; }' +
        '@page { margin: 20mm; }' +
        'table { page-break-inside: avoid; }' +
        'tr { page-break-inside: avoid; }' +
        '@media print { ' +
        '  body { padding: 0; } ' +
        '  .no-print { display: none; } ' +
        '  .page-break { page-break-before: always; break-before: page; } ' +
        '  .allergy-box { border: 2px solid #FFE6E6 !important; } ' +
        '  .allergy-box .box-title { color: #8B0000 !important; } ' +
        '}';

    try {
        var printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,menubar=yes');

        if (printWindow) {
            printWindow.document.write('<!DOCTYPE html><html><head><title>Print Pre-order Sheet</title>');
            printWindow.document.write('<style>' + printStyles + '</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="print-content">');
            printWindow.document.write(content);
            printWindow.document.write('</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            printWindow.focus();

            printWindow.onafterprint = function () {
                if (!printWindow.closed) {
                    printWindow.close();
                }
                ResetPrintState();
                ShowToast('Docket printed successfully', 'success');
            };

            printTimeout = setTimeout(function () {
                if (!printWindow.closed) {
                    try {
                        printWindow.close();
                    } catch (e) { }
                    ResetPrintState();
                    ShowToast('Print dialog didn\'t open. Please allow popups.', 'warning');
                }
            }, 5000);

            setTimeout(function () {
                if (!printWindow.closed) {
                    try {
                        printWindow.close();
                    } catch (e) { }
                    ResetPrintState();
                }
            }, 30000);

            setTimeout(function () {
                try {
                    printWindow.print();
                    if (printTimeout) {
                        clearTimeout(printTimeout);
                        printTimeout = null;
                    }
                } catch (e) {
                    ShowToast('Error opening print dialog. Please try again.', 'error');
                    try {
                        printWindow.close();
                    } catch (err) { }
                    ResetPrintState();
                }
            }, 500);

        } else {
            ShowToast('Please allow popups for this site to print', 'warning');

            var iframe = document.createElement('iframe');
            iframe.id = 'printIframe';
            iframe.style.position = 'absolute';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);

            var iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write('<!DOCTYPE html><html><head><title>Print Pre-order Sheet</title>');
            iframeDoc.write('<style>' + printStyles + '</style>');
            iframeDoc.write('</head><body>');
            iframeDoc.write('<div class="print-content">' + content + '</div>');
            iframeDoc.write('</body></html>');
            iframeDoc.close();

            printTimeout = setTimeout(function () {
                try {
                    document.body.removeChild(iframe);
                } catch (e) { }
                ResetPrintState();
                ShowToast('Print timeout. Please try again.', 'warning');
            }, 10000);

            setTimeout(function () {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    iframe.contentWindow.onafterprint = function () {
                        try {
                            document.body.removeChild(iframe);
                        } catch (e) { }
                        if (printTimeout) {
                            clearTimeout(printTimeout);
                            printTimeout = null;
                        }
                        ResetPrintState();
                        ShowToast('Docket printed successfully', 'success');
                    };
                } catch (e) {
                    try {
                        document.body.removeChild(iframe);
                    } catch (err) { }
                    ResetPrintState();
                }
            }, 500);
        }
    } catch (e) {
        console.error('Print error:', e);
        ShowToast('Error printing. Please try again.', 'error');
        ResetPrintState();
    }
}

function ResetPrintState() {
    isPrinting = false;
    printContentCache = null;

    if (printTimeout) {
        clearTimeout(printTimeout);
        printTimeout = null;
    }

    $('#printIframe').remove();
}

function showEmptyState() {
    $('#preorderCardsContainer').html(`
        <div class="preorder-empty">
            <div class="empty-icon">📋</div>
            <h3>No pre-order sheets available</h3>
            <p>There are no upcoming meals scheduled for the selected date range.</p>
        </div>
    `);
    updateStats([]);
}

function showLoadingState() {
    var html = '';
    for (var i = 0; i < 3; i++) {
        html += `
        <div class="preorder-skeleton">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line long"></div>
            </div>
        </div>`;
    }
    $('#preorderCardsContainer').html(html);
}

function refreshPreOrderData() {
    if (isLoadingPreOrders) return;
    var btn = $('#btnRefresh');
    var icon = btn.find('.refresh-icon');
    icon.css('transform', 'rotate(360deg)');
    showLoadingState();
    loadPreOrderSheets(function () {
        setTimeout(function () {
            icon.css('transform', 'rotate(0deg)');
        }, 500);
    });
    ShowToast('Pre-order sheets refreshed', 'success');
}

function logoutUser() {
    sessionStorage.clear();
    window.location.href = '../login.aspx';
}

$(document).ready(function () {
    var userName = sessionStorage.getItem('NAME') || '';
    var userRole = sessionStorage.getItem('ROLENAME') || '';
    var userDept = sessionStorage.getItem('DEPARTMENT') || '';

    if (!userName || userName === '' || userName === 'null' || userName === 'undefined') {
        userName = $('#hfUserName').val() || '';
    }
    if (!userRole || userRole === '' || userRole === 'null' || userRole === 'undefined') {
        userRole = $('#hfUserRole').val() || '';
    }

    if (!userName || userName === '' || userName === 'null' || userName === 'undefined') {
        console.log('No session found, redirecting to login...');
        window.location.href = '../login.aspx';
        return;
    }

    $('#spndepNursname').text(userName);
    $('#spnUserTypeLabel').text(userRole);
    $('#spndepNurslocdept').text(userDept);
    $('#hfUserName').val(userName);
    $('#hfUserRole').val(userRole);
    $('#spanUserName').text(userName);
    $('#spanUserRole').text(userRole);

    if (typeof hurl !== 'undefined') {
        API_URL = hurl;
    }
    if (typeof CryptoKey !== 'undefined') {
        CryptoKey = window.CryptoKey;
    }
    if (typeof CryptoPwd !== 'undefined') {
        CryptoPwd = window.CryptoPwd;
    }

    updateLastSyncedTime();
    showLoadingState();
    loadPreOrderSheets();
    LoadDockNotifications();

    $(document).on('click', '#btnRefresh', function (e) {
        e.preventDefault();
        e.stopPropagation();
        refreshPreOrderData();
        return false;
    });

    $(document).on('click', '.view-patient-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var btn = $(this);
        var details = btn.next('.patient-details');
        var arrow = btn.find('.arrow');

        if (details.length === 0) {
            return;
        }

        if (details.hasClass('open')) {
            details.removeClass('open');
            arrow.removeClass('open');
        } else {
            details.addClass('open');
            arrow.addClass('open');
        }
        return false;
    });

    $(document).on('click', '#preorderNotificationBell', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#preorderNotificationDropdown').toggleClass('show');
        if ($('#preorderNotificationDropdown').hasClass('show')) {
            LoadDockNotifications();
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.notification-wrapper').length &&
            !$(e.target).closest('#preorderNotificationBell').length) {
            $('#preorderNotificationDropdown').removeClass('show');
        }
    });

    $(document).on('click', '#preorderMarkAllRead', function (e) {
        e.preventDefault();
        e.stopPropagation();
        MarkAllDockNotificationsAsRead();
    });

    $(document).on('click', '.notification-item.unread[data-id]', function () {
        var id = $(this).data('id');
        var $this = $(this);

        $this.removeClass('unread');
        $this.find('.unread-dot').remove();
        $this.css({
            'transition': 'opacity 0.6s ease, transform 0.4s ease',
            'opacity': '0',
            'transform': 'translateX(30px)'
        });

        MarkDockNotificationAsRead(id);

        setTimeout(function () {
            $this.remove();
            var currentCount = parseInt($('#preorderNotificationCount').text()) || 0;
            var newCount = Math.max(0, currentCount - 1);
            $('#preorderNotificationCount').text(newCount);
            if (newCount <= 0) {
                $('#preorderNotificationCount').removeClass('show').css('display', 'none');
            }
            if ($('.notification-item').length === 0) {
                $('#preorderNotificationList').html(
                    '<div class="notification-item" style="text-align:center;color:#888;padding:20px;">' +
                    'No new notifications' +
                    '</div>'
                );
            }
        }, 700);
    });

    setInterval(function () {
        var checkName = sessionStorage.getItem('NAME') || '';
        var checkRole = sessionStorage.getItem('ROLENAME') || '';
        if (!checkName || checkName === '' || checkName === 'null' || checkName === 'undefined') {
            window.location.href = '../login.aspx';
        }
    }, 30000);

    $(document).on('keydown', function (e) {
        if (e.ctrlKey && e.key === 'p') {
            var activeCard = $('.meal-card:visible').first();
            if (activeCard.length) {
                var date = activeCard.data('date');
                var meal = activeCard.data('meal');
                if (date && meal) {
                    e.preventDefault();
                    e.stopPropagation();
                    printAllDockets(date, meal);
                    return false;
                }
            }
        }
    });
});

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