var foodOrderingFlag = { IsShown: 0 };
var lastSummaryData = null;

function IsFullWorkflow() {
    return foodOrderingFlag.IsShown === 1;
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

function SetCurrentDate() {
    var now = new Date();
    var dateStr = now.toISOString().split('T')[0];
    $('#filterDate').val(dateStr);
    var displayDate = String(now.getDate()).padStart(2, '0') + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        now.getFullYear();
    $('#genDate').val(dateStr);
    $('#genDate').text(displayDate);

    if (typeof UpdateGeneratePreview === 'function') {
        setTimeout(function () {
            UpdateGeneratePreview();
        }, 100);
    }
}

function LoadOrdersSummary() {
    var OrderDate = $("#filterDate").val();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETORDERSSUMMARY")) +
        "&ORDERDATE=" + encodeURIComponent(Encrypt(OrderDate));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res == null || res.length == 0)
                return;
            var item = res[0];
            lastSummaryData = item;

            $("#lblTotalOrders").text(item.TOTALORDERS || 0);
            $("#lblDelivered").text((item.DELIVERED || 0) + ' delivered');
            $("#lblPendingReview").text(item.PENDINGREVIEW || 0);
            $("#lblInKitchen").text(item.INKITCHEN || 0);
            $("#lblPreparing").text(item.PREPARING || 0);
            $("#lblReady").text(item.READY || 0);

            UpdateFourthStatCardValue();

            var mealSessionsHtml = '';
            var standardKeys = [
                'TOTALORDERS', 'DELIVERED', 'PENDINGREVIEW', 'INKITCHEN',
                'PREPARING', 'READY', 'ASSEMBLING', 'READYFORPICKUP',
                'INTRANSIT', 'OUTFORDELIVERY', 'CANCELLED'
            ];
            var colorIndex = 0;
            var mealKeys = [];

            for (var key in item) {
                if (item.hasOwnProperty(key) && standardKeys.indexOf(key) === -1) {
                    mealKeys.push(key);
                }
            }

            for (var i = 0; i < mealKeys.length; i++) {
                var key = mealKeys[i];
                var count = parseInt(item[key]) || 0;
                colorIndex = (colorIndex % 15) + 1;
                var colorClass = 'color-' + colorIndex;

                mealSessionsHtml +=
                    '<span class="session-item ' + colorClass + '">' +
                    '<strong>' + key + ':</strong> ' +
                    '<span class="session-count">' + count + '</span> orders' +
                    '</span>';
            }

            if (mealKeys.length === 0) {
                mealSessionsHtml = '<span style="color:#888;">No servings configured</span>';
            }

            $('#mealSessionsList').html(mealSessionsHtml);
            $('#lblTotalOrdersCount').text(item.TOTALORDERS || 0);
        },
        error: function (xhr, status, error) {
            console.log(error);
            $('#mealSessionsList').html('<span style="color:#888;">Failed to load summary</span>');
        }
    });
}

function UpdateFourthStatCardValue() {
    if (!lastSummaryData) {
        $("#lblOutForDelivery").text(0);
        return;
    }

    if (IsFullWorkflow()) {
        var combined = (parseInt(lastSummaryData.ASSEMBLING) || 0) +
            (parseInt(lastSummaryData.READYFORPICKUP) || 0) +
            (parseInt(lastSummaryData.INTRANSIT) || 0);
        $("#lblOutForDelivery").text(combined);
    } else {
        $("#lblOutForDelivery").text(lastSummaryData.DELIVERED || 0);
    }
}


function LoadOrdersList() {
    var OrderDate = $("#filterDate").val();
    var SearchText = $("#txtSearchOrd").val().trim();
    var MealType = $("#ddlMealType").val();
    var Ward = $("#ddlWard").val();
    var Kitchen = $("#ddlKitchen").val();
    var StatusFilter = "";
    var extendedStatuses = ['Assembling', 'Ready for Pickup', 'In-Transit', 'On the way'];

    $(".status-chip.active").each(function () {
        var status = $(this).data("status");
        if (status == "all" || status == "clear") return;
        if (!IsFullWorkflow() && extendedStatuses.indexOf(status) !== -1) return;
        StatusFilter += status + ",";
    });
    StatusFilter = StatusFilter.replace(/,$/, '');

    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETORDERSLIST")) +
        "&ORDERDATE=" + encodeURIComponent(Encrypt(OrderDate)) +
        "&SEARCHTEXT=" + encodeURIComponent(Encrypt(SearchText)) +
        "&MEALTYPE=" + encodeURIComponent(Encrypt(MealType)) +
        "&WARD=" + encodeURIComponent(Encrypt(Ward)) +
        "&KITCHEN=" + encodeURIComponent(Encrypt(Kitchen)) +
        "&STATUSFILTER=" + encodeURIComponent(Encrypt(StatusFilter));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 30000,
        success: function (res) {
            var html = '';
            var totalCount = 0;
            var filteredCount = 0;
            var orders = [];
            if (res && res.length > 0) {
                if (res[0].TOTALCOUNT !== undefined) {
                    totalCount = res[0].TOTALCOUNT || 0;
                    filteredCount = res[0].FILTEREDCOUNT || 0;
                    orders = res.slice(1);
                } else {
                    orders = res;
                    filteredCount = res.length;
                    totalCount = res.length;
                }
                $('#lblOrderCount').text(filteredCount);
                if (orders.length == 0) {
                    html = '<tr><td colspan="8" style="text-align:center;padding:30px 20px;background:#f9f9f9;">' +
                        '<div style="display:flex;flex-direction:column;align-items:center;">' +
                        '<img src="../images/orders-icon.png" style="width:80px;height:80px;margin-bottom:12px;opacity:0.5;" />' +
                        '<h3 style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#888;">No orders match your filters</h3>' +
                        '<p style="margin:0;font-size:13px;color:#aaa;">Try widening the date range or status set.</p>' +
                        '</div></td></tr>';
                } else {
                    var htmlParts = [];
                    var len = orders.length;
                    var escape = escapeHtml;
                    for (var i = 0; i < len; i++) {
                        var item = orders[i];
                        var statusClass = (item.STATUS || '').toLowerCase().replace(/ /g, '-');
                        var itemsHtml = '';
                        if (item.ITEMS) {
                            var items = item.ITEMS.split(', ');
                            var itemsLen = items.length;
                            for (var j = 0; j < itemsLen; j++) {
                                itemsHtml += '<span class="item-pill">1x ' + escape(items[j]) + '</span>';
                            }
                        }
                        var orderIdDisplay = item.ORDERID ? '#' + item.ORDERID : '';
                        var autoPill = (item.ISAUTO == 1) ? '<span class="auto-pill">AUTO</span>' : '';
                        var patientDisplay = escape(item.PATIENT || '');
                        if (item.ORDERTYPE && item.ORDERTYPE.toLowerCase() === 'visitor') {
                            patientDisplay += '<br/><span class="visitor-badge-table">Visitor</span>';
                        }
                        htmlParts.push(
                            '<tr onclick="GetOrderDetail(\'' + item.ORDERID + '\')">',
                            '<td><span class="order-id">' + escape(orderIdDisplay) + '</span>' + autoPill + '</td>',
                            '<td><div class="time-main">' + escape(item.TIME) + '</div><div class="time-ago">' + escape(item.AGO) + '</div></td>',
                            '<td class="patient-name">' + patientDisplay + '</td>',
                            '<td>' + escape(item.ROOM) + '</td>',
                            '<td class="ward-dash">' + escape(item.WARD) + '</td>',
                            '<td>' + escape(item.MEAL) + '</td>',
                            '<td>' + itemsHtml + '</td>',
                            '<td><span class="status-badge ' + statusClass + '"><span class="dot"></span>' +
                            escape((item.STATUS === 'In-Transit' || item.STATUS === 'In Transit') ? 'On the way' : item.STATUS) +
                            '</span></td>',
                            '</tr>'
                        );
                    }
                    html = htmlParts.join('');
                }
            } else {
                html = '<tr><td colspan="8" style="text-align:center;padding:30px 20px;background:#f9f9f9;">' +
                    '<div style="display:flex;flex-direction:column;align-items:center;">' +
                    '<img src="../images/orders-icon.png" style="width:80px;height:80px;margin-bottom:12px;opacity:0.5;" />' +
                    '<h3 style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#888;">No orders match your filters</h3>' +
                    '<p style="margin:0;font-size:13px;color:#aaa;">Try widening the date range or status set.</p>' +
                    '</div></td></tr>';
                $('#lblOrderCount').text(0);
            }
            $("#tblOrdersBody").html(html);
        },
        error: function (xhr, status, error) {
            console.log(error);
            $('#lblOrderCount').text(0);
            $("#tblOrdersBody").html('<tr><td colspan="8" style="text-align:center;padding:30px 20px;color:#dc3545;">Error loading orders. Please refresh the page.</td></tr>');
        }
    });
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

