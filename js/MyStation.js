var globalData = [];
var currentTab = "all";
var currentStatusFilter = "all";
var globalMealCategories = [];
var foodOrderingFlag = 0;
var autoRefreshTimer = null; 
var isRefreshing = false;    

function LoadMyStation() {
    if (isRefreshing) return; 
    isRefreshing = true;

    var flagUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETFOODORDERINGFLAG"));

    $.ajax({
        url: flagUrl,
        type: "GET",
        dataType: "json",
        success: function (flagRes) {
            if (flagRes && flagRes.length > 0) {
                var raw = flagRes[0].IsShown;
                foodOrderingFlag = (raw === true || raw === "true" || raw === 1 || raw === "1") ? 1 : 0;
            } else {
                foodOrderingFlag = 0;
            }

            if (foodOrderingFlag === 1) {
                $("#readyBox").show();
                $("#deliveredBox").hide();
                if (currentStatusFilter === "delivered") {
                    currentStatusFilter = "all";
                }
            } else {
                $("#readyBox").hide();
                $("#deliveredBox").show();
                if (currentStatusFilter === "ready") {
                    currentStatusFilter = "all";
                }
            }
            var catUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETSERVINGDROPDOWN"));
            $.ajax({
                url: catUrl,
                type: "GET",
                dataType: "json",
                success: function (catRes) {
                    globalMealCategories = catRes.map(item => item.NAME);
                    var dataUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMYSTATIONDATA"));
                    $.ajax({
                        url: dataUrl,
                        type: "GET",
                        dataType: "json",
                        success: function (res) {
                            globalData = res || [];
                            renderDashboard();
                        },
                        complete: function () {
                            isRefreshing = false; 
                        }
                    });
                },
                error: function () {
                    isRefreshing = false; 
                }
            });
        },
        error: function () {
            foodOrderingFlag = 0;
            console.warn("[MyStation] Flag fetch failed — defaulting to Delivered mode.");
            $("#readyBox").hide();
            $("#deliveredBox").show();
            if (currentStatusFilter === "ready") {
                currentStatusFilter = "all";
            }
            var catUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETSERVINGDROPDOWN"));
            $.ajax({
                url: catUrl,
                type: "GET",
                dataType: "json",
                success: function (catRes) {
                    globalMealCategories = catRes.map(item => item.NAME);
                    var dataUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMYSTATIONDATA"));
                    $.ajax({
                        url: dataUrl,
                        type: "GET",
                        dataType: "json",
                        success: function (res) {
                            globalData = res || [];
                            renderDashboard();
                        },
                        complete: function () {
                            isRefreshing = false; 
                        }
                    });
                },
                error: function () {
                    isRefreshing = false; 
                }
            });
        }
    });
}

function StartAutoRefresh() {
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);

    autoRefreshTimer = setInterval(function () {
        if (document.visibilityState === 'visible' && !$('.modal.show').length && !isRefreshing) {
            LoadMyStation();
            LoadNotifications();
            GetUnreadCount();
        }
    }, 10000); 
}

function StopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}

$(document).ready(function () {
    StartAutoRefresh();
});

document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === 'visible') {
        LoadMyStation(); 
        StartAutoRefresh();
    } else {
        StopAutoRefresh();
    }
});

function renderDashboard() {
    var $wrapper = $("#orders-wrapper");
    $wrapper.empty();

    if (currentStatusFilter === "feedback") {
        $(".filter-tabs-wrapper").addClass("d-none");
    } else {
        $(".filter-tabs-wrapper").removeClass("d-none");
    }

    const countUniqueOrders = (arr) => [...new Set(arr.map(x => x.ORDERID))].length;


    const pendingItems = globalData.filter(x => x.STATUS === 'Placed' || x.STATUS === 'Confirmed');
    $("#total-pending").text(pendingItems.length);

    const cookingItems = globalData.filter(x => x.STATUS === 'Preparing');
    $("#total-cooking").text(cookingItems.length);

    if (foodOrderingFlag === 1) {
        const readyItems = globalData.filter(x => x.STATUS === 'Ready');
        $("#total-ready").text(readyItems.length);
    } else {
        $("#total-ready").text(0);
        const deliveredItems = globalData.filter(x => x.STATUS === 'Delivered');
        $("#total-Delivered").text(deliveredItems.length);
    }
    const feedbackData = globalData.filter(x =>
        x.STATUS === 'Delivered' &&
        (x.RATING == 0 || x.RATING == 1 || x.RATING == 2) &&
        x.RATING !== null && x.RATING !== ""
    );
    $("#total-feedback").text(countUniqueOrders(feedbackData));
    $("#count-tab-all").text(globalData.length);
    $("#count-tab-instant").text(globalData.filter(x => x.ISPREORDER == "0").length);
    $("#count-tab-preorder").text(globalData.filter(x => x.ISPREORDER == "1").length);

    var filteredData = globalData;

    if (currentStatusFilter !== "all") {
        filteredData = filteredData.filter(function (o) {
            if (currentStatusFilter === "pending") {
                return (o.STATUS === 'Placed' || o.STATUS === 'Confirmed');
            }
            if (currentStatusFilter === "cooking") return o.STATUS === 'Preparing';
            if (currentStatusFilter === "ready") return o.STATUS === 'Ready';
            if (currentStatusFilter === "feedback") {
                return (o.STATUS === 'Delivered' && (o.RATING == 0 || o.RATING == 1 || o.RATING == 2) && o.RATING !== null);
            }
            return true;
        });
    }

    if (currentStatusFilter !== "feedback") {
        filteredData = filteredData.filter(function (item) {
            if (currentTab === "instant") return item.ISPREORDER == "0";
            if (currentTab === "preorder") return item.ISPREORDER == "1";
            return true;
        });
    } else {
        filteredData.sort((a, b) => (parseInt(a.RATING) || 0) - (parseInt(b.RATING) || 0));
    }


    if (filteredData.length === 0) {
        $("#orders-wrapper").addClass("d-none");
        $("#empty-state").removeClass("d-none");

        let mainTitle = "No orders found.";
        let subTitle = "Try changing your filters or switching tabs.";
        let icon = "fa-calendar-alt";

        if (currentStatusFilter === "pending") {
            mainTitle = "No pending orders.";
            subTitle = "Incoming orders will appear here automatically.";
            icon = "fa-clock";
        }
        else if (currentStatusFilter === "cooking") {
            mainTitle = "Nothing is cooking right now.";
            subTitle = "Tap <b>Start</b> on a pending order to move it here.";
            icon = "fa-fire-flame-curved";
        }
        else if (currentStatusFilter === "ready") {
            mainTitle = "No orders are ready yet.";
            subTitle = "Plated orders will stay here until delivered.";
            icon = "fa-check-circle";
        }
        else if (currentStatusFilter === "feedback") {
            mainTitle = "No feedback items found.";
            subTitle = "Delivered items with ratings will appear here.";
            icon = "fa-comment-dots";
        }

        if (currentTab === "preorder") {
            mainTitle = mainTitle.replace("orders", "pre-orders").replace("Nothing", "No pre-orders");
        } else if (currentTab === "instant") {
            mainTitle = mainTitle.replace("orders", "instant orders").replace("Nothing", "No instant orders");
        }

        $("#empty-state h5").text(mainTitle);
        $("#empty-state p").html(subTitle);
        $(".empty-icon-wrap i").attr("class", "fas " + icon);

        return;
    }
    $("#orders-wrapper").removeClass("d-none");
    $("#empty-state").addClass("d-none");

    if (currentStatusFilter === "feedback") {
        var renderedOrders = new Set();
        $wrapper.append('<div class="active-items-container mt-3"></div>');

        filteredData.forEach(item => {
            if (!renderedOrders.has(item.ORDERID)) {
                var orderItems = filteredData.filter(x => x.ORDERID === item.ORDERID);
                $wrapper.find(".active-items-container").append(createFeedbackCard(orderItems));
                renderedOrders.add(item.ORDERID);
            }
        });
    } else {
        if (globalMealCategories && globalMealCategories.length > 0) {

            $.each(globalMealCategories, function (i, mealName) {
                var mealOrders = filteredData.filter(x => x.MEALTYPE === mealName);
                if (mealOrders.length > 0) {
                    var themeName = mealName.toLowerCase().replace(/\s+/g, '');
                    $wrapper.append(createMealSection(mealName, mealOrders, themeName));
                }
            });
            var unmatched = filteredData.filter(x => !globalMealCategories.includes(x.MEALTYPE));
            if (unmatched.length > 0) {
                $wrapper.append(createMealSection("Other Items", unmatched, "other"));
            }

        } else {
            $wrapper.append(`
                <div class="text-center p-5 text-muted">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h5>No category configuration found.</h5>
                    <p>Please check the Serving Master settings.</p>
                </div>
            `);
        }
    }

}

