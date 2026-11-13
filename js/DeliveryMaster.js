var hurl = window.hurl || '';
var psCurrentPage = 1;
var psRowsPerPage = 10;
var psAllOrders = [];
var psFilteredOrders = [];
var isFirstLoad = true;
var otpTimers = {};
var failureRemarks = [];
var autoRefreshTimer = null;
var refreshInterval = 10000;
var lastDeliveriesData = null;

$(document).ready(function () {
    var userName = sessionStorage.getItem('NAME') || '';
    var userRole = sessionStorage.getItem('ROLENAME') || '';

    $('#spndepNursname').text(userName);
    $('#spnUserTypeLabel').text(userRole);
    $('#spanUserName').text(userName);

    $('#hfUserName').val(userName);
    $('#hfUserRole').val(userRole);

    if (typeof InitChangePassword === 'function') {
        InitChangePassword();
    }

    LoadFailureRemarks();
    LoadDeliveriesData(function () {
        StartAutoRefresh();
    });
    LoadNotifications();
    LoadOtpVerificationData();

    $('#btnRefresh').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var btn = $(this);
        btn.addClass('spinning');

        StopAutoRefresh();

        LoadDeliveriesData(function () {
            LoadNotifications();
            if ($('#otpContent').is(':visible')) {
                LoadOtpVerificationData();
            }
            btn.removeClass('spinning');
            ShowToast('Data refreshed successfully!', 'success');
            StartAutoRefresh();
        });
        return false;
    });

    $('#notificationBell').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#notificationDropdown').toggleClass('show');
        if ($('#notificationDropdown').hasClass('show')) {
            LoadNotifications();
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.notification-wrapper').length) {
            $('#notificationDropdown').removeClass('show');
        }
    });

    $('#markAllRead').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        MarkAllNotificationsAsRead();
    });

    $(document).off('click', '.btn-pickup').on('click', '.btn-pickup', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);
        var orderId = $this.data('orderid');

        if (!orderId) {
            var onclickAttr = $this.attr('onclick');
            if (onclickAttr) {
                var match = onclickAttr.match(/pickupOrder\('([^']+)'\)/);
                if (match && match[1]) {
                    orderId = match[1];
                }
            }
        }

        if ($this.prop('disabled')) {
            return false;
        }

        if (orderId) {
            pickupOrder(orderId);
        }
        return false;
    });

    $('#readyCountBadge').hide();
    $('#tabDeliveries .tab-badge').addClass('hidden');
});

function getUserName() {
    var userName = sessionStorage.getItem('NAME') || '';
    return userName || 'System';
}

function LoadFailureRemarks() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETFAILUREREMARKS"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            failureRemarks = response || [];
        },
        error: function (xhr, status, error) {
            console.error('Error loading failure remarks:', error);
            failureRemarks = [];
        }
    });
}

function LoadDeliveriesData(callback) {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDELIVERIES_ALL"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response && response.length > 0) {
                var data = {
                    ReadyPickup: [],
                    InTransit: [],
                    DeliveredToday: []
                };

                for (var i = 0; i < response.length; i++) {
                    var item = response[i];

                    var dietTags = [];
                    if (item.Diet) {
                        dietTags = String(item.Diet).split(',').map(function (tag) {
                            return tag.trim();
                        }).filter(function (tag) {
                            return tag !== '';
                        });
                    }

                    var allergyTags = [];
                    if (item.Allergies) {
                        allergyTags = String(item.Allergies).split(',').map(function (tag) {
                            return tag.trim();
                        }).filter(function (tag) {
                            return tag !== '';
                        });
                    }

                    var processType = item.ProcessType || '';

                    var order = {
                        OrderId: item.OrderId || '',
                        Room: item.Room || '',
                        Patient: item.Patient || 'Unknown Patient',
                        Ward: item.Ward || '',
                        Items: item.Items || '',
                        Diet: dietTags,
                        Allergies: allergyTags,
                        ETA: item.ETA || '12:00 PM',
                        IsOverdue: item.IsOverdue === true || item.IsOverdue === 1 || item.IsOverdue === '1',
                        Assigned: item.Assigned || 'Unassigned',
                        Badge: item.Badge || 'INSTANT',
                        MealType: item.MealType || 'Breakfast',
                        PickedUp: item.PickedUp || '',
                        DeliveredTime: item.DeliveredTime || '',
                        ProcessType: processType
                    };

                    if (processType === 'READYFORPICKUP') {
                        data.ReadyPickup.push(order);
                    } else if (processType === 'INTRANSIT') {
                        data.InTransit.push(order);
                    } else if (processType === 'DELIVERED') {
                        data.DeliveredToday.push(order);
                    }
                }

                var dataHash = JSON.stringify(data);
                if (dataHash === lastDeliveriesData && !isFirstLoad) {
                    if (callback) callback();
                    return;
                }
                lastDeliveriesData = dataHash;

                UpdateStats(data);
                UpdateDistributionLists(data);
                updateReadyCountBadge();

            } else {
                ShowEmptyState();
                if (isFirstLoad) {
                    ShowToast('No data available', 'info');
                }
            }

            isFirstLoad = false;
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            if (isFirstLoad) {
                ShowToast('Error loading data: ' + error, 'error');
                ShowEmptyState();
                isFirstLoad = false;
            }
            if (callback) callback();
        }
    });
}

function UpdateStats(data) {
    var uniqueReadyOrders = {};
    var uniqueTransitOrders = {};
    var uniqueDeliveredOrders = {};

    (data.ReadyPickup || []).forEach(function (order) {
        uniqueReadyOrders[order.OrderId] = order;
    });

    (data.InTransit || []).forEach(function (order) {
        uniqueTransitOrders[order.OrderId] = order;
    });

    (data.DeliveredToday || []).forEach(function (order) {
        uniqueDeliveredOrders[order.OrderId] = order;
    });

    var readyCount = Object.keys(uniqueReadyOrders).length;
    var transitCount = Object.keys(uniqueTransitOrders).length;
    var deliveredCount = Object.keys(uniqueDeliveredOrders).length;

    $('#lblReadyPickup').text(readyCount);
    $('#lblInTransit').text(transitCount);
    $('#lblDeliveredToday').text(deliveredCount);

    var badge = $('#readyCountBadge');
    if (badge.length > 0 && badge.is(':visible')) {
        if (readyCount > 0) {
            badge.text(readyCount);
            badge.addClass('pulse');
        } else {
            badge.text('0');
        }
    }
    updateReadyCountBadge();
}

