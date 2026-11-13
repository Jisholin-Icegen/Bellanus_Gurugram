<%@ Page Language="C#" AutoEventWireup="true" CodeFile="LiveOrders.aspx.cs" Inherits="FoodDashboard_LiveOrders" %>

<html lang="en">
<head>
    <title>Live Orders | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="../favicon.png" />
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" type="text/css" href="../css/LiveOrders.css" />
    <link href="../css/changepwd.css" rel="stylesheet" />

    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="../js/jquery.sumoselect.min.js"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/LiveOrders.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>

    <telerik:RadCodeBlock ID="RadCodeBlock" runat="server">
        <script type="text/javascript">
            var hurl = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/FoodDashboard/",
                urlPageValidation = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/MasterPage/Service/Service.aspx?",
                CryptoKey = '<%=ConfigurationManager.AppSettings["CryptoKey"].ToString() %>',
                CryptoPwd = '<%=ConfigurationManager.AppSettings["CryptoIV"].ToString() %>',
                ConProtocol = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>';

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

        <!-- TUTORIAL POPUP -->
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
                                video.play().catch(function (e) { console.log("Autoplay blocked:", e); });
                            }, 50);
                        }
                    });

                    function closeTutorial() {
                        popup.style.display = "none";
                        if (video) { video.pause(); video.currentTime = 0; }
                    }

                    close.addEventListener("click", closeTutorial);
                    popup.addEventListener("click", function (e) { if (e.target === popup) closeTutorial(); });
                    document.addEventListener("keydown", function (e) {
                        if (e.key === "Escape" && popup.style.display === "flex") closeTutorial();
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

                    <!-- SIDEBAR -->
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
                                        <li><a href="../Master/Porter.aspx"><span>
                                            <img src="../images/porter-master.png" alt="Porter Master"></span> Operative Master</a></li>
                                        <li><a href="../Master/Category.aspx"><span>
                                            <img src="../images/category-master.png" alt="Task Types"></span> Task Types</a></li>
                                        <li><a href="../Master/Locations.aspx"><span>
                                            <img src="../images/location.png" alt="Location Master"></span> Location Master</a></li>
                                        <li><a onclick="javascript:Bulk();" href="#"><span>
                                            <img src="../images/upload-task.png" alt="Upload Tasks"></span> Upload Tasks</a></li>
                                        <li><a href="../Master/Group.aspx"><span>
                                            <img src="../images/group-master.png" alt="Group Master"></span> Group Master</a></li>
                                        <li><a href="../Master/Remarks.aspx"><span>
                                            <img src="../images/memo.png" alt="Remarks Master"></span> Remarks Master</a></li>
                                        <li><a href="../Master/Equipment.aspx"><span>
                                            <img src="../images/Equipment.png" alt="Equipment Master"></span> Equipment Master</a></li>
                                        <li><a href="../Master/Department.aspx"><span>
                                            <img src="../images/location.png" alt="Department Master"></span> Department Master</a></li>
                                        <li><a href="../Master/Users.aspx"><span>
                                            <img src="../images/porter-master.png" alt="User Master"></span> User Master</a></li>
                                        <li><a href="../Master/Roles.aspx"><span>
                                            <img src="../images/UserRole.png" alt="Role Master"></span> Role Master</a></li>
                                        <li><a href="../Master/PerformLogs.aspx"><span>
                                            <img src="../images/priority.png" alt="Perform Logs"></span> Perform Logs</a></li>
                                        <li><a href="../RequestFood/FoodRequest.aspx"><span>
                                            <img src="../images/UserRole.png" alt="Food Request"></span> Food Request</a></li>
                                        <li><a href="../Master/Break.aspx"><span>
                                            <img src="../images/Break.png" alt="Breaks"></span> Breaks</a></li>
                                        <li><a href="../FoodDashboard/DietTypeManagement.aspx"><span>
                                            <img src="../images/DIETS.png" alt="Diet Types"></span> Diet Types</a></li>
                                        <li><a href="../FoodDashboard/MenuMaster.aspx"><span>
                                            <img src="../images/MENUS.png" alt="Menu Master"></span> Menu Master</a></li>
                                        <li><a href="../FoodDashboard/PatientDietAssignment.aspx"><span>
                                            <img src="../images/PATIENTS.png" alt="Patient"></span> Patient</a></li>
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
                                            <img src="../images/AuditLog.png" alt="AuditLog"></span> Audit Log</a></li>
                                        <li class="current-menu-item"><a href="../FoodDashboard/LiveOrders.aspx"><span>
                                            <img src="../images/Orders.png" alt="Live Orders"></span> Live Orders</a></li>
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
                                        <li><a href="#" onclick="$('#ModalChangepwd').modal('show'); return false;">Change Password</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT PANEL -->
                    <div class="screen-right-panel dietitian-order-page">

                        <!-- Change Password modal -->
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

                        <!-- Success modal -->
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

                        <!-- TOP USER BAR -->
                        <div class="top-user-bar">
                            <div class="top-user-bar-inner">
                                <div class="top-user-info">
                                    <span class="top-user-name" id="spndepNursname"></span>
                                    <span class="top-user-role" id="spnUserTypeLabel"></span>
                                </div>
                                <div class="top-user-divider"></div>
                                <div class="notification-wrapper">
                                    <div class="notification-bell" id="notificationBell">
                                        <img src="../images/bell-icon.png" alt="Notifications" class="bell-icon">
                                        <span class="notification-badge" id="notificationCount">0</span>
                                    </div>
                                    <div class="notification-dropdown" id="notificationDropdown">
                                        <div class="notification-header">
                                            <h6>Notifications</h6>
                                            <button class="mark-all-read" id="markAllRead">
                                                <img src="../images/check-double-icon.png" alt="Mark all as read" class="check-icon">
                                                Mark all as read
                                            </button>
                                        </div>
                                        <div class="notification-list" id="notificationList">
                                            <div style="text-align: center; padding: 20px; color: #888;">Loading...</div>
                                        </div>
                                    </div>
                                </div>
                                <a href="../login.aspx" title="Logout" class="top-logout">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Logout
                                </a>
                            </div>
                        </div>

                        <!-- HEADER -->
                        <div class="top-bar">
                            <div class="top-bar-left">
                                <h1 style="margin: 0; display: inline-flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                                    <span class="icon-wrapper" style="background: #f1f5f9; padding: 10px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                        <img src="../images/Orders.png" alt="Live Orders" class="dietitian-icon" style="width: 24px;" />
                                    </span>
                                    <span class="heading-text">Live Orders</span>
                                    <button type="button" id="watchTutorial"
                                        title="Live Orders Info"
                                        onmouseover="this.style.background='rgba(255,255,255,.25)';"
                                        onmouseout="this.style.background='rgba(255,255,255,.15)';"
                                        style="background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.3); border-radius: 20px; height: 30px; padding: 0 11px 0 8px; display: inline-flex; align-items: center; gap: 6px; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; transition: .2s;">
                                        <svg viewBox="0 0 24 24" fill="none" style="width: 16px; height: 16px; flex-shrink: 0;">
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" />
                                            <path d="M12 10.5V16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                                            <circle cx="12" cy="7.5" r="1.4" fill="currentColor" />
                                        </svg>
                                        <span>Info</span>
                                    </button>
                                </h1>
                                <p style="margin-top: 8px; font-size: 14px; color: #0f172a; font-weight: 500;">
                                    <i class="fas fa-info-circle" style="color: #0f172a; margin-right: 6px; font-size: 12px;"></i>
                                    Live Orders - Manage all live meal orders.
                                    <span id="orderCount" style="margin-left: 8px; font-weight: 700; color: #0f172a; background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-size: 13px;">0 orders today</span>
                                </p>
                            </div>
                            <div class="top-bar-right">
                                <button type="button" class="btn-refresh" id="btnRefresh" title="Refresh">
                                    <img src="../images/refresh-icon.png" alt="Refresh" class="refresh-icon" />
                                    <span style="font-weight: 600;">Refresh</span>
                                </button>
                            </div>
                        </div>

                        <!-- ORDER LIST CONTENT -->
                        <div class="tab-content active" id="tab-order" style="display: block;">

                            <div class="diet-header-actions">
                                <button type="button" class="btn-admit" onclick="openDietitianOrder()">
                                    <i class="fas fa-plus"></i>Take Order
                                </button>
                            </div>

                            <div class="overview-cards" id="overviewCards"></div>

                            <div class="recent-orders-wrap">
                                <table class="session-table">
                                    <thead id="ordersTableHead"></thead>
                                    <tbody id="tblConfirmedOrders"></tbody>
                                </table>
                                <div class="empty-orders-message" id="emptyOrdersMessage"></div>
                                <div class="pagination-wrapper" id="ordersPaginationWrapper">
                                    <div class="pagination-info" id="ordersPaginationInfo"></div>
                                    <div class="pagination-container" id="ordersPagination"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <!-- DENY FOOD MODAL -->
        <div class="modal fade" id="denyFoodModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content" style="border-radius: 20px; border: none; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">

                    <!-- Header -->
                    <div class="modal-header" style="border-bottom: none; padding: 20px 25px 10px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <!-- Red Ban Icon -->
                            <div style="width: 45px; height: 45px; background: #ef4444; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                </svg>
                            </div>
                            <div>
                                <h5 class="modal-title" style="font-weight: 800; color: #0f172a; font-size: 18px; margin: 0;">Deny Food Item</h5>
                                <p style="margin: 0; font-size: 13px; color: #64748b;">Provide a reason for denial</p>
                            </div>
                        </div>
                        <!-- Close Button -->
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                            style="color: #ffffff; opacity: 1; margin-top: -10px; font-size: 24px; font-weight: 300; text-shadow: none;">
                            &times;
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="modal-body" style="padding: 20px 25px;">
                        <input type="hidden" id="hdnDenyRowId" />

                        <div class="mb-4">
                            <label class="form-label" style="font-weight: 700; color: #1e293b; font-size: 13px;">Item to Deny</label>
                            <input type="text" class="form-control" id="txtDenyItemName" readonly
                                style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 15px; border-radius: 10px; font-weight: 600; color: #0f172a;" />
                        </div>

                        <div class="mb-3">
                            <label class="form-label" style="font-weight: 700; color: #1e293b; font-size: 13px;">Reason for Denial <span style="color: #ef4444;">*</span></label>
                            <textarea class="form-control" id="txtDenyReason" rows="3"
                                placeholder="e.g., Out of stock, Allergy risk..."
                                style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 15px; border-radius: 10px; color: #0f172a;"></textarea>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="modal-footer" style="border-top: none; padding: 15px 25px 25px; background: transparent;">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                            style="background: #f1f5f9; color: #475569; font-weight: 700; border: none; padding: 10px 20px; border-radius: 10px;">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-danger" id="btnSubmitDeny" onclick="SubmitDenyFood()"
                            style="background: #ef4444; color: #fff; font-weight: 700; border: none; padding: 10px 20px; border-radius: 10px;">
                            Confirm Denial
                        </button>
                    </div>

                </div>
            </div>
        </div>

        <!-- TAKE ORDER MODAL -->
        <div class="dietitian-order-overlay" id="dietitianOrderOverlay">
            <div class="dietitian-modal">
                <button type="button" class="dietitian-close" onclick="closeDietitianOrder()">&times;</button>

                <div class="order-modal-header">
                    <div class="order-modal-header-left">
                        <h3 class="dietitian-title" id="orderModalTitle"></h3>
                        <div class="dietitian-subtitle" id="orderModalSubtitle"></div>
                    </div>
                    <div class="order-modal-header-right">
                        <div class="order-pills" id="orderPills">
                            <span class="pill-patient hidden" id="pillPatient"></span>
                            <div class="pill-row hidden" id="pillRow">
                                <span class="pill-diet hidden" id="pillDiet"></span>
                                <span class="pill-allergy hidden" id="pillAllergy"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dietitian-form-row">
                    <div class="dietitian-field">
                        <label id="labelWardSelect"></label>
                        <div class="dietitian-select" id="dietWardSelect">
                            <button type="button" class="dietitian-select-trigger">
                                <span class="dietitian-select-value placeholder">-- Select Ward --</span>
                                <span class="arrow">&#9660;</span>
                            </button>
                            <div class="dietitian-select-menu" id="dietWardMenu"></div>
                        </div>
                    </div>
                    <div class="dietitian-field">
                        <label id="labelRoomSelect"></label>
                        <div class="dietitian-select" id="dietRoomSelect">
                            <button type="button" class="dietitian-select-trigger">
                                <span class="dietitian-select-value placeholder">-- Select Room --</span>
                                <span class="arrow">&#9660;</span>
                            </button>
                            <div class="dietitian-select-menu" id="dietRoomMenu"></div>
                        </div>
                    </div>
                </div>

                <div class="dietitian-tabs" id="dietServingTabs"></div>

                <div class="d-flex align-items-center justify-content-end mt-3 mb-2" style="gap: 10px;">
                    <span style="font-size: 13px; font-weight: 600; color: #475569;">Order Type:</span>
                    <label class="custom-switch">
                        <input type="checkbox" id="chkIsPreorder">
                        <span class="custom-slider"></span>
                    </label>
                    <label for="chkIsPreorder" style="font-size: 13px; font-weight: 700; color: #0f172a; cursor: pointer; margin: 0;">
                        Pre-order
                    </label>
                </div>

                <div class="dietitian-items-label" id="dietItemsLabel"></div>
                <div class="dietitian-items-grid" id="dietItemsList"></div>

                <div class="dietitian-hint" id="dietitianHint"></div>

                <div class="dietitian-footer">
                    <button type="button" class="btn-cancel-diet" id="btnCancelOrder" onclick="closeDietitianOrder()"></button>
                    <button type="button" class="dietitian-confirm-btn" id="btnConfirmDietServing" onclick="confirmDietServing()">
                        <span id="dietConfirmLabel"></span>
                    </button>
                </div>
            </div>
        </div>

        <!-- DELETE MODAL -->
        <div class="cancel-modal-overlay" id="deleteModalOverlay"></div>
        <div class="cancel-modal" id="deleteModalnew">
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

        <div class="dash-toast-notification" id="dashToastNotification">
            <i class="fas fa-check-circle"></i>
            <span id="dashToastMessage"></span>
            <button class="toast-close" onclick="HideDashToast();">&times;</button>
        </div>

        <script src="../js/style.js"></script>
    </form>
</body>
</html>
