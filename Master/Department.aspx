<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Department.aspx.cs" Inherits="Master_Department" EnableEventValidation="false" %>

<html lang="en">

<head>
    <title>Department | TRACZO</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Favicon -->
    <link rel="icon" href="../favicon.png" />
    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />

    <link href="../css/changepwd.css" rel="stylesheet" />
    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/Department.js" type="text/javascript"></script>
    <script src="../js/aes.js" type="text/javascript"></script>
    <script src="../js/bulk.js" type="text/javascript"></script>
    <script src="../js/ChangePassword.js" type="text/javascript"></script>
    <telerik:RadCodeBlock ID="RadCodeBlock" runat="server">

        <script type="text/javascript">
            var dataSet = [], hurl =  '<%=ConfigurationManager.AppSettings["HTTP"].ToString() %>' + '://' +'<%=ConfigurationManager.AppSettings["EPEServer"].ToString() %>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString() %>' + "/Master/",
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
                //LoadRoles();
                LoadProcess();


                $('textarea').keypress(function (event) {

                    var regex = new RegExp("^[a-zA-Z0-9]+$");
                    var arrValid = ["*", ",", "."];
                    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);

                    //alert(key);
                    if (!regex.test(key) && (event.which !== 32) && (event.which !== 13) && (!(arrValid.indexOf(key) > -1))) {
                        event.preventDefault();
                        return false;
                    }

                });

                function changeCheck(img) {
                    var src = $(img).attr("src");
                    if (src.includes("CCheck.png")) {
                        $(img).attr("src", "../images/CNoCheck.png");
                    } else {
                        $(img).attr("src", "../images/CCheck.png");
                    }
                }
                function getSelectedValuesByClass(className) {
                    var selected = [];
                    $("." + className).each(function () {
                        if ($(this).attr("src").includes("CCheck.png")) {
                            selected.push($(this).data("value"));
                        }
                    });
                    return selected.join(",");
                }


                $('input[type=search]').keypress(function (event) {

                    var regex = new RegExp("^[a-zA-Z0-9]+$");
                    var arrValid = ["*", ",", "."];
                    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);

                    //alert(key);
                    if (!regex.test(key) && (event.which !== 32) && (event.which !== 13) && (!(arrValid.indexOf(key) > -1))) {
                        event.preventDefault();
                        return false;
                    }

                });
                $("#txtsearchNearbyZones").keyup(function () {

                    loadNBsuggesstion($(this).val());
                });
            });

            function LoadProcess() {
                grid = $find('<%= GridUser.ClientID %>');
                gridMasterTable = $find('<%= GridUser.ClientID %>').get_masterTableView();
                LoadGrid();
            }


            function DatValidate() {
                document.getElementById("<%= HFDWExportHeader.ClientID %>").value = BuildHeader();
                document.getElementById("<%= HFDWSearchQuery.ClientID %>").value = Encrypt($('#TextSearchLocation').val());
                ShowModalPopUp("modalAlertExport");
                setTimeout('HideModalPopUp("modalAlertExport");', 3000);
                return true;
            }

            $(document).ready(function () {

                var triggerTabList = [].slice.call(document.querySelectorAll('#departmentTabs button'));
                triggerTabList.forEach(function (triggerEl) {
                    var tabTrigger = new bootstrap.Tab(triggerEl);
                    triggerEl.addEventListener('click', function (event) {
                        event.preventDefault();
                        tabTrigger.show();
                    });
                });
            });


        </script>
    </telerik:RadCodeBlock>
    <style type="text/css">
        .category-master .category-master-item .card.card-top .btn.btn-tertiary {
            background-color: #2196f3 !important;
            color: #303537;
        }

        .MultiPorter {
            display: block;
            margin-top: 15px;
            margin-left: 15px;
            cursor: pointer;
        }

        .RadGrid_Metro .rgHeader, .RadGrid_Metro th.rgResizeCol, .RadGrid_Metro .rgMultiHeaderRow th.rgHeader, .RadGrid_Metro .rgMultiHeaderRow th.rgResizeCol {
            border: 0 !important;
            border-bottom: 0px solid #e5e5e5 !important;
            border-left: 0px solid #e5e5e5 !important;
        }

        table#ctl00_ContentMaster_GridUser_ctl00_Header thead tr th:last-child {
            border-radius: 0 10px 10px 0;
            border: none !important;
        }

        .RadGrid_Metro .rgHeader, .RadGrid_Metro .rgHeader a {
            color: #000000 !important;
            background-color: #C5DCF8 !important;
            font-family: monospace !important;
            font-size: 14px !important;
            height: 25px !important;
            vertical-align: middle !important;
            border-right: 1px solid #C5DCF8 !important;
            padding: 15px 20px !important;
            font-size: 12px;
            font-weight: bold;
        }

        .RadGrid_Metro .rgRow td, .RadGrid_Metro .rgAltRow td, .RadGrid_Metro .rgEditRow td, .RadGrid_Metro .rgFooter td {
            border-style: none !important;
            border-width: 0 0 0px 0px !important;
        }

        .RadGrid_Metro .rgHeader {
            font-weight: bold !important;
            color: #000000 !important;
            font-size: 16px !important;
        }

        .RadGrid_Metro .rgMasterTable .rgSelectedCell, .RadGrid_Metro .rgSelectedRow {
            color: #fff !important;
            background: #9E9E9E !important;
        }

        .RadGrid_Metro .rgAltRow, .RadGrid_Metro .rgHoveredRow {
            background-color: White !important;
        }

        .RadGrid .rgClipCells .rgHeader, .RadGrid .rgClipCells .rgFilterRow > td, .RadGrid .rgClipCells .rgRow > td, .RadGrid .rgClipCells .rgAltRow > td, .RadGrid .rgClipCells .rgEditRow > td, .RadGrid .rgClipCells .rgFooter > td {
            overflow: hidden !important;
            vertical-align: middle !important;
            /*text-align: center !important;*/
            font-size: 14px !important;
            padding: 10px !important;
            font-family: monospace !important;
        }

        table#ctl00_ContentMaster_GridUser_ctl00 {
            font-weight: bold;
        }

        .RadGrid_Metro {
            border-color: #ffffff !important;
            border-color: #ffffff !important;
            padding: 15px;
            border-radius: 10px;
        }

        table.ctl00_ContentMaster_GridUser_ctl00_Header thead tr th {
            background: #C5DCF8 !important;
            text-align: center;
            padding: 15px 20px;
            border-right: 1px solid #2784F4 !important;
            font-size: 12px;
            font-weight: 500;
        }

        .bordernone {
            border-right: 1px solid #ffffff !important;
            border: none !important;
        }

        .RadGrid_Metro td.rgPagerCell {
            border: 1px solid !important;
            border-color: #E1F5FE !important;
            padding: 8px !important;
        }

        .msgContainer {
            border-bottom: 2px dotted gray;
            background-color: #f1f1f1;
            border-radius: 5px 0px;
            padding: 15px;
            margin: 15px 0;
            font-family: monospace;
        }

            .msgContainer::after {
                content: "";
                clear: both;
                display: table;
            }


        .time-right {
            float: right;
            color: gray;
            font-weight: 12px;
            margin-right: 10px;
        }

        .msgUser {
            font-size: 14px;
            font-weight: bold;
        }


        .LocationList {
            z-index: 100;
            max-height: 300px;
            float: left;
            list-style: none;
            margin-top: -3px;
            padding: 0;
            position: absolute;
            overflow-y: scroll;
            min-width: 400px;
        }

            .LocationList li {
                padding: 10px;
                background: white;
                border-bottom: #bbb9b9 1px solid;
            }

                .LocationList li:hover {
                    background: #ece3d2;
                    cursor: pointer;
                }

                .input-error {
                    border: 1px solid red !important;
                }

                .error-message {
                    color: red;
                    font-size: 12px;
                    display: block;
                    margin-top: 5px;
                }

                .custom-tabs {
                    background-color: #f1f3f6;
                    padding: 6px;
                    border-radius: 10px;
                    gap: 6px;
                }

                .custom-tabs .nav-link {
                    border-radius: 8px;
                    padding: 10px 30px;
                    font-weight: 600;
                    font-size: 14px;
                    color: #555;
                    background-color: transparent;
                    border: none;
                    transition: all 0.3s ease;
                }

                .custom-tabs .nav-link.active {
                    background-color: #2f6fed;
                    color: #fff;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                }

                .custom-tabs .nav-link:hover {
                    background-color: #e2e6f0;
                    color: #000;
                }
                #txtDepartmentId option[disabled][selected] {
                    color: #6c757d;
                }

                #txtDepartmentId:invalid {
                    color: #6c757d;
                }


    </style>
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
                                           <li class="current-menu-item">
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
                                        <h6><span id="spanUserName"> </span> <br /> <br /> <span style="text-decoration: underline; font-size: 12px;">Log out</span></h6>
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


                    <!-- /Left Panel -->

                    <!-- Right Panel -->
                    <div class="screen-right-panel">
                        <div class="section-head">
                            <div class="section-head-left">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h5>Department</h5>

                                    </div>

                                    <div class="col-md-6">

                                    <button type="button" class="btn btn-primary w-100" id="BtnRemarks" onclick="addDepartment();">
                                        <img src="../images/memo.png">
                                        <span id="txtBtnRemarks">Add</span>

                                    </button>
                                    </div>
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
                                </div>
                            </div>
                            <div class="section-head-right d-flex align-items-center">
                                 <div id="tdExport">

                                    <asp:LinkButton ID="ExportLocations" runat="server" class="GridHeader" OnClientClick="return DatValidate();"
                                        OnClick="Export_Department"> <img src="../images/Exports.PNG" style="max-width:40px;margin-right: 20px;">
                                    </asp:LinkButton>

                                </div>
                                <div class="search-wrap shadow w-100">
                                    <div class="search-box">
                                        <form>
                                            <input type="search" maxlength="30" autocomplete="off webauthn" id="TextSearchLocation" class="form-control">
                                            <input type="submit" value="" class="search-submit" onclick="LoadProcess(); return false;">
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12" align="center">
                                <telerik:RadGrid ID="GridUser" runat="server" AllowSorting="false" AllowPaging="true"
                                    AutoGenerateColumns="false" Width="99%" AllowMultiRowSelection="true" Style="min-height: 800px; background-color: rgba(254, 254, 254, 1);"
                                    Skin="Metro">
                                    <PagerStyle AlwaysVisible="true" Position="Top"></PagerStyle>
                                    <ClientSettings EnableRowHoverStyle="true">
                                        <%--<Selecting AllowRowSelect="false" EnableDragToSelectRows="false" UseClientSelectColumnOnly="false" />--%>
                                        <ClientEvents OnRowDataBound="GridDepartment_RowDataBound" OnRowCreated="OnRowCreated"
                                            OnCommand="GridUser_Command" OnRowClick="rowOnClick" />
                                        <Scrolling AllowScroll="True" UseStaticHeaders="true" ScrollHeight="700px"></Scrolling>
                                    </ClientSettings>
                                    <MasterTableView ClientDataKeyNames="DEPARTMENTID,DEPARTMENTNAME,DESCRIPTION,ISACTIVE,PARENTDEPARTMENTID,MASTERDEPARTMENTNAME,ROW_NO,VIC"
                                        NoMasterRecordsText="NO DEPARTMENT FOUND." TableLayout="Fixed" PageSize="15">
                                        <NoRecordsTemplate>
                                            <div class="LinkFont" style="padding-left: 10%">
                                                NO REQUEST FOUND.
                                            </div>
                                        </NoRecordsTemplate>
                                        <Columns>
                                            <%--
                                            <telerik:GridClientSelectColumn UniqueName="SELECT">
                                                                    <HeaderStyle Width="70px" HorizontalAlign="Center"></HeaderStyle>
                                                                </telerik:GridClientSelectColumn>--%>

                                            <telerik:GridTemplateColumn UniqueName="EDIT" HeaderText="EDIT">
                                                <HeaderStyle Width="100px" />
                                                <ItemTemplate>
                                                </ItemTemplate>
                                            </telerik:GridTemplateColumn>

