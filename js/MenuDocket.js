var API_URL = '';
var CryptoKey = '';
var CryptoPwd = '';
var currentUser = {};
var autoRefreshTimer = null;
var refreshInterval = 10000;
var currentPrintOrderId = '';
var printContentCache = null;
var isPrinting = false;
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

    var toast = $('#dockToastNotification');

    if (toast.length === 0) {
        $('body').append(
            '<div class="dock-toast-notification" id="dockToastNotification">' +
            '<i class="fas fa-check-circle"></i>' +
            '<span id="dockToastMessage"></span>' +
            '<button class="toast-close" onclick="HideToast();">&times;</button>' +
            '</div>'
        );
        toast = $('#dockToastNotification');
    }

    // Remove previous type classes
    toast.removeClass('success error warning info');

    var icon = type === 'success'
        ? 'fa-check-circle'
        : type === 'error'
            ? 'fa-exclamation-circle'
            : type === 'warning'
                ? 'fa-exclamation-triangle'
                : 'fa-info-circle';

    // Add type class for border color
    toast.addClass(type);

    // Set icon
    toast.find('i').attr('class', 'fas ' + icon);

    // Set message
    $('#dockToastMessage').text(message);

    // Show toast
    toast.addClass('show');

    clearTimeout(toast.data('timer'));
    toast.data('timer', setTimeout(function () {
        HideToast();
    }, 3500));
}

function HideToast() {
    var toast = $('#dockToastNotification');
    if (toast.length) {
        toast.removeClass('show');
        setTimeout(function () {
            toast.remove();
        }, 400);
    }
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

function SetCurrentDate() {
    var now = new Date();
    var dateStr = now.toISOString().split('T')[0];
    $('#filterDate').val(dateStr);
}

function LoadDocketsSummary() {
    var OrderDate = $("#filterDate").val();
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETDOCKETSSUMMARY")) +
        "&ORDERDATE=" + encodeURIComponent(Encrypt(OrderDate));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var data = res[0];
                $('#lblTotalDockets').text(data.TOTALDOCKETS || 0);
                $('#lblPrinted').text(data.PRINTED || 0);
                $('#lblYetToPrint').text(data.YETTOPRINT || 0);
            }
            updateLastSyncedTime();
        },
        error: function (xhr, status, error) {
            console.log("Error loading dockets summary:", error);
            $('#lblTotalDockets').text(0);
            $('#lblPrinted').text(0);
            $('#lblYetToPrint').text(0);
        }
    });
}

function ShowLoadingDockets() {
    $("#tblDocketsBody").html(
        '<tr>' +
        '<td colspan="8" style="text-align:center; padding:50px 20px; color:#9ca3af;">' +
        '<div class="spinner-border" style="width: 40px; height: 40px; display: block; margin: 0 auto 12px; color: #2563eb;"></div>' +
        '<div style="font-size: 16px; font-weight: 500; color: #6b7280;">Loading dockets...</div>' +
        '</td>' +
        '</tr>'
    );
}

