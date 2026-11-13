<%@ Page Language="C#" AutoEventWireup="true" CodeFile="DietReport.aspx.cs" Inherits="FoodDashboard_DietReport" %>

<html lang="en">

<head>
    <title>DietReport | DIAL50</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Favicon -->
    <link rel="icon" href="../favicon.png" />
    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <link rel="stylesheet" href="../fontawesome/css/all.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/DietReport.css" />

    <link href="../css/changepwd.css" rel="stylesheet" />


    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/exceljs.min.js"></script>
    <script src="../js/DietReport.js" type="text/javascript"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>
    <telerik:RadCodeBlock ID="RadCodeBlock" runat="server">
        <script type="text/javascript">
            var hurl = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/FoodDashboard/",
                urlPageValidation = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/MasterPage/Service/Service.aspx?",
                CryptoKey = '<%=ConfigurationManager.AppSettings["CryptoKey"].ToString() %>',
                CryptoPwd = '<%=ConfigurationManager.AppSettings["CryptoIV"].ToString() %>',
                ConProtocol = '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>';

            $(document).ready(function () {
                InitChangePassword();

                var userName = sessionStorage.getItem('NAME') || '';
                var userRole = sessionStorage.getItem('ROLENAME') || '';
                $('#spndepNursname').text(userName);
                $('#spnUserTypeLabel').text(userRole);
                $('#spanUserName').text(userName);

                var today = new Date();
                var from = new Date();
                from.setDate(today.getDate() - 2);
                $("#txtToDate").val(today.toISOString().split('T')[0]);
                $("#txtFromDate").val(from.toISOString().split('T')[0]);

                $('#ddlDietType').SumoSelect();
                LoadDietTypeDropdown();
                LoadDietReport();
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

                        <!-- User chip -->
                        <div style="position: absolute; top: 12px; right: 30px; z-index: 1000;">
                            <div style="background: white; padding: 6px 16px 6px 18px; border-radius: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px;">
                                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                    <span style="font-weight: 700; color: #0f172a; font-size: 14px;" id="spndepNursname"></span>
                                    <span style="font-weight: 500; color: #6b7280; font-size: 11px;" id="spnUserTypeLabel"></span>
                                </div>
                                <div style="width: 1px; height: 30px; background: #e5e7eb;"></div>
                                <a href="../login.aspx" title="Logout" style="display: flex; align-items: center; gap: 6px; padding: 4px 12px 4px 8px; border-radius: 20px; text-decoration: none; color: #dc2626; font-size: 13px; font-weight: 500;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Logout
                                </a>
                            </div>
                        </div>
                        <div class="dr-header">
                            <div>
                                <h1>Diet Report</h1>
                                <p>Patient diet assignments created within the selected date range.</p>
                            </div>
                            <button type="button" class="dr-export-btn" id="btnExportCSV">
                                <i class="fa fa-download"></i>Export CSV
                            </button>
                        </div>
                        <div class="dr-filter-card">
                            <div class="dr-filter-group">
                                <label for="txtFromDate">FROM DATE</label>
                                <input type="date" id="txtFromDate" />
                            </div>
                            <div class="dr-filter-group">
                                <label for="txtToDate">TO DATE</label>
                                <input type="date" id="txtToDate" />
                            </div>
                            <div class="dr-filter-group">
                                <label for="ddlDietType">DIET TYPE</label>
                                <select id="ddlDietType">
                                    <option value="">All Diet Types</option>
                                </select>
                            </div>
                            <div class="dr-filter-group">
                                <label for="txtSearch">SEARCH</label>
                                <input type="text" id="txtSearch" placeholder="Patient, UHID, room, item..." />
                            </div>
                        </div>
                        <div class="dr-table-card">
                            <div class="dr-table-header">
                                <h3><i class="fa fa-file-text-o"></i>&nbsp;Patient Diet Details</h3>
                                <span id="drTableDate"></span>
                            </div>
                            <div class="dr-table-wrap">
                                <table id="tblDiet" class="dr-table">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Patient Name</th>
                                            <th>Room</th>
                                            <th>Age</th>
                                            <th>Diet Type</th>
                                            <th>Allergies</th>
                                            <th>Medical Notes</th>
                                            <th>Dietary Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div class="dr-pagination">
                                <span id="drPageInfo"></span>
                                <div class="dr-pager-btns" id="drPager"></div>
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