function GetOrderDetail(OrderID) {
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETORDERDETAIL")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(OrderID));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res == null || res.length == 0)
                return;
            var item = res[0];
            window.currentOrderData = item;
            var orderIdDisplay = item.ID ? '#' + item.ID : '#';
            $("#drawerOrderId").text(orderIdDisplay);
            $("#drawerPatient").text(item.PATIENT || '');
            $("#drawerRoom").text(item.ROOM || '');
            var meal = item.MEAL || '';
            $("#drawerMealText").text(meal);
            var iconPath = hurl + 'images/orders-icon.png';
            var $mealIcon = $('#mealIcon');
            $mealIcon.attr('src', iconPath);
            $("#drawerMeal").removeClass('breakfast lunch dinner snack');
            if (meal) {
                $("#drawerMeal").addClass(meal.toLowerCase());
            }
            var timeAgo = getTimeAgo(item.ORDERDATE);
            $("#drawerAgo").text(timeAgo);
            $("#drawerDate").text(item.DATE || '');
            $("#drawerTime").text(item.TIME || '');
            var orderType = (item.ORDERTYPE || 'patient').toLowerCase();
            if (orderType === 'visitor') {
                var displayText = orderType.charAt(0).toUpperCase() + orderType.slice(1);
                $('.order-type-badge').removeClass('order-type-patient order-type-visitor order-type-staff');
                $('.order-type-badge').addClass('order-type-visitor');
                $('.order-type-badge').text(displayText);
                $('.order-type-badge').show();
            } else {
                $('.order-type-badge').hide();
            }
            var instructions = item.INSTRUCTIONS || 'No special instructions';
            if (instructions.toLowerCase().includes('auto-generated') ||
                instructions.toLowerCase().includes('auto generated')) {
                $('#drawerInstructions').html('<span class="auto-generated">⚙️ ' + escapeHtml(instructions) + '</span>');
            } else {
                $('#drawerInstructions').text(instructions);
            }
            $("#drawerRestrictions").text(item.RESTRICTIONS || 'None');
            $("#drawerItemCount").text(item.ITEMCOUNT || 0);
            var allergies = item.ALLERGIES || '';
            if (allergies) {
                var allergyList = allergies.split(',');
                var allergyHtml = '';
                for (var i = 0; i < allergyList.length; i++) {
                    allergyHtml += '<span class="allergy-chip">' + escapeHtml(allergyList[i].trim()) + '</span>';
                }
                $('.allergy-container').show();
                $('#allergyList').html(allergyHtml);
            } else {
                $('.allergy-container').hide();
                $('#allergyList').html('');
            }
            var itemsHtml = '';
            var itemsData = [];
            if (item.ITEMS) {
                if (typeof item.ITEMS === 'string') {
                    try {
                        itemsData = JSON.parse(item.ITEMS);
                    } catch (e) {
                        itemsData = [];
                    }
                } else if (Array.isArray(item.ITEMS)) {
                    itemsData = item.ITEMS;
                }
            }
            if (itemsData && itemsData.length > 0) {
                for (var i = 0; i < itemsData.length; i++) {
                    var subItem = itemsData[i];
                    var itemName = subItem.ITEMNAME || '';
                    var qty = subItem.QUANTITY || 1;
                    itemsHtml += '<div class="drawer-item">' +
                        '<span class="item-name">' + escapeHtml(itemName) + '</span>' +
                        '<span class="item-qty">x' + qty + '</span>' +
                        '</div>';
                }
            } else {
                itemsHtml = '<div style="color:#9ca3af; font-style:italic; padding:4px 0;">No items</div>';
            }
            $('#drawerItems').html(itemsHtml);
            var restrictions = item.RESTRICTIONS || 'None';
            if (restrictions && restrictions !== 'None' && restrictions !== '') {
                var restrictionList = restrictions.split(',');
                var restrictionHtml = '';
                for (var i = 0; i < restrictionList.length; i++) {
                    restrictionHtml += '<span class="restriction-chip">' + escapeHtml(restrictionList[i].trim()) + '</span>';
                }
                $('#drawerRestrictions').html(restrictionHtml);
            } else {
                $('#drawerRestrictions').text('None');
            }
            var status = (item.STATUS || '').toLowerCase();
            if (status === 'confirmed') {
                $('#estimateContainer').show();
                var estimatedTime = item.ESTIMATED_TIME || 15;
                $('#estimateInput').val(estimatedTime);
                $('#estimateInput').data('orderid', OrderID);
                $('#estimateInput').data('patientid', item.PATIENTID || 0);
            } else {
                $('#estimateContainer').hide();
            }
            var originalStatus = item.STATUS || "Placed";
            var displayStatus = originalStatus;
            if (originalStatus.toLowerCase() === "in-transit" ||
                originalStatus.toLowerCase() === "in transit") {
                displayStatus = "On the way";
            }
            var statusClass = originalStatus.toLowerCase().replace(/ /g, "-");
            var statusBadge = $(".drawer-title .status-badge");
            statusBadge.removeClass().addClass("status-badge " + statusClass);
            statusBadge.html('<span class="dot"></span>' + displayStatus);
            var statusTimeline = null;
            if (item.STATUS_TIMELINE) {
                try {
                    if (typeof item.STATUS_TIMELINE === 'string') {
                        statusTimeline = JSON.parse(item.STATUS_TIMELINE);
                    } else {
                        statusTimeline = item.STATUS_TIMELINE;
                    }
                } catch (e) {
                    statusTimeline = null;
                }
            }
            RenderTimeline(item.STATUS, statusTimeline);
            var currentStatus = status;
            $('#btnConfirmOrder').show();
            $('#btnCancelOrder').show();
            $('#btnCloseOrderDrawer').hide();
            var btnText = 'Confirm order';

            if (IsFullWorkflow()) {
                if (currentStatus === 'placed') {
                    btnText = 'Confirm order';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'confirmed') {
                    btnText = 'Start Preparing';
                    $('#estimateContainer').show();
                } else if (currentStatus === 'preparing') {
                    btnText = 'Mark Ready';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'ready') {
                    btnText = 'Mark Assembling';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'assembling') {
                    btnText = 'Mark Ready for Pickup';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'ready for pickup' || currentStatus === 'ready-for-pickup') {
                    btnText = 'Start Delivery';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'in-transit' || currentStatus === 'in transit') {
                    btnText = 'Mark Delivered';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
                    $('#btnConfirmOrder').hide();
                    $('#btnCancelOrder').hide();
                    $('#estimateContainer').hide();
                    $('#btnCloseOrderDrawer').show();
                } else {
                    $('#btnCloseOrderDrawer').hide();
                }
            } else {
                if (currentStatus === 'placed') {
                    btnText = 'Confirm order';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'confirmed') {
                    btnText = 'Start Preparing';
                    $('#estimateContainer').show();
                } else if (currentStatus === 'preparing') {
                    btnText = 'Mark Ready';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'ready') {
                    btnText = 'Mark Delivered';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'assembling' ||
                    currentStatus === 'ready for pickup' ||
                    currentStatus === 'ready-for-pickup' ||
                    currentStatus === 'in-transit' ||
                    currentStatus === 'in transit') {
                    btnText = 'Mark Delivered';
                    $('#estimateContainer').hide();
                } else if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
                    $('#btnConfirmOrder').hide();
                    $('#btnCancelOrder').hide();
                    $('#estimateContainer').hide();
                    $('#btnCloseOrderDrawer').show();
                } else {
                    $('#btnCloseOrderDrawer').hide();
                }
            }

            if ($('#btnConfirmOrder').is(':visible')) {
                $('#btnConfirmOrder').text(btnText);
                $('#btnConfirmOrder').data('current-status', currentStatus);
            }
            $("#hdnOrderId").val(OrderID);
            $('#overlay').addClass('show');
            $('#orderDrawer').addClass('open');
            $('body').css('overflow', 'hidden');
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    });
}

