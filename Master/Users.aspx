<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Users.aspx.cs" Inherits="Master_Users" EnableEventValidation="false" %>

<html lang="en">

<head>
    <title>Users | TRACZO</title>
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
    <script src="../js/Users.js" type="text/javascript"></script>
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

            var EUserID = '', EUserName = '', ERoleID = '', EDefaultLocation = '', Erolename = '', EIsActive = '', ERoleName = '', ENearByZoneArr = '', ENearByZoneIDs = '', EMId = '', EDepartmentIds = '', EDepartmentNames = '';

            var grid, gridMasterTable, pageSize = 15, pageIndex = 0;


            $(document).ready(function () {
                InitChangePassword();
                LoaddrRoles();
                LoadProcess();
                toggleRoleBasedFields();


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

        .SumoSelect .CaptionCont span.placeholder {
            color: black !important; 
            font-style: initial !important; 
        }

        .SumoSelect .CaptionCont span {
            background-color: transparent !important;
            color: black !important;
            font-style: initial !important; 
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
                                    <h6>Burjeel Medical City (BMC) </h6>
                                    <p>  Mohamed Bin Zayed City - Abu Dhabi - United Arab Emirates</p>
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
                                        <h5>Users</h5>
                                    </div>
                                    <div class="col-md-6">
                                        <button type="button" class="btn btn-primary w-100" id="BtnRemarks" onclick="addUser();">
                                            <img
                                                src="../images/memo.png">
                                            <span id="txtBtnRemarks">Add</span></button>
                                    </div>
                                </div>
                            </div>
                            <div class="section-head-right d-flex align-items-center">
                                 <div id="tdExport">

                                    <asp:LinkButton ID="ExportLocations" runat="server" class="GridHeader" OnClientClick="return DatValidate();"
                                        OnClick="Export_User"> <img src="../images/Exports.PNG" style="max-width:40px;margin-right: 20px;">
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
                                        <ClientEvents OnRowDataBound="GridUser_RowDataBound" OnRowCreated="OnRowCreated"
                                            OnCommand="GridUser_Command" OnRowClick="rowOnClick" />
                                        <Scrolling AllowScroll="True" UseStaticHeaders="true" ScrollHeight="700px"></Scrolling>
                                    </ClientSettings>
                                    <MasterTableView ClientDataKeyNames="ID,USERNAME,MID,ISACTIVE,ROLE,ROLENAME,ROLEID,EMAIL, SHIFT, HOSPITALNAME1,SHORT,EQ_SERVICEID,NURSELOCATIONID,NURSELOCATION,DEPARTMENTNAME,ROW_NO,VIC"
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

                                            <telerik:GridBoundColumn HeaderText="DISPLAY NAME" DataField="SHORT" UniqueName="SHORT">
                                                <HeaderStyle Width="250px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="USER NAME" DataField="USERNAME" UniqueName="USERNAME">
                                                <HeaderStyle Width="180px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="ROLE" DataField="ROLENAME" UniqueName="ROLENAME">
                                                <HeaderStyle Width="150px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="EMAIL" DataField="EMAIL" UniqueName="EMAIL">
                                                <HeaderStyle Width="200px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="NURSE LOCATION" DataField="NURSELOCATION" UniqueName="NURSELOCATION">
                                                <HeaderStyle Width="200px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridBoundColumn HeaderText="DEPARTMENT" DataField="DEPARTMENTNAME" UniqueName="DEPARTMENTNAME">
                                                <HeaderStyle Width="200px" />
                                            </telerik:GridBoundColumn>

                                            <telerik:GridTemplateColumn UniqueName="RESET" HeaderText="RESET PASSWORD">
                                                <HeaderStyle Width="150px" />
                                                <ClientItemTemplate>
                                                                  
                                                </ClientItemTemplate>
                                            </telerik:GridTemplateColumn>
                                            
                                            <telerik:GridBoundColumn HeaderText="ISACTIVE" DataField="ISACTIVE" UniqueName="ISACTIVE">
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

                                            <input type="hidden" id="hdnUserID" value="" />
                                                <div class="col-md-12 mb-3" id="containerFrom">
                                                    <div class="mb-3">
                                                        <label>DISPLAY NAME <span style="color: red;">*</span></label>
                                                        <textarea maxlength="50" name="username" rows="1" class="form-control" placeholder="Display Name" id="username" style="padding: 15px;"></textarea>
                                                        <span id="errorDisplayName" class="error-message"></span>
                                                    </div>
                                                </div>

                                                <div class="col-md-12 mb-3">
                                                    <div class="mb-3">
                                                        <label>USER NAME <span style="color: red;">*</span></label>
                                                        <textarea maxlength="50" name="txtUserName" rows="1" class="form-control" placeholder="User Name" id="txtUserName" style="padding: 15px;"></textarea>
                                                        <span id="errorUserName" class="error-message"></span>
                                                    </div>
                                                </div>

                                                <div class="col-md-12 mb-3">
                                                    <div class="mb-3">
                                                        <label for="txtEmail">EMAIL</label>
                                                        <input type="email" maxlength="50" name="txtEmail" class="form-control" placeholder="Email" id="txtEmail" style="padding: 15px;">
                                                        <span id="errorEmail" class="error-message"></span>
                                                    </div>
                                                </div>

                                                <div class="col-md-12 mb-3">
                                                    <div class="mb-3">
                                                        <label>ROLE <span style="color: red;">*</span></label>
                                                        <select name="selectFloor" id="search_RoleName" tabindex="1" class="form-control search_test" onchange="toggleRoleBasedFields()">
                                                            <option value="0">--Select--</option>
                                                        </select>
                                                        <span id="errorRolename" class="error-message"></span>
                                                    </div>
                                                </div>

                                            <div class="col-md-12" id="containerMP" style="padding-top: 20px; margin-bottom: 30px;">
                                                <table style="margin-left: 0; padding-left: 10px;">
                                                    <tr>
                                                        <td style="padding-left: 10px; padding-top: 15px;">
                                                            <label>Is Active</label>
                                                        </td>
                                                        <td style="padding-left: 10px; padding-right: 10px;">
                                                            <img src="../images/CNoCheck.png" id="chkIsActive" onclick="changeCheck(this);" style="width: 30px" class="MultiPorter">
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>

                                            <div class="col-md-12" style="display:none">
                                            <div class="mb-3">
                                              <label style="font-weight: 600;">SHIFT <span style="color: red;">*</span></label>
                                              <div id="containerShift" style="padding-top: 10px;">
                                                <div style="display: flex; align-items: center; padding-top: 10px; cursor: pointer;">
                                                  <img 
                                                    src="../images/CNoCheck.png" 
                                                    id="chkShiftAllDay" 
                                                    onclick="changeCheck(this);" 
                                                    data-value="All Day" 
                                                    class="MultiPorter MultiPorterShift" 
                                                    style="width: 18px; height: 18px; margin-bottom: 16px; margin-right: 8px;" />
                                                  <span>All Day</span>
                                                </div>
                                              </div>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                      <div class="col-md-5">
                                        <div class="row">
                                            <div class="col-md-12" style="display:none">
                                                <div class="mb-3">
                                                    <label>DEVICE</label>
                                                    <textarea maxlength="300" name="txtDevice" rows="1" class="form-control" placeholder="Enter Device Info" id="txtDevice" style="padding: 15px;"></textarea>
                                                </div>
                                            </div>

                                            <div class="col-md-12">
                                                <div class="mb-3">
                                                    <label class="form-label">DEPARTMENTS</label>
                                                    <select name="txtDepartmentId" id="txtDepartmentId" class="form-control" multiple="multiple" required>
                                                        <option value="" disabled selected>--Select--</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div class="col-md-12">
                                                <div class="mb-3">
                                                    <label>ADD LOCATION</label>
                                                    <textarea maxlength="50" name="txtsearchNearbyZones" rows="1" class="form-control" placeholder="Search here.." id="txtsearchNearbyZones" style="padding: 15px;"></textarea>
                                                    <div id="suggesstionNearBy" class="col-md-6"></div>
                                                </div>
                                            </div>

                                            <div id="divNearByZones" class="completeRemarks" style="max-height: 310px; overflow-y: auto; padding: 5px;"></div>

                                            <div class="col-md-12">
                                                <div class="RequestIcons" style="padding: 10px">
                                                    <div class="mb-3 row">

                                                        <div class="col-sm-4">
                                                            <button type="button" class="btn btn-outline w-100" data-bs-dismiss="modal">
                                                                <img src="../images/multiply.svg"> Close
                                                            </button>
                                                        </div>

                                                        <div class="col-sm-4">
                                                            <button type="button" class="btn btn-secondary w-100" onclick="submitUsers();">
                                                                <img src="../images/envelope.png"> Submit
                                                            </button>
                                                        </div>

                                                        <div class="col-sm-4">
                                                            <button type="button" class="btn btn-outline w-100" onclick="deleteLocation(); return false;" id="btnDeleteLocation" style="background-color: #a4a4a4;">
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

                                    <div class="col"></div>
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
<script>

    function changeCheck(imgElem) {
        if (imgElem.src.includes("CNoCheck.png")) {
            imgElem.src = "../images/CCheck.png";
        } else {
            imgElem.src = "../images/CNoCheck.png";
        }
    }

    function setCheckedValues(className, values) {
        if (!values || typeof values !== 'string') {
            $('.' + className).each(function () {
                $(this).attr('src', "../images/CNoCheck.png");
            });
            return;
        }

        let arr = values.split(',');
        $('.' + className).each(function () {
            let val = $(this).data('value');
            if (arr.includes(val)) {
                $(this).attr('src', "../images/CCheck.png");
            } else {
                $(this).attr('src', "../images/CNoCheck.png");
            }
        });
    }


    function getCheckedValues(className) {
        let values = [];
        $('.' + className).each(function () {
            if ($(this).attr('src').includes("CCheck.png")) {
                values.push($(this).data('value'));
            }
        });
        return values.join(',');
    }

    function clearUserForm() {
        $('#hdnUserID').val('');
        $('#txtUserName').val('');
        $('#username').val('');
        $('#txtEmail').val('');

        $('#search_RoleName').val('0');
        if ($('#search_RoleName')[0].sumo) {
            $('#search_RoleName')[0].sumo.reload();
        }

        if ($('#txtDepartmentId')[0].sumo) {
            $('#txtDepartmentId')[0].sumo.unSelectAll();
            $('#txtDepartmentId')[0].sumo.reload();
        }

        $('#chkIsActive').attr("src", "../images/CCheck.png");

        $('#btnDeleteLocation').css("display", "none");

        setCheckedValues("MultiPorterDivision", "");
        setCheckedValues("MultiPorterShift", "");
        setCheckedValues("MultiPorterEqService", "");

        ENearByZoneArr = '';
        ENearByZoneIDs = '';
        $('#divNearByZones').html('');
        $('#txtsearchNearbyZones').val('');
        $('#suggesstionNearBy').hide();

        EDepartmentIds = '';
        EDepartmentNames = '';

        $('#LocationHeader').html('Add New User');
    }

    function addUser() {
        clearUserForm();

        $('#txtDepartmentId').closest('.col-md-12').show();
        $('#txtsearchNearbyZones').closest('.col-md-12').show();
        $('#divNearByZones').closest('.completeRemarks').show();

        ENearByZoneArr = '';
        ENearByZoneIDs = '';

        $('#divNearByZones').html('');
        $('#txtsearchNearbyZones').val('');
        $('#suggesstionNearBy').hide();

        $('#addUser').modal('show');
    }

    function setEditUser(UserId, UserName, RoleID, ShortName, rolename, IsActive, email, MId, Division, Shift, EqService, NurseLocationIDs, NurseLocationNames, DepartmentIds, DepartmentNames) {

        EUserID = UserId;
        EUserName = UserName;
        EShortName = ShortName || MId;
        ERoleID = RoleID;
        Erolename = rolename;
        EIsActive = IsActive;
        Email = email;

        EDepartmentIds = DepartmentIds || "";
        EDepartmentNames = DepartmentNames || "";

        ENearByZoneIDs = NurseLocationIDs || "0";

        $('#hdnUserID').val(UserId);
        $('#txtUserName').val(UserName || '');
        $('#username').val(ShortName || MId || '');
        $('#txtEmail').val(email || '');
        $('#LocationHeader').html('Edit User #' + UserName);

        if (RoleID && $('#search_RoleName')[0].sumo) {
            $('#search_RoleName')[0].sumo.selectItem(RoleID);
            setTimeout(toggleRoleBasedFields, 100);
        }

        const active = (IsActive && (IsActive.toString().toLowerCase() === 'true' || IsActive === '1' || IsActive === 1));
        $('#chkIsActive').attr("src", active ? "../images/CCheck.png" : "../images/CNoCheck.png");

        $('#btnDeleteLocation').css("display", "block");

        handleDepartmentSelection(EDepartmentIds, EDepartmentNames);

        if (NurseLocationIDs && NurseLocationIDs !== "0" && NurseLocationIDs !== "") {
            if (NurseLocationNames && NurseLocationNames !== "") {
                createLocationArrayFromNames(NurseLocationIDs, NurseLocationNames);
            } else {
                loadLocationNamesForEdit(NurseLocationIDs);
            }
        } else {
            $('#divNearByZones').html('');
            $('#txtsearchNearbyZones').val('');
            ENearByZoneArr = '';
        }

        $('#addUser').modal('show');
    }

    function handleDepartmentSelection(departmentIds, departmentNames) {
        if (!$('#txtDepartmentId')[0].sumo) {
            return;
        }

        $('#txtDepartmentId')[0].sumo.unSelectAll();

        if (departmentIds && departmentIds.trim() !== "" && departmentIds !== "0") {
            selectDepartmentsByIds(departmentIds);
        }
        else if (departmentNames && departmentNames.trim() !== "") {
            selectDepartmentsByNames(departmentNames);
        }
        else {
            $('#txtDepartmentId')[0].sumo.reload();
        }
    }

    function selectDepartmentsByIds(departmentIds) {
        var deptIds = departmentIds.split(',');
        var sumo = $('#txtDepartmentId')[0].sumo;

        deptIds.forEach(function (deptId) {
            if (deptId && deptId.trim() !== '' && deptId.trim() !== '0') {
                sumo.selectItem(deptId.trim());
            }
        });

        sumo.reload();
    }

    function selectDepartmentsByNames(departmentNames) {
        var sumo = $('#txtDepartmentId')[0].sumo;
        var options = $('#txtDepartmentId').find('option');
        var namesArray = departmentNames.split(',').map(name => name.trim());
        var foundAny = false;

        namesArray.forEach(function (deptName) {
            if (!deptName) return;

            var matchingOption = options.filter(function () {
                return $(this).text().trim() === deptName.trim();
            });

            if (matchingOption.length > 0) {
                var deptId = matchingOption.val();
                sumo.selectItem(deptId);
                foundAny = true;
            } else {
            }
        });

        if (foundAny) {
            sumo.reload();
        }
    }

    function createLocationArrayFromNames(ids, names) {
        var idsArray = ids.split(',');
        var namesArray = names.split(', ');
        var locationPairs = [];

        for (var i = 0; i < idsArray.length; i++) {
            var id = idsArray[i] ? idsArray[i].trim() : "";
            var name = (i < namesArray.length && namesArray[i]) ? namesArray[i].trim() : "Location " + id;

            if (id && id !== "0") {
                locationPairs.push(id + "|$|" + name);
            }
        }

        ENearByZoneArr = locationPairs.join(',');
        setNearByZones();
    }

    function loadLocationNamesForEdit(locationIds) {
        if (!locationIds || locationIds === "0" || locationIds === "") {
            $('#divNearByZones').html('');
            ENearByZoneArr = '';
            ENearByZoneIDs = '';
            return;
        }

        ENearByZoneIDs = locationIds;

        var encProcess = Encrypt("GETLOCATIONNAMESBYIDS").toString();
        var encLocationIds = Encrypt(locationIds).toString();

        var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(encProcess) +
            "&LOCATIONIDS=" + encodeURIComponent(encLocationIds);

        $.ajax({
            async: true,
            url: url,
            type: 'POST',
            data: 'pData',
            dataType: 'json',
            success: function (data) {
                if (data && data[0] && data[0].RESULT && data[0].RESULT.trim() !== "") {
                    ENearByZoneArr = data[0].RESULT;
                    setNearByZones();
                } else {
                    var idsArray = locationIds.split(',');
                    var locationPairs = [];
                    $.each(idsArray, function (index, id) {
                        if (id.trim() && id.trim() !== "0") {
                            locationPairs.push(id.trim() + "|$|Location " + id.trim());
                        }
                    });
                    ENearByZoneArr = locationPairs.join(',');
                    setNearByZones();
                }
            },
            error: function () {
                var idsArray = locationIds.split(',');
                var locationPairs = [];
                $.each(idsArray, function (index, id) {
                    if (id.trim() && id.trim() !== "0") {
                        locationPairs.push(id.trim() + "|$|Location " + id.trim());
                    }
                });
                ENearByZoneArr = locationPairs.join(',');
                ENearByZoneIDs = locationIds;
                setNearByZones();
            }
        });
    }

    function encryptAES(text) {
        const key = CryptoJS.enc.Utf8.parse('9090909090909090');
        const iv = CryptoJS.enc.Utf8.parse('9090909090909090');

        const encrypted = CryptoJS.AES.encrypt(text, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return encodeURIComponent(encrypted.toString());
    }

    function showValidationMessage(fieldId, message) {

        $('#' + fieldId).parent().find('.validation-message').remove();

        $('#' + fieldId).parent().append(
            '<div class="validation-message text-danger small mt-1">' + message + '</div>'
        );
    }

    function clearValidation(fieldId) {
        $('#' + fieldId).css('border', '1px solid #ced4da');
        $('#' + fieldId).siblings('.CaptionCont').css('border', '1px solid #ced4da');
        $('#' + fieldId).parent().find('.validation-message').remove();
    }

    function submitUsers() {
        var nurseLocationId = ENearByZoneIDs || '0'; 

        var username = ($('#txtUserName').val() || '').trim();
        var displayName = ($('#username').val() || '').trim();
        var role = ($('#search_RoleName').val() || '').trim();
        var departmentIds = $('#txtDepartmentId').val() || [];
        var isActive = $('#chkIsActive').attr('src').includes("CCheck.png") ? "1" : "0";
        var id = ($('#hdnUserID').val() || '').trim();
        var email = ($('#txtEmail').val() || '').trim();
        var division = getCheckedValues("MultiPorterDivision") || [];
        var shift = getCheckedValues("MultiPorterShift") || [];
        var device = ($('#txtDevice').val() || '').trim();
        var departmentIdsString = '';

        if (Array.isArray(departmentIds) && departmentIds.length > 0) {
            departmentIdsString = departmentIds.join(',');
        } else if (typeof departmentIds === 'string' && departmentIds.trim() !== '') {
            departmentIdsString = departmentIds;
        }

        $('#txtUserName, #username').removeClass('input-error');
        $('.SumoSelect').removeClass('input-error');
        $('#errorUserName, #errorDisplayName, #errorRolename').text('');

        let isValid = true;

        let hasError = false;

        if (!displayName) {
            $('#username').css('border', '1px solid red');
            showValidationMessage('username', 'Display Name is required.');
            isValid = false;
        }

        if (!username) {
            $('#txtUserName').css('border', '1px solid red');
            showValidationMessage('txtUserName', 'User Name is required.');
            isValid = false;
        }

        if (!role || role === '0') {
            $('#search_RoleName')
                .closest('.SumoSelect')
                .find('.CaptionCont')
                .css('border', '1px solid red');

            showValidationMessage('search_RoleName', 'Role is required.');
            isValid = false;
        } else {
            $('#search_RoleName')
                .closest('.SumoSelect')
                .find('.CaptionCont')
                .css('border', '1px solid #ced4da');
        }

        if (!isValid) {

            setTimeout(function () {

                $('.validation-message').fadeOut(300, function () {
                    $(this).remove();
                });

                setTimeout(function () {
                    $('.form-control').css('border', '1px solid #ced4da');
                    $('.SumoSelect .CaptionCont').css('border', '1px solid #ced4da');
                }, 300);
            }, 2000);

            return false;
        }


        var encProcess = encodeURIComponent(Encrypt("UPDATEUSER").toString());
        var encUsername = encodeURIComponent(Encrypt(username).toString());
        var encMid = encodeURIComponent(Encrypt(displayName).toString());
        var encRole = encodeURIComponent(Encrypt(role).toString());
        var encDepartmentIds = encodeURIComponent(Encrypt(departmentIdsString).toString());
        var encDepartmentIds = encodeURIComponent(Encrypt(departmentIds.join(',')).toString());
        var encIsActive = encodeURIComponent(Encrypt(isActive).toString());
        var encEmail = encodeURIComponent(Encrypt(email).toString());
        var encId = encodeURIComponent(Encrypt(id).toString());
        var encDivision = encodeURIComponent(Encrypt(division.join(',')).toString());
        var encShift = encodeURIComponent(Encrypt(shift.join(',')).toString());
        var encDevice = encodeURIComponent(Encrypt(device).toString());
        var encShortName = encodeURIComponent(Encrypt(displayName).toString());
        var encNurseLocationId = encodeURIComponent(Encrypt(nurseLocationId).toString());

        var url = `${hurl}Service/Service.aspx?Process=${encProcess}&USERNAME=${encUsername}&MID=${encMid}&ROLENAME=${encRole}&DEPARTMENTIDS=${encDepartmentIds}&ISACTIVE=${encIsActive}&EMAIL=${encEmail}&ID=${encId}&DIVISION=${encDivision}&SHIFT=${encShift}&DEVICE=${encDevice}&SHORT=${encShortName}&NURSELOCATIONID=${encNurseLocationId}`;
        $.ajax({
            url: url,
            method: "POST",
            data: 'pData',
            dataType: "json",
            success: function (res) {
                var result = '';

                if (res && res.result) {
                    result = res.result;
                }
                else if (res && res[0] && res[0].RESULT) {
                    result = res[0].RESULT;
                }
                else if (res && res[0]) {
                    result = res[0];
                }
                else {
                    console.error("Unexpected response structure:", res);
                    $('#modalAlert .mb-3.text-center span').text('Invalid response from server');
                    new bootstrap.Modal(document.getElementById('modalAlert'), { keyboard: false }).show();
                    return;
                }

                var isSuccess = result.split("_")[0] === "TRUE";
                var message = result.split("_")[1] || `User "${username}" processed successfully`;

                if (isSuccess) {
                    $('#LBLRequestResult').text(message);
                    new bootstrap.Modal(document.getElementById('modalSuccess'), { keyboard: false }).show();
                    setTimeout(function () {
                        $('#modalSuccess').modal('hide');
                        $('#addUser').modal('hide');
                        LoadProcess();
                        clearUserForm();
                    }, 2000);
                } else {
                    $('#modalAlert .mb-3.text-center span').text(message || `User "${username}" operation failed.`);
                    new bootstrap.Modal(document.getElementById('modalAlert'), { keyboard: false }).show();
                    setTimeout(function () {
                        $('#modalAlert').modal('hide');
                    }, 3000);
                }
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", status, error, xhr.responseText);
            }
        });
    }

    function deleteLocation() {
        var username = $('#txtUserName').val().trim();
        var userId = $('#hdnUserId').val();

        if (!username && !userId) {
            alert("Please select a user to delete.");
            return;
        }

        var encProcess = Encrypt("DELETEUSER").toString();
        var encUsername = Encrypt(username || "").toString();
        var encId = Encrypt(userId || "").toString();

        $.ajax({
            async: true,
            url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(encProcess) +
                "&USERNAME=" + encodeURIComponent(encUsername) +
                "&ID=" + encodeURIComponent(encId),
            type: 'POST',
            data: 'pData',
            dataType: 'json',
            success: function (data) {
                var res = data;

                if (res && res.result === 'TRUE') {
                    $('#LBLRequestResult').html('User "' + username + '" removed successfully.');
                    HideModalPopUp('addUser');
                    ShowModalPopUp('modalSuccess');
                    setTimeout(function () { HideModalPopUp('modalSuccess'); }, 2500);
                    LoadProcess();
                } else {
                    alert('Failed to delete user.');
                }
            },
            error: function (xhr, status, error) {
                alert('Error deleting user: ' + error);
            }
        });
    }

</script>