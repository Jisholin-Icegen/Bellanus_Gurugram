
function LoadDietTypeDropdown() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDIETTYPEDROPDOWN"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            $("#ddlDietType").empty();
            $("#ddlDietType").append('<option value="">All Diet Types</option>');
            $.each(res, function (i, item) {
                $("#ddlDietType").append('<option value="' + item.CODE + '">' + item.NAME + '</option>');
            });

            if ($("#ddlDietType")[0].sumo) {
                $("#ddlDietType")[0].sumo.reload();
            }
        }
    });
}
function LoadServingDropdown() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETSERVINGDROPDOWN"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {

            $("#ddlServing").empty();
            $("#ddlServing").append('<option value="">All Servings</option>');

            $.each(res, function (i, item) {
                $("#ddlServing").append(
                    '<option value="' + item.CODE + '">' +
                    item.NAME +
                    '</option>'
                );

            });

            if ($("#ddlServing")[0].sumo) {
                $("#ddlServing")[0].sumo.reload();
            }

        }
    });
}

function LoadOrderReports() {

    var planDate = $("#txtPlanDate").val();
    var dietType = $("#ddlDietType").val();
    var servingType = $("#ddlServing").val();
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETKITCHENORDERREPORT")) +
        "&PLANDATE=" + encodeURIComponent(Encrypt(planDate)) +
        "&DIETTYPE=" + encodeURIComponent(Encrypt(dietType)) +
        "&SERVINGTYPE=" + encodeURIComponent(Encrypt(servingType));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            $("#foodSlider").empty();
            $("#tblKitchenSummaryBody").empty();
            var dt = new Date(planDate);
            $("#lblPlanDate").html("Plan for <b>" + dt.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            }) +
                "</b>"
            );

            $(".table-header span").text(
                "For " +
                dt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                })
            );

            if (!res || res.length == 0) {
                $(".summary-green").text("0 orders");
                $(".summary-yellow").text("0 unique items");
                $("#foodSlider").html(
                    '<div class="empty-food-state">' +
                    '<i class="fa-solid fa-utensils"></i>' +
                    '<h3>No prep required for this date / meal</h3>' +
                    '<p>No non-cancelled orders match this filter.</p>' +
                    '</div>'
                );
                $("#tblKitchenSummaryBody").html(
                    '<tr>' +
                    '<td colspan="5" class="empty-table-state">' +
                    'No items to prepare.' +
                    '</td>' +
                    '</tr>'
                );
                return;
            }
            var totalOrders = 0;
            $.each(res, function (i, item) {
                totalOrders += parseInt(item.ORDERCOUNT || 0);
                var dietTags = "";
                var cardTags = "";
                if (item.DIETTAGS && item.DIETTAGS != "") {
                    var tags = item.DIETTAGS.split(',');
                    for (var t = 0; t < Math.min(3, tags.length); t++) {
                        dietTags += '<span class="tag">' + tags[t].trim() + '</span>';
                        cardTags += '<span>' + tags[t].trim() + '</span>';
                    }
                    if (tags.length > 3) {
                        var extra = tags.length - 3;
                        cardTags += '<span class="more-tag">+' + extra + '</span>';
                    }
                }
                var allergens = item.ALLERGENS;
                if (!allergens || allergens == "")
                    allergens = "None";
                var allergenCard = "";
                if (allergens != "None") {
                    allergenCard = '<div class="allergen-card">' +
                        '<b>ALLERGENS:</b> ' + allergens +
                        '</div>';
                }
                var allergenTable;
                if (allergens == "None") {
                    allergenTable = '<span class="allergen-none">None</span>';
                }
                else {
                    allergenTable = '<span class="allergen-pill">' + allergens + '</span>';
                }
                $("#foodSlider").append(
                    '<div class="food-card">' +
                    '<small>' + item.MEALTYPE + '</small>' +
                    '<h3>' + item.ITEMNAME + '</h3>' +
                    '<div class="qty">' +
                    item.TOTALQTY +
                    '<span> portions</span>' +
                    '</div>' +
                    '<div class="tags">' +
                    cardTags +
                    '</div>' +
                    allergenCard +
                    '</div>'
                );
                $("#tblKitchenSummaryBody").append(
                    '<tr>' +
                    '<td>' + item.ITEMNAME + '<small>' + item.MEALTYPE + '</small>' + '</td>' +
                    '<td>' + item.TOTALQTY + '</td>' +
                    '<td>' + item.ORDERCOUNT + '</td>' +
                    '<td>' + dietTags + '</td>' +
                    '<td>' + allergenTable + '</td>' +
                    '</tr>'
                );
            });
            $(".summary-green").text(totalOrders + " orders");
            $(".summary-yellow").text(res.length + " unique items");
        }
    });
}

$(document).on("click", "#btnExportCSV", function (e) {
    e.preventDefault();
    ExportKitchenSummary();
});

function ExportKitchenSummary() {
    var selectedDate = $("#txtPlanDate").val() || "report";

    var workbook = new ExcelJS.Workbook();
    var worksheet = workbook.addWorksheet('Kitchen Report');

    worksheet.columns = [
        { header: 'Item', key: 'item', width: 25 },
        { header: 'Meal Type', key: 'meal', width: 15 },
        { header: 'Total Qty', key: 'qty', width: 12 },
        { header: 'Order Count', key: 'orders', width: 12 },
        { header: 'Diet Name', key: 'diet', width: 25 },
        { header: 'Allergens', key: 'allergens', width: 20 }
    ];

    var headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00A86B' } 
        };
        cell.font = {
            color: { argb: 'FFFFFFFF' },
            bold: true,
            size: 11
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    $("#tblKitchenSummaryBody tr").each(function () {
        if ($(this).find(".empty-table-state").length > 0) return;

        var item = $.trim($(this).find("td:eq(0)").contents().filter(function () {
            return this.nodeType === 3;
        }).text());
        var meal = $.trim($(this).find("td:eq(0) small").text());
        var qty = $.trim($(this).find("td:eq(1)").text());
        var orders = $.trim($(this).find("td:eq(2)").text());

        var dietArr = [];
        $(this).find("td:eq(3) span.tag").each(function () {
            dietArr.push($(this).text().trim());
        });
        var diet = dietArr.join("; ");

        var allergenArr = [];
        var allergenCell = $(this).find("td:eq(4)");

        if (allergenCell.find(".allergen-pill").length > 0) {
            allergenCell.find(".allergen-pill").each(function () {
                allergenArr.push($(this).text().trim());
            });
        } else {
            var plainText = allergenCell.text().trim();
            if (plainText.toLowerCase() !== "none") {
                allergenArr.push(plainText);
            }
        }
        var allergens = allergenArr.join("; ");

        worksheet.addRow({
            item: item,
            meal: meal,
            qty: qty,
            orders: orders,
            diet: diet,
            allergens: allergens
        });
    });

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            });
        }
    });

    workbook.xlsx.writeBuffer().then(function (buffer) {
        var blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "kitchen-report-" + selectedDate + ".xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function getKitchenReportRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '').toString();
}

function LoadNotifications() {
    var roleId = getKitchenReportRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20"));

    if (roleId) {
        url += "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    }

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
    var roleId = getKitchenReportRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(NotificationID));

    if (roleId) {
        url += "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    }

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
    var roleId = getKitchenReportRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS"));

    if (roleId) {
        url += "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    }

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
    var roleId = getKitchenReportRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD"));

    if (roleId) {
        url += "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    }

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