function groupOrdersById(data) {
    var groups = {};
    data.forEach(function (item) {
        var id = item.ORDERID;
        if (!groups[id]) groups[id] = [];
        groups[id].push(item);
    });
    return Object.keys(groups).map(key => groups[key]);
}
function createMealSection(name, orders, theme) {
    var iconClass = "fa-bowl-food"; // Default
    if (theme === "serving1") iconClass = "fa-sun";
    if (theme === "serving2") iconClass = "fa-utensils";
    if (theme === "serving3") iconClass = "fa-moon";
    if (theme === "serving4") iconClass = "fa-glass-water";
    if (theme === "serving5") iconClass = "fa-cookie-bite";

    var rawPreorders = orders.filter(x => x.STATUS !== 'Ready' && x.STATUS !== 'Delivered' && x.ISPREORDER == "1");
    var rawInstant = orders.filter(x => x.STATUS !== 'Ready' && x.STATUS !== 'Delivered' && x.ISPREORDER == "0");
    var rawCompleted = orders.filter(x => x.STATUS === 'Ready' || x.STATUS === 'Delivered');
    var rawToPrepare = orders.filter(x =>
        x.ISPREORDER == "1" &&
        (x.STATUS === 'Placed' || x.STATUS === 'Confirmed')
    );
    var groupedPreorders = groupOrdersById(rawPreorders);
    var groupedInstant = groupOrdersById(rawInstant);
    var groupedCompleted = groupOrdersById(rawCompleted);

    var countSheetReady = orders.filter(x => x.ISPREORDER == "1" && x.STATUS === 'Ready').length;
    var countSheetAll = orders.filter(x => x.ISPREORDER == "1" && x.STATUS !== 'Cancelled').length;
    var isAnyCooking = orders.some(x => x.STATUS === 'Preparing');

    var countReady = orders.filter(x => x.STATUS === 'Ready').length;
    var countCooking = orders.filter(x => x.STATUS === 'Preparing').length;
    var countTotal = orders.length;
    var readyAllLabel = (foodOrderingFlag === 1) ? 'Mark All Ready' : 'Mark All Delivered';

    var preorderIds = [...new Set(rawPreorders.map(x => x.ORDERID))];
    var preorderIdsAttr = preorderIds.join(',');

    var preparingEligibleIds = [...new Set(rawPreorders.filter(x => x.STATUS !== 'Preparing').map(x => x.ORDERID))];
    var preparingEligibleAttr = preparingEligibleIds.join(',');

    var safeName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    return `
    <div class="meal-group mb-4 ${theme}-theme" id="section-${theme}">
        <div class="meal-header ${theme}-theme d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <span class="meal-icon"><i class="fas ${iconClass}"></i></span>
                <div class="ms-3">
                    <h5 class="mb-0">${name}</h5>
                   <small class="text-muted">${countTotal} items · ${countReady} ready · ${countCooking} cooking</small>
                </div>
            </div>
            <div class="header-actions d-flex gap-2 align-items-center">
               ${countSheetReady > 0 ? `<button type="button" class="btn-header-outline" onclick="PrintMealSheet('${safeName}', 'Ready', '${preorderIdsAttr}')"><i class="fas fa-print me-1"></i> Sheet · Ready (${countSheetReady})</button>` : ''}
               ${countSheetAll > 0 ? `<button type="button" class="btn-header-outlineAll" onclick="PrintMealSheet('${safeName}', 'All', '${preorderIdsAttr}')"><i class="fas fa-print me-1"></i> Sheet · All (${countSheetAll})</button>` : ''}
                   <button type="button" class="btn-header-preparing ${rawToPrepare.length == 0 ? 'disabled' : ''}" onclick="MarkAllPreparingByMeal('${name}')">
                        <i class="fas fa-fire-flame-curved me-1"></i> Mark All Preparing
                    </button>
                    <button type="button" class="btn-header-ready ${rawPreorders.length == 0 ? 'disabled' : ''}" onclick="MarkAllReadyByMeal('${name}')">
                        <i class="far fa-check-circle me-1"></i> ${readyAllLabel}
                    </button>
                <span class="${isAnyCooking ? 'status-badge-progress' : 'status-badge-pending'} ms-2">${isAnyCooking ? 'In progress' : 'Pending'}</span>
            </div>
        </div>

        <div class="orders-list p-3">
            ${groupedPreorders.length > 0 ? `
                <div class="category-header preorder-cat">
                    <div class="d-flex align-items-center"><span class="cat-icon"><i class="fas fa-calendar-alt"></i></span><div class="ms-2"><div class="cat-title">PRE-ORDERS</div></div></div>
                    <span class="cat-count-pill">${rawPreorders.length} items</span>
                </div>
                <div class="active-items-container mb-4">${groupedPreorders.map(orderItems => createOrderCard(orderItems)).join('')}</div>
            ` : ''}

            ${groupedInstant.length > 0 ? `
                <div class="category-header instant-cat">
                    <div class="d-flex align-items-center">
                        <span class="cat-icon"><i class="fas fa-bolt"></i></span>
                        <div class="ms-2">
                            <div class="cat-title">INSTANT ORDERS (WALK-UP)</div>
                            <div class="cat-subtitle">Cook as they come in.</div>
                        </div>
                    </div>
                    <span class="cat-count-pill">${rawInstant.length} items</span>
                </div>
                <div class="active-items-container">${groupedInstant.map(orderItems => createOrderCard(orderItems)).join('')}</div>
            ` : ''}

            <div class="completed-card-container mt-3 ${rawCompleted.length === 0 ? 'd-none' : ''}">
                <div class="accordion-header" onclick="toggleAccordion(this)">
                    <div class="d-flex align-items-center">
                        <div class="check-icon-circle me-2"><i class="fas fa-check"></i></div>
                        <span class="fw-bold">Completed — ${name}</span>
                        <small class="ms-2 text-muted">${rawCompleted.length} items done</small>
                    </div>
                    <i class="fas fa-chevron-down arrow"></i>
                </div>
                <div class="accordion-body p-2" style="display: none; background-color: #fafafa;">
                    ${groupedCompleted.map(orderItems => createOrderCard(orderItems)).join('')}
                </div>
            </div>
        </div>
    </div>`;
}
function MarkAllPreparingByMeal(mealName) {
    var itemsToUpdate = globalData.filter(x =>
        x.MEALTYPE === mealName &&
        (x.STATUS === 'Placed' || x.STATUS === 'Confirmed')
    );

    if (itemsToUpdate.length === 0) {
        ShowToast('No pending items to mark as Preparing in ' + mealName + '.', 'info');
        return;
    }

    var totalItems = itemsToUpdate.length;
    var processedCount = 0;
    var failedCount = 0;

    function finish() {
        var msg = 'All ' + mealName + ' items (' + totalItems + ') marked as Preparing successfully.';
        if (failedCount > 0) {
            msg = failedCount + ' of ' + totalItems + ' items failed. Please retry.';
        }
        $('#LBLRequestResult').html(msg);
        ShowModalPopUp('modalSuccess');
        setTimeout(function () {
            HideModalPopUp('modalSuccess');
        }, 2500);
        LoadMyStation();
    }

    $.each(itemsToUpdate, function (index, item) {
        var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("UPDATEFOODORDERSTATUS")) +
            "&ID=" + encodeURIComponent(Encrypt(item.ID.toString())) +
            "&STATUS=" + encodeURIComponent(Encrypt("Preparing"));

        $.ajax({
            url: url,
            type: "POST",
            success: function (res) {
                try {
                    var data = JSON.parse(res);
                    if (data[0].RESULT === "TRUE") {
                        processedCount++;
                    } else {
                        failedCount++;
                    }
                } catch (e) {
                    failedCount++;
                }
                if ((processedCount + failedCount) === totalItems) finish();
            },
            error: function () {
                failedCount++;
                if ((processedCount + failedCount) === totalItems) finish();
            }
        });
    });
}
function MarkAllReadyByMeal(mealName) {
    var targetStatus = (foodOrderingFlag === 1) ? 'Ready' : 'Delivered';

    var itemsToUpdate = globalData.filter(x =>
        x.MEALTYPE === mealName &&
        x.ISPREORDER == "1" &&
        (x.STATUS !== 'Ready' && x.STATUS !== 'Delivered')
    );

    if (itemsToUpdate.length === 0) return;

    var totalItems = itemsToUpdate.length;
    var processedCount = 0;

    $.each(itemsToUpdate, function (index, item) {
        var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("UPDATEFOODORDERSTATUSFORALL")) +
            "&ORDERID=" + encodeURIComponent(Encrypt(item.ORDERID.toString())) +
            "&STATUS=" + encodeURIComponent(Encrypt(targetStatus));

        $.ajax({
            url: url,
            type: "POST",
            success: function (res) {
                var data = JSON.parse(res);
                if (data[0].RESULT === "TRUE") {
                    processedCount++;
                    if (processedCount === totalItems) {
                        $('#LBLRequestResult').html('All ' + mealName + ' pre-orders (' + totalItems + ' items) marked as ' + targetStatus + ' successfully.');
                        ShowModalPopUp('modalSuccess');
                        setTimeout(function () {
                            HideModalPopUp('modalSuccess');
                        }, 2500);
                        LoadMyStation();
                    }
                }
            },
            error: function () {
                processedCount++;
                if (processedCount === totalItems) LoadMyStation();
            }
        });
    });
}