function LoadDocketsList() {
    var OrderDate = $("#filterDate").val();
    var SearchText = $("#txtSearchDocket").val().trim();
    var Ward = $("#ddlWard").val();

    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETDOCKETSLIST")) +
        "&ORDERDATE=" + encodeURIComponent(Encrypt(OrderDate)) +
        "&SEARCHTEXT=" + encodeURIComponent(Encrypt(SearchText)) +
        "&WARD=" + encodeURIComponent(Encrypt(Ward));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            $("#tblDocketsBody").html("");

            if (!res || res.length === 0) {
                $("#tblDocketsBody").html(
                    '<tr><td colspan="8" style="text-align:center;padding:30px 20px;background:#f9f9f9;">' +
                    '<div style="display:flex;flex-direction:column;align-items:center;">' +
                    '<img src="../images/MenuDockets.png" style="width:80px;height:80px;margin-bottom:12px;opacity:0.5;" />' +
                    '<h3 style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#888;">No dockets found</h3>' +
                    '<p style="margin:0;font-size:13px;color:#aaa;">Try widening the date range or status filter.</p>' +
                    '</div></td></tr>'
                );
                return;
            }

            var html = "";

            $.each(res, function (i, item) {
                var status = (item.STATUS || "confirmed").toLowerCase();
                var statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

                var itemsHtml = "";
                if (item.ITEMS) {
                    var items = item.ITEMS.split(",");
                    $.each(items, function (i, v) {
                        if (v.trim() !== "") {
                            itemsHtml += `<span class="chip-item">1x ${escapeHtml(v.trim())}</span>`;
                        }
                    });
                }

                var dietHtml = "";
                var allergyHtml = "";

                if (item.DIET) {
                    var diets = item.DIET.split(",");
                    $.each(diets, function (i, v) {
                        if (v.trim() !== "") {
                            dietHtml += `<span class="chip-diet">${escapeHtml(v.trim())}</span>`;
                        }
                    });
                }

                if (item.ALLERGIES) {
                    var allergies = item.ALLERGIES.split(",");
                    $.each(allergies, function (i, v) {
                        if (v.trim() !== "") {
                            allergyHtml += `<span class="chip-allergy">${escapeHtml(v.trim())}</span>`;
                        }
                    });
                }

                var isPrinted = item.ISPRINTED == 1;

                var printHtml = `
                    <div class="print-container" data-orderid="${item.ORDERID}">
                        <div class="print-status">
                            ${isPrinted ?
                        `<span class="status-printed" style="color: #16a34a; display: inline-flex; align-items: center; gap: 5px; font-weight: 700; font-size: 13px;">
                                    <img src="../images/tick-green.png" class="status-icon" style="filter: brightness(0) saturate(100%) invert(52%) sepia(58%) saturate(1529%) hue-rotate(102deg) brightness(96%) contrast(96%); width: 14px; height: 14px;"/> 
                                    Printed
                                </span>` :
                        `<span class="status-pending" style="color: #f97316; display: inline-flex; align-items: center; gap: 5px; font-weight: 700; font-size: 13px;">
                                    <img src="../images/clock.png" class="status-icon" style="filter: brightness(0) saturate(100%) invert(55%) sepia(81%) saturate(2752%) hue-rotate(349deg) brightness(101%) contrast(96%); width: 14px; height: 14px;"/> 
                                    Pending
                                </span>`
                    }
                        </div>
                        <button class="print-btn" onclick="PrintSingleDocket('${item.ORDERID}')" style="background: none; border: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center;">
                            <img src="../images/printer.png" style="width: 14px; height: 14px; object-fit: contain;"/>
                        </button>
                    </div>
                `;

                html += `
                    <tr class="docket-row">
                        <td class="room-cell">${item.ROOM || ""}</td>
                        <td>
                            <div class="patient">${escapeHtml(item.PATIENT || "")}</div>
                            <div class="order-id">#${escapeHtml(item.ORDERID || "")}</div>
                        </td>
                        <td>${escapeHtml(item.WARD || "")}</td>
                        <td>${escapeHtml(item.MEAL || "")}</td>
                        <td class="items-cell">${itemsHtml}</td>
                        <td class="diet-cell">
                            ${dietHtml ? `<div class="diet-row">${dietHtml}</div>` : ''}
                            ${allergyHtml ? `<div class="allergy-row">${allergyHtml}</div>` : ''}
                        </td>
                        <td>
                            <span class="status-pill ${status}">
                                ${statusLabel}
                            </span>
                        </td>
                        <td class="print-cell">
                            ${printHtml}
                        </td>
                    </tr>
                `;
            });

            $("#tblDocketsBody").html(html);
        },
        error: function (xhr, status, error) {
            console.log("Error loading dockets list:", error);
            $("#tblDocketsBody").html(
                '<tr><td colspan="8" style="text-align:center;padding:30px;color:#888;">Error loading dockets</td></tr>'
            );
        }
    });
}

function LoadWards() {
    var url = API_URL + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDDROPDOWNLIST"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var html = '<option value="">All wards</option>';
            if (res && res.length > 0) {
                $.each(res, function (i, item) {
                    html += '<option value="' + escapeHtml(item.NAME || '') + '">' + escapeHtml(item.NAME || '') + '</option>';
                });
            }
            $('#ddlWard').html(html);
        },
        error: function (xhr, status, error) {
            console.log("Error loading wards:", error);
        }
    });
}

