<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Porter.aspx.cs" Inherits="Master_porter" EnableEventValidation="false"%>
  
<html lang="en">

<head>
    <title>Operative | TRACZO</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Favicon -->
    <link rel="icon" href="../favicon.svg" />
    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/sumoselect.min.css">
    <link rel="stylesheet" type="text/css" href="../css/style.css" />

    <link href="../css/changepwd.css" rel="stylesheet" />
    <script src="../js/jquery-3.6.4.min.js" type="text/javascript"></script>
    <script src="../js/porter3.js" type="text/javascript"></script>
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

            var EUserID = '', EUserName = '', ERoleID = '', EDefaultLocation = '', Erolename = '', EIsActive = '', ERoleName = '', ENearByZoneArr = '', ENearByZoneIDs = '', EMId = '',EAPPID;

            var grid, gridMasterTable, pageSize = 15, pageIndex = 0;


            $(document).ready(function () {
                 InitChangePassword();
                //LoaddrRoles();

                ServiceCode = sessionStorage.getItem('ServiceCode');

                $('.services-btn-icon').click(function () {
                    // Remove 'active' class from all buttons
                    $('.services-btn-icon').removeClass('active');

                    // Add 'active' class to the clicked button
                    $(this).addClass('active');

                    ServiceCode = $(this).attr('id').replace("divService", "");
                    sessionStorage.setItem('ServiceCode', ServiceCode);
                    // setServiceUpdates(ServiceCode);
                    LoadProcess();

                    // Get the rgb color of the clicked button
                    var rgbColor = $(this).data('color'); sessionStorage.setItem('ServiceCode', ServiceCode);

                    // Convert rgb to rgba by appending the opacity
                    var rgbaColor = rgbColor.replace('rgb', 'rgba').replace(')', ', 0.1)');
                    // Set the new rgba color to the CSS variable
                    $(':root').css('--active-color', rgbColor);
                    $(':root').css('--active-bg-color', rgbaColor);
                });

                $('#divService' + ServiceCode).trigger('click');

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
                //    alert(ServiceCode);
                //sessionStorage.getItem('ROLE', 'CONTROL ROOM');
                grid = $find('<%= GridUser.ClientID %>');
                gridMasterTable = $find('<%= GridUser.ClientID %>').get_masterTableView();
                LoadGrid();
            }

            function DatValidate() {
                document.getElementById("<%= HFDWExportHeader.ClientID %>").value = BuildHeader();
                document.getElementById("<%= HFDWSearchQuery.ClientID %>").value = Encrypt($('#TextSearchLocation').val());
                document.getElementById("<%= HFDsvc.ClientID %>").value = Encrypt(ServiceCode);
                ShowModalPopUp("modalAlertExport");
                setTimeout('HideModalPopUp("modalAlertExport");', 3000);
                return true;
            }


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

        .SumoSelect .CaptionCont span.placeholder {
            color: black !important;
            font-style: initial !important;
        }

        .SumoSelect .CaptionCont span {
            background-color: transparent !important;
            color: black !important;
            font-style: initial !important;
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
        <asp:HiddenField ID="HFDsvc" runat="server" ClientIDMode="Static" />
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
                                    <img src="../images/hospital.jpg" alt="Hospital">
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
                                            <a href="../Master/TaskType.aspx">
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

                                        <li class="current-menu-item">
                                            <a href="../Master/Users.aspx">
                                                <span>
                                                    <img src="../images/porter-master.png" alt="Location Master"></span> User Master
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
                                                    <img src="../images/Equipment.png" alt="Location Master"></span> Department Master
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


                    <!-- /Left Panel -->

                    <!-- Right Panel -->
                    <div class="screen-right-panel">

                        <div class="navigation-tabs-wrapper">
                            <div>
                                <h5>Operatives</h5>
                            </div>
                            <div class="services-tabs-wrapper" style="visibility: hidden;">


                                <div class="services-btn-icon" data-color="rgb(255, 116, 0)" id="divService1">
                                    <img src="../images/porter-icon.svg" />
                                    <span>Portering</span>
                                </div>
                                <div class="services-btn-icon" data-color="rgb(12, 188, 139)" id="divService3">
                                    <img src="../images/cater-icon.png" />
                                    <span>Receipt and Distribution</span>
                                </div>

                            </div>
                            <div class="action-btn-wrapper">

                                <div class="col-md-12" style="margin-top: 5px;">
                                    <button type="button" class="btn btn-primary w-100" id="BtnRemarks" onclick="addUser();">
                                        <img
                                            src="../images/memo.png">
                                        <span id="txtBtnRemarks">Add</span></button>

                                </div>
                                <div class="section-head-right d-flex align-items-center">
                                    <div id="tdExport" style="">

                                        <asp:LinkButton ID="ExportLocations" runat="server" class="GridHeader" OnClientClick="return DatValidate();"
                                            OnClick="Export_User"> <img src="../images/Exports.PNG" style="max-width:40px;margin-right: 20px;">
                                        </asp:LinkButton>

                                    </div>


                                    <div class="search-wrap w-100" style="margin: 0px; margin-left: 10px;">
                                        <div class="search-box">
                                            <form>
                                                <input type="search" maxlength="30" autocomplete="off webauthn" id="TextSearchLocation" class="form-control">
                                                <input type="submit" value="" class="search-submit" onclick="LoadProcess(); return false;">
                                            </form>

                                        </div>
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
                                        <ClientEvents OnRowDataBound="GridUser_RowDataBound" OnRowCreated="OnRowCreated"
                                            OnCommand="GridUser_Command" OnRowClick="rowOnClick" />
                                        <Scrolling AllowScroll="True" UseStaticHeaders="true" ScrollHeight="700px"></Scrolling>
                                    </ClientSettings>
                                    <MasterTableView ClientDataKeyNames="ID,USERNAME,MID,PASSWORD,DEVICE,SHORT,SERVICEID,PASSWORD,
                                                                         DEPARTMENT_NAME,CategoryIds,DEPARTMENT_ID,FloorIds,CATEGORY_NAMES,FLOOR_NAMES,PROFILEPICTURE,ISACTIVE,ROW_NO,VIC,GENDERNAME,Gender,APPID"
                                        NoMasterRecordsText="NO REQUEST FOUND." TableLayout="Fixed" PageSize="15">
                                        <NoRecordsTemplate>
                                            <div class="LinkFont" style="padding-left: 10%">
                                                NO REQUEST FOUND.
                                            </div>
                                        </NoRecordsTemplate>
                                        <Columns>
                                            <%--<telerik:GridClientSelectColumn UniqueName="SELECT">
                                                                        <HeaderStyle Width="70px" HorizontalAlign="Center"></HeaderStyle>
                                                                    </telerik:GridClientSelectColumn>--%>

                                            <telerik:GridTemplateColumn UniqueName="EDIT" HeaderText="EDIT">
                                                <HeaderStyle Width="100px" />
                                                <ItemTemplate>
                                                </ItemTemplate>
                                            </telerik:GridTemplateColumn>

                                            <telerik:GridBoundColumn HeaderText="OPERATIVES NAME" DataField="USERNAME" UniqueName="USERNAME">
                                                <HeaderStyle Width="250px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="USER NAME" DataField="MID" UniqueName="MID">
                                                <HeaderStyle Width="180px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="SHORT" DataField="SHORT" UniqueName="SHORT" Display="false">
                                                <HeaderStyle Width="180px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="DEPARTMENT" DataField="DEPARTMENT_NAME" UniqueName="DEPARTMENT_NAME">
                                                <HeaderStyle Width="180px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="CATEGORIES" DataField="CATEGORY_NAMES" UniqueName="CATEGORY_NAMES">
                                                <HeaderStyle Width="200px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="FLOORS" DataField="FLOOR_NAMES" UniqueName="FLOOR_NAMES">
                                                <HeaderStyle Width="200px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="IS ACTIVE" DataField="ISACTIVE" UniqueName="ISACTIVE">
                                                <HeaderStyle Width="150px" />
                                            </telerik:GridBoundColumn>


                                            <telerik:GridBoundColumn HeaderText="PROFILEPICTURE" DataField="PROFILEPICTURE" UniqueName="PROFILEPICTURE">
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="GENDER" DataField="GENDERNAME">
                                                <HeaderStyle Width="150px" />
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
                                    <p id="splChar" class="invalid">A special character [!@#$%^&*()\-+.] letter</p>

                                    <p id="number" class="invalid">A number</p>
                                    <p id="length" class="invalid">Minimum 12 characters</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalGenericSuccess" tabindex="-1" aria-labelledby="genericSuccessLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-md">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="genericSuccessLabel">Success</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            <img src="../images/close-white.svg" alt="Close">
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <img src="../images/icon-success.gif" alt="Success Icon">
                        </div>
                        <div class="text-center">
                            <span id="LBLGenericSuccessResult" style="font-weight: 600;">Operation completed successfully!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade addTask" id="addUser" tabindex="-1" aria-labelledby="addUserLabel" aria-hidden="true" style="margin-top: 50px;">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="d-flex justify-content-between">
                            <div class="form-wrap me-4">
                                <div class="d-flex align-items-center justify-content-between mb-4">
                                    <h5 id="LocationHeader"></h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                        <img src="../images/close-white.svg">
                                    </button>
                                </div>
                                <form id="formRequest">
                                    <div class="row">
                                        <div class="col-md-7">
                                            <div class="row">

                                                <div class="col-md-12" id="containerFrom">
                                                    <div class="mb-3">
                                                        <label>OPERATIVES NAME <span class="text-danger">*</span></label>
                                                        <textarea maxlength="50" name="txtUserName" rows="1" class="form-control" placeholder="Enter Porter Name" id="txtUserName" style="padding: 15px; height: 50px; resize: none; overflow: hidden;" required></textarea>
                                                    </div>
                                                </div>

                                                <div class="col-md-12">
                                                    <div class="mb-3">
                                                        <label>USER NAME <span class="text-danger">*</span></label>
                                                        <textarea maxlength="50" name="txtMID" rows="1" class="form-control" placeholder="Enter User Name" id="txtMID" style="padding: 15px; height: 50px; resize: none; overflow: hidden;" required></textarea>
                                                    </div>
                                                </div>

                                                <div class="col-md-12">
                                                    <div class="mb-3 clsPwd">
                                                        <label>PASSWORD <span class="text-danger">*</span></label>
                                                        <input type="password" maxlength="50" name="txtPwd" class="form-control" placeholder="Enter Password" id="txtPwd" style="padding: 15px;" required />
                                                    </div>
                                                </div>

                                                <div class="col-md-12">
                                                    <div class="mb-3">
                                                        <label class="form-label">DEPARTMENTS</label>
                                                        <select name="txtDepartmentId" id="txtDepartmentId" class="form-control" multiple="multiple" required>
                                                            <option value="" disabled selected>--Select--</option>
                                                            <%--<option value="ALL">ALL</option>--%>
                                                        </select>
                                                    </div>
                                                </div>

                                                <%--                                                <div class="col-md-12">
                                                    <div class="mb-3">
                                                        <label>DEPARTMENT <span class="text-danger">*</span></label>
                                                        <select name="txtDepartmentId" id="txtDepartmentId" placeholder="--Select--" class="form-control search_test" style="padding: 15px;" required>
                                                            <option value="">--Select--</option>
                                                        </select>
                                                    </div>
                                                </div>--%>

                                                <div class="col-md-12">
                                                    <div class="mb-3">
                                                        <label class="form-label">CATEGORY TYPES</label>
                                                        <select name="txtCategoryTypes" id="txtCategoryTypes" class="form-control" multiple="multiple" required>
                                                            <option value="" disabled selected>--Select--</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div class="col-md-12" id="containerMP" style="padding-top: 20px; margin-bottom: 30px;">
                                                    <table style="margin-left: 0;">
                                                        <tr>
                                                            <td style="padding-left: 10px; padding-top: 15px;">
                                                                <label>IS ACTIVE</label>
                                                            </td>
                                                            <td style="padding-left: 10px; padding-right: 10px;">
                                                                <img src="../images/CNoCheck.png" id="chkIsActive" onclick="changeCheck(this);" style="width: 30px; cursor: pointer;" class="MultiPorter">
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-5">
                                            <div class="row">

                                                <div class="col-md-12" style="display: none;">
                                                    <div class="mb-3">
                                                        <label>SHORT NAME</label>
                                                        <textarea maxlength="50" name="txtShort" rows="1" class="form-control" placeholder="Enter Short Name" id="txtShort" style="padding: 15px; height: 50px; resize: none; overflow: hidden;"></textarea>
                                                    </div>
                                                </div>

                                                <div class="col-md-12">
                                                    <div class="mb-3">
                                                        <label class="form-label">FLOOR</label>
                                                        <select name="txtFloorId" id="txtFloorId" class="form-control" multiple="multiple" required>
                                                            <option value="" disabled selected>--Select--</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div class="col-md-12">
                                                    <div class="mb-3">
                                                        <label>PROFILE PICTURE</label>
                                                        <div class="input-group" style="max-width: 80%;">
                                                            <input type="text" name="txtProfileImage" id="txtProfileImage" class="form-control" placeholder="Select profile image" readonly style="padding: 15px; border-right: 0;">
                                                            <button type="button" class="btn btn-outline-secondary d-flex align-items-center" onclick="document.getElementById('fileProfileImage').click();" style="border: 1px solid #ced4da; border-left: 0; padding: 0 15px;">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder-plus" viewBox="0 0 16 16">
                                                                    <path d="M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672z" />
                                                                    <path d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 0 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5z" />
                                                                </svg>
                                                                <span class="ms-2">Browse</span>
                                                            </button>
                                                            <input type="file" id="fileProfileImage" name="fileProfileImage" style="display: none;" accept="image/*" onchange="document.getElementById('txtProfileImage').value = this.files[0]?.name || '';">
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="form-group">
                                                    <label for="ddlGenderType">Gender<span class="text-danger">*</span></label>
                                                    <select id="ddlGenderType" class="form-control">
                                                        <option value="">--Select--</option>
                                                    </select>
                                                </div>
                                                <br />
                                                <div class="form-group">
                                                    <label for="ddlAppId">App ID</label>
                                                    <select id="ddlAppId" class="form-control">
                                                        <option value="">--Select--</option>
                                                    </select>
                                                </div>
                                                <div id="divNearByZones" class="completeRemarks" style="max-height: 310px; overflow-y: auto; padding: 5px;"></div>

                                                <div class="col-md-12">
                                                    <div class="RequestIcons" style="padding: 10px">
                                                        <div class="mb-3 row">
                                                            <div class="col-sm-4">
                                                                <button type="button" class="btn btn-outline w-100" data-bs-dismiss="modal">
                                                                    <img src="../images/multiply.svg">
                                                                    Close
                                                                </button>
                                                            </div>
                                                            <div class="col-sm-4">
                                                                <button type="button" class="btn btn-secondary w-100" onclick="submitUser();">
                                                                    <img src="../images/envelope.png">
                                                                    Submit
                                                                </button>
                                                            </div>
                                                            <div class="col-sm-4">
                                                                <button type="button" class="btn btn-outline w-100" onclick="deleteLocation();return false;" id="btnDeleteLocation" style="background-color: #a4a4a4;">
                                                                    <table>
                                                                        <tr>
                                                                            <td align="center">
                                                                                <img src="../images/delete.png"></td>
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
                                        <span>OPERATIVES DETAILS ALREADY EXISTS.</span>
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
                                        <span>Downloading Operatives Details... This may take few seconds, please wait..</span>
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
