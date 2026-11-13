$(document).on("click", "#btnAddKitchen", function () {

    $("#txtKitchenName").val("");
    $("#txtCode").val("");
    $("#txtCapacity").val("");
    $("#txtLocation").val("");
    ShowModalPopUp('kitchenModal');
});

function LoadWardList() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDDROPDOWN"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            $("#wardContainer").empty();
            $.each(res, function (i, item) {
                var wardValue = "Ward " + item.WARDNAME + " - " + item.WARDTYPE;
                var html = '';
                html += '<label class="ward-item">';
                html += '<input type="checkbox" ';
                html += 'class="ward-checkbox" ';
                html += 'value="' + wardValue + '">';
                html += '<span>';
                html += '<img src="../images/location.png" class="ward-icon" /> ';
                html += wardValue;
                html += '</span>';
                html += '</label>';
                $("#wardContainer").append(html);
            });
        }
    });
}

function SubmitKitchen() {
    var kitchenName = $("#txtKitchenName").val();
    var kitchenCode = $("#txtKitchenCode").val();
    var capacity = $("#txtCapacity").val();
    var location = $("#txtLocation").val();
    var isActive = $("#chkKitchenActive").is(":checked") ? "1" : "2";
    var Action = ($("#kitchenModalHeader").text().trim() === "Add New Kitchen") ? "INSERT" : "UPDATE";
    var Id = $("#kitchenModal").data("currentId") || "";
    var isValid = true;

    $("#errKitchenName").text('');
    $("#errKitchenCode").text('');
    $("#txtKitchenName,#txtKitchenCode").removeClass("error-border");

    if (kitchenName.length == 0) {
        $("#txtKitchenName").addClass("error-border");
        $("#errKitchenName").text("Kitchen name is required");
        isValid = false;
    }

    if (kitchenCode.length == 0) {
        $("#txtKitchenCode").addClass("error-border");
        $("#errKitchenCode").text("Kitchen code is required");
        isValid = false;
    }

    if (!isValid) {
        setTimeout(function () {
            $("#txtKitchenName,#txtKitchenCode").removeClass("error-border");
            $("#errKitchenName,#errKitchenCode").text('');
        }, 3000);
        return false;
    }

    var selectedWards = [];
    $(".ward-checkbox:checked").each(function () {
        selectedWards.push($(this).val());
    });
    var wardsServed = selectedWards.join(",");

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("INSERTUPDATEKITCHEN")) +
        "&KITCHENNAME=" + encodeURIComponent(Encrypt(kitchenName)) +
        "&KITCHENCODE=" + encodeURIComponent(Encrypt(kitchenCode)) +
        "&CAPACITY=" + encodeURIComponent(Encrypt(capacity)) +
        "&LOCATION=" + encodeURIComponent(Encrypt(location)) +
        "&WARDLIST=" + encodeURIComponent(Encrypt(wardsServed)) +
        "&ACTION=" + encodeURIComponent(Encrypt(Action)) +
        "&ISACTIVE=" + encodeURIComponent(Encrypt(isActive)) +
        "&ID=" + encodeURIComponent(Encrypt(Id));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0 && res[0].RESULT == "TRUE") {
                $("#kitchenModal").modal("hide");
                $("#txtKitchenName,#txtKitchenCode,#txtCapacity,#txtLocation").val('');
                $(".ward-checkbox").prop("checked", false);
                $("#chkKitchenActive").prop("checked", false);

                if (typeof LoadKitchenList === "function") {
                    LoadKitchenList();
                }
                setTimeout(function () {
                    $('#LBLRequestResult').html('Kitchen created successfully.');
                    ShowModalPopUp('modalSuccess');

                    setTimeout(function () { HideModalPopUp('modalSuccess'); }, 2500);
                }, 300);
                LoadKitchen();
            }
        },
        error: function () {
            alert("Ajax Error");
        }
    });
}