function UpdateDistributionLists(data) {
    RenderReadyPickup(data.ReadyPickup || []);
    RenderInTransit(data.InTransit || []);
    RenderDeliveredToday(data.DeliveredToday || []);
}

function ShowEmptyState() {
    $('#readyList').html(
        '<div style="text-align:center;padding:40px 20px;color:#888;">' +
        '<img src="../images/kitchen-icon.png" alt="No orders" style="width:60px;height:60px;opacity:0.3;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />' +
        '<div style="font-size:16px;font-weight:600;color:#6b7280;margin-bottom:4px;">No orders ready for pickup</div>' +
        '<div style="font-size:13px;color:#9ca3af;">Orders that are prepared and waiting will appear here</div>' +
        '</div>'
    );

    $('#transitList').html(
        '<div style="text-align:center;padding:40px 20px;color:#888;">' +
        '<img src="../images/pending-deliveries.png" alt="No transit" style="width:60px;height:60px;opacity:0.3;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />' +
        '<div style="font-size:16px;font-weight:600;color:#6b7280;margin-bottom:4px;">No orders in transit</div>' +
        '<div style="font-size:13px;color:#9ca3af;">Orders being delivered will appear here</div>' +
        '</div>'
    );

    $('#deliveredList').html(
        '<div style="text-align:center;padding:40px 20px;color:#888;">' +
        '<img src="../images/dock-checked.png" alt="No deliveries" style="width:60px;height:60px;opacity:0.3;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />' +
        '<div style="font-size:16px;font-weight:600;color:#6b7280;margin-bottom:4px;">No orders delivered today</div>' +
        '<div style="font-size:13px;color:#9ca3af;">Completed deliveries will appear here</div>' +
        '</div>'
    );

    $('#readyCount').text(0);
    $('#transitCount').text(0);
    $('#deliveredCount').text(0);
    $('#lblReadyPickup').text(0);
    $('#lblInTransit').text(0);
    $('#lblDeliveredToday').text(0);
    updateReadyCountBadge();
}

function RenderReadyPickup(orders) {
    var container = $('#readyList');

    if (!orders || orders.length === 0) {
        $('#readyCount').text(0);
        container.html(
            '<div class="empty-msg" style="text-align:center;padding:40px 20px;color:#888;">' +
            '<img src="../images/kitchen-icon.png" alt="No orders" style="width:60px;height:60px;opacity:0.3;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />' +
            '<div style="font-size:16px;font-weight:600;color:#6b7280;margin-bottom:4px;">No orders ready for pickup</div>' +
            '<div style="font-size:13px;color:#9ca3af;">Orders that are prepared and waiting will appear here</div>' +
            '</div>'
        );
        return;
    }

    var totalCount = orders.length;
    var instantOrders = orders.filter(function (order) {
        return (order.Badge || 'INSTANT').toUpperCase() !== 'PRE-ORDER';
    });
    var instantCount = instantOrders.length;

    $('#readyCount').text(totalCount);

    var htmlBuffer = [];

    htmlBuffer.push(
        '<div class="category-header">' +
        '<div class="category-title">' +
        '<div class="category-icon-wrapper">' +
        '<img src="../images/instant-icon.png" alt="Instant" class="category-icon">' +
        '</div>' +
        '<span>INSTANT ORDERS</span>' +
        '</div>' +
        '<span class="count-ready">' + instantCount + '</span>' +
        '</div>'
    );

    var groupedOrders = groupOrdersById(orders);

    for (var i = 0; i < groupedOrders.length; i++) {
        htmlBuffer.push(BuildOrderCard(groupedOrders[i]));
    }

    container.html(htmlBuffer.join(''));
}

function RenderInTransit(orders) {
    var container = $('#transitList');

    if (!orders || orders.length === 0) {
        $('#transitCount').text(0);
        container.html(
            '<div class="empty-msg" style="text-align:center;padding:40px 20px;color:#888;">' +
            '<img src="../images/pending-deliveries.png" alt="No transit" style="width:60px;height:60px;opacity:0.3;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />' +
            '<div style="font-size:16px;font-weight:600;color:#6b7280;margin-bottom:4px;">No orders in transit</div>' +
            '<div style="font-size:13px;color:#9ca3af;">Orders being delivered will appear here</div>' +
            '</div>'
        );
        return;
    }

    var totalCount = orders.length;
    var instantOrders = orders.filter(function (order) {
        return (order.Badge || 'INSTANT').toUpperCase() !== 'PRE-ORDER';
    });
    var instantCount = instantOrders.length;

    $('#transitCount').text(totalCount);

    var htmlBuffer = [];

    htmlBuffer.push(
        '<div class="category-header">' +
        '<div class="category-title">' +
        '<div class="category-icon-wrapper">' +
        '<img src="../images/instant-icon.png" alt="Instant" class="category-icon">' +
        '</div>' +
        '<span>INSTANT ORDERS</span>' +
        '</div>' +
        '<span class="count-transit">' + instantCount + '</span>' +
        '</div>'
    );

    var groupedOrders = groupOrdersById(orders);

    for (var i = 0; i < groupedOrders.length; i++) {
        htmlBuffer.push(BuildOrderCard(groupedOrders[i]));
    }

    container.html(htmlBuffer.join(''));
}