function PrintNextUnprinted(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    var btn = $('#btnPrintNext');
    btn.prop('disabled', true);
    btn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="width: 16px; height: 16px; margin-right: 5px;"></span> Loading...');

    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("PRINTNEXTUNPRINTED")) +
        "&ORDERDATE=" + encodeURIComponent(Encrypt($("#filterDate").val()));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            btn.prop('disabled', false);
            btn.html('<img src="../images/printer.png" alt="Print" style="width: 18px; height: 18px; object-fit: contain;" /> Print Next Unprinted');

            if (res && res.length > 0 && res[0].RESULT === 'Success') {
                var orderId = res[0].ORDERID || '';
                UpdateDocketStatusInTable(orderId);
                LoadDocketsSummary();
                LoadDocketsList();
                setTimeout(function () {
                    FetchAndShowNextDocket(orderId);
                }, 500);
            } else if (res && res.length > 0 && res[0].MESSAGE) {
                ShowToast(res[0].MESSAGE, 'warning');
            } else {
                ShowToast('No unprinted dockets available', 'warning');
            }
        },
        error: function (xhr, status, error) {
            btn.prop('disabled', false);
            btn.html('<img src="../images/printer.png" alt="Print" style="width: 18px; height: 18px; object-fit: contain;" /> Print Next Unprinted');
            console.log("Error printing next unprinted:", error);
            ShowToast('Error printing docket', 'error');
        }
    });
}

function FetchAndShowNextDocket(orderId) {
    if (!orderId) {
        ShowToast('No order ID', 'error');
        return;
    }

    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETDOCKETDETAIL")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(orderId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var data = res[0];
                currentPrintOrderId = data.ORDERID || '';
                OpenPrintPreview(data);
                ShowToast('Docket loaded. Click Print to print.', 'success');
            } else {
                ShowToast('No docket details found', 'error');
            }
        },
        error: function (xhr, status, error) {
            console.log("Error loading next docket:", error);
            ShowToast('Error loading docket details', 'error');
        }
    });
}

function UpdateDocketStatusInTable(orderId) {
    if (!orderId) return;

    var printContainer = $(`.print-container[data-orderid="${orderId}"]`);

    if (printContainer.length) {
        printContainer.html(`
            <div class="print-status">
                <span class="status-printed" style="color: #16a34a; display: inline-flex; align-items: center; gap: 5px; font-weight: 700; font-size: 13px;">
                    <img src="../images/tick-green.png" class="status-icon" style="filter: brightness(0) saturate(100%) invert(52%) sepia(58%) saturate(1529%) hue-rotate(102deg) brightness(96%) contrast(96%); width: 14px; height: 14px;"/> 
                    Printed
                </span>
            </div>
            <button class="print-btn" onclick="PrintSingleDocket('${orderId}')" style="background: none; border: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center;">
                <img src="../images/printer.png" style="width: 14px; height: 14px; object-fit: contain;"/>
            </button>
        `);
    }

    var row = $(`tr.docket-row:contains("#${orderId}")`);
    if (row.length) {
        var statusPill = row.find('.status-pill');
        if (statusPill.length) {
            statusPill.removeClass('confirmed pending placed preparing ready in-transit delivered');
            statusPill.addClass('printed');
            statusPill.text('Printed');
        }
    }
}

