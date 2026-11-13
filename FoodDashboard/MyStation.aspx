<%@ Page Language="C#" AutoEventWireup="true" CodeFile="MyStation.aspx.cs" Inherits="FoodDashboard_MyStation" %>

<html lang="en">

<head>
    <title>MyStation | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Favicon -->
    <link rel="icon" href="../favicon.png" />
    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" href="../fontawesome/css/all.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/MyStation.css" />

    <link href="../css/changepwd.css" rel="stylesheet" />


    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/MyStation.js" type="text/javascript"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>
    <telerik:RadCodeBlock ID="RadCodeBlock" runat="server">
        <script type="text/javascript">
            var dataSet = [], hurl = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/FoodDashboard/",
                urlPageValidation =  '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' +'<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/MasterPage/Service/Service.aspx?",
                CryptoKey = '<%=ConfigurationManager.AppSettings["CryptoKey"].ToString() %>',
                CryptoPwd = '<%=ConfigurationManager.AppSettings["CryptoIV"].ToString() %>',
                ConProtocol = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>',
                olddatetime = '', prebook = '', TimerHome, ToUpdate = false,
                FPatientName = '', TPatientName = '', MRDPatientName = '', GCancelReason, GFinishReason, GTagID, CurrentDStatus, GReqID, GPorterID, IsEdit, GMIndex = '0', GExtn = '', ReqDate = '', ReqTime = '', ReqCat = '0', RFromID = '0', RToID = '0', RPreBook = '0',
                Efrom, ETo, ECategory, EDate, EPatient, Remarks, AReqID, APorter1, APorter2, ADept, Isclear = false, PorterID1 = ''; PorterName1 = ''; PorterID = ''; PorterName = '', PORTERGROUP = '', ISMULTIPORTER = 'NO', IsReturn = 'NO',
                    MAReqID = '', MADept = '', MACount = 60, MANReqID = '', MANCount = 60, MANPorterID = '', MANPorterName = '', GPatientName = '', GFrom = '', GStatus = '2', GOMI = '0', GUser = '', ATReqNB = '',
                    IsMRD = 'NO';

            var PorterCurTasks = '', PendingTasks = '', ATPorterID = '', ATPorterName = '', ATStatus = '', ATReqNB = '';

            var EUserID = '', EUserName = '', ERoleID = '', EDefaultLocation = '', Erolename = '', EIsActive = '', ERoleName = '', ENearByZoneArr = '', ENearByZoneIDs = '', EMId = '';

            var grid, gridMasterTable, pageSize = 15, pageIndex = 0;


            $(document).ready(function () {
                InitChangePassword();
                LoadMyStation();
                $(document).on('click', '.tab-btn', function () {
                    $('.tab-btn').removeClass('active');
                    $(this).addClass('active');
                    currentTab = $(this).data('tab');
                    renderDashboard();
                });
                $(document).on('click', '.status-filter', function () {
                    $('.status-filter').removeClass('active');
                    $(this).addClass('active');
                    currentStatusFilter = $(this).data('status');

                    $("#active-filter-text").text(currentStatusFilter.charAt(0).toUpperCase() + currentStatusFilter.slice(1));
                    $("#filter-notification").removeClass("d-none");
                    renderDashboard();
                });
                var userName = sessionStorage.getItem('NAME') || '';
                var userRole = sessionStorage.getItem('ROLENAME') || '';
                var roleId = parseInt(sessionStorage.getItem("ROLE")) || 0;
                if (roleId === 14) {
                    $("#foodOrderContainer").show();
                } else {
                    $("#foodOrderContainer").next("br").remove();
                    $("#foodOrderContainer").remove();
                }
                $('#spndepNursname').text(userName);
                $('#spnUserTypeLabel').text(userRole);
                $('#spanUserName').text(userName);
                $('#hfUserName').val(userName);
                $('#hfUserRole').val(userRole);
                LoadNotifications();
                $('#notificationBell').off('click').on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $('#notificationDropdown').toggleClass('show');
                    if ($('#notificationDropdown').hasClass('show')) {
                        LoadNotifications();
                    }
                });
                $(document).on('click', function (e) {
                    if (!$(e.target).closest('.notification-wrapper').length) {
                        $('#notificationDropdown').removeClass('show');
                    }
                });
                $('#markAllRead').off('click').on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    MarkAllNotificationsAsRead();
                });
            });

        </script>
    </telerik:RadCodeBlock>
