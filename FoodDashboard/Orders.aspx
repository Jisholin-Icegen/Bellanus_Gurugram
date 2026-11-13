<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Orders.aspx.cs" Inherits="FoodDashboard_MenuMaster" %>

<html lang="en">
<head>
    <title>Orders Management | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="../favicon.png" />
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" type="text/css" href="../css/Orders.css" />
    <link href="../css/changepwd.css" rel="stylesheet" />
    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="../js/jquery.sumoselect.min.js"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/xlsx.full.min.js" type="text/javascript"></script>
    <script src="../js/exceljs.min.js"></script>
    <script src="../js/Orders.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>

    <telerik:RadCodeBlock ID="RadCodeBlock" runat="server">
        <script type="text/javascript">
            var hurl = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + '/FoodDashboard/';
            divServiceArray = ['divPorteringService', 'divCateringService', 'divCleaningService', 'divFeedbackService', 'divSecurityService'],
                urlPageValidation = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/MasterPage/Service/Service.aspx?",
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

    <style type="text/css">
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px white inset !important;
            -webkit-text-fill-color: #333 !important;
            background-color: white !important;
            background-clip: content-box !important;
        }

        input#txtSearchOrd:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 1000px #f8f9fa inset !important;
        }

        input.txtpwd:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 1000px white inset !important;
        }

        .excel-dropdown-wrapper {
            position: relative;
            display: inline-block;
        }

        .btn-import-excel {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #ffffff;
            color: #0d9488;
            border: 1.5px solid #0d9488;
            border-radius: 12px;
            height: 44px;
            padding: 0 20px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

            .btn-import-excel:hover {
                background: #f0fdfa;
                color: #0f766e;
                border-color: #0f766e;
            }

            .btn-import-excel svg {
                stroke-width: 2.5;
            }

            .btn-import-excel:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

        .excel-dropdown-menu {
            display: none;
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background: #ffffff;
            min-width: 220px;
            border-radius: 16px;
            box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
            border: 1px solid #f1f5f9;
            z-index: 1050;
            padding: 8px;
            overflow: hidden;
        }

            .excel-dropdown-menu.show {
                display: block;
                animation: excelFadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }

        .excel-dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            color: #334155;
            font-size: 15px;
            font-weight: 500;
            text-decoration: none;
            cursor: pointer;
            border-radius: 10px;
            transition: all 0.15s ease;
            background: transparent;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

            .excel-dropdown-item:hover {
                background: #f8fafc;
                color: #0d9488;
            }

            .excel-dropdown-item svg,
            .excel-dropdown-item i {
                width: 20px;
                height: 20px;
                color: #0d9488;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

        @keyframes excelFadeInDown {
            from {
                opacity: 0;
                transform: translateY(-8px) scale(0.98);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        @media (max-width: 768px) {
            .excel-dropdown-wrapper {
                margin-right: 0;
                margin-bottom: 8px;
                width: 100%;
            }

            .btn-import-excel {
                width: 100%;
                justify-content: center;
            }

            .excel-dropdown-menu {
                right: auto;
                left: 0;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <form id="form1" runat="server" autocomplete="off">

        <div style="position: absolute; left: -9999px; width: 0; height: 0; overflow: hidden;">
            <input type="text" name="fakeusername" autocomplete="username" />
            <input type="password" name="fakepassword" autocomplete="current-password" />
        </div>

        <telerik:RadScriptManager ID="RadScriptManager" runat="server"></telerik:RadScriptManager>

        <asp:HiddenField ID="hdnOrderId" runat="server" ClientIDMode="Static" Value="" />
        <asp:HiddenField ID="HFDWExportHeader" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="HFDWSearchQuery" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="hfUserId" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="hfUserRole" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="hfUserName" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="hfRefreshInterval" runat="server" ClientIDMode="Static" Value="10000" />

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
                        if (video) { video.pause(); video.currentTime = 0; }
                    }
                    close.addEventListener("click", closeTutorial);
                    popup.addEventListener("click", function (e) {
                        if (e.target === popup) closeTutorial();
                    });
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
                                        <li class="current-menu-item"><a href="../FoodDashboard/Orders.aspx"><span>
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

                    <div class="screen-right-panel daily-orders-page">

                        <div style="position: absolute; top: 12px; right: 30px; z-index: 1000;">
                            <div style="background: white; padding: 6px 16px 6px 18px; border-radius: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 12px;">
                                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                    <span style="font-weight: 700; color: #0f172a; font-size: 14px;" id="spndepNursname">System Administrator</span>
                                    <span style="font-weight: 500; color: #6b7280; font-size: 11px;" id="spnUserTypeLabel">Super Admin</span>
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

                        <div class="top-bar" style="margin-top: 45px;">
                            <div class="top-bar-left">
                                <h1 style="margin: 0; display: inline-flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                                    <span>Daily Meal Orders</span>
                                    <button type="button" id="watchTutorial"
                                        title="Diet Type Management Info"
                                        onmouseover="this.style.background='rgba(100,116,139,.18)';"
                                        onmouseout="this.style.background='rgba(100,116,139,.10)';"
                                        style="background: rgba(100,116,139,.10); border: 1px solid rgba(100,116,139,.18); border-radius: 20px; height: 30px; padding: 0 11px 0 8px; display: inline-flex; align-items: center; gap: 6px; color: #64748b; font-size: 12px; font-weight: 600; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; cursor: pointer; transition: .2s;">
                                        <svg viewBox="0 0 24 24" fill="none" style="width: 16px; height: 16px; flex-shrink: 0;">
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" />
                                            <path d="M12 10.5V16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                                            <circle cx="12" cy="7.5" r="1.4" fill="currentColor" />
                                        </svg>
                                        <span>Info</span>
                                    </button>
                                </h1>
                                <p style="margin: 4px 0 0 0;">
                                    Live view of all meal orders.
                                    Showing <span id="lblOrderCount">0</span> of <span id="lblTotalOrdersCount">0</span> orders
                                    · auto-refresh every <span id="lblRefreshInterval">60</span>s
                                </p>
                            </div>
                            <div class="top-bar-right">

                                <div class="excel-dropdown-wrapper">
                                    <button type="button" class="btn-import-excel" onclick="toggleExcelDropdown(event)">
                                        <svg viewBox="0 0 24 24" fill="none" style="width: 16px; height: 16px;">
                                            <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                                        </svg>
                                        Import Excel
                                        <svg viewBox="0 0 24 24" fill="none" style="width: 14px; height: 14px; margin-left: 4px;">
                                            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                        </svg>
                                    </button>

                                    <input type="file" id="fileExcelImport" accept=".xlsx,.xls,.csv" style="display: none" onchange="handleExcelImport(event)" />

                                    <div class="excel-dropdown-menu" id="excelDropdownMenu">
                                        <a class="excel-dropdown-item" onclick="downloadImportTemplate()">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                            Download Template
                                        </a>
                                        <a class="excel-dropdown-item" onclick="triggerExcelImport()">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                            </svg>
                                            Import Excel File
                                        </a>
                                    </div>
                                </div>
                                <button type="button" class="btn-bulk-order" id="btnTakeBulkOrder" onclick="openBulkOrderModal()">
                                    Take Bulk Order
                                </button>
                                <button class="btn-generate" id="btnGenerateOrders">
                                    <img src="../images/generate-icon.png" alt="Generate" class="generate-icon" />
                                    Generate auto-default orders
                                </button>

                                <button class="btn-refresh" id="btnRefresh" title="Refresh">
                                    <img src="../images/refresh-icon.png" alt="Refresh" class="refresh-icon" />
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

                        <div class="modal fade" id="ModalChangepwd" tabindex="-1" aria-labelledby="reportsModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h6 class="modal-title"><span id="canReqIDpwd"></span>&nbsp;&nbsp;CHANGE PASSWORD</h6>
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
                                                                    TextMode="Password" autocomplete="off"></asp:TextBox>
                                                                <asp:Label ID="ErCurrent" runat="server" Text="*" ForeColor="Red" Font-Size="Medium" ClientIDMode="Static" CssClass="Custfont" Style="visibility: hidden"></asp:Label>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>New Password</td>
                                                            <td align="center">
                                                                <asp:TextBox ID="TxtPassword" runat="server" Width="180px" class="txtpwd" ClientIDMode="Static"
                                                                    Style="border: 1px solid #ded6d6 !important; margin-bottom: 0px !important; padding-left: 5px"
                                                                    TextMode="Password" autocomplete="off"></asp:TextBox>
                                                                <asp:Label ID="ErPassword" runat="server" Text="*" ForeColor="Red" Font-Size="Medium" ClientIDMode="Static" CssClass="Custfont" Style="visibility: hidden"></asp:Label>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Confirm Password</td>
                                                            <td align="center">
                                                                <asp:TextBox ID="TxtConfirmPassword" runat="server" Width="180px" class="txtpwd" ClientIDMode="Static"
                                                                    Style="border: 1px solid #ded6d6 !important; margin-bottom: 0px !important; padding-left: 5px"
                                                                    TextMode="Password" autocomplete="off"></asp:TextBox>
                                                                <asp:Label ID="ErCPassword" runat="server" Text="*" ForeColor="Red" Font-Size="Medium" ClientIDMode="Static" CssClass="Custfont" Style="visibility: hidden"></asp:Label>
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
                                                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="background: #6c757d; border-color: #6c757d;">Cancel</button>
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

                        <div class="modal fade" id="modalExcelImportDone" tabindex="-1" aria-hidden="true" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1055;">
                            <div class="modal-dialog modal-dialog-centered" style="margin: 0 auto; max-width: 380px; height: auto !important;">

                                <div class="modal-content" style="width: 100%; height: auto !important; min-height: auto !important; border-radius: 12px; border: none; box-shadow: 0 15px 40px rgba(0,0,0,0.2); overflow: hidden;">

                                    <div class="modal-header" style="border-bottom: 1px solid #f0f0f0; padding: 14px 20px;">
                                        <h5 class="modal-title" style="font-weight: 700; color: #1a2b44; font-size: 16px; margin: 0;">Import Result</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                                            style="background-color: #8c98a4; border-radius: 50%; width: 26px; height: 26px; opacity: 1; display: flex; align-items: center; justify-content: center; padding: 0; margin: 0; transition: background 0.2s;"
                                            onmouseover="this.style.backgroundColor='#6c757d'"
                                            onmouseout="this.style.backgroundColor='#8c98a4'">
                                            <img src="../images/close-white.svg" style="width: 10px; height: 10px; filter: brightness(0) invert(1);">
                                        </button>
                                    </div>

                                    <div class="modal-body" style="padding: 30px 20px !important; height: auto !important; min-height: auto !important; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                        <img src="../images/icon-success.gif" alt="Icon Success" style="width: 55px; height: 55px; object-fit: contain; margin-bottom: 15px;">
                                        <span id="LBLRequestResult" style="font-size: 14px; color: #4b5563; font-weight: 500; text-align: center; line-height: 1.4;"></span>
                                    </div>

                                </div>
                            </div>
                        </div>


                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <img src="../images/orders-icon.png" alt="Orders" class="stat-icon-img" />
                                </div>
                                <div class="stat-content">
                                    <div class="stat-label">TODAY'S ORDERS</div>
                                    <div class="stat-number" id="lblTotalOrders">0</div>
                                    <div class="stat-sub" id="lblDelivered">0 delivered</div>
                                </div>
                            </div>
                            <div class="stat-card stat-pending">
                                <div class="stat-icon">
                                    <img src="../images/pending-icon.png" alt="Pending" class="stat-icon-img" />
                                </div>
                                <div class="stat-content">
                                    <div class="stat-label">PENDING REVIEW</div>
                                    <div class="stat-number" id="lblPendingReview">0</div>
                                    <div class="stat-sub">Awaiting kitchen confirm</div>
                                </div>
                            </div>
                            <div class="stat-card stat-kitchen">
                                <div class="stat-icon">
                                    <img src="../images/kitchen-icon.png" alt="Kitchen" class="stat-icon-img" />
                                </div>
                                <div class="stat-content">
                                    <div class="stat-label">IN KITCHEN</div>
                                    <div class="stat-number" id="lblInKitchen">0</div>
                                    <div class="stat-sub"><span id="lblPreparing">0</span> preparing · <span id="lblReady">0</span> ready</div>
                                </div>
                            </div>
                            <div class="stat-card stat-delivery">
                                <div class="stat-icon">
                                    <img src="../images/delivery-icon.png" alt="Delivery" class="stat-icon-img" />
                                </div>
                                <div class="stat-content">
                                    <div class="stat-label" id="lblFourthStatLabel">OUT FOR DELIVERY</div>
                                    <div class="stat-number" id="lblOutForDelivery">0</div>
                                    <div class="stat-sub" id="lblFourthStatSub">On the way</div>
                                </div>
                            </div>
                        </div>

                        <div class="meal-sessions" id="mealSessionsContainer">
                            <span class="session-label">MEAL SESSIONS:</span>
                            <span id="mealSessionsList"></span>
                        </div>

                        <div class="filters-bar">
                            <div class="search-box">
                                <img src="../images/search-normal.png" class="search-icon" alt="Search" />
                                <input type="search" id="txtSearchOrd" name="search_query" autocomplete="off webauthn" placeholder="Search by patient, room, or order id..." />
                            </div>
                            <div class="filter-item date-picker-wrapper">
                                <input type="date" id="filterDate" class="filter-date-input" />
                            </div>
                            <select id="ddlMealType" class="filter-select">
                                <option value="">All meals</option>
                            </select>
                            <select id="ddlWard" class="filter-select">
                                <option value="">All wards</option>
                            </select>
                            <select id="ddlKitchen" class="filter-select">
                                <option value="">All kitchens</option>
                            </select>
                        </div>

                        <div class="status-filter-wrapper">
                            <span class="status-filter-label">STATUS</span>
                            <div class="status-filter-chips" id="statusChips">
                                <span class="status-chip active" data-status="all">All</span>
                                <span class="status-chip" data-status="Placed">Placed</span>
                                <span class="status-chip" data-status="Confirmed">Confirmed</span>
                                <span class="status-chip" data-status="Preparing">Preparing</span>
                                <span class="status-chip" data-status="Ready">Ready</span>
                                <span class="status-chip" data-status="Assembling">Assembling</span>
                                <span class="status-chip" data-status="Ready for Pickup">Ready for Pickup</span>
                                <span class="status-chip" data-status="In-Transit">In Transit</span>
                                <span class="status-chip" data-status="Delivered">Delivered</span>
                                <span class="status-chip" data-status="Cancelled">Cancelled</span>
                                <span class="status-chip status-clear" data-status="clear">✕ Clear</span>
                            </div>
                        </div>

                        <div class="orders-table-wrapper">
                            <table class="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Room</th>
                                        <th>Ward</th>
                                        <th>Meal</th>
                                        <th>Items</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="tblOrdersBody">
                                    <tr>
                                        <td colspan="8" style="text-align: center; padding: 30px; color: #888;">Loading orders...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="overlay" id="overlay"></div>

        <aside class="order-drawer" id="orderDrawer" aria-hidden="true">
            <div class="drawer-top">
                <button type="button" class="drawer-close" id="btnCloseDrawer">&times;</button>
                <div class="drawer-title">
                    <span id="drawerOrderId">#</span>
                    <span class="status-badge ready"><span class="dot"></span>Ready</span>
                </div>
                <div class="drawer-meta">Placed <span id="drawerAgo">-</span> · <span id="drawerDate">-</span>, <span id="drawerTime">-</span></div>
                <span class="small-meal">
                    <span class="meal-badge" id="drawerMeal">
                        <img src="../images/orders-icon.png" alt="Meal" class="meal-icon" id="mealIcon" />
                        <span id="drawerMealText">-</span>
                    </span>
                    <span class="order-type-badge" id="drawerOrderTypeBadge">Visitor</span>
                </span>
            </div>
            <div class="drawer-body">
                <div class="section-title">Patient</div>
                <div class="patient-card">
                    <strong id="drawerPatient">-</strong>
                    <span class="room-label">Room <strong id="drawerRoom">-</strong></span>
                </div>
                <div class="section-title">Items · <span id="drawerItemCount">0</span></div>
                <div class="drawer-items" id="drawerItems"></div>
                <div class="allergy-container" style="margin-top: 12px;">
                    <div class="section-title">Patient Allergies</div>
                    <div id="allergyList" class="allergy-list"></div>
                </div>
                <div class="instruction-box">
                    <h4>Special Instructions</h4>
                    <div id="drawerInstructions">No special instructions</div>
                </div>
                <div class="section-title">Dietary Restrictions</div>
                <div id="drawerRestrictions">None</div>
                <div class="section-title">Status Timeline</div>
                <div class="timeline" id="drawerTimeline"></div>
                <div id="estimateContainer" style="display: none;">
                    <div class="section-title" style="margin-top: 16px;">Estimated Prep Time (minutes)</div>
                    <div class="estimate-box">
                        <div class="estimate-display">
                            <input type="number" id="estimateInput" class="estimate-input" min="1" max="120" value="15" />
                            <span class="estimate-label">minutes</span>
                        </div>
                        <p class="estimate-note">Used to compute the patient's ETA.</p>
                    </div>
                </div>
            </div>
            <div class="drawer-actions">
                <button type="button" class="btn btn-danger" id="btnCancelOrder">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                    </svg>
                    Cancel order
                </button>
                <button type="button" class="btn btn-success" id="btnConfirmOrder">Confirm order</button>
                <button type="button" class="btn-close-action" id="btnCloseOrderDrawer" style="display: none;">Close</button>
            </div>
        </aside>

        <div class="cancel-modal-overlay" id="cancelModalOverlay"></div>
        <div class="cancel-modal" id="cancelModal">
            <div class="cancel-modal-content">
                <div class="cancel-modal-header">
                    <h3>Cancel this order?</h3>
                </div>
                <div class="cancel-modal-body">
                    <p>The order will be marked as cancelled. The patient will see it as cancelled too. This cannot be undone.</p>
                </div>
                <div class="cancel-modal-footer">
                    <button type="button" class="btn btn-secondary" id="btnKeepOrder">Keep order</button>
                    <button type="button" class="btn btn-danger" id="btnYesCancel">Yes, cancel order</button>
                </div>
            </div>
        </div>

        <section class="modal" id="generateModal" aria-hidden="true">
            <div class="modal-head">
                <div class="modal-title">
                    <img src="../images/generate-icon.png" alt="Generate" class="modal-icon" />
                    Generate auto-default orders
                </div>
                <button type="button" class="modal-close" id="btnCloseGenerate">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-copy">Generates a default meal order for every active patient who has a prescribed diet and is not on NPO. Patients can override their order from the kiosk before the cutoff.</div>
                <div class="modal-grid">
                    <div>
                        <span class="field-label">DATE</span>
                        <div class="field date-field" id="dateFieldWrapper">
                            <input type="date" id="genDate" class="gen-date-input" />
                            <svg class="calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <span class="field-label">MEAL TIMING</span>
                        <select id="genMealTiming">
                            <option value="">Loading...</option>
                        </select>
                    </div>
                </div>
                <div class="preview-box" id="previewBox">
                    <div class="preview-title" id="previewTitle">Preview</div>
                    <div id="previewPatients" class="preview-patients-container"></div>
                    <div id="previewSkipped" class="preview-skipped-container"></div>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-cancel" id="btnCancelGenerate">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnConfirmGenerate">
                    <img src="../images/generate-icon.png" alt="Confirm" class="btn-icon" />
                    Confirm
                </button>
            </div>
        </section>

        <div class="dash-toast-notification" id="dashToastNotification">
            <i class="fas fa-check-circle"></i>
            <span id="dashToastMessage"></span>
        </div>

        <script src="../js/style.js"></script>

        <script type="text/javascript">
            $(document).ready(function () {
                $('#txtSearchOrd').val('');
                $('#ModalChangepwd').on('show.bs.modal', function () {
                    setTimeout(function () {
                        $('#TxtCurPassword').val('');
                        $('#TxtPassword').val('');
                        $('#TxtConfirmPassword').val('');
                        $('#ErCurrent, #ErPassword, #ErCPassword').css('visibility', 'hidden');
                        $('#message p').removeClass('valid').addClass('invalid');
                    }, 50);
                });
                $('#ModalChangepwd').on('hidden.bs.modal', function () {
                    $('#TxtCurPassword').val('');
                    $('#TxtPassword').val('');
                    $('#TxtConfirmPassword').val('');
                    $('#ErCurrent, #ErPassword, #ErCPassword').css('visibility', 'hidden');
                    $('#message p').removeClass('valid').addClass('invalid');
                });
                $('#txtSearchOrd').on('focus click', function () {
                    var loginName = sessionStorage.getItem('NAME') || 'System Administrator';
                    if ($(this).val() === loginName || $(this).val() === 'System Administrator') {
                        $(this).val('');
                    }
                });
            });

            var EXCEL_COLUMN_MAP = {
                'ROOMNUMBER': 'room',
                'MEALTYPE': 'mealType',
                'ITEMNAME': 'itemName',
                'QUANTITY': 'quantity',
                'SPECIALINSTRUCTIONS': 'specialInstructions',
                'PREORDER': 'preOrder',
                'DEFAULTORDER': 'defaultOrder'
            };

            function toggleExcelDropdown(e) {
                e.stopPropagation();
                var menu = document.getElementById('excelDropdownMenu');
                if (menu) menu.classList.toggle('show');
            }

            document.addEventListener('click', function (e) {
                var menu = document.getElementById('excelDropdownMenu');
                if (menu && menu.classList.contains('show')) {
                    if (!e.target.closest('.excel-dropdown-wrapper')) {
                        menu.classList.remove('show');
                    }
                }
            });

            function triggerExcelImport() {
                var menu = document.getElementById('excelDropdownMenu');
                if (menu) menu.classList.remove('show');
                var inp = document.getElementById('fileExcelImport');
                inp.value = '';
                inp.click();
            }

            function handleExcelImport(evt) {
                var file = evt.target.files && evt.target.files[0];
                if (!file) return;

                var ext = (file.name.split('.').pop() || '').toLowerCase();
                if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
                    alert('Please select a valid Excel file (.xlsx, .xls) or .csv');
                    return;
                }

                var btn = document.querySelector('.btn-import-excel');
                if (btn) { btn.disabled = true; btn.dataset.oldText = btn.innerHTML; btn.innerHTML = 'Reading...'; }

                var reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        var data = new Uint8Array(e.target.result);
                        var workbook = XLSX.read(data, { type: 'array', cellDates: true });
                        var sheetName = workbook.SheetNames[0];
                        var sheet = workbook.Sheets[sheetName];
                        var rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
                        if (!rows || !rows.length) {
                            alert('The Excel file appears to be empty.');
                            restoreImportButton(btn);
                            return;
                        }
                        var normalized = [];
                        rows.forEach(function (rawRow) {
                            var out = { _raw: rawRow };
                            var hasValue = false;
                            Object.keys(rawRow).forEach(function (key) {
                                var normKey = String(key).replace(/[^A-Za-z]/g, '').toUpperCase();
                                var mapped = EXCEL_COLUMN_MAP[normKey];
                                if (mapped) {
                                    out[mapped] = String(rawRow[key] == null ? '' : rawRow[key]).trim();
                                    if (out[mapped] !== '') hasValue = true;
                                }
                            });
                            if (hasValue) normalized.push(out);
                        });

                        if (!normalized.length) {
                            alert('No recognisable order rows found. Ensure your file has a header row with columns like ROOMNUMBER, MEALTYPE, ITEMNAME, QUANTITY, PREORDER, DEFAULTORDER.');
                            restoreImportButton(btn);
                            return;
                        }

                        var valid = [], errors = [];
                        normalized.forEach(function (row, idx) {
                            var lineNo = idx + 2;
                            var rowErrors = [];
                            if (!row.room) rowErrors.push('ROOMNUMBER missing');
                            if (!row.mealType) rowErrors.push('MEALTYPE missing');
                            if (!row.itemName) rowErrors.push('ITEMNAME missing');
                            if (row.quantity && isNaN(Number(row.quantity))) rowErrors.push('QUANTITY not numeric');

                            if (rowErrors.length) {
                                errors.push('Row ' + lineNo + ': ' + rowErrors.join(', '));
                            } else {
                                row._line = lineNo;
                                valid.push(row);
                            }
                        });

                        if (errors.length) {
                            var msg = 'The following rows have problems and will be SKIPPED:\n\n' + errors.join('\n') + '\n\n';
                            msg += (valid.length ? valid.length + ' valid row(s) will be imported. Continue?' : 'No valid rows to import.');
                            if (!valid.length || !confirm(msg)) {
                                restoreImportButton(btn);
                                return;
                            }
                        }

                        if (!valid.length) { restoreImportButton(btn); return; }

                        if (!errors.length) {
                            if (!confirm('Found ' + valid.length + ' order row(s). Import now?')) {
                                restoreImportButton(btn);
                                return;
                            }
                        }

                        importOrderRowsSequentially(valid, btn);

                    } catch (err) {
                        console.error('Excel parse error:', err);
                        alert('Failed to read the Excel file: ' + err.message);
                        restoreImportButton(btn);
                    }
                };
                reader.onerror = function () {
                    alert('Failed to read file.');
                    restoreImportButton(btn);
                };
                reader.readAsArrayBuffer(file);
            }

            function restoreImportButton(btn) {
                if (!btn) return;
                btn.disabled = false;
                if (btn.dataset.oldText) btn.innerHTML = btn.dataset.oldText;
            }

            function importOrderRowsSequentially(rows, btn) {
                var total = rows.length;
                var okCount = 0, failCount = 0, failedLines = [];
                var i = 0;

                var loggedInUserId = sessionStorage.getItem('USERID') || sessionStorage.getItem('UserID') || (document.getElementById('hfUserId') ? document.getElementById('hfUserId').value : '');

                function next() {
                    if (i >= total) {
                        restoreImportButton(btn);
                        var msg;
                        if (failCount === 0) {
                            msg = 'Imported <b>' + okCount + '</b> order(s) successfully.';
                        } else if (okCount === 0) {
                            msg = 'Import finished. <b>0</b> inserted, <b>' + failCount + '</b> failed.<br/><small>Failed row(s) at line: ' + failedLines.join(', ') + '</small>';
                        } else {
                            msg = 'Import finished. <b>' + okCount + '</b> inserted, <b>' + failCount + '</b> failed.<br/><small>Failed row(s) at line: ' + failedLines.join(', ') + '</small>';
                        }

                        $('#LBLRequestResult').html(msg);
                        var $modal = $('#modalExcelImportDone');
                        if ($modal.length && $modal.modal) {
                            $modal.modal('show');
                        } else {
                            alert(msg.replace(/<[^>]+>/g, ''));
                        }
                        setTimeout(function () {
                            if ($modal.length && $modal.modal) $modal.modal('hide');
                        }, 4000);

                        if (typeof LoadOrdersList === 'function') LoadOrdersList();
                        if (typeof LoadOrdersSummary === 'function') LoadOrdersSummary();
                        if (typeof LoadNotifications === 'function') LoadNotifications();
                        if (typeof GetUnreadCount === 'function') GetUnreadCount();
                        return;
                    }

                    var row = rows[i];
                    if (btn) btn.innerHTML = 'Importing ' + (i + 1) + ' / ' + total + '...';

                    var url = hurl
                        + 'Service/Service.aspx?Process=' + encodeURIComponent(Encrypt('BULKINSERTORDERS_EXCEL'))
                        + '&ROOMNO=' + encodeURIComponent(Encrypt(row.room))
                        + '&ITEM_NAME=' + encodeURIComponent(Encrypt(row.itemName))
                        + '&QUANTITY=' + encodeURIComponent(Encrypt(row.quantity || '1'))
                        + '&MEALTYPE=' + encodeURIComponent(Encrypt(row.mealType))
                        + '&SPECIALINSTRUCTION=' + encodeURIComponent(Encrypt(row.specialInstructions || ''))
                        + '&USER_ID=' + encodeURIComponent(Encrypt(loggedInUserId))
                        + '&PREORDER_INPUT=' + encodeURIComponent(Encrypt(row.preOrder || 'NO'))
                        + '&DEFAULT_ORDER_INPUT=' + encodeURIComponent(Encrypt(row.defaultOrder || 'NO'));

                    $.ajax({
                        url: url,
                        method: 'GET',
                        dataType: 'json',
                        success: function (res) {
                            var result = res && res[0] ? res[0].RESULT : null;
                            if (result && result.indexOf('ERROR') === -1) {
                                okCount++;
                            } else {
                                failCount++;
                                failedLines.push(row._line);
                            }
                        },
                        error: function () {
                            failCount++;
                            failedLines.push(row._line);
                        },
                        complete: function () {
                            i++;
                            setTimeout(next, 80);
                        }
                    });
                }
                next();
            }

            function downloadImportTemplate() {
                var menu = document.getElementById('excelDropdownMenu');
                if (menu) menu.classList.remove('show');

                if (typeof ExcelJS === 'undefined') {
                    alert('Excel styling library (ExcelJS) is not loaded.');
                    return;
                }

                var headers = [
                    'ROOMNUMBER', 'MEALTYPE', 'ITEMNAME', 'QUANTITY',
                    'SPECIALINSTRUCTIONS', 'PREORDER', 'DEFAULTORDER'
                ];

                var workbook = new ExcelJS.Workbook();
                var worksheet = workbook.addWorksheet('OrderTemplate');
                var headerRow = worksheet.addRow(headers);

                headerRow.eachCell(function (cell) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF009688' } };
                    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                });

                worksheet.columns.forEach(function (column) {
                    column.width = 22;
                });

                workbook.xlsx.writeBuffer().then(function (buffer) {
                    var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'ORDER_IMPORT_TEMPLATE.xlsx';
                    a.click();
                    window.URL.revokeObjectURL(url);
                });
            }

            $(document).on('click', '.bulk-qty-plus', function () {
                var input = $(this).siblings('.bulk-qty-input');
                input.val(parseInt(input.val()) + 1);
            });

            // Handle Quantity Minus
            $(document).on('click', '.bulk-qty-minus', function () {
                var input = $(this).siblings('.bulk-qty-input');
                var val = parseInt(input.val());
                if (val > 1) {
                    input.val(val - 1);
                }
            });

            $(document).on('change', '#bulkWardSelect', function () {
                var selectedWard = $(this).val();
                LoadBulkRooms(selectedWard);
            });



        </script>

        <div class="modal fade" id="bulkOrderModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content bulk-order-modal-content">
                    <div class="modal-header bulk-order-header">
                        <div>
                            <h5 class="modal-title bulk-order-title">Take Bulk Orders</h5>
                            <p class="bulk-order-subtitle">Dietitian entry for patient room prebook order</p>
                        </div>
                        <button type="button" class="bulkorder-close" data-bs-dismiss="modal" aria-label="Close">&times;</button>
                    </div>

                    <div class="modal-body bulk-order-body">
                        <div class="d-flex align-items-center mb-4 bulk-date-row">
                            <label class="bulk-date-label">Order Date</label>
                            <input type="date" id="bulkOrderDate" class="form-control bulk-date-input">
                        </div>

                        <div class="row mb-4" style="display:none">
                            <div class="col-md-6 bulk-select-col">
                                <label class="bulk-select-label">Ward Selection</label>
                                <select id="bulkWardSelect" class="form-select bulk-select-input">
                                    <option value="">-- Select Ward --</option>
                                </select>
                            </div>
                            <div class="col-md-6 bulk-select-col" style="display:none">
                                <label class="bulk-select-label">Room No</label>
                                <select id="bulkRoomSelect" class="form-select bulk-select-input">
                                    <option value="">-- Select Room --</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-4 bulk-tabs-container">
                            <div class="d-flex gap-2 flex-wrap" id="bulkServingTabs">
                                <span style="color: #888; font-size: 13px;">Loading servings...</span>
                            </div>
                        </div>

                        <label class="bulk-serving-label" id="bulkServingLabel">Beverages Serving Items</label>

                        <div id="bulkItemsContainer"></div>
                        <div class="bulk-hint-box">
                            Type to search foods allowed for this patient's diet. Use +/- for quantity and the + button to add more items.
                        </div>

                    </div>
                    <div class="modal-footer bulk-order-footer">
                        <button type="button" class="btn btn-light bulk-btn-cancel" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn bulk-btn-confirm" onclick="submitBulkOrder()">Confirm Order</button>
                    </div>

                </div>
            </div>
        </div>

    </form>
</body>
</html>
