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

$(document).ready(function () {
    $('#txtCategoryTypes').SumoSelect({
        placeholder: '--Select--',
        search: true,
        searchText: 'Type to search...',
        selectAll: false,
        okCancelInMulti: false,
        csvDispCount: 1,
        captionFormat: '{0}',
        captionFormatNoSelection: '--Select--'
    });


    $('#txtFloorId').SumoSelect({
        placeholder: '--Select--',
        search: true,
        searchText: 'Type to search...',
        selectAll: false,
        okCancelInMulti: true,
        csvDispCount: 999,
        captionFormat: '{0}',
        captionFormatNoSelection: '--Select--'
    });

    $('head').append(`
    <style>

        .SumoSelect .opt > label i,
        .SumoSelect .opt label > i,
        .SumoSelect .opt > label > span > i,
        .SumoSelect .opt span i,
        .SumoSelect div.opt label i,
        .SumoSelect .opt > label i[class*="check"] {
            width: 18px !important;
            height: 18px !important;
            font-size: 14px !important;
            line-height: 18px !important;
            border-radius: 3px !important;
        }
        
        .SumoSelect .opt.selected > label i,
        .SumoSelect .opt.selected label > i,
        .SumoSelect .opt.selected > label > span > i,
        .SumoSelect .opt.selected span i,
        .SumoSelect div.opt.selected label i,
        .SumoSelect .opt.selected > label i[class*="check"] {
            background-color: #0d6efd !important;
            border-color: #0d6efd !important;
            width: 18px !important;
            height: 18px !important;
        }
        
        .SumoSelect .opt.selected > label i:before,
        .SumoSelect .opt.selected label > i:before,
        .SumoSelect .opt.selected > label > span > i:before,
        .SumoSelect .opt.selected span i:before,
        .SumoSelect div.opt.selected label i:before,
        .SumoSelect .opt.selected > label i[class*="check"]:before {
            color: white !important;
            font-size: 12px !important;
            line-height: 18px !important;
        }
        
        .SumoSelect .select-all {
            display: none !important;
            height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
        }
        
        .SumoSelect .placeholder,
        .SumoSelect .CaptionCont span,
        .SumoSelect .Caption span {
            color: black !important;
            font-style: initial !important;
        }
        
        .SumoSelect .okbtn {
            background: #0d6efd !important;
            color: white !important;
            font-weight: bold !important;
        }
        
        .SumoSelect .opt.selected {
            background-color: #f0f8ff !important;
        }
        
        .SumoSelect .opt > label i {
            border: 2px solid #adb5bd !important;
        }
        
        .SumoSelect .checkmark {
            font-size: 14px !important;
        }
    </style>
`);

    // loadCategoryTypes();
});
//function loadCategoryTypes(callback) {
//    var deptId = $('#txtDepartmentId').val();

//    var deptIdString = "0";
//    if (deptId && deptId.length > 0) {
//        if (Array.isArray(deptId)) {
//            deptIdString = deptId.join(',');
//        } else {
//            deptIdString = deptId.toString();
//        }
//    }

//    var encryptedDeptId = Encrypt(deptIdString).toString();

//    $.ajax({
//        async: true,
//        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETCATEGORYTYPES"))
//            + "&DepartmentId=" + encodeURIComponent(encryptedDeptId),
//        type: 'POST',
//        data: 'pData',
//        dataType: 'json',
//        beforeSend: function () {
//        },
//        success: function (data) {
//            var $categorySelect = $('#txtCategoryTypes');

//            var currentSelected = $categorySelect.val();

//            $categorySelect.find('option[value!=""]').remove();
//            if (data && data.length > 0) {
//                for (var i = 0; i < data.length; i++) {
//                    var item = data[i];
//                    if (item && item.ID && item.NAME) {
//                        $categorySelect.append('<option value="' + item.ID + '">' + item.NAME + '</option>');
//                    }
//                }
//            }
//            if ($categorySelect[0] && $categorySelect[0].sumo) {
//                $categorySelect[0].sumo.reload();
//                $categorySelect[0].sumo.setText();
//            }

//            if (callback && typeof callback === 'function') {
//                callback();
//            }
//        },
//        error: function (xhr, status, error) {
//            console.error("Error loading categories:", status, xhr.status, error);
//            if (callback && typeof callback === 'function') {
//                callback();
//            }
//        }
//    });
//}
function loadFloors() {
    $.ajax({
        async: true,
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETFLOORS")),
        type: 'POST',
        data: {},
        dataType: 'json',
        success: function (data) {
            var $floorSelect = $('#txtFloorId');

            var currentSelected = $floorSelect.val();
            $floorSelect.find('option[value!=""]').remove();

            if (data && data.length > 0 && data[0].RESULT) {
                var floorData = data[0].RESULT.split(',');
                for (var i = 0; i < floorData.length; i++) {
                    var floorItem = floorData[i].split('_');
                    if (floorItem.length >= 2) {

                        var floorId = parseInt(floorItem[0].trim(), 10);
                        var floorName = floorItem[1].trim();
                        $floorSelect.append('<option value="' + floorId + '">' + floorName + '</option>');
                    }
                }
            }
            else if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (item && item.ID && item.NAME) {

                        var floorId = parseInt(item.ID, 10);
                        var floorName = item.NAME;
                        $floorSelect.append('<option value="' + floorId + '">' + floorName + '</option>');
                    }
                }
            }

            if (currentSelected && currentSelected.length > 0) {
                $floorSelect.val(currentSelected);
            }

            if ($floorSelect[0] && $floorSelect[0].sumo) {
                $floorSelect[0].sumo.reload();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error loading floors:", status, xhr.status, error);
        }
    });
}

//function loadZoneDepartmentDropdowns() {
//    var FinalUrl = hurl + "Service/Service.aspx?" +
//        "Process=" + encodeURIComponent(Encrypt("GETZONEDEPARTMENT"));

//    $.ajax({
//        type: "POST",
//        url: FinalUrl,
//        data: {},
//        dataType: "json",
//        success: function (data) {

//            var $zoneSelect = $('#search_ZonesName');
//            $zoneSelect.empty().append($('<option>', { value: '', text: '--Select--' }));
//            if (data?.zones?.forEach) {
//                data.zones.forEach(zone => $zoneSelect.append($('<option>', {
//                    value: zone.id || '',
//                    text: zone.name || 'Unknown'
//                })));
//            }
//            $zoneSelect[0]?.sumo?.reload();

//            var $deptSelect = $('#txtDepartmentId');
//            $deptSelect.empty().append($('<option>', { value: '', text: '' }));

//            if (data?.departments?.forEach) {
//                data.departments.forEach(dept => $deptSelect.append($('<option>', {
//                    value: dept.id || '',
//                    text: dept.name || 'Unknown'
//                })));
//            }

//            $deptSelect[0]?.sumo?.reload();
//        },
//        error: (xhr, status, error) => console.error("Error:", status, xhr.status, xhr.responseText?.substring(0, 200))
//    });
//}

$(document).ready(function () {
    $('#txtDepartmentId').SumoSelect();
    //loadZoneDepartmentDropdowns();
    loadDepartments();
    loadFloors();
});

$(document).ready(function () {
    $('#txtDepartmentId').on('change', function () {
        loadCategoryTypes();
    });
});

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

    var encProcess = Encrypt("GETUSERS").toString();
    var encSearch = Encrypt($('#TextSearchLocation').val()).toString();
    var encPageIndex = Encrypt(pageIndex.toString()).toString();
    var encPageSize = Encrypt(pageSize.toString()).toString();
    var encServiceId = Encrypt(ServiceCode.toString()).toString();

    var FinalUrl = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(encProcess) +
        "&Search=" + encodeURIComponent(encSearch) +
        "&PageIndex=" + encodeURIComponent(encPageIndex) +
        "&PageSize=" + encodeURIComponent(encPageSize) +
        "&SERVICEID=" + encodeURIComponent(encServiceId); $.ajax({
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
        eleCategory = $('#RequsetCategory'), DCat = args.getDataKeyValue("UCAT"), txtDest = args.getDataKeyValue("SDESTINATION"), PatientName = args.getDataKeyValue("PATIENTNAME"), userName = args.getDataKeyValue("USER"), extn_No = args.getDataKeyValue("EXTN_NO");

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

function setEditUser(UserId, UserName, MId, pwd, device, IsActive, PShort, PAlDay, PisQah,
    Department, CategoryIds, FloorIds, Gender, APPID, ProfilePicture) {

    window.PUserID = UserId;
    PUserID = UserId;
    EUserID = UserId;
    EUserName = UserName;
    EIsActive = IsActive;
    EMId = MId;
    EAPPID = APPID;

    $('#txtShort').val(PShort || '');
    $('#txtUserName').val(UserName || '');
    $('#txtMID').val(MId || '');
    $('#ddlAppId').val(APPID.toString());
    if ($('#ddlAppId')[0].sumo) {
        $('#ddlAppId')[0].sumo.reload();
    }
    $('#txtPwd').val(pwd);
    $('#txtDevice').val(device || '');
    $('#txtProfileImage').val(ProfilePicture || '');

    $('#ddlGenderType').val(Gender.toString());
    if ($('#ddlGenderType')[0].sumo) {
        $('#ddlGenderType')[0].sumo.reload();
    }

    var departmentArray = [];
    if (Department && Department.trim() !== '') {
        departmentArray = Department.split(',').map(id => id.trim()).filter(id => id !== '');
    }
    $('#txtDepartmentId').val(departmentArray);

    var categoryArray = [];
    if (CategoryIds && CategoryIds.trim() !== '') {
        categoryArray = CategoryIds.split(',').map(id => id.trim()).filter(id => id !== '');
    }
    var floorArray = [];
    if (FloorIds && FloorIds.trim() !== '') {
        floorArray = FloorIds.split(',').map(id => id.trim()).filter(id => id !== '');
    }
    $('#txtFloorId').val(floorArray);

    $('#chkIsAllDay').attr("src", (PAlDay && PAlDay.toUpperCase() == "ALL DAY") ? "../images/CCheck.png" : "../images/CNoCheck.png");

    var isActiveValue = IsActive || '';
    var isActiveChecked = false;
    if (isActiveValue === '1' || isActiveValue === 'True' || isActiveValue === true || isActiveValue === 'true') {
        isActiveChecked = true;
    }
    $('#chkIsActive').attr("src", isActiveChecked ? "../images/CCheck.png" : "../images/CNoCheck.png");

    var serviceIds = (PisQah || '').toString();
    var hasQAH = serviceIds.indexOf("1") !== -1;
    var hasRAD = serviceIds.indexOf("3") !== -1;
    $('#chkQAH').attr("src", hasQAH ? "../images/CCheck.png" : "../images/CNoCheck.png");
    $('#chkRAD').attr("src", hasRAD ? "../images/CCheck.png" : "../images/CNoCheck.png");

    if ($('#txtDepartmentId')[0] && $('#txtDepartmentId')[0].sumo) {
        $('#txtDepartmentId')[0].sumo.reload();
        $('#txtDepartmentId')[0].sumo.setText();
    }

    if ($('#txtFloorId')[0] && $('#txtFloorId')[0].sumo) {
        $('#txtFloorId')[0].sumo.reload();
        $('#txtFloorId')[0].sumo.setText();
    }

    $('#txtCategoryTypes').parent().append('<div class="category-loading">Loading categories...</div>');

    loadCategoryTypes(departmentArray, function () {

        $('.category-loading').remove();

        // SET CATEGORY VALUES
        $('#txtCategoryTypes').val(categoryArray);

        // RELOAD CATEGORY SUMO
        if ($('#txtCategoryTypes')[0] && $('#txtCategoryTypes')[0].sumo) {

            $('#txtCategoryTypes')[0].sumo.reload();
            $('#txtCategoryTypes')[0].sumo.setText();
        }

        $('#LocationHeader').html('Update Operative');

        $('#btnDeleteLocation').css("display", "flex");

        ShowModalAddUser();

    });

    //loadCategoryTypes(function () {

    //    $('.category-loading').remove();

    //    $('#txtCategoryTypes').val(categoryArray);

    //    if ($('#txtCategoryTypes')[0] && $('#txtCategoryTypes')[0].sumo) {
    //        $('#txtCategoryTypes')[0].sumo.reload();
    //        $('#txtCategoryTypes')[0].sumo.setText();
    //    }

    //    $('#LocationHeader').html('Update Porter');
    //    $('#btnDeleteLocation').css("display", "flex");

    //    ShowModalAddUser();

    //});
}
function addUser() {
    $('#hdnPorterID').val('New');
    $('#txtUserName').val('');
    $('#txtMID').val('');
    $('#txtPwd').val('');
    $('#txtShort').val('');
    $('#txtDepartmentId').val('');
    $('#txtCategoryTypes').val('');
    $('#txtFloorId').val('');
    $('#txtProfileImage').val('');
    $('#fileProfileImage').val('');
    $('#hdnProfilePicture').val('');
    $('#ddlAppId').val('');
    $('#ddlGenderType').val('');

    if ($('#txtDepartmentId')[0].sumo) $('#txtDepartmentId')[0].sumo.reload();
    if ($('#txtCategoryTypes')[0].sumo) $('#txtCategoryTypes')[0].sumo.reload();
    if ($('#txtFloorId')[0].sumo) $('#txtFloorId')[0].sumo.reload();
    if ($('#ddlGenderType')[0].sumo) $('#ddlGenderType')[0].sumo.reload();
    if ($('#ddlAppId')[0].sumo) $('#ddlAppId')[0].sumo.reload();
    $('#chkIsActive').attr("src", "../images/CNoCheck.png");
    $('#LocationHeader').html('Add Operative');
    $('#btnDeleteLocation').hide();

    $('#addUser').modal('show');
    setTimeout(function () { $('#txtUserName').focus(); }, 500);
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

function submitUser() {

    $('.form-control').css('border', '1px solid #ced4da');
    $('.SumoSelect .CaptionCont').css('border', '1px solid #ced4da');
    $('.validation-message').remove();

    let isValid = true;

    var Action = $('#LocationHeader').html();

    var userName = $('#txtUserName').val().trim();
    var MID = $('#txtMID').val().trim();
    var ktxtPwd = $('#txtPwd').val().trim();
    var PShort = $('#txtShort').val().trim();
    var PAlDay = $('#chkIsAllDay').attr("src") || '';
    var Pisact = $('#chkIsActive').attr("src");

    var department = $('#txtDepartmentId').val();
    var categoryTypes = $('#txtCategoryTypes').val();
    var floorIds = $('#txtFloorId').val();
    var profileImage = $('#txtProfileImage').val();
    var appId = $('#ddlAppId').val();
    var fileInput = $('#fileProfileImage')[0];
    var profilePictureFile = fileInput.files[0]

    if (!userName) {
        $('#txtUserName').css('border', '1px solid red');
        showValidationMessage('txtUserName', 'Porter Name is required.');
        isValid = false;
    }

    if (!MID) {
        $('#txtMID').css('border', '1px solid red');
        showValidationMessage('txtMID', 'User Name is required.');
        isValid = false;
    }

    var department = $('#txtDepartmentId').val();

    if (!department || department.length === 0) {

        $('#txtDepartmentId').next('.SumoSelect').find('.CaptionCont').css('border', '1px solid red');

        showValidationMessage('txtDepartmentId', 'Department Name is required.');

        isValid = false;
    }

    var gender = $('#ddlGenderType').val();

    //if (!gender) {

    //    $('#ddlGenderType').next('.SumoSelect').find('.CaptionCont').css('border', '1px solid red');

    //    showValidationMessage('ddlGenderType', 'Gender is required.');

    //    isValid = false;
    //}
    //if (!PShort) {
    //    $('#txtShort').css('border', '1px solid red');
    //    showValidationMessage('txtShort', 'Short Name is required.');
    //    isValid = false;
    //}

    if (Action == 'Add Operative') {
        if (!ktxtPwd) {
            $('#txtPwd').css('border', '1px solid red');
            showValidationMessage('txtPwd', 'Password is required.');
            isValid = false;
        }
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

    var categoryIdsStr = '';
    if (categoryTypes && categoryTypes.length > 0) {
        categoryIdsStr = categoryTypes.join(',');
    }

    var floorIdsStr = '';
    if (floorIds && floorIds.length > 0) {
        floorIdsStr = floorIds.join(',');
    }

    var PUserID = (Action == 'Add Operative') ? "new" : window.PUserID;


    if (profilePictureFile) {
        uploadProfileImage(function (uploadedFileName) {
            var finalProfileImage = uploadedFileName || profileImage;
            AddUpdateuser(
                PUserID,
                userName,
                MID,
                ktxtPwd,
                PShort,
                ((Pisact == '../images/CCheck.png') ? '1' : '0'),
                department,
                categoryIdsStr,
                floorIdsStr,
                finalProfileImage,
                gender,
                appId,
                (Action == 'Add Operative') ? "INSERT" : "UPDATE"
            );
        });
    } else {
        AddUpdateuser(
            PUserID,
            userName,
            MID,
            ktxtPwd,
            PShort,
            ((Pisact == '../images/CCheck.png') ? '1' : '0'),
            department,
            categoryIdsStr,
            floorIdsStr,
            profileImage,
            gender,
            appId,
            (Action == 'Add Operative') ? "INSERT" : "UPDATE"
        );
    }
}
function AddUpdateuser(PUserID, UserName, MId, ktxtPwd, PShort, Pisact, department, categoryIds, floorIds, profilePicture, gender, appId, Action) {


    if (department) {

        if (Array.isArray(department)) {

            department = department.filter(function (value) {
                return value !== 'ALL';
            }).join(',');

        } else {

            department = department
                .split(',')
                .filter(function (value) {
                    return value !== 'ALL';
                })
                .join(',');
        }
    }

    if (categoryIds) {

        if (Array.isArray(categoryIds)) {

            categoryIds = categoryIds.filter(function (value) {
                return value !== 'ALL';
            }).join(',');

        } else {

            categoryIds = categoryIds
                .split(',')
                .filter(function (value) {
                    return value !== 'ALL';
                })
                .join(',');
        }
    }

    var profilePictureStr = '';

    if (profilePicture === null || profilePicture === undefined) {
        profilePictureStr = '';
    } else if (typeof profilePicture === 'string') {
        profilePictureStr = profilePicture.trim();
    } else if (Array.isArray(profilePicture)) {

        if (profilePicture.length > 0) {
            var firstItem = profilePicture[0];
            if (typeof firstItem === 'object' && firstItem.IMAGE) {
                profilePictureStr = firstItem.IMAGE;
            } else if (typeof firstItem === 'string') {
                profilePictureStr = firstItem;
            }
        }
    } else if (typeof profilePicture === 'object') {

        if (profilePicture.IMAGE) {
            profilePictureStr = profilePicture.IMAGE;
        } else if (profilePicture.name) {
            profilePictureStr = profilePicture.name;
        } else {
            var str = String(profilePicture);
            profilePictureStr = (str === '[object Object]') ? '' : str;
        }
    } else {
        profilePictureStr = String(profilePicture);
    }

    if (profilePictureStr === '[object Object]') {
        profilePictureStr = '';
    }

    console.log('PUserID:', PUserID);

    var encProcess = Encrypt("UPDATEPORTER").toString();
    var encUserName = Encrypt(UserName).toString();
    var encMId = Encrypt(MId.toString()).toString();
    var encPUserID = Encrypt(PUserID.toString()).toString();
    var encPassword = Encrypt(ktxtPwd).toString();
    var encPShort = Encrypt(PShort).toString();
    var encPisact = Encrypt(Pisact).toString();
    var encDepartment = Encrypt(department).toString();
    var encCategoryIds = Encrypt(categoryIds).toString();
    var encFloorIds = Encrypt(floorIds).toString();
    var encProfilePicture = Encrypt(profilePictureStr).toString();
    var encgender = Encrypt(gender).toString();
    var encAppId = Encrypt(appId.toString()).toString();
    $.ajax({
        async: true,
        url: hurl + 'Service/Service.aspx?Process=' + encodeURIComponent(encProcess) +
            '&PORTERNAME=' + encodeURIComponent(encUserName) +
            '&GPMId=' + encodeURIComponent(encMId) +
            '&USERID=' + encodeURIComponent(encPUserID) +
            '&PASSWORD=' + encodeURIComponent(encPassword) +
            '&GPShort=' + encodeURIComponent(encPShort) +
            '&ISACTIVE=' + encodeURIComponent(encPisact) +
            '&ServiceID=' + encodeURIComponent(encDepartment) +
            '&CATEGORYIDS=' + encodeURIComponent(encCategoryIds) +
            '&FLOORIDS=' + encodeURIComponent(encFloorIds) +
            '&PROFILEPICTURE=' + encodeURIComponent(encProfilePicture) +
            '&GENDER=' + encodeURIComponent(encgender) +
            '&APPID=' + encodeURIComponent(encAppId) +
            '&ACTION=' + encodeURIComponent(Encrypt(Action).toString()),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (data) {
            if (data[0].RESULT.split("_")[0] === 'TRUE') {
                $('#LBLRequestResult').html('Porter Details ' + ((Action == "UPDATE") ? 'Updated' : 'Added') + ' Successfully.. Porter Name. #' + UserName);
                HideModalPopUp('addUser');
                $('#LBLGenericSuccessResult').html('Porter Details ' + ((Action == "UPDATE") ? 'Updated' : 'Added') + ' Successfully!');
                ShowModalPopUp('modalGenericSuccess');
                setTimeout(function () {
                    HideModalPopUp('modalGenericSuccess');
                }, 2500);
                LoadProcess();
            } else {
                ShowModalPopUp('modalAlert');
                setTimeout("HideModalPopUp('modalAlert');", 3500);
            }
        },
        error: function (data) {
            $('#').html(data[0].RESULT);
        }
    });
}

function uploadProfileImage(callback) {
    var fileInput = document.getElementById('fileProfileImage');
    var file = fileInput && fileInput.files[0];

    if (!file) {
        callback('Default.jpg');
        return;
    }

    var encProcess = Encrypt("UPLOADPORTERIMAGE").toString();
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
            callback('Default.jpg');
        }
    });

}

function deleteLocation() {
    var UserName = $('#txtUserName').val();

    var PorterID = window.PUserID || $('#hdnPorterID').val() || '';

    if (!PorterID || PorterID === '' || PorterID === 'new') {
        return;
    }

    var Action = 'DELETE';

    var encProcess = Encrypt("UPDATEPORTER").toString();
    var encAction = Encrypt(Action).toString();
    var encPorterID = Encrypt(PorterID.toString()).toString();
    var encUserName = Encrypt(UserName).toString();

    $.ajax({
        async: true,
        url: hurl + "SERVICE/Service.aspx?Process=" + encodeURIComponent(encProcess) +
            "&ACTION=" + encodeURIComponent(encAction) +
            "&USERID=" + encodeURIComponent(encPorterID) +
            "&PORTERNAME=" + encodeURIComponent(encUserName),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (data) {

            if (data && data[0] && data[0].RESULT) {
                var result = data[0].RESULT;

                if (result.startsWith('TRUE')) {
                    $('#LBLRequestResult').html('Porter Details Removed Successfully.. #' + UserName);
                    HideModalPopUp('addUser');
                    ShowModalPopUp('modalSuccess');
                    setTimeout(function () {
                        HideModalPopUp('modalSuccess');
                    }, 2500);
                    LoadProcess();
                } else {
                    alert('Delete failed: ' + result.replace('FALSE - ', ''));
                }
            } else {
                alert('Delete failed: Invalid server response');
            }
        },
        error: function (xhr, status, error) {
        }
    });
}

$(document).ready(function () {
    $('#txtDepartmentId').SumoSelect({
        placeholder: '--Select--',
        search: true,
        searchText: 'Type to search...',
        selectAll: false,
        okCancelInMulti: true,
        csvDispCount: 1,
        captionFormat: '{0} Selected',
        captionFormatNoSelection: '--Select--',
        floatWidth: 400
    });

    $('head').append(`
    <style>
        .SumoSelect .MultiControls {
            display: flex !important;
            justify-content: space-between !important;
            padding: 5px !important;
            border-top: 1px solid #ddd !important;
            background: #f5f5f5 !important;
        }
        
        .SumoSelect .ok, .SumoSelect .cancel {
            padding: 2px 10px !important;
            border: none !important;
            border-radius: 3px !important;
            cursor: pointer !important;
            font-size: 13px !important;
            font-weight: normal !important;
            line-height: 20px !important;
            height: 24px !important;
        }
        
        .SumoSelect .ok {
            background: #0d6efd !important;
            color: white !important;
        }
        
        .SumoSelect .cancel {
            background: #6c757d !important;
            color: white !important;
        }
        
        .SumoSelect .ok:hover { background: #0b5ed7 !important; }
        .SumoSelect .cancel:hover { background: #5c636a !important; }
        .SumoSelect .select-all { display: none !important; }
        .SumoSelect .optWrapper.multiple > .options { max-height: 160px !important; }
    </style>
`);

    loadDepartments();
});

function loadDepartments() {
    $.ajax({
        async: true,
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETZONEDEPARTMENT")),
        type: 'POST',
        data: {},
        dataType: 'json',
        success: function (data) {
            var $deptSelect = $('#txtDepartmentId');

            var currentSelected = $deptSelect.val();
            //$deptSelect.find('option[value!=""]').remove();
            $deptSelect.empty();
            $deptSelect.append('<option value="" disabled>--Select--</option>');
            $deptSelect.append('<option value="ALL">ALL</option>');

            if (data?.departments?.length > 0) {
                data.departments.forEach(function (dept) {
                    if (dept && dept.id && dept.name) {
                        $deptSelect.append('<option value="' + dept.id + '">' + dept.name + '</option>');
                    }
                });
            }

            if (currentSelected && currentSelected.length > 0) {
                $deptSelect.val(currentSelected);
            }

            if ($deptSelect[0] && $deptSelect[0].sumo) {
                $deptSelect[0].sumo.reload();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error loading departments:", status, xhr.status, error);
        }
    });
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
    var CRole = sessionStorage.getItem('ROLE').toUpperCase(), UID = sessionStorage.getItem('ID');

    var UserID = args.get_item().getDataKeyValue("ID");
    var UserName = args.get_item().getDataKeyValue("USERNAME");
    var IsActive = args.get_item().getDataKeyValue("ISACTIVE");
    var MId = args.get_item().getDataKeyValue("MID");
    var ktxtPwd = args.get_item().getDataKeyValue("PASSWORD");
    var Pdevice = args.get_item().getDataKeyValue("DEVICE");
    var PShort = args.get_item().getDataKeyValue("SHORT");

    var PAlDay = args.get_item().getDataKeyValue("ALLDAY") || '';
    var PisQah = args.get_item().getDataKeyValue("SERVICEID") || args.get_item().getDataKeyValue("EQ_SERVICEID") || '';

    var Department = args.get_item().getDataKeyValue("DEPARTMENT_ID") || '';
    var CategoryIds = args.get_item().getDataKeyValue("CategoryIds") || '';
    var FloorIds = args.get_item().getDataKeyValue("FloorIds") || '';
    var ProfilePicture = args.get_item().getDataKeyValue("PROFILEPICTURE") || '';
    var Gender = args.get_item().getDataKeyValue("Gender") || '';
    var APPID = args.get_item().getDataKeyValue("APPID") || '';


    if (MId === "undefined" || MId === undefined) {
        MId = '';
    }
    function safeString(value) {
        if (value === null || value === undefined || value === "undefined") return '';
        if (typeof value !== 'string') {
            value = String(value);
        }
        return value.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    var safeUserID = safeString(UserID);
    var safeUserName = safeString(UserName);
    var safeMId = safeString(MId);
    var safePwd = safeString(ktxtPwd);
    var safeDevice = safeString(Pdevice);
    var safeIsActive = safeString(IsActive);
    var safePShort = safeString(PShort);
    var safePAlDay = safeString(PAlDay);
    var safePisQah = safeString(PisQah);
    var safeDepartment = safeString(Department);
    var safeCategoryIds = safeString(CategoryIds);
    var safeFloorIds = safeString(FloorIds);
    var safeProfilePicture = safeString(ProfilePicture);
    var safeGender = safeString(Gender);
    var safeAppID = safeString(APPID);


    var cellEdit = args.get_item().get_cell("EDIT");

    var editLink = '<div class="add-task-link" onclick="setEditUser(\'' +
        safeUserID + '\', \'' +
        safeUserName + '\', \'' +
        safeMId + '\', \'' +
        safePwd + '\', \'' +
        safeDevice + '\', \'' +
        safeIsActive + '\', \'' +
        safePShort + '\', \'' +
        safePAlDay + '\', \'' +
        safePisQah + '\', \'' +
        safeDepartment + '\', \'' +
        safeCategoryIds + '\', \'' +
        safeFloorIds + '\', \'' +
        safeGender + '\', \'' +
        safeAppID + '\', \'' +
        safeProfilePicture + '\');">' +
        '<a href="javascript:void(0)" class="btn btn-indexblue">' +
        '<img src="../images/memo.png" alt="Edit Porter"></a></div>';

    RUID = args.get_item().getDataKeyValue("USERID");
    $(cellEdit).html(editLink);
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

///akkSSK

$(document).ready(function () {

    let previousAllSelected = false;

    $('#txtDepartmentId').on('change', function () {

        var $dropdown = $('#txtDepartmentId');

        var selected = $dropdown.val() || [];

        var allValues = [];

        // =========================
        // GET VALUES
        // =========================
        if (selected.includes('ALL')) {

            $('#txtDepartmentId option').each(function () {

                var value = $(this).val();

                if (value && value !== 'ALL') {
                    allValues.push(value);
                }
            });
        }
        else {

            allValues = selected.filter(function (value) {
                return value !== 'ALL';
            });
        }



        // =========================
        // SELECT ALL
        // =========================
        if (selected.includes('ALL') && !previousAllSelected) {

            previousAllSelected = true;

            var finalValues = ['ALL'].concat(allValues);

            $dropdown.val(finalValues);

            if ($dropdown[0].sumo) {
                $dropdown[0].sumo.reload();
            }

            setTimeout(function () {

                $dropdown.next('.SumoSelect')
                    .find('.CaptionCont span')
                    .text(allValues.length + ' Selected');

            }, 50);

            loadCategoryTypes(allValues);

            return;
        }

        // =========================
        // UNCHECK ALL
        // =========================
        else if (!selected.includes('ALL') && previousAllSelected) {

            previousAllSelected = false;

            // CLEAR DEPARTMENT
            $('#txtDepartmentId option').prop('selected', false);

            $dropdown.val([]);

            if ($dropdown[0].sumo) {
                $dropdown[0].sumo.reload();
            }

            setTimeout(function () {

                $dropdown.next('.SumoSelect')
                    .find('.CaptionCont span')
                    .text('--Select--');

            }, 50);

            // CLEAR CATEGORY
            clearCategoryDropdown();

            return;
        }

        // =========================
        // REMOVE ALL IF ANY ITEM UNCHECKED
        // =========================
        else if (
            selected.includes('ALL') &&
            selected.length - 1 !== allValues.length
        ) {

            previousAllSelected = false;

            var filteredValues = selected.filter(function (value) {
                return value !== 'ALL';
            });

            $dropdown.val(filteredValues);

            if ($dropdown[0].sumo) {
                $dropdown[0].sumo.reload();
            }

            allValues = filteredValues;
        }

        // =========================
        // NOTHING SELECTED
        // =========================
        if (!allValues || allValues.length == 0) {

            clearCategoryDropdown();

            return;
        }

        // =========================
        // LOAD CATEGORY
        // =========================
        loadCategoryTypes(allValues);

    });

});



$(document).ready(function () {

    let previousAllSelected = false;

    $('#txtCategoryTypes').on('change', function () {

        var $dropdown = $('#txtCategoryTypes');

        var selected = $dropdown.val() || [];

        var allValues = [];

        // =========================
        // GET VALUES
        // =========================
        if (selected.includes('ALL')) {

            $('#txtCategoryTypes option').each(function () {

                var value = $(this).val();

                if (value && value !== 'ALL') {
                    allValues.push(value);
                }
            });
        }
        else {

            allValues = selected.filter(function (value) {
                return value !== 'ALL';
            });
        }



        // =========================
        // SELECT ALL
        // =========================
        if (selected.includes('ALL') && !previousAllSelected) {

            previousAllSelected = true;

            var finalValues = ['ALL'].concat(allValues);

            $dropdown.val(finalValues);

            if ($dropdown[0].sumo) {
                $dropdown[0].sumo.reload();
            }

            setTimeout(function () {

                $dropdown.next('.SumoSelect')
                    .find('.CaptionCont span')
                    .text(allValues.length + ' Selected');

            }, 50);



            return;
        }

        // =========================
        // UNCHECK ALL
        // =========================
        else if (!selected.includes('ALL') && previousAllSelected) {

            previousAllSelected = false;


            $('#txtCategoryTypes option').prop('selected', false);

            $dropdown.val([]);

            if ($dropdown[0].sumo) {
                $dropdown[0].sumo.reload();
            }

            setTimeout(function () {

                $dropdown.next('.SumoSelect')
                    .find('.CaptionCont span')
                    .text('--Select--');

            }, 50);



            return;
        }

        // =========================
        // REMOVE ALL IF ANY ITEM UNCHECKED
        // =========================
        else if (
            selected.includes('ALL') &&
            selected.length - 1 !== allValues.length
        ) {

            previousAllSelected = false;

            var filteredValues = selected.filter(function (value) {
                return value !== 'ALL';
            });

            $dropdown.val(filteredValues);

            if ($dropdown[0].sumo) {
                $dropdown[0].sumo.reload();
            }

            allValues = filteredValues;
        }





    });

});



// =========================
// LOAD CATEGORY TYPES
// =========================
function loadCategoryTypes(allValues, callback) {

    var $categorySelect = $('#txtCategoryTypes');

    // =========================
    // IF EMPTY
    // =========================
    if (!allValues || allValues.length == 0) {

        clearCategoryDropdown();

        return;
    }

    // REMOVE ALL
    allValues = allValues.filter(function (value) {
        return value !== 'ALL';
    });

    // AGAIN CHECK
    if (allValues.length == 0) {

        clearCategoryDropdown();

        return;
    }

    var deptIdString = allValues.join(',');

    var encryptedDeptId = Encrypt(deptIdString).toString();

    $.ajax({

        async: true,

        url: hurl +
            "Service/Service.aspx?Process=" +
            encodeURIComponent(Encrypt("GETCATEGORYTYPES")) +
            "&DepartmentId=" +
            encodeURIComponent(encryptedDeptId),

        type: 'POST',
        data: 'pData',
        dataType: 'json',

        success: function (data) {

            // CLEAR OLD DATA
            clearCategoryDropdown();
            $categorySelect.append('<option value="ALL">ALL</option>');
            // LOAD NEW DATA
            if (data && data.length > 0) {

                $.each(data, function (i, item) {

                    if (item && item.ID && item.NAME) {

                        $categorySelect.append(
                            '<option value="' + item.ID + '">' +
                            item.NAME +
                            '</option>'
                        );
                    }
                });
            }

            // RELOAD SUMO
            if ($categorySelect[0] && $categorySelect[0].sumo) {

                $categorySelect[0].sumo.reload();
            }

            if (callback && typeof callback === 'function') {
                callback();
            }
        },

        error: function (xhr, status, error) {

            console.error(
                "Error loading categories:",
                status,
                xhr.status,
                error
            );

            clearCategoryDropdown();

            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    });
}


// =========================
// CLEAR CATEGORY DROPDOWN
// =========================
function clearCategoryDropdown() {

    var $categorySelect = $('#txtCategoryTypes');

    // CLEAR VALUE
    $categorySelect.val([]);

    // REMOVE ALL OPTIONS
    $categorySelect.empty();

    // ADD DEFAULT OPTION
    $categorySelect.append(
        '<option value="" disabled selected>--Select--</option>'
    );

    // IMPORTANT
    $('#txtCategoryTypes option').prop('selected', false);

    // RELOAD SUMO
    if ($categorySelect[0] && $categorySelect[0].sumo) {

        $categorySelect[0].sumo.reload();
    }

    // RESET TEXT
    setTimeout(function () {

        $categorySelect.next('.SumoSelect')
            .find('.CaptionCont span')
            .html('--Select--');

        // HIDE OLD LIST
        $categorySelect.next('.SumoSelect')
            .find('.optWrapper ul.options')
            .html('');

    }, 100);
}




function loadGenderType() {
    var select = $('#ddlGenderType');
    select.empty().append('<option value="" selected disabled>--Select--</option>')
    var genderType = [{ id: '1', name: 'Male' }, { id: '2', name: 'Female' }, { id: '3', name: 'Other' }];
    $.each(genderType, function (index, item) {
        select.append('<option value="' + item.id + '">' + item.name + '</option > ');
    });
    if (select[0].sumo) {
        select[0].sumo.reload();
    } else {
        select.SumoSelect({
            placeholder: '--select--', search: true
        });
    }
}
function loadAppId() {
    var select = $('#ddlAppId');

    select.empty().append('<option value="" selected disabled>--Select--</option>');

    var appIdList = [
        { id: '1', name: 'Traczo' },
        { id: '2', name: 'DIAL50' },
        { id: '3', name: 'All' }
    ];

    $.each(appIdList, function (index, item) {
        select.append(
            '<option value="' + item.id + '">' + item.name + '</option>'
        );
    });

    if (select[0].sumo) {
        select[0].sumo.reload();
    } else {
        select.SumoSelect({
            placeholder: '--Select--',
            search: true
        });
    }
}

$(document).ready(function () {
    loadGenderType();
    loadAppId();
});
