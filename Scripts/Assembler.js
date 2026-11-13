var currentAssemblerTab = "incoming";
var IncomingOrdersDocketCache = {};
var AssemblyDocketCache = {};
var ASM_IMG = "../images/Assembler/";

var assemblerRefreshTimer = null;
var ASSEMBLER_REFRESH_MS = 30000;

var notificationPollTimer = null;
var NOTIFICATION_POLL_MS = 30000;

function StartAssemblerAutoRefresh() {
    StopAssemblerAutoRefresh();
    assemblerRefreshTimer = setInterval(function () {
        if (document.hidden) return;
        RefreshCurrentAssemblerTab();
        LoadNotifications(function () {
            GetUnreadCount();
        });
    }, ASSEMBLER_REFRESH_MS);
}

function StopAssemblerAutoRefresh() {
    if (assemblerRefreshTimer) {
        clearInterval(assemblerRefreshTimer);
        assemblerRefreshTimer = null;
    }
}

function StartNotificationAutoRefresh() {
    StopNotificationAutoRefresh();
    notificationPollTimer = setInterval(function () {
        if (document.hidden) return;
        GetUnreadCount();
    }, NOTIFICATION_POLL_MS);
}

function StopNotificationAutoRefresh() {
    if (notificationPollTimer) {
        clearInterval(notificationPollTimer);
        notificationPollTimer = null;
    }
}

function RefreshCurrentAssemblerTab() {
    if (currentAssemblerTab === "incoming") {
        LoadIncomingOrders();
    } else if (currentAssemblerTab === "preorder") {
        loadPreOrderSheets();
    } else if (currentAssemblerTab === "assembly") {
        LoadAssemblyPass();
    }
}

function MapIconToImage(icon) {
    var map = {
        "fa-utensils": "soup.png",
        "fa-check-circle": "check-mark.png",
        "fa-lock": "lock.png",
        "fa-truck": "truck.png",
        "fa-times-circle": "alert.png",
        "fa-bell": "bell-school.png",
        "fa-exclamation-triangle": "alert.png",
        "fa-box": "cube.png",
        "fa-box-open": "cube.png"
    };
    if (!icon) return ASM_IMG + "bell-school.png";
    if (map[icon]) return ASM_IMG + map[icon];
    return ASM_IMG + icon;
}

function GetVal(row, keys) {
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (row.hasOwnProperty(k) && row[k] !== null && row[k] !== undefined && row[k] !== "") {
            return row[k];
        }
    }
    return null;
}

function FormatRoom(value) {
    if (!value) return "-";
    var str = String(value);
    return /room/i.test(str) ? str : "Room " + str;
}

function InitAssemblerTabs() {
    $(document)
        .off("click", ".btn-assembler-refresh")
        .on("click", ".btn-assembler-refresh", function () {
            var $btn = $(this);
            var $icon = $btn.find("img");

            $icon.addClass("spinning-loop");

            var startTime = Date.now();
            var minSpinTime = 3000;

            var stopSpin = function () {
                var elapsed = Date.now() - startTime;
                var remaining = Math.max(0, minSpinTime - elapsed);
                setTimeout(function () {
                    $icon.removeClass("spinning-loop");
                    LoadNotifications(function () {
                        GetUnreadCount();
                    });
                    ShowToast("Refreshed", "success");
                }, remaining);
            };

            if (currentAssemblerTab === "incoming") {
                LoadIncomingOrders(stopSpin);
            } else if (currentAssemblerTab === "preorder") {
                loadPreOrderSheets(stopSpin);
            } else if (currentAssemblerTab === "assembly") {
                LoadAssemblyPass(stopSpin);
            }
        });

    $(".assembler-tab-item")
        .off("click")
        .on("click", function () {
            var tab = $(this).data("tab");
            SwitchAssemblerTab(tab);
        });
}

function SwitchAssemblerTab(tab) {
    currentAssemblerTab = tab;
    $("#HFActiveTab").val(tab);
    $(".assembler-tab-item").removeClass("active");
    $(".assembler-tab-item[data-tab='" + tab + "']").addClass("active");
    $(".assembler-panel").hide();

    if (tab === "incoming") {
        $("#panelIncoming").show();
        LoadIncomingOrders();
    } else if (tab === "preorder") {
        $("#panelPreorder").show();
        loadPreOrderSheets();
    } else if (tab === "assembly") {
        $("#panelAssembly").show();
        LoadAssemblyPass();
    }
}

function ToggleNotifPanel(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    var $dropdown = $("#notificationDropdown");
    if ($dropdown.hasClass("show")) {
        $dropdown.removeClass("show");
    } else {
        LoadNotifications(function () {
            GetUnreadCount();
        });
        $dropdown.addClass("show");
    }
}

function getAssemblerRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '0').toString();
}

function LoadNotifications(onDone) {
    var roleId = getAssemblerRoleId();

    if (!roleId || roleId === '0') {
        RenderNotifications([]);
        if (onDone) onDone();
        return;
    }

    var url =
        hurl +
        "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 15000,
        success: function (res) {
            RenderNotifications(res || []);
        },
        error: function (xhr, status) {
            if (status !== "timeout" && status !== "abort") {
                console.log("Notification load error:", status);
                RenderNotifications([]);
            }
        },
        complete: function () {
            if (onDone) onDone();
        }
    });
}

function RenderNotifications(notifications) {
    var $list = $("#notificationList");
    if (!$list.length) return;

    $list.find(".notification-item").remove();

    var unreadCount = 0;

    if (!notifications || notifications.length === 0) {
        $("#notifPanelEmpty").show();
        $("#notificationCount").text("0").removeClass("show");
        return;
    }

    $("#notifPanelEmpty").hide();

    $.each(notifications, function (i, item) {
        var isRead =
            item.IS_READ === true ||
            item.IS_READ === 1 ||
            item.IS_READ === "1";

        if (!isRead) unreadCount++;

        var notificationType = (item.NOTIFICATION_TYPE || "info").toLowerCase();
        var notificationId = item.NOTIFICATION_ID || item.ID || i;
        var icon = getNotificationIcon(notificationType);

        var header = escapeHtml(item.NOTIFICATION_HEADER || "");
        var message = escapeHtml(item.NOTIFICATION_MESSAGE || "");
        var timeAgo = escapeHtml(item.TIME_AGO || "");

        var html =
            '<div class="notification-item ' + (isRead ? "read" : "unread") + '" data-id="' + notificationId + '">' +
            '<div class="notification-icon ' + notificationType + '">' +
            '<img src="' + icon + '" alt="' + notificationType + '">' +
            '</div>' +
            '<div class="notification-content">' +
            '<div class="notification-text">' +
            '<h4>' + header + '</h4>' +
            '<p>' + message + '</p>' +
            '</div>' +
            '<div class="notification-time">' + timeAgo + '</div>' +
            '</div>' +
            (!isRead ? '<span class="unread-dot"></span>' : '') +
            '</div>';

        $list.append(html);
    });

    $("#notificationCount").text(unreadCount);
    if (unreadCount > 0) {
        $("#notificationCount").addClass("show");
    } else {
        $("#notificationCount").removeClass("show");
    }
}

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getNotificationIcon(type) {
    switch (type) {
        case "error": return ASM_IMG + "alert.png";
        case "warning": return ASM_IMG + "alert.png";
        case "info": return ASM_IMG + "notification.png";
        case "success": return ASM_IMG + "check-mark.png";
        default: return ASM_IMG + "bell-school.png";
    }
}