function PrintSingleDocket(OrderID) {
    if (!OrderID) {
        ShowToast('Invalid order ID', 'error');
        return;
    }

    var btn = $(`.print-btn[onclick*="PrintSingleDocket('${OrderID}')"]`);
    var originalContent = btn.html();

    if (btn.length > 0) {
        btn.prop('disabled', true);
        btn.html('<img src="../images/printer.png" style="width: 14px; height: 14px; object-fit: contain;" /> Loading...');
    }

    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETDOCKETDETAIL")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(OrderID));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var data = res[0];
                OpenPrintPreview(data);
                var row = btn.closest('tr');
                if (row.length) {
                    var printContainer = row.find('.print-container');
                    if (printContainer.length) {
                        printContainer.html(`
                            <div class="print-status">
                                <span class="status-printed">
                                    <img src="../images/tick-green.png" class="status-icon"/> Printed
                                </span>
                            </div>
                            <button class="print-btn" onclick="PrintSingleDocket('${OrderID}')">
                                <img src="../images/printer.png" style="width: 14px; height: 14px; object-fit: contain;"/>
                            </button>
                        `);
                    }
                }
                ShowToast('Docket loaded successfully', 'success');
            } else {
                ShowToast('No docket details found', 'error');
                if (btn.length > 0) {
                    btn.prop('disabled', false);
                    btn.html(originalContent);
                }
            }
        },
        error: function (xhr, status, error) {
            console.log("Error loading docket:", error);
            ShowToast('Error loading docket details', 'error');
            if (btn.length > 0) {
                btn.prop('disabled', false);
                btn.html(originalContent);
            }
        }
    });
}

