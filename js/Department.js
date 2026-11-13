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

    var FinalUrl = hurl + "SERVICE/Service.aspx?" +
        "Process=" + encodeURIComponent(Encrypt("GETUSERROLES"));

    console.log('LoadRoles URL:', FinalUrl);

    $.ajax({
        async: true,
        url: FinalUrl,
        type: 'POST',
        data: {},
        dataType: 'json',
        success: function (data) {
            console.log('Roles response:', data);

            if (data && data.length > 0 && data[0].RESULT) {
                arrRoles = data[0].RESULT.split(',');
                $('#search_RoleName').html('');
                $('#search_RoleName')[0].sumo.add('0', '-- Select --');
                $('#search_RoleName')[0].sumo.reload();

                $.each(arrRoles, function (index, value) {
                    var parts = value.split('_');
                    $('#search_RoleName')[0].sumo.add(parts[0], parts[1]);
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('LoadRoles error:', status, error);
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

    var rolesToReload = ["1", "2", "6"]; 

    if (rolesToReload.includes(CRole) || (!ToUpdate)) {
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

function encryptAES(text) {
    if (text === undefined || text === null) text = '';
    text = text.toString();

    const key = CryptoJS.enc.Utf8.parse('9090909090909090');
    const iv = CryptoJS.enc.Utf8.parse('9090909090909090');

    const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return encodeURIComponent(encrypted.toString());
}

function LoadGrid() {
    var searchValue = $('#TextSearchLocation').val() || '';
    var encSearch = Encrypt(searchValue);
    var encPageIndex = Encrypt(pageIndex || 0);
    var encPageSize = Encrypt(pageSize || 10);

    var FinalUrl = `${hurl}Service/Service.aspx?Process=${encodeURIComponent(Encrypt("GETDEPARTMENT"))}&Search=${encSearch}&PageIndex=${encPageIndex}&PageSize=${encPageSize}`;

    $.ajax({
        url: FinalUrl,
        type: 'POST',
        data: {},
        dataType: 'json',
        success: function (data) {
            if (!grid) {
                console.error("GridUser not found!");
                return;
            }

            grid.clearSelectedItems();
            var tableView = grid.get_masterTableView();

            var virtualCount = 0;
            if (data && data.length > 0 && data[0].VIC != undefined) {
                virtualCount = parseInt(data[0].VIC);
            }
            updateVirtualItemCount(virtualCount, tableView);

            var numericPageIndex = parseInt(pageIndex || 0);
            tableView.set_currentPageIndex(numericPageIndex);

            var dataSource = (data && data.length > 0) ? data : [];
            tableView.set_dataSource(dataSource);
            tableView.dataBind();

            HideModalPopUp('ModalLoading');
        },
        error: function (xhr, status, error) {
            console.error('Error loading grid:', error);
            HideModalPopUp('ModalLoading');
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
function GridDepartment_RowDataBound(sender, args) {
    var DepartmentId = args.get_item().getDataKeyValue("DEPARTMENTID");
    var DepartmentName = args.get_item().getDataKeyValue("DEPARTMENTNAME") || "";
    var Description = args.get_item().getDataKeyValue("DESCRIPTION") || "";
    var IsActive = args.get_item().getDataKeyValue("ISACTIVE") || "";
    var MasterDepartmentName = args.get_item().getDataKeyValue("MASTERDEPARTMENTNAME") || "";
    var MasterDepartmentId = args.get_item().getDataKeyValue("PARENTDEPARTMENTID") || "";
    var DepartmentType = args.get_item().getDataKeyValue("DEPARTMENTTYPE") || "MASTER";

    var cellEdit = args.get_item().get_cell("EDIT");

    var editLink = `
        <div class="add-task-link">
            <a href="#" class="btn btn-indexblue edit-department-link" 
               data-id="${DepartmentId}" 
               data-name="${DepartmentName}" 
               data-description="${Description}"
               data-active="${IsActive}"
               data-type="${DepartmentType}"
               data-masterid="${MasterDepartmentId}"
               data-mastername="${MasterDepartmentName}">
                <img src="../images/memo.png" alt="Edit Department">
            </a>
        </div>
    `;

    $(cellEdit).html(editLink);

    $(cellEdit).find('.edit-department-link').click(function (e) {
        e.preventDefault();
        var id = $(this).data('id');
        var name = $(this).data('name');
        var description = $(this).data('description');
        var active = $(this).data('active');
        var type = $(this).data('type');
        var masterId = $(this).data('masterid');
        var masterName = $(this).data('mastername');

        setEditDepartment(id, name, description, active, type, masterId, masterName);
    });
}

function changeCheck(ele) {
    var src = $(ele).attr('src'); //alert(src);
    $(ele).attr("src", (src == "../images/CNoCheck.png") ? "../images/CCheck.png" : "../images/CNoCheck.png");

}

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

function clearSubDepartmentForm() {
    $('#hdnSubDepartmentID').val('');
    $('#subDepartmentName').val('');
    $('#subDepartmentDescription').val('');
    $('#masterDepartmentId').val('');

    if ($('#masterDepartmentId')[0].sumo) $('#masterDepartmentId')[0].sumo.reload();

    $('#chkSubIsActive').attr("src", "../images/CNoCheck.png");

    $('#btnDeleteSubDepartment').css("display", "none");

    $('.validation-message').remove();
    $('.form-control').css('border', '1px solid #ced4da');
}

function addDepartment() {

    $('#hdnDepartmentID').val('');
    $('#departmentName').val('');
    $('#departmentDescription').val('');
    $('#chkIsActive').attr("src", "../images/CNoCheck.png");
    $('#btnDeleteDepartment').css("display", "none");

    clearSubDepartmentForm();
    $('#main-tab').closest('li').show();
    $('#sub-tab').closest('li').show();


    $('#main-tab').tab('show');
    $('#sub-tab').removeClass('active');
    $('#main').addClass('show active');
    $('#sub').removeClass('show active');

    $('#LocationHeader').html('Add Department');
    $('#addUser').modal('show');

    setTimeout(function () {
        $('#departmentName').focus();
    }, 500);
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

            var $deptSelect = $('#masterDepartmentId');
            $deptSelect.empty().append(
                $('<option>', {
                    value: '',
                    text: '--Select--',
                    disabled: false,
                    selected: true,
                    style: 'color: grey;' 
                })
            );

            if (data?.departments?.forEach) {
                data.departments.forEach(dept => $deptSelect.append($('<option>', {
                    value: dept.id || '',
                    text: dept.name || 'Unknown',
                    style: 'color: #212529;' 
                })));
            }

            $deptSelect[0]?.sumo?.reload();
        },
        error: (xhr, status, error) => console.error("Error:", status, xhr.status, xhr.responseText?.substring(0, 200))
    });
}

$(document).ready(function () {
    $('#masterDepartmentId').SumoSelect();
    loadZoneDepartmentDropdowns();
});


function setEditDepartment(id, name, description, isActive, type, masterDeptId, masterDeptName) {
    if (masterDeptId && masterDeptId !== 'NULL' && masterDeptId !== '' && masterDeptId !== '0') {

        $('#hdnSubDepartmentID').val(id);
        $('#subDepartmentName').val(name || '');
        $('#subDepartmentDescription').val(description || '');
        $('#hdnDepartmentID').val('');
        $('#departmentName').val('');
        $('#departmentDescription').val('');
        $('#chkIsActive').attr("src", "../images/CNoCheck.png");
        $('#btnDeleteDepartment').css("display", "none");
        if (masterDeptId) {
            function setMasterDropdownValue() {

                var deptIdStr = masterDeptId.toString();
                var optionExists = $('#masterDepartmentId option[value="' + deptIdStr + '"]').length > 0;

                if (optionExists) {
                    $('#masterDepartmentId').val(deptIdStr);
                    $('#masterDepartmentId').trigger('change');

                    if ($('#masterDepartmentId')[0]?.sumo) {
                        $('#masterDepartmentId')[0].sumo.reload();
                    }
                    return true;
                }
                return false;
            }

            if (!setMasterDropdownValue()) {
                var checkInterval = setInterval(function () {
                    if ($('#masterDepartmentId option').length > 1) { 
                        if (setMasterDropdownValue()) {
                            clearInterval(checkInterval);
                        }
                    }
                }, 100);

                setTimeout(function () { clearInterval(checkInterval); }, 3000);
            }
        }

        var isActiveChecked = (isActive && (isActive.toString().toLowerCase() === 'true' || isActive === '1' || isActive === 'True'));
        $('#chkSubIsActive').attr("src", isActiveChecked ? "../images/CCheck.png" : "../images/CNoCheck.png");

        $('#LocationHeader').html('Edit Sub-department #' + name);
        $('#btnDeleteSubDepartment').css("display", "flex");
        $('#btnDeleteDepartment').css("display", "none");

        $('#main-tab').closest('li').hide();
        $('#sub-tab').closest('li').show();

        $('#sub-tab').tab('show');

    } else {

        clearSubDepartmentForm();
        $('#main-tab').closest('li').show();
        $('#sub-tab').closest('li').hide();

        $('#hdnDepartmentID').val(id);
        $('#departmentName').val(name || '');
        $('#departmentDescription').val(description || '');

        var isActiveChecked = (isActive && (isActive.toString().toLowerCase() === 'true' || isActive === '1' || isActive === 'True'));
        $('#chkIsActive').attr("src", isActiveChecked ? "../images/CCheck.png" : "../images/CNoCheck.png");

        $('#LocationHeader').html('Edit Department #' + name);
        $('#btnDeleteDepartment').css("display", "flex");
        $('#btnDeleteSubDepartment').css("display", "none");

        $('#main-tab').tab('show');
    }

    $('#addUser').modal('show');

    setTimeout(function () {
        if (masterDeptId && masterDeptId !== 'NULL' && masterDeptId !== '' && masterDeptId !== '0') {
            $('#subDepartmentName').focus();
        } else {
            $('#departmentName').focus();
        }
    }, 500);
}

function editSubDepartment(id, name, description, isActive, masterDeptId) {
    $('#hdnSubDepartmentID').val(id);
    $('#subDepartmentName').val(name || '');
    $('#subDepartmentDescription').val(description || '');

    if (masterDeptId) {
        $('#masterDepartmentId').val(masterDeptId);
        $('#masterDepartmentId').trigger('change');
    }

    var isActiveChecked = (isActive && (isActive.toString().toLowerCase() === 'true' || isActive === '1' || isActive === 'True'));
    $('#chkSubIsActive').attr("src", isActiveChecked ? "../images/CCheck.png" : "../images/CNoCheck.png");

    $('#LocationHeader').html('Edit Sub-department #' + name);
    $('#btnDeleteSubDepartment').css("display", "flex");

    $('#sub-tab').tab('show');

    $('#addUser').modal('show');

    setTimeout(function () {
        $('#subDepartmentName').focus();
    }, 500);
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

function submitDepartment(type) {
    $('.form-control').css('border', '1px solid #ced4da');
    $('.validation-message').remove();

    let isValid = true;
    let url = '';


    if (type === 'main') {

        var name = ($('#departmentName').val() || '').trim();
        var description = ($('#departmentDescription').val() || '').trim();
        var isActive = $('#chkIsActive').attr('src').includes("CCheck.png") ? 1 : 0;
        var id = ($('#hdnDepartmentID').val() || '').trim();
        var action = id ? 'UPDATE' : 'INSERT';

        if (!name) {
            $('#departmentName').css('border', '1px solid red');
            showValidationMessage('departmentName', 'Department Name is required.');
            isValid = false;
        }

        if (!description) {
            $('#departmentDescription').css('border', '1px solid red');
            showValidationMessage('departmentDescription', 'Description is required.');
            isValid = false;
        }

        if (!isValid) {
            setTimeout(function () {
                $('.validation-message').fadeOut(300, function () {
                    $(this).remove();
                });
                setTimeout(function () {
                    $('.form-control').css('border', '1px solid #ced4da');
                }, 300);
            }, 2000);
            return false;
        }

        url = `${hurl}Service/Service.aspx?` +
            `Process=${encodeURIComponent(Encrypt('UPDATEDEPARTMENT'))}&` +
            `NAME=${encodeURIComponent(Encrypt(name))}&` +
            `DESCRIPTION=${encodeURIComponent(Encrypt(description))}&` +
            `ISACTIVE=${encodeURIComponent(Encrypt(isActive.toString()))}&` +
            `ID=${encodeURIComponent(Encrypt(id))}&` +
            `ACTION=${encodeURIComponent(Encrypt(action))}&` +
            `PARENTDEPARTMENTID=${encodeURIComponent(Encrypt(''))}`;  

    } else {

        var masterDeptId = ($('#masterDepartmentId').val() || '').trim();
        var name = ($('#subDepartmentName').val() || '').trim();
        var description = ($('#subDepartmentDescription').val() || '').trim();
        var isActive = $('#chkSubIsActive').attr('src').includes("CCheck.png") ? 1 : 0;
        var id = ($('#hdnSubDepartmentID').val() || '').trim();
        var action = id ? 'UPDATE' : 'INSERT';

        if (!masterDeptId) {
            $('#masterDepartmentId').css('border', '1px solid red');
            showValidationMessage('masterDepartmentId', 'Master Department is required.');
            isValid = false;
        }

        if (!name) {
            $('#subDepartmentName').css('border', '1px solid red');
            showValidationMessage('subDepartmentName', 'Department Name is required.');
            isValid = false;
        }

        if (!description) {
            $('#subDepartmentDescription').css('border', '1px solid red');
            showValidationMessage('subDepartmentDescription', 'Description is required.');
            isValid = false;
        }

        if (!isValid) {
            setTimeout(function () {
                $('.validation-message').fadeOut(300, function () {
                    $(this).remove();
                });
                setTimeout(function () {
                    $('.form-control').css('border', '1px solid #ced4da');
                }, 300);
            }, 2000);
            return false;
        }

        url = `${hurl}Service/Service.aspx?` +
            `Process=${encodeURIComponent(Encrypt('UPDATEDEPARTMENT'))}&` +  
            `NAME=${encodeURIComponent(Encrypt(name))}&` +
            `DESCRIPTION=${encodeURIComponent(Encrypt(description))}&` +
            `ISACTIVE=${encodeURIComponent(Encrypt(isActive.toString()))}&` +
            `ID=${encodeURIComponent(Encrypt(id))}&` +
            `ACTION=${encodeURIComponent(Encrypt(action))}&` +
            `PARENTDEPARTMENTID=${encodeURIComponent(Encrypt(masterDeptId))}`; 
    }

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (res) {
            var result = res && res[0] ? res[0].RESULT : null;
            if (result && result.toUpperCase() === 'TRUE') {
                var deptType = type === 'main' ? 'Department' : 'Sub-department';
                var msg = action === 'INSERT' ?
                    `${deptType} "${name}" added successfully!` :
                    `${deptType} "${name}" updated successfully!`;

                $('#LBLRequestResult').text(msg);
                var modal = new bootstrap.Modal(document.getElementById('modalSuccess'));
                modal.show();
                setTimeout(() => {
                    modal.hide();
                    location.reload();
                }, 2000);

            } else if (result && result.toUpperCase() === 'FALSE') {
                var deptType = type === 'main' ? 'Department' : 'Sub-department';
                $('#modalAlert span').text(`${deptType} "${name}" already exists.`);
                var alertModal = new bootstrap.Modal(document.getElementById('modalAlert'));
                alertModal.show();
                setTimeout(() => { alertModal.hide(); }, 2000);
            } else if (result && result.toUpperCase() === 'HAS_SUBDEPARTMENTS') {
                $('#modalAlert span').text('Cannot delete department because it has sub-departments.');
                var alertModal = new bootstrap.Modal(document.getElementById('modalAlert'));
                alertModal.show();
                setTimeout(() => { alertModal.hide(); }, 2000);
            } else {
                console.error("Unexpected response:", res);
                alert("Unexpected server response: " + JSON.stringify(res));
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX error:", error, xhr.responseText);
            alert("Failed to save department. Error: " + error);
        }
    });
}

function deleteDepartment() {
    var name = $('#departmentName').val().trim();
    var id = $('#hdnDepartmentID').val().trim();

    var url = `${hurl}Service/Service.aspx?` +
        `Process=${encodeURIComponent(Encrypt('DELETEDEPARTMENT'))}&` +
        `NAME=${encodeURIComponent(Encrypt(name))}&` +
        `ID=${encodeURIComponent(Encrypt(id))}`;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (res) {
            var result = res && res[0] ? res[0].RESULT : null;
            if (result && result.toUpperCase() === 'TRUE') {
                $('#LBLRequestResult').text(`Department "${name}" deleted successfully!`);
                $('#addUser').modal('hide');
                var modal = new bootstrap.Modal(document.getElementById('modalSuccess'));
                modal.show();
                setTimeout(() => { modal.hide(); location.reload(); }, 2000);
            } else {
                alert('Failed to delete department: ' + (result || 'Unknown error'));
            }
        },
        error: function (xhr, status, error) {
            console.error("Delete error:", error);
            alert('Error deleting department: ' + error);
        }
    });
}

