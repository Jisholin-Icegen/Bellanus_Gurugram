

var globalServingData = []; 
var smPageSize = 10;
var smPageIndex = 1;
var smEditingId = null;
var smPendingDeleteId = null;



function LoadServingList() {
    var searchText = $("#txtSearchServing").val().trim();
    var showInactiveValue = $("#chkShowInactive").is(":checked") ? "2" : "1";

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETSERVINGDATA")) +
        "&SEARCH=" + encodeURIComponent(Encrypt(searchText)) +
        "&INACTIVE=" + encodeURIComponent(Encrypt(showInactiveValue));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            globalServingData = res || [];
            RenderServingGrid();
        },
        error: function () {
            console.error("Ajax Error while loading list.");
        }
    });
}
function previewImage(input) {

    if (!input.files || input.files.length === 0) {
        $("#lblFileName").text("");
        $("#imgPreview").hide().attr("src", "");
        $("#iconPlaceholder").show();
        return;
    }
    var file = input.files[0];
    $("#lblFileName").text(file.name);
    var reader = new FileReader();
    reader.onload = function (e) {
        $("#imgPreview").attr("src", e.target.result).show();
        $("#iconPlaceholder").hide();
    };

    reader.readAsDataURL(file);
}
function RenderServingGrid() {
    var totalRecords = globalServingData.length;
    var totalPages = Math.max(1, Math.ceil(totalRecords / smPageSize));
    var startIdx = (smPageIndex - 1) * smPageSize;
    var pageRows = globalServingData.slice(startIdx, startIdx + smPageSize);

    $("#tblServingBody").empty();

    if (pageRows.length > 0) {
        $.each(pageRows, function (i, item) {
            var statusHtml = (item.ISACTIVE == 1)
                ? '<span class="status-active">Active</span>'
                : '<span class="status-inactive">Inactive</span>';

            var rowHtml = '<tr>' +
                '<td>' + (startIdx + i + 1) + '</td>' +
                '<td>' +
                '<div style="display: flex; align-items: center;">' +
                '<span class="sm-cat-pill">' + (item.CATEGORYCODE || "") + '</span>' +
                '<span style="font-weight: 600; color: #374151;">' + (item.CATEGORYNAME || "") + '</span>' +
                '</div>' +
                '</td>' +
                '<td class="sm-name-main">' + (item.SERVINGNAME || "") + '</td>' +
                '<td>' + (item.STARTTIME || "") + ' - ' + (item.ENDTIME || "") + '</td>' +
                '<td>' + statusHtml + '</td>' +
                '<td class="sm-updated">' + (item.UPDATEDON || "") + '</td>' +
                '<td class="action-col" style="text-align: left; white-space: nowrap;">' +
                '<button type="button" class="action-btn" onclick="EditServing(' + item.ID + ')" title="Edit">' +
                '<img src="../images/memo.png" />' +
                '</button>' +
                '<button type="button" class="action-btn" onclick="PrepareDelete(' + item.ID + ')" title="Delete">' +
                '<img src="../images/delete.png" />' +
                '</button>' +
                '</td>' +
                '</tr>';

            $("#tblServingBody").append(rowHtml);
        });
    } else {
        $("#tblServingBody").append('<tr><td colspan="7" style="text-align:center;padding:30px;">No serving records found</td></tr>');
    }

    RenderServingPagination(totalRecords, totalPages);
}

