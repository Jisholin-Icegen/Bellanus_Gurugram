var API_URL = '';
var cachedRecentOrders = null;
var lastSuccessfulLoad = null;
var isLoadingRecentOrders = false;
var loadOrder = [];
var isLoading = false;

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

function getDateRange(range) {
    var endDate = new Date();
    var startDate = new Date();
    if (range === '7') {
        startDate.setDate(endDate.getDate() - 7);
    } else if (range === '30') {
        startDate.setDate(endDate.getDate() - 30);
    } else if (range === '90') {
        startDate.setDate(endDate.getDate() - 90);
    }
    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
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

function updateCompliments(items, type) {
    var isCompliment = type === 'compliments';
    var containerId = isCompliment ? '#complimentsList' : '#complaintsList';

    var color = isCompliment ? '#00B774' : '#FF2438';
    var bgColor = isCompliment ? 'rgba(0, 183, 116, 0.08)' : 'rgba(255, 36, 56, 0.08)';
    var borderColor = isCompliment ? 'rgba(0, 183, 116, 0.25)' : 'rgba(255, 36, 56, 0.25)';

    var html = '';
    if (items && items.length > 0) {
        $.each(items, function (i, item) {
            var text = item.NAME || item.Name || '';
            if (text) {

                html += '<span style="display:inline-block; background:' + bgColor + '; color:' + color + '; ' +
                    'padding: 4px 10px; border-radius: 50px; font-size: 11px; font-weight: 600; ' +
                    'border: 1px solid ' + borderColor + '; margin-right: 6px; margin-bottom: 6px; ' +
                    'font-family: sans-serif;">' + escapeHtml(text) + '</span>';
            }
        });
        if (!html) {
            html = '<span style="color: #9ca3af; font-size: 11px; font-style: italic;">No ' + type + ' recorded</span>';
        }
    } else {
        html = '<span style="color: #9ca3af; font-size: 11px; font-style: italic;">No ' + type + ' recorded</span>';
    }
    $(containerId).html(html);
}


function updateStockItems(items) {
    var stockHtml = '';
    var colors = ['#b45309', '#f59e0b', '#4b5563', '#dc2626', '#7c3aed'];
    if (items && items.length > 0) {
        $.each(items, function (i, item) {
            var color = colors[i % colors.length];
            var bgColor = color + '20';
            var borderColor = color + '33';
            stockHtml += '<div class="stockup-item" style="display: flex; justify-content: space-between; align-items: center; background: ' + bgColor + '; color: ' + color + '; padding: 6px 16px; border-radius: 12px; font-size: 13px; border: 1px solid ' + borderColor + '; margin-bottom: 4px;">' +
                '<span style="font-weight: 500; color: ' + color + ';">' + escapeHtml(item.NAME || '') + '</span>' +
                '<span style="color: ' + color + '; font-weight: 600;">' + escapeHtml(item.QUANTITY || '') + '</span>' +
                '</div>';
        });
    } else {
        stockHtml = '<div style="text-align:center;color:#9ca3af;font-size:12px;padding:8px 0;">No stock items to display</div>';
    }
    $('#stockupItems').html(stockHtml);
}

function loadDashboardData(callback) {
    var dateRange = $('#dateRangeSelect').val() || '30';
    var dates = getDateRange(dateRange);
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETDASHBOARDSUMMARY")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var data = res[0];
                $('#lblTotalOrders').text(data.TOTALORDERS || 0);
                $('#lblDeliveredCount').text(data.DELIVERED || 0);
                $('#lblCancelledCount').text(data.CANCELLED || 0);
                $('#lblPendingDeliveries').text(data.PENDINGDELIVERIES || 0);
                $('#lblKitchenOrders').text(data.KITCHENORDERS || 0);
                $('#lblActiveDiets').text(data.ACTIVEDIETS || 0);
                $('#lblActivePatients').text(data.ACTIVEPATIENTS || 0);
                $('#lblPatientsOnDiet').text(data.PATIENTSONDIET || 0);
                $('#slaOnTime').text(data.SLAONTIME || 0);
                $('#slaTotal').text(data.SLATOTAL || 0);
                $('#slaAvg').text(data.SLAAVG || 0);
                $('#slaPercentage').text((data.SLAPERCENTAGE || 0) + '%');
            }
            updateLastSyncedTime();
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.log("Error loading dashboard data:", error);
            $('#lblTotalOrders').text(0);
            $('#lblDeliveredCount').text(0);
            $('#lblCancelledCount').text(0);
            $('#lblPendingDeliveries').text(0);
            $('#lblKitchenOrders').text(0);
            $('#lblActiveDiets').text(0);
            $('#lblActivePatients').text(0);
            $('#lblPatientsOnDiet').text(0);
            $('#slaOnTime').text(0);
            $('#slaTotal').text(0);
            $('#slaAvg').text(0);
            $('#slaPercentage').text('0%');
            if (callback) callback();
        }
    });
}

function loadDietCategoryMix(callback) {
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETDIETCATEGORYMIX"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var labels = [];
                var data = [];
                var colors = ['#18b67a', '#5b5ce6', '#f59e0b', '#ef4444', '#14b8d4', '#9333ea', '#84cc16'];
                $.each(res, function (i, item) {
                    labels.push(item.CATEGORYNAME || 'Other');
                    data.push(item.COUNT || 0);
                });
                initDietPieChart(labels, data, colors);
                updateDietLegend(labels, data, colors);
            } else {
                initDietPieChart(['No Data'], [1], ['#e5e7eb']);
                updateDietLegend(['No Data'], [1], ['#e5e7eb']);
            }
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.log("Error loading diet category mix:", error);
            initDietPieChart(['No Data'], [1], ['#e5e7eb']);
            updateDietLegend(['No Data'], [1], ['#e5e7eb']);
            if (callback) callback();
        }
    });
}

function loadOrderVolume(callback) {
    var dateRange = $('#dateRangeSelect').val() || '30';
    var dates = getDateRange(dateRange);
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETORDERVOLUME")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var labels = [];
                var orders = [];
                var delivered = [];
                var cancelled = [];
                $.each(res, function (i, item) {
                    labels.push(item.DATE || '');
                    orders.push(item.ORDERS || 0);
                    delivered.push(item.DELIVERED || 0);
                    cancelled.push(item.CANCELLED || 0);
                });
                initOrderVolumeChart(labels, orders, delivered, cancelled);
            } else {
                initOrderVolumeChart([], [], [], []);
            }
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.log("Error loading order volume:", error);
            initOrderVolumeChart([], [], [], []);
            if (callback) callback();
        }
    });
}