function getTimeAgo(dateString) {
    if (!dateString) return 'Just now';
    var now = new Date();
    var past = new Date(dateString);
    var diffSeconds = Math.floor((now - past) / 1000);
    if (diffSeconds < 1) return 'Just now';
    if (diffSeconds < 60) return diffSeconds + ' seconds ago';
    var diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        if (diffMinutes === 1) return '1 minute ago';
        return diffMinutes + ' minutes ago';
    }
    var diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        if (diffHours === 1) return 'About 1 hour ago';
        return 'About ' + diffHours + ' hours ago';
    }
    var diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
        if (diffDays === 1) return '1 day ago';
        return diffDays + ' days ago';
    }
    var diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    return diffMonths + ' months ago';
}

function RenderTimeline(status, statusTimeline) {
    var fullStages = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Assembling', 'Ready for Pickup', 'In-Transit', 'Delivered'];
    var simpleStages = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];

    var timelineStatuses = IsFullWorkflow() ? fullStages : simpleStages;

    var fullStatusMap = {
        'placed': 0,
        'confirmed': 1,
        'preparing': 2,
        'ready': 3,
        'assembling': 4,
        'ready for pickup': 5,
        'ready-for-pickup': 5,
        'in-transit': 6,
        'in transit': 6,
        'on the way': 6,
        'on-the-way': 6,
        'delivered': 7,
        'cancelled': -1
    };

    var simpleStatusMap = {
        'placed': 0,
        'confirmed': 1,
        'preparing': 2,
        'ready': 3,
        'delivered': 4,
        'assembling': 3,
        'ready for pickup': 3,
        'ready-for-pickup': 3,
        'in-transit': 3,
        'in transit': 3,
        'on the way': 3,
        'on-the-way': 3,
        'cancelled': -1
    };

    var statusMap = IsFullWorkflow() ? fullStatusMap : simpleStatusMap;
    var currentIndex = statusMap[status.toLowerCase()] !== undefined ? statusMap[status.toLowerCase()] : 0;

    var statusTimeMap = {};
    if (statusTimeline) {
        if (typeof statusTimeline === "string") {
            try { statusTimeline = JSON.parse(statusTimeline); }
            catch (e) { statusTimeline = null; }
        }
        if (Array.isArray(statusTimeline) && statusTimeline.length > 0) {
            for (var i = 0; i < statusTimeline.length; i++) {
                var item = statusTimeline[i];
                if (item.STATUS_NAME && item.STATUS_TIME) {
                    var displayName = item.STATUS_NAME;
                    if (displayName === "In Transit") displayName = "In-Transit";
                    statusTimeMap[displayName] = item.STATUS_TIME;
                }
            }
        }
    }

    var iconMap = {
        'Placed': 'order-placed.png',
        'Confirmed': 'confirmed-icon.png',
        'Preparing': 'preparing-icon.png',
        'Ready': 'ready-icon.png',
        'Assembling': 'assembling-icon.png',
        'Ready for Pickup': 'ready-for-pickup-icon.png',
        'In-Transit': 'ontheway-icon.png',
        'Delivered': 'delivered-icon.png'
    };

    var html = '';
    for (var i = 0; i < timelineStatuses.length; i++) {
        var title = timelineStatuses[i];
        var displayTitle = (title === 'In-Transit') ? 'On the way' : title;
        var isDone = i <= currentIndex && currentIndex >= 0;
        var isActive = i === currentIndex && currentIndex >= 0;
        var cls = isDone ? 'done' : 'pending';
        if (isActive) cls = 'active';
        var iconFile = iconMap[title] || 'default-icon.png';
        var iconPath = hurl + 'images/timeline/' + iconFile;
        var bgColor, iconFilter, iconSize;
        var textClass = '';
        if (isActive) {
            bgColor = '#16a34a';
            iconFilter = 'brightness(0) invert(1)';
            iconSize = '20px';
            textClass = 'text-reached';
        } else if (isDone) {
            bgColor = '#16a34a';
            iconFilter = 'brightness(0) invert(1)';
            iconSize = '14px';
            textClass = 'text-reached';
        } else {
            bgColor = '#e5e7eb';
            iconFilter = 'grayscale(1) opacity(0.5)';
            iconSize = '10px';
            textClass = 'text-pending';
        }
        var circleSize = isActive ? '44px' : '36px';
        var iconHtml = '';
        if (isActive) {
            iconHtml =
                '<div class="timeline-icon-circle active-pulse" style="background:' + bgColor + '; border-radius:50%; width:' + circleSize + '; height:' + circleSize + '; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .3s; position:relative;">' +
                '<div class="pulse-ring"></div>' +
                '<img src="' + iconPath + '" alt="' + displayTitle + '" class="timeline-icon-img" style="filter:' + iconFilter + '; width:' + iconSize + '; height:' + iconSize + '; object-fit:contain; position:relative; z-index:2;" />' +
                '</div>';
        } else {
            iconHtml =
                '<div class="timeline-icon-circle" style="background:' + bgColor + '; border-radius:50%; width:' + circleSize + '; height:' + circleSize + '; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .3s;">' +
                '<img src="' + iconPath + '" alt="' + displayTitle + '" class="timeline-icon-img" style="filter:' + iconFilter + '; width:' + iconSize + '; height:' + iconSize + '; object-fit:contain;" />' +
                '</div>';
        }
        var displayTime = statusTimeMap[title] || '';
        var showTime = (isDone || isActive) && displayTime;
        html +=
            '<div class="timeline-row ' + cls + '">' +
            '<div class="timeline-icon" style="display:flex; align-items:center; justify-content:center; width:50px; height:50px; flex-shrink:0;">' +
            iconHtml +
            '</div>' +
            '<div class="timeline-content ' + textClass + '">' +
            '<div class="timeline-name">' +
            displayTitle +
            (isActive ? ' <span class="now-chip">NOW</span>' : '') +
            '</div>' +
            (showTime ? '<div class="timeline-time">' + displayTime + '</div>' : '') +
            '</div>' +
            '</div>';
    }
    $('#drawerTimeline').html(html);
}

