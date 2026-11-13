var arr = ["TextSOURCE", "TextCATEGORY", "TextDESTINATION"], ReqIcon = ["tdReqNew", "tdReqPending", "tdReqAssigned", "tdReqInProc", "tdReqCompleted", "tdReqCancelled", "tdPreBook", "tdReqMap"],
    Source = '', Dest = '', User = '', Cat = '', AStatus = '', CancelReqId = '', EStatus = '', Intervl = 0, EReqId = '', ReqArr = ["tdReqPending", "tdReqAssigned", "tdReqInProc", "tdReqCompleted", "tdReqCancelled", "tdPreBook"],
    CurPendProcess = '', AReqId = '', MReqId = '', IsChecked = false, Port = '', Name = "", RequestType = '', CurrentCancelStatus = '';

var arrRoles = ['2_SUPERVISOR', '3_NURSE']; // '1_APPUSER', 

//function LoaddrRoles() {

//    $('#search_RoleName').html(''); $('#search_RoleName')[0].sumo.add('0', '-- Select --'); $('#search_RoleName')[0].sumo.reload();
//    $.each(arrRoles, function (index, value) {
//        $('#search_RoleName')[0].sumo.add(value.split('_')[0], value.split('_')[1]);
//    });
//}


function LoaddrRoles() {
    var arrRoles = [];
    $.ajax({
        async: true,
        url: hurl + "SERVICE/Service.aspx?Process=GETUSERROLES",
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            if (data.length > 0) {
                arrRoles = data[0].RESULT.split(',');
                $('#search_RoleName').html(''); $('#search_RoleName')[0].sumo.add('0', '-- Select --'); $('#search_RoleName')[0].sumo.reload();
                $.each(arrRoles, function (index, value) {
                    $('#search_RoleName')[0].sumo.add(value.split('_')[0], value.split('_')[1]);
                });
            }

        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });
}


function RefreshCurrent() {
    ShowModalPopUp('ModalLoading');
    AbortAllActiveRuquests();
    LoadProcess(CProcess);
    ToUpdate = !ToUpdate;
    ReloadLinks();
    setTimeout("HideModalPopUp('ModalLoading')", 1500);
}

function GetRecords(target) {
    Target = target;
    switch (Target) {
        case "TextSOURCE":
            NextCtrl = 'TextCATEGORY'; Dialog = 'ModalLocation';
            break;
        case "TextDESTINATION":
            NextCtrl = 'ImgSend'; Dialog = 'ModalDestLocation';
            break;
        case "TextCATEGORY":
            NextCtrl = 'TextDESTINATION'; Dialog = 'ModalCategory';
            break;
    }
    $('#' + Dialog).modal('show');
    setTimeout(function () { var ctrl = (Dialog == 'ModalLocation') ? 'txtSourceLoc' : 'txtDestLoc'; $('#' + ctrl).focus() }, 500);
}
function FromHomeFn() {
    var FromHome = sessionStorage.getItem('FromHome');
    if (FromHome == 'true')
        PreSelect();
    else
        Select($("#tdReqNew"));
    clearInterval(TimerHome);
}

function PreSelect() {
    var ProcessElement = $("#" + sessionStorage.getItem('RequestPageFn'));
    Select(ProcessElement);
    sessionStorage.setItem('FromHome', 'false');
}

function findMRDDetails() {

    var TrimedValue = FormatValue($('#textMRD').val());
    MRDPatientName = '';

    $('#textMRD').val(TrimedValue);
    var Value = TrimedValue;
    if (Value.length > 4)
        setMRDPatientName(Value);
    else
        $('#spanMRDPatient').html('');

}
function FormatValue(rawValue) {
    //var charNotAllowed = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '+', '=', ':', ';', ' ', '{', '}', '[', '}', '/']
    //var regex = new RegExp("^[a-zA-Z0-9]+$");
    var FinalValue = rawValue.replace(/[^\w\s]/gi, '').replace(/\s/g, '');

    /* $.each(charNotAllowed, function (index, char) {
         if (rawValue.indexOf(char) != -1)
             FinalValue.replace('/' + char + '/g', "")
     }); */
    return FinalValue;
}

function setMRDPatientName(MRDNo) {
    var PUrl = Rurl + "Process=GETPATIENTNAMEMRD&MRDNO=" + MRDNo;
    $.ajax({
        async: true,
        url: PUrl,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            var PatientName = data[0].RESULT;
            $('#spanMRDPatient').html(PatientName);
            if (PatientName.length > 0)
                MRDPatientName = PatientName;
            else
                $('#spanMRDPatient').html('');


        },
        error: function (data) {

        }

    });
}

function LoadPresetRemarks() {
    $.ajax({
        url: Rurl + "Process=PRESET&ACTION=GET&MSG=&GROUP=&ID=",
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            var dataRemarks = $.grep(data, function (element, index) {
                return element.GROUPNAME == "REMARKS";
            });

            var dataReason = $.grep(data, function (element, index) {
                return element.GROUPNAME == "EREASON";
            });
            var FReason = $.grep(data, function (element, index) {
                return element.GROUPNAME == "FREASON";
            });
            var CReason = $.grep(data, function (element, index) {
                return element.GROUPNAME == "CREASON";
            });




            //$("#drpPresetRemarks").empty();
            //$.each(dataRemarks, function (key, value) {
            //    $("#drpPresetRemarks").append($("<option     />").val(value.ID).text(value.MESSAGE));
            //});
            //$("#drpPresetRemarks").append($("<option     />").val('0').text('OTHERS'));

            $("#drpPresetReason").empty();
            $.each(dataReason, function (key, value) {
                $("#drpPresetReason").append($("<option     />").val(value.ID).text(value.MESSAGE));
            });


            $("#drpCancelReason").empty();
            $.each(CReason, function (key, value) {
                $("#drpCancelReason").append($("<option     />").val(value.ID).text(value.MESSAGE));
            });
            $("#drpCancelReason").append($("<option     />").val('0').text('OTHERS'));

            $("#drpFinishReason").empty();
            $.each(FReason, function (key, value) {
                $("#drpFinishReason").append($("<option     />").val(value.ID).text(value.MESSAGE));
            });
            $("#drpFinishReason").append($("<option     />").val('0').text('OTHERS'));
            //$("#drpPresetReason").append($("<option     />").val('0').text('OTHERS'));
        },
        error: function (data) {

        }

    });
}
function LoadFloor() {
    $.ajax({
        async: true,
        url: Rurl + "Process=GETFLOOR",
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            $('#drpDestFloor').find('option').remove().end();
            $('#drpFloor').find('option').remove().end();
            $.each(data, function (i, item) {
                $("#drpFloor").append($("<option/>").val(data[i].FLOORID).text(data[i].FLOORNAME));
                $("#drpDestFloor").append($("<option/>").val(data[i].FLOORID).text(data[i].FLOORNAME));
            });
            LoadMasterRecords();
        },
        error: function (data) {

        }
    });
}
function LoadMasterRecords() {
    $.ajax({
        async: true,
        url: hurl + "SERVICE/Service.aspx?Process=GETMASTERRECORD",
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            var Content = data[0].RESULT.split('$$$')[0], DestContent = Content.replace(/id="Loc/g, 'id="DLoc').replace(/for="Loc/g, 'for="DLoc');
            $('#DivDestLocContent').html(DestContent);
            $('#DivLocContent').html(Content);
            $('#DivCategoryContent').html(data[0].RESULT.split('$$$')[1]);
            $('#DivECategoryContent').html(data[0].RESULT.split('$$$')[2]);

        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });
}

function ChangeFloor(floor, content) {
    $.ajax({
        async: true,
        url: Rurl + "Process=GETLOCATION&FLOORID=" + $('#' + floor + '').val(),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            $('#' + content + '').html(data[0].RESULT);
        },
        error: function (data) {

        }

    });
}
function changePorter() {
    var src = $('#ImgMultiPorter').attr('src'); //alert(src);
    $('#ImgMultiPorter').attr("src", (src == "images/MultiUnselect.png") ? "images/MultiSelected.png" : "images/MultiUnselect.png");
}