function PrintMealSheet(mealName, type) {
    var filteredItems = globalData.filter(function (o) {
        var matchesMeal = o.MEALTYPE === mealName;
        var isPreorder = o.ISPREORDER == "1";
        if (type === 'Ready') {
            return matchesMeal && isPreorder && o.STATUS === 'Ready';
        } else {
            return matchesMeal && isPreorder && o.STATUS !== 'Cancelled';
        }
    });

    if (filteredItems.length === 0) {
        alert("No items found to print for " + mealName + " (" + type + ")");
        return;
    }

    filteredItems.sort((a, b) => a.ROOMNO.localeCompare(b.ROOMNO));

    var now = new Date();
    var dayMonth = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(/ /g, '').toUpperCase();
    var mealCode = mealName.substring(0, 3).toUpperCase();
    var sessionCode = "BLK-" + mealCode + "-" + dayMonth;
    var subTitle = type === 'Ready' ? "Ready trays" : "All pre-orders";

    var tableRows = filteredItems.map(function (item, index) {
        var allergyHtml = "";
        if (item.ALLERGENS && item.ALLERGENS.toLowerCase() !== "none" && item.ALLERGENS.trim() !== "") {
            allergyHtml = `
                <div style="border: 1px solid #fecaca; color: #b91c1c; background: #fff5f5; 
                            padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 11px; 
                            display: inline-flex; align-items: center; text-transform: uppercase;">
                    <span style="margin-right: 4px;">⚠</span> ${item.ALLERGENS}
                </div>`;
        }

        var isDenied = (item.ISDENIED == 1 || item.ISDENIED === true || item.STATUS === 'Denied');

        // FIX: Only strike through the name and qty, NOT the denied reason div.
        var itemNameStyle = isDenied ? 'text-decoration: line-through; color: #dc2626; opacity: 0.7;' : 'color: #000;';
        var qtyStyle = isDenied ? 'text-decoration: line-through; color: #dc2626; opacity: 0.7;' : 'color: #000;';

        var statusLabel = isDenied ? `<div style="display:block; font-size: 10px; font-weight:800; color:#dc2626; text-transform:uppercase; margin-top:4px; text-decoration:none;">⛔ DENIED: ${item.DENIEDREASON || 'No reason'}</div>` : '';

        return `
            <tr style="border-bottom: 1px dotted #cbd5e1;">
                <td style="padding: 15px 5px; font-weight: 700; color: #64748b; width: 30px;">${index + 1}</td>
                <td style="padding: 15px 10px; width: 200px;">
                    <div style="font-weight: 800; font-size: 14px; color: #000;">${item.PATIENTNAME || item.ORDERBY}</div>
                    <div style="color: #94a3b8; font-size: 12px; font-weight: 600;">Room ${item.ROOMNO}</div>
                    <div style="font-weight: 800; font-size: 11px; margin-top: 2px;">#${item.ORDERID}</div>
                </td>
                <td style="padding: 15px 10px;">
                    <span style="color: #94a3b8; font-size: 11px; font-weight: 600; margin-right: 15px;">${item.ORDERID}-1</span>
                    <span style="font-size: 15px; font-weight: 900; margin-right: 10px; ${qtyStyle}">${item.QUANTITY}x</span>
                    <span style="font-size: 15px; font-weight: 600; ${itemNameStyle}">${item.ITEMNAME}</span>
                    ${statusLabel}
                </td>
                <td style="padding: 15px 10px; text-align: right;">
                    ${allergyHtml}
                </td>
                <td style="padding: 15px 5px; text-align: right; width: 40px;">
                    <div style="width: 20px; height: 18px; border: 2px solid #1e293b; border-radius: 5px; display: inline-block;"></div>
                </td>
            </tr>`;
    }).join('');

    var dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: '2-digit' });
    var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    var html = `
        <div style="padding: 30px; font-family: 'Segoe UI', Tahoma, sans-serif; color: #1e293b; max-width: 900px; margin: auto;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 15px;">
                <span>${dateStr}, ${timeStr}</span>
                <span>dial50.com</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5px solid #1e293b; padding-bottom: 15px; margin-bottom: 20px;">
                <div>
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">DIAL50 · Kitchen Station Pre-Order Sheet</div>
                    <h1 style="font-size: 34px; font-weight: 900; margin: 5px 0;">${mealName} pre-orders · ${subTitle}</h1>
                    <div style="font-size: 14px; font-weight: 600; color: #64748b;">${filteredItems.length} orders · ${filteredItems.length} items</div>
                </div>
               
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 10px 5px;">#</th>
                        <th style="padding: 10px 10px;">Patient · Room</th>
                        <th style="padding: 10px 10px;">Items</th>
                        <th style="padding: 10px 10px; text-align: right;">Notes / Allergies</th>
                        <th style="padding: 10px 5px;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 600; color: #64748b; margin-top: 30px;">
                <span>Tick each row as the tray is plated and dispatched.</span>
                <span>Page 1 of 1</span>
            </div>
        </div>`;

    openPrintWindow(html);
} function PrintMealSheet(mealName, type) {
    var filteredItems = globalData.filter(function (o) {
        var matchesMeal = o.MEALTYPE === mealName;
        var isPreorder = o.ISPREORDER == "1";
        if (type === 'Ready') {
            return matchesMeal && isPreorder && o.STATUS === 'Ready';
        } else {
            return matchesMeal && isPreorder && o.STATUS !== 'Cancelled';
        }
    });

    if (filteredItems.length === 0) {
        alert("No items found to print for " + mealName + " (" + type + ")");
        return;
    }

    filteredItems.sort((a, b) => a.ROOMNO.localeCompare(b.ROOMNO));

    var now = new Date();
    var dayMonth = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(/ /g, '').toUpperCase();
    var mealCode = mealName.substring(0, 3).toUpperCase();
    var sessionCode = "BLK-" + mealCode + "-" + dayMonth;
    var subTitle = type === 'Ready' ? "Ready trays" : "All pre-orders";

    var tableRows = filteredItems.map(function (item, index) {
        var allergyHtml = "";
        if (item.ALLERGENS && item.ALLERGENS.toLowerCase() !== "none" && item.ALLERGENS.trim() !== "") {
            allergyHtml = `
                <div style="border: 1px solid #fecaca; color: #b91c1c; background: #fff5f5; 
                            padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 11px; 
                            display: inline-flex; align-items: center; text-transform: uppercase;">
                    <span style="margin-right: 4px;">⚠</span> ${item.ALLERGENS}
                </div>`;
        }

        var isDenied = (item.ISDENIED == 1 || item.ISDENIED === true || item.STATUS === 'Denied');

        // FIX: Only strike through the name and qty, NOT the denied reason div.
        var itemNameStyle = isDenied ? 'text-decoration: line-through; color: #dc2626; opacity: 0.7;' : 'color: #000;';
        var qtyStyle = isDenied ? 'text-decoration: line-through; color: #dc2626; opacity: 0.7;' : 'color: #000;';

        var statusLabel = isDenied ? `<div style="display:block; font-size: 10px; font-weight:800; color:#dc2626; text-transform:uppercase; margin-top:4px; text-decoration:none;">⛔ DENIED: ${item.DENIEDREASON || 'No reason'}</div>` : '';

        return `
            <tr style="border-bottom: 1px dotted #cbd5e1;">
                <td style="padding: 15px 5px; font-weight: 700; color: #64748b; width: 30px;">${index + 1}</td>
                <td style="padding: 15px 10px; width: 200px;">
                    <div style="font-weight: 800; font-size: 14px; color: #000;">${item.PATIENTNAME || item.ORDERBY}</div>
                    <div style="color: #94a3b8; font-size: 12px; font-weight: 600;">Room ${item.ROOMNO}</div>
                    <div style="font-weight: 800; font-size: 11px; margin-top: 2px;">#${item.ORDERID}</div>
                </td>
                <td style="padding: 15px 10px;">
                    <span style="color: #94a3b8; font-size: 11px; font-weight: 600; margin-right: 15px;">${item.ORDERID}-1</span>
                    <span style="font-size: 15px; font-weight: 900; margin-right: 10px; ${qtyStyle}">${item.QUANTITY}x</span>
                    <span style="font-size: 15px; font-weight: 600; ${itemNameStyle}">${item.ITEMNAME}</span>
                    ${statusLabel}
                </td>
                <td style="padding: 15px 10px; text-align: right;">
                    ${allergyHtml}
                </td>
                <td style="padding: 15px 5px; text-align: right; width: 40px;">
                    <div style="width: 20px; height: 18px; border: 2px solid #1e293b; border-radius: 5px; display: inline-block;"></div>
                </td>
            </tr>`;
    }).join('');

    var dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: '2-digit' });
    var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    var html = `
        <div style="padding: 30px; font-family: 'Segoe UI', Tahoma, sans-serif; color: #1e293b; max-width: 900px; margin: auto;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 15px;">
                <span>${dateStr}, ${timeStr}</span>
                <span>dial50.com</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5px solid #1e293b; padding-bottom: 15px; margin-bottom: 20px;">
                <div>
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">DIAL50 · Kitchen Station Pre-Order Sheet</div>
                    <h1 style="font-size: 34px; font-weight: 900; margin: 5px 0;">${mealName} pre-orders · ${subTitle}</h1>
                    <div style="font-size: 14px; font-weight: 600; color: #64748b;">${filteredItems.length} orders · ${filteredItems.length} items</div>
                </div>
               
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 10px 5px;">#</th>
                        <th style="padding: 10px 10px;">Patient · Room</th>
                        <th style="padding: 10px 10px;">Items</th>
                        <th style="padding: 10px 10px; text-align: right;">Notes / Allergies</th>
                        <th style="padding: 10px 5px;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 600; color: #64748b; margin-top: 30px;">
                <span>Tick each row as the tray is plated and dispatched.</span>
                <span>Page 1 of 1</span>
            </div>
        </div>`;

    openPrintWindow(html);
}
function createOrderCard(items) {
    if (!items || !items.length) return "";

    var firstItem = items[0];
    var orderId = firstItem.ORDERID;
    var isPreorder = firstItem.ISPREORDER == "1";
    var displayTime = getFormattedTimeDisplay(firstItem.CREATEDON);

    var isFinished = items.every(function (o) {
        return o.STATUS === "Ready" || o.STATUS === "Delivered";
    });

    function h(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function jsArg(value) {
        return h(JSON.stringify(String(value == null ? "" : value)));
    }

    var specialInstruction = (firstItem.SPECIALINSTRUCTION || "").trim();
    if (specialInstruction.toLowerCase() === "none") {
        specialInstruction = "";
    }

    var delayMinutes = parseInt(firstItem.DELAY_MINUTES || 0, 10) || 0;
    var delayNotified = firstItem.DELAY_NOTIFIED == 1 || firstItem.DELAY_NOTIFIED == "1";
    var delayReason = (firstItem.DELAY_REASON || "").trim();
    var menuChanged = firstItem.MENUCHANGED == 1 || firstItem.MENUCHANGED == "1";
    var menuReason = (firstItem.MENUCHANGE_REASON || "").trim();
    var dietName = firstItem.DIETTYPE || "";

    var uniqueAllergies = [...new Set(
        items.map(function (x) {
            return (x.ALLERGENS || "").trim();
        }).filter(function (x) {
            return x && x.toLowerCase() !== "none";
        })
    )].join(", ");

    var badgeHtml = isPreorder
        ? `<span class="oc-type-badge oc-preorder"><i class="far fa-calendar-alt"></i> Pre-order</span>`
        : `<span class="oc-type-badge oc-instant"><i class="fas fa-bolt"></i> Instant</span>`;

    var metaBadgesHtml = "";
    if (dietName || uniqueAllergies) {
        metaBadgesHtml = `<div class="oc-meta-group">`;
        if (dietName) {
            metaBadgesHtml += `<span class="oc-meta-badge oc-diet"><i class="fas fa-leaf"></i> <span>Diet:</span> ${h(dietName)}</span>`;
        }
        if (uniqueAllergies) {
            metaBadgesHtml += `<span class="oc-meta-badge oc-allergy"><i class="fas fa-exclamation-triangle"></i> <span>Allergy:</span> ${h(uniqueAllergies)}</span>`;
        }
        metaBadgesHtml += `</div>`;
    }

    var itemsHtml = items.map(function (o, index) {
        var isItemFinished = o.STATUS === "Ready" || o.STATUS === "Delivered";
        var isCooking = o.STATUS === "Preparing";
        var isDenied = o.ISDENIED == 1 || o.ISDENIED === true || o.STATUS === "Denied";
        var canStart = (o.STATUS === "Placed" || o.STATUS === "Confirmed") && !isDenied;
        var readyLabel = (foodOrderingFlag === 1) ? "Ready" : "Delivered";

        var itemClass = isDenied ? "oc-item-denied" : isCooking ? "oc-item-cooking" : isItemFinished ? "oc-item-completed" : "";

        var statusHtml = "";
        if (isDenied) {
            statusHtml = `<span class="oc-item-status oc-status-denied"><i class="fas fa-times-circle"></i> Denied</span>`;
        } else if (isCooking) {
            statusHtml = `<span class="oc-item-status oc-status-cooking"><span class="oc-status-dot"></span> Preparing</span>`;
        } else if (isItemFinished) {
            statusHtml = `<span class="oc-item-status oc-status-completed"><i class="fas fa-check-circle"></i> ${h(o.STATUS)}</span>`;
        } else {
            statusHtml = `<span class="oc-item-status oc-status-pending"><span class="oc-status-dot"></span> ${h(o.STATUS || "Pending")}</span>`;
        }

        var actionHtml = "";
        if (isDenied) {
            actionHtml = `<span class="oc-denied-label"><i class="fas fa-times-circle"></i> Denied</span>`;
        } else if (isItemFinished) {
            actionHtml = `<button type="button" class="oc-action-btn oc-print-btn" onclick="PrintItemSticker(${jsArg(o.ID)})"><i class="fas fa-print"></i> Print</button>`;
        } else if (canStart) {
            // Show Start & Deny when Placed/Confirmed
            actionHtml = `
                <button type="button" class="oc-action-btn oc-start-btn" onclick="ChangeStatus(${jsArg(o.ID)}, 'Preparing')"><i class="fas fa-play"></i> Start</button>
                <button type="button" class="oc-action-btn oc-deny-btn" onclick="OpenDenyModal(${jsArg(o.ID)}, ${jsArg(o.ITEMNAME)})"><i class="fas fa-times-circle"></i> Deny</button>`;
        } else if (isCooking) {
            // Hide Deny button when Cooking
            actionHtml = `<button type="button" class="oc-action-btn oc-ready-btn" onclick="ChangeStatus(${jsArg(o.ID)}, 'Ready')"><i class="fas fa-check"></i> ${readyLabel}</button>`;
        }

        return `
            <div class="oc-food-item ${itemClass}">
                <div class="oc-food-main">
                    <div class="oc-food-name-row">
                        <span class="oc-quantity">${h(o.QUANTITY)}<small>x</small></span>
                        <span class="oc-food-name">${h(o.ITEMNAME)}</span>
                    </div>
                    <div class="oc-food-details">
                        <span class="oc-item-reference"><i class="fas fa-hashtag"></i> ${h(orderId)}-${index + 1}</span>
                        ${statusHtml}
                    </div>
                    ${isDenied ? `
                        <div class="oc-denied-reason">
                            <i class="fas fa-info-circle"></i> ${h(o.DENIEDREASON || "No reason provided")}
                        </div>
                    ` : ""}
                </div>
                <div class="oc-food-actions">${actionHtml}</div>
            </div>`;
    }).join("");

    var extrasHtml = "";
    if (specialInstruction || delayNotified || menuChanged) {
        extrasHtml = `<div class="oc-extras">`;
        if (specialInstruction) {
            extrasHtml += `
                <div class="oc-instruction">
                    <i class="fas fa-comment-dots"></i>
                    <div>
                        <span class="oc-extra-heading">Special Instructions</span>
                        <span class="oc-extra-description">${h(specialInstruction)}</span>
                    </div>
                </div>`;
        }
        if (delayNotified || menuChanged) {
            extrasHtml += `<div class="oc-alert-group">`;
            if (delayNotified) {
                extrasHtml += `
                    <div class="oc-alert oc-delay-alert" title="${h(delayReason)}">
                        <i class="fas fa-clock"></i>
                        <span><strong>Delayed ${delayMinutes} min</strong> ${delayReason ? " — " + h(delayReason) : ""}</span>
                    </div>`;
            }
            if (menuChanged) {
                extrasHtml += `
                    <div class="oc-alert oc-menu-alert" title="${h(menuReason)}">
                        <i class="fas fa-utensils"></i>
                        <span><strong>Menu changed</strong> ${menuReason ? " — " + h(menuReason) : ""}</span>
                    </div>`;
            }
            extrasHtml += `</div>`;
        }
        extrasHtml += `</div>`;
    }

    var cardClass = isFinished ? "oc-completed-card" : isPreorder ? "oc-preorder-card" : "oc-instant-card";

    return `
        <div class="order-card oc-card ${cardClass}">
            <div class="oc-header">
                <div class="oc-header-left">
                    <div class="oc-primary-info">
                        ${badgeHtml}
                        <span class="oc-order-number"><span>ORD</span> ${h(orderId)}</span>
                        <span class="oc-patient"><i class="far fa-user"></i> ${h(firstItem.ORDERBY || firstItem.PATIENTNAME || "Patient")}</span>
                        <span class="oc-room"><i class="fas fa-door-open"></i> Room ${h(firstItem.ROOMNO)}</span>
                    </div>
                    <div class="oc-time"><i class="far fa-clock"></i> ${h(displayTime)}</div>
                    ${metaBadgesHtml}
                </div>
                <div class="oc-header-actions">
                    ${!isFinished ? `
                        <button type="button" class="oc-header-btn oc-delay-btn" onclick="OpenDelayModal(${jsArg(orderId)})"><i class="fas fa-clock"></i> Delay</button>
                        <button type="button" class="oc-header-btn oc-alternate-btn" onclick="OpenAltFoodModal(${jsArg(orderId)}, ${jsArg(firstItem.MEALTYPE)})"><i class="fas fa-exchange-alt"></i> Alternate Food</button>
                    ` : ""}
                    <button type="button" class="oc-header-btn oc-docket-btn" onclick="PrintFullDocket(${jsArg(orderId)}, ${jsArg(firstItem.MEALTYPE)})"><i class="fas fa-print"></i> Print Order</button>
                </div>
            </div>
            ${extrasHtml}
            <div class="oc-body">
                <div class="oc-items-heading">
                    <span><i class="fas fa-utensils"></i> Order Items</span>
                    <span class="oc-item-count">${items.length} ${items.length === 1 ? "Item" : "Items"}</span>
                </div>
                <div class="oc-items-list">${itemsHtml}</div>
            </div>
        </div>`;
}

function OpenDenyModal(rowId, itemName) {
    $('#hdnDenyRowId').val(rowId);
    $('#txtDenyItemName').val(itemName);
    $('#txtDenyReason').val('');

    var modal = new bootstrap.Modal(document.getElementById('denyFoodModal'));
    modal.show();
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
        encodeURIComponent(Encrypt("DENYFOOD")) +
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
                LoadMyStation();
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

function OpenDelayModal(orderId) {
    $('#hdnDelayOrderId').val(orderId);
    $('#txtDelayMinutes').val(15);
    $('#txtDelayReason').val('');
    new bootstrap.Modal(document.getElementById('delayModal')).show();
}

function SubmitDelay() {
    var orderId = $('#hdnDelayOrderId').val();
    var minutes = parseInt($('#txtDelayMinutes').val(), 10);
    var reason = $('#txtDelayReason').val().trim();

    if (!orderId) return;
    if (!minutes || minutes < 1 || minutes > 240) {
        ShowToast('Enter delay minutes between 1 and 240', 'error');
        return;
    }

    var userName = sessionStorage.getItem('NAME') || 'System';
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("NOTIFYDELAY")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(String(orderId))) +
        "&MINUTES=" + encodeURIComponent(Encrypt(String(minutes))) +
        "&REASON=" + encodeURIComponent(Encrypt(reason)) +
        "&USER=" + encodeURIComponent(Encrypt(userName));

    $.ajax({
        url: url,
        type: "POST",
        success: function (res) {
            var ok = false;
            try { ok = (JSON.parse(res)[0] || {}).RESULT === "TRUE"; } catch (e) { }
            if (ok) {
                bootstrap.Modal.getInstance(document.getElementById('delayModal')).hide();
                ShowToast('Patient notified of ' + minutes + ' minute delay', 'success');

                for (var i = 0; i < globalData.length; i++) {
                    if (String(globalData[i].ORDERID) === String(orderId)) {
                        globalData[i].DELAY_NOTIFIED = 1;
                        globalData[i].DELAY_MINUTES = minutes;
                        globalData[i].DELAY_REASON = reason;
                    }
                }

                LoadMyStation();
            } else {
                ShowToast('Failed to notify patient', 'error');
            }
        },
        error: function () { ShowToast('Failed to notify patient', 'error'); }
    });
}

var _altMenuCache = {};

function OpenAltFoodModal(orderId, mealType) {
    $('#hdnAltOrderId').val(orderId);
    $('#txtAltReason').val('');
    $('#ddlAltNewItem').html('<option value="">— Select alternate item —</option>');
    $('#ddlAltCurrentItem').html('<option value="">— Loading items… —</option>');

    var orderItems = globalData.filter(function (x) {
        var gId = String(x.ORDERID || '').trim().toUpperCase();
        var targetId = String(orderId).trim().toUpperCase();
        return gId === targetId;
    });

    var itemHtml = '';
    if (orderItems.length === 0) {
        itemHtml = '<option value="">— No items found —</option>';
    } else {
        $.each(orderItems, function (i, item) {
            var rowId = item.ID;
            var iName = item.ITEMNAME || 'Unknown Item';
            var iQty = item.QUANTITY || 1;
            var isDenied = (item.ISDENIED == 1 || item.ISDENIED === true || item.STATUS === 'Denied');

            // HIDE DENIED ITEMS FROM ALTERNATE DROPDOWN
            if (rowId !== '' && rowId !== null && rowId !== undefined && !isDenied) {
                itemHtml += '<option value="' + rowId + '">' + escapeHtml(iName) + ' (' + iQty + 'x)</option>';
            }
        });
    }
    $('#ddlAltCurrentItem').html(itemHtml);

    var modal = new bootstrap.Modal(document.getElementById('altFoodModal'));
    modal.show();

    var cacheKey = String(orderId) + '|' + String(mealType || '');

    if (_altMenuCache[cacheKey]) {
        OnAltItemSelected();
        return;
    }

    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETALTERNATEMENU")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(String(orderId))) +
        "&CATEGORY=" + encodeURIComponent(Encrypt(String(mealType || '')));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0 && res[0].RESULT === "FALSE") {
                var msg = res[0].MESSAGE || 'Failed to load alternate menu';
                $('#ddlAltNewItem').html('<option value="">— ' + escapeHtml(msg) + ' —</option>');
                ShowToast(msg, 'error');
                return;
            }
            _altMenuCache[cacheKey] = res || [];
            OnAltItemSelected();
        },
        error: function () {
            $('#ddlAltNewItem').html('<option value="">— Failed to load —</option>');
        }
    });
}