function LoadKitchen() {
    var searchText = $("#txtSearchKitchen").val().trim();
    var showInactive = $("#chkShowInactive").is(":checked") ? "1" : "0";
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETKITCHENLIST")) +
        "&SEARCHTEXT=" + encodeURIComponent(Encrypt(searchText)) +
        "&ISACTIVE=" + encodeURIComponent(Encrypt(showInactive));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            $("#tblKitchenBody").empty();

            if (res && res.length > 0) {
                $.each(res, function (i, item) {
                    var wardsHtml = '';
                    if (item.WARDLIST) {
                        var wards = item.WARDLIST.split(',').map(w => w.trim());
                        var displayCount = Math.min(2, wards.length);

                        for (var j = 0; j < displayCount; j++) {
                            wardsHtml += '<span class="ward-badge">' + wards[j] + '</span> ';
                        }

                        if (wards.length > 2) {
                            wardsHtml += '<span class="ward-badge">+' + (wards.length - 2) + '</span>';
                        }
                    }
                    var dietHtml = '<span class="diet-badge">' + ((item.DIETMAPPEDCOUNT) ? item.DIETMAPPEDCOUNT : 0) + ' mapped</span>';

                    var statusHtml = (item.ISACTIVE == 1) ? '<span class="status-active">Active</span>': '<span class="status-inactive">Inactive</span>';

                    var actionHtml = '<td class="action-col">' +
                        '<button type="button" class="action-btn edit-btn" onclick="EditKitchen(' + item.ID + ');event.stopPropagation(); return false;">' +
                        '<img src="../images/memo.png" width="18" />' +
                        '</button>' +
                        '<button type="button" class="action-btn delete-btn" onclick="DeleteKitchen(' + item.ID + ');event.stopPropagation(); return false;">' +
                        '<img src="../images/delete.png" width="18" />' +
                        '</button>' +
                        '</td>';

                    var rowHtml = '<tr class="kitchen-row" data-id="' + item.ID + '" style="cursor:pointer">' +
                        '<td>' + item.KITCHENCODE + '</td>' +
                        '<td><strong>' + item.KITCHENNAME + '</strong><br/>' + item.LOCATION + '</td>' +
                        '<td>' + wardsHtml + '</td>' +
                        '<td>' + dietHtml + '</td>' +
                        '<td>' + statusHtml + '</td>' +
                        actionHtml +
                        '</tr>';

                    $("#tblKitchenBody").append(rowHtml);
                });
            } else {
                $("#tblKitchenBody").append('<tr><td colspan="6" style="text-align:center;">No kitchens found</td></tr>');
            }
        },
        error: function () {
            alert("Error loading kitchen data");
        }
    });
}

function DeleteKitchen(kitchenId) {
    ShowModalPopUp('modalConfirmDelete');
    $("#btnCancelDelete").off("click").on("click", function () {
        HideModalPopUp('modalConfirmDelete');
    });

    $("#btnConfirmDelete").off("click").on("click", function () {
        $("#modalConfirmDelete").modal("hide");

        var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("INSERTUPDATEKITCHEN")) +
            "&ACTION=" + encodeURIComponent(Encrypt("DELETE")) +
            "&ID=" + encodeURIComponent(Encrypt(kitchenId));

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (res) {
                if (res && res.length > 0 && res[0].RESULT === "TRUE") {
                    $('#LBLRequestResult').html('Kitchen deleted successfully.');
                    ShowModalPopUp('modalSuccess');
                    setTimeout(function () { HideModalPopUp('modalSuccess'); }, 2500);
                    LoadKitchen();
                } else {
                    alert("Failed to delete kitchen.");
                }
            },
            error: function () {
                alert("Ajax error while deleting kitchen.");
            }
        });
    });
}
function EditKitchen(kitchenId) {
    var kitchenUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETKITCHENBYID")) +
        "&ID=" + encodeURIComponent(Encrypt(kitchenId));

    $.ajax({
        url: kitchenUrl,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var kitchen = res[0];
                $("#txtKitchenName").val(kitchen.KITCHENNAME);
                $("#txtKitchenCode").val(kitchen.KITCHENCODE);
                $("#txtCapacity").val(kitchen.CAPACITY);
                $("#txtLocation").val(kitchen.LOCATION);
                $("#chkKitchenActive").prop("checked", kitchen.ISACTIVE == 1);
                var savedWards = kitchen.WARDLIST ? kitchen.WARDLIST.split(',').map(w => w.trim()) : [];
                var wardUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDDROPDOWN"));
                $.ajax({
                    url: wardUrl,
                    type: "GET",
                    dataType: "json",
                    success: function (wards) {
                        $("#wardContainer").empty();
                        $.each(wards, function (i, item) {
                            var wardValue = "Ward " + item.WARDNAME + " - " + item.WARDTYPE;
                            var checked = savedWards.indexOf(wardValue) !== -1 ? "checked" : "";
                            var html = '<label class="ward-item">' +
                                '<input type="checkbox" class="ward-checkbox" value="' + wardValue + '" ' + checked + '>' +
                                '<span><img src="../images/location.png" class="ward-icon" /> ' + wardValue + '</span>' +
                                '</label>';
                            $("#wardContainer").append(html);
                        });
                    },
                    error: function () {
                        alert("Error loading ward list");
                    }
                });

                $("#kitchenModalHeader").text("Edit Kitchen");
                $(".btn-create").text("Save Changes");
                $("#kitchenModal").data("currentId", kitchenId);
                ShowModalPopUp('kitchenModal');
            }
        },
        error: function () {
            alert("Error fetching kitchen details");
        }
    });
}



