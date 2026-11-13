var ReportOption = ["Report1", "Report2", "Report3", "Report4", "Report5", "Report6", "Report7", "Report0", "Report8"],
    CatInnerOption = ["Option1", "Option2", "Option3"],
    TimeInnerOption = ["TOption1", "TOption2", "TOption3", "TOption4", "TOption5"],
    PorterInnerOption = ["POption1", "POption2", "POption3", "POption4"],
    ORInnerOption = ["OROption1", "OROption2"],
    EscalationInnerOption = ["EOption1", "EOption2", "EOption3"];

function selectReport(Opt, PageFrom) {
    RenderAt = 'EscalationChart'; 

    var InnerArray = ReportOption;

    $('#ChartRenderAt').html('').hide();
    $('#EscalationChart').html('').show().css('display', 'block');
    $('#tblOROptions').css('display', 'none');
    $('#tblCatOptions').css('display', 'none');
    $('#tblTimeOptions').css('display', 'none');
    $('#tblPorterOptions').css('display', 'none');
    $('#tblEscalationOptions').css('display', 'none');
    $('#tdGridPorter').css('display', 'none');
    $('#tdDatewise').css('display', 'none');
    $('#tdDatewises').css('display', 'none');
    $('#tdExport').css('display', 'none');
    $('#tdExports').css('display', 'none');
    $('#ChartDept').css('display', 'table-row');
    $('#divselRequestStatus').css('display', 'none');
    $('#divChartType').css('display', 'inline-block');
    $('#DateFilter').css('display', 'flex');
    $('#divDWDateFilter').css('display', 'none');
    $('#tdRefresh').css('display', 'none');
    $('#ChartType').val('bar2d');

    $.each(InnerArray, function (index, value) {
        if (value == Opt) {
            $('#' + value).addClass('SelectReqIcon');
            InnerReport = Opt;

            if (Opt == "Report1") {
                $('#ChartType').val('column2d');
                $('#tblCatOptions').css('display', 'table');
                $('#Option1').addClass('ChartOptionSelected');
                InnerOption = 'Option1';
                setDateDW('CURRENT');
                SValidate(true, document.getElementById("txtfromdate").value, document.getElementById("txttodate").value);
            }
            else if (Opt == "Report2") {
                $('#ChartType').val('doughnut3d');
                $('#tblCatOptions').css('display', 'table');
                $('#Option1').addClass('ChartOptionSelected');
                InnerOption = 'Option1';
            }
            else if (Opt == "Report3") {
                $('#ChartType').val('line');
                $('#tblTimeOptions').css('display', 'table');
                $('#TOption1').addClass('ChartOptionSelected');
                InnerOption = 'TOption1';
            }
            else if (Opt == "Report4") {
                $('#ChartType').val('line');
                $('#tblPorterOptions').css('display', 'table');
                $('#tdGridPorter').css('display', 'table');
                $('#POption1').addClass('ChartOptionSelected');
                InnerOption = 'POption1';
            }
            else if (Opt == "Report5") {
                $('#ChartType').val('line');
                $('#tblOROptions').css('display', 'table');
                $('#OROption1').addClass('ChartOptionSelected');
                InnerOption = 'OROption1';
            }
            else if (Opt == "Report7") {
                $('#ChartDept').css('display', 'none');
                $('#divChartType').css('display', 'none');
                $('#DateFilter').css('display', 'flex');
                $('#divselRequestStatus').css('display', 'flex');
                $('#divDWDateFilter').css('display', 'flex');
                $('#tdDatewise').css('display', 'table-row');
                $('#tdExport').css('display', 'inline-block');
                $('#tdRefresh').css('display', 'inline-block');
            }
            else if (Opt == "Report8") {

                $('#ChartDept').css('display', 'table-row');
                $('#divChartType').css('display', 'none');
                $('#DateFilter').css('display', 'flex');
                $('#divselRequestStatus').css('display', 'none');
                $('#divDWDateFilter').css('display', 'none');
                $('#tdRefresh').css('display', 'none');
                $('#tblEscalationOptions').css('display', 'none');

                $('#EscalationChart').empty();

                var multiChartHtml = '<div id="multiChartContainer" style="width: 100%;">' +

                    '<div style="display: flex; flex-wrap: wrap; gap: 30px; margin-bottom: 40px;">' +

                    '<div style="flex: 1; min-width: 400px;">' +
                    '<div style="background: rgba(255, 255, 255, 0.75);' +
                    'box-sizing: border-box;' +
                    'width: 100%;' +
                    'backdrop-filter: blur(12px);' +
                    '-webkit-backdrop-filter: blur(12px);' +
                    'border-radius: 16px;' +
                    'border: 1px solid rgba(255, 255, 255, 0.4);' +
                    'box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);' +
                    'transition: transform 0.3s ease, box-shadow 0.3s ease;' +
                    'cursor: default;' +
                    '" ' +
                    'onmouseover="this.style.transform=\'translateY(-4px)\'; this.style.boxShadow=\'0 12px 48px rgba(31, 38, 135, 0.25)\';" ' +
                    'onmouseout="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 8px 32px rgba(31, 38, 135, 0.1)\';">' +

                    '<div style="' +
                    'padding: 16px 22px;' +
                    'font-weight: 700;' +
                    'font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;' +
                    'font-size: 17px;' +
                    'color: #2c4c63;' +
                    'border-bottom: 1.5px solid #e1e8f0;' +
                    'letter-spacing: 0.03em;' +
                    'background: transparent;' +
                    'box-sizing: border-box;' +
                    '">' +
                    'Service Level Weekly Trend' +
                    '</div>' +

                    '<div style="padding: 22px; box-sizing: border-box;">' +
                    '<div id="weeklyTrendChart" style="height: 450px; width: 100%; opacity: 0; animation: fadeIn 1s forwards;"></div>' +
                    '</div></div></div>' +


                    '<div style="flex: 1; min-width: 400px;">' +
                    '<div style="background: rgba(255, 255, 255, 0.75);' +
                    'backdrop-filter: blur(12px);' +
                    '-webkit-backdrop-filter: blur(12px);' +
                    'border-radius: 16px;' +
                    'border: 1px solid rgba(255, 255, 255, 0.4);' +
                    'box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);' +
                    'transition: transform 0.3s ease, box-shadow 0.3s ease;' +
                    'overflow: hidden;' +
                    'cursor: default;' +
                    '" ' +
                    'onmouseover="this.style.transform=\'scale(1.03)\'; this.style.boxShadow=\'0 12px 48px rgba(31, 38, 135, 0.25)\';" ' +
                    'onmouseout="this.style.transform=\'scale(1)\'; this.style.boxShadow=\'0 8px 32px rgba(31, 38, 135, 0.1)\';">' +

                    '<div style="' +
                    'padding: 16px 22px;' +
                    'font-weight: 700;' +
                    'font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;' +
                    'font-size: 17px;' +
                    'color: #2c4c63;' +
                    'border-bottom: 1.5px solid #e1e8f0;' +
                    'letter-spacing: 0.03em;' +
                    'background: transparent;' + '">' +
                    'Service Level By Departments' +
                    '</div>' +

                    '<div style="padding: 22px;">' +
                    '<div id="deptChart" style="height: 450px; opacity: 0; animation: fadeIn 1s forwards;"></div>' +
                    '</div></div></div>' +

                    '</div>' +

                    '<div style="display: flex; flex-wrap: wrap;">' +
                    '<div style="flex: 1; min-width: 800px;">' +
                    '<div style="background: rgba(255, 255, 255, 0.75);' +
                    'backdrop-filter: blur(12px);' +
                    '-webkit-backdrop-filter: blur(12px);' +
                    'border-radius: 16px;' +
                    'border: 1px solid rgba(255, 255, 255, 0.4);' +
                    'box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);' +
                    'transition: transform 0.3s ease, box-shadow 0.3s ease;' +
                    'overflow: hidden;' +
                    'cursor: default;' +
                    '" ' +
                    'onmouseover="this.style.transform=\'scale(1.03)\'; this.style.boxShadow=\'0 12px 48px rgba(31, 38, 135, 0.25)\';" ' +
                    'onmouseout="this.style.transform=\'scale(1)\'; this.style.boxShadow=\'0 8px 32px rgba(31, 38, 135, 0.1)\';">' +

                    '<div style="' +
                    'padding: 16px 22px;' +
                    'font-weight: 700;' +
                    'font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;' +
                    'font-size: 17px;' +
                    'color: #2c4c63;' +
                    'border-bottom: 1.5px solid #e1e8f0;' +  
                    'letter-spacing: 0.03em;' +
                    'background: transparent;' +
                    '">' +
                    'Service Level By Top 7 Tasks' +
                    '</div>' +

                    '<div style="padding: 25px;">' +
                    '<div id="tasksChart" style="height: 550px; opacity: 0; animation: fadeIn 1s forwards;"></div>' +
                    '</div></div></div>' +

                    '</div></div>' +

                    '<style>@keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }</style>';

                $('#EscalationChart').html(multiChartHtml);

                setDateDW('CURRENT');
                loadAllEscalationReports();
            }

            else if (Opt == "Report0") {
                $('#ChartDept').css('display', 'none');
                $('#divChartType').css('display', 'none');
                $('#DateFilter').css('display', 'flex');
                $('#divselRequestStatus').css('display', 'flex');
                $('#divDWDateFilter').css('display', 'flex');
                $('#tdDatewises').css('display', 'table-row');
                $('#tdExports').css('display', 'inline-block');
                $('#tdRefresh').css('display', 'inline-block');
                $('#tdExport').css('display', 'none');
            }
        } else {
            $('#' + value).removeClass('SelectReqIcon');
        }
    });

    $('#EscalationChart').css('display', 'block');

    GetReport();
}

function changeCheck(ele) {
    var src = $(ele).attr('src'); //alert(src);
    $(ele).attr("src", (src == "../images/CNoCheck.png") ? "../images/CCheck.png" : "../images/CNoCheck.png");

}

function selectOption(Opt, PageFrom) {
    var InnerArray = (PageFrom == 'Time') ? TimeInnerOption :
        (PageFrom == 'Cat') ? CatInnerOption :
            (PageFrom == 'Porter') ? PorterInnerOption :
                (PageFrom == 'OR') ? ORInnerOption :
                    (PageFrom == 'Escalation') ? EscalationInnerOption : [];

    $.each(InnerArray, function (index, value) {
        if (value == Opt) {
            $('#' + value).addClass('ChartOptionSelected');
            InnerOption = Opt;

            if (PageFrom == 'Escalation') {
                if (Opt == "EOption1") {
                    $('#ChartType').val('msline');
                } else if (Opt == "EOption2" || Opt == "EOption3") {
                    $('#ChartType').val('stackedbar2d');
                }
            }

        } else {
            $('#' + value).removeClass('ChartOptionSelected');
        }
    });

    GetReport();
}

function updateEscalationChartType() {
    var selectedChartType = $('#DrpEscalationChartType').val();
    $('#ChartType').val(selectedChartType);

    EscalationReport(false, document.getElementById("txtfromdate"), document.getElementById("txttodate"));
    return false;
}

function exportEscalationReport() {
    var from = convertDate(document.getElementById("txtfromdate").value + "T00:00");
    var to = convertDate(document.getElementById("txttodate").value + "T23:59");
    var fileName = 'Escalation_Report_' + from.split(' ')[0] + '_to_' + to.split(' ')[0] + '.xls';

    var reportType = '';
    switch (InnerOption) {
        case 'EOption1': reportType = 'ESCALATION_TREND'; break;
        case 'EOption2': reportType = 'ESCALATION_DEPARTMENT'; break;
        case 'EOption3': reportType = 'ESCALATION_TASK'; break;
    }

    var userId = sessionStorage.getItem('ID') || 0;

    var locationIds = getSumoSelectValues('#search_NurseLocation');
    var departmentIds = getSumoSelectValues('#search_Department');

    if (locationIds.includes('All') || locationIds.length === 0) {
        locationIds = '';
    } else {
        locationIds = locationIds.join(',');
    }

    if (departmentIds.includes('All') || departmentIds.length === 0) {
        departmentIds = '';
    } else {
        departmentIds = departmentIds.join(',');
    }

    $.ajax({
        url: ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("EXPORTESCALATION")) +
            "&From=" + encodeURIComponent(Encrypt(from)) +
            "&To=" + encodeURIComponent(Encrypt(to)) +
            "&Type=" + encodeURIComponent(Encrypt(reportType)) +
            "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
            "&UserId=" + encodeURIComponent(Encrypt(userId)) +
            "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
            "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data[0] && data[0].Result) {
                var downloadLink = document.createElement("a");
                downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                alert('No data available to export.');
            }
        },
        error: function (data) {
            alert('Error exporting escalation report.');
        }
    });
}

const COLORS = {
    NOT_ESCALATED: "#2AA198", 
    LEVEL1: "#D4E157",         
    LEVEL2: "#93C47D",      
    LEVEL3: "#6AA84F",   
    BG_LIGHT: "#FFFFFF",
    GRID_COLOR: "#CBD5E0",      
    TOOLTIP_BG: "#f5f5f5",
    TOOLTIP_TEXT: "#1a1a1a",
    TEXT_PRIMARY: "#1a1a1a",
    TEXT_SECONDARY: "#4A5568",  
    AXIS_LINE: "#A0AEC0",       
    CARD_BG: "#FFFFFF",
    CARD_SHADOW: "0 4px 6px rgba(0, 0, 0, 0.05)",
    GRADIENT_START: "#F7FAFC",
    GRADIENT_END: "#FFFFFF",
    SUCCESS: "#2C7A7B",         
    WARNING: "#ED8936",         
    ERROR: "#E53E3E",           
    INFO: "#4299E1"             
};

const CHART_THEME = {
    backgroundColor: "#F7FAFC",
    cardBackground: "#FFFFFF",
    fontFamily: "'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    textColor: "#1A202C",
    lightText: "#4A5568",
    borderColor: "#E2E8F0",
    gridColor: "#CBD5E0",        
    tooltipBg: "#f5f5f5",
    tooltipText: "#1a1a1a",
    axisLineColor: "#A0AEC0",    
    cardBorderRadius: "12px",
    cardShadow: "0 2px 4px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03)"
};

const formatNumber = num => num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";

const PROFESSIONAL_LOADER = `
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; 
                background:${CHART_THEME.cardBackground}; border-radius:16px; border:1px solid ${CHART_THEME.borderColor};
                font-family:${CHART_THEME.fontFamily};">
        <svg width="48" height="48" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="${CHART_THEME.borderColor}" stroke-width="2.5"/>
            <circle cx="20" cy="20" r="16" fill="none" stroke="${COLORS.NOT_ESCALATED}" stroke-width="2.5" 
                    stroke-dasharray="100" stroke-dashoffset="75" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" 
                                  dur="1.2s" repeatCount="indefinite"/>
            </circle>
        </svg>
        <p style="margin:16px 0 0 0; color:${CHART_THEME.lightText}; font-size:14px; font-weight:400;">
            Loading chart data...
        </p>
    </div>
`;

const showChartMessage = (containerId, message, type = "info") => {
    const messages = {
        info: { color: "#636363", icon: "📊", bg: "#fdfdfd", border: "#dfdfe0" },
        error: { color: "#f86b7e", icon: "✕", bg: "#fff5f5", border: "#f86b7e" },
        empty: { color: "#636363", icon: "📈", bg: "#fdfdfd", border: "#dfdfe0" }
    };

    const config = messages[type] || messages.info;

    $('#' + containerId).html(`
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; 
                    background:${config.bg}; border-radius:16px; border:1px solid ${config.border};
                    font-family:${CHART_THEME.fontFamily};">
            <div style="font-size:48px; margin-bottom:16px; opacity:0.8;">${config.icon}</div>
            <p style="margin:0; color:${config.color}; font-size:15px; font-weight:500;">
                ${message}
            </p>
        </div>
    `);
};

const mapChartData = (data, chartType) => {
    let items = [];

    if (Array.isArray(data)) items = data;
    else if (data && Array.isArray(data.data)) items = data.data;
    else if (data && typeof data === "object") items = [data];

    return items.map(item => {
        let label = item.label ||
            item.Department ||
            item.TaskCategory ||
            item.Week ||
            "Unknown";

        if (chartType === "EOption1" && label && label.includes('-')) {
            try {
                const date = new Date(label);
                if (!isNaN(date.getTime())) {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    label = `${date.getDate()} ${months[date.getMonth()]}`;
                }
            } catch (e) { }
        }

        return {
            label: label,
            originalLabel: item.label || label,
            TotalRequests: item.TotalRequests || 0,
            NotEscalated: item.NotEscalated || 0,
            Level1: item.Level1 || 0,
            Level2: item.Level2 || 0,
            Level3: item.Level3 || 0
        };
    }).filter(item => item.TotalRequests > 0);
};

const createDataset = (chartData) => {
    const seriesNames = ["Not Escalated", "Level 1", "Level 2", "Level 3"];
    const seriesFullNames = ["Not Escalated", "Level 1 Escalated", "Level 2 Escalated", "Level 3 Escalated"];
    const seriesColors = [COLORS.NOT_ESCALATED, COLORS.LEVEL1, COLORS.LEVEL2, COLORS.LEVEL3];

    const dataset = seriesNames.map((name, i) => ({
        seriesname: name,
        data: []
    }));

    chartData.forEach(item => {
        const total = item.TotalRequests;
        const counts = [
            item.NotEscalated || 0,
            item.Level1 || 0,
            item.Level2 || 0,
            item.Level3 || 0
        ];

        counts.forEach((count, i) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            const tooltipText = `
                <div style="font-family: ${CHART_THEME.fontFamily}; padding: 14px; font-size: 14px; line-height:1.6; font-weight:500;">
                    <b style="font-size: 16px; color: #1a1a1a; font-weight:600;">${seriesFullNames[i]}</b><br/>
                    <span style="color: #636363; font-weight:500;">Count:</span> 
                    <span style="color: #1a1a1a; font-weight:600;">${formatNumber(count)}</span><br/>
                    <span style="color: #636363; font-weight:500;">Percentage:</span> 
                    <span style="color: #1a1a1a; font-weight:600;">${percentage}%</span>
                </div>
            `;

            if (count > 0) {
                dataset[i].data.push({
                    value: percentage, 
                    displayValue: percentage + "%",
                    toolText: tooltipText,
                    color: seriesColors[i],
                    alpha: "100"
                });
            } else {
                dataset[i].data.push({
                    value: "",         
                    displayValue: "",  
                    toolText: "",      
                    alpha: "0"         
                });
            }

        });
    });

    return dataset;
};