function OpenPrintPreview(data) {
    ResetPrintState();
    currentPrintOrderId = data.ORDERID || '';

    $('#printOrderId').text('#' + (data.ORDERID || ''));
    $('#printPatientName').text(data.PATIENT || '');
    $('#printRoom').text('Room ' + (data.ROOM || ''));

    var dateStr = '';
    var timeStr = '';

    if (data.ORDERDATE) {
        try {
            var dateObj;
            if (typeof data.ORDERDATE === 'string') {
                if (data.ORDERDATE.includes('T')) {
                    dateObj = new Date(data.ORDERDATE);
                } else if (data.ORDERDATE.includes('/')) {
                    var parts = data.ORDERDATE.split('/');
                    if (parts.length === 3) {
                        dateObj = new Date(parts[2], parts[0] - 1, parts[1]);
                    }
                } else if (data.ORDERDATE.includes('-')) {
                    var parts = data.ORDERDATE.split('-');
                    if (parts.length === 3) {
                        dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                    }
                } else {
                    dateObj = new Date(data.ORDERDATE);
                }
            } else {
                dateObj = new Date(data.ORDERDATE);
            }

            if (!isNaN(dateObj.getTime())) {
                dateStr = (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' + dateObj.getFullYear();
                timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            } else {
                var now = new Date();
                dateStr = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
                timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            }
        } catch (e) {
            var now = new Date();
            dateStr = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
            timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
    } else {
        var now = new Date();
        dateStr = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
        timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    $('#printDateTime').text(dateStr + ' ' + timeStr);

    var itemsHtml = '';
    var itemsData = [];

    if (data.ITEMS) {
        try {
            if (typeof data.ITEMS === 'string') {
                if (data.ITEMS.startsWith('[')) {
                    itemsData = JSON.parse(data.ITEMS);
                } else {
                    itemsData = [{ ITEMNAME: data.ITEMS, QUANTITY: data.QUANTITY || 1 }];
                }
            } else if (Array.isArray(data.ITEMS)) {
                itemsData = data.ITEMS;
            }
        } catch (e) {
            itemsData = [{ ITEMNAME: data.ITEMS || 'Item', QUANTITY: data.QUANTITY || 1 }];
        }
    }

    if (itemsData && itemsData.length > 0) {
        $.each(itemsData, function (i, item) {
            var qty = item.QUANTITY || 1;
            var name = item.ITEMNAME || item.ITEMS || 'Item';
            itemsHtml += '<tr>' +
                '<td>' + escapeHtml(qty) + 'x</td>' +
                '<td>' + escapeHtml(name) + '</td>' +
                '</tr>';
        });
    } else {
        itemsHtml = '<tr><td colspan="2" style="text-align:center;color:#9ca3af;">No items</td></tr>';
    }
    $('#printItemsList').html(itemsHtml);

    var allergies = data.ALLERGIES || '';
    if (allergies) {
        $('#printAllergiesBox').show();
        $('#printAllergiesList').text(allergies);
    } else {
        $('#printAllergiesBox').hide();
    }

    var diet = data.DIET || data.RESTRICTIONS || 'No restrictions';
    $('#printDiet').text(diet);

    var trayNumber = data.TRAY || 'DIAL50-TRY-' + (Math.random().toString(36).substring(2, 7).toUpperCase());
    $('#printTray').text('TRAY: ' + trayNumber);

    var prepTime = data.ESTIMATED_TIME || '15';
    $('#printPrepTime').text('PREP: ' + prepTime + ' MIN');

    $('#printPreviewOverlay').css('display', 'flex');
}

function ClosePrintPreview(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    $('#printPreviewOverlay').css('display', 'none');
}

function PrintDocketNow(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (isPrinting) {
        ShowToast('Print already in progress, please wait...', 'warning');
        return;
    }

    if (!currentPrintOrderId) {
        ShowToast('No order to print', 'error');
        return;
    }

    isPrinting = true;

    var printContent = $('#printContentWrapper').html();
    if (!printContent) {
        ShowToast('No content to print', 'error');
        isPrinting = false;
        return;
    }

    var btn = $('#btnPrintDocket');
    btn.prop('disabled', true);
    btn.html('Printing...');

    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("PRINTDOCKET")) +
        "&ORDERID=" + encodeURIComponent(Encrypt(currentPrintOrderId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            btn.prop('disabled', false);
            btn.html('<img src="../images/printer.png" style="width: 18px; height: 18px; object-fit: contain; filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);"> Print');

            ClosePrintPreview();

            if (res && res.length > 0 && res[0].RESULT === 'Success') {
                ShowToast('Docket printed successfully');
                LoadDocketsSummary();
                LoadDocketsList();
                setTimeout(function () {
                    PrintDocketContentDirect(printContent);
                }, 300);
            } else if (res && res.length > 0 && res[0].MESSAGE) {
                ShowToast(res[0].MESSAGE, 'warning');
                setTimeout(function () {
                    PrintDocketContentDirect(printContent);
                }, 300);
            } else {
                ShowToast('Failed to print docket', 'error');
                setTimeout(function () {
                    PrintDocketContentDirect(printContent);
                }, 300);
            }
        },
        error: function (xhr, status, error) {
            btn.prop('disabled', false);
            btn.html('<img src="../images/printer.png" style="width: 18px; height: 18px; object-fit: contain; filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);"> Print');
            console.log("Error printing docket:", error);
            ShowToast('Error printing docket', 'error');
            ClosePrintPreview();
            setTimeout(function () {
                PrintDocketContentDirect(printContent);
            }, 300);
        }
    });
}

function PrintDocketContentDirect(content) {
    if (printTimeout) {
        clearTimeout(printTimeout);
        printTimeout = null;
    }

    if (!content) {
        content = $('#printContentWrapper').html();
        if (!content) {
            ShowToast('No content to print', 'error');
            ResetPrintState();
            return;
        }
    }

    try {
        var printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');

        if (printWindow) {
            printWindow.document.write('<!DOCTYPE html><html><head><title>Print Docket</title>');
            printWindow.document.write('<style>');
            printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }');
            printWindow.document.write('.print-content { max-width: 800px; margin: 0 auto; }');
            printWindow.document.write('.company-header { display: flex; justify-content: space-between; align-items: flex-start; }');
            printWindow.document.write('.company-header h1 { margin: 0; font-size: 32px; color: #1f2d45; font-weight: 700; }');
            printWindow.document.write('.company-header span { color: #7b8798; font-size: 14px; }');
            printWindow.document.write('.order-info label { display: block; color: #7b8798; font-size: 12px; font-weight: 600; }');
            printWindow.document.write('.order-info h3 { margin: 2px 0; font-size: 24px; color: #24344d; }');
            printWindow.document.write('hr { margin: 16px 0; border: none; border-top: 2px solid #23344f; }');
            printWindow.document.write('.patient-row { display: flex; justify-content: space-between; margin-bottom: 20px; }');
            printWindow.document.write('.patient-row small { color: #8d96a5; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }');
            printWindow.document.write('.patient-row h3 { margin: 4px 0; font-size: 24px; color: #1d2b46; }');
            printWindow.document.write('.patient-row span { color: #777; font-size: 18px; }');
            printWindow.document.write('.text-right { text-align: right; }');
            printWindow.document.write('.text-right h4 { margin-top: 4px; font-size: 20px; color: #1d2b46; }');
            printWindow.document.write('.section-title { color: #8d96a5; font-size: 13px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }');
            printWindow.document.write('.item-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }');
            printWindow.document.write('.item-table th { text-align: left; color: #69758b; padding: 8px 0; border-bottom: 2px solid #ddd; font-size: 13px; font-weight: 600; }');
            printWindow.document.write('.item-table td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 18px; color: #1a1a2e; }');
            printWindow.document.write('.item-table tbody tr:last-child td { border-bottom: none; }');
            printWindow.document.write('.allergy-box { border: 2px solid #ff4d4f; background: #fff4f4; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; }');
            printWindow.document.write('.diet-box { border: 2px solid #ffc53d; background: #fffbe8; border-radius: 12px; padding: 12px 16px; }');
            printWindow.document.write('.box-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }');
            printWindow.document.write('.danger { color: #d40000; }');
            printWindow.document.write('.warning { color: #b36b00; }');
            printWindow.document.write('.bottom-info { margin-top: 16px; display: flex; justify-content: space-between; color: #8a96aa; font-size: 14px; font-weight: 500; padding-top: 12px; border-top: 1px solid #eee; }');
            printWindow.document.write('</style>');
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
            };

            printTimeout = setTimeout(function () {
                if (!printWindow.closed) {
                    try {
                        printWindow.close();
                    } catch (e) { }
                    ResetPrintState();
                    ShowToast('Print dialog didn\'t open. Please try again or allow popups.', 'warning');
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
            }, 300);

        } else {
            ShowToast('Please allow popups for this site to print', 'warning');

            var iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);

            var iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write('<!DOCTYPE html><html><head><title>Print</title>');
            iframeDoc.write('<style>');
            iframeDoc.write('body { font-family: Arial, sans-serif; padding: 20px; }');
            iframeDoc.write('</style>');
            iframeDoc.write('</head><body>');
            iframeDoc.write(content);
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
        ShowToast('Error printing. Please try again.', 'error');
        ResetPrintState();
    }
}