function RenderDeliveredToday(orders) {
    var container = $('#deliveredList');

    if (!orders || orders.length === 0) {
        $('#deliveredCount').text(0);
        container.html(
            '<div class="empty-msg" style="text-align:center;padding:40px 20px;color:#888;">' +
            '<img src="../images/dock-checked.png" alt="No deliveries" style="width:60px;height:60px;opacity:0.3;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />' +
            '<div style="font-size:16px;font-weight:600;color:#6b7280;margin-bottom:4px;">No orders delivered today</div>' +
            '<div style="font-size:13px;color:#9ca3af;">Completed deliveries will appear here</div>' +
            '</div>'
        );
        return;
    }

    var totalCount = orders.length;
    var instantOrders = orders.filter(function (order) {
        return (order.Badge || 'INSTANT').toUpperCase() !== 'PRE-ORDER';
    });
    var instantCount = instantOrders.length;

    $('#deliveredCount').text(totalCount);

    var htmlBuffer = [];

    htmlBuffer.push(
        '<div class="category-header">' +
        '<div class="category-title">' +
        '<div class="category-icon-wrapper">' +
        '<img src="../images/instant-icon.png" alt="Instant" class="category-icon">' +
        '</div>' +
        '<span>INSTANT ORDERS</span>' +
        '</div>' +
        '<span class="count-delivered">' + instantCount + '</span>' +
        '</div>'
    );

    var groupedOrders = groupOrdersById(orders);

    for (var i = 0; i < groupedOrders.length; i++) {
        htmlBuffer.push(BuildOrderCard(groupedOrders[i]));
    }

    container.html(htmlBuffer.join(''));
}
function groupOrdersById(orders) {
    var grouped = new Map();

    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        if (!grouped.has(order.OrderId)) {
            grouped.set(order.OrderId, {
                OrderId: order.OrderId,
                Room: order.Room || '',
                Patient: order.Patient || 'Unknown Patient',
                Ward: order.Ward || '',
                Items: '',
                ItemsList: [],
                Diet: [],
                DietList: [],
                Allergies: [],
                AllergiesList: [],
                ETA: order.ETA || '12:00 PM',
                IsOverdue: order.IsOverdue || false,
                Assigned: order.Assigned || 'Unassigned',
                Badge: order.Badge || 'INSTANT',
                MealType: order.MealType || 'Breakfast',
                PickedUp: order.PickedUp || '',
                DeliveredTime: order.DeliveredTime || '',
                ProcessType: order.ProcessType || ''
            });
        }
        var entry = grouped.get(order.OrderId);
        entry.ItemsList.push(order.Items);
        if (order.Diet && order.Diet.length > 0) {
            entry.DietList = entry.DietList.concat(order.Diet);
        }
        if (order.Allergies && order.Allergies.length > 0) {
            entry.AllergiesList = entry.AllergiesList.concat(order.Allergies);
        }
    }

    var result = [];
    for (var [key, value] of grouped) {
        value.Items = value.ItemsList.join(' · ');

        var dietSet = {};
        var uniqueDiet = [];
        for (var d = 0; d < value.DietList.length; d++) {
            if (!dietSet[value.DietList[d]]) {
                dietSet[value.DietList[d]] = true;
                uniqueDiet.push(value.DietList[d]);
            }
        }
        value.Diet = uniqueDiet;

        var allergySet = {};
        var uniqueAllergy = [];
        for (var a = 0; a < value.AllergiesList.length; a++) {
            if (!allergySet[value.AllergiesList[a]]) {
                allergySet[value.AllergiesList[a]] = true;
                uniqueAllergy.push(value.AllergiesList[a]);
            }
        }
        value.Allergies = uniqueAllergy;

        result.push(value);
    }
    return result;
}

function pickupOrder(orderId) {
    if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
    }

    var btn = $('.btn-pickup[data-orderid="' + orderId + '"]');

    if (btn.length === 0) {
        btn = $('.btn-pickup').filter(function () {
            var onclick = $(this).attr('onclick');
            return onclick && onclick.indexOf(orderId) > -1;
        });
    }

    if (btn.length === 0) {
        btn = $('.btn-pickup').first();
    }

    if (btn.length === 0 || btn.prop('disabled')) {
        return;
    }

    var originalHtml = btn.html();

    btn.prop('disabled', true);
    btn.html('<span class="spinner-border spinner-border-sm"></span>');

    var userName = getUserName();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("PICKUP")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
        "&UPDATEDBY=" + encodeURIComponent(Encrypt(userName));

    ShowToast('Picking up order #' + orderId + '...', 'info');

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {

            if (response && response.length > 0 && response[0]) {
                if (response[0].RESULT === 'Success') {
                    ShowToast('Order #' + orderId + ' picked up and is now In-Transit!', 'success');

                    var $card = $('.order-card').filter(function () {
                        var orderIdText = $(this).find('.order-id').text().trim();
                        return orderIdText === orderId;
                    });

                    if ($card.length > 0) {
                        $card.fadeOut(300, function () {
                            $(this).remove();

                            var readyCount = $('#readyList .order-card').length;
                            $('#readyCount').text(readyCount);
                            $('#lblReadyPickup').text(readyCount);

                            var instantCount = $('#readyList .order-card .badge-instant').length;
                            $('.count-ready').text(instantCount);

                            updateReadyCountBadge();

                            lastDeliveriesData = null;
                            LoadDeliveriesData(function () {
                                if ($('#otpContent').is(':visible')) {
                                    LoadOtpVerificationData();
                                }
                            });
                        });
                    } else {
                        lastDeliveriesData = null;
                        LoadDeliveriesData(function () {
                            if ($('#otpContent').is(':visible')) {
                                LoadOtpVerificationData();
                            }
                        });
                    }

                } else {
                    ShowToast(response[0].MESSAGE || 'Failed to pickup order', 'error');
                    btn.prop('disabled', false);
                    btn.html(originalHtml);
                }
            } else {
                ShowToast('Failed to pickup order. Please try again.', 'error');
                btn.prop('disabled', false);
                btn.html(originalHtml);
            }
        },
        error: function (xhr, status, error) {
            console.error('Pickup error:', error);
            btn.prop('disabled', false);
            btn.html(originalHtml);
            ShowToast('Error picking up order: ' + error, 'error');
        }
    });
}