function bindEscalationChartToContainer(msg, containerId, xAxis, yAxis, chartTitle, chartType) {

    if (!msg) {
        showChartMessage(containerId, "No data received from server", "empty");
        return;
    }

    let chartData = mapChartData(msg, chartType);

    if (chartData.length === 0) {
        showChartMessage(containerId, "No data available for selected period", "empty");
        return;
    }

    const grandTotal = chartData.reduce((sum, item) => sum + item.TotalRequests, 0);

    if (chartType === "EOption1") {
        chartData.sort((a, b) => {
            try {
                return new Date(a.originalLabel) - new Date(b.originalLabel);
            } catch {
                return 0;
            }
        });
    } else {
        chartData.sort((a, b) => b.TotalRequests - a.TotalRequests);
    }

    if (chartType === "EOption1") {
        chartData = chartData.slice(-8);
    } else if (chartType === "EOption3") {
        chartData = chartData.slice(0, 7);
    }

    const categories = chartData.map(item => {
        const tooltipText = `
        <div style="font-family: ${CHART_THEME.fontFamily}; line-height:1.6; padding: 14px; font-size: 14px; font-weight:500;">
            <b style="font-size: 16px; color:#1a1a1a; font-weight:600;">${item.originalLabel}</b>
            <hr style="margin:10px 0; border:none; border-top:1px solid #dfdfe0;">
            <div style="display:grid; grid-template-columns:auto auto; gap:8px 16px;">
                <span style="color:#636363; font-weight:500;">Total:</span>
                <span style="text-align:right; color:#1a1a1a; font-weight:600;">${formatNumber(item.TotalRequests)}</span>
                <span style="color:#636363; font-weight:500;">Not Escalated:</span>
                <span style="text-align:right; color:#1a1a1a; font-weight:600;">${formatNumber(item.NotEscalated)}</span>
                <span style="color:#636363; font-weight:500;">Level 1:</span>
                <span style="text-align:right; color:#1a1a1a; font-weight:600;">${formatNumber(item.Level1)}</span>
                <span style="color:#636363; font-weight:500;">Level 2:</span>
                <span style="text-align:right; color:#1a1a1a; font-weight:600;">${formatNumber(item.Level2)}</span>
                <span style="color:#636363; font-weight:500;">Level 3:</span>
                <span style="text-align:right; color:#1a1a1a; font-weight:600;">${formatNumber(item.Level3)}</span>
            </div>
        </div>
    `;

        const total = item.TotalRequests;
        return {
            label: `${item.label} (${formatNumber(total)})`,
            toolText: tooltipText
        };
    });

    const chartTypeMap = {
        "EOption1": "mscolumn2d",
        "EOption2": "mscolumn2d",
        "EOption3": "mscolumn2d"
    };

    const createSideBySideDataset = (chartData) => {
        const seriesNames = ["Not Escalated", "Level 1", "Level 2", "Level 3"];
        const seriesFullNames = ["Not Escalated", "Level 1 Escalated", "Level 2 Escalated", "Level 3 Escalated"];
        const seriesColors = [COLORS.NOT_ESCALATED, COLORS.LEVEL1, COLORS.LEVEL2, COLORS.LEVEL3];

        const dataset = seriesNames.map((name, i) => ({
            seriesname: name,
            data: []
        }));

        chartData.forEach(item => {
            const total = item.TotalRequests;
            const counts = [
                item.NotEscalated || 0,
                item.Level1 || 0,
                item.Level2 || 0,
                item.Level3 || 0
            ];

            counts.forEach((count, i) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                const tooltipText = `
                    <div style="font-family: ${CHART_THEME.fontFamily}; padding: 14px; font-size: 14px; line-height:1.6; font-weight:500;">
                        <b style="font-size: 16px; color: #1a1a1a; font-weight:600;">${seriesFullNames[i]}</b><br/>
                        <span style="color: #636363; font-weight:500;">Count:</span> 
                        <span style="color: #1a1a1a; font-weight:600;">${formatNumber(count)}</span><br/>
                        <span style="color: #636363; font-weight:500;">Percentage:</span> 
                        <span style="color: #1a1a1a; font-weight:600;">${percentage}%</span>
                    </div>
                `;

                dataset[i].data.push({
                    value: percentage,
                    displayValue: percentage > 0 ? percentage + "%" : "",
                    toolText: tooltipText,
                    color: seriesColors[i],
                    alpha: percentage > 0 ? "100" : "0"
                });
            });
        });

        return dataset;
    };

    const chartConfig = {
        chart: {
            caption: chartTitle,
            subCaption: `${formatNumber(grandTotal)} Total Requests`,
            captionFontSize: "18",
            captionFontColor: "#0A0F1C",
            captionFontBold: "700",
            subCaptionFontSize: "14",
            subCaptionFontColor: "#334155",
            subCaptionFontBold: "600",
            captionPadding: "20",
            xAxisName: xAxis,
            yAxisName: yAxis,
            xAxisNameFontSize: "13",
            yAxisNameFontSize: "13",
            xAxisNameFontColor: "#1E293B",
            yAxisNameFontColor: "#1E293B",
            xAxisNameFontBold: "700",
            yAxisNameFontBold: "700",
            xAxisNamePadding: "10",
            yAxisNamePadding: "10",
            showYAxisValues: "1",
            showLimits: "0",
            theme: "fusion",
            bgColor: "#FFFFFF",
            bgAlpha: "100",
            canvasBgColor: "#FFFFFF",
            canvasBgAlpha: "100",
            usePlotGradientColor: "0",
            plotFillAlpha: "100",
            plotBorderAlpha: "0",
            showPlotBorder: "0",
            plotHoverEffect: "1",
            stack100Percent: "0",
            plotSpacePercent: "40",
            seriesSpacePercent: "20",
            maxBarWidth: "20",
            minBarWidth: "10",
            showValues: "1",
            placeValuesInside: "0",
            valuePosition: "ABOVE",
            valuePadding: "6",
            valueFontColor: "#0F172A",
            valueFontSize: "11",
            valueFontBold: "1",
            showZeroValue: "0",
            showSum: "0",
            showCanvasBorder: "0",
            showAxisLines: "1",
            axisLineColor: "#CBD5E1",
            divLineColor: "#E2E8F0",
            divLineDashed: "1",
            divLineDashLen: "4",
            divLineDashGap: "4",
            paletteColors: [COLORS.NOT_ESCALATED, COLORS.LEVEL1, COLORS.LEVEL2, COLORS.LEVEL3].join(','),
            showLegend: "1",
            legendPosition: "bottom",
            legendItemFontSize: "12",
            legendItemFontColor: "#0A0F1C",
            legendItemFontBold: "600",
            legendPadding: "14",
            legendBgColor: "#FFFFFF",
            legendBorderColor: "transparent",
            legendShadow: "0",
            legendIconScale: "1",
            legendIconSides: "0",
            yAxisMaxValue: "115",
            yAxisMinValue: "0",
            numDivLines: "5",
            numberSuffix: "%",
            formatNumberScale: "0",
            yAxisValuesFontSize: "11",
            yAxisValuesFontColor: "#1E293B",
            yAxisValuesFontBold: "600",
            yAxisValuePadding: "4",
            labelDisplay: "WRAP",
            rotateLabels: "0",
            slantLabels: "0",
            xAxisValuesFontSize: "11",
            xAxisValuesFontColor: "#1E293B",
            xAxisValuesFontBold: "600",
            xAxisValuesStep: "1",
            toolTipBgColor: COLORS.TOOLTIP_BG,
            toolTipColor: COLORS.TOOLTIP_TEXT,
            toolTipBorderColor: "transparent",
            toolTipBorderThickness: "0",
            toolTipPadding: "0",
            toolTipFontSize: "12",
            toolTipBorderRadius: "16",
            tooltip: "1",
            baseFont: CHART_THEME.fontFamily,
            baseFontSize: "12",
            baseFontColor: "#0A0F1C",
            baseFontBold: "500",
            showBorder: "1",
            borderColor: "#E2E8F0",
            borderThickness: "1",
            borderAlpha: "100",
            cornerRadius: "16",
            exportEnabled: "1",
            exportFormats: "PNG|PDF|CSV",
            exportAction: "download",
            exportShowMenuItem: "1",
            exportAtClientSide: "1",
            exportHandler: "http://export.api.fusioncharts.com/",
            exportFileName: chartTitle.replace(/[^a-zA-Z0-9]/g, "_"),
            exportFileSuffix: "",
            exportCallback: null,
            exportDialogCloseDelay: "1000",
            showExportDialog: "1",
            exportDialogMessage: "Exporting chart...",
            exportDialogColor: "#FFFFFF",
            exportDialogFontColor: "#1A202C",
            exportDialogFontSize: "14",
            exportDialogBorderColor: "#E2E8F0",
            exportDialogBorderThickness: "1",
            exportDialogBorderRadius: "12"
        },
        categories: [{ category: categories }],
        dataset: createSideBySideDataset(chartData)
    };

    if (chartType === "EOption1") {
        chartConfig.chart.plotSpacePercent = "35";
        chartConfig.chart.seriesSpacePercent = "15";
        chartConfig.chart.maxBarWidth = "16";
        chartConfig.chart.minBarWidth = "8";
        chartConfig.chart.valueFontSize = "10";
        chartConfig.chart.xAxisValuesFontSize = "10";
        chartConfig.chart.labelDisplay = "WRAP";

        $('#' + containerId).css({
            'width': '100%',
            'min-width': '0',
            'overflow-x': 'hidden'
        });
    }
    else if (chartType === "EOption2") {
        chartConfig.chart.plotSpacePercent = "45";
        chartConfig.chart.seriesSpacePercent = "25";
        chartConfig.chart.maxBarWidth = "25";
        chartConfig.chart.minBarWidth = "12";
        chartConfig.chart.valueFontSize = "12";
    }
    else if (chartType === "EOption3") {
        chartConfig.chart.plotSpacePercent = "40";
        chartConfig.chart.seriesSpacePercent = "20";
        chartConfig.chart.maxBarWidth = "28";
        chartConfig.chart.minBarWidth = "14";
        chartConfig.chart.valueFontSize = "12";
        chartConfig.chart.labelDisplay = "WRAP";
        chartConfig.chart.xAxisValuesFontSize = "11";
    }

    const chartVarName = containerId + "Chart";
    if (window[chartVarName] && typeof window[chartVarName].dispose === "function") {
        try {
            window[chartVarName].dispose();
        } catch (e) { }
    }

    FusionCharts.ready(function () {
        try {
            const chart = new FusionCharts({
                type: chartTypeMap[chartType],
                renderAt: containerId,
                width: '100%',
                height: '100%',
                dataFormat: 'json',
                dataSource: chartConfig
            });

            chart.render();
            window[chartVarName] = chart;

            $('#' + containerId).css({
                'border': '1px solid ' + CHART_THEME.borderColor,
                'border-radius': '16px',
                'background': '#FFFFFF',
                'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.02)',
                'transition': 'box-shadow 0.2s ease'
            });

        } catch (error) {
            console.error("Chart rendering error:", error);
            showChartMessage(containerId, "Error rendering chart", "error");
        }
    });
}
function loadAllEscalationReports() {
    var from = convertDate(document.getElementById("txtfromdate").value + "T00:00");
    var to = convertDate(document.getElementById("txttodate").value + "T23:59");

    var userId = sessionStorage.getItem('ID') || 0;

    var locationIds = getSumoSelectValues('#search_NurseLocation');
    var departmentIds = getSumoSelectValues('#search_Department');

    var FilterQuery = DWQueryBuilder();

    if (locationIds.includes('All') || locationIds.length === 0) {
        locationIds = '';
    } else {
        locationIds = locationIds.join(',');
    }

    if (departmentIds.includes('All') || departmentIds.length === 0) {
        departmentIds = '';
    } else {
        departmentIds = departmentIds.join(',');
    }

    $('.loaderElement').css("display", "inline-block");

    $('#weeklyTrendChart').html(PROFESSIONAL_LOADER);
    $('#deptChart').html(PROFESSIONAL_LOADER);
    $('#tasksChart').html(PROFESSIONAL_LOADER);

    try { if (window.weeklyTrendChartChart) window.weeklyTrendChartChart.dispose(); } catch (e) { }
    try { if (window.deptChartChart) window.deptChartChart.dispose(); } catch (e) { }
    try { if (window.tasksChartChart) window.tasksChartChart.dispose(); } catch (e) { }

    window.weeklyTrendChartChart = null;
    window.deptChartChart = null;
    window.tasksChartChart = null;

    const baseUrl = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) +
        "&From=" + encodeURIComponent(Encrypt(from)) +
        "&To=" + encodeURIComponent(Encrypt(to)) +
        "&HospitalLoc=" + encodeURIComponent(FilterQuery) +
        "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
        "&UserId=" + encodeURIComponent(Encrypt(userId)) +
        "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
        "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds));

    const weeklyUrl = baseUrl + "&Type=" + encodeURIComponent(Encrypt("ESCALATION_TREND"));
    const deptUrl = baseUrl + "&Type=" + encodeURIComponent(Encrypt("ESCALATION_DEPARTMENT"));
    const tasksUrl = baseUrl + "&Type=" + encodeURIComponent(Encrypt("ESCALATION_TASK"));


    $.when(
        $.ajax({ url: weeklyUrl, type: 'POST', data: 'pData', dataType: 'json', timeout: 30000 }),
        $.ajax({ url: deptUrl, type: 'POST', data: 'pData', dataType: 'json', timeout: 30000 }),
        $.ajax({ url: tasksUrl, type: 'POST', data: 'pData', dataType: 'json', timeout: 30000 })
    ).then(function (weeklyData, deptData, tasksData) {


        bindEscalationChartToContainer(weeklyData[0], "weeklyTrendChart",
            "Week Starting", "Percentage Escalated", "Service Level Trends by Week", "EOption1");
        bindEscalationChartToContainer(deptData[0], "deptChart",
            "Department", "Percentage Escalated", "Service Level Distribution by Department", "EOption2");
        bindEscalationChartToContainer(tasksData[0], "tasksChart",
            "Task Type", "Percentage Escalated", "Top Tasks by Service Level", "EOption3");

        setTimeout(function () {
            $('.loaderElement').css("display", "none");
            HideModalPopUp('ModalLoading');
        }, 500);

    }).fail(function (xhr, status, error) {
        console.error("Data loading failed:", error);

        $('.loaderElement').css("display", "none");

        const errorMsg = status === "timeout" ? "Request timeout. Please try again." :
            status === "abort" ? "Request cancelled." :
                "Unable to load data. Please try again.";

        showChartMessage("weeklyTrendChart", errorMsg, "error");
        showChartMessage("deptChart", errorMsg, "error");
        showChartMessage("tasksChart", errorMsg, "error");
    });
}
function EscalationReport(FromDocReady, Sfrom, Sto) {
    var from = (FromDocReady) ? Sfrom + "T00:00" : convertDate(Sfrom.value + "T00:00"),
        to = (FromDocReady) ? Sto + "T23:59" : convertDate(Sto.value + "T23:59");

    var FromDate = new Date(from), ToDate = new Date(to);

    if (FromDocReady) {
        loadAllEscalationReports();
    }
    else if (Sfrom.value.length == 0) {
        $('.loaderElement').css("display", "none");
        Sfrom.focus();
    }
    else if (Sto.value.length == 0) {
        $('.loaderElement').css("display", "none");
        Sto.focus();
    }
    else if (FromDate > ToDate) {
        $('.loaderElement').css("display", "none");
        Sto.focus();
    }
    else {
        loadAllEscalationReports();
        return false;
    }
}

function Getreqdetails(ReqID) {

    if (!ReqID) {
        console.warn("Invalid ReqID:", ReqID);
        return;
    }

    $.ajax({
        url: ReportUrl +
            "Process=" + encodeURIComponent(Encrypt("GETREQDETAILS")) +
            "&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)),
        type: 'POST',
        dataType: 'json',

        success: function (data) {

            if (!Array.isArray(data) || data.length === 0) {
                console.error("Invalid or empty response", data);
                return;
            }

            const row = data[0];

            $("#spanEReqId").html(row.REQUESTID);
            $("#spanRequestdate").html(row.Requestdate);
            $("#CATEGORYNAME").html(row.CATEGORYNAME);
            $("#RequestDeskRemarks").html(row.RequestDeskRemarks);
            $("#FROM").html(row.FROM_LOCATION);
            $("#TO").html(row.TO_LOCATION);
            $("#REQUESTORNAME").html(row.REQUESTORNAME);
            $("#EquipmentName").html(row.EquipmentName);
            $("#IsMultiPorterDescription").html(row.IsMultiPorterDescription);
            $("#PORTERNAME").html(row.PORTERNAME);
            $("#REQUESTSTATUS").html(row.REQUESTSTATUS);
            $("#TimeDifference").html(row.TimeDifference);
        },

        error: function (xhr, status, error) {
            console.error("AJAX error:", status, error);
            console.error("Response:", xhr.responseText);
        }
    });
}