function ResetPrintState() {
    isPrinting = false;
    currentPrintOrderId = '';
    printContentCache = null;

    if (printTimeout) {
        clearTimeout(printTimeout);
        printTimeout = null;
    }

    $('#btnPrintDocket').prop('disabled', false);
    $('#btnPrintDocket').html('<img src="../images/printer.png" style="width: 18px; height: 18px; object-fit: contain; filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);"> Print');
    $('#printIframe').remove();
}

function ForceResetPrint() {
    ResetPrintState();
    ShowToast('Print state reset', 'info');
}

function formatDateForDisplay(dateValue) {
    try {
        var dateObj;

        if (!dateValue) {
            return getCurrentDateTime();
        }

        if (typeof dateValue === 'string') {
            var cleanDate = dateValue.replace(/Z$/, '').replace(/\+.*$/, '');
            dateObj = new Date(cleanDate);

            if (isNaN(dateObj.getTime())) {
                var parts = cleanDate.split(/[-/]/);
                if (parts.length === 3) {
                    dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                }
            }
        } else if (dateValue instanceof Date) {
            dateObj = dateValue;
        } else {
            dateObj = new Date(dateValue);
        }

        if (isNaN(dateObj.getTime())) {
            return getCurrentDateTime();
        }

        var dateStr = (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' + dateObj.getFullYear();
        var timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return dateStr + ' ' + timeStr;
    } catch (e) {
        return getCurrentDateTime();
    }
}

function getCurrentDateTime() {
    var now = new Date();
    var dateStr = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
    var timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return dateStr + ' ' + timeStr;
}

function getDockRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '').toString();
}
function LoadDockNotifications() {
    var roleId = getDockRoleId();
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20"));

    if (roleId) {
        url += "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    }

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            RenderDockNotifications(res || []);
        },
        error: function (xhr, status, error) {
            console.log("Error loading notifications:", error);
            RenderDockNotifications([]);
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

function getIconFilter(type) {
    type = (type || '').toLowerCase();
    switch (type) {
        case "error":
            return "brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(1234%) hue-rotate(200deg) brightness(95%) contrast(95%)";
        case "info":
            return "brightness(0) saturate(100%) invert(31%) sepia(98%) saturate(1234%) hue-rotate(200deg) brightness(95%) contrast(95%)";
        case "success":
            return "brightness(0) saturate(100%) invert(52%) sepia(58%) saturate(1529%) hue-rotate(102deg) brightness(96%) contrast(96%)";
        case "warning":
            return "brightness(0) saturate(100%) invert(77%) sepia(52%) saturate(1529%) hue-rotate(350deg) brightness(96%) contrast(96%)";
        default:
            return "brightness(0) saturate(100%) invert(42%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)";
    }
}

function RenderDockNotifications(notifications) {
    var html = '';
    var unreadCount = 0;

    if (notifications && notifications.length > 0) {
        $.each(notifications, function (i, item) {
            var isRead = item.IS_READ === true || item.IS_READ === 1;
            if (!isRead) unreadCount++;

            var iconClass = (item.NOTIFICATION_TYPE || 'info').toLowerCase();
            var icon = getNotificationIcon(iconClass);
            var iconFilter = getIconFilter(iconClass);
            var notificationId = item.NOTIFICATION_ID || item.ID || i;

            html += '<div class="dock-notification-item' + (isRead ? ' read' : ' unread') + '" data-id="' + notificationId + '">' +
                '<div class="dock-notification-icon" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: transparent; border-radius: 50%;">' +
                '<img src="' + icon + '" alt="' + iconClass + '" style="width: 24px; height: 24px; object-fit: contain; filter: ' + iconFilter + ';">' +
                '</div>' +
                '<div class="dock-notification-content">' +
                '<div class="dock-notification-text">' +
                '<h4>' + escapeHtml(item.NOTIFICATION_HEADER || '') + '</h4>' +
                '<p>' + escapeHtml(item.NOTIFICATION_MESSAGE || '') + '</p>' +
                '</div>' +
                '<div class="dock-notification-time">' + escapeHtml(item.TIME_AGO || '') + '</div>' +
                '</div>' +
                (!isRead ? '<span class="dock-unread-dot"></span>' : '') +
                '</div>';
        });
    } else {
        html = '<div class="dock-notification-item" style="text-align:center;color:#888;padding:20px;">No new notifications</div>';
    }

    $('#dockNotificationList').html(html);
    updateDockNotificationBadge(unreadCount);
}
function updateDockNotificationBadge(count) {
    var badge = $('#dockNotificationCount');
    if (!badge.length) return;
    badge.removeClass('show');
    badge.text(count);
    if (count > 0) {
        badge.addClass('show');
        badge.css('display', 'block');
    } else {
        badge.removeClass('show');
        badge.css('display', 'none');
    }
}

function LoadDockNotifications() {
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            RenderDockNotifications(res || []);
        },
        error: function (xhr, status, error) {
            console.log("Error loading notifications:", error);
            RenderDockNotifications([]);
        }
    });
}