function BuildOrderCard(order) {
    var tagsHtml = '';

    if (order.Diet && order.Diet.length > 0) {
        for (var i = 0; i < order.Diet.length; i++) {
            tagsHtml += '<span class="tag diet">' + escapeHtml(order.Diet[i]) + '</span>';
        }
    }

    if (order.Allergies && order.Allergies.length > 0) {
        for (var i = 0; i < order.Allergies.length; i++) {
            tagsHtml += '<span class="tag allergy">' + escapeHtml(order.Allergies[i]) + '</span>';
        }
    }

    var isPreOrder = (order.Badge || 'INSTANT').toUpperCase() === 'PRE-ORDER';
    var badgeClass = isPreOrder ? 'badge-preorder' : 'badge-instant';

    var badgeIcon = '';
    if (!isPreOrder) {
        badgeIcon = '<img src="../images/instant-icon.png" alt="Instant" class="badge-icon">';
    }

    var mealType = order.MealType || 'Breakfast';
    var mealClass = '';
    switch (mealType.toLowerCase()) {
        case 'breakfast': mealClass = 'breakfast'; break;
        case 'lunch': mealClass = 'lunch'; break;
        case 'dinner': mealClass = 'dinner'; break;
        case 'snacks': mealClass = 'snacks'; break;
        default: mealClass = 'breakfast';
    }

    var mealBadge = '<div class="meal-badge ' + mealClass + '">' +
        '<img src="../images/orders-icon.png" alt="' + mealType + '">' +
        escapeHtml(mealType) +
        '</div>';

    var statusHtml = '';
    var actionHtml = '';

    if (order.DeliveredTime) {
        statusHtml = '<div class="status-container">' +
            '<div class="status-row status-delivered">' +
            '<img src="../images/ready-icon.png" alt="Delivered" class="status-icon">' +
            '<span>' + escapeHtml(order.DeliveredTime) + '</span>' +
            '</div>' +
            '</div>';
    } else {
        var assignedText = order.Assigned || 'Unassigned';

        var processType = order.ProcessType || '';

        if (processType === 'READYFORPICKUP') {
            actionHtml = '<button type="button" class="btn-pickup" data-orderid="' + escapeHtml(order.OrderId) + '">' +
                '<img src="../images/truck-icon.png" alt="Truck" class="pickup-icon" />' +
                'Pick Up' +
                '</button>';
        } else if (processType === 'INTRANSIT') {
            actionHtml = '<span class="transit-badge">' +
                'Verify with OTP at bedside →' +
                '</span>';
        } else {
            actionHtml = '';
        }

        statusHtml = '<div class="status-container">' +
            '<div class="status-row status-unassigned">' +
            '<img src="../images/user-assigned.png" alt="User" class="status-icon">' +
            '<span>' + escapeHtml(assignedText) + '</span>' +
            '</div>' +
            '<div class="status-row-with-button">' +
            '<div class="status-row ' + (order.IsOverdue ? 'status-eta' : 'status-eta-ontime') + '">' +
            '<img src="../images/pending-icon.png" alt="ETA" class="status-icon">' +
            '<span>' + (order.IsOverdue ? 'ETA ' + escapeHtml(order.ETA) + ' (overdue)' : 'ETA ' + escapeHtml(order.ETA)) + '</span>' +
            '</div>' +
            actionHtml +
            '</div>';

        if (order.PickedUp) {
            statusHtml += '<div class="status-row status-picked">' +
                '<img src="../images/pending-deliveries.png" alt="Picked Up" class="status-icon">' +
                '<span>' + escapeHtml(order.PickedUp) + '</span>' +
                '</div>';
        }

        statusHtml += '</div>';
    }

    var wardDisplay = order.Ward ? '· ' + escapeHtml(order.Ward) : '';
    var cardClass = order.IsOverdue ? 'order-card card-overdue' : 'order-card';

    var card = '<div class="' + cardClass + '">' +
        mealBadge +
        '<div class="card-header">' +
        '<span class="' + badgeClass + '">' +
        badgeIcon +
        escapeHtml(order.Badge || 'INSTANT') +
        '</span>' +
        '<span class="order-id">' + escapeHtml(order.OrderId) + '</span>' +
        '<span class="room-info">Room ' + escapeHtml(order.Room) + '</span>' +
        '</div>' +
        '<div class="customer-info">' +
        '<strong>' + escapeHtml(order.Patient) + '</strong> ' + wardDisplay +
        '</div>' +
        '<div class="item-name">' + escapeHtml(order.Items) + '</div>' +
        '<div class="tags-container">' + tagsHtml + '</div>' +
        statusHtml +
        '</div>';

    return card;
}

function getDeliveryRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '0').toString();
}

function LoadNotifications() {
    var roleId = getDeliveryRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            RenderNotifications(response || []);
            GetUnreadCount();
        },
        error: function (xhr, status, error) {
            console.error('Error loading notifications:', error);
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

function MarkNotificationAsRead(NotificationID) {
    var roleId = getDeliveryRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(NotificationID)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            GetUnreadCount();
        },
        error: function (xhr, status, error) {
            console.error('Error marking notification as read:', error);
            LoadNotifications();
        }
    });
}

function GetUnreadCount() {
    var roleId = getDeliveryRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response && response.length > 0) {
                var count = response[0].UNREAD_COUNT || 0;
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
            console.error('Error getting unread count:', error);
        }
    });
}

function MarkAllNotificationsAsRead() {
    var roleId = getDeliveryRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
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
            console.error('Error marking all notifications as read:', error);
            ShowToast('Failed to mark all as read', 'error');
        }
    });
}

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
        return encryptedVal.toString();
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

function switchHeaderTab(tab) {
    $('.nav-tab').removeClass('active-tab');

    if (tab === 'deliveries') {
        $('.nav-tab:first-child').addClass('active-tab');
        $('#deliveriesContent').show();
        $('#otpContent').hide();

        $('.top-bar-left').show();
        $('#pageIcon').attr('src', '../images/pending-deliveries.png');
        $('#pageIcon').removeClass('otp-icon').addClass('deliveries-icon');
        $('#pageHeadingText').text('Meal Distribution Tracking').show();
        $('#pageSubText').html(
            '<i class="fas fa-info-circle" style="color: #9ca3af; margin-right: 6px; font-size: 12px;"></i>' +
            'Live read-only view of meal pickups and deliveries. ' +
            '<span style="color: #16a34a; font-weight: 500;">auto-refresh every 10s</span>'
        ).show();

        $('#readyCountBadge').hide();
        $('#tabDeliveries .tab-badge').addClass('hidden');
        LoadOtpVerificationData();

    } else if (tab === 'otp') {
        $('.nav-tab:last-child').addClass('active-tab');
        $('#deliveriesContent').hide();
        $('#otpContent').show();

        $('.top-bar-left').show();
        $('#pageIcon').attr('src', '../images/otp-key.png');
        $('#pageIcon').removeClass('deliveries-icon').addClass('otp-icon');
        $('#pageHeadingText').text('OTP Verification').show();
        $('#pageSubText').html(
            '<i class="fas fa-info-circle" style="color: #9ca3af; margin-right: 6px; font-size: 12px;"></i>' +
            'Verify Delivery with Patient OTP ' +
            '<span style="color: #16a34a; font-weight: 500;">secure & real-time</span>'
        ).show();

        $('#tabDeliveries .tab-badge').removeClass('hidden');
        $('#readyCountBadge').show();

        updateReadyCountBadge();
        StopAutoRefresh();
        LoadOtpVerificationData();
    }
}