function CreateNewServing() {
    var catCode = $("#txtCategoryCode").val().trim();
    var catName = $("#txtCategoryName").val().trim();
    var servingName = $("#txtServingName").val().trim();
    var startTime = $("#startTimeTrigger .display-time").text().trim();
    var endTime = $("#endTimeTrigger .display-time").text().trim();

    // Get the icon file
    var iconFile = document.getElementById('fileIconUpload').files[0];

    var isActive = $("#chkServingActive").is(":checked") ? "1" : "2";
    var Action = ($("#servingModalHeader").text().trim() === "Add New Serving") ? "INSERT" : "UPDATE";
    var Id = $("#HFServingID").val() || "0";

    var isValid = true;
    $(".validation-error").text('');
    $(".sm-input").removeClass("error-border");

    if (catCode.length == 0) { $("#txtCategoryCode").addClass("error-border"); isValid = false; }
    if (catName.length == 0) { $("#txtCategoryName").addClass("error-border"); isValid = false; }
    if (servingName.length == 0) { $("#txtServingName").addClass("error-border"); isValid = false; }

    if (startTime == "Select time" || endTime == "Select time") {
        alert("Please select both Start and End times.");
        isValid = false;
    }

    if (!isValid) return false;

    // YOUR EXACT URL FORMAT
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("INSERTUPDATESERVING")) +
        "&CATCODE=" + encodeURIComponent(Encrypt(catCode)) +
        "&CATNAME=" + encodeURIComponent(Encrypt(catName)) +
        "&SERVINGNAME=" + encodeURIComponent(Encrypt(servingName)) +
        "&STARTTIME=" + encodeURIComponent(Encrypt(startTime)) +
        "&ENDTIME=" + encodeURIComponent(Encrypt(endTime)) +
        "&ACTION=" + encodeURIComponent(Encrypt(Action)) +
        "&ISACTIVE=" + encodeURIComponent(Encrypt(isActive)) +
        "&ID=" + encodeURIComponent(Encrypt(Id));

    // Prepare File Data
    var formData = new FormData();
    if (iconFile) {
        formData.append("ICON_FILE", iconFile);
    }

    $.ajax({
        url: url,
        type: "POST", // Must be POST to send a file
        data: formData,
        processData: false, // Tell jQuery not to process the file
        contentType: false, // Tell jQuery not to set contentType
        success: function (res) {
            var data = (typeof res === "string") ? JSON.parse(res) : res;
            if (data && data[0].RESULT == "TRUE") {
                HideModalPopUp("servingModal");

                // Clear the icon preview
                $("#imgPreview").hide();
                $("#iconPlaceholder").show();
                $("#fileIconUpload").val('');

                setTimeout(function () {
                    $('#LBLRequestResult').html('Serving ' + (Action === "INSERT" ? 'created' : 'updated') + ' successfully.');
                    ShowModalPopUp('modalSuccess');
                    setTimeout(function () { HideModalPopUp('modalSuccess'); }, 2500);
                }, 300);
                LoadServingList();
            } else {
                alert("Error: " + (data[0].MSG || "Operation failed"));
            }
        },
        error: function () { alert("Ajax Error during save"); }
    });
}

function EditServing(id) {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETSERVINGBYID")) +
        "&ID=" + encodeURIComponent(Encrypt(id.toString()));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var s = res[0];
                $("#HFServingID").val(id);
                $("#txtCategoryCode").val(s.CATEGORYCODE);
                $("#txtCategoryName").val(s.CATEGORYNAME);
                $("#txtServingName").val(s.SERVINGNAME);
                $("#startTimeTrigger .display-time").text(s.STARTTIME || "Select time");
                $("#endTimeTrigger .display-time").text(s.ENDTIME || "Select time");
                $("#chkServingActive").prop("checked", s.ISACTIVE == 1).trigger("change");
                if (s.ICON && s.ICON.trim() !== "") {
                    $("#imgPreview").attr("src", s.ICON).show();
                    $("#iconPlaceholder").hide();
                    var fileName = s.ICON.split('/').pop().split('\\').pop();
                    $("#lblFileName").text(fileName);
                }
                else {
                    $("#imgPreview").attr("src", "").hide();
                    $("#iconPlaceholder").show();
                    $("#lblFileName").text("");
                }
                $("#btnSaveServing").hide();
                $("#btnUpdateServing").show();
                $("#servingModalHeader").text("Edit Serving");
                ShowModalPopUp('servingModal');
            }
        },
        error: function () { alert("Ajax Error while fetching record."); }
    });
}

function PrepareDelete(id) {
    smPendingDeleteId = id;
    ShowModalPopUp('modalConfirmDelete');
}

function DeleteServing() {
    if (smPendingDeleteId == null) return;
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("INSERTUPDATESERVING")) +
        "&CATCODE=" + encodeURIComponent(Encrypt("")) +
        "&CATNAME=" + encodeURIComponent(Encrypt("")) +
        "&SERVINGNAME=" + encodeURIComponent(Encrypt("")) +
        "&STARTTIME=" + encodeURIComponent(Encrypt("")) +
        "&ENDTIME=" + encodeURIComponent(Encrypt("")) +
        "&ACTION=" + encodeURIComponent(Encrypt("DELETE")) +
        "&ISACTIVE=" + encodeURIComponent(Encrypt("2")) + 
        "&ID=" + encodeURIComponent(Encrypt(smPendingDeleteId.toString()));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res[0].RESULT == "TRUE") {
                HideModalPopUp('modalConfirmDelete');
                smPendingDeleteId = null;
                setTimeout(function () {
                    $('#LBLRequestResult').html('Record deleted successfully.');
                    ShowModalPopUp('modalSuccess');
                    setTimeout(function () { HideModalPopUp('modalSuccess'); }, 2000);
                }, 300);
                LoadServingList();
            }
        }
    });
}

