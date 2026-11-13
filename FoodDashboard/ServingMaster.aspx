<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ServingMaster.aspx.cs" Inherits="FoodDashboard_ServingMaster" %>

<html lang="en">

<head>
    <title>ServingMaster | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Favicon -->
    <link rel="icon" href="../favicon.png" />
    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" type="text/css" href="../css/ServingMaster.css" />
    <link href="../css/changepwd.css" rel="stylesheet" />
    <link rel="stylesheet" href="../fontawesome/css/all.min.css" />
    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/ServingMaster.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>
    <telerik:RadCodeBlock ID="RadCodeBlock" runat="server">
        <script type="text/javascript">
            var dataSet = [], hurl = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/FoodDashboard/",
                urlPageValidation =  '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' +'<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/MasterPage/Service/Service.aspx?",
                CryptoKey = '<%=ConfigurationManager.AppSettings["CryptoKey"].ToString() %>',
                CryptoPwd = '<%=ConfigurationManager.AppSettings["CryptoIV"].ToString() %>',
                ConProtocol = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>';

            $(document).ready(function () {
                LoadServingList();
                InitChangePassword();
                initServingPickerColumns();
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

                $("#txtSearchServing").on("input", function () {
                    smPageIndex = 1;
                    LoadServingList();
                });

                $("#chkShowInactive").on("click", function () {
                    smPageIndex = 1;
                    LoadServingList();
                });

                $("#btnRefreshServing").on("click", function () {
                    $("#txtSearchServing").val("");
                    $("#chkShowInactive").prop("checked", false);
                    smPageIndex = 1;
                    LoadServingList();
                    LoadNotifications();
                });

                $("#btnAddServing").on("click", function () {
                    ClearServingForm();
                    $("#servingModalHeader").text("Add New Serving");
                    $("#btnSaveServing").show();
                    $("#btnUpdateServing").hide();
                    ShowModalPopUp('servingModal');
                });

                $("#btnClearServing").on("click", function () {
                    ClearServingForm();
                });
                $("#txtCategoryCode").on("blur", function () {
                    CheckCodeAvailability();
                });
                $(document).on('click', '.time-picker-trigger', function (e) {
                    e.stopPropagation();
                    var dropdown = $(this).find('.tp-dropdown');
                    $(".tp-dropdown").not(dropdown).hide();
                    dropdown.toggle();
                });

                $(document).on('click', '.tp-item', function (e) {
                    e.stopPropagation();
                    var $item = $(this);
                    var $dropdown = $item.closest('.tp-dropdown');
                    var $trigger = $dropdown.closest('.time-picker-trigger');

                    $item.siblings().removeClass('active');
                    $item.addClass('active');

                    var hh = $dropdown.find('.hour-col .tp-item.active').text() || "09";
                    var mm = $dropdown.find('.min-col .tp-item.active').text() || "00";
                    var ap = $dropdown.find('.ampm-col .tp-item.active').text() || "AM";

                    $trigger.find('.display-time').text(hh + ":" + mm + " " + ap);
                });

                $(document).click(function () {
                    $(".tp-dropdown").hide();
                });

                $("#chkServingActive").on("change", function () {
                    $("#lblToggleStatus").text(this.checked ? "Active" : "Inactive").css("color", this.checked ? "#10b981" : "#b91c1c");
                });
            });
        </script>
    </telerik:RadCodeBlock>
</head>
<body>
    <form id="formCategory" runat="server">
        <telerik:RadScriptManager ID="RadScriptManager" runat="server">
        </telerik:RadScriptManager>
        <asp:HiddenField ID="HFServingID" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="HFStatusID" runat="server" ClientIDMode="Static" />
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
                                        <li>
                                            <a href="../Reports/Report.aspx">
                                                <span>
                                                    <img src="../images/clipboard.png" alt="Reports"></span> Reports
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Master/Category.aspx">
                                                <span>
                                                    <img src="../images/category-master.png" alt="Task Types"></span> Task Types
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../Master/Locations.aspx">
                                                <span>
                                                    <img src="../images/location.png" alt="Location Master"></span> Location Master
                                            </a>
                                        </li>
                                        <li>
                                            <a href="../FoodDashboard/PatientDietAssignment.aspx">
                                                <span>
                                                    <img src="../images/PATIENTS.png" alt="PatientDiet Assignment"></span> Patient
                                            </a>
                                        </li>
                                        <li>
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
                                        <li class="current-menu-item">
                                            <a href="../FoodDashboard/ServingMaster.aspx">
                                                <span>
                                                    <img src="../images/MENUS.png" alt="Serving Master"></span> Serving Master
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
                                    <div class="profile-img"></div>
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

                    <!-- Right Panel -->
                    <div class="screen-right-panel">
                        <%-- notifica--%>
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

                        <%-- notifica--%>
                        <div class="sm-container">
                            <div class="sm-header">
                                <div class="sm-title-area">
                                    <div class="sm-icon-box">
                                        <img src="../images/MENUS.png" style="width: 24px; height: 24px;" />
                                    </div>
                                    <div class="sm-text-box">
                                        <h1 style="margin: 0; display: inline-flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                                            <span>Serving Master</span>
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
                                        </h1>
                                        <p style="margin: 4px 0 0 0;">Configure food serving categories and timing.</p>
                                    </div>
                                </div>
                                <div class="sm-header-actions">
                                    <button type="button" class="btn-refresh" id="btnRefreshServing">Refresh</button>
                                    <button type="button" class="btn-add-serving" id="btnAddServing"><span class="plus-icon">+</span> Add Serving</button>
                                </div>
                            </div>

                            <div class="sm-grid-card">
                                <div class="sm-grid-toolbar">
                                    <div class="sm-search-area">
                                        <!-- Search input -->
                                        <input type="text" id="txtSearchServing" placeholder="Search by name or code">
                                    </div>

                                    <div class="sm-filter-wrap">
                                        <label class="inactive-filter">
                                            <input type="checkbox" id="chkShowInactive">
                                            <span>Show inactive</span>
                                        </label>
                                    </div>
                                </div>
                                <table class="sm-table">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Serving Name</th>
                                            <th>Serving Description</th>
                                            <th>Time Window</th>
                                            <th>Status</th>
                                            <th>Last Updated</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tblServingBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL -->
        <div class="modal fade" id="servingModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content serving-modal">
                    <div class="serving-header">
                        <div>
                            <h2 id="servingModalHeader">Add New Serving</h2>
                            <p>Serving category, name & time window</p>
                        </div>
                        <button type="button" class="close-modal" data-bs-dismiss="modal">&times;</button>
                    </div>
                    <div class="serving-body">
                        <div class="row g-3 mb-3">
                            <div class="col-4">
                                <div class="field-group">
                                    <label>Code <span class="req">*</span></label>
                                    <input type="number" id="txtCategoryCode" class="sm-input" placeholder="e.g. 1" />
                                    <span id="errCategoryCode" class="validation-error"></span>
                                </div>
                            </div>
                            <div class="col-8">
                                <div class="field-group">
                                    <label>Serving Name <span class="req">*</span></label>
                                    <input type="text" id="txtCategoryName" class="sm-input" placeholder="e.g. Serving 1" />
                                </div>
                            </div>
                        </div>

                        <div class="field-group mb-3">
                            <label>Serving Description </label>
                            <input type="text" id="txtServingName" class="sm-input" placeholder="e.g. Description About Service" />
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-6">
                                <div class="field-group">
                                    <label>Start Time <span class="req">*</span></label>
                                    <div class="time-picker-trigger" id="startTimeTrigger">
                                        <span class="display-time">Select time</span>
                                        <i class="fas fa-clock tp-icon"></i>
                                        <div class="tp-dropdown">
                                            <div class="tp-columns">
                                                <div class="tp-col hour-col"></div>
                                                <div class="tp-col min-col"></div>
                                                <div class="tp-col ampm-col">
                                                    <div class="tp-item">AM</div>
                                                    <div class="tp-item">PM</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="field-group">
                                    <label>End Time <span class="req">*</span></label>
                                    <div class="time-picker-trigger" id="endTimeTrigger">
                                        <span class="display-time">Select time</span>
                                        <i class="fas fa-clock tp-icon"></i>
                                        <div class="tp-dropdown">
                                            <div class="tp-columns">
                                                <div class="tp-col hour-col"></div>
                                                <div class="tp-col min-col"></div>
                                                <div class="tp-col ampm-col">
                                                    <div class="tp-item">AM</div>
                                                    <div class="tp-item">PM</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row g-3 align-items-end mb-3">
                            <div class="col-6">
                                <div class="field-group">
                                    <label>Serving Icon</label>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="icon-preview-box" onclick="document.getElementById('fileIconUpload').click()">
                                            <i class="fas fa-camera" id="iconPlaceholder"></i>
                                            <img src="" id="imgPreview" style="display: none;" />
                                        </div>
                                        <input type="file" id="fileIconUpload" accept="image/*" style="display: none;" onchange="previewImage(this)">
                                        <button type="button" class="btn-upload-link" onclick="document.getElementById('fileIconUpload').click()">
                                            Upload Icon
                                        </button>
                                    </div>
                                    <div id="lblFileName" style="font-size: 11px; color: #4361ee; margin-top: 4px; font-weight: 500; min-height: 15px;"></div>
                                </div>
                            </div>

                            <div class="col-6 text-end">
                                <div class="field-group d-inline-block text-start">
                                    <label>Status</label>
                                    <div class="toggle-switch-row">
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="chkServingActive" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <span class="toggle-status-label active-text" id="lblToggleStatus">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="serving-footer">
                        <button type="button" class="btn-clear" id="btnClearServing">Clear</button>
                        <button type="button" class="btn-save" id="btnSaveServing" onclick="CreateNewServing()">Save</button>
                        <button type="button" class="btn-update" id="btnUpdateServing" onclick="CreateNewServing()" style="display: none;">Update</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL -->
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

        <div class="modal fade" id="modalConfirmDelete" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Delete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            <img src="../images/close-white.svg">
                        </button>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to delete this serving entry?
                   
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="btnCancelDeleteServing">Cancel</button>
                        <button type="button" class="btn btn-danger" onclick="DeleteServing()">Delete</button>
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