function changeMPorter() {
    var src = $('#ImgMPorter').attr('src'); //alert(src);
    $('#ImgMPorter').attr("src", (src == "images/MUnselect.png") ? "images/MSelected.png" : "images/MUnselect.png");
    sessionStorage.setItem('DMT', ((src == "images/MUnselect.png") ? "1" : "0"));
}
function GetMap() {
    CheckPendingRequests();
}
function CheckPendingRequests() {
    var PendingRequest = '', UId = sessionStorage.getItem('ID');
    $.ajax({
        async: true,
        url: Rurl + "Process=GETPENDINGREQUESTS&USERID=" + UId,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            $.each(data, function () {
                $.each(this, function (name, value) {
                    PendingRequest += (!$.trim(PendingRequest)) ? value : '-' + value;
                });
            });
            if ($.trim(PendingRequest)) {
                sessionStorage.setItem('REQUESTS', PendingRequest);
                var loc = window.location.href;
                window.location = loc.replace("Request", "Map");
            }
        },
        error: function (data) {

        }

    });
}
function Open() {
    $('#ModalLocation').modal('show');
}
function ShowModalPopUp(ModalId) {
    $('#' + ModalId).modal('show');
}
function HideModalPopUp(ModalId) {
    $('#' + ModalId).modal('hide');
}
function Validate(cont) {
    var returnval = true;
    //$.each(arr, function (i, val) {
    //    var Value = (val == "TextCATEGORY") ? $('#' + val).attr('src') : $('#' + val).text(); Value = $.trim(Value); Value = ((Value == "FROM") || (Value == "TO") || (Value == "images/PorterSelect.png")) ? '' : Value;
    //    if (Value.length == 0) {
    //        GetRecords(val);
    //        returnval = false;
    //    }
    //    return returnval;
    //});
    //if (returnval && cont) {
    //    // if (CheckIsValidTime()) {
    //    var ExtentionNo = $.trim($('#txtReqRemarks').val()), MRDNo = $.trim($('#textMRD').val());

    //    if (ExtentionNo.length == 0) {
    //        $('#txtReqRemarks').focus();
    //        $('#txtReqRemarks').css('background-color', '#ff7171'); setTimeout(function () { $('#txtReqRemarks').css('background-color', 'white'); }, 2500)
    //        return false;
    //    }
    //    else if (IsMRD == 'YES' && (MRDNo.length == 0)) {
    //        $('#textMRD').focus();
    //        $('#textMRD').css('background-color', '#ff7171'); setTimeout(function () { $('#textMRD').css('background-color', 'white'); }, 2500)
    //        return false;
    //    }
    //    else
    //        InsertRequest();
    //    //}
    //    //else {
    //    //    ShowModalPopUp('ModalTimeLimit');
    //    //    setTimeout("HideModalPopUp('ModalTimeLimit')", 5000);
    //    //}

    //}
    ShowModalPopUp('ModalTimeLimit');
}
function CheckIsValidTime() {
    var dt = new Date(), TdateFormatted = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear(),
        startTime = TdateFormatted + " " + "08:00", EndTime = TdateFormatted + " " + "20:00";

    var stt = new Date(startTime); stt = stt.getTime();
    var endt = new Date(EndTime); endt = endt.getTime();
    var time = dt.getTime();

    if (time > stt && time < endt)
        return true;
    else
        return false;
}
function GetPBDate(TPBDate) {
    //var PBDate = ((TPBDate != 'Pre-Book') ? (TPBDate.split('/')[1] + '/' + TPBDate.split('/')[0] + '/' + TPBDate.split('/')[2]) : TPBDate);
    return ((TPBDate != 'Pre-Book') ? (TPBDate.split('/')[1] + '/' + TPBDate.split('/')[0] + '/' + TPBDate.split('/')[2]) : TPBDate);

}
function InsertRequest() {
    var Visiblility = $('#ImgMultiPorter').css("visibility"), MultiSrc = $('#ImgMultiPorter').attr('src'), IsMultiPorter = ((MultiSrc == 'images/MultiSelected.png') && (Visiblility == 'visible')) ? "1" : "0",
        UID = sessionStorage.getItem('ID'), time = (((new Date().getHours().toString()).length <= 1) ? ("0" + new Date().getHours().toString()) : (new Date().getHours()))
            + ":" + (((new Date().getMinutes().toString()).length <= 1) ? ("0" + new Date().getMinutes()) : new Date().getMinutes()),
        PBDate = GetPBDate($('#requestdate').val());
    var PatientName = FPatientName + '_' + TPatientName, MRDNo = $.trim($('#textMRD').val());
    //var drpRemarks = $("#drpPresetRemarks").val(),
    //    ReqRemarks = (drpRemarks == "0") ? $('#txtReqRemarks').val() : $("#drpPresetRemarks option:selected").text();
    var ReqRemarks = $('#txtReqRemarks').val();

    prebook = (prebook !== 'yes') ? (($('#requestdate').val() == "Pre-Book") ? "" : 'yes') : prebook;

    $.ajax({
        async: true,
        url: hurl + "Service/Service.aspx?Process=INSERT&TIME=" + time + "&REMARK=" + ReqRemarks + "&SOURCE=" + Source + "&HALT1=&HALT2=&DESTINATION=" + Dest + "&CATEGORY=" + Cat + "&PRIORITY=0&ISMULTIPORTER=" + IsMultiPorter + "&USERID=" + UID + "&PREBOOKING=" + (prebook + ',' + PBDate) + "&PATIENTNAME=" + PatientName + "&MRD=" + MRDNo + '_' + MRDPatientName,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            ToUpdate = !ToUpdate; ReloadLinks();
            if (data[0].RESULT.split("_")[0] === 'TRUE' && prebook !== 'yes') {
                ShowModalPopUp('ModalDone'); ClearRequest();
                GetMap();
            }
            else if (data[0].RESULT.split("_")[0] === 'WAIT') {
                var startAt = data[0].RESULT.split("_")[1];
                $('#LBL2min').text('You can not request porter until ' + startAt);
                ShowModalPopUp('ModelAfter2min');
                setTimeout("HideModalPopUp('ModelAfter2min');", 3500);
            }
            else if (data[0].RESULT.split("_")[0] === 'FALSE') {
                ShowModalPopUp('ModalRequestExist');
                setTimeout("HideModalPopUp('ModalRequestExist');", 3500);
            }
            else if (data[0].RESULT.split("_")[0] === 'INVALID') {
                ShowModalPopUp('ModalTimeLimit');
                setTimeout("HideModalPopUp('ModalTimeLimit');", 3500);
            }
            prebook = '';
            setTimeout("HideModalPopUp('ModalDone');", 1500);
            calldatetime();
        },
        error: function (xhr, ajaxOptions, thrownError) {
        }

    });
}
function ClearRequest() {
    calldatetime(); $('#txtReqRemarks').val('');// $('#txtReqRemarks').css("display", "none");
    // $("select#drpPresetRemarks")[0].selectedIndex = 0;
    $('#ImgMultiPorter').css("visibility", "hidden");
    $('#ImgMultiPorter').attr("src", "images/MultiUnselect.png");
    $('#TextCATEGORY').attr('src', "images/PorterSelect.png");
    $('#TextSOURCE').html('FROM');
    $('#TextDESTINATION').html('TO');
    FPatientName = ''; TPatientName = '';
    $('#spanFromPatient').html(''); $('#txtReqRemarks').val(''); $('#textMRD').val('');
    $('#spanToPatient').html(''); IsMRD = 'NO'; MRDPatientName = ''; $('#spanMRDPatient').html('');
}
function CloseandBind(Id, Value, BedID) {
    var NextValue = '';
    switch (Target) {
        case "TextSOURCE":
            $('#DivLocContent').find('input[type=radio]:checked').removeAttr('checked');
            $('#DivDestLocContent').find('input[type=radio]:checked').removeAttr('checked');
            sessionStorage.setItem('FROM', Value);
            NextValue = $('#TextCATEGORY').attr('src'); NextValue = (NextValue == "images/PorterSelect.png") ? '' : NextValue;
            Source = Id;
            setPatientName(BedID, 'From');
            break;
        case "TextDESTINATION":
            $('#DivLocContent').find('input[type=radio]:checked').removeAttr('checked');
            $('#DivDestLocContent').find('input[type=radio]:checked').removeAttr('checked');
            sessionStorage.setItem('TO', Value);
            NextValue = $('#ImgSend').attr('src');
            Dest = Id;
            setPatientName(BedID, 'To');
            break;
        case "TextCATEGORY":
            $('#TextCATEGORY').attr('src', hurl + 'images/Category/' + Value); sessionStorage.setItem('CATEGORY', hurl + 'images/MapCategory/' + Value);
            $('#ImgMultiPorter').css("visibility", "visible");
            NextValue = $('#' + NextCtrl).html(); NextValue = (NextValue == "TO") ? '' : NextValue;
            Cat = Id; IsMRD = BedID;
            break;
    }
    $('#' + Target).text(Value);
    $('#' + Dialog).modal('hide');
    if (NextValue.length == 0)
        GetRecords(NextCtrl);
    else if ($.inArray(NextCtrl, arr) != -1)
        Validate(false);

}


/*-------------- Request Count Updation------------------*/

function RestartTimer() {
    Reload = window.setInterval(function () { AbortAllActiveRuquests(); ReloadLinks(); }, 90000);
}

function ReloadLinks() {
    var CRole = sessionStorage.getItem('ROLE');
    if (sessionStorage.getItem('ROLE') == null)
        window.location = "../Login.aspx";
    if (CRole === "1" || (!ToUpdate)) {
        ReloadLinksButton();
        ToUpdate = (!ToUpdate) ? (!ToUpdate) : ToUpdate;
    }
}