function updateReadyCountBadge() {
    var readyCount = parseInt($('#lblReadyPickup').text()) || 0;
    var badge = $('#readyCountBadge');

    if (badge.length > 0) {
        if (badge.is(':visible')) {
            if (readyCount > 0) {
                badge.text(readyCount);
                badge.removeClass('pulse');
                setTimeout(function () {
                    badge.addClass('pulse');
                }, 10);
            } else {
                badge.text('0');
            }
        }
    }
}

function BuildOtpVerificationCard(order) {
    var orderId = order.OrderId || '';
    var roomNo = order.Room || '';
    var patientName = order.Patient || 'Patient';

    var remarksOptions = '';
    if (failureRemarks && failureRemarks.length > 0) {
        for (var i = 0; i < failureRemarks.length; i++) {
            remarksOptions += '<option value="' + escapeHtml(failureRemarks[i].Code) + '">' + escapeHtml(failureRemarks[i].Description) + '</option>';
        }
    }

    var cardHtml = '<div class="otp-verification-card" id="card_' + escapeHtml(orderId) + '">' +
        '<div class="otp-card-header">' +
        '<div class="room-icon-box">' +
        '<img src="../images/orders-icon.png" alt="Room" class="room-icon" />' +
        '</div>' +
        '<div class="room-metadata">' +
        '<div class="room-title">' + escapeHtml(roomNo) + '</div>' +
        '<div class="order-subtitle">Order <span class="order-hash">#' + escapeHtml(orderId) + '</span> · ' + escapeHtml(patientName) + '</div>' +
        '</div>' +
        '</div>' +

        '<div class="otp-view-pane" id="viewStep1_' + escapeHtml(orderId) + '">' +
        '<div class="otp-step-container step-cream">' +
        '<div class="step-title-row">' +
        '<img src="../images/instant-icon.png" alt="Lightning" class="step-icon" style="width: 16px; height: 16px; object-fit: contain;" />' +
        '<span class="step-text-label label-cream">STEP 1 — AT THE PATIENT\'S BEDSIDE</span>' +
        '</div>' +
        '<p class="step-description-text text-cream">' +
        'Tap below to push a one-time 4-digit code to <strong>' + escapeHtml(patientName) + '\'s</strong> screen. They will read it out loud, then you\'ll enter it here.' +
        '</p>' +
        '<button type="button" class="btn-send-otp-trigger" onclick="executeOtpTransmission(\'' + escapeHtml(orderId) + '\', \'' + escapeHtml(roomNo) + '\')">' +
        '<img src="../images/send-icon.png" alt="Send" class="send-icon" style="width: 14px; height: 14px; object-fit: contain;" />' +
        '<span>Send OTP to ' + escapeHtml(patientName) + '\'s screen</span>' +
        '</button>' +
        '</div>' +
        '<div class="otp-card-footer">' +
        '<button type="button" class="btn-report-failure" onclick="toggleFormView(\'' + escapeHtml(orderId) + '\', \'failure\')">' +
        '<img src="../images/warning.png" alt="Warning" class="warning-icon" style="width: 14px; height: 14px; object-fit: contain;" />' +
        'Report Failed Delivery' +
        '</button>' +
        '<div class="without-otp-option">' +
        '<input type="checkbox" id="chkWithoutOtp_' + escapeHtml(orderId) + '"' +
        ' onchange="toggleDeliveredWithoutOtp(\'' + escapeHtml(orderId) + '\', this.checked)">' +
        '<label for="chkWithoutOtp_' + escapeHtml(orderId) + '">Delivered without OTP</label>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="otp-view-pane" id="viewStep2_' + escapeHtml(orderId) + '" style="display: none;">' +
        '<div class="otp-step-container step-purple">' +
        '<div class="step-title-row">' +
        '<img src="../images/otp-key.png" alt="Key" class="step-icon" style="width: 16px; height: 16px; object-fit: contain;" />' +
        '<span class="step-text-label label-purple">STEP 2 — ENTER THE CODE THE PATIENT JUST READ</span>' +
        '</div>' +
        '<p class="step-description-text text-purple">' +
        'The 4-digit code is showing on the patient\'s tablet now. Expires in <span class="otp-countdown" id="timer_' + escapeHtml(orderId) + '">9:59</span>' +
        '</p>' +
        '<div class="otp-verification-row">' +
        '<div class="pin-inputs-wrapper" style="display: flex; align-items: center; gap: 12px; width: 100%;">' +
        '<input type="text" inputmode="numeric" pattern="[0-9]*" class="pin-box-single" maxlength="4" id="otp_' + escapeHtml(orderId) + '" placeholder="Enter 4-digit OTP" autocomplete="off" oninput="toggleVerifyButton(\'' + escapeHtml(orderId) + '\')" style="width: 200px; padding: 8px 14px; font-size: 18px; letter-spacing: 6px; text-align: center; background: #ffffff; border: 2px solid #cbd5e1; border-radius: 10px; color: #0f172a; font-weight: 700; font-family: \'Courier New\', monospace;" />' +
        '<button type="button" class="btn-verify-otp" id="verifyBtn_' + escapeHtml(orderId) + '" onclick="validatePatientOtpSingle(\'' + escapeHtml(orderId) + '\')" disabled style="opacity: 0.5; cursor: not-allowed;">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>' +
        '<polyline points="22 4 12 14.01 9 11.01"></polyline>' +
        '</svg>' +
        '<span>Verify</span>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="resend-action-wrapper">' +
        '<a href="javascript:void(0);" class="link-resend-otp" onclick="resendOtpToPatient(\'' + escapeHtml(orderId) + '\')">Resend OTP to patient</a>' +
        '</div>' +
        '</div>' +
        '<div class="otp-card-footer">' +
        '<button type="button" class="btn-report-failure" onclick="toggleFormView(\'' + escapeHtml(orderId) + '\', \'failure\')">' +
        '<img src="../images/warning.png" alt="Warning" class="warning-icon" style="width: 14px; height: 14px; object-fit: contain;" />' +
        'Report Failed Delivery' +
        '</button>' +
        '<div class="without-otp-option">' +
        '<input type="checkbox" id="chkWithoutOtp2_' + escapeHtml(orderId) + '"' +
        ' onchange="toggleDeliveredWithoutOtp(\'' + escapeHtml(orderId) + '\', this.checked)">' +
        '<label for="chkWithoutOtp2_' + escapeHtml(orderId) + '">Delivered without OTP</label>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="otp-view-pane" id="viewFailure_' + escapeHtml(orderId) + '" style="display: none;">' +
        '<div class="failure-container-box">' +
        '<div class="failure-title-row">' +
        '<img src="../images/warning.png" alt="Danger" class="danger-icon" style="width: 16px; height: 16px; object-fit: contain;" />' +
        '<span class="failure-text-label">REPORT FAILED DELIVERY</span>' +
        '</div>' +
        '<select class="failure-select-input" id="ddlFailureReason_' + escapeHtml(orderId) + '">' +
        '<option value="" disabled selected>Select reason...</option>' +
        remarksOptions +
        '</select>' +
        '<textarea class="failure-textarea-input" id="txtFailureNotes_' + escapeHtml(orderId) + '" placeholder="Additional notes (optional)" rows="2"></textarea>' +
        '<div class="failure-actions-row">' +
        '<button type="button" class="btn-failure-cancel" onclick="toggleFormView(\'' + escapeHtml(orderId) + '\', \'step1\')">Cancel</button>' +
        '<button type="button" class="btn-failure-submit" onclick="submitDeliveryFailure(\'' + escapeHtml(orderId) + '\')">Submit Failure</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    return cardHtml;
}
function toggleDeliveredWithoutOtp(orderId, checked) {
    if (checked) {
        var card = $('#card_' + orderId);
        var viewStep2 = $('#viewStep2_' + orderId);

        if (viewStep2.is(':visible')) {
            $('#otp_' + orderId).prop('disabled', true);
            clearOtpTimer(orderId);
        }

        var verifyBtn = $('#verifyBtn_' + orderId);
        verifyBtn.prop('disabled', true);
        verifyBtn.css('opacity', '0.5');
        verifyBtn.css('cursor', 'not-allowed');

        var btn = $('.btn-send-otp-trigger');
        btn.prop('disabled', true);

        ShowToast('Marking order as delivered without OTP...', 'info');

        var userName = getUserName();
        var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("DELIVEREDWITHOUTOTP")) +
            "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
            "&UPDATEDBY=" + encodeURIComponent(Encrypt(userName));

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (response) {
                if (response && response.length > 0 && response[0]) {
                    if (response[0].RESULT === 'Success') {
                        ShowToast('Order #' + orderId + ' delivered without OTP successfully!', 'success');

                        card.css({
                            'transition': 'all 0.5s ease',
                            'transform': 'scale(0.95)',
                            'opacity': '0',
                            'max-height': '0',
                            'margin': '0',
                            'padding': '0',
                            'overflow': 'hidden'
                        });

                        setTimeout(function () {
                            card.remove();
                            var remainingCards = $('.otp-verification-card').length;
                            if (remainingCards === 0) {
                                $('#otpCardsTargetContainer').html(
                                    '<div style="text-align:center;padding:40px;background:#f9fafb;border-radius:12px;border:1px dashed #d1d5db;">' +
                                    '<img src="../images/otp-key.png" alt="No OTP" style="width:60px;height:60px;opacity:0.4;margin-bottom:12px;">' +
                                    '<h3 style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#888;">No OTP requests pending</h3>' +
                                    '<p style="margin:0;font-size:13px;color:#aaa;">All deliveries have been verified or no orders are ready.</p>' +
                                    '</div>'
                                );
                            }
                        }, 500);

                        lastDeliveriesData = null;
                        LoadDeliveriesData();
                    } else {
                        ShowToast(response[0].MESSAGE || 'Failed to deliver without OTP', 'error');
                        $('#chkWithoutOtp_' + orderId).prop('checked', false);
                        $('#chkWithoutOtp2_' + orderId).prop('checked', false);
                        btn.prop('disabled', false);
                    }
                } else {
                    ShowToast('Failed to deliver without OTP. Please try again.', 'error');
                    $('#chkWithoutOtp_' + orderId).prop('checked', false);
                    $('#chkWithoutOtp2_' + orderId).prop('checked', false);
                    btn.prop('disabled', false);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                ShowToast('Error delivering without OTP: ' + error, 'error');
                $('#chkWithoutOtp_' + orderId).prop('checked', false);
                $('#chkWithoutOtp2_' + orderId).prop('checked', false);
                btn.prop('disabled', false);
            }
        });
    } else {
        var viewStep2 = $('#viewStep2_' + orderId);
        if (viewStep2.is(':visible')) {
            $('#otp_' + orderId).prop('disabled', false);
        }

        var btn = $('.btn-send-otp-trigger');
        btn.prop('disabled', false);

        var verifyBtn = $('#verifyBtn_' + orderId);
        var otpVal = $('#otp_' + orderId).val().replace(/\D/g, '');
        if (otpVal.length === 4) {
            verifyBtn.prop('disabled', false);
            verifyBtn.css('opacity', '1');
            verifyBtn.css('cursor', 'pointer');
        }

        $('#chkWithoutOtp_' + orderId).prop('checked', false);
        $('#chkWithoutOtp2_' + orderId).prop('checked', false);
    }
}
function toggleVerifyButton(orderId) {
    var input = $('#otp_' + orderId);
    var btn = $('#verifyBtn_' + orderId);
    var val = input.val().replace(/\D/g, '');

    input.val(val);

    if (val.length === 4) {
        btn.prop('disabled', false);
        btn.css('opacity', '1');
        btn.css('cursor', 'pointer');
    } else {
        btn.prop('disabled', true);
        btn.css('opacity', '0.5');
        btn.css('cursor', 'not-allowed');
    }
}