function SubmitAlternateFood() {
    var orderId = $('#hdnAltOrderId').val();
    var oldRowId = $('#ddlAltCurrentItem').val();
    var newItemId = $('#ddlAltNewItem').val();
    var reason = $('#txtAltReason').val().trim();

    if (!orderId) return;

    if (!oldRowId || oldRowId === "" || oldRowId === "undefined") {
        ShowToast('Please select the item you want to change', 'error');
        return;
    }
    if (!newItemId || newItemId === "" || newItemId === "undefined") {
        ShowToast('Please select an alternate item', 'error');
        return;
    }

    var userName = sessionStorage.getItem('NAME') || 'System';
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("APPLYALTERNATEMENU")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(String(orderId))) +
        "&OLDITEMID=" + encodeURIComponent(Encrypt(String(oldRowId))) + 
        "&NEWITEMID=" + encodeURIComponent(Encrypt(String(newItemId))) +
        "&REASON=" + encodeURIComponent(Encrypt(reason)) +
        "&USER=" + encodeURIComponent(Encrypt(userName));

    $.ajax({
        url: url,
        type: "POST",
        success: function (res) {
            var ok = false, newName = '', errorMsg = '';
            try {
                var data = JSON.parse(res);
                ok = (data[0] || {}).RESULT === "TRUE";
                newName = (data[0] || {}).NEWITEMNAME || '';
                errorMsg = (data[0] || {}).MESSAGE || '';
            } catch (e) { }

            if (ok) {
                bootstrap.Modal.getInstance(document.getElementById('altFoodModal')).hide();
                ShowToast('Item replaced with ' + (newName || 'alternate item'), 'success');
                LoadMyStation();
            } else {

                ShowToast(errorMsg || 'Failed to apply alternate menu', 'error');
            }
        },
        error: function () { ShowToast('Server connection error', 'error'); }
    });
}