function getIconBackground(type) {
    switch (type) {
        case "info": return "rgba(37, 99, 235, 0.08)";
        case "success": return "rgba(22, 163, 74, 0.08)";
        case "warning": return "rgba(245, 158, 11, 0.08)";
        case "error": return "rgba(239, 68, 68, 0.08)";
        default: return "rgba(37, 99, 235, 0.08)";
    }
}

$(document)
    .off("click.assemblerNotificationItem")
    .on("click.assemblerNotificationItem", ".notification-item.unread[data-id]", function () {
        var $item = $(this);
        var notificationId = $item.data("id");

        $item.removeClass("unread").addClass("read");
        $item.find(".unread-dot").remove();

        MarkNotificationAsRead(notificationId, $item);
    });

function MarkNotificationAsRead(notificationId, $item) {
    var roleId = getAssemblerRoleId();
    if (!roleId || roleId === '0') return;

    var url =
        hurl +
        "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(notificationId)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 15000,
        success: function () {
            if ($item && $item.length) {
                $item.fadeOut(300, function () {
                    $(this).remove();
                    UpdateNotificationBadge();
                });
            } else {
                UpdateNotificationBadge();
            }
        },
        error: function (xhr, status) {
            if (status !== "timeout" && status !== "abort") {
                console.log("Error marking notification as read:", status);
            }
        }
    });
}

function GetUnreadCount() {
    var roleId = getAssemblerRoleId();
    if (!roleId || roleId === '0') return;

    var url =
        hurl +
        "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 15000,
        success: function (res) {
            var count = 0;
            if (res && res.length > 0) {
                count = parseInt(res[0].UNREAD_COUNT) || 0;
            }
            $("#notificationCount").text(count);
            if (count > 0) {
                $("#notificationCount").addClass("show");
            } else {
                $("#notificationCount").removeClass("show");
            }
        },
        error: function (xhr, status) {
            if (status !== "timeout" && status !== "abort") {
                console.log("Unable to get notification count:", status);
            }
        }
    });
}

function UpdateNotificationBadge() {
    GetUnreadCount();
    if ($("#notificationList .notification-item").length === 0) {
        $("#notifPanelEmpty").show();
    }
}

function MarkAllNotifRead(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    MarkAllNotificationsAsRead();
}

function MarkAllNotificationsAsRead() {
    var roleId = getAssemblerRoleId();
    if (!roleId || roleId === '0') return;

    var url =
        hurl +
        "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 15000,
        success: function () {
            $("#notificationList .notification-item").removeClass("unread").addClass("read");
            $("#notificationList .unread-dot").remove();
            $("#notificationCount").text("0").removeClass("show");
            LoadNotifications();

            if (typeof ShowToast === "function") {
                ShowToast("All notifications marked as read", "success");
            } else if (typeof ShowAssemblerAlert === "function") {
                ShowAssemblerAlert("All notifications marked as read");
            }
        },
        error: function (xhr, status) {
            if (status === "timeout" || status === "abort") return;
            if (typeof ShowToast === "function") {
                ShowToast("Failed to mark all as read", "error");
            } else if (typeof ShowAssemblerAlert === "function") {
                ShowAssemblerAlert("Failed to mark all as read");
            }
        }
    });
}

$(function () {
    InitAssemblerTabs();

    LoadNotifications(function () {
        GetUnreadCount();
    });

    RefreshCurrentAssemblerTab();

    StartAssemblerAutoRefresh();

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            StopAssemblerAutoRefresh();
            StopNotificationAutoRefresh();
        } else {
            RefreshCurrentAssemblerTab();
            LoadNotifications(function () {
                GetUnreadCount();
            });
            StartAssemblerAutoRefresh();
        }
    });
});

function LoadIncomingOrders(onDone) {
    $("#loader").show();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETINCOMINGORDERS"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 30000,
        success: function (response) {
            $("#loader").hide();
            try {
                var grouped = GroupIncomingOrders(response || []);
                RenderIncomingOrders(grouped);
            } catch (e) {
                console.error("JSON Parse Error:", e);
            }
            if (onDone) onDone();
        },
        error: function (xhr, status, error) {
            $("#loader").hide();
            if (status !== "timeout" && status !== "abort") {
                console.log("Incoming orders error:", status, error);
            }
            RenderIncomingOrders({ justPlaced: 0, cooking: 0, allReady: 0, assembling: 0, orders: [] });
            if (onDone) onDone();
        }
    });
}

function FormatMinutesAgo(mins) {
    mins = parseInt(mins, 10) || 0;
    if (mins < 60) return mins + " min ago";
    var hrs = Math.floor(mins / 60);
    var rem = mins % 60;
    return hrs + "h " + rem + "m ago";
}