function UpdateOrderStatus(OrderID, NewStatus) {
    var UpdatedBy = $("#hfUserName").val();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("UPDATEORDERSTATUS")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(OrderID)) +
        "&NEWSTATUS=" + encodeURIComponent(Encrypt(NewStatus)) +
        "&UPDATEDBY=" + encodeURIComponent(Encrypt(UpdatedBy));
    $('#btnConfirmOrder').prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
    );
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0 && res[0].RESULT === 'Success') {
                ShowToast("Order Updated Successfully");
                setTimeout(function () {
                    $('#btnConfirmOrder').prop('disabled', false).text('Updating...');
                    GetOrderDetail(OrderID);
                    LoadOrdersSummary();
                    LoadOrdersList();
                    LoadNotifications();
                }, 500);
            } else {
                ShowToast("Failed to update order", "error");
                $('#btnConfirmOrder').prop('disabled', false).text('Retry');
            }
        },
        error: function (xhr, status, error) {
            console.log(error);
            ShowToast("Error updating order", "error");
            $('#btnConfirmOrder').prop('disabled', false).text('Retry');
        }
    });
}

function CloseDrawer() {
    $('#overlay').removeClass('show');
    $('#orderDrawer').removeClass('open');
    $('body').css('overflow', '');
}

function LoadWards() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDDROPDOWNLIST"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var html = '<option value="">All wards</option>';
            if (res && res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    var item = res[i];
                    html += '<option value="' + escapeHtml(item.NAME || '') + '">' + escapeHtml(item.NAME || '') + '</option>';
                }
            }
            $('#ddlWard').html(html);
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    });
}

function LoadKitchens() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETKITCHENDROPDOWNLIST"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var html = '<option value="">All kitchens</option>';
            if (res && res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    var item = res[i];
                    html += '<option value="' + escapeHtml(item.NAME || '') + '">' + escapeHtml(item.NAME || '') + '</option>';
                }
            }
            $('#ddlKitchen').html(html);
        },
        error: function (xhr, status, error) {
            console.log(error);
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
        success: function (res) {
            RenderNotifications(res || []);
            GetUnreadCount();
        },
        error: function (xhr, status, error) {
            console.log("Error loading notifications:", error);
        }
    });
}
function RenderNotifications(notifications) {
    var html = '';
    var unreadCount = 0;
    if (notifications && notifications.length > 0) {
        for (var i = 0; i < notifications.length; i++) {
            var item = notifications[i];
            var isRead = item.IS_READ === true || item.IS_READ === 1;
            if (!isRead)
                unreadCount++;
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
    $('#notificationList').html(html);
    $('#notificationCount').text(unreadCount);
    if (unreadCount > 0)
        $('#notificationCount').addClass('show');
    else
        $('#notificationCount').removeClass('show');
}

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
        success: function (res) {
            GetUnreadCount();
        },
        error: function (xhr, status, error) {
            console.log("Error marking notification as read:", error);
            LoadNotifications();
        }
    });
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
        success: function (res) {
            if (res && res.length > 0) {
                var count = res[0].UNREAD_COUNT || 0;
                var $dashBadge = $('#dashNotificationCount');
                if ($dashBadge.length > 0) {
                    $dashBadge.text(count);
                    if (count > 0) {
                        $dashBadge.show().addClass('show');
                    } else {
                        $dashBadge.hide().removeClass('show');
                    }
                }
                var $orderBadge = $('#notificationCount');
                if ($orderBadge.length > 0) {
                    $orderBadge.text(count);
                    if (count > 0) {
                        $orderBadge.addClass('show');
                    } else {
                        $orderBadge.removeClass('show');
                    }
                }
            } else {
                $('#dashNotificationCount').hide().removeClass('show');
                $('#notificationCount').removeClass('show');
            }
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
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
                    $('#notificationCount').text(0);
                    $('#notificationCount').removeClass('show');
                    if ($('.notification-item').length === 0) {
                        $('#notificationList').html(
                            '<div class="notification-item" style="text-align:center;color:#888;padding:20px;">' +
                            'No new notifications' +
                            '</div>'
                        );
                    }
                }, 600);
            } else {
                LoadNotifications();
            }
            ShowToast('All notifications marked as read');
        },
        error: function (xhr, status, error) {
            console.log(error);
            ShowToast('Failed to mark all as read', 'error');
        }
    });
}
function UpdateGeneratePreview() {
    var mealType = $('#genMealTiming').val();
    var date = $('#genDate').val();
    var userName = $('#hfUserName').val() || 'System';
    if (!date) {
        var now = new Date();
        date = now.toISOString().split('T')[0];
        $('#genDate').val(date);
    }
    $('#previewTitle').text('Loading preview...');
    $('#previewPatients').html('<span style="color:#888;">Loading...</span>');
    $('#previewSkipped').html('');
    $('#btnConfirmGenerate').prop('disabled', false);
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GENERATEAUTOORDERS")) +
        "&GENMEALTYPE=" + encodeURIComponent(Encrypt(mealType)) +
        "&ORDERDATE=" + encodeURIComponent(Encrypt(date)) +
        "&UPDATEDBY=" + encodeURIComponent(Encrypt(userName)) +
        "&CONFIRM=" + encodeURIComponent(Encrypt("false"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (!res || res.length === 0) {
                $('#previewTitle').text('Preview - No data available');
                $('#previewPatients').html('');
                $('#previewSkipped').html('');
                $('#btnConfirmGenerate').prop('disabled', true);
                return;
            }
            var summary = res[0];
            var created = summary.CreatedCount || 0;
            var skipped = summary.SkippedCount || 0;
            $('#previewTitle').text('Preview (' + created + ' will be created, ' + skipped + ' skipped)');
            var patientHtml = '';
            var processedPatients = [];
            var npoCount = 0;
            var noDietCount = 0;
            var noDefaultFoodCount = 0;
            var changedPreOrderCount = 0;
            var readyToCreateCount = 0;
            for (var i = 1; i < res.length; i++) {
                var item = res[i];
                var patientKey = item.PatientName + '|' + item.RoomNo;
                if (processedPatients.indexOf(patientKey) !== -1) {
                    continue;
                }
                processedPatients.push(patientKey);
                if (item.Action === 'Created') {
                    var reason = item.Reason || '';
                    if (reason.toLowerCase().includes('ready to create') ||
                        reason.toLowerCase().includes('ready to generate')) {
                        readyToCreateCount++;
                        patientHtml += '<span class="patient-preview">' +
                            escapeHtml(item.PatientName || '') +
                            ' <small>· ' + escapeHtml(item.RoomNo || '') + '</small>' +
                            '</span>';
                    }
                } else if (item.Action === 'Skipped') {
                    var reason = item.Reason || '';
                    if (reason.toLowerCase().includes('npo')) {
                        npoCount++;
                    } else if (reason.toLowerCase().includes('no diet') || reason.toLowerCase().includes('assigned')) {
                        noDietCount++;
                    } else if (reason.toLowerCase().includes('no default food') || reason.toLowerCase().includes('no compatible food')) {
                        noDefaultFoodCount++;
                    } else if (reason.toLowerCase().includes('changed pre-order') || reason.toLowerCase().includes('changed preorder')) {
                        changedPreOrderCount++;
                    }
                }
            }
            var hasReadyPatients = readyToCreateCount > 0;
            if (!patientHtml) {
                patientHtml = '<span style="color:#888;">No patients ready to generate</span>';
            }
            if (!hasReadyPatients) {
                $('#btnConfirmGenerate').prop('disabled', true);
                $('#previewTitle').text('Preview - No patients ready to generate');
            } else {
                $('#btnConfirmGenerate').prop('disabled', false);
            }
            var skipParts = [];
            if (npoCount > 0) {
                skipParts.push('<span class="skip-pill skip-pill-red">' + npoCount + ' skipped: NPO active</span>');
            }
            if (noDietCount > 0) {
                skipParts.push('<span class="skip-pill skip-pill-orange">' + noDietCount + ' skipped: no diet assigned</span>');
            }
            if (noDefaultFoodCount > 0) {
                skipParts.push('<span class="skip-pill skip-pill-yellow">' + noDefaultFoodCount + ' skipped: No default food available</span>');
            }
            if (changedPreOrderCount > 0) {
                skipParts.push('<span class="skip-pill skip-pill-yellow">' + changedPreOrderCount + ' skipped: Changed default order</span>');
            }
            var skipSummaryHtml = skipParts.join(' ');
            if (!skipSummaryHtml) {
                skipSummaryHtml = '<span style="color:#888;">No skipped patients</span>';
            }
            $('#previewPatients').html(patientHtml);
            $('#previewSkipped').html(skipSummaryHtml);
        },
        error: function (xhr, status, error) {
            console.log("Error updating generate preview:", error);
            $('#previewTitle').text('Preview - Error loading data');
            $('#previewPatients').html('');
            $('#previewSkipped').html('');
            $('#btnConfirmGenerate').prop('disabled', true);
        }
    });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    var parts = timeStr.split(':');
    var hour = parseInt(parts[0]);
    var minute = parts[1];
    var ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return hour + ':' + minute + ' ' + ampm;
}