function OnAltItemSelected() {
    var orderId = $('#hdnAltOrderId').val();
    var currentItemId = $('#ddlAltCurrentItem').val();
    var mealType = $('#ddlAltCurrentItem option:selected').data('mealtype') || '';

    var cacheKey = String(orderId) + '|' + String(mealType);
    var items = _altMenuCache[cacheKey] || [];

    if (!items || items.length === 0) {
        for (var key in _altMenuCache) {
            if (key.indexOf(orderId) === 0) {
                items = _altMenuCache[key];
                break;
            }
        }
    }

    PopulateNewAltDropdown(items, currentItemId);
}

function PopulateNewAltDropdown(items, currentItemId) {
    if (!items || items.length === 0) {
        $('#ddlAltNewItem').html('<option value="">— No alternate items available —</option>');
        return;
    }
    var html = '<option value="">— Select alternate item —</option>';
    $.each(items, function (i, it) {
        if (String(it.ID) === String(currentItemId)) return;
        html += '<option value="' + it.ID + '">' + escapeHtml(it.FOODNAME || '') + '</option>';
    });
    $('#ddlAltNewItem').html(html);
}


function ChangeStatus(id, requestedStatus) {

    var finalStatus = requestedStatus;
    if (requestedStatus === 'Ready' && foodOrderingFlag === 0) {
        finalStatus = 'Delivered';
    }

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("UPDATEFOODORDERSTATUS")) +
        "&ID=" + encodeURIComponent(Encrypt(id.toString())) +
        "&STATUS=" + encodeURIComponent(Encrypt(finalStatus));

    $.ajax({
        url: url,
        type: "POST",
        success: function (res) {
            try {
                var data = JSON.parse(res);
                if (data[0].RESULT === "TRUE") {
                    $('#LBLRequestResult').html('Order status updated to <b>' + finalStatus + '</b> successfully.');
                    ShowModalPopUp('modalSuccess');
                    LoadMyStation();
                    setTimeout(function () {
                        HideModalPopUp('modalSuccess');
                    }, 1500);
                }
            } catch (e) {
                console.error("ChangeStatus parse error:", e);
            }
        }
    });
}

