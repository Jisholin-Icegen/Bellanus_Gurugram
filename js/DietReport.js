var DR_PAGE_SIZE = 10;
var DR_CURRENT_PAGE = 1;
var DR_ALL = [];
var DR_FILTERED = [];
var DR_SEARCH_TIMEOUT = null;

function LoadDietTypeDropdown() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDIETTYPEDROPDOWN"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            var $dd = $("#ddlDietType");
            $dd.empty().append('<option value="">All Diet Types</option>');
            $.each(res || [], function (i, item) {
                $dd.append('<option value="' + item.NAME + '">' + escapeHtml(item.NAME) + '</option>');
            });

            if ($dd[0].sumo) {
                $dd[0].sumo.reload();
            }
        },
        error: function () {
            console.log("Failed to load diet types");
        }
    });
}

function LoadDietReport() {
    var fromDate = $("#txtFromDate").val();
    var toDate = $("#txtToDate").val();
    var dietType = $("#ddlDietType").val();
    var search = $.trim($("#txtSearch").val());

    if (!fromDate || !toDate) {
        return;
    }

    if (fromDate > toDate) {
        DR_ALL = [];
        RenderDietTable();
        return;
    }

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETDIETREPORT")) +
        "&FROMDATE=" + encodeURIComponent(Encrypt(fromDate)) +
        "&TODATE=" + encodeURIComponent(Encrypt(toDate)) +
        "&DIETTYPE=" + encodeURIComponent(Encrypt(dietType || "")) +
        "&SEARCH=" + encodeURIComponent(Encrypt(search || ""));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            DR_ALL = res || [];
            DR_CURRENT_PAGE = 1; 
            RenderDietTable();
            $("#drTableDate").text(FormatPlanDate(fromDate) + " - " + FormatPlanDate(toDate));
        },
        error: function () {
            DR_ALL = [];
            RenderDietTable();
        }
    });
}