function LoadMealTimings() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMEALTIMINGS"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var html = '';
            var now = new Date();
            var currentTime = now.getHours() * 60 + now.getMinutes();
            if (res && res.length > 0) {
                var defaultSelected = false;
                for (var i = 0; i < res.length; i++) {
                    var item = res[i];
                    var startTime = item.StartTime || '';
                    var endTime = item.EndTime || '';
                    var selected = '';
                    if (startTime && endTime) {
                        var startParts = startTime.split(':');
                        var endParts = endTime.split(':');
                        var startMinutes = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
                        var endMinutes = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);
                        if (!defaultSelected && currentTime >= startMinutes && currentTime <= endMinutes) {
                            selected = ' selected';
                            defaultSelected = true;
                        }
                    }
                    html += '<option value="' + escapeHtml(item.Value || '') + '"' + selected + '>' +
                        escapeHtml(item.Text || '') +
                        '</option>';
                }
                if (!defaultSelected) {
                    $('#genMealTiming').html(html);
                    $('#genMealTiming option:first').prop('selected', true);
                } else {
                    $('#genMealTiming').html(html);
                }
            } else {
                html += '<option value="Breakfast">Breakfast</option>';
                html += '<option value="Lunch" selected>Lunch</option>';
                html += '<option value="Dinner">Dinner</option>';
                $('#genMealTiming').html(html);
            }
            if (typeof UpdateGeneratePreview === "function") {
                UpdateGeneratePreview();
            }
        },
        error: function (xhr, status, error) {
            console.log("Error loading meal timings:", error);
            var html = '';
            html += '<option value="Breakfast">Breakfast</option>';
            html += '<option value="Lunch" selected>Lunch</option>';
            html += '<option value="Dinner">Dinner</option>';
            $('#genMealTiming').html(html);
            if (typeof UpdateGeneratePreview === "function") {
                UpdateGeneratePreview();
            }
        }
    });
}

function LoadMealTypes() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMEALTIMINGS"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var html = '<option value="">All meals</option>';
            if (res && res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    var item = res[i];
                    html += '<option value="' + escapeHtml(item.Value || '') + '">' +
                        escapeHtml(item.Text || '') + '</option>';
                }
            }
            $('#ddlMealType').html(html);
        },
        error: function (xhr, status, error) {
            console.log("Error loading meal types:", error);
            var html = '<option value="">All meals</option>';
            html += '<option value="Breakfast">Breakfast</option>';
            html += '<option value="Lunch">Lunch</option>';
            html += '<option value="Dinner">Dinner</option>';
            $('#ddlMealType').html(html);
        }
    });
}

function ConfirmGenerateOrders() {
    var mealType = $('#genMealTiming').val();
    var date = $('#genDate').val();
    var userName = $('#hfUserName').val() || 'System';
    if (!date) {
        var now = new Date();
        date = now.toISOString().split('T')[0];
    }
    $('#btnConfirmGenerate').prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...'
    );
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GENERATEAUTOORDERS")) +
        "&GENMEALTYPE=" + encodeURIComponent(Encrypt(mealType)) +
        "&ORDERDATE=" + encodeURIComponent(Encrypt(date)) +
        "&UPDATEDBY=" + encodeURIComponent(Encrypt(userName)) +
        "&CONFIRM=" + encodeURIComponent(Encrypt("true"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            $('#btnConfirmGenerate').prop('disabled', false).html(
                '<img src="../images/generate-icon.png" alt="Confirm" class="btn-icon"> Confirm'
            );
            CloseGenerateModal();
            var data = res;
            if (Array.isArray(res) && res.length > 0) {
                data = res[0];
            }
            if (data && data.CreatedCount !== undefined) {
                ShowToast('Generated ' + data.CreatedCount + ' orders for ' + mealType);
                LoadOrdersSummary();
                LoadOrdersList();
                LoadNotifications();
            } else if (data && data.RESULT === 'Error') {
                ShowToast('Failed to generate orders: ' + (data.MESSAGE || 'Unknown error'), 'error');
            } else {
                ShowToast('Orders generated successfully for ' + mealType);
                LoadOrdersSummary();
                LoadOrdersList();
                LoadNotifications();
            }
        },
        error: function (xhr, status, error) {
            $('#btnConfirmGenerate').prop('disabled', false).html(
                '<img src="../images/generate-icon.png" alt="Confirm" class="btn-icon"> Confirm'
            );
            ShowToast('Failed to generate orders: ' + (xhr.responseText || error), 'error');
        }
    });
}

function UpdateEstimatedTime(orderId, estimatedTime) {
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("UPDATEESTIMATEDTIME")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
        "&ESTIMATEDTIME=" + encodeURIComponent(Encrypt(estimatedTime.toString()));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            ShowToast('Estimated time updated to ' + estimatedTime + ' minutes');
        },
        error: function (xhr, status, error) {
            console.log(error);
            ShowToast('Failed to update estimated time', 'error');
        }
    });
}

function OpenGenerateModal() {
    UpdateGeneratePreview();
    $('#generateModal').addClass('open');
    $('#overlay').addClass('show');
}

function CloseGenerateModal() {
    $('#generateModal').removeClass('open');
    $('#overlay').removeClass('show');
}

function OpenCancelModal() {
    $('#cancelModalOverlay').addClass('show');
    $('#cancelModal').addClass('show');
}

function CloseCancelModal() {
    $('#cancelModalOverlay').removeClass('show');
    $('#cancelModal').removeClass('show');
}

function RefreshData() {
    LoadOrdersSummary();
    LoadOrdersList();
    LoadNotifications();
    GetUnreadCount();
    ShowToast('Data refreshed');
}

var autoRefreshTimer = null;
var refreshInterval = 20000;
var isUserInteracting = false;
var interactionTimeout = null;