function ReloadLinksButton() {
    var UID = sessionStorage.getItem('ID'), CountROLE = sessionStorage.getItem('ROLE');
    $.ajax({
        async: true,
        url: hurl + "Service/Service.aspx?Process=GETCOUNT&USERID=" + UID + "&ROLE=" + CountROLE,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            var PendingCount = data[0].ACCEPTED, AssignedCount = data[0].ASSIGNED, InprogressCount = data[0].PROGRESS,
                CompletedCount = data[0].COMPLETED, CancelledCount = data[0].CANCELLED, PreBookCount = data[0].PREBOOK;
            $('#PendingCount').text((PendingCount == null) ? '00' : (PendingCount.toString().length == 1) ? '0' + PendingCount.toString() : PendingCount.toString());
            $('#AssignedCount').text((AssignedCount == null) ? '00' : (AssignedCount.toString().length == 1) ? '0' + AssignedCount.toString() : AssignedCount.toString());
            $('#InprogressCount').text((InprogressCount == null) ? '00' : (InprogressCount.toString().length == 1) ? '0' + InprogressCount.toString() : InprogressCount.toString());
            $('#CompletedCount').text((CompletedCount == null) ? '00' : (CompletedCount.toString().length == 1) ? '0' + CompletedCount.toString() : CompletedCount.toString());
            $('#CancelledCount').text((CancelledCount == null) ? '00' : (CancelledCount.toString().length == 1) ? '0' + CancelledCount.toString() : CancelledCount.toString());
            $('#PreBookCount').text((PreBookCount == null) ? '00' : (PreBookCount.toString().length == 1) ? '0' + PreBookCount.toString() : PreBookCount.toString());
            if (data.length == 2) {
                //var docMov = data[1].DOCMOVEMENT, OtherMov = data[1].OTHERMOVEMENT;
                var AvailPorter = data[1].AVAILABLEPORTER, TotalPorter = data[1].TOTALPORTER;
                $('#PorterCountOtherMov').text((AvailPorter == null) ? '00' : (AvailPorter.toString().length == 1) ? '0' + AvailPorter.toString() : AvailPorter.toString());
                $('#PorterCountSampleMov').text((TotalPorter == null) ? '00' : (TotalPorter.toString().length == 1) ? '0' + TotalPorter.toString() : TotalPorter.toString());
            } else {
                $('#PorterCountSampleMov').text("00");
                $('#PorterCountOtherMov').text("00");
            }
        },
        error: function (data) {

        }
    });
}

/*---------------- Grid Related Process ---------------------*/

function LoadGrid() {
    var encProcess = Encrypt("GETCATEGORYS").toString();
    var encSearch = Encrypt($('#TextSearchLocation').val()).toString();
    var encPageIndex = Encrypt(pageIndex.toString()).toString();
    var encPageSize = Encrypt(pageSize.toString()).toString();
    var encServiceId = Encrypt(ServiceCode.toString()).toString();

    var FinalUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(encProcess) +
        "&Search=" + encodeURIComponent(encSearch) +
        "&PageIndex=" + encodeURIComponent(encPageIndex) +
        "&PageSize=" + encodeURIComponent(encPageSize) +
        "&SERVICEID=" + encodeURIComponent(encServiceId);

    $.ajax({
        url: FinalUrl,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (typeof (grid) != 'undefined' && grid != null) {
                grid.clearSelectedItems();
                tableView = grid.get_masterTableView();
                if (data.length > 0)
                    updateVirtualItemCount(data[0].VIC, tableView)
                else
                    updateVirtualItemCount(data.length, tableView)
                if (pageIndex == '0')
                    tableView.set_currentPageIndex(pageIndex);
                tableView.set_dataSource(data);
                tableView.dataBind();
                HideModalPopUp('ModalLoading');
            }
        },
        error: function (data) {

        }

    });
}

function BuildHeader() {

    var Header = " filter value:- " + $('#TextSearchLocation').val() + " <br/>  <br/>";

    return Encrypt(Header);

}
function updateVirtualItemCount(result, tableView) {
    tableView.set_virtualItemCount(result);
}
function MultiTasking() {
    var IsValid = true;
    if (MANPorterID.length == 0) {
        IsValid = (!IsValid);
        showMAPORTERs('MAPORTER');
    }
    if (IsValid) {
        ShowModalPopUp('ModalDone');
        $.ajax({
            async: false,
            url: Rurl + "Process=MULTITASK&REQUESTID=" + MANReqID + "&PORTERID=" + MANPorterID + "&DEPT=COMMON",
            type: 'POST',
            data: 'pData',
            dataType: 'json',
            success: function (data) {
                if (data[0].RESULT === 'TRUE') {
                    clearMANAssign();
                    LoadProcess("2"); ReloadLinksButton();
                }
                setTimeout("HideModalPopUp('ModalDone');", 1500);
            },
            error: function (data) {

            }

        });
    }
}
function SetGridRole(grid, ReqStatusID) {
    var CRole = sessionStorage.getItem('ROLE').toUpperCase(), HeadChk = grid.getColumnByUniqueName("SELECT").get_element();
    $(HeadChk).html('SELECT');
    grid.hideColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
    grid.showColumn(grid.getColumnByUniqueName("MULTITASK").get_element().cellIndex);
    grid.hideColumn(grid.getColumnByUniqueName("CURRENTLOCATION").get_element().cellIndex);
    grid.hideColumn(grid.getColumnByUniqueName("LOCATE").get_element().cellIndex);
    grid.hideColumn(grid.getColumnByUniqueName("BUZZER").get_element().cellIndex);
    //grid.hideColumn(grid.getColumnByUniqueName("REMARKS").get_element().cellIndex);
    grid.hideColumn(grid.getColumnByUniqueName("FINISH").get_element().cellIndex);
    grid.getColumnByUniqueName("DELAYREASON").get_element().innerHTML = "DELAY REASON";
    grid.getColumnByUniqueName("REMARKS").get_element().innerHTML = "REMARKS";
    grid.hideColumn(grid.getColumnByUniqueName("REMARKS").get_element().cellIndex);
    grid.hideColumn(grid.getColumnByUniqueName("DELAYREASON").get_element().cellIndex);
    grid.hideColumn(grid.getColumnByUniqueName("MULTITASK").get_element().cellIndex);
    grid.hideColumn(grid.getColumnByUniqueName("CANCELLEDAT").get_element().cellIndex);
    grid.getColumnByUniqueName("ASSIGNEDTIME").get_element().innerHTML = "ASSIGN TIME";
    grid.getColumnByUniqueName("FINISH").get_element().innerHTML = "FINISH";
    grid.getColumnByUniqueName("TIME").get_element().innerHTML = "REQ TIME";
    grid.hideColumn(0); clearMANAssign('DB');
    $('#TableAssignSearch').css('visibility', 'hidden');
    $('#TableAssignSearch').css('display', 'none');
    $('#myonoffswitch').prop('checked', true);
    $('#tdMAPORTERInfo').css('display', 'none');
    $('#tblMultiTasking').css('display', (((CRole === "1" || CRole === "6" || CRole === "12" || CRole === "2") && (ReqStatusID == '2')) ? "table" : "none"));
    switch (ReqStatusID) {
        case "1":
        case "2":
            //grid.showColumn(0);

            if (CRole === "1" || CRole == "11" || CRole == "12") {
                grid.showColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
                grid.getColumnByUniqueName("DELAYREASON").get_element().innerHTML = "CANCEL";
                grid.showColumn(grid.getColumnByUniqueName("DELAYREASON").get_element().cellIndex);
            }
            else {
                grid.hideColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
                //grid.hideColumn(grid.getColumnByUniqueName("DELAYREASON").get_element().cellIndex);
            }
            grid.getColumnByUniqueName("NEXT").get_element().innerHTML = "EMERGENCY";
            grid.hideColumn(grid.getColumnByUniqueName("ASSIGNEDTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ASSIGNTO").get_element().cellIndex);
            break;
        case "3":
        case "4":
        case "5":
            if (CRole === "1") {
                $('#TableAssignSearch').css('visibility', 'visible');
                $('#TableAssignSearch').css('display', 'table');
                grid.showColumn(grid.getColumnByUniqueName("FINISH").get_element().cellIndex);
            }
            grid.hideColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
            if (ReqStatusID == 4) {
                grid.showColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
                if (CRole == "1")
                    grid.showColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
            }
            else {
                //                switch (CRole) {
                //                    case "1":
                //                        grid.showColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
                //                        break;
                //                }
                grid.showColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
                if (ReqStatusID == 3)
                    grid.hideColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
                else
                    grid.showColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            }
            if (ReqStatusID == 3 || ReqStatusID == 4) {
                grid.showColumn(grid.getColumnByUniqueName("CURRENTLOCATION").get_element().cellIndex);
                grid.showColumn(grid.getColumnByUniqueName("LOCATE").get_element().cellIndex);
                grid.showColumn(grid.getColumnByUniqueName("BUZZER").get_element().cellIndex);
            }
            grid.getColumnByUniqueName("FINISH").get_element().innerHTML = (ReqStatusID == "3") ? "START" : "FINISH";
            grid.getColumnByUniqueName("NEXT").get_element().innerHTML = "CANCEL";
            grid.showColumn(grid.getColumnByUniqueName("ASSIGNEDTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ASSIGNTO").get_element().cellIndex);
            if (ReqStatusID == 5) {
                grid.hideColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
                grid.showColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
                grid.showColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
                grid.showColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            }
            break;
        case "6":
            grid.hideColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ASSIGNEDTIME").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("ASSIGNTO").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
            break;
        case "7":
            grid.hideColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("REMARKS").get_element().cellIndex);
            grid.getColumnByUniqueName("REMARKS").get_element().innerHTML = "CANCEL REASON";
            grid.hideColumn(grid.getColumnByUniqueName("ASSIGNEDTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ASSIGNTO").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("CANCELLEDAT").get_element().cellIndex);
            break;
        case "100":
            grid.showColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
            grid.getColumnByUniqueName("NEXT").get_element().innerHTML = "CANCEL";
            grid.showColumn(grid.getColumnByUniqueName("ASSIGNEDTIME").get_element().cellIndex);
            grid.getColumnByUniqueName("ASSIGNEDTIME").get_element().innerHTML = "BOOKING DATE";
            grid.getColumnByUniqueName("TIME").get_element().innerHTML = "REQUEST DATE";
            grid.showColumn(grid.getColumnByUniqueName("REMARKS").get_element().cellIndex)
            grid.getColumnByUniqueName("REMARKS").get_element().innerHTML = "CANCEL REASON";
            grid.hideColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TAT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("TTAT").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ENDTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("STARTTIME").get_element().cellIndex);
            grid.hideColumn(grid.getColumnByUniqueName("ASSIGNTO").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("UPDATEDBY").get_element().cellIndex);
            grid.showColumn(grid.getColumnByUniqueName("CANCELLEDAT").get_element().cellIndex);
            break;
    }
}

