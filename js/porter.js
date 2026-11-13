var arr = ["TextSOURCE", "TextCATEGORY", "TextDESTINATION"], ReqIcon = ["tdReqNew", "tdReqPending", "tdReqAssigned", "tdReqInProc", "tdReqCompleted", "tdReqCancelled", "tdPreBook", "tdReqMap"],
    Source = '', Dest = '', User = '', Cat = '', AStatus = '', CancelReqId = '', EStatus = '', Intervl = 0, EReqId = '', ReqArr = ["tdReqPending", "tdReqAssigned", "tdReqInProc", "tdReqCompleted", "tdReqCancelled", "tdPreBook"],
    CurPendProcess = '', AReqId = '', MReqId = '', IsChecked = false, Port = '', Name = "", RequestType = '', CurrentCancelStatus = '';

var arrRoles = ['2_SUPERVISOR', '3_NURSE'];

var isDeptAllSelected = false;
var isCatAllSelected = false;
var selectedCategoryValues = [];
var selectedDepartmentValues = [];
var isLoadingCategories = false;

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
                $('#search_RoleName').html('');
                $('#search_RoleName')[0].sumo.add('0', '-- Select --');
                $('#search_RoleName')[0].sumo.reload();
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
        okCancelInMulti: true,
        csvDispCount: 999,
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

    loadCategoryTypes();
});

function loadCategoryTypes(departmentIds, callback) {
    isLoadingCategories = true;

    if (!departmentIds) {
        departmentIds = $('#txtDepartmentId').val();
    }

    if (!departmentIds || departmentIds.length === 0) {
        clearCategoryDropdown();
        isLoadingCategories = false;
        if (callback) callback();
        return;
    }

    var hasAll = false;
    if (Array.isArray(departmentIds)) {
        hasAll = departmentIds.includes('ALL');
    } else if (typeof departmentIds === 'string') {
        hasAll = departmentIds === 'ALL';
    }

    if (hasAll) {
        departmentIds = getAllDepartmentIds();
    }

    departmentIds = departmentIds.filter(function (value) {
        return value !== 'ALL' && value !== '';
    });

    if (departmentIds.length === 0) {
        clearCategoryDropdown();
        isLoadingCategories = false;
        if (callback) callback();
        return;
    }

    var deptIdString = departmentIds.join(',');
    var encryptedDeptId = Encrypt(deptIdString).toString();

    $.ajax({
        async: true,
        url: hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETCATEGORYTYPES"))
            + "&DepartmentId=" + encodeURIComponent(encryptedDeptId),
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (data) {
            var $categorySelect = $('#txtCategoryTypes');

            var currentSelected = [];

            if (selectedCategoryValues && selectedCategoryValues.length > 0) {
                if (selectedCategoryValues[0] === 'ALL') {
                    currentSelected = ['ALL'];
                } else {
                    currentSelected = selectedCategoryValues.slice();
                }
            } else {
                var dropdownVal = $categorySelect.val() || [];
                if (dropdownVal && dropdownVal.length > 0) {
                    currentSelected = dropdownVal;
                }
            }

            $categorySelect.empty();
            $categorySelect.append('<option value="" disabled selected>--Select--</option>');
            $categorySelect.append('<option value="ALL">ALL</option>');

            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (item && item.ID && item.NAME) {
                        $categorySelect.append('<option value="' + item.ID + '">' + item.NAME + '</option>');
                    }
                }
            }

            if (currentSelected && currentSelected.length > 0) {
                if (currentSelected[0] === 'ALL') {
                    $categorySelect.val(['ALL']);
                    isCatAllSelected = true;
                    selectedCategoryValues = ['ALL'];
                } else {
                    var validSelected = [];
                    $categorySelect.find('option').each(function () {
                        var optionVal = $(this).val();
                        if (currentSelected.indexOf(optionVal) !== -1) {
                            validSelected.push(optionVal);
                        }
                    });

                    if (validSelected.length > 0) {
                        $categorySelect.val(validSelected);
                        selectedCategoryValues = validSelected;
                        isCatAllSelected = false;
                    } else {
                        selectedCategoryValues = [];
                        isCatAllSelected = false;
                    }
                }
            } else {
                selectedCategoryValues = [];
                isCatAllSelected = false;
            }

            if ($categorySelect[0] && $categorySelect[0].sumo) {
                $categorySelect[0].sumo.reload();
                $categorySelect[0].sumo.setText();
            }

            isLoadingCategories = false;

            if (callback && typeof callback === 'function') {
                callback();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error loading categories:", status, xhr.status, error);
            isLoadingCategories = false;
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    });
}


function clearCategoryDropdown() {
    var $categorySelect = $('#txtCategoryTypes');
    $categorySelect.val([]);
    $categorySelect.empty();
    $categorySelect.append('<option value="" disabled selected>--Select--</option>');
    $categorySelect.append('<option value="ALL">ALL</option>');
    $('#txtCategoryTypes option').prop('selected', false);

    if ($categorySelect[0] && $categorySelect[0].sumo) {
        $categorySelect[0].sumo.reload();
    }

    setTimeout(function () {
        $categorySelect.next('.SumoSelect')
            .find('.CaptionCont span')
            .html('--Select--');
    }, 100);

}
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
            $floorSelect.empty();
            $floorSelect.append('<option value="" disabled selected>--Select--</option>');

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
function getAllDepartmentIds() {
    var ids = [];
    $('#txtDepartmentId option').each(function () {
        var val = $(this).val();
        if (val && val !== 'ALL' && val !== '' && val !== '--Select--') {
            ids.push(val);
        }
    });
    return ids;
}

function getAllCategoryIds() {
    var ids = [];
    $('#txtCategoryTypes option').each(function () {
        var val = $(this).val();
        if (val && val !== 'ALL' && val !== '' && val !== '--Select--') {
            ids.push(val);
        }
    });
    return ids;
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

    $('#txtCategoryTypes').SumoSelect({
        placeholder: '--Select--',
        search: true,
        searchText: 'Type to search...',
        selectAll: false,
        okCancelInMulti: true,
        csvDispCount: 999,
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
    loadFloors();

    var previousDeptAllSelected = false;

    $('#txtDepartmentId').on('change', function () {
        var $dropdown = $('#txtDepartmentId');
        var selected = $dropdown.val() || [];
        var allDepartmentIds = [];

        $('#txtDepartmentId option').each(function () {
            var val = $(this).val();
            if (val && val !== 'ALL' && val !== '' && val !== '--Select--') {
                allDepartmentIds.push(val);
            }
        });


        if (selected.includes('ALL')) {
            isDeptAllSelected = true;
            selectedDepartmentValues = ['ALL'];
            previousDeptAllSelected = true;

            $dropdown.val(['ALL']);

            if ($dropdown[0].sumo) {
                $dropdown[0].sumo.reload();
            }

            setTimeout(function () {
                $dropdown.next('.SumoSelect').find('.CaptionCont span').text('ALL Selected');
            }, 50);

            if (allDepartmentIds.length > 0) {
                loadCategoryTypes(allDepartmentIds);
            }
            return;
        } else {
            var allValues = selected.filter(function (value) {
                return value !== 'ALL' && value !== '' && value !== '--Select--';
            });

            isDeptAllSelected = false;
            selectedDepartmentValues = allValues;
            previousDeptAllSelected = false;

            $dropdown.val(allValues);

            if ($dropdown[0].sumo) {
                $dropdown[0].sumo.reload();
            }

            if (!allValues || allValues.length == 0) {
                setTimeout(function () {
                    $dropdown.next('.SumoSelect').find('.CaptionCont span').text('--Select--');
                }, 50);
                clearCategoryDropdown();
                return;
            }

            if (allValues.length > 0) {
                loadCategoryTypes(allValues);
            }
        }
    });


    $('#txtCategoryTypes').on('change', function () {
        var $dropdown = $('#txtCategoryTypes');
        var selected = $dropdown.val() || [];

        if (isLoadingCategories) {

            return;
        }

        if (selected.includes('ALL')) {

            isCatAllSelected = true;
            selectedCategoryValues = ['ALL'];

            $dropdown.val(['ALL']);

            if ($dropdown[0].sumo) {
                $dropdown[0].sumo.reload();
            }

            setTimeout(function () {
                $dropdown.next('.SumoSelect').find('.CaptionCont span').text('ALL Selected');
            }, 50);
            return;
        }

        isCatAllSelected = false;

        selectedCategoryValues = selected.filter(function (v) {
            return v !== 'ALL' && v !== '' && v !== '--Select--';
        });

        $dropdown.val(selectedCategoryValues);

        if ($dropdown[0].sumo) {
            $dropdown[0].sumo.reload();
        }

        setTimeout(function () {
            var captionText = selectedCategoryValues.length > 0 ? selectedCategoryValues.length + ' Selected' : '--Select--';
            $dropdown.next('.SumoSelect').find('.CaptionCont span').text(captionText);
        }, 50);

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
    var FinalValue = rawValue.replace(/[^\w\s]/gi, '').replace(/\s/g, '');
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
    var src = $('#ImgMultiPorter').attr('src');
    $('#ImgMultiPorter').attr("src", (src == "images/MultiUnselect.png") ? "images/MultiSelected.png" : "images/MultiUnselect.png");
}

function changeMPorter() {
    var src = $('#ImgMPorter').attr('src');
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
    return ((TPBDate != 'Pre-Book') ? (TPBDate.split('/')[1] + '/' + TPBDate.split('/')[0] + '/' + TPBDate.split('/')[2]) : TPBDate);
}

function InsertRequest() {
    var Visiblility = $('#ImgMultiPorter').css("visibility"), MultiSrc = $('#ImgMultiPorter').attr('src'), IsMultiPorter = ((MultiSrc == 'images/MultiSelected.png') && (Visiblility == 'visible')) ? "1" : "0",
        UID = sessionStorage.getItem('ID'), time = (((new Date().getHours().toString()).length <= 1) ? ("0" + new Date().getHours().toString()) : (new Date().getHours()))
            + ":" + (((new Date().getMinutes().toString()).length <= 1) ? ("0" + new Date().getMinutes()) : new Date().getMinutes()),
        PBDate = GetPBDate($('#requestdate').val());
    var PatientName = FPatientName + '_' + TPatientName, MRDNo = $.trim($('#textMRD').val());
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
    calldatetime(); $('#txtReqRemarks').val('');
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

function AbortAllActiveRuquests() {
    $($.xhrPool).each(function (i, jqXHR) {
        jqXHR.abort();
        $.xhrPool.splice(i, 1);
    });
}

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
            if (CRole === "1" || CRole == "11" || CRole == "12") {
                grid.showColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
                grid.getColumnByUniqueName("DELAYREASON").get_element().innerHTML = "CANCEL";
                grid.showColumn(grid.getColumnByUniqueName("DELAYREASON").get_element().cellIndex);
            }
            else {
                grid.hideColumn(grid.getColumnByUniqueName("NEXT").get_element().cellIndex);
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
}

function rowSelecting(sender, args) {
    var RowCurrent = tableView.get_dataItems()[args.get_itemIndexHierarchical()], CheckBox = $get(args.get_id()).getElementsByTagName("input")[0];
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
    if (dstatus == '2' || dstatus == '3' || (dstatus == '4' && (CRole === "1" || CRole === "12"))) {
        $("#RequsetCategory").css("cursor", ((MIndex == '0') ? "pointer" : "not-allowed"));
        $('#ImgMPorter').attr("src", (MultiPorter == 'YES') ? "images/MSelected.png" : "images/MUnselect.png");
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
    Department, CategoryIds, FloorIds, ProfilePicture) {
    window.PUserID = UserId;
    PUserID = UserId;
    EUserID = UserId;
    EUserName = UserName;
    EIsActive = IsActive;
    EMId = MId;
    $('#txtShort').val(PShort || '');
    $('#txtUserName').val(UserName || '');
    $('#txtMID').val(MId || '');
    $('#txtPwd').val(pwd);
    $('#txtDevice').val(device || '');
    $('#txtProfileImage').val(ProfilePicture || '');
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
        $('#txtCategoryTypes').val(categoryArray);
        if ($('#txtCategoryTypes')[0] && $('#txtCategoryTypes')[0].sumo) {
            $('#txtCategoryTypes')[0].sumo.reload();
            $('#txtCategoryTypes')[0].sumo.setText();
        }
        $('#LocationHeader').html('Update Porter');
        $('#btnDeleteLocation').css("display", "flex");
        ShowModalAddUser();
    });
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

    selectedCategoryValues = [];
    selectedDepartmentValues = [];
    isDeptAllSelected = false;
    isCatAllSelected = false;
 
    if ($('#txtDepartmentId')[0].sumo) $('#txtDepartmentId')[0].sumo.reload();
    if ($('#txtCategoryTypes')[0].sumo) $('#txtCategoryTypes')[0].sumo.reload();
    if ($('#txtFloorId')[0].sumo) $('#txtFloorId')[0].sumo.reload();

    $('#chkIsActive').attr("src", "../images/CNoCheck.png");
    $('#LocationHeader').html('Add Porter');
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

    var department = selectedDepartmentValues && selectedDepartmentValues.length > 0
        ? selectedDepartmentValues
        : ($('#txtDepartmentId').val() || []);

    var categoryTypes = selectedCategoryValues && selectedCategoryValues.length > 0
        ? selectedCategoryValues
        : ($('#txtCategoryTypes').val() || []);

    var floorIds = $('#txtFloorId').val();
    var profileImage = $('#txtProfileImage').val();
    var gender = $('#ddlGenderType').val();

    var fileInput = $('#fileProfileImage')[0];
    var profilePictureFile = fileInput ? fileInput.files[0] : null;

    var deptCaption = $('#txtDepartmentId').next('.SumoSelect').find('.CaptionCont span').text().trim();
    var catCaption = $('#txtCategoryTypes').next('.SumoSelect').find('.CaptionCont span').text().trim();

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

    if (!department || department.length === 0) {
        $('#txtDepartmentId').next('.SumoSelect').find('.CaptionCont').css('border', '1px solid red');
        showValidationMessage('txtDepartmentId', 'Department Name is required.');
        isValid = false;
    }

    if (Action == 'Add Porter') {
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

    var departmentStr = '';

    if (isDeptAllSelected === true) {
        departmentStr = 'ALL';
    } else if (deptCaption && deptCaption === 'ALL Selected') {
        departmentStr = 'ALL';
    } else if (Array.isArray(department) && department.length > 0) {
        if (department.indexOf('ALL') !== -1) {
            departmentStr = 'ALL';
        } else {
            departmentStr = department.filter(function (value) {
                return value && value !== '' && value !== 'ALL' && value !== '--Select--';
            }).join(',');
        }
    } else if (typeof department === 'string' && department) {
        departmentStr = (department === 'ALL') ? 'ALL' : department;
    }

    var categoryIdsStr = '';

    if (isCatAllSelected === true) {
        categoryIdsStr = 'ALL';
    } else if (catCaption && catCaption === 'ALL Selected') {
        categoryIdsStr = 'ALL';
    } else if (Array.isArray(categoryTypes) && categoryTypes.length > 0) {
        if (categoryTypes.indexOf('ALL') !== -1) {
            categoryIdsStr = 'ALL';
        } else {
            categoryIdsStr = categoryTypes.filter(function (value) {
                return value && value !== '' && value !== 'ALL' && value !== '--Select--';
            }).join(',');
        }
    } else if (typeof categoryTypes === 'string' && categoryTypes) {
        categoryIdsStr = (categoryTypes === 'ALL') ? 'ALL' : categoryTypes;
    }

    var floorIdsStr = '';
    if (Array.isArray(floorIds) && floorIds.length > 0) {
        floorIdsStr = floorIds.filter(function (value) {
            return value && value !== '' && value !== '--Select--';
        }).join(',');
    } else if (typeof floorIds === 'string' && floorIds) {
        floorIdsStr = floorIds;
    }

    if (!departmentStr) {
        showValidationMessage('txtDepartmentId', 'Department is required.');
        return false;
    }

    var PUserID = window.PUserID || '';

    if (Action && (Action.indexOf('Add') !== -1)) {
        PUserID = 'New';
    }

    if (!PUserID || PUserID === '' || PUserID === 'undefined') {
        PUserID = 'New';
    }


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
                departmentStr,
                categoryIdsStr,
                floorIdsStr,
                finalProfileImage,
                gender,
                (Action && Action.indexOf('Add') !== -1) ? "INSERT" : "UPDATE"
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
            departmentStr,
            categoryIdsStr,
            floorIdsStr,
            profileImage,
            gender,
            (Action && Action.indexOf('Add') !== -1) ? "INSERT" : "UPDATE"
        );
    }
}

function AddUpdateuser(PUserID, UserName, MId, ktxtPwd, PShort, Pisact, department, categoryIds, floorIds, profilePicture, gender, Action) {

    PUserID = PUserID || 'New';
    UserName = UserName || '';
    MId = MId || '';
    ktxtPwd = ktxtPwd || '';
    PShort = PShort || '';
    Pisact = Pisact || '0';
    department = department || '';
    categoryIds = categoryIds || '';
    floorIds = floorIds || '';
    gender = gender || '';
    Action = Action || 'UPDATE';

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

    var encProcess = Encrypt("UPDATEPORTER").toString();
    var encUserName = Encrypt(String(UserName)).toString();
    var encMId = Encrypt(String(MId)).toString();
    var encPUserID = Encrypt(String(PUserID)).toString();
    var encPassword = Encrypt(String(ktxtPwd)).toString();
    var encPShort = Encrypt(String(PShort)).toString();
    var encPisact = Encrypt(String(Pisact)).toString();
    var encDepartment = Encrypt(String(department)).toString();
    var encCategoryIds = Encrypt(String(categoryIds)).toString();
    var encFloorIds = Encrypt(String(floorIds)).toString();
    var encProfilePicture = Encrypt(String(profilePictureStr)).toString();
    var encgender = Encrypt(String(gender)).toString();

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
            '&ACTION=' + encodeURIComponent(Encrypt(String(Action)).toString()),
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
        csvDispCount: 999,
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
            $deptSelect.empty();
            $deptSelect.append('<option value="" disabled selected>--Select--</option>');
            $deptSelect.append('<option value="ALL">ALL</option>');

            if (data?.departments?.length > 0) {
                data.departments.forEach(function (dept) {
                    if (dept && dept.id && dept.name) {
                        $deptSelect.append('<option value="' + dept.id + '">' + dept.name + '</option>');
                    }
                });
            }

            if (currentSelected && currentSelected.length > 0) {
                var filteredSelected = currentSelected.filter(function (val) {
                    return val !== 'ALL' && val !== '';
                });
                if (filteredSelected.length > 0) {
                    $deptSelect.val(filteredSelected);
                }
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

function changeShiftCheck(ele) {
    var src = $(ele).attr('src');
    $(ele).attr("src", (src == "../images/CNoCheck.png") ? "../images/CCheck.png" : "../images/CNoCheck.png");
}

function changeCheck(ele) {
    var src = $(ele).attr('src');
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