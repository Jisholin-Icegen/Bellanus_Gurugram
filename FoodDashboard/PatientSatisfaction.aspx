<%@ Page Language="C#" AutoEventWireup="true" CodeFile="PatientSatisfaction.aspx.cs" Inherits="FoodDashboard_MenuMaster" %>

<html lang="en">
<head>
    <title>Patient Satisfaction | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="../favicon.png" />
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" type="text/css" href="../css/PatientSatisfaction.css" />
    <link href="../css/changepwd.css" rel="stylesheet" />
    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="../js/jquery.sumoselect.min.js"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/PatientSatisfaction.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>

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

        <asp:HiddenField ID="hdnOrderId" runat="server" ClientIDMode="Static" Value="" />
        <asp:HiddenField ID="HFDWExportHeader" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="HFDWSearchQuery" runat="server" ClientIDMode="Static" />
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
                                <br />
                                <div class="food-order-btn-container" id="foodOrderContainer">
                                    <button type="button"
                                        class="food-order-btn"
                                        onclick="openFoodOrder()">
                                        <img src="../images/food-order.png">
                                        Food Order
                                   
                                    </button>
                                </div>

                                <br />
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
                                        <li><a href="../FoodDashboard/Dashboard.aspx"><span>
                                            <img src="../images/Dashboard.png" alt="Dashboard"></span> Dashboard</a></li>
                                        <li><a href="../FoodDashboard/UserManagement.aspx"><span>
                                            <img src="../images/UserManagement.png" alt="UserManagement"></span> User Management</a></li>
                                        <li class="current-menu-item"><a href="../FoodDashboard/PatientSatisfaction.aspx"><span>
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


                    <!-- Right Panel - Patient Satisfaction -->
                    <div class="screen-right-panel patient-satisfaction-page">

                        <!-- Top Bar with User Info -->
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

                        <!-- Page Header -->
                        <div class="top-bar" style="margin-top: 45px;">
                            <div class="top-bar-left">
                                <h1 style="margin: 0; display: inline-flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                                    <span class="icon-wrapper">
                                        <img src="../images/happy-face.png" alt="Patient Satisfaction" class="page-icon" />
                                    </span>
                                    <span class="heading-text">Patient Satisfaction</span>
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
                                <p>
                                    <i class="fas fa-info-circle" style="color: #9ca3af; margin-right: 6px; font-size: 12px;"></i>
                                    Aggregate meal feedback — % satisfied, sentiment mix, and trends.
                                </p>
                            </div>
                            <div class="top-bar-right">

                                <div class="export-dropdown-wrapper">
                                    <button class="btn-export-pdf" id="btnExportPDF" title="Export PDF">
                                        <img src="../images/Export-pdf-icon.png" alt="Export PDF" class="pdf-icon" />
                                        <span style="font-weight: 700;">Export PDF</span>
                                        <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; transition: transform 0.2s ease;">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </button>

                                    <div class="export-options-menu" id="exportOptionsMenu">
                                        <button class="export-opt-item" onclick="triggerExport('today')">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <polyline points="12 6 12 12 16 14"></polyline>
                                            </svg>
                                            Today
                                        </button>
                                        <button class="export-opt-item" onclick="triggerExport('7days')">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                            Last 7 Days
                                        </button>
                                        <button class="export-opt-item" onclick="triggerExport('30days')">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                                <line x1="8" y1="14" x2="16" y2="14"></line>
                                                <line x1="8" y1="18" x2="12" y2="18"></line>
                                            </svg>
                                            Last 30 Days
                                        </button>
                                    </div>
                                </div>

                                <button class="btn-refresh" id="btnRefresh" title="Refresh">
                                    <img src="../images/refresh-icon.png" alt="Refresh" class="refresh-icon" />
                                    <span style="font-weight: 600;">Refresh</span>
                                </button>

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
                            </div>
                        </div>


                        <div class="food-order-overlay" id="foodOrderOverlay">
                            <div class="food-modal">

                                <button type="button" class="food-modal-close" onclick="closeFoodOrder()">✕</button>

                                <div class="food-header">
                                    <div>
                                        <h3>
                                            <img src="../images/food-order.png" alt="Food Order">
                                            Food Order
                                        </h3>
                                    </div>
                                    <div class="prebook-section">
                                        <span>PRE-BOOK</span>
                                        <label class="switch">
                                            <input type="checkbox" id="chkPreBook" onchange="onPreBookToggle()">
                                            <span class="slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div class="preorder-chip" id="preorderChip" style="display: none;" onclick="toggleDatePicker(event)">
                                    <img src="../images/calendar.png" alt="Calendar" style="cursor: pointer; width: 14px; height: 14px; filter: brightness(0) saturate(100%) invert(12%) sepia(92%) saturate(7180%) hue-rotate(268deg) brightness(88%) contrast(104%);">
                                    <span id="lblOrderDate">Pre-order for Tomorrow</span>
                                    <img src="../images/arrow-down.png" alt="Dropdown" id="calendarDropdownArrow" style="cursor: pointer; width: 14px; height: 14px; filter: brightness(0) saturate(100%) invert(12%) sepia(92%) saturate(7180%) hue-rotate(268deg) brightness(88%) contrast(104%);">
                                    <div class="preorder-date-dropdown" id="preorderDateDropdown" onclick="event.stopPropagation();">
                                        <div class="date-picker-header">
                                            <button type="button" class="date-nav-btn" onclick="changeMonth(-1, event)">‹</button>
                                            <span id="datePickerMonth"></span>
                                            <button type="button" class="date-nav-btn" onclick="changeMonth(1, event)">›</button>
                                        </div>
                                        <div class="date-picker-grid" id="datePickerGrid"></div>
                                    </div>
                                </div>

                                <div class="food-subtitle">Switch between meal tabs to plan each course. All 5 meals submit together.</div>

                                <div class="diet-allergy-pills" id="dietAllergyPills">
                                    <span class="diet-pill hidden" id="dietPill">Cardiac Diet</span>
                                    <span class="allergy-pill hidden" id="allergyPill">Allergic to dairy</span>
                                </div>

                                <div class="food-form-row">
                                    <div class="form-group">
                                        <label>Room No</label>
                                        <select class="form-control" id="ddlRoomNo" onchange="onRoomChange()">
                                            <option value="">-- Select Room --</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Patient Name</label>
                                        <input type="text" class="form-control" id="txtPatientName" placeholder="Enter Patient Name" oninput="onPatientNameChange()">
                                    </div>
                                </div>

                                <div class="meal-tabs-wrapper" style="overflow: visible !important; position: relative;">
                                    <div class="meal-tabs" id="mealTabs" style="overflow: visible !important; padding-bottom: 30px;"></div>
                                </div>
                                <div id="defaultSelectedWrapper">
                                    <div class="default-selected-label" onclick="toggleDefaultSelected()">
                                        <div class="label-left">
                                            <div class="label-icon">
                                                <img src="../images/default-food.png" alt="Food">
                                            </div>
                                            <div class="label-text-wrapper">
                                                <span class="label-text">Today's selection</span>
                                                <span class="label-badge">SELECTED</span>
                                            </div>
                                        </div>
                                        <div class="label-right">
                                            <span class="label-action">
                                                <span class="action-text">View All</span>
                                                <img src="../images/arrow-down.png" alt="Toggle" class="action-arrow" id="defaultSelectedArrow">
                                            </span>
                                        </div>
                                    </div>

                                    <div id="defaultSelectedSection">
                                        <div id="defaultSelectedContent" class="default-selected-content">
                                            <div id="defaultSelectedList" class="default-selected-list"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="recommended-container">
                                    <div class="recommended-header" onclick="toggleRecommendedSection()">
                                        <img src="../images/sparkles.png" alt="Sparkles" class="sparkle-icon">
                                        <span class="header-title">Recommended for You</span>
                                        <span class="count-badge">(0)</span>
                                        <img src="../images/arrow-down.png" alt="Toggle" class="arrow-toggle">
                                    </div>
                                    <div class="recommended-grid hidden" id="recommendedGrid"></div>
                                </div>

                                <!-- Meal Section Header -->
                                <div class="meal-section-header">
                                    <h5 id="mealSectionTitle">Breakfast</h5>
                                    <div class="search-box">
                                        <img src="../images/search-icon.png" alt="Search">
                                        <input type="text" id="searchFoodInput" placeholder="Search food items..." oninput="filterFoodItems()">
                                    </div>
                                    <span class="items-selected-badge" id="itemsSelectedBadge" style="display: none;"></span>
                                </div>

                                <!-- Food Grid -->
                                <div class="food-grid" id="foodGrid"></div>

                                <!-- Requestor & Instructions -->
                                <div class="food-form-row">
                                    <div class="form-group">
                                        <label>Requestor Name</label>
                                        <input type="text" class="form-control" id="txtRequestorName" placeholder="Enter Requestor Name">
                                    </div>
                                    <div class="form-group">
                                        <label>Special Instructions</label>
                                        <textarea rows="1" class="form-control" id="txtInstruction" placeholder="Less Salt, No Sugar, Extra Spoon..." style="resize: none"></textarea>
                                    </div>
                                </div>

                                <!-- Footer -->
                                <div class="food-footer">
                                    <button type="button" class="btn-review" id="btnReview" disabled onclick="submitFoodOrder()">
                                        <img src="../images/cart-icon.png" alt="Cart" style="filter: brightness(0) invert(1); width: 20px; height: 20px;">
                                        <span id="reviewBtnLabel">Submit</span>
                                        <img src="../images/arrow-right.png" alt="Arrow" style="filter: brightness(0) invert(1); width: 20px; height: 20px;">
                                    </button>
                                </div>

                            </div>
                        </div>


                        <div class="stats-grid" id="statsGrid">
                            <div class="stat-card card-satisfied">
                                <div class="stat-content">
                                    <div class="card-label">% Satisfied</div>
                                    <div class="stat-number" id="lblSatisfiedPercent">0%</div>
                                    <div class="stat-sub">of all rated meals</div>
                                </div>
                            </div>
                            <div class="stat-card card-total-responses">
                                <div class="stat-content">
                                    <div class="card-label">Total Responses</div>
                                    <div class="stat-number" id="lblTotalResponses">0</div>
                                    <div class="stat-sub" id="lblTotalDelivered">of 0 delivered orders</div>
                                </div>
                            </div>
                            <div class="stat-card card-response-rate">
                                <div class="stat-content">
                                    <div class="card-label">Response Rate</div>
                                    <div class="stat-number" id="lblResponseRate" style="color: #0ea5e9;">0%</div>
                                    <div class="stat-sub">patients rated their meal</div>
                                </div>
                            </div>
                            <div class="stat-card card-unsatisfied">
                                <div class="stat-content">
                                    <div class="card-label">Unsatisfied</div>
                                    <div class="stat-number" id="lblUnsatisfiedCount">0</div>
                                    <div class="stat-sub" id="lblUnsatisfiedPercent">0% of all responses</div>
                                </div>
                            </div>
                        </div>

                        <!-- Chart Row - Sentiment Distribution & Meal Ratings -->
                        <div class="chart-row">

                            <!-- Sentiment Distribution -->
                            <div class="chart-section sentiment-distribution">
                                <div class="chart-header">
                                    <h3>
                                        <img src="../images/happy-face.png" alt="Sentiment" class="chart-header-icon" />
                                        Sentiment Distribution
                                    </h3>
                                </div>
                                <div class="sentiment-bars" id="sentimentBars">
                                    <div class="sentiment-bar-row">
                                        <div class="sentiment-label-wrapper">
                                            <img src="../images/happy-face.png" alt="Satisfied" class="sentiment-icon-img" />
                                            <span class="sentiment-label">Satisfied</span>
                                        </div>
                                        <div class="sentiment-bar-track">
                                            <div id="barSatisfied" class="sentiment-bar-fill satisfied-fill"></div>
                                        </div>
                                        <span id="sentimentSatisfiedCount" class="sentiment-count">0</span>
                                    </div>
                                    <div class="sentiment-bar-row">
                                        <div class="sentiment-label-wrapper">
                                            <img src="../images/neutral-face.png" alt="Neutral" class="sentiment-icon-img" />
                                            <span class="sentiment-label">Neutral</span>
                                        </div>
                                        <div class="sentiment-bar-track">
                                            <div id="barNeutral" class="sentiment-bar-fill neutral-fill"></div>
                                        </div>
                                        <span id="sentimentNeutralCount" class="sentiment-count">0</span>
                                    </div>
                                    <div class="sentiment-bar-row">
                                        <div class="sentiment-label-wrapper">
                                            <img src="../images/sad-face.png" alt="Unsatisfied" class="sentiment-icon-img" />
                                            <span class="sentiment-label">Unsatisfied</span>
                                        </div>
                                        <div class="sentiment-bar-track">
                                            <div id="barUnsatisfied" class="sentiment-bar-fill unsatisfied-fill"></div>
                                        </div>
                                        <span id="sentimentUnsatisfiedCount" class="sentiment-count">0</span>
                                    </div>
                                </div>
                            </div>

                            <!-- % Satisfied by Meal -->
                            <div class="chart-section ratings-by-meal">
                                <div class="chart-header">
                                    <h3>
                                        <img src="../images/orders-icon.png" alt="Ratings by Meal" class="chart-header-icon" />
                                        % Satisfied by Meal
                                    </h3>
                                </div>
                                <div class="meal-ratings" id="mealRatingsContainer">
                                    <!-- Dynamically populated -->
                                </div>
                            </div>

                        </div>

                        <!-- Recent Feedback - Full Width Card -->
                        <div class="feedback-section">
                            <div class="feedback-header">
                                <h3>
                                    <img src="../images/feedback-icon.png" alt="Recent Feedback" class="feedback-header-icon" />
                                    Recent Feedback
                                </h3>
                                <span class="badge-count" id="feedbackCount">0 entries</span>
                            </div>
                            <div class="feedback-list" id="feedbackList">
                                <!-- Dynamically populated -->
                            </div>
                            <!-- Pagination Controls -->
                            <div id="paginationControls" class="pagination-container"></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="cancel-modal-overlay" id="deleteModalOverlay"></div>
        <div class="cancel-modal" id="deleteModal">
            <div class="cancel-modal-content">
                <div class="cancel-modal-header">
                    <h3 id="deleteModalTitle">Remove Today's Selected Menu?</h3>
                </div>
                <div class="cancel-modal-body">
                    <p>Are you sure you want to remove "<span id="deleteUserName" class="user-name-highlight"></span>" from today's selected menu?</p>
                </div>
                <div class="cancel-modal-footer">
                    <button type="button" class="btn btn-secondary" id="btnKeepUser">Cancel</button>
                    <button type="button" class="btn btn-danger" id="btnYesDelete">Yes, remove menu</button>
                </div>
            </div>
        </div>

        <!-- Toast Notification -->
        <div class="dash-toast-notification" id="dashToastNotification">
            <i class="fas fa-check-circle"></i>
            <span id="dashToastMessage"></span>
        </div>

        <script src="../js/style.js"></script>

    </form>
</body>
</html>