function MarkDockNotificationAsRead(NotificationID) {
    var roleId = getDockRoleId();
    var url = API_URL + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(NotificationID));

    if (roleId) {
        url += "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    }

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            LoadDockNotifications();
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
        encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD"));

    if (roleId) {
        url += "&ROLEID=" + encodeURIComponent(Encrypt(roleId));
    }

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            LoadDockNotifications();
            ShowToast('All notifications marked as read', 'success');
        },
        error: function (xhr, status, error) {
            console.log("Error marking all notifications as read:", error);
            ShowToast('Failed to mark all as read', 'error');
        }
    });
}


function RefreshData() {
    var icon = $('#refreshIcon');
    icon.addClass('spinning');
    $('#btnRefresh').prop('disabled', true);
    LoadDocketsSummary();
    LoadDocketsList();
    LoadDockNotifications();
    updateLastSyncedTime();
    ShowToast('Data refreshed successfully');
    setTimeout(function () {
        icon.removeClass('spinning');
        $('#btnRefresh').prop('disabled', false);
    }, 800);
}

function RefreshDataSmall() {
    var icon = $('#refreshIconSmall');
    icon.addClass('spinning');
    $('#btnRefreshSmall').prop('disabled', true);
    LoadDocketsSummary();
    LoadDocketsList();
    LoadDockNotifications();
    updateLastSyncedTime();
    ShowToast('Data refreshed successfully');
    setTimeout(function () {
        icon.removeClass('spinning');
        $('#btnRefreshSmall').prop('disabled', false);
    }, 800);
}

function StartAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
    autoRefreshTimer = setInterval(function () {
        LoadDocketsSummary();
        LoadDockNotifications();
    }, refreshInterval);
}

function StopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}

$(document).ready(function () {
    var userName = sessionStorage.getItem('NAME') || '';
    var userRole = sessionStorage.getItem('ROLENAME') || '';
    var userDept = sessionStorage.getItem('DEPARTMENT') || '';

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

    var interval = parseInt($('#hfRefreshInterval').val());
    if (interval && interval > 0) {
        refreshInterval = interval;
    }

    SetCurrentDate();
    LoadDocketsSummary();
    LoadDocketsList();
    LoadWards();
    LoadDockNotifications();
    StartAutoRefresh();

    $(document).on('keyup', '#txtSearchDocket', function () {
        LoadDocketsList();
    });

    $(document).on('change', '#filterDate', function () {
        LoadDocketsSummary();
        LoadDocketsList();
    });

    $(document).on('change', '#ddlWard', function () {
        LoadDocketsList();
    });

    $(document).on('click', '#btnRefresh', function (e) {
        e.preventDefault();
        RefreshData();
    });

    $(document).on('click', '#btnRefreshSmall', function (e) {
        e.preventDefault();
        RefreshDataSmall();
    });

    $(document).on('click', '#btnPrintNext', function (e) {
        e.preventDefault();
        PrintNextUnprinted(e);
    });

    $(document).on('click', '#dockNotificationBell', function (e) {
        e.stopPropagation();
        e.preventDefault();

        var dropdown = $('#dockNotificationDropdown');

        if (dropdown.hasClass('show')) {
            dropdown.removeClass('show');
            dropdown.css('display', 'none');
        } else {
            dropdown.addClass('show');
            dropdown.css('display', 'block');
            LoadDockNotifications();
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dock-notification-bell').length && !$(e.target).closest('.dock-notification-dropdown').length) {
            $('#dockNotificationDropdown').removeClass('show');
            $('#dockNotificationDropdown').css('display', 'none');
        }
    });

    $(document).on('click', '#dockMarkAllRead', function (e) {
        e.preventDefault();
        e.stopPropagation();
        MarkAllDockNotificationsAsRead();
    });

    $(document).on('click', '.dock-notification-item.unread[data-id]', function () {
        var id = $(this).data('id');
        var $this = $(this);
        $this.removeClass('unread');
        $this.find('.dock-unread-dot').remove();
        $this.css({
            'transition': 'opacity 0.6s ease, transform 0.4s ease',
            'opacity': '0',
            'transform': 'translateX(30px)'
        });
        MarkDockNotificationAsRead(id);
        setTimeout(function () {
            $this.remove();
            var currentCount = parseInt($('#dockNotificationCount').text()) || 0;
            var newCount = Math.max(0, currentCount - 1);
            $('#dockNotificationCount').text(newCount);
            if (newCount <= 0) {
                $('#dockNotificationCount').removeClass('show');
            }
            if ($('.dock-notification-item').length === 0) {
                $('#dockNotificationList').html(
                    '<div class="dock-notification-item" style="text-align:center;color:#888;padding:20px;">' +
                    'No new notifications' +
                    '</div>'
                );
            }
        }, 700);
    });

    $(document).on('click', '.close-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        ClosePrintPreview(e);
    });

    $(document).on('click', '#btnPrintDocket', function (e) {
        e.preventDefault();
        e.stopPropagation();
        PrintDocketNow(e);
    });

    $(document).on('click', '#printPreviewOverlay', function (e) {
        if ($(e.target).is('#printPreviewOverlay')) {
            ClosePrintPreview(e);
        }
    });

    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#printPreviewOverlay').is(':visible')) {
            ClosePrintPreview(e);
        }
        if (e.key === 'r' && e.ctrlKey) {
            ForceResetPrint();
        }
    });

    setInterval(function () {
        LoadDocketsSummary();
        LoadDockNotifications();
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