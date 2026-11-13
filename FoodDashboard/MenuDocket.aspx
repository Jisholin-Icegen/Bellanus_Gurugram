<%@ Page Language="C#" AutoEventWireup="true" CodeFile="MenuDocket.aspx.cs" Inherits="FoodDashboard_MenuMaster" %>

<html lang="en">
<head>
    <title>Menu Docket | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="../favicon.png" />
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" type="text/css" href="../css/MenuDocket.css" />
    <link href="../css/changepwd.css" rel="stylesheet" />

    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="../js/jquery.sumoselect.min.js"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>
    <script src="../js/MenuDocket.js" type="text/javascript"></script>

    <telerik:RadCodeBlock ID="RadCodeBlock" runat="server">
        <script type="text/javascript">
            var hurl = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + '/FoodDashboard/';
            divServiceArray = ['divPorteringService', 'divCateringService', 'divCleaningService', 'divFeedbackService', 'divSecurityService'],
                urlPageValidation = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/MasterPage/Service/Service.aspx?",
                CryptoKey = '<%=ConfigurationManager.AppSettings["CryptoKey"].ToString() %>',
                CryptoPwd = '<%=ConfigurationManager.AppSettings["CryptoIV"].ToString() %>',
                ConProtocol = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>';
            var API_URL = hurl;
            var CryptoKey = '<%=ConfigurationManager.AppSettings["CryptoKey"].ToString() %>';
            var CryptoPwd = '<%=ConfigurationManager.AppSettings["CryptoIV"].ToString() %>';
            var currentUser = {
                userId: '<%=Session["UserID"] != null ? Session["UserID"].ToString() : "" %>',
                userName: '<%=Session["UserName"] != null ? Session["UserName"].ToString() : "System Administrator" %>',
                userRole: '<%=Session["UserRole"] != null ? Session["UserRole"].ToString() : "Super Admin" %>'
            };
        </script>
    </telerik:RadCodeBlock>