$(document).on('click', '.kitchen-row', function () {
    var kId = $(this).attr('data-id');

    if (kId) {
        EditKitchenNew(kId);
        LoadCutoffTimes();
    } else {
        console.error("Error: data-id is missing on the clicked row!");
    }
});

function EditKitchenNew(kitchenId) {
    $("#kitchenModalnew").data("kitchen-id", kitchenId);
    var dietUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDIETTYPEDROPDOWN"));

    $.ajax({
        url: dietUrl,
        type: "GET",
        dataType: "json",
        success: function (allDiets) {
            var kitchenUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETKITCHENBYID")) +
                "&ID=" + encodeURIComponent(Encrypt(kitchenId));

            $.ajax({
                url: kitchenUrl,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    if (res && res.length > 0) {
                        var k = res[0];
                        $("#kitchenModalHeadernew").text(k.KITCHENNAME);
                        $("#lblLocation").text(k.LOCATION);
                        $("#lblCapacity").text(k.CAPACITY + " meals/day");
                        $("#lblStatusBadge").text(k.ISACTIVE == 1 ? "Active" : "Inactive").css("color", k.ISACTIVE == 1 ? "#38a169" : "#e53e3e");

                        $("#wardContainernew").empty();
                        var wards = k.WARDLIST ? k.WARDLIST.split(',').map(w => w.trim()) : [];
                        $("#wardCount").text(wards.length);
                        wards.forEach(function (w) {
                            $("#wardContainernew").append('<div class="ward-pill"><i class="fa fa-map-marker-alt mr-2"></i>' + w + '</div>');
                        });

                        $.ajax({
                            url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETKITCHENDIETMAPPING")) +
                                "&KitchenID=" + encodeURIComponent(Encrypt(kitchenId)),
                            type: "GET",
                            dataType: "json",
                            success: function (mappedDiets) {
                                var mappedIds = mappedDiets.map(d => parseInt(d.DietId));
                                $("#dietTypeListContainer").empty();
                                $.each(allDiets, function (i, d) {
                                    var isChecked = mappedIds.indexOf(parseInt(d.ID)) !== -1 ? "checked" : "";
                                    var dietHtml = `
                                        <div class="diet-list-item">
                                            <input type="checkbox" class="diet-checkbox" data-dietid="${d.ID}" ${isChecked}>
                                            <div class="diet-details">
                                                <span class="diet-name">${d.NAME}</span>
                                            </div>
                                            <div class="diet-code">${d.CODE}</div>
                                        </div>`;
                                    $("#dietTypeListContainer").append(dietHtml);
                                });

                                ShowModalPopUp('kitchenModalnew');
                            },
                            error: function (err) {
                                console.error("Error loading mapped diets:", err);
                            }
                        });
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching kitchen data:", error);
                }
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching master diet list:", error);
        }
    });
}

function LoadCutoffTimes() {
    var cutoffUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMEALCUTOFFS"));

    $.ajax({
        url: cutoffUrl,
        type: "GET",
        dataType: "json",
        success: function (meals) {
            $(".cutoff-row").each(function () {
                var mealName = $(this).data("meal");
                var meal = meals.find(m => m.MealName === mealName);

                if (meal) {
                    var cutoffTime = meal.CutoffTime;

                    if (typeof cutoffTime !== "string") {
                        if (cutoffTime instanceof Date) {
                            var hh = cutoffTime.getHours().toString().padStart(2, "0");
                            var mm = cutoffTime.getMinutes().toString().padStart(2, "0");
                            cutoffTime = `${hh}:${mm}:00`;
                        } else if (cutoffTime && cutoffTime.Hours !== undefined && cutoffTime.Minutes !== undefined) {
                            var hh = cutoffTime.Hours.toString().padStart(2, "0");
                            var mm = cutoffTime.Minutes.toString().padStart(2, "0");
                            cutoffTime = `${hh}:${mm}:00`;
                        } else {
                            cutoffTime = "00:00:00";
                        }
                    }
                    var parts = cutoffTime.split(":");
                    var hh = parts[0].padStart(2, "0");
                    var mm = parts[1].padStart(2, "0");
                    var timeValue = `${hh}:${mm}`;
                    $(this).find(".cutoff-time").val(timeValue);
                    $(this).find(".day-select").val(meal.DayOption || "same day");
                }
            });

            ShowModalPopUp('kitchenModalnew');
        },
        error: function (xhr, status, error) {
            console.error("Error fetching meal cutoff times:", error);
        }
    });
}

function SaveCutoffTimes() {
    var kitchenId = $("#kitchenModalnew").data("kitchen-id");
    if (!kitchenId) {
        alert("Kitchen ID not found");
        return;
    }
    var breakfastTime = $("#kitchenModalnew .cutoff-row[data-meal='Breakfast'] .cutoff-time").val();
    var breakfastDay = $("#kitchenModalnew .cutoff-row[data-meal='Breakfast'] .day-select").val();
    var lunchTime = $("#kitchenModalnew .cutoff-row[data-meal='Lunch'] .cutoff-time").val();
    var lunchDay = $("#kitchenModalnew .cutoff-row[data-meal='Lunch'] .day-select").val();
    var dinnerTime = $("#kitchenModalnew .cutoff-row[data-meal='Dinner'] .cutoff-time").val();
    var dinnerDay = $("#kitchenModalnew .cutoff-row[data-meal='Dinner'] .day-select").val();

    if (breakfastTime) breakfastTime += ":00";
    if (lunchTime) lunchTime += ":00";
    if (dinnerTime) dinnerTime += ":00";

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("UPDATEMEALCUTOFFS")) +
        "&BreakfastTime=" + encodeURIComponent(Encrypt(breakfastTime)) +
        "&BreakfastDay=" + encodeURIComponent(Encrypt(breakfastDay)) +
        "&LunchTime=" + encodeURIComponent(Encrypt(lunchTime)) +
        "&LunchDay=" + encodeURIComponent(Encrypt(lunchDay)) +
        "&DinnerTime=" + encodeURIComponent(Encrypt(dinnerTime)) +
        "&DinnerDay=" + encodeURIComponent(Encrypt(dinnerDay));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
                $("#modalMessage") .removeClass("alert-danger").addClass("alert-success").text("CutOffTime updated successfully!").fadeIn(function () {
                        this.scrollIntoView({ behavior: "smooth" });
                    });
                setTimeout(function () { $("#modalMessage").fadeOut(); }, 3000);
        },
        error: function (xhr, status, error) {
            console.error("AJAX error:", xhr.responseText, status, error);
            alert("Error updating cutoff times.");
        }
    });
}