function StartAutoRefresh() {
    StopAutoRefresh();
    autoRefreshTimer = setInterval(function () {
        if (!isUserInteracting) {
            LoadOrdersSummary();
            LoadOrdersList();
            LoadNotifications();
            GetUnreadCount();
            LoadFoodOrderingFlag();
        }
    }, refreshInterval);
}

function StopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}

function PauseAutoRefresh() {
    isUserInteracting = true;
    if (interactionTimeout) {
        clearTimeout(interactionTimeout);
    }
    interactionTimeout = setTimeout(function () {
        isUserInteracting = false;
        LoadOrdersSummary();
        LoadOrdersList();
        LoadNotifications();
        GetUnreadCount();
        LoadFoodOrderingFlag();
    }, 3000);
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


$(document).ready(function () {
    var userName = sessionStorage.getItem('NAME') || '';
    var userRole = sessionStorage.getItem('ROLENAME') || '';
    var userDept = sessionStorage.getItem('DEPARTMENT') || 'Burjeel Medical City (BMC)';
    $('#spndepNursname').text(userName);
    $('#spnUserTypeLabel').text(userRole);
    $('#spndepNurslocdept').text(userDept);
    $('#hfUserName').val(userName);
    $('#hfUserRole').val(userRole);
    $('#spanUserName').text(userName);
    $('#spanUserRole').text(userRole);
    $('#txtSearchOrd').val('');
    if (typeof InitChangePassword === 'function') {
        InitChangePassword();
    }
    SetCurrentDate();
    LoadOrdersSummary();
    LoadOrdersList();
    LoadWards();
    LoadKitchens();
    LoadNotifications();
    LoadMealTimings();
    LoadMealTypes();
    LoadFoodOrderingFlag();
    StartAutoRefresh();
    $(document).on('change', '#ddlMealType, #ddlWard, #ddlKitchen', function () {
        LoadOrdersList();
    });
    $(document).on('keyup', '#txtSearchOrd', function () {
        LoadOrdersList();
    });
    $(document).on('change', '#filterDate', function () {
        LoadOrdersSummary();
        LoadOrdersList();
    });
    $(document).on('click', '#btnGenerateOrders', function (e) {
        e.preventDefault();
        e.stopPropagation();
        OpenGenerateModal();
    });
    $(document).on('click', '#btnRefresh', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var btn = $(this);
        btn.addClass('spinning');
        LoadOrdersList();
        LoadOrdersSummary();
        LoadNotifications();
        LoadFoodOrderingFlag();
        ShowToast('Data refreshed');
        setTimeout(function () {
            btn.removeClass('spinning');
        }, 1000);
    });
    $(document).on('click', '#notificationBell', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#notificationDropdown').toggleClass('show');
        if ($('#notificationDropdown').hasClass('show')) {
            LoadNotifications();
        }
    });

    $(document).on('change', '#genDate', function () {
        UpdateGeneratePreview();
    });
    $(document).on('change', '#genMealTiming', function () {
        UpdateGeneratePreview();
    });
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.notification-wrapper').length) {
            $('#notificationDropdown').removeClass('show');
        }
    });
    $(document).on('click', '#markAllRead', function (e) {
        e.preventDefault();
        e.stopPropagation();
        MarkAllNotificationsAsRead();
    });
    $(document).on('click', '#btnCloseOrderDrawer', function () {
        CloseDrawer();
    });
    $(document).on('click', '#btnCloseDrawer', function () {
        CloseDrawer();
    });
    $(document).on('click', '#overlay', function () {
        CloseDrawer();
        CloseGenerateModal();
        CloseCancelModal();
    });
    $(document).on('click', '#btnCancelOrder', function () {
        OpenCancelModal();
    });
    $(document).on('click', '#btnKeepOrder', function () {
        CloseCancelModal();
    });
    $(document).on('click', '#btnYesCancel', function () {
        CloseCancelModal();
        var orderId = $("#hdnOrderId").val();
        if (orderId) {
            UpdateOrderStatus(orderId, 'Cancelled');
        }
    });

    $(document).on('click', '#btnConfirmOrder', function () {
        var btn = $(this);
        var btnText = btn.text().trim();
        var currentStatus = btn.data('current-status') || '';

        var fullStatusMap = {
            'Confirm order': 'Confirmed',
            'Start Preparing': 'Preparing',
            'Mark Ready': 'Ready',
            'Mark Assembling': 'Assembling',
            'Mark Ready for Pickup': 'Ready for Pickup',
            'Start Delivery': 'In-Transit',
            'Mark Delivered': 'Delivered'
        };

        var simpleStatusMap = {
            'Confirm order': 'Confirmed',
            'Start Preparing': 'Preparing',
            'Mark Ready': 'Ready',
            'Mark Delivered': 'Delivered'
        };

        var statusMap = IsFullWorkflow() ? fullStatusMap : simpleStatusMap;
        var newStatus = statusMap[btnText] || btnText;
        var orderId = $("#hdnOrderId").val();
        if (orderId) {
            var estimatedTime = '';
            if (currentStatus === 'confirmed' && newStatus === 'Preparing') {
                estimatedTime = $('#estimateInput').val() || '15';
                UpdateEstimatedTime(orderId, estimatedTime);
            }
            UpdateOrderStatus(orderId, newStatus);
        }
    });
    $(document).on('click', '#btnCloseGenerate, #btnCancelGenerate', function (e) {
        e.preventDefault();
        e.stopPropagation();
        CloseGenerateModal();
    });
    $(document).on('click', '#btnConfirmGenerate', function (e) {
        e.preventDefault();
        e.stopPropagation();
        ConfirmGenerateOrders();
    });
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            CloseDrawer();
            CloseGenerateModal();
            CloseCancelModal();
        }
    });
    $(document).on('change', '#genMealTiming', function () {
        UpdateGeneratePreview();
    });
    $(document).on('click', '.notification-item[data-id]', function () {
        var id = $(this).data('id');
        var $this = $(this);
        if ($this.hasClass('unread')) {
            $this.removeClass('unread');
            $this.find('.unread-dot').remove();
            $this.css({
                'transition': 'opacity 0.6s ease, transform 0.4s ease',
                'opacity': '0',
                'transform': 'translateX(30px)'
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
                    $('#notificationList').html(
                        '<div class="notification-item" style="text-align:center;color:#888;padding:20px;">' +
                        'No new notifications' +
                        '</div>'
                    );
                }
            }, 700);
        }
    });
    $(document).on('click', '.status-chip', function () {
        var status = $(this).data('status');
        if (status === 'clear') {
            $('.status-chip').removeClass('active');
            $('.status-chip[data-status="all"]').addClass('active');
            LoadOrdersList();
            return;
        }
        if (status === 'all') {
            $('.status-chip').removeClass('active');
            $(this).addClass('active');
            LoadOrdersList();
            return;
        }
        $(this).toggleClass('active');
        var hasActiveStatus = false;
        $('.status-chip:not([data-status="all"]):not([data-status="clear"])').each(function () {
            if ($(this).hasClass('active')) {
                hasActiveStatus = true;
                return false;
            }
        });
        if (hasActiveStatus) {
            $('.status-chip[data-status="all"]').removeClass('active');
        } else {
            $('.status-chip[data-status="all"]').addClass('active');
        }
        LoadOrdersList();
    });
});

function LoadFoodOrderingFlag() {
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETFOODORDERINGFLAG"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var val = res[0].IsShown;
                foodOrderingFlag.IsShown = (val === true || val === 1 || val === "1" || val === "true") ? 1 : 0;
            } else {
                foodOrderingFlag.IsShown = 0;
            }
            ApplyFoodOrderingFlag();
        },
        error: function (xhr, status, error) {
            console.log("Error loading food ordering flag:", error);
            foodOrderingFlag.IsShown = 0;
            ApplyFoodOrderingFlag();
        }
    });
}

