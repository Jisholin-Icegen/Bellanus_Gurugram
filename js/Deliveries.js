var hurl = window.hurl || '';
var psCurrentPage = 1;
var psRowsPerPage = 10;
var psAllOrders = [];
var psFilteredOrders = [];
var isFirstLoad = true;
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

    LoadDeliveriesData(function () {
        StartAutoRefresh();
    });
    LoadNotifications();

    $('#btnRefresh').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var btn = $(this);
        btn.addClass('spinning');

        StopAutoRefresh();

        LoadDeliveriesData(function () {
            LoadNotifications();
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

function LoadDeliveriesData(callback) {
    if (isFirstLoad) {
        ShowLoadingState();
    }

    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETDELIVERIES_ALL"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var data = {
                    ReadyPickup: [],
                    InTransit: [],
                    DeliveredToday: []
                };

                for (var i = 0; i < res.length; i++) {
                    var item = res[i];

                    var tags = [];
                    if (item.Tags) {
                        tags = String(item.Tags).split(',').map(function (tag) {
                            return tag.trim();
                        }).filter(function (tag) {
                            return tag !== '';
                        });
                    }

                    var order = {
                        OrderId: item.OrderId || '',
                        Room: item.Room || '',
                        Patient: item.Patient || 'Patient',
                        Ward: item.Ward || '',
                        Items: item.Items || '',
                        Tags: tags,
                        ETA: item.ETA || '12:00 PM',
                        IsOverdue: item.IsOverdue === true || item.IsOverdue === 1 || item.IsOverdue === '1',
                        Assigned: item.Assigned || 'Unassigned',
                        Badge: item.Badge || 'INSTANT',
                        MealType: item.MealType || 'Breakfast',
                        PickedUp: item.PickedUp || '',
                        DeliveredTime: item.DeliveredTime || ''
                    };

                    var processType = item.ProcessType || '';
                    if (processType === 'READYFORPICKUP') {
                        data.ReadyPickup.push(order);
                    } else if (processType === 'INTRANSIT') {
                        data.InTransit.push(order);
                    } else if (processType === 'DELIVERED') {
                        data.DeliveredToday.push(order);
                    }
                }

                if (isFirstLoad) {
                    UpdateStats(data);
                    UpdateDistributionLists(data);
                    isFirstLoad = false;
                } else {
                    UpdateStats(data);
                    UpdateDistributionLists(data);
                }
            } else {
                if (isFirstLoad) {
                    ShowEmptyState();
                    ShowToast('No data available', 'info');
                    isFirstLoad = false;
                }
            }
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
    updateReadyCountBadge();
}

function UpdateDistributionLists(data) {
    RenderReadyPickup(data.ReadyPickup || []);
    RenderInTransit(data.InTransit || []);
    RenderDeliveredToday(data.DeliveredToday || []);

    $('#readyList, #transitList, #deliveredList').css('opacity', '0.8');
    setTimeout(function () {
        $('#readyList, #transitList, #deliveredList').css('opacity', '1');
    }, 150);
}