function AbortAllActiveRuquests() {
    $($.xhrPool).each(function (i, jqXHR) {   //  cycle through list of recorded connection
        jqXHR.abort();  //  aborts connection
        $.xhrPool.splice(i, 1); //  removes from list by index
    });
}


function GridUser_Command(sender, args) {
    args.set_cancel(true);
    pageIndex = parseInt(sender.get_masterTableView().get_currentPageIndex());
    pageSize = sender.get_masterTableView().get_pageSize();
    switch (args.get_commandName()) {
        case "Page":
        case "PageSize":
            ShowModalPopUp('ModalLoading');
            LoadProcess();
            break;
    }
}

function OnRowCreated(sender, args) {
    //args.get_item().get_cell('LOCATE').onclick = function () {
    //    var LTagId = args.get_item().getDataKeyValue("TAGID"), PName = args.get_item().getDataKeyValue("ASSIGNTO"),
    //        wind = window.open('../Track/Popup.aspx?TagId=' + LTagId + "&Name=" + PName, 'TRACKING : #' + PName, 'directories=no,titlebar=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=1000,height=500');
    //};
    //args.get_item().get_cell('BUZZER').onclick = function () {
    //    var CRole = sessionStorage.getItem('ROLE').toUpperCase();
    //    var LTagId = args.get_item().getDataKeyValue("TAGID"), ABTAT = args.get_item().getDataKeyValue("ASGNTAT");
    //    if ((CRole == '1') || (ABTAT > 9)) {
    //        ShowModalPopUp('ModalDone');
    //        $.ajax({
    //            url: Burl + LTagId,
    //            type: 'POST',
    //            data: 'pData',
    //            dataType: 'json',
    //            success: function (data) {
    //                if (data[0].RESULT === 'TRUE')
    //                    setTimeout("HideModalPopUp('ModalDone');", 1500);
    //            },
    //            error: function (data) {

    //            }

    //        });
    //    }
    //};
}

function rowSelecting(sender, args) {
    var RowCurrent = tableView.get_dataItems()[args.get_itemIndexHierarchical()], CheckBox = $get(args.get_id()).getElementsByTagName("input")[0];
    //alert('typeof (CheckBox) : ' + typeof (CheckBox));
    if (tableView.get_selectedItems().length == 0) { ConSelect = true; }
    if ((RowCurrent.getDataKeyValue("MULTIPORTER") == 'YES' && tableView.get_selectedItems().length > 0) || (!ConSelect) || (typeof (CheckBox) == 'undefined')) {
        RowCurrent.set_selected(false);
        if (typeof (CheckBox) != 'undefined')
            CheckBox.checked = false;
        args.set_cancel(true);
    }
    if (RowCurrent.getDataKeyValue("MULTIPORTER") == 'YES' && tableView.get_selectedItems().length == 0) { ConSelect = false; }
}


function rowOnClick(sender, args) {
    var category = args.getDataKeyValue("CATEGORY"), catID = args.getDataKeyValue("CATEGORYID"), MIndex = args.getDataKeyValue("MULTITASKINDEX"), from = args.getDataKeyValue("SOURCE"), DId = args.getDataKeyValue("DESTINATIONLOCATIONID"), dstatus = args.getDataKeyValue("STATUS"),
        Destination = args.getDataKeyValue("UDEST"), ReqNB = args.getDataKeyValue("REQNO"), ReqID = args.getDataKeyValue("REQUESTID"), priority = args.getDataKeyValue("PRIORITY"), MultiPorter = args.getDataKeyValue("MULTIPORTER"),
        eleCategory = $('#RequsetCategory'), DCat = args.getDataKeyValue("UCAT"), txtDest = args.getDataKeyValue("SDESTINATION"), PatientName = args.getDataKeyValue("PATIENTNAME"), userName = args.getDataKeyValue("USER"), extn_No = args.getDataKeyValue("EXTN_NO");;

    var CRole = sessionStorage.getItem('ROLE').toUpperCase();
    //alert(MIndex);
    if (dstatus == '2' || dstatus == '3' || (dstatus == '4' && (CRole === "1" || CRole === "12"))) {
        $("#RequsetCategory").css("cursor", ((MIndex == '0') ? "pointer" : "not-allowed")); $('#ImgMPorter').attr("src", (MultiPorter == 'YES') ? "images/MSelected.png" : "images/MUnselect.png");
        $("#ImgMPorter").css("visibility", (((parseInt(dstatus) == 2) && (MIndex == '0')) ? "visible" : "hidden")).css("cursor", "pointer");


        if (MIndex == '0') {
            $(eleCategory).click(function () {
                if (MIndex == '0') {
                    ShowModalPopUp('ModalECategory'); ECategory = category;
                    IsEdit = 'YES';
                } else
                    return false;
            });
        }
        var LTagId = args.getDataKeyValue("TAGID"), STagId = args.getDataKeyValue("STAGID");
        LTagId = ((LTagId == null) ? '' : LTagId); STagId = ((STagId == null) ? '' : STagId)
        CurrentDStatus = ((dstatus == '2') && (priority != 'LOW')) ? '12' : dstatus;
        var TagId = ((LTagId.length > 0) ? LTagId : '') + ((STagId.length > 0) ? "_" + STagId : ''); GPatientName = PatientName; GFrom = from; GStatus = dstatus; GOMI = ((MultiPorter == 'YES') ? "1" : "0"); GUser = userName;
        $('#RReqNB').text(ReqNB); $('#RequestDept').text(from); $(eleCategory).val(category); $('#txtDestLOcation').val(txtDest); sessionStorage.setItem('DMT', ((MultiPorter == 'YES') ? "1" : "0")); sessionStorage.setItem('ECID', '');
        sessionStorage.setItem('DTOID', DId); sessionStorage.setItem('DTO', Destination); sessionStorage.setItem('DREQID', ReqID); sessionStorage.setItem('DTAGID', TagId); sessionStorage.setItem('CCAT', DCat);
        sessionStorage.setItem('OLDCAT', category); sessionStorage.setItem('OLDDEST', Destination); sessionStorage.setItem('OLDDID', DId); sessionStorage.setItem('OLDCID', catID); GExtn = extn_No; $('#txtExtnNo').val(extn_No);
        ShowModalPopUp('ModalUpdate');

    }
}


function loadNBsuggesstion(Val) {
    if (ENearByZoneIDs.length == 0) {
        $.ajax({
            async: true,
            url: hurl + "Service/Service.aspx?Process=GETSEARCHEDLOCATION&LOCATION=" + Val + "&CURIDS=" + ENearByZoneIDs,
            type: 'POST',
            data: 'pData',
            dataType: 'json',
            beforeSend: function () {
                $("#txtsearchNearbyZones").css("background", "#FFF url(../images/LoadingN.gif) no-repeat 95%").css("background-size", "35px");

            },
            success: function (data) {
                $("#suggesstionNearBy").show();
                $("#suggesstionNearBy").html(data[0].RESULT);
                $("#txtsearchNearbyZones").css("background", "#FFF");
            }
        });
    }
}