function ApplyFoodOrderingFlag() {
    var full = IsFullWorkflow();

    $('#btnGenerateOrders').show();

    if (full) {
        $('.status-chip[data-status="Assembling"]').show();
        $('.status-chip[data-status="Ready for Pickup"]').show();
        $('.status-chip[data-status="In-Transit"]').show();
        $('#lblFourthStatLabel').text('OUT FOR DELIVERY');
        $('#lblFourthStatSub').text('On the way');
    } else {
        $('.status-chip[data-status="Assembling"]').hide();
        $('.status-chip[data-status="Ready for Pickup"]').hide();
        $('.status-chip[data-status="In-Transit"]').hide();
        $('#lblFourthStatLabel').text('DELIVERED');
        $('#lblFourthStatSub').text('Completed');

        var $activeHidden = $('.status-chip[data-status="Assembling"].active, ' +
            '.status-chip[data-status="Ready for Pickup"].active, ' +
            '.status-chip[data-status="In-Transit"].active');
        if ($activeHidden.length > 0) {
            $('.status-chip').removeClass('active');
            $('.status-chip[data-status="all"]').addClass('active');
            LoadOrdersList();
        }
    }

    UpdateFourthStatCardValue();
}

function LoadBulkWards() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDDROPDOWN"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var html = '<option value="">-- Select Ward --</option>';

            if (res && res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    var wardName = res[i].WARDNAME;
                    if (wardName) {
                        html += '<option value="' + escapeHtml(wardName) + '">' + escapeHtml(wardName) + '</option>';
                    }
                }
            }
            $('#bulkWardSelect').html(html);
        },
        error: function (xhr, status, error) {
            console.log("Error loading bulk wards:", error);
        }
    });
}

function LoadBulkRooms(wardName) {
    var $roomSelect = $('#bulkRoomSelect');
    $roomSelect.html('<option value="">Loading rooms...</option>');

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDROOMSFORBULK")) +
        "&WARD=" + encodeURIComponent(Encrypt(wardName || ""));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var html = '<option value="">-- Select Room --</option>';
            if (res && res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    var roomNo = res[i].ROOM_NO || res[i].ROOMNUMBER || res[i].ROOM;
                    if (roomNo) {
                        html += '<option value="' + escapeHtml(roomNo) + '">' + escapeHtml(roomNo) + '</option>';
                    }
                }
            }
            $roomSelect.html(html);
        },
        error: function (xhr, status, error) {
            console.log("Error loading rooms:", error);
            $roomSelect.html('<option value="">Error loading rooms</option>');
        }
    });
}


var bulkMenuItems = [];
var bulkMenuReqId = 0;
function openBulkOrderModal() {
    if (!$('#bulkOrderDate').val()) {
        $('#bulkOrderDate').val(new Date().toISOString().split('T')[0]);
    }
    bulkMenuItems = [];
    ResetBulkItems(1);
    LoadBulkServings();
    LoadBulkWards();
    LoadBulkRooms();
    $('#bulkOrderModal').modal('show');
}

//$(document).on('show.bs.modal', '#bulkOrderModal', function () {
//    bulkMenuItems = [];
//    ResetBulkItems(4);
//});

$(document)
    .off('shown.bs.modal.bulkOrderReset')
    .on('shown.bs.modal.bulkOrderReset', '#bulkOrderModal', function () {
        bulkMenuItems = [];
        ResetBulkItems(1);
        setTimeout(function () {
            if ($('#bulkItemsContainer .bulk-item-row').length !== 4) {
                ResetBulkItems(1);
            }
        }, 100);
    });

//function BuildBulkItemRow(n) {
//    return '' +
//        '<div class="d-flex align-items-center gap-3 bulk-item-row">' +
//        '  <div class="bulk-item-title">Item ' + n + '</div>' +
//        '  <div class="bulk-item-wrap">' +
//        '    <input type="text" class="form-control bulk-item-input" placeholder="Type to search Item ' + n + '" autocomplete="off" data-id="" data-name="" />' +
//        '    <div class="bulk-suggest"></div>' +
//        '  </div>' +
//        '  <div class="d-flex align-items-center gap-2 bulk-qty-wrapper">' +
//        '    <button type="button" class="btn btn-sm bulk-qty-minus">-</button>' +
//        '    <input type="number" class="form-control bulk-qty-input" value="1" min="1" readonly>' +
//        '    <button type="button" class="btn btn-sm bulk-qty-plus">+</button>' +
//        '  </div>' +
//        '  <div class="bulk-row-actions">' +
//        '    <button type="button" class="btn btn-sm bulk-remove-item" title="Remove this item">&times;</button>' +
//        '    <button type="button" class="btn btn-sm bulk-add-item" title="Add another item">+</button>' +
//        '  </div>' +
//        '</div>';
//}

function BuildBulkItemRow(n) {
    return '' +
        '<div class="d-flex align-items-center gap-3 bulk-item-row">' +
        '  <div class="bulk-item-title">Item ' + n + '</div>' +
        '  <div class="bulk-item-wrap">' +
        '    <input type="text" class="form-control bulk-item-input" placeholder="Type to search Item ' + n + '" autocomplete="off" data-id="" data-name="" />' +
        '    <div class="bulk-suggest"></div>' +
        '  </div>' +
        '  <div class="d-flex align-items-center gap-2 bulk-qty-wrapper">' +
        '    <button type="button" class="btn btn-sm bulk-qty-minus">-</button>' +
        '    <input type="number" class="form-control bulk-qty-input" value="1" min="1" readonly>' +
        '    <button type="button" class="btn btn-sm bulk-qty-plus">+</button>' +
        '  </div>' +
        '  <div class="bulk-row-actions">' +
        '    <button type="button" class="btn btn-sm bulk-add-item" title="Add another item">+</button>' +
        '  </div>' +
        '</div>';
}

//function RefreshBulkRows() {
//    var $rows = $('#bulkItemsContainer .bulk-item-row');
//    $rows.each(function (i) {
//        var n = i + 1;
//        $(this).find('.bulk-item-title').text('Item ' + n);
//        $(this).find('.bulk-item-input').attr('placeholder', 'Type to search Item ' + n);
//        $(this).find('.bulk-add-item').css('visibility', i === $rows.length - 1 ? 'visible' : 'hidden');
//        $(this).find('.bulk-remove-item').css('visibility', i === $rows.length - 1 ? 'visible' : 'hidden');
//    });
//}

function RefreshBulkRows() {
    var $rows = $('#bulkItemsContainer .bulk-item-row');
    if ($rows.length === 0) {
        ResetBulkItems(1);
        return;
    }
    $rows.each(function (i) {
        var n = i + 1;
        $(this).find('.bulk-item-title').text('Item ' + n);
        $(this).find('.bulk-item-input').attr('placeholder', 'Type to search Item ' + n);
        $(this).find('.bulk-add-item').css('visibility', i === $rows.length - 1 ? 'visible' : 'hidden'); BuildBulkItemRow
        $(this).find('.bulk-remove-item').css('visibility', i === $rows.length - 1 ? 'visible' : 'hidden');
    });
}

function ResetBulkItems(count) {
    var html = '';
    for (var i = 1; i <= count; i++) {
        html += BuildBulkItemRow(i);
    }
    $('#bulkItemsContainer').html(html);
    RefreshBulkRows();
}

function ClearBulkItemInputs() {
    $('#bulkItemsContainer .bulk-item-input').val('').attr('data-id', '').attr('data-name', '');
    $('#bulkItemsContainer .bulk-qty-input').val(1);
    $('.bulk-suggest').hide().empty();
}