function toggleFormView(orderId, targetView) {
    $('#card_' + orderId + ' .otp-view-pane').hide();

    var btn = $('#card_' + orderId + ' .btn-failure-submit');
    btn.prop('disabled', false).html('Submit Failure');

    if (targetView === 'step1') {
        $('#viewStep1_' + orderId).fadeIn(150);
        clearOtpTimer(orderId);
    } else if (targetView === 'step2') {
        $('#viewStep2_' + orderId).fadeIn(150);
        startOtpTimer(orderId);
        $('#otp_' + orderId).focus();
        $('#otp_' + orderId).select();
    } else if (targetView === 'failure') {
        $('#viewFailure_' + orderId).fadeIn(150);
        clearOtpTimer(orderId);
        $('#ddlFailureReason_' + orderId).val('');
        $('#txtFailureNotes_' + orderId).val('');
    }
}

function startOtpTimer(orderId) {
    clearOtpTimer(orderId);
    var timeLeft = 599;
    var timerElement = $('#timer_' + orderId);

    otpTimers[orderId] = setInterval(function () {
        timeLeft--;
        var minutes = Math.floor(timeLeft / 60);
        var seconds = timeLeft % 60;
        timerElement.text(String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0'));

        if (timeLeft <= 0) {
            clearOtpTimer(orderId);
            timerElement.text('00:00');
            ShowToast('OTP has expired. Please resend.', 'error');
        }
    }, 1000);
}

function clearOtpTimer(orderId) {
    if (otpTimers[orderId]) {
        clearInterval(otpTimers[orderId]);
        delete otpTimers[orderId];
    }
}

function executeOtpTransmission(orderId, roomNo) {
    var btn = $('.btn-send-otp-trigger');
    btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Sending...');

    var userName = getUserName();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GENERATEOTP")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
        "&UPDATEDBY=" + encodeURIComponent(Encrypt(userName));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            btn.prop('disabled', false).html(
                '<img src="../images/send-icon.png" alt="Send" class="send-icon" style="width: 14px; height: 14px; object-fit: contain;" />' +
                '<span>Send OTP to patient\'s screen</span>'
            );

            if (response && response.length > 0 && response[0]) {
                if (response[0].RESULT === 'Success') {
                    var otp = response[0].OTP;
                    window['otp_' + orderId] = otp;
                    ShowToast('OTP sent successfully', 'success');
                    toggleFormView(orderId, 'step2');
                    startOtpTimer(orderId);
                    var verifyBtn = $('#verifyBtn_' + orderId);
                    verifyBtn.prop('disabled', true);
                    verifyBtn.css('opacity', '0.5');
                    verifyBtn.css('cursor', 'not-allowed');
                    $('#otp_' + orderId).focus();
                    $('#otp_' + orderId).select();
                } else {
                    ShowToast(response[0].MESSAGE || 'Failed to generate OTP', 'error');
                }
            } else {
                ShowToast('Failed to generate OTP. Please try again.', 'error');
            }
        },
        error: function (xhr, status, error) {
            btn.prop('disabled', false).html(
                '<img src="../images/send-icon.png" alt="Send" class="send-icon" style="width: 14px; height: 14px; object-fit: contain;" />' +
                '<span>Send OTP to patient\'s screen</span>'
            );
            ShowToast('Error sending OTP: ' + error, 'error');
        }
    });
}