$(document).on("change", ".diet-checkbox", function () {
    var dietId = $(this).data("dietid");
    var kitchenId = $("#kitchenModalnew").data("kitchen-id");
    var action = $(this).is(":checked") ? "MAPDIET" : "UNMAPDIET";

    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("UPDATEKITCHENDIETMAPPING")) +
            "&KITCHENID=" + encodeURIComponent(Encrypt(kitchenId)) +
            "&DIETID=" + encodeURIComponent(Encrypt(dietId)) +
            "&ACTION=" + encodeURIComponent(Encrypt(action)),
        type: "GET",
        dataType: "json",
        success: function (res) {
            $("#modalMessage").removeClass("alert-danger").addClass("alert-success").text("Mapping updated successfully!").fadeIn(function () {
                this.scrollIntoView({ behavior: "smooth" });
            });;
            setTimeout(function () { $("#modalMessage").fadeOut(); }, 3000);
            LoadKitchen();
        },
        error: function () {
            $("#modalMessage").removeClass("alert-success").addClass("alert-danger").text("Error updating mapping.").fadeIn();
        }
    });
});

function getKitchenRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '').toString();
}

function LoadNotifications() {
    var roleId = getKitchenRoleId();
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
    var roleId = getKitchenRoleId();
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
    var roleId = getKitchenRoleId();
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
    var roleId = getKitchenRoleId();
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