function FormatDocketTime(value) {
    if (!value) return "&mdash;";

    // Values can come back as "2026-06-25T16:52:55.010" or "2026-06-25 16:52:55.010"
    // or already as a Date (some adapters deserialize). Normalize.
    var d;
    if (value instanceof Date) {
        d = value;
    } else {
        var str = String(value).trim();
        // "/Date(1719...)/" from older ASP.NET JSON serializers
        var ms = str.match(/\/Date\((\d+)\)\//);
        if (ms) {
            d = new Date(parseInt(ms[1], 10));
        } else {
            d = new Date(str.replace(" ", "T"));
        }
    }

    if (!d || isNaN(d.getTime())) return "&mdash;";

    return d.toLocaleString([], {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}
function FormatOrderId(value) {
    if (value === null || value === undefined || value === "") return "-";
    var str = String(value).trim();
    if (/^ORD-/i.test(str)) return str.toUpperCase();
    return "ORD-" + str;
}

function GroupIncomingOrders(rows) {
    var result = { justPlaced: 0, cooking: 0, allReady: 0, assembling: 0, orders: [] };
    var orders = {};

    $.each(rows, function (i, row) {
        var orderId = GetVal(row, ["ORDERID", "ORDER_ID", "OrderId"]);
        if (orderId === null) return;

        if (!orders[orderId]) {
            var status = GetVal(row, ["STATUS"]) || "";
            var statusLower = status.toLowerCase();

            orders[orderId] = {
                orderId: FormatOrderId(orderId),
                patientName: GetVal(row, ["PATIENTNAME", "PATIENT_NAME"]) || "Unknown",
                isVisitor: ((GetVal(row, ["ORDERTYPE", "ORDER_TYPE"]) || "")).toLowerCase() === "visitor",
                room: FormatRoom(GetVal(row, ["ROOMNO", "ROOM_NO", "ROOM"])),
                meal: GetVal(row, ["MEALTYPE", "MEAL_TYPE"]),
                placedAgo: FormatMinutesAgo(GetVal(row, ["MINUTESAGO", "MINUTES_AGO"])),
                allergy: GetVal(row, ["ALLERGIES", "ALLERGY"]) || "",
                status: status,
                placedTime: GetVal(row, ["PLACEDTIME", "PLACED_TIME"]),
                receivedTime: GetVal(row, ["RECEIVEDTIME", "RECEIVED_TIME", "ASSEMBLINGTIME"]),
                stations: [],
                hideFromList: (statusLower.indexOf("ready") !== -1 || statusLower.indexOf("assembling") !== -1)
            };

            switch (true) {
                case statusLower.indexOf("placed") !== -1: result.justPlaced++; break;
                case statusLower.indexOf("preparing") !== -1: result.cooking++; break;
                case statusLower.indexOf("ready") !== -1: result.allReady++; break;
                case statusLower.indexOf("assembling") !== -1: result.assembling++; break;
            }
        }

        var order = orders[orderId];
        var itemName = row.ITEMNAME || row.FOODNAME || "";
        var categoryName = GetVal(row, ["CATEGORYNAME", "CATEGORY"]) || CategorizeFoodItem(itemName);
        categoryName = categoryName.toUpperCase();

        var station = null;
        $.each(order.stations, function (idx, s) {
            if (s.name === categoryName) { station = s; return false; }
        });

        if (!station) {
            station = { name: categoryName, readyCount: 0, total: 0, items: [] };
            order.stations.push(station);
        }

        station.items.push({ name: row.ITEMNAME + " x " + row.QUANTITY, ready: row.ISREADY == 1 });
        station.total++;
        if (row.ISREADY == 1) station.readyCount++;
    });

    $.each(orders, function (key, value) {
        if (!value.hideFromList) result.orders.push(value);
    });

    return result;
}

function CategorizeFoodItem(foodName) {
    var name = (foodName || "").toLowerCase();

    if (name.indexOf("salad") !== -1 || name.indexOf("fruit bowl") !== -1) {
        return "Cold & Salad";
    }

    if (name.indexOf("juice") !== -1 ||
        name.indexOf("tea") !== -1 ||
        name.indexOf("coffee") !== -1 ||
        name.indexOf("milk") !== -1 ||
        name.indexOf("shake") !== -1 ||
        name.indexOf("smoothie") !== -1 ||
        name.indexOf("lassi") !== -1 ||
        name.indexOf("water") !== -1 ||
        name.indexOf("ors") !== -1 ||
        name.indexOf("broth") !== -1 ||
        name.indexOf("drink") !== -1) {
        return "Beverages";
    }

    return "Hot Mains";
}

function RenderIncomingOrders(data) {
    $("#statJustPlaced").text(data.justPlaced || 0);
    $("#statCooking").text(data.cooking || 0);
    $("#statAllReady").text(data.allReady || 0);
    $("#statAssembling").text(data.assembling || 0);

    var $list = $("#incomingOrdersList").empty();

    if (!data.orders || data.orders.length === 0) {
        $("#incomingEmptyState").show();
        return;
    }
    $("#incomingEmptyState").hide();

    IncomingOrdersDocketCache = {};

    $.each(data.orders, function (i, o) {
        IncomingOrdersDocketCache[o.orderId] = o;

        var readyTotal = 0, itemTotal = 0;
        var stationsHtml = "";
        $.each(o.stations, function (j, st) {
            itemTotal += st.total;
            readyTotal += st.readyCount;

            var itemsHtml = "";
            $.each(st.items, function (k, it) {
                itemsHtml += '<div class="order-station-item ' + (it.ready ? "ready" : "") + '">' +
                    (it.ready ? '<img src="' + ASM_IMG + 'check-mark.png" class="aicon aicon-sm aicon-green" alt="" />' : '<span class="dot"></span>') +
                    it.name + '</div>';
            });

            stationsHtml += '<div class="order-station-box">' +
                '<div class="order-station-box-head"><span><img src="' + ASM_IMG + 'fire.png" class="aicon aicon-sm station-fire-icon" alt="" /> ' + st.name + '</span><span>' + st.readyCount + '/' + st.total + '</span></div>' +
                itemsHtml + '</div>';
        });

        var allergyHtml = o.allergy ?
            '<div class="order-allergy-banner"><img src="' + ASM_IMG + 'alert.png" class="aicon aicon-sm aicon-red" alt="" /> Patient allergies: ' + o.allergy + '</div>' : '';
        var nameHtml = o.isVisitor ?
            'Visitor <span style="font-weight:400;color:var(--assembler-text-muted);">(for ' + o.patientName + ')</span><span class="order-badge-visitor">VISITOR ORDER</span>' :
            o.patientName;

        var $card = $(
            '<div class="order-card" data-id="' + o.orderId + '">' +
            '  <div class="order-card-head">' +
            '    <div class="order-card-left">' +
            '      <div class="order-avatar ' + (o.isVisitor ? "visitor" : "") + '"><img src="' + ASM_IMG + 'person.png" class="aicon aicon-md" alt="" /></div>' +
            '      <div>' +
            '        <div><span class="order-badge-instant"><img src="' + ASM_IMG + 'charge.png" class="aicon aicon-sm aicon-orange" alt="" /> INSTANT</span><span class="order-patient-name">' + nameHtml + '</span></div>' +
            '        <div class="order-sub-meta"><span class="tag-pill">' + o.orderId + '</span><span><img src="' + ASM_IMG + 'pin.png" class="aicon aicon-sm" alt="" /> ' + o.room + '</span><span>&middot; ' + o.meal + '</span><span><img src="' + ASM_IMG + 'clock.png" class="aicon aicon-sm" alt="" /> ' + o.placedAgo + '</span></div>' +
            '      </div>' +
            '    </div>' +
            '    <span class="order-status-pill ' + (o.status && o.status.toLowerCase() === "preparing" ? "cooking" : "") + '">' + (o.status && o.status.toLowerCase() === "preparing" ? "Cooking" : o.status) + '</span>' +
            '  </div>' +
            allergyHtml +
            '  <div class="order-items-progress-label"><span>Items ready</span><span>' + readyTotal + ' / ' + itemTotal + '</span></div>' +
            '  <div class="order-items-progress-bar"><div class="order-items-progress-fill ' + (itemTotal > 0 && readyTotal === itemTotal ? "complete" : (readyTotal > 0 ? "mid" : "")) + '" style="width:' + (itemTotal > 0 ? Math.round((readyTotal / itemTotal) * 100) : 0) + '%;"></div></div>' +
            '  <div class="order-station-grid">' + stationsHtml + '</div>' +
            '  <button type="button" class="btn-print-docket printDocketBtn" data-id="' + o.orderId + '"><img src="' + ASM_IMG + 'printer.png" class="aicon aicon-sm" alt="" /> Print docket / prep tray</button>' +
            '</div>'
        );
        $list.append($card);
    });

    $(".printDocketBtn").off("click").on("click", function () {
        PrintDocket($(this).data("id"));
    });
}

function PrintDocket(orderId) {
    var order = IncomingOrdersDocketCache[orderId] || AssemblyDocketCache[orderId];

    if (!order) {
        alert("Could not find the order details to print. Please refresh and try again.");
        return;
    }
    
    var win = window.open("", "_blank");
    var now = new Date();
    var dateStr = (now.getMonth() + 1) + "/" + now.getDate() + "/" + (now.getFullYear() % 100) + ", " +
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    var allergyHtml = order.allergy
        ? '<div class="docket-allergy"><strong>&#9888; Allergies:</strong> ' + order.allergy + '</div>'
        : '';
    var timestampsHtml =
        '<div class="docket-times">' +
        '  <div><span class="tlabel">Placed Time:</span> ' + FormatDocketTime(order.placedTime) + '</div>' +
        '  <div><span class="tlabel">Received Time:</span> ' + FormatDocketTime(order.receivedTime) + '</div>' +
        '</div>';
    var itemsHtml = "";
    $.each(order.stations || [], function (i, st) {
        $.each(st.items || [], function (j, it) {
            var itemLabel = (typeof it === "string") ? it : it.name;
            var qty = (typeof it === "object" && it !== null && it.qty) ? it.qty : 1;
            itemLabel = itemLabel.replace(/\s*x\s*\d+\s*$/i, "");

            var fromHtml = st.name
                ? '<span class="from">from <strong>' + st.name + '</strong></span>'
                : '';

            itemsHtml += '<div class="item-row">' +
                '<span><strong>' + qty + '×</strong> ' + itemLabel + '</span>' +
                fromHtml +
                '</div>';
        });
    });

    win.document.write(
        '<html><head><title>dial50.com</title><style>' +
        'body{font-family:Arial,sans-serif;padding:24px;} ' +
        '.box{border:1px solid #ccc;border-radius:8px;padding:16px;} ' +
        '.top-row{display:flex;justify-content:space-between;align-items:flex-start;} ' +
        'h1{font-size:20px;margin:0 0 4px;} .oid{font-size:12px;color:#888;margin-bottom:16px;} ' +
        '.patient-name{font-size:16px;font-weight:bold;} ' +
        '.patient-sub{font-size:12px;color:#888;margin-bottom:12px;} ' +
        '.order-id-label{font-size:11px;color:#888;text-align:right;} ' +
        '.order-id-val{font-size:12px;font-weight:bold;color:#000;text-align:right;} ' +
        '.docket-allergy{background:#fff5f5;border:1px solid #f5b5b5;color:#b91c1c;padding:10px 14px;border-radius:6px;margin:14px 0;font-size:13px;}' +
        '.docket-times{display:flex;gap:24px;margin:10px 0 6px;padding:8px 12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;color:#334155;}' +
        '.docket-times .tlabel{color:#64748b;font-weight:600;margin-right:4px;}' +
        '.items-hd{font-size:11px;font-weight:bold;color:#888;margin:16px 0 6px;text-transform:uppercase;} ' +
        '.item-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #ddd;font-size:13px;} ' +
        '.item-row span:first-child{color:#000;} ' +
        '.from{color:#111;}' +
        '</style></head><body>' +
        '<h1>Dial50 — Tray Prep Docket</h1><div class="oid">' + order.orderId + '</div>' +
        '<div class="box">' +
        '<div class="top-row">' +
        '<div><div class="patient-name">' + (order.patientName || "-") + '</div>' +
        '<div class="patient-sub">Room ' + (order.room || "-") + ' · ' + (order.meal || "-") + '</div></div>' +
        '<div><div class="order-id-label">Order ID:</div><div class="order-id-val">' + (order.orderId || "-") + '</div></div>' +
        '</div>' +
        allergyHtml +
        timestampsHtml +
        '<div class="items-hd">Items to collect (when ready)</div>' +
        itemsHtml +
        '</div>' +
        '</body></html>'
    );
    win.document.close();
    win.focus();

    var closedAlready = false;
    var closeOnce = function () {
        if (closedAlready) return;
        closedAlready = true;
        try { win.close(); } catch (e) { }
    };

    win.onafterprint = closeOnce;
    win.print();

    setTimeout(function () {
        window.addEventListener("focus", function onFocusBack() {
            window.removeEventListener("focus", onFocusBack);
            closeOnce();
        });
    }, 300);
}

function RenderPreOrderSheets(batches) {
    var $list = $("#preorderList").empty();
    if (!batches || batches.length === 0) {
        $("#preorderEmptyState").show();
        return;
    }
    $("#preorderEmptyState").hide();

    var mealIcon = {
        Breakfast: '<img src="' + ASM_IMG + 'coffee.png" class="meal-icon" />',
        Lunch: '<img src="' + ASM_IMG + 'steak.png" class="meal-icon" />',
        Dinner: '<img src="' + ASM_IMG + 'soup.png" class="meal-icon" />'
    };

    $.each(batches, function (i, b) {
        PreOrderDocketCache[b.batchId] = b;
        var hasPatients = b.patientCount > 0;

        var statusHtml = b.locked
            ? '<span class="status-pill-locked"><img src="' + ASM_IMG + 'lock.png" class="aicon aicon-sm aicon-green" alt="" /> Locked</span>'
            : '<span class="status-pill-open">Open</span>';

        var bannerHtml = b.locked
            ? '<div class="preorder-locked-banner"><img src="' + ASM_IMG + 'notification.png" class="aicon aicon-sm" alt="" /> New batch ready. ' + b.patientCount + ' pre-orders are locked. Production can begin. Locked ' + b.lockedAt + '</div>'
            : '';

        var stationsHtml = "";
        if (hasPatients && b.stations && b.stations.length) {
            $.each(b.stations, function (j, s) {
                stationsHtml += '<div class="preorder-station-stat"><div class="stat-label-sm">' + s.name.toUpperCase() + '</div><div class="stat-value-lg">' + s.count + '</div><div class="stat-value-sub">' + s.sub + '</div></div>';
            });
            stationsHtml = '<div class="preorder-station-summary">' + stationsHtml + '</div>';
        }

        var viewPatientsHtml = "";
        var patientsListHtml = "";
        if (hasPatients) {
            viewPatientsHtml = '<div class="preorder-view-patients togglePatientsBtn" data-batch="' + b.batchId + '">' +
                '<span class="caret-triangle"></span> View ' + b.patientCount + ' patient' + (b.patientCount > 1 ? "s" : "") + '</div>';

            var rows = "";
            $.each(b.patients, function (k, p) {
                rows += '<div class="preorder-patient-row">' +
                    '<div><strong>' + p.name + '</strong> <span class="preorder-patient-room">Rm ' + p.room + '</span>' +
                    '<div class="preorder-patient-items">' + p.items.join(", ") + '</div></div>' +
                    (p.allergies ? '<div class="preorder-patient-allergy"><img src="' + ASM_IMG + 'alert.png" class="aicon aicon-sm aicon-red" alt="" /> ' + p.allergies + '</div>' : '') +
                    '</div>';
            });
            patientsListHtml = '<div class="preorder-patients-list" id="patients_' + b.batchId + '" style="display:none;">' + rows + '</div>';
        }

        var closeInfo = b.locked
            ? (b.closedAgo ? '<span><img src="' + ASM_IMG + 'clock.png" class="aicon aicon-sm" alt="" /> Closed ' + b.closedAgo + '</span>' : '')
            : (b.closesIn ? '<span><img src="' + ASM_IMG + 'clock.png" class="aicon aicon-sm" alt="" /> Closes in ' + b.closesIn + '</span>' : '');

        var printDisabled = hasPatients ? "" : "disabled";
        var lockDisabled = hasPatients ? "" : "disabled";

        var $card = $(
            '<div class="preorder-card-v2 ' + (b.locked ? "locked-highlight" : "") + '">' +
            '  <div class="preorder-card-v2-head">' +
            '    <div style="display:flex;gap:14px;">' +
            '      <div class="preorder-icon-circle">' + (mealIcon[b.mealType] || "🍽") + '</div>' +
            '      <div>' +
            '        <div class="preorder-card-v2-title">' + b.mealType + ' &middot; ' + b.mealDateDisplay + '</div>' +
            '        <div class="preorder-card-v2-sub">' +
            '            <span><span class="person-circle"><img src="' + ASM_IMG + 'person.png" class="aicon aicon-sm" alt="" /></span> ' + b.patientCount + ' patients</span>' +
            '            <span><img src="' + ASM_IMG + 'cube.png" class="aicon aicon-sm" alt="" /> ' + b.itemCount + ' items</span>' +
            closeInfo +
            '        </div>' +
            '    </div>' +
            statusHtml +
            '  </div>' +
            bannerHtml + stationsHtml + viewPatientsHtml + patientsListHtml +
            '  <div style="margin-top:14px;">' +
            '  <button type="button" class="btn-assembler-outline printAllDocketsBtn" ' + printDisabled + ' data-id="' + b.batchId + '"><img src="' + ASM_IMG + 'printer.png" class="aicon aicon-sm" alt="" /> Print all dockets</button>' +
            (!b.locked ? ' <button type="button" class="btn-assembler-outline lockNowBtn" ' + lockDisabled + ' data-id="' + b.batchId + '" data-mealtype="' + b.mealType + '" data-mealdate="' + b.mealDate + '"><img src="' + ASM_IMG + 'lock.png" class="aicon aicon-sm" alt="" /> Lock now</button>' : '') +
            '  </div>' +
            '</div>'
        );
        $list.append($card);
    });

    $(".printAllDocketsBtn").off("click").on("click", function () {
        if ($(this).prop("disabled")) return;
        PrintAllDockets($(this).data("id"));
    });
    $(".lockNowBtn").off("click").on("click", function () {
        if ($(this).prop("disabled")) return;
        OpenLockBatchModal($(this).data("mealdate"), $(this).data("mealtype"));
    });
    $(".togglePatientsBtn").off("click").on("click", function () {
        var batchId = $(this).data("batch");
        var $target = $("#patients_" + batchId);
        var $caret = $(this).find(".caret-triangle");
        $target.slideToggle(150);
        $caret.toggleClass("open");
    });
}

function GroupPreOrderSheets(rows) {
    function formatYMD(d) {
        var y = d.getFullYear();
        var m = ("0" + (d.getMonth() + 1)).slice(-2);
        var day = ("0" + d.getDate()).slice(-2);
        return y + "-" + m + "-" + day;
    }

    function parseDateOnly(value) {
        if (!value) return new Date();
        if (value instanceof Date) return value;
        var str = String(value);
        var datePart = str.split("T")[0].split(" ")[0];
        var parts = datePart.split("-");
        if (parts.length === 3) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
        var d = new Date(str);
        return isNaN(d.getTime()) ? new Date() : d;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    var mealTypes = ["Breakfast", "Lunch", "Dinner"];
    var dates = [yesterday, today];

    var map = {};
    var order = [];

    $.each(dates, function (d, dateObj) {
        $.each(mealTypes, function (m, mealType) {
            var ymd = formatYMD(dateObj);
            var key = mealType + "_" + ymd;
            map[key] = {
                batchId: key,
                mealType: mealType,
                mealDate: ymd,
                mealDateDisplay: ymd,
                mealDateSort: dateObj,
                patientCount: 0,
                itemCount: 0,
                locked: false,
                lockedAt: "",
                closedAgo: "",
                closesIn: "",
                stations: [],
                patients: [],
                _patients: {},
                _stations: {}
            };
            order.push(key);
        });
    });

    $.each(rows || [], function (i, r) {
        var mealType = GetVal(r, ["MEALTYPE", "MEAL_TYPE", "MEALNAME"]) || "General";
        var mealDateRaw = GetVal(r, ["ORDERDATE", "MEALDATE", "PREORDERDATE", "PLANDATE", "REQUESTDATE"]);
        var mealDateObj = parseDateOnly(mealDateRaw);
        var key = mealType + "_" + formatYMD(mealDateObj);

        if (!map[key]) return;

        var batch = map[key];

        var roomNo = GetVal(r, ["ROOMNO", "ROOM_NO", "ROOM"]) || "-";
        var patientName = GetVal(r, ["PATIENTNAME", "PATIENT_NAME"]) || "Unknown";
        var stationName = GetVal(r, ["MEALTYPE", "MEAL_TYPE", "MEALNAME"]) || "General";
        var itemName = GetVal(r, ["ITEMNAME", "ITEM_NAME"]) || "Item";
        var qty = GetVal(r, ["QUANTITY", "QTY"]) || 1;
        var allergies = GetVal(r, ["ALLERGIES", "ALLERGY"]) || "";
        var isLockedRaw = GetVal(r, ["ISLOCKED", "LOCKED"]);
        var lockedAt = GetVal(r, ["LOCKEDAT", "LOCKED_AT"]);
        var closedAgo = GetVal(r, ["CLOSEDAGO", "CLOSED_AGO"]);
        var closesIn = GetVal(r, ["CLOSESIN", "CLOSES_IN"]);

        batch.itemCount++;

        if (!batch._patients[roomNo + "_" + patientName]) {
            batch._patients[roomNo + "_" + patientName] = {
                name: patientName,
                room: roomNo,
                allergies: allergies,
                items: []
            };
            batch.patientCount++;
        }
        batch._patients[roomNo + "_" + patientName].items.push(qty + "× " + itemName);

        if (!batch._stations[stationName]) {
            batch._stations[stationName] = { name: stationName, count: 0, sub: "" };
        }
        batch._stations[stationName].count++;

        batch.locked = (isLockedRaw === true || isLockedRaw === 1 || isLockedRaw === "1" ||
            (typeof isLockedRaw === "string" && isLockedRaw.toLowerCase() === "true"));
        batch.lockedAt = lockedAt || batch.lockedAt;
        batch.closedAgo = closedAgo || batch.closedAgo;
        batch.closesIn = closesIn || batch.closesIn;
    });

    var result = [];
    $.each(order, function (i, key) {
        var batch = map[key];

        $.each(batch._stations, function (x, st) {
            st.sub = st.count + (st.count === 1 ? " tray" : " trays");
            batch.stations.push(st);
        });
        $.each(batch._patients, function (x, p) {
            batch.patients.push(p);
        });

        delete batch._patients;
        delete batch._stations;

        result.push(batch);
    });

    return result;
}

var PreOrderDocketCache = {};

function PrintAllDockets(batchId) {
    var batch = PreOrderDocketCache[batchId];
    if (!batch || !batch.patients || batch.patients.length === 0) {
        alert("No patient orders to print for this batch.");
        return;
    }

    var win = window.open("", "_blank");
    var now = new Date();
    var dateStr = (now.getMonth() + 1) + "/" + now.getDate() + "/" + (now.getFullYear() % 100) + ", " +
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    var statusInfo = batch.locked
        ? ("Locked " + (batch.lockedAt || ""))
        : (batch.closesIn ? ("Closes in " + batch.closesIn) : "Open");

    var stationRowsHtml = "";
    $.each(batch.stations || [], function (i, s) {
        stationRowsHtml += '<tr><td>' + s.name + '</td><td>' + s.count + '</td><td>' + s.count + '</td></tr>';
    });

    var patientsHtml = "";
    $.each(batch.patients, function (i, p) {
        var allergyHtml = p.allergies
            ? '<div class="docket-allergy"><span class="allergy-icon">&#9888;</span> <strong>Allergies:</strong> ' + p.allergies + '</div>'
            : '';
        var itemsHtml = "";
        $.each(p.items, function (j, it) {
            it = it.replace(/^(\d+x?)/i, '<strong>$1</strong>');
            itemsHtml += '<div>' + it + '</div>';
        });

        patientsHtml += '<div class="patient-card">' +
            '<div class="patient-card-head">' +
            '<strong>' + p.name + '</strong>' +
            '<div class="diet-block"><div class="diet-label">Diet:</div><div class="diet-value">' + (p.diet || "&mdash;") + '</div></div>' +
            '</div>' +
            '<div class="patient-card-room">Room ' + p.room + ' &middot; ' + batch.mealType + ' &middot; ' + batch.mealDateDisplay + '</div>' +
            allergyHtml +
            '<div class="items-label">ITEMS</div>' +
            '<div class="items-list">' + itemsHtml + '</div>' +
            '</div>';
    });

    win.document.write(
        '<html><head><title>Dial50 - ' + batch.mealType + ' ' + batch.mealDateDisplay + '</title><style>' +
        'body{font-family:Arial,sans-serif;padding:24px;color:#1f2937;} ' +
        '.hd{display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:16px;} ' +
        'h1{font-size:22px;margin:0 0 4px;} ' +
        '.sub{font-size:13px;color:#666;margin-bottom:20px;} ' +
        'h2{font-size:15px;margin:20px 0 8px;} ' +
        'table{width:100%;border-collapse:collapse;margin-bottom:20px;} ' +
        'table th, table td{text-align:left;padding:8px 4px;border-bottom:1px solid #eee;font-size:13px;} ' +
        'table th{color:#888;font-weight:600;} ' +
        'table td:nth-child(2){font-weight:700;color:#111;} ' +
        'table td:nth-child(3){color:#2563eb;} ' +
        '.patient-card{border:1px solid #ccc;border-radius:10px;padding:16px 18px;margin-bottom:14px;} ' +
        '.patient-card-head{display:flex;justify-content:space-between;align-items:flex-start;} ' +
        '.patient-card-head strong{font-size:16px;} ' +
        '.diet-block{text-align:right;}' +
        '.diet-label{font-size:11px;color:#888;}' +
        '.diet-value{font-size:12px;color:#333;}' +
        '.patient-card-room{font-size:12px;color:#888;margin:2px 0 10px;} ' +
        '.docket-allergy{background:#fff5f5;border:1px solid #f5b5b5;color:#b91c1c;padding:8px 12px;border-radius:6px;margin-bottom:10px;font-size:13px;} ' +
        '.items-label{font-size:11px;font-weight:700;letter-spacing:.03em;color:#888;margin-bottom:6px;text-transform:uppercase;} ' +
        '.items-list div{font-size:13px;color:#111;margin-bottom:4px;} ' +
        '.items-list div strong{color:#111;} ' +
        '</style></head><body>' +
        '<div class="hd"><span>' + dateStr + '</span><span>dial50.com</span></div>' +
        '<h1>Dial50 &mdash; Pre-order Sheet</h1>' +
        '<div class="sub">' + batch.mealType + ' &middot; ' + batch.mealDateDisplay + ' &middot; ' + batch.patientCount + ' patients &middot; ' + batch.itemCount + ' items &middot; ' + statusInfo + '</div>' +
        '<h2>Station Roll-up</h2>' +
        '<table><thead><tr><th>Station</th><th>Items</th><th>Trays</th></tr></thead><tbody>' + stationRowsHtml + '</tbody></table>' +
        patientsHtml +
        '</body></html>'
    );
    win.document.close();
    win.focus();

    var closedAlready = false;
    var closeOnce = function () {
        if (closedAlready) return;
        closedAlready = true;
        try { win.close(); } catch (e) { }
    };

    win.onafterprint = closeOnce;
    win.print();

    setTimeout(function () {
        window.addEventListener("focus", function onFocusBack() {
            window.removeEventListener("focus", onFocusBack);
            closeOnce();
        });
    }, 300);
}

function OpenLockBatchModal(mealDate, mealType) {
    $("#hdnLockMealDate").val(mealDate);
    $("#hdnLockMealType").val(mealType);
    $("#lockBatchModal").addClass("show");
}

function CloseLockBatchModal() {
    $("#lockBatchModal").removeClass("show");
    $("#hdnLockMealDate").val("");
    $("#hdnLockMealType").val("");
}

function ConfirmLockBatch() {
    var mealDate = $("#hdnLockMealDate").val();
    var mealType = $("#hdnLockMealType").val();
    if (!mealDate || !mealType) return;

    $("#loader").show();

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("LOCKBATCH")) +
        "&MEALDATE=" + encodeURIComponent(Encrypt(mealDate)) +
        "&MEALTYPE=" + encodeURIComponent(Encrypt(mealType));

    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        timeout: 30000,
        success: function (res) {
            $("#loader").hide();
            var result = res && res[0] ? res[0].RESULT : "";
            if (String(result).toUpperCase() === "TRUE") {
                CloseLockBatchModal();
                ShowAssemblerAlert(mealType + " batch locked — kitchen notified.");
                loadPreOrderSheets();
            } else {
                alert("Failed to lock batch");
            }
        },
        error: function (xhr, status, error) {
            $("#loader").hide();
            if (status !== "timeout" && status !== "abort") {
                console.log(error);
            }
            CloseLockBatchModal();
            alert("Ajax error");
        }
    });
}

function ShowAssemblerAlert(message) {
    var $alert = $("#assemblerAlert");
    $alert.stop(true, true)
        .html('<span>&#10003;</span> <span>' + message + '</span>')
        .show();

    setTimeout(function () {
        $alert.fadeOut(400);
    }, 3000);
}

function LoadAssemblyPass(onDone) {
    $("#loader").show();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETASSEMBLYQUEUE"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 30000,
        success: function (response) {
            $("#loader").hide();
            var items = GroupAssemblyQueue(response || []);
            RenderAssemblyPass(items);
            if (onDone) onDone();
        },
        error: function (xhr, status, error) {
            $("#loader").hide();
            if (status !== "timeout" && status !== "abort") {
                console.log(error);
            }
            RenderAssemblyPass([]);
            if (onDone) onDone();
        }
    });
}