function FormatPlanDate(d) {
    if (!d) return "";
    var dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DietClass(t) {
    return "dr-diet-" + (t || "regular").toLowerCase().replace(/\s+/g, "-");
}

function RenderDietTable() {
    var $body = $("#tblDiet tbody");
    $body.empty();

    if (DR_ALL.length === 0) {
        $body.html(
            '<tr><td colspan="8" class="dr-empty">' +
            '<i class="fa-solid fa-bowl-food"></i>' +
            'No diet records found for the selected filters.' +
            '</td></tr>'
        );
        $("#drPageInfo").text("Showing 0 of 0");
        $("#drPager").empty();
        return;
    }

    var start = (DR_CURRENT_PAGE - 1) * DR_PAGE_SIZE;
    var pageRows = DR_ALL.slice(start, start + DR_PAGE_SIZE);

    $.each(pageRows, function (i, r) {
        var allergy = (!r.ALLERGIES || $.trim(r.ALLERGIES).toLowerCase() === "none")
            ? '<span class="dr-allergen-none">None</span>'
            : '<span class="dr-allergen-pill">' + escapeHtml(r.ALLERGIES) + '</span>';

        $body.append(
            '<tr>' +
            '<td>' + (start + i + 1) + '</td>' +
            '<td class="dr-patient-name">' + escapeHtml(r.PATIENTNAME) + '</td>' +
            '<td>' + escapeHtml(r.ROOMNO) + '</td>' +
            '<td>' + escapeHtml(r.AGE) + '</td>' +
            '<td><span class="dr-pill ' + DietClass(r.DIETTYPE) + '">' + escapeHtml(r.DIETTYPE) + '</span></td>' +
            '<td>' + allergy + '</td>' +
            '<td class="dr-note">' + escapeHtml(r.MEDICALNOTES) + '</td>' +
            '<td class="dr-note">' + escapeHtml(r.DIETARYNOTES) + '</td>' +
            '</tr>'
        );
    });

    RenderPager();
}

function RenderPager() {
    var total = DR_ALL.length;
    var pages = Math.ceil(total / DR_PAGE_SIZE);
    var from = (DR_CURRENT_PAGE - 1) * DR_PAGE_SIZE + 1;
    var to = Math.min(DR_CURRENT_PAGE * DR_PAGE_SIZE, total);

    $("#drPageInfo").text("Showing " + from + "-" + to + " of " + total);

    var html = '<button type="button" data-page="' + (DR_CURRENT_PAGE - 1) + '"' + (DR_CURRENT_PAGE === 1 ? ' disabled' : '') + '>&lsaquo;</button>';
    for (var p = 1; p <= pages; p++) {
        html += '<button type="button" data-page="' + p + '"' + (p === DR_CURRENT_PAGE ? ' class="active"' : '') + '>' + p + '</button>';
    }
    html += '<button type="button" data-page="' + (DR_CURRENT_PAGE + 1) + '"' + (DR_CURRENT_PAGE === pages ? ' disabled' : '') + '>&rsaquo;</button>';
    $("#drPager").html(html);
}

$(document).on("click", "#drPager button:not(:disabled)", function () {
    DR_CURRENT_PAGE = parseInt($(this).data("page"));
    RenderDietTable();
});

$(document).on("change", "#txtFromDate, #txtToDate", function () {
    LoadDietReport();
});

$(document).on("change", "#ddlDietType", function () {
    LoadDietReport();
});

$(document).on("input", "#txtSearch", function () {
    clearTimeout(DR_SEARCH_TIMEOUT);
    DR_SEARCH_TIMEOUT = setTimeout(function () {
        LoadDietReport();
    }, 400); 
});

$(document).on("click", "#btnExportCSV", function (e) {
    e.preventDefault();
    ExportDietReport();
});

function ExportDietReport() {
    var workbook = new ExcelJS.Workbook();
    var worksheet = workbook.addWorksheet('Diet Report');
    worksheet.columns = [
        { header: 'S.NO', key: 'SNO', width: 10 },
        { header: 'PATIENTNAME', key: 'PATIENTNAME', width: 25 },
        { header: 'ROOMNUMBER', key: 'ROOMNO', width: 15 },
        { header: 'AGE', key: 'AGE', width: 10 },
        { header: 'DIETTYPE', key: 'DIETTYPE', width: 25 },
        { header: 'ALLERGIES', key: 'ALLERGIES', width: 25 },
        { header: 'MEDICALNOTES', key: 'MEDICALNOTES', width: 35 },
        { header: 'DIETARYNOTES', key: 'DIETARYNOTES', width: 35 }
    ];
    var headerRow = worksheet.getRow(1);
    headerRow.eachCell(function (cell) {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF009688' } 
        };
        cell.font = {
            color: { argb: 'FFFFFFFF' }, 
            bold: true,
            size: 11
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
    DR_ALL.forEach(function (r, index) {
        worksheet.addRow({
            SNO: index + 1, 
            PATIENTNAME: r.PATIENTNAME,
            ROOMNO: r.ROOMNO,
            AGE: r.AGE,
            DIETTYPE: r.DIETTYPE,
            ALLERGIES: r.ALLERGIES,
            MEDICALNOTES: r.MEDICALNOTES,
            DIETARYNOTES: r.DIETARYNOTES
        });
    });
    workbook.xlsx.writeBuffer().then(function (buffer) {
        var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        var fileSuffix = ($("#txtFromDate").val() || "from") + "_to_" + ($("#txtToDate").val() || "to");
        link.download = "diet-report-" + fileSuffix + ".xlsx";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function escapeHtml(value) {
    if (value === null || value === undefined || value === "") return '';
    return String(value).replace(/[&<>"']/g, function (ch) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[ch];
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

function ShowModalPopUp(ModalId) {
    $('#' + ModalId).modal('show');
}
function HideModalPopUp(ModalId) {
    $('#' + ModalId).modal('hide');
}