function validatePatientOtpSingle(orderId) {
    var enteredOtp = $('#otp_' + orderId).val().trim();

    if (enteredOtp.length !== 4) {
        ShowToast('Please enter the 4-digit OTP', 'error');
        $('#otp_' + orderId).focus();
        $('#otp_' + orderId).select();
        return;
    }

    if (!/^\d{4}$/.test(enteredOtp)) {
        ShowToast('Please enter only numbers (0-9)', 'error');
        $('#otp_' + orderId).val('').focus();
        return;
    }

    var btn = $('#verifyBtn_' + orderId);
    btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Verifying...');

    var userName = getUserName();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("VERIFYOTP")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
        "&OTP=" + encodeURIComponent(Encrypt(enteredOtp)) +
        "&UPDATEDBY=" + encodeURIComponent(Encrypt(userName));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response && response.length > 0 && response[0]) {
                if (response[0].RESULT === 'Success') {
                    ShowToast('OTP Verified and Order Delivered Successfully!', 'success');
                    clearOtpTimer(orderId);

                    var card = $('#card_' + orderId);
                    card.css({
                        'transition': 'all 0.5s ease',
                        'transform': 'scale(0.95)',
                        'opacity': '0',
                        'max-height': '0',
                        'margin': '0',
                        'padding': '0',
                        'overflow': 'hidden'
                    });

                    setTimeout(function () {
                        card.remove();
                        var remainingCards = $('.otp-verification-card').length;
                        if (remainingCards === 0) {
                            $('#otpCardsTargetContainer').html(
                                '<div style="text-align:center;padding:40px;background:#f9fafb;border-radius:12px;border:1px dashed #d1d5db;">' +
                                '<img src="../images/otp-key.png" alt="No OTP" style="width:60px;height:60px;opacity:0.4;margin-bottom:12px;">' +
                                '<h3 style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#888;">No OTP requests pending</h3>' +
                                '<p style="margin:0;font-size:13px;color:#aaa;">All deliveries have been verified or no orders are ready.</p>' +
                                '</div>'
                            );
                        }
                    }, 500);

                    lastDeliveriesData = null;
                    LoadDeliveriesData();
                } else {
                    ShowToast(response[0].MESSAGE || 'Invalid OTP. Please try again.', 'error');
                    btn.prop('disabled', false).html(
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>' +
                        '<polyline points="22 4 12 14.01 9 11.01"></polyline>' +
                        '</svg>' +
                        '<span>Verify</span>'
                    );
                    $('#otp_' + orderId).val('').focus();
                    toggleVerifyButton(orderId);
                }
            } else {
                ShowToast('Failed to verify OTP. Please try again.', 'error');
                btn.prop('disabled', false).html(
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>' +
                    '<polyline points="22 4 12 14.01 9 11.01"></polyline>' +
                    '</svg>' +
                    '<span>Verify</span>'
                );
                $('#otp_' + orderId).val('').focus();
                toggleVerifyButton(orderId);
            }
        },
        error: function (xhr, status, error) {
            btn.prop('disabled', false).html(
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>' +
                '<polyline points="22 4 12 14.01 9 11.01"></polyline>' +
                '</svg>' +
                '<span>Verify</span>'
            );
            ShowToast('Error verifying OTP: ' + error, 'error');
            $('#otp_' + orderId).val('').focus();
            toggleVerifyButton(orderId);
        }
    });
}
function resendOtpToPatient(orderId) {
    var btn = $('.link-resend-otp');
    btn.text('Resending...').css('opacity', '0.6');

    var userName = getUserName();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("RESENDOTP")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
        "&UPDATEDBY=" + encodeURIComponent(Encrypt(userName));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            btn.text('Resend OTP to patient').css('opacity', '1');

            if (response && response.length > 0 && response[0]) {
                if (response[0].RESULT === 'Success') {
                    var otp = response[0].OTP;
                    window['otp_' + orderId] = otp;
                    ShowToast('New OTP sent successfully', 'success');
                    clearOtpTimer(orderId);
                    startOtpTimer(orderId);
                    $('#otp_' + orderId).val('').focus();
                } else {
                    ShowToast(response[0].MESSAGE || 'Failed to resend OTP', 'error');
                }
            } else {
                ShowToast('Failed to resend OTP. Please try again.', 'error');
            }
        },
        error: function (xhr, status, error) {
            btn.text('Resend OTP to patient').css('opacity', '1');
            ShowToast('Error resending OTP: ' + error, 'error');
        }
    });
}