function GroupAssemblyQueue(rows) {
    if (!rows || rows.length === 0) return [];

    var orders = {};

    $.each(rows, function (i, row) {
        var orderId = GetVal(row, ["ORDERID", "ORDER_ID"]);
        if (orderId === null) return;

        if (!orders[orderId]) {
            orders[orderId] = {
                orderId: orderId,
                patientName: GetVal(row, ["PATIENTNAME", "PATIENT_NAME"]) || "Unknown",
                room: FormatRoom(GetVal(row, ["ROOMNO", "ROOM_NO", "ROOM"])),
                meal: GetVal(row, ["MEALTYPE", "MEAL_TYPE"]) || "-",
                allergy: GetVal(row, ["ALLERGIES", "ALLERGY"]) || "",
                status: GetVal(row, ["STATUS"]) || "Ready",
                placedTime: GetVal(row, ["PLACEDTIME", "PLACED_TIME"]),
                receivedTime: GetVal(row, ["RECEIVEDTIME", "RECEIVED_TIME", "ASSEMBLINGTIME"]),
                stations: [],
                _stations: {}
            };
        }

        var order = orders[orderId];
        var itemName = GetVal(row, ["ITEMNAME", "ITEM_NAME"]) || "Item";
        var qty = GetVal(row, ["QUANTITY", "QTY"]) || 1;

        var stationName = GetVal(row, ["STATIONNAME", "STATION_NAME", "STATION", "CATEGORYNAME", "CATEGORY"])
            || CategorizeFoodItem(itemName);
        stationName = stationName.toUpperCase();

        if (!order._stations[stationName]) {
            order._stations[stationName] = { name: stationName, items: [] };
            order.stations.push(order._stations[stationName]);
        }

        order._stations[stationName].items.push(qty + "× " + itemName);
    });

    var result = [];

    $.each(orders, function (id, order) {
        delete order._stations;
        result.push(order);
    });

    return result;
}