<%--                                        <telerik:GridBoundColumn HeaderText="ID" DataField="DEPARTMENTID" UniqueName="DEPARTMENTID">
                                                <HeaderStyle Width="250px" />
                                            </telerik:GridBoundColumn>--%>

                                            <telerik:GridBoundColumn HeaderText="DEPARTMENT NAME" DataField="DEPARTMENTNAME" UniqueName="DEPARTMENTNAME">
                                                <HeaderStyle Width="180px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="DESCRIPTION" DataField="DESCRIPTION" UniqueName="DESCRIPTION">
                                                <HeaderStyle Width="300px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="ISACTIVE" DataField="ISACTIVE" UniqueName="ISACTIVE">
                                                <HeaderStyle Width="250px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="MASTER DEPARTMENT" DataField="MASTERDEPARTMENTNAME" UniqueName="MASTERDEPARTMENTNAME">
                                                <HeaderStyle Width="250px" />
                                            </telerik:GridBoundColumn>

                                        </Columns>
                                    </MasterTableView>
                                </telerik:RadGrid>
                            </div>
                        </div>


                        <div class="loaderElement" style="display: none">
                            <div class="loader-spinner"></div>
                        </div>
                    </div>
                    <!-- /Right Panel -->



                </div>
            </div>
        </div>

        <div class="modal fade" id="ModalChangepwd" tabindex="-1" aria-labelledby="reportsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
                <div class="modal-content">

                    <div class="modal-header">
                        <h6 class="modal-title"><span id="canReqIDpwd"></span>
                            &nbsp;&nbsp;CHANGE PASSWORD</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="width: 20px; height: 20px;">
                            <img src="../images/close-white.svg">
                        </button>
                    </div>
                    <div class="headFoot" style="height: 0px; margin-top: -2px;">
                    </div>
                    <div id="Div2pwd" align="center" style="overflow-y: auto;">
                        <div id="CancelReasonContentpwd" class="Content" style="min-height: 320px">
                            <div id="DivCPContent" class="ContentCP" align="center" style="margin-top: 25px;">

                                <table class="Custfont" style="min-width: 350px; min-height: 160px; font-size: 14px; font-weight: 500;"
                                    cellpadding="5" cellspacing="5">
                                    <tr>
                                        <td>Current Password
                                        </td>
                                        <td align="center">
                                            <asp:TextBox ID="TxtCurPassword" runat="server" Width="180px" class="txtpwd" ClientIDMode="Static"
                                                Style="border: 1px solid #ded6d6 !important; margin-bottom: 0px !important; padding-left: 5px"
                                                TextMode="Password"></asp:TextBox>
                                            <asp:Label ID="ErCurrent" runat="server" Text="*" ForeColor="Red" Font-Size="Medium"
                                                ClientIDMode="Static" CssClass="Custfont" Style="visibility: hidden"></asp:Label>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>New Password
                                        </td>
                                        <td align="center">
                                            <asp:TextBox ID="TxtPassword" runat="server" Width="180px" class="txtpwd" ClientIDMode="Static"
                                                Style="border: 1px solid #ded6d6 !important; margin-bottom: 0px !important; padding-left: 5px"
                                                TextMode="Password"></asp:TextBox>
                                            <asp:Label ID="ErPassword" runat="server" Text="*" ForeColor="Red" Font-Size="Medium"
                                                ClientIDMode="Static" CssClass="Custfont" Style="visibility: hidden"></asp:Label>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Confirm Password
                                        </td>
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
                                            <table width="90%" align="center">
                                                <tr>
                                                    <td valign="middle" align="center"></td>
                                                    <td align="right">
                                                        <div class="section-head-right d-flex align-items-center">
                                                            <!-- <div class="date">
                                        <img src="../images/spiral-calendar.png" alt="Date"> 03-Mar-2023
                                    </div> -->

                                                        </div>
                                                        <div class="export-link" onclick="ValidatePassword()">
                                                            <a href="#" class="btn btn-secondary">
                                                                <img src="../images/memo.png" alt="Change">
                                                                Change
                                                            </a>
                                                        </div>
                                                        <%--<asp:Button ID="BtnSave" runat="server" Text="CHANGE" Style="background-color: rgba(32, 72, 132, 1);
                                                    border: none; padding: 5px 10px; color: white; font-weight: lighter !important;
                                                    font-size: 14px; border-radius: 0px !important; font-family: monospace;" OnClientClick="ValidatePassword();return false;" />--%>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                            </div>
                            <div style="text-align: justify;">
                                <span style="color: red; /* font-size: 15px; */">*</span><%-- The password must contain at least one digit and one lowercase English character and one uppercase English character and one special character from the specified set [!@#$%^&amp;*()\-+.]--%>

                                <div id="message">
                                    <h6>Password must contain the following:</h6>
                                    <p id="letter" class="invalid">A lowercase letter</p>
                                    <p id="capital" class="invalid">A capital (uppercase) letter</p>
                                    <p id="splChar" class="invalid">A special harecter [!@#$%^&*()\-+.] letter</p>

                                    <p id="number" class="invalid">A number</p>
                                    <p id="length" class="invalid">Minimum 6 characters</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade addTask" id="addUser" tabindex="-1" aria-labelledby="addUserLabel" aria-hidden="true" style="margin-top: 50px;">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="justify-content-between">
                            <div class="form-wrap" style="max-width: 900px; margin: 0 auto;">
                                <div class="d-flex align-items-center justify-content-between mb-4">
                                    <div class="d-flex justify-content-center mb-4">
                                        <ul class="nav nav-pills custom-tabs" id="departmentTabs" role="tablist">
                                            <li class="nav-item" role="presentation">
                                                <button class="nav-link active"
                                                        id="main-tab"
                                                        data-bs-toggle="pill"
                                                        data-bs-target="#main"
                                                        type="button"
                                                        role="tab">
                                                    MASTER-DEPARTMENT
                                                </button>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <button class="nav-link"
                                                        id="sub-tab"
                                                        data-bs-toggle="pill"
                                                        data-bs-target="#sub"
                                                        type="button"
                                                        role="tab">
                                                    SUB-DEPARTMENT
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    <h5 id="LocationHeader"></h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                        <img src="../images/close-white.svg">
                                    </button>
                                </div>
                        
                                <div class="tab-content" id="departmentTabContent">

                                    <div class="tab-pane fade show active" id="main" role="tabpanel" aria-labelledby="main-tab">
                                        <form id="formDepartment">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="row">
                                                        <input type="hidden" id="hdnDepartmentID" value="" />

                                                        <div class="col-md-12 mb-3">
                                                            <div class="mb-3">
                                                                <label>DEPARTMENT NAME <span style="color: red;">*</span></label>
                                                                <textarea maxlength="100" name="departmentName" rows="1" class="form-control" placeholder="DEPARTMENT NAME" id="departmentName" style="padding: 15px;"></textarea>
                                                                <span id="errorDepartmentName" class="error-message"></span>
                                                            </div>
                                                        </div>

                                                        <div class="col-md-12 mb-3">
                                                            <div class="mb-3">
                                                                <label>DEPARTMENT DESCRIPTION</label>
                                                                <textarea maxlength="500" name="departmentDescription" rows="3" class="form-control" placeholder="DEPARTMENT DESCRIPTION" id="departmentDescription" style="padding: 15px; resize: vertical;"></textarea>
                                                                <span id="errorDepartmentDescription" class="error-message"></span>
                                                            </div>
                                                        </div>

                                                        <div style="display: flex; align-items: center; gap: 12px; padding-top: 10px;">
                                                            <img 
                                                                src="../images/CNoCheck.png" 
                                                                id="chkIsActive" 
                                                                onclick="changeCheck(this);" 
                                                                style="width: 24px; height: 24px; cursor: pointer; display: block;"/>
                                                            <label style="font-weight: 600; font-size: 14px; user-select: none; line-height: 24px; margin: 0;">
                                                                IS ACTIVE <span style="color: red;">*</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="col-md-6">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <div class="RequestIcons" style="padding: 10px">
                                                                <div class="mb-3 row">
                                                                    <div class="col-sm-4">
                                                                        <button type="button" class="btn btn-outline w-100" data-bs-dismiss="modal">
                                                                            <img src="../images/multiply.svg"> Close
                                                                        </button>
                                                                    </div>
                                                                    <div class="col-sm-4">
                                                                        <button type="button" class="btn btn-secondary w-100" onclick="submitDepartment('main');">
                                                                            <img src="../images/envelope.png"> Submit
                                                                        </button>
                                                                    </div>
                                                                    <div class="col-sm-4">
                                                                        <button type="button" class="btn btn-outline w-100" onclick="deleteDepartment('main'); return false;" id="btnDeleteDepartment" style="background-color: #a4a4a4;">
                                                                            <table>
                                                                                <tr>
                                                                                    <td align="center">
                                                                                        <img src="../images/delete.png">
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td align="center" style="color: white; font-size: 14px; font-weight: 500;">Delete</td>
                                                                                </tr>
                                                                            </table>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                            
                                    <div class="tab-pane fade" id="sub" role="tabpanel" aria-labelledby="sub-tab">
                                        <form id="formSubDepartment">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="row">
                                                        <input type="hidden" id="hdnSubDepartmentID" value="" />

                                                        <div class="col-md-12 mb-3">
                                                            <div class="mb-3">
                                                                <label>MASTER DEPARTMENT <span class="text-danger">*</span></label>
                                                                <select name="masterDepartmentId" id="masterDepartmentId" placeholder="--Select--" class="form-control search_test" style="padding: 15px;" required>
                                                                    <option value="" disabled selected>--Select--</option>
                                                                </select>
                                                                <span id="errorMasterDepartmentId" class="error-message"></span>
                                                            </div>
                                                        </div>

                                                        <div class="col-md-12 mb-3">
                                                            <div class="mb-3">
                                                                <label>DEPARTMENT NAME <span style="color: red;">*</span></label>
                                                                <textarea maxlength="100" name="departmentName" rows="1" class="form-control" placeholder="DEPARTMENT NAME" id="subDepartmentName" style="padding: 15px;"></textarea>
                                                                <span id="errorSubDepartmentName" class="error-message"></span>
                                                            </div>
                                                        </div>

                                                        <div class="col-md-12 mb-3">
                                                            <div class="mb-3">
                                                                <label>DEPARTMENT DESCRIPTION</label>
                                                                <textarea maxlength="500" name="departmentDescription" rows="3" class="form-control" placeholder="DEPARTMENT DESCRIPTION" id="subDepartmentDescription" style="padding: 15px; resize: vertical;"></textarea>
                                                                <span id="errorSubDepartmentDescription" class="error-message"></span>
                                                            </div>
                                                        </div>

                                                        <div style="display: flex; align-items: center; gap: 12px; padding-top: 10px;">
                                                            <img 
                                                                src="../images/CNoCheck.png" 
                                                                id="chkSubIsActive" 
                                                                onclick="changeCheck(this);" 
                                                                style="width: 24px; height: 24px; cursor: pointer; display: block;"/>
                                                            <label style="font-weight: 600; font-size: 14px; user-select: none; line-height: 24px; margin: 0;">
                                                                IS ACTIVE <span style="color: red;">*</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="col-md-5">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <div class="RequestIcons" style="padding: 10px">
                                                                <div class="mb-3 row">
                                                                    <div class="col-sm-4">
                                                                        <button type="button" class="btn btn-outline w-100" data-bs-dismiss="modal">
                                                                            <img src="../images/multiply.svg"> Close
                                                                        </button>
                                                                    </div>
                                                                    <div class="col-sm-4">
                                                                        <button type="button" class="btn btn-secondary w-100" onclick="submitDepartment('sub');">
                                                                            <img src="../images/envelope.png"> Submit
                                                                        </button>
                                                                    </div>
                                                                    <div class="col-sm-4">
                                                                        <button type="button" class="btn btn-outline w-100" onclick="deleteDepartment('sub'); return false;" id="btnDeleteSubDepartment" style="background-color: #a4a4a4;">
                                                                            <table>
                                                                                <tr>
                                                                                    <td align="center">
                                                                                        <img src="../images/delete.png">
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td align="center" style="color: white; font-size: 14px; font-weight: 500;">Delete</td>
                                                                                </tr>
                                                                            </table>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
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
        </div>

        <div class="modal fade" id="modalAlert" tabindex="-1" aria-labelledby="reportsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-md">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="NRSuccess">Alert</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            <img src="../images/close-white.svg">
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="mb-3 text-center">
                                        <img src="../images/priority.png" alt="Icon Success">
                                    </div>
                                    <div class="mb-3 text-center">
                                        <span>USER DETAILS ALREADY EXISTS.</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="ModalReset" tabindex="-1" aria-labelledby="reportsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down" style="min-width: 550px;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h6 class="modal-title">Click 'Confirm' If You Are Ok To Reset  &nbsp;&nbsp;<span id="spanUserName"></span>'s Password</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="width: 20px; height: 20px;">
                            <img src="../images/close-white.svg">
                        </button>
                    </div>
                    <div class="headFoot" style="height: 0px; margin-top: -2px;">
                    </div>
                    <div id="DivReset" align="center" style="overflow-y: auto;">
                        <div id="OnHoldReleaseContent" class="Content" style="margin-bottom: 10px;">
                            <table width="95%">
                                <tr>
                                    <td align="center" style="padding: 20px; vertical-align: middle;">
                                        <span style="cursor: pointer; background-color: #FF725E; padding: 14px 10px; border-radius: 10px; margin: 5px; font-weight: bold; font-size: 15px; color: white;" onclick="Reset();return false;">Confirm </span>
                                    </td>
                                </tr>
                            </table>
                        </div>
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

        <div class="modal fade" id="modalNearByList" tabindex="-1" aria-labelledby="reportsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-md">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="headNearbyLocations">Nearby Zones</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            <img src="../images/close-white.svg">
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="row">
                                <div class="col-md-12 completeRemarks" id="divNearByLocations" style="max-height: 310px; overflow-y: auto; padding: 5px;">
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal fade" id="modalAlertExport" tabindex="-1" aria-labelledby="reportsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-md">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Alert</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            <img src="../images/close-white.svg">
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="mb-3 text-center">
                                        <img src="../images/priority.png" alt="Icon Success">
                                    </div>
                                    <div class="mb-3 text-center">
                                        <span>Downloading User Details... This may take few seconds, please wait..</span>
                                    </div>
                                </div>
                            </div>
                        </form>
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
