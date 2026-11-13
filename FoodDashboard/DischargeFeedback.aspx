<%@ Page Language="C#" AutoEventWireup="true" CodeFile="DischargeFeedback.aspx.cs" Inherits="FoodDashboard_DischargeFeedback" %>

<html lang="en">

<head>
    <title>Feedback | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Favicon -->
    <link rel="icon" href="../favicon.png" />
    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" href="../fontawesome/css/all.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/DischargeFeedback.css" />

    <link href="../css/changepwd.css" rel="stylesheet" />
    <script src="../Scripts/chart.min.js"></script>
    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/DischargeFeedback.js" type="text/javascript"></script>
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
                LoadDashboardCharts();
                LoadFlagCount();
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
                $('#mainDashboardTabs .nav-link').on('click', function () {
                    $('#mainDashboardTabs .nav-link').removeClass('active');
                    $(this).addClass('active');

                    var targetTab = $(this).data('tab');
                    $('.tab-pane-content').hide();
                    $('#pane-' + targetTab).show();

                    if (targetTab === 'flags') LoadFlags("OPEN", "FLAGS");
                    else if (targetTab === 'overview') LoadDashboardCharts();
                    else if (targetTab === 'responses') LoadFlags("OPEN", "RESPONSES");
                });

                $(document).on('click', '.btn-filter', function () {
                    var $group = $(this).closest('.flag-filter-group');
                    $group.find('.btn-filter').removeClass('active');
                    $(this).addClass('active');

                    var activeTab = $('#mainDashboardTabs .nav-link.active').data('tab');
                    if (activeTab === 'responses') LoadFlags($(this).data('filter'), 'RESPONSES');
                    else LoadFlags($(this).data('filter'), 'FLAGS');
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

            .badge-satisfied-tag {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: #e8f8f0;
                color: #0e9f6e;
                font-size: 11px;
                font-weight: 600;
                padding: 3px 10px;
                border-radius: 12px;
            }
            /* Green variant for the responses tab icon box */
            .flag-icon-box.icon-box-satisfied {
                background: #e8f8f0;
                color: #0e9f6e;
                border-color: #c9efdd;
            }

                .flag-icon-box.icon-box-satisfied i {
                    color: #0e9f6e;
                }

            .btn.btn-refresh {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: background .2s ease, box-shadow .2s ease, opacity .2s ease;
            }

                .btn.btn-refresh i.fa-sync-alt {
                    display: inline-block;
                    transform-origin: 50% 50%;
                    transition: transform .2s ease;
                }

                .btn.btn-refresh.is-spinning {
                    pointer-events: none;
                    opacity: .75;
                }

                    .btn.btn-refresh.is-spinning i.fa-sync-alt {
                        animation: btnRefreshSpin 0.9s linear infinite;
                    }

                .btn.btn-refresh:hover,
                .btn.btn-export:hover {
                    border-color: #c4ccd4;
                    background: linear-gradient(180deg, #ffffff 0%, #f5f7f9 100%);
                }

            @keyframes btnRefreshSpin {
                from {
                    transform: rotate(0deg);
                }

                to {
                    transform: rotate(360deg);
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
                        <div class="dashboard-wrapper">
                            <!-- Header -->
                            <div class="dashboard-header d-flex justify-content-between align-items-start">
                                <div>
                                    <span class="badge-category">PATIENT EXPERIENCE</span>
                                    <h2 class="page-title" style="margin: 0; display: inline-flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                                        <span>Feedback</span>
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
                                    </h2>
                                    <p class="page-subtitle" style="margin: 4px 0 0 0;">Voice-of-patient analytics from the feedback counter.</p>
                                </div>
                                <div class="header-actions">
                                    <button type="button" class="btn btn-refresh" onclick="RefreshCurrentTab()"><i class="fas fa-sync-alt"></i>Refresh</button>
                                    <button type="button" class="btn btn-export" id="btnExportCsv">
                                        <i class="fas fa-file-csv"></i>Export CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                        <!-- Tabs -->
                        <div class="custom-tabs-container">
                            <ul class="nav nav-tabs custom-tabs" id="mainDashboardTabs">
                                <li class="nav-item"><a class="nav-link active" href="javascript:void(0)" data-tab="overview">Overview</a></li>
                                <li class="nav-item"><a class="nav-link" href="javascript:void(0)" data-tab="responses">Positive</a></li>
                                <li class="nav-item">
                                    <a class="nav-link" href="javascript:void(0)" data-tab="flags">Negative <span class="tab-badge" id="openFlagsBadge">0 open</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <!-- TAB 1: OVERVIEW CONTENT -->
                        <div id="pane-overview" class="tab-pane-content">

                            <!-- Top Cards -->
                            <div class="row g-3 mb-4">

                                <div class="col-md-3">
                                    <div class="card-stat card-blue">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <span class="stat-label">TODAY</span>
                                            <div class="stat-icon-box icon-blue">
                                                <i class="far fa-calendar-alt"></i>
                                            </div>
                                        </div>

                                        <div class="stat-value" id="stat-today">0</div>
                                    </div>
                                </div>

                                <div class="col-md-3">
                                    <div class="card-stat card-purple">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <span class="stat-label">THIS WEEK</span>
                                            <div class="stat-icon-box icon-purple">
                                                <i class="far fa-envelope"></i>
                                            </div>
                                        </div>

                                        <div class="stat-value" id="stat-week">0</div>
                                    </div>
                                </div>

                                <div class="col-md-3">
                                    <div class="card-stat card-indigo">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <span class="stat-label">THIS MONTH</span>
                                            <div class="stat-icon-box icon-indigo">
                                                <i class="far fa-user"></i>
                                            </div>
                                        </div>

                                        <div class="stat-value" id="stat-month">9</div>
                                    </div>
                                </div>

                                <div class="col-md-3">
                                    <div class="card-stat card-green">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <span class="stat-label text-success">% SATISFIED (30D)</span>
                                            <div class="stat-icon-box icon-green">
                                                <i class="far fa-smile"></i>
                                            </div>
                                        </div>

                                        <div class="stat-value" id="stat-satisfied">
                                            56 <small>%</small>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <!-- Bottom Cards -->
                            <div class="row g-3 mb-4">

                                <div class="col-md-4">
                                    <div class="card-stat card-green">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <span class="stat-label text-success">WOULD RECOMMEND (YES %)</span>
                                            <div class="stat-icon-box icon-green">
                                                <i class="far fa-heart"></i>
                                            </div>
                                        </div>

                                        <div class="stat-value">
                                            <span id="statRecommend">0</span> <small></small>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="card-stat card-red">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <span class="stat-label text-danger">FLAGS OPEN</span>
                                            <div class="stat-icon-box icon-red">
                                                <i class="fas fa-exclamation-triangle"></i>
                                            </div>
                                        </div>

                                        <div class="stat-value" id="statFlagsOpen">0</div>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="card-stat card-green">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <span class="stat-label text-success">FLAGS RESOLVED</span>
                                            <div class="stat-icon-box icon-green">
                                                <i class="far fa-check-circle"></i>
                                            </div>
                                        </div>

                                        <div class="stat-value" id="statFlagsResolved">0</div>
                                    </div>
                                </div>

                            </div>
                            <div class="chart-container-box mb-4">
                                <div class="chart-header-row">
                                    <div>
                                        <h5 class="chart-main-title">Section satisfaction (last 30 days)</h5>
                                        <p class="chart-sub-title">Where is patient experience weakest right now?</p>
                                    </div>
                                    <span class="chart-y-label">% Satisfied</span>
                                </div>
                                <div class="chart-wrapper">
                                    <canvas id="sectionChart"></canvas>
                                </div>
                            </div>

                            <div class="chart-container-box">
                                <div class="chart-header-row">
                                    <div>
                                        <h5 class="chart-main-title">Satisfaction trend (last 14 days)</h5>
                                        <p class="chart-sub-title">Daily % satisfied for overall hospital experience.</p>
                                    </div>
                                    <i class="fas fa-chart-line text-muted"></i>
                                </div>
                                <div class="chart-wrapper">
                                    <canvas id="trendChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <!-- TAB 2: RESPONSES (Placeholder) -->
                        <!-- TAB 2: RESPONSES -->
                        <!-- TAB 2: RESPONSES -->
                        <div id="pane-responses" class="tab-pane-content" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="flag-filter-group">
                                    <button type="button" class="btn-filter btn-filter-resp active" data-filter="OPEN">OPEN</button>
                                    <button type="button" class="btn-filter btn-filter-resp" data-filter="IN PROGRESS">IN PROGRESS</button>
                                    <button type="button" class="btn-filter btn-filter-resp" data-filter="RESOLVED">RESOLVED</button>
                                    <button type="button" class="btn-filter btn-filter-resp" data-filter="ALL">ALL</button>
                                </div>
                                <span class="text-muted small" id="resp-total-count">0 responses</span>
                            </div>

                            <div id="responses-list-container">
                                <!-- Items rendered via JS -->
                            </div>
                        </div>

                        <!-- TAB 3: FLAGS CONTENT (The logic you requested) -->
                        <div id="pane-flags" class="tab-pane-content" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="flag-filter-group">
                                    <button type="button" class="btn-filter active" data-filter="OPEN">OPEN</button>
                                    <button type="button" class="btn-filter" data-filter="IN PROGRESS">IN PROGRESS</button>
                                    <button type="button" class="btn-filter" data-filter="RESOLVED">RESOLVED</button>
                                    <button type="button" class="btn-filter" data-filter="ALL">ALL</button>
                                </div>
                                <span class="text-muted small" id="flag-total-count">0 flags</span>
                            </div>

                            <div id="flags-list-container">
                                <!-- Items rendered via JS -->
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