function BindLocation(Id, Value) {

    ENearByZoneArr += ((ENearByZoneArr.length > 0) ? ',' : '') + Id.toString() + '|$|' + Value.toString();
    $("#txtsearchNearbyZones").val(''); $("#suggesstionNearBy").hide();
    setNearByZones();
}


function UnBindLocation(Value) {
    var valwithComma = Value + ",";
    if (ENearByZoneArr.includes(valwithComma))
        ENearByZoneArr = ENearByZoneArr.replace(valwithComma, "");
    else
        ENearByZoneArr = ENearByZoneArr.replace(Value, "");
    setNearByZones();
}


function setNearByZones() {

    var arrRemarks = ENearByZoneArr.split(',');
    var htmlNearByZonesNotes = ''; ENearByZoneIDs = '';
    $.each(arrRemarks, function (index, value) {
        if (value.trim()) {
            var valueArray = value.split('|$|');

            var b = '<a onclick="UnBindLocation(' + "'" + value + "'" + ');"> <img src="../images/Delete.png" alt="Delete" height="28px" class="GridIcons" style="cursor:pointer" /></a> ';

            htmlNearByZonesNotes += '<div class="msgContainer"><p class="msgUser">' + valueArray[1].toString() + '<span class="time-right">' + b + '</span></div>'
            ENearByZoneIDs += ((ENearByZoneIDs.length > 0) ? ',' : '') + valueArray[0].toString();

        }
    });
    $('#divNearByZones').html(htmlNearByZonesNotes); $('#divNearByZones').show(800);

}


function setEditUser(CatID, CategoryName, DepartmentId, ThresholdForStartTime,
    ThresholdForEndTime, Orderwise, EscationTat1, EscationTat2,
    EscationTat3, EscationContact1, EscationContact2, EscationContact3,
    TaskTypeId, HistUrl, Dial50Url, ComplaintContact, ShortName,
    Image, IsSignRequired, IsPhotoRequired, IsTwoPorterTask, IsActive,
    CategoryDescription, AdditionalUrl, Title, Description) {

    PUserID = CatID;

    $('#txtCategoryName').val(CategoryName || '');
    selectSumoByValue('txtDepartmentId', DepartmentId || '');
    selectSumoByValue('ddlTaskTypeId', TaskTypeId || '');
    $('#txtThresholdForStartTime').val(ThresholdForStartTime || '');
    $('#txtThresholdForEndTime').val(ThresholdForEndTime || '');
    $('#txtOrderwise').val(Orderwise || '');
    $('#txtEscationTat1').val(EscationTat1 || '');
    $('#txtEscationTat2').val(EscationTat2 || '');
    $('#txtEscationTat3').val(EscationTat3 || '');
    $('#txtEscationContact1').val(EscationContact1 || '');
    $('#txtEscationContact2').val(EscationContact2 || '');
    $('#txtEscationContact3').val(EscationContact3 || '');
    $('#txtHistUrl').val(HistUrl || '');
    $('#txtDial50Url').val(Dial50Url || '');
    $('#txtComplaintContact').val(ComplaintContact || '');
    $('#txtShortName').val(ShortName || '');
    $('#txtImage').val(Image || 'Default.png');
    $('#txtCategoryDescription').val(CategoryDescription || '');
    $('#txtAdditionalUrl').val(AdditionalUrl || '');
    $('#txtTitle').val(Title || '');
    $('#txtDescription').val(Description || '');

    setCheckboxStateFromString('chkIsSignRequired', IsSignRequired);
    setCheckboxStateFromString('chkIsPhotoRequired', IsPhotoRequired);
    setCheckboxStateFromString('chkIsTwoPorterTask', IsTwoPorterTask);
    setCheckboxStateFromString('chkIsActive', IsActive);

    $('#LocationHeader').html('Edit Task Type');
    ShowModalPopUp('addUser');
}
function setCheckboxStateFromString(checkboxId, value) {
    var isChecked = (value === 'Yes' || value == '1' || value === true || value === 1);
    var imgSrc = isChecked ? '../images/CCheck.png' : '../images/CNoCheck.png';
    $('#' + checkboxId).attr('src', imgSrc);
}

function addUser() {

    $('#txtCategoryName').val('');
    $('#txtDepartmentId').val('');
    $('#txtDepartmentId')[0]?.sumo?.reload();
    $('#txtThresholdForStartTime').val('');
    $('#txtThresholdForEndTime').val('');
    $('#txtOrderwise').val('');
    $('#txtEscationTat1').val('');
    $('#txtEscationTat2').val('');
    $('#txtEscationTat3').val('');
    $('#txtEscationContact1').val('');
    $('#txtEscationContact2').val('');
    $('#txtEscationContact3').val('');
    $('#txtHistUrl').val('');
    $('#txtDial50Url').val('');
    $('#txtComplaintContact').val('');
    $('#txtShortName').val('');
    $('#txtImage').val('Default.png');
    $('#txtCategoryDescription').val('');
    $('#txtAdditionalUrl').val('');
    $('#txtTitle').val('');
    $('#txtDescription').val('');
    $('#txtDescriptionDetails').val('');

    $('#ddlTaskTypeId').val('');
    $('#ddlTaskTypeId')[0]?.sumo?.reload();

    $('#chkIsSignRequired').attr('src', '../images/CNoCheck.png');
    $('#chkIsPhotoRequired').attr('src', '../images/CNoCheck.png');
    $('#chkIsTwoPorterTask').attr('src', '../images/CNoCheck.png');
    $('#chkIsActive').attr('src', '../images/CCheck.png');

    $('#btnDeleteLocation').css('display', 'none');

    PUserID = '';

    ShowModalAddUser();
    $('#LocationHeader').html('Add Task Type');

    setTimeout(function () {
        $('#txtCategoryName').focus();
    }, 500);
}

function selectSumoByValue(sumoId, value) {
    var $select = $('#' + sumoId);
    if (!$select.length || !$select[0].sumo) return;

    var options = $select.find('option');
    var foundIndex = -1;

    options.each(function (index) {
        if ($(this).val() == value) {
            foundIndex = index;
            return false;
        }
    });

    if (foundIndex >= 0) {
        $select[0].sumo.selectItem(foundIndex);
    }
}