function GetDate(date) {
    return date.split('/')[1] + '/' + date.split('/')[0] + '/' + date.split('/')[2];
}
function GetChartData(URL, xAxis, yAxis, chartTitle) {

    $.ajax({
        async: true,
        url: URL,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (msg) {

            if (InnerReport == "Report8") {
                BindEscalationChart(msg, xAxis, yAxis, chartTitle);
            } else {
                BindChart(msg, xAxis, yAxis);
            }
            setTimeout(function () {
                $('.loaderElement').css("display", "none");
                HideModalPopUp('ModalLoading');
            }, 1000);
        },
        error: function (msg) {
            $('.loaderElement').css("display", "none");
            return [];
        }
    });
}


function BindChart(msg, xAxis, yAxis) {

    if (!msg || msg.length == 0) {
        $('#' + RenderAt).css("display", "none");
        return;
    }

    var chartData = [];

    if (msg.length > 0 && msg[0].hasOwnProperty('VALUE') && msg[0].hasOwnProperty('LABEL')) {
        chartData = msg.map(function (item) {
            if (item.LABEL && item.LABEL.includes("AVERAGE")) {
                return null;
            }

            return {
                label: item.LABEL ? item.LABEL.replace(/[()]/g, '').trim() : '',
                value: item.VALUE || "0"
            };
        }).filter(function (item) {
            return item !== null;
        });

    } else {
        chartData = msg;
    }

    if (chartData.length === 0) {
        $('#' + RenderAt).html(
            '<div style="display:flex; justify-content:center; align-items:center; height:300px; color:#666; font-size:16px;">' +
            '<p>No data available to display chart</p>' +
            '</div>'
        );
        $('#' + RenderAt).css("display", "table-row");
        return;
    }

    var chartTypeValue = $('#ChartType').val();

    $('#' + RenderAt).css("display", "table-row");
    FusionRender(chartTypeValue, RenderAt, width, xAxis, yAxis, chartData);
}

function FusionRender(Type, RenderAt, width, xAxis, yAxis, msg) {

    var chartType = (typeof Type === 'string') ? Type : $('#ChartType').val();

    if (!msg || msg.length === 0) {
        console.error("No data provided to FusionRender");
        return;
    }

    var validChartTypes = [
        'column2d', 'line', 'bar2d', 'pie2d', 'doughnut2d', 'area2d',
        'msline', 'mscolumn2d', 'stackedcolumn2d', 'stackedbar2d',
        'doughnut3d', 'pie3d', 'line', 'bar2d'
    ];

    if (!validChartTypes.includes(chartType)) {
        chartType = 'column2d';
    }

    FusionCharts.ready(function () {
        try {

            var revenueChart = new FusionCharts({
                type: chartType,
                renderAt: RenderAt,

                width: "100%",
                height: ChartHeight,
                dataFormat: "json",
                dataSource: {
                    "chart": {
                        "caption": xAxis + " vs " + yAxis,
                        "subCaption": "",
                        "theme": "fusion",
                        "baseFont": "'Inter', 'Segoe UI', sans-serif",
                        "baseFontSize": "13",
                        "baseFontColor": "#0F172A",
                        "captionFontSize": "18",
                        "captionFontBold": "1",
                        "captionFontColor": "#0F172A",
                        "xAxisName": xAxis,
                        "yAxisName": yAxis,
                        "xAxisNameFontSize": "14",
                        "yAxisNameFontSize": "14",
                        "xAxisNameFontBold": "1",
                        "yAxisNameFontBold": "1",
                        "xAxisNameFontColor": "#1E293B",
                        "yAxisNameFontColor": "#1E293B",
                        "bgColor": "#FFFFFF",
                        "canvasBgColor": "#FFFFFF",
                        "canvasBorderThickness": "0",
                        "paletteColors": "#2AA198,#D4E157,#93C47D,#6AA84F",
                        "showAlternateHGridColor": "1",
                        "alternateHGridColor": "#F8FAFC",
                        "divLineColor": "#E2E8F0",
                        "divLineThickness": "1",
                        "showAxisLines": "1",
                        "axisLineColor": "#94A3B8",
                        "axisLineThickness": "1",
                        "showValues": "1",
                        "valueFontSize": "12",
                        "valueFontBold": "1",
                        "valueFontColor": "#0F172A",
                        "showLegend": "1",
                        "legendPosition": "bottom",
                        "legendBgColor": "#FFFFFF",
                        "legendBorderColor": "transparent",
                        "toolTipBgColor": "#F5F5F5",
                        "toolTipColor": "#1A1A1A",
                        "toolTipBorderColor": "transparent",
                        "toolTipBorderThickness": "0",
                        "toolTipBorderRadius": "10",
                        "usePlotGradientColor": "0",
                        "plotFillAlpha": "100",
                        "showPlotBorder": "0",
                        "maxColWidth": "30",
                        "plotPaddingPercent": "10",
                        "formatNumberScale": "0",
                        "labelDisplay": "ROTATE",
                        "rotateLabels": "1",
                        "slantLabels": "1",
                        "wrapLabels": "0",
                        "enableSmartLabels": "0",
                        "labelStep": "1"
                    },

                    "data": msg
                }
            });

            revenueChart.render(RenderAt);

        } catch (error) {

            $('#' + RenderAt).html(
                '<div style="display:flex; justify-content:center; align-items:center; height:300px; color:#E53E3E; font-size:16px;">' +
                '<p>Error rendering chart: ' + error.message + '</p>' +
                '</div>'
            );
        }
    });
}

function SValidate(FromDocReady, Sfrom, Sto) {
    var from = (FromDocReady) ? Sfrom + "T00:00" : convertDate(Sfrom.value + "T00:00"),
        to = (FromDocReady) ? Sto + "T23:59" : convertDate(Sto.value + "T23:59"),
        HayWoodQuery = getHaywoodQuery();
    var FromDate = new Date(from), ToDate = new Date(to);

    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = getSumoSelectValues('#search_NurseLocation');
    var departmentIds = getSumoSelectValues('#search_Department');

    var locationIdParam = "", departmentIdParam = "";

    if (locationIds.length > 0) {
        locationIds = locationIds.filter(function (id) {
            return id !== "All" && id !== "0";
        });
        if (locationIds.length > 0) {
            locationIdParam = locationIds.join(',');
        }
    }

    if (departmentIds.length > 0) {
        departmentIds = departmentIds.filter(function (id) {
            return id !== "All" && id !== "0";
        });
        if (departmentIds.length > 0) {
            departmentIdParam = departmentIds.join(',');
        }
    }

      var reportType = "";
        if (InnerOption == 'Option1') {
            reportType = "DATEWISE";
        } else if (InnerOption == 'Option2') {
            reportType = "HOURLYASSIGNWAIT";
        } else if (InnerOption == 'Option3') {
            reportType = "HOURLYPROGRESSWAIT";
        } else {
            reportType = "DATEWISE";
        }

    var chartType = $('#ChartType').val();
    if (!chartType || chartType === '') {
        $('#ChartType').val('column2d');
    }
    
    var apiUrl = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) +
        "&From=" + encodeURIComponent(Encrypt(from)) +
        "&To=" + encodeURIComponent(Encrypt(to)) +
        "&HospitalLoc=" + encodeURIComponent(Encrypt(HayWoodQuery)) +
        "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
        "&Type=" + encodeURIComponent(Encrypt(reportType)) +
        "&PorterId=" + encodeURIComponent(Encrypt("")) +
        "&Search=" + encodeURIComponent(Encrypt("")) +
        "&UserId=" + encodeURIComponent(Encrypt(userId)) +
        "&LocationId=" + encodeURIComponent(Encrypt(locationIdParam)) +
        "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIdParam));


    var xAxis = 'REQUEST STATUS';
    var yAxis = 'NO. OF REQUESTS';

    if (FromDocReady) {
        ShowModalPopUp('ModalLoading');
        GetChartData(apiUrl, xAxis, yAxis);
    }
    else if (Sfrom.value.length == 0) {
        Sfrom.focus();
    } else if (Sto.value.length == 0) {
        Sto.focus();
    } else if (FromDate > ToDate) {
        Sto.focus();
    } else {
        $('.loaderElement').css("display", "inline-block");
        GetChartData(apiUrl, xAxis, yAxis);
        return false;
    }
}

function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat); var hour = (d.getHours() < 10) ? ('0' + d.getHours().toString()) : d.getHours().toString();
    var Minute = (d.getMinutes() < 10) ? ('0' + d.getMinutes().toString()) : d.getMinutes().toString();
    return [pad(d.getMonth() + 1), pad(d.getDate()), d.getFullYear()].join('/') + " " + hour + ":" + Minute;
}


function HeaderDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat); var hour = (d.getHours() < 10) ? ('0' + d.getHours().toString()) : d.getHours().toString();
    var Minute = (d.getMinutes() < 10) ? ('0' + d.getMinutes().toString()) : d.getMinutes().toString();
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('-') + " " + hour + ":" + Minute;
}


function SGetChartData(URL, xAxis, yAxis) {
    $.ajax({
        async: true,
        url: URL,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (msg) {
            SBindChart(msg, xAxis, yAxis);
            setTimeout(function () {
                HideModalPopUp('ModalLoading');
                $('.loaderElement').css("display", "none");
            }, 1000);
        },
        error: function (msg) {
            return [];
        }

    });
}
function SBindChart(msg, xAxis, yAxis) {
    if (msg.length == 0)
        $('#' + RenderAt).css("display", "none");
    else {
        $('#' + RenderAt).css("display", "table-row");
        SFusionRender(ChartType, RenderAt, width, xAxis, yAxis, msg);
    }
}
function SFusionRender(Type, RenderAt, width, xAxis, yAxis, msg) {

    var chartTypeValue = $('#ChartType').val();

    FusionCharts.ready(function () {
        var revenueChart = new FusionCharts({
            type: chartTypeValue,
            renderAt: RenderAt,
            width: ((chartTypeValue == 'doughnut3d' || chartTypeValue == 'pie3d') && (RenderAt != 'ChartPorter')) ? (width * .8) : width,
            height: ChartHeight,
            dataFormat: "json",
            dataSource: {
                "chart": {
                    "caption": "",
                    "subCaption": "",
                    "xAxisName": xAxis,
                    "yAxisName": yAxis,
                    "theme": "fint",
                    "enableSmartLabels": "1",
                    "showvalues": "1",
                    "showlegend": "1",
                    "bgColor": "#ffffff",
                    "formatNumberScale": "0"
                },
                "data": msg
            }
        });
        revenueChart.render(RenderAt);
    });
}


function CValidate(FromDocReady, Sfrom, Sto) {
    var from = (FromDocReady) ? Sfrom + "T00:00" : convertDate(Sfrom.value + "T00:00"), to = (FromDocReady) ? Sto + "T23:59" : convertDate(Sto.value + "T23:59");
    var FromDate = new Date(from), ToDate = new Date(to);

    //var from = GetDate((FromDocReady) ? Sfrom : Sfrom.value), to = GetDate((FromDocReady) ? Sto : Sto.value), FromDate = new Date(from), ToDate = new Date(to);
    if (FromDocReady) {

        $('.loaderElement').css("display", "inline-block");
        GetChartData(ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) + "&From=" + encodeURIComponent(Encrypt(from)) + '&To=' + encodeURIComponent(Encrypt(to)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) + '&Type=' + ((InnerOption == 'Option2') ? "CATEGORYWISEASSIGNWAITTIME" : (InnerOption == 'Option3') ? "CATEGORYWISEPROGRESSWAITTIME" : (InnerOption == 'Option4') ? "PERFORMANCECATEGORYWISE" : (InnerOption == 'Option5') ? "PERFORMANCETOTALCATEGORYWISE" : "CATEGORYWISE"), 'REQUEST CATEGORY', ((InnerOption == 'Option1') ? 'NO. OF REQUESTS' : 'AVG TIME TAKEN ( IN MINUTES)'));
    }
    else if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {

        $('.loaderElement').css("display", "inline-block");
        GetChartData(ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) + "&From=" + encodeURIComponent(Encrypt(from)) + '&To=' + encodeURIComponent(Encrypt(to)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) + '&Type=' + ((InnerOption == 'Option2') ? "CATEGORYWISEASSIGNWAITTIME" : (InnerOption == 'Option3') ? "CATEGORYWISEPROGRESSWAITTIME" : (InnerOption == 'Option4') ? "PERFORMANCECATEGORYWISE" : (InnerOption == 'Option5') ? "PERFORMANCETOTALCATEGORYWISE" : "CATEGORYWISE"), 'REQUEST CATEGORY', ((InnerOption == 'Option1') ? 'NO. OF REQUESTS' : 'AVG TIME TAKEN ( IN MINUTES)'));
        return false;
    }
}

function Datewise(FromDocReady, Sfrom, Sto, fileName) {

    var from = (FromDocReady) ? Sfrom + "T00:00" : convertDate(Sfrom.value + "T00:00"), to = (FromDocReady) ? Sto + "T23:59" : convertDate(Sto.value + "T23:59");

    var FromDate = new Date(from), ToDate = new Date(to);

    var PorterID = '';

    if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {
        $('.loaderElement').css("display", "inline-block");
        pageIndex = 0;
        BindDateGrid();
        return false;
    }
}
function Datewises(FromDocReady, Sfrom, Sto, fileName) {

    var from = (FromDocReady) ? Sfrom + "T00:00" : convertDate(Sfrom.value + "T00:00"), to = (FromDocReady) ? Sto + "T23:59" : convertDate(Sto.value + "T23:59");

    var FromDate = new Date(from), ToDate = new Date(to);

    var PorterID = '';

    if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {
        $('.loaderElement').css("display", "inline-block");
        pageIndex = 0;
        BindDateGrids();
        return false;
    }
}
function ExportFinancialReport(Sfrom, Sto) {
    var from = convertDate(Sfrom.value + "T00:00"), to = convertDate(Sto.value + "T23:59");

    var FromDate = new Date(from), ToDate = new Date(to);

    var PorterID = '';

    if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {
        ShowModalPopUp("modalAlert");
        setTimeout('HideModalPopUp("modalAlert");', 1000);
        FinanceReportU();

        return false;
    }
}

function ExportDetailReport(Sfrom, Sto) {
    var from = convertDate(Sfrom.value + "T00:00"), to = convertDate(Sto.value + "T23:59");

    var FromDate = new Date(from), ToDate = new Date(to);

    var PorterID = '';

    if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {
        ShowModalPopUp("modalAlert");
        setTimeout('HideModalPopUp("modalAlert");', 1000);
        DetailReportU();

        return false;
    }
}

function DetailReportU() {


    var PFrom = document.getElementById("txtfromdate").value + "T00:00",
        PTo = document.getElementById("txttodate").value + "T23:59",
        Header = "Detailed_Report(" + PFrom + "_TO_" + PTo + ").xls",

        InnerHeader = 'Selection criteria: From date :-' + PFrom + ', To date :- ' + PTo;
    var FinalURL = EReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("DETAILEDREPORT")) + "&From=" + encodeURIComponent(Encrypt(convertDate(PFrom))) + "&To=" + encodeURIComponent(Encrypt(convertDate(PTo))) + "&InnerHeader=" + encodeURIComponent(Encrypt(InnerHeader));
    $.ajax({
        url: FinalURL,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data.length > 0) {

                var downloadLink = document.createElement("a");
                downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
                downloadLink.download = Header;

                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                alert('No Records Found.')
            }
        },
        error: function (data) {

        }

    });
}
function FinanceReportU() {


    var PFrom = document.getElementById("txtfromdate").value + "T00:00",
        PTo = document.getElementById("txttodate").value + "T23:59",
        Header = "Finance_Report_Summary(" + PFrom + "_TO_" + PTo + ").xls",

        InnerHeader = 'Selection criteria: From date :-' + PFrom + ', To date :- ' + PTo;
    var FinalURL = EReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("FINANCEREPORT")) + "&From=" + encodeURIComponent(Encrypt(convertDate(PFrom))) + "&To=" + encodeURIComponent(Encrypt(convertDate(PTo))) + "&InnerHeader=" + encodeURIComponent(Encrypt(InnerHeader));
    $.ajax({
        url: FinalURL,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data.length > 0) {

                var downloadLink = document.createElement("a");
                downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
                downloadLink.download = Header;

                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                alert('No Records Found.')
            }
        },
        error: function (data) {

        }

    });
}

function CSValidate(FromDocReady, Sfrom, Sto, fileName) {

    var from = (FromDocReady) ? Sfrom + "T00:00" : convertDate(Sfrom.value + "T00:00"), to = (FromDocReady) ? Sto + "T23:59" : convertDate(Sto.value + "T23:59");
    var FromDate = new Date(from), ToDate = new Date(to);
    var CSProcess = encodeURIComponent(Encrypt(((InnerOption == "OROption1") ? "GENRESPONSEOVERRUN" : "GENDURATIONOVERRUN")));

    var PorterID = '';
    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = getSumoSelectValues('#search_NurseLocation');
    var departmentIds = getSumoSelectValues('#search_Department');
    var locationIdParam = "", departmentIdParam = "";
    if (locationIds.length > 0) {
        locationIds = locationIds.filter(function (id) {
            return id !== "All" && id !== "0";
        });
        if (locationIds.length > 0) {
            locationIdParam = locationIds.join(',');
        }
    }
    if (departmentIds.length > 0) {
        departmentIds = departmentIds.filter(function (id) {
            return id !== "All" && id !== "0";
        });
        if (departmentIds.length > 0) {
            departmentIdParam = departmentIds.join(',');
        }
    }

    var xAxis = 'TIME OF DAY';
    var yAxis = 'NUMBER OF TASKS', CGroupBy = '';

    var FilterQuery = DWQueryBuilder();

    if (FromDocReady) {


        $('.loaderElement').css("display", "inline-block");
        CGetChartData(ReportUrl + 'PROCESS=' + CSProcess + '&From=' + encodeURIComponent(Encrypt(from)) + '&To=' + encodeURIComponent(Encrypt(to)) + "&HospitalLoc=" + encodeURIComponent((FilterQuery)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) + '&PORTERID=' + encodeURIComponent(Encrypt(PorterID)) +
            "&UserId=" + encodeURIComponent(Encrypt(userId)) +  
            "&LocationId=" + encodeURIComponent(Encrypt(locationIdParam)) + 
            "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIdParam)) + '&GROUPBY=' + encodeURIComponent(Encrypt(CGroupBy)), xAxis, yAxis, fileName);
    }
    else if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {

        $('.loaderElement').css("display", "inline-block");
        CGetChartData(ReportUrl + 'PROCESS=' + CSProcess + '&From=' + encodeURIComponent(Encrypt(from)) + '&To=' + encodeURIComponent(Encrypt(to)) + "&HospitalLoc=" + encodeURIComponent((FilterQuery)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) + '&PORTERID=' + encodeURIComponent(Encrypt(PorterID)) + "&UserId=" + encodeURIComponent(Encrypt(userId)) +
            "&LocationId=" + encodeURIComponent(Encrypt(locationIdParam)) +
            "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIdParam)) + '&GROUPBY=' + encodeURIComponent(Encrypt(CGroupBy)), xAxis, yAxis, fileName);
        return false;
    }
}

function ResouceUsage(FromDocReady, Sfrom, Sto, fileName) {

    var from = (FromDocReady) ? Sfrom + "T00:00" : convertDate(Sfrom.value + "T00:00"),
        to = (FromDocReady) ? Sto + "T23:59" : convertDate(Sto.value + "T23:59");

    var FromDate = new Date(from), ToDate = new Date(to);
    var FilterQuery = DWQueryBuilder();
    var CSProcess = encodeURIComponent(Encrypt("GETRESOURCEUSAGE")) +
        "&HospitalLoc=" + encodeURIComponent(FilterQuery) +
        "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode));

    var PorterID = '';

    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = getSumoSelectValues('#search_NurseLocation');
    var departmentIds = getSumoSelectValues('#search_Department');
    var locationIdParam = "", departmentIdParam = "";

    if (locationIds.length > 0) {
        locationIds = locationIds.filter(function (id) {
            return id !== "All" && id !== "0";
        });
        if (locationIds.length > 0) {
            locationIdParam = locationIds.join(',');
        }
    }

    if (departmentIds.length > 0) {
        departmentIds = departmentIds.filter(function (id) {
            return id !== "All" && id !== "0";
        });
        if (departmentIds.length > 0) {
            departmentIdParam = departmentIds.join(',');
        }
    }

    var xAxis = 'TIME OF DAY';
    var yAxis = 'TIME(in MINUTES)', CGroupBy = '';

    var finalUrl = ReportUrl +
        'PROCESS=' + CSProcess +
        '&From=' + encodeURIComponent(Encrypt(from)) +
        '&To=' + encodeURIComponent(Encrypt(to)) +
        '&PORTERID=' + encodeURIComponent(Encrypt(PorterID)) +
        '&GROUPBY=' + encodeURIComponent(Encrypt(CGroupBy)) +
        '&UserId=' + encodeURIComponent(Encrypt(userId)) +
        '&LocationId=' + encodeURIComponent(Encrypt(locationIdParam || '')) +
        '&DepartmentId=' + encodeURIComponent(Encrypt(departmentIdParam || ''));

    if (FromDocReady) {
        $('.loaderElement').css("display", "inline-block");
        RUGetChartData(finalUrl, xAxis, yAxis, fileName);
    }
    else if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {
        $('.loaderElement').css("display", "inline-block");
        RUGetChartData(finalUrl, xAxis, yAxis, fileName);
        return false;
    }
}


function RUGetChartData(URL, xAxis, yAxis, fileName) {
    $.ajax({
        async: true,
        url: URL,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (msg) {

            RUBindChart(msg, xAxis, yAxis, fileName);
            setTimeout(function () {
                $('.loaderElement').css("display", "none");
                HideModalPopUp('ModalLoading');
            }, 1000);
        },
        error: function (msg) {
            return [];
        }

    });
}

function RUBindChart(msg, xAxis, yAxis, fileName) {
    var TypeChart = "overlappedColumn2d";
    if (msg.length == 0)
        $('#' + RenderAt).css("display", "none");
    else {
        $('#' + RenderAt).css("display", "table-row");
        CFusionRender(TypeChart, RenderAt, width, xAxis, yAxis, msg, fileName);
    }
}


function CGetChartData(URL, xAxis, yAxis, fileName) {
    $.ajax({
        async: true,
        url: URL,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (msg) {
            CBindChart(msg, xAxis, yAxis, fileName);
            setTimeout(function () {
                $('.loaderElement').css("display", "none");
                HideModalPopUp('ModalLoading');
            }, 1000);
        },
        error: function (msg) {
            return [];
        }

    });
}

function CBindChart(msg, xAxis, yAxis, fileName) {
    var TypeChart = "column2d";
    if (msg.length == 0)
        $('#' + RenderAt).css("display", "none");
    else {
        $('#' + RenderAt).css("display", "table-row");
        if (TypeChart == "overlappedColumn2d")
            CFusionRender(TypeChart, RenderAt, width, xAxis, yAxis, msg, fileName);
        else
            CAFusionRender(TypeChart, RenderAt, width, xAxis, yAxis, msg, fileName);
    }
}

function CAFusionRender(Type, RenderAt, width, xAxis, yAxis, msg, fileName) {
    FusionCharts.ready(function () {
        var revenueChart = new FusionCharts({
            type: Type,
            renderAt: RenderAt,
            width: 1200,
            height: 650,
            dataFormat: "json",
            dataSource: {
                "chart": {
                    "caption": fileName.replace("_", " "),
                    "subCaption": "",
                    "xAxisName": xAxis,
                    "yAxisName": yAxis,
                    "theme": "fusion",
                    "enableSmartLabels": "1",
                    "showvalues": "1",
                    "showlegend": "1",
                    "bgColor": "#ffffff",
                    "labelDisplay": "rotate",
                    "baseFont": "Verdana",
                    "baseFontSize": "11",
                    "baseFontColor": "#000000",
                    "slantLabel": "1",
                    "exportEnabled": "1",
                    "exportformats": "PNG=Export as High Quality Image|PDF=Export as PDF|CSV=Export Chart Data as csv",
                    "exportFileName": fileName

                },
                "data": msg
            }
        });
        revenueChart.render(RenderAt);
    });
}

function CFusionRender(Type, RenderAt, width, xAxis, yAxis, msg, fileName) {
    FusionCharts.ready(function () {
        var revenueChart = new FusionCharts({
            type: Type,
            renderAt: RenderAt,
            width: 1300,
            height: 600,
            dataFormat: "json",
            dataSource: {
                "chart": {
                    "caption": fileName.replace("_", " "),
                    "subCaption": "",
                    "xAxisName": xAxis,
                    "yAxisName": yAxis,
                    "theme": "fusion",
                    "enableSmartLabels": "1",
                    "showvalues": "1",
                    "showlegend": "1",
                    "bgColor": "#ffffff",
                    "labelDisplay": "rotate",
                    "slantLabel": "1",
                    "formatNumberScale": "1",
                    "numberScaleValue": "60",
                    "numberScaleUnit": "h",
                    "defaultNumberScale": "m",
                    "scaleRecursively": "1",
                    "baseFont": "Verdana",
                    "baseFontSize": "11",
                    "baseFontColor": "#000000",
                    "maxScaleRecursion": "-1",
                    "scaleSeparator": " ",
                    "valueBgColor": "ffffff",
                    "valueBgAlpha": "30",
                    "exportEnabled": "1",
                    "exportformats": "PNG=Export as High Quality Image|PDF=Export as PDF|CSV=Export Chart Data as csv", //|XLS=Export Chart Data
                    "exportFileName": fileName

                },
                "categories": [
                    {
                        "category": msg[0]
                    }
                ],
                "dataset": [
                    {
                        "seriesname": "RESOURCE",
                        "data": msg[1]
                    },
                    {
                        "seriesname": "USAGE",
                        "data": msg[2]
                    }
                ]
            }
        });
        revenueChart.render(RenderAt);

        //setTimeout(function () { hideTrail() }, 1000);
    });
}

function TValidate(FromDocReady, Sfrom, Sto) {
    var from = (FromDocReady) ? Sfrom + "T00:00" : convertDate(Sfrom.value + "T00:00"),
        to = (FromDocReady) ? Sto + "T23:59" : convertDate(Sto.value + "T23:59");
    var FromDate = new Date(from), ToDate = new Date(to);

    var FilterQuery = DWQueryBuilder();

    var userId = sessionStorage.getItem('ID') || 0;

    var NurseLocationIds = $('#search_NurseLocation').val() || [];
    var DepartMentIds = $('#search_Department').val() || [];

    var NurseLocation = "";
    var DepartMent = "";

    if (NurseLocationIds.length > 0) {
        NurseLocationIds = NurseLocationIds.filter(function (id) {
            return id !== "All";
        });

        if (NurseLocationIds.length > 0) {
            NurseLocation = NurseLocationIds.join(',');
        }
    }

    if (DepartMentIds.length > 0) {
        DepartMentIds = DepartMentIds.filter(function (id) {
            return id !== "All";
        });

        if (DepartMentIds.length > 0) {
            DepartMent = DepartMentIds.join(',');
        }
    }

    var reportType = "";
    if (InnerOption == 'TOption1') {
        reportType = "PEEKHOURTIME";
    } else if (InnerOption == 'TOption2') {
        reportType = "HOURLYASSIGNWAIT";
    } else if (InnerOption == 'TOption3') {
        reportType = "HOURLYASSIGNWAIT";
    } else if (InnerOption == 'TOption4') {
        reportType = "HOURLYCOMPLETEWAIT";
    } else if (InnerOption == 'TOption5') {
        reportType = "HOURLYREQUESTWAIT";   
    }

    var categoryValue = $('#DrpCategory').val() != '0' ? $('#DrpCategory').val() : '';

    var apiUrl = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) +
        "&From=" + encodeURIComponent(Encrypt(from)) +
        "&To=" + encodeURIComponent(Encrypt(to)) +
        "&HospitalLoc=" + encodeURIComponent(Encrypt(FilterQuery)) +
        "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
        "&Type=" + encodeURIComponent(Encrypt(reportType)) +
        "&PorterId=" + encodeURIComponent(Encrypt(selDeptIDs)) +
        "&Search=" + encodeURIComponent(Encrypt(categoryValue)) +
        "&UserId=" + encodeURIComponent(Encrypt(userId)) +
        "&LocationId=" + encodeURIComponent(Encrypt(NurseLocation)) +
        "&DepartmentId=" + encodeURIComponent(Encrypt(DepartMent));

    var xAxis = 'REQUEST TIME';
    var yAxis = (InnerOption == 'TOption1') ? 'NO. OF REQUESTS' : 'AVG TIME TAKEN ( IN MINUTES)';

    if (FromDocReady) {
        $('.loaderElement').css("display", "inline-block");
        GetChartData(apiUrl, xAxis, yAxis);
    }
    else if (Sfrom.value.length == 0) {
        Sfrom.focus();
    }
    else if (Sto.value.length == 0) {
        Sto.focus();
    }
    else if (FromDate > ToDate) {
        Sto.focus();
    }
    else {
        $('.loaderElement').css("display", "inline-block");
        GetChartData(apiUrl, xAxis, yAxis);
        return false;
    }
}

function LoadCategory() {
    $.ajax({
        async: false,
        url: ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("GETCATEGORY")) + "",
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (msg) {
            $('#DrpCategory').empty(); //find('option').remove();

            $("#DrpCategory").append($("<option ></option>").val('0').html('ALL'));
            $.each(msg, function (key, value) {
                $("#DrpCategory").append($("<option ></option>").val(value.ID).html(value.NAME));
                $("#DrpCategory").trigger("chosen:updated");
            });
            setCategory();
        },
        error: function (msg) {
            alert(msg.length);
        }

    });

}
function setCategory() {
    $('#HFCategory').val(($("#DrpCategory").val() == '0') ? "ALL MOVEMENTS_" : ($("#DrpCategory option:selected").text() + "_" + $("#DrpCategory").val()));
}

function SetDefault() {
    $('#Option1').addClass('ChartOptionSelected');
    InnerOption = 'Option1'
}

function BindGridPorter() {
    var FilterQuery = DWQueryBuilder();

    var userId = sessionStorage.getItem('ID');
    var locationIds = getSumoSelectValues('#search_NurseLocation');
    var departmentIds = getSumoSelectValues('#search_Department');

    var locationIdParam = "", departmentIdParam = "";

    if (locationIds.length > 0) {
        locationIds = locationIds.filter(function (id) {
            return id !== "All" && id !== "0";
        });
        locationIdParam = locationIds.join(',');
    }

    if (departmentIds.length > 0) {
        departmentIds = departmentIds.filter(function (id) {
            return id !== "All" && id !== "0";
        });
        departmentIdParam = departmentIds.join(',');
    }

    $.ajax({
        url: ReportUrl +
            "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) +
            "&From=" + encodeURIComponent(Encrypt(convertDate(PFrom))) +
            "&To=" + encodeURIComponent(Encrypt(convertDate(PTo))) +
            "&HospitalLoc=" + encodeURIComponent(FilterQuery) +
            "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
            "&UserId=" + encodeURIComponent(Encrypt(userId)) +
            "&LocationId=" + encodeURIComponent(Encrypt(locationIdParam)) +
            "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIdParam)) +
            "&Type=" + encodeURIComponent(
                Encrypt(
                    (InnerOption == 'Option1' || InnerOption == 'Option3')
                        ? "GETPORTER"
                        : "GETASSIGNEDPORTER"
                )
            ),
        type: 'POST',
        data: 'pData',
        dataType: 'json',

        success: function (data) {

            if (typeof grid === 'undefined' || grid == null) return;

            var tableView = grid.get_masterTableView();
            tableView.set_dataSource(data || []);
            tableView.dataBind();

            var Rows = tableView.get_dataItems();
            var SelectRows = tableView.get_selectedItems();

            var chartType =
                (InnerOption == 'POption1') ? "PORTERPEEKHOUR" :
                    (InnerOption == 'POption2') ? "PORTERPERFORMANCE" :
                        (InnerOption == 'POption3') ? "PORTERCATEGORYWISE" :
                            "PORTERWISECATEGORYPERFORMANCE";

            var xAxis =
                (InnerOption == 'POption1' || InnerOption == 'POption2')
                    ? "REQUEST TIME"
                    : "REQUEST CATEGORY";

            var yAxis =
                (InnerOption == 'POption2' || InnerOption == 'POption4')
                    ? "AVG TIME TAKEN ( IN MINUTES)"
                    : "NO. OF REQUESTS";

            if (!Rows || Rows.length === 0) {

                GetChartData(
                    ReportUrl +
                    "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) +
                    "&From=" + encodeURIComponent(Encrypt(convertDate(PFrom))) +
                    "&To=" + encodeURIComponent(Encrypt(convertDate(PTo))) +
                    "&HospitalLoc=" + encodeURIComponent(FilterQuery) +
                    "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                    "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                    "&LocationId=" + encodeURIComponent(Encrypt(locationIdParam)) +
                    "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIdParam)) +
                    "&Type=" + encodeURIComponent(Encrypt(chartType)),
                    xAxis,
                    yAxis
                );

                return;
            }

            var Row = (SelectRows.length > 0) ? SelectRows[0] : Rows[0];
            Row.set_selected(true);

            var PId = Row.getDataKeyValue("ID");

            GetChartData(
                ReportUrl +
                "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) +
                "&From=" + encodeURIComponent(Encrypt(convertDate(PFrom))) +
                "&To=" + encodeURIComponent(Encrypt(convertDate(PTo))) +
                "&HospitalLoc=" + encodeURIComponent(FilterQuery) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIdParam)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIdParam)) +
                "&Type=" + encodeURIComponent(Encrypt(chartType)) +
                "&PorterId=" + encodeURIComponent(Encrypt(PId)),
                xAxis,
                yAxis
            );
        },

        error: function () {
            console.error("Error loading porter grid data");
        }
    });
}


function setCheckbyID(eleId) {

    var src = $('#' + eleId).attr('src'); //alert(src);
    $('#' + eleId).attr("src", (src == "../images/NoMCheck.jpg") ? "../images/MCheck.jpg" : "../images/NoMCheck.jpg");

}

function GridDateWise_RowDataBound(sender, args) {
    var tatExceeded = args.get_item().getDataKeyValue("TATEXCEEDED"), CompleteRemarks = args.get_item().getDataKeyValue("COMPLETEDREMARKS"), Logs = args.get_item().getDataKeyValue("LOGS"), RequestID = args.get_item().getDataKeyValue("REQUESTID"), RequestStatus = args.get_item().getDataKeyValue("REQUESTSTATUSID");
    var CatNam = args.get_item().getDataKeyValue("CATEGORYNAME"), ReqID = args.get_item().getDataKeyValue("REQUESTID"), CategoryID = args.get_item().getDataKeyValue("CATEGORYID"), RequestStatus = args.get_item().getDataKeyValue("REQUESTSTATUSID"), PatientName = args.get_item().getDataKeyValue("PATIENTNAME"),
        Remarks = args.get_item().getDataKeyValue("REQUESTDESKREMARKS"), CancelledRemarks = args.get_item().getDataKeyValue("REMARKS"), MultiPorter = args.get_item().getDataKeyValue("ISMULTIPORTER"), MUIndex = args.get_item().getDataKeyValue("MULTITASKINDEX"),
        RQuantity = args.get_item().getDataKeyValue("QUANTITY"), RequestorName = args.get_item().getDataKeyValue("REQUESTORNAME"), From = args.get_item().getDataKeyValue("FROM"), To = args.get_item().getDataKeyValue("TO"),
        PorterRemarks = args.get_item().getDataKeyValue("PORTERREMARKS"), ContactNo = args.get_item().getDataKeyValue("CONTACTNO"), VIC = args.get_item().getDataKeyValue("VIC"), ReqDate = args.get_item().getDataKeyValue("REQUESTDATE"),
        ReqTime = args.get_item().getDataKeyValue("REQUESTTIME"), LoginName = args.get_item().getDataKeyValue("ENTEREDBY"), ServiceID = args.get_item().getDataKeyValue("SERVICEID"),
        AckSign = args.get_item().getDataKeyValue("ACKSIGN"), AckPhoto = args.get_item().getDataKeyValue("ACKPHOTO"), AckPhotoStamp = args.get_item().getDataKeyValue("ACKPHOTOTIMESTAMP"),
        ACKNAME = args.get_item().getDataKeyValue("ACKNAME"), ACKCONTACT = args.get_item().getDataKeyValue("ACKCONTACT"), ACKLOCATION = args.get_item().getDataKeyValue("ACKLOCATION"),
        AckPhoto1 = args.get_item().getDataKeyValue("ACKPHOTO2"), AckPhotoStamp1 = args.get_item().getDataKeyValue("ACKPHOTOTIMESTAMP2"), AckPhoto2 = args.get_item().getDataKeyValue("ACKPHOTO3"), AckPhotoStamp2 = args.get_item().getDataKeyValue("ACKPHOTOTIMESTAMP3"),
        ACKLOCATION1 = args.get_item().getDataKeyValue("ACKLOCSTAMP2"), ACKLOCATION2 = args.get_item().getDataKeyValue("ACKLOCSTAMP3");
    //, ACKNAME, ACKCONTACT, ACKLOCATION
    //ACKSIGN, ACKPHOTO, ACKPHOTOTIMESTAMP

    //viewTask(ReqNB, ReqID, CategoryID, StatusID, PatientName, Remarks, CancelledRemarks, MultiPorter, MUIndex, RQuantity, RequestorName, From, To+'|'+CatNam, PorterRemarks, ContactNo)

    var cellCRemarks = args.get_item().get_cell("COMPLETEREMARKS"),
        NotesIcon = $('<a onclick="openCompleteNotes(' + "'" + CompleteRemarks + "','" + RequestID + "','" + RequestStatus + "'" + ');" > </a>').html(' <img src="../images/memo.png" alt="Notes"  /> <br/>').css("cursor", "pointer").append("<span style='text-decoration: underline;word-wrap: break-word;font-weight: bold;overflow: hidden;text-overflow: ellipsis;max-width: 100px;display: inline-block;height: 35px !important;color: " + ((CompleteRemarks.length > 0) ? " red" : "#2e70f5") + ";'>Notes</span>"),
        cellLOGS = args.get_item().get_cell("LOGS"), cellSign = args.get_item().get_cell("ACKSIGN"), cellPhoto = args.get_item().get_cell("ACKPHOTO"),
        LOGSIcon = $('<a onclick="openReqLogs(' + "'" + RequestID + "'" + ');" > </a>').html(' <img src="../images/Log.png" alt="Notes" style="width: 35px;" /> <br/>').css("cursor", "pointer"),
        PhotoIcon = $('<a onclick="OpenPhoto(' + "'" + RequestID + "','- Ack. Photo','" + AckPhoto + "','../images/Photo.png','" + AckPhotoStamp + "','width: 1080px; height: 900px;','" + ACKNAME + "','" + ACKCONTACT + "','" + ACKLOCATION + "','" + AckPhoto1 + "','" + ACKLOCATION1 + "','" + AckPhoto2 + "','" + ACKLOCATION2 + "'" + ');" > </a>').html(' <img src="../images/Photo.png" alt="Notes"  style="width: 35px;" /> <br/>').css("cursor", "pointer"),
        signIcon = $('<a onclick="OpenPhoto(' + "'" + RequestID + "','- Ack. Signature','" + AckSign + "','../images/Sign.png','" + AckPhotoStamp + "','width: 1080px; height: 840px;','" + ACKNAME + "','" + ACKCONTACT + "','" + ACKLOCATION + "','','','',''" + ');" > </a>').html(' <img src="../images/Sign.png" alt="Notes"  style="width: 35px;" /> <br/>').css("cursor", "pointer");
    //$(cellCRemarks).html(((RequestStatus == "6") ? NotesIcon : '-'));

    var cellCReqNo = args.get_item().get_cell("REQUESTNO"),
        ReqNo = $('<a href="javascript:void(0)" class="btn btn-indexblue" > </a>').html('' + RequestID + '').css("cursor", "pointer");

    $(cellCReqNo).html(ReqNo);
    $(ReqNo).click(function () {

        $('#divIconLog').html(LOGSIcon);
        if ((RequestStatus == "6" || RequestStatus == "7") && (ServiceID == '2' || ServiceID == '3')) {
            $('#divIconAckPhoto').html(PhotoIcon); $('#divIconAckSign').html(signIcon);
        } else { $('#divIconAckPhoto').html(''); $('#divIconAckSign').html('') }
        viewTask(ReqID, ReqID, CategoryID, RequestStatus, PatientName, Remarks, CancelledRemarks, MultiPorter, MUIndex, RQuantity, RequestorName, From, To + '|' + CatNam, PorterRemarks, ContactNo, ReqDate, LoginName, ReqTime, ServiceID);
    });


    $(cellCRemarks).html((RequestStatus == "6" || RequestStatus == "7") ? NotesIcon : '-'); $(cellLOGS).html(LOGSIcon);

    //$(cellPhoto).html(((RequestStatus == "6" || RequestStatus == "7") && (ServiceID == '2')) ? PhotoIcon : '-'); //$(cellPhoto).html(PhotoIcon);
    //$(cellSign).html(((RequestStatus == "6" || RequestStatus == "7") && (ServiceID == '2')) ? signIcon : '-'); //$(cellSign).html(signIcon);

    args.get_item().removeCssClass("TatExceed");
    args.get_item().removeCssClass("rgAltRow");
    args.get_item().removeCssClass("rgRow");
    if (tatExceeded == 'YES') {
        args.get_item().addCssClass("TatExceed");
    }
}


function openReqLogs(ReqID) {

    $.ajax({
        url: ReportUrl + "Process=" + encodeURIComponent(Encrypt("GETLOGS")) + "&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var reqLog = data[0].RESULT;
            LoadReqLogs(reqLog, ReqID);
        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });

}

function LoadReqLogs(ReqLogs, ReqID) {

    var arrRemarks = ReqLogs.split('|#|'); $('#spanLogReq').html('Request #' + ReqID);
    //document.getElementById('spanLogReq').value = ReqID;

    var htmlCompleteNotes = '';
    $.each(arrRemarks, function (index, value) {
        if (value.trim()) {
            var valueArray = value.split('|$|'), IsMitigation = valueArray[3].toString();
            htmlCompleteNotes += '<div class="msgContainer"><p class="msgUser">' + valueArray[0].toString() + ((IsMitigation == "YES") ? ('<span class="mitigation-right"> </span>') : '') + '</p> <p>' + valueArray[1].toString().replace('_', ' ') + '<span class="time-right">' + valueArray[2].toString() + '</span></div>'

        }
    });
    $('#divReqLogs').html(htmlCompleteNotes); ShowModalPopUp('ModalReqLogs');
    setTimeout(function () { $('#divReqLogs').show(500); }, 1000);
}

function OpenPhoto(ReqID, Header, Path, HeadPhoto, AckOn, style, AckName, AckContact, AckLocation, Path1, AckLocation1, Path2, AckLocation2) {

    ackImgPath1 = Path; ackImgPath2 = Path1; ackImgPath3 = Path2; ackLoc1 = AckLocation; ackLoc2 = AckLocation1; ackLoc3 = AckLocation2;

    var imgAck1 = $("#imgAck1"), imgAck2 = $("#imgAck2"), imgAck3 = $("#imgAck3");
    $("#imgAckHolder1").css("visibility", ((Path.length > 0) ? "visible" : "hidden")); $("#imgAckHolder2").css("visibility", ((Path1.length > 0) ? "visible" : "hidden")); $("#imgAckHolder3").css("visibility", ((Path2.length > 0) ? "visible" : "hidden"));

    $(imgAck1).click(function () { $('#ImgACK').attr("src", ackImgPath1); $('#ACK_CONTACT').html('<strong>Location : </strong>' + ackLoc1); }); $(imgAck2).click(function () { $('#ImgACK').attr("src", ackImgPath2); $('#ACK_CONTACT').html('<strong>Location : </strong>' + ackLoc2); });
    $(imgAck3).click(function () { $('#ImgACK').attr("src", ackImgPath3); $('#ACK_CONTACT').html('<strong>Location : </strong>' + ackLoc3); });

    $('#imgAckHead').attr("src", HeadPhoto); $('#ACK_ON').html('<strong> Date : </strong>' + AckOn);
    $('#ImgACK').attr("src", Path); $('#ImgACK').attr("style", style); $('#spanAckHead').html(Header);
    ShowModalPopUp('ModalImage'); $('#spanReqID').html('#' + ReqID);
    $('#ACK_BY').html('<strong> Ack. By : </strong>' + AckName); $('#ACK_LOC').html('<strong> Contact : </strong>' + AckContact); $('#ACK_CONTACT').html('<strong>Location : </strong>' + AckLocation);
}
function viewTask(ReqNB, ReqID, CategoryID, RequestStatus, PatientName, Remarks, CancelledRemarks, MultiPorter, MUIndex, RQuantity, RequestorName, From, To, PorterRemarks, ContactNo, ReqDate, LoginName, ReqTime, ServiceID) {

    $("#containerMP").css("display", ((MUIndex == '0' || MUIndex == '' || MUIndex == 'null') ? "inline-block" : "none")); $("#ReqUserLogin").html('Entered By :' + LoginName); $("#spanRequestDate").html('Request Date :-' + ReqTime);
    $("#TaskHeader").html('Task #' + ReqNB + '-' + ((RequestStatus == '2') ? 'Pending' : ((RequestStatus == '3') ? 'Assigned' : ((RequestStatus == '4') ? 'In-Progress' : ((RequestStatus == '6') ? 'Completed' : ((RequestStatus == '7') ? 'Cancelled' : '')))))); $("#divEditRemarks").css("display", 'block');
    $('#txtQty').val(RQuantity); $('#txtQty').attr("disabled", true); EServiceCode = ServiceID;
    document.getElementById('HFERID').value = ReqID; document.getElementById('HFERNO').value = ReqNB; document.getElementById('HFStatusID').value = RequestStatus;

    //$("#spanEReqId").html(ReqID); 
    //$("#spanERequestDate").html(ReqDate);
    //$("#spanECat").html(To.split("|")[1]);
    //$("#spanEFrom").html(From);
    //$("#spanETo").html(To.split("|")[0]);
    // $("#spanERema").html(Remarks);
    Getreqdetails(ReqID);
    $('#txtFromLoc').val(''); $('#txtFromLoc').val(From); $('#txtFromLoc').attr("disabled", true);
    $('#txtToLoc').val(''); $('#txtToLoc').val(To); $('#txtToLoc').attr("disabled", true);
    OldCatID = CategoryID;
    $('#txtPorterRemarks').val(''); $('#txtPorterRemarks').val(PorterRemarks); $('#txtPorterRemarks').attr("disabled", true);
    $('#txtContactNumber').val(''); $('#txtContactNumber').val(ContactNo); $('#txtContactNumber').attr("disabled", true);

    $('#divCancelRemarks').css("display", ((RequestStatus !== '7') ? "none" : "inline-block"));
    $('#chkMultiPorter').prop('checked', ((MultiPorter != 'No') ? true : false)); $('#chkMultiPorter').prop('disabled', true);

    $('#txtPatientName').val(PatientName); $('#txtPatientName').prop('disabled', true);
    $('#txtRequestorName').val(RequestorName); $('#txtRequestorName').prop('disabled', true);

    $('#txtCanceRemarks').css("display", ((RequestStatus !== '7') ? "none" : "inline-block")); $('#txtCanceRemarks').prop('disabled', true);
    $('#divSelCRemarks').css("display", (((RequestStatus == '6') || (RequestStatus == '7')) ? "none" : "flex"));

    if (RequestStatus == '2')
        $('#divPorterRemarks').css("display", 'none');
    else
        $('#divPorterRemarks').css("display", 'inline-block');


    //setRemarks('search_CancelRemarks', 'txtCanceRemarks', CancelledRemarks);
    var FirstCharClR = CancelledRemarks.slice(0, 1), FirstCharR = Remarks.slice(0, 1);
    CancelledRemarks = ((FirstCharClR == ',') ? CancelledRemarks.substring(1) : CancelledRemarks); Remarks = ((FirstCharR == ',') ? Remarks.substring(1) : Remarks);
    $('#txtCanceRemarks').val(CancelledRemarks); $('#search_CancelRemarks').prop('disabled', true); $('#txtCanceRemarks').prop('disabled', true);
    //setRemarks('search_Remarks', 'txtRemarks', Remarks);
    $('#txtRemarks').val(Remarks); $('#search_Remarks').prop('disabled', true); $('#txtRemarks').prop('disabled', true); $('#divSelRemarks').css("display", "none");

    clearAllCheckBox('ReqCategories');

    LoadCategories('', CategoryID); ShowModalAddtask();

    setService(ServiceID);

}

function setService(ServiceCode) {

    if (ServiceCode == null)
        $('.services-btn-icon-modal').first().trigger('click');
    else {
        ServiceCode = (ServiceCode == '0') ? "1" : ServiceCode;
        sessionStorage.setItem('ServiceCode', ServiceCode);
        $('#divRService' + ServiceCode).trigger('click');
    }
}
function LoadPresetRemarks() {
    $.ajax({
        url: ReportUrl + "Process=" + encodeURIComponent(Encrypt("PRESET")) + "&ACTION=" + encodeURIComponent(Encrypt("GET")) + "&MSG=&GROUP=&ID=",
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var Remarks = $.grep(data, function (element, index) {
                return element.GROUPNAME == "REMARKS";
            });

            var CReason = $.grep(data, function (element, index) {
                return element.GROUPNAME == "CREASON";
            });

            var FReason = $.grep(data, function (element, index) {
                return element.GROUPNAME == "FREASON";
            });

            //clearSumoselect('drpRemarks');

            $('#search_Remarks').html(''); $('#search_Remarks')[0].sumo.add('0', '-- Select --'); $('#search_Remarks')[0].sumo.reload();

            $('#search_CancelRemarks').html(''); $('#search_CancelRemarks')[0].sumo.add('0', '-- Select --'); $('#search_CancelRemarks')[0].sumo.reload();

            $('#search_CompleteRemarks').html(''); $('#search_CompleteRemarks')[0].sumo.add('0', '-- Select --'); $('#search_CompleteRemarks')[0].sumo.reload();

            $.each(Remarks, function (key, value) {
                $('#search_Remarks')[0].sumo.add(value.ID, value.MESSAGE);
            });

            $.each(CReason, function (key, value) {
                $('#search_CancelRemarks')[0].sumo.add(value.ID, value.MESSAGE);
            });


            $.each(FReason, function (key, value) {
                $('#search_CompleteRemarks')[0].sumo.add(value.ID, value.MESSAGE);
            });

            // $('#search_Remarks')[0].sumo.add('Others', 'Others'); $('#search_CancelRemarks')[0].sumo.add('Others', 'Others'); $('#search_CompleteRemarks')[0].sumo.add('Others', 'Others');


            $('#search_Remarks')[0].sumo.selectItem(0); $('#search_CancelRemarks')[0].sumo.selectItem(0);

        },
        error: function (data) {

        }
    });
}

function CatSelection(ele, ID, IsTwoPorter, CatName) {

    $(ele).prop('checked', false);
    setCategories(OldCatID);


}
function setCategories(Id) {
    var eleID = "#chkCat" + Id;
    clearAllCheckBox('ReqCategories'); $(eleID).prop('checked', true);

    ReqCat = Id;
}
function ShowModalAddtask() {
    $('#addTask').modal({
        backdrop: 'static',
        keyboard: false
    })
    $('#addTask').modal('show');
}


function clearAllCheckBox(eleID) {

    $('#' + eleID + ' input:checkbox').prop('checked', false);
}


function LoadCategories(val, val1) {
    var selTS = '', selTE = '';
    $.ajax({
        async: true,
        url: ReportUrl + "Process=" + encodeURIComponent(Encrypt("GETCATEGORIES")) + "&VAL=" + encodeURIComponent(Encrypt(val)) + "&VAL1=" + encodeURIComponent(Encrypt(val1)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            var catUL = '';
            var dataCategory = $.grep(data, function (element, index) {
                return element.FILTER == "CATEGORY";
            });

            $.each(dataCategory, function (key, value) {

                selTS = (((val1 == value.ID) && (selTS === '')) ? value.TS : selTS); selTE = (((val1 == value.ID) && (selTE === '')) ? value.TE : selTE);

                catUL += '<li> <input type="checkbox" id="chkCat' + value.ID + '" onchange="CatSelection(this,' + "'" + value.ID + "','" + value.ISTWOPORTERTASK + "','" + value.VALUE + "'" + ');" ><span> <img src="../images/check.png"></span> <img src="' + value.IMAGEPATH + '" alt="' + value.VALUE + '"> <p>' + value.VALUE + '</p> </li>';
            });

            $("#ReqCategories").html('<ul>' + catUL + '</ul>');

            if (selTS != '' || selTE != '') {
                $('#lblKPITS').html(((selTS != '-' && selTS != '0') ? (selTS + '<br/> <span style="font-size:13px;"> (min) </span> ') : '-'));
                $('#lblKPITE').html(((selTE != '-' && selTE != '0') ? (selTE + '<br/> <span style="font-size:13px;"> (min) </span> ') : '-'));
            }
            //setTimeout(function () { setCategories(ReqCat);}, 400);

            $("#chkCat" + val1).prop('checked', true);

        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });
}
function OnChangeRemarks(ele, txtRemark) {

    var val = $(ele).val(), eleID = $(ele).attr('id');

    if (val.length > 1)
        $(ele)[0].sumo.unSelectItem(0);
    else if (val == '')
        $(ele)[0].sumo.selectItem(0);

    //$('#' + txtRemark).css('display', ((val !== 'Others') ? "none" : "inline-block"));
    //if (val == 'Others')
    //    setTimeout(function () { $('#' + txtRemark).focus(); }, 200);
}

function setRemarks(sumosel, textbox, Remarks) {

    var remarkArr = Remarks.split(','), Options = getOptions(sumosel), textVal = '', OppArray = Options.split(',');

    $('#' + sumosel)[0].sumo.unSelectAll();

    if (Remarks.trim().length > 0) {

        $.each(remarkArr, function (index, value) {
            if (value.trim().length > 0) {
                var valueIndex = OppArray.indexOf(value);
                if (Options.includes(value))
                    $('#' + sumosel)[0].sumo.selectItem(valueIndex);
                else {
                    if (valueIndex != '-1')
                        $('#' + sumosel)[0].sumo.unSelectItem(valueIndex);
                    textVal += value + ',';
                }
            } else {
                $('#' + sumosel)[0].sumo.unSelectAll(); $('#' + sumosel)[0].sumo.reload(); $('#' + sumosel)[0].sumo.selectItem(0);
            }
        });
    } else {

        $('#' + sumosel)[0].sumo.unSelectAll(); $('#' + sumosel)[0].sumo.reload(); $('#' + sumosel)[0].sumo.selectItem(0);
    }

    textVal = textVal.slice(0, -1);

    $('#' + textbox).val(textVal);

}


function getOptions(drpSumo) {
    var valSel = '';
    $('#' + drpSumo + ' option').each(function (i) {
        valSel += $(this).text() + ',';
    });

    return valSel;
}

function openCompleteNotes(ComRemarks, ReqID, RequestStatus) {
    var arrRemarks = ComRemarks.split('|#|');
    document.getElementById('HFERID').value = ReqID;
    var htmlCompleteNotes = '';
    $('#chkMitigationCom').attr("src", "../images/MCheck.jpg");
    $.each(arrRemarks, function (index, value) {
        if (value.trim()) {
            var valueArray = value.split('|$|'), IsMitigation = valueArray[3].toString();
            htmlCompleteNotes += '<div class="msgContainer"><p class="msgUser">' + valueArray[0].toString() + ((IsMitigation == "YES") ? ('<span class="mitigation-right"> </span>') : '') + '</p> <p>' + valueArray[1].toString().replace('_', ' ') + '<span class="time-right">' + valueArray[2].toString() + '</span></div>';

        }
    });

    //$("#txtComRemarks").attr("disabled", "disabled");
    //if (RequestStatus == "6" || RequestStatus == "7" )
    $("#txtComRemarks").removeAttr("disabled"); $("#txtComRemarks").val('');
    $('#divComNotes').html(htmlCompleteNotes); $('#txtComRemarks').val(''); ShowModalPopUp('ModalCompleteNotes');

    $('#search_CompleteRemarks')[0].sumo.unSelectAll(); $('#search_CompleteRemarks')[0].sumo.reload(); $('#search_CompleteRemarks')[0].sumo.selectItem(0);

    setTimeout(function () { $('#txtComRemarks').focus(); $('#divComNotes').show(500); }, 1000);;
}



function submitNotes() {
    var drpCompleteRemark = selectedText('search_CompleteRemarks');
    var UID = sessionStorage.getItem('ID'), Remark = drpCompleteRemark + '_' + $('#txtComRemarks').val().trim();
    var ReqID = document.getElementById('HFERID').value;
    var srcMitigation = $('#chkMitigationCom').attr('src');
    var IsMitigation = (srcMitigation == "../images/NoMCheck.jpg") ? "0" : "1";
    if (Remark.length == 0) {
        $('#txtComRemarks').focus();
    } else {
        HideModalPopUp('ModalCompleteNotes'); ShowModalPopUp('ModalDoneAddRemarks');
        $.ajax({
            url: ReportUrl + "Process=" + encodeURIComponent(Encrypt("ADDCOMPLETEREMARKS")) + "&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)) + "&USERID=" + encodeURIComponent(Encrypt(UID)) + "&REMARKS=" + encodeURIComponent(Encrypt(Remark)) + "&ISMITIGATION=" + encodeURIComponent(Encrypt(IsMitigation)),
            type: 'POST',
            data: 'pData',
            dataType: 'json',
            success: function (data) {
                if (data[0].RESULT.split("_")[0] === 'TRUE') {

                    setTimeout(function () { BindDateGrid(); HideModalPopUp('ModalDoneAddRemarks'); }, 1000);
                }
            },
            error: function (data) {
                $('#').html(data[0].RESULT);
            }
        });

    }
}



function GridEquans_Command(sender, args) {
    args.set_cancel(true);
    pageIndex = parseInt(sender.get_masterTableView().get_currentPageIndex());
    pageSize = sender.get_masterTableView().get_pageSize();
    switch (args.get_commandName()) {
        case "Page":
        case "PageSize":
            BindDateGrids();
            break;
    }
}
function GridDateWise_Command(sender, args) {
    args.set_cancel(true);
    pageIndex = parseInt(sender.get_masterTableView().get_currentPageIndex());
    pageSize = sender.get_masterTableView().get_pageSize();
    switch (args.get_commandName()) {
        case "Page":
        case "PageSize":
            BindDateGrid();
            break;
    }
}

function setRCheckbyID(eleId, eleIDUncheck, eleIDUncheck2) {

    var src = $('#' + eleId).attr('src'); //alert(src);
    $('#' + eleId).attr("src", (src == "../images/CNoCheck.png") ? "../images/CCheck.png" : "../images/CNoCheck.png");

    if (eleIDUncheck.length > 0)
        $('#' + eleIDUncheck).attr("src", "../images/CNoCheck.png");

    if ((typeof eleIDUncheck2 !== "undefined") && eleIDUncheck2.length > 0)
        $('#' + eleIDUncheck2).attr("src", "../images/CNoCheck.png");

}

function setRCheckbyIDDW(eleId, eleIDUncheck, eleIDUncheck1) {

    var src = $('#' + eleId).attr('src'); //alert(src);
    $('#' + eleId).attr("src", (src == "../images/CNoCheck.png") ? "../images/CCheck.png" : "../images/CNoCheck.png");

    if (eleIDUncheck.length > 0)
        $('#' + eleIDUncheck).attr("src", "../images/CNoCheck.png");


    if (eleIDUncheck1.length > 0)
        $('#' + eleIDUncheck1).attr("src", "../images/CNoCheck.png");

    setDateDW(((eleId == 'chkLastMonth') ? "PREV" : (eleId == 'chkThisYear') ? "YEAR" : "CURRENT"));

}

function setHaywoodRSUH(eleId, eleIDUncheck) {

    var src = $('#' + eleId).attr('src'); //alert(src);
    $('#' + eleId).attr("src", (src == "../images/CNoCheck.png") ? "../images/CCheck.png" : "../images/CNoCheck.png");

    //if (eleIDUncheck.length > 0)
    //    $('#' + eleIDUncheck).attr("src", "../images/CNoCheck.png");


}


function setDateDW(Duration) {

    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);

    var LastDayLM = new Date(y, m, 0);
    var firstDayLM = new Date(LastDayLM.getFullYear(), LastDayLM.getMonth(), 1);

    var firstDayTY = new Date(y, 0, 1);
    var LastDayTY = new Date(y, 11, 31);

    var FormattedFirstDate = formatDateDW((Duration == 'PREV') ? firstDayLM : ((Duration == 'YEAR') ? firstDayTY : firstDay));
    var FormattedEndDate = formatDateDW((Duration == 'PREV') ? LastDayLM : ((Duration == 'YEAR') ? date : date));

    document.getElementById("txtfromdate").value = FormattedFirstDate;// + "T00:00";
    document.getElementById("txttodate").value = FormattedEndDate;//+ "T23:59";
    //document.getElementById("HFFrom").value = (Duration == 'PREV') ? firstDayLM : ((Duration == 'YEAR') ? firstDayTY : firstDay);
    //document.getElementById("HFTo").value = (Duration == 'PREV') ? LastDayLM : ((Duration == 'YEAR') ? LastDayTY : lastDay);

}




function formatDateDW(date) {

    //(date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + date.getHours() + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + date.getSeconds());

    return date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
}

function formatDateComponent(dateComponent) {
    return (dateComponent < 10 ? '0' : '') + dateComponent;
}
//function BuildHeader() {

//    var Header = "Patient/Notes Fields :- " + selectedText('search_PatientRemarks') + " & filter value:- " + $('#txtSearchPatient').val() + " <br/>" +
//        "Task Fields :- " + selectedText('search_TaskFields') + " & filter value:- " + $('#txtSearchTask').val() + " <br/>" + GetActioningFilters() + " <br/><br/>" + getHaywoodHeader() + " <br/>";

//    return Encrypt(Header);

//}

function BuildHeader() {

    var Header =
        "Patient/Notes Fields :- " + selectedText('search_PatientRemarks') +
        " & filter value:- " + $('#txtSearchPatient').val() + " <br/>" +

        "Task Fields :- " + selectedText('search_TaskFields') +
        " & filter value:- " + $('#txtSearchTask').val() + " <br/>" +

        GetActioningFilters() + " <br/><br/>" +
        "Site :- DIAL 50 <br/>";

    return Encrypt(Header);
}

function selectedText(drpSumo) {
    var valSel = '';
    $('#' + drpSumo + ' option:selected').each(function (i) {
        valSel += $(this).text() + ',';
    });


    return valSel.replace('-- Select --,', '').replace(/.$/, "");
}


function GetActioningFilters() {

    var srcMitigation = $('#chkMitigated').attr('src'), srcNotMitigated = $('#chkNotMitigated').attr('src'),
        srcADF = $('#chkADF').attr('src'), srcRDF = $('#chkRDF').attr('src'), srcCDF = $('#chkCDF').attr('src'),
        srcADP = $('#chkADP').attr('src'), srcRDP = $('#chkRDP').attr('src'), srcCDP = $('#chkCDP').attr('src');

    var IsMitigation = ((srcMitigation == "../images/CNoCheck.png") ? "0" : "1"), IsNotMitigated = ((srcNotMitigated == "../images/CNoCheck.png") ? "0" : "1"),
        IsADF = ((srcADF == "../images/CNoCheck.png") ? "0" : "1"), IsRDF = ((srcRDF == "../images/CNoCheck.png") ? "0" : "1"), IsCDF = ((srcCDF == "../images/CNoCheck.png") ? "0" : "1"),
        IsADP = ((srcADP == "../images/CNoCheck.png") ? "0" : "1"), IsRDP = ((srcRDP == "../images/CNoCheck.png") ? "0" : "1"), IsCDP = ((srcCDP == "../images/CNoCheck.png") ? "0" : "1");


    var Query = ((IsADF == '1') ? ' Allocation Duration Failed ,' : '') + ((IsRDF == '1') ? " Response Duration Failed ," : '') + ((IsCDF == '1') ? " Completion Duration Failed ," : '') +
        ((IsADP == '1') ? " Allocation Duration Passed , " : "") + ((IsRDP == '1') ? " Response Duration Passed , " : "") + ((IsCDP == '1') ? " Completion Duration Passed , " : "") +
        ((IsMitigation == '1') ? " Mitigated , " : "") + ((IsNotMitigated == '1') ? " Not Mitigated , " : "");

    return Query;
}


function getHeader(drpSumo, txtbox) {
    var valSel = '', valTxt = $('#' + txtbox).val();
    if (valTxt.length > 0) {
        $('#' + drpSumo + '  option:selected').each(function (i) {
            valSel += ((valSel.length > 0) ? " OR " : "") + setValue($(this).text(), valTxt);
        });

    }
    return valSel;
}
function setHeader(columns, colvalue) {

    var columnArr = columns.split('#'), query = '';


    $.each(columnArr, function (index, value) {
        if (value.trim().length > 0)
            query += ((query.length > 0) ? " OR " : "") + " ( " + value + " like '%" + colvalue + "%' ) ";
    });
    return query;
}
function DWQueryBuilder() {
    var PateintQuery = getValues('search_PatientRemarks', 'txtSearchPatient'), TaskQuery = getValues('search_TaskFields', 'txtSearchTask'),
        ActionQuery = GetCheckBoxValues(), HayWoodQuery = getHaywoodQuery(), CGQuery = (ServiceCode == '2') ? (($('#search_CatChargeGroup').val() == "All") ? "" : (($('#search_CatChargeGroup').val() == "Non-chargable") ? " AND ( ISNULL(CHARGEGROUP,'Non-chargable') LIKE '%" + $('#search_CatChargeGroup').val() + "%' ) " : " AND ( CM.CHARGEGROUP LIKE '%" + $('#search_CatChargeGroup').val() + "%' ) ")) : '';
    var finalQuery = ((PateintQuery.length > 0) ? ((TaskQuery.length > 0) ? ' AND ( ( ' + PateintQuery + ' ) OR ( ' + TaskQuery + ' ) ) ' : ' AND  ( ' + PateintQuery + ' ) ') : ((TaskQuery.length > 0) ? ' AND  ( ' + TaskQuery + ' ) ' : '')) + ActionQuery + HayWoodQuery + CGQuery;



    return Encrypt(finalQuery);
}

function getHaywoodQuery() {

    var src = $('#chkRSUH').attr('src'), src1 = $('#chkHaywood').attr('src'); //alert(src)

    var QueryHaywood = (((src == "../images/CNoCheck.png") && (src1 == "../images/CNoCheck.png")) || ((src == "../images/CCheck.png") && (src1 == "../images/CCheck.png"))) ? ''
        : ((src == "../images/CCheck.png") ? " AND ( Site LIKE '%RSUH%' ) " : ((src1 == "../images/CCheck.png") ? " AND ( Site LIKE '%Haywood%' ) " : ''));

    return QueryHaywood;
}


function getHaywoodHeader() {

    var srcRSUH = $('#chkRSUH').attr('src'), srcHaywood = $('#chkHaywood').attr('src');

    var IsRSUH = ((srcRSUH == "../images/CNoCheck.png") ? "0" : "1"), IsHaywood = ((srcHaywood == "../images/CNoCheck.png") ? "0" : "1");


    var Query = "Site :- " + ((IsRSUH == '1') ? ' RSUH ,' : '') + ((IsHaywood == '1') ? " Haywood " : '');

    return Query;
}

function GetCheckBoxValues() {

    var srcMitigation = $('#chkMitigated').attr('src'), srcNotMitigated = $('#chkNotMitigated').attr('src'),
        srcADF = $('#chkADF').attr('src'), srcRDF = $('#chkRDF').attr('src'), srcCDF = $('#chkCDF').attr('src'), srcCRDF = $('#chkCRDF').attr('src'),
        srcADP = $('#chkADP').attr('src'), srcRDP = $('#chkRDP').attr('src'), srcCDP = $('#chkCDP').attr('src');

    var IsMitigation = ((srcMitigation == "../images/CNoCheck.png") ? "0" : "1"), IsNotMitigated = ((srcNotMitigated == "../images/CNoCheck.png") ? "0" : "1"),
        IsADF = ((srcADF == "../images/CNoCheck.png") ? "0" : "1"), IsRDF = ((srcRDF == "../images/CNoCheck.png") ? "0" : "1"), IsCDF = ((srcCDF == "../images/CNoCheck.png") ? "0" : "1"), IsCRDF = ((srcCRDF == "../images/CNoCheck.png") ? "0" : "1"),
        IsADP = ((srcADP == "../images/CNoCheck.png") ? "0" : "1"), IsRDP = ((srcRDP == "../images/CNoCheck.png") ? "0" : "1"), IsCDP = ((srcCDP == "../images/CNoCheck.png") ? "0" : "1");


    var Query = ((IsADF == '1') ? ' AND ([RTAT] > KPIRESPONSE ) ' : '') + ((IsRDF == '1') ? " AND ( ISNULL(KPIRESPONSEMET,'NO') = 'NO' ) " : '') + ((IsCDF == '1') ? " AND ( ISNULL(KPIMET,'NO') = 'NO' ) " : '') + ((IsCRDF == '1') ? " AND ( ( ISNULL(KPIMET,'NO') = 'NO' ) OR  ( ISNULL(KPIRESPONSEMET,'NO') = 'NO' ) )" : '') +
        ((IsADP == '1') ? " AND ([RTAT] < KPIRESPONSE ) " : "") + ((IsRDP == '1') ? " AND ( ISNULL(KPIRESPONSEMET,'NO') = 'YES' ) " : "") + ((IsCDP == '1') ? " AND ( ISNULL(KPIMET,'NO') = 'YES' ) " : "") +
        ((IsMitigation == '1') ? " AND ( [HASMITIGATIONNOTES] = '1' ) " : "") + ((IsNotMitigated == '1') ? "  AND ( [HASMITIGATIONNOTES] = '0' ) " : "");

    return Query;
}
function RefreshDW() {

    $('#chkMitigated').attr('src', "../images/CNoCheck.png"); $('#chkNotMitigated').attr('src', "../images/CNoCheck.png");
    $('#chkADF').attr('src', "../images/CNoCheck.png"); $('#chkRDF').attr('src', "../images/CNoCheck.png");
    $('#chkCDF').attr('src', "../images/CNoCheck.png"); $('#chkADP').attr('src', "../images/CNoCheck.png");
    $('#chkRDP').attr('src', "../images/CNoCheck.png"); $('#chkCDP').attr('src', "../images/CNoCheck.png");
    $('#txtSearchPatient').val(''); $('#txtSearchTask').val('');
    $('#search_PatientRemarks')[0].sumo.unSelectAll(); $('#search_PatientRemarks')[0].sumo.reload(); $('#search_PatientRemarks')[0].sumo.selectItem(0);
    $('#search_TaskFields')[0].sumo.unSelectAll(); $('#search_TaskFields')[0].sumo.reload(); $('#search_TaskFields')[0].sumo.selectItem(0);

    var $locationSelect = $('#search_NurseLocation');
    if ($locationSelect[0] && $locationSelect[0].sumo) {
        $locationSelect[0].sumo.unSelectAll();
        $locationSelect[0].sumo.selectItem(0);
        $locationSelect[0].sumo.reload();
    } else {
        $locationSelect.val(['All']);
    }

    var $deptSelect = $('#search_Department');
    if ($deptSelect[0] && $deptSelect[0].sumo) {
        $deptSelect[0].sumo.unSelectAll();
        $deptSelect[0].sumo.selectItem(0);
        $deptSelect[0].sumo.reload();
    } else {
        $deptSelect.val(['All']);
    }

    Sfrom = document.getElementById("HFFrom").value;
    Sto = document.getElementById("HFTo").value;
    document.getElementById("txtfromdate").value = Sfrom;
    document.getElementById("txttodate").value = Sto;
    GetReport();
}


function getValues(drpSumo, txtbox) {
    var valSel = '', valTxt = $('#' + txtbox).val();
    if (valTxt.length > 0) {
        $('#' + drpSumo + '  option:selected').each(function (i) {
            valSel += ((valSel.length > 0) ? " OR " : "") + setValue($(this).val(), valTxt);
        });

    }
    return valSel;
}
function setValue(columns, colvalue) {

    var columnArr = columns.split('#'), query = '';


    $.each(columnArr, function (index, value) {
        if (value.trim().length > 0)
            query += ((query.length > 0) ? " OR " : "") + ((value == 'R.REQUESTID') ? " ( " + value + " = '" + colvalue + "' ) " : " ( " + value + " like '%" + colvalue + "%' ) ");
    });
    return query;
}

function OnchangeFilter(drpID, txtID) {
    var drpLength = $('#' + drpID).find('option:selected').length, txtValue = $('#' + txtID).val();
    if (drpLength > 0) {
        if (txtValue.length == 0)
            $('#' + txtID).focus();
        else
            GetReport();
    }
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
function BindGridDateWise() {
    var UID = sessionStorage.getItem('ID');
    var selVal = $('#search_TaskFields').val(), txtVal = $('#txtSearchTask').val();

    if (selVal == 'R.REQUESTID' && txtVal.trim().length > 0) {
        PFrom = '2024-01-01T00:00'
        PTo = formatDateDW(new Date()) + 'T23:59';
    }

    var NurseLocationIds = $('#search_NurseLocation').val() || [];
    var DepartMentIds = $('#search_Department').val() || [];

    var NurseLocation = "";
    var DepartMent = "";

    if (NurseLocationIds.length > 0) {
        NurseLocationIds = NurseLocationIds.filter(function (id) {
            return id !== "All";
        });

        if (NurseLocationIds.length > 0) {
            NurseLocation = NurseLocationIds.join(',');
        }
    }

    if (DepartMentIds.length > 0) {
        DepartMentIds = DepartMentIds.filter(function (id) {
            return id !== "All";
        });

        if (DepartMentIds.length > 0) {
            DepartMent = DepartMentIds.join(',');
        }
    }

    var FilterQuery = DWQueryBuilder();
    var status = $('#selRequestStatus').val(),
        FinalUrl = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("DATEWISE")) +
            "&Search=" + encodeURIComponent(FilterQuery) +
            "&Status=" + encodeURIComponent(Encrypt(status)) +
            "&From=" + encodeURIComponent(Encrypt(convertDate(PFrom))) +
            "&To=" + encodeURIComponent(Encrypt(convertDate(PTo))) +
            "&PageIndex=" + encodeURIComponent(Encrypt(pageIndex)) +
            "&PageSize=" + encodeURIComponent(Encrypt(pageSize.toString())) +
            "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
            "&USERID=" + encodeURIComponent(Encrypt(UID)) +
            "&NURSELOCATION=" + encodeURIComponent(Encrypt(NurseLocation)) +
            "&DEPARTMENT=" + encodeURIComponent(Encrypt(DepartMent));

    $.ajax({
        url: FinalUrl,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (typeof (grid) != 'undefined' && grid != null) {
                grid.clearSelectedItems();
                tableView = grid.get_masterTableView();
                if (data.length > 0) {
                    updateVirtualItemCount(data[0].VIC, tableView);
                    $('#spanRequestCounts').html(data[0].VIC);
                } else {
                    $('#spanRequestCounts').html('0');
                }

                if (pageIndex == '0')
                    tableView.set_currentPageIndex(pageIndex);
                tableView.set_dataSource(data);
                tableView.dataBind();
                ModifyGridDatewise(grid, status, ServiceCode);

                setTimeout(function () {
                    $('.loaderElement').css("display", "none");
                    HideModalPopUp('ModalLoading');
                }, 1000);
            }
        },
        error: function (data) {
            console.error("Error in BindGridDateWise:", data);
        }
    });
}
function BindGridDateWises() {

    var UID = sessionStorage.getItem('ID');

    var selVal = $('#search_TaskFields').val(), txtVal = $('#txtSearchTask').val();
    if (selVal == 'R.REQUESTID' && txtVal.trim().length > 0) {
        PFrom = '2024-01-01T00:00'
        PTo = formatDateDW(new Date()) + 'T23:59';
    }

    var NurseLocationIds = $('#search_NurseLocation').val() || [];
    var DepartMentIds = $('#search_Department').val() || [];

    var NurseLocation = "";
    var DepartMent = "";

    if (NurseLocationIds.length > 0) {
        NurseLocationIds = NurseLocationIds.filter(function (id) {
            return id !== "All";
        });

        if (NurseLocationIds.length > 0) {
            NurseLocation = NurseLocationIds.join(',');
        }
    }

    if (DepartMentIds.length > 0) {
        DepartMentIds = DepartMentIds.filter(function (id) {
            return id !== "All";
        });

        if (DepartMentIds.length > 0) {
            DepartMent = DepartMentIds.join(',');
        }
    }

    var FilterQuery = DWQueryBuilder();
    var status = $('#selRequestStatus').val(),
        FinalUrl = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("DATEWISE")) +
            "&Search=" + encodeURIComponent(FilterQuery) +
            "&Status=" + encodeURIComponent(Encrypt(status)) +
            "&From=" + encodeURIComponent(Encrypt(convertDate(PFrom))) +
            "&To=" + encodeURIComponent(Encrypt(convertDate(PTo))) +
            "&PageIndex=" + encodeURIComponent(Encrypt(pageIndex)) +
            "&PageSize=" + encodeURIComponent(Encrypt(pageSize.toString())) +
            "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
            "&USERID=" + encodeURIComponent(Encrypt(UID)) +
            "&NURSELOCATION=" + encodeURIComponent(Encrypt(NurseLocation)) +
            "&DEPARTMENT=" + encodeURIComponent(Encrypt(DepartMent));
    $.ajax({
        url: FinalUrl,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (typeof (grid) != 'undefined' && grid != null) {
                grid.clearSelectedItems();
                tableView = grid.get_masterTableView();
                if (data.length > 0) {
                    updateVirtualItemCount(data[0].VIC, tableView);
                    $('#spanRequestCount').html(data[0].VIC);
                } else {
                    $('#spanRequestCount').html('0');
                }

                if (pageIndex == '0')
                    tableView.set_currentPageIndex(pageIndex);
                tableView.set_dataSource(data);
                tableView.dataBind();
                // ModifyGridDatewise(grid, status, ServiceCode);

                setTimeout(function () {
                    $('.loaderElement').css("display", "none");
                    HideModalPopUp('ModalLoading');
                }, 1000);
            }
        },
        error: function (data) {

        }

    });

    //SetEscalation(ReportUrl);

}

function ModifyGridDatewise(gridReport, Process, ServiceCode) {
    var grid = gridReport.get_masterTableView();

    switch (ServiceCode) {
        case "1":

            grid.hideColumn(grid.getColumnByUniqueName("ACKPHOTOTIMESTAMP").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ACKNAME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ACKCONTACT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ACKLOCATION").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("CHARGEGROUP").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ACKSIGN").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ACKPHOTO").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("QUANTITY").get_element().cellIndex);

            grid.hideColumn(grid.getColumnByUniqueName("LOGS").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("PATIENTNAME").get_element().cellIndex);
            break;
        case "2":


            grid.showColumn(grid.getColumnByUniqueName("CHARGEGROUP").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ACKPHOTOTIMESTAMP").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ACKNAME").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ACKCONTACT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ACKLOCATION").get_element().cellIndex);

            grid.showColumn(grid.getColumnByUniqueName("QUANTITY").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ACKSIGN").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ACKPHOTO").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("PATIENTNAME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("LOGS").get_element().cellIndex);

            break;


        case "3":

            grid.showColumn(grid.getColumnByUniqueName("ACKPHOTOTIMESTAMP").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ACKNAME").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ACKCONTACT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ACKLOCATION").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("CHARGEGROUP").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ACKSIGN").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ACKPHOTO").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("QUANTITY").get_element().cellIndex);

            grid.hideColumn(grid.getColumnByUniqueName("LOGS").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("PATIENTNAME").get_element().cellIndex);
            break;
    }

    switch (Process) {
        case "7":
            grid.hideColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("REMARKS").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("CANCELLEDAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("CANCELREMARKS").get_element().cellIndex);
            break;
        case "6":
        case "0":
            grid.showColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("REMARKS").get_element().cellIndex);
            if (Process == '0') {
                grid.showColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
                grid.showColumn(grid.getColumnByUniqueName("CANCELLEDAT").get_element().cellIndex);
                grid.showColumn(grid.getColumnByUniqueName("CANCELREMARKS").get_element().cellIndex);
            } else {
                grid.hideColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
                grid.hideColumn(grid.getColumnByUniqueName("CANCELREMARKS").get_element().cellIndex);
                grid.hideColumn(grid.getColumnByUniqueName("CANCELLEDAT").get_element().cellIndex);
            }
            break;
    }
}



function RowSelecting(sender, eventArgs) {
    ShowModalPopUp('ModalLoading');
    var PId = eventArgs.getDataKeyValue("ID"), PType = eventArgs.getDataKeyValue("PORTERNAME"), Date = eventArgs.getDataKeyValue("COUNT");
    var FilterQuery = DWQueryBuilder();
    GetChartData(ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) + "&From=" + encodeURIComponent(Encrypt(convertDate(PFrom))) + '&To=' + encodeURIComponent(Encrypt(convertDate(PTo))) + "&HospitalLoc=" + encodeURIComponent((FilterQuery)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) + '&Type=' + encodeURIComponent(Encrypt(((InnerOption == 'POption1') ? "PORTERPEEKHOUR" : (InnerOption == 'POption2') ? "PORTERPERFORMANCE" : (InnerOption == 'POption3') ? "PORTERCATEGORYWISE" : "PORTERWISECATEGORYPERFORMANCE"))) + '&PorterId=' + encodeURIComponent(Encrypt(PId)), ((InnerOption == 'POption1') ? "REQUEST TIME" : (InnerOption == 'POption2') ? "REQUEST TIME" : (InnerOption == 'POption3') ? "REQUEST CATEGORY" : "REQUEST CATEGORY"), ((InnerOption == 'POption1') ? "NO. OF REQUESTS" : (InnerOption == 'POption2') ? "AVG TIME TAKEN ( IN MINUTES)" : (InnerOption == 'POption3') ? "NO. OF REQUESTS" : "AVG TIME TAKEN ( IN MINUTES)"));
}


function PValidate() {
    var from = GetDate(Sfrom.value), to = GetDate(Sto.value), FromDate = new Date(from), ToDate = new Date(to);
    if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {
        BindGrid();
        return false;
    }
}


function BindGridReport() {
    var status = $('#RequestStatus').val(), FinalUrl = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("GET")) + "&Status=" + encodeURIComponent(Encrypt(status)) + "&From=" + encodeURIComponent(Encrypt(convertDate(Sfrom.value))) + "&To=" + encodeURIComponent(Encrypt(convertDate(Sto.value))) + "&Search=" + encodeURIComponent(Encrypt($('#txtAssignTo').val())) + "&DEPTIDS=" + encodeURIComponent(Encrypt(selDeptIDs)) + "&PageIndex=" + encodeURIComponent(Encrypt(pageIndex)) + "&PageSize=" + encodeURIComponent(Encrypt(pageSize));
    $.ajax({
        url: FinalUrl,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (typeof (grid) != 'undefined' && grid != null) {
                grid.clearSelectedItems();
                tableView = grid.get_masterTableView();
                if (data.length > 0)
                    updateVirtualItemCount(data[0].VIC, tableView)
                if (pageIndex == '0')
                    tableView.set_currentPageIndex(pageIndex);
                tableView.set_dataSource(data);
                tableView.dataBind();
                ModifyGridReport(grid, status);
                setTimeout(function () {
                    $('.loaderElement').css("display", "none");
                    HideModalPopUp('ModalLoading');
                }, 1000);
            }
        },
        error: function (data) {

        }

    });

    SetEscalation(ReportUrl);

}

function SetEscalation(BaseUrl) {
    var FinalUrl = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("GETESCALATION")) + "&From=" + encodeURIComponent(Encrypt(convertDate(Sfrom.value))) + "&To=" + encodeURIComponent(Encrypt(convertDate(Sto.value))) + "&Search=" + encodeURIComponent(Encrypt($('#txtAssignTo').val()));
    $.ajax({
        url: FinalUrl,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            var ASCount = data[0].VALUE, SECount = data[1].VALUE;
            $('#tdASCount').html(ASCount + '%'); $('#tdSECount').html(SECount + '%');
        },
        error: function (data) {

        }

    });
}
function ModifyGridReport(gridReport, Process) {
    var grid = gridReport.get_masterTableView();
    switch (Process) {
        case "7":
            grid.hideColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("REMARKS").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("CANCELLEDAT").get_element().cellIndex);
            break;
        case "6":
        case "0":

            grid.showColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("REMARKS").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("CANCELLEDAT").get_element().cellIndex);
            break;
    }
}

function BindAlertGrid() {
    var FinalUrl = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("REPORT")) + "&From=" + encodeURIComponent(Encrypt(convertDate(Sfrom.value))) + "&To=" + encodeURIComponent(Encrypt(convertDate(Sto.value))) + "&Type=" + encodeURIComponent(Encrypt("ALERT")) + "&Search=" + encodeURIComponent(Encrypt($('#txtPorter').val())) + "&PageIndex=" + encodeURIComponent(Encrypt(pageIndex)) + "&PageSize=" + encodeURIComponent(Encrypt(pageSize)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode));
    $.ajax({
        url: FinalUrl,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (typeof (grid) != 'undefined' && grid != null) {
                tableView = grid.get_masterTableView();
                tableView.clearSelectedItems();
                if (data.length > 0)
                    updateVirtualItemCount(data[0].VIC, tableView)
                if (pageIndex == '0')
                    tableView.set_currentPageIndex(pageIndex);
                tableView.set_dataSource(data);
                tableView.dataBind();
            }
            HideModalPopUp('ModalLoading');
        },
        error: function (data) {

        }

    });
}
function GridAlert_OnDataBound(sender, args) {
    var MasterTable = sender.get_masterTableView();
    MasterTable.set_virtualItemCount(5);
    alert("Virtual item count: " + MasterTable.get_virtualItemCount());

}

function GridAlert_Command(sender, args) {
    args.set_cancel(true);
    pageIndex = parseInt(sender.get_masterTableView().get_currentPageIndex());
    pageSize = sender.get_masterTableView().get_pageSize();
    switch (args.get_commandName()) {
        case "Page":
        case "PageSize":
            BindGrid();
            break;
    }
}
function updateVirtualItemCount(result, tableView) {
    tableView.set_virtualItemCount(result);
}
function AValidate() {
    var from = convertDate(Sfrom.value), to = convertDate(Sto.value), FromDate = new Date(from), ToDate = new Date(to);
    if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {
        pageIndex = 0;
        BindGrid();
        return false;
    }
}

function ExportExcel(From, To, Header) {
    var Url = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("EXPORTCATEGORY")) + "&From=" + encodeURIComponent(Encrypt(convertDate(From))) + "&To=" + encodeURIComponent(Encrypt(convertDate(To))) + "&Header=" + encodeURIComponent(Encrypt(Header));
    $.ajax({
        url: Url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var downloadLink = document.createElement("a");
            downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
            downloadLink.download = Header;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            HideModalPopUp('ModalTimeTaken');
        },
        error: function (data) {

        }

    });
}
function ExportExcelTimewise(From, To, Category, Header) {
    var Url = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("EXPORTTIMEWISE")) + "&From=" + encodeURIComponent(Encrypt(convertDate(From))) + "&To=" + encodeURIComponent(Encrypt(convertDate(To))) + "&Header=" + encodeURIComponent(Encrypt(Header)) + "&Category=" + encodeURIComponent(Encrypt(Category));
    $.ajax({
        url: Url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var downloadLink = document.createElement("a");
            downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
            downloadLink.download = Header;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            HideModalPopUp('ModalTimeTaken');
        },
        error: function (data) {

        }

    });
}

function TCategoryCount(RPurl, From, To, PROC, Header, titleD, DeptIDs) {
    var Url = RPurl + "PROCESS=" + encodeURIComponent(Encrypt("DYNEXPORTSINGLEPARAM")) + "&From=" + encodeURIComponent(Encrypt(convertDate(From))) + "&To=" + encodeURIComponent(Encrypt(convertDate(To))) + "&Header=" + encodeURIComponent(Encrypt(titleD)) + "&PROC=" + encodeURIComponent(Encrypt(PROC)) + "&PARAM1=" + encodeURIComponent(Encrypt("DEPTIDS")) + "&VALUE1=" + encodeURIComponent(Encrypt(DeptIDs));
    $.ajax({
        url: Url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var downloadLink = document.createElement("a");
            downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
            downloadLink.download = Header;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            HideModalPopUp('ModalTimeTaken');
        },
        error: function (data) {

        }

    });
}

function TCategoryCancelCount(RPurl, From, To, PROC, Header, titleD, DeptIDs) {
    var Url = RPurl + "PROCESS=" + encodeURIComponent(Encrypt("DYNEXPORTSINGLEPARAMTWOTABLE")) + "&From=" + encodeURIComponent(Encrypt(convertDate(From))) + "&To=" + encodeURIComponent(Encrypt(convertDate(To))) + "&Header=" + encodeURIComponent(Encrypt(titleD)) + "&PROC=" + encodeURIComponent(Encrypt(PROC)) + "&PARAM1=" + encodeURIComponent(Encrypt("DEPTIDS")) + "&VALUE1=" + encodeURIComponent(Encrypt(DeptIDs)) + "&SubHeader=" + encodeURIComponent(Encrypt("NO.OF CALLS VS CANCELLED CALLS")) + "&SubHeader1=" + encodeURIComponent(Encrypt("CAREGORYWISE REQUEST COUNT")) + "";
    $.ajax({
        url: Url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var downloadLink = document.createElement("a");
            downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
            downloadLink.download = Header;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            HideModalPopUp('ModalTimeTaken');
        },
        error: function (data) {

        }

    });
}


function ExportPorterWise(From, To, Header) {
    var Url = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("EXPORTPORTERWISE")) + "&From=" + encodeURIComponent(Encrypt(GetDate(From))) + "&To=" + encodeURIComponent(Encrypt(GetDate(To))) + "&Header=" + encodeURIComponent(Encrypt(Header));
    $.ajax({
        url: Url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var downloadLink = document.createElement("a");
            downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
            downloadLink.download = Header;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            HideModalPopUp('ModalTimeTaken');
        },
        error: function (data) {

        }

    });
}
function ExportDateReport(From, To, Header, Status, Porter) {
    var Url = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("EXPORTDATEWISE")) + "&From=" + encodeURIComponent(Encrypt(GetDate(From))) + "&To=" + encodeURIComponent(Encrypt(GetDate(To))) + "&Header=" + encodeURIComponent(Encrypt(Header)) + "&Status=" + encodeURIComponent(Encrypt(Status)) + "&Porter=" + encodeURIComponent(Encrypt(Porter));
    $.ajax({
        url: Url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            if (data[0].Result !== 'No Data') {
                var downloadLink = document.createElement("a");
                downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
                downloadLink.download = Header;

                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
            else
                alert('No Records to Export.')

            HideModalPopUp('ModalTimeTaken');
        },
        error: function (data) {

        }

    });
}

function ExportDailyReport(From, To, Header) {
    var Url = ReportUrl + "PROCESS=" + encodeURIComponent(Encrypt("EXPORTDAILYWISE")) + "&From=" + encodeURIComponent(Encrypt(GetDate(From))) + "&To=" + encodeURIComponent(Encrypt(GetDate(To))) + "&Header=" + encodeURIComponent(Encrypt(Header));
    $.ajax({
        url: Url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var downloadLink = document.createElement("a");
            downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
            downloadLink.download = Header;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            HideModalPopUp('ModalTimeTaken');
        },
        error: function (data) {

        }

    });
}
function DatewiseValidate() {
    var from = convertDate(Sfrom.value), to = convertDate(Sto.value), FromDate = new Date(from), ToDate = new Date(to), retVal = false;
    if (Sfrom.value.length == 0)
        Sfrom.focus();
    else if (Sto.value.length == 0)
        Sto.focus();
    else if (FromDate > ToDate)
        Sto.focus();
    else {
        retVal = true;
    }
    return retVal;
}
function ShowModalPopUp(ModalId) {
    $('#' + ModalId).modal('show');
}
function HideModalPopUp(ModalId) {
    $('#' + ModalId).modal('hide');
}
function Redirect(RedirectTo) {
    window.location = RedirectTo;
}

function DynExport(From, To, Header, PROC, title) {
    var Url = RPurl + "PROCESS=" + encodeURIComponent(Encrypt("DYNEXPORT")) + "&From=" + encodeURIComponent(Encrypt(convertDate(From))) + "&To=" + encodeURIComponent(Encrypt(convertDate(To))) + "&Header=" + encodeURIComponent(Encrypt(Header)) + "&PROC=" + encodeURIComponent(Encrypt(PROC));
    $.ajax({
        url: Url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data.length > 0) {
                var downloadLink = document.createElement("a");
                downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(data[0].Result);
                downloadLink.download = title;

                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                alert('No Records Found.')
            }
            HideModalPopUp('ModalTimeTaken');
        },
        error: function (data) {

        }

    });
}



function OnchangeDept(InputID, ContainerID, BURL) {
    var SearchVal = $('#' + InputID).val();

    if (SearchVal.length > 0) {
        $.ajax({
            async: true,
            url: BURL + "Process=" + encodeURIComponent(Encrypt("SEARCHDEPT")) + "&VALUE=" + encodeURIComponent(Encrypt(SearchVal)) + "&SELECTEDIDS=" + encodeURIComponent(Encrypt(selDeptIDs)),
            type: 'POST',
            data: 'pData',
            dataType: 'json',
            success: function (data) {

                if (data.length > 0)
                    $('#' + ContainerID + '').html(data[0].RESULT);
                $('#' + ContainerID).css('display', ((data.length > 0) ? 'block' : 'none'));


            },
            error: function (data) {

            }

        });
    } else
        $('#' + ContainerID).css('display', 'none');
}


function BindDept(Id, Location) {
    sessionStorage.setItem('DeptLOCID', Id); sessionStorage.setItem('DeptLOC', Location);
    $('#txtDeptLocation').val(Location);
    $('#DivLocContent').css('display', 'none');
}


function ADDDeptLocation(InputID, ContainerID) {
    var value = $("#" + InputID).val();
    var DId = sessionStorage.getItem('DeptLOCID'), Location = sessionStorage.getItem('DeptLOC');
    if (value.length > 0 && (DId !== '0') && (Location !== '0')) {
        searchLocation.push({ "ID": DId, "LOCATION": Location });
        LoadDept(searchLocation, ContainerID, InputID);
    }
    else {
        $("#" + InputID).val(''); $("#" + InputID).focus();
    }

}

function DELDept(ID, ContainerID, InputID) {

    searchLocation = searchLocation.filter(function (loc) {
        return loc.ID !== ID;
    });

    LoadDept(searchLocation, ContainerID, InputID);
}

function LoadDept(Array, ContainerID, InputID) {
    var LocIDs = '', selDeptss = '';

    var Table = "<table width='95%' cellpadding='5' cellspacing='5' style='border-collapse: collapse;border: 1px solid gray;margin-top: 10px;'> <tr style='border: 1px solid gray;height:25px;'> <td align='center'style='width:90px;border: 1px solid gray;vertical-align: middle;'> DEPARTMENT  </td> <td align='center'style='width:50px;border: 1px solid gray;vertical-align: middle;'> DELETE </td> </tr>";

    Array.forEach((Loc) => {
        LocIDs += (LocIDs.length > 0) ? "," + Loc.ID : Loc.ID;

        selDeptss += (selDeptss.length > 0) ? "," + Loc.LOCATION : Loc.LOCATION;

        Table += "<tr style='border: 1px solid gray;' > <td align='left' style='width:90px;border: 1px solid gray;vertical-align: middle;' > " + Loc.LOCATION + "</td> " +
            "<td align='center' style='border: 1px solid gray;vertical-align: middle;'> <img src='Images/Delete.png' style='cursor: pointer;outline: none;width: 30px;padding: 3px;vertical-align: middle;' onclick='DELDept(" + '"' + Loc.ID + '"' + ', "' + ContainerID + '"' + ', "' + InputID + '"' + ");return false;' /> </td> </tr>";

    });
    Table += "</tr></table>";

    selDeptIDs = LocIDs;
    selDepts = selDeptss;
    $('#' + ContainerID + '').html(Table);

    $("#" + InputID).val(''); sessionStorage.setItem('DeptLOCID', '0'); sessionStorage.setItem('DeptLOC', '0');

}

function setupSumoAllLogic($select) {
    $select.on('change', function () {
        setTimeout(function () {
            var selected = $select.val() || [];
            var allOption = "All";

            if (selected.includes(allOption) && selected.length > 1) {
                selected = selected.filter(v => v !== allOption);

                $select.val(selected);

                if ($select[0].sumo) {
                    setTimeout(function () {
                        $select[0].sumo.reload();
                    }, 50);
                }
            }

            if (!selected.length || selected.length === 0) {
                $select.val([allOption]);
                if ($select[0].sumo) {
                    setTimeout(function () {
                        $select[0].sumo.reload();
                    }, 50);
                }
            }

        }, 100);
    });
}
function LoaddrLocation() {
    var arrFloor = [];
    var encProcess = Encrypt("GETNURSELOCATION").toString();
    var UserId = sessionStorage.getItem("ID");

    $.ajax({
        async: true,
        url: ReportUrl + "Process=" + encodeURIComponent(encProcess) + "&USERID=" + encodeURIComponent(Encrypt(UserId)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var $select = $('#search_NurseLocation');
            if ($select[0] && $select[0].sumo) {
                $select[0].sumo.unload();
            }

            $select.empty();
            $select.append('<option value="All">All</option>');

            if (data && data.length > 0 && data[0] && data[0].RESULT) {
                arrFloor = data[0].RESULT.split(',');

                $.each(arrFloor, function (index, value) {
                    if (value && value.trim() !== '') {
                        var parts = value.split('_');
                        if (parts.length >= 2) {
                            var locId = parts[0];
                            var locName = parts[1];
                            $select.append('<option value="' + locId + '">' + locName + '</option>');
                        }
                    }
                });

                $select.SumoSelect({
                    placeholder: 'Select Here',
                    search: true,
                    searchText: 'Type to search...',
                    selectAll: false,
                    okCancelInMulti: true,
                    triggerChangeCombined: true,
                    csvDispCount: 3,
                    captionFormat: '{0} Selected',
                    captionFormatAllSelected: 'All Selected ({0})',
                    captionFormatNoSelection: 'Select Here',
                    forceCustomRendering: true,
                    outputAsCSV: false
                });

                setTimeout(function () {
                    $select[0].sumo.selectItem(0);
                }, 100);

                setupSumoAllLogic($select);

            } else {

                $select.SumoSelect({
                    placeholder: 'Select Here',
                    search: true,
                    searchText: 'Type to search...',
                    selectAll: false,
                    okCancelInMulti: true,
                    triggerChangeCombined: true,
                    csvDispCount: 3,
                    captionFormat: '{0} Selected',
                    captionFormatAllSelected: 'All Selected ({0})',
                    captionFormatNoSelection: 'Select Here',
                    forceCustomRendering: true,
                    outputAsCSV: false
                });

                $select[0].sumo.selectItem(0);
            }

            setTimeout(function () {
                $select.on('sumo:closed', function () {
                    setTimeout(function () {
                    }, 100);
                });
            }, 500);

        },
        error: function (xhr) {

            var $select = $('#search_NurseLocation');
            if ($select[0] && $select[0].sumo) {
                $select[0].sumo.unload();
            }

            $select.html('<option value="All">All</option>');

            $select.SumoSelect({
                placeholder: 'Select Here',
                search: true,
                searchText: 'Type to search...',
                selectAll: false,
                okCancelInMulti: true,
                triggerChangeCombined: true,
                csvDispCount: 3,
                captionFormat: '{0} Selected',
                captionFormatAllSelected: 'All Selected ({0})',
                captionFormatNoSelection: 'Select Here',
                forceCustomRendering: true,
                outputAsCSV: false
            });
        }
    });
}
function LoaddrDepartMent() {
    var arrFloor = [];
    var encProcess = Encrypt("GETDEPARTMENT").toString();
    var UserId = sessionStorage.getItem("ID");

    $.ajax({
        async: true,
        url: ReportUrl + "Process=" + encodeURIComponent(encProcess) + "&USERID=" + encodeURIComponent(Encrypt(UserId)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var $select = $('#search_Department');
            if ($select[0] && $select[0].sumo) {
                $select[0].sumo.unload();
            }

            $select.empty();
            $select.append('<option value="All">All</option>');

            if (data && data.length > 0 && data[0] && data[0].RESULT) {
                arrFloor = data[0].RESULT.split(',');

                $.each(arrFloor, function (index, value) {
                    if (value && value.trim() !== '') {
                        var parts = value.split('_');
                        if (parts.length >= 2) {
                            var deptId = parts[0];
                            var deptName = parts[1];
                            $select.append('<option value="' + deptId + '">' + deptName + '</option>');
                        }
                    }
                });

                $select.SumoSelect({
                    placeholder: 'Select Here',
                    search: true,
                    searchText: 'Type to search...',
                    selectAll: false,
                    okCancelInMulti: true,
                    triggerChangeCombined: true,
                    csvDispCount: 3,
                    captionFormat: '{0} Selected',
                    captionFormatAllSelected: 'All Selected ({0})',
                    captionFormatNoSelection: 'Select Here',
                    forceCustomRendering: true,
                    outputAsCSV: false
                });

                setTimeout(function () {
                    $select[0].sumo.selectItem(0);
                }, 100);

                setupSumoAllLogic($select);

            } else {

                $select.SumoSelect({
                    placeholder: 'Select Here',
                    search: true,
                    searchText: 'Type to search...',
                    selectAll: false,
                    okCancelInMulti: true,
                    triggerChangeCombined: true,
                    csvDispCount: 3,
                    captionFormat: '{0} Selected',
                    captionFormatAllSelected: 'All Selected ({0})',
                    captionFormatNoSelection: 'Select Here',
                    forceCustomRendering: true,
                    outputAsCSV: false
                });

                $select[0].sumo.selectItem(0);
            }

            setTimeout(function () {
                $select.on('sumo:closed', function () {

                    var selectedValues = getSumoSelectValues('#search_Department');
                });
            }, 500);

        },
        error: function (xhr) {

            var $select = $('#search_Department');
            if ($select[0] && $select[0].sumo) {
                $select[0].sumo.unload();
            }

            $select.html('<option value="All">All</option>');

            $select.SumoSelect({
                placeholder: 'Select Here',
                search: true,
                searchText: 'Type to search...',
                selectAll: false,
                okCancelInMulti: true,
                triggerChangeCombined: true,
                csvDispCount: 3,
                captionFormat: '{0} Selected',
                captionFormatAllSelected: 'All Selected ({0})',
                captionFormatNoSelection: 'Select Here',
                forceCustomRendering: true,
                outputAsCSV: false
            });
        }
    });
}

$(document).ready(function () {
    LoaddrLocation();
    LoaddrDepartMent();
    RolewiseFilter();

    setTimeout(function () {
        if (!$('#search_NurseLocation').val() || $('#search_NurseLocation').val().length === 0) {
            $('#search_NurseLocation').val(['All']);
            if ($('#search_NurseLocation')[0].sumo) {
                $('#search_NurseLocation')[0].sumo.reload();
            }
        }

        if (!$('#search_Department').val() || $('#search_Department').val().length === 0) {
            $('#search_Department').val(['All']);
            if ($('#search_Department')[0].sumo) {
                $('#search_Department')[0].sumo.reload();
            }
        }
    }, 1000);
});

function getSumoSelectValues(selector) {
    var $select = $(selector);
    var values = [];

    if ($select.length > 0) {
        values = $select.val() || [];

        if (values.length === 1 && values[0] === "All") {

            var actuallySelected = [];
            $select.find('option').each(function () {
                if (this.selected && this.value !== "All") {
                    actuallySelected.push(this.value);
                }
            });

            if (actuallySelected.length > 0) {
                values = actuallySelected;
            }
        }
    }

    return values;
}

function RolewiseFilter() {
    var roleId = parseInt(sessionStorage.getItem("ROLE"));

    var locationColumn = $("#roleWiseLoc");
    var departmentColumn = $("#roleWiseDept");

    locationColumn.show().removeClass('col-md-12').addClass('col-md-6');
    departmentColumn.show().removeClass('col-md-12').addClass('col-md-6');

    var parentRow = $("#roleWiseLoc").closest('div[style*="position: relative"]');

    if (roleId === 14) {         
        departmentColumn.hide();
        locationColumn.removeClass('col-md-6').addClass('col-md-12');
        parentRow.css('right', '-558px');
    } else if (roleId === 15) {  
        locationColumn.hide();
        departmentColumn.removeClass('col-md-6').addClass('col-md-12');
        parentRow.css('right', '-558px');
    } else {                     
        parentRow.css('right', '-210px');
    }
}