function ShowEmptyState() {
    $('#readyList').html('<div style="text-align:center;padding:30px;color:#888;">No orders ready for pickup</div>');
    $('#transitList').html('<div style="text-align:center;padding:30px;color:#888;">No orders in transit</div>');
    $('#deliveredList').html('<div style="text-align:center;padding:30px;color:#888;">No orders delivered today</div>');
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

    var groupedOrders = groupOrdersById(orders);
    var totalCount = groupedOrders.length;

    var instantOrders = groupedOrders.filter(function (order) {
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

    var groupedOrders = groupOrdersById(orders);
    var totalCount = groupedOrders.length;

    var instantOrders = groupedOrders.filter(function (order) {
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

    var groupedOrders = groupOrdersById(orders);
    var totalCount = groupedOrders.length;

    var instantOrders = groupedOrders.filter(function (order) {
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
                Tags: order.Tags || [],
                ETA: order.ETA || '12:00 PM',
                IsOverdue: order.IsOverdue || false,
                Assigned: order.Assigned || 'Unassigned',
                Badge: order.Badge || 'INSTANT',
                MealType: order.MealType || 'Breakfast',
                PickedUp: order.PickedUp || '',
                DeliveredTime: order.DeliveredTime || ''
            });
        }
        var entry = grouped.get(order.OrderId);
        entry.ItemsList.push(order.Items);
    }

    var result = [];
    for (var [key, value] of grouped) {
        value.Items = value.ItemsList.join(' · ');
        result.push(value);
    }
    return result;
}

function BuildOrderCard(order) {
    var tagsHtml = '';
    if (order.Tags && order.Tags.length > 0) {
        for (var i = 0; i < order.Tags.length; i++) {
            var tag = order.Tags[i];
            var tagClass = 'tag';
            var lowerTag = tag.toLowerCase();
            if (lowerTag === 'wheat' || lowerTag === 'eggs' || lowerTag === 'dairy' ||
                lowerTag === 'peanuts' || lowerTag === 'gluten' || lowerTag === 'soy' ||
                lowerTag === 'shellfish' || lowerTag === 'fish') {
                tagClass += ' allergy';
            }
            tagsHtml += '<span class="' + tagClass + '">' + escapeHtml(tag) + '</span>';
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

    if (order.DeliveredTime) {
        statusHtml = '<div class="status-container">' +
            '<div class="status-row status-delivered">' +
            '<img src="../images/ready-icon.png" alt="Delivered" class="status-icon">' +
            '<span>' + escapeHtml(order.DeliveredTime) + '</span>' +
            '</div>' +
            '</div>';
    } else {
        var assignedText = order.Assigned || 'Unassigned';
        statusHtml = '<div class="status-container">' +
            '<div class="status-row status-unassigned">' +
            '<img src="../images/user-assigned.png" alt="User" class="status-icon">' +
            '<span>' + escapeHtml(assignedText) + '</span>' +
            '</div>';

        var etaClass = order.IsOverdue ? 'status-eta' : 'status-eta-ontime';
        var etaText = order.IsOverdue ? 'ETA ' + escapeHtml(order.ETA) + ' (overdue)' : 'ETA ' + escapeHtml(order.ETA);
        statusHtml += '<div class="status-row ' + etaClass + '">' +
            '<img src="../images/pending-icon.png" alt="ETA" class="status-icon">' +
            '<span>' + etaText + '</span>' +
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
    var cardClass = order.IsOverdue ? "order-card card-overdue" : "order-card";

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
                        $card.css({
                            'transition': 'all 0.5s ease',
                            'transform': 'scale(0.95)',
                            'opacity': '0',
                            'max-height': '0',
                            'margin': '0',
                            'padding': '0',
                            'overflow': 'hidden'
                        });

                        setTimeout(function () {
                            $card.remove();
                            lastDeliveriesData = null;
                            LoadDeliveriesData();
                        }, 500);
                    } else {
                        lastDeliveriesData = null;
                        LoadDeliveriesData();
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

function ShowLoadingState() {
    $('#readyList').html('<div style="text-align:center;padding:30px;color:#888;">Loading orders...</div>');
    $('#transitList').html('<div style="text-align:center;padding:30px;color:#888;">Loading orders...</div>');
    $('#deliveredList').html('<div style="text-align:center;padding:30px;color:#888;">Loading orders...</div>');
    $('#readyCount').text('...');
    $('#transitCount').text('...');
    $('#deliveredCount').text('...');
    $('#lblReadyPickup').text('...');
    $('#lblInTransit').text('...');
    $('#lblDeliveredToday').text('...');
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

function getPorterRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '0').toString();
}

function LoadNotifications() {
    var roleId = getPorterRoleId();
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
    var roleId = getPorterRoleId();
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
    var roleId = getPorterRoleId();
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
            console.log("Error getting unread count:", error);
        }
    });
}
function MarkAllNotificationsAsRead() {
    var roleId = getPorterRoleId();
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
            console.log("Error marking all notifications as read:", error);
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