function PrintFullDocket(orderId, mealType) {
    var items = globalData.filter(x => x.ORDERID == orderId && x.MEALTYPE == mealType);
    if (items.length === 0) return;

    var o = items[0];
    var badgeHtml = "";
    if (o.ISPREORDER == "1") {
        badgeHtml = `<div style="border: 1.5px solid #4338ca; color: #4338ca; background-color: #f5f3ff; padding: 3px 12px; border-radius: 20px; display: inline-flex; align-items: center; font-size: 11px; font-weight: 800; text-transform: uppercase;"><span style="margin-right: 6px; font-size: 12px;">📅</span> PRE-ORDER</div>`;
    } else {
        badgeHtml = `<div style="border: 1.5px solid #eab308; color: #856404; background-color: #fefce8; padding: 3px 12px; border-radius: 20px; display: inline-flex; align-items: center; font-size: 11px; font-weight: 800; text-transform: uppercase;"><span style="margin-right: 6px; font-size: 12px;">⚡</span> INSTANT</div>`;
    }

    var dietName = o.DIETTYPE || "";
    var instructions = items.map(x => x.SPECIALINSTRUCTION).filter(x => x && x.trim() !== "" && x.toLowerCase() !== "none");
    var uniqueInstructions = [...new Set(instructions)].join(" | ");

    var delayNotified = o.DELAY_NOTIFIED == 1 || o.DELAY_NOTIFIED == "1";
    var delayReason = (o.DELAY_REASON || "").trim();

    var changedItem = items.find(x => x.MENUCHANGED == 1 || x.MENUCHANGED == "1");
    var altFoodText = "";
    if (changedItem) {
        var reason = (changedItem.MENUCHANGE_REASON || "").trim();
        altFoodText = (reason && reason !== changedItem.ITEMNAME) ? `${changedItem.ITEMNAME} (${reason})` : changedItem.ITEMNAME;
    }

    var allAllergies = items.map(x => x.ALLERGENS).filter(x => x && x.toLowerCase() !== "none" && x.trim() !== "");
    var uniqueAllergies = [...new Set(allAllergies)].join(", ");

    // Construct the separate colored boxes for Diet and Allergy
    var topBoxesHtml = `<div style="margin: 15px 0; display: flex; flex-direction: column; gap: 8px;">`;
    if (dietName) {
        topBoxesHtml += `
            <div style="border: 1.5px solid #bbf7d0; background-color: #f0fdf4; color: #15803d; padding: 10px 15px; border-radius: 8px; font-weight: 800; font-size: 13px; display: flex; align-items: center; text-transform: uppercase;">
                <i class="fas fa-leaf" style="margin-right: 10px; font-size: 16px;"></i> DIET: ${dietName}
            </div>`;
    }
    if (uniqueAllergies) {
        topBoxesHtml += `
            <div style="border: 1.5px solid #fecaca; background-color: #fff5f5; color: #b91c1c; padding: 10px 15px; border-radius: 8px; font-weight: 800; font-size: 13px; display: flex; align-items: center; text-transform: uppercase;">
                <i class="fas fa-exclamation-triangle" style="margin-right: 10px; font-size: 16px;"></i> ALLERGIES: ${uniqueAllergies}
            </div>`;
    }
    topBoxesHtml += `</div>`;

    // Construct the Grey box for other info (Delay, Alternate, Instructions)
    var greyBoxContent = "";
    if (delayNotified) {
        greyBoxContent += `<div style="margin-bottom: 4px;">DELAY: ${o.DELAY_MINUTES} MIN ${delayReason ? '— ' + delayReason : ''}</div>`;
    }
    if (changedItem) {
        greyBoxContent += `<div style="margin-bottom: 4px;">ALTERNATE FOOD: ${altFoodText}</div>`;
    }
    if (uniqueInstructions) {
        greyBoxContent += `<div>SPECIAL INSTRUCTION: ${uniqueInstructions}</div>`;
    }

    var greyBoxHtml = greyBoxContent !== "" ? `
        <div style="border: 1.5px solid #e2e8f0; background-color: #f8fafc; color: #475569; padding: 12px 15px; border-radius: 8px; font-weight: 700; font-size: 13px; font-style: italic; margin-bottom: 15px; text-transform: uppercase;">
            ${greyBoxContent}
        </div>
    ` : '';

    var tableRows = items.map((item, index) => {
        var isDenied = (item.ISDENIED == 1 || item.ISDENIED === true || item.STATUS === 'Denied');

        var itemNameStyle = isDenied ? 'text-decoration: line-through; color: #dc2626; opacity: 0.7;' : 'color: #000;';
        var qtyStyle = isDenied ? 'text-decoration: line-through; color: #dc2626; opacity: 0.7;' : 'color: #000;';

        var statusLabel = isDenied ? `
            <div style="font-size: 11px; font-weight: 800; color: #dc2626; text-transform: uppercase; margin-top: 4px; text-decoration: none; font-style: normal;">
                ⛔ DENIED: ${item.DENIEDREASON || 'No reason provided'}
            </div>` : '';

        return `
            <tr style="border-bottom: 1px dotted #cbd5e1;">
                <td style="padding: 15px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">${item.ORDERID}-${index + 1}</td>
                <td style="padding: 15px 0; font-size: 15px; font-weight: 900; ${qtyStyle} vertical-align: top;">${item.QUANTITY}x</td>
                <td style="padding: 15px 0; font-size: 15px; font-weight: 600; vertical-align: top;">
                    <span style="${itemNameStyle}">${item.ITEMNAME}</span>
                    ${statusLabel}
                </td>
                <td style="padding: 15px 0; text-align: right; vertical-align: top;">
                    <div style="width: 18px; height: 18px; border: 2px solid ${isDenied ? '#cbd5e1' : '#1e293b'}; border-radius: 4px; display: inline-block;"></div>
                </td>
            </tr>`;
    }).join('');

    var html = `
        <div style="border: 2.5px solid #1e293b; border-radius: 15px; padding: 25px; width: 480px; margin: auto; font-family: 'Segoe UI', Tahoma, sans-serif; background: #fff; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 0.5px;">DIAL50 · KITCHEN ORDER DOCKET</div>
                <div style="text-align: right;">
                    <div style="font-size: 10px; font-weight: 700; color: #64748b;">ORDER NO</div>
                    <div style="font-size: 18px; font-weight: 900; color: #000;">#${o.ORDERID}</div>
                </div>
            </div>

            <h1 style="font-size: 32px; font-weight: 900; margin: 0; color: #000;">${o.MEALTYPE}</h1>
            
            <div style="margin-top: 15px;">${badgeHtml}</div>

            <div style="margin-top: 25px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">${o.ORDERBY || o.PATIENTNAME}</h2>
                <p style="font-size: 18px; font-weight: 600; color: #64748b; margin: 5px 0 0 0;">Room ${o.ROOMNO}</p>
            </div>

            ${topBoxesHtml}
            ${greyBoxHtml}

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="text-align: left; border-bottom: 2.5px solid #1e293b;">
                        <th style="padding: 10px 0; font-size: 12px; font-weight: 800; color: #64748b;">ITEM NO</th>
                        <th style="padding: 10px 0; font-size: 12px; font-weight: 800; color: #64748b;">QTY</th>
                        <th style="padding: 10px 0; font-size: 12px; font-weight: 800; color: #64748b;">ITEM</th>
                        <th style="padding: 10px 0; width: 30px;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>`;

    openPrintWindow(html);
}