function submitUser() {
    var Action = $('#LocationHeader').html();

    var CategoryName = $('#txtCategoryName').val(),
        DepartmentId = $('#txtDepartmentId').val(),
        ThresholdForStartTime = $('#txtThresholdForStartTime').val(),
        ThresholdForEndTime = $('#txtThresholdForEndTime').val(),
        Orderwise = $('#txtOrderwise').val(),
        EscationTat1 = $('#txtEscationTat1').val(),
        EscationTat2 = $('#txtEscationTat2').val(),
        EscationTat3 = $('#txtEscationTat3').val(),
        EscationContact1 = $('#txtEscationContact1').val(),
        EscationContact2 = $('#txtEscationContact2').val(),
        EscationContact3 = $('#txtEscationContact3').val(),
        TaskTypeId = $('#ddlTaskTypeId').val(),
        HistUrl = $('#txtHistUrl').val(),
        Dial50Url = $('#txtDial50Url').val(),
        ComplaintContact = $('#txtComplaintContact').val(),
        ShortName = $('#txtShortName').val(),
        Image = $('#txtImage').val() || 'Default.png',
        CategoryDescription = $('#txtCategoryDescription').val() || '',
        DescriptionDetails = $('#txtDescriptionDetails').val() || '',
        AdditionalUrl = $('#txtAdditionalUrl').val() || '',
        Title = $('#txtTitle').val() || '',  
        Description = $('#txtDescription').val() || '', 

        IsSignRequired = $('#chkIsSignRequired').attr("src").includes('CCheck.png') ? '1' : '0',
        IsPhotoRequired = $('#chkIsPhotoRequired').attr("src").includes('CCheck.png') ? '1' : '0',
        IsTwoPorterTask = $('#chkIsTwoPorterTask').attr("src").includes('CCheck.png') ? '1' : '0',
        IsActive = $('#chkIsActive').attr("src").includes('CCheck.png') ? '1' : '0';

    if (CategoryName.trim().length === 0) {
        $('#txtCategoryName').focus();
        $('#errorCategoryName').text('Category Name is required');
        $('#txtCategoryName').css('border', '1px solid red');
        setTimeout(function () {
            $('#txtCategoryName').css('border', '1px solid #ced4da');
            $('#errorCategoryName').text('');

        },

            2500);

        return;
    }
    else if (ThresholdForStartTime.trim().length === 0) {
        $('#txtThresholdForStartTime').focus(); $('#errorThresholdForStartTime').text('Threshold Start Time is required'); $('#txtThresholdForStartTime').css('border', '1px solid red');
        setTimeout(function () {
            $('#txtThresholdForStartTime').css('border', '1px solid #ced4da');
            $('#errorThresholdForStartTime').text('');
        }, 2500); return;

    }
    else if (ThresholdForEndTime.trim().length === 0) {
        $('#txtThresholdForEndTime').focus(); $('#errorThresholdForEndTime').text('Threshold End Time is required'); $('#txtThresholdForEndTime').css('border', '1px solid red');
        setTimeout(function () {
            $('#txtThresholdForEndTime').css('border', '1px solid #ced4da');
            $('#errorThresholdForEndTime').text('');
        }, 2500); return;

    }
    //else if (EscationTat1.trim().length === 0) {
    //    $('#txtEscationTat1').focus(); $('#errorEscationTat1').text('EscationTat1 is required'); $('#txtEscationTat1').css('border', '1px solid red');
    //    setTimeout(function () {
    //        $('#txtEscationTat1').css('border', '1px solid #ced4da');
    //        $('#errorEscationTat1').text('');
    //    }, 2500); return;

    //} 
    //else if (EscationTat2.trim().length === 0) {
    //    $('#txtEscationTat2').focus(); $('#errorEscationTat2').text('EscationTat2  is required'); $('#txtEscationTat2').css('border', '1px solid red');
    //    setTimeout(function () {
    //        $('#txtEscationTat2').css('border', '1px solid #ced4da');
    //        $('#errorEscationTat2').text('');
    //    }, 2500); return;

    //} 
    else if (TaskTypeId == '0') {
        $('#ddlTaskTypeId').focus(); $('#errorTaskTypeId').text('TaskTypeId is required'); $('#ddlTaskTypeId').css('border', '1px solid red');
        setTimeout(function () {
            $('#ddlTaskTypeId').css('border', '1px solid #ced4da');
            $('#errorTaskTypeId').text('');
        }, 2500); return;

    }

    else if (ShortName.trim().length === 0) {
        $('#txtShortName').focus();$('#errortxtShortName').text('Short Name is required');$('#txtShortName').css('border', '1px solid red');
        setTimeout(function () {
            $('#txtShortName').css('border', '1px solid #ced4da');
            $('#errortxtShortName').text('');},2500); return;

    } 


    if (!Image || Image.trim().length === 0) {
        Image = 'Default.png';
    }

    var actionType = (Action === 'Add Task Type') ? "INSERT" : "UPDATE";

    uploadImage(function (imageName) {

        //console.log('Uploaded Image:', imageName);

    AddUpdateTaskType(
        PUserID || '', 
        CategoryName,
        DepartmentId,
        ThresholdForStartTime,
        ThresholdForEndTime,
        Orderwise,
        EscationTat1,
        EscationTat2,
        EscationTat3,
        EscationContact1,
        EscationContact2,
        EscationContact3,
        TaskTypeId,
        HistUrl,
        Dial50Url,
        ComplaintContact,
        ShortName,
        Image,
        CategoryDescription,
        DescriptionDetails,
        AdditionalUrl,
        Title,  
        Description,  
        IsSignRequired,
        IsPhotoRequired,
        IsTwoPorterTask,
        IsActive,
        actionType
        );
    });
}

function AddUpdateTaskType(
    PUserID,
    CategoryName,
    DepartmentId,
    ThresholdForStartTime,
    ThresholdForEndTime,
    Orderwise,
    EscationTat1,
    EscationTat2,
    EscationTat3,
    EscationContact1,
    EscationContact2,
    EscationContact3,
    TaskTypeId,
    HistUrl,
    Dial50Url,
    ComplaintContact,
    ShortName,
    Image,
    CategoryDescription,
    DescriptionDetails,
    AdditionalUrl,
    Title,  
    Description,  
    IsSignRequired,
    IsPhotoRequired,
    IsTwoPorterTask,
    IsActive,
    Action
) {
    var encProcess = Encrypt("UPDATETASKTYPE").toString();

    var urlParams = hurl + 'Service/Service.aspx?Process=' + encodeURIComponent(encProcess) +
        '&CATEGORYNAME=' + encodeURIComponent(Encrypt(CategoryName).toString()) +
        '&DEPARTMENTID=' + encodeURIComponent(Encrypt(DepartmentId || '').toString()) +
        '&THRESHOLDFORSTARTTIME=' + encodeURIComponent(Encrypt(ThresholdForStartTime || '').toString()) +
        '&THRESHOLDFORENDTIME=' + encodeURIComponent(Encrypt(ThresholdForEndTime || '').toString()) +
        '&ORDERWISE=' + encodeURIComponent(Encrypt(Orderwise || '').toString()) +
        '&ESCATIONTAT1=' + encodeURIComponent(Encrypt(EscationTat1 || '').toString()) +
        '&ESCATIONTAT2=' + encodeURIComponent(Encrypt(EscationTat2 || '').toString()) +
        '&ESCATIONTAT3=' + encodeURIComponent(Encrypt(EscationTat3 || '').toString()) +
        '&ESCATIONCONTACT1=' + encodeURIComponent(Encrypt(EscationContact1 || '').toString()) +
        '&ESCATIONCONTACT2=' + encodeURIComponent(Encrypt(EscationContact2 || '').toString()) +
        '&ESCATIONCONTACT3=' + encodeURIComponent(Encrypt(EscationContact3 || '').toString()) +
        '&TASKTYPEID=' + encodeURIComponent(Encrypt(TaskTypeId || '').toString()) +
        '&HISTURL=' + encodeURIComponent(Encrypt(HistUrl || '').toString()) +
        '&DIAL50URL=' + encodeURIComponent(Encrypt(Dial50Url || '').toString()) +
        '&COMPLAINTCONTACT=' + encodeURIComponent(Encrypt(ComplaintContact || '').toString()) +
        '&SHORTNAME=' + encodeURIComponent(Encrypt(ShortName || '').toString()) +
        '&IMAGE=' + encodeURIComponent(Encrypt(Image).toString()) +
        '&CATEGORYDESCRIPTION=' + encodeURIComponent(Encrypt(CategoryDescription || '').toString()) +
        '&ADDITIONALURL=' + encodeURIComponent(Encrypt(AdditionalUrl || '').toString()) +
        '&TITLE=' + encodeURIComponent(Encrypt(Title || '').toString()) +  
        '&DESCRIPTION=' + encodeURIComponent(Encrypt(Description || '').toString()) + 
        '&DESCRIPTIONDETAILS=' + encodeURIComponent(Encrypt(DescriptionDetails || '').toString()) +
        '&ISSIGNREQUIRED=' + encodeURIComponent(Encrypt(IsSignRequired).toString()) +
        '&ISPHOTOREQUIRED=' + encodeURIComponent(Encrypt(IsPhotoRequired).toString()) +
        '&ISTWOPORTERTASK=' + encodeURIComponent(Encrypt(IsTwoPorterTask).toString()) +
        '&ISACTIVE=' + encodeURIComponent(Encrypt(IsActive).toString()) +
        '&ID=' + encodeURIComponent(Encrypt(PUserID || '').toString()) +
        '&action=' + encodeURIComponent(Encrypt(Action).toString());

    $.ajax({
        async: true,
        url: urlParams,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data && data[0] && data[0].RESULT) {
                var result = data[0].RESULT.split("_")[0];
                if (result === 'TRUE') {
                    $('#LBLRequestResult').html('Task Type ' +
                        (Action === "UPDATE" ? 'Updated' : 'Added') +
                        ' Successfully: ' + CategoryName);

                    HideModalPopUp('addUser');
                    ShowModalPopUp('modalSuccess');
                    setTimeout(function () {
                        HideModalPopUp('modalSuccess');
                    }, 2500);

                    if (typeof LoadProcess === 'function') {
                        LoadProcess();
                    }
                } else {
                    ShowModalPopUp('modalAlert');
                    $('#modalAlert .modal-body').html(data[0].MESSAGE || 'Operation failed');
                    setTimeout(function () {
                        HideModalPopUp('modalAlert');
                    }, 3500);
                }
            } else {
                ShowModalPopUp('modalAlert');
                $('#modalAlert .modal-body').html('Invalid response from server');
                setTimeout(function () {
                    HideModalPopUp('modalAlert');
                }, 3500);
            }
        },
        error: function (xhr, status, error) {
            ShowModalPopUp('modalAlert');
            $('#modalAlert .modal-body').html('Error: ' + error);
            setTimeout(function () {
                HideModalPopUp('modalAlert');
            }, 3500);
            console.error('AJAX Error:', error);
        }
    });
}