$(document).off("click.assemblyPrintDocket", ".printAssemblyDocketBtn").on("click.assemblyPrintDocket", ".printAssemblyDocketBtn", function (e) {
    e.preventDefault();

    var orderId = $(this).attr("data-id");

    PrintDocket(orderId);
});
function RenderAssemblyPass(items) {
    var $list = $("#assemblyList").empty();
    if (!items || items.length === 0) {
        $("#assemblyEmptyState").show();
        return;
    }
    $("#assemblyEmptyState").hide();
    AssemblyDocketCache = {};

    var $sectionLabel = $(
        '<div class="assembly-section-label">' +
        '  <div class="assembly-section-icon"><img src="' + ASM_IMG + 'charge.png" class="aicon aicon-md aicon-orange" alt="" /></div>' +
        '  <div><strong>INSTANT ORDERS (WALK-UP)</strong><div style="font-size:12px;color:var(--assembler-text-muted);">Same-day requests — assemble as they come in.</div></div>' +
        '  <span class="assembly-section-count">' + items.length + '</span>' +
        '</div>'
    );
    $list.append($sectionLabel);

    $.each(items, function (i, o) {
        AssemblyDocketCache[o.orderId] = o;

        var stationsHtml = "";
        $.each(o.stations, function (j, st) {
            var itemsHtml = "";
            $.each(st.items, function (k, it) {
                itemsHtml += '<div class="assembly-station-item"><img src="' + ASM_IMG + 'check-mark.png" class="aicon aicon-sm aicon-green" alt="" />' + it + '</div>';
            });
            stationsHtml += '<div class="assembly-station-box"><div class="order-station-box-head">' + st.name + ' &middot; Cooking Station</div>' + itemsHtml + '</div>';
        });

        var isAssembling = ((o.status || "") + "").trim().toLowerCase() === "assembling";
        var badgeHtml = isAssembling
            ? '<span class="badge-assembling"><img src="' + ASM_IMG + 'cube.png" class="aicon aicon-sm aicon-teal" alt="" /> Assembling</span>'
            : '<span class="badge-ready">Ready</span>';

        var $card = $(
            '<div class="assembly-card">' +
            '  <div class="order-card-head">' +
            '    <div class="order-card-left">' +
            '      <div class="order-avatar"><img src="' + ASM_IMG + 'person.png" class="aicon aicon-md" alt="" /></div>' +
            '      <div>' +
            '        <div><span class="order-badge-instant"><img src="' + ASM_IMG + 'charge.png" class="aicon aicon-sm aicon-orange" alt="" /> INSTANT</span><span class="tag-pill" style="margin-right:8px;">' + o.orderId + '</span><span class="order-patient-name">' + o.patientName + '</span></div>' +
            '        <div class="order-sub-meta"><img src="' + ASM_IMG + 'pin.png" class="aicon aicon-sm" alt="" /> ' + o.room + ' &middot; ' + o.meal + '</div>' +
            '      </div>' +
            '    </div>' +
            '    ' + badgeHtml +
            '  </div>' +
            '  <div class="order-station-grid" style="margin-top:14px;">' + stationsHtml + '</div>' +
            '  <div style="display:flex;gap:10px;margin-top:14px;">' +
            ((o.status || "").toLowerCase() === "assembling"
                ? '<button type="button" class="btn-print-docket printAssemblyDocketBtn" data-id="' + o.orderId + '">' +
                '<img src="' + ASM_IMG + 'printer.png" class="aicon aicon-sm" alt="" /> Print docket</button>'
                : '') +
            (isAssembling ? '' : '    <button type="button" class="btn-start-assembly startAssemblyBtn" data-id="' + o.orderId + '"><img src="' + ASM_IMG + 'cube.png" class="aicon aicon-sm" alt="" /> Start assembly</button>') +
            '    <button type="button" class="btn-ready-deliver sendToDeliveryBtn" data-id="' + o.orderId + '"><img src="' + ASM_IMG + 'truck.png" class="aicon aicon-sm aicon-white" alt="" /> Ready to deliver</button>' +
            '  </div>' +
            '</div>'
        );
        $list.append($card);
    });



    $(".startAssemblyBtn").off("click").on("click", function () {
        var $btn = $(this);
        var orderId = $btn.data("id");
        var $card = $btn.closest(".assembly-card");

        $btn.prop("disabled", true).css("opacity", "0.6");

        var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("UPDATEFOODORDERSTATUSFORASSEMBLY")) +
            "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
            "&STATUS=" + encodeURIComponent(Encrypt("Assembling"));

        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            timeout: 30000,
            success: function () {
                if (AssemblyDocketCache[orderId]) {
                    AssemblyDocketCache[orderId].status = "Assembling";
                }

                $card.find(".badge-ready, .badge-assembling").replaceWith(
                    '<span class="badge-assembling">Assembling</span>'
                );
                $btn.remove();
                if ($card.find(".printAssemblyDocketBtn").length === 0) {
                    var printButton =
                        '<button type="button" class="btn-print-docket printAssemblyDocketBtn" data-id="' +
                        orderId + '">' +
                        '<img src="' + ASM_IMG +
                        'printer.png" class="aicon aicon-sm" alt="" /> Print docket</button>';

                    $card.find(".sendToDeliveryBtn").before(printButton);
                }
            },
            error: function (xhr, status, error) {
                if (status !== "timeout" && status !== "abort") {
                    console.log(error);
                }
                $btn.prop("disabled", false).css("opacity", "1");
                alert("Could not start assembly. Please try again.");
            }
        });
    });

    $(".sendToDeliveryBtn").off("click").on("click", function () {
        var orderId = $(this).data("id");
        var $card = $(this).closest(".assembly-card");
        SendToDelivery(orderId, $card);
    });
}

function SendToDelivery(orderId, $card) {
    $("#loader").show();

    var userId = sessionStorage.getItem('ID') || '';

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("SENDTODELIVERY")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
        "&USERID=" + encodeURIComponent(Encrypt(userId));

    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        timeout: 30000,
        success: function () {
            $("#loader").hide();
            delete AssemblyDocketCache[orderId];
            if ($card && $card.length) $card.remove();
            LoadAssemblyPass();
        },
        error: function (xhr, status, error) {
            $("#loader").hide();
            if (status !== "timeout" && status !== "abort") {
                console.log(error);
            }
            LoadAssemblyPass();
        }
    });
}

function Encrypt(Value) {
    var key = CryptoJS.enc.Utf8.parse(CryptoKey);
    var iv = CryptoJS.enc.Utf8.parse(CryptoPwd);

    var encryptedVal = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(Value), key,
        {
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