function PrintItemSticker(id) {
    var o = globalData.find(x => x.ID == id);
    if (!o) return;
    var allergyHtml = "";
    if (o.ALLERGENS && o.ALLERGENS.toLowerCase() !== "none" && o.ALLERGENS.trim() !== "") {
        allergyHtml = `
            <div style="border: 1.5px solid #fecaca; background-color: #fff5f5; color: #b91c1c; 
                        padding: 8px 12px; border-radius: 8px; font-weight: 800; font-size: 12px; 
                        margin-top: 15px; display: flex; align-items: center; text-transform: uppercase;">
                <span style="margin-right: 8px; font-size: 14px;">⚠</span> 
                ALLERGIES: ${o.ALLERGENS}
            </div>`;
    }

    var html = `
        <div style="border: 2.5px solid #1e293b; border-radius: 15px; padding: 25px; width: 360px; 
                    margin: auto; font-family: 'Segoe UI', Tahoma, sans-serif; background: #fff;">
            
            <div style="font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; margin-bottom: 5px;">
                DIAL50 · ITEM STICKER
            </div>
            
            <h1 style="font-size: 26px; font-weight: 900; margin: 0; color: #000; line-height: 1.2;">
                ${o.QUANTITY}x ${o.ITEMNAME}
            </h1>
            
            <div style="font-size: 14px; font-weight: 500; color: #64748b; margin-top: 2px; margin-bottom: 20px;">
                ${o.MEALTYPE}
            </div>

            <div style="margin-top: 15px;">
                <h2 style="font-size: 20px; font-weight: 700; color: #94a3b8; margin: 0;">
                    ${o.ORDERBY || o.PATIENTNAME}
                </h2>
                <p style="font-size: 15px; font-weight: 600; color: #cbd5e1; margin: 2px 0 0 0;">
                    Room ${o.ROOMNO}
                </p>
            </div>

            ${allergyHtml}

            <div style="border-top: 1px dotted #e2e8f0; margin-top: 15px; padding-top: 8px; 
                        font-size: 11px; font-weight: 600; color: #94a3b8;">
                #${o.ORDERID}
            </div>
        </div>`;

    openPrintWindow(html);
}