function loadTopMenuItems(callback) {
    var dateRange = $('#dateRangeSelect').val() || '30';
    var dates = getDateRange(dateRange);
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETTOPMENUITEMS")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate)) +
        "&TOPN=" + encodeURIComponent(Encrypt("10"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var labels = [];
                var data = [];
                $.each(res, function (i, item) {
                    labels.push(item.ITEMNAME || 'Unknown');
                    data.push(item.QUANTITY || 0);
                });
                initTopMenuChart(labels, data);
            } else {
                initTopMenuChart(['No items'], [0]);
            }
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.log("Error loading top menu items:", error);
            initTopMenuChart(['No items'], [0]);
            if (callback) callback();
        }
    });
}

function loadSLAData(callback) {
    var dateRange = $('#dateRangeSelect').val() || '30';
    var dates = getDateRange(dateRange);
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETSLADATA")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var data = res[0];
                $('#slaTarget').html(
                    'Target: <strong style="color:#111827;">' +
                    (data.TARGETMINUTES || 45) +
                    ' min</strong> from order placed to delivered'
                );
                $('#slaOnTime').text(data.ONTIME || 0);
                $('#slaTotal').text(data.TOTAL || 0);
                $('#slaAvg').text(data.AVGMINUTES || 0);
                initSLAChart(data.PERCENTAGE || 0);
            } else {
                $('#slaTarget').html('Target: <strong style="color:#111827;">45 min</strong> from order placed to delivered');
                $('#slaOnTime').text(0);
                $('#slaTotal').text(0);
                $('#slaAvg').text(0);
                initSLAChart(0);
            }
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.log("Error loading SLA data:", error);
            $('#slaTarget').html('Target: <strong style="color:#111827;">45 min</strong> from order placed to delivered');
            $('#slaOnTime').text(0);
            $('#slaTotal').text(0);
            $('#slaAvg').text(0);
            initSLAChart(0);
            if (callback) callback();
        }
    });
}

function loadPatientSatisfaction(callback) {
    var dateRange = $('#dateRangeSelect').val() || '30';
    var dates = getDateRange(dateRange);
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETPATIENTSATISFACTION")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 10000,
        success: function (res) {
            if (!res || res.length < 3) {
                setDefaultValues();
                if (callback) callback();
                return;
            }
            var summary = (res[0] && res[0][0]) ? res[0][0] : null;
            var satisfiedPercent = summary ? Math.round(parseFloat(summary.SatisfiedPercent) || 0) : 0;
            $('#satRating').text(satisfiedPercent + '%');
            $('#satRating').css('color', '#00B774');
            var changeData = (res[1] && res[1][0]) ? res[1][0] : null;
            var changeVal = changeData ? parseFloat(changeData.CHANGE || 0) : 0;
            var trendHtml = '';
            if (changeVal > 0) {
                trendHtml = '<span style="color:#00B774; font-size:13px; font-weight:500;">▲ +' + changeVal.toFixed(1) + '% vs prior week</span>';
            } else if (changeVal < 0) {
                trendHtml = '<span style="color:#FF2438; font-size:13px; font-weight:500;">▼ ' + changeVal.toFixed(1) + '% vs prior week</span>';
            } else {
                trendHtml = '<span style="color:#9ca3af; font-size:13px; font-weight:500;">— 0% vs prior week</span>';
            }
            $('#satChange').html(trendHtml);
            var chartData = res[2] || [];
            var labels = [];
            var satisfiedValues = [];
            var neutralValues = [];
            var unsatisfiedValues = [];
            if (chartData && chartData.length > 0) {
                $.each(chartData, function (i, item) {
                    if (item.DATE || item.Date) {
                        var dateVal = item.DATE || item.Date;
                        labels.push(dateVal);
                        satisfiedValues.push(parseFloat(item.SatisfiedPercent || 0));
                        neutralValues.push(parseFloat(item.NeutralPercent || 0));
                        unsatisfiedValues.push(parseFloat(item.UnsatisfiedPercent || 0));
                    }
                });
            }
            if (labels.length === 0) {
                var last7Days = getLast7Days();
                labels = last7Days.labels;
                satisfiedValues = last7Days.values;
                neutralValues = last7Days.values.map(function () { return 0; });
                unsatisfiedValues = last7Days.values.map(function () { return 0; });
            }
            initSatisfactionChart(labels, satisfiedValues, neutralValues, unsatisfiedValues);
            var compliments = res[3] || [];
            updateCompliments(compliments, 'compliments');
            var complaints = res[4] || [];
            updateCompliments(complaints, 'complaints');
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.error("Error loading patient satisfaction:", error);
            setDefaultValues();
            if (callback) callback();
        }
    });
}

function setDefaultValues() {
    $('#satRating').text('0%');
    $('#satRating').css('color', '#00B774');
    $('#satChange').html('<span style="color:#9ca3af; font-size:13px; font-weight:500;">— 0% vs prior week</span>');
    initSatisfactionChart(['No Data'], [0], [0], [0]);
    updateCompliments([], 'compliments');
    updateCompliments([], 'complaints');
    $('#satDates').html('<span style="color: #9ca3af; font-size: 11px;">No data available</span>');
}

function updateSatDates(labels) {
    var html = '';
    if (labels && labels.length > 0) {
        var displayLabels = labels;
        if (displayLabels.length > 7) {
            displayLabels = displayLabels.slice(0, 7);
        }
        $.each(displayLabels, function (i, label) {
            if (label && label !== 'No Data') {
                html += '<span>' + escapeHtml(label) + '</span>';
            }
        });
        if (!html) {
            html = '<span style="color: #9ca3af; font-size: 11px;">No data available</span>';
        }
    } else {
        html = '<span style="color: #9ca3af; font-size: 11px;">No data available</span>';
    }
    $('#satDates').html(html);
}

