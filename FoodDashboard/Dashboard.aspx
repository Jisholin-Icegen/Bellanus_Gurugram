<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Dashboard.aspx.cs" Inherits="FoodDashboard_FoodDashboard" %>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Food Dashboard | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="../favicon.png" />

    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" type="text/css" href="../css/FoodDashboard.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link href="../css/changepwd.css" rel="stylesheet" />

    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>

    <script src="../js/jquery.sumoselect.min.js"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="../js/FoodDashboard.js" type="text/javascript"></script>
    <script type="text/javascript" src="../Scripts/npmchart.js"></script>

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

        <div style="position: absolute; top: 70px; right: 1360px; z-index: 10; pointer-events: none;">
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
        </div>

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
                                        <li><a href="../FoodDashboard/MenuDocket.aspx"><span>
                                            <img src="../images/MenuDocket.png" alt="Menu Docket"></span> Menu Docket</a></li>
                                        <li><a href="../FoodDashboard/Deliveries.aspx"><span>
                                            <img src="../images/Deliveries.png" alt="Deliveries"></span> Deliveries</a></li>
                                        <li class="current-menu-item"><a href="../FoodDashboard/Dashboard.aspx"><span>
                                            <img src="../images/Dashboard.png" alt="Dashboard"></span> Dashboard</a></li>
                                        <li><a href="../FoodDashboard/UserManagement.aspx"><span>
                                            <img src="../images/UserManagement.png" alt="UserManagement"></span> User Management</a></li>
                                        <li><a href="../FoodDashboard/PatientSatisfaction.aspx"><span>
                                            <img src="../images/PatientSatisfaction.png" alt="PatientSatisfaction"></span> Patient Satisfaction</a></li>
                                        <li><a href="../FoodDashboard/KitchenOrderReport.aspx"><span>
                                            <img src="../images/KitchenOrderReport.png" alt="OrderReport"></span> Order Report</a></li>
                                        <li><a href="../FoodDashboard/MyStation.aspx"><span>
                                            <img src="../images/MyStation.png" alt="MyStation"></span> My Station</a></li>
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

                    <div class="screen-right-panel dashboard-page">

                        <div style="position: absolute; top: 12px; right: 30px; z-index: 1000;">
                            <div style="background: white; padding: 6px 16px 6px 18px; border-radius: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 12px;">
                                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                    <span style="font-weight: 700; color: #0f172a; font-size: 14px;" id="spndepNursname">System Administrator</span>
                                    <span style="font-weight: 500; color: #6b7280; font-size: 11px;" id="spnUserTypeLabel">Super Admin</span>
                                </div>
                                <div style="width: 1px; height: 30px; background: #e5e7eb;"></div>


                                <div class="dash-notification-bell" id="dashNotificationBell">
                                    <img src="../images/bell-icon.png" alt="Notifications" class="bell-icon" />
                                    <span class="dash-notification-badge" id="dashNotificationCount">0</span>
                                </div>

                                <div class="dash-notification-wrapper" style="position: relative; display: inline-block;">
                                    <div class="dash-notification-dropdown" id="dashNotificationDropdown" style="display: none; position: absolute; top: 45px; right: 0; width: 380px background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; z-index: 999999; overflow: hidden;">
                                        <div class="dash-notification-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                                            <h6 style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin: 0;">Notifications</h6>
                                            <button class="dash-mark-all-read" id="dashMarkAllRead" style="background: none; border: none; color: #4361ee; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                                <img src="../images/check-double-icon.png" alt="Mark all as read" style="width: 14px; height: 14px;" />
                                                Mark all as read
                                            </button>
                                        </div>
                                        <div class="dash-notification-list" id="dashNotificationList" style="max-height: 340px; overflow-y: auto; padding: 4px 0;">
                                            <div style="text-align: center; padding: 20px; color: #888;">Loading...</div>
                                        </div>
                                    </div>
                                </div>
                                <a href="../login.aspx" title="Logout" style="display: flex; align-items: center; gap: 6px; padding: 4px 12px 4px 8px; border-radius: 20px; transition: all 0.2s; text-decoration: none; color: #dc2626; cursor: pointer; font-size: 13px; font-weight: 500;" onmouseover="this.style.background='#fee2e2'; this.style.color='#b91c1c';" onmouseout="this.style.background='transparent'; this.style.color='#dc2626';">
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

                        <!-- Top Bar -->
                        <div class="top-bar" style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-start; padding: 0 20px; margin-bottom: 18px;">
                            <div class="top-bar-left" style="display: flex; flex-direction: column; gap: 2px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <img src="../images/chart-bars.png" alt="Dashboard" style="width: 32px; height: 32px; filter: brightness(0) saturate(100%) invert(45%) sepia(90%) saturate(1500%) hue-rotate(90deg) brightness(95%) contrast(95%);" />
                                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a2e;">Dashboard</h1>
                                </div>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding-left: 44px;">
                                    Live operational KPIs and trends across the food service.
            <span style="color: #d1d5db; margin: 0 4px;">-</span>
                                    <span class="auto-refresh-badge" style="background: #e0e7ff; color: #4f46e5; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">auto-refresh every 30s</span>
                                    <span style="color: #d1d5db; margin: 0 4px;">-</span>
                                    <span class="sync-badge" style="background: #f3f4f6; color: #6b7280; padding: 2px 10px; border-radius: 12px; font-size: 12px;">last synced <span id="lblLastSynced">less than a minute ago</span></span>
                                </p>
                            </div>
                            <div class="top-bar-right" style="display: flex; align-items: center; gap: 12px; flex-shrink: 0; margin-top: 24px;">


                                <!-- Date Range Dropdown -->
                                <div class="date-range-dropdown" style="position: relative; display: inline-block;">
                                    <select id="dateRangeSelect" style="padding: 6px 30px 6px 14px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; color: #1a1a2e; transition: all 0.2s; appearance: none; -webkit-appearance: none; height: 34px;">
                                        <option value="7">Last 7 days</option>
                                        <option value="30" selected>Last 30 days</option>
                                        <option value="90">Last 90 days</option>
                                    </select>
                                    <svg style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <!-- Refresh Button -->
                                <button class="btn-refresh" id="btnRefresh" title="Refresh" style="display: flex; align-items: center; justify-content: center; padding: 6px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.06); width: 34px; height: 34px;">
                                    <img src="../images/refresh-icon.png" alt="Refresh" class="refresh-icon" style="width: 16px; height: 16px; object-fit: contain; display: block; opacity: 0.7; transition: all 0.2s ease;" />
                                </button>

                            </div>

                        </div>

                        <!-- Stats Grid -->

                        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 0 20px; margin-bottom: 20px;">

                            <!-- TODAY'S ORDERS -->
                            <div class="stat-card" style="background: white; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; position: relative;">
                                <div class="stat-content" style="flex: 1;">
                                    <div class="stat-label" style="font-size: 12px; font-weight: 600; color: #6b7280; letter-spacing: 0.5px; text-transform: uppercase;">TODAY'S ORDERS</div>
                                    <div class="stat-number" id="lblTotalOrders" style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 4px 0 2px 0;">0</div>
                                    <div class="stat-sub" style="font-size: 13px; color: #6b7280;"><span id="lblDeliveredCount">0</span> delivered · <span id="lblCancelledCount">0</span> cancelled</div>
                                </div>
                                <div class="stat-icon" style="width: 36px; height: 36px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: -4px;">
                                    <img src="../images/kitchen-order.png" alt="Orders" style="width: 18px; height: 18px; opacity: 0.7;">
                                </div>
                            </div>

                            <!-- PENDING DELIVERIES -->
                            <div class="stat-card stat-pending" style="background: white; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; position: relative;">
                                <div class="stat-content" style="flex: 1;">
                                    <div class="stat-label" style="font-size: 12px; font-weight: 600; color: #6b7280; letter-spacing: 0.5px; text-transform: uppercase;">PENDING DELIVERIES</div>
                                    <div class="stat-number" id="lblPendingDeliveries" style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 4px 0 2px 0;">0</div>
                                    <div class="stat-sub" style="font-size: 13px; color: #6b7280;">In transit + ready for pickup</div>
                                </div>
                                <div class="stat-icon" style="width: 36px; height: 36px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: -4px;">
                                    <img src="../images/pending-deliveries.png" alt="Pending" style="width: 18px; height: 18px; opacity: 0.7;">
                                </div>
                            </div>

                            <!-- KITCHEN ORDERS -->
                            <div class="stat-card stat-kitchen" style="background: white; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; position: relative;">
                                <div class="stat-content" style="flex: 1;">
                                    <div class="stat-label" style="font-size: 12px; font-weight: 600; color: #6b7280; letter-spacing: 0.5px; text-transform: uppercase;">KITCHEN ORDERS</div>
                                    <div class="stat-number" id="lblKitchenOrders" style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 4px 0 2px 0;">0</div>
                                    <div class="stat-sub" style="font-size: 13px; color: #6b7280;">Placed / confirmed / preparing</div>
                                </div>
                                <div class="stat-icon" style="width: 36px; height: 36px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: -4px;">
                                    <img src="../images/kitchen-icon.png" alt="Kitchen" style="width: 18px; height: 18px; opacity: 0.7;">
                                </div>
                            </div>

                            <!-- ACTIVE DIET TYPES -->
                            <div class="stat-card stat-diets" style="background: white; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; position: relative;">
                                <div class="stat-content" style="flex: 1;">
                                    <div class="stat-label" style="font-size: 12px; font-weight: 600; color: #6b7280; letter-spacing: 0.5px; text-transform: uppercase;">ACTIVE DIET TYPES</div>
                                    <div class="stat-number" id="lblActiveDiets" style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 4px 0 2px 0;">0</div>
                                    <div class="stat-sub" style="font-size: 13px; color: #6b7280;">Configured in master</div>
                                </div>
                                <div class="stat-icon" style="width: 36px; height: 36px; background: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: -4px;">
                                    <img src="../images/active-diet.png" alt="Diet Types" style="width: 18px; height: 18px; opacity: 0.7;">
                                </div>
                            </div>
                        </div>


                        <!-- Diet Category Mix + Order Volume -->
                        <div class="diet-order-row" style="display: grid; grid-template-columns: 35% 65%; gap: 16px; padding: 0 20px; margin-bottom: 20px;">
                            <!-- Diet Category Mix -->
                            <div class="chart-card diet-card" style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,.06);">

                                <div style="display: flex; align-items: center; gap: 8px; margin: 0 0 12px 0;">

                                    <img src="../images/pie-chart.png"
                                        style="width: 18px; height: 18px; filter: brightness(0) saturate(100%)
                            invert(61%)
                            sepia(10%)
                            saturate(397%)
                            hue-rotate(180deg)
                            brightness(90%)
                            contrast(90%);" />

                                    <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #223a63;">Diet category mix
                                    </h3>

                                </div>

                                <div class="diet-content" style="display: flex; flex-direction: column; align-items: center;">
                                    <div class="diet-chart-wrapper"
                                        style="width: 330px; height: 330px; margin: 0 auto 10px auto;">
                                        <canvas id="dietChart"></canvas>
                                    </div>
                                    <div id="dietLegendGrid"
                                        style="display: grid; grid-template-columns: repeat(4,max-content); justify-content: center; column-gap: 0px; row-gap: 10px; margin-top: 12px; padding-bottom: 14px; border-bottom: 1px solid #edf2f7; width: 100%;">
                                    </div>

                                    <div class="diet-stats" style="margin-top: 8px; font-size: 10px; color: #9ca3af; text-align: center;">
                                        <span id="lblActivePatients" style="font-weight: 600; color: #6b7280;">0</span> active patients · <span id="lblPatientsOnDiet" style="font-weight: 600; color: #6b7280;">0</span> on a diet
                                    </div>
                                </div>
                            </div>

                            <!-- Order Volume -->
                            <div class="chart-card order-volume-chart" style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,.06);">

                                <div style="display: flex; align-items: center; gap: 8px; margin: 0 0 12px 0;">

                                    <img src="../images/trend.png"
                                        style="width: 18px; height: 18px; filter: brightness(0) saturate(100%)
                            invert(61%)
                            sepia(10%)
                            saturate(397%)
                            hue-rotate(180deg)
                            brightness(90%)
                            contrast(90%);" />

                                    <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #223a63;">Order volume · last 30 days
                </h3>

                                </div>

                                <div class="chart-container" style="height: 260px; position: relative;">
                                    <canvas id="volumeChart"></canvas>
                                </div>
                                <div class="chart-legend-grid" style="display: flex; justify-content: center; gap: 16px; margin-top: 90px; padding-top: 8px; border-top: 1px solid #f3f4f6;">
                                    <span class="legend-item" style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #6b7280; font-weight: 500;">
                                        <span style="width: 8px; height: 8px; border-radius: 2px; background: #22c55e; flex-shrink: 0;"></span>Orders
                                    </span>
                                    <span class="legend-item" style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #6b7280; font-weight: 500;">
                                        <span style="width: 8px; height: 8px; border-radius: 2px; background: #3b82f6; flex-shrink: 0;"></span>Delivered
                                    </span>
                                    <span class="legend-item" style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #6b7280; font-weight: 500;">
                                        <span style="width: 8px; height: 8px; border-radius: 2px; background: #ef4444; flex-shrink: 0;"></span>Cancelled
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Chart Row 1 - Top Menu Items + SLA -->
                        <div class="chart-row" style="display: grid; grid-template-columns: 65% 35%; gap: 16px; padding: 0 20px; margin-bottom: 20px;">

                            <!-- Top Menu Items - Rectangle Shape (Wider & Taller) -->
                            <div class="chart-card top-menu-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">

                                <h3 style="font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                                    <img src="../images/orders-icon.png" alt="icon"
                                        style="width: 16px; height: 16px; flex-shrink: 0; filter: grayscale(100%) brightness(0.6) contrast(0.8); opacity: 0.7;">
                                    Top menu items
                                </h3>

                                <div class="chart-container" style="height: 380px; position: relative;">
                                    <canvas id="topMenuChart"></canvas>
                                </div>

                            </div>

                            <!-- SLA Compliance - Square Shape (Narrower & Taller) -->
                            <div class="chart-card sla-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: center; min-height: 460px;">

                                <h3 style="font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                                    <img src="../images/dart-board.png" alt="icon"
                                        style="width: 16px; height: 16px; flex-shrink: 0; filter: grayscale(100%) brightness(0.6) contrast(0.8); opacity: 0.7;">
                                    SLA compliance
                                </h3>
                                <div class="sla-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">

                                    <div class="sla-display" style="display: flex; justify-content: center; align-items: center; padding: 15px 0;">
                                        <div class="sla-chart-wrapper" style="width: 180px; height: 180px;">
                                            <canvas id="slaChart"></canvas>
                                        </div>
                                    </div>

                                    <div class="sla-details" style="text-align: center; margin-top: 12px;">

                                        <div id="slaTarget"
                                            class="sla-target"
                                            style="font-size: 13px; color: #6b7280;">
                                        </div>

                                        <div class="sla-stats"
                                            style="font-size: 14px; color: #6b7280; font-weight: 500; margin-top: 6px;">

                                            <span id="slaOnTime" style="font-weight: 700; color: #111827;"></span>
                                            on time
                &nbsp;·&nbsp;

                <span id="slaTotal" style="font-weight: 700; color: #111827;"></span>
                                            total
                &nbsp;·&nbsp;

                avg
                <span id="slaAvg" style="font-weight: 700; color: #111827;"></span>m

                                        </div>

                                    </div>

                                </div>
                            </div>

                        </div>
                        <!-- Chart Row 2 - Satisfaction + Demand Forecast -->
                        <div class="chart-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 20px; margin-bottom: 20px;">

                            <div class="chart-card satisfaction-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06); position: relative;">
                                <div style="position: absolute; top: 16px; right: 16px; background: rgba(0, 183, 116, 0.12); color: #00B774; padding: 4px 14px; border-radius: 12px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; border: 1px solid rgba(0, 183, 116, 0.2);">
                                    Last 7 days
                                </div>

                                <h3 style="font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                                    <img src="../images/PatientSatisfaction.png" alt="Patient Satisfaction" style="width: 18px; height: 18px; object-fit: contain; filter: brightness(0) saturate(100%) invert(45%) sepia(90%) saturate(1500%) hue-rotate(90deg) brightness(95%) contrast(95%);" />
                                    Patient satisfaction
                                </h3>

                                <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px;">
                                    <div style="display: flex; align-items: flex-end; gap: 12px;">
                                        <div style="display: flex; align-items: baseline; gap: 4px;">
                                            <span class="satisfaction-rating" id="satRating" style="font-size: 32px; font-weight: 700; color: #1a1a2e; line-height: 1;">0%</span>
                                            <span id="satLabel" style="color: #9ca3af; font-size: 16px; margin-left: 8px; font-weight: 400;">satisfied</span>
                                        </div>
                                    </div>
                                    <div class="satisfaction-change" id="satChange" style="font-size: 13px; color: #4b5563; font-weight: 500; display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                                        <img src="../images/trend.png" alt="Trend" style="width: 14px; height: 14px; filter: brightness(0) saturate(100%) invert(35%) sepia(0%) saturate(0%) brightness(95%) contrast(90%);" />
                                        <span>0% vs prior week</span>
                                    </div>
                                </div>

                                <div style="height: 130px; margin: 4px 0 4px 0; position: relative; padding-left: 15px; padding-right: 10px;">
                                    <canvas id="satisfactionLineChart"></canvas>
                                </div>

                                <div id="satDates" style="display: flex; justify-content: space-between; padding: 0 10px; font-size: 11px; font-weight: 500; color: #6b7280; margin-bottom: 14px;"></div>

                                <div class="satisfaction-breakdown" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 14px; border-top: 1px solid #e5e7eb;">
                                    <div class="feedback-column">
                                        <div class="feedback-label" style="font-size: 11px; font-weight: 600; color: #00B774; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
                                            <img src="../images/thumbs-up.png" alt="Thumbs Up" style="width: 14px; height: 14px; filter: brightness(0) saturate(100%) invert(45%) sepia(90%) saturate(1500%) hue-rotate(90deg) brightness(95%) contrast(95%);" />
                                            TOP COMPLIMENTS
                                        </div>
                                        <div class="feedback-items" id="complimentsList" style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px;"></div>
                                    </div>
                                    <div class="feedback-column">
                                        <div class="feedback-label" style="font-size: 11px; font-weight: 600; color: #FF2438; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
                                            <img src="../images/thumbs-down.png" alt="Thumbs Down" style="width: 14px; height: 14px; filter: brightness(0) saturate(100%) invert(27%) sepia(90%) saturate(2500%) hue-rotate(340deg) brightness(95%) contrast(95%);" />
                                            TOP COMPLAINTS
                                        </div>
                                        <div class="feedback-items" id="complaintsList" style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px;"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Demand Forecast -->
                            <div class="chart-card forecast-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06); position: relative;">
                                <!-- Forecasted by AI badge -->
                                <div style="position: absolute; top: 16px; right: 16px; background: rgba(139, 92, 246, 0.12); color: #7c3aed; padding: 4px 14px; border-radius: 12px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; border: 1px solid rgba(139, 92, 246, 0.2); display: flex; align-items: center; gap: 6px;">
                                    <img src="../images/generate-icon.png" alt="AI" style="width: 14px; height: 14px; filter: brightness(0) saturate(100%) invert(30%) sepia(90%) saturate(1500%) hue-rotate(240deg) brightness(95%) contrast(95%);" />
                                    Forecasted by AI
                                </div>

                                <h3 style="font-size: 15px; font-weight: 600; color: #1a1a2e; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                                    <img src="../images/trend.png" alt="icon"
                                        style="width: 16px; height: 16px; flex-shrink: 0; filter: grayscale(100%); opacity: 0.7;">
                                    Demand forecast — Tomorrow
                                </h3>
                                <div class="forecast-grid" id="forecastGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 8px 0;">
                                    <!-- Will be populated by JavaScript -->
                                </div>

                                <div class="forecast-stockup" style="background: transparent; padding: 12px 0; margin: 12px 0;">
                                    <div class="stockup-label" style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; padding: 0 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                                        <img src="../images/warning.png" alt="Warning" style="width: 14px; height: 14px; filter: brightness(0) saturate(100%) invert(50%) sepia(90%) saturate(2000%) hue-rotate(10deg) brightness(100%) contrast(100%);" />
                                        STOCK UP ON
                                    </div>
                                    <div class="stockup-items" id="stockupItems" style="display: flex; flex-direction: column; gap: 2px;"></div>
                                </div>
                            </div>

                            <div class="chart-card trending-card" style="margin: 0 5px 16px 5px; background: #fff; border-radius: 12px; padding: 16px 18px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,.06);">

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">

                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <img src="../images/trend.png"
                                            style="width: 16px; height: 16px; filter: brightness(0) saturate(100%) invert(45%) sepia(90%) saturate(1500%) hue-rotate(90deg) brightness(95%) contrast(95%);" />

                                        <span style="font-size: 15px; font-weight: 600; color: #1d2b4f;">Trending Items
                                        </span>
                                    </div>

                                    <span style="font-size: 11px; color: #94a3b8;">week-over-week
                                    </span>

                                </div>

                                <div id="trendingItems"></div>

                            </div>

                            <!-- Staff Performance -->
                            <div class="chart-card staff-card" style="margin: 0 5px 16px 5px; background: #fff; border-radius: 12px; padding: 16px 18px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,.06);">

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">

                                    <div style="display: flex; align-items: center; gap: 8px;">

                                        <img src="../images/performance-icon.png"
                                            style="width: 18px; height: 18px; filter: brightness(0) saturate(100%) invert(61%) sepia(13%) saturate(420%) hue-rotate(181deg) brightness(92%) contrast(90%);" />

                                        <span style="font-size: 15px; font-weight: 600; color: #1d2b4f;">Staff Performance
                                        </span>

                                    </div>

                                    <span style="font-size: 11px; color: #94a3b8;">by satisfaction score
                                    </span>

                                </div>

                                <div id="staffItems"></div>

                            </div>

                            <!-- Recent Orders -->
                            <div class="recent-orders-section"
                                style="width: 200%; max-width: none; margin: 0; padding: 0; background: #fff; border-radius: 18px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,.06); overflow: hidden; box-sizing: border-box;">

                                <div style="display: flex; align-items: center; gap: 10px; padding: 18px 22px; border-bottom: 1px solid #edf2f7;">

                                    <img src="../images/pending-icon.png"
                                        style="width: 18px; height: 18px; filter: brightness(0) saturate(100%) invert(61%) sepia(10%) saturate(397%) hue-rotate(180deg) brightness(90%) contrast(90%);" />

                                    <span style="font-size: 15px; font-weight: 600; color: #223a63;">Recent orders (today)
                                    </span>

                                </div>

                                <div style="overflow-x: auto;">

                                    <table class="orders-table" style="width: 100%; border-collapse: collapse;">

                                        <thead>

                                            <tr>

                                                <th>Order</th>
                                                <th>Time</th>
                                                <th>Patient</th>
                                                <th>Room</th>
                                                <th>Meal</th>
                                                <th>Items</th>
                                                <th>Status</th>

                                            </tr>

                                        </thead>

                                        <tbody id="tblOrdersBody">
                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- End Right Panel -->
        <script src="../js/style.js"></script>

    </form>
</body>
</html>