function submitDeliveryFailure(orderId) {
    var selectedOption = $('#ddlFailureReason_' + orderId + ' option:selected');
    var reason = selectedOption.val();
    var reasonText = selectedOption.text();

    if (!reason) {
        ShowToast('Please select a valid rejection reason.', 'error');
        return false;
    }

    var btn = $('.btn-failure-submit');
    var originalHtml = btn.html();
    btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Submitting...');

    var userName = getUserName();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("REPORTFAILURE")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
        "&REASON=" + encodeURIComponent(Encrypt(reasonText)) +
        "&REASONCODE=" + encodeURIComponent(Encrypt(reason)) +
        "&NOTES=" + encodeURIComponent(Encrypt($('#txtFailureNotes_' + orderId).val())) +
        "&UPDATEDBY=" + encodeURIComponent(Encrypt(userName));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response && response.length > 0 && response[0]) {
                if (response[0].RESULT === 'Success') {
                    ShowToast('Delivery failure reported successfully', 'success');
                    clearOtpTimer(orderId);

                    var card = $('#card_' + orderId);
                    card.css({
                        'transition': 'all 0.5s ease',
                        'transform': 'scale(0.95)',
                        'opacity': '0',
                        'max-height': '0',
                        'margin': '0',
                        'padding': '0',
                        'overflow': 'hidden'
                    });

                    setTimeout(function () {
                        card.remove();
                        var remainingCards = $('.otp-verification-card').length;
                        if (remainingCards === 0) {
                            $('#otpCardsTargetContainer').html(
                                '<div style="text-align:center;padding:40px;background:#f9fafb;border-radius:12px;border:1px dashed #d1d5db;">' +
                                '<img src="../images/otp-key.png" alt="No OTP" style="width:60px;height:60px;opacity:0.4;margin-bottom:12px;">' +
                                '<h3 style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#888;">No OTP requests pending</h3>' +
                                '<p style="margin:0;font-size:13px;color:#aaa;">All deliveries have been verified or no orders are ready.</p>' +
                                '</div>'
                            );
                        }
                    }, 500);

                    lastDeliveriesData = null;
                    LoadDeliveriesData();
                } else {
                    ShowToast(response[0].MESSAGE || 'Failed to report delivery failure', 'error');
                    btn.prop('disabled', false).html(originalHtml);
                }
            } else {
                ShowToast('Failed to report delivery failure', 'error');
                btn.prop('disabled', false).html(originalHtml);
            }
        },
        error: function (xhr, status, error) {
            btn.prop('disabled', false).html(originalHtml);
            ShowToast('Error reporting failure: ' + error, 'error');
        }
    });

    return false;
}
function LoadOtpVerificationData() {

    var container = document.getElementById("otpCardsTargetContainer");

    container.innerHTML =
        '<div style="text-align:center;padding:30px;color:#888;">' +
        '<i class="fas fa-spinner fa-spin" style="font-size:22px;margin-bottom:10px;display:block;"></i>' +
        '<span style="font-weight:700;font-size:16px;">Loading OTP requests...</span>' +
        '</div>';

    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETOTPVERIFICATIONLIST")),
        type: "GET",
        dataType: "json",
        cache: false,
        success: function (response) {

            if (!response || response.length === 0) {

                container.innerHTML =
                    '<div style="text-align:center;padding:40px;background:#f9fafb;border-radius:12px;border:1px dashed #d1d5db;">' +
                    '<img src="../images/otp-key.png" style="width:60px;height:60px;opacity:.4;margin-bottom:12px;">' +
                    '<h3 style="margin:0 0 5px;font-size:16px;color:#666;">No OTP requests pending</h3>' +
                    '<p style="margin:0;font-size:13px;color:#999;">All deliveries have been verified or no orders are ready.</p>' +
                    '</div>';

                return;
            }

            if (response[0].RESULT === "Error") {

                container.innerHTML =
                    '<div style="text-align:center;padding:40px;background:#fef2f2;border-radius:12px;border:1px solid #fca5a5;">' +
                    '<h3 style="margin:0 0 5px;color:#dc2626;">Error</h3>' +
                    '<p style="margin:0 0 15px;">' + (response[0].MESSAGE || "Unknown Error") + '</p>' +
                    '<button onclick="LoadOtpVerificationData()" class="btn btn-primary">Retry</button>' +
                    '</div>';

                return;
            }

            var html = "";

            for (var i = 0, len = response.length; i < len; i++) {
                html += BuildOtpVerificationCard(response[i]);
            }

            container.innerHTML = html;
        },

        error: function (xhr, status, error) {

            console.error(error);

            container.innerHTML =
                '<div style="text-align:center;padding:40px;background:#fef2f2;border-radius:12px;border:1px solid #fca5a5;">' +
                '<h3 style="margin:0 0 5px;color:#dc2626;">Error loading OTP data</h3>' +
                '<p style="margin:0 0 15px;">' + error + '</p>' +
                '<button onclick="LoadOtpVerificationData()" class="btn btn-primary">Retry</button>' +
                '</div>';
        }
    });
}
function StartAutoRefresh() {
    if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer);
        autoRefreshTimer = null;
    }

    autoRefreshTimer = setTimeout(function () {
        if (document.hidden) {
            StartAutoRefresh();
            return;
        }

        LoadDeliveriesData(function () {
            GetUnreadCount();
        });

        if ($('#otpContent').is(':visible')) {
            LoadOtpVerificationData();
        }

        StartAutoRefresh();
    }, refreshInterval);
}

function StopAutoRefresh() {
    if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer);
        autoRefreshTimer = null;
    }
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