</head>
<body>
    <form id="formCategory" runat="server">
        <telerik:RadScriptManager ID="RadScriptManager" runat="server">
        </telerik:RadScriptManager>
        <asp:HiddenField ID="HFCancelReqID" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="HFERID" runat="server" ClientIDMode="Static" />

        <asp:HiddenField ID="HFERNO" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="HFStatusID" runat="server" ClientIDMode="Static" />

        <asp:HiddenField ID="HFDWExportHeader" runat="server" ClientIDMode="Static" />

        <asp:HiddenField ID="HFDWSearchQuery" runat="server" ClientIDMode="Static" />
        <style>
            @keyframes tutorialBlink {
                0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                }

                50% {
                    opacity: .35;
                    transform: scale(1.25);
                }
            }
        </style>

        <div id="tutorialPopup"
            style="position: fixed; inset: 0; background: rgba(0,0,0,.55); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 100001;">
            <div style="width: 910px; max-width: 95%; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,.35);">

                <div style="height: 78px; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ECECEC; background: #fff;">
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <div style="width: 38px; height: 38px; border-radius: 50%; background: #DDF8EF; color: #00A86B; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex: 0 0 auto;">?</div>
                        <div>
                            <h3 style="margin: 0; font-size: 20px; color: #16213E; font-weight: 700; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Video Tutorial</h3>
                            <p style="margin: 2px 0 0; font-size: 14px; color: #8A94A6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">A quick walkthrough of the admin console</p>
                        </div>
                    </div>
                    <button type="button" id="closeTutorial"
                        style="width: 42px; height: 42px; min-width: 42px; min-height: 42px; border: none; border-radius: 50%; background: #EEF3F8; color: #6B7280; font-size: 20px; font-weight: 700; cursor: pointer; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; font-family: Arial, sans-serif;">
                        &#10005;</button>
                </div>

                <div style="background: #1B1B1B; min-height: 420px; display: flex; align-items: center; justify-content: center;">
                    <video id="tutorialVideo" controls preload="metadata"
                        style="width: 100%; display: block; background: #000; min-height: 420px; max-height: 520px;">
                        <source src="/videos/AdminTutorial.mp4" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>

            </div>
        </div>

        <script>
            (function () {
                function initTutorialPopup() {
                    var popup = document.getElementById("tutorialPopup");
                    var video = document.getElementById("tutorialVideo");
                    var watch = document.getElementById("watchTutorial");
                    var close = document.getElementById("closeTutorial");

                    if (!popup || !watch || !close) return;

                    watch.addEventListener("click", function () {
                        popup.style.display = "flex";
                        if (video) {
                            video.currentTime = 0;
                            setTimeout(function () {
                                video.play().catch(function (e) {
                                    console.log("Autoplay blocked or video not ready:", e);
                                });
                            }, 50);
                        }
                    });

                    function closeTutorial() {
                        popup.style.display = "none";
                        if (video) {
                            video.pause();
                            video.currentTime = 0;
                        }
                    }

                    close.addEventListener("click", closeTutorial);

                    popup.addEventListener("click", function (e) {
                        if (e.target === popup) closeTutorial();
                    });

                    document.addEventListener("keydown", function (e) {
                        if (e.key === "Escape" && popup.style.display === "flex") {
                            closeTutorial();
                        }
                    });
                }

                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", initTutorialPopup);
                } else {
                    initTutorialPopup();
                }
            })();
        </script>
        <div id="loader" class="loader-wrapper">
            <img src="../images/Traczo.svg" alt="Traczo">
        </div>
        <div class="main-wrapper">
            <div class="main-screen-wrap">
                <div class="main-screen-inner">

                    <!-- Left Panel -->
                    <div class="screen-left-panel">
                        <div class="screen-left-sticky">
                            <div>
                                <div class="traczo-logo">
                                    <a href="../Index/Index.aspx">
                                        <img src="../images/Traczo.svg" alt="Traczo">
                                    </a>
                                </div>
                                <div class="hospital-img">
                                    <img src="../images/hospitaleq.jpg" alt="Hospital">
                                </div>
                                <div class="hospital-title">
                                    <h5>Welcome</h5>
                                    <h6>Burjeel Medical City (BMC)</h6>
                                    <p>Mohamed Bin Zayed City - Abu Dhabi - United Arab Emirates</p>
                                </div>
                                <div class="left-panel-menu">
                                    <ul>
                                        <li>
                                            <a href="../Index/Index.aspx">
                                                <span>
                                                    <img src="../images/home.png" alt="Home"></span> Home
                                            </a>
                                        </li>
                                        <li style="display: none">
                                            <a href="dashboard.html">
                                                <span>
                                                    <img src="../images/dashboard.png" alt="Dashboard"></span> Dashboard
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" onclick="redirectFloorwiseTrac()">
                                                <span>
                                                    <img src="../images/world-map.png" alt="Map"></span> Map
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Track/TrackNew.aspx">
                                                <span>
                                                    <img src="../images/doc.png" alt="Track"></span> Track
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Reports/Report.aspx">
                                                <span>
                                                    <img src="../images/clipboard.png" alt="Reports"></span> Reports
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Planner/Planner.aspx">
                                                <span>
                                                    <img src="../images/spiral-calendar.png" alt="Planner"></span> Planner
                                            </a>
                                        </li>

                                        <li>
                                            <a href="../Master/Category.aspx">
                                                <span>
                                                    <img src="../images/category-master.png" alt="Task Types"></span> Task Types
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Master/Porter.aspx">
                                                <span>
                                                    <img src="../images/porter-master.png" alt="Porter Master"></span> Porter Master
                                            </a>
                                        </li>

                                        <li>
                                            <a href="../Master/Users.aspx">
                                                <span>
                                                    <img src="../images/porter-master.png" alt="Location Master"></span> User Master
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Master/Equipment.aspx">
                                                <span>
                                                    <img src="../images/Equipment.png" alt="Location Master"></span> Equipment Master
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Master/Locations.aspx">
                                                <span>
                                                    <img src="../images/location.png" alt="Location Master"></span> Location Master
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Master/Department.aspx">
                                                <span>
                                                    <img src="../images/location.png" alt="Location Master"></span> Department Master
                                            </a>
                                        </li>

                                        <li>
                                            <a href="../Master/PerformLogs.aspx">
                                                <span>
                                                    <img src="../images/priority.png" alt="Location Master"></span> P3rform Logs
                                            </a>
                                        </li>

                                        <li>
                                            <a onclick="javascript:Bulk();" href="#">
                                                <span>
                                                    <img src="../images/upload-task.png" alt="Upload Tasks"></span> Upload Tasks
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Master/Group.aspx">
                                                <span>
                                                    <img src="../images/group-master.png" alt="Group Master"></span> Group Master
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Master/Remarks.aspx">
                                                <span>
                                                    <img src="../images/memo.png" alt="Group Master"></span> Remarks Master
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../FoodDashboard/PatientDietAssignment.aspx">
                                                <span>
                                                    <img src="../images/PATIENTS.png" alt="PatientDiet Assignment"></span> Patient
                                            </a>
                                        </li>
                                        <li class="current-menu-item">
                                            <a href="../FoodDashboard/DietTypeManagement.aspx">
                                                <span>
                                                    <img src="../images/DIETS.png" alt="Diet Types"></span> Diet Types
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../FoodDashboard/MenuMaster.aspx">
                                                <span>
                                                    <img src="../images/MENUS.png" alt="Menu Master"></span> MenuMaster
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../FoodDashboard/Kitchen.aspx">
                                                <span>
                                                    <img src="../images/KITCHENS.png" alt="Kitchen"></span> Kitchen
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <br />
                            <br />
                            <br />
                            <div>
                                <div class="profile-link" onmouseover="HoverOpenSideBar()" onmouseout="OutOpenSideBar()">
                                    <div class="profile-img">
                                        <%--<img src="../images/User.png" class="ImgUser" alt="Profile">--%>
                                    </div>
                                    <div class="profile-designation">
                                        <h6><span id="spanUserName"></span>
                                            <br />
                                            <br />
                                            <span style="text-decoration: underline; font-size: 12px;">Log out</span></h6>
                                    </div>
                                    <a href="../login.aspx" class="stretched-link"></a>
                                    <img src="../images/User.png" class="ImgUser" onmouseover="HoverOpenSideBar()" alt="Profile" />


                                    <div class="DivPassword" id="DivPassword" style="display: none" align="left">
                                        <ul class='Pmenu'>
                                            <li><a onclick="ChangePassword();">Change Password </a></li>

                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div class="screen-right-panel">
                        <div style="position: absolute; top: 12px; right: 30px; z-index: 1000;">
                            <div style="background: white; padding: 6px 16px 6px 18px; border-radius: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 12px;">
                                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                    <span style="font-weight: 700; color: #0f172a; font-size: 14px;" id="spndepNursname"></span>
                                    <span style="font-weight: 500; color: #6b7280; font-size: 11px;" id="spnUserTypeLabel"></span>
                                </div>
                                <div style="width: 1px; height: 30px; background: #e5e7eb;"></div>
                                <div class="notification-bell" id="notificationBell">
                                    <img src="../images/bell-icon.png" alt="Notifications" class="bell-icon" />
                                    <span class="notification-badge" id="notificationCount">0</span>
                                </div>
                                <a href="../login.aspx" title="Logout" style="display: flex; align-items: center; gap: 6px; padding: 4px 12px 4px 8px; border-radius: 20px; transition: all 0.2s; text-decoration: none; color: #dc2626; cursor: pointer; font-size: 13px; font-weight: 500;"
                                    onmouseover="this.style.background='#fee2e2'; this.style.color='#b91c1c';"
                                    onmouseout="this.style.background='transparent'; this.style.color='#dc2626';">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Logout
                                </a>
                            </div>
                        </div>


                        <div class="notification-wrapper">
                            <div class="notification-dropdown" id="notificationDropdown">
                                <div class="notification-header">
                                    <h6>Notifications</h6>
                                    <button class="mark-all-read" id="markAllRead">
                                        <img src="../images/check-double-icon.png" alt="Mark all as read" class="check-icon" />
                                        Mark all as read
                                    </button>
                                </div>
                                <div class="notification-list" id="notificationList">
                                    <div style="text-align: center; padding: 20px; color: #888;">Loading...</div>
                                </div>
                            </div>
                        </div>
                        <div class="station-container">
                            <div class="stationheader d-flex justify-content-between align-items-center mb-3 px-3">
                                <div>
                                    <h4 class="fw-bold m-0" style="display: inline-flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                                        <span>
                                            <i class="fa-solid fa-utensils me-2"></i>My Station
                                        </span>
                                        <button type="button" id="watchTutorial"
                                            title="Diet Type Management Info"
                                            onmouseover="this.style.background='rgba(100,116,139,.18)';"
                                            onmouseout="this.style.background='rgba(100,116,139,.10)';"
                                            style="background: rgba(100,116,139,.10); border: 1px solid rgba(100,116,139,.18); border-radius: 20px; height: 30px; padding: 0 11px 0 8px; display: inline-flex; align-items: center; gap: 6px; color: #64748b; font-size: 12px; font-weight: 600; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; cursor: pointer; transition: .2s;">

                                            <svg viewBox="0 0 24 24"
                                                fill="none"
                                                style="width: 16px; height: 16px; flex-shrink: 0;">
                                                <circle cx="12" cy="12" r="9"
                                                    stroke="currentColor"
                                                    stroke-width="2.5" />
                                                <path d="M12 10.5V16"
                                                    stroke="currentColor"
                                                    stroke-width="2.5"
                                                    stroke-linecap="round" />
                                                <circle cx="12" cy="7.5" r="1.4"
                                                    fill="currentColor" />
                                            </svg>

                                            <span>Info</span>

                                        </button>
                                    </h4>
                                    <p class="text-muted mb-0 mt-1" style="font-size: 12px;">
                                        Items routed to your station, grouped by meal. Tap <b>Start</b> when you begin cooking, <b>Ready</b> when plated.
                                    </p>
                                </div>
                                <button type="button" class="btn-refresh-station" onclick="ReloadStationData(this)">
                                    <i class="fas fa-sync-alt me-1"></i>Refresh
                                </button>
                            </div>
                            <div class="row mb-3 g-3 px-3">
                                <div class="col-md-3">
                                    <div class="stat-box status-filter pending-border active" data-status="pending">
                                        <h2 id="total-pending">0</h2>
                                        <p>PENDING</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="stat-box status-filter cooking-border" data-status="cooking">
                                        <h2 id="total-cooking">0</h2>
                                        <p>COOKING</p>
                                    </div>
                                </div>
                                <div class="col-md-3" id="readyBox" style="display: none;">
                                    <div class="stat-box status-filter ready-border" data-status="ready">
                                        <h2 id="total-ready">0</h2>
                                        <p>READY</p>
                                    </div>
                                </div>
                                <div class="col-md-3" id="deliveredBox" style="display: none;">
                                    <div class="stat-box status-filter delivered-border" data-status="delivered">
                                        <h2 id="total-Delivered">0</h2>
                                        <p>DELIVERED</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="stat-box status-filter feedback-border" data-status="feedback">
                                        <h2 id="total-feedback">0</h2>
                                        <p>FEEDBACK</p>
                                    </div>
                                </div>
                            </div>
                            <div id="filter-notification" class="px-3 mb-2 d-none">
                                <div class="filter-info-bar">
                                    <span>Filtered to <b id="active-filter-text">Pending</b> orders only</span>
                                </div>
                                <button type="button" class="btn-clear-filter" onclick="resetStatusFilter()">Clear</button>
                            </div>
                            <div class="filter-tabs-wrapper mb-4 px-3">
                                <div class="filter-tabs-container">
                                    <button type="button" class="tab-btn active" data-tab="all">
                                        All <span class="tab-count">(<span id="count-tab-all">0</span>)</span>
                                    </button>
                                    <button type="button" class="tab-btn instant-tab" data-tab="instant">
                                        <i class="fas fa-bolt me-1"></i>Instant Orders <span class="tab-count">(<span id="count-tab-instant">0</span>)</span>
                                    </button>
                                    <button type="button" class="tab-btn pre-tab" data-tab="preorder">
                                        <i class="far fa-calendar-alt me-1"></i>Pre-orders <span class="tab-count">(<span id="count-tab-preorder">0</span>)</span>
                                    </button>
                                </div>
                            </div>

                            <div id="orders-wrapper"></div>

                            <div id="empty-state" class="d-none">
                                <div class="empty-container">
                                    <div class="empty-icon-wrap mb-3">
                                        <i class="fas fa-calendar-alt"></i>
                                    </div>
                                    <h5>No active orders right now.</h5>
                                    <p>Switch to All or Instant Orders to see what's cooking.</p>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="modal fade" id="modalSuccess" tabindex="-1" aria-labelledby="reportsModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered modal-md">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Success</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                        <img src="../images/close-white.svg">
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            <div class="col-md-12">
                                                <div class="mb-3 text-center">
                                                    <img src="../images/icon-success.gif" alt="Icon Success">
                                                    <div class="mb-3 text-center">
                                                        <span id="LBLRequestResult"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="delayModal" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">

                                <div class="modal-header" style="border-bottom: 1px solid #f1f5f9; padding: 16px 24px;">
                                    <h5 class="modal-title" style="font-weight: 700; color: #1e293b; font-size: 18px;">
                                        <i class="fas fa-clock me-2" style="color: #f59e0b;"></i>Notify Delay
                                    </h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>

                                <div class="modal-body" style="padding: 24px;">
                                    <input type="hidden" id="hdnDelayOrderId" />

                                    <div class="mb-3">
                                        <label for="txtDelayMinutes" class="form-label" style="font-weight: 600; color: #475569; font-size: 13px;">
                                            Delay (minutes) <span class="text-danger">*</span>
                                        </label>
                                        <input type="number" id="txtDelayMinutes" class="form-control" min="1" max="240" value="15" style="border-radius: 8px; border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 14px;" />
                                        <div class="form-text" style="font-size: 12px; color: #94a3b8; margin-top: 6px;">
                                            Enter a value between 1 and 240 minutes.
                                        </div>
                                    </div>

                                    <div class="mb-1">
                                        <label for="txtDelayReason" class="form-label" style="font-weight: 600; color: #475569; font-size: 13px;">
                                            Reason <span class="text-muted fw-normal">(optional)</span>
                                        </label>
                                        <textarea id="txtDelayReason" class="form-control" rows="3" maxlength="500" placeholder="e.g. Kitchen backlog, equipment issue, ingredient shortage…" style="border-radius: 8px; border: 1px solid #cbd5e1; resize: none; font-size: 14px;"></textarea>
                                    </div>
                                </div>

                                <div class="modal-footer" style="border-top: 1px solid #f1f5f9; padding: 16px 24px;">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal" style="font-weight: 600; color: #64748b; border-radius: 8px;">Cancel</button>
                                    <button type="button" class="btn btn-warning" onclick="SubmitDelay()" style="font-weight: 600; border-radius: 8px; color: #fff; background: #f59e0b; border: none;">
                                        <i class="fas fa-bell me-1"></i>Notify Patient
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="denyFoodModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: 16px; border: none; box-shadow: 0 15px 50px rgba(0,0,0,0.2); overflow: hidden;">
            <div class="modal-header" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-bottom: none; padding: 20px 24px;">
                <div class="d-flex align-items-center gap-3">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #ef4444; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">
                        <i class="fas fa-ban"></i>
                    </div>
                    <div>
                        <h5 class="modal-title" style="font-weight: 800; color: #1e293b; font-size: 18px; margin: 0;">Deny Food Item</h5>
                        <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 500;">Provide a reason for denial</p>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="padding: 24px; background: #ffffff;">
                <input type="hidden" id="hdnDenyRowId" />
                
                <div class="mb-3">
                    <label class="form-label" style="font-weight: 700; color: #334155; font-size: 13px; margin-bottom: 8px;">Item to Deny</label>
                    <input type="text" id="txtDenyItemName" class="form-control" readonly style="border-radius: 10px; border: 1.5px solid #cbd5e1; padding: 12px; font-weight: 600; background-color: #f8fafc;" />
                </div>

                <div class="mb-1">
                    <label class="form-label" style="font-weight: 700; color: #334155; font-size: 13px; margin-bottom: 8px;">Reason for Denial <span class="text-danger">*</span></label>
                    <textarea id="txtDenyReason" class="form-control" rows="3" maxlength="500" placeholder="e.g., Out of stock, Allergy risk..." style="border-radius: 10px; border: 1.5px solid #cbd5e1; resize: none; padding: 12px; font-size: 14px; background-color: #f8fafc;"></textarea>
                </div>
            </div>
            <div class="modal-footer" style="border-top: 1px solid #f1f5f9; padding: 16px 24px; background: #f8fafc;">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal" style="font-weight: 700; color: #64748b; border-radius: 10px; padding: 10px 20px; border: 1px solid #e2e8f0;">Cancel</button>
                <button type="button" class="btn btn-danger" id="btnSubmitDeny" onclick="SubmitDenyFood()" style="font-weight: 700; border-radius: 10px; padding: 10px 24px; background: #ef4444; border: none; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                    <i class="fas fa-check me-1"></i>Confirm Denial
                </button>
            </div>
        </div>
    </div>
</div>

                    <div class="modal fade" id="altFoodModal" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content" style="border-radius: 16px; border: none; box-shadow: 0 15px 50px rgba(0,0,0,0.2); overflow: hidden;">

                                <div class="modal-header" style="background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%); border-bottom: none; padding: 20px 24px;">
                                    <div class="d-flex align-items-center gap-3">
                                        <div style="width: 40px; height: 40px; border-radius: 10px; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);">
                                            <i class="fas fa-utensils"></i>
                                        </div>
                                        <div>
                                            <h5 class="modal-title" style="font-weight: 800; color: #1e293b; font-size: 18px; margin: 0;">Alternate Food</h5>
                                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 500;">Swap items for this order</p>
                                        </div>
                                    </div>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>

                                <div class="modal-body" style="padding: 24px; background: #ffffff;">
                                    <input type="hidden" id="hdnAltOrderId" />

                                    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 12px; color: #475569; font-weight: 500;">
                                        <i class="fas fa-info-circle text-primary me-2"></i>Changing an item will notify the kitchen and update the patient record.
                                    </div>

                                    <div class="mb-4">
                                        <label for="ddlAltCurrentItem" class="form-label" style="font-weight: 700; color: #334155; font-size: 13px; margin-bottom: 8px;">
                                            <i class="fas fa-arrow-right-arrow-left text-muted me-1"></i>Select Item to Change <span class="text-danger">*</span>
                                        </label>
                                        <select id="ddlAltCurrentItem" class="form-select" style="border-radius: 10px; border: 1.5px solid #cbd5e1; padding: 12px; font-weight: 600; color: #1e293b; background-color: #f8fafc; cursor: pointer;" onchange="OnAltItemSelected()">

                                        </select>
                                    </div>

                                    <div class="mb-4">
                                        <label for="ddlAltNewItem" class="form-label" style="font-weight: 700; color: #334155; font-size: 13px; margin-bottom: 8px;">
                                            <i class="fas fa-utensils text-muted me-1"></i>Replace With Alternate Item <span class="text-danger">*</span>
                                        </label>
                                        <select id="ddlAltNewItem" class="form-select" style="border-radius: 10px; border: 1.5px solid #cbd5e1; padding: 12px; font-weight: 600; color: #1e293b; cursor: pointer;">
                                            <option value="">— Select alternate item —</option>
                                        </select>
                                    </div>

                                    <div class="mb-1">
                                        <label for="txtAltReason" class="form-label" style="font-weight: 700; color: #334155; font-size: 13px; margin-bottom: 8px;">
                                            Reason <span class="text-muted fw-normal">(optional)</span>
                                        </label>
                                        <textarea id="txtAltReason" class="form-control" rows="3" maxlength="500" placeholder="e.g. Out of stock, dietary update, patient preference…" style="border-radius: 10px; border: 1.5px solid #cbd5e1; resize: none; padding: 12px; font-size: 14px; background-color: #f8fafc;"></textarea>
                                    </div>
                                </div>

                                <div class="modal-footer" style="border-top: 1px solid #f1f5f9; padding: 16px 24px; background: #f8fafc;">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal" style="font-weight: 700; color: #64748b; border-radius: 10px; padding: 10px 20px; border: 1px solid #e2e8f0;">Cancel</button>
                                    <button type="button" class="btn btn-primary" onclick="SubmitAlternateFood()" style="font-weight: 700; border-radius: 10px; padding: 10px 24px; background: #3b82f6; border: none; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                                        <i class="fas fa-check me-1"></i>Apply Change
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- JS CSS -->
        <script src="../js/bootstrap.bundle.min.js"></script>
        <script src="../js/jquery.sumoselect.min.js"></script>
        <script src="../js/style.js"></script>
    </form>
</body>
</html>