function loadDemandForecast(callback) {
    var dateRange = $('#dateRangeSelect').val() || '30';
    var dates = getDateRange(dateRange);
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETDEMANDFORECAST")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var data = Array.isArray(res[0]) ? res[0][0] : res[0];
                var forecastHtml = '';
                var items = [
                    { key: 'breakfast', label: 'BREAKFAST', value: data.BREAKFAST || 0, range: data.BREAKFASTRANGE || '0-0', confidence: data.BREAKFASTCONF || 0 },
                    { key: 'lunch', label: 'LUNCH', value: data.LUNCH || 0, range: data.LUNCHRANGE || '0-0', confidence: data.LUNCHCONF || 0 },
                    { key: 'dinner', label: 'DINNER', value: data.DINNER || 0, range: data.DINNERRANGE || '0-0', confidence: data.DINNERCONF || 0 }
                ];
                $.each(items, function (i, item) {
                    forecastHtml += '<div class="forecast-item" style="background: #f8fafc; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #e5e7eb;">' +
                        '<span class="forecast-label" style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; display: block;">' + item.label + '</span>' +
                        '<span class="forecast-value" style="font-size: 28px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 2px;">' + item.value + '</span>' +
                        '<span class="forecast-range" style="font-size: 12px; color: #6b7280; display: block;">' + item.range + '</span>' +
                        '<span class="forecast-confidence" style="font-size: 11px; color: #7c3aed; font-weight: 600; display: block; margin-top: 4px;">' + item.confidence + '% conf.</span>' +
                        '</div>';
                });
                $('#forecastGrid').html(forecastHtml);
                var stockItems = [];
                for (var i = 1; i < res.length; i++) {
                    stockItems.push({
                        NAME: res[i].NAME || "",
                        QUANTITY: res[i].QUANTITY || ""
                    });
                }
                updateStockItems(stockItems);
            } else {
                var emptyHtml = '';
                var items = [
                    { key: 'breakfast', label: 'BREAKFAST', value: 0, range: '0-0', confidence: 0 },
                    { key: 'lunch', label: 'LUNCH', value: 0, range: '0-0', confidence: 0 },
                    { key: 'dinner', label: 'DINNER', value: 0, range: '0-0', confidence: 0 }
                ];
                $.each(items, function (i, item) {
                    emptyHtml += '<div class="forecast-item" style="background: #f8fafc; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #e5e7eb;">' +
                        '<span class="forecast-label" style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; display: block;">' + item.label + '</span>' +
                        '<span class="forecast-value" style="font-size: 28px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 2px;">0</span>' +
                        '<span class="forecast-range" style="font-size: 12px; color: #6b7280; display: block;">0-0</span>' +
                        '<span class="forecast-confidence" style="font-size: 11px; color: #7c3aed; font-weight: 600; display: block; margin-top: 4px;">0% conf.</span>' +
                        '</div>';
                });
                $('#forecastGrid').html(emptyHtml);
                updateStockItems([]);
            }
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.log("Error loading demand forecast:", error);
            var emptyHtml = '';
            var items = ['BREAKFAST', 'LUNCH', 'DINNER'];
            $.each(items, function (i, label) {
                emptyHtml += '<div class="forecast-item" style="background: #f8fafc; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #e5e7eb;">' +
                    '<span class="forecast-label" style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; display: block;">' + label + '</span>' +
                    '<span class="forecast-value" style="font-size: 28px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 2px;">0</span>' +
                    '<span class="forecast-range" style="font-size: 12px; color: #6b7280; display: block;">0-0</span>' +
                    '<span class="forecast-confidence" style="font-size: 11px; color: #7c3aed; font-weight: 600; display: block; margin-top: 4px;">0% conf.</span>' +
                    '</div>';
            });
            $('#forecastGrid').html(emptyHtml);
            updateStockItems([]);
            if (callback) callback();
        }
    });
}

function loadStaffPerformance(callback) {
    var dateRange = $('#dateRangeSelect').val() || '30';
    var dates = getDateRange(dateRange);
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETSTAFFPERFORMANCE")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var html = "";
                $.each(res, function (i, item) {
                    var rating = item.RATING || 0;
                    var stars = "";
                    for (var s = 1; s <= 5; s++) {
                        stars += s <= Math.floor(rating) ? "★" : "☆";
                    }
                    var role = item.ROLE || 'KITCHEN';
                    var progress = item.PROGRESS || 0;
                    html += `
                    <div class="staff-row">
                        <div class="staff-icon">
                            <img src="../images/staff-tick.png">
                        </div>
                        <div class="staff-details">
                            <div class="staff-top">
                                <div class="staff-name-area">
                                    <span class="staff-name">${escapeHtml(item.NAME || '')}</span>
                                    <span class="role-badge ${role.toLowerCase()}">${role}</span>
                                </div>
                                <span class="staff-high">${item.HIGH || 0} high</span>
                            </div>
                            <div class="staff-bottom">
                                <div class="rating-area">
                                    <span class="staff-stars">${stars}</span>
                                    <span class="staff-rating">${rating.toFixed(1)}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width:${progress}%"></div>
                                </div>
                                <span class="orders">${item.ORDERS || 0} orders</span>
                            </div>
                        </div>
                    </div>`;
                });
                $("#staffItems").html(html);
            } else {
                $("#staffItems").html(
                    '<div style="text-align:center;padding:20px;color:#9ca3af;">No staff performance data available</div>'
                );
            }
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.log("Error loading staff performance:", error);
            $("#staffItems").html(
                '<div style="text-align:center;padding:20px;color:#9ca3af;">No staff performance data available</div>'
            );
            if (callback) callback();
        }
    });
}

function loadRecentOrders(callback) {
    if (isLoadingRecentOrders) {
        if (callback) callback();
        return;
    }
    var dateRange = $('#dateRangeSelect').val() || '30';
    var dates = getDateRange(dateRange);
    var currentHtml = $("#tblOrdersBody").html();
    var hasExistingData = currentHtml &&
        !currentHtml.includes('Loading') &&
        !currentHtml.includes('No orders found') &&
        !currentHtml.includes('Error loading') &&
        !currentHtml.includes('No orders match');
    var now = new Date().getTime();
    var cacheValid = cachedRecentOrders &&
        cachedRecentOrders.range === dateRange &&
        (now - lastSuccessfulLoad) < 120000;
    if (cacheValid && hasExistingData) {
        renderRecentOrders(cachedRecentOrders.data);
        if (callback) callback();
        if (!document.hidden) {
            refreshRecentOrdersBackground(dateRange, dates);
        }
        return;
    }
    if (!hasExistingData) {
        $("#tblOrdersBody").html(
            '<tr><td colspan="7" style="text-align:center;padding:30px;color:#888;"><i class="fas fa-spinner fa-spin"></i> Loading orders...</td></tr>'
        );
    }
    isLoadingRecentOrders = true;
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETRECENTORDERS")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate)) +
        "&TOPN=" + encodeURIComponent(Encrypt("50"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 15000,
        success: function (res) {
            isLoadingRecentOrders = false;
            cachedRecentOrders = {
                range: dateRange,
                data: res
            };
            lastSuccessfulLoad = new Date().getTime();
            if (res && res.length > 0) {
                renderRecentOrders(res);
            } else {
                if (!hasExistingData) {
                    $("#tblOrdersBody").html(
                        '<tr><td colspan="7" style="text-align:center;padding:30px;color:#888;">No orders found</td></tr>'
                    );
                }
            }
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            isLoadingRecentOrders = false;
            console.log("Error loading recent orders:", error);
            if (status === 'timeout' && cachedRecentOrders && cachedRecentOrders.range === dateRange) {
                renderRecentOrders(cachedRecentOrders.data);
                if (callback) callback();
                return;
            }
            var hasCache = cachedRecentOrders && cachedRecentOrders.range === dateRange;
            if (!hasExistingData && !hasCache) {
                $("#tblOrdersBody").html(
                    '<tr><td colspan="7" style="text-align:center;padding:30px;color:#ef4444;">⚠️ Error loading orders. Please refresh.</td></tr>'
                );
            } else if (hasCache) {
                renderRecentOrders(cachedRecentOrders.data);
            }
            if (callback) callback();
        }
    });
}