function uploadImage(callback) {
    var fileInput = document.getElementById('fileImage');
    var file = fileInput && fileInput.files[0];

    if (!file) {
        callback('Default.png');
        return;
    }
    var encProcess = Encrypt("UPLOADCATEGORYIMAGE").toString();

    var formData = new FormData();
    formData.append('IMAGEFILE', file);


    $.ajax({
        url: 'Service/Service.aspx?Process=' + encodeURIComponent(encProcess), 
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (res) {
            callback(res);
        },
        error: function () {
            callback('Default.png');
        }
    });

}

function deleteTaskType() {
    var CategoryName = $('#txtCategoryName').val();
    var TaskTypeId = PUserID || '';

    if (!TaskTypeId || TaskTypeId === '') {
        ShowModalPopUp('modalAlert');
        $('#modalAlert .modal-body').html('No Task Type selected for deletion');
        setTimeout(function () {
            HideModalPopUp('modalAlert');
        }, 3500);
        return;
    }
        var encProcess = Encrypt("UPDATETASKTYPE").toString();
        var encAction = Encrypt("DELETE").toString();
        var encID = Encrypt(TaskTypeId).toString();

        ShowModalPopUp('ModalLoading');

        $.ajax({
            async: true,
            url: hurl + 'Service/Service.aspx?Process=' + encodeURIComponent(encProcess) +
                '&action=' + encodeURIComponent(encAction) +
                '&ID=' + encodeURIComponent(encID),
            type: 'POST',
            data: 'pData',
            dataType: 'json',
            success: function (data) {
                HideModalPopUp('ModalLoading');

                if (data && data[0]) {
                    var result = data[0].RESULT;
                    var parts = result.split('_');

                    if (parts[0] === 'TRUE') {
                        $('#LBLRequestResult').html('Task Type "' + CategoryName + '" deleted successfully');

                        HideModalPopUp('addUser');
                        ShowModalPopUp('modalSuccess');
                        setTimeout(function () {
                            HideModalPopUp('modalSuccess');
                        }, 2500);

                        if (typeof LoadProcess === 'function') {
                            LoadProcess();
                        }
                    } else {
                        ShowModalPopUp('modalAlert');
                        $('#modalAlert .modal-body').html('Delete failed: ' + (parts[1] || 'Unknown error'));
                        setTimeout(function () {
                            HideModalPopUp('modalAlert');
                        }, 3500);
                    }
                } else {
                    ShowModalPopUp('modalAlert');
                    $('#modalAlert .modal-body').html('Invalid response from server');
                    setTimeout(function () {
                        HideModalPopUp('modalAlert');
                    }, 3500);
                }
            },
            error: function (xhr, status, error) {
                HideModalPopUp('ModalLoading');
                ShowModalPopUp('modalAlert');
                $('#modalAlert .modal-body').html('Delete error: ' + error);
                setTimeout(function () {
                    HideModalPopUp('modalAlert');
                }, 3500);
            }
        });
    }


$(document).ready(function () {

    $('#btnDeleteLocation').attr('onclick', 'deleteTaskType(); return false;');
});

function changeCheck(imgElement) {
    var currentSrc = $(imgElement).attr('src');
    if (currentSrc.includes('CNoCheck.png')) {
        $(imgElement).attr('src', '../images/CCheck.png');
    } else {
        $(imgElement).attr('src', '../images/CNoCheck.png');
    }
}

function loadTaskTypeForEdit(id) {
    PUserID = id; 

    var encProcess = Encrypt("UPDATETASKTYPE").toString();
    var encAction = Encrypt("GETBYID").toString();
    var encID = Encrypt(id.toString()).toString();

    $.ajax({
        async: true,
        url: hurl + 'Service/Service.aspx?Process=' + encodeURIComponent(encProcess) +
            '&action=' + encodeURIComponent(encAction) +
            '&ID=' + encodeURIComponent(encID),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data && data[0]) {
                var taskType = data[0];

                $('#txtCategoryName').val(taskType.CategoryName || '');
                $('#txtDepartmentId').val(taskType.DEPARTMENTID || '');
                $('#txtThresholdForStartTime').val(taskType.ThresholdForStartTime || '');
                $('#txtThresholdForEndTime').val(taskType.ThresholdForEndTime || '');
                $('#txtOrderwise').val(taskType.ORDERWISE || '');
                $('#txtEscationTat1').val(taskType.EscationTat1 || '');
                $('#txtEscationTat2').val(taskType.EscationTat2 || '');
                $('#txtEscationTat3').val(taskType.EscationTat3 || '');
                $('#txtEscationContact1').val(taskType.EscationContact1 || '');
                $('#txtEscationContact2').val(taskType.EscationContact2 || '');
                $('#txtEscationContact3').val(taskType.EscationContact3 || '');
                $('#ddlTaskTypeId').val(taskType.TaskTypeld || '');
                $('#txtHistUrl').val(taskType.HistUrl || '');
                $('#txtDial50Url').val(taskType.Dial50Url || '');
                $('#txtComplaintContact').val(taskType.ComplaintContact || '');
                $('#txtShortName').val(taskType.ShortName || '');
                $('#txtImage').val(taskType.Image || '');
                $('#txtAdditionalUrl').val(taskType.AdditionalUrl || '');

                setCheckboxState('chkIsSignRequired', taskType.ISSIGNREQUIRED);
                setCheckboxState('chkIsPhotoRequired', taskType.ISPHOTOREQUIRED);
                setCheckboxState('chkIsTwoPorterTask', taskType.ISTWOPORTERTASK);
                setCheckboxState('chkIsActive', taskType.IsActive);

                $('#LocationHeader').html('Edit Task Type');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading task type:', error);
        }
    });
}

function setCheckboxState(checkboxId, value) {
    var imgSrc = (value == 1 || value === true) ? '../images/CCheck.png' : '../images/CNoCheck.png';
    $('#' + checkboxId).attr('src', imgSrc);
}
function ShowNearByLoc(NearByZones) {
    var arrRemarks = NearByZones.split(',');
    var htmlNearByZonesNotes = '';
    $.each(arrRemarks, function (index, value) {
        if (value.trim()) {
            var valueArray = value.split('|$|');

            var b = '<a onclick="UnBindLocation(' + "'" + value + "'" + ');"> <img src="../images/Delete.png" alt="Delete" height="28px" class="GridIcons" style="cursor:pointer;display:none;" /></a> ';

            htmlNearByZonesNotes += '<div class="msgContainer"><p class="msgUser">' + valueArray[1].toString() + '<span class="time-right">' + b + '</span></div>'

        }
    });
    $('#divNearByLocations').html(htmlNearByZonesNotes); ShowModalPopUp('modalNearByList'); $('#divNearByLocations').show(800);
}