$(document).on('click', '.bulk-add-item', function () {
    var $container = $('#bulkItemsContainer');
    $container.append(BuildBulkItemRow($container.find('.bulk-item-row').length + 1));
    RefreshBulkRows();
    $container.find('.bulk-item-row:last .bulk-item-input').focus();
    var el = $container.closest('.modal-body')[0];
    if (el) el.scrollTop = el.scrollHeight;
});

$(document).on('click', '.bulk-remove-item', function () {
    if ($('#bulkItemsContainer .bulk-item-row').length <= 1) return;
    $(this).closest('.bulk-item-row').remove();
    RefreshBulkRows();
});
function LoadBulkMenuItems() {
    var servingType = $('#bulkServingTabs button.active').data('serving');

    bulkMenuItems = [];
    ClearBulkItemInputs();
    if (!servingType) return;

    var reqId = ++bulkMenuReqId;
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETBULKMENUITEMS")) +
        "&CATEGORY=" + encodeURIComponent(Encrypt(servingType));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (reqId !== bulkMenuReqId) return;
            bulkMenuItems = (res && res.length) ? res : [];
        },
        error: function (xhr, status, error) {
            console.log("Error loading bulk menu items:", error);
            bulkMenuItems = [];
        }
    });
}

function ShowBulkSuggestions($input) {
    var $box = $input.siblings('.bulk-suggest');
    var term = $.trim($input.val()).toLowerCase();
    var html = '', shown = 0;
    for (var i = 0; i < bulkMenuItems.length; i++) {
        var it = bulkMenuItems[i];
        var name = it.FOODNAME || '';
        if (term === '' || name.toLowerCase().indexOf(term) !== -1) {
            html += '<div class="bulk-suggest-item" data-id="' + escapeHtml(it.ID) + '" data-name="' + escapeHtml(name) + '">' +
                escapeHtml(name) +
                (it.CALORIES ? ' <small>' + escapeHtml(it.CALORIES) + ' kcal</small>' : '') +
                '</div>';
            if (++shown >= 50) break;
        }
    }
    if (!shown) html = '<div class="bulk-suggest-empty">No matching items</div>';
    $box.html(html).show();
}

$(document).on('focus', '.bulk-item-input', function () {
    ShowBulkSuggestions($(this));
});

$(document).on('input', '.bulk-item-input', function (e) {
    if (e.originalEvent && e.originalEvent.isTrusted) {
        $(this).attr('data-id', '').attr('data-name', '');
    }
    ShowBulkSuggestions($(this));
});

$(document).on('mousedown', '.bulk-suggest-item', function (e) {
    e.preventDefault(); 

    var $wrap = $(this).closest('.bulk-item-wrap');
    var $input = $wrap.find('.bulk-item-input');

    var selectedId = $(this).attr('data-id');
    var selectedName = $(this).attr('data-name');

    $input.val(selectedName);
    $input.attr('data-id', selectedId);
    $input.attr('data-name', selectedName);

    $wrap.find('.bulk-suggest').hide();
    setTimeout(function () { $input.data('skip-clear', false); }, 50);
});

$(document).on('blur', '.bulk-item-input', function () {
    var $box = $(this).siblings('.bulk-suggest');
    setTimeout(function () { $box.hide(); }, 150);
});

function FindBulkMenuItem(text) {
    var t = $.trim(text).toLowerCase();
    for (var i = 0; i < bulkMenuItems.length; i++) {
        if ((bulkMenuItems[i].FOODNAME || '').toLowerCase() === t) return bulkMenuItems[i];
    }
    return null;
}



//$(document).on('change', '#bulkRoomSelect', function () {
//    LoadBulkMenuItems();
//});
function LoadBulkServings() {
    var $tabs = $('#bulkServingTabs');
    if ($tabs.find('button').length > 0) return;

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETSERVINGDROPDOWN"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var html = '';

            if (res && res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    var row = res[i];
                    var name = row.NAME;
                    if (!name) {
                        for (var k in row) {
                            if (row.hasOwnProperty(k)) { name = row[k]; break; }
                        }
                    }
                    if (!name) continue;

                    html += '<button type="button" class="btn btn-sm bulk-tab-btn" data-serving="' +
                        escapeHtml(name) + '">' + escapeHtml(name) + '</button>';
                }
            }

            if (!html) {
                $tabs.html('<span style="color:#888; font-size:13px;">No servings configured</span>');
                return;
            }

            $tabs.html(html);
            $tabs.find('button:first').trigger('click');
        },
        error: function (xhr, status, error) {
            console.log("Error loading servings:", error);
            $tabs.html('<span style="color:#dc3545; font-size:13px;">Failed to load servings</span>');
        }
    });
}

$(document).on('click', '#bulkServingTabs button', function () {
    $('#bulkServingTabs button').css({'background': '#f1f5f9','color': '#475569','border': '1px solid #e2e8f0'}).removeClass('active');
    $(this).css({'background': '#10b981','color': 'white','border': '1px solid #10b981'}).addClass('active');
    var serving = $(this).data('serving');
    $('#bulkServingLabel').text(serving + ' Serving Items');
    LoadBulkMenuItems();
});
function submitBulkOrder() {
    var servingType = $('#bulkServingTabs button.active').data('serving');
    var orderDate = $('#bulkOrderDate').val();

    if (!servingType) {
        alert("Please select a serving.");
        return;
    }

    var itemIds = [];
    var quantities = [];

    $('#bulkItemsContainer .bulk-item-row').each(function () {
        var itemId = ($(this).find('.bulk-item-input').attr('data-id') || '').trim();
        if (!itemId || itemId === 'undefined') return;

        var qty = parseInt($(this).find('.bulk-qty-input').val(), 10) || 1;

        itemIds.push(itemId);
        quantities.push(qty);
    });

    if (itemIds.length === 0) {
        alert("Please select at least one item from the dropdown list.");
        return;
    }

    var loggedInUserId = sessionStorage.getItem('ID') || "0";
    var loggedInUserName = sessionStorage.getItem('NAME') || "System";

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("SAVEBULKORDER").toString()) +
        "&MEALTYPE=" + encodeURIComponent(Encrypt(servingType).toString()) +
        "&ORDERDATE=" + encodeURIComponent(Encrypt(orderDate).toString()) +
        "&ITEMIDS=" + encodeURIComponent(Encrypt(itemIds.join(",")).toString()) +
        "&QUANTITIES=" + encodeURIComponent(Encrypt(quantities.join(",")).toString()) +
        "&USERID=" + encodeURIComponent(Encrypt(loggedInUserId).toString()) +
        "&USERNAME=" + encodeURIComponent(Encrypt(loggedInUserName).toString());

    var $btn = $('.bulk-btn-confirm');
    var originalText = $btn.text();
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            $btn.prop('disabled', false).text(originalText);

            if (res && res.length > 0 && res[0].RESULT === 'Success') {
                $('#bulkOrderModal').modal('hide');
                ShowToast("Order placed successfully!", "success");
                if (typeof LoadOrdersList === 'function') LoadOrdersList();
                if (typeof LoadOrdersSummary === 'function') LoadOrdersSummary();
            } else {
                var errorMsg = (res && res.length > 0 && res[0].MESSAGE) ? res[0].MESSAGE : "Failed to save order.";
                alert(errorMsg);
            }
        },
        error: function (xhr, status, error) {
            $btn.prop('disabled', false).text(originalText);
            console.error("Error saving bulk order:", error);
            alert("An error occurred while saving the order.");
        }
    });
}