// --- UI Helpers ---

function ClearServingForm() {
    $("#HFServingID").val("0");
    $("#txtCategoryCode, #txtCategoryName, #txtServingName").val("");
    $("#startTimeTrigger .display-time").text("Select time");
    $("#endTimeTrigger .display-time").text("Select time");
    $("#chkServingActive").prop("checked", true).trigger("change");
    $(".tp-item").removeClass("active");
    $(".sm-input").removeClass("error-border");
    $(".validation-error").text('');
    $("#fileIconUpload").val("");
    $("#lblFileName").text("");
    $("#imgPreview").attr("src", "").hide();
    $("#iconPlaceholder").show();
    $("#btnSaveServing").show();
    $("#btnUpdateServing").hide();
}

function RenderServingPagination(totalRecords, totalPages) {
    var startShown = totalRecords === 0 ? 0 : (smPageIndex - 1) * smPageSize + 1;
    var endShown = Math.min(smPageIndex * smPageSize, totalRecords);
    $("#lblPaginationSummary").text('Showing ' + startShown + '-' + endShown + ' of ' + totalRecords + ' entries');

    var controlsHtml = '';
    controlsHtml += '<button type="button" class="page-btn" onclick="GoToServingPage(' + (smPageIndex - 1) + ')" ' + (smPageIndex <= 1 ? 'disabled' : '') + '>&lsaquo;</button>';
    for (var p = 1; p <= totalPages; p++) {
        controlsHtml += '<button type="button" class="page-btn ' + (p === smPageIndex ? 'active' : '') + '" onclick="GoToServingPage(' + p + ')">' + p + '</button>';
    }
    controlsHtml += '<button type="button" class="page-btn" onclick="GoToServingPage(' + (smPageIndex + 1) + ')" ' + (smPageIndex >= totalPages ? 'disabled' : '') + '>&rsaquo;</button>';
    $("#smPageControls").html(controlsHtml);
}

function GoToServingPage(p) {
    if (p < 1) return;
    smPageIndex = p;
    RenderServingGrid();
}

function initServingPickerColumns() {
    $(".tp-dropdown").each(function () {
        var hoursHtml = "";
        for (var i = 1; i <= 12; i++) {
            var val = (i < 10 ? '0' + i : i);
            hoursHtml += `<div class="tp-item" data-type="hour">${val}</div>`;
        }
        $(this).find(".hour-col").html(hoursHtml);

        var minsHtml = "";
        for (var i = 0; i < 60; i += 15) { // 15-minute intervals
            var val = (i < 10 ? '0' + i : i);
            minsHtml += `<div class="tp-item" data-type="min">${val}</div>`;
        }
        $(this).find(".min-col").html(minsHtml);
    });
}

var isCodeDuplicate = false; // Global flag

function CheckCodeAvailability() {
    var code = $("#txtCategoryCode").val().trim();

    if (code === "") return;

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("CHECKSERVINGCODE")) +
        "&CODE=" + encodeURIComponent(Encrypt(code));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0 && res[0].RESULT === "TRUE") {
                $("#txtCategoryCode").addClass("error-border");
                $("#errCategoryCode").text("This category code already exists.").css("color", "red");
                setTimeout(function () {
                    $("#errCategoryCode").fadeOut(500, function () {
                        $(this).text("").show(); 
                        $("#txtCategoryCode").removeClass("error-border");
                    });
                }, 3000);
                isCodeDuplicate = true;
            } else {
                $("#txtCategoryCode").removeClass("error-border");
                $("#errCategoryCode").text("");
                isCodeDuplicate = false;
            }
        }
    });
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

function ShowModalPopUp(ModalId)
{
    $('#' + ModalId).modal('show');
}
function HideModalPopUp(ModalId)
{
    $('#' + ModalId).modal('hide');
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






