function getFormattedTimeDisplay(createdOn) {
    if (!createdOn) return "placed --";

    var orderDate;
    if (typeof createdOn === "string" && createdOn.indexOf("Date") !== -1) {
        var miliseconds = parseInt(createdOn.replace(/\/Date\((.*?)\)\//gi, "$1"));
        orderDate = new Date(miliseconds);
    } else {
        orderDate = new Date(createdOn);
    }
    if (isNaN(orderDate.getTime())) {
        return "placed --";
    }

    var now = new Date();
    var hours = orderDate.getHours();
    var minutes = orderDate.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var timeStr = hours + ':' + minutes + ' ' + ampm;
    var diffMs = (now - orderDate);
    if (diffMs < 0) diffMs = 0;

    var diffHrs = Math.floor(diffMs / 3600000);
    var diffMins = Math.round(((diffMs % 3600000) / 60000));

    var agoStr = "";
    if (diffHrs > 0) {
        agoStr += diffHrs + "h ";
    }
    agoStr += diffMins + "m ago";

    return `placed ${timeStr} · ${agoStr}`;
}
function openPrintWindow(content) {
    var w = 900;
    var h = 800;
    var left = (window.screen.width / 2) - (w / 2);
    var top = (window.screen.height / 2) - (h / 2);
    var printWindow = window.open('', '_blank',
        'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left + ',toolbars=no,scrollbars=yes,status=no,resizable=yes');

    if (!printWindow) {
        alert("Browser blocked the print window. Please allow popups for this site.");
        return;
    }
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Preview</title>
                <style>
                    @media print {
                        @page { margin: 0; }
                        body { margin: 1.6cm; }
                    }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                </style>
            </head>
            <body>
                ${content}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
        </html>
    `);

    printWindow.document.close();
}

function resetStatusFilter() {
    currentStatusFilter = "all";
    $(".status-filter").removeClass("active");
    $(".status-filter[data-status='all']").addClass("active");
    $("#filter-notification").addClass("d-none");
    $(".filter-tabs-wrapper").removeClass("d-none");
    renderDashboard();
}

function toggleAccordion(el) {
    $(el).next(".accordion-body").slideToggle(300);
    $(el).find(".arrow").toggleClass("fa-chevron-down fa-chevron-up");
}




function createFeedbackCard(items) {
    var o = items[0];
    var rating = parseInt(o.RATING);
    var ratingText = "", ratingClass = "", ratingIcon = "";

    if (rating === 0) {
        ratingText = "UNSATISFIED"; ratingClass = "rating-low"; ratingIcon = '<i class="fas fa-frown me-2"></i>';
    } else if (rating === 1) {
        ratingText = "NEUTRAL"; ratingClass = "rating-mid"; ratingIcon = '<i class="fas fa-meh me-2"></i>';
    } else {
        ratingText = "SATISFIED"; ratingClass = "rating-high"; ratingIcon = '<i class="fas fa-smile me-2"></i>';
    }

    var itemsListHtml = items.map(item => `
        <div class="d-flex align-items-center mb-2">
            <span class="qty me-2" style="font-weight:700; color:#64748b;">${item.QUANTITY}x</span>
            <span class="item-name" style="font-size:16px; font-weight:600;">${item.ITEMNAME}</span>
        </div>
    `).join('');

    return `
    <div class="order-card feedback-card mb-4" id="feedback-card-${o.ORDERID}">
        <div class="order-card-header bg-white">
            <div class="d-flex gap-2 align-items-center">
                <span class="rating-badge ${ratingClass}">${ratingIcon} ${ratingText}</span>
                <span class="order-no-box">ORD-${o.ORDERID}</span>
                <span class="patient-info ms-1"><b>${o.PATIENTNAME || o.ORDERBY}</b></span>
                <span class="room-info">Room ${o.ROOMNO}</span>
            </div>
            <div class="text-muted" style="font-size:11px;">Delivered: ${o.DELIVEREDON || 'Today'}</div>
        </div>
        
        <div class="order-item-strip border-0 bg-white d-flex justify-content-between align-items-center">
            <div class="item-info-side">
                ${itemsListHtml}
                <div class="mt-2 text-muted" style="font-style: italic; font-size: 13px;">
                    "${o.FeedBack || 'No specific comments provided.'}"
                </div>
            </div>
            <div class="action-side">
                <!-- CONDITION: Only show button if rating is 0 (Unsatisfied) -->
                ${rating === 0 ? `
                    <button type="button" class="btn-acknowledge" onclick="ShowRemarkBox('${o.ORDERID}')">
                        Acknowledge
                    </button>
                ` : ''}
            </div>
        </div>

        <div class="remark-container" id="remark-area-${o.ORDERID}" style="display:none;">
            <label class="d-block mb-2 fw-bold text-dark" style="font-size:13px;">Resolution Remark:</label>
            <textarea class="txt-feedback-remark" id="input-remark-${o.ORDERID}" placeholder="Explain how this was resolved..."></textarea>
            <div class="d-flex gap-2">
                <button type="button" class="btn-save-remark" onclick="SubmitAcknowledgementByOrder('${o.ORDERID}')">Submit & Resolve</button>
                <button type="button" class="btn-cancel-remark" onclick="$('#remark-area-${o.ORDERID}').slideUp()">Cancel</button>
            </div>
        </div>
    </div>`;
}

function ShowRemarkBox(id) {
    $(".remark-container").slideUp();
    $(`#remark-area-${id}`).slideDown();
    $(`#input-remark-${id}`).focus();
}


function SubmitAcknowledgementByOrder(orderId) {
    var remark = $(`#input-remark-${orderId}`).val();
    if (remark.trim() === "") {
        alert("Please enter a remark.");
        return;
    }

    var userName = sessionStorage.getItem('NAME');
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("ACKNOWLEDGEFEEDBACK")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId)) +
        "&REMARK=" + encodeURIComponent(Encrypt(remark)) +
        "&USER=" + encodeURIComponent(Encrypt(userName));

    $.ajax({
        url: url,
        type: "POST",
        success: function (res) {
            $(`#feedback-card-${orderId}`).fadeOut(300, function () {
                $('#LBLRequestResult').html('Feedback Acknowledged Successfully.');
                ShowModalPopUp('modalSuccess');

                setTimeout(function () {
                    HideModalPopUp('modalSuccess');
                }, 2000);

                globalData = globalData.filter(x => x.ORDERID.toString() !== orderId.toString());


                var feedbackBox = $("#total-feedback");
                var currentCount = parseInt(feedbackBox.text()) || 0;
                if (currentCount > 0) {
                    feedbackBox.text(currentCount - 1);
                }
                $(`#feedback-card-${orderId}`).fadeOut(400, function () {
                    $(this).remove();
                    renderDashboard();
                });
            });
        }
    });
}

function getStationRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '0').toString();
}

function LoadNotifications() {
    var roleId = getStationRoleId();
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
    var roleId = getStationRoleId();
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
    var roleId = getStationRoleId();
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
    var roleId = getStationRoleId();
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

function ReloadStationData(btn) {
    if (btn && btn.classList.contains('spinning')) return;

    if (btn) btn.classList.add('spinning');

    try {
        LoadMyStation();
        LoadNotifications();
        GetUnreadCount();
        ShowToast('Data refreshed', 'success');
    } catch (e) {
        console.error('[MyStation] Refresh error:', e);
        ShowToast('Failed to refresh', 'error');
    }

    setTimeout(function () {
        if (btn) btn.classList.remove('spinning');
    }, 900);
}