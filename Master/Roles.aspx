<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Roles.aspx.cs" Inherits="Master_Roles" %>

<html lang="en">
<head>
    <title>Role Management | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="../favicon.png" />
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" type="text/css" href="../css/RoleManagement.css" />
    <link href="../css/changepwd.css" rel="stylesheet" />
    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="../js/jquery.sumoselect.min.js"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/RoleManagement.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>

    <telerik:RadCodeBlock ID="RadCodeBlock" runat="server">
        <script type="text/javascript">
            var dataSet = [], hurl = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/Master/",
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
                            style="width: 42px; height: 42px; min-width: 42px; min-height: 42px; border: none; border-radius: 50%; background: #EEF3F8; color: #6B7280; font-size: 20px; font-weight: 700; cursor: pointer; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; font-family: Arial, sans-serif;">&#10005;</button>
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
                                        <li class="current-menu-item"><a href="../Master/Roles.aspx"><span>
                                            <img src="../images/UserRole.png" alt="Role Master"></span> Role Master</a></li>
                                        <li><a href="../Master/Locations.aspx"><span>
                                            <img src="../images/location.png" alt="Location Master"></span> Location Master</a></li>
                                        <li><a href="../Master/Department.aspx"><span>
                                            <img src="../images/location.png" alt="Department Master"></span> Department Master</a></li>
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
                                        <li><a href="../FoodDashboard/PatientSatisfaction.aspx"><span>
                                            <img src="../images/PatientSatisfaction.png" alt="PatientSatisfaction"></span> Patient Satisfaction</a></li>
                                        <li><a href="../FoodDashboard/KitchenOrderReport.aspx"><span>
                                            <img src="../images/KitchenOrderReport.png" alt="OrderReport"></span> Order Report</a></li>
                                        <li><a href="../FoodDashboard/DischargeFeedback.aspx"><span>
                                            <img src="../images/DischargeFeedback.png" alt="Discharge Feedback"></span> Discharge Feedback</a></li>
                                        <li><a href="../FoodDashboard/ServingMaster.aspx"><span>
                                            <img src="../images/ServingMaster.png" alt="Serving Master"></span> Serving Master</a></li>
                                        <li><a href="../FoodDashboard/AuditLog.aspx"><span>
                                            <img src="../images/AuditLog.png" alt="Audit Log"></span> Audit Log</a></li>
 
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

                    <!-- Right Panel -->
                    <div class="screen-right-panel role-management-page">

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

                        <div class="top-bar" style="margin-top: 45px;">
                            <div class="top-bar-left">
                                <h1>
                                    <span class="icon-wrapper">
                                        <img src="../images/roles-icon.png" alt="Role Management" class="role-management-icon" />
                                    </span>
                                    <span class="heading-text">Role Management</span>
                                     <div style="display: flex; justify-content: flex-start; padding: 4px 0 10px 2px;">
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

                                </h1>

                                <p>
                                    <i class="fas fa-info-circle" style="color: #9ca3af; margin-right: 6px; font-size: 12px;"></i>
                                    Create and manage system roles. Assign page permissions and access levels.
                                </p>
                            </div>
                            <div class="top-bar-right">
                                <button class="btn-create-role" id="btnCreateRole">
                                    <img src="../images/add-user.png" alt="Create Role" class="generate-icon" />
                                    Create Role
                                </button>

                                <button type="button" class="btn-refresh" id="btnRefresh" title="Refresh">
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

                        <div class="search-bar">
                            <div class="search-input-wrapper">
                                <img src="../images/search-icon.png" alt="Search" class="search-icon" />
                                <input type="text" id="txtSearchRole" autocomplete="off" placeholder="Search by role name..." />
                            </div>
                            <div class="filter-actions">
                                <div class="filter-select-wrapper">
                                    <select id="ddlStatusFilter" class="filter-select">
                                        <option value="">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    <img src="../images/dropdown-arrow.png" alt="▼" class="dropdown-icon" />
                                </div>
                            </div>
                        </div>

                        <div class="roles-table-wrapper">
                            <table class="roles-table">
                                <thead>
                                    <tr>
                                        <th>Role Name</th>
                                        <th>Permissions</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="tblRolesBody">
                                    <tr>
                                        <td colspan="4" style="text-align: center; padding: 30px; color: #888;">
                                            <i class="fas fa-spinner fa-spin"></i>Loading roles...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="cancel-modal-overlay" id="deleteModalOverlay"></div>
        <div class="cancel-modal" id="deleteModal">
            <div class="cancel-modal-content">
                <div class="cancel-modal-header">
                    <h3 id="deleteModalTitle">Delete Role?</h3>
                </div>
                <div class="cancel-modal-body">
                    <p>Are you sure you want to delete role "<span id="deleteRoleName" class="role-name-highlight"></span>"?</p>
                    <p style="font-size: 13px; color: #9ca3af; margin-top: 8px;">This action cannot be undone.</p>
                </div>
                <div class="cancel-modal-footer">
                    <button type="button" class="btn btn-secondary" id="btnKeepRole">Cancel</button>
                    <button type="button" class="btn btn-danger" id="btnYesDelete">Yes, delete role</button>
                </div>
            </div>
        </div>

        <div class="modal-overlay" id="createRoleModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <img src="../images/roles-icon.png" alt="Create Role" class="modal-icon" id="modalIcon" />
                        <span id="modalTitleText">Create Role</span>
                    </h2>
                    <button class="modal-close-btn" id="closeRoleModalBtn">&times;</button>
                </div>

                <div class="modal-body">
                    <form id="createRoleForm" onsubmit="return false;" novalidate>
                        <div class="form-group">
                            <label class="form-label">ROLE NAME</label>
                            <div class="input-wrapper">
                                <i class="fas fa-user-tag input-icon"></i>
                                <input type="text" class="form-input" id="roleName" placeholder="e.g. Kitchen Manager" autocomplete="off">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">PAGE PERMISSIONS</label>
                            <div class="permissions-grid" id="permissionsGrid">
                            </div>
                        </div>

                        <div class="form-group active-toggle-group">
                            <div class="active-box">
                                <div>
                                    <div class="active-title">Active</div>
                                    <div class="active-desc">Inactive roles are hidden from management screens by default.</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="chkActive" checked />
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>

                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-cancel" id="cancelRoleBtn">Cancel</button>
                    <button type="button" class="btn-create" id="createRoleBtn">
                        <i class="fas fa-plus-circle"></i>
                        <span id="createBtnText">Create Role</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="dash-toast-notification" id="dashToastNotification">
            <i class="fas fa-check-circle"></i>
            <span id="dashToastMessage">Role created successfully!</span>
            <button class="toast-close" onclick="HideDashToast();">&times;</button>
        </div>

        <script src="../js/style.js"></script>

    </form>
</body>
</html>