function refreshRecentOrdersBackground(dateRange, dates) {
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETRECENTORDERS")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate)) +
        "&TOPN=" + encodeURIComponent(Encrypt("10"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 10000,
        success: function (res) {
            cachedRecentOrders = {
                range: dateRange,
                data: res
            };
            lastSuccessfulLoad = new Date().getTime();
            if (!document.hidden && res && res.length > 0) {
                renderRecentOrders(res);
            }
        },
        error: function () {
            console.log('Background refresh failed');
        }
    });
}

function renderRecentOrders(res) {
    if (res && res.length > 0) {
        var html = "";
        $.each(res, function (i, item) {
            var statusClass = (item.STATUS || 'placed').toLowerCase().replace(/ /g, '-');
            var statusText = item.STATUS || 'Placed';
            html += `
                <tr>
                    <td><span class="order-id">#${escapeHtml(item.ORDERID || '')}</span></td>
                    <td>${escapeHtml(item.TIME || '')}</td>
                    <td class="patient-name">${escapeHtml(item.PATIENT || '')}</td>
                    <td>${escapeHtml(item.ROOM || '')}</td>
                    <td>${escapeHtml(item.MEAL || '')}</td>
                    <td>
                        <span class="item-chip">${item.ITEMS || ''}</span>
                    </td>
                    <td>
                    <span class="status-badge ${statusClass}">
                        ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}
                    </span>
                    </td>
                </tr>`;
        });
        $("#tblOrdersBody").html(html);
    } else {
        $("#tblOrdersBody").html(
            '<tr><td colspan="7" style="text-align:center;padding:30px;color:#888;">No orders found</td></tr>'
        );
    }
}

function loadTrendingItems(callback) {
    var dateRange = $('#dateRangeSelect').val() || '30';
    var dates = getDateRange(dateRange);
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETTRENDINGITEMS")) +
        "&STARTDATE=" + encodeURIComponent(Encrypt(dates.startDate)) +
        "&ENDDATE=" + encodeURIComponent(Encrypt(dates.endDate)) +
        "&TOPN=" + encodeURIComponent(Encrypt("10"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var html = "";
                $.each(res, function (i, item) {
                    var rating = item.RATING || 0;
                    var width = (rating / 5) * 100;
                    var isNew = item.ISNEW === true || item.ISNEW === 1;
                    var trend = (item.TREND || 'STABLE').toUpperCase();

                    var trendColor = '#6b7280';
                    var trendIcon = '—';
                    if (trend === 'RISING') {
                        trendColor = '#00B774';
                        trendIcon = '↗';
                    } else if (trend === 'DECLINING') {
                        trendColor = '#FF2438';
                        trendIcon = '↘';
                    } else if (trend === 'STABLE') {
                        trendColor = '#6b7280';
                        trendIcon = '—';
                    }

                    html += `
                    <div class="trend-card" style="display:flex;align-items:center;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:12px 16px;margin-bottom:10px;">
                        <div class="trend-rank" style="width:32px;font-size:17px;font-weight:700;color:#94a3b8;text-align:center;">${i + 1}</div>
                        <div class="trend-content" style="flex:1;margin-left:10px;">
                            <div class="trend-top" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
                                <div class="trend-title" style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#1d2b4f;">
                                    ${escapeHtml(item.NAME || '')}
                                    ${isNew ? `
                                    <span style="display:flex;align-items:center;gap:4px;color:#8D9BB0;font-size:10px;font-weight:600;">
                                        <img src="../images/generate-icon.png"
                                             style="width:11px;height:11px;
                                             filter:brightness(0) saturate(100%)
                                             invert(61%) sepia(10%) saturate(397%)
                                             hue-rotate(180deg) brightness(90%)
                                             contrast(90%);">
                                        New
                                    </span>` : ""}
                                </div>
                                <div class="trend-right" style="text-align:right;">
                                    <div class="trend-badge" style="font-size:12px;font-weight:700;color:${trendColor};">
                                        ${trendIcon} ${trend}
                                    </div>
                                    <div class="trend-count" style="font-size:11px;color:#94a3b8;">
                                        ${item.RATINGS || 0} Rating${item.RATINGS > 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="trend-bottom" style="display:flex;align-items:center;gap:12px;">
                                <div class="trend-bar" style="flex:1;height:8px;background:#e6ebff;border-radius:20px;overflow:hidden;">
                                    <div class="trend-fill" style="height:100%;width:${width}%;background:#5b5bf6;border-radius:20px;transition:width 0.5s ease;"></div>
                                </div>
                                <div class="trend-rating" style="min-width:48px;font-size:13px;font-weight:600;color:#1f2937;">
                                    ⭐ ${rating.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>`;
                });

                html += `
                <div style="margin-top:16px;padding-top:12px;border-top:1px solid #edf2f7;display:flex;justify-content:center;align-items:center;gap:24px;flex-wrap:wrap;">
                    <span style="display:flex;align-items:center;gap:6px;color:#00B774;font-size:11px;font-weight:600;">
                        <span style="font-size:14px;">↗</span>
                        Rising
                    </span>
                    <span style="display:flex;align-items:center;gap:6px;color:#FF2438;font-size:11px;font-weight:600;">
                        <span style="font-size:14px;">↘</span>
                        Declining
                    </span>
                    <span style="display:flex;align-items:center;gap:6px;color:#8D9BB0;font-size:11px;font-weight:600;">
                        <img src="../images/generate-icon.png"
                             style="width:11px;height:11px;
                             filter:brightness(0) saturate(100%)
                             invert(61%) sepia(10%) saturate(397%)
                             hue-rotate(180deg) brightness(90%)
                             contrast(90%);">
                        New
                    </span>
                    <span style="display:flex;align-items:center;gap:6px;color:#6b7280;font-size:11px;font-weight:600;">
                        <span style="font-size:14px;">—</span>
                        Stable
                    </span>
                </div>`;

                $("#trendingItems").html(html);
            } else {
                $("#trendingItems").html(
                    '<div style="text-align:center;padding:20px;color:#9ca3af;">No trending items available</div>'
                );
            }
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.log("Error loading trending items:", error);
            $("#trendingItems").html(
                '<div style="text-align:center;padding:20px;color:#9ca3af;">No trending items available</div>'
            );
            if (callback) callback();
        }
    });
}

function getDashboardRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '0').toString();
}

function LoadNotifications(callback) {
    var roleId = getDashboardRoleId();
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
            if (callback) callback();
        },
        error: function (xhr, status, error) {
            console.log("Error loading notifications:", error);
            if (callback) callback();
        }
    });
}
function RenderNotifications(notifications) {
    var html = '';
    var unreadCount = 0;
    if (notifications && notifications.length > 0) {
        $.each(notifications, function (i, item) {
            var isRead = item.IS_READ === true || item.IS_READ === 1;
            if (!isRead) unreadCount++;
            var iconClass = item.NOTIFICATION_TYPE || 'info';
            var iconSvg = '';
            if (iconClass === 'error') {
                iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
            } else if (iconClass === 'success') {
                iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M9 11l2 2 4-4"/><path d="M5 4h14v16H5z"/></svg>';
            } else {
                iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/></svg>';
            }
            var notificationId = item.NOTIFICATION_ID || item.ID || i;
            html += '<div class="notification-item' + (isRead ? ' read' : ' unread') + '" data-id="' + notificationId + '">' +
                '<div class="notification-icon icon-' + iconClass + '">' + iconSvg + '</div>' +
                '<div class="notification-content">' +
                '<div class="notification-text"><h4>' + escapeHtml(item.NOTIFICATION_HEADER || '') + '</h4><p>' + escapeHtml(item.NOTIFICATION_MESSAGE || '') + '</p></div>' +
                '<div class="notification-time">' + escapeHtml(item.TIME_AGO || '') + '</div>' +
                '</div>' +
                (!isRead ? '<span class="unread-dot"></span>' : '') +
                '</div>';
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

function MarkNotificationAsRead(NotificationID) {
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(NotificationID)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            GetUnreadCounts();
        },
        error: function (xhr, status, error) {
            console.log("Error marking notification as read:", error);
            LoadNotifications();
        }
    });
}
function GetUnreadCounts() {
    var roleId = getDashboardRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        cache: false,
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
            }
        },
        error: function (xhr, status, error) {
        }
    });
}

function MarkAllNotificationsAsRead() {
    var roleId = getDashboardRoleId();
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

function GetOrderDetail(orderId) {
    if (!orderId) {
        ShowToast('Invalid order ID', 'error');
        return;
    }
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETORDERDETAIL")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                window.location.href = '../FoodDashboard/Orders.aspx?orderId=' + encodeURIComponent(orderId);
            } else {
                ShowToast('Order not found', 'error');
            }
        },
        error: function (xhr, status, error) {
            console.log("Error loading order detail:", error);
            ShowToast('Failed to load order details', 'error');
        }
    });
}

function handleDateRangeChange(range) {
    updateLastSyncedTime();
    refreshAllData();
}