</head>
<body>
    <form id="form1" runat="server">
        <telerik:RadScriptManager ID="RadScriptManager" runat="server"></telerik:RadScriptManager>

        <asp:HiddenField ID="hfUserId" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="hfUserRole" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="hfUserName" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="hfRefreshInterval" runat="server" ClientIDMode="Static" Value="10000" />
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

                    <!-- LEFT PANEL -->
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
                                    <p>Jubilee Hills, Hyderabad</p>
                                </div>
                                <div class="left-panel-menu">
                                    <ul>
                                        <li><a href="../Index/Index.aspx"><span>
                                            <img src="../images/home.png" alt="Home"></span> Home</a></li>
                                        <li><a href="#" onclick="redirectFloorwiseTrac()"><span>
                                            <img src="../images/world-map.png" alt="Map"></span> Map</a></li>
                                        <li><a href="../Track/TrackNew.aspx"><span>
                                            <img src="../images/doc.png" alt="Track"></span> Track</a></li>
                                        <li><a href="../Reports/Report.aspx"><span>
                                            <img src="../images/clipboard.png" alt="Reports"></span> Reports</a></li>
                                        <li><a href="../Planner/Planner.aspx"><span>
                                            <img src="../images/spiral-calendar.png" alt="Planner"></span> Planner</a></li>
                                        <li><a href="../Master/Break.aspx"><span>
                                            <img src="../images/Break.png" alt="Breaks"></span> Breaks</a></li>
                                        <li><a href="../Master/Category.aspx"><span>
                                            <img src="../images/category-master.png" alt="Task Types"></span> Task Types</a></li>
                                        <li><a href="../Master/Porter.aspx"><span>
                                            <img src="../images/porter-master.png" alt="Porter Master"></span> Porter Master</a></li>
                                        <li><a href="../Master/Users.aspx"><span>
                                            <img src="../images/porter-master.png" alt="User Master"></span> User Master</a></li>
                                        <li><a href="../Master/Roles.aspx"><span>
                                            <img src="../images/UserRole.png" alt="Role Master"></span> Role Master</a></li>
                                        <li><a href="../Master/Equipment.aspx"><span>
                                            <img src="../images/Equipment.png" alt="Equipment Master"></span> Equipment Master</a></li>
                                        <li><a href="../Master/Locations.aspx"><span>
                                            <img src="../images/location.png" alt="Location Master"></span> Location Master</a></li>
                                        <li><a href="../Master/Department.aspx"><span>
                                            <img src="../images/location.png" alt="Department Master"></span> Department Master</a></li>
                                        <li><a href="../Master/PerformLogs.aspx"><span>
                                            <img src="../images/priority.png" alt="Perform Logs"></span> P3rform Logs</a></li>
                                        <li><a onclick="javascript:Bulk();" href="#"><span>
                                            <img src="../images/upload-task.png" alt="Upload Tasks"></span> Upload Tasks</a></li>
                                        <li><a href="../Master/Group.aspx"><span>
                                            <img src="../images/group-master.png" alt="Group Master"></span> Group Master</a></li>
                                        <li><a href="../Master/Remarks.aspx"><span>
                                            <img src="../images/memo.png" alt="Remarks Master"></span> Remarks Master</a></li>
                                        <li><a href="../FoodDashboard/PatientDietAssignment.aspx"><span>
                                            <img src="../images/PATIENTS.png" alt="Patient"></span> Patient</a></li>
                                        <li><a href="../FoodDashboard/DietTypeManagement.aspx"><span>
                                            <img src="../images/DIETS.png" alt="Diet Types"></span> Diet Types</a></li>
                                        <li><a href="../FoodDashboard/MenuMaster.aspx"><span>
                                            <img src="../images/MENUS.png" alt="Menu Master"></span> MenuMaster</a></li>
                                        <li><a href="../FoodDashboard/Kitchen.aspx"><span>
                                            <img src="../images/KITCHENS.png" alt="Kitchen"></span> Kitchen</a></li>
                                        <li><a href="../FoodDashboard/Orders.aspx"><span>
                                            <img src="../images/Orders.png" alt="Orders"></span> Orders</a></li>
                                        <li><a href="../FoodDashboard/PreOrderSheets.aspx"><span>
                                            <img src="../images/PreOrderSheets.png" alt="Pre-Order Sheets"></span> Pre-Order Sheets</a></li>
                                        <li class="current-menu-item"><a href="../FoodDashboard/MenuDocket.aspx"><span>
                                            <img src="../images/MenuDocket.png" alt="Menu Docket"></span> Menu Docket</a></li>
                                        <li><a href="../FoodDashboard/Deliveries.aspx"><span>
                                            <img src="../images/Deliveries.png" alt="Deliveries"></span> Deliveries</a></li>
                                        <li><a href="../FoodDashboard/Dashboard.aspx"><span>
                                            <img src="../images/Dashboard.png" alt="Dashboard"></span> Dashboard</a></li>
                                        <li><a href="../FoodDashboard/UserManagement.aspx"><span>
                                            <img src="../images/UserManagement.png" alt="UserManagement"></span> User Management</a></li>
                                        <li><a href="../FoodDashboard/PatientSatisfaction.aspx"><span>
                                            <img src="../images/PatientSatisfaction.png" alt="PatientSatisfaction"></span> Patient Satisfaction</a></li>
                                        <li><a href="../FoodDashboard/KitchenOrderReport.aspx"><span>
                                            <img src="../images/KitchenOrderReport.png" alt="OrderReport"></span> Order Report</a></li>
                                        <li><a href="../FoodDashboard/MyStation.aspx"><span>
                                            <img src="../images/MyStation.png" alt="MyStation"></span> My Station</a></li>
                                        <li><a href="../FoodDashboard/DeliveryMaster.aspx"><span>
                                            <img src="../images/DeliveryTrack.png" alt="Delivery Master"></span> Delivery Master</a></li>
                                        <li><a href="../FoodDashboard/Assembler.aspx"><span>
                                            <img src="../images/Assembler.png" alt="Assembler"></span> Assembler</a></li>
                                        <li><a href="../FoodDashboard/DischargeFeedback.aspx"><span>
                                            <img src="../images/DischargeFeedback.png" alt="Discharge Feedback"></span> Discharge Feedback</a></li>
                                        <li><a href="../FoodDashboard/ServingMaster.aspx"><span>
                                            <img src="../images/ServingMaster.png" alt="Serving Master"></span> Serving Master</a></li>
                                        <li><a href="../FoodDashboard/AuditLog.aspx"><span>
                                            <img src="../images/AuditLog.png" alt="Audit Log"></span> Audit Log</a></li>
                                        <li><a href="../FoodDashboard/Quality.aspx"><span>
                                            <img src="../images/Quality.png" alt="Quality"></span> Quality</a></li>
                                    </ul>
                                </div>
                            </div>
                            <br />
                            <br />
                            <br />
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

                    <!-- RIGHT PANEL - MENU DOCKET -->
                    <div class="screen-right-panel menu-docket-page">

                        <!-- Top Right User Info -->
                        <div style="position: absolute; top: 12px; right: 30px; z-index: 10000;">
                            <div style="background: white; padding: 6px 16px 6px 18px; border-radius: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 12px; position: relative; z-index: 10001;">
                                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                    <span style="font-weight: 700; color: #0f172a; font-size: 14px;" id="spndepNursname">System Administrator</span>
                                    <span style="font-weight: 500; color: #6b7280; font-size: 11px;" id="spnUserTypeLabel">Super Admin</span>
                                </div>
                                <div style="width: 1px; height: 30px; background: #e5e7eb;"></div>

                                <!-- Notification Bell -->
                                <div class="dock-notification-bell" id="dockNotificationBell" style="position: relative; cursor: pointer; display: flex; align-items: center; padding: 4px; z-index: 10002;">
                                    <img src="../images/bell-icon.png" alt="Notifications" class="bell-icon" style="width: 22px; height: 22px; object-fit: contain; display: block; opacity: 0.7;" />
                                    <span class="dock-notification-badge" id="dockNotificationCount" style="position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff; border-radius: 50%; font-size: 10px; padding: 1px 5px; min-width: 18px; height: 20px; text-align: center; font-weight: 600; border: 2px solid #fff; display: none; line-height: 18px; z-index: 10003;">0</span>
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

                                <!-- Notification Dropdown -->
                                <div class="dock-notification-dropdown" id="dockNotificationDropdown"
                                    style="position: absolute; top: 52px; right: 0; width: 420px; max-height: 580px; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); border: 1px solid #e5e7eb; display: none; z-index: 99999; overflow: hidden; min-height: 100px;">
                                    <div class="dock-notification-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #fff;">
                                        <h6 style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin: 0;">Notifications</h6>
                                        <button id="dockMarkAllRead" class="dock-mark-all-read" style="background: none; border: none; color: #16a34a; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; transition: all 0.2s ease;">
                                            <img src="../images/check-double-icon.png" alt="Mark all as read" style="width: 14px; height: 14px; filter: brightness(0) saturate(100%) invert(52%) sepia(58%) saturate(1529%) hue-rotate(102deg) brightness(96%) contrast(96%);" />
                                            Mark all as read
                                        </button>
                                    </div>
                                    <div class="dock-notification-list" id="dockNotificationList" style="max-height: 340px; overflow-y: auto; padding: 4px 0; background: #fff;">
                                        <div style="text-align: center; padding: 20px; color: #888;">Loading notifications...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="top-bar" style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-start; padding: 0 20px; margin-bottom: 18px;">
                            <div class="top-bar-left" style="display: flex; flex-direction: column; gap: 2px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <img src="../images/MenuDockets.png" alt="Menu Docket" style="width: 32px; height: 32px; filter: brightness(0) saturate(100%) invert(28%) sepia(79%) saturate(2000%) hue-rotate(145deg) brightness(95%) contrast(101%);" />
                                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #000000; letter-spacing: -0.5px; display: inline-flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                                        <span>Menu Docket</span>
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
                                </div>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding-left: 44px;">
                                    Per-patient meal dockets for kitchen plating and delivery. Print or export individual dockets.
                                <span style="color: #d1d5db; margin: 0 4px;">-</span>
                                    <span class="sync-badge" style="background: #f0fdf4; color: #065f46; padding: 2px 10px; border-radius: 12px; font-size: 12px; border: 1px solid #bbf7d0;">last synced <span id="lblLastSynced">less than a minute ago</span></span>
                                </p>
                            </div>

                            <div class="top-bar-right" style="display: flex; align-items: center; gap: 12px; flex-shrink: 0; margin-top: 24px;">
                                <button class="btn-print-next" id="btnPrintNext" onclick="PrintNextUnprinted();" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #ffffff; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                                    <img src="../images/printers.png" alt="Print" style="width: 18px; height: 18px; object-fit: contain;" />
                                    Print Next Unprinted
                                </button>
                                <button class="btn-refresh" id="btnRefresh" title="Refresh" style="display: flex; align-items: center; justify-content: center; padding: 8px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); width: 36px; height: 36px;">
                                    <img src="../images/refresh-icon.png" alt="Refresh" class="refresh-icon" id="refreshIcon" style="width: 18px; height: 18px; object-fit: contain; display: block; opacity: 0.7; transition: transform 0.6s ease;" />
                                </button>
                            </div>
                        </div>

                        <!-- Stats Grid -->
                        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; padding: 0 20px; margin-bottom: 20px;">

                            <!-- Total Dockets -->
                            <div class="stat-card" style="background: #fff; border: 1.5px solid #d9dee7; border-radius: 18px; padding: 15px 20px; min-height: 100px; display: flex; justify-content: space-between; align-items: center; box-shadow: none;">

                                <div class="stat-content" style="flex: 1;">
                                    <div class="stat-label" style="font-size: 12px; font-weight: 600; color: #6b7280; letter-spacing: .5px; text-transform: uppercase;">
                                        TOTAL DOCKETS
                                    </div>

                                    <div id="lblTotalDockets" class="stat-number" style="font-size: 32px; font-weight: 700; color: #1a1a2e; margin: 6px 0 4px;">
                                        0
                                    </div>

                                    <div class="stat-sub" style="font-size: 12px; color: #6b7280;">
                                        All orders ready for printing
                                    </div>
                                </div>

                                <div class="stat-icon" style="width: 42px; height: 42px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <img src="../images/dock-tickets.png" alt="Dockets" style="width: 20px; height: 20px; opacity: .8;">
                                </div>

                            </div>

                            <!-- Printed -->
                            <div class="stat-card" style="background: #fff; border: 1.5px solid #86efac; border-radius: 18px; padding: 15px 20px; min-height: 100px; display: flex; justify-content: space-between; align-items: center; box-shadow: none;">

                                <div class="stat-content" style="flex: 1;">
                                    <div class="stat-label" style="font-size: 12px; font-weight: 600; color: #16a34a; letter-spacing: .5px; text-transform: uppercase;">
                                        PRINTED
                                    </div>

                                    <div id="lblPrinted" class="stat-number" style="font-size: 32px; font-weight: 700; color: #16a34a; margin: 6px 0 4px;">
                                        0
                                    </div>

                                    <div class="stat-sub" style="font-size: 12px; color: #6b7280;">
                                        Dockets printed
                                    </div>
                                </div>

                                <div class="stat-icon" style="width: 42px; height: 42px; background: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <img src="../images/dock-checked.png" alt="Printed" style="width: 20px; height: 20px; opacity: .8;">
                                </div>

                            </div>

                            <!-- Yet To Print -->
                            <div class="stat-card" style="background: #fff; border: 1.5px solid #facc15; border-radius: 18px; padding: 15px 20px; min-height: 100px; display: flex; justify-content: space-between; align-items: center; box-shadow: none;">

                                <div class="stat-content" style="flex: 1;">
                                    <div class="stat-label" style="font-size: 12px; font-weight: 600; color: #d97706; letter-spacing: .5px; text-transform: uppercase;">
                                        YET TO PRINT
                                    </div>

                                    <div id="lblYetToPrint" class="stat-number" style="font-size: 32px; font-weight: 700; color: #dc2626; margin: 6px 0 4px;">
                                        0
                                    </div>

                                    <div class="stat-sub" style="font-size: 12px; color: #6b7280;">
                                        Awaiting print
                                    </div>
                                </div>

                                <div class="stat-icon" style="width: 42px; height: 42px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <img src="../images/dock-task.png" alt="Pending" style="width: 20px; height: 20px; opacity: .8;">
                                </div>

                            </div>

                        </div>

                        <!-- Filter Card -->
                        <div style="background: #fff; border: 1.5px solid #d9dee7; border-radius: 18px; padding: 10px 14px; margin: 0 20px 16px; box-shadow: 0 1px 4px rgba(0,0,0,.05);">

                            <div class="filters-bar" style="display: flex; align-items: center; gap: 10px;">

                                <!-- Search -->
                                <div style="flex: 1; position: relative;">
                                    <img src="../images/search-normal.png"
                                        style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; opacity: .6;">

                                    <input type="text"
                                        id="txtSearchDocket"
                                        autocomplete="off"
                                        placeholder="Search by patient name or room..."
                                        style="width: 100%; height: 42px; padding: 0 14px 0 44px; border: none; border-radius: 10px; background: #f4f5f7; font-size: 15px; outline: none; box-sizing: border-box;">
                                </div>

                                <!-- Date -->
                                <div style="width: 220px;">
                                    <input type="date"
                                        id="filterDate"
                                        class="filter-date-input"
                                        style="width: 100%; height: 42px; padding: 0 14px; border: none; border-radius: 10px; background: #f4f5f7; font-size: 15px; outline: none; box-sizing: border-box;">
                                </div>

                                <!-- Ward -->
                                <div style="width: 210px;">
                                    <select id="ddlWard"
                                        class="filter-select"
                                        style="width: 100%; height: 42px; padding: 0 14px; border: none; border-radius: 10px; background: #f4f5f7; font-size: 15px; outline: none; cursor: pointer; box-sizing: border-box;">
                                        <option value="">All wards</option>
                                    </select>
                                </div>

                            </div>

                        </div>

                        <!-- Dockets Table -->
                        <div class="dockets-table-wrapper" style="padding: 0 20px; overflow-x: auto;">
                            <table class="dockets-table" style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                                <thead>
                                    <tr style="background: #f8fafc; border-bottom: 1px solid #e5e7eb;">
                                        <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.8px;"><b>Room</b></th>
                                        <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.8px;"><b>Patient</b></th>
                                        <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.8px;"><b>Ward</b></th>
                                        <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.8px;"><b>Meal</b></th>
                                        <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.8px;"><b>Items</b></th>
                                        <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.8px;"><b>Diet / Allergies</b></th>
                                        <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.8px;"><b>Status</b></th>
                                        <th style="padding: 12px 16px; text-align: center; font-size: 14px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.8px;"><b>Print</b></th>
                                    </tr>
                                </thead>
                                <tbody id="tblDocketsBody">
                                    <tr>
                                        <td colspan="8" style="text-align: center; padding: 30px; color: #888;">Loading dockets...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Toast Notification -->
                        <div class="toast-notification" id="toastNotification" style="position: fixed; top: 20px; right: 20px; background: white; padding: 12px 20px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px; transform: translateX(120%); transition: transform 0.4s ease; z-index: 9999; border-left: 4px solid #22c55e;">
                            <i class="fas fa-check-circle" style="font-size: 20px; color: #22c55e;"></i>
                            <span id="toastMessage"></span>
                            <button class="toast-close" onclick="HideToast();" style="background: none; border: none; font-size: 20px; color: #6b7280; cursor: pointer; padding: 0 4px;">&times;</button>
                        </div>

                    </div>
                    <!-- End Right Panel -->

                </div>
            </div>
        </div>

        <div id="printPreviewOverlay" class="preview-overlay" style="display: none;">

            <div class="preview-modal">

                <div class="top-title">
                    <span>Print docket preview</span>
                    <button type="button" class="close-btn" onclick="ClosePrintPreview(event)">
                        <span>×</span>
                    </button>
                </div>

                <div id="printContentWrapper" class="preview-content">

                    <div class="company-header">

                        <div style="display: flex; align-items: center; gap: 14px;">
                            <img src="../images/printer.png" alt="Printer" style="width: 48px; height: 48px; object-fit: contain; opacity: 0.8;" />
                            <div>
                                <h1 style="margin: 0; font-size: 32px; color: #1f2d45; font-weight: 700;">Dial50.com</h1>
                                <span style="color: #7b8798; font-size: 14px;">HOSPITAL FOOD SERVICE</span>
                            </div>
                        </div>

                        <div class="order-info">
                            <label style="display: block; color: #7b8798; font-size: 12px; font-weight: 600;">ORDER DOCKET</label>
                            <h3 id="printOrderId" style="margin: 2px 0; font-size: 24px; color: #24344d;">#</h3>
                        </div>

                    </div>

                    <hr>

                    <div class="patient-row">

                        <div>
                            <small>PATIENT</small>
                            <h3 id="printPatientName"></h3>
                            <span id="printRoom"></span>
                        </div>

                        <div class="text-right">
                            <small>DATE</small>
                            <h4 id="printDateTime"></h4>
                        </div>

                    </div>

                    <div class="section-title">ITEMS TO PREPARE</div>

                    <table class="item-table">
                        <thead>
                            <tr>
                                <th width="60">QTY</th>
                                <th>ITEM</th>
                            </tr>
                        </thead>
                        <tbody id="printItemsList">
                            <tr>
                                <td colspan="2" style="text-align: center; color: #999; padding: 10px;">Loading...</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="allergy-box" id="printAllergiesBox">
                        <div class="box-title danger">⚠ ALLERGIES — DO NOT INCLUDE</div>
                        <div id="printAllergiesList">None</div>
                    </div>

                    <div class="diet-box">
                        <div class="box-title warning">DIET</div>
                        <div id="printDiet">No restrictions</div>
                    </div>

                    <div class="bottom-info">
                        <span id="printTray">TRAY: --</span>
                        <span id="printPrepTime">PREP: --</span>
                    </div>

                </div>

                <div class="footer-buttons">
                    <button type="button" class="btn-close" onclick="ClosePrintPreview(event)">
                        Close
                    </button>
                    <button type="button" class="btn-print" id="btnPrintDocket" onclick="PrintDocketNow(event)">
                        <img src="../images/printer.png" style="width: 18px; height: 18px; object-fit: contain; filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);">
                        Print
                    </button>
                </div>

            </div>

        </div>

        <div class="dock-toast-notification" id="dockToastNotification">
            <i class="fas fa-check-circle"></i>
            <span id="dockToastMessage"></span>
            <button class="toast-close" onclick="HideToast();">&times;</button>
        </div>

        <script src="../js/style.js"></script>

    </form>
</body>
</html>