function GridUser_RowDataBound(sender, args) {
    var data = {
        ID: args.get_item().getDataKeyValue("ID"),
        CATEGORYNAME: args.get_item().getDataKeyValue("CATEGORYNAME"),
        SHORTNAME: args.get_item().getDataKeyValue("SHORTNAME"),
        DEPARTMENTID: args.get_item().getDataKeyValue("DEPARTMENTID"),
        TASKTYPEID: args.get_item().getDataKeyValue("TASKTYPEID"),
        THRESHOLDFORSTARTTIME: args.get_item().getDataKeyValue("THRESHOLDFORSTARTTIME"),
        THRESHOLDFORENDTIME: args.get_item().getDataKeyValue("THRESHOLDFORENDTIME"),
        ORDERWISE: args.get_item().getDataKeyValue("ORDERWISE"),
        ESCATIONTAT1: args.get_item().getDataKeyValue("ESCATIONTAT1"),
        ESCATIONTAT2: args.get_item().getDataKeyValue("ESCATIONTAT2"),
        ESCATIONTAT3: args.get_item().getDataKeyValue("ESCATIONTAT3"),
        ESCATIONCONTACT1: args.get_item().getDataKeyValue("ESCATIONCONTACT1"),
        ESCATIONCONTACT2: args.get_item().getDataKeyValue("ESCATIONCONTACT2"),
        ESCATIONCONTACT3: args.get_item().getDataKeyValue("ESCATIONCONTACT3"),
        HISTURL: args.get_item().getDataKeyValue("HISTURL"),
        REDIRECTIONALURL: args.get_item().getDataKeyValue("REDIRECTIONALURL"),
        DIAL50URL: args.get_item().getDataKeyValue("DIAL50URL"),
        COMPLAINTCONTACT: args.get_item().getDataKeyValue("COMPLAINTCONTACT"),
        CATEGORYDESCRIPTION: args.get_item().getDataKeyValue("CATEGORYDESCRIPTION"),
        DESCRIPTIONDETAILS: args.get_item().getDataKeyValue("DESCRIPTIONDETAILS"),
        TITLE: args.get_item().getDataKeyValue("TITLE"),  
        DESCRIPTION: args.get_item().getDataKeyValue("DESCRIPTION"),  
        IMAGE: args.get_item().getDataKeyValue("IMAGE") || "Default.png",
        ISSIGNREQUIRED: args.get_item().getDataKeyValue("ISSIGNREQUIRED"),
        ISPHOTOREQUIRED: args.get_item().getDataKeyValue("ISPHOTOREQUIRED"),
        ISTWOPORTERTASK: args.get_item().getDataKeyValue("ISTWOPORTERTASK"),
        ISACTIVE: args.get_item().getDataKeyValue("ISACTIVE")
    };

    var formData = {
        ...data,
        ISSIGNREQUIRED: convertYesNoToInt(data.ISSIGNREQUIRED),
        ISPHOTOREQUIRED: convertYesNoToInt(data.ISPHOTOREQUIRED),
        ISTWOPORTERTASK: convertYesNoToInt(data.ISTWOPORTERTASK),
        ISACTIVE: convertYesNoToInt(data.ISACTIVE)
    };

    var cellEdit = args.get_item().get_cell("EDIT");
    var editLink = '<div class="add-task-link" onclick="setEditUserFromData(' +
        JSON.stringify(formData).replace(/"/g, '&quot;') +
        ');"><a href="javascript:void(0)" class="btn btn-indexblue">' +
        '<img src="../images/memo.png" alt="Edit"></a></div>';

    RUID = data.ID;
    $(cellEdit).html(editLink);
}

function loadTaskTypes() {
    var select = $('#ddlTaskTypeId');
    select.empty().append('<option value="">--Select--</option>');

    var taskTypes = [
        { id: '1', name: 'Dial 50' },
        { id: '2', name: 'Integration' },
        { id: '3', name: 'Complaint' },
        { id: '4', name: "Today's Menu" },
        { id: '5', name: 'HIS Integration' }
    ];

    $.each(taskTypes, function (index, item) {
        select.append('<option value="' + item.id + '">' + item.name + '</option>');
    });

    if (select[0].sumo) {
        select[0].sumo.reload();
    } else {
        select.SumoSelect({ placeholder: '--Select--', search: true });
    }
}


function convertYesNoToInt(value) {
    if (value === 'Yes' || value === true || value == 1) return '1';
    if (value === 'No' || value === false || value == 0) return '0';
    return value;
}
function setEditUserFromData(data) {
    if (!data || !data.ID) {
        console.error('Invalid data object:', data);
        return;
    }

    PUserID = data.ID;

    setFormFieldValue('#txtCategoryName', data.CATEGORYNAME);
    setFormFieldValue('#txtThresholdForStartTime', data.THRESHOLDFORSTARTTIME);
    setFormFieldValue('#txtThresholdForEndTime', data.THRESHOLDFORENDTIME);
    setFormFieldValue('#txtOrderwise', data.ORDERWISE);
    setFormFieldValue('#txtEscationTat1', data.ESCATIONTAT1);
    setFormFieldValue('#txtEscationTat2', data.ESCATIONTAT2);
    setFormFieldValue('#txtEscationTat3', data.ESCATIONTAT3);
    setFormFieldValue('#txtEscationContact1', data.ESCATIONCONTACT1);
    setFormFieldValue('#txtEscationContact2', data.ESCATIONCONTACT2);
    setFormFieldValue('#txtEscationContact3', data.ESCATIONCONTACT3);
    setFormFieldValue('#txtHistUrl', data.HISTURL);
    setFormFieldValue('#txtDial50Url', data.DIAL50URL);
    setFormFieldValue('#txtComplaintContact', data.COMPLAINTCONTACT);
    setFormFieldValue('#txtShortName', data.SHORTNAME);
    setFormFieldValue('#txtImage', data.IMAGE || 'Default.png');
    setFormFieldValue('#txtCategoryDescription', data.CATEGORYDESCRIPTION || '');
    setFormFieldValue('#txtAdditionalUrl', data.REDIRECTIONALURL || '');
    setFormFieldValue('#txtTitle', data.TITLE || '');
    setFormFieldValue('#txtDescription', data.DESCRIPTION || '');
    setFormFieldValue('#txtDescriptionDetails', data.DESCRIPTIONDETAILS || '');

    handleSumoDropdown('#txtDepartmentId', data.DEPARTMENTID || '');
    handleSumoDropdown('#ddlTaskTypeId', data.TASKTYPEID || '');

    setCheckboxState('chkIsSignRequired', data.ISSIGNREQUIRED);
    setCheckboxState('chkIsPhotoRequired', data.ISPHOTOREQUIRED);
    setCheckboxState('chkIsTwoPorterTask', data.ISTWOPORTERTASK);
    setCheckboxState('chkIsActive', data.ISACTIVE);

    $('#LocationHeader').html('Edit Task Type');
    $('#btnDeleteLocation').css('display', 'block');

    ShowModalPopUp('addUser');
}

function setFormFieldValue(selector, value) {
    $(selector).val(value || '');
}

function handleSumoDropdown(selector, value) {
    const $dropdown = $(selector);
    const sumoInstance = $dropdown[0]?.sumo;

    $dropdown.val(value);

    if (sumoInstance) {
        if (typeof selectSumoByValue === 'function') {
            selectSumoByValue(selector.replace('#', ''), value);
        } else {
            const options = $dropdown.find('option');
            let foundIndex = -1;

            options.each(function (index) {
                if ($(this).val() == value) {
                    foundIndex = index;
                    return false;
                }
            });

            if (foundIndex > -1) {
                sumoInstance.selectItem(foundIndex);
            }
        }
        sumoInstance.reload();
    }
}
function setCheckboxState(checkboxId, value) {
    var isChecked = (value == '1' || value == 1 || value === true);
    var imgSrc = isChecked ? '../images/CCheck.png' : '../images/CNoCheck.png';
    $('#' + checkboxId).attr('src', imgSrc);
}
function ResetPassword(UserID, UserName) {

    EUserID = UserID; EUserName = UserName;
    $('#spanUserName').html(UserName);
    ShowModalPopUp("ModalReset");
}

function Reset() {
    $.ajax({
        async: true,
        url: hurl + "SERVICE/Service.aspx?Process=RESETPASSWORD&USERID=" + EUserID,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {

            if (data[0].RESULT.split("_")[0] === 'TRUE') {
                $('#LBLRequestResult').html('The user ' + EUserName + "'s " + ' password has been reset successfully..');
                HideModalPopUp('ModalReset'); ShowModalPopUp('modalSuccess');
                setTimeout("HideModalPopUp('modalSuccess');", 2500); LoadProcess();
            }

        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });
}

function loadZoneDepartmentDropdowns() {
    var FinalUrl = hurl + "Service/Service.aspx?" +
        "Process=" + encodeURIComponent(Encrypt("GETZONEDEPARTMENT"));

    $.ajax({
        type: "POST",
        url: FinalUrl,
        data: {},
        dataType: "json",
        success: function (data) {

            var $zoneSelect = $('#search_ZonesName');
            $zoneSelect.empty().append($('<option>', { value: '', text: '--Select--' }));
            if (data?.zones?.forEach) {
                data.zones.forEach(zone => $zoneSelect.append($('<option>', {
                    value: zone.id || '',
                    text: zone.name || 'Unknown'
                })));
            }
            $zoneSelect[0]?.sumo?.reload();

            var $deptSelect = $('#txtDepartmentId');
            $deptSelect.empty().append($('<option>', { value: '', text: '--Select--' }));

            if (data?.departments?.forEach) {
                data.departments.forEach(dept => $deptSelect.append($('<option>', {
                    value: dept.id || '',      
                    text: dept.name || 'Unknown'
                })));
            }

            $deptSelect[0]?.sumo?.reload();
        },
        error: (xhr, status, error) => console.error("Error:", status, xhr.status, xhr.responseText?.substring(0, 200))
    });
}

$(document).ready(function () {
    $('#txtDepartmentId').SumoSelect();
    loadTaskTypes();
    loadZoneDepartmentDropdowns();
});


function SearchPorterRequest() {
    LoadGrid(CProcess);
}

function Redirect(RedirectTo) {
    window.location = RedirectTo;
}

/* Date Picker Start */

function changeShiftCheck(ele) {
    var src = $(ele).attr('src');  
    $(ele).attr("src", (src == "../images/CNoCheck.png") ? "../images/CCheck.png" : "../images/CNoCheck.png");
   // $('.clsPwd').css("visibility", ((src == "../images/CNoCheck.png") ? "visible" : "hidden"));
}


//function changeCheck(ele) {
//    var src = $(ele).attr('src'); //alert(src);
//    $(ele).attr("src", (src == "../images/CNoCheck.png") ? "../images/CCheck.png" : "../images/CNoCheck.png");

//}


function ShowModalAddUser() {
    $('#addUser').modal({
        backdrop: 'static',
        keyboard: false
    })
    $('#addUser').modal('show');
}


function Encrypt(Value) {
    var key = CryptoJS.enc.Utf8.parse(CryptoKey);
    var iv = CryptoJS.enc.Utf8.parse(CryptoPwd);

    var encryptedVal = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(Value), key,
        {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return encryptedVal;
}