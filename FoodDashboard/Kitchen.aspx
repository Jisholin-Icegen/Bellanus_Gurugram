<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Kitchen.aspx.cs" Inherits="FoodDashboard_Kitchen" %>

<html lang="en">

<head>
    <title>Kitchen | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Favicon -->
    <link rel="icon" href="../favicon.png" />
    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" type="text/css" href="../css/Kitchen.css" />
    <link href="../css/changepwd.css" rel="stylesheet" />
    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/Kitchen.js" type="text/javascript"></script>
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
                LoadKitchen();
                LoadWardList();
                $("#txtSearchKitchen").on("input", function () {
                    LoadKitchen();
                });

                $("#chkShowInactive").on("change", function () {
                    LoadKitchen();
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


                function initPickerColumns() {
                    $(".tp-dropdown").each(function () {
                        var hoursHtml = "";
                        for (var i = 1; i <= 12; i++) {
                            var val = (i < 10 ? '0' + i : i);
                            hoursHtml += `<div class="tp-item" data-type="hour">${val}</div>`;
                        }
                        $(this).find(".hour-col").html(hoursHtml);

                        var minsHtml = "";
                        for (var i = 0; i < 60; i++) {
                            var val = (i < 10 ? '0' + i : i);
                            minsHtml += `<div class="tp-item" data-type="min">${val}</div>`;
                        }
                        $(this).find(".min-col").html(minsHtml);
                    });
                }

                initPickerColumns();

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
                    var ap = $dropdown.find('.ampm-col .tp-item.active').text() ||
                        $dropdown.find('.ampm-col .tp-item.active').attr('data-val') || "PM";
                    $trigger.find('.display-time').text(`${hh}:${mm} ${ap}`);
                });

                $(document).click(function () {
                    $(".tp-dropdown").hide();
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
                                        <li class="current-menu-item">
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

                    <!-- Right Panel -->
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

                        <div class="modal fade" id="ModalChangepwd" tabindex="-1" aria-labelledby="reportsModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h6 class="modal-title">
                                            <span id="canReqIDpwd"></span>
                                            &nbsp;&nbsp;CHANGE PASSWORD
                                        </h6>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                            <img src="../images/close-white.svg" alt="Close">
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div id="Div2pwd" align="center">
                                            <div id="CancelReasonContentpwd" class="Content">
                                                <div id="DivCPContent" class="ContentCP" align="center">
                                                    <table class="Custfont" style="min-width: 350px; min-height: 160px; font-size: 14px; font-weight: 500;" cellpadding="5" cellspacing="5">
                                                        <tr>
                                                            <td>Current Password</td>
                                                            <td align="center">
                                                                <asp:TextBox ID="TxtCurPassword" runat="server" Width="180px" class="txtpwd" ClientIDMode="Static"
                                                                    Style="border: 1px solid #ded6d6 !important; margin-bottom: 0px !important; padding-left: 5px"
                                                                    TextMode="Password"></asp:TextBox>
                                                                <asp:Label ID="ErCurrent" runat="server" Text="*" ForeColor="Red" Font-Size="Medium"
                                                                    ClientIDMode="Static" CssClass="Custfont" Style="visibility: hidden"></asp:Label>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>New Password</td>
                                                            <td align="center">
                                                                <asp:TextBox ID="TxtPassword" runat="server" Width="180px" class="txtpwd" ClientIDMode="Static"
                                                                    Style="border: 1px solid #ded6d6 !important; margin-bottom: 0px !important; padding-left: 5px"
                                                                    TextMode="Password"></asp:TextBox>
                                                                <asp:Label ID="ErPassword" runat="server" Text="*" ForeColor="Red" Font-Size="Medium"
                                                                    ClientIDMode="Static" CssClass="Custfont" Style="visibility: hidden"></asp:Label>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Confirm Password</td>
                                                            <td align="center">
                                                                <asp:TextBox ID="TxtConfirmPassword" runat="server" Width="180px" class="txtpwd" ClientIDMode="Static"
                                                                    Style="border: 1px solid #ded6d6 !important; margin-bottom: 0px !important; padding-left: 5px"
                                                                    TextMode="Password"></asp:TextBox>
                                                                <asp:Label ID="ErCPassword" runat="server" Text="*" ForeColor="Red" Font-Size="Medium"
                                                                    ClientIDMode="Static" CssClass="Custfont" Style="visibility: hidden"></asp:Label>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2">
                                                                <div style="text-align: left; margin-top: 10px;">
                                                                    <div id="message">
                                                                        <h6>Password must contain the following:</h6>
                                                                        <p id="letter" class="invalid">A lowercase letter</p>
                                                                        <p id="capital" class="invalid">A capital (uppercase) letter</p>
                                                                        <p id="splChar" class="invalid">A special character [!@#$%^&*()\-+.]</p>
                                                                        <p id="number" class="invalid">A number</p>
                                                                        <p id="length" class="invalid">Minimum 6 characters</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2">
                                                                <table width="100%" align="center">
                                                                    <tr>
                                                                        <td align="right">
                                                                            <div class="export-link" onclick="ValidatePassword()" style="display: inline-block; margin-right: 10px;">
                                                                                <a href="#" class="btn btn-secondary">
                                                                                    <img src="../images/memo.png" alt="Change">
                                                                                    Change Password
                                                                                </a>
                                                                            </div>
                                                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="background: #6c757d; border-color: #6c757d;">
                                                                                Cancel
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal fade" id="ModalMTDone" tabindex="-1" aria-labelledby="reportsModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-md">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="MTNSuccess">Success</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                            <img src="../images/close-white.svg">
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div class="row">
                                            <div class="col-md-12">
                                                <div class="mb-3 text-center">
                                                    <img src="../images/icon-success.gif" alt="Icon Success">
                                                </div>
                                                <div class="mb-3 text-center">
                                                    <span id="spanMT" style="font-size: 11pt;"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                        <div class="kitchen-master-container">
                            <div class="km-header">
                                <div class="km-title-area">
                                    <div class="km-icon-box">
                                        <img src="../images/COOKING.png" alt="Kitchen" class="menu-icon" />
                                    </div>
                                    <div class="km-text-box">
                                        <h1 style="margin: 0; display: inline-flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                                            <span>Kitchens</span>
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
                                        <p style="margin: 4px 0 0 0;">
                                            Master setup for kitchens and which diet types each kitchen prepares.
                                        </p>
                                    </div>
                                </div>

                                <button type="button" class="btn-add-emerald" id="btnAddKitchen">
                                    <span class="plus-icon">+</span>
                                    Add Kitchen
                                </button>
                            </div>
                            <div class="km-filter-row">
                                <div class="km-search-area">
                                    <img src="../images/search-normal.png" class="search-icon" />
                                    <input type="text" id="txtSearchKitchen" placeholder="Search by name or code">
                                </div>
                                <div class="km-inactive-area">
                                    <label class="km-checkbox-label">
                                        <input type="checkbox" id="chkShowInactive">
                                        <span>Show inactive</span>
                                    </label>
                                </div>
                            </div>

                            <div class="km-table-card">
                                <table class="km-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 80px;">Code</th>
                                            <th>Name</th>
                                            <th>Wards</th>
                                            <th>Diet Mappings</th>
                                            <th style="width: 100px;">Status</th>
                                            <th style="width: 80px; text-align: right;">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tblKitchenBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <!-- /Right Panel -->
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
                        Are you sure you want to delete this kitchen?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="btnCancelDelete">Cancel</button>
                        <button type="button" class="btn btn-danger" id="btnConfirmDelete">Delete</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="kitchenModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content kitchen-modal">

                    <div class="kitchen-header">
                        <div>
                            <h2 id="kitchenModalHeader">Add New Kitchen</h2>
                            <p>Master record + ward coverage</p>
                        </div>
                        <button type="button" class="close-modal" data-bs-dismiss="modal">× </button>
                    </div>

                    <div class="kitchen-body">

                        <div class="field-group">
                            <label>Name *</label>
                            <input type="text" id="txtKitchenName" class="form-control" placeholder="Enter Kitchen Name">
                            <span id="errKitchenName" class="validation-error"></span>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="field-group">
                                    <label>Code *</label>
                                    <input type="text" id="txtKitchenCode" class="form-control" placeholder="Enter Kitchen Code">
                                    <span id="errKitchenCode" class="validation-error"></span>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="field-group">
                                    <label>Capacity (meals/day)</label>
                                    <input type="number" id="txtCapacity" class="form-control" placeholder="No of Meals Per Day" min="0" step="1">
                                </div>
                            </div>
                        </div>

                        <div class="field-group">
                            <label>Location</label>
                            <input type="text" id="txtLocation" class="form-control" placeholder="Enter Loacation">
                        </div>

                        <div class="field-group">
                            <label>Wards served</label>

                            <div class="ward-box" id="wardContainer">
                            </div>

                            <div class="ward-note">
                                Pick at least one for specialised kitchens. Leave empty to serve all wards (treated as catch-all).
                            </div>
                        </div>

                        <label class="active-check">
                            <input type="checkbox" id="chkKitchenActive" checked>
                            Active
                        </label>

                    </div>

                    <div class="kitchen-footer">
                        <button type="button" class="btn-cancel" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn-create" onclick="SubmitKitchen();">Create kitchen</button>
                    </div>

                </div>
            </div>
        </div>

        <div class="modal fade right" id="kitchenModalnew" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header bg-white border-0">
                        <h5 id="kitchenModalHeadernew" class="font-weight-bold">Kitchen Name</h5>
                        <button type="button" class="close-modal" data-bs-dismiss="modal">× </button>
                    </div>
                    <div id="modalMessage" class="alert" style="display: none; margin: 10px;"></div>
                    <div class="modal-body">
                        <p class="text-muted small mb-4"><i class="fa fa-map-marker"></i><span id="lblLocation"></span></p>

                        <div class="info-card-container">
                            <div class="info-card">
                                <span class="card-label">Capacity</span>
                                <div class="card-value" id="lblCapacity">0 meals/day</div>
                            </div>
                            <div class="info-card">
                                <span class="card-label">Status</span>
                                <div class="card-value status-active" id="lblStatusBadge">Active</div>
                            </div>
                        </div>

                        <div class="section-title">Wards Served (<span id="wardCount">0</span>)</div>
                        <div id="wardContainernew" class="mb-4"></div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div class="section-title mt-0">Diet Types this kitchen can prepare</div>
                            <i class="fa fa-sync-alt text-muted small" style="cursor: pointer"></i>
                        </div>
                        <div class="diet-outer-box" id="dietTypeListContainer">
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-4">
                            <div class="section-title mt-0"><i class="fa fa-clock mr-1"></i>Cutoff Times</div>
                            <span class="badge badge-light text-primary font-weight-bold" style="letter-spacing: 1px; font-size: 10px;">PROTOTYPE</span>
                        </div>

                        <div class="cutoff-container">
                            <div class="cutoff-row" data-meal="Breakfast">
                                <input type="time" class="cutoff-time" value="08:00">
                                <select class="day-select">
                                    <option value="day before" selected>day before</option>
                                    <option value="same day">same day</option>
                                </select>
                            </div>
                            <div class="cutoff-row" data-meal="Lunch">
                                <input type="time" class="cutoff-time" value="14:00">
                                <select class="day-select">
                                    <option value="day before">day before</option>
                                    <option value="same day" selected>same day</option>
                                </select>
                            </div>
                            <div class="cutoff-row" data-meal="Dinner">
                                <input type="time" class="cutoff-time" value="21:00">
                                <select class="day-select">
                                    <option value="day before">day before</option>
                                    <option value="same day" selected>same day</option>
                                </select>
                            </div>
                        </div>
                        <button type="button" class="btn btn-link text-success p-0 font-weight-bold mt-3" style="text-decoration: none;" onclick="SaveCutoffTimes();">
                            Save cutoff times →
                        </button>

                        <p class="text-muted mt-4" style="font-size: 11px; line-height: 1.4;">
                            Patient ordering screen uses these cutoffs to grey-out closed slots when scheduling next-day meals.
                        </p>
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