function refreshAllData() {
    if (isLoading) return;
    if (!document.hidden) {
        isLoading = true;
        $('#loader').show();
        loadDashboardData(function () {
            loadDietCategoryMix(function () {
                loadOrderVolume(function () {
                    loadTopMenuItems(function () {
                        loadSLAData(function () {
                            loadPatientSatisfaction(function () {
                                loadDemandForecast(function () {
                                    loadTrendingItems(function () {
                                        loadStaffPerformance(function () {
                                            loadRecentOrders(function () {
                                                LoadNotifications(function () {
                                                    isLoading = false;
                                                    $('#loader').hide();
                                                    updateLastSyncedTime();
                                                    GetUnreadCounts();
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}

function RefreshData() {
    var btn = $('#btnRefresh');
    btn.addClass('spinning');
    cachedRecentOrders = null;
    lastSuccessfulLoad = null;
    refreshAllData();
    setTimeout(function () {
        GetUnreadCounts();
    }, 500);
    ShowToast('Dashboard refreshed successfully');
    setTimeout(function () {
        btn.removeClass('spinning');
    }, 800);
}

function initDietPieChart(labels, data, colors) {
    var ctx = document.getElementById('dietChart');
    if (!ctx) return;
    if (window.dietChartInstance) {
        window.dietChartInstance.destroy();
    }
    var chartLabels = labels && labels.length > 0 ? labels : ['No Data'];
    var chartData = data && data.length > 0 ? data : [1];
    var chartColors = colors && colors.length > 0 ? colors : ['#e5e7eb'];
    window.dietChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: chartColors.slice(0, chartLabels.length),
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '58%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#111827',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            if (context.label === 'No Data') {
                                return 'No data available';
                            }
                            return context.label + ': ' + context.parsed + ' patients';
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function (chart) {
                if (chartLabels.length === 1 && chartLabels[0] === 'No Data') {
                    var width = chart.width;
                    var height = chart.height;
                    var ctx2 = chart.ctx;
                    ctx2.save();
                    var centerX = width / 2;
                    var centerY = height / 2;
                    ctx2.font = '14px Inter, sans-serif';
                    ctx2.fillStyle = '#9ca3af';
                    ctx2.textAlign = 'center';
                    ctx2.textBaseline = 'middle';
                    ctx2.fillText('No Data', centerX, centerY);
                    ctx2.restore();
                }
            }
        }]
    });
}

function updateDietLegend(labels, data, colors) {
    var legendHtml = '';
    if (labels && labels.length > 0 && !(labels.length === 1 && labels[0] === 'No Data')) {
        $.each(labels, function (i, label) {
            var color = colors[i] || '#ccc';
            legendHtml += '<span style="display:flex;align-items:center;gap:6px;font-size:11px;color:#4b5563;font-weight:500;white-space:nowrap;">' +
                '<span style="width:8px;height:8px;border-radius:4px;background:' + color + ';flex-shrink:0;"></span> ' +
                escapeHtml(label) +
                '</span>';
        });
    } else {
        legendHtml = '<span style="display:flex;align-items:center;gap:6px;font-size:11px;color:#9ca3af;font-weight:500;white-space:nowrap;">No data available</span>';
    }
    $('#dietLegendGrid').html(legendHtml);
}

function initOrderVolumeChart(labels, orders, delivered, cancelled) {
    var ctx = document.getElementById('volumeChart');
    if (!ctx) return;
    if (window.volumeChartInstance) {
        window.volumeChartInstance.destroy();
    }
    var hasData = labels && labels.length > 0 && orders && orders.length > 0 && orders.some(d => d > 0);
    var chartLabels = hasData ? labels : ['No Data'];
    var chartOrders = hasData ? orders : [0];
    var chartDelivered = hasData ? delivered : [0];
    var chartCancelled = hasData ? cancelled : [0];
    var activeIndex = -1;
    window.volumeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Orders',
                    data: chartOrders,
                    backgroundColor: hasData ? '#22c55e' : '#e5e7eb',
                    borderWidth: 0,
                    borderRadius: 4,
                    barPercentage: 0.95,
                    categoryPercentage: 0.85,
                    hoverBackgroundColor: hasData ? '#22c55e' : '#e5e7eb'
                },
                {
                    label: 'Delivered',
                    data: chartDelivered,
                    backgroundColor: hasData ? '#3b82f6' : '#e5e7eb',
                    borderWidth: 0,
                    borderRadius: 4,
                    barPercentage: 0.95,
                    categoryPercentage: 0.85,
                    hoverBackgroundColor: hasData ? '#3b82f6' : '#e5e7eb'
                },
                {
                    label: 'Cancelled',
                    data: chartCancelled,
                    backgroundColor: hasData ? '#ef4444' : '#e5e7eb',
                    borderWidth: 0,
                    borderRadius: 4,
                    barPercentage: 0.95,
                    categoryPercentage: 0.85,
                    hoverBackgroundColor: hasData ? '#ef4444' : '#e5e7eb'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            onHover: function (event, elements) {
                if (elements && elements.length > 0) {
                    activeIndex = elements[0].index;
                } else {
                    activeIndex = -1;
                }
                this.update();
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#ffffff',
                    titleColor: '#1f2937',
                    bodyColor: '#4b5563',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 10,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            if (!hasData) return 'No data available';
                            return context.dataset.label + ': ' + context.parsed.y;
                        },
                        afterBody: function (tooltipItems) {
                            if (!hasData) return '';
                            var total = 0;
                            tooltipItems.forEach(function (item) {
                                total += item.parsed.y;
                            });
                            return ['─────────', 'Total: ' + total];
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#eef2f7', drawBorder: false },
                    border: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { size: 12, weight: '500' }
                    }
                },
                y: {
                    beginAtZero: true,
                    max: hasData ? Math.max(Math.max(...chartOrders), Math.max(...chartDelivered), Math.max(...chartCancelled)) + 5 : 10,
                    ticks: {
                        stepSize: hasData ? 5 : 2,
                        color: '#64748b',
                        font: { size: 12 }
                    },
                    grid: { color: '#edf2f7', drawBorder: false },
                    border: { color: '#94a3b8', width: 1 }
                }
            }
        },
        plugins: [{
            id: 'noDataMessage',
            beforeDraw: function (chart) {
                if (!hasData) {
                    var width = chart.width;
                    var height = chart.height;
                    var ctx2 = chart.ctx;
                    ctx2.save();
                    var centerX = width / 2;
                    var centerY = height / 2 + 10;
                    ctx2.font = '14px Inter, sans-serif';
                    ctx2.fillStyle = '#9ca3af';
                    ctx2.textAlign = 'center';
                    ctx2.textBaseline = 'middle';
                    ctx2.fillText('No order data available', centerX, centerY);
                    ctx2.restore();
                }
            }
        }]
    });
}

function initTopMenuChart(labels, data) {
    var ctx = document.getElementById('topMenuChart');
    if (!ctx) return;
    if (window.topMenuChartInstance) {
        window.topMenuChartInstance.destroy();
    }
    var hasData = labels && labels.length > 0 && data && data.length > 0 && data.some(d => d > 0);
    var chartLabels = hasData ? labels : ['No items'];
    var chartData = hasData ? data : [0];
    var maxValue = hasData ? Math.max(...chartData) : 10;
    var maxWithBuffer = maxValue * 1.1;
    var stepSize = Math.ceil(maxWithBuffer / 5);
    if (stepSize <= 1) stepSize = 1;
    else if (stepSize <= 2) stepSize = 2;
    else if (stepSize <= 3) stepSize = 3;
    else if (stepSize <= 4) stepSize = 4;
    else if (stepSize <= 5) stepSize = 5;
    else if (stepSize <= 10) stepSize = 10;
    else if (stepSize <= 20) stepSize = 20;
    else if (stepSize <= 50) stepSize = 50;
    else if (stepSize <= 100) stepSize = 100;
    else stepSize = 200;
    var maxTick = Math.ceil(maxValue / stepSize) * stepSize;
    if (maxTick < maxValue * 1.1) {
        maxTick = maxTick + stepSize;
    }
    window.topMenuChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: hasData ? '#18b981' : '#e5e7eb',
                borderColor: hasData ? '#18b981' : '#e5e7eb',
                borderWidth: 0,
                borderRadius: 4,
                borderSkipped: false,
                barThickness: hasData ? 26 : 40,
                maxBarThickness: 26
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#ffffff',
                    titleColor: '#1e293b',
                    bodyColor: '#475569',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            if (!hasData) return 'No data available';
                            return 'Quantity: ' + context.parsed.x + ' portions';
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: maxTick,
                    grid: { color: '#edf2f7', borderDash: [3, 4] },
                    ticks: {
                        color: '#64748b',
                        stepSize: stepSize,
                        font: { size: 11, weight: '500' },
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        callback: function (value) {
                            if (value % stepSize === 0) {
                                return value;
                            }
                            return '';
                        }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: '#334155',
                        font: { size: 13, weight: '500' }
                    }
                }
            }
        },
        plugins: [{
            id: 'noDataMessage',
            beforeDraw: function (chart) {
                if (!hasData) {
                    var width = chart.width;
                    var height = chart.height;
                    var ctx2 = chart.ctx;
                    ctx2.save();
                    var centerX = width / 2;
                    var centerY = height / 2;
                    ctx2.font = '14px Inter, sans-serif';
                    ctx2.fillStyle = '#9ca3af';
                    ctx2.textAlign = 'center';
                    ctx2.textBaseline = 'middle';
                    ctx2.fillText('No menu items available', centerX, centerY);
                    ctx2.restore();
                }
            }
        }]
    });
}

function initSLAChart(percentage) {
    var ctx = document.getElementById('slaChart');
    if (!ctx) return;
    if (window.slaChartInstance) {
        window.slaChartInstance.destroy();
    }
    var slaPercentage = percentage || 0;
    var remaining = 100 - slaPercentage;
    window.slaChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [slaPercentage, remaining],
                backgroundColor: slaPercentage > 0 ? ['#10b981', '#edf2f7'] : ['#e5e7eb', '#f3f4f6'],
                borderWidth: 0,
                hoverOffset: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '78%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            animation: {
                animateRotate: true,
                duration: 1000
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function (chart) {
                var width = chart.width;
                var height = chart.height;
                var ctx2 = chart.ctx;
                ctx2.save();
                var centerX = width / 2;
                var centerY = height / 2;
                if (slaPercentage === 0) {
                    ctx2.font = '14px Inter, sans-serif';
                    ctx2.fillStyle = '#9ca3af';
                    ctx2.textAlign = 'center';
                    ctx2.textBaseline = 'middle';
                    ctx2.fillText('No Data', centerX, centerY);
                } else {
                    ctx2.font = '700 42px Inter, sans-serif';
                    ctx2.fillStyle = '#111827';
                    ctx2.textAlign = 'center';
                    ctx2.textBaseline = 'middle';
                    ctx2.fillText(slaPercentage + '%', centerX, centerY - 10);
                    ctx2.font = '600 13px Inter, sans-serif';
                    ctx2.fillStyle = '#94a3b8';
                    ctx2.fillText('ON-TIME', centerX, centerY + 30);
                }
                ctx2.restore();
            }
        }]
    });
}

function initSatisfactionChart(labels, satisfiedData, neutralData, unsatisfiedData) {
    var ctx = document.getElementById('satisfactionLineChart');
    if (!ctx) return;
    if (window.satisfactionChartInstance) window.satisfactionChartInstance.destroy();
    var hasData = labels && labels.length > 0 && satisfiedData && satisfiedData.length > 0;
    var chartLabels = hasData ? labels : ['No Data'];
    var satData = hasData ? satisfiedData : [0];
    var neuData = hasData && neutralData ? neutralData : [0];
    var unsatData = hasData && unsatisfiedData ? unsatisfiedData : [0];
    window.satisfactionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Satisfied',
                    data: satData,
                    borderColor: '#00B774',
                    backgroundColor: 'rgba(0, 183, 116, 0.1)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#00B774',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Neutral',
                    data: neuData,
                    borderColor: '#8D9BB0',
                    backgroundColor: 'rgba(141, 155, 176, 0.1)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#8D9BB0',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Unsatisfied',
                    data: unsatData,
                    borderColor: '#FF2438',
                    backgroundColor: 'rgba(255, 36, 56, 0.1)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#FF2438',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    titleColor: '#1a1a2e',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 10,
                    titleFont: { size: 13, weight: '600' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function (context) {
                            if (!hasData) return 'No data available';
                            return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: hasData,
                    grid: { display: false },
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 10 },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                },
                y: {
                    display: hasData,
                    min: -5,
                    max: 105,
                    ticks: {
                        stepSize: 25,
                        color: '#9ca3af',
                        font: { size: 10 },
                        callback: function (value) {
                            if (value >= 0 && value <= 100) {
                                return value + '%';
                            }
                            return '';
                        }
                    },
                    grid: { color: '#f3f4f6', drawBorder: false },
                    afterBuildTicks: function (axis) {
                        var ticks = axis.ticks;
                        var has100 = false;
                        var has0 = false;
                        var has25 = false;
                        var has50 = false;
                        var has75 = false;
                        for (var i = 0; i < ticks.length; i++) {
                            var val = ticks[i].value;
                            if (val === 100) has100 = true;
                            if (val === 0) has0 = true;
                            if (val === 25) has25 = true;
                            if (val === 50) has50 = true;
                            if (val === 75) has75 = true;
                        }
                        if (!has0) ticks.push({ value: 0 });
                        if (!has25) ticks.push({ value: 25 });
                        if (!has50) ticks.push({ value: 50 });
                        if (!has75) ticks.push({ value: 75 });
                        if (!has100) ticks.push({ value: 100 });
                        ticks.sort(function (a, b) {
                            return a.value - b.value;
                        });
                    }
                }
            },
            elements: {
                line: { borderWidth: 2.5 },
                point: { radius: 4 }
            },
            interaction: { intersect: false, mode: 'index' }
        },
        plugins: [{
            id: 'noDataMessage',
            beforeDraw: function (chart) {
                if (!hasData) {
                    var width = chart.width;
                    var height = chart.height;
                    var ctx2 = chart.ctx;
                    ctx2.save();
                    var centerX = width / 2;
                    var centerY = height / 2;
                    ctx2.font = '12px Inter, sans-serif';
                    ctx2.fillStyle = '#9ca3af';
                    ctx2.textAlign = 'center';
                    ctx2.textBaseline = 'middle';
                    ctx2.fillText('No satisfaction data available', centerX, centerY);
                    ctx2.restore();
                }
            }
        }]
    });
}

function getLast7Days() {
    var labels = [];
    var values = [];
    var today = new Date();
    for (var i = 6; i >= 0; i--) {
        var d = new Date(today);
        d.setDate(d.getDate() - i);
        labels.push(formatDateShort(d));
        values.push(0);
    }
    return { labels: labels, values: values };
}

function formatDateShort(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var day = date.getDate();
    var month = months[date.getMonth()];
    return month + ' ' + (day < 10 ? '0' + day : day);
}

$(document).ready(function () {
    var userName = sessionStorage.getItem('NAME') || '';
    var userRole = sessionStorage.getItem('ROLENAME') || '';
    var userDept = sessionStorage.getItem('DEPARTMENT') || 'Burjeel Medical City (BMC)';
    $('#spndepNursname').text(userName);
    $('#spnUserTypeLabel').text(userRole);
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
    var now = new Date();
    $('#lblLastSynced').text(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    refreshAllData();
    $(document).on('change', '#dateRangeSelect', function () {
        var range = $(this).val();
        var label = $(this).find('option:selected').text();
        handleDateRangeChange(range);
        ShowToast('Showing ' + label + ' data');
    });
    $(document).on('click', '#btnRefresh', function (e) {
        e.preventDefault();
        RefreshData();
    });

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

    function LoadDashNotifications() {
        var url = hurl + "Service/Service.aspx?Process=" +
            encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
            "&MAXCOUNT=" + encodeURIComponent(Encrypt("20"));
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            cache: false,
            success: function (res) {
                var html = '';
                var unreadCount = 0;
                if (res && res.length > 0) {
                    $.each(res, function (i, item) {
                        var isRead = item.IS_READ === true || item.IS_READ === 1 || item.ISREAD === true || item.ISREAD === 1;
                        if (!isRead) unreadCount++;
                        var icon = getNotificationIcon(item.NOTIFICATION_TYPE);
                        var iconClass = (item.NOTIFICATION_TYPE || 'default').toLowerCase();
                        var title = item.TITLE || item.NOTIFICATION_HEADER || 'Notification';
                        var message = item.MESSAGE || item.NOTIFICATION_MESSAGE || '';
                        var time = item.TIME || item.TIME_AGO || 'Just now';
                        var notificationId = item.ID || item.NOTIFICATION_ID || i;

                        var iconColor = '';
                        var iconBg = '';
                        if (iconClass === 'info') {
                            iconBg = '#dbeafe';
                            iconColor = '#2563eb';
                        } else if (iconClass === 'success') {
                            iconBg = '#dcfce7';
                            iconColor = '#16a34a';
                        } else if (iconClass === 'error') {
                            iconBg = '#fee2e2';
                            iconColor = '#ef4444';
                        } else if (iconClass === 'warning') {
                            iconBg = '#fef3c7';
                            iconColor = '#f59e0b';
                        } else {
                            iconBg = '#f3f4f6';
                            iconColor = '#6b7280';
                        }

                        html += `
                    <div class="dash-notification-item${isRead ? ' read' : ' unread'}" data-id="${notificationId}">
                        <div class="dash-notification-icon ${iconClass}" style="background:${iconBg};">
                            <img src="${icon}" style="filter: brightness(0) saturate(100%) invert(29%) sepia(94%) saturate(1715%) hue-rotate(205deg);" />
                        </div>
                        <div class="dash-notification-content">
                            <div class="dash-notification-title">
                                ${escapeHtml(title)}
                            </div>
                            <div class="dash-notification-message">
                                ${escapeHtml(message)}
                            </div>
                            <div class="dash-notification-time">
                                ${escapeHtml(time)}
                            </div>
                        </div>
                        ${!isRead ? '<span class="dash-unread-dot"></span>' : ''}
                    </div>
                `;
                    });
                    var $dashBadge = $('#dashNotificationCount');
                    if ($dashBadge.length > 0) {
                        $dashBadge.text(unreadCount);
                        if (unreadCount > 0) {
                            $dashBadge.show().addClass('show');
                        } else {
                            $dashBadge.hide().removeClass('show');
                        }
                    }
                } else {
                    html = `
                <div class="dash-notification-item" style="text-align:center;color:#9ca3af;padding:40px 20px;border-left: none;justify-content:center;">
                    <div style="font-size: 14px;">No new notifications</div>
                </div>
            `;
                }
                $('#dashNotificationList').html(html);
                GetUnreadCounts();
            },
            error: function (xhr, status, error) {
                console.error('Error loading dashboard notifications:', error);
                $('#dashNotificationList').html(`
            <div class="dash-notification-item" style="text-align:center;color:#ef4444;padding:20px;border-left: none;justify-content:center;">
                Failed to load notifications
            </div>
        `);
            }
        });
    }

    $(document).on('click', '#dashNotificationBell', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var dropdown = $('#dashNotificationDropdown');
        if (dropdown.is(':visible')) {
            dropdown.hide();
        } else {
            dropdown.show();
            LoadDashNotifications();
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('#dashNotificationBell').length &&
            !$(e.target).closest('#dashNotificationDropdown').length) {
            $('#dashNotificationDropdown').hide();
        }
    });

    $(document).on('click', '#dashMarkAllRead', function (e) {
        e.preventDefault();
        e.stopPropagation();
        MarkAllDashNotificationsAsRead();
    });

    $(document).on('click', '.dash-notification-item.unread', function () {
        var id = $(this).data('id');
        var $this = $(this);
        $this.removeClass('unread');
        $this.find('.dash-unread-dot').remove();
        $this.css('background', '#f9fafb');
        $this.css('border-left', '3px solid transparent');
        MarkDashNotificationAsRead(id);
        var currentCount = parseInt($('#dashNotificationCount').text()) || 0;
        var newCount = Math.max(0, currentCount - 1);
        $('#dashNotificationCount').text(newCount);
        if (newCount <= 0) {
            $('#dashNotificationCount').hide();
        }
    });

    function MarkAllDashNotificationsAsRead() {
        var url = hurl + "Service/Service.aspx?Process=" +
            encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD"));
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (res) {
                $('.dash-notification-item.unread').each(function () {
                    var $this = $(this);
                    $this.removeClass('unread');
                    $this.find('.dash-unread-dot').remove();
                    $this.css('background', '#f9fafb');
                    $this.css('border-left', '3px solid transparent');
                });
                LoadDashNotifications();
                GetUnreadCounts();
                ShowToast('All notifications marked as read');
            },
            error: function (xhr, status, error) {
                console.error('Error marking all as read:', error);
                ShowToast('Failed to mark all as read', 'error');
            }
        });
    }

    function MarkDashNotificationAsRead(id) {
        var url = hurl + "Service/Service.aspx?Process=" +
            encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
            "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(id));
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (res) {
                console.log('Marked as read:', id);
                LoadDashNotifications();
                GetUnreadCounts();
            },
            error: function (xhr, status, error) {
                console.error('Error marking as read:', error);
            }
        });
    }

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            setTimeout(function () {
                refreshAllData();
            }, 500);
        }
    });

    setInterval(function () {
        if (!document.hidden && !isLoading) {
            refreshAllData();
        }
    }, 30000);
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