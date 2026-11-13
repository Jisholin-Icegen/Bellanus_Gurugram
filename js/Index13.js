//const { clearInterval } = require("timers");

var arr = ["TextSOURCE", "TextCATEGORY", "TextDESTINATION"], ReqIcon = ["divTotalPercentage", "divPendingPercentage", "divAssignedPercentage", "divInprogressPercentage", "divCompletedPercentage", "divPendingOnHoldPercentage", "divPrebookeddPercentage", "divCancelledPercentage", "divCancelledPercentage", "divTatExceededPercentage", "divBarrierPercentage", "divSlaViolationsPercentage", "divSlaViolations2Percentage", "divActiveAlertsPercentage", "divViolationsByDeptPercentage"],
    Source = '', Dest = '', User = '', Cat = '', AStatus = '', CancelReqId = '', EStatus = '', Intervl = 0, EReqId = '', ReqArr = ["divTotalPercentage", "divPendingPercentage", "divAssignedPercentage", "divInprogressPercentage", "divCompletedPercentage", "divPendingOnHoldPercentage", "divPrebookeddPercentage", "divCancelledPercentage", "divCancelledPercentage", "divTatExceededPercentage", "divBarrierPercentage", "divSlaViolationsPercentage", "divSlaViolations2Percentage", "divActiveAlertsPercentage", "divViolationsByDeptPercentage"],
    CurPendProcess = '', AReqId = '', MReqId = '', IsChecked = false, Port = '', Name = "", RequestType = '', CurrentCancelStatus = '';
var ReqArrChart = ["divTotalPercentage", "divPendingPercentage", "divAssignedPercentage", "divInprogressPercentage", "divCompletedPercentage", "divBarrierPercentage"],
    ReqArrDiv = ["divPendingOnHoldPercentage", "divPrebookeddPercentage", "divCancelledPercentage", "divCancelledPercentage", "divTatExceededPercentage", "divBarrierPercentage"],
    ReqArrUserDiv = ["divOnDuty", "divBusy", "divIdle", "divOnBreak", "divMaxTask", "divMinTask", "divAvgCount"];


function selDiv(Ele) {
    var selDiv = $('#' + Ele).closest((((ReqArrChart.indexOf(Ele) > -1)) ? '.progress' : '.counter-info-item'));
    //$('div.' + (((ReqArrChart.indexOf(Ele) > -1)) ? 'progress' : 'counter-info-item')).removeClass((((ReqArrChart.indexOf(Ele) > -1)) ? 'titleActive' : 'divtitleActive'));
    $('div.progress').removeClass('titleActive');
    $('div.counter-info-item').removeClass('divtitleActive');

    $(selDiv).addClass((((ReqArrChart.indexOf(Ele) > -1)) ? 'titleActive' : 'divtitleActive'));
}
//function Select(Ele, Process) {
//    //ShowModalPopUp('ModalLoading');
//    LoaderOn(); pageIndex = 0;
//    var EleID = $('#' + Ele).attr('id'); selDiv(Ele);

//    $.each(ReqIcon, function (index, value) {
//        if (value == EleID)
//            $('#' + value).addClass('SelectIndexIcon');
//        else
//            $('#' + value).removeClass('SelectIndexIcon');

//    });
//    if (ReqArr.indexOf(EleID) > -1) {
//        var ReqStatus = (EleID == "divTotalPercentage") ? "0" : (EleID == "divPendingPercentage") ? "2" : (EleID == "divAssignedPercentage") ? "3" : (EleID == "divInprogressPercentage") ? "4" : (EleID == "divCompletedPercentage") ? "6" : (EleID == "divCancelledPercentage") ? "7" : (EleID == "divPendingOnHoldPercentage") ? "8" : (EleID == "divTatExceededPercentage") ? "9" : (EleID == "divPrebookeddPercentage") ? "100" : (EleID == "tdPreBook") ? "100" : (EleID == "divBarrierPercentage") ? "9" : "0";

//        CProcess = ReqStatus;
//        LoadProcess(ReqStatus);
//        ToUpdate = !ToUpdate;
//        ReloadLinks();
//    }
//    else {
//        CProcess = "10";
//    }
//    setRequestUsers('Tasks');
//    LoaderOff(500);

//}

function Select(Ele, Process) {

    LoaderOn();
    pageIndex = 0;

    var EleID = $('#' + Ele).attr('id');
    selDiv(Ele);

    $('.req-modern-card').removeClass('active');

    $('#' + EleID).addClass('active');


    $.each(ReqIcon, function (index, value) {
        if (value == EleID)
            $('#' + value).addClass('SelectIndexIcon');
        else
            $('#' + value).removeClass('SelectIndexIcon');
    });

    if (ReqArr.indexOf(EleID) > -1) {

        var ReqStatus = (EleID == "divTotalPercentage") ? "0" :
            (EleID == "divPendingPercentage") ? "2" :
                (EleID == "divAssignedPercentage") ? "3" :
                    (EleID == "divInprogressPercentage") ? "4" :
                        (EleID == "divCompletedPercentage") ? "6" :
                            (EleID == "divCancelledPercentage") ? "7" :
                                (EleID == "divPendingOnHoldPercentage") ? "8" :
                                    (EleID == "divTatExceededPercentage") ? "9" :
                                        (EleID == "divPrebookeddPercentage") ? "100" :
                                            (EleID == "tdPreBook") ? "100" :
        //                                        (EleID == "divBarrierPercentage") ? "9" : "0";
                                                (EleID == "divSlaViolationsPercentage") ? "9" :      
                                                    (EleID == "divSlaViolations2Percentage") ? "11" :    
                                                        (EleID == "divActiveAlertsPercentage") ? "10" :      
                                                            (EleID == "divViolationsByDeptPercentage") ? "12" :  "0"; 

        CProcess = ReqStatus;
        LoadProcess(ReqStatus);
        ToUpdate = !ToUpdate;
        ReloadLinks();
    }
    else {
        CProcess = "10";
    }

    setRequestUsers('Tasks');
    LoaderOff(500);
}

function getUserDepartmentLocation() {
    var userId = sessionStorage.getItem("ID");
    var roleId = sessionStorage.getItem("ROLE");
    var ServiceCode = sessionStorage.getItem("ServiceCode") || '1';

    if (!userId) {
        document.getElementById("spndepNurslocdept").innerHTML = '-';
        document.getElementById("spnUserTypeLabel").innerHTML = 'Location(s):';
        return;
    }

    $.ajax({
        url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("GET_USER_ACCESS")) +
            '&SERVICEID=' + encodeURIComponent(Encrypt(ServiceCode)) +
            '&UserId=' + encodeURIComponent(Encrypt(userId)) +
            '&RoleId=' + encodeURIComponent(Encrypt(roleId)) +
            '&_t=' + new Date().getTime(),
        type: 'GET',
        success: function (response) {
            try {
                var data = typeof response === 'string' ? JSON.parse(response) : response;

                if (data && data.length > 0) {
                    var item = data[0];
                    var displayText = '';
                    var labelText = '';

                    if (roleId === '14') {
                        labelText = 'Location:';
                        displayText = item.NurseLocationNames ? item.NurseLocationNames.replace(/&amp;/g, '&') : 'All Locations';
                    }
                    else if (roleId === '15') {
                        labelText = 'Department:';
                        displayText = item.DepartmentNames ? item.DepartmentNames.replace(/&amp;/g, '&') : 'All Departments';
                    }
                    else {

                        labelText = 'Access:';
                        if (item.RoleName === 'Nurse' && item.NurseLocationNames) {
                            displayText = item.NurseLocationNames.replace(/&amp;/g, '&');
                        }
                        else if (item.RoleName === 'Department' && item.DepartmentNames) {
                            displayText = item.DepartmentNames.replace(/&amp;/g, '&');
                        }
                        else {
                            displayText = 'All Access';
                        }
                    }

                    document.getElementById("spnUserTypeLabel").innerHTML = labelText;
                    document.getElementById("spndepNurslocdept").innerHTML = displayText;

                } else {
                    document.getElementById("spndepNurslocdept").innerHTML = '';
                }
            } catch (e) {
                console.error('Parse error:', e);
                document.getElementById("spnUserTypeLabel").innerHTML = 'Location:';
                document.getElementById("spndepNurslocdept").innerHTML = '-';
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', error);
            document.getElementById("spnUserTypeLabel").innerHTML = 'Location:';
            document.getElementById("spndepNurslocdept").innerHTML = '-';
        }
    });
}

$(document).ready(function() {
    getUserDepartmentLocation();
});


function loadExecutiveDashboardInIndex() {

    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = '';
    var departmentIds = '';
    var FilterQuery = '';
    var ServiceCode = sessionStorage.getItem('ServiceCode') || '1';

    $('.loaderElement').css("display", "inline-block");

    $('#EscalationChart').html(`
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:600px; background:linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%); border-radius:24px; border:1px solid rgba(255,255,255,0.12);">
        <div style="background:rgba(255, 255, 255, 0.08); padding:40px; border-radius:30px; backdrop-filter:blur(8px); border:1.5px solid rgba(255,255,255,0.12); box-shadow:0 20px 35px -5px rgba(0,0,0,0.3);">
            <div style="position:relative; width:70px; height:70px; margin:0 auto;">
                <div style="position:absolute; top:0; left:0; right:0; bottom:0; border:3px solid rgba(255,255,255,0.15); border-top:3px solid #b794f4; border-radius:50%; animation:spin 1s linear infinite; box-shadow:0 0 15px rgba(183, 148, 244, 0.3);"></div>
                <div style="position:absolute; top:5px; left:5px; right:5px; bottom:5px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #9f7aea; border-radius:50%; animation:spin 1.5s linear infinite reverse;"></div>
            </div>
            <p style="margin-top:25px; color:#ffffff; font-size:18px; font-weight:600; letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.2);">Loading Executive Dashboard...</p>
            <p style="margin-top:8px; color:rgba(255,255,255,0.6); font-size:14px; font-weight:400;">Real-time performance metrics and analytics</p>
        </div>
    </div>
    <style>
        @keyframes spin { 
            0% { transform:rotate(0deg); } 
            100% { transform:rotate(360deg); } 
        }
    </style>
`);

    $.when(
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("DASHBOARD_KPI")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&Type=" + encodeURIComponent(Encrypt("DASHBOARD_KPI")) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("TASK_VOLUME_TREND")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&Type=" + encodeURIComponent(Encrypt("TASK_VOLUME_TREND")) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("BOTTLENECK_DEPTS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&Type=" + encodeURIComponent(Encrypt("BOTTLENECK_DEPTS")) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("DEPARTMENT_WORKLOAD")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&Type=" + encodeURIComponent(Encrypt("DEPARTMENT_WORKLOAD")) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("SLA_VIOLATIONS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&Type=" + encodeURIComponent(Encrypt("SLA_VIOLATIONS")) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("PEAK_HOURS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&Type=" + encodeURIComponent(Encrypt("PEAK_HOURS")) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("COST_DRIVERS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&Type=" + encodeURIComponent(Encrypt("COST_DRIVERS")) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        })
    ).then(function (kpiRes, trendRes, bottleneckRes, workloadRes, slaRes, peakRes, costRes) {

        renderExecutiveDashboardWithRealData(
            kpiRes[0], trendRes[0], bottleneckRes[0],
            workloadRes[0], slaRes[0], peakRes[0], costRes[0]
        );

        setTimeout(function () {
            $('.loaderElement').css("display", "none");
        }, 500);

    }).fail(function (xhr, status, error) {
        console.error("Dashboard data load failed:", error);
        $('#EscalationChart').html(`
            <div style="text-align:center; padding:60px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:24px;">
                <div style="background:rgba(255,255,255,0.15); padding:40px; border-radius:30px; backdrop-filter:blur(10px);">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="margin:0 auto;">
                        <circle cx="12" cy="12" r="10" stroke="white" fill="none"/>
                        <line x1="12" y1="8" x2="12" y2="12" stroke="white"/>
                        <circle cx="12" cy="16" r="1" fill="white"/>
                    </svg>
                    <p style="margin-top:20px; color:white; font-size:18px; font-weight:600;">Error loading dashboard data</p>
                    <p style="color:rgba(255,255,255,0.8); font-size:14px; margin-top:10px;">${error || 'Please try again'}</p>
                </div>
            </div>
        `);
        $('.loaderElement').css("display", "none");
    });
}

function renderExecutiveDashboardWithRealData(kpiData, trendData, bottleneckData, workloadData, slaData, peakData, costData) {
    const COLORS = {
        primary: "#3a5be0",
        secondary: "#6a0dad",
        tertiary: "#e01e6a",
        quaternary: "#3ab5e0",
        warning: "#e05a2e",
        success: "#05b58c",
        text: {
            primary: "#ffffff",
            secondary: "#e0e0e0",
            light: "#c0c0c0"
        },
        background: {
            main: "linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%)",
            card: "rgba(255, 255, 255, 0.08)",
            border: "rgba(255, 255, 255, 0.12)"
        },
        chartColors: ["#3a5be0", "#6a0dad", "#e01e6a", "#3ab5e0", "#e05a2e"],
        bottleneckColors: ["#f59e0b"],
        slaColor: "#ef4444",
        heatmapColors: [
            '#0A2472', 
            '#1E3A6F', 
            '#2B4F8E', 
            '#3B6EB0', 
            '#FFFFFF'  
        ]
    };

    var totalRequests = (kpiData && kpiData.length > 0 && kpiData[0].TOTAL_REQUESTS !== undefined)
        ? kpiData[0].TOTAL_REQUESTS : null;
    var avgTime = (kpiData && kpiData.length > 0 && kpiData[0].AVG_COMPLETION_TIME !== undefined)
        ? parseFloat(kpiData[0].AVG_COMPLETION_TIME).toFixed(1) : null;
    var slaPercent = (kpiData && kpiData.length > 0 && kpiData[0].SLA_PERCENT !== undefined)
        ? parseFloat(kpiData[0].SLA_PERCENT).toFixed(1) : null;
    var utilization = (kpiData && kpiData.length > 0 && kpiData[0].UTILIZATION !== undefined)
        ? parseFloat(kpiData[0].UTILIZATION).toFixed(1) : null;
    var delayPercent = (kpiData && kpiData.length > 0 && kpiData[0].DELAY_PERCENT !== undefined)
        ? parseFloat(kpiData[0].DELAY_PERCENT).toFixed(1) : null;

    var trendCategories = [];
    var trendValues = [];

    if (trendData && trendData.length > 0) {
        trendCategories = trendData.map(item => item.LABEL || 'Unknown');
        trendValues = trendData.map(item => item.VALUE || 0);
    }

    var workloadPieData = [];
    if (workloadData && workloadData.length > 0) {
        workloadPieData = workloadData.map(item => ({
            name: item.NAME || 'Unknown',
            value: parseFloat(item.ACTIVE_TASKS) || 0,
            percentage: parseFloat(item.WORKLOAD_PERCENTAGE) || 0
        }));
    }

    var bottleneckItems = [];
    if (bottleneckData && bottleneckData.length > 0) {
        bottleneckItems = bottleneckData;
    }

    var slaItems = [];
    if (slaData && slaData.length > 0) {
        slaItems = slaData;
    }

    var heatmapHTML = buildPeakHoursHeatmap(peakData, COLORS);

    var kpiHTML = '';
    if (totalRequests !== null || avgTime !== null || slaPercent !== null || utilization !== null || delayPercent !== null) {
        kpiHTML = '<div class="kpi-grid">';

        if (totalRequests !== null) {
            kpiHTML += `
        <div class="kpi-card">
            <img src="../images/KPI1.jpg" class="kpi-icon" alt="Total Requests">
            <div class="kpi-label">Total Requests</div>
            <div class="kpi-value">${totalRequests}</div>
            <div class="kpi-sub">vs yesterday</div>
        </div>
    `;
        }

        if (avgTime !== null) {
            kpiHTML += `
        <div class="kpi-card">
            <img src="../images/KPI2.jpg" class="kpi-icon" alt="Avg Time">
            <div class="kpi-label">Avg Completion</div>
            <div class="kpi-value">${avgTime} min</div>
            <div class="kpi-sub">Below target</div>
        </div>
    `;
        }

        if (slaPercent !== null) {
            kpiHTML += `
        <div class="kpi-card">
            <img src="../images/KPI3.jpg" class="kpi-icon" alt="SLA">
            <div class="kpi-label">SLA %</div>
            <div class="kpi-value">${slaPercent}%</div>
            <div class="kpi-sub">On target</div>
        </div>
    `;
        }

        if (utilization !== null) {
            kpiHTML += `
        <div class="kpi-card">
            <img src="../images/KPI4.jpg" class="kpi-icon" alt="Utilization">
            <div class="kpi-label">Utilization</div>
            <div class="kpi-value">${utilization}%</div>
            <div class="kpi-sub">Resource usage</div>
        </div>
    `;
        }

        if (delayPercent !== null) {
            kpiHTML += `
        <div class="kpi-card">
            <img src="../images/KPI5.jpg" class="kpi-icon" alt="Delay">
            <div class="kpi-label">Delay %</div>
            <div class="kpi-value">${delayPercent}%</div>
            <div class="kpi-sub">Improved</div>
        </div>
    `;
        }

        kpiHTML += '</div>';
    }

    var dashboardHTML = `
        <div class="executive-dashboard">
            <style>
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 300;
                    src: url('../webfonts/Inter-Light.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 400;
                    src: url('../webfonts/Inter-Regular.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 500;
                    src: url('../webfonts/Inter-Medium.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 600;
                    src: url('../webfonts/Inter-SemiBold.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 700;
                    src: url('../webfonts/Inter-Bold.woff2') format('woff2');
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                
                .executive-dashboard {
                    padding: 20px;
                    background: ${COLORS.background.main};
                    min-height: 100vh;
                    font-size: 14px;
                }
                
                /* KPI Grid */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }
                
                .kpi-card {
                    background: ${COLORS.background.card};
                    border-radius: 20px;
                    padding: 18px 14px;
                    border: 1.5px solid ${COLORS.background.border};
                    transition: all 0.2s ease;
                    height: 200px;
                    display: flex;
                    flex-direction: column;
                }
                
                .kpi-card:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                }
                
                .kpi-icon {
                    width: 52px;
                    height: 52px;
                    margin-bottom: 12px;
                    display: block;
                    object-fit: contain;
                    border-radius: 16px;
                }
                
                .kpi-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: ${COLORS.text.secondary};
                    margin-bottom: 6px;
                }
                
                .kpi-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: ${COLORS.text.primary};
                    line-height: 1.2;
                    margin-bottom: 4px;
                }
                
                .kpi-sub {
                    font-size: 13px;
                    font-weight: 400;
                    color: ${COLORS.text.light};
                }
                
                .dashboard-card {
                    background: ${COLORS.background.card};
                    border-radius: 24px;
                    padding: 18px;
                    border: 1.5px solid ${COLORS.background.border};
                    transition: all 0.2s ease;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .row-top-charts .dashboard-card {
                    height: 380px;
                }
                
                .row-middle .dashboard-card {
                    height: 420px;
                }
                
                .row-bottom .dashboard-card {
                    height: 494px;
                }
                
                .dashboard-card:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                }
                
                .card-header {
                    margin-bottom: 12px;
                }
                
                .card-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: ${COLORS.text.primary};
                    margin: 0 0 4px 0;
                }
                
                .card-subtitle {
                    font-size: 14px;
                    font-weight: 400;
                    color: ${COLORS.text.light};
                }
                
                .card-content {
                    flex: 1;
                    min-height: 0;
                    width: 100%;
                }
                
                #taskVolumeChart, #workloadPieChart, #bottleneckChart, #slaChart {
                    width: 100%;
                    height: 100%;
                }
                
                .row-top-charts {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                
                .row-middle {
                    margin-bottom: 16px;
                }
                
                .row-bottom {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .apexcharts-tooltip {
                    background: #000000 !important;
                    border: 1px solid #333333 !important;
                    border-radius: 8px !important;
                    color: white !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8) !important;
                    padding: 6px 10px !important;
                }
                
                .apexcharts-tooltip-title {
                    background: #111111 !important;
                    border-bottom: 1px solid #333333 !important;
                    color: #CCCCCC !important;
                    font-size: 12px !important;
                    font-weight: 500 !important;
                    padding: 4px 8px !important;
                    margin: -6px -10px 4px -10px !important;
                    border-radius: 8px 8px 0 0 !important;
                }
                
                .apexcharts-tooltip-series-group {
                    padding: 3px 0 !important;
                }
                
                .apexcharts-tooltip-marker {
                    width: 10px !important;
                    height: 10px !important;
                    border-radius: 3px !important;
                    margin-right: 6px !important;
                }
                
                .apexcharts-tooltip-text {
                    color: #FFFFFF !important;
                    font-size: 12px !important;
                }
                
                #taskVolumeChart .apexcharts-area-series .apexcharts-series path {
                    filter: drop-shadow(0 0 8px ${COLORS.primary}) drop-shadow(0 0 4px ${COLORS.primary});
                }
                
                #taskVolumeChart .apexcharts-area-series .apexcharts-series .apexcharts-marker {
                    filter: drop-shadow(0 0 8px ${COLORS.primary}) drop-shadow(0 0 4px ${COLORS.primary});
                }
                
                #workloadPieChart .apexcharts-pie-area {
                    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)) !important;
                }
                
                #bottleneckChart .apexcharts-bar-area {
                    filter: drop-shadow(0 0 8px #f59e0b) drop-shadow(0 0 4px #f59e0b);
                }
                
                #slaChart .apexcharts-bar-area {
                    filter: drop-shadow(0 0 8px #ef4444) drop-shadow(0 0 4px #ef4444);
                }
                
                .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-width: 1.5px !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                .apexcharts-grid-borders line {
                    stroke: rgba(255, 255, 255, 0.15) !important;
                    stroke-width: 1.5px !important;
                }
                
                .heatmap-container {
                    width: 100%;
                    height: calc(100% - 45px);
                    overflow-x: auto;
                    overflow-y: hidden;
                }
                
                .heatmap-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .heatmap-table th {
                    color: ${COLORS.text.light};
                    font-size: 11px;
                    font-weight: 500;
                    padding: 4px 2px;
                    text-align: center;
                }
                
                .heatmap-table td {
                    padding: 2px;
                }
                
                .heatmap-cell {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    transition: transform 0.15s ease;
                }
                
                .heatmap-cell:hover {
                    transform: scale(1.15);
                    filter: brightness(1.2);
                }
                
                .day-label {
                    color: ${COLORS.text.primary};
                    font-size: 13px;
                    font-weight: 500;
                    padding-right: 8px;
                }
                
                .heatmap-legend {
                    display: flex;
                    justify-content: flex-end;
                    gap: 18px;
                    margin-top: 12px;
                    padding-top: 10px;
                    border-top: 1.5px solid ${COLORS.background.border};
                    background: transparent;
                    height: 35px;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: ${COLORS.text.light};
                    font-size: 12px;
                    background: transparent;
                }
                
                .legend-color {
                    width: 18px;
                    height: 18px;
                    border-radius: 5px;
                }
                
                .no-data-message {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    color: ${COLORS.text.light};
                    font-size: 14px;
                    text-align: center;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 16px;
                    padding: 20px;
                }
            </style>

            ${kpiHTML}

            <div class="row-top-charts">
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-title">Task Volume Trend</div>
                        <div class="card-subtitle">Last 7 days</div>
                    </div>
                    <div class="card-content">
                        ${trendData && trendData.length > 0 ? '<div id="taskVolumeChart"></div>' : '<div class="no-data-message">No trend data available</div>'}
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-title">Department Workload</div>
                        <div class="card-subtitle">Distribution by department</div>
                    </div>
                    <div class="card-content">
                        <div id="workloadPieChart"></div>
                    </div>
                </div>
            </div>

            <div class="row-middle">
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-title">Peak Hours Heatmap</div>
                        <div class="card-subtitle">Request density by day and hour</div>
                    </div>
                    <div class="card-content">
                        ${heatmapHTML}
                    </div>
                </div>
            </div>

            <div class="row-bottom">
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-title">Bottleneck Departments</div>
                        <div class="card-subtitle">Avg delay in Task Assignment</div>
                    </div>
                    <div class="card-content">
                        <div id="bottleneckChart"></div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-title">SLA Violations</div>
                        <div class="card-subtitle">By department & SLA Breached - View details in the Task Dashboard → ‘SLA Violations’ tab.</div>
                    </div>
                    <div class="card-content">
                        ${slaData && slaData.length > 0 ? '<div id="slaChart"></div>' : '<div class="no-data-message">No SLA data available</div>'}
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#EscalationChart').html(dashboardHTML);

    setTimeout(function () {
        if (typeof ApexCharts !== 'undefined') {
            if (trendData && trendData.length > 0) {
                renderTaskVolumeChartApex(trendCategories, trendValues, COLORS);
            }
                renderHollowPieChartApex('workloadPieChart', workloadPieData, COLORS);

                renderHollowBarChartApexs('bottleneckChart', bottleneckItems, 'bottleneck', COLORS);

            if (slaData && slaData.length > 0) {
                renderHollowBarChartApexs('slaChart', slaItems, 'sla', COLORS);
            }
        }
        $('#workloadPieChart title').remove();
        $('#bottleneckChart title').remove();
        $('#slaChart title').remove();
    }, 100);
}

function renderTaskVolumeChartApex(categories, values, COLORS) {
    var options = {
        chart: {
            type: 'area',
            height: '100%',
            width: '100%',        // TYPE THIS
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            zoom: { enabled: false },     // TYPE THIS
            panning: { enabled: false },  // TYPE THIS
        },
        colors: [COLORS.primary],
        series: [{ name: 'Tasks', data: values }],
        dataLabels: {
            enabled: true,
            offsetY: -15,
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: { curve: 'smooth', width: 3, colors: [COLORS.primary] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.1,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        markers: {
            size: 5,
            colors: [COLORS.primary],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: { size: 7 }
        },
        tooltip: {
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            x: { show: true },    // MAKE SURE THIS LINE IS THERE
            y: { formatter: (val) => val + ' tasks' }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                }
            }
        },
        legend: { show: false }
    };

    setTimeout(function () {

        $('#taskVolumeChart title').remove();

    }, 300);
    var chart = new ApexCharts(document.querySelector("#taskVolumeChart"), options);
    chart.render();

}

function renderHollowPieChartApex(containerId, data, COLORS) {

    var container = document.getElementById(containerId);
    if (!container) {
        console.warn('Container not found:', containerId);
        return;
    }

    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div style="color: white; text-align: center; padding: 50px; font-family: Inter, sans-serif;">No Workload Data</div>';
        return;
    }

    var formattedData = data.map(item => ({
        name: item.NAME || item.name || 'Unknown',
        value: parseFloat(item.ACTIVE_TASKS) || parseFloat(item.value) || 0,
        percentage: parseFloat(item.WORKLOAD_PERCENTAGE) || parseFloat(item.percentage) || 0
    }));

    formattedData = formattedData.filter(item => item.value > 0);

    var total = formattedData.reduce((sum, item) => sum + item.value, 0);

    if (formattedData.length === 0) {
        container.innerHTML = '<div style="color: white; text-align: center; padding: 50px; font-family: Inter, sans-serif;">No Workload Data</div>';
        return;
    }

    var options = {
        chart: {
            type: 'donut',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent'
        },
        colors: COLORS.chartColors,
        series: formattedData.map(item => item.value),
        labels: formattedData.map(item => item.name),
        legend: { show: false },
        dataLabels: {
            enabled: true,
            formatter: function (val, { seriesIndex, w }) {
                var percentage = formattedData[seriesIndex].percentage.toFixed(1);
                return percentage + '%';
            },
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: { enabled: false }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            y: {
                formatter: function (val, { seriesIndex, dataPointIndex, w }) {
                    var item = formattedData[seriesIndex];
                    return item.value + ' (' + item.percentage.toFixed(1) + '%)';
                }
            }
        },
        stroke: {
            show: true,
            width: 3.5,
            colors: COLORS.chartColors
        },
        fill: { opacity: 0 },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '70%',
                    labels: { show: false }
                }
            }
        }
    };

    try {
        var chart = new ApexCharts(container, options);
        chart.render();

        setTimeout(function () {
            var styleId = containerId + '-glow-style';
            if (!document.getElementById(styleId)) {
                var style = document.createElement('style');
                style.id = styleId;
                style.innerHTML = `
                    #${containerId} .apexcharts-pie-area {
                        filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)) !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }, 300);
    } catch (e) {
        console.error('Error rendering pie chart:', e);
        container.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Error loading chart</div>';
    }
}
function renderHollowBarChartApexs(containerId, items, type, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    //if (!items || items.length === 0) {
    //    container.innerHTML = '<div style="color: white; text-align: center; padding: 20px;">No data</div>';
    //    return;
    //}

    var categories = items.map(item => item.NAME);
    var values = items.map(item => type === 'bottleneck' ? item.AVG_TIME : item.VIOLATION_COUNT);
    var barColor = type === 'bottleneck' ? '#f59e0b' : '#ef4444';

    var maxValue = Math.max(...values);
    maxValue = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10;

    if (type === 'bottleneck' && maxValue < 100) {
        maxValue = 100;
    }

    if (type === 'sla' && maxValue < 10) {
        maxValue = 10;
    }

    var colors = Array(items.length).fill(barColor);

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: colors,
        series: [{
            name: type === 'bottleneck' ? 'Delay (min)' : 'Violations',
            data: values
        }],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '70%',
                borderRadius: 4,
                dataLabels: {
                    position: 'center'
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => val,
            offsetX: 0,
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 2,
                color: '#000',
                opacity: 0.5
            }
        },
        stroke: {
            show: true,
            width: 3,
            colors: colors,
            lineCap: 'round'
        },
        fill: {
            opacity: 0 
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => type === 'bottleneck' ? val + ' minutes' : val + ' violations'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.primary,
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        yaxis: {
            max: maxValue,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
}
function buildPeakHoursHeatmap(peakData, COLORS) {

    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var hours = [];
    for (var i = 0; i < 24; i++) {
        hours.push(i.toString().padStart(2, '0'));
    }

    var intensities = [
        '#0A2472', '#2A4A9E', '#4A7AC7', '#8AB0E8', '#FFFFFF'
    ];

    var dataMap = {};
    var maxCount = 0;

    if (peakData && peakData.length > 0) {
        peakData.forEach(item => {
            var key = item.DAY_NAME + '_' + item.HOUR_OF_DAY;
            dataMap[key] = item.REQUEST_COUNT;
            if (item.REQUEST_COUNT > maxCount) {
                maxCount = item.REQUEST_COUNT;
            }
        });
    }


    for (var key in dataMap) {
        if (dataMap[key] > 0) {
        //    console.log(key + " = " + dataMap[key]);
        }
    }

    maxCount = maxCount > 0 ? maxCount : 1;

    var html = '<div class="heatmap-container">';
    html += '<table class="heatmap-table">';

    html += '<thead><tr>';
    html += '<th class="day-label">Day/Time</th>';
    hours.forEach(h => html += '<th>' + h + '</th>');
    html += '</tr></thead><tbody>';

    days.forEach((day) => {
        html += '<tr>';
        html += '<td class="day-label">' + day + '</td>';

        hours.forEach((hour, hourIndex) => {
            var key = day + '_' + hourIndex;
            var count = dataMap[key] || 0;

            var percentage = (count / maxCount) * 100;

            var color;
            var logMessage = '';

            if (count === 0) {
                color = intensities[0];
            } else if (percentage >= 80) {
                color = intensities[4];
                logMessage = day + ' ' + hour + ':00 - ' + count + ' requests (' + percentage.toFixed(1) + '%) - WHITE';
            } else if (percentage >= 60) {
                color = intensities[3];
                logMessage = day + ' ' + hour + ':00 - ' + count + ' requests (' + percentage.toFixed(1) + '%) - LIGHT BLUE';
            } else if (percentage >= 40) {
                color = intensities[2];
                logMessage = day + ' ' + hour + ':00 - ' + count + ' requests (' + percentage.toFixed(1) + '%) - MEDIUM BLUE';
            } else if (percentage >= 20) {
                color = intensities[1];
                logMessage = day + ' ' + hour + ':00 - ' + count + ' requests (' + percentage.toFixed(1) + '%) - MEDIUM DARK BLUE';
            } else {
                color = intensities[0];
                if (count > 0) {
                    logMessage = day + ' ' + hour + ':00 - ' + count + ' requests (' + percentage.toFixed(1) + '%) - DARK BLUE';
                }
            }


            var tooltip = count + ' requests (' + percentage.toFixed(1) + '% of peak)';

            html += '<td>';
            html += '<div class="heatmap-cell" style="background: ' + color + ';" ';
            html += 'title="' + day + ' ' + hour + ':00 - ' + tooltip + '"></div>';
            html += '</td>';
        });

        html += '</tr>';
    });

    html += '</tbody></table></div>';
    html += '<div class="heatmap-legend">';
    html += '<div class="legend-item"><span class="legend-color" style="background: ' + intensities[0] + ';"></span> Low (0-20%)</div>';
    html += '<div class="legend-item"><span class="legend-color" style="background: ' + intensities[1] + ';"></span> Medium-Low (20-40%)</div>';
    html += '<div class="legend-item"><span class="legend-color" style="background: ' + intensities[2] + ';"></span> Medium (40-60%)</div>';
    html += '<div class="legend-item"><span class="legend-color" style="background: ' + intensities[3] + ';"></span> High (60-80%)</div>';
    html += '<div class="legend-item"><span class="legend-color" style="background: ' + intensities[4] + ';"></span> Very High (80-100%)</div>';
    html += '</div>';

    return html;
}


function loadDepartmentCommandCenter() {
    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = '';
    var departmentIds = '';
    var FilterQuery = '';
    var ServiceCode = sessionStorage.getItem('ServiceCode') || '1';

    $('.loaderElement').css("display", "inline-block");

    $('#EscalationChart').html(`
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:600px; background:linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%); border-radius:24px; border:1px solid rgba(255,255,255,0.12);">
        <div style="background:rgba(255, 255, 255, 0.08); padding:40px; border-radius:30px; backdrop-filter:blur(8px); border:1.5px solid rgba(255,255,255,0.12); box-shadow:0 20px 35px -5px rgba(0,0,0,0.3);">
            <div style="position:relative; width:70px; height:70px; margin:0 auto;">
                <div style="position:absolute; top:0; left:0; right:0; bottom:0; border:3px solid rgba(255,255,255,0.15); border-top:3px solid #b794f4; border-radius:50%; animation:spin 1s linear infinite; box-shadow:0 0 15px rgba(183, 148, 244, 0.3);"></div>
                <div style="position:absolute; top:5px; left:5px; right:5px; bottom:5px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #9f7aea; border-radius:50%; animation:spin 1.5s linear infinite reverse;"></div>
            </div>
            <p style="margin-top:25px; color:#ffffff; font-size:18px; font-weight:600; letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.2);">Loading Command Center Dashboard...</p>
            <p style="margin-top:8px; color:rgba(255,255,255,0.6); font-size:14px; font-weight:400;">Real-time performance metrics</p>
        </div>
    </div>
    <style>
        @keyframes spin { 
            0% { transform:rotate(0deg); } 
            100% { transform:rotate(360deg); } 
        }
    </style>
`);

    $.when(
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("LIVE_STATUS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("DEPARTMENT_RISK")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("AVG_WAIT_TREND")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("PRIORITY_TASKS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        })
    ).then(function (liveStatus, deptRisk, waitTrend, priorityTasks) {

        renderCommandCenterDashboard(
            liveStatus[0], deptRisk[0], waitTrend[0], priorityTasks[0]
        );
        setTimeout(function () {
            $('.loaderElement').css("display", "none");
        }, 500);
    }).fail(function (xhr, status, error) {
        renderCommandCenterDashboard(
            [{ ACTIVE_COUNT: 0, WAITING_COUNT: 0, RISK_COUNT: 0 }],
            [],
            [],
            []
        );
        $('.loaderElement').css("display", "none");
    });
}

function renderCommandCenterDashboard(liveData, deptRiskData, waitTrendData, priorityData) {
    const COLORS = {
        primary: "#3a5be0",
        secondary: "#6a0dad",
        tertiary: "#e01e6a",
        quaternary: "#3ab5e0",
        warning: "#e05a2e",
        success: "#05b58c",
        text: {
            primary: "#ffffff",
            secondary: "#e0e0e0",
            light: "#c0c0c0"
        },
        background: {
            main: "linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%)",
            card: "rgba(255, 255, 255, 0.08)",
            border: "rgba(255, 255, 255, 0.12)"
        },
        liveColors: ["#3A5BE0", "#7209b7", "#f72585", "#10b981", "#6c757d"], 
        alertHighColor: "#ef4444",
        waitTimeColor: "#10b981",
        priorityColor: "#8B5CF6"
    };

    var pendingCount = 0, assignedCount = 0, inprogressCount = 0, completedCount = 0, onholdCount = 0;

    if (liveData && liveData.length > 0 && liveData[0]) {
        pendingCount = !isNaN(parseInt(liveData[0]?.PENDING_COUNT)) ? parseInt(liveData[0]?.PENDING_COUNT) : 0;
        assignedCount = !isNaN(parseInt(liveData[0]?.ASSIGNED_COUNT)) ? parseInt(liveData[0]?.ASSIGNED_COUNT) : 0;
        inprogressCount = !isNaN(parseInt(liveData[0]?.INPROGRESS_COUNT)) ? parseInt(liveData[0]?.INPROGRESS_COUNT) : 0;
        completedCount = !isNaN(parseInt(liveData[0]?.COMPLETED_COUNT)) ? parseInt(liveData[0]?.COMPLETED_COUNT) : 0;
        onholdCount = !isNaN(parseInt(liveData[0]?.ONHOLD_COUNT)) ? parseInt(liveData[0]?.ONHOLD_COUNT) : 0;
    }

    var liveCategories = ['Pending', 'Assigned', 'In-Progress', 'Completed', 'On-Hold'];
    var liveValues = [pendingCount, assignedCount, inprogressCount, completedCount, onholdCount];

    var maxLiveValue = Math.max(pendingCount, assignedCount, inprogressCount, completedCount, onholdCount, 1);
    var yAxisMaxLive = Math.ceil(maxLiveValue * 1.2);

    var alertCategories = [];
    var alertValues = [];
    var alertColors = [];
    function wrapLabel(text, maxLength = 12) {
        if (!text) return '';

        var words = text.split(' ');
        var lines = [];
        var currentLine = '';

        words.forEach(word => {
            if ((currentLine + ' ' + word).trim().length > maxLength) {
                if (currentLine) lines.push(currentLine.trim());
                currentLine = word;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
            }
        });

        if (currentLine) lines.push(currentLine.trim());

        return lines.join('\n');
    }

    if (deptRiskData && deptRiskData.length > 0) {
        deptRiskData.forEach(item => {
            var deptName = item.DEPARTMENT_NAME || 'Unknown';
            deptName = wrapLabel(deptName, 12);
            var atRiskCount = !isNaN(parseInt(item.AT_RISK_COUNT)) ? parseInt(item.AT_RISK_COUNT) : 0;

            alertCategories.push(deptName);
            alertValues.push(atRiskCount);
            alertColors.push(COLORS.alertHighColor);
        });
    }

    var maxAlertValue = alertValues.length > 0 ? Math.max(...alertValues, 1) : 1;
    var xAxisMaxAlert = Math.ceil(maxAlertValue * 1.5);

    var waitCategories = [];
    var waitValues = [];

    if (waitTrendData && waitTrendData.length > 0) {
        var dayOrder = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };

        var validWaitData = waitTrendData.filter(item => item && item.LABEL);

        validWaitData.sort((a, b) => {
            var dayA = a.LABEL?.substring(0, 3) || '';
            var dayB = b.LABEL?.substring(0, 3) || '';
            return (dayOrder[dayA] || 0) - (dayOrder[dayB] || 0);
        });

        waitCategories = validWaitData.map(item => item.LABEL?.substring(0, 3) || 'Unknown');
        waitValues = validWaitData.map(item => {
            var val = parseFloat(item?.AVG_WAIT_TIME);
            return !isNaN(val) ? Math.round(val) : 0;
        });
    }

    var priorityT1 = 0, priorityT2 = 0, priorityT3 = 0, priorityT4 = 0;

    if (priorityData && priorityData.length > 0) {
        priorityData.forEach(item => {
            if (item && item.PRIORITY_LEVEL) {
                var taskCount = !isNaN(parseInt(item?.TASK_COUNT)) ? parseInt(item?.TASK_COUNT) : 0;

                if (item.PRIORITY_LEVEL.includes('T1')) {
                    priorityT1 = taskCount;
                } else if (item.PRIORITY_LEVEL.includes('T2')) {
                    priorityT2 = taskCount;
                } else if (item.PRIORITY_LEVEL.includes('T3')) {
                    priorityT3 = taskCount;
                } else if (item.PRIORITY_LEVEL.includes('T4')) {
                    priorityT4 = taskCount;
                }
            }
        });
    }

    var priorityCategories = ['T1', 'T2', 'T3', 'T4'];
    var priorityValues = [priorityT1, priorityT2, priorityT3, priorityT4];
    var maxPriorityValue = Math.max(priorityT1, priorityT2, priorityT3, priorityT4, 1);
    var yAxisMaxPriority = Math.ceil(maxPriorityValue * 1.2);

    var dashboardHTML = `
        <div class="command-center-dashboard">
            <style>
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 300;
                    src: url('../webfonts/Inter-Light.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 400;
                    src: url('../webfonts/Inter-Regular.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 500;
                    src: url('../webfonts/Inter-Medium.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 600;
                    src: url('../webfonts/Inter-SemiBold.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 700;
                    src: url('../webfonts/Inter-Bold.woff2') format('woff2');
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                
                .command-center-dashboard {
                    padding: 30px;
                    background: ${COLORS.background.main};
                    min-height: 100vh;
                }
                
                /* Dashboard Title */
                .dashboard-main-title {
                    font-size: 26px;
                    font-weight: 600;
                    color: ${COLORS.text.primary};
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }
                
                .dashboard-subtitle {
                    font-size: 15px;
                    color: ${COLORS.text.light};
                    margin-bottom: 30px;
                }
                
                /* 2x2 Grid Layout */
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                }
                
                /* Dashboard Cards */
                .dashboard-card {
                    background: ${COLORS.background.card};
                    border-radius: 28px;
                    padding: 24px;
                    border: 1.5px solid ${COLORS.background.border};
                    transition: all 0.2s ease;
                    height: 380px;
                    display: flex;
                    flex-direction: column;
                }
                
                .dashboard-card:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                }
                
                .card-header {
                    margin-bottom: 15px;
                }
                
                .card-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: ${COLORS.text.primary};
                    margin: 0 0 4px 0;
                }
                
                .card-subtitle {
                    font-size: 15px;
                    font-weight: 400;
                    color: ${COLORS.text.light};
                }
                
                .card-content {
                    flex: 1;
                    min-height: 0;
                    width: 100%;
                    position: relative;
                }
                
                /* Chart Containers */
                #liveStatusChart, #alertChart, #waitTimeChart, #priorityChart {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                
                /* SMOOTH TOOLTIP STYLES */
                .apexcharts-tooltip {
                    background: rgba(20, 20, 30, 0.95) !important;
                    backdrop-filter: blur(8px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 12px !important;
                    color: white !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
                    padding: 10px 14px !important;
                    transition: all 0.2s ease !important;
                }
                
                .apexcharts-tooltip-title {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #e0e0e0 !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    padding: 6px 10px !important;
                    margin: -10px -14px 8px -14px !important;
                    border-radius: 12px 12px 0 0 !important;
                }
                
                .apexcharts-tooltip-series-group {
                    padding: 6px 0 !important;
                    display: flex !important;
                    align-items: center !important;
                }
                
                .apexcharts-tooltip-marker {
                    width: 12px !important;
                    height: 12px !important;
                    border-radius: 4px !important;
                    margin-right: 10px !important;
                }
                
                .apexcharts-tooltip-text {
                    font-size: 13px !important;
                    font-weight: 500 !important;
                }
                
                .apexcharts-tooltip-text-y-value {
                    font-weight: 700 !important;
                    color: white !important;
                    margin-left: 6px !important;
                }
                
                /* Grid lines */
                .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-width: 1.5px !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                .apexcharts-grid-borders line {
                    stroke: rgba(255, 255, 255, 0.15) !important;
                    stroke-width: 1.5px !important;
                }
            </style>

            <!-- 2x2 Grid -->
            <div class="dashboard-grid">
                <!-- Card 1: Live Status - Vertical Bars with new status categories -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-title">Live Status</div>
                        <div class="card-subtitle">Current task distribution</div>
                    </div>
                    <div class="card-content">
                        <div id="liveStatusChart"></div>
                    </div>
                </div>

                <!-- Card 2: Active Alerts - By severity level -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-title">Active Alerts</div>
                        <div class="card-subtitle">By severity level -  View details in the Task Dashboard → ‘Active Alerts’ tab.</div>

                    </div>
                    <div class="card-content">
                        <div id="alertChart"></div>
                    </div>
                </div>

                <!-- Card 3: Average Wait Time - AREA CHART -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-title">Average Wait Time (min)</div>
                        <div class="card-subtitle">Trend over the week</div>
                    </div>
                    <div class="card-content">
                        <div id="waitTimeChart"></div>
                    </div>
                </div>

                <!-- Card 4: Priority Tasks - VIOLET Vertical Bars -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-title">Priority Tasks</div>
                        <div class="card-subtitle">By priority level</div>
                    </div>
                    <div class="card-content">
                        <div id="priorityChart"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#EscalationChart').html(dashboardHTML);

    setTimeout(function () {
        if (typeof ApexCharts !== 'undefined') {

            if (document.getElementById('liveStatusChart')) {
                renderHollowBarChartDP('liveStatusChart', liveCategories, liveValues, COLORS.liveColors, 'Tasks', COLORS, 0, yAxisMaxLive, false);
            }

            if (document.getElementById('alertChart') && alertCategories.length > 0) {
                renderHollowBarChartDP('alertChart', alertCategories, alertValues, alertColors, 'Alerts', COLORS, 0, xAxisMaxAlert, false);
            }

            if (document.getElementById('waitTimeChart')) {
                renderAreaChart('waitTimeChart', waitCategories, waitValues, COLORS.waitTimeColor, COLORS);
            }

            if (document.getElementById('priorityChart')) {
                renderHollowBarChartDP('priorityChart', priorityCategories, priorityValues, [COLORS.priorityColor], 'Tasks', COLORS, 0, yAxisMaxPriority, false);
            }
        }
    }, 800);
}

function renderHollowBarChartDP(containerId, categories, values, colors, yAxisLabel, COLORS, minY = 0, maxY = null, isHorizontal = false) {
    var container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    var safeValues = values.map(v => !isNaN(parseInt(v)) ? parseInt(v) : 0);
    var yAxisMax = maxY || Math.ceil(Math.max(...safeValues, 1) * 1.2);

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            parentHeightOffset: 0,  
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 10,
                color: colors.length === 1 ? colors[0] : '#ffffff',
                opacity: 0.6
            }
        },
        colors: colors,
        series: [{
            name: yAxisLabel,
            data: safeValues
        }],
        plotOptions: {
            bar: {
                horizontal: isHorizontal, 
                columnWidth: isHorizontal ? '70%' : '55%',
                barHeight: isHorizontal ? '70%' : undefined,
                borderRadius: 4,
                dataLabels: {
                    position: isHorizontal ? 'center' : 'center'
                }
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: 0,
            offsetX: 0,
            formatter: (val) => {
                var numVal = !isNaN(parseInt(val)) ? parseInt(val) : 0;
                return numVal;
            },
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            show: true,
            width: 3,
            colors: colors,
            lineCap: 'round'
        },
        fill: {
            opacity: 0
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => {
                    var numVal = !isNaN(parseInt(val)) ? parseInt(val) : 0;
                    if (yAxisLabel === 'Alerts') {
                        return numVal + ' alert' + (numVal !== 1 ? 's' : '');
                    } else {
                        return numVal + ' task' + (numVal !== 1 ? 's' : '');
                    }
                }
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            padding: {
                bottom: 5  
            },
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                formatter: function (val) {

                    return val.split('\n');
                },
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                },
                rotate: 0,
                trim: false,
                maxHeight: 120  
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            min: minY,
            max: yAxisMax,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                },
                formatter: (val) => {
                    var numVal = !isNaN(parseInt(val)) ? parseInt(val) : 0;
                    return numVal;
                }
            }
        },
        legend: { show: false }
    };

    try {
        var chart = new ApexCharts(container, options);
        chart.render();
    } catch (e) {
        console.error('Error rendering chart:', containerId, e);
    }
}

function renderAreaChart(containerId, categories, values, color, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    var safeValues = values.map(v => !isNaN(parseInt(v)) ? parseInt(v) : 0);
    var maxValue = Math.max(...safeValues, 1);
    var yAxisMax = Math.ceil(maxValue * 1.2);

    var options = {
        chart: {
            type: 'area',
            height: '100%',
            width: '100%',        // TYPE THIS
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            zoom: { enabled: false },     // TYPE THIS
            panning: { enabled: false },  // TYPE THIS
            dropShadow: { enabled: true, top: 0, left: 0, blur: 10, color: color, opacity: 0.6 }
        },
        colors: [color],
        series: [{
            name: 'Minutes',
            data: safeValues
        }],
        dataLabels: {
            enabled: true,
            offsetY: -15,
            formatter: (val) => {
                var numVal = !isNaN(parseInt(val)) ? parseInt(val) : 0;
                return numVal;
            },
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: { curve: 'smooth', width: 3, colors: [color] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0, 
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        markers: {
            size: 6,
            colors: [color],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: { size: 8 }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' },
            x: { show: true },
            y: { formatter: (val) => !isNaN(parseInt(val)) ? parseInt(val) + ' min' : '0 min' }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: { style: { colors: COLORS.text.secondary, fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 500 } },
            hideOverlappingLabels: true,    // TYPE THIS
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            min: 0,
            max: yAxisMax,
            tickAmount: 5,
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 500 },
                formatter: (val) => !isNaN(parseInt(val)) ? parseInt(val) : 0
            }
        },
        legend: { show: false }
    };

    try {
        var chart = new ApexCharts(container, options);
        chart.render();
    } catch (e) {
        console.error('Error rendering area chart:', containerId, e);
    }
}

function loadWorkforceDashboard() {
    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = '';
    var departmentIds = '';
    var ServiceCode = sessionStorage.getItem('ServiceCode') || '1';

    $('.loaderElement').css("display", "inline-block");

    $('#EscalationChart').html(`
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:600px; background:linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%); border-radius:24px; border:1px solid rgba(255,255,255,0.12);">
        <div style="background:rgba(255, 255, 255, 0.08); padding:40px; border-radius:30px; backdrop-filter:blur(8px); border:1.5px solid rgba(255,255,255,0.12); box-shadow:0 20px 35px -5px rgba(0,0,0,0.3);">
            <div style="position:relative; width:70px; height:70px; margin:0 auto;">
                <div style="position:absolute; top:0; left:0; right:0; bottom:0; border:3px solid rgba(255,255,255,0.15); border-top:3px solid #b794f4; border-radius:50%; animation:spin 1s linear infinite; box-shadow:0 0 15px rgba(183, 148, 244, 0.3);"></div>
                <div style="position:absolute; top:5px; left:5px; right:5px; bottom:5px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #9f7aea; border-radius:50%; animation:spin 1.5s linear infinite reverse;"></div>
            </div>
            <p style="margin-top:25px; color:#ffffff; font-size:18px; font-weight:600; letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.2);">Loading Workforce Dashboard...</p>
            <p style="margin-top:8px; color:rgba(255,255,255,0.6); font-size:14px; font-weight:400;">Real-time performance metrics and analytics</p>
        </div>
    </div>
    <style>
        @keyframes spin { 
            0% { transform:rotate(0deg); } 
            100% { transform:rotate(360deg); } 
        }
    </style>
`);
    $.when(
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("PORTER_UTILIZATION")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("TASKS_PER_SHIFT")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("OVERTIME_HOURS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("STAFFING_MIX")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("PORTER_ENGAGEMENT")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("PORTER_ACTIVITY_HOURLY")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        })
    ).then(function (utilData, shiftData, overtimeData, staffingData, engagementData, activityData) {
    
        renderWorkforceDashboard(utilData[0], shiftData[0], overtimeData[0], staffingData[0], engagementData[0], activityData[0]);
        setTimeout(function () {
            $('.loaderElement').css("display", "none");
        }, 500);
    }).fail(function (xhr, status, error) {
        console.error("Workforce data load failed:", error);
        renderWorkforceDashboard([], [], [], [], [], []);
        $('.loaderElement').css("display", "none");
    });
}

function renderWorkforceDashboard(utilData, shiftData, overtimeData, staffingData, engagementData, activityData) {

    utilData = utilData || [];
    shiftData = shiftData || [];
    overtimeData = overtimeData || [];
    staffingData = staffingData || [];
    engagementData = engagementData || [];
    activityData = activityData || [];

    const COLORS = {
        primary: "#3a5be0",
        secondary: "#6a0dad",
        tertiary: "#e01e6a",
        quaternary: "#3ab5e0",
        warning: "#e05a2e",
        success: "#05b58c",
        text: {
            primary: "#ffffff",
            secondary: "#e0e0e0",
            light: "#c0c0c0"
        },
        background: {
            main: "linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%)",
            card: "rgba(255, 255, 255, 0.08)",
            border: "rgba(255, 255, 255, 0.12)"
        },
        porterColor: "#4cc9f0",
        shiftColor: "#f72585",
        overtimeColor: "#f59e0b",
        staffingColors: ["#f59e0b", "#4361ee", "#e01e6a"],
        engagementColor: "#10b981"
    };

    var allPorterData = [];
    if (utilData && utilData.length > 0) {
        allPorterData = [...utilData].map(item => ({
            name: item.PORTER_NAME || 'Unknown',
            value: item.UTILIZATION_PERCENT || 0
        }));
    }

    var avgUtil = allPorterData.length > 0
        ? (allPorterData.reduce((sum, item) => sum + item.value, 0) / allPorterData.length).toFixed(1)
        : 0;

    var timeSlotCategories = ['6AM - 9AM', '9AM - 12PM', '12PM - 3PM', '3PM - 6PM', '6PM - 9PM', '9PM - 12AM'];
    var timeSlotValues = [0, 0, 0, 0, 0, 0];

    if (shiftData && shiftData.length > 0) {
        shiftData.forEach(item => {
            var taskCount = item.TASK_COUNT || 0;
            var shiftName = item.SHIFT_NAME;

            if (shiftName === 'Morning Shift (6AM-2PM)') {

                timeSlotValues[0] = taskCount;
            }
            else if (shiftName === 'Evening Shift (2PM-10PM)') {

                timeSlotValues[3] = taskCount;
            }
            else if (shiftName === 'Night Shift (10PM-6AM)') {

                timeSlotValues[5] = taskCount;
            }
        });
    }

    var overtimeCategories = [];
    var overtimeValues = [];
    if (overtimeData && overtimeData.length > 0) {
        overtimeData.forEach((item) => {
            var fullName = item.DEPARTMENT_NAME || 'Unknown';

            var displayName = fullName;
            if (fullName.length > 15) {

                var words = fullName.split(' ');
                if (words.length > 1) {
                    var firstPart = words.slice(0, Math.ceil(words.length / 2)).join(' ');
                    var secondPart = words.slice(Math.ceil(words.length / 2)).join(' ');
                    displayName = firstPart + '\n' + secondPart;
                } else {
                    displayName = fullName.substring(0, 12) + '...';
                }
            }
            overtimeCategories.push(displayName);
            overtimeValues.push(item.OVERTIME_HOURS || 0);
        });
    }

    var staffingPieData = [];
    if (staffingData && staffingData.length > 0) {
        staffingData.forEach(item => {
            staffingPieData.push({
                name: item.PERFORMANCE_LEVEL,
                value: item.PORTER_COUNT || 0,
                percentage: item.PERCENTAGE || 0
            });
        });
    }

    var totalStaff = staffingPieData.reduce((sum, item) => sum + item.value, 0);

    var performanceColors = {
        'Over Performance': '#10b981',
        'Optimal Performance': '#f59e0b',
        'Under Performance': '#ef4444'
    };

    var departments = [];
    var departmentPorterMap = {};
    if (engagementData && engagementData.length > 0) {
        engagementData.forEach(item => {
            var dept = item.DEPARTMENT_NAME || 'Unknown';
            if (!departments.includes(dept)) departments.push(dept);
            if (!departmentPorterMap[dept]) departmentPorterMap[dept] = [];

            var porterName = item.PORTER_NAME || 'Unknown';
            if (porterName.length > 12) {
                porterName = porterName.substring(0, 10) + '...';
            }
            departmentPorterMap[dept].push({
                name: porterName,
                engagement: item.ENGAGEMENT_PERCENT || 0
            });
        });
    }

    var defaultDept = departments.length > 0 ? departments[0] : '';
    var engagementCategories = [];
    var engagementValues = [];
    if (defaultDept && departmentPorterMap[defaultDept]) {
        departmentPorterMap[defaultDept].forEach(porter => {
            engagementCategories.push(porter.name);
            engagementValues.push(porter.engagement);
        });
    }

    // Activity data
    var activityCategories = [];
    var activityValues = [];
    if (activityData && activityData.length > 0) {
        activityData.sort((a, b) => (a.ACTIVITY_HOUR || 0) - (b.ACTIVITY_HOUR || 0));
        activityData.forEach(item => {
            var hour = item.ACTIVITY_HOUR || 0;
            var hourLabel = hour.toString().padStart(2, '0') + ':00';
            activityCategories.push(hourLabel);
            activityValues.push(item.COMPLETION_PERCENT || 0);
        });
    }

    var deptFilterOptions = departments.map(dept =>
        `<option value="${dept}" ${dept === defaultDept ? 'selected' : ''}>${dept}</option>`
    ).join('');

    var departmentFilterHTML = departments.length > 0 ? `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <select id="deptFilter" onchange="filterEngagementByDepartment(this.value)" style="background: rgba(255,255,255,0.1); border: 1px solid ${COLORS.background.border}; border-radius: 20px; padding: 8px 15px; color: ${COLORS.text.primary}; font-size: 13px; outline: none; cursor: pointer;">
                ${deptFilterOptions}
            </select>
            <span style="color: ${COLORS.text.light}; font-size: 12px;">Filter by department</span>
        </div>
    ` : '';

    var porterFilterHTML = allPorterData.length > 0 ? `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
            <span style="color: ${COLORS.text.light}; font-size: 13px;">Show:</span>
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="porterFilter" value="top7" checked onchange="filterPorterUtilization('top7')" style="accent-color: ${COLORS.primary};">
                <span style="color: ${COLORS.text.primary};">Top 7</span>
            </label>
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="porterFilter" value="bottom7" onchange="filterPorterUtilization('bottom7')" style="accent-color: ${COLORS.primary};">
                <span style="color: ${COLORS.text.primary};">Bottom 7</span>
            </label>
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="porterFilter" value="avg" onchange="filterPorterUtilization('avg')" style="accent-color: ${COLORS.primary};">
                <span style="color: ${COLORS.text.primary};">Average (${avgUtil}%)</span>
            </label>
        </div>
    ` : '';

    var script = `
        <script>
            var allPorterData = ${JSON.stringify(allPorterData)};
            var avgUtil = ${avgUtil};
            var departmentPorterMap = ${JSON.stringify(departmentPorterMap)};
            
            function filterPorterUtilization(filterType) {
                if (!allPorterData.length) return;
                var categories = [], values = [];
                if (filterType === 'top7') {
                    var sorted = [...allPorterData].sort((a,b) => b.value - a.value);
                    var top7 = sorted.slice(0,7);
                    categories = top7.map(p => p.name);
                    values = top7.map(p => p.value);
                } else if (filterType === 'bottom7') {
                    var sorted = [...allPorterData].sort((a,b) => a.value - b.value);
                    var bottom7 = sorted.slice(0,7);
                    categories = bottom7.map(p => p.name);
                    values = bottom7.map(p => p.value);
                } else if (filterType === 'avg') {
                    var sorted = [...allPorterData].sort((a,b) => Math.abs(a.value - avgUtil) - Math.abs(b.value - avgUtil));
                    var avgPorters = sorted.slice(0,7);
                    categories = avgPorters.map(p => p.name);
                    values = avgPorters.map(p => p.value);
                }
    
                if (window.porterChart) {

                    window.porterChart.updateOptions({ 
                        xaxis: { categories: categories, labels: { rotate: -15, trim: true, maxHeight: 80 } } 
                    });
        
                    window.porterChart.updateSeries([{ data: values }]);
        
                    window.porterChart.updateOptions({
                        dataLabels: {
                            formatter: (val, { dataPointIndex }) => {
                                var newVal = values[dataPointIndex];
                                if (newVal === 0) return '0%';
                                return newVal + '%';
                            }
                        }
                    });
                }
            }
            
            function filterEngagementByDepartment(department) {
                if (!departmentPorterMap[department]) return;
                var categories = [], values = [];
                departmentPorterMap[department].forEach(porter => {
                    categories.push(porter.name);
                    values.push(porter.engagement);
                });
                if (window.engagementChart) {
                    window.engagementChart.updateOptions({ 
                        xaxis: { categories: categories, labels: { rotate: -45, trim: true, maxHeight: 100 } } 
                    });
                    window.engagementChart.updateSeries([{ data: values }]);
                }
            }
        </script>
    `;

    var dashboardHTML = `
        <div class="workforce-dashboard">
            <style>
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 300;
                    src: url('../webfonts/Inter-Light.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 400;
                    src: url('../webfonts/Inter-Regular.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 500;
                    src: url('../webfonts/Inter-Medium.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 600;
                    src: url('../webfonts/Inter-SemiBold.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 700;
                    src: url('../webfonts/Inter-Bold.woff2') format('woff2');
                }
                
                * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
                
                .workforce-dashboard {
                    padding: 30px;
                    background: ${COLORS.background.main};
                    min-height: 100vh;
                }
                
                .workforce-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 25px;
                }
                
                .workforce-card {
                    background: ${COLORS.background.card};
                    border-radius: 28px;
                    padding: 24px;
                    border: 1.5px solid ${COLORS.background.border};
                    transition: all 0.2s ease;
                    height: 500px;
                    display: flex;
                    flex-direction: column;
                }
                
                .engagement-card { height: 550px; }
                .overtime-card { min-height: 480px; height: auto; }
                .activity-card { height: 550px; }
                .staffing-card { height: 480px; }
                
                .workforce-card:hover {
                    background: rgba(255,255,255,0.15) !important;
                    border-color: rgba(255,255,255,0.2) !important;
                }
                
                .card-header { margin-bottom: 15px; }
                .card-title { font-size: 20px; font-weight: 600; color: ${COLORS.text.primary}; margin: 0 0 4px 0; }
                .card-subtitle { font-size: 15px; font-weight: 400; color: ${COLORS.text.light}; }
                .card-content { flex: 1; min-height: 0; width: 100%; overflow: visible; }
                
                #porterChart, #shiftChart, #overtimeChart, #staffingChart, #engagementChart, #activityChart {
                    width: 100%;
                    height: 100%;
                }
                
                .filter-section {
                    margin-bottom: 15px;
                    padding: 12px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 16px;
                }
                
                .staffing-legend {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1px;
                    margin-top: 65px;
                    margin-bottom: 0;
                    padding: 8px 8px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 16px;
                    width: 100%;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 10px;
                }

                .legend-color { width: 14px; height: 14px; border-radius: 3px; }
                .legend-text { color: ${COLORS.text.primary}; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .legend-value { margin-left: auto; color: ${COLORS.text.light}; font-size: 13px; white-space: nowrap; }

                /* Tooltip */
                .apexcharts-tooltip {
                    background: #1a1a2a !important;
                    border: 1px solid #333 !important;
                    border-radius: 10px !important;
                    color: white !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
                    padding: 10px 14px !important;
                    font-size: 13px !important;
                }
                .apexcharts-tooltip-title {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255,255,255,0.1) !important;
                    color: #ccc !important;
                    font-size: 13px !important;
                    padding: 6px 10px !important;
                }
                .apexcharts-tooltip-series-group { padding: 6px 0 !important; }
                .apexcharts-tooltip-marker { width: 12px; height: 12px; border-radius: 3px; margin-right: 8px; }
                
                .apexcharts-grid line {
                    stroke: rgba(255,255,255,0.1) !important;
                    stroke-width: 1.5px !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                select option { background: #2d2d3a; color: white; font-size: 13px; }
                
                /* Fix for long x-axis labels */
                .apexcharts-xaxis text {
                    white-space: pre-wrap !important;
                    word-break: break-word !important;
                }
            </style>
            ${script}

            <!-- Row 1 -->
            <div class="workforce-grid">
                <div class="workforce-card">
                    <div class="card-header">
                        <div class="card-title">Operative Utilization</div>
                        <div class="card-subtitle">Efficiency by operative</div>
                    </div>
                    ${porterFilterHTML}
                    <div class="card-content"><div id="porterChart"></div></div>
                </div>
                <div class="workforce-card">
                    <div class="card-header">
                        <div class="card-title">Tasks per Time Slot</div>
                        <div class="card-subtitle">Workload distribution</div>
                    </div>
                    <div class="card-content"><div id="shiftChart"></div></div>
                </div>
            </div>

            <!-- Row 2 -->
            <div class="workforce-grid">
                <div class="workforce-card overtime-card">
                    <div class="card-header">
                        <div class="card-title">Overtime Hours</div>
                        <div class="card-subtitle">By department</div>
                    </div>
                    <div class="card-content"><div id="overtimeChart"></div></div>
                </div>
                <div class="workforce-card staffing-card">
                    <div class="card-header">
                        <div class="card-title">Staffing Mix</div>
                        <div class="card-subtitle">Performance distribution</div>
                    </div>
                    <div class="card-content" style="display: flex; flex-direction: column;">
                        <div id="staffingChart" style="height: 180px;"></div>
                        <div class="staffing-legend">
                            ${staffingPieData.map(item => {
        let color = performanceColors[item.name] || '#8B5CF6';
        let percent = totalStaff > 0 ? ((item.value / totalStaff) * 100).toFixed(1) : '0';
        return `<div class="legend-item">
                                    <div class="legend-color" style="background:${color};"></div>
                                    <span class="legend-text" title="${item.name}">${item.name}</span>
                                    <span class="legend-value">${item.value} (${percent}%)</span>
                                </div>`;
    }).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Row 3 -->
            <div class="workforce-grid">
                <div class="workforce-card engagement-card">
                    <div class="card-header">
                        <div class="card-title">Operative Engagement</div>
                        <div class="card-subtitle">Active vs Idle</div>
                    </div>
                    ${departmentFilterHTML}
                    <div class="card-content"><div id="engagementChart"></div></div>
                </div>
                <div class="workforce-card activity-card">
                    <div class="card-header">
                        <div class="card-title">Hourly Activity</div>
                        <div class="card-subtitle">Peak hours</div>
                    </div>
                    <div class="card-content">
                        <div id="activityChart"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#EscalationChart').html(dashboardHTML);

    var initPorterCats = [];
    var initPorterVals = [];
    if (allPorterData.length > 0) {
        var initialPorter = [...allPorterData].sort((a, b) => b.value - a.value).slice(0, 7);
        initPorterCats = initialPorter.map(p => {
            var name = p.name;
            if (name.length > 15) name = name.substring(0, 12) + '...';
            return name;
        });
        initPorterVals = initialPorter.map(p => p.value);
    }

    setTimeout(() => {
        if (typeof ApexCharts !== 'undefined') {

            window.porterChart = renderVerticalBarChart('porterChart', initPorterCats, initPorterVals, COLORS.porterColor, '%', COLORS, true, -20, true);

                renderLineChart('shiftChart', timeSlotCategories, timeSlotValues, COLORS.shiftColor, COLORS, true);

                renderHorizontalBarChartWithWrappedLabels('overtimeChart', overtimeCategories, overtimeValues, COLORS.overtimeColor, COLORS);

                renderHollowPieChart('staffingChart', staffingPieData, performanceColors, totalStaff);

                window.engagementChart = renderEngagementChart('engagementChart', engagementCategories, engagementValues, COLORS.engagementColor, COLORS);

            if (activityCategories.length > 0) {
                renderActivityChart('activityChart', activityCategories, activityValues, COLORS);
            } else {
                renderActivityChart('activityChart', [], [], COLORS);
            }
        }
    }, 500);
}

function renderHorizontalBarChartWithWrappedLabels(containerId, categories, values, color, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!categories || categories.length === 0) {
        categories = ['No Data'];
        values = [0];
    }

    var hasPositiveValues = values.some(v => v > 0);
    var safeValues = values.map(v => v === 0 ? 0.1 : v);
    var originalValues = values;

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: hasPositiveValues, easing: 'easeinout', speed: 800 }
        },
        colors: [color],
        series: [{ name: 'Hours', data: safeValues }],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '70%',
                borderRadius: 4,
                dataLabels: { position: 'center' }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val, { dataPointIndex }) => {
                var originalVal = originalValues[dataPointIndex];
                return originalVal === 0 ? '0' : originalVal.toFixed(1);
            },
            offsetX: 0,
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            show: true,
            width: 3,
            colors: [color],
            lineCap: 'round'
        },
        fill: { opacity: 0 },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val, { dataPointIndex }) => {
                    var originalVal = originalValues[dataPointIndex];
                    return originalVal === 0 ? '0 hours' : originalVal.toFixed(1) + ' hours';
                }
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'pre-wrap'
                },
                trim: false,
                rotate: 0,
                maxHeight: 80
            }
        },
        yaxis: {
            max: Math.max(Math.max(...values, 1) * 1.2, 10),
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.primary,
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        legend: { show: false }
    };

    try {
        var chart = new ApexCharts(container, options);
        chart.render();
        return chart;
    } catch (e) {
        console.error('Error rendering horizontal bar chart:', containerId, e);
        container.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Error loading chart</div>';
    }
}
function renderVerticalBarChart(containerId, categories, values, color, yAxisLabel, COLORS, isPorter = false, offsetY = -20, insideBar = false) {
    var safeValues = values.map(v => v === 0 ? 0.01 : v);
    var originalValues = values;

    // Check if there are any positive values
    var hasPositiveValues = originalValues.some(v => v > 0);

    // Calculate y-axis max based on actual values
    var maxValue = Math.max(...originalValues, 1);
    var yAxisMax = hasPositiveValues ? Math.ceil(maxValue * 1.2) : 10;
    if (yAxisMax < 10) yAxisMax = 10;

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: hasPositiveValues, easing: 'easeinout', speed: 800 },
            dropShadow: {
                enabled: hasPositiveValues,
                top: 0,
                left: 0,
                blur: 10,
                color: color,
                opacity: 0.6
            }
        },
        colors: [color],
        series: [{ name: yAxisLabel === '%' ? 'Percentage' : 'Engagement %', data: safeValues }],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: isPorter ? '70%' : '55%',
                borderRadius: 4,
                dataLabels: {
                    position: insideBar ? 'center' : 'top'
                }
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: insideBar ? 0 : offsetY,
            formatter: (val, { dataPointIndex }) => {
                var originalVal = originalValues[dataPointIndex];
                if (originalVal === 0) return '0';
                return originalVal + (yAxisLabel === '%' ? '%' : '');
            },         
            style: {
                colors: ['#fff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            show: true,
            width: 3,
            colors: [color],
            lineCap: 'round',
            dashArray: hasPositiveValues ? 0 : 2
        },
        fill: {
            opacity: hasPositiveValues ? 0 : 0.2
        },
        tooltip: {
            enabled: hasPositiveValues,
            theme: 'dark',
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val, { dataPointIndex }) => {
                    var originalVal = originalValues[dataPointIndex];
                    return originalVal + (yAxisLabel === '%' ? '%' : '% engagement');
                }
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '12px', fontWeight: 500, fontFamily: 'Inter, sans-serif' },
                rotate: -15,
                trim: true
            }
        },
        yaxis: {
            min: 0,
            max: yAxisMax,  // Dynamic y-axis max
            tickAmount: 5,
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '12px', fontWeight: 500, fontFamily: 'Inter, sans-serif' },
                formatter: (val) => Math.round(val) + (yAxisLabel === '%' ? '%' : '')
            }
        },
        legend: { show: false }
    };

    try {
        var chart = new ApexCharts(document.querySelector("#" + containerId), options);
        chart.render();
        return chart;
    } catch (e) {
        console.error('Error rendering vertical bar chart:', containerId, e);
        container.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Error loading chart</div>';
    }
}

function renderHorizontalBarChartP(containerId, categories, values, color, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!categories || categories.length === 0) {
        categories = ['No Data'];
        values = [0];
    }

    var hasPositiveValues = values.some(v => v > 0);
    var safeValues = values.map(v => v === 0 ? 0.1 : v);
    var originalValues = values;

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: hasPositiveValues, easing: 'easeinout', speed: 800 },
            dropShadow: {
                enabled: hasPositiveValues,
                top: 0,
                left: 0,
                blur: 10,
                color: color,
                opacity: 0.6
            }
        },
        colors: [color],
        series: [{ name: 'Hours', data: safeValues }],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '70%',
                borderRadius: 4,
                dataLabels: {
                    position: 'center'
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val, { dataPointIndex }) => {
                var originalVal = originalValues[dataPointIndex];

                if (originalVal === 0) {
                    return '0';
                }
                return originalVal.toFixed(1);
            },
            offsetX: 0,
            style: {
                colors: ['#ffffff'],
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 2,
                color: '#000',
                opacity: 0.5
            }
        },
        stroke: {
            show: true,
            width: 3,
            colors: [color],
            lineCap: 'round',
            dashArray: hasPositiveValues ? 0 : 2
        },
        fill: {
            opacity: 0
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val, { dataPointIndex }) => {
                    var originalVal = originalValues[dataPointIndex];
                    if (originalVal === 0) {
                        return '0 hours';
                    }
                    return originalVal.toFixed(1) + ' hours';
                }
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '12px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            }
        },
        yaxis: {
            max: Math.max(Math.max(...values, 1) * 1.2, 10),
            tickAmount: 5,
            labels: {
                style: { colors: COLORS.text.primary, fontSize: '13px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            }
        },
        legend: { show: false }
    };

    try {
        var chart = new ApexCharts(container, options);
        chart.render();
        return chart;
    } catch (e) {
        console.error('Error rendering horizontal bar chart:', containerId, e);
        container.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Error loading chart</div>';
    }
}
function renderLineChart(containerId, categories, values, color, COLORS, showLabels = true) {
    var options = {
        chart: {
            type: 'line',
            height: '100%',
            width: '100%',        // TYPE THIS
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            dropShadow: { enabled: true, top: 0, left: 0, blur: 8, color: color, opacity: 0.6 },
            zoom: { enabled: false },           // TYPE THIS
            panning: { enabled: false },        // TYPE THIS
            redrawOnParentResize: true,         // TYPE THIS
            redrawOnWindowResize: true,         // TYPE THIS
        },
        colors: [color],
        series: [{ name: 'Tasks', data: values }],
        dataLabels: showLabels ? {
            enabled: true,
            offsetY: -15,
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                background: 'transparent'
            },
            background: { enabled: false }
        } : { enabled: false },
        stroke: { curve: 'smooth', width: 3, colors: [color] },
        markers: { size: 6, colors: [color], strokeColors: '#fff', strokeWidth: 2, hover: { size: 8 } },
        tooltip: {
            theme: 'dark',
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' },
            x: { show: true },              // TYPE THIS LINE
            y: { formatter: (val) => val + ' tasks' }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '12px', fontWeight: 500 },
                rotate: -15,
                trim: true
            }
        },
        yaxis: {
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '12px', fontWeight: 500 }
            }
        },
        legend: { show: false }
    };
    var chart = new ApexCharts(document.querySelector("#" + containerId), options);
    chart.render();
    return chart;
}

function renderHollowPieChart(containerId, data, colorMap, total) {
    if (!data || data.length === 0) {
        document.getElementById(containerId).innerHTML = '<div style="color: white; text-align: center; padding: 50px;">No data</div>';
        return;
    }

    data = data.filter(item => item.value > 0);

    var colors = data.map(item => colorMap[item.name] || '#8B5CF6');

    var options = {
        chart: {
            type: 'donut',
            height: '70%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            dropShadow: { enabled: true, top: 0, left: 0, blur: 8, color: '#fff', opacity: 0.3 }
        },
        colors: colors,
        series: data.map(item => item.value),
        labels: data.map(item => item.name),
        legend: { show: false },
        dataLabels: {
            enabled: true,
            formatter: (val, { seriesIndex, w }) => {

                return data[seriesIndex].percentage + '%';
            },
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: { enabled: false },
            offsetY: 0,
            offsetX: 0
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: {
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif'
            },
            y: {
                formatter: (val, { seriesIndex, dataPointIndex, w }) => {
                    var item = data[seriesIndex];
                    return item.value + ' (' + item.percentage + '%)';
                }
            }
        },
        stroke: {
            show: true,
            width: 3,
            colors: colors
        },
        fill: { opacity: 0 },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '55%',
                    labels: { show: false }
                }
            }
        }
    };

    try {
        var chart = new ApexCharts(document.querySelector("#" + containerId), options);
        chart.render();

        return chart;
    } catch (e) {
        console.error('Error rendering pie chart:', e);
    }
}
function renderEngagementChart(containerId, categories, values, color, COLORS) {

    var safeValues = values.map(v => v === 0 ? 0.01 : v);
    var originalValues = values;

    var options = {
        chart: {
            type: 'line',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 8,
                color: color,
                opacity: 0.6
            },
            zoom: { enabled: false }
        },
        colors: [color],
        series: [{
            name: 'Engagement %',
            data: safeValues
        }],
        dataLabels: {
            enabled: true,
            offsetY: -15,
            formatter: (val, { dataPointIndex }) => originalValues[dataPointIndex] + '%',
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            colors: [color]
        },
        markers: {
            size: 5,
            colors: [color],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: { size: 7 }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: {
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                colors: ['#fff']
            },
            x: {
                show: true,
                formatter: (val, { dataPointIndex }) => {
                    return categories[dataPointIndex] || '';
                }
            },
            y: {
                formatter: (val) => {
                    var numVal = Math.round(val);
                    return numVal + '% engagement';
                }
            },
            marker: { show: true }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true,
                    colors: 'rgba(255,255,255,0.05)'
                }
            },
            yaxis: {
                lines: {
                    show: true,
                    colors: 'rgba(255,255,255,0.05)'
                }
            }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                rotate: -45,
                rotateAlways: true,
                trim: true,
                maxHeight: 100
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val) + '%'
            },
            title: {
                text: 'Engagement Rate',
                style: {
                    color: COLORS.text.light,
                    fontSize: '11px',
                    fontWeight: 400
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(document.querySelector("#" + containerId), options);
    chart.render();
    return chart;
}
function renderActivityChart(containerId, categories, values, COLORS) {

    if (!categories || categories.length === 0) {
        categories = [];
        values = [];
        for (var i = 0; i < 24; i++) {
            var hour = i.toString().padStart(2, '0') + ':00';
            categories.push(hour);
            var val = 0;
            if (i >= 7 && i <= 9) val = 45 + (i - 7) * 15; 
            else if (i >= 10 && i <= 16) val = 85 + (i - 10) * 2; 
            else if (i >= 17 && i <= 19) val = 90 - (i - 17) * 10;
            else if (i >= 20 && i <= 22) val = 50 - (i - 20) * 15; 
            else val = 10; 
            values.push(Math.min(100, Math.max(0, Math.round(val))));
        }
    }

    var safeValues = values.map(v => v === 0 ? 0.01 : v);
    var originalValues = values;

    var yAxisMax = 100;

    var options = {
        chart: {
            type: 'line',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 8,
                color: '#8B5CF6',
                opacity: 0.6
            },
            zoom: { enabled: false }
        },
        colors: ['#8B5CF6'],
        series: [{
            name: 'Completion %',
            data: safeValues
        }],
        dataLabels: {
            enabled: true,
            offsetY: -15,
            formatter: (val, { dataPointIndex }) => originalValues[dataPointIndex] + '%',
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            colors: ['#8B5CF6']
        },
        markers: {
            size: 5,
            colors: ['#8B5CF6'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: { size: 7 }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: {
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                colors: ['#fff']
            },
            x: {
                show: true,
                format: 'HH:mm'
            },
            y: {
                formatter: (val) => {
                    var numVal = Math.round(val);
                    return numVal + '% completion';
                }
            },
            marker: { show: true }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true,
                    colors: 'rgba(255,255,255,0.05)'
                }
            },
            yaxis: {
                lines: {
                    show: true,
                    colors: 'rgba(255,255,255,0.05)'
                }
            }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '10px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                rotate: -45,
                rotateAlways: true,
                trim: true,
                maxHeight: 80,
                formatter: function (val) {

                    var hour = parseInt(val);
                    if (!isNaN(hour)) {
                        return hour.toString().padStart(2, '0') + ':00';
                    }
                    return val;
                }
            },
            tickAmount: 12, 
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            min: 0,
            max: yAxisMax,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val) + '%'
            },
            title: {
                text: 'Completion Rate',
                style: {
                    color: COLORS.text.light,
                    fontSize: '11px',
                    fontWeight: 400
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(document.querySelector("#" + containerId), options);
    chart.render();
    return chart;
}

function loadAIModulesDashboard() {
    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = '';
    var departmentIds = '';
    var ServiceCode = sessionStorage.getItem('ServiceCode') || '1';

    $('.loaderElement').css("display", "inline-block");

    $('#EscalationChart').html(`
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:600px; background:linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%); border-radius:24px; border:1px solid rgba(255,255,255,0.12);">
        <div style="background:rgba(255, 255, 255, 0.08); padding:40px; border-radius:30px; backdrop-filter:blur(8px); border:1.5px solid rgba(255,255,255,0.12); box-shadow:0 20px 35px -5px rgba(0,0,0,0.3);">
            <div style="position:relative; width:70px; height:70px; margin:0 auto;">
                <div style="position:absolute; top:0; left:0; right:0; bottom:0; border:3px solid rgba(255,255,255,0.15); border-top:3px solid #b794f4; border-radius:50%; animation:spin 1s linear infinite; box-shadow:0 0 15px rgba(183, 148, 244, 0.3);"></div>
                <div style="position:absolute; top:5px; left:5px; right:5px; bottom:5px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #9f7aea; border-radius:50%; animation:spin 1.5s linear infinite reverse;"></div>
            </div>
            <p style="margin-top:25px; color:#ffffff; font-size:18px; font-weight:600; letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.2);">Loading AI Modules Dashboard...</p>
            <p style="margin-top:8px; color:rgba(255,255,255,0.6); font-size:14px; font-weight:400;">Real-time performance metrics and analytics</p>
        </div>
    </div>
    <style>
        @keyframes spin { 
            0% { transform:rotate(0deg); } 
            100% { transform:rotate(360deg); } 
        }
    </style>
`);

    $.when(
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("DEMAND_PREDICTION")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("SLA_RISK_PREDICTION")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),

        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("RESOURCE_OPTIMIZATION")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),

        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("CANCELED_TASKS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        })
    ).then(function (demandResponse, riskResponse, resourceResponse, canceledResponse) {

        var demandData = demandResponse && demandResponse.length > 0 ? demandResponse[0] : [];
        var riskData = riskResponse && riskResponse.length > 0 ? riskResponse[0] : [];
        var resourceData = resourceResponse && resourceResponse.length > 0 ? resourceResponse[0] : [];
        var canceledData = canceledResponse && canceledResponse.length > 0 ? canceledResponse[0] : [];

        renderAIModulesDashboard(demandData, resourceData, riskData, canceledData);
        setTimeout(function () {
            $('.loaderElement').css("display", "none");
        }, 500);

    }).fail(function (xhr, status, error) {
        console.error("AI Modules data load failed:", error);

        renderAIModulesDashboard([], [], [], []);
        $('.loaderElement').css("display", "none");
    });
}

function renderAIModulesDashboard(demandData, resourceData, slaRiskData, canceledData) {

    const COLORS = {
        primary: "#3a5be0",
        secondary: "#6a0dad",
        tertiary: "#e01e6a",
        quaternary: "#3ab5e0",
        warning: "#e05a2e",
        success: "#05b58c",
        text: {
            primary: "#ffffff",
            secondary: "#e0e0e0",
            light: "#c0c0c0"
        },
        background: {
            main: "linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%)",
            card: "rgba(255, 255, 255, 0.08)",
            border: "rgba(255, 255, 255, 0.12)"
        },
        actualColor: "#3a5be0",    
        predictedColor: "#10b981", 
        resourceColor: "#10b981",  
        riskColor: "#e05a2e",      
        canceledColor: "#f59e0b"   
    };

    var demandCategories = ['1', '2', '3', '4', '5', '6', '7'];
    var actualValues = [0, 0, 0, 0, 0, 0, 0];
    var predictedValues = [0, 0, 0, 0, 0, 0, 0];

    if (demandData && demandData.length > 0) {
        demandData.sort((a, b) => {
            var dayA = parseInt(a.DAY_LABEL?.replace('Day ', '') || '0');
            var dayB = parseInt(b.DAY_LABEL?.replace('Day ', '') || '0');
            return dayA - dayB;
        });

        demandData.forEach(item => {
            var dayNum = parseInt(item.DAY_LABEL?.replace('Day ', '') || '0') - 1;
            if (dayNum >= 0 && dayNum < 7) {
                actualValues[dayNum] = item.ACTUAL_COUNT || 0;
                predictedValues[dayNum] = item.PREDICTED_COUNT || 0;
            }
        });
    }

    var resourceCategories = ['Day 1', 'Day 2', 'Day 3'];
    var availableValues = [0, 0, 0];
    var requiredValues = [0, 0, 0];

    if (resourceData && resourceData.length > 0) {
        resourceData.sort((a, b) => {
            var dayA = a.SHIFT_NAME === 'Day 1' ? 1 : a.SHIFT_NAME === 'Day 2' ? 2 : 3;
            var dayB = b.SHIFT_NAME === 'Day 1' ? 1 : b.SHIFT_NAME === 'Day 2' ? 2 : 3;
            return dayA - dayB;
        });

        resourceData.forEach((item, index) => {
            if (index < 3) {
                availableValues[index] = item.AVAILABLE_STAFF || 0;
                requiredValues[index] = item.REQUIRED_STAFF || 0;
            }
        });
    }

    var riskCategories = [];
    var riskValues = [];

    if (slaRiskData && slaRiskData.length > 0) {
        slaRiskData.sort((a, b) => (b.RISK_TASKS || 0) - (a.RISK_TASKS || 0));

        slaRiskData.forEach(item => {
            riskCategories.push(item.DEPARTMENT_NAME || 'Unknown');
            riskValues.push(item.RISK_TASKS || 0);
        });
    }

    var canceledCategories = [];
    var canceledValues = [];

    if (canceledData && canceledData.length > 0) {
        canceledData.sort((a, b) => (b.CANCELED_TASKS || 0) - (a.CANCELED_TASKS || 0));

        canceledData.forEach(item => {
            canceledCategories.push(item.DEPARTMENT_NAME || 'Unknown');
            canceledValues.push(item.CANCELED_TASKS || 0);
        });
    }

    var dashboardHTML = `
        <div class="ai-dashboard">
            <style>
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 300;
                    src: url('../webfonts/Inter-Light.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 400;
                    src: url('../webfonts/Inter-Regular.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 500;
                    src: url('../webfonts/Inter-Medium.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 600;
                    src: url('../webfonts/Inter-SemiBold.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 700;
                    src: url('../webfonts/Inter-Bold.woff2') format('woff2');
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                
                .ai-dashboard {
                    padding: 30px;
                    background: ${COLORS.background.main};
                    min-height: 100vh;
                }
                
                /* Dashboard Title */
                .dashboard-main-title {
                    font-size: 26px;
                    font-weight: 600;
                    color: ${COLORS.text.primary};
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }
                
                .dashboard-subtitle {
                    font-size: 15px;
                    color: ${COLORS.text.light};
                    margin-bottom: 30px;
                }
                
                /* Grid Layout */
                .ai-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 25px;
                }
                
                /* Dashboard Cards */
                .ai-card {
                    background: ${COLORS.background.card};
                    border-radius: 28px;
                    padding: 24px;
                    border: 1.5px solid ${COLORS.background.border};
                    transition: all 0.2s ease;
                    height: 480px;
                    display: flex;
                    flex-direction: column;
                }
                
                .ai-card:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                }
                
                .card-header {
                    margin-bottom: 15px;
                }
                
                .card-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: ${COLORS.text.primary};
                    margin: 0 0 4px 0;
                }
                
                .card-subtitle {
                    font-size: 15px;
                    font-weight: 400;
                    color: ${COLORS.text.light};
                }
                
                .card-content {
                    flex: 1;
                    min-height: 0;
                    width: 100%;
                }
                
                /* Chart Containers */
                #demandChart, #resourceChart, #riskChart, #canceledChart {
                    width: 100%;
                    height: 100%;
                }
                
                /* TOOLTIP STYLES */
                .apexcharts-tooltip {
                    background: rgba(20, 20, 30, 0.95) !important;
                    backdrop-filter: blur(8px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 12px !important;
                    color: white !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
                    padding: 10px 14px !important;
                    transition: all 0.2s ease !important;
                }
                
                .apexcharts-tooltip-title {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #e0e0e0 !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    padding: 6px 10px !important;
                    margin: -10px -14px 8px -14px !important;
                    border-radius: 12px 12px 0 0 !important;
                }
                
                .apexcharts-tooltip-series-group {
                    padding: 6px 0 !important;
                    display: flex !important;
                    align-items: center !important;
                }
                
                .apexcharts-tooltip-marker {
                    width: 12px !important;
                    height: 12px !important;
                    border-radius: 4px !important;
                    margin-right: 10px !important;
                }
                
                .apexcharts-tooltip-text {
                    font-size: 13px !important;
                    font-weight: 500 !important;
                }
                
                /* Grid lines */
                .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-width: 1.5px !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                .apexcharts-grid-borders line {
                    stroke: rgba(255, 255, 255, 0.15) !important;
                    stroke-width: 1.5px !important;
                }
            </style>

            <!-- First Row -->
            <div class="ai-grid">
                <!-- Demand Prediction -->
                <div class="ai-card">
                    <div class="card-header">
                        <div class="card-title">Demand Prediction</div>
                        <div class="card-subtitle">Next 7 days forecast</div>
                    </div>
                    <div class="card-content">
                        <div id="demandChart"></div>
                    </div>
                </div>

                <!-- Resource Optimization -->
                <div class="ai-card">
                    <div class="card-header">
                        <div class="card-title">Resource Optimization</div>
                        <div class="card-subtitle">Required vs Available staff</div>
                    </div>
                    <div class="card-content">
                        <div id="resourceChart"></div>
                    </div>
                </div>
            </div>

            <!-- Second Row -->
            <div class="ai-grid">
                <!-- SLA Risk Prediction -->
                <div class="ai-card">
                    <div class="card-header">
                        <div class="card-title">SLA Risk Prediction</div>
                        <div class="card-subtitle">Risk by department for next 7 days</div>
                    </div>
                    <div class="card-content">
                        <div id="riskChart"></div>
                    </div>
                </div>

                <!-- Canceled Tasks -->
                <div class="ai-card">
                    <div class="card-header">
                        <div class="card-title">Cancelled Tasks</div>
                        <div class="card-subtitle">Cancellation by department for next 7 days</div>
                    </div>
                    <div class="card-content">
                        <div id="canceledChart"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#EscalationChart').html(dashboardHTML);

    setTimeout(() => {
        if (typeof ApexCharts !== 'undefined') {

            renderDemandChart('demandChart', demandCategories, actualValues, predictedValues, COLORS);

            renderResourceChart('resourceChart', resourceCategories, availableValues, requiredValues, COLORS);

            renderRiskCanceledChart('riskChart', riskCategories, riskValues, COLORS.riskColor, 'Risk', COLORS);

            renderRiskCanceledChart('canceledChart', canceledCategories, canceledValues, COLORS.canceledColor, 'Canceled', COLORS);
        }
    }, 500);
}
  function renderDemandChart(containerId, categories, actualValues, predictedValues, COLORS) {
    var options = {
        chart: {
            type: 'line',
            height: '100%',
            width: '100%',    // ADD THIS
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            zoom: { enabled: false },         // ADD THIS
            panning: { enabled: false },      // ADD THIS
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 10,
                color: '#fff',
                opacity: 0.3
            }
        },
        colors: [COLORS.actualColor, COLORS.predictedColor],
        series: [
            {
                name: 'Actual',
                data: actualValues
            },
            {
                name: 'Predicted',
                data: predictedValues
            }
        ],
        dataLabels: {
            enabled: true,
            offsetY: -15,
            formatter: (val) => val,
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            dashArray: [0, 5]
        },
        markers: {
            size: 5,
            hover: { size: 7 }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            x: { show: true, formatter: (val) => 'Day ' + val },
            y: { formatter: (val) => val + ' tasks' }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '12px', fontWeight: 500, fontFamily: 'Inter, sans-serif' },
                hideOverlappingLabels: true    // ADD THIS
            },
            title: {
                text: 'Days',
                style: { color: COLORS.text.light, fontSize: '11px' }
            }
        },
        yaxis: {
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '11px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            },
            title: {
                text: 'Tasks',
                style: { color: COLORS.text.light, fontSize: '11px' }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(document.querySelector("#" + containerId), options);
    chart.render();
}
function renderResourceChart(containerId, categories, availableValues, requiredValues, COLORS) {
    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 10,
                color: '#fff',
                opacity: 0.3
            }
        },
        colors: [COLORS.resourceColor, COLORS.actualColor],
        series: [
            {
                name: 'Available',
                data: availableValues
            },
            {
                name: 'Required',
                data: requiredValues
            }
        ],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 4,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: -20,
            formatter: (val) => val,
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: [COLORS.resourceColor, COLORS.actualColor]
        },
        fill: {
            opacity: 0
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => val + ' staff'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '12px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            }
        },
        yaxis: {
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '11px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(document.querySelector("#" + containerId), options);
    chart.render();
}

function renderRiskCanceledChart(containerId, categories, values, color, yAxisLabel, COLORS) {
    var hasData = categories && categories.length > 0;

    var chartCategories = hasData ? categories : [];
    var chartValues = hasData ? values : [];
    var safeValues = chartValues.map(v => v === 0 ? 0.01 : v);

    var maxValue = hasData ? Math.max(...chartValues) + 5 : 10;

    if (!hasData) {
        maxValue = 10;
    } else if (maxValue < 10) {
        maxValue = 10; 
    }

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            dropShadow: hasData ? {
                enabled: true,
                top: 0,
                left: 0,
                blur: 10,
                color: color,
                opacity: 0.6
            } : { enabled: false }
        },
        colors: [color],
        series: hasData ? [{
            name: yAxisLabel,
            data: safeValues
        }] : [],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '70%',
                borderRadius: 4,
                dataLabels: {
                    position: 'center'
                }
            }
        },
        dataLabels: hasData ? {
            enabled: true,
            formatter: (val, { dataPointIndex }) => values[dataPointIndex],
            offsetX: 0,
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        } : { enabled: false },
        stroke: hasData ? {
            show: true,
            width: 3,
            colors: [color],
            lineCap: 'round'
        } : { show: false },
        fill: {
            opacity: 0
        },
        tooltip: hasData ? {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => {
                    if (yAxisLabel === 'Risk') return val + ' risk tasks';
                    return val + ' canceled';
                }
            }
        } : { enabled: false },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        xaxis: {
            categories: chartCategories,
            min: 0,
            max: maxValue, 
            tickAmount: 5,
            labels: {
                style: { colors: COLORS.text.secondary, fontSize: '11px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            }
        },
        yaxis: {
            labels: {
                style: { colors: COLORS.text.primary, fontSize: '13px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            }
        },
        legend: { show: false },
        noData: {
            text: '',
            align: 'center',
            verticalAlign: 'middle'
        }
    };

    var chart = new ApexCharts(document.querySelector("#" + containerId), options);
    chart.render();
}
function loadPatientExperienceDashboard() {
    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = '';
    var departmentIds = '';
    var ServiceCode = sessionStorage.getItem('ServiceCode') || '1';

    $('.loaderElement').css("display", "inline-block");

    $('#EscalationChart').html(`
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:600px; background:linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%); border-radius:24px; border:1px solid rgba(255,255,255,0.12);">
        <div style="background:rgba(255, 255, 255, 0.08); padding:40px; border-radius:30px; backdrop-filter:blur(8px); border:1.5px solid rgba(255,255,255,0.12); box-shadow:0 20px 35px -5px rgba(0,0,0,0.3);">
            <div style="position:relative; width:70px; height:70px; margin:0 auto;">
                <div style="position:absolute; top:0; left:0; right:0; bottom:0; border:3px solid rgba(255,255,255,0.15); border-top:3px solid #b794f4; border-radius:50%; animation:spin 1s linear infinite; box-shadow:0 0 15px rgba(183, 148, 244, 0.3);"></div>
                <div style="position:absolute; top:5px; left:5px; right:5px; bottom:5px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #9f7aea; border-radius:50%; animation:spin 1.5s linear infinite reverse;"></div>
            </div>
            <p style="margin-top:25px; color:#ffffff; font-size:18px; font-weight:600; letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.2);">Loading Patient Experience Dashboard...</p>
            <p style="margin-top:8px; color:rgba(255,255,255,0.6); font-size:14px; font-weight:400;">Real-time performance metrics and analytics</p>
        </div>
    </div>
    <style>
        @keyframes spin { 
            0% { transform:rotate(0deg); } 
            100% { transform:rotate(360deg); } 
        }
    </style>
`);

    $.when(

        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("WAIT_TIME_DISTRIBUTION")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),

        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("TRANSFER_PERFORMANCE")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),

        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("COMPLAINTS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),

        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("SATISFACTION_TRENDS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        })
    ).then(function (waitResponse, transferResponse, complaintsResponse, satisfactionResponse) {

        var waitData = waitResponse && waitResponse.length > 0 ? waitResponse[0] : [];
        var transferData = transferResponse && transferResponse.length > 0 ? transferResponse[0] : [];
        var complaintsData = complaintsResponse && complaintsResponse.length > 0 ? complaintsResponse[0] : [];
        var satisfactionData = satisfactionResponse && satisfactionResponse.length > 0 ? satisfactionResponse[0] : [];

        renderPatientExperienceDashboard(waitData, transferData, complaintsData, satisfactionData);

        setTimeout(function () {
            $('.loaderElement').css("display", "none");
        }, 500);

    }).fail(function (xhr, status, error) {
        console.error("Patient Experience data load failed:", error);

        renderPatientExperienceDashboard([], [], [], []);
        $('.loaderElement').css("display", "none");
    });
  }

function renderPatientExperienceDashboard(waitData, transferData, complaintsData, satisfactionData) {

    const COLORS = {
        primary: "#3a5be0",
        secondary: "#6a0dad",
        tertiary: "#e01e6a",
        quaternary: "#3ab5e0",
        warning: "#e05a2e",
        success: "#10b981",
        text: {
            primary: "#ffffff",
            secondary: "#e0e0e0",
            light: "#c0c0c0"
        },
        background: {
            main: "linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%)",
            card: "rgba(255, 255, 255, 0.08)",
            border: "rgba(255, 255, 255, 0.12)"
        },
        waitBorderColor: "#0ff0fc",
        complaintBorderColor: "#f59e0b",
        satisfactionLineColor: "#10b981",
        transferOnTimeBorder: "#3a5be0",
        transferDelayedBorder: "#e05a2e"
    };

    var monthsSet = new Map();

    function addToMonthSet(data, yearField, monthField) {
        if (data && data.length > 0) {
            data.forEach(item => {
                var year = item[yearField];
                var month = item[monthField];
                if (year && month) {
                    var key = `${year}-${month}`;
                    if (!monthsSet.has(key)) {
                        monthsSet.set(key, { year: year, month: month });
                    }
                }
            });
        }
    }



    addToMonthSet(transferData, 'REQ_YEAR', 'REQ_MONTH');
    addToMonthSet(complaintsData, 'REQ_YEAR', 'REQ_MONTH');
    addToMonthSet(satisfactionData, 'REQ_YEAR', 'REQ_MONTH');
    addToMonthSet(waitData, 'REQ_YEAR', 'REQ_MONTH');

    var monthsList = Array.from(monthsSet.values()).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    }).map(m => ({
        year: m.year,
        month: m.month,
        monthName: new Date(m.year, m.month - 1, 1).toLocaleString('default', { month: 'long' }),
        display: new Date(m.year, m.month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
    }));

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const currentDisplay = new Date(currentYear, currentMonth - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    var defaultMonth = monthsList.find(m => m.display === currentDisplay) || (monthsList.length > 0 ? monthsList[0] : null);

    window.patientDataCache = {
        transferData: transferData,
        complaintsData: complaintsData,
        satisfactionData: satisfactionData,
        waitData: waitData,
        monthsList: monthsList
    };

    function filterDataByMonth(monthData) {
        if (!monthData) return { transferData: [], complaintsData: [], satisfactionData: [], waitData: [] };

        var filteredTransfer = transferData.filter(item => item.REQ_YEAR === monthData.year && item.REQ_MONTH === monthData.month);
        var filteredComplaints = complaintsData.filter(item => item.REQ_YEAR === monthData.year && item.REQ_MONTH === monthData.month);
        var filteredSatisfaction = satisfactionData.filter(item => item.REQ_YEAR === monthData.year && item.REQ_MONTH === monthData.month);
        var filteredWait = waitData.filter(item => item.REQ_YEAR === monthData.year && item.REQ_MONTH === monthData.month);

        return {
            transferData: filteredTransfer,
            complaintsData: filteredComplaints,
            satisfactionData: filteredSatisfaction,
            waitData: filteredWait
        };
    }

    function renderWithMonth(monthData) {
        var filtered = filterDataByMonth(monthData);

        var waitDepartments = [];
        var peakWaitValues = [];
        var normalWaitValues = [];

        if (filtered.waitData && filtered.waitData.length > 0) {
            filtered.waitData.forEach(item => {
                waitDepartments.push(item.DEPARTMENT_NAME || 'Unknown');
                peakWaitValues.push(Math.abs(parseFloat(item.PEAK_AVG_WAIT_MINUTES) || 0));
                normalWaitValues.push(Math.abs(parseFloat(item.NORMAL_AVG_WAIT_MINUTES) || 0));
            });
        }

        var wardNames = [];
        var wardCounts = [];
        var wardPercentages = [];

        if (filtered.transferData && filtered.transferData.length > 0) {
            filtered.transferData.forEach(item => {
                wardNames.push(item.WARD_NAME || 'Unknown');
                wardCounts.push(item.REQUEST_COUNT || 0);
                wardPercentages.push(item.PERCENTAGE || 0);
            });
        }

        var complaintCategories = [];
        var complaintValues = [];

        if (filtered.complaintsData && filtered.complaintsData.length > 0) {
            filtered.complaintsData.forEach(item => {
                complaintCategories.push(item.DEPARTMENT_NAME || item.DEPARTMENT_NAME || 'Unknown');
                complaintValues.push(item.COMPLAINT_COUNT || 0);
            });
        }

        var satisfactionDepartments = [];
        var satisfactionRatings = [];
        var satisfactionCounts = [];
        var satisfactionPercentages = [];

        var totalSatisfactionRequests = 0;
        var totalSatisfactionPercentage = 0;

        if (filtered.satisfactionData && filtered.satisfactionData.length > 0) {
            filtered.satisfactionData.forEach(item => {
                satisfactionDepartments.push(item.DEPARTMENT_NAME || 'Unknown');
                satisfactionRatings.push(item.RATING || 0);
                satisfactionCounts.push(item.REQUEST_COUNT || 0);
                satisfactionPercentages.push(item.PERCENTAGE || 0);

                totalSatisfactionRequests += (item.REQUEST_COUNT || 0);
                totalSatisfactionPercentage += (item.PERCENTAGE || 0);
            });
        }

        window.satisfactionTotals = {
            totalRequests: totalSatisfactionRequests,
            totalPercentage: totalSatisfactionPercentage
        };

        try {
            if (window.ptWaitChart && typeof window.ptWaitChart.destroy === 'function') {
                window.ptWaitChart.destroy();
            }
            if (window.ptTransferChart && typeof window.ptTransferChart.destroy === 'function') {
                window.ptTransferChart.destroy();
            }
            if (window.ptComplaintsChart && typeof window.ptComplaintsChart.destroy === 'function') {
                window.ptComplaintsChart.destroy();
            }
            if (window.ptSatisfactionChart && typeof window.ptSatisfactionChart.destroy === 'function') {
                window.ptSatisfactionChart.destroy();
            }
        } catch (e) {
            console.log('Error destroying charts:', e);
        }

        document.getElementById('ptWaitChart').innerHTML = '';
        document.getElementById('ptTransferChart').innerHTML = '';
        document.getElementById('ptComplaintsChart').innerHTML = '';
        document.getElementById('ptSatisfactionChart').innerHTML = '';

        renderPTWaitChart('ptWaitChart', waitDepartments, peakWaitValues, normalWaitValues, '#00ccdd', '#3a5be0', COLORS);
        renderPTWardChart('ptTransferChart', wardNames, wardCounts, wardPercentages, COLORS);
        renderPTComplaintsVerticalChart('ptComplaintsChart', complaintCategories, complaintValues, '#f59e0b', 'Complaints', COLORS);
        renderPTSatisfactionDepartmentChart('ptSatisfactionChart', satisfactionDepartments, satisfactionRatings, satisfactionCounts, satisfactionPercentages, COLORS);
    }

    var monthDropdownHTML = '';
    if (monthsList && monthsList.length > 0) {
        monthDropdownHTML = `
            <div class="month-filter" style="margin-left: auto;">
                <select id="patientMonthSelect" style="
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    padding: 8px 16px;
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    outline: none;
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                ">
                    ${monthsList.map(month => `
                        <option value="${month.year}-${month.month}" 
                            ${defaultMonth && defaultMonth.year === month.year && defaultMonth.month === month.month ? 'selected' : ''}
                            style="background: #4A2578; color: white;">
                            ${month.display}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    var dashboardHTML = `
        <div class="patient-dashboard">
            <style>
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 300;
                    src: url('../webfonts/Inter-Light.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 400;
                    src: url('../webfonts/Inter-Regular.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 500;
                    src: url('../webfonts/Inter-Medium.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 600;
                    src: url('../webfonts/Inter-SemiBold.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 700;
                    src: url('../webfonts/Inter-Bold.woff2') format('woff2');
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                
                .patient-dashboard {
                    padding: 30px;
                    background: ${COLORS.background.main};
                    min-height: 100vh;
                }
                
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }
                
                .header-title h1 {
                    color: white;
                    font-size: 26px;
                    font-weight: 700;
                    margin-bottom: 4px;
                    letter-spacing: -0.3px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }
                
                .header-title p {
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
                }
                
                .month-filter select:hover {
                    background: rgba(255, 255, 255, 0.25);
                    border-color: rgba(255, 255, 255, 0.5);
                }
                
                .patient-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 25px;
                }
                
                .patient-card {
                    background: ${COLORS.background.card};
                    border-radius: 28px;
                    padding: 24px;
                    border: 1.5px solid ${COLORS.background.border};
                    transition: all 0.3s ease;
                    height: 480px;
                    display: flex;
                    flex-direction: column;
                    cursor: pointer;
                }
                
                .patient-card:hover {
                    background: rgba(255, 255, 255, 0.18) !important;
                    border-color: rgba(255, 255, 255, 0.35) !important;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
                }
                
                .card-header {
                    margin-bottom: 15px;
                    transition: all 0.2s ease;
                }
                
                .patient-card:hover .card-header {
                }
                
                .card-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: ${COLORS.text.primary};
                    margin: 0 0 4px 0;
                }
                
                .card-subtitle {
                    font-size: 15px;
                    font-weight: 400;
                    color: ${COLORS.text.light};
                }
                
                .card-content {
                    flex: 1;
                    min-height: 0;
                    width: 100%;
                }
                
                #ptWaitChart, #ptTransferChart, #ptComplaintsChart, #ptSatisfactionChart {
                    width: 100%;
                    height: 100%;
                }
                
                .apexcharts-bar-area {
                    fill: transparent !important;
                    stroke-width: 3px !important;
                }
                
                .apexcharts-pie-area {
                    fill: transparent !important;
                    stroke-width: 3px !important;
                }
                
                #ptWaitChart .apexcharts-bar-series[seriesindex="0"] path {
                    stroke: #00ccdd !important;
                }
                #ptWaitChart .apexcharts-bar-series[seriesindex="1"] path {
                    stroke: #3a5be0 !important;
                }
                
                #ptComplaintsChart .apexcharts-bar-area {
                    stroke: #f59e0b !important;
                    fill: transparent !important;
                }
                
                .apexcharts-tooltip {
                    background: #000000 !important;
                    border: 1px solid #333333 !important;
                    border-radius: 8px !important;
                    color: white !important;
                }
                
                .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-dasharray: 4 4 !important;
                }
            </style>

            <div class="dashboard-header">
                <div class="header-title">
                </div>
                ${monthDropdownHTML}
            </div>

            <div class="patient-grid">
                <div class="patient-card">
                    <div class="card-header">
                        <div class="card-title">Wait Time Distribution</div>
                        <div class="card-subtitle">By department (minutes)</div>
                    </div>
                    <div class="card-content">
                        <div id="ptWaitChart"></div>
                    </div>
                </div>

                <div class="patient-card">
                    <div class="card-header">
                        <div class="card-title">Patient Requests by Ward</div>
                        <div class="card-subtitle">Top 10 Distribution by ward</div>
                    </div>
                    <div class="card-content">
                        <div id="ptTransferChart"></div>
                    </div>
                </div>
            </div>

            <div class="patient-grid">
                <div class="patient-card">
                    <div class="card-header">
                        <div class="card-title">Top Complaint Categories</div>
                        <div class="card-subtitle">Most common issues - View details in the Task Dashboard → ‘Complaints’ tab.</div>
                    </div>
                    <div class="card-content">
                        <div id="ptComplaintsChart"></div>
                    </div>
                </div>

                <div class="patient-card">
                    <div class="card-header">
                        <div class="card-title">Patient Satisfaction by Department</div>
                        <div class="card-subtitle">Ratings | Total: <span id="satTotalRequests">0</span> requests (<span id="satTotalPercent">0</span>%)</div>
                    </div>
                    <div class="card-content">
                        <div id="ptSatisfactionChart"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#EscalationChart').html(dashboardHTML);

    if (defaultMonth) {
        setTimeout(() => {
            renderWithMonth(defaultMonth);
        }, 100);
    }

    setTimeout(() => {
        const monthSelect = document.getElementById('patientMonthSelect');
        if (monthSelect) {
            monthSelect.addEventListener('change', function (e) {
                const [year, month] = e.target.value.split('-');
                const selectedMonth = monthsList.find(m => m.year === parseInt(year) && m.month === parseInt(month));
                if (selectedMonth) {
                    renderWithMonth(selectedMonth);
                }
            });
        }
    }, 200);
}

function renderPTWardChart(containerId, wardNames, wardCounts, wardPercentages, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var hasData = wardCounts.some(v => v > 0);

    if (!hasData) {
        container.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">No ward data available</div>';
        return;
    }

    var totalItems = wardNames.length;
    var topN = totalItems;

    if (totalItems > 12) {
        topN = 10; 
    } else if (totalItems > 8) {
        topN = 8;
    } else {
        topN = totalItems;
    }

    var sortedData = [];
    for (var i = 0; i < wardNames.length; i++) {
        sortedData.push({
            name: wardNames[i],
            count: wardCounts[i],
            percentage: wardPercentages[i]
        });
    }
    sortedData.sort((a, b) => b.count - a.count);

    var topData = sortedData.slice(0, topN);
    var otherCount = 0;
    var otherPercentage = 0;

    if (sortedData.length > topN) {
        for (var j = topN; j < sortedData.length; j++) {
            otherCount += sortedData[j].count;
            otherPercentage += sortedData[j].percentage;
        }
        topData.push({
            name: 'Others',
            count: otherCount,
            percentage: otherPercentage
        });
    }

    var pieLabels = topData.map(item => item.name);
    var pieValues = topData.map(item => item.count);
    var piePercentages = topData.map(item => item.percentage);

    var colorPalette = ['#3a5be0', '#6a0dad', '#e01e6a', '#3ab5e0', '#e05a2e', '#10b981', '#f59e0b', '#8b5cf6', '#ec489a', '#14b8a6', '#f43f5e', '#a855f7'];
    var sliceColors = [];
    for (var k = 0; k < pieLabels.length; k++) {
        sliceColors.push(colorPalette[k % colorPalette.length]);
    }

    var donutSize = '70%';
    if (pieLabels.length > 8) {
        donutSize = '75%';
    } else if (pieLabels.length > 5) {
        donutSize = '72%';
    }

    var strokeWidth = 4;
    if (pieLabels.length > 10) {
        strokeWidth = 3.5;
    } else if (pieLabels.length > 7) {
        strokeWidth = 4;
    } else {
        strokeWidth = 5;
    }

    var dataLabelFontSize = '11px';
    if (pieLabels.length > 10) {
        dataLabelFontSize = '10px';
    } else if (pieLabels.length > 7) {
        dataLabelFontSize = '11px';
    } else {
        dataLabelFontSize = '12px';
    }

    var options = {
        chart: {
            type: 'donut',
            height: '90%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: sliceColors,
        series: pieValues,
        labels: pieLabels,
        dataLabels: {
            enabled: true,
            formatter: function (val, { seriesIndex, w }) {
                return piePercentages[seriesIndex].toFixed(1) + '%';
            },
            style: {
                colors: ['#ffffff'],
                fontSize: dataLabelFontSize,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 2,
                color: '#000',
                opacity: 0.5
            }
        },
        stroke: {
            show: true,
            width: strokeWidth,
            colors: sliceColors
        },
        fill: {
            opacity: 0 
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val, { seriesIndex }) => {
                    return val + ' requests (' + piePercentages[seriesIndex].toFixed(1) + '%)';
                }
            }
        },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: donutSize,
                    labels: {
                        show: false
                    }
                }
            }
        },
        legend: {
            show: false
        }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
    window.ptTransferChart = chart;

    setTimeout(function () {
        var styleId = containerId + '-permanent-neon-glow';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;

            var glowStyles = '';
            for (var s = 0; s < sliceColors.length; s++) {
                var color = sliceColors[s];
                glowStyles += `
                    #${containerId} .apexcharts-donut-series path[seriesindex="${s}"] {
                        stroke: ${color} !important;
                        stroke-width: ${strokeWidth}px !important;
                        stroke-linecap: round !important;
                        stroke-linejoin: round !important;
                        filter: 
                            drop-shadow(0 0 3px ${color})
                            drop-shadow(0 0 6px ${color})
                            drop-shadow(0 0 12px ${color})
                            drop-shadow(0 0 18px ${color}) !important;
                    }
                `;
            }

            style.innerHTML = `
                #${containerId} .apexcharts-donut-series path {
                    fill: transparent !important;
                }
                
                ${glowStyles}
                
                /* White separator lines between slices */
                #${containerId} .apexcharts-donut-series line {
                    stroke: rgba(255, 255, 255, 0.5) !important;
                    stroke-width: 2px !important;
                }
                
                /* Inner circle border */
                #${containerId} .apexcharts-donut-circle {
                    stroke: rgba(255, 255, 255, 0.25) !important;
                    stroke-width: 1.5px !important;
                    fill: transparent !important;
                }
                
                /* Additional outer glow for the entire chart */
                #${containerId} svg {
                    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
                }
            `;
            document.head.appendChild(style);
        }
    }, 300);
}
function renderPTComplaintsVerticalChart(containerId, categories, values, borderColor, yAxisLabel, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var hasData = values.some(v => v > 0);
    var maxValue = hasData ? Math.max(...values) * 1.2 : 10;
    maxValue = Math.ceil(maxValue);

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: [borderColor],
        series: [{
            name: yAxisLabel,
            data: values
        }],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 6,
                dataLabels: { position: 'center' }
            }
        },
        dataLabels: {
            enabled: hasData,
            formatter: (val) => val,
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            show: true,
            width: 3,
            colors: [borderColor],
            lineCap: 'round'
        },
        fill: {
            opacity: 0  
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => val + ' complaints'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                rotate: -45,
                trim: true
            },
            title: {
                text: 'Department',
                style: { color: COLORS.text.light, fontSize: '11px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            }
        },
        yaxis: {
            min: 0,
            max: maxValue,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val)
            },
            title: {
                text: 'Number of Complaints',
                style: { color: COLORS.text.light, fontSize: '11px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
    window.ptComplaintsChart = chart;

    setTimeout(function () {
        var styleId = containerId + '-complaints-glow';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                #${containerId} .apexcharts-bar-area {
                    filter: drop-shadow(0 0 8px ${borderColor}) drop-shadow(0 0 4px ${borderColor}) !important;
                }
                
                #${containerId} .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-width: 1.5px !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                #${containerId} .apexcharts-grid-borders line {
                    stroke: rgba(255, 255, 255, 0.15) !important;
                    stroke-width: 1.5px !important;
                }
            `;
            document.head.appendChild(style);
        }
    }, 300);
}
function renderPTSatisfactionDepartmentChart(containerId, departments, ratings, counts, percentages, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var totalRequests = 0;
    var totalPercentage = 0;

    for (var i = 0; i < counts.length; i++) {
        totalRequests += (counts[i] || 0);
        totalPercentage += (percentages[i] || 0);
    }

    var totalRequestsSpan = document.getElementById('satTotalRequests');
    var totalPercentSpan = document.getElementById('satTotalPercent');
    if (totalRequestsSpan) totalRequestsSpan.innerText = totalRequests;
    if (totalPercentSpan) totalPercentSpan.innerText = totalPercentage.toFixed(1);

    var deptPercentageMap = new Map();

    for (var i = 0; i < departments.length; i++) {
        var dept = departments[i];
        var percentage = percentages[i];

        deptPercentageMap.set(dept, {
            percentage: percentage
        });
    }

    var deptNames = [];
    var deptPercentages = [];

    for (var [dept, data] of deptPercentageMap) {
        deptNames.push(dept);
        deptPercentages.push(data.percentage);
    }

    var sortedData = [];
    for (var j = 0; j < deptNames.length; j++) {
        sortedData.push({
            name: deptNames[j],
            percentage: deptPercentages[j]
        });
    }
    sortedData.sort((a, b) => b.percentage - a.percentage);

    var sortedNames = sortedData.map(item => item.name);
    var sortedValues = sortedData.map(item => item.percentage);

    var hasData = sortedValues.some(v => v > 0);

    var options = {
        chart: {
            type: 'line',
            height: '100%',
            width: '100%',        // TYPE THIS
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            zoom: { enabled: false },     // TYPE THIS
            panning: { enabled: false },  // TYPE THIS
        },
        colors: ['#10b981'],
        series: [{
            name: 'Satisfaction %',
            data: sortedValues
        }],
        dataLabels: {
            enabled: true,
            offsetY: -15,
            formatter: (val) => val.toFixed(1) + '%',
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            colors: ['#10b981']
        },
        markers: {
            size: 5,
            colors: ['#10b981'],
            strokeColors: '#ffffff',
            strokeWidth: 2,
            hover: { size: 7 }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.1,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            x: { show: true },        // TYPE THIS
            y: {
                formatter: (val) => val.toFixed(1) + '%'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: sortedNames,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                rotate: -45,
                trim: true
            }
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val) + '%'
            },
            title: {
                text: 'Satisfaction Percentage (%)',
                style: { color: COLORS.text.light, fontSize: '11px', fontWeight: 500 }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
    window.ptSatisfactionChart = chart;

    setTimeout(function () {
        var styleId = containerId + '-satisfaction-line-glow';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                #${containerId} .apexcharts-line-series .apexcharts-series path {
                    stroke: #10b981 !important;
                    stroke-width: 3px !important;
                    filter: 
                        drop-shadow(0 0 8px #10b981)
                        drop-shadow(0 0 4px #10b981) !important;
                }
                
                #${containerId} .apexcharts-line-series .apexcharts-marker {
                    stroke: #ffffff !important;
                    stroke-width: 2px !important;
                    fill: #10b981 !important;
                    filter: 
                        drop-shadow(0 0 8px #10b981)
                        drop-shadow(0 0 4px #10b981) !important;
                }
                
                #${containerId} .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-width: 1.5px !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                #${containerId} .apexcharts-grid-borders line {
                    stroke: rgba(255, 255, 255, 0.15) !important;
                    stroke-width: 1.5px !important;
                }
            `;
            document.head.appendChild(style);
        }
    }, 300);
}

function renderPTWaitChart(containerId, categories, peakValues, normalValues, peakColor, normalColor, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var hasData = peakValues.some(v => v > 0) || normalValues.some(v => v > 0);
    var allValues = [...peakValues, ...normalValues];
    var maxValue = hasData ? Math.max(...allValues) * 1.1 : 100;

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: [peakColor, normalColor],
        series: [
            { name: 'Peak Hours (9AM-5PM)', data: peakValues },
            { name: 'Normal Hours', data: normalValues }
        ],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 4,
                dataLabels: { position: 'center' }
            }
        },
        dataLabels: {
            enabled: hasData,
            formatter: (val) => Math.round(val) + 'm',
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            show: true,
            width: 4,
            colors: [peakColor, normalColor],
            lineCap: 'round'
        },
        fill: {
            opacity: 0
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => Math.round(val) + ' minutes'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                rotate: -45,
                trim: true
            }
        },
        yaxis: {
            min: 0,
            max: maxValue,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val) + 'm'
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
    window.ptWaitChart = chart;

    setTimeout(function () {
        var styleId = containerId + '-wait-glow';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                /* Target all bar paths with REDUCED WHITE glow */
                #${containerId} .apexcharts-bar-series path {
                    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.4)) !important;
                }
                
                #${containerId} .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-width: 1.5px !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                #${containerId} .apexcharts-grid-borders line {
                    stroke: rgba(255, 255, 255, 0.15) !important;
                    stroke-width: 1.5px !important;
                }
            `;
            document.head.appendChild(style);
        }
    }, 500);
}

function loadPredictiveDashboard() {
    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = '';
    var departmentIds = '';
    var ServiceCode = sessionStorage.getItem('ServiceCode') || '1';

    $('.loaderElement').css("display", "inline-block");

    $('#EscalationChart').html(`
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:600px; background:linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%); border-radius:24px; border:1px solid rgba(255,255,255,0.12);">
        <div style="background:rgba(255, 255, 255, 0.08); padding:40px; border-radius:30px; backdrop-filter:blur(8px); border:1.5px solid rgba(255,255,255,0.12); box-shadow:0 20px 35px -5px rgba(0,0,0,0.3);">
            <div style="position:relative; width:70px; height:70px; margin:0 auto;">
                <div style="position:absolute; top:0; left:0; right:0; bottom:0; border:3px solid rgba(255,255,255,0.15); border-top:3px solid #b794f4; border-radius:50%; animation:spin 1s linear infinite; box-shadow:0 0 15px rgba(183, 148, 244, 0.3);"></div>
                <div style="position:absolute; top:5px; left:5px; right:5px; bottom:5px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #9f7aea; border-radius:50%; animation:spin 1.5s linear infinite reverse;"></div>
            </div>
            <p style="margin-top:25px; color:#ffffff; font-size:18px; font-weight:600; letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.2);">Loading Demand & Capacity Dashboard...</p>
            <p style="margin-top:8px; color:rgba(255,255,255,0.6); font-size:14px; font-weight:400;">Real-time performance metrics and analytics</p>
        </div>
    </div>
    <style>
        @keyframes spin { 
            0% { transform:rotate(0deg); } 
            100% { transform:rotate(360deg); } 
        }
    </style>
`);


    $.when(
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("FORECAST_NEXT7DAYS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("PEAK_FORECAST")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("CAPACITY_GAP")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("DEMAND_FACTORS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        })
    ).then(function (forecastData, peakData, capacityData, factorData) {

        renderPredictiveDashboard(forecastData[0], peakData[0], capacityData[0], factorData[0]);
        setTimeout(function () {
            $('.loaderElement').css("display", "none");
        }, 500);
    }).fail(function (xhr, status, error) {
        console.error("Predictive data load failed:", error);
        renderPredictiveDashboard(null, null, null, null);
        $('.loaderElement').css("display", "none");
    });
}

function renderPredictiveDashboard(forecastData, peakData, capacityData, factorData) {

    const COLORS = {
        primary: "#3a5be0",
        secondary: "#6a0dad",
        tertiary: "#e01e6a",
        quaternary: "#3ab5e0",
        warning: "#e05a2e",
        success: "#05b58c",
        text: {
            primary: "#ffffff",
            secondary: "#e0e0e0",
            light: "#c0c0c0"
        },
        background: {
            main: "linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%)",
            card: "rgba(255, 255, 255, 0.08)",
            border: "rgba(255, 255, 255, 0.12)"
        },
        forecastColor: "#3a5be0",     
        peakColor: "#f72585",         
        requiredColor: "#8B5CF6",     
        availableColor: "#e05a2e",    
        chartColors: ["#3a5be0", "#f72585", "#e05a2e", "#10b981", "#6a0dad"]
    };

    var forecastDays = [];
    var forecastValues = [];

    if (forecastData && forecastData.length > 0) {
        forecastData.forEach(item => {
            forecastDays.push(item.DAY || 'Unknown');
            forecastValues.push(item.FORECAST_TASKS || 0);
        });
    }

    var peakDays = [];
    var peakValues = [];

    if (peakData && peakData.length > 0) {
        peakData.forEach(item => {
            peakDays.push(item.DAY || 'Unknown');
            peakValues.push(item.PEAK_TASKS || 0);
        });
    }

    var capacityRequired = 0;
    var capacityAvailable = 0;
    var capacityDay = '';

    if (capacityData && capacityData.length > 0) {
        capacityRequired = capacityData[0].REQUIRED_STAFF || 0;
        capacityAvailable = capacityData[0].AVAILABLE_STAFF || 0;
        capacityDay = capacityData[0].DAY || '';
    }

    var factorPieData = [];

    if (factorData && factorData.length > 0) {
        factorData.forEach(item => {
            var percent = item.FACTOR_PERCENT || 0;
            if (percent > 0) {
                factorPieData.push({
                    name: item.TIME_FACTOR || 'Unknown',
                    value: percent,
                    percentage: percent
                });
            }
        });
    }

    var dashboardHTML = `
        <div class="predictive-dashboard">
            <style>
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 300;
                    src: url('../webfonts/Inter-Light.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 400;
                    src: url('../webfonts/Inter-Regular.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 500;
                    src: url('../webfonts/Inter-Medium.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 600;
                    src: url('../webfonts/Inter-SemiBold.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 700;
                    src: url('../webfonts/Inter-Bold.woff2') format('woff2');
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                
                .predictive-dashboard {
                    padding: 30px;
                    background: ${COLORS.background.main};
                    min-height: 100vh;
                }
                
                /* Grid Layout - 2 columns */
                .predictive-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 25px;
                }
                
                /* Dashboard Cards */
                .predictive-card {
                    background: ${COLORS.background.card};
                    border-radius: 28px;
                    padding: 24px;
                    border: 1.5px solid ${COLORS.background.border};
                    transition: all 0.2s ease;
                    height: 420px;
                    display: flex;
                    flex-direction: column;
                }
                
                .predictive-card:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                }
                
                .card-header {
                    margin-bottom: 15px;
                }
                
                .card-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: ${COLORS.text.primary};
                    margin: 0 0 4px 0;
                }
                
                .card-subtitle {
                    font-size: 15px;
                    font-weight: 400;
                    color: ${COLORS.text.light};
                }
                
                .card-content {
                    flex: 1;
                    min-height: 0;
                    width: 100%;
                }
                
                /* Chart Containers */
                #forecastChart, #peakChart, #capacityChart, #factorsChart {
                    width: 100%;
                    height: 100%;
                }
                
                /* CHART GLOW EFFECTS */
                #forecastChart .apexcharts-area-series .apexcharts-series path {
                    filter: drop-shadow(0 0 8px ${COLORS.forecastColor}) drop-shadow(0 0 4px ${COLORS.forecastColor});
                }
                
                #forecastChart .apexcharts-area-series .apexcharts-series .apexcharts-marker {
                    filter: drop-shadow(0 0 8px ${COLORS.forecastColor}) drop-shadow(0 0 4px ${COLORS.forecastColor});
                }
                
                #peakChart .apexcharts-bar-area {
                    filter: drop-shadow(0 0 8px ${COLORS.peakColor}) drop-shadow(0 0 4px ${COLORS.peakColor});
                }
                
                #capacityChart .apexcharts-bar-area {
                    filter: drop-shadow(0 0 8px ${COLORS.requiredColor}) drop-shadow(0 0 4px ${COLORS.requiredColor});
                }
                
                #factorsChart .apexcharts-pie-area {
                    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)) !important;
                }
                
                /* TOOLTIP STYLES */
                .apexcharts-tooltip {
                    background: #000000 !important;
                    border: 1px solid #333333 !important;
                    border-radius: 8px !important;
                    color: white !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8) !important;
                    padding: 6px 10px !important;
                }
                
                .apexcharts-tooltip-title {
                    background: #111111 !important;
                    border-bottom: 1px solid #333333 !important;
                    color: #CCCCCC !important;
                    font-size: 12px !important;
                    font-weight: 500 !important;
                    padding: 4px 8px !important;
                    margin: -6px -10px 4px -10px !important;
                    border-radius: 8px 8px 0 0 !important;
                }
                
                .apexcharts-tooltip-series-group {
                    padding: 3px 0 !important;
                }
                
                .apexcharts-tooltip-marker {
                    width: 10px !important;
                    height: 10px !important;
                    border-radius: 3px !important;
                    margin-right: 6px !important;
                }
                
                .apexcharts-tooltip-text {
                    color: #FFFFFF !important;
                    font-size: 12px !important;
                }
                
                /* Grid lines */
                .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-width: 1.5px !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                .apexcharts-grid-borders line {
                    stroke: rgba(255, 255, 255, 0.15) !important;
                    stroke-width: 1.5px !important;
                }
            </style>

            <!-- Row 1: Demand Forecast + Capacity vs Demand -->
            <div class="predictive-grid">
                <!-- Demand Forecast - Line Chart (like Task Volume) -->
                <div class="predictive-card">
                    <div class="card-header">
                        <div class="card-title">Demand Forecast</div>
                        <div class="card-subtitle">Next 7 days</div>
                    </div>
                    <div class="card-content">
                        <div id="forecastChart"></div>
                    </div>
                </div>

                <!-- Current Capacity vs Demand - Horizontal Bars (like Bottleneck) -->
                <div class="predictive-card">
                    <div class="card-header">
                        <div class="card-title">Current Capacity vs Demand</div>
                        <div class="card-subtitle">By department</div>
                    </div>
                    <div class="card-content">
                        <div id="capacityChart"></div>
                    </div>
                </div>
            </div>

            <!-- Row 2: Peak Period Forecast + Demand Factors -->
            <div class="predictive-grid">
                <!-- Peak Period Forecast - Bar Chart (like SLA Violations) -->
                <div class="predictive-card">
                    <div class="card-header">
                        <div class="card-title">Peak Period Forecast</div>
                        <div class="card-subtitle">Busiest hours</div>
                    </div>
                    <div class="card-content">
                        <div id="peakChart"></div>
                    </div>
                </div>

                <!-- Demand Factors - Pie Chart (like Department Workload) -->
                <div class="predictive-card">
                    <div class="card-header">
                        <div class="card-title">Demand Factors</div>
                        <div class="card-subtitle">Breakdown of demand types</div>
                    </div>
                    <div class="card-content">
                        <div id="factorsChart"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#EscalationChart').html(dashboardHTML);

    setTimeout(() => {
        if (typeof ApexCharts !== 'undefined') {
            renderForecastLineChartDC('forecastChart', forecastDays, forecastValues, COLORS.forecastColor, COLORS);

            renderCapacityBarChartDC('capacityChart', capacityRequired, capacityAvailable, capacityDay, COLORS);

            renderPeakBarChartDC('peakChart', peakDays, peakValues, COLORS.peakColor, COLORS);

            renderFactorsPieChartDC('factorsChart', factorPieData, COLORS);
        }
    }, 500);
}

function renderForecastLineChartDC(containerId, categories, values, color, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var hasData = values.some(v => v > 0);

    var options = {
        chart: {
            type: 'area',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: [color],
        series: [{
            name: 'Forecast',
            data: values
        }],
        dataLabels: {
            enabled: hasData,
            offsetY: -15,
            formatter: (val) => val,
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            colors: [color]
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.1,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        markers: {
            size: hasData ? 5 : 0,
            colors: [color],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: { size: 7 }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            x: { show: true },
            y: { formatter: (val) => val + ' tasks' }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
}

function renderCapacityBarChartDC(containerId, required, available, day, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var categories = ['Required', 'Available'];
    var values = [required, available];
    var colors = [COLORS.requiredColor, COLORS.availableColor];

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: colors,
        series: [{
            name: 'Staff',
            data: values
        }],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '70%',
                borderRadius: 4,
                dataLabels: {
                    position: 'center'
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => val,
            offsetX: 0,
            style: {
                colors: ['#fff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            show: true,
            width: 3,
            colors: colors,
            lineCap: 'round'
        },
        fill: {
            opacity: 0 
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: { formatter: (val) => val + ' staff' }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: COLORS.text.primary,
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
}

function renderPeakBarChartDC(containerId, categories, values, color, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var hasData = values.some(v => v > 0);

    var roundedValues = values.map(v => Math.round(v));
    var maxValue = hasData ? Math.max(...roundedValues) * 1.2 : 10;

    var roundedMax = Math.ceil(maxValue / 10) * 10;

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: [color],
        series: [{
            name: 'Peak Hours',
            data: roundedValues 
        }],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 4,
                dataLabels: {
                    position: 'center' 
                }
            }
        },
        dataLabels: {
            enabled: hasData,
            offsetY: 0, 
            formatter: (val) => Math.round(val),
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            show: true,
            width: 3,
            colors: [color],
            lineCap: 'round'
        },
        fill: {
            opacity: 0 
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: { formatter: (val) => Math.round(val) + ' hours' } 
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.primary,
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        yaxis: {
            min: 0,
            max: roundedMax, 
            tickAmount: 5,
            labels: {
                formatter: (val) => Math.round(val), 
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
}

function renderFactorsPieChartDC(containerId, data, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<div style="color: white; text-align: center; padding: 20px;">No factor data</div>';
        return;
    }

    var uniqueData = [];
    var seen = new Map();

    data.forEach(item => {
        var name = item.TIME_FACTOR || item.name || 'Unknown';
        var percent = item.FACTOR_PERCENT || item.value || 0;

        if (!seen.has(name)) {
            seen.set(name, true);
            uniqueData.push({
                name: name,
                value: percent,
                percentage: percent
            });
        }
    });

    var formattedData = uniqueData.filter(item => item.value > 0);

    if (formattedData.length === 0) {
        container.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">No factor data</div>';
        return;
    }

    // Log to verify data is correct
    console.log('Formatted Data for Pie:', formattedData);

    var options = {
        chart: {
            type: 'donut',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent'
        },
        colors: COLORS.chartColors,
        series: formattedData.map(item => item.value),
        labels: formattedData.map(item => item.name),
        legend: { show: false },
        dataLabels: {
            enabled: true,
            formatter: function (val, opts) {
                return opts.w.config.series[opts.seriesIndex].toFixed(1) + '%';
            },
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                // CUSTOM TOOLTIP - Direct access to data
                var name = w.config.labels[seriesIndex];
                var value = series[seriesIndex];
                return '<div style="background: #000000; border: 1px solid #333333; border-radius: 8px; color: white; padding: 8px 12px; font-size: 12px; font-family: Inter, sans-serif;">' +
                       '<span style="font-weight: 600;">' + name + ':</span> ' + value.toFixed(1) + '%' +
                       '</div>';
            }
        },
        stroke: {
            show: true,
            width: 3.5,
            colors: COLORS.chartColors
        },
        fill: {
            opacity: 0 // HOLLOW
        },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '70%',
                    labels: { show: false }
                }
            }
        }
    };

    var chart = new ApexCharts(container, options);
    chart.render();

    // Add glow effect
    setTimeout(function () {
        var styleId = containerId + '-glow-style';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                #${containerId} .apexcharts-pie-area {
                    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }, 300);
}
function loadSLADashboard() {
    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = '';
    var departmentIds = '';
    var ServiceCode = sessionStorage.getItem('ServiceCode') || '1';

    $('.loaderElement').css("display", "inline-block");

    $('#EscalationChart').html(`
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:600px; background:linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%); border-radius:24px; border:1px solid rgba(255,255,255,0.12);">
        <div style="background:rgba(255, 255, 255, 0.08); padding:40px; border-radius:30px; backdrop-filter:blur(8px); border:1.5px solid rgba(255,255,255,0.12); box-shadow:0 20px 35px -5px rgba(0,0,0,0.3);">
            <div style="position:relative; width:70px; height:70px; margin:0 auto;">
                <div style="position:absolute; top:0; left:0; right:0; bottom:0; border:3px solid rgba(255,255,255,0.15); border-top:3px solid #b794f4; border-radius:50%; animation:spin 1s linear infinite; box-shadow:0 0 15px rgba(183, 148, 244, 0.3);"></div>
                <div style="position:absolute; top:5px; left:5px; right:5px; bottom:5px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #9f7aea; border-radius:50%; animation:spin 1.5s linear infinite reverse;"></div>
            </div>
            <p style="margin-top:25px; color:#ffffff; font-size:18px; font-weight:600; letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.2);">Loading SLA & Compliance Dashboard...</p>
            <p style="margin-top:8px; color:rgba(255,255,255,0.6); font-size:14px; font-weight:400;">Real-time performance metrics and analytics</p>
        </div>
    </div>
    <style>
        @keyframes spin { 
            0% { transform:rotate(0deg); } 
            100% { transform:rotate(360deg); } 
        }
    </style>
`);

    $.when(
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("SLA_VIOLATIONS_BY_DEPT")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("VIOLATION_CAUSES")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("SLA_TREND")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("RISK_LEVELS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        })
    ).then(function (violationsData, causesData, trendData, riskData) {
        renderSLADashboard(violationsData[0], causesData[0], trendData[0], riskData[0]);
        setTimeout(function () {
            $('.loaderElement').css("display", "none");
        }, 500);
    }).fail(function (xhr, status, error) {
        console.error("SLA data load failed:", error);
        renderSLADashboard(null, null, null, null);
        $('.loaderElement').css("display", "none");
    });
}

function renderSLADashboard(violationsData, causesData, trendData, riskData) {
    // EXACT PURPLE GRADIENT from executive dashboard
    const COLORS = {
        primary: "#3a5be0",
        secondary: "#6a0dad",
        tertiary: "#e01e6a",
        quaternary: "#3ab5e0",
        warning: "#e05a2e",
        success: "#05b58c",
        text: {
            primary: "#ffffff",
            secondary: "#e0e0e0",
            light: "#c0c0c0"
        },
        background: {
            main: "linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%)",
            card: "rgba(255, 255, 255, 0.08)",
            border: "rgba(255, 255, 255, 0.12)"
        },
        // Chart colors
        slaColor: "#10b981",           // GREEN for SLA trend
        violationColor: "#ef4444",      // RED for violations by department
        causeColor: "#f59e0b",          // ORANGE for violation causes
        riskColors: {
            high: "#ef4444",        // RED for high risk
            medium: "#f59e0b",       // ORANGE for medium risk
            low: "#3a5be0"           // BLUE for low risk
        }
    };

    // ========== SLA TREND - LINE CHART ==========
    var trendDays = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    var trendValues = [0, 0, 0, 0];

    if (trendData && trendData.length > 0) {
        trendData.forEach(function (item, index) {
            if (index < 4) {
                trendValues[index] = Math.round(parseFloat(item.SLA_PERCENT) || 0);
            }
        });
    }

    // ========== VIOLATIONS BY DEPARTMENT - HORIZONTAL HOLLOW BAR CHART ==========
    var deptCategories = [];
    var deptValues = [];
    var deptPercents = [];

    if (violationsData && violationsData.length > 0) {
        violationsData.forEach(function (item) {
            deptCategories.push(item.DEPARTMENT_NAME || 'Unknown');
            deptValues.push(Math.round(item.VIOLATION_COUNT || 0));
            deptPercents.push(parseFloat(item.VIOLATION_PERCENT) || 0);
        });
    }

    // ========== VIOLATION CAUSES - VERTICAL HOLLOW BAR CHART ==========
    var causeCategories = [];
    var causeValues = [];

    if (causesData && causesData.length > 0) {
        // Filter out zeros? No - keep all as per DB
        causesData.forEach(function (item) {
            // Truncate long names
            var name = item.CAUSE_CATEGORY || 'Unknown';
            if (name === 'Task Duration Exceeded') name = 'TAT Exceeded';
            if (name === 'No Porter Assigned') name = 'No Porter';
            causeCategories.push(name);
            causeValues.push(Math.round(item.CAUSE_COUNT || 0));
        });
    }

    // ========== RISK LEVELS - PIE CHART ==========
    var riskPieData = [];

    if (riskData && riskData.length > 0) {
        // Aggregate risk counts from all departments
        var totalHigh = 0, totalMedium = 0, totalLow = 0;

        riskData.forEach(function (item) {
            totalHigh += parseInt(item.HIGH_RISK) || 0;
            totalMedium += parseInt(item.MEDIUM_RISK) || 0;
            totalLow += parseInt(item.LOW_RISK) || 0;
        });

        // Add only if > 0
        if (totalHigh > 0) riskPieData.push({ name: 'High Risk', value: totalHigh });
        if (totalMedium > 0) riskPieData.push({ name: 'Medium Risk', value: totalMedium });
        if (totalLow > 0) riskPieData.push({ name: 'Low Risk', value: totalLow });
    }

    // Dashboard HTML
    var dashboardHTML = `
        <div class="sla-dashboard">
            <style>
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 300;
                    src: url('../webfonts/Inter-Light.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 400;
                    src: url('../webfonts/Inter-Regular.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 500;
                    src: url('../webfonts/Inter-Medium.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 600;
                    src: url('../webfonts/Inter-SemiBold.woff2') format('woff2');
                }
                @font-face {
                    font-family: 'Inter';
                    font-style: normal;
                    font-weight: 700;
                    src: url('../webfonts/Inter-Bold.woff2') format('woff2');
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                
                .sla-dashboard {
                    padding: 30px;
                    background: ${COLORS.background.main};
                    min-height: 100vh;
                }
                
                /* Grid Layout - 2 columns */
                .sla-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 25px;
                }
                
                /* Dashboard Cards */
                .sla-card {
                    background: ${COLORS.background.card};
                    border-radius: 28px;
                    padding: 24px;
                    border: 1.5px solid ${COLORS.background.border};
                    transition: all 0.2s ease;
                    height: 420px;
                    display: flex;
                    flex-direction: column;
                }
                
                .sla-card:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                }
                
                .card-header {
                    margin-bottom: 15px;
                }
                
                .card-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: ${COLORS.text.primary};
                    margin: 0 0 4px 0;
                }
                
                .card-subtitle {
                    font-size: 15px;
                    font-weight: 400;
                    color: ${COLORS.text.light};
                }
                
                .card-content {
                    flex: 1;
                    min-height: 0;
                    width: 100%;
                }
                
                /* Chart Containers */
                #slaTrendChartSLA, #deptViolationChartSLA, #causeChartSLA, #riskChartSLA {
                    width: 100%;
                    height: 100%;
                }
                
                /* NEON GLOW EFFECTS */
                #slaTrendChartSLA .apexcharts-line-series .apexcharts-series path {
                    filter: drop-shadow(0 0 8px #10b981) drop-shadow(0 0 12px #10b981);
                    stroke: #10b981 !important;
                    stroke-width: 3px !important;
                }
                
                #slaTrendChartSLA .apexcharts-line-series .apexcharts-series .apexcharts-marker {
                    filter: drop-shadow(0 0 8px #10b981) drop-shadow(0 0 12px #10b981);
                    stroke: #ffffff !important;
                    stroke-width: 2px !important;
                    fill: #10b981 !important;
                }
                
                #deptViolationChartSLA .apexcharts-bar-area {
                    filter: drop-shadow(0 0 8px #ef4444) drop-shadow(0 0 12px #ef4444);
                    stroke: #ef4444 !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                #causeChartSLA .apexcharts-bar-area {
                    filter: drop-shadow(0 0 8px #f59e0b) drop-shadow(0 0 12px #f59e0b);
                    stroke: #f59e0b !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                /* Risk Chart Colors */
                #riskChartSLA .apexcharts-pie-area[seriesindex="0"] {
                    filter: drop-shadow(0 0 8px #ef4444) drop-shadow(0 0 12px #ef4444);
                    stroke: #ef4444 !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                #riskChartSLA .apexcharts-pie-area[seriesindex="1"] {
                    filter: drop-shadow(0 0 8px #f59e0b) drop-shadow(0 0 12px #f59e0b);
                    stroke: #f59e0b !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                #riskChartSLA .apexcharts-pie-area[seriesindex="2"] {
                    filter: drop-shadow(0 0 8px #3a5be0) drop-shadow(0 0 12px #3a5be0);
                    stroke: #3a5be0 !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                /* White borders between pie slices */
                #riskChartSLA .apexcharts-pie line, 
                #riskChartSLA .apexcharts-pie circle {
                    stroke: #ffffff !important;
                    stroke-width: 2px !important;
                }
                
                /* TOOLTIP STYLES */
                .apexcharts-tooltip {
                    background: #000000 !important;
                    border: 1px solid #333333 !important;
                    border-radius: 8px !important;
                    color: white !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8) !important;
                    padding: 6px 10px !important;
                }
                
                .apexcharts-tooltip-title {
                    background: #111111 !important;
                    border-bottom: 1px solid #333333 !important;
                    color: #CCCCCC !important;
                    font-size: 12px !important;
                    font-weight: 500 !important;
                }
                
                /* Grid lines */
                .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-width: 1.5px !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                .apexcharts-grid-borders line {
                    stroke: rgba(255, 255, 255, 0.15) !important;
                    stroke-width: 1.5px !important;
                }
                
                .no-data-message {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    color: ${COLORS.text.light};
                    font-size: 14px;
                    text-align: center;
                }
            </style>

            <!-- Row 1: SLA Trend + Violations by Department -->
            <div class="sla-grid">
                <!-- SLA Trend - Line Chart (GREEN) -->
                <div class="sla-card">
                    <div class="card-header">
                        <div class="card-title">SLA Trend</div>
                        <div class="card-subtitle">Current month weekly compliance %</div>
                    </div>
                    <div class="card-content">
                        <div id="slaTrendChartSLA"></div>
                    </div>
                </div>

                <!-- Violations by Department - Horizontal Hollow Bar Chart (RED) -->
                <div class="sla-card">
                    <div class="card-header">
                        <div class="card-title">Violations by Department</div>
                        <div class="card-subtitle">Current month - View details in the Task Dashboard → ‘Violations by Department’ tab.</div>
                    </div>
                    <div class="card-content">
                        <div id="deptViolationChartSLA"></div>
                    </div>
                </div>
            </div>

            <!-- Row 2: Violation Causes + Risk Levels -->
            <div class="sla-grid">
                <!-- Violation Causes - Vertical Hollow Bar Chart (ORANGE) -->
                <div class="sla-card">
                    <div class="card-header">
                        <div class="card-title">Violation Causes</div>
                        <div class="card-subtitle">Current month root cause analysis</div>
                    </div>
                    <div class="card-content">
                        <div id="causeChartSLA"></div>
                    </div>
                </div>

                <!-- Risk Levels - Hollow Pie Chart -->
                <div class="sla-card">
                    <div class="card-header">
                        <div class="card-title">Risk Levels</div>
                        <div class="card-subtitle">Current month risk distribution</div>
                    </div>
                    <div class="card-content">
                        <div id="riskChartSLA"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#EscalationChart').html(dashboardHTML);

    // Render charts with retry mechanism
    setTimeout(function () {
        if (typeof ApexCharts === 'undefined') return;

        // SLA Trend Chart
        if (document.getElementById("slaTrendChartSLA")) {
            renderSLATrendChartSLA('slaTrendChartSLA', trendDays, trendValues, COLORS.slaColor, COLORS);
        }

            renderHorizontalBarChartSLA('deptViolationChartSLA', deptCategories, deptValues, COLORS.violationColor, 'Violations', COLORS);

        // Violation Causes - Vertical Hollow Bar Chart
        if (document.getElementById("causeChartSLA") && causeCategories.length > 0) {
            renderVerticalBarChartSLA('causeChartSLA', causeCategories, causeValues, COLORS.causeColor, 'Causes', COLORS);
        }

            renderRiskPieChartSLA('riskChartSLA', riskPieData, COLORS);
    }, 500);
}

// SLA Trend - Line Chart (GREEN)
function renderSLATrendChartSLA(containerId, categories, values, color, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var options = {
        chart: {
            type: 'line',
            height: '100%',
            width: '100%',        // TYPE THIS
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 },
            zoom: { enabled: false },     // TYPE THIS
            panning: { enabled: false },  // TYPE THIS
        },
        colors: [color],
        series: [{
            name: 'Compliance %',
            data: values
        }],
        dataLabels: {
            enabled: true,
            offsetY: -15,
            formatter: (val) => Math.round(val) + '%',
            style: {
                colors: ['#ffffff'],
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            colors: [color]
        },
        markers: {
            size: 5,
            colors: [color],
            strokeColors: '#ffffff',
            strokeWidth: 2,
            hover: { size: 7 }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.1,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            x: { show: true },        // TYPE THIS
            y: {
                formatter: (val) => Math.round(val) + '%'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                hideOverlappingLabels: true    // TYPE THIS
            }
        },
        yaxis: {
            min: 0,
            max: Math.max(100, ...values), // TYPE THIS
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val) + '%'
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
}

// Horizontal Hollow Bar Chart for Violations by Department
function renderHorizontalBarChartSLA(containerId, categories, values, color, yAxisLabel, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var maxValue = Math.max(...values, 1);
    var roundedMax = Math.ceil(maxValue / 10) * 10;

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: [color],
        series: [{
            name: yAxisLabel,
            data: values
        }],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '70%',
                borderRadius: 4,
                dataLabels: {
                    position: 'center'
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => Math.round(val),
            offsetX: 0,
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 2,
                color: '#fff',
                opacity: 0.1 // Subtle white glow on text
            }
        },
        stroke: {
            show: true,
            width: 2, // Slightly thicker for hollow effect
            colors: [color],
            lineCap: 'round'
        },
        fill: {
            opacity: 0 // HOLLOW
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => Math.round(val) + ' violations'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        xaxis: {
            categories: categories,
            min: 0,
            max: roundedMax,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val)
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: COLORS.text.primary,
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();

    setTimeout(function () {
        var styleId = containerId + '-bar-subtle-glow';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;

            var softerColor = color;

            style.innerHTML = `
                /* Make bar borders softer */
                #${containerId} .apexcharts-bar-series path {
                    stroke: ${color} !important;
                    stroke-width: 3px !important; 
                    fill: transparent !important;
                    filter: drop-shadow(0 0 3px rgba(255, 100, 100, 0.2)) 
                            drop-shadow(0 0 6px rgba(255, 100, 100, 0.1));
                }
                
                /* Add subtle white glow behind bars */
                #${containerId} .apexcharts-bar-series {
                    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.1));
                }
                
                /* Make data labels more visible but subtle */
                #${containerId} .apexcharts-datalabel {
                    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
                }
                            `;

            document.head.appendChild(style);
        }
    }, 300);
}

// VERTICAL Hollow Bar Chart for Violation Causes
function renderVerticalBarChartSLA(containerId, categories, values, color, yAxisLabel, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var maxValue = Math.max(...values, 1);
    var roundedMax = Math.ceil(maxValue / 10) * 10;

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: [color],
        series: [{
            name: yAxisLabel,
            data: values
        }],
        plotOptions: {
            bar: {
                horizontal: false, // VERTICAL
                columnWidth: '60%',
                borderRadius: 4,
                dataLabels: {
                    position: 'center' // Values inside the bar
                }
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: 0,
            formatter: (val) => Math.round(val),
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false }
        },
        stroke: {
            show: true,
            width: 3,
            colors: [color],
            lineCap: 'round'
        },
        fill: {
            opacity: 0 // HOLLOW
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => Math.round(val) + ' occurrences'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.primary,
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                rotate: -15,
                trim: true
            }
        },
        yaxis: {
            min: 0,
            max: roundedMax,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val)
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
}

// Risk Levels - Hollow Pie Chart with subtle white glow (reduced)
function renderRiskPieChartSLA(containerId, data, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">No risk data</div>';
        return;
    }

    // Map risk names to colors
    var colors = [];
    data.forEach(item => {
        if (item.name === 'High Risk') colors.push(COLORS.riskColors.high);
        else if (item.name === 'Medium Risk') colors.push(COLORS.riskColors.medium);
        else if (item.name === 'Low Risk') colors.push(COLORS.riskColors.low);
        else colors.push('#10b981');
    });

    // Get original values
    var originalValues = data.map(item => item.value);
    var totalOriginal = originalValues.reduce((a, b) => a + b, 0);

    var options = {
        chart: {
            type: 'donut',
            height: '90%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: colors,
        series: originalValues,
        labels: data.map(item => item.name),
        dataLabels: {
            enabled: true,
            formatter: function (val, { seriesIndex, w }) {
                return data[seriesIndex].value;
            },
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 1,
                color: '#fff',
                opacity: 0.02 // Very subtle white glow on text (2%)
            }
        },
        stroke: {
            show: true,
            width: 4, // Increased to 6 for thicker borders
            colors: colors
        },
        fill: {
            opacity: 0 // HOLLOW
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: function (val, { seriesIndex }) {
                    return val; // Use the value directly (fixes duplicate label issue)
                }
            }
        },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '70%',
                    labels: { show: false }
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();

    // Add subtle white glow effect (reduced opacity)
    setTimeout(function () {
        var styleId = containerId + '-subtle-white-glow';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;

            var glowStyles = '';
            data.forEach((item, index) => {
                var color = item.name === 'High Risk' ? COLORS.riskColors.high :
                    item.name === 'Medium Risk' ? COLORS.riskColors.medium :
                        item.name === 'Low Risk' ? COLORS.riskColors.low : '#10b981';

                // Keep colored strokes with very subtle white glow (reduced to 10-15%)
                glowStyles += `
                    #${containerId} .apexcharts-donut-slice-${index} {
                        filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.15)) 
                                drop-shadow(0 0 6px rgba(255, 255, 255, 0.1)) !important;
                    }
                    #${containerId} .apexcharts-donut-series path {
                        stroke: ${color} !important;
                        stroke-width: 8px !important;
                        fill: transparent !important;
                    }
                `;
            });

            style.innerHTML = glowStyles + `
                /* Ensure all slice paths have colored borders */
                #${containerId} .apexcharts-donut-series path {
                    stroke-width: 8px !important;
                    fill: transparent !important;
                }
                
                /* White borders between slices - very subtle */
                #${containerId} .apexcharts-donut-series line {
                    stroke: #ffffff !important;
                    stroke-width: 3px !important;
                    opacity: 0.3;
                    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.15));
                }
                
                /* Inner circle with very subtle white glow */
                #${containerId} .apexcharts-donut-circle {
                    stroke: rgba(255, 255, 255, 0.25) !important;
                    stroke-width: 2.5px !important;
                    fill: transparent !important;
                    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.1));
                }
                
                /* Very subtle white glow behind the entire chart */
                #${containerId} svg {
                    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.08));
                }
                
                /* Force slice colors for each series with thicker borders */
                ${data.map((item, index) => {
                var color = item.name === 'High Risk' ? COLORS.riskColors.high :
                    item.name === 'Medium Risk' ? COLORS.riskColors.medium :
                        item.name === 'Low Risk' ? COLORS.riskColors.low : '#10b981';
                return `
                        #${containerId} .apexcharts-donut-series[seriesindex="${index}"] path {
                            stroke: ${color} !important;
                            stroke-width: 8px !important;
                        }
                    `;
            }).join('')}
            `;
            document.head.appendChild(style);
        }
    }, 300);
}

function loadSafetyDashboard() {
    var userId = sessionStorage.getItem('ID') || 0;
    var locationIds = '';
    var departmentIds = '';
    var ServiceCode = sessionStorage.getItem('ServiceCode') || '1';

    $('.loaderElement').css("display", "inline-block");

    $('#EscalationChart').html(`
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:600px; background:linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%); border-radius:24px; border:1px solid rgba(255,255,255,0.12);">
        <div style="background:rgba(255, 255, 255, 0.08); padding:40px; border-radius:30px; backdrop-filter:blur(8px); border:1.5px solid rgba(255,255,255,0.12); box-shadow:0 20px 35px -5px rgba(0,0,0,0.3);">
            <div style="position:relative; width:70px; height:70px; margin:0 auto;">
                <div style="position:absolute; top:0; left:0; right:0; bottom:0; border:3px solid rgba(255,255,255,0.15); border-top:3px solid #b794f4; border-radius:50%; animation:spin 1s linear infinite; box-shadow:0 0 15px rgba(183, 148, 244, 0.3);"></div>
                <div style="position:absolute; top:5px; left:5px; right:5px; bottom:5px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #9f7aea; border-radius:50%; animation:spin 1.5s linear infinite reverse;"></div>
            </div>
            <p style="margin-top:25px; color:#ffffff; font-size:18px; font-weight:600; letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.2);">Loading Safety & Incidents Dashboard...</p>
            <p style="margin-top:8px; color:rgba(255,255,255,0.6); font-size:14px; font-weight:400;">Real-time performance metrics and analytics</p>
        </div>
    </div>
    <style>
        @keyframes spin { 
            0% { transform:rotate(0deg); } 
            100% { transform:rotate(360deg); } 
        }
    </style>
`);

    $.when(
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("INCIDENT_COUNTS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("INCIDENT_TYPES")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("INCIDENT_LOCATIONS")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        }),
        $.ajax({
            url: '../Index/Service/Service.aspx?PROCESS=' + encodeURIComponent(Encrypt("INCIDENT_TREND")) +
                "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) +
                "&UserId=" + encodeURIComponent(Encrypt(userId)) +
                "&LocationId=" + encodeURIComponent(Encrypt(locationIds)) +
                "&DepartmentId=" + encodeURIComponent(Encrypt(departmentIds)),
            type: 'POST',
            data: 'pData',
            dataType: 'json'
        })
    ).then(function (countsData, typesData, locationsData, trendData) {
        renderSafetyDashboard(countsData[0], typesData[0], locationsData[0], trendData[0]);
        setTimeout(function () {
            $('.loaderElement').css("display", "none");
        }, 500);
    }).fail(function (xhr, status, error) {
        console.error("Safety data load failed:", error);
        renderSafetyDashboard(null, null, null, null);
        $('.loaderElement').css("display", "none");
    });
}

function renderSafetyDashboard(countsData, typesData, locationsData, trendData) {
    // Check if data is null/undefined - NO FALLBACK VALUES, only show if data exists
    countsData = countsData || [];
    typesData = typesData || [];
    locationsData = locationsData || [];
    trendData = trendData || [];

    // EXACT COLOR PALETTE from your reference
    const COLORS = {
        // Bar chart colors
        falls: "#ef4444",        // RED for Falls vertical bars
        damage: "#f59e0b",       // ORANGE for Damage
        critical: "#10b981",      // GREEN for Critical

        // Location colors
        locationIcu: "#f59e0b",   // ORANGE for ICU
        locationRadiology: "#f59e0b", // ORANGE for Radiology
        locationEr: "#f59e0b",    // ORANGE for ER

        // Trend color
        trend: "#8b5cf6",         // PURPLE for trend line

        // Chart colors array
        chart: ["#ef4444", "#f59e0b", "#10b981"], // RED, ORANGE, GREEN for pie

        text: {
            primary: "#ffffff",
            secondary: "#e0e0e0",
            light: "#c0c0c0"
        },
        background: {
            main: "linear-gradient(180deg, #5B2A86 0%, #4A2578 50%, #3A1E66 100%)",
            card: "rgba(255, 255, 255, 0.08)",
            border: "rgba(255, 255, 255, 0.12)"
        }
    };

    // ========== INCIDENT COUNTS - RED VERTICAL BARS ==========
    var falls = 0, damage = 0, critical = 0;
    var hasCountsData = false;

    if (countsData && countsData.length > 0) {
        falls = countsData[0].FALLS || 0;
        damage = countsData[0].DAMAGE || 0;
        critical = countsData[0].CRITICAL || 0;
        hasCountsData = (falls + damage + critical) > 0;
    }

    // ========== INCIDENT TYPES - PIE CHART DATA ==========
    var typesPieData = [];
    if (hasCountsData) {
        typesPieData = [
            { name: 'Falls', value: falls },
            { name: 'Damage', value: damage },
            { name: 'Critical', value: critical }
        ];
    }

    // ========== INCIDENT LOCATIONS - HORIZONTAL BAR CHART (ORANGE) ==========
    var locationCategories = [];
    var locationValues = [];
    var hasLocationsData = false;

    if (locationsData && locationsData.length > 0) {
        locationsData.forEach(function (item) {
            if (item && item.LOCATION_NAME) {
                locationCategories.push(item.LOCATION_NAME);
                locationValues.push(item.INCIDENT_COUNT || 0);
                hasLocationsData = true;
            }
        });
    }

    // ========== INCIDENT TREND - LINE CHART (PURPLE) ==========
    var trendCategories = [];
    var trendValues = [];
    var hasTrendData = false;

    if (trendData && trendData.length > 0) {
        trendData.forEach(function (item) {
            if (item && item.WEEK_LABEL) {
                trendCategories.push(item.WEEK_LABEL);
                trendValues.push(parseInt(item.INCIDENTS) || 0);
                hasTrendData = true;
            }
        });
    }

    // Dashboard HTML with purple gradient background
    var dashboardHTML = `
        <div class="safety-dashboard">
            <style>
                @font-face {
                    font-family: 'Inter';
                    src: url('../webfonts/Inter-Regular.woff2');
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                
                .safety-dashboard {
                    padding: 30px;
                    background: ${COLORS.background.main};
                    min-height: 100vh;
                }
                
                .safety-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 25px;
                }
                
                .safety-card {
                    background: ${COLORS.background.card};
                    border-radius: 28px;
                    padding: 24px;
                    border: 1.5px solid ${COLORS.background.border};
                    transition: all 0.2s ease;
                    height: 430px;
                    display: flex;
                    flex-direction: column;
                }
                
                .safety-card:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                
                .card-header {
                    margin-bottom: 15px;
                }
                
                .card-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: ${COLORS.text.primary};
                    margin: 0 0 4px 0;
                }
                
                .card-subtitle {
                    font-size: 15px;
                    font-weight: 400;
                    color: ${COLORS.text.light};
                }
                
                .card-content {
                    flex: 1;
                    min-height: 0;
                    width: 100%;
                }
                
                /* Chart Containers */
                #incidentCountsChart, #incidentTypesChart, #incidentLocationsChart, #incidentTrendChart {
                    width: 100%;
                    height: 100%;
                }
                
                /* NEON GLOW EFFECTS - 20% opacity */
                #incidentCountsChart .apexcharts-bar-area {
                    filter: drop-shadow(0 0 4px #ef4444) drop-shadow(0 0 8px #ef4444) !important;
                    stroke: #ef4444 !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                #incidentLocationsChart .apexcharts-bar-area {
                    filter: drop-shadow(0 0 4px #f59e0b) drop-shadow(0 0 8px #f59e0b) !important;
                    stroke: #f59e0b !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                #incidentTrendChart .apexcharts-line-series path {
                    filter: drop-shadow(0 0 4px #8b5cf6) drop-shadow(0 0 8px #8b5cf6) !important;
                    stroke: #8b5cf6 !important;
                    stroke-width: 3px !important;
                }
                
                #incidentTrendChart .apexcharts-marker {
                    filter: drop-shadow(0 0 4px #8b5cf6) drop-shadow(0 0 8px #8b5cf6) !important;
                    fill: #8b5cf6 !important;
                    stroke: #ffffff !important;
                    stroke-width: 2px !important;
                }
                
                /* Pie Chart Colors with Neon */
                #incidentTypesChart .apexcharts-pie-area[seriesindex="0"] {
                    filter: drop-shadow(0 0 4px #ef4444) drop-shadow(0 0 8px #ef4444) !important;
                    stroke: #ef4444 !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                #incidentTypesChart .apexcharts-pie-area[seriesindex="1"] {
                    filter: drop-shadow(0 0 4px #f59e0b) drop-shadow(0 0 8px #f59e0b) !important;
                    stroke: #f59e0b !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                #incidentTypesChart .apexcharts-pie-area[seriesindex="2"] {
                    filter: drop-shadow(0 0 4px #10b981) drop-shadow(0 0 8px #10b981) !important;
                    stroke: #10b981 !important;
                    stroke-width: 3px !important;
                    fill: transparent !important;
                }
                
                /* White borders between pie slices */
                #incidentTypesChart .apexcharts-pie line, 
                #incidentTypesChart .apexcharts-pie circle {
                    stroke: #ffffff !important;
                    stroke-width: 2px !important;
                }
                
                /* TOOLTIP STYLES */
                .apexcharts-tooltip {
                    background: #000000 !important;
                    border: 1px solid #333333 !important;
                    border-radius: 8px !important;
                    color: white !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8) !important;
                    padding: 6px 10px !important;
                }
                
                .apexcharts-tooltip-title {
                    background: #111111 !important;
                    border-bottom: 1px solid #333333 !important;
                    color: #CCCCCC !important;
                }
                
                /* Grid lines */
                .apexcharts-grid line {
                    stroke: rgba(255, 255, 255, 0.1) !important;
                    stroke-dasharray: 4 4 !important;
                }
                
                .no-data-message {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    color: ${COLORS.text.light};
                    font-size: 14px;
                    text-align: center;
                }
            </style>

            <!-- Row 1: Incident Counts + Incident Types -->
            <div class="safety-grid">
                <!-- Incident Counts - RED Vertical Bars -->
                <div class="safety-card">
                    <div class="card-header">
                        <div class="card-title">Incident Counts</div>
                        <div class="card-subtitle">By severity</div>
                    </div>
                    <div class="card-content">
                        <div id="incidentCountsChart"></div>
                    </div>
                </div>

                <!-- Incident Types - Hollow Pie Chart (RED, ORANGE, GREEN) -->
                <div class="safety-card">
                    <div class="card-header">
                        <div class="card-title">Incident Types</div>
                        <div class="card-subtitle">Distribution by category</div>
                    </div>
                    <div class="card-content">
                        ${hasCountsData ?
            '<div id="incidentTypesChart"></div>' :
            '<div class="no-data-message">No incident data available</div>'}
                    </div>
                </div>
            </div>

            <!-- Row 2: Incident Locations + Incident Trend -->
            <div class="safety-grid">
                <!-- Incident Locations - ORANGE Horizontal Bars -->
                <div class="safety-card">
                    <div class="card-header">
                        <div class="card-title">Incident Locations</div>
                        <div class="card-subtitle">Top areas</div>
                    </div>
                    <div class="card-content">
                        ${hasLocationsData ?
            '<div id="incidentLocationsChart"></div>' :
            '<div class="no-data-message">No location data available</div>'}
                    </div>
                </div>

                <!-- Incident Trend - PURPLE Line Chart -->
                <div class="safety-card">
                    <div class="card-header">
                        <div class="card-title">Incident Trend</div>
                        <div class="card-subtitle">Last 4 weeks</div>
                    </div>
                    <div class="card-content">
                        ${hasTrendData ?
            '<div id="incidentTrendChart"></div>' :
            '<div class="no-data-message">No trend data available</div>'}
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#EscalationChart').html(dashboardHTML);

    // Render charts with retry mechanism
    setTimeout(function () {
        if (typeof ApexCharts === 'undefined') return;

            renderIncidentCountsChart('incidentCountsChart', falls, damage, critical, COLORS);

            renderIncidentTypesPieChart('incidentTypesChart', typesPieData, COLORS);

        // Incident Locations - ORANGE Horizontal Hollow Bar Chart
        if (document.getElementById("incidentLocationsChart") && hasLocationsData) {
            renderIncidentLocationsChart('incidentLocationsChart', locationCategories, locationValues, COLORS.locationIcu, 'Incidents', COLORS);
        }

        // Incident Trend - PURPLE Line Chart
        if (document.getElementById("incidentTrendChart") && hasTrendData) {
            renderIncidentTrendChart('incidentTrendChart', trendCategories, trendValues, COLORS.trend, COLORS);
        }
    }, 500);
}

// ========== INCIDENT COUNTS - RED VERTICAL HOLLOW BAR CHART ==========
function renderIncidentCountsChart(containerId, falls, damage, critical, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: [COLORS.falls, COLORS.damage, COLORS.critical],
        series: [{
            name: 'Incidents',
            data: [falls, damage, critical]
        }],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 6,
                distributed: true,
                dataLabels: {
                    position: 'center'
                }
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: 0,
            formatter: (val) => Math.round(val),
            style: {
                colors: ['#ffffff'],
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 2,
                color: '#fff',
                opacity: 0.1
            }
        },
        stroke: {
            show: true,
            width: 3,
            colors: [COLORS.falls, COLORS.damage, COLORS.critical],
            lineCap: 'round'
        },
        fill: {
            opacity: 0 // HOLLOW
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => Math.round(val) + ' incidents'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: ['Falls', 'Damage', 'Critical'],
            labels: {
                style: {
                    colors: COLORS.text.primary,
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        yaxis: {
            min: 0,
            max: Math.max(falls, damage, critical, 5),
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val)
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
}

// ========== INCIDENT TYPES - HOLLOW PIE CHART ==========
function renderIncidentTypesPieChart(containerId, data, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0) return;

    var colors = [COLORS.falls, COLORS.damage, COLORS.critical];
    var values = data.map(item => item.value);

    var options = {
        chart: {
            type: 'donut',
            height: '80%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: colors,
        series: values,
        labels: data.map(item => item.name),
        dataLabels: {
            enabled: true,
            formatter: function (val, { seriesIndex, w }) {
                return data[seriesIndex].value;
            },
            style: {
                colors: ['#ffffff'],
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 3,
                color: '#fff',
                opacity: 0.15
            }
        },
        stroke: {
            show: true,
            width: 3.5, // REDUCED from 5 to 3.5
            colors: colors
        },
        fill: {
            opacity: 0 // HOLLOW
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: function (val, { seriesIndex }) {
                    return data[seriesIndex].value + ' incidents';
                }
            }
        },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '55%',
                    labels: { show: false }
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();

    // ADD NEON GLOW EFFECT
    setTimeout(function () {
        var styleId = containerId + '-pie-neon-glow';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;

            var glowStyles = '';
            data.forEach((item, index) => {
                var color = index === 0 ? COLORS.falls :
                    index === 1 ? COLORS.damage :
                        COLORS.critical;

                glowStyles += `
                    #${containerId} .apexcharts-pie-area[seriesindex="${index}"] {
                        filter: drop-shadow(0 0 4px ${color}) 
                                drop-shadow(0 0 8px ${color})
                                drop-shadow(0 0 15px ${color})
                                drop-shadow(0 0 20px ${color}) !important;
                        stroke: ${color} !important;
                        stroke-width: 4.5px !important; /* REDUCED from 6px to 4.5px */
                        fill: transparent !important;
                    }
                `;
            });

            style.innerHTML = glowStyles + `
                /* White borders between slices */
                #${containerId} .apexcharts-pie line, 
                #${containerId} .apexcharts-pie circle {
                    stroke: #ffffff !important;
                    stroke-width: 2px !important; /* REDUCED from 2.5px to 2px */
                    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.7));
                }
                
                /* Inner circle glow */
                #${containerId} .apexcharts-pie circle {
                    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
                }
                
                /* Background glow for entire chart */
                #${containerId} svg {
                    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));
                }
                
                /* Force slice colors */
                ${data.map((item, index) => {
                var color = index === 0 ? COLORS.falls :
                    index === 1 ? COLORS.damage :
                        COLORS.critical;
                return `
                        #${containerId} .apexcharts-pie-area[seriesindex="${index}"] {
                            stroke: ${color} !important;
                        }
                    `;
            }).join('')}
            `;
            document.head.appendChild(style);
        }
    }, 300);
}

// ========== INCIDENT LOCATIONS - ORANGE HORIZONTAL HOLLOW BAR CHART ==========
function renderIncidentLocationsChart(containerId, categories, values, color, yAxisLabel, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var maxValue = Math.max(...values, 1);

    var options = {
        chart: {
            type: 'bar',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: [color],
        series: [{
            name: yAxisLabel,
            data: values
        }],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '70%',
                borderRadius: 6,
                dataLabels: {
                    position: 'center'
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => Math.round(val),
            offsetX: 0,
            style: {
                colors: ['#ffffff'],
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 2,
                color: '#fff',
                opacity: 0.1
            }
        },
        stroke: {
            show: true,
            width: 3,
            colors: [color],
            lineCap: 'round'
        },
        fill: {
            opacity: 0 // HOLLOW
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => Math.round(val) + ' incidents'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        xaxis: {
            categories: categories,
            min: 0,
            max: maxValue,
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val)
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: COLORS.text.primary,
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
}

// ========== INCIDENT TREND - PURPLE LINE CHART ==========
function renderIncidentTrendChart(containerId, categories, values, color, COLORS) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var options = {
        chart: {
            type: 'line',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: [color],
        series: [{
            name: 'Incidents',
            data: values
        }],
        dataLabels: {
            enabled: true,
            offsetY: -15,
            formatter: (val) => Math.round(val),
            style: {
                colors: ['#ffffff'],
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
            },
            background: { enabled: false },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 2,
                color: '#fff',
                opacity: 0.1
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            colors: [color]
        },
        markers: {
            size: 6,
            colors: [color],
            strokeColors: '#ffffff',
            strokeWidth: 2,
            hover: { size: 8 }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.1,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            y: {
                formatter: (val) => Math.round(val) + ' incidents'
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: COLORS.text.primary,
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        yaxis: {
            min: 0,
            max: Math.max(...values, 5),
            tickAmount: 5,
            labels: {
                style: {
                    colors: COLORS.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (val) => Math.round(val)
            }
        },
        legend: { show: false }
    };

    var chart = new ApexCharts(container, options);
    chart.render();
}
function RestartTimer() {
    Reload = window.setInterval(function () { AbortAllActiveRuquests(); ReloadLinks(); }, 500000);
}

//function RefreshTasks() {
//    LoaderOn(); clearInterval(Reload);
//    AbortAllActiveRuquests();
//    $('#search_PatientRemarks')[0].sumo.unSelectAll(); $('#search_PatientRemarks')[0].sumo.reload(); $('#search_PatientRemarks')[0].sumo.selectItem(0);
//    $('#search_TaskFields')[0].sumo.unSelectAll(); $('#search_TaskFields')[0].sumo.reload(); $('#search_TaskFields')[0].sumo.selectItem(0);
//    $('#txtSearchPatient').val(''); $('#txtSearchTask').val('');
//    pageIndex = 0;
//    LoadProcess(CProcess); ReloadLinks();
//    setRequestUsers('Tasks'); Reload = window.setInterval(function () { ReloadLinks(); }, 60000);
//    LoaderOff(500);

//}


//function roleWiseDashboard() {
//    var roleId = parseInt(sessionStorage.getItem("ROLE"));

//    if (typeof destroyAllCharts === 'function') {
//        destroyAllCharts();
//    }

//    const chartContainer = document.getElementById('EscalationChart');
//    if (chartContainer) {
//        chartContainer.innerHTML = '';
//    }

//    $('#divRequestHeaders').hide();
//    $('#divUserHeaders').hide();
//    $('#searchFiltersSection').hide();
//    $('#tasksTableSection').hide();
//    $('.table-wrap').hide();
//    $('#tblRequests').hide();

//    $('#EscalationChart').show();
//    $('.tab-content-wrapper').show();

//    var tabs = {
//        executive: $("#divExecutiveDashboard"),
//        commandCenter: $("#divCommandCenter"),
//        workforce: $("#divWorkforce"),
//        aiModules: $("#divAIModules"),
//        patientExp: $("#divPatientExp"),
//        predictive: $("#divPredictive"),
//        sla: $("#divSLA"),
//        safety: $("#divSafety"),
//        traczo: $("#divTraczo")
//    };

//    $.each(tabs, function (key, tab) {
//        tab.hide();
//    });

//    tabs.traczo.show();

//    if (roleId === 2) { //ADMIN

//        tabs.executive.show();
//        tabs.commandCenter.show();
//        tabs.workforce.show();
//        tabs.aiModules.show();
//        tabs.patientExp.show();
//        tabs.predictive.show();
//        tabs.sla.show();
//        tabs.safety.show();


//        if (!$('.dashboard-tab.active').length) {
//            setActiveTab(document.getElementById('divExecutiveDashboard'));
//        }

//    } else if (roleId === 14) { //NURSE
//        tabs.patientExp.show();
//        tabs.predictive.show();
//        tabs.sla.show();
//        tabs.traczo.show();
//        tabs.safety.show();

//        if (!$('.dashboard-tab.active').length) {
//            setActiveTab(document.getElementById('divPatientExp'));
//        }

//    } else if (roleId === 15) { //DEPARTMENT
//        tabs.executive.show();
//        tabs.commandCenter.show();
//        tabs.workforce.show();
//        tabs.traczo.hide();
//        tabs.aiModules.show();

//        if (!$('.dashboard-tab.active').length) {
//            setActiveTab(document.getElementById('divExecutiveDashboard'));
//        }

//    } else {

//        tabs.executive.show();
//        tabs.commandCenter.show();
//        tabs.workforce.show();
//        tabs.aiModules.show();
//        tabs.patientExp.show();
//        tabs.predictive.show();
//        tabs.sla.show();
//        tabs.safety.show();

//        if (!$('.dashboard-tab.active').length) {
//            setActiveTab(document.getElementById('divExecutiveDashboard'));
//        }
//    }

//    if (!$('.dashboard-tab.active').length && tabs.traczo.is(':visible')) {
//        setActiveTab(document.getElementById('divTraczo'));
//    }

//    const activeTab = document.querySelector('.dashboard-tab.active');
//    if (activeTab) {
//        const titleElement = document.getElementById('dashboardMainTitle');
//        const titleMap = {
//            'divExecutiveDashboard': 'Executive / Operations Dashboard',
//            'divCommandCenter': 'Department Command Center Dashboard',
//            'divWorkforce': 'Workforce Optimization Dashboard',
//            'divAIModules': 'AI Modules Dashboard',
//            'divPatientExp': 'Patient Experience Dashboard',
//            'divPredictive': 'Predictive Demand & Capacity Planning',
//            'divSLA': 'SLA & Compliance Intelligence Dashboard',
//            'divSafety': 'Safety & Incident Analytics',
//            'divTraczo': 'Task Dashboard'
//        };
//        if (titleMap[activeTab.id]) {
//            titleElement.textContent = titleMap[activeTab.id];
//        }
//    }
//}

//$(document).ready(function () {
//    if (typeof roleWiseDashboard === 'function') {
//        roleWiseDashboard();
//    }
//});


var lastUpdatedTime = new Date();
var timerInterval = null;

function updateLastUpdatedTime() {
    var now = new Date();
    var diffSeconds = Math.floor((now - lastUpdatedTime) / 1000);
    var timeText = '';

    if (diffSeconds < 10) {
        timeText = 'Just now';
    } else if (diffSeconds < 60) {
        timeText = diffSeconds + ' secs ago';
    } else if (diffSeconds < 3600) {
        var mins = Math.floor(diffSeconds / 60);
        timeText = mins + ' min' + (mins > 1 ? 's' : '') + ' ago';
    } else if (diffSeconds < 86400) {
        var hours = Math.floor(diffSeconds / 3600);
        timeText = hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
    } else {
        var days = Math.floor(diffSeconds / 86400);
        timeText = days + ' day' + (days > 1 ? 's' : '') + ' ago';
    }

    var lastUpdatedSpan = document.getElementById('lastUpdatedSpan');
    if (lastUpdatedSpan) {
        lastUpdatedSpan.textContent = timeText;
    }
}

function startLastUpdatedTimer() {
    lastUpdatedTime = new Date();
    updateLastUpdatedTime();

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(updateLastUpdatedTime, 1000);
}
function RefreshTasks() {
    LoaderOn();
    clearInterval(Reload);
    AbortAllActiveRuquests();

    lastUpdatedTime = new Date();
    updateLastUpdatedTime();

    var currentActiveTab = $('.dashboard-tab.active').attr('id');

    $('#search_PatientRemarks').val('');
    $('#search_TaskFields').val('');
    $('#txtSearchPatient').val('');
    $('#txtSearchTask').val('');

    pageIndex = 0;

    if (currentActiveTab === 'divExecutiveDashboard') {
        $('#EscalationChart').show();
        loadExecutiveDashboardInIndex();
    }
    else if (currentActiveTab === 'divCommandCenter') {
        $('#EscalationChart').show();
        loadDepartmentCommandCenter();
    }
    else if (currentActiveTab === 'divWorkforce') {
        $('#EscalationChart').show();
        loadWorkforceDashboard();
    }
    else if (currentActiveTab === 'divAIModules') {
        $('#EscalationChart').show();
        loadAIModulesDashboard();
    }
    else if (currentActiveTab === 'divPatientExp') {
        $('#EscalationChart').show();
        loadPatientExperienceDashboard();
    }
    else if (currentActiveTab === 'divPredictive') {
        $('#EscalationChart').show();
        loadPredictiveDashboard();
    }
    else if (currentActiveTab === 'divSLA') {
        $('#EscalationChart').show();
        loadSLADashboard();
    }
    else if (currentActiveTab === 'divSafety') {
        $('#EscalationChart').show();
        loadSafetyDashboard();
    }
    else if (currentActiveTab === 'divTraczo') {
        $('#EscalationChart').hide();
        loadTraczoView();
    }
    else {
        $('#divTraczo').addClass('active');
        $('#EscalationChart').hide();
        loadTraczoView();
    }

    Reload = window.setInterval(function () {
        ReloadLinks();
    }, 60000);

    LoaderOff(500);
}

function AbortAllActiveRuquests() {
    $($.xhrPool).each(function (i, jqXHR) {   //  cycle through list of recorded connection
        jqXHR.abort();  //  aborts connection
        $.xhrPool.splice(i, 1); //  removes from list by index
    });
}

function INQueryBuilder() {
    var PateintQuery = getValues('search_PatientRemarks', 'txtSearchPatient'), TaskQuery = getValues('search_TaskFields', 'txtSearchTask'),

        HaywoodQuery = '';//(IsHaywood) ? ' AND ( L.FLOORID IN (57,58,59,60,61,62)  ) ' : ' AND ( L.FLOORID NOT IN (57,58,59,60,61,62) ) ', //OR D.FLOORID IN (57,58,59,60,61,62)

    ServiceQuery = ' AND ( SERVICEID = ' + ServiceCode + ' ) ';
    var KitchenQueries = (ServiceCode == "2") ? getValuesdrp("search_Kitchen") : (ServiceCode == "3" && (!IsHaywood)) ? getValuesdrp("search_CleaningZone") : "";

    var finalQuery = ((PateintQuery.length > 0) ? ((TaskQuery.length > 0) ? ' AND ( ( ' + PateintQuery + ' ) OR ( ' + TaskQuery + ' ) ) ' : ' AND  ( ' + PateintQuery + ' ) ') : ((TaskQuery.length > 0) ? ' AND  ( ' + TaskQuery + ' ) ' : '')) + ((KitchenQueries.length > 0) ? ' AND  ( ' + KitchenQueries + ' ) ' : '') + HaywoodQuery + ServiceQuery;

    return finalQuery;
}

//function getValues(drpSumo, txtbox) {
//    var valSel = '', valTxt = $('#' + txtbox).val();
//    if (valTxt.length > 0) {
//        $('#' + drpSumo + '  option:selected').each(function (i) {
//            valSel += ((valSel.length > 0) ? " OR " : "") + setValue($(this).val(), valTxt);
//        });

//    }
//    return valSel;
//}

function getValues(drpSumo, txtbox) {
    var valSel = '';

    var $txtbox = $('#' + txtbox);
    if ($txtbox.length === 0) {
        return '';
    }

    var valTxt = $txtbox.val() || '';

    if (valTxt.length > 0) {
        var $drpSumo = $('#' + drpSumo);
        if ($drpSumo.length > 0) {
            $drpSumo.find('option:selected').each(function (i) {
                var optionVal = $(this).val();
                if (optionVal) {
                    valSel += ((valSel.length > 0) ? " OR " : "") + setValue(optionVal, valTxt);
                }
            });
        }
    }
    return valSel;
}

function getValuesdrp(drpSumo) {
    var valSel = '';
    $('#' + drpSumo + '  option:selected').each(function (i) {
        valSel += ((valSel.length > 0) ? " OR " : "") + setValue((($(this).val() == "SUPERVISOR") ? 'DBO.[FN_ROLEREQUIRED_CATEGORY](CM.ID,SERVICEID)' : 'KITCHEN'), $(this).val());
    });

    return valSel;
}
function setValue(columns, colvalue) {
    if (colvalue === 'SLA_VIOLATION') {

        return 'SLA_VIOLATION';
    }

    var columnArr = columns.split('#'), query = '';

    $.each(columnArr, function (index, value) {
        if (value.trim().length > 0) {
            if (value == 'R.REQUESTID') {
                query += ((query.length > 0) ? " OR " : "") + " ( " + value + " = '" + colvalue + "' ) ";
            } else {
                query += ((query.length > 0) ? " OR " : "") + " ( " + value + " like '%" + colvalue + "%' ) ";
            }
        }
    });
    return query;
}

function OnchangeFilter(drpID, txtID) {
    var drpLength = $('#' + drpID).find('option:selected').length, txtValue = $('#' + txtID).val();
    if (drpLength > 0) {
        if (txtValue.length == 0)
            $('#' + txtID).focus();
        else
            setIndexscreen();
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


function ReloadLinksButton() {
    var UID = sessionStorage.getItem('ID'), CountROLE = sessionStorage.getItem('ROLE');
    $.ajax({
        async: true,
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETCOUNT")) + "&USERID=" + encodeURIComponent(Encrypt(UID)) + "&ROLE=" + encodeURIComponent(Encrypt(CountROLE)) + "&ISHAYWOOD=" + encodeURIComponent(Encrypt(((IsHaywood) ? '1' : '0'))) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            if (data.length > 0) {
                var PendingCount = data[0].PENDING,
                    AssignedCount = data[0].ASSIGNED,
                    InprogressCount = data[0].INPROGRESS,
                    CompletedCount = data[0].COMPLETED,
                    CancelledCount = data[0].CANCELLED,
                    OnHoldCount = data[0].PENDING_ONHOLD,
                    PreBookCount = data[0].PREBOOKED,
                    TATExceed = data[0].TATEXCEEDED,
                    BARRIER = data[0].BARRIER,
                    TotalCount = data[0].TOTAL,
                    SlaViolations = data[0].SLA_VIOLATIONS,
                    ActiveAlerts = data[0].ACTIVE_ALERTS,
                    Complaints = data[0].COMPLAINTS,
                    SlaViolationsByDept = data[0].SLA_VIOLATIONS_BY_DEPT;

                var pendingPercent = ((PendingCount * 100) / TotalCount).toString(),
                    AssignPercent = ((AssignedCount * 100) / TotalCount).toString(),
                    InprogressPercent = ((InprogressCount * 100) / TotalCount).toString(),
                    CompletedPercent = ((CompletedCount * 100) / TotalCount).toString();

                var TotCount = (TotalCount == null) ? 0 : TotalCount;

                $('#countTotalCount').html((TotalCount == null) ? '00' : (TotalCount.toString().length == 1) ? '0' + TotalCount.toString() : TotalCount.toString());

                $('#countPendingCount').html((PendingCount == null) ? '00' : (PendingCount.toString().length == 1) ? '0' + PendingCount.toString() : PendingCount.toString());

                $('#countAssignedCount').html((AssignedCount == null) ? '00' : (AssignedCount.toString().length == 1) ? '0' + AssignedCount.toString() : AssignedCount.toString());

                $('#countInprogressCount').html((InprogressCount == null) ? '00' : (InprogressCount.toString().length == 1) ? '0' + InprogressCount.toString() : InprogressCount.toString());

                $('#countCompletedCount').html((CompletedCount == null) ? '00' : (CompletedCount.toString().length == 1) ? '0' + CompletedCount.toString() : CompletedCount.toString());

                $('#countCancelledCount').text((CancelledCount == null) ? '00' : (CancelledCount.toString().length == 1) ? '0' + CancelledCount.toString() : CancelledCount.toString());

                $('#countPendingOnHoldCount').text((OnHoldCount == null) ? '00' : (OnHoldCount.toString().length == 1) ? '0' + OnHoldCount.toString() : OnHoldCount.toString());

                $('#countPreBookedCount').text((PreBookCount == null) ? '00' : (PreBookCount.toString().length == 1) ? '0' + PreBookCount.toString() : PreBookCount.toString());

                $('#countTATExceedCount').text((TATExceed == null) ? '00' : (TATExceed.toString().length == 1) ? '0' + TATExceed.toString() : TATExceed.toString());

                $('#countBarrierCount').text((BARRIER == null) ? '00' : (BARRIER.toString().length == 1) ? '0' + BARRIER.toString() : BARRIER.toString());

                $('#countSlaViolationsCount').text((SlaViolations == null) ? '00' : (SlaViolations.toString().length == 1) ? '0' + SlaViolations.toString() : SlaViolations.toString());

                $('#countActiveAlertsCount').text((ActiveAlerts == null) ? '00' : (ActiveAlerts.toString().length == 1) ? '0' + ActiveAlerts.toString() : ActiveAlerts.toString());

                $('#countComplaintsCount').text((Complaints == null) ? '00' : (Complaints.toString().length == 1) ? '0' + Complaints.toString() : Complaints.toString());

                $('#countSlaViolationsByDeptCount').text((SlaViolationsByDept == null) ? '00' : (SlaViolationsByDept.toString().length == 1) ? '0' + SlaViolationsByDept.toString() : SlaViolationsByDept.toString());

                if (data.length == 2) {
                    var OnDuty = data[1].ONDUTY, Busy = data[1].BUSY, OnBreak = data[1].ONBREAK, Max = data[1].MAX, Min = data[1].MIN, Avg = data[1].AVG;

                    var IdleCount = (parseInt(OnDuty) - (parseInt(Busy) + parseInt(OnBreak)));

                    $('#countOnDutyCount').text((OnDuty == null) ? '00' : (OnDuty.toString().length == 1) ? '0' + OnDuty.toString() : OnDuty.toString());

                    $('#countBusyCount').text((Busy == null) ? '00' : (Busy.toString().length == 1) ? '0' + Busy.toString() : Busy.toString());

                    $('#countOnBreakCount').text((OnBreak == null) ? '00' : (OnBreak.toString().length == 1) ? '0' + OnBreak.toString() : OnBreak.toString());

                    $('#countIdleCount').text((IdleCount == null) ? '00' : (IdleCount.toString().length == 1) ? '0' + IdleCount.toString() : IdleCount.toString());

                    $('#MaxTasks').text((Max == null) ? '00' : (Max.toString().length == 1) ? '0' + Max.toString() : Max.toString());

                    $('#MinTasks').text((Min == null) ? '00' : (Min.toString().length == 1) ? '0' + Min.toString() : Min.toString());

                } else {
                    $('#countOnDutyCount').text('00');
                    $('#countBusyCount').text('00');
                    $('#countOnBreakCount').text('00');
                    $('#countIdleCount').text('00');
                    $('#MaxTasks').text('00');
                    $('#MinTasks').text('00');

                    $('#countSlaViolationsCount').text('00');
                    $('#countActiveAlertsCount').text('00');
                    $('#countComplaintsCount').text('00');
                    $('#countSlaViolationsByDeptCount').text('00');
                }
            }
        },
        error: function (data) {
            console.log('Error in ReloadLinksButton:', data);
            $('#countSlaViolationsCount').text('00');
            $('#countActiveAlertsCount').text('00');
            $('#countComplaintsCount').text('00');
            $('#countSlaViolationsByDeptCount').text('00');
        }
    });
}
function getCurdateTime(date) {
    var d;
    if (typeof (date) !== 'undefined' && date !== null && date.length > 0)
        d = new Date(date);
    else
        d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate(), Hour = d.getHours(), Minute = d.getMinutes();
    var time = (Hour < 10 ? '0' : '') + Hour + ':' + (Minute < 10 ? '0' : '') + Minute; // d.getHours() + ":" + d.getMinutes();// + ":" + dt.getSeconds();

    var date = d.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;

    return date + '_' + time;
}

function submitRequest() {
    var IsEdit = ((document.getElementById('HFERID').value).length > 0), ReqtrName = $('#txtRequestorName').val().trim(), From = $('#txtFromLoc').val().trim(), To = $('#txtToLoc').val().trim(), AuthName = $('#txtPatientName').val().trim();
    if (RFromID == '0' || From.length == 0) {
        $('#txtFromLoc').focus();
        $('#txtFromLoc').css('border', '2px solid red'); setTimeout(function () { $('#txtFromLoc').css('border', '1px solid rgb(248, 247, 247)'); }, 2500);
    }
    else if (RToID == '0' || To.length == 0) {
        $('#txtToLoc').focus();
        $('#txtToLoc').css('border', '2px solid red'); setTimeout(function () { $('#txtToLoc').css('border', '1px solid rgb(248, 247, 247)'); }, 2500);
    }
    else if (ReqCat == '0') {
        $('#txtSearchCat').focus();
        $('#containerCat').css('border', '2px solid red'); setTimeout(function () { $('#containerCat').css('border', '2px solid white'); }, 2500);
    }
    else if (ServiceCode == 3 && ReqCat == "73" && AuthName.length == 0) {
        $('#txtPatientName').focus(); $('#txtPatientName').css('border', '2px solid red');
        setTimeout(function () { $('#txtFromLoc').css('border', '1px solid rgb(248, 247, 247)'); }, 2500);
    }
    else if (ReqtrName.length == 0) {
        $('#txtRequestorName').focus(); $('#txtRequestorName').css('border', '2px solid red');; setTimeout(function () { $('#txtRequestorName').css('border', '1px solid rgb(248, 247, 247)'); }, 2500);
    }
    else {
        if (IsEdit)
            UpdateRequest();
        else
            InsertRequest();


        //LoadPresetRemarks();
    }



}

function InsertRequest() {
    AbortAllActiveRuquests();
    var UID = sessionStorage.getItem('ID');
    var PBDTime = (RPreBook == '1') ? formatDate('txtReqdate', 'txtReqTime') : '';
    var dlRemarkval = $('#search_Remarks').val(), dlRemarkTxt = selectedText('search_Remarks'); //$('#search_Remarks option:selected').text();
    var PatientName = $('#txtPatientName').val(), PatientHN = $('#txtPatientHNO').val(), PatientDOB = $('#txtPatientDOB').val(), ContactNo = $('#txtContactNumber').val(),
        Remarks = dlRemarkTxt + '_' + $('#txtRemarks').val();//, srcMulti = $('#chkMultiPorter').attr('src'), srcReturn = $('#chkReturnCalls').attr('src');
    var ReqtrName = $('#txtRequestorName').val().trim(), kitchen = $('#txtFromLoc').val().trim();


    //var IsMultiPorter = (srcMulti == "../images/NoMCheck.jpg") ? "0" : "1";
    //var IsReturn = (srcReturn == "../images/Return.png") ? "0" : "1";

    var qty = $('#txtQty').val();

    $.ajax({
        async: true,
        url: hurl + "SERVICE/Service.aspx?Process=" + encodeURIComponent(Encrypt("INSERTREQUEST"))+"&PBDATE=" + encodeURIComponent(Encrypt(PBDTime)) + "&CATEGORY=" + encodeURIComponent(Encrypt(ReqCat)) + "&FROM=" + encodeURIComponent(Encrypt(RFromID)) + "&TO=" + encodeURIComponent(Encrypt(RToID))
            + "&MULTIPORTER=" + encodeURIComponent(Encrypt(IsMTPR)) + "&PATIENTNAME=" + encodeURIComponent(Encrypt(PatientName + "_" + PatientHN + "_" + PatientDOB)) + "&REMARKS=" + encodeURIComponent(Encrypt(Remarks)) + "&USERID=" + encodeURIComponent(Encrypt(UID))
            + "&HALT1=" + encodeURIComponent(Encrypt(RHalt1)) + "&HALT2=" + encodeURIComponent(Encrypt(RHalt2)) + "&PRIORITY=" + encodeURIComponent(Encrypt("0")) + "&EXTRAFIELDS=" + encodeURIComponent(Encrypt(IsRTC + "_" + ContactNo)) + "&Qty=" + encodeURIComponent(Encrypt(qty))
            + "&REQUESTOR=" + encodeURIComponent(Encrypt(ReqtrName)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) + "&KITCHEN=" + encodeURIComponent(Encrypt(kitchen)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data[0].RESULT.split("_")[0] === 'TRUE' && PBDTime == '') {
                var ReqNB = data[0].RESULT.split("_")[1];

                if ((RHalt1 == '0' && RHalt2 == '0'))
                    $('#LBLRequestResult').html('Request Raised Successfully.. Req No. #' + ReqNB);
                else
                    $('#LBLRequestResult').html('Request(s) Raised Successfully.. Req Nos. ' + ReqNB);

                HideModalPopUp('addTask'); ShowModalPopUp('modalReqAlert');
                setTimeout("HideModalPopUp('modalReqAlert');", 3500);
                HideModalPopUp('modalReqAlert');// ReloadLinks(); ReloadLinksButton();
                //if (ReqCat !== '73')
                //    Select("divPendingPercentage", "PENDING");
                //else
                //    Select("divBarrierPercentage", "Barrier")
                //setRequestUsers('Tasks');
                RefreshTasks();

                //setTimeout(function () { ReloadLinksButton(); }, 500);
            }
            else if (PBDTime.length > 0) {

                $('#LBLRequestResult').html('Request pre-booked Successfully...');

                HideModalPopUp('addTask'); ShowModalPopUp('modalReqAlert');
                setTimeout("HideModalPopUp('modalReqAlert');", 3500);
                HideModalPopUp('modalReqAlert');// ReloadLinks();
                Select("divPrebookeddPercentage", "PREBOOKED"); setRequestUsers('Tasks');LoadProcess('100');

                //setTimeout(function () { ReloadLinksButton(); }, 500);
            }
            else if (data[0].RESULT.split("_")[0] === 'FALSE') {
                $('#spanErrorMessage').html('A similar/same request has already been raised.');
                ShowModalPopUp('modalAlert'); setTimeout("HideModalPopUp('modalAlert');", 3500);

            }

        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });
}

function UpdateRequest() {
    var ReqID = document.getElementById('HFERID').value, ReqNB = document.getElementById('HFERNO').value, StatusID = document.getElementById('HFStatusID').value;

    //var srcMitigation = $('#chkMitigation').attr('src')
    var IsMitigation = "0";// (srcMitigation == "../images/NoMCheck.jpg") ? "0" : "1";
    //var CompletedRemarks = $('#txtCompleteRemarks').val(), CancelledRemarks = $('#txtCanceRemarks').val();//, srcReturn = $('#chkReturnCalls').attr('src');


    /* var dlCompleteRemarkVal = $('#search_CompleteRemarks').val(), dlCancelRemarkVal = $('#search_CancelRemarks').val(), dlRemarkval = $('#search_Remarks').val();
    var dlCompleteRemarkTxt = $('#search_CompleteRemarks option:selected').text(), dlCancelRemarkTxt = $('#search_CancelRemarks option:selected').text(), dlRemarkTxt = $('#search_Remarks option:selected').text();


    var CompletedRemarks = (dlCompleteRemarkVal == 'Others') ? $('#txtCompleteRemarks').val() : ((dlCompleteRemarkVal == '0') ? '' : dlCompleteRemarkTxt);
    var CancelledRemarks = (dlCancelRemarkVal == 'Others') ? $('#txtCanceRemarks').val() : ((dlCancelRemarkVal == '0') ? '' : dlCancelRemarkTxt);
    var Remarks = (dlRemarkval == 'Others') ? $('#txtRemarks').val() : ((dlRemarkval == '0') ? '' : dlRemarkTxt); */

    var drpCancelRemark = selectedText('search_CancelRemarks'), drpCompleteRemark = '',// selectedText('search_CompleteRemarks')
        drpRemark = selectedText('search_Remarks'); //$('#searchCR_CancelRemarks option:selected').text();

    //alert(drpCReason);

    var CancelledRemarks = drpCancelRemark + '_' + $('#txtCanceRemarks').val();

    var CompletedRemarks = ''; //drpCompleteRemark + '_' + $('#txtCompleteRemarks').val();

    var Remarks = drpRemark + '_' + $('#txtRemarks').val();

    var ReqtrName = $('#txtRequestorName').val().trim(), kitchen = $('#txtFromLoc').val().trim();

    var UID = sessionStorage.getItem('ID');
    var PBDTime = (RPreBook == '1') ? formatDate('txtReqdate', 'txtReqTime') : '';
    var PatientName = $('#txtPatientName').val(), PatientHN = $('#txtPatientHNO').val(), PatientDOB = $('#txtPatientDOB').val(), ContactNo = $('#txtContactNumber').val();// srcMulti = $('#chkMultiPorter').attr('src') , Remarks = $('#txtRemarks').val();
    //var IsMultiPorter = (srcMulti == "../images/NoMCheck.jpg") ? "0" : "1";
    //var IsReturn = (srcReturn == "../images/Return.png") ? "0" : "1";
    var qty = $('#txtQty').val();

    $.ajax({
        async: true,
        url: hurl + "SERVICE/Service.aspx?Process=" + encodeURIComponent(Encrypt("UPDATEREQUEST")) +"&PBDATE=" + encodeURIComponent(Encrypt(PBDTime)) + "&CATEGORY=" + encodeURIComponent(Encrypt(ReqCat)) + "&FROM=" + encodeURIComponent(Encrypt(RFromID)) + "&TO=" + encodeURIComponent(Encrypt(RToID)) +
            "&MULTIPORTER=" + encodeURIComponent(Encrypt(IsMTPR + "_" + OIsMTPR)) + "&PATIENTNAME=" + encodeURIComponent(Encrypt(PatientName + "_" + PatientHN + "_" + PatientDOB)) + "&REMARKS=" + encodeURIComponent(Encrypt(Remarks)) + "&USERID=" + encodeURIComponent(Encrypt(UID))
            + "&PRIORITY= " + encodeURIComponent(Encrypt("0")) + "&EXTRAFIELDS=" + encodeURIComponent(Encrypt(IsRTC + "_" + IsMitigation + "_" + ContactNo)) + "&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)) + '&STATUS=' + encodeURIComponent(Encrypt(StatusID))
            + '&COMPLETEREMARKS=' + encodeURIComponent(Encrypt(CompletedRemarks)) + '&CANCELREMARKS=' + encodeURIComponent(Encrypt(CancelledRemarks)) + "&Qty=" + encodeURIComponent(Encrypt(qty)) + "&REQUESTOR=" + encodeURIComponent(Encrypt(ReqtrName))
            + "&KITCHEN=" + encodeURIComponent(Encrypt(kitchen)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)) + "&MODIFIEDVALUS=" + encodeURIComponent(Encrypt(getModifiedValues())),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data[0].RESULT.split("_")[0] === 'TRUE') {

                $('#LBLRequestResult').html('Request Updated Successfully.. Req No. #' + ReqNB);

                HideModalPopUp('addTask'); ShowModalPopUp('modalReqAlert');
                setTimeout("HideModalPopUp('modalReqAlert');", 3500);
                HideModalPopUp('modalReqAlert'); //ReloadLinks();
                LoadProcess(CProcess);
            }
        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });
}

function formatDate(eleID_Date, eleID_TIme) {

    var date = $('#' + eleID_Date).val(), time = $('#' + eleID_TIme).val(); // 2023-07-06 12:53

    var datetime = date.split('-')[1] + '/' + date.split('-')[2] + '/' + date.split('-')[0] + ' ' + time;

    return datetime;


}



function setMultiPorter() {

    var IsMT = $('#chkMultiPorter').prop('checked');

    IsMTPR = (IsMT) ? "1" : "0";

    //var src = $('#chkMultiPorter').attr('src'); //alert(src);
    //$('#chkMultiPorter').attr("src", (src == "../images/NoMCheck.jpg") ? "../images/MCheck.jpg" : "../images/NoMCheck.jpg");

}
function setReturnCalls() {

    var IsRT = $('#chkReturnCalls').prop('checked');

    IsRTC = (IsRT) ? "1" : "0";

    //var src = $('#chkReturnCalls').attr('src'); //alert(src);
    //$('#chkReturnCalls').attr("src", (src == "../images/Return.png") ? "../images/SReturn.png" : "../images/Return.png");

}

function setCheck(ele) {

    var src = $(ele).attr('src'); //alert(src);
    $(ele).attr("src", (src == "../images/NoMCheck.jpg") ? "../images/MCheck.jpg" : "../images/NoMCheck.jpg");

}

function setCheckbyID(eleId) {

    var src = $('#' + eleId).attr('src'); //alert(src);
    $('#' + eleId).attr("src", (src == "../images/NoMCheck.jpg") ? "../images/MCheck.jpg" : "../images/NoMCheck.jpg");

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

function LoadNewRequest() {
    $.ajax({
        async: true,
        url: hurl + "SERVICE/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETREQUESTLOCCATRECORDS")),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            var catUL = '';
            var dataLocation = $.grep(data, function (element, index) {
                return element.FILTER == "FLOOR";
            });
            var dataCategory = $.grep(data, function (element, index) {
                return element.FILTER == "CATEGORY";
            });

            $.each(dataCategory, function (key, value) {
                catUL += '<li> <input type="checkbox" id="chkCat' + value.ID + '" onchange="CatSelection(this,' + "'" + value.ID + "'" + ');" ><span> <img src="../images/check.png"></span> <img src="' + value.IMAGEPATH + '" alt="' + value.VALUE + '"> <p>' + value.VALUE + '</p> </li>';
            });

            $("#ReqCategories").html('<ul>' + catUL + '</ul>');

            //$.each(dataLocation, function (key, value) {

            //    $('#search_to')[0].sumo.add(value.ID, value.VALUE);
            //    $('#search_from')[0].sumo.add(value.ID, value.VALUE);
            //    $('#search_Halt1')[0].sumo.add(value.ID, value.VALUE);
            //    $('#search_Halt2')[0].sumo.add(value.ID, value.VALUE);
            //});

            var DateTime = getCurdateTime();
            //alert(curDate);
            document.getElementById("txtReqdate").value = DateTime.split('_')[0];
            document.getElementById("txtReqdate").min = DateTime.split('_')[0];
            //document.getElementById("txtReqdate").max =
            document.getElementById("txtReqTime").value = DateTime.split('_')[1];
            ReqDate = DateTime.split('_')[0]; ReqTime = DateTime.split('_')[1];

            LoadPresetRemarks();


            //$('#search_from')[0].sumo.disableItem(0); $('#search_to')[0].sumo.disableItem(0);
            //$.each(dataCategory, function (key, value) {
            //    $("#drpPresetReason").append($("<option     />").val(value.ID).text(value.MESSAGE));
            //});

        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });
}


function LoadCategories(val) {
    var selTS = '', selTE = '';

    var IsHaywd = ((FHaywood != 'NO' || ToHaywood != 'NO') ? '1' : '0');
    ServiceCode = (ServiceCode == '0') ? "1" : ServiceCode;
    $.ajax({
        async: true,
        url: hurl + "SERVICE/Service.aspx?Process=" + ((RPreBook == '1' && ServiceCode == '2') ? encodeURIComponent(Encrypt('GETCATEGORIESSCHD')) : ((RPreBook == '1' && ServiceCode == '3') ? encodeURIComponent(Encrypt('GETCATEGORIESSCHDCL')) : encodeURIComponent(Encrypt('GETCATEGORIES')))) + "&VAL=" + encodeURIComponent(Encrypt((RPreBook == '1' && ServiceCode !== '2' && ServiceCode !== '3') ? 'book' : val)) + "&VAL1=" + encodeURIComponent(Encrypt(((ServiceCode !== '1') ? ReqCat : ReqCat + '_' + IsHaywd))) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            var catUL = '';
            var dataCategory = $.grep(data, function (element, index) {
                return element.FILTER == "CATEGORY";
            });

            $.each(dataCategory, function (key, value) {
                selTS = (((ReqCat == value.ID) && (selTS === '')) ? value.TS : selTS); selTE = (((ReqCat == value.ID) && (selTE === '')) ? value.TE : selTE);

                catUL += '<li> <input type="checkbox" id="chkCat' + value.ID + '" onchange="CatSelection(this,' + "'" + value.ID + "','" + value.ISTWOPORTERTASK + "','" + value.VALUE + "','" + value.QUANTITY + "','" + value.TS + "','" + value.TE + "','" + value.FLOCID + "','" + value.KITCHEN + "'" + ');" ><span> <img src="../images/check.png"></span> <img src="' + value.IMAGEPATH + '" alt="' + value.VALUE + '"> <p>' + value.VALUE + '</p> </li>';
            });

            $("#ReqCategories").html('<ul>' + catUL + '</ul>');


            //setTimeout(function () { setCategories(ReqCat);}, 400);

            $("#chkCat" + ReqCat).prop('checked', true);
            ReqCat = ReqCat;

            if (selTS != '' || selTE != '') {
                $('#lblKPITS').html(((selTS != '-' && selTS != '0') ? (selTS + '<br/> <span style="font-size:13px;"> (min) </span> ') : '-'));
                $('#lblKPITE').html(((selTE != '-' && selTE != '0') ? (selTE + '<br/> <span style="font-size:13px;"> (min) </span> ') : '-'));
            }


        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });

}

function setCategories(Id) {
    var eleID = "#chkCat" + Id;
    clearAllCheckBox('ReqCategories'); $(eleID).prop('checked', true);

    ReqCat = Id;
}

//function OnChangeMTPorters(ele) {
//    var value = $(ele).val(), selText = $('#search_PorterMT option:selected').text();

//    ATPorterID = value;
//    ATPorterName = selText.split("(")[0];

//    PendingTasks = ''; PorterCurTasks = '';
//    GetPorterTasks(value);


//}

function OnChangeMTPorters(ele) {
    var value = $(ele).val(),
        selText = $('#search_PorterMT option:selected').text();

    var currentSelections = PorterCurTasks.split('_').filter(id => id !== '');
    var currentReqNB = ATReqNB.split(',').filter(id => id !== '');

    ATPorterID = value;
    ATPorterName = selText.split("(")[0];

    GetPorterTasks(value);
}

//function LoadMTPorters() {
//    $.ajax({
//        async: true,
//        url: hurl + "SERVICE/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETMTPORTERS")) +"&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)),
//        type: 'POST',
//        data: 'pData',
//        dataType: 'json',
//        success: function (data) {
//            var catUL = '';
//            //$('#search_PorterMT')[0].sumo.reload();
//            //$('#search_PorterMT').html('');
//            clearSumo('search_PorterMT');
//            $.each(data, function (key, value) {

//                $('#search_PorterMT')[0].sumo.add(value.PORTERID, value.PORTERNAME + '(' + value.STATUS + ')');
//            });


//        },
//        error: function (data) {
//            $('#').html(data[0].RESULT);
//        }
//    });
//}

function LoadMTPorters(departmentId) {
    var encryptedServiceCode = Encrypt(ServiceCode).toString();

    var url = hurl + "SERVICE/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETMTPORTERS").toString()) +
        "&SERVICEID=" + encodeURIComponent(encryptedServiceCode);

    if (departmentId && departmentId !== '0' && departmentId !== '' && departmentId !== 'null') {
        url += "&DEPARTMENTID=" + encodeURIComponent(Encrypt(departmentId.toString()).toString());
    }

    $.ajax({
        async: true,
        url: url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            clearSumo('search_PorterMT');

            //$('#search_PorterMT')[0].sumo.add('0', '-- Select --');

            if (!data || data.length === 0) {
                return;
            }

            $.each(data, function (key, value) {
                $('#search_PorterMT')[0].sumo.add(
                    value.PORTERID,
                    value.PORTERNAME + ' (' + value.STATUS + ')'
                );
            });
        },
        error: function () {
            alert('Unable to load porters.');
        }
    });
}

function clearSumo(ele) {

    var len = $('#' + ele + ' option').length;

    for (var i = len; i > 1; i--) {
        $('#' + ele)[0].sumo.remove(i - 1);
    }
}

function setNewTask() {
    var UName = sessionStorage.getItem('NAME'); $('#btnReqSubmit').css("display", "inline-block"); $("#spanRequestDate").html('');/*$("#divReqDate").css("display", 'none');*/
    $("#TaskHeader").html('New Task'); $("#ReqUserLogin").html('Entered By :' + UName); $("#divEditRemarks").css("display", 'none');
    document.getElementById('HFERID').value = ""; document.getElementById('HFERNO').value = ""; document.getElementById('HFStatusID').value = "";
    var DateTime = getCurdateTime(); EServiceCode = ''; LBKitName = ''; CatKitName = ''; LBKitID = '0'; CatKitID = '0';
    //alert(curDate);

    $('#txtFromLoc').attr("disabled", false);
    $('#txtToLoc').attr("disabled", false);
    document.getElementById("txtReqdate").value = DateTime.split('_')[0];
    document.getElementById("txtReqTime").value = DateTime.split('_')[1];

    $('#txtFromLoc').val(''); $('#txtToLoc').val('');

    //$('#search_from')[0].sumo.selectItem('0');
    //$('#search_Halt1')[0].sumo.selectItem('0');
    //$('#search_Halt2')[0].sumo.selectItem('0');
    //$('#search_to')[0].sumo.selectItem('0');
    setService(ServiceCode);
    ReqDate = DateTime.split('_')[0]; ReqTime = DateTime.split('_')[1]; $('#txtQty').val('');
    ReqCat = '0'; RFromID = '0'; RToID = '0'; RPreBook = "0"; RHalt1 = '0'; RHalt2 = '0';
    //$('#containerHalt1').css("display", "inline-block"); $('#containerHalt2').css("display", "inline-block");
    $('#containerDate').css("display", "none"); $('#containerTime').css("display", "none"); $('#DivPrebookSlider').css("display", "inline-block");
    // $('#chkMultiPorter').attr("src", "../images/NoMCheck.jpg"); $('#chkReturnCalls').attr("src", "../images/Return.png");
    $('#chkPreBook').prop('checked', false); $('#chkReturnCalls').prop('checked', false); $('#chkMultiPorter').prop('checked', false); $('#chkPreBook').prop('disabled', false);
    IsMTPR = '0'; IsRTC = '0'; FHaywood = 'NO'; ToHaywood = 'NO';
    $('#txtPatientName').val(''); $('#txtRemarks').val(''); $('#txtRequestorName').val(''); $('#txtSearchCat').val('');
    $('#txtPatientDOB').val(''); $('#txtPatientHNO').val(''); $('#txtContactNumber').val(''); $('#txtPorterRemarks').val('');
    disableRequestFileds(false); $('#divPorterRemarks').css("display", 'none');

    $('#divPorterRemarks').css("display", 'none');
    $('#search_Remarks')[0].sumo.unSelectAll(); $('#search_Remarks')[0].sumo.reload(); $('#search_Remarks')[0].sumo.selectItem(0);
    LoadCategories('');
    clearAllCheckBox('ReqCategories'); setDefaultLocation();

    $('#lblKPITS').html('-'); $('#lblKPITE').html('-');
    ShowModalAddtask();
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
function setDefaultLocation() {

    var DefaultLocationID = sessionStorage.getItem('DEFAULTLOCID'), DefaultLocation = sessionStorage.getItem('DEFAULTLOC');
    if (DefaultLocationID !== '0') {
        RFromID = DefaultLocationID; $('#txtFromLoc').val(DefaultLocation);
    }
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

function LoadPresetRemarks() {
    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("PRESET")) + "&ACTION=" + encodeURIComponent(Encrypt("GET")) +"&MSG=&GROUP=&ID=" + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)),
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

            $('#searchCR_CancelRemarks').html(''); $('#searchCR_CancelRemarks')[0].sumo.add('0', '-- Select --'); $('#searchCR_CancelRemarks')[0].sumo.reload();


            $.each(Remarks, function (key, value) {
                $('#search_Remarks')[0].sumo.add(value.ID, value.MESSAGE);
            });

            $.each(CReason, function (key, value) {
                $('#search_CancelRemarks')[0].sumo.add(value.ID, value.MESSAGE);
                $('#searchCR_CancelRemarks')[0].sumo.add(value.ID, value.MESSAGE);
            });
            $.each(FReason, function (key, value) {
                $('#search_CompleteRemarks')[0].sumo.add(value.ID, value.MESSAGE);
            });

            // $('#search_Remarks')[0].sumo.add('Others', 'Others'); $('#search_CancelRemarks')[0].sumo.add('Others', 'Others'); $('#search_CompleteRemarks')[0].sumo.add('Others', 'Others');


            $('#search_Remarks')[0].sumo.selectItem(0); $('#search_CancelRemarks')[0].sumo.selectItem(0); $('#searchCR_CancelRemarks')[0].sumo.selectItem(0); $('#search_CompleteRemarks')[0].sumo.selectItem(0);

        },
        error: function (data) {

        }

    });
}

function LoadCancelRemarks(data) {


    $('#search_CancelRemarks').html(''); $('#search_CancelRemarks')[0].sumo.add('0', '-- Select --'); $('#search_CancelRemarks')[0].sumo.reload();

    $('#searchCR_CancelRemarks').html(''); $('#searchCR_CancelRemarks')[0].sumo.add('0', '-- Select --'); $('#searchCR_CancelRemarks')[0].sumo.reload();


    $.each(data, function (key, value) {
        $('#search_CancelRemarks')[0].sumo.add(value.ID, value.MESSAGE);
        $('#searchCR_CancelRemarks')[0].sumo.add(value.ID, value.MESSAGE);
    });

    $('#search_CancelRemarks')[0].sumo.selectItem(0); $('#searchCR_CancelRemarks')[0].sumo.selectItem(0);
}
function getModifiedValues() {


    var PatientName = $('#txtPatientName').val(), ReqtrName = $('#txtRequestorName').val().trim(), UserName = sessionStorage.getItem('NAME'), qty = $('#txtQty').val(), kitchen = $('#txtFromLoc').val().trim();

    var ModifiedValues = ' The Below task details are modified by ' + UserName + '. <br/>';

    ModifiedValues += (((OldFromID != RFromID) ? ('From Location' + ((EServiceCode == '2') ? '(kitchen)' : '') + ' : ' + ((EServiceCode == '2') ? OKitchen : OldFrom) + ' to ' + ((EServiceCode == '2') ? kitchen : NewFrom) + ', <br/> ') : '') +
        ((OldToID != RToID) ? ('To Location : ' + OldTo + ' to ' + NewTo + ', <br/> ') : '') +
        ((OldCatID != ReqCat) ? ('Task Type : ' + OldCategory + ' to ' + NewCategory + ', <br/> ') : '') +
        ((OldPatientName != PatientName) ? ('Patient Name : ' + OldPatientName + ' to ' + PatientName + ', <br/> ') : '') +
        ((OldQuantity != qty) ? ('Quantity : ' + OldQuantity + ' to ' + qty + ', <br/> ') : '') +
        ((OldRequestorName != ReqtrName) ? ('Requestor : ' + OldRequestorName + ' to ' + ReqtrName + ', <br/> ') : '') +
        ((OldIsMultiPorter != IsMTPR) ? ('MultiPorter : ' + ((OldIsMultiPorter == '1') ? 'YES' : 'NO') + ' to ' + ((IsMTPR == '1') ? 'YES' : 'NO') + ', <br/> ') : '')
    );

    return ModifiedValues;
}

function setEditTask(ReqNB, ReqID, FromId, ToId, CategoryID, RequestStatus, StatusID, PatientName, Remarks, CompletedRemarks, CancelledRemarks, MultiPorter, IsReturnRequired, IsReturn, MUIndex, RQuantity, RequestorName, From, To, CategoryName,
    PorterRemarks, ContactNo, IsQuantity, TS, TE, LoginName, RequestType, ReqDateTime, ServiceID, Kitchen, AuthorizerName) {

    $("#containerMP").css("display", ((MUIndex == '0' || MUIndex == '' || MUIndex == 'null') ? "inline-block" : "inline-block"));
    $("#TaskHeader").html('Task #' + ReqNB + '-' + RequestStatus); $("#divEditRemarks").css("display", 'block');
    $("#ReqUserLogin").html('Entered By :' + LoginName); $("#spanRequestDate").html('Request Date :-' + ReqDateTime);
    var DateTime = getCurdateTime(); var CatEle = $('#chkCat' + CategoryID); $('#txtQty').val(RQuantity);
    document.getElementById('HFERID').value = ReqID; document.getElementById('HFERNO').value = ReqNB; document.getElementById('HFStatusID').value = StatusID;
    //alert(curDate);
    NewFrom = ''; NewTo = ''; NewCategory = '';
    OldFromID = FromId; OldFrom = From; OldToID = ToId; OldTo = To; OldCatID = CategoryID; OldCategory = CategoryName; OldPatientName = PatientName; OldQuantity = RQuantity; OldRequestorName = RequestorName;
    OldIsMultiPorter = ((MultiPorter != 'No') ? '1' : '0'); EServiceCode = ServiceID; OKitchen = Kitchen;

    //$('#search_Halt1')[0].sumo.selectItem('0');
    //$('#search_Halt2')[0].sumo.selectItem('0');
    //$('#search_from')[0].sumo.selectItem('0'); $('#search_from')[0].sumo.selectItem(From);
    //$('#search_to')[0].sumo.selectItem('0'); $('#search_to')[0].sumo.selectItem(To);

    $('#txtFromLoc').val(''); $('#txtFromLoc').val(((ServiceID == '2') ? Kitchen : From));
    $('#txtToLoc').val(''); $('#txtToLoc').val(((ServiceID == '3') ? Kitchen : To));

    $('#txtPorterRemarks').val(''); $('#txtPorterRemarks').val(PorterRemarks);
    $('#txtContactNumber').val(''); $('#txtContactNumber').val(ContactNo);

    $("#suggesstionTo").hide();
    $("#suggesstionFrom").hide();

    $('#divQuantity').css("display", ((IsQuantity == '1') ? "inline-block" : "none"));

    //$('#containerHalt1').css("display", "none"); $('#containerHalt2').css("display", "none");
    if (StatusID == '6' || StatusID == '7') {
        $('#txtFromLoc').attr("disabled", true);
        $('#txtToLoc').attr("disabled", true);
    }
    FHaywood = ((IsHaywood) ? 'YES' : 'NO'); ToHaywood = ((IsHaywood) ? 'YES' : 'NO');
    //$('#divEditRemarks').css("display", ((StatusID !== '6' && StatusID !== '7') ? "none" : "inline-block"));

    //$('#divCompleteRemarks').css("display", ((StatusID !== '6') ? "none" : "inline-block"));

    $('#divCancelRemarks').css("display", ((StatusID !== '7') ? "none" : "inline-block"));

    $('#divSelCRemarks').css("display", (((StatusID == '6') || (StatusID == '7')) ? "none" : "flex"));

    ReqCat = CategoryID; RFromID = FromId; RToID = ToId; RHalt1 = '0'; RHalt2 = '0';


    if (RequestType == 'PREBOOK') {
        //DateTime = getCurdateTime(ReqDate);
        DateTime = getCurdateTime(ReqDateTime);
        ReqDate = DateTime.split('_')[0]; ReqTime = DateTime.split('_')[1];
        $('#containerDate').css("display", "inline-block"); $('#containerTime').css("display", "inline-block"); $('#btnReqSubmit').css("display", "none");
        document.getElementById("txtReqdate").value = DateTime.split('_')[0]; document.getElementById("txtReqTime").value = DateTime.split('_')[1];

        //$("#spanRequestDate").html('Booked Date :-' + ReqDate);
        // $('#chkMultiPorter').attr("src", "../images/NoMCheck.jpg"); $('#chkReturnCalls').attr("src", "../images/Return.png");
        $('#chkPreBook').prop('checked', true); RPreBook = '1';
    } else {
        $('#containerDate').css("display", "none"); $('#containerTime').css("display", "none"); $('#DivPrebookSlider').css("display", "none");
        document.getElementById("txtReqdate").value = DateTime.split('_')[0]; document.getElementById("txtReqTime").value = DateTime.split('_')[1];
        $('#chkPreBook').prop('checked', false); RPreBook = "0"; $('#btnReqSubmit').css("display", "inline-block");
    }
    $('#btnReqSubmit').css("display", "inline-block");
    $('#chkPreBook').prop('disabled', true);

    //$('#DivPrebookSlider').css("display", "none");
    //$('#containerDate').css("display", "none"); $('#containerTime').css("display", "none");
    //$('#chkMultiPorter').attr("src", (MultiPorter != 'No') ? "../images/MCheck.jpg" : "../images/NoMCheck.jpg");
    //$('#chkReturnCalls').attr("src", (IsReturnRequired != '1') ? "../images/Return.png" : "../images/SReturn.png");
    //$('#chkPreBook').prop('checked', false);
    $('#chkMitigation').attr("src", "../images/NoMCheck.jpg");
    $('#chkReturnCalls').prop('checked', ((IsReturnRequired != '1') ? false : true)); $('#chkMultiPorter').prop('checked', ((MultiPorter != 'No') ? true : false));
    IsMTPR = ((MultiPorter != 'No') ? '1' : '0'); IsRTC = ((IsReturnRequired != '1') ? '0' : '1'); OIsMTPR = ((MultiPorter != 'No') ? '1' : '0');

    $('#txtPatientName').val(PatientName);
    $('#txtRequestorName').val(RequestorName);


    /* $('#txtRemarks').val(Remarks);

    $('#txtCompleteRemarks').val(CompletedRemarks); $('#txtCanceRemarks').val(CancelledRemarks);

    $('#search_Remarks')[0].sumo.selectItem('Others'); $('#search_CancelRemarks')[0].sumo.selectItem('Others'); $('#search_CompleteRemarks')[0].sumo.selectItem('Others'); */


    $('#txtCompleteRemarks').val('');
    $('#chkMultiPorter').prop('disabled', false);
    if (StatusID !== '2') { // (StatusID == '6' || StatusID == '9' || StatusID == '7')
        //setCompleteNotes(CompletedRemarks);
        $('#chkMultiPorter').prop('disabled', true);

    }

    if (StatusID == '2' || StatusID == '100') {
        $('#divPorterRemarks').css("display", 'none');
        disableRequestFileds(false);
    }
    else {
        $('#divPorterRemarks').css("display", 'inline-block');
        $('#txtPorterRemarks').attr("disabled", true);
        disableRequestFileds(true);
    }

    $('#txtPorterRemarks').attr("disabled", true);

    //$('#divCompleteRemarks').css("display", ((StatusID == '6' || StatusID == '9') ? "inline-block" : "none"));

    //$('#txtCompleteRemarks').css("display", ((StatusID !== '6') ? "none" : "inline-block"));

    $('#txtCanceRemarks').css("display", ((StatusID !== '7') ? "none" : "inline-block"));

    //setRemarks('search_CompleteRemarks', 'txtCompleteRemarks', CompletedRemarks);


    var FirstCharClR = CancelledRemarks.slice(0, 1), FirstCharR = Remarks.slice(0, 1);
    CancelledRemarks = ((FirstCharClR == ',') ? CancelledRemarks.substring(1) : CancelledRemarks); Remarks = ((FirstCharR == ',') ? Remarks.substring(1) : Remarks);
    $('#txtCanceRemarks').val(CancelledRemarks);
    $('#txtRemarks').val(Remarks);
    //setRemarks('search_CancelRemarks', 'txtCanceRemarks', CancelledRemarks);
    //setRemarks('search_Remarks', 'txtRemarks', Remarks);

    clearAllCheckBox('ReqCategories');

    LoadCategories(''); ShowModalAddtask();

    setService(ServiceID);

    if (CategoryID == '316' | CategoryID == '373') {
        $('#lblPatientDetails').html('Authorizer');
        $('#containerPatient').css("display", "inline-block");
        $('#txtFromLoc').attr("disabled", true);
        $('#txtPatientName').val(AuthorizerName);
        $('#divEndDate').css("display", "none");
    } else {
        $('#containerPatient').css("display", "none");
        $('#divEndDate').css("display", "none");
        $('#txtFromLoc').attr("disabled", false);
    }
    //$(CatEle).prop('checked', true);

}

function disableRequestFileds(Enable) {
    $('#search_Remarks').attr("disabled", Enable); $('#divSelRemarks').css("display", ((Enable) ? "none" : "flex"));
    $('#txtRemarks').attr("disabled", Enable);
    $('#txtPatientName').attr("disabled", Enable);
    $('#txtRequestorName').attr("disabled", Enable);
    $('#txtSearchCat').attr("disabled", Enable);
    $('#txtQty').attr("disabled", Enable);
    $('#txtRemarks').attr("disabled", Enable);
    $('#txtRequestorName').attr("disabled", Enable);
    $('#txtContactNumber').attr("disabled", Enable);
    $('#txtPatientDOB').attr("disabled", Enable);
    $('#txtPatientHNO').attr("disabled", Enable);

}
//function showPrevNotes() {
//    var display = $('#divPrevNotes').css("display");
//    if (display == 'none') {
//        $('#divPrevNotes').css("display", "inline-block");
//        $('#lblPreNotes').html('hide');
//    }
//    else {

//        $('#divPrevNotes').css("display", "none");
//        $('#lblPreNotes').html('show');
//    }

//}

function setCompleteNotes(Remarks) {

    var arrRemarks = Remarks.split(',');
    var htmlCompleteNotes = '';
    $.each(arrRemarks, function (index, value) {
        if (value.trim()) {
            var valueArray = value.split('|$|'), IsMitigation = valueArray[3].toString();
            htmlCompleteNotes += '<div class="msgContainer"><p class="msgUser">' + valueArray[0].toString() + ((IsMitigation == "YES") ? ('<span class="mitigation-right"> </span>') : '') + '</p> <p>' + valueArray[1].toString() + '<span class="time-right">' + valueArray[2].toString() + '</span></div>'

        }
    });
    $('#divPrevNotes').html(htmlCompleteNotes); $('#divPrevNotes').css("display", "none"); $('#lblPreNotes').html('show');

}



function openCompleteNotes(ComRemarks, ReqID, RStatus) {
    //var arrRemarks = ComRemarks.split('|#|');
    getCompleteLogs(ReqID, RStatus);

    //arrRemarks = arrRemarks.split('|#|');
    //document.getElementById('HFERID').value = ReqID; EStatusID = RStatus;

    //var htmlCompleteNotes = '';
    //$('#chkMitigationCom').attr("src", "../images/MCheck.jpg");
    //$.each(arrRemarks, function (index, value) {
    //    if (value.trim()) {
    //        var valueArray = value.split('|$|'), IsMitigation = valueArray[3].toString();
    //        htmlCompleteNotes += '<div class="msgContainer"><p class="msgUser">' + valueArray[0].toString() + ((IsMitigation == "YES") ? ('<span class="mitigation-right"> </span>') : '') + '</p> <p>' + valueArray[1].toString().replace('_', ' ') + '<span class="time-right">' + valueArray[2].toString() + '</span></div>'

    //    }
    //});
    //$('#divComNotes').html(htmlCompleteNotes); $('#txtComRemarks').val(''); ShowModalPopUp('ModalCompleteNotes');
    //$('#search_CompleteRemarks')[0].sumo.unSelectAll(); $('#search_CompleteRemarks')[0].sumo.reload(); $('#search_CompleteRemarks')[0].sumo.selectItem(0);
    //setTimeout(function () { $('#txtComRemarks').focus(); $('#divComNotes').show(500); }, 1000);
}
//function getLogs(ReqID) {

//    $.ajax({
//        url: hurl + "Service/ServiceAddTask.aspx?Process=GETLOGS&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)),
//        type: 'POST',
//        data: 'pData',
//        dataType: 'json',
//        success: function (data) {
//            if (data[0].RESULT.split("_")[0] === 'TRUE') {
//                var divIndex = (EStatusID == "0") ? "divTotalPercentage" : (EStatusID == "2") ? "divPendingPercentage" : (EStatusID == "3") ? "divAssignedPercentage" : (EStatusID == "4") ? "divInprogressPercentage" : (EStatusID == "6") ? "divCompletedPercentage" : (EStatusID == "7") ? "divCancelledPercentage" : (EStatusID == "8") ? "divPendingOnHoldPercentage" : (EStatusID == "9") ? "divTatExceededPercentage" : (EStatusID == "100") ? "divPrebookeddPercentage" : "divTotalPercentage";

//                setTimeout(function () { Select(divIndex, "COMPLETED"); HideModalPopUp('ModalDoneAddRemarks'); }, 1000);
//            }
//        },
//        error: function (data) {
//            $('#').html(data[0].RESULT);
//        }
//    });

//}


function getCompleteLogs(ReqID, RStatus) {

    $.ajax({
        url: hurl + "Service/ServiceAddTask.aspx?Process=" + encodeURIComponent(Encrypt("GETCOMPLETELOGS")) +"&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            CRemarks = data[0].RESULT;
            LoadCompleteRemarks(CRemarks, ReqID, RStatus)

        },
        error: function (data) {
            CRemarks = data[0].RESULT;
        }
    });


}

function LoadCompleteRemarks(ComRemarks, ReqID, RStatus) {
    var arrRemarks = ComRemarks.split('|#|');
    document.getElementById('HFERID').value = ReqID; EStatusID = RStatus;

    var htmlCompleteNotes = '';
    $('#chkMitigationCom').attr("src", "../images/MCheck.jpg");
    $.each(arrRemarks, function (index, value) {
        if (value.trim()) {
            var valueArray = value.split('|$|'), IsMitigation = valueArray[3].toString();
            htmlCompleteNotes += '<div class="msgContainer"><p class="msgUser">' + valueArray[0].toString() + ((IsMitigation == "YES") ? ('<span class="mitigation-right"> </span>') : '') + '</p> <p>' + valueArray[1].toString().replace('_', ' ') + '<span class="time-right">' + valueArray[2].toString() + '</span></div>'

        }
    });
    $('#divComNotes').html(htmlCompleteNotes); $('#txtComRemarks').val(''); ShowModalPopUp('ModalCompleteNotes');
    $('#search_CompleteRemarks')[0].sumo.unSelectAll(); $('#search_CompleteRemarks')[0].sumo.reload(); $('#search_CompleteRemarks')[0].sumo.selectItem(0);
    setTimeout(function () { $('#txtComRemarks').focus(); $('#divComNotes').show(500); }, 1000);
}


function openReqLogs(ReqID) {

    $.ajax({
        url: hurl + "Service/ServiceAddTask.aspx?Process=" + encodeURIComponent(Encrypt("GETLOGS")) +"&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)),
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
//function openReqLogs(ReqLogs, ReqID) {
//    alert(ReqID);
//    ReqLogs = getLogs(ReqID);
//    var arrRemarks = ReqLogs.split('|#|'); $('#spanLogReq').html('Request #' + ReqID);
//    //document.getElementById('spanLogReq').value = ReqID;

//    var htmlCompleteNotes = '';
//    $.each(arrRemarks, function (index, value) {
//        if (value.trim()) {
//            var valueArray = value.split('|$|'), IsMitigation = valueArray[3].toString();
//            htmlCompleteNotes += '<div class="msgContainer"><p class="msgUser">' + valueArray[0].toString() + ((IsMitigation == "YES") ? ('<span class="mitigation-right"> </span>') : '') + '</p> <p>' + valueArray[1].toString().replace('_', ' ') + '<span class="time-right">' + valueArray[2].toString() + '</span></div>'

//        }
//    });
//    $('#divReqLogs').html(htmlCompleteNotes); ShowModalPopUp('ModalReqLogs');
//    setTimeout(function () { $('#divReqLogs').show(500); }, 1000);;
//}

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
            url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("ADDCOMPLETEREMARKS")) +"&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)) + "&USERID=" + encodeURIComponent(Encrypt(UID)) + "&REMARKS=" + encodeURIComponent(Encrypt(Remark)) + "&ISMITIGATION=" + encodeURIComponent(Encrypt(IsMitigation)),
            type: 'POST',
            data: 'pData',
            dataType: 'json',
            success: function (data) {
                if (data[0].RESULT.split("_")[0] === 'TRUE') {
                    var divIndex = (EStatusID == "0") ? "divTotalPercentage" : (EStatusID == "2") ? "divPendingPercentage" : (EStatusID == "3") ? "divAssignedPercentage" : (EStatusID == "4") ? "divInprogressPercentage" : (EStatusID == "6") ? "divCompletedPercentage" : (EStatusID == "7") ? "divCancelledPercentage" : (EStatusID == "8") ? "divPendingOnHoldPercentage" : (EStatusID == "9") ? "divTatExceededPercentage" : (EStatusID == "100") ? "divPrebookeddPercentage" : "divTotalPercentage";

                    setTimeout(function () { Select(divIndex, "COMPLETED"); HideModalPopUp('ModalDoneAddRemarks'); }, 1000);
                }
            },
            error: function (data) {
                $('#').html(data[0].RESULT);
            }
        });

    }
}

function showPrevNotes() {
    var lblVal = $('#lblPreNotes').html();
    if (lblVal == 'show') {
        $('#divPrevNotes').show(500);
        $('#lblPreNotes').html('hide');
    }
    else {
        $('#divPrevNotes').hide(500)
        $('#lblPreNotes').html('show');
    }

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

function searchCategory(ele) {
    var val = $(ele).val();
    //if (val.trim().length > 0)
    LoadCategories(val);


}

function CatSelection(ele, ID, IsTwoPorter, CatName, IsQuantity, TS, TE, FLOCID, KITCHEN) {

    var EStatusID = document.getElementById('HFStatusID').value;
    var NCName = '', NCID = '0';

    if (EStatusID == '' || EStatusID == '100') { // EStatusID == '2' ||
        var count = getCatCount();
        if (count > 1) {
            $(ele).prop('checked', false);
        } else {
            if (count == 0) {
                CatKitName = ''; CatKitID = '0'; NCName = (LBKitID != '0') ? LBKitName : ''; NCID = (LBKitID != '0') ? LBKitID : '0';

                ReqCat = '0';
                NewCategory = '';
            } else {

                CatKitName = KITCHEN; CatKitID = FLOCID; NCName = (LBKitName.includes('Haywood')) ? LBKitName : (((CatKitName.includes("Main") && LBKitName.includes("Main")) || ID == '411') ? LBKitName : ((CatKitName.includes("Main")) ? CatKitName : LBKitName));
                NCID = (LBKitName.includes('Haywood')) ? LBKitID : (((CatKitName.includes("Main") && LBKitName.includes("Main")) || ID == '411') ? LBKitID : ((CatKitName.includes("Main")) ? CatKitID : LBKitID));

                ReqCat = ID;
                NewCategory = CatName;
            }


            if (ServiceCode == '2') {
                $("#txtFromLoc").val(NCName);
                RFromID = NCID;
            }
        }
        $('#divQuantity').css("display", ((IsQuantity == '1') ? "inline-block" : "none"));

        if (count == '1') {
            $('#lblKPITS').html(((TS !== '-' && TS !== '0') ? (TS + '<br/> <span style="font-size:13px;"> (min) </span> ') : '-'));
            $('#lblKPITE').html(((TE !== '-' && TE !== '0') ? (TE + '<br/> <span style="font-size:13px;"> (min) </span> ') : '-'));

            if (ReqCat == '116') {
                $('#chkMultiPorter').prop('checked', ((IsTwoPorter == '1' && count == 1) ? true : false));

                IsMTPR = ((IsTwoPorter == '1' && count == 1) ? "1" : "0");
            }

        } else if (count == '0') {
            $('#lblKPITS').html('-');
            $('#lblKPITE').html('-');
            $('#chkMultiPorter').prop('checked', false); IsMTPR = "0";

        }

        if (ServiceCode == "3") {
            if (count == '1') {
                var EndDate = GetBarearEndDate();
                $('#containerPatient').css("display", ((ReqCat == "73") && (count == '1')) ? "inline-block" : "none");
                $('#divEndDate').css("display", ((ReqCat == "73") && (count == '1')) ? "inline-block" : "none");
                $('#lblEndDate').html(((ReqCat == "73") && (count == '1')) ? EndDate : "-");
                //if ((ReqCat == "73") && (count == '1')) {
                //    $('#chkPreBook').prop('checked', false);
                //    $('#switchOccurrence').prop('disabled', true);
                //}
            } else if (count == '0') {
                $('#containerPatient').css("display", "none");
                $('#divEndDate').css("display", "none");
                $('#lblEndDate').html("-");
            }
        }



    } else {

        ReqCat = OldCatID;
        setCategories(OldCatID);
    }



    //$('#chkMultiPorter').prop('checked', ((IsTwoPorter == '1' && count == 1) ? true : false));

    //IsMTPR = ((IsTwoPorter == '1' && count == 1) ? "1" : "0");

}

function getCatCount() {

    var selCount = 0;
    $('#ReqCategories input:checked').each(function () {
        selCount += 1;
    });

    return selCount;
}

function clearAllCheckBox(eleID) {

    $('#' + eleID + ' input:checkbox').prop('checked', false);
}

function BindLocation(Id, Value, type, Haywood, CGname, CFromID) {
    var PFHaywood = FHaywood, PTHaywood = ToHaywood;
    if (type == "SF") {
        RFromID = Id;
        NewFrom = Value;
        $("#txtFromLoc").val(Value);
        $("#suggesstionFrom").hide();
        FHaywood = Haywood;
        if (ServiceCode == '3') {
            RToID = Id;
            NewTo = Value;
            $("#txtToLoc").val(CGname);
        }
    }
    else if (type == "ST") {
        RToID = Id;
        NewTo = Value;
        $("#txtToLoc").val(Value);
        $("#suggesstionTo").hide();
        ToHaywood = Haywood;

        if (ServiceCode == '2') {
            LBKitName = CGname; LBKitID = CFromID;
            var NCName = (CatKitName.includes("Main") && LBKitName.includes("Main")) ? LBKitName : ((CatKitName.includes("Main") || LBKitID == '0') ? CatKitName : LBKitName),
                NCID = (CatKitName.includes("Main") && LBKitName.includes("Main")) ? LBKitID : ((CatKitName.includes("Main") || LBKitID == '0') ? CatKitID : LBKitID);

            $("#txtFromLoc").val(NCName);
            RFromID = NCID;
            $("#suggesstionFrom").hide();
        }
    }
    if (PFHaywood != FHaywood || PTHaywood != ToHaywood) {
        ReqCat = '0'
        LoadCategories('');
    }
}

function setLocation(ele, Type) {

    var value = $(ele).val();

    $(ele).closest('.sumo-container').removeClass('active');

    // Add active class to the specific container if an option is selected
    if ($(ele).find('option:selected').length > 0 && value !== '0') {
        $(ele).closest('.sumo-container').addClass('active');
    }


    if (Type == 'From')
        RFromID = value;
    else if (Type == 'To')
        RToID = value;
    else if (Type == 'Halt1')
        RHalt1 = value;
    else if (Type == 'Halt2')
        RHalt2 = value;


}

function loadsuggesstion(searchType, Val) {

    ServiceCode = (ServiceCode == '0') ? "1" : ServiceCode;
    var sType = ((searchType == 'from') ? "SF" : "ST")
    $.ajax({
        async: true,
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETSEARCHEDLOCATION")) +"&LOCATION=" + encodeURIComponent(Encrypt(Val)) + "&STYPE=" + encodeURIComponent(Encrypt(sType)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        beforeSend: function () {
            $("#" + ((searchType == 'from') ? "txtFromLoc" : "txtToLoc")).css("background", "#FFF url(../images/LoadingN.gif) no-repeat 95%").css("background-size", "35px");
        },
        success: function (data) {
            $("#" + ((searchType == 'from') ? "suggesstionFrom" : "suggesstionTo")).show();
            $("#" + ((searchType == 'from') ? "suggesstionFrom" : "suggesstionTo")).html(data[0].RESULT);
            $("#" + ((searchType == 'from') ? "txtFromLoc" : "txtToLoc")).css("background", "#FFF");
        }
    });
}

function setPorterMT(ele) {
    var value = $(ele).val(), selText = $('#search_PorterMT option:selected').text();

    ATPorterID = value;
    ATPorterName = selText.split("(")[0];
}


function getPorterStatus(Status, EleID) {
    var UID = sessionStorage.getItem('ID'), PRID = sessionStorage.getItem('ROLE'); setRequestUsers('Users');

    $.each(ReqArrUserDiv, function (index, value) {
        if (value == EleID)
            $('#' + value).addClass('SelectIndexIcon');
        else
            $('#' + value).removeClass('SelectIndexIcon');

    });
    LoaderOn();
    var FinalUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETPORTERSTATUS")) + "&Status=" + encodeURIComponent(Encrypt(Status)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode));
    $.ajax({
        url: FinalUrl,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            var tblUsers = '<table class="table scroll table-bordered"> <thead> <tr><th scope="col">Porter Name</th><th scope="col">Login Time</th><th scope="col">Status</th> <th scope="col">No. of Calls</th><th scope="col">Total Hours (HH:MM)</th><th scope="col">Work Hours (HH:MM)</th><th scope="col">Break Hours (HH:MM)</th><th scope="col">Idle Hours (HH:MM)</th></tr></thead><tbody>',

                tblContent = '';


            if (data.length > 0) {

                $.each(data, function (key, value) {

                    tblContent += ' <tr><td>' + value.PORTERNAME + '</td><td>' + value.LOGINTIME + '</td> <td>' + value.STATUS + '</td><td>' + value.NoOfCalls + '</td><td>' + value.TotalHours + '</td><td>' + value.WorkHours + '</td><td>' + value.BreakHours + '</td><td>' + value.IdleHours + '</td></tr> ';


                });
            }


            tblUsers += tblContent + '</tbody > </table > '; $('#tblUsers').html(tblUsers);
        },
        error: function (data) {

        },


    });
    LoaderOff(400);
}

function setRequestUsers(Process) {
    switch (Process) {
        case "Tasks":
            $('#users').removeClass('active').removeClass('show'); $('#tasks').addClass('active').addClass('show');
            $('#users-tab').removeClass('active'); $('#tasks-tab').addClass('active');
            $('#divUserHeaders').css("display", "none");
            $('#divRequestHeaders').css("display", "block"); 
            $('#divBarrierPercentage').css("display", ((ServiceCode == '3') ? "inline-flex" : "none"));
            $('#chkUserRequest').prop('checked', false);
            break;
        case "Users":
            $('#tasks').removeClass('active').removeClass('show'); $('#users').addClass('active').addClass('show');
            $('#tasks-tab').removeClass('active'); $('#users-tab').addClass('active');
            $('#divRequestHeaders').css("display", "none");
            $('#divUserHeaders').css("display", "inline-flex");
            $('#chkUserRequest').prop('checked', true);
            break;
    }
}

function loadTraczoView() {
    $('#EscalationChart').hide();
    $('.tab-content-wrapper').hide();
    $('#divRequestHeaders').show();
    $('#divRequestHeaders').css('display', 'block'); 
    $('#divUserHeaders').hide();
    $('#taskfileters').closest('.row').show();
    $('.search-wrap').show();
    $('.table-wrap').show();
    $('#tblRequests').show();
    $('#search_TaskFields').val('R.REQUESTID');
    $('#search_PatientRemarks').val('PATIENTNAME');
    $('#txtSearchTask').val('');
    $('#txtSearchPatient').val('');
    $('#search_Kitchen').val('');
    $('#divPendingPercentage').click();
    setRequestUsers('Tasks');
}
function AddTask(PRName, FPId, status) {
    //GTagID = cTagID;
    PorterCurTasks = ''; PendingTasks = ''; ATPorterID = ''; ATPorterName = ''; ATReqNB = ''; ATStatus = ''; FPId = ''; MTCount = 60; clearInterval(MTInterval);
    //$('#LBLPorterNam').text(PRName);


    GetPorterTasks(FPId); ATPorterName = PRName; ATStatus = status; startMTCount();
    LoadMTPorters();
    $('#search_PorterMT')[0].sumo.selectItem('0');
    //setTimeout(function () { $('#search_PorterMT')[0].sumo.selectItem(FPId) }, 1000);
    ShowModalPopUp('ModalAddTask');

}


function startMTCount() {
    MTInterval = window.setInterval(function () { processMT(); }, 1000);
}

function processMT() {

    if (MTCount == 0)
        clearMT();
    else {
        $('#MTCount').text(MTCount);
        MTCount -= 1;
    }
}

function clearMT() {
    MACount = 60;
    clearInterval(MTInterval); HideModalPopUp("ModalAddTask"); HideModalPopUp("ModalMTDone");
    PorterCurTasks = ''; PendingTasks = ''; ATPorterID = ''; ATPorterName = ''; ATReqNB = '';
    ToUpdate = !ToUpdate; ReloadLinks(); LoadProcess(CProcess); ATStatus = ''; $('#search_PorterMT')[0].sumo.selectItem('0');
    $('#MTCount').text(60);
    if (Type = 'DB')
        clearMADB();
}


function clearMADB() {
    $.ajax({
        async: true,
        url: hurl + "Service/ServiceRequest.aspx?Process=" + encodeURIComponent(Encrypt("CLEARMANUALASSIGN")),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

        },
        error: function (data) {

        }

    });
}

function getHHMMSSOld(value) {
    hours = Math.floor(value / 3600);
    value %= 3600;
    minutes = Math.floor(value / 60);
    seconds = value % 60;

    return hours + ":" + minutes + ":" + seconds;
}

function getHHMMSS(value) {

    var abvalue = Math.abs(value);

    var hhmmss = new Date(abvalue * 1000).toISOString().substring(11, 19) // .substring(11, 19)

    var arhhmmss = hhmmss.split(':');
    var finalhhmmss = ((arhhmmss[0] == '00') ? '' : (arhhmmss[0] + ':')) + arhhmmss[1] + ':' + arhhmmss[2];
    return ((value < 0) ? '-' : '') + finalhhmmss;
}

function InitPagination(vic, pageIndex) {

    var remainder = (vic % pageSize), div = Math.floor(vic / pageSize);
    var Pages = div + ((remainder > 0) ? 1 : 0);

    valuePage.curPage = pageIndex;
    valuePage.totalPages = Pages;

    setCurrentPager(pageIndex);

    $('.page-container').css('display', 'flex');

}

function setCurrentPager(pageNumber) {

    valuePage.curPage = pageNumber;
    pageIndex = ((pageNumber == 0) ? 1 : pageNumber) - 1;
    //curPage.value = pageNumber;
    //pagination(valuePage);

    //LoadProcess(CProcess);
    handleButtonLeft();
    handleButtonRight();
}

function changeGridSize(ele) {
    var val = parseInt($(ele).val())
    pageSize = ((val != 'NaN') ? val : 5); pageIndex = 0;
    LoadProcess(CProcess);

}

function setPageSize() {
    var val = parseInt($('#pageSize').val())
    pageSize = ((val != 'NaN') ? val : 5);
}


function OpenPhoto(ReqID, Header, Path, HeadPhoto, AckOn) {
    $('#imgAckHead').attr("src", HeadPhoto); $('#ACK_ON').html(AckOn);
    $('#ImgACK').attr("src", Path); $('#spanAckHead').html(Header);
    ShowModalPopUp('ModalImage'); $('#spanReqID').html('#' + ReqID);
}
//function getHHMM(minutes) {
//    if (minutes === null || minutes === undefined || minutes === 0) return '-';
//    minutes = parseInt(minutes) || 0;
//    const sign = minutes < 0 ? "-" : "";
//    minutes = Math.abs(minutes);
//    const h = Math.floor(minutes / 60);
//    const m = minutes % 60;
//    return ${ sign } ${ h } h ${ m } m;
//}
function getHHMM(minutes) {
    if (minutes === null || minutes === undefined || minutes === 0) return '-';
    minutes = parseInt(minutes) || 0;
    const sign = minutes < 0 ? "-" : "";
    minutes = Math.abs(minutes);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${sign} ${h} h ${m} m`;
}
//function getKPIFlag(value, HHMM) {
//    if (value === null || value === undefined || value === '' || HHMM === '-' || HHMM === '0h 0m' || HHMM === '-0h 0m') {
//        return '<span class="CounterItems" style="background-color:white; color:black; text-decoration:none;">-</span>';
//    } else if (parseInt(value) < 0) {
//        return '<span class="CounterItems" style="background-color:red">' + HHMM + '</span>';
//    } else {
//        return '<span class="CounterItems" style="background-color:green">' + HHMM + '</span>';
//    }
//}

function getKPIFlag(value, HHMM) {
    if (value === null || value === undefined || value === '' || HHMM === '-' || HHMM === '0h 0m' || HHMM === '-0h 0m') {
        return '<span class="CounterItems" style="background-color:#f0f0f0; color:#666; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:500; text-decoration:none;">-</span>';
    } else if (parseInt(value) < 0) {
        return '<span class="CounterItems" style="background-color:#fee2e2; color:#dc2626; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600; text-decoration:none;">' + HHMM + '</span>';
    } else {
        return '<span class="CounterItems" style="background-color:#dcfce7; color:#16a34a; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600; text-decoration:none;">' + HHMM + '</span>';
    }
}

//function LoadTableRequest(Process, tblRequset) {
//    var UID = sessionStorage.getItem('ID'), PRID = sessionStorage.getItem('ROLE'), CanCancel = sessionStorage.getItem('CancelTask'), CanStartEnd = sessionStorage.getItem('canStartComplete');


//    var duplicateOption = (((PRID == "2") || (PRID == "5") || (PRID == "6")) && (CProcess !== "9"));
//    var FilterQuery = INQueryBuilder(); setPageSize();
//    //alert( hurl + "Service/Service.aspx?Process=GET&Status=" +  ( (Process)) + "&Search=" + ((FilterQuery)) + "&USERID=" + ((UID))        + "&PageIndex=" + ((pageIndex)) + "&PageSize=" + ((pageSize)) + "&ROLE=" + ((PRID)) + "&SERVICEID=" + ((ServiceCode)));
//    var FinalUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GET")) +"&Status=" + encodeURIComponent(Encrypt(Process)) + "&Search=" + encodeURIComponent(Encrypt(FilterQuery)) + "&USERID=" + encodeURIComponent(Encrypt(UID))
//        + "&PageIndex=" + encodeURIComponent(Encrypt(pageIndex)) + "&PageSize=" + encodeURIComponent(Encrypt(pageSize)) + "&ROLE=" + encodeURIComponent(Encrypt(PRID)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode));
//    $.ajax({
//        url: FinalUrl,
//        type: 'POST',
//        data: 'pData',
//        dataType: 'json',
//        success: function (data) {
//            //(EleID == "divPendingOnHoldPercentage") ? "8" : (EleID == "divTatExceededPercentage") ? "9" :


//            var tblRequest = (CProcess !== '100') ? (' <table class="table scroll table-bordered"> <thead> <tr> <th scope="col" >Task ID</th><th scope="col" style="width:70px;"> Notes </th>' + ((CProcess !== '9') ? '<th scope="col" style="width: 80;">Booked<br /> On</th>' : '<th scope="col" style="width: 80;">Start<br /> Date</th><th scope="col" style="width: 80;">Current<br /> Day</th><th scope="col" style="width: 80;">End<br /> Date</th>') + ((CProcess !== "9") ? '<th scope="col">Req.<br /> Time</th> ' : '') + // + ((CProcess == "6" || CProcess == "7" || CProcess == "9") ? '<th scope="col" style="width:70px;"> Notes </th>' : '')
//                ((CProcess == "2" || CProcess == "8") ? "" : ((CProcess == "3") ? '<th scope="col">Porter(s)</th> <th scope="col">Assigned <br />  Time</th>' : (CProcess == "4") ? '<th scope="col">Porter(s)</th> <th scope="col">Assigned <br />  Time</th><th scope="col">Started<br /> At</th>' :
//                    (CProcess == "6" || CProcess == "9") ? ((CProcess !== "9") ? '<th scope="col">Porter(s)</th> <th scope="col">Assigned <br />  Time</th>' : '') + '<th scope="col">Started<br /> At</th><th scope="col">Completed<br /> At</th>' + ((CProcess == "9") ? '<th scope="col">Next <br/> Routine </th>' : '') + '<th scope="col">TAT<br /> (Start to End)</th><th scope="col">TAT<br /> (Request to End)</th>' : (CProcess == "7") ? '<th scope="col">Porter(s)</th>' : ''))
//                + '<th scope="col">' + ((ServiceCode == '2') ? 'From' : (ServiceCode == '3') ? 'From' : 'From') + '</th>' + ((ServiceCode == '3') ? '<th scope="col">To</th>' : '<th scope="col">To</th>') + '<th scope="col">Task Type</th>' + ((ServiceCode == '2') ? '<th scope="col">Quantity</th>' : '') + ((CProcess !== '9') ? '' : '') + ((ServiceCode !== '2') ? ((ServiceCode == '3') ? ((CProcess == "9") ? '<th scope="col"  style="width:80px;">Authorizer <br /> Name</th>' : '') : ('<th scope="col"  style="width:80px;">Patient <br /> Name</th> <th scope="col">Assistant <br/> Required</th>')) : '') + ((CProcess == "0" || CProcess == "9") ? '<th scope="col">Status</th>' : '') + ' <th scope="col">Entered By</th><th scope="col">' + ((CProcess == "8") ? "On-Hold <br/>" : "") + 'Remarks </th>' +
//                ((CProcess == "2" || CProcess == "3" || CProcess == "4") && ServiceCode.toString() == "1" ? ('<th scope="col">Reassign</th>') : '') +
//                // ((CProcess == "3" || CProcess == "4" || CProcess == "5") ? ('<th scope="col">Locate</th>') : '') + ((CProcess == "20") ? '<th scope="col">Priority</th>' : '') +

//                ((CProcess !== "7" && CProcess !== "6") ? (((CProcess == "3" || CProcess == "4" || CProcess == "9") && (CanStartEnd == '1')) ? ('<th scope="col"  style="width: 100;">' + ((CProcess == "3") ? 'Start <br /> Task' : 'Complete <br /> Task') + '</th>') : '') : '') +
//                ((CProcess == "7") ? ('<th scope="col" >Cancel <br /> Remarks </th><th scope="col">Cancelled <br /> At </th>') : "") + ((CProcess == "6") ? '<th scope="col">KPI <br/> met</th>' : ((CProcess == "3" || CProcess == "4" || CProcess == "2") ? ((CProcess == "2" || CProcess == "3") ? '<th scope="col">KPI <br/> (Response) </th><th scope="col">KPI <br/> (Completion) </th>' : '<th scope="col">KPI <br/> (Completion) </th>') : '')) + ((CProcess !== "7" && CProcess !== "2" && CProcess !== "3" && CProcess !== "8" && CProcess !== "9") ? ' <th scope="col">Porter <br/> Remarks</th>' : '')
//                + ((duplicateOption) ? '' : '') + '<th scope="col" style="width: 50;">Log</th> </tr ></thead > <tbody>') // <th scope="col">Has <br/> Return  Call</th><th scope="col">Reassign</th> <th scope="col">Buzzer</th><<th scope="col">Start</th><th scope="col">Finish</th>
//                : (' <table class="table scroll table-bordered"> <thead> <tr> <th scope="col" >Req. #</th><th scope="col" style="width: 80;">Booked<br /> On</th><th scope="col">Req. Time</th><th scope="col">From' + ((ServiceCode == '2') ? '<br/> (Kitchen)' : '') + '</th>' + ((ServiceCode !== '3') ? '<th scope="col">To</th>' : '') + '<th scope="col">Task Type</th>' + ((ServiceCode == '2') ? '<th scope="col">Quantity</th>' : '') + '' + ((ServiceCode !== '2' & ServiceCode !== '3') ? '<th scope="col">Patient Name</th><th scope="col">Assistant <br/> Required</th>' : '') + '<th scope="col">Entered By</th><th scope="col">Remarks</th>' + ((CanCancel == "1") ? '<th scope="col">Cancel</th>' : '') + '</tr ></thead > <tbody>');

//            tblContent = '';

//            //setEditTask(ReqID, From, To, CategoryID, RequestStatus, StatusID, PatientName, Remarks, CompletedRemarks, CancelledRemarks)

//            if (data.length > 0) {

//                var vic = data[0].VIC; InitPagination(vic, (pageIndex + 1));
//                $.each(data, function (key, value) {

//                    var PName = ((!value.PORTERNAME) ? "" : value.PORTERNAME.replace("<br/>", ",").toString()), PorterID = ((!value.PORTERID) ? "" : value.PORTERID.toString()), RequestID = ((!value.REQUESTID) ? "" : value.REQUESTID.toString()),
//                        PorterID1 = ((!value.SUBPORTERID) ? "" : value.SUBPORTERID.toString()), Priority = ((!value.PRIORITY) ? "" : value.PRIORITY.toString()), CatID = ((!value.CATEGORYID) ? "" : value.CATEGORYID.toString()),
//                        FromID = ((!value.REQUESTLOCATIONID) ? "" : value.REQUESTLOCATIONID.toString()), ToID = ((!value.DESTINATIONLOCATIONID) ? "" : value.DESTINATIONLOCATIONID.toString()), ContactNo = ((!value.CONTACTNO) ? "" : value.CONTACTNO.toString()),
//                        ComRemarks = ((!value.COMPLETEDREMARKS) ? "" : value.COMPLETEDREMARKS.toString()), CanRemarks = ((!value.REMARKS) ? "" : value.REMARKS.toString()), PorterRemarks = ((!value.PORTERREMARKS) ? "" : value.PORTERREMARKS.toString()),
//                        RStatus = ((!value.REQUESTSTATUSID) ? "" : value.REQUESTSTATUSID.toString()), RequestID = ((!value.REQUESTID) ? "" : value.REQUESTID.toString()), ReqNB = ((!value.REQUESTNO) ? "" : value.REQUESTNO.toString()),
//                        MultiPorter = ((!value.ISMULTIPORTER) ? "" : value.ISMULTIPORTER.toString()), IsReturnRequired = ((!value.ISRETURNREQUIRED) ? "" : value.ISRETURNREQUIRED.toString()), IsReturn = ((!value.RETURNREQUESTOF) ? "" : value.RETURNREQUESTOF.toString()),
//                        TatExceeded = ((!value.TATEXCEEDED) ? "" : value.TATEXCEEDED.toString()), DeviceID = ((!value.DEVICEID) ? "" : value.DEVICEID.toString()),
//                        PatientName = ((!value.PATIENTNAME) ? "" : value.PATIENTNAME.replace("<br/>", ",").toString()),
//                        MUIndex = ((!value.MULTITASKINDEX) ? "" : value.MULTITASKINDEX.toString()),
//                        RQuantity = ((!value.quantity) ? "" : value.quantity.toString()),
//                        IsQuantity = ((!value.ISQUANTITY) ? "" : value.ISQUANTITY.toString()),
//                        logRemarks = ((!value.LOG) ? "" : value.LOG.toString()),
//                        TE = ((!value.TE) ? "" : value.TE.toString()),
//                        TS = ((!value.TS) ? "" : value.TS.toString()),

//                        OhHoldRemarks = ((!value.ONHOLDREMARKS) ? "" : value.ONHOLDREMARKS.replace("<br/>", ",").toString()),

//                        bookedAt = ((!value.BOOKEDAT) ? "" : value.BOOKEDAT.replace("<br/>", ",").toString()),

//                        LoginName = ((!value.REQUESTORNAME) ? "" : value.REQUESTORNAME.replace("<br/>", ",").toString()),
//                        Kitchen = ((!value.KITCHEN) ? "" : value.KITCHEN.replace("<br/>", ",").toString()),

//                        RequestorName = ((!value.REQUESTOR) ? "" : value.REQUESTOR.replace("<br/>", ",").toString()),

//                        RoleName = ((!value.ROLE) ? "" : value.ROLE.replace("<br/>", ",").toString()),

//                        RReqDate = ((!value.REQUESTDATE) ? "" : value.REQUESTDATE.replace("<br/>", ",").toString()),
//                        RReqTime = ((!value.REQUESTTIME) ? "" : value.REQUESTTIME.replace("<br/>", ",").toString()),

//                        StartDate = ((!value.STARTDATE) ? "" : value.STARTDATE.replace("<br/>", ",").toString()),

//                        CurDay = ((!value.CURRENTDAY) ? "" : value.CURRENTDAY.toString().replace("<br/>", ",").toString()),

//                        EndDate = ((!value.ENDDATE) ? "" : value.ENDDATE.replace("<br/>", ",").toString()),

//                        AuthorizerName = ((!value.AUTHORISER) ? "" : value.AUTHORISER.replace("<br/>", ",").toString()),

//                        NextRoutine = ((!value.NEXTROUTINE) ? "" : value.NEXTROUTINE.replace("<br/>", ",").toString()),

//                        From = ((!value.FROM) ? "" : value.FROM.replace("<br/>", ",").toString()),
//                        ServiceID = ((!value.SERVICEID) ? "1" : value.SERVICEID.toString()),
//                        To = ((!value.TO) ? "" : value.TO.replace("<br/>", ",").toString()),
//                        ResponseKPI = ((value.RESPONSEKPI || "").toString()).split('_'),
//                        CompletionKPI = ((value.COMPLETIONKPI || "").toString()).split('_'),
//                        CategoryName = ((!value.CATEGORYNAME) ? "" : value.CATEGORYNAME.replace("<br/>", ",").toString());

//                    /*if (ServiceID == '2')*/
//                    From = (ServiceID == '2') ? Kitchen : From;
//                    var IsResponseKPIMet = (ResponseKPI && ResponseKPI[0] != null) ? ResponseKPI[0].toString() : null;
//                    var KPISecondsLeft = (ResponseKPI && ResponseKPI[1] != null) ? ResponseKPI[1].toString() : '0';

//                    var IsCompletionKPIMet = (CompletionKPI && CompletionKPI[0] != null) ? CompletionKPI[0].toString() : null;
//                    var CompletionKPISecondsLeft = (CompletionKPI && CompletionKPI[1] != null) ? CompletionKPI[1].toString() : '0';

//                    var ResponseHHMM = getHHMM(IsResponseKPIMet);
//                    var CompletionHHMM = getHHMM(IsCompletionKPIMet);

//                    var responseFlag = getKPIFlag(IsResponseKPIMet, ResponseHHMM);
//                    var CompletionFlag = getKPIFlag(IsCompletionKPIMet, CompletionHHMM);


//                    var ReqDateTime = RReqDate + ' ' + RReqTime;

//                    var ReqIndex = (MUIndex % 5), ResponseHHMMSS = getHHMMSS(KPISecondsLeft), CompletionHHMMSS = getHHMMSS(CompletionKPISecondsLeft);
//                    var bgColor = 'white';// (MUIndex !== 0 && MUIndex !== "") ? ((ReqIndex == 1) ? '#45c3ff61' : (ReqIndex == 2) ? '#ffff004f' : (ReqIndex == 3) ? '#119d0047' : (ReqIndex == 4) ? '#9d005e47' : '#001b9d40') : 'white';

//                    var OnholdProcess = ((CProcess == "8" || RStatus == "8") ? "RELEASE" : "SET"), OnHoldModal = ((CProcess == "8" || RStatus == "8") ? "ModalOnHoldRelease" : "ModalOnHold");

//                    var SCProcess = ((CProcess == "3" || RStatus == "3") ? "START" : "COMPLETE"), OnSCModal = ((CProcess == "3" || RStatus == "3") ? "ModalStart" : "ModalComplete");

//                    //var KPImet = ((RStatus == '6' || RStatus == '9') ? TatExceeded : '-');

//                    var KPImet = ((RStatus == '6' || RStatus == '9') ? (((IsResponseKPIMet == 'YES') && (IsCompletionKPIMet == 'YES')) ? 'YES' : 'NO') : '-');
//                   // var responseFlag = ((IsResponseKPIMet == 'YES') && KPISecondsLeft == '0') ? '-' : ('<span class="CounterItems" style="background-color:' + ((IsResponseKPIMet == 'NO') ? 'red' : ((IsResponseKPIMet == 'CLOSE') ? 'orange' : 'green')) + '"> ' + ResponseHHMMSS + ' </span>'); // '<img src="../images/' + ((IsResponseKPIMet == 'NO') ? 'Red_flag' : ((IsResponseKPIMet == 'CLOSE') ? 'Orange_flag' : 'Green_flag')) + '.png" style="width:25px;"  />' +
//                   // var CompletionFlag = ((IsCompletionKPIMet == 'YES') && CompletionKPISecondsLeft == '0') ? '-' : ('<span class="CounterItems" style="background-color:' + ((IsCompletionKPIMet == 'NO') ? 'red' : ((IsCompletionKPIMet == 'CLOSE') ? 'orange' : 'green')) + '"> ' + CompletionHHMMSS + ' </span>');

//                    tblContent +=
//                        (CProcess !== '100') ? (' <tr style=' + '"background-color:' + ((KPImet == 'NO') ? '#fce4ec' : bgColor) + ';"' + '  ><td>  <div class="add-task-link" > '
//                            + RequestID + ' </div> </td><td style="text-decoration: underline;font-weight: bold;font-size: 15px;color:' + ((ComRemarks.length > 0) ? "red" : "#2e70f5") + ';cursor:pointer;" onclick="getCompleteLogs(' + "'" + RequestID + "','" + CProcess + "'" + ');"> <img src="../images/memo.png" alt="Notes" /> Notes</td>' + ((CProcess !== '9') ? ('<td>' + value.REQUESTDATE + '</td><td>' + value.REQUESTTIME + '</td>') : ('<td>' + StartDate + '</td><td>' + CurDay + '</td><td>' + EndDate + '</td>')) + //'<td>' + value.REQUESTTIME + '</td>' + // ((CProcess == "6" || CProcess == "7" || CProcess == "9") ? '<td style="text-decoration: underline;font-weight: bold;font-size: 15px;color:' + ((ComRemarks.length > 0) ? "red" : "#2e70f5") + ';cursor:pointer;" onclick="openCompleteNotes(' + "'" + ComRemarks + "','" + RequestID + "'" + ');"> <img src="../images/memo.png" alt="Notes" /> Notes</td>' : '')
//                            ((CProcess == "2" || CProcess == "8") ? "" : ((CProcess == "3") ? '<td>' + value.PORTERNAME + '</td><td>' + value.ASSIGNEDTIME + '</td>' : (CProcess == "4") ? '<td>' + value.PORTERNAME + '</td><td>' + value.ASSIGNEDTIME + '</td><td>' + value.STARTTIME + '</td>' : (CProcess == "6" || CProcess == "9") ? ((CProcess !== "9") ? '<td>' + value.PORTERNAME + '</td><td>' + value.ASSIGNEDTIME + '</td>' : '') + '<td>' + value.STARTTIME + '</td><td>' + value.ENDTIME + '</td>' + ((CProcess == "9") ? '<td>' + NextRoutine + '</td>' : '') + '<td>' + value.TAT + '</td><td>' + value.TTAT + '</td>' : (CProcess == "7") ? '<td>' + value.PORTERNAME + '</td>' : ''))
//                        + '<td>' + From + '</td>' + ((ServiceCode == '3') ? '<td>' + value.TO + ' </td>' : ('<td>' + value.TO + ' </td>')) + '<td>' + value.CATEGORYNAME + ' </td>' + ((ServiceCode == '2') ? '<td>' + RQuantity + ' </td>' : '') + ((CProcess !== '9') ? ('') : '') + ((ServiceCode !== '2') ? ((ServiceCode == '3') ? ((CProcess == "9") ? ('<td>' + AuthorizerName + '</td>') : '') : ('<td>' + PatientName + '</td> <td>' + MultiPorter + '</td>')) : '') + (((CProcess == "0" || CProcess == "9")) ? '<td>' + value.REQUESTSTATUS + '</td>' : '') + '<td>' + LoginName + '</td><td>' + ((CProcess == "8") ? OhHoldRemarks : value.REQUESTDESKREMARKS) + '</td>' +
//                        ((CProcess == "2" || CProcess == "3" || CProcess == "4") && ServiceCode.toString() == "1"  ? '<td> <img src="../images/Add.png" onclick="AddTask(' + "'" + PName + "','" + PorterID + "','" + RStatus + "'" + ');" class="imgIcons" /> </td>' : '') +

//                            ((CProcess !== "7" && CProcess !== "6") ? ((((CProcess == "3" || CProcess == "4" || CProcess == "5") && PorterID !== "") ? '' : '')
//                                + ((CProcess == "20") ? ('') : "") +
//                                ((CProcess !== "9") ? ('') : "") +
//                                (((CProcess == "3" || CProcess == "4" || CProcess == "9") && (CanStartEnd == '1')) ? '<td> ' + ((CProcess !== "9" || RStatus == "12") ? '<img src="../images/' + ((CProcess == "3") ? "StartTask" : "CompleteTask") + '.png" onclick = "InitStartComplete(' + "'" + RequestID + "','" + RequestID + "','" + OnSCModal + "','" + SCProcess + "','" + MUIndex + "','" + CatID + "');" + '" class="imgIcons" /> </td>' : '') : '') +
//                                ((CanCancel == "1") ? ('') : "")) : ((CProcess == "7") ? '<td style="word-wrap: break-word !important;max-width: 250px;max-height: 60px !important;overflow: hidden !important;text-overflow: ellipsis;display:inline-block;border:none;">' + value.REMARKS + '</td><td>' + value.CANCELLEDAT + '</td> ' : ""))
//                            + ((CProcess == "6") ? '<td>' + KPImet + '</td>' : ((CProcess == "3" || CProcess == "4" || CProcess == "2") ? ((CProcess == "2" || CProcess == "3") ? '<td>' + responseFlag + '</td><td>' + CompletionFlag + '</td>' : '<td>' + CompletionFlag + '</td>') : ''))
//                            + ((CProcess !== "7" && CProcess !== "2" && CProcess !== "3" && CProcess !== "8" && CProcess !== "9") ? ('<td>' + value.PORTERREMARKS + '</td>') : '') + ((duplicateOption) ? '' : '') +
//                            ('<td style="text-decoration: underline;font-weight: bold;font-size: 15px;color:' + ((logRemarks.length > 0) ? "red" : "#2e70f5") + ';cursor:pointer;" onclick="openReqLogs(' + "'" + RequestID + "'" + ');"> <img src="../images/Log.png" style="max-width: 50px !important;" class="imgIconsb" alt="Notes" /> </td>') + '</tr> ')// <td>' + ((IsReturnRequired == "1") ? "YES" : ((IsReturn.length > 0) ? '<img src="../images/SReturn.png" class="ReturnCalls" />' : "No")) + '</td><td>-</td><td>-</td><td>-</td><td>-</td>
//                            : (' <tr><td>  <div class="add-task-link" > '
//                            + value.REQUESTNO + ' </div> </td><td>' + bookedAt + '</td><td>' + value.REQUESTTIME + '</td><td>' + From + '</td>' + ((ServiceCode == '3') ? '' : ('<td>' + value.TO + ' </td>')) + '<td>' + value.CATEGORYNAME + ' </td>' + ((ServiceCode == '2') ? '<td>' + RQuantity + ' </td>' : '') + '' + ((ServiceCode !== '2') ? (((ServiceCode == '3') ? ((CProcess == "9") ? ('<td>' + AuthorizerName + '</td>') : '') : ('<td>' + PatientName + '</td>' + ('<td>' + MultiPorter + '</td>')))) : '') + '<td>' + LoginName + '</td><td>' + value.REQUESTDESKREMARKS + '</td>' +
//                                ((CanCancel == "1") ? ('<td>' + ((RStatus != "2" && RStatus != "3") ? ('<img src="../images/close.png" class="imgIcons" onclick = "InitCancel(' + "'" + RequestID + "','" + RequestID + "', 'ModalCancel','" + MUIndex + "','" + RStatus + "');" + '" />') : "") + '</td>') : "") + '</tr> ');



//                });

//            }
//            else
//                setPagerEmpty();



//            pagination();
//            tblRequest += tblContent + '</tbody > </table > '; $(tblRequset).html(tblRequest);
//        },
//        error: function (data) {
//            //alert(data);
//        }

//    });
//}

//function LoadTableRequest(Process, tblRequset) {
//    var UID = sessionStorage.getItem('ID'), PRID = sessionStorage.getItem('ROLE'), CanCancel = sessionStorage.getItem('CancelTask'), CanStartEnd = sessionStorage.getItem('canStartComplete');

//    var duplicateOption = (((PRID == "2") || (PRID == "5") || (PRID == "6")) && (CProcess !== "9"));
//    var FilterQuery = INQueryBuilder(); setPageSize();

//    var FinalUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GET")) + "&Status=" + encodeURIComponent(Encrypt(Process)) + "&Search=" + encodeURIComponent(Encrypt(FilterQuery)) + "&USERID=" + encodeURIComponent(Encrypt(UID))
//        + "&PageIndex=" + encodeURIComponent(Encrypt(pageIndex)) + "&PageSize=" + encodeURIComponent(Encrypt(pageSize)) + "&ROLE=" + encodeURIComponent(Encrypt(PRID)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode));

//    $.ajax({
//        url: FinalUrl,
//        type: 'POST',
//        data: 'pData',
//        dataType: 'json',
//        success: function (data) {
//            var cardContainer = '<div class="task-card-container">';
//            var cardContent = '';

//            if (data.length > 0) {
//                var vic = data[0].VIC; InitPagination(vic, (pageIndex + 1));

//                $.each(data, function (key, value) {
//                    // Extract all variables (same as your existing code)
//                    var PName = ((!value.PORTERNAME) ? "" : value.PORTERNAME.replace("<br/>", ",").toString()),
//                        PorterID = ((!value.PORTERID) ? "" : value.PORTERID.toString()),
//                        RequestID = ((!value.REQUESTID) ? "" : value.REQUESTID.toString()),
//                        PorterID1 = ((!value.SUBPORTERID) ? "" : value.SUBPORTERID.toString()),
//                        Priority = ((!value.PRIORITY) ? "" : value.PRIORITY.toString()),
//                        CatID = ((!value.CATEGORYID) ? "" : value.CATEGORYID.toString()),
//                        FromID = ((!value.REQUESTLOCATIONID) ? "" : value.REQUESTLOCATIONID.toString()),
//                        ToID = ((!value.DESTINATIONLOCATIONID) ? "" : value.DESTINATIONLOCATIONID.toString()),
//                        ContactNo = ((!value.CONTACTNO) ? "" : value.CONTACTNO.toString()),
//                        ComRemarks = ((!value.COMPLETEDREMARKS) ? "" : value.COMPLETEDREMARKS.toString()),
//                        CanRemarks = ((!value.REMARKS) ? "" : value.REMARKS.toString()),
//                        PorterRemarks = ((!value.PORTERREMARKS) ? "" : value.PORTERREMARKS.toString()),
//                        RStatus = ((!value.REQUESTSTATUSID) ? "" : value.REQUESTSTATUSID.toString()),
//                        ReqNB = ((!value.REQUESTNO) ? "" : value.REQUESTNO.toString()),
//                        MultiPorter = ((!value.ISMULTIPORTER) ? "" : value.ISMULTIPORTER.toString()),
//                        IsReturnRequired = ((!value.ISRETURNREQUIRED) ? "" : value.ISRETURNREQUIRED.toString()),
//                        IsReturn = ((!value.RETURNREQUESTOF) ? "" : value.RETURNREQUESTOF.toString()),
//                        TatExceeded = ((!value.TATEXCEEDED) ? "" : value.TATEXCEEDED.toString()),
//                        DeviceID = ((!value.DEVICEID) ? "" : value.DEVICEID.toString()),
//                        PatientName = ((!value.PATIENTNAME) ? "" : value.PATIENTNAME.replace("<br/>", ",").toString()),
//                        MUIndex = ((!value.MULTITASKINDEX) ? "" : value.MULTITASKINDEX.toString()),
//                        RQuantity = ((!value.quantity) ? "" : value.quantity.toString()),
//                        IsQuantity = ((!value.ISQUANTITY) ? "" : value.ISQUANTITY.toString()),
//                        logRemarks = ((!value.LOG) ? "" : value.LOG.toString()),
//                        TE = ((!value.TE) ? "" : value.TE.toString()),
//                        TS = ((!value.TS) ? "" : value.TS.toString()),
//                        OhHoldRemarks = ((!value.ONHOLDREMARKS) ? "" : value.ONHOLDREMARKS.replace("<br/>", ",").toString()),
//                        bookedAt = ((!value.BOOKEDAT) ? "" : value.BOOKEDAT.replace("<br/>", ",").toString()),
//                        LoginName = ((!value.REQUESTORNAME) ? "" : value.REQUESTORNAME.replace("<br/>", ",").toString()),
//                        Kitchen = ((!value.KITCHEN) ? "" : value.KITCHEN.replace("<br/>", ",").toString()),
//                        RequestorName = ((!value.REQUESTOR) ? "" : value.REQUESTOR.replace("<br/>", ",").toString()),
//                        RoleName = ((!value.ROLE) ? "" : value.ROLE.replace("<br/>", ",").toString()),
//                        RReqDate = ((!value.REQUESTDATE) ? "" : value.REQUESTDATE.replace("<br/>", ",").toString()),
//                        RReqTime = ((!value.REQUESTTIME) ? "" : value.REQUESTTIME.replace("<br/>", ",").toString()),
//                        StartDate = ((!value.STARTDATE) ? "" : value.STARTDATE.replace("<br/>", ",").toString()),
//                        CurDay = ((!value.CURRENTDAY) ? "" : value.CURRENTDAY.toString().replace("<br/>", ",").toString()),
//                        EndDate = ((!value.ENDDATE) ? "" : value.ENDDATE.replace("<br/>", ",").toString()),
//                        AuthorizerName = ((!value.AUTHORISER) ? "" : value.AUTHORISER.replace("<br/>", ",").toString()),
//                        NextRoutine = ((!value.NEXTROUTINE) ? "" : value.NEXTROUTINE.replace("<br/>", ",").toString()),
//                        From = ((!value.FROM) ? "" : value.FROM.replace("<br/>", ",").toString()),
//                        ServiceID = ((!value.SERVICEID) ? "1" : value.SERVICEID.toString()),
//                        To = ((!value.TO) ? "" : value.TO.replace("<br/>", ",").toString()),
//                        ResponseKPI = ((value.RESPONSEKPI || "").toString()).split('_'),
//                        CompletionKPI = ((value.COMPLETIONKPI || "").toString()).split('_'),
//                        CategoryName = ((!value.CATEGORYNAME) ? "" : value.CATEGORYNAME.replace("<br/>", ",").toString());

//                    From = (ServiceID == '2') ? Kitchen : From;

//                    var IsResponseKPIMet = (ResponseKPI && ResponseKPI[0] != null) ? ResponseKPI[0].toString() : null;
//                    var KPISecondsLeft = (ResponseKPI && ResponseKPI[1] != null) ? ResponseKPI[1].toString() : '0';
//                    var IsCompletionKPIMet = (CompletionKPI && CompletionKPI[0] != null) ? CompletionKPI[0].toString() : null;
//                    var CompletionKPISecondsLeft = (CompletionKPI && CompletionKPI[1] != null) ? CompletionKPI[1].toString() : '0';

//                    var ResponseHHMM = getHHMM(IsResponseKPIMet);
//                    var CompletionHHMM = getHHMM(IsCompletionKPIMet);
//                    var responseFlag = getKPIFlag(IsResponseKPIMet, ResponseHHMM);
//                    var CompletionFlag = getKPIFlag(IsCompletionKPIMet, CompletionHHMM);
//                    var ReqDateTime = RReqDate + ' ' + RReqTime;
//                    var ReqIndex = (MUIndex % 5);
//                    var ResponseHHMMSS = getHHMMSS(KPISecondsLeft);
//                    var CompletionHHMMSS = getHHMMSS(CompletionKPISecondsLeft);
//                    var bgColor = 'white';
//                    var OnholdProcess = ((CProcess == "8" || RStatus == "8") ? "RELEASE" : "SET");
//                    var OnHoldModal = ((CProcess == "8" || RStatus == "8") ? "ModalOnHoldRelease" : "ModalOnHold");
//                    var SCProcess = ((CProcess == "3" || RStatus == "3") ? "START" : "COMPLETE");
//                    var OnSCModal = ((CProcess == "3" || RStatus == "3") ? "ModalStart" : "ModalComplete");
//                    //var KPImet = ((RStatus == '6' || RStatus == '9') ? (((IsResponseKPIMet == 'YES') && (IsCompletionKPIMet == 'YES')) ? 'YES' : 'NO') : '-');

//                    var responseFailed = (responseFlag || '').indexOf('#dc2626') !== -1;
//                    var completionFailed = (CompletionFlag || '').indexOf('#dc2626') !== -1;

//                    var KPImet = '-';

//                    if (RStatus == '6' || RStatus == '9') {
//                        KPImet = (!responseFailed && !completionFailed) ? 'YES' : 'NO';
//                    }

//                    cardContent += '<div class="task-card" style="background-color: ' + ((KPImet == 'NO') ? '#fce4ec' : bgColor) + ';">';

//                    cardContent += '<div class="task-card-header">';
//                    cardContent += '<div class="task-id">#' + (CProcess !== '100' ? RequestID : ReqNB) + '</div>';
//                    cardContent += '<div class="task-notes-icon" onclick="getCompleteLogs(\'' + RequestID + '\',\'' + CProcess + '\');" style="cursor:pointer;">';
//                    cardContent += '<img src="../images/memo.png" alt="Notes" style="width:20px;"> Notes';
//                    cardContent += '</div>';
//                    cardContent += '</div>';

//                    cardContent += '<div class="task-card-body">';

//                    cardContent += '<div class="task-info-row">';
//                    if (CProcess !== '9') {
//                        cardContent += '<div class="task-info-item"><label>Booked On:</label><span>' + (value.REQUESTDATE || '-') + '</span></div>';
//                        cardContent += '<div class="task-info-item"><label>Req Time:</label><span>' + (value.REQUESTTIME || '-') + '</span></div>';
//                    } else {
//                        cardContent += '<div class="task-info-item"><label>Start Date:</label><span>' + (StartDate || '-') + '</span></div>';
//                        cardContent += '<div class="task-info-item"><label>Current Day:</label><span>' + (CurDay || '-') + '</span></div>';
//                        cardContent += '<div class="task-info-item"><label>End Date:</label><span>' + (EndDate || '-') + '</span></div>';
//                    }
//                    cardContent += '</div>';

//                    if (CProcess == "3") {
//                        cardContent += '<div class="task-info-row">';
//                        cardContent += '<div class="task-info-item"><label>Porter(s):</label><span>' + (value.PORTERNAME || '-') + '</span></div>';
//                        cardContent += '<div class="task-info-item"><label>Assigned Time:</label><span>' + (value.ASSIGNEDTIME || '-') + '</span></div>';
//                        cardContent += '</div>';
//                    } else if (CProcess == "4") {
//                        cardContent += '<div class="task-info-row">';
//                        cardContent += '<div class="task-info-item"><label>Porter(s):</label><span>' + (value.PORTERNAME || '-') + '</span></div>';
//                        cardContent += '<div class="task-info-item"><label>Assigned Time:</label><span>' + (value.ASSIGNEDTIME || '-') + '</span></div>';
//                        cardContent += '<div class="task-info-item"><label>Started At:</label><span>' + (value.STARTTIME || '-') + '</span></div>';
//                        cardContent += '</div>';
//                    } else if (CProcess == "6" || CProcess == "9") {
//                        if (CProcess !== "9") {
//                            cardContent += '<div class="task-info-row">';
//                            cardContent += '<div class="task-info-item"><label>Porter(s):</label><span>' + (value.PORTERNAME || '-') + '</span></div>';
//                            cardContent += '<div class="task-info-item"><label>Assigned Time:</label><span>' + (value.ASSIGNEDTIME || '-') + '</span></div>';
//                            cardContent += '</div>';
//                        }
//                        cardContent += '<div class="task-info-row">';
//                        cardContent += '<div class="task-info-item"><label>Started At:</label><span>' + (value.STARTTIME || '-') + '</span></div>';
//                        cardContent += '<div class="task-info-item"><label>Completed At:</label><span>' + (value.ENDTIME || '-') + '</span></div>';
//                        if (CProcess == "9") {
//                            cardContent += '<div class="task-info-item"><label>Next Routine:</label><span>' + (NextRoutine || '-') + '</span></div>';
//                        }
//                        cardContent += '<div class="task-info-item"><label>TAT (Start to End):</label><span>' + (value.TAT || '-') + '</span></div>';
//                        cardContent += '<div class="task-info-item"><label>TAT (Request to End):</label><span>' + (value.TTAT || '-') + '</span></div>';
//                        cardContent += '</div>';
//                    } else if (CProcess == "7") {
//                        cardContent += '<div class="task-info-row">';
//                        cardContent += '<div class="task-info-item"><label>Porter(s):</label><span>' + (value.PORTERNAME || '-') + '</span></div>';
//                        cardContent += '</div>';
//                    }

//                    // Location and Task Info
//                    cardContent += '<div class="task-info-row">';
//                    cardContent += '<div class="task-info-item"><label>From:</label><span>' + (From || '-') + '</span></div>';
//                    cardContent += '<div class="task-info-item"><label>To:</label><span>' + (value.TO || '-') + '</span></div>';
//                    cardContent += '<div class="task-info-item"><label>Task Type:</label><span>' + (value.CATEGORYNAME || '-') + '</span></div>';
//                    cardContent += '</div>';

//                    if (ServiceCode == '2') {
//                        cardContent += '<div class="task-info-row">';
//                        cardContent += '<div class="task-info-item"><label>Quantity:</label><span>' + (RQuantity || '-') + '</span></div>';
//                        cardContent += '</div>';
//                    }

//                    if (ServiceCode !== '2') {
//                        if (ServiceCode == '3') {
//                            if (CProcess == "9") {
//                                cardContent += '<div class="task-info-row">';
//                                cardContent += '<div class="task-info-item"><label>Authorizer Name:</label><span>' + (AuthorizerName || '-') + '</span></div>';
//                                cardContent += '</div>';
//                            }
//                        } else {
//                            cardContent += '<div class="task-info-row">';
//                            cardContent += '<div class="task-info-item"><label>Patient Name:</label><span>' + (PatientName || '-') + '</span></div>';
//                            cardContent += '<div class="task-info-item"><label>Assistant Required:</label><span>' + (MultiPorter || '-') + '</span></div>';
//                            cardContent += '</div>';
//                        }
//                    }

//                    if (CProcess == "0" || CProcess == "9") {
//                        cardContent += '<div class="task-info-row">';
//                        cardContent += '<div class="task-info-item"><label>Status:</label><span>' + (value.REQUESTSTATUS || '-') + '</span></div>';
//                        cardContent += '</div>';
//                    }

//                    cardContent += '<div class="task-info-row">';
//                    cardContent += '<div class="task-info-item"><label>Entered By:</label><span>' + (LoginName || '-') + '</span></div>';
//                    cardContent += '<div class="task-info-item"><label>Remarks:</label><span>' + ((CProcess == "8") ? (OhHoldRemarks || '-') : (value.REQUESTDESKREMARKS || '-')) + '</span></div>';
//                    cardContent += '</div>';

//                    // KPI Section
//                    if (CProcess == "6") {
//                        cardContent += '<div class="task-info-row">';
//                        cardContent += '<div class="task-info-item"><label>KPI met:</label><span>' + (KPImet || '-') + '</span></div>';
//                        cardContent += '</div>';
//                    } else if (CProcess == "3" || CProcess == "4" || CProcess == "2") {
//                        cardContent += '<div class="task-info-row">';
//                        if (CProcess == "2" || CProcess == "3") {
//                            cardContent += '<div class="task-info-item"><label>KPI (Response):</label><span>' + (responseFlag || '-') + '</span></div>';
//                            cardContent += '<div class="task-info-item"><label>KPI (Completion):</label><span>' + (CompletionFlag || '-') + '</span></div>';
//                        } else {
//                            cardContent += '<div class="task-info-item"><label>KPI (Completion):</label><span>' + (CompletionFlag || '-') + '</span></div>';
//                        }
//                        cardContent += '</div>';
//                    }

//                    if (CProcess !== "7" && CProcess !== "2" && CProcess !== "3" && CProcess !== "8" && CProcess !== "9") {
//                        cardContent += '<div class="task-info-row">';
//                        cardContent += '<div class="task-info-item"><label>Porter Remarks:</label><span>' + (value.PORTERREMARKS || '-') + '</span></div>';
//                        cardContent += '</div>';
//                    }

//                    cardContent += '</div>'; // Close card-body

//                    cardContent += '<div class="task-card-footer">';

//                    if ((CProcess == "2" || CProcess == "3" || CProcess == "4") && ServiceCode.toString() == "1") {
//                        cardContent += '<img src="../images/Add.png" onclick="AddTask(\'' + PName + '\',\'' + PorterID + '\',\'' + RStatus + '\');" class="task-action-icon" style="cursor:pointer; width:24px;" title="Reassign" />';
//                    }

//                    //if ((CProcess !== "7" && CProcess !== "6") && (CProcess == "3" || CProcess == "4" || CProcess == "9") && (CanStartEnd == '1')) {
//                    //    if (CProcess !== "9" || RStatus == "12") {
//                    //        cardContent += '<img src="../images/' + ((CProcess == "3") ? "StartTask" : "CompleteTask") + '.png" onclick="InitStartComplete(\'' + RequestID + '\',\'' + RequestID + '\',\'' + OnSCModal + '\',\'' + SCProcess + '\',\'' + MUIndex + '\',\'' + CatID + '\');" class="task-action-icon" style="cursor:pointer; width:28px;" title="' + ((CProcess == "3") ? "Start Task" : "Complete Task") + '" />';
//                    //    }
//                    //}

//                    if (CProcess !== "7" && CProcess !== "6") {

//                        let showButton = false;
//                        let iconName = "";
//                        let title = "";

//                        if (RStatus === "3" && CProcess === "3") {
//                            showButton = true;
//                            iconName = "StartTask";
//                            title = "Start Task";
//                        }

//                        else if (CProcess === "4") {
//                            showButton = true;
//                            iconName = "CompleteTask";
//                            title = "Complete Task";
//                        }

//                        else if (CProcess === "9" && RStatus === "12") {
//                            showButton = true;
//                            iconName = "CompleteTask";
//                            title = "Complete Task";
//                        }

//                        if (showButton) {
//                            cardContent +=
//                                '<img src="../images/' + iconName + '.png"' +
//                                ' onclick="InitStartComplete(\'' + RequestID + '\',\'' + RequestID + '\',\'' + OnSCModal + '\',\'' + SCProcess + '\',\'' + MUIndex + '\',\'' + CatID + '\');"' +
//                                ' class="task-action-icon"' +
//                                ' style="cursor:pointer;width:28px;"' +
//                                ' title="' + title + '" />';
//                        }
//                    }

//                    // Show cancel button for tasks that can be cancelled (Status 2,3,4,8)
//                    if (CanCancel == "1" && (RStatus == "2" || RStatus == "3" || RStatus == "4" || RStatus == "100")) {
//                        cardContent += '<img src="../images/close.png" onclick="InitCancel(\'' + RequestID + '\',\'' + ReqNB + '\', \'ModalCancel\', \'' + MUIndex + '\', \'' + CatID + '\', \'' + RStatus + '\');" class="task-action-icon" style="cursor:pointer; width:24px; margin-left: 5px;" title="Cancel Task" />';
//                    }

//                    if ((PRID == "2" || PRID == "5" || PRID == "6") && (RStatus == "2" || RStatus == "3" || RStatus == "4")) {
//                        cardContent += '<img src="../images/onhold.png" onclick="InitOnHold(\'' + RequestID + '\',\'' + RequestID + '\',\'' + (PorterID || '0') + '\',\'' + OnHoldModal + '\',\'' + OnholdProcess + '\',\'' + (MUIndex || '0') + '\');" class="task-action-icon" style="cursor:pointer; width:24px; margin-left: 5px;" title="Hold Task" />';
//                    }

//                    if ((PRID == "2" || PRID == "5" || PRID == "6") && (RStatus == "8")) {
//                        cardContent += '<img src="../images/start.png" onclick="InitOnHold(\'' + RequestID + '\',\'' + RequestID + '\',\'' + (PorterID || '0') + '\',\'' + OnHoldModal + '\',\'' + OnholdProcess + '\',\'' + (MUIndex || '0') + '\');" class="task-action-icon" style="cursor:pointer; width:24px; margin-left: 5px;" title="Release Task" />';
//                    }

//                    if (CProcess == "7") {
//                        cardContent += '<div class="task-info-row" style="width:100%;">';
//                        cardContent += '<div class="task-info-item"><label>Cancel Remarks:</label><span>' + (value.REMARKS || '-') + '</span></div>';
//                        cardContent += '<div class="task-info-item"><label>Cancelled At:</label><span>' + (value.CANCELLEDAT || '-') + '</span></div>';
//                        cardContent += '</div>';
//                    }

//                    cardContent += '<div class="task-log-icon" onclick="openReqLogs(\'' + RequestID + '\');" style="cursor:pointer;">';
//                    cardContent += '<img src="../images/Log.png" style="width:24px;" alt="Log" /> Log';
//                    cardContent += '</div>';

//                    cardContent += '</div>'; // Close card-footer

//                    cardContent += '</div>'; // Close task-card
//                });

//                cardContainer += cardContent + '</div>';
//                $(tblRequset).html(cardContainer);

//            } else {
//                setPagerEmpty();
//                $(tblRequset).html('<div style="text-align: center; padding: 50px; color: #6c757d;">No tasks found</div>');
//            }

//            pagination();
//        },
//        error: function (data) {
//            console.error('Error loading tasks:', data);
//            $(tblRequset).html('<div style="text-align: center; padding: 50px; color: #dc3545;">Error loading tasks. Please try again.</div>');
//        }
//    });
//}
function LoadTableRequest(Process, tblRequset) {
    var UID = sessionStorage.getItem('ID'),
        PRID = sessionStorage.getItem('ROLE'),
        CanCancel = sessionStorage.getItem('CancelTask'),
        FilterQuery = INQueryBuilder();

    setPageSize();

    var FinalUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GET")) +
        "&Status=" + encodeURIComponent(Encrypt(Process)) +
        "&Search=" + encodeURIComponent(Encrypt(FilterQuery)) +
        "&USERID=" + encodeURIComponent(Encrypt(UID)) +
        "&PageIndex=" + encodeURIComponent(Encrypt(pageIndex)) +
        "&PageSize=" + encodeURIComponent(Encrypt(pageSize)) +
        "&ROLE=" + encodeURIComponent(Encrypt(PRID)) +
        "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode));

    if (!$('#dialDashStyle').length) {
        $('head').append('<style id="dialDashStyle">' +
            '.dial-board{width:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:16px;background:#e8ecf2;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;box-sizing:border-box}' +
            '.dial-board *{box-sizing:border-box}' +
            '.dial-card{min-width:0;background:#fff;border:1.5px solid #d5dbe4;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 6px 16px rgba(16,24,40,.10),0 2px 4px rgba(16,24,40,.06);contain:content;content-visibility:auto;transition:box-shadow .15s ease,border-color .15s ease}' +
            '.dial-card.kpi-pass{border-color:#86efac;box-shadow:0 6px 16px rgba(22,163,74,.14),0 2px 4px rgba(22,163,74,.08)}' +
            '.dial-card.kpi-fail{border-color:#fca5a5;box-shadow:0 6px 16px rgba(220,38,38,.14),0 2px 4px rgba(220,38,38,.08)}' +
            '.dial-card-head{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#f8fafc;border-bottom:1px solid #e4e7ec;min-height:42px}' +
            '.dial-taskid-label{font-size:10px;font-weight:800;color:#667085;text-transform:uppercase;letter-spacing:.6px;margin-right:6px}' +
            '.dial-id{font-size:13.5px;font-weight:800;color:#0f172a;display:inline-flex;align-items:center;gap:5px}' +
            '.dial-notes{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;background:#fff;border:1px solid #d0d5dd;cursor:pointer;font-size:12px;font-weight:800;color:#344054;box-shadow:0 1px 2px rgba(16,24,40,.05)}' +
            '.dial-notes img{width:15px;height:15px;object-fit:contain;display:block}' +
            '.dial-badges{display:flex;flex-wrap:wrap;gap:10px;padding:8px 14px;min-height:50px;align-items:flex-start;border-bottom:1px solid #eaecf0}' +
            '.dial-badge-wrap{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:100%}' +
            '.dial-badge-cap{font-size:10px;font-weight:800;color:#667085;text-transform:uppercase;letter-spacing:.6px;line-height:14px}' +
            '.dial-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:6px;font-size:12px;line-height:16px;font-weight:800;letter-spacing:.3px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff}' +
            '.badge-open{background:#FF6B57}' +
            '.badge-cancelled{background:#DC2626}' +
            '.badge-onhold{background:#64748B}' +
            '.badge-tofu{background:#84BD00}' +
            '.badge-urgent{background:#E53935}' +
            '.badge-important{background:#F59E0B}' +
            '.dial-body{padding:0 14px;flex:1;display:flex;flex-direction:column}' +
            '.dial-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:6px 0;border-bottom:1px solid #eaecf0;align-items:center;min-height:38px}' +
            '.dial-row.three{grid-template-columns:1fr 1fr 1fr}' +
            '.dial-row:last-child{border-bottom:none}' +
            '.dial-item{min-width:0;display:flex;flex-direction:column;gap:3px}' +
            '.dial-item.centered{align-items:center}' +
            '.dial-label{font-size:10.5px;color:#667085;font-weight:800;text-transform:uppercase;letter-spacing:.5px;line-height:14px}' +
            '.dial-value{font-size:13.5px;color:#101828;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:18px}' +
            '.dial-value.multiline{white-space:normal;overflow:visible;text-overflow:clip;word-break:break-word;line-height:17px}' +
            '.kpi-pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:700;line-height:16px;letter-spacing:.2px;width:fit-content}' +
            '.kpi-pill.kpi-good{background:#EAF7EE;color:#166534}' +
            '.kpi-pill.kpi-bad{background:#FDECEC;color:#991B1B}' +
            '.dial-foot{min-height:46px;display:flex;align-items:center;flex-wrap:wrap;padding:8px 12px;background:#fafbfc;border-top:1px solid #eaecf0;margin-top:auto;gap:6px}' +
            '.dial-action{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;background:#fff;border:1px solid #d0d5dd;cursor:pointer;font-size:12px;font-weight:800;color:#344054;box-shadow:0 1px 2px rgba(16,24,40,.05)}' +
            '.dial-action img{width:15px;height:15px;object-fit:contain;display:block}' +
            '.dial-log{margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;background:#fff;border:1px solid #d0d5dd;cursor:pointer;font-size:12px;font-weight:800;color:#344054;box-shadow:0 1px 2px rgba(16,24,40,.05)}' +
            '.dial-log img{width:15px;height:15px}' +
            '.dial-empty{width:100%;text-align:center;padding:60px 10px;color:#98a2b3;font-size:14px}' +
            '@media(max-width:1300px){.dial-board{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
            '@media(max-width:800px){.dial-board{grid-template-columns:1fr;padding:10px;gap:12px}.dial-row{gap:8px}}' +
            '</style>');
    }

    $.ajax({
        url: FinalUrl,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        cache: false,
        success: function (data) {
            var $target = $(tblRequset);

            if (!data || !data.length) {
                setPagerEmpty();
                $target.html('<div class="dial-empty" style="background:#f5f6f8;border-radius:8px;">No tasks found</div>');
                pagination();
                return;
            }

            InitPagination(data[0].VIC, (pageIndex + 1));

            var isTotalTab = (String(Process) === "0");

            var safe = function (v) { return (v === null || v === undefined || v === "") ? "-" : String(v).replace(/<br\/?>/gi, ", "); };
            var esc = function (v) { return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
            var hasValue = function (v) { return !(v === null || v === undefined || v === "" || v === "-"); };

            var statusClass = function (name) {
                var s = String(name || "").toUpperCase();
                if (s.indexOf("CANCEL") !== -1) return "badge-cancelled";
                if (s.indexOf("HOLD") !== -1) return "badge-onhold";
                return "badge-open";
            };

            var badgeWithCaption = function (caption, t, cls) {
                if (!t || t === "-") return '';
                var st = safe(t);
                return '<div class="dial-badge-wrap"><span class="dial-badge-cap">' + caption + '</span><span class="dial-badge ' + cls + '" title="' + esc(st) + '">' + esc(st) + '</span></div>';
            };

            var kpiPill = function (raw) {
                if (!hasValue(raw)) return '<span class="dial-value">-</span>';
                var num = parseFloat(String(raw).replace(/[^0-9.\-]/g, ""));
                if (isNaN(num)) return '<span class="dial-value">' + esc(safe(raw)) + '</span>';
                var cls = num < 0 ? "kpi-bad" : "kpi-good";
                return '<span class="kpi-pill ' + cls + '">' + esc(safe(getHHMM(raw))) + '</span>';
            };

            var infoRow = function (items, isThree) {
                if (!items || !items.length) return '';
                var h = '<div class="dial-row' + (isThree ? ' three' : '') + '">';
                for (var k = 0; k < items.length; k++) {
                    var it = items[k], sv = safe(it.value);
                    var multiline = it.multiline ? ' multiline' : '';
                    h += '<div class="dial-item"><span class="dial-label">' + it.label + '</span><span class="dial-value' + multiline + '" title="' + esc(sv) + '">' + esc(sv) + '</span></div>';
                }
                return h + '</div>';
            };

            var kpiRow = function (labelL, valL, labelR, valR) {
                return '<div class="dial-row">' +
                    '<div class="dial-item centered"><span class="dial-label">' + labelL + '</span>' + kpiPill(valL) + '</div>' +
                    '<div class="dial-item centered"><span class="dial-label">' + labelR + '</span>' + kpiPill(valR) + '</div>' +
                    '</div>';
            };

            var actionBtn = function (icon, label, act, attrs) {
                return '<div class="dial-action" data-act="' + act + '" ' + (attrs || '') + ' title="' + label + '"><img src="../images/' + icon + '" alt=""><span>' + label + '</span></div>';
            };

            var board = ['<div class="dial-board">'];
            var i, v, len = data.length;

            for (i = 0; i < len; i++) {
                v = data[i];

                var PName = safe(v.PORTERNAME),
                    PorterID = v.PORTERID ? String(v.PORTERID) : "",
                    RequestID = v.REQUESTID ? String(v.REQUESTID) : "",
                    CatID = v.CATEGORYID ? String(v.CATEGORYID) : "",
                    RStatus = v.REQUESTSTATUSID ? String(v.REQUESTSTATUSID) : "",
                    ReqNB = safe(v.REQUESTNO),
                    Priority = safe(v.PRIORITY),
                    MultiPorter = safe(v.ISMULTIPORTER),
                    PatientName = safe(v.PATIENTNAME),
                    MUIndex = v.MULTITASKINDEX ? String(v.MULTITASKINDEX) : "",
                    Kitchen = safe(v.KITCHEN),
                    From = safe(v.FROM),
                    ServiceID = v.SERVICEID ? String(v.SERVICEID) : "1",
                    To = safe(v.TO),
                    CategoryName = safe(v.CATEGORYNAME),
                    StatusName = safe(v.REQUESTSTATUS);

                if (ServiceID === "2") From = Kitchen;

                var RK = String(v.RESPONSEKPI || "").split("_"),
                    CK = String(v.COMPLETIONKPI || "").split("_"),
                    IsR = RK[0] || null,
                    IsC = CK[0] || null,
                    responseFlagRaw = getKPIFlag(IsR, getHHMM(IsR)),
                    completionFlagRaw = getKPIFlag(IsC, getHHMM(IsC)),
                    responseFailed = (responseFlagRaw || "").indexOf("#dc2626") !== -1 || (responseFlagRaw || "").indexOf("#ef4444") !== -1,
                    completionFailed = (completionFlagRaw || "").indexOf("#dc2626") !== -1 || (completionFlagRaw || "").indexOf("#ef4444") !== -1,
                    KPImet = "-";

                var statusNum = parseInt(RStatus, 10);

                if (statusNum === 6 || statusNum === 9) {
                    KPImet = (!responseFailed && !completionFailed) ? "YES" : "NO";
                } else if (statusNum === 2 || statusNum === 3) {
                    if (responseFailed) KPImet = "NO";
                } else if (statusNum === 4) {
                    if (responseFailed || completionFailed) KPImet = "NO";
                }

                var kpiCardClass = "";
                if (KPImet === "NO") kpiCardClass = " kpi-fail";
                else if (KPImet === "YES") kpiCardClass = " kpi-pass";

                var OnholdProcess = (CProcess === "8" || RStatus === "8") ? "RELEASE" : "SET",
                    OnHoldModal = (CProcess === "8" || RStatus === "8") ? "ModalOnHoldRelease" : "ModalOnHold",
                    SCProcess = (CProcess === "3" || RStatus === "3") ? "START" : "COMPLETE",
                    OnSCModal = (CProcess === "3" || RStatus === "3") ? "ModalStart" : "ModalComplete";

                board.push('<div class="dial-card', kpiCardClass, '">');
                board.push('<div class="dial-card-head"><div class="dial-id"><span class="dial-taskid-label">Task ID</span>#', (CProcess !== "100" ? RequestID : ReqNB), '</div>');
                board.push('<div class="dial-notes" data-act="notes" data-rid="', RequestID, '" data-proc="', CProcess, '" title="Notes"><img src="../images/memo.png" alt=""><span>Notes</span></div></div>');

                board.push('<div class="dial-badges">');
                board.push(badgeWithCaption("Status", StatusName, statusClass(StatusName)));
                if (CategoryName !== "-") board.push(badgeWithCaption("Task Type", CategoryName, "badge-tofu"));
                board.push('</div>');

                board.push('<div class="dial-body">');

                board.push(infoRow([{ label: "From", value: From }, { label: "To", value: To }]));
                board.push(infoRow([{ label: "Booked On", value: v.REQUESTDATE }, { label: "Req Time", value: v.REQUESTTIME }]));

                var hasAssigned = hasValue(v.ASSIGNEDTIME);
                var hasStarted = hasValue(v.STARTTIME);
                var hasEnded = hasValue(v.ENDTIME);
                var hasOnHoldAt = hasValue(v.ONHOLDTIME);
                var hasOnHoldBy = hasValue(v.ONHOLDBY);
                var hasCancelAt = hasValue(v.CANCELLEDAT);
                var hasCancelBy = hasValue(v.CANCELLEDBY);

                if (isTotalTab) {
                    if (statusNum === 3) {
                        board.push(infoRow([
                            { label: "Assigned At", value: hasAssigned ? v.ASSIGNEDTIME : "-" },
                            { label: "Started At", value: hasStarted ? v.STARTTIME : "-" }
                        ]));
                    } else if (statusNum === 4 || statusNum === 6 || statusNum === 9) {
                        board.push(infoRow([
                            { label: "Started At", value: hasStarted ? v.STARTTIME : "-" },
                            { label: "Completed At", value: hasEnded ? v.ENDTIME : "-" }
                        ]));
                    } else if (statusNum === 8) {
                        board.push(infoRow([
                            { label: "On Hold At", value: hasOnHoldAt ? v.ONHOLDTIME : "-" },
                            { label: "On Hold By", value: hasOnHoldBy ? v.ONHOLDBY : "-" }
                        ]));
                    } else if (statusNum === 7) {
                        board.push(infoRow([
                            { label: "Cancelled At", value: hasCancelAt ? v.CANCELLEDAT : "-" },
                            { label: "Cancelled By", value: hasCancelBy ? v.CANCELLEDBY : "-" }
                        ]));
                    } else {
                        board.push(infoRow([
                            { label: "Started At", value: "-" },
                            { label: "Completed At", value: "-" }
                        ]));
                    }
                } else {
                    if (statusNum === 3) {
                        if (hasAssigned || hasStarted) {
                            board.push(infoRow([
                                { label: "Assigned At", value: hasAssigned ? v.ASSIGNEDTIME : "-" },
                                { label: "Started At", value: hasStarted ? v.STARTTIME : "-" }
                            ]));
                        }
                    } else if (statusNum === 4) {
                        if (hasStarted || hasEnded) {
                            board.push(infoRow([
                                { label: "Started At", value: hasStarted ? v.STARTTIME : "-" },
                                { label: "Completed At", value: hasEnded ? v.ENDTIME : "-" }
                            ]));
                        }
                    } else if (statusNum === 6 || statusNum === 9) {
                        if (hasStarted || hasEnded) {
                            board.push(infoRow([
                                { label: "Started At", value: hasStarted ? v.STARTTIME : "-" },
                                { label: "Completed At", value: hasEnded ? v.ENDTIME : "-" }
                            ]));
                        }
                    } else if (statusNum === 8) {
                        if (hasOnHoldAt || hasOnHoldBy) {
                            board.push(infoRow([
                                { label: "On Hold At", value: hasOnHoldAt ? v.ONHOLDTIME : "-" },
                                { label: "On Hold By", value: hasOnHoldBy ? v.ONHOLDBY : "-" }
                            ]));
                        }
                    } else if (statusNum === 7) {
                        if (hasCancelAt || hasCancelBy) {
                            board.push(infoRow([
                                { label: "Cancelled At", value: hasCancelAt ? v.CANCELLEDAT : "-" },
                                { label: "Cancelled By", value: hasCancelBy ? v.CANCELLEDBY : "-" }
                            ]));
                        }
                    }
                }

                board.push(kpiRow("Response KPI", IsR, "Completion KPI", IsC));

                board.push(infoRow([{ label: "Patient Name", value: PatientName }, { label: "Entered By", value: v.REQUESTORNAME }]));
                board.push(infoRow([{ label: "Assistant Required", value: MultiPorter }, { label: "Priority", value: Priority }]));
                board.push(infoRow([
                    { label: "Remarks", value: v.REQUESTDESKREMARKS, multiline: true },
                    { label: "Porter Remarks", value: v.PORTERREMARKS, multiline: true }
                ]));

                board.push('<div class="dial-row">' +
                    '<div class="dial-item"><span class="dial-label">Porter Name</span><span class="dial-value" title="' + esc(PName) + '">' + (hasValue(v.PORTERNAME) ? esc(PName) : "-") + '</span></div>' +
                    '<div class="dial-item"><span class="dial-label">KPI Met</span><span class="dial-value">' + (KPImet || "-") + '</span></div>' +
                    '</div>');

                board.push('</div><div class="dial-foot">');

                if ((CProcess === "2" || CProcess === "3" || CProcess === "4") && ServiceCode.toString() === "1") {
                    board.push(actionBtn("Add.png", "Reassign", "reassign", 'data-pname="' + esc(PName) + '" data-pid="' + PorterID + '" data-rstatus="' + RStatus + '"'));
                }

                if (CProcess !== "7" && CProcess !== "6") {
                    var iconName = "", label = "";
                    if (RStatus === "3" && CProcess === "3") { iconName = "StartTask"; label = "Start"; }
                    else if (CProcess === "4") { iconName = "CompleteTask"; label = "Complete"; }
                    else if (CProcess === "9" && RStatus === "12") { iconName = "CompleteTask"; label = "Complete"; }
                    if (iconName) {
                        board.push(actionBtn(iconName + ".png", label, "startcomplete", 'data-rid="' + RequestID + '" data-modal="' + OnSCModal + '" data-sp="' + SCProcess + '" data-mu="' + MUIndex + '" data-cat="' + CatID + '"'));
                    }
                }

                if (CanCancel === "1" && (RStatus === "2" || RStatus === "3" || RStatus === "4" || RStatus === "100")) {
                    board.push(actionBtn("close.png", "Cancel", "cancel", 'data-rid="' + RequestID + '" data-nb="' + ReqNB + '" data-mu="' + MUIndex + '" data-cat="' + CatID + '" data-rs="' + RStatus + '"'));
                }

                if ((PRID === "2" || PRID === "5" || PRID === "6") && (RStatus === "2" || RStatus === "3" || RStatus === "4")) {
                    board.push(actionBtn("onhold.png", "Hold", "onhold", 'data-rid="' + RequestID + '" data-pid="' + (PorterID || "0") + '" data-modal="' + OnHoldModal + '" data-op="' + OnholdProcess + '" data-mu="' + (MUIndex || "0") + '"'));
                }

                if ((PRID === "2" || PRID === "5" || PRID === "6") && RStatus === "8") {
                    board.push(actionBtn("start.png", "Release", "onhold", 'data-rid="' + RequestID + '" data-pid="' + (PorterID || "0") + '" data-modal="' + OnHoldModal + '" data-op="' + OnholdProcess + '" data-mu="' + (MUIndex || "0") + '"'));
                }

                board.push('<div class="dial-log" data-act="log" data-rid="', RequestID, '" title="View Log"><img src="../images/Log.png" alt=""><span>Log</span></div>');
                board.push('</div></div>');
            }

            board.push('</div>');

            $target.html(board.join(""));

            $target.off('click.dial').on('click.dial', '[data-act]', function (e) {
                var el = this, ds = el.dataset, act = ds.act;
                e.stopPropagation();
                if (act === 'notes') getCompleteLogs(String(ds.rid), String(ds.proc));
                else if (act === 'reassign') AddTask(el.getAttribute('data-pname'), String(ds.pid), String(ds.rstatus));
                else if (act === 'startcomplete') InitStartComplete(String(ds.rid), String(ds.rid), ds.modal, ds.sp, ds.mu, ds.cat);
                else if (act === 'cancel') InitCancel(String(ds.rid), ds.nb, 'ModalCancel', ds.mu, ds.cat, String(ds.rs));
                else if (act === 'onhold') InitOnHold(String(ds.rid), String(ds.rid), String(ds.pid || '0'), ds.modal, ds.op, String(ds.mu || '0'));
                else if (act === 'log') openReqLogs(String(ds.rid));
            });

            pagination();
        },
        error: function (xhr, textStatus, errorThrown) {
            if (xhr.readyState === 0 || textStatus === "abort" || xhr.status === 0) {
                return;
            }
            console.error('Error loading tasks:', xhr);
            $(tblRequset).html('<div style="width:100%;padding:50px;text-align:center;color:#dc3545;background:#f5f6f8;font-size:14px;">Error loading tasks. Please try again.</div>');
        }
    });
}



function AssignTasks() {
    var UID = sessionStorage.getItem('ID');
    PorterCurTasks = (PorterCurTasks.substr(PorterCurTasks.length - 1) == "_") ? PorterCurTasks.substring(0, (PorterCurTasks.length - 1)) : PorterCurTasks;
    ATReqNB = (ATReqNB.substr(ATReqNB.length - 1) == ",") ? ATReqNB.substring(0, (ATReqNB.length - 1)) : ATReqNB;
    var ATTasks = ATReqNB.replace(/,/g, ", #"), IsMult = (ATReqNB.includes(',') ? ' have ' : ' has ');
    ATTasks = ATTasks.replace(/,([^,]*)$/, ' and ' + '$1');
    $('#' + ((ATPorterID.length > 0) ? 'spanMTTasks' : 'spanMTNTasks')).text("#" + ATTasks + IsMult);
    if (ATPorterID.length > 0) {
        $('#spanMTPorter').text(ATPorterName + ' ');
        $('#spanMTPorterNTasks').text(ATPorterName + ' ');
    }


    $.ajax({
        async: true,
        url: hurl + "Service/ServiceAddTask.aspx?Process=" + encodeURIComponent(Encrypt("ASSIGNTASKS")) +"&PORTERID=" + encodeURIComponent(Encrypt(ATPorterID)) + "&REQUESTIDS=" + encodeURIComponent(Encrypt(PorterCurTasks)) + "&USERID=" + encodeURIComponent(Encrypt(UID)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            if (data[0].RESULT.split("_")[0] === 'TRUE') {

                var ModalDone = ((ATPorterID.length > 0) ? ((PorterCurTasks.length > 0) ? "ModalMTDone" : "successMTNoTask") : "successMTNoporter");

                var divProcess = ((ATPorterID.length > 0) ? ((PorterCurTasks.length > 0) ? "divAssignedPercentage" : "divPendingPercentage") : "divPendingPercentage");




                PorterCurTasks = ''; PendingTasks = ''; ATPorterID = ''; ATPorterName = ''; ATReqNB = '';
                ToUpdate = !ToUpdate; // ReloadLinks();
                Select(divProcess, "PENDING"); //CProcess = '3'; LoadGrid(CProcess);
                ShowModalPopUp(ModalDone);
                setTimeout(function () { HideModalPopUp('ModalAddTask'); }, 400);
                setTimeout(function () { HideModalPopUp(ModalDone); }, 3000);
                ATStatus = ''; clearMT();
                //GetMap();
            }
        },
        error: function (data) {

        }

    });

}


function RaiseDuplicate(ReqID) {
    AbortAllActiveRuquests();
    var UID = sessionStorage.getItem('ID');
    $.ajax({
        async: true,
        url: hurl + "SERVICE/Service.aspx?Process=" + encodeURIComponent(Encrypt("DUPLICATEREQUEST")) +"&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)) + "&USERID=" + encodeURIComponent(Encrypt(UID)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data[0].RESULT.split("_")[0] === 'TRUE') {
                var ReqNB = data[0].RESULT.split("_")[1];

                if ((RHalt1 == '0' && RHalt2 == '0'))
                    $('#LBLRequestResult').html('Request Raised Successfully.. Req No. #' + ReqNB);
                else
                    $('#LBLRequestResult').html('Request(s) Raised Successfully.. Req Nos. ' + ReqNB);

                HideModalPopUp('addTask'); ShowModalPopUp('modalReqAlert');
                setTimeout("HideModalPopUp('modalReqAlert');", 3500);
                HideModalPopUp('modalReqAlert');
                //ReloadLinks(); ReloadLinksButton();
                Select("divPendingPercentage", "PENDING"); setRequestUsers('Tasks');
            }
            else if (data[0].RESULT.split("_")[0] === 'FALSE') {
                $('#spanErrorMessage').html('A similar/same request has already been raised.');
                ShowModalPopUp('modalAlert'); setTimeout("HideModalPopUp('modalAlert');", 3500);

            }

        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });
}



function GetPorterTasks(PorterID) {
    var ContainerID1 = "gridPenTask";

    var savedSelections = {};
    var savedReqNBs = {};

    if (PorterCurTasks) {
        var taskIds = PorterCurTasks.split('_').filter(id => id !== '');
        var reqNBs = ATReqNB.split(',').filter(id => id !== '');

        taskIds.forEach(function (id, index) {
            savedSelections[id] = true;
            if (reqNBs[index]) {
                savedReqNBs[id] = reqNBs[index];
            }
        });
    }

    PorterCurTasks = "";
    ATReqNB = "";

    $.ajax({
        async: true,
        url: hurl + "Service/ServiceAddTask.aspx?Process=" + encodeURIComponent(Encrypt("PENDINGTASKS")) + "&PORTERID=" + encodeURIComponent(Encrypt(PorterID)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var TablePending = "<table width='95%' class='table scroll table-bordered'' cellpadding='5' cellspacing='5' style='border-collapse: collapse;border: 1px solid gray;margin-top: 10px;'> <tr style='border: 1px solid gray;height:30px;'> " +
                "<td align='center'style='width:55px;vertical-align: middle;border: 1px solid gray;font-family: monospace;font-size: 16px;'> REQ NO.  </td> " +
                " <td align='left' style='max-width: 100px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'>  " + ((ServiceCode == "3") ? "REQUEST LOCATION " : "FROM") + ((ServiceCode == "2") ? "(Kitchen) " : "") + "</td>" +
                ((ServiceCode == "2" || ServiceCode == "3") ? " <td align='left' style='max-width: 100px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> " + ((ServiceCode == "3") ? "ZONE NAME " : "TO") + "</td>" : "") +
                " <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> CATEGORY </td> " +
                ((ServiceCode !== "2" && ServiceCode !== "3") ? " <td align='left' style='max-width: 70px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> PATIENT NAME </td> " : "") +
                " <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> STATUS </td> " +
                " <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> CURRENT <br/> PORTER </td> " +
                " <td align='left' style='width:50px;border: 1px solid white;border-bottom: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;' > </td> </tr > ";

            $.each(data, function (key, value) {

                var ReqNB = value.REQNB,
                    from = value.FROM,
                    category = value.CATEGORY,
                    statusID = value.STATUSID,
                    ReqstID = value.REQUESTID,
                    IPorterID = value.PORTERID,
                    RPorterName = value.PORTERNAME,
                    RPatientName = value.PATIENTNAME,
                    To = value.TO,
                    DEPARTMENTID = value.DEPARTMENTID || '',
                    RStatus = (statusID == '2') ? 'Pending' : ((statusID == '3') ? 'Assigned' : 'In-Progress');

                switch (statusID) {
                    case 3:
                    case 4:
                        var OnClick = (statusID == 6) ? "onclick='return false;' " : " onclick='setCurTasks(\"" + ReqstID + "\",\"" + ReqstID + "\",\"" + DEPARTMENTID + "\");' "

                        var isChecked = savedSelections[ReqstID] || (IPorterID == PorterID && IPorterID !== '0');

                        if (isChecked) {
                            PorterCurTasks += ReqstID + "_";
                            ATReqNB += ReqstID + ",";
                        }

                        var checkedIcon = "<img id='CurTask" + ReqstID + "' src='../images/" + (isChecked ? "Check.png" : "UnCheck.png") + "' alt='Add'  height='20px' class='IconAddTask' " + OnClick + " style='cursor:pointer' />";

                        TablePending += "<tr style='border: 1px solid gray;height:25px;' > <td align='center'style='width:50px;vertical-align: middle;border: 1px solid gray;font-family: monospace;font-size: 14px;'> #" + ReqstID +
                            " </td>   <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + from +
                            ((ServiceCode == "2" || ServiceCode == "3") ? ("</td>   <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + To) : "") +
                            " </td>   <td align='left' style='max-width: 100px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + category + "</td>" +
                            ((ServiceCode !== "2" && ServiceCode !== "3") ? " </td>   <td align='left' style='max-width: 70px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RPatientName + "</td>" : "") +
                            " </td>   <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RStatus + "</td>" +
                            " </td>   <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RPorterName + "</td>" +
                            " <td align='left' style='width:50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;' >" + checkedIcon + " </td> </tr > ";
                        break;

                    case 2:
                        var isChecked = savedSelections[ReqstID];
                        if (isChecked) {
                            PorterCurTasks += ReqstID + "_";
                            ATReqNB += ReqstID + ",";
                        }

                        var UncheckedIcon = "<img id='CurTask" + ReqstID + "' src='../images/" + (isChecked ? "Check.png" : "UnCheck.png") + "' alt='Add'  height='20px' class='IconAddTask' onclick='setCurTasks(\"" + ReqstID + "\",\"" + ReqstID + "\",\"" + DEPARTMENTID + "\");' style='cursor:pointer' />";

                        TablePending += "<tr style='border: 1px solid gray;height:25px;' > <td align='center'style='width:50px;vertical-align: middle;border: 1px solid gray;font-family: monospace;font-size: 14px;'> #" + ReqstID +
                            " </td>   <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + from +
                            ((ServiceCode == "2" || ServiceCode == "3") ? ("</td>   <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + To) : "") +
                            " </td>   <td align='left' style='max-width: 100px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + category + "</td>" +
                            ((ServiceCode !== "2" && ServiceCode !== "3") ? " </td>   <td align='left' style='max-width: 70px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RPatientName + "</td>" : "") +
                            " </td>   <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RStatus + "</td>" +
                            " </td>   <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RPorterName + "</td>" +
                            " <td align='left' style='width:50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;' >" + UncheckedIcon + " </td> </tr > ";
                        break;
                }

            });
            TablePending += "</table>";
            $('#' + ContainerID1 + '').html(TablePending);

        },
        error: function (data) {

        }

    });

}
function GetPorterTasks(PorterID) {
    var ContainerID1 = "gridPenTask";

    var savedSelections = {};
    var savedReqNBs = {};

    if (PorterCurTasks) {
        var taskIds = PorterCurTasks.split('_').filter(id => id !== '');
        var reqNBs = ATReqNB.split(',').filter(id => id !== '');

        taskIds.forEach(function (id, index) {
            savedSelections[id] = true;
            if (reqNBs[index]) {
                savedReqNBs[id] = reqNBs[index];
            }
        });
    }

    PorterCurTasks = "";
    ATReqNB = "";

    $.ajax({
        async: true,
        url: hurl + "Service/ServiceAddTask.aspx?Process=" + encodeURIComponent(Encrypt("PENDINGTASKS")) + "&PORTERID=" + encodeURIComponent(Encrypt(PorterID)) + "&SERVICEID=" + encodeURIComponent(Encrypt(ServiceCode)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var TablePending = "<table width='95%' class='table scroll table-bordered'' cellpadding='5' cellspacing='5' style='border-collapse: collapse;border: 1px solid gray;margin-top: 10px;'> <tr style='border: 1px solid gray;height:30px;'> " +
                "<td align='center'style='width:55px;vertical-align: middle;border: 1px solid gray;font-family: monospace;font-size: 16px;'> REQ NO.  </td> " +
                " <td align='left' style='max-width: 100px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'>  " + ((ServiceCode == "3") ? "REQUEST LOCATION " : "FROM") + ((ServiceCode == "2") ? "(Kitchen) " : "") + "</td>" +
                ((ServiceCode == "2" || ServiceCode == "3") ? " <td align='left' style='max-width: 100px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> " + ((ServiceCode == "3") ? "ZONE NAME " : "TO") + "</td>" : "") +
                " <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> CATEGORY </td> " +
                ((ServiceCode !== "2" && ServiceCode !== "3") ? " <td align='left' style='max-width: 70px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> PATIENT NAME </td> " : "") +
                " <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> STATUS </td> " +
                " <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;'> CURRENT <br/> PORTER </td> " +
                " <td align='left' style='width:50px;border: 1px solid white;border-bottom: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;' > </td> </tr > ";

            $.each(data, function (key, value) {

                var ReqNB = value.REQNB,
                    from = value.FROM,
                    category = value.CATEGORY,
                    statusID = value.STATUSID,
                    ReqstID = value.REQUESTID,
                    IPorterID = value.PORTERID,
                    RPorterName = value.PORTERNAME,
                    RPatientName = value.PATIENTNAME,
                    To = value.TO,
                    DEPARTMENTID = value.DEPARTMENTID || '',
                    RStatus = (statusID == '2') ? 'Pending' : ((statusID == '3') ? 'Assigned' : 'In-Progress');

                switch (statusID) {
                    case 3:
                    case 4:
                        var OnClick = (statusID == 6) ? "onclick='return false;' " : " onclick='setCurTasks(\"" + ReqstID + "\",\"" + ReqstID + "\",\"" + DEPARTMENTID + "\");' "

                        var isChecked = savedSelections[ReqstID] || (IPorterID == PorterID && IPorterID !== '0');

                        if (isChecked) {
                            PorterCurTasks += ReqstID + "_";
                            ATReqNB += ReqstID + ",";
                        }

                        var checkedIcon = "<img id='CurTask" + ReqstID + "' src='../images/" + (isChecked ? "Check.png" : "UnCheck.png") + "' alt='Add'  height='20px' class='IconAddTask' " + OnClick + " style='cursor:pointer' />";

                        TablePending += "<tr style='border: 1px solid gray;height:25px;' > <td align='center'style='width:50px;vertical-align: middle;border: 1px solid gray;font-family: monospace;font-size: 14px;'> #" + ReqstID +
                            " </td>   <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + from +
                            ((ServiceCode == "2" || ServiceCode == "3") ? ("</td>   <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + To) : "") +
                            " </td>   <td align='left' style='max-width: 100px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + category + "</td>" +
                            ((ServiceCode !== "2" && ServiceCode !== "3") ? " </td>   <td align='left' style='max-width: 70px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RPatientName + "</td>" : "") +
                            " </td>   <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RStatus + "</td>" +
                            " </td>   <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RPorterName + "</td>" +
                            " <td align='left' style='width:50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;' >" + checkedIcon + " </td> </tr > ";
                        break;

                    case 2:
                        var isChecked = savedSelections[ReqstID];
                        if (isChecked) {
                            PorterCurTasks += ReqstID + "_";
                            ATReqNB += ReqstID + ",";
                        }

                        var UncheckedIcon = "<img id='CurTask" + ReqstID + "' src='../images/" + (isChecked ? "Check.png" : "UnCheck.png") + "' alt='Add'  height='20px' class='IconAddTask' onclick='setCurTasks(\"" + ReqstID + "\",\"" + ReqstID + "\",\"" + DEPARTMENTID + "\");' style='cursor:pointer' />";

                        TablePending += "<tr style='border: 1px solid gray;height:25px;' > <td align='center'style='width:50px;vertical-align: middle;border: 1px solid gray;font-family: monospace;font-size: 14px;'> #" + ReqstID +
                            " </td>   <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + from +
                            ((ServiceCode == "2" || ServiceCode == "3") ? ("</td>   <td align='left' style='max-width: 110px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + To) : "") +
                            " </td>   <td align='left' style='max-width: 100px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + category + "</td>" +
                            ((ServiceCode !== "2" && ServiceCode !== "3") ? " </td>   <td align='left' style='max-width: 70px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RPatientName + "</td>" : "") +
                            " </td>   <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RStatus + "</td>" +
                            " </td>   <td align='left' style='max-width: 50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;word-wrap: break-word;' > " + RPorterName + "</td>" +
                            " <td align='left' style='width:50px;border: 1px solid gray;vertical-align: middle;font-family: monospace;font-size: 14px;padding-left: 10px;' >" + UncheckedIcon + " </td> </tr > ";
                        break;
                }

            });
            TablePending += "</table>";
            $('#' + ContainerID1 + '').html(TablePending);

        },
        error: function (data) {

        }

    });

}

function InitCancel(RequestID, ReqNB, ModalPopup, MUIndex, CatID, RStatus) {
    document.getElementById('HFCancelReqID').value = RequestID; $('#canReqID').html(ReqNB);
    document.getElementById('HFCancelReqNB').value = ReqNB;
    document.getElementById('HFCancelMUIndex').value = MUIndex;
    document.getElementById('HFCancelCatID').value = CatID;
    $('#searchCR_CancelRemarks')[0].sumo.unSelectAll(); $('#searchCR_CancelRemarks')[0].sumo.reload(); $('#searchCR_CancelRemarks')[0].sumo.selectItem(0);
    $('#chkCancelOccurrence').prop('checked', false); //$('#switchOccurrence').prop('disabled', false);

    $('#divOccurrence').css("display", ((RStatus == "12") ? "inline-block" : "none"));
    ShowModalPopUp(ModalPopup);
    setTimeout(function () { $('#txtCancelReason').val(''); $('#txtCancelReason').focus(); }, 500);

}



function InitOnHold(RequestID, ReqNB, PorterID, ModalPopup, OnholdProcess, MUIndex) {


    document.getElementById('HFOnHoldReqID').value = RequestID;
    document.getElementById('HFOnHoldReqNB').value = ReqNB;
    document.getElementById('HFOnHoldMUIndex').value = MUIndex;
    switch (OnholdProcess) {
        case "SET":
            $('#OnHoldReqID').html(ReqNB);
            document.getElementById('HFOnHoldPorterID').value = PorterID;
            ShowModalPopUp(ModalPopup);
            setTimeout(function () { $('#txtOnHoldReason').val(''); $('#txtOnHoldReason').focus(); }, 500);
            break;
        case "RELEASE":
            $('#OnHoldReleaseReqID').html(ReqNB);
            ShowModalPopUp(ModalPopup);
            break;
    }

}


function OnHoldRequest() {
    var CReason = $('#txtOnHoldReason').val(), ReqID = $('#HFOnHoldReqID').val(), PoreterID = $('#HFOnHoldPorterID').val();
    var ReqNB = $('#HFOnHoldReqNB').val(), MUIndex = $('#HFOnHoldMUIndex').val(); $('#spanTaskOnHold').html(ReqNB);
    if (CReason.length > 0) {
        HideModalPopUp('ModalOnHold');
        ShowModalPopUp('ModalSuccessOnHold');
        OnHoldCurrentRequest(CReason, ReqID, PoreterID, MUIndex);
    }
    else
        $('#TxtCancelReason').focus();
}


function InitStartComplete(RequestID, ReqNB, ModalPopup, Process, MUIndex, CatID) {

    document.getElementById('HFSCReqID').value = RequestID;
    document.getElementById('HFSCReqNB').value = ReqNB;
    document.getElementById('HFSCMUIndex').value = MUIndex;
    document.getElementById('HFCatID').value = CatID;
    switch (Process) {
        case "START":
            $('#StartReqID').html(ReqNB);
            ShowModalPopUp(ModalPopup);
            setTimeout(function () { $('#txtStartReason').val(''); $('#txtStartReason').focus(); }, 500);
            break;
        case "COMPLETE":
            $('#CompleteReqID').html(ReqNB);
            ShowModalPopUp(ModalPopup);
            setTimeout(function () { $('#txtCompleteReason').val(''); $('#txtCompleteReason').focus(); }, 500);
            ShowModalPopUp(ModalPopup);
            break;
    }

}

function StartRequest() {

    var CReason = $('#txtStartReason').val(), ReqID = $('#HFSCReqID').val();
    var ReqNB = $('#HFSCReqNB').val(), MUIndex = $('#HFSCMUIndex').val(); $('#spanTaskStart').html(ReqNB);
    //if (CReason.length > 0) {
    HideModalPopUp('ModalStart');
    ShowModalPopUp('ModalSuccessStart');
    StartCurrentRequest(CReason, ReqID, MUIndex);
    //}
    //else
    //    $('#txtStartReason').focus();
}


function StartCurrentRequest(CReason, ReqID, MUIndex) {
    AbortAllActiveRuquests();
    var UID = sessionStorage.getItem('ID');
    $.ajax({
        url: hurl + "Service/ServiceRequest.aspx?Process=" + encodeURIComponent(Encrypt("STARTTASK")) +"&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)) + "&REASON=" + encodeURIComponent(Encrypt(CReason)) + "&MIINDEX=" + encodeURIComponent(Encrypt(MUIndex)) + "&USERID=" + encodeURIComponent(Encrypt(UID)),
        type: 'POST',
        data: 'pData',
        async: true,
        dataType: 'json',
        success: function (data) {

            setTimeout(function () { HideModalPopUp('ModalSuccessStart'); }, 700);

            Select("divInprogressPercentage", "INPROGRESS");
        },
        error: function (data) {

        }

    });
    //setTimeout(function () { ReloadLinksButton(); }, 500);
}


function CompleteRequest() {

    var CReason = $('#txtCompleteReason').val(), ReqID = $('#HFSCReqID').val(), CatID = $('#HFCatID').val();
    var ReqNB = $('#HFSCReqNB').val(), MUIndex = $('#HFSCMUIndex').val(); $('#spanTaskComplete').html(ReqNB);
    //if (CReason.length > 0) {
    HideModalPopUp('ModalComplete');
    ShowModalPopUp('ModalSuccessComplete');
    CompleteCurrentRequest(CReason, ReqID, MUIndex, CatID);
    //}
    //else
    //    $('#txtCompleteReason').focus();
}



function CompleteCurrentRequest(CReason, ReqID, MUIndex, CatID) {
    AbortAllActiveRuquests();
    var UID = sessionStorage.getItem('ID');
    $.ajax({
        url: hurl + "Service/ServiceRequest.aspx?Process=" + encodeURIComponent(Encrypt("COMPLETETASK")) +"&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)) + "&REASON=" + encodeURIComponent(Encrypt(CReason)) + "&MIINDEX=" + encodeURIComponent(Encrypt(MUIndex)) + "&USERID=" + encodeURIComponent(Encrypt(UID)),
        type: 'POST',
        data: 'pData',
        async: true,
        dataType: 'json',
        success: function (data) {

            setTimeout(function () { HideModalPopUp('ModalSuccessComplete'); }, 700);
            if (CatID !== '73')
                Select("divCompletedPercentage", "COMPLETED");
            else
                Select("divBarrierPercentage", "Barrier")
        },
        error: function (data) {

        }

    });
    //setTimeout(function () { ReloadLinksButton(); }, 500);
}

function ReleaseOnHoldRequest() {
    AbortAllActiveRuquests();
    var ReqID = $('#HFOnHoldReqID').val();
    var ReqNB = $('#HFOnHoldReqNB').val(); $('#spanReleaseTaskOnHold').html(ReqNB);

    HideModalPopUp('ModalOnHoldRelease');
    ShowModalPopUp('ModalReleaseSuccessOnHold');

    var UID = sessionStorage.getItem('ID'), GMIndex = 0;
    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("RESUMEONHOLDTASK")) + "&USERID=" + encodeURIComponent(Encrypt(UID)) + "&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)),
        type: 'POST',
        data: 'pData',
        async: true,
        dataType: 'json',
        success: function (data) {

            setTimeout(function () { HideModalPopUp('ModalReleaseSuccessOnHold'); }, 1000);

            Select("divPendingPercentage", "PENDING");
            //LoadProcess(((CProcess == "10") ? "0" : CProcess));

        },
        error: function (data) {

        }

    });
    //setTimeout(function () { ReloadLinksButton(); }, 500)
}

function OnHoldCurrentRequest(Reason, ReqID, PoreterID, MUIndex) {
    AbortAllActiveRuquests();
    var UID = sessionStorage.getItem('ID'), GMIndex = MUIndex;
    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("ONHOLDTASK")) + "&REASON=" + encodeURIComponent(Encrypt(Reason)) + "&USERID=" + encodeURIComponent(Encrypt(UID)) + "&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)) + "&PORTERIDS=" + encodeURIComponent(Encrypt(PoreterID)) + "&MIINDEX=" + encodeURIComponent(Encrypt( GMIndex)),
        type: 'POST',
        data: 'pData',
        async: true,
        dataType: 'json',
        success: function (data) {

            setTimeout(function () { HideModalPopUp('ModalSuccessOnHold'); }, 700);

            Select("divPendingOnHoldPercentage", "ONHOLD");
            //LoadProcess(((CProcess == "10") ? "0" : CProcess));

        },
        error: function (data) {

        }

    });
    //setTimeout(function () { ReloadLinksButton(); }, 500);

}

function setCurTasks(RequestID, ReqNB, DepartmentID) {
    var Img = $('#CurTask' + RequestID);
    var CurSrc = $(Img).attr('src');
    var NewSrc = ((CurSrc == "../images/Check.png") ? "../images/UnCheck.png" : "../images/Check.png");

    if (CurSrc == "../images/Check.png") {
        PorterCurTasks = PorterCurTasks.replace(RequestID + "_", "");
        ATReqNB = ATReqNB.replace(ReqNB + ",", "");

        PorterCurTasks = PorterCurTasks.replace(/__+/g, "_");
        ATReqNB = ATReqNB.replace(/,+/g, ",");
        PorterCurTasks = PorterCurTasks.replace(/^_|_$/, "");
        ATReqNB = ATReqNB.replace(/^,|,$/, "");
    }
    else {
        PorterCurTasks += RequestID + "_";
        ATReqNB += ReqNB + ",";
    }

    $(Img).attr("src", NewSrc);

    if (DepartmentID && DepartmentID !== '0' && DepartmentID !== '' && DepartmentID !== 'null') {
        LoadMTPorters(DepartmentID);
    } else {
        LoadMTPorters();
    }
}

function setPriority(Priority, CategoryID, RequestID) {

    $.ajax({
        async: true,
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("PRIORITY")) + "&REQUESTID=" + encodeURIComponent(Encrypt(RequestID)) + "&Priority=" + encodeURIComponent(Encrypt(Priority)) + "&CategoryID=" + encodeURIComponent(Encrypt(CategoryID)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            LoadProcess(((CProcess == "10") ? "0" : CProcess));
        },
        error: function (data) {

        }

    });

}


function CancelRequest() {
    var drpCReason = selectedText('searchCR_CancelRemarks') //$('#searchCR_CancelRemarks option:selected').text();

    //alert(drpCReason);

    var CReason = drpCReason + '_' + $('#txtCancelReason').val(), ReqID = $('#HFCancelReqID').val(), CatID = $('#HFCancelCatID').val(), IsPreBook = ((CProcess == '100') ? 'YES' : 'NO');
    var ReqNB = $('#HFCancelReqNB').val(), MUIndex = $('#HFCancelMUIndex').val(); $('#spanTaskCnl').html(ReqNB);
    if (CReason.length > 0 && CReason !== '_') {
        HideModalPopUp('ModalCancel');
        ShowModalPopUp('ModalSuccessCancel');
        CancelCurrentRequest(CReason, ReqID, IsPreBook, MUIndex, CatID);
        //LoadPresetRemarks();
    }
    else
        $('#TxtCancelReason').focus();
}

function selectedText(drpSumo) {
    var valSel = '';
    $('#' + drpSumo + ' option:selected').each(function (i) {
        valSel += $(this).text() + ',';
    });


    return valSel.replace('-- Select --,', '').replace(/.$/, "");
}


function CancelCurrentRequest(Reason, ReqID, PreBook, MUIndex, CatID) {
    AbortAllActiveRuquests();
    var IsOccurrence = $('#chkCancelOccurrence').prop('checked');
    IsOccurrence = (IsOccurrence) ? "YES" : "NO";

    var UID = sessionStorage.getItem('ID'), GMIndex = MUIndex;
    HideModalPopUp('ModalFinish');
    $.ajax({
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("CANCELTASK")) + "&REASON=" + encodeURIComponent(Encrypt(Reason)) + "&USERID=" + encodeURIComponent(Encrypt(UID)) + "&REQUESTID=" + encodeURIComponent(Encrypt(ReqID)) + "&PREBOOK=" + encodeURIComponent(Encrypt(PreBook)) + "&MIINDEX=" + encodeURIComponent(Encrypt(GMIndex)) + "&OCCURRENCE=" + encodeURIComponent(Encrypt(GMIndex)),
        type: 'POST',
        data: 'pData',
        async: true,
        dataType: 'json',
        success: function (data) {

            setTimeout(function () { /*LoadCancelRemarks(data);*/ HideModalPopUp('ModalSuccessCancel'); }, 700);

            if (CatID !== '73') {
                if (CProcess == "100")
                    Select("divPrebookeddPercentage", "PREBOOKED");
                else
                    Select("divCancelledPercentage", "CANCELLED");
            }
            else
                Select("divBarrierPercentage", "Barrier")

            //LoadProcess(((CProcess == "10") ? "0" : CProcess));

        },
        error: function (data) {

        }

    });
    //setTimeout(function () { ReloadLinksButton(); }, 500);

}
function LocatePorter(PorterID, PorterID1, PName, DeviceID) {

    //window.open('../Track/PopupRequest.aspx?TagId=Porter=' + PorterID + ((PorterID1.length > 0) ? ',' + PorterID1 : '') + "&Name=" + PName, 'TRACKING : #' + PName, 'directories=no,titlebar=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=1100,height=700');

    var PorterName = PName.toUpperCase().replace("&", " and ");
    window.open('../Track/Popup.aspx?TagId=' + DeviceID + "&Name=" + PorterName, 'TRACKING : #' + PorterName, 'directories=no,titlebar=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=1050,height=760');

    //$('#MapPorterNmae').html(PName);
    //clearInterval(Reload);
    //ReloadMap = window.setInterval(function () { GetMapDetails(DeviceID); }, 1000);
    //ShowModalPopUp('floor-map-popup');
}


function GetMapDetails(PorterID) {

    $.ajax({
        async: true,
        url: hurl + "Service/LocationInfo.aspx?Process=" + encodeURIComponent(Encrypt("GETPORTERLOCINFO")) + "&PORTERID=" + encodeURIComponent(Encrypt(PorterID)),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data.length > 0) {
                $('#PorterMap').attr("src", data[0].MAP);
                $('#MapCurLocation').html(data[0].LOCATION);

            }

        },
        error: function (data) {

        }

    });

}

function GetImage() {
    SetPorterDetails();
    $.ajax({
        async: true,
        url: hurl + "Locate.aspx?TagId=" + TTID + "&CurrentTime=" + daten,
        type: 'POST',
        data: 'pData',
        dataType: 'xml',
        success: function (data) {
            var Img = $(data).find("IMAGE").text();
            if (Img.length > 0)
                $('#tdPorter').css("background-image", "URL('" + Img + "')");
        },
        error: function (data) {
        }

    });
}

function LoadGrid(Process, grid) {
    var UID = sessionStorage.getItem('ID'), PRID = sessionStorage.getItem('ROLE');
    var FinalUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GET")) + "&Status=" + encodeURIComponent(Encrypt(Process)) + "&Search=" + encodeURIComponent(Encrypt((((Process == 3) || (Process == 4) || (Process == 5) || (Process == 6)) ? $('#txtSearch').val() : ""))) + "&USERID=" + encodeURIComponent(Encrypt(UID)) + "&PageIndex=" + encodeURIComponent(Encrypt(pageIndex)) + "&PageSize=" + encodeURIComponent(Encrypt(pageSize)) + "&ROLE=" + encodeURIComponent(Encrypt(PRID));
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
                else
                    updateVirtualItemCount(data.length, tableView)
                if (pageIndex == '0')
                    tableView.set_currentPageIndex(pageIndex);
                tableView.set_dataSource(data);
                tableView.dataBind();
            }
        },
        error: function (data) {

        }

    });
}



function updateVirtualItemCount(result, tableView) {
    tableView.set_virtualItemCount(result);
}

function GridRequest_Command(sender, args) {
    args.set_cancel(true);
    pageIndex = parseInt(sender.get_masterTableView().get_currentPageIndex());
    pageSize = sender.get_masterTableView().get_pageSize();
    switch (args.get_commandName()) {
        case "Page":
        case "PageSize":
            ShowModalPopUp('ModalLoading');
            LoadProcess(CProcess);
            break;
    }
}

function LoaderOn() {
    $('.loaderElement').css("display", "inline-block");
}


function LoaderOff(Interval) {
    setTimeout(function () {
        $('.loaderElement').css("display", "none");
    }, Interval);
}

function ShowModalAddtask() {
    $('#addTask').modal({
        backdrop: 'static',
        keyboard: false
    })
    $('#addTask').modal('show');
}

function ShowModalPopUp(ModalId) {
    $('#' + ModalId).modal('show');
}
function HideModalPopUp(ModalId) {
    $('#' + ModalId).modal('hide');
}


function GetBarearEndDate() {

    var date = new Date(); date.setDate(date.getDate() + 28);

    var y = date.getFullYear(), m = (date.getMonth() + 1).toString(), d = date.getDate().toString();

    m = (m.length == 1) ? ('0' + m.toString()) : m.toString(); d = (d.length == 1) ? ('0' + d.toString()) : d.toString();

    //alert(d + '/' + m + '/' + y);
    return d + '/' + m + '/' + y;
}


function RemoveChartTooltips() {

    document.querySelectorAll('svg title').forEach(function (el) {
        el.remove();
    });

    document.querySelectorAll('[title]').forEach(function (el) {
        el.removeAttribute('title');
    });

    document.querySelectorAll('[aria-label]').forEach(function (el) {
        el.removeAttribute('aria-label');
    });

}

setInterval(RemoveChartTooltips, 1000);