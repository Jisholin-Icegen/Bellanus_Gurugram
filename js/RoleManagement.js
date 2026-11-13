var dataSet = [];
var allRoles = [];
var currentPage = 1;
var rowsPerPage = 10;
var isEditMode = false;
var editRoleId = null;
var deleteRoleId = null;
var currentPermissions = {};

var permissionList = [
    { id: '1', key: 'HOME', label: 'Home' },
    { id: '2', key: 'TRACK', label: 'Track' },
    { id: '3', key: 'REPORTS', label: 'Reports' },
    { id: '4', key: 'ROUTINE', label: 'Planner' },
    { id: '5', key: 'PORTER', label: 'Operative Master' },
    { id: '6', key: 'TASKTYPE', label: 'Task Types' },
    { id: '7', key: 'LOCATIONS', label: 'Location Master' },
    { id: '8', key: 'UPLOAD', label: 'Upload Tasks' },
    { id: '9', key: 'GROUP', label: 'Group Master' },
    { id: '10', key: 'REMARKS', label: 'Remarks Master' },
    { id: '11', key: 'USERS', label: 'User Master' },
    { id: '12', key: 'ROLES', label: 'Role Master' },
    { id: '13', key: 'P3RFORMLOGS', label: 'P3rform Logs' },
    { id: '14', key: 'BREAKS', label: 'Breaks' },
    { id: '15', key: 'STARTCOMPLETE', label: 'StartComplete' },
    { id: '16', key: 'CANCELTASK', label: 'CancelTask' },
    { id: '17', key: 'EQUIPMENT', label: 'Equipment Master' },
    { id: '18', key: 'DEPARTMENT', label: 'Department Master' },
    { id: '19', key: 'DIETTYPES', label: 'Diet Types' },
    { id: '20', key: 'MENUMASTER', label: 'Menu Master' },
    { id: '21', key: 'PATIENT', label: 'Patient' },
    { id: '22', key: 'KITCHEN', label: 'Kitchen' },
    { id: '23', key: 'ORDERS', label: 'Orders' },
    { id: '24', key: 'PREORDERSHEETS', label: 'Pre-Order Sheets' },
    { id: '25', key: 'MENUDOCKET', label: 'Menu Docket' },
    { id: '26', key: 'DELIVERIES', label: 'Deliveries' },
    { id: '27', key: 'DASHBOARD', label: 'Dashboard' },
    { id: '28', key: 'USERMANAGEMENT', label: 'User Management' },
    { id: '29', key: 'PATIENTSATISFACTION', label: 'Patient Satisfaction' },
    { id: '30', key: 'KITCHENORDERREPORT', label: 'OrderReport' },
    { id: '31', key: 'MYSTATION', label: 'MyStation' },
    { id: '32', key: 'DELIVERYMASTER', label: 'Delivery Master' },
    { id: '33', key: 'ASSEMBLER', label: 'Assembler' },
    { id: '34', key: 'DISCHARGEFEEDBACK', label: 'Discharge Feedback' },
    { id: '35', key: 'SERVINGMASTER', label: 'Serving Master' },
    { id: '36', key: 'AUDITLOG', label: 'Audit Log' },
    { id: '37', key: 'QUALITY', label: 'Quality' },
    { id: '38', key: 'DIETITIANPREORDER', label: 'Dietitian Pre Order' }
];

var permissionGroups = {
    'Core': ['1', '2', '3', '4'],
    'Masters': ['5', '6', '7', '17', '18', '9', '10', '11', '12', '32', '35', '36'],
    'Food Dashboard': ['19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '33', '34', '38'],
    'System': ['8', '13', '14', '15', '16', '37']
};

var changePwdArrError = ["ErCurrent", "ErPassword", "ErCPassword"];

function Encrypt(Value) {
    try {
        var key = CryptoJS.enc.Utf8.parse(CryptoKey);
        var iv = CryptoJS.enc.Utf8.parse(CryptoPwd);
        var encryptedVal = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(Value), key, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encryptedVal.toString();
    } catch (e) {
        console.error("Encrypt error:", e);
        return Value;
    }
}

function encryptAES(text) {
    if (!text) return '';
    try {
        var key = CryptoJS.enc.Utf8.parse('9090909090909090');
        var iv = CryptoJS.enc.Utf8.parse('9090909090909090');
        var encrypted = CryptoJS.AES.encrypt(text.toString(), key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encodeURIComponent(encrypted.toString());
    } catch (e) {
        return text;
    }
}

function ShowModalPopUp(modalId) {
    if (typeof $('#' + modalId).modal === 'function') {
        $('#' + modalId).modal('show');
    } else {
        $('#' + modalId).modal('toggle');
    }
}

function HideModalPopUp(modalId) {
    if (typeof $('#' + modalId).modal === 'function') {
        $('#' + modalId).modal('hide');
    }
}

function OpenChangePassword() {
    $('#TxtCurPassword').val('');
    $('#TxtPassword').val('');
    $('#TxtConfirmPassword').val('');
    ClearChangePasswordErrors();
    ResetChangePasswordIndicators();
    ShowModalPopUp('ModalChangepwd');
}

function ResetChangePasswordIndicators() {
    $('#letter').removeClass('valid').addClass('invalid');
    $('#capital').removeClass('valid').addClass('invalid');
    $('#splChar').removeClass('valid').addClass('invalid');
    $('#number').removeClass('valid').addClass('invalid');
    $('#length').removeClass('valid').addClass('invalid');
}

function ClearChangePasswordErrors() {
    $.each(changePwdArrError, function (i, val) {
        $('#' + val).css('visibility', 'hidden');
    });
}

function InitChangePasswordValidation() {
    var myInput = document.getElementById("TxtPassword");
    var letter = document.getElementById("letter");
    var capital = document.getElementById("capital");
    var number = document.getElementById("number");
    var length = document.getElementById("length");
    var splCharv = document.getElementById("splChar");

    if (myInput) {
        myInput.onkeyup = function () {
            if (myInput.value.match(/[a-z]/g)) {
                letter.classList.remove("invalid");
                letter.classList.add("valid");
            } else {
                letter.classList.remove("valid");
                letter.classList.add("invalid");
            }

            if (myInput.value.match(/[!@#$%^&*()\-+.]/g)) {
                splCharv.classList.remove("invalid");
                splCharv.classList.add("valid");
            } else {
                splCharv.classList.remove("valid");
                splCharv.classList.add("invalid");
            }

            if (myInput.value.match(/[A-Z]/g)) {
                capital.classList.remove("invalid");
                capital.classList.add("valid");
            } else {
                capital.classList.remove("valid");
                capital.classList.add("invalid");
            }

            if (myInput.value.match(/[0-9]/g)) {
                number.classList.remove("invalid");
                number.classList.add("valid");
            } else {
                number.classList.remove("valid");
                number.classList.add("invalid");
            }

            if (myInput.value.length >= 12) {
                length.classList.remove("invalid");
                length.classList.add("valid");
            } else {
                length.classList.remove("valid");
                length.classList.add("invalid");
            }
        };
    }
}

function IsChangePasswordStrong(password) {
    var isValid = true;

    if (password.match(/[a-z]/)) {
        $('#letter').removeClass('invalid').addClass('valid');
    } else {
        $('#letter').removeClass('valid').addClass('invalid');
        isValid = false;
    }

    if (password.match(/[A-Z]/)) {
        $('#capital').removeClass('invalid').addClass('valid');
    } else {
        $('#capital').removeClass('valid').addClass('invalid');
        isValid = false;
    }

    if (password.match(/[!@#$%^&*()\-+.]/)) {
        $('#splChar').removeClass('invalid').addClass('valid');
    } else {
        $('#splChar').removeClass('valid').addClass('invalid');
        isValid = false;
    }

    if (password.match(/[0-9]/)) {
        $('#number').removeClass('invalid').addClass('valid');
    } else {
        $('#number').removeClass('valid').addClass('invalid');
        isValid = false;
    }

    if (password.length >= 12) {
        $('#length').removeClass('invalid').addClass('valid');
    } else {
        $('#length').removeClass('valid').addClass('invalid');
        isValid = false;
    }

    return isValid;
}

function ValidateChangePassword() {
    var currentPassword = $('#TxtCurPassword').val().trim();
    var newPassword = $('#TxtPassword').val().trim();
    var confirmPassword = $('#TxtConfirmPassword').val().trim();
    var userId = sessionStorage.getItem('ID');

    ClearChangePasswordErrors();

    if (!currentPassword) {
        $('#ErCurrent').css('visibility', 'visible');
        $('#TxtCurPassword').focus();
        return false;
    }

    if (!newPassword) {
        $('#ErPassword').css('visibility', 'visible');
        $('#TxtPassword').focus();
        return false;
    }

    if (!IsChangePasswordStrong(newPassword)) {
        $('#ErPassword').css('visibility', 'visible');
        $('#TxtPassword').focus();
        return false;
    }

    if (!confirmPassword) {
        $('#ErCPassword').css('visibility', 'visible');
        $('#TxtConfirmPassword').focus();
        return false;
    }

    if (newPassword !== confirmPassword) {
        $('#ErCPassword').css('visibility', 'visible');
        $('#TxtConfirmPassword').focus();
        return false;
    }

    if (!userId) {
        alert('User ID missing, please login again.');
        return false;
    }

    var changeBtn = $('.export-link a');
    var originalText = changeBtn.html();
    if (changeBtn.length) {
        changeBtn.html('Changing...').css('opacity', '0.7');
    }

    var processName = 'ChangePassword';
    var encProcess = Encrypt(processName).toString();
    var encUserId = Encrypt(userId.toString()).toString();
    var encNewPassword = Encrypt(newPassword).toString();

    var url = '/Master/Service/Service.aspx?Process=' + encodeURIComponent(encProcess);

    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({
            USERID: encUserId,
            PWD: encNewPassword
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (response) {
            if (changeBtn.length) {
                changeBtn.html(originalText).css('opacity', '1');
            }

            if (!response.success) {
                var err = response.data && response.data.ERROR;
                alert('Failed to change password. ' + (err ? err : 'Please try again.'));
                return;
            }

            var result = response.data.RESULT;
            var error = response.data.ERROR;

            if (result === "TRUE") {
                $('#ModalChangepwd').modal('hide');
                alert('Password changed successfully! You will be redirected to login.');
                setTimeout(function () {
                    window.location = '../Login.aspx';
                }, 3000);
            } else {
                alert('Failed to change password. ' + (error ? error : 'Please try again.'));
            }
        },
        error: function (xhr, status, error) {
            if (changeBtn.length) {
                changeBtn.html(originalText).css('opacity', '1');
            }
            console.error('Error changing password:', error);
            alert('An error occurred while changing password. Please try again.');
        }
    });

    return false;
}

$(document).ready(function () {
    var userName = sessionStorage.getItem('NAME') || '';
    var userRole = sessionStorage.getItem('ROLENAME') || '';

    $('#spndepNursname').text(userName);
    $('#spnUserTypeLabel').text(userRole);
    $('#spanUserName').text(userName);
    $('#hfUserName').val(userName);
    $('#hfUserRole').val(userRole);

    InitChangePasswordValidation();

    $('#ModalChangepwd').on('hidden.bs.modal', function () {
        $('#TxtCurPassword').val('');
        $('#TxtPassword').val('');
        $('#TxtConfirmPassword').val('');
        ClearChangePasswordErrors();
        ResetChangePasswordIndicators();
    });

    $('#TxtConfirmPassword').keypress(function (e) {
        if (e.which === 13) {
            ValidateChangePassword();
            return false;
        }
    });

    loadRoles();

    $('#btnCreateRole').on('click', function (e) {
        e.preventDefault();
        openCreateRoleModal();
    });

    $('#closeRoleModalBtn, #cancelRoleBtn').on('click', function (e) {
        e.preventDefault();
        closeCreateRoleModal();
    });

    $('#createRoleModal').on('click', function (e) {
        if (e.target === this) {
            closeCreateRoleModal();
        }
    });

    $('#createRoleBtn').on('click', function () {
        if (isEditMode) {
            updateRole();
        } else {
            createRole();
        }
    });

    $('#btnRefresh').on('click', function () {
        var btn = $(this);
        btn.addClass('spinning');
        loadRoles(function () {
            btn.removeClass('spinning');
            ShowToast('Roles refreshed successfully!', 'success');
        });
    });

    var searchTimer;
    $('#txtSearchRole').on('keyup', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            filterRoles();
        }, 300);
    });

    $('#ddlStatusFilter').on('change', function () {
        filterRoles();
    });

    $(document).on('click', '.edit-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var roleId = $(this).data('roleid');
        if (roleId) {
            editRole(roleId);
        }
        return false;
    });

    $(document).on('click', '.delete-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var roleId = $(this).data('roleid');
        if (roleId) {
            deleteRole(roleId);
        }
        return false;
    });

    $('#btnKeepRole').on('click', function () {
        closeDeleteModal();
    });

    $('#btnYesDelete').on('click', function () {
        if (deleteRoleId) {
            confirmDeleteRole(deleteRoleId);
        }
        closeDeleteModal();
    });

    $('#deleteModalOverlay').on('click', function () {
        closeDeleteModal();
    });

    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            if ($('#createRoleModal').hasClass('active')) {
                closeCreateRoleModal();
            }
            if ($('#deleteModal').hasClass('show')) {
                closeDeleteModal();
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            $('#txtSearchRole').focus();
        }
    });
});

function openCreateRoleModal() {
    isEditMode = false;
    editRoleId = null;
    resetCreateRoleModal();
    $('#createRoleModal').addClass('active');
    $('body').css('overflow', 'hidden');
}

function closeCreateRoleModal() {
    $('#createRoleModal').removeClass('active');
    $('body').css('overflow', '');
    resetCreateRoleModal();
}

function resetCreateRoleModal() {
    $('#roleName').val('');
    $('#chkActive').prop('checked', true);
    $('#createRoleBtn').html('<i class="fas fa-plus-circle"></i> Create Role');
    $('#modalIcon').attr('src', '../images/roles-icon.png');
    $('#modalTitleText').text('Create Role');
    isEditMode = false;
    editRoleId = null;
    currentPermissions = {};
    renderPermissions();
    $('#roleName').removeClass('error');
}

function openDeleteModal(roleId, roleName) {
    deleteRoleId = roleId;
    $('#deleteRoleName').text(roleName);
    $('#deleteModal').addClass('show');
    $('#deleteModalOverlay').addClass('show');
    $('body').css('overflow', 'hidden');
}

function closeDeleteModal() {
    $('#deleteModal').removeClass('show');
    $('#deleteModalOverlay').removeClass('show');
    $('body').css('overflow', '');
    deleteRoleId = null;
}

function renderPermissions() {
    var container = $('#permissionsGrid');
    container.empty();

    var groupOrder = ['Core', 'Masters', 'Food Dashboard', 'System'];
    groupOrder.forEach(function (groupName) {
        var groupPerms = permissionGroups[groupName] || [];
        if (groupPerms.length > 0) {
            var groupHtml = '<div class="permission-group"><div class="permission-group-title">' + groupName + '</div><div class="permission-group-grid">';
            groupPerms.forEach(function (permId) {
                var perm = permissionList.find(function (p) { return p.id === permId; });
                if (perm) {
                    var isChecked = currentPermissions[perm.key] === true;
                    var imgSrc = isChecked ? '../images/CCheck.png' : '../images/CNoCheck.png';
                    groupHtml += `
                        <div class="permission-item" data-perm="${perm.key}">
                            <img src="${imgSrc}" class="perm-icon" onclick="togglePermission(this, '${perm.key}')" />
                            <span class="perm-label">${perm.label}</span>
                        </div>
                    `;
                }
            });
            groupHtml += '</div></div>';
            container.append(groupHtml);
        }
    });
}

function togglePermission(ele, permKey) {
    var src = $(ele).attr('src');
    var isChecked = src === '../images/CCheck.png';
    var newSrc = isChecked ? '../images/CNoCheck.png' : '../images/CCheck.png';
    $(ele).attr('src', newSrc);
    currentPermissions[permKey] = !isChecked;
}

function getPermissionsTree() {
    var treeParts = [];
    permissionList.forEach(function (perm) {
        if (currentPermissions[perm.key] === true) {
            treeParts.push(perm.id);
        }
    });
    return treeParts.join('_');
}

function loadRoles(callback) {
    $('#tblRolesBody').html('<tr><td colspan="4" style="text-align:center; padding:30px; color:#888;"><i class="fas fa-spinner fa-spin"></i> Loading roles...</td></tr>');

    var encProcess = encryptAES('GETROLESWEBUSER');
    var encSearch = encryptAES('');
    var encPageIndex = encryptAES('0');
    var encPageSize = encryptAES('100');

    var url = hurl + "Service/Service.aspx?Process=" + encProcess +
        "&SEARCH=" + encSearch +
        "&PageIndex=" + encPageIndex +
        "&PageSize=" + encPageSize;

    $.ajax({
        url: url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        timeout: 30000,
        success: function (response) {
            if (response && response.length > 0) {
                allRoles = response.map(function (item) {
                    return {
                        Id: item.ID || 0,
                        RoleName: item.ROLENAME || '',
                        IsActive: item.ISACTIVE || 0,
                        HOME: item.HOME || 0,
                        TRACK: item.TRACK || 0,
                        REPORTS: item.REPORTS || 0,
                        ROUTINE: item.ROUTINE || 0,
                        PORTER: item.PORTER || 0,
                        TASKTYPE: item.TASKTYPE || 0,
                        LOCATIONS: item.LOCATIONS || 0,
                        UPLOAD: item.UPLOAD || 0,
                        GROUP: item.GROUP || 0,
                        REMARKS: item.REMARKS || 0,
                        USERS: item.USERS || 0,
                        ROLES: item.ROLES || 0,
                        P3RFORMLOGS: item.P3RFORMLOGS || 0,
                        BREAKS: item.BREAKS || 0,
                        STARTCOMPLETE: item.STARTCOMPLETE || 0,
                        CANCELTASK: item.CANCELTASK || 0,
                        EQUIPMENT: item.EQUIPMENT || 0,
                        DEPARTMENT: item.DEPARTMENT || 0,
                        DIETTYPES: item.DIETTYPES || 0,
                        MENUMASTER: item.MENUMASTER || 0,
                        PATIENT: item.PATIENT || 0,
                        KITCHEN: item.KITCHEN || 0,
                        ORDERS: item.ORDERS || 0,
                        PREORDERSHEETS: item.PREORDERSHEETS || 0,
                        MENUDOCKET: item.MENUDOCKET || 0,
                        DELIVERIES: item.DELIVERIES || 0,
                        DASHBOARD: item.DASHBOARD || 0,
                        USERMANAGEMENT: item.USERMANAGEMENT || 0,
                        PATIENTSATISFACTION: item.PATIENTSATISFACTION || 0,
                        KITCHENORDERREPORT: item.KITCHENORDERREPORT || 0,
                        MYSTATION: item.MYSTATION || 0,
                        DELIVERYMASTER: item.DELIVERYMASTER || 0,
                        ASSEMBLER: item.ASSEMBLER || 0,
                        DISCHARGEFEEDBACK: item.DISCHARGEFEEDBACK || 0,
                        SERVINGMASTER: item.SERVINGMASTER || 0,
                        AUDITLOG: item.AUDITLOG || 0,
                        QUALITY: item.QUALITY || 0,
                        DIETITIANPREORDER: item.DIETITIANPREORDER || 0
                    };
                });
                filterRoles();
                if (callback) callback();
            } else {
                $('#tblRolesBody').html('<tr><td colspan="4" style="text-align:center; padding:30px; color:#888;">No roles found</td></tr>');
                if (callback) callback();
            }
        },
        error: function (xhr, status, error) {
            $('#tblRolesBody').html('<tr><td colspan="4" style="text-align:center; padding:30px; color:#888;">Error loading roles</td></tr>');
            if (callback) callback();
        }
    });
}

function filterRoles() {
    var searchTerm = $('#txtSearchRole').val().toLowerCase().trim();
    var statusFilter = $('#ddlStatusFilter').val();

    var filtered = allRoles.filter(function (role) {
        var name = (role.RoleName || '').toLowerCase();
        var status = role.IsActive == 1 ? 'Active' : 'Inactive';

        var matchSearch = !searchTerm || name.indexOf(searchTerm) > -1;
        var matchStatus = !statusFilter || status === statusFilter;

        return matchSearch && matchStatus;
    });

    renderRolesTable(filtered);
}

function renderRolesTable(roles) {
    var tbody = $('#tblRolesBody');
    tbody.empty();

    if (!roles || roles.length === 0) {
        tbody.html('<tr><td colspan="4" style="text-align:center; padding:30px; color:#888;">No roles found</td></tr>');
        return;
    }

    roles.forEach(function (role) {
        var id = role.Id || 0;
        var name = role.RoleName || '';
        var status = role.IsActive == 1 ? 'Active' : 'Inactive';
        var statusClass = status === 'Active' ? 'active' : 'inactive';

        var permissions = [];
        var permMap = {
            'HOME': 'Home', 'TRACK': 'Track', 'REPORTS': 'Reports', 'ROUTINE': 'Planner',
            'PORTER': 'Operative', 'TASKTYPE': 'Task Types', 'LOCATIONS': 'Location',
            'UPLOAD': 'Upload', 'GROUP': 'Group', 'REMARKS': 'Remarks', 'USERS': 'Users',
            'ROLES': 'Roles', 'P3RFORMLOGS': 'Logs', 'BREAKS': 'Breaks',
            'STARTCOMPLETE': 'StartComplete', 'CANCELTASK': 'CancelTask',
            'EQUIPMENT': 'Equipment', 'DEPARTMENT': 'Dept', 'DIETTYPES': 'Diet Types',
            'MENUMASTER': 'Menu Master', 'PATIENT': 'Patient', 'KITCHEN': 'Kitchen',
            'ORDERS': 'Orders', 'PREORDERSHEETS': 'Pre-Order Sheets', 'MENUDOCKET': 'Menu Docket',
            'DELIVERIES': 'Deliveries', 'DASHBOARD': 'Dashboard', 'USERMANAGEMENT': 'User Mgmt',
            'PATIENTSATISFACTION': 'Satisfaction', 'KITCHENORDERREPORT': 'Order Report',
            'MYSTATION': 'My Station', 'DELIVERYMASTER': 'Delivery Master', 'ASSEMBLER': 'Assembler',
            'DISCHARGEFEEDBACK': 'Discharge Feedback', 'SERVINGMASTER': 'Serving Master',
            'AUDITLOG': 'Audit Log', 'QUALITY': 'Quality', 'DIETITIANPREORDER': 'Dietitian Pre Order'
        };

        permissionList.forEach(function (perm) {
            var key = perm.key;
            if (role[key] == 1 || role[key] === true) {
                permissions.push(permMap[key] || key);
            }
        });

        var permBadges = '';
        if (permissions.length > 0) {
            var displayPerms = permissions.slice(0, 5);
            permBadges = displayPerms.map(function (p) {
                return '<span class="permission-badge active">' + p + '</span>';
            }).join('');
            if (permissions.length > 5) {
                permBadges += '<span class="permission-badge">+' + (permissions.length - 5) + ' more</span>';
            }
        } else {
            permBadges = '<span class="permission-badge">No permissions</span>';
        }

        var row = `
            <tr data-id="${id}">
                <td><span class="role-name">${escapeHtml(name)}</span></td>
                <td><div class="permission-badges">${permBadges}</div></td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-roleid="${id}" title="Edit Role">
                            <img src="../images/edit-icon.png" alt="Edit" />
                        </button>
                        <button class="action-btn delete-btn" data-roleid="${id}" title="Delete Role">
                            <img src="../images/delete-icon.png" alt="Delete" />
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

function editRole(roleId) {
    var role = allRoles.find(function (r) {
        var id = r.Id || 0;
        return id == roleId;
    });

    if (!role) {
        ShowToast('Role not found.', 'error');
        return;
    }

    isEditMode = true;
    editRoleId = roleId;

    $('#roleName').val(role.RoleName || '');
    $('#chkActive').prop('checked', role.IsActive == 1);

    currentPermissions = {};

    permissionList.forEach(function (perm) {
        var value = role[perm.id];
        if (value === undefined) {
            value = role[perm.key];
        }
        currentPermissions[perm.key] = (value == 1 || value === true || value === '1');
    });

    renderPermissions();

    $('#modalTitleText').text('Edit Role: ' + role.RoleName);
    $('#createRoleBtn').html('<i class="fas fa-save"></i> Update Role');
    $('#modalIcon').attr('src', '../images/roles-icon.png');

    $('#createRoleModal').addClass('active');
    $('body').css('overflow', 'hidden');
}

function updateRole() {
    var roleName = $('#roleName').val().trim();
    var isActive = $('#chkActive').is(':checked') ? '1' : '0';
    var treeId = getPermissionsTree();

    if (!roleName) {
        $('#roleName').addClass('error');
        ShowToast('Please enter a role name.', 'error');
        return;
    }
    $('#roleName').removeClass('error');

    $('#createRoleBtn').html('<i class="fas fa-spinner fa-spin"></i> Updating...').prop('disabled', true);

    var encProcess = Encrypt('UPDATEROLE');
    var encRoleName = Encrypt(roleName);
    var encIsActive = Encrypt(isActive);
    var encAction = Encrypt('UPDATE');
    var encTreeId = treeId ? Encrypt(treeId) : '';
    var encId = Encrypt(editRoleId.toString());

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(encProcess) +
        "&ROLENAME=" + encodeURIComponent(encRoleName) +
        "&ISACTIVE=" + encodeURIComponent(encIsActive) +
        "&ACTION=" + encodeURIComponent(encAction) +
        "&TREEID=" + encodeURIComponent(encTreeId) +
        "&ID=" + encodeURIComponent(encId);

    $.ajax({
        url: url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (response) {
            $('#createRoleBtn').html('<i class="fas fa-save"></i> Update Role').prop('disabled', false);

            if (response && response.length > 0 && response[0].RESULT) {
                var result = response[0].RESULT;
                if (result === 'TRUE' || result.split('_')[0] === 'TRUE') {
                    ShowToast('Role "' + roleName + '" updated successfully!', 'success');
                    closeCreateRoleModal();
                    loadRoles();
                } else {
                    ShowToast('Failed to update role: ' + result, 'error');
                }
            } else {
                ShowToast('Failed to update role. Please try again.', 'error');
            }
        },
        error: function (xhr, status, error) {
            $('#createRoleBtn').html('<i class="fas fa-save"></i> Update Role').prop('disabled', false);
            console.error('Error updating role:', error);
            console.error('Response Text:', xhr.responseText);
            ShowToast('Error updating role. Please try again.', 'error');
        }
    });
}

function createRole() {
    var roleName = $('#roleName').val().trim();
    var isActive = $('#chkActive').is(':checked') ? '1' : '0';
    var treeId = getPermissionsTree();

    if (!roleName) {
        $('#roleName').addClass('error');
        ShowToast('Please enter a role name.', 'error');
        return;
    }
    $('#roleName').removeClass('error');

    $('#createRoleBtn').html('<i class="fas fa-spinner fa-spin"></i> Creating...').prop('disabled', true);

    var encProcess = Encrypt('UPDATEROLE');
    var encRoleName = Encrypt(roleName);
    var encIsActive = Encrypt(isActive);
    var encAction = Encrypt('INSERT');
    var encTreeId = treeId ? Encrypt(treeId) : '';
    var encId = Encrypt('0');

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(encProcess) +
        "&ROLENAME=" + encodeURIComponent(encRoleName) +
        "&ISACTIVE=" + encodeURIComponent(encIsActive) +
        "&ACTION=" + encodeURIComponent(encAction) +
        "&TREEID=" + encodeURIComponent(encTreeId) +
        "&ID=" + encodeURIComponent(encId);

    $.ajax({
        url: url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (response) {
            $('#createRoleBtn').html('<i class="fas fa-plus-circle"></i> Create Role').prop('disabled', false);

            if (response && response.length > 0 && response[0].RESULT) {
                var result = response[0].RESULT;
                if (result === 'TRUE' || result.split('_')[0] === 'TRUE') {
                    ShowToast('Role "' + roleName + '" created successfully!', 'success');
                    closeCreateRoleModal();
                    loadRoles();
                } else if (result.indexOf('already exists') > -1) {
                    ShowToast('Role "' + roleName + '" already exists.', 'error');
                } else {
                    ShowToast('Failed to create role: ' + result, 'error');
                }
            } else {
                ShowToast('Failed to create role. Please try again.', 'error');
            }
        },
        error: function (xhr, status, error) {
            $('#createRoleBtn').html('<i class="fas fa-plus-circle"></i> Create Role').prop('disabled', false);
            console.error('Error creating role:', error);
            console.error('Response Text:', xhr.responseText);
            ShowToast('Error creating role. Please try again.', 'error');
        }
    });
}

function deleteRole(roleId) {
    var role = allRoles.find(function (r) {
        var id = r.Id || 0;
        return id == roleId;
    });

    if (!role) {
        ShowToast('Role not found.', 'error');
        return;
    }

    openDeleteModal(roleId, role.RoleName || '');
}

function confirmDeleteRole(roleId) {
    var role = allRoles.find(function (r) {
        var id = r.Id || 0;
        return id == roleId;
    });
    var roleName = role ? role.RoleName : '';

    var encProcess = Encrypt('UPDATEROLE');
    var encAction = Encrypt('DELETE');
    var encId = Encrypt(roleId.toString());

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(encProcess) +
        "&ACTION=" + encodeURIComponent(encAction) +
        "&ID=" + encodeURIComponent(encId);

    $.ajax({
        url: url,
        type: 'POST',
        data: 'pData',
        dataType: 'json',
        success: function (response) {
            if (response && response.length > 0 && response[0].RESULT) {
                var result = response[0].RESULT;
                if (result.split('_')[0] === 'TRUE') {
                    ShowToast('Role "' + roleName + '" deleted successfully!', 'success');
                    loadRoles();
                } else if (result.indexOf('in use') > -1) {
                    ShowToast('Role "' + roleName + '" is in use and cannot be deleted.', 'error');
                } else {
                    ShowToast('Failed to delete role: ' + result, 'error');
                }
            } else {
                ShowToast('Failed to delete role. Please try again.', 'error');
            }
        },
        error: function (xhr, status, error) {
            ShowToast('Error deleting role. Please try again.', 'error');
        }
    });
}

function escapeHtml(value) {
    if (!value) return '';
    return String(value).replace(/[&<>"']/g, function (ch) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[ch];
    });
}

function ShowToast(message, type) {
    type = type || 'success';

    var toast = $('#dashToastNotification');

    if (toast.length === 0) {
        $('body').append(
            '<div class="dash-toast-notification" id="dashToastNotification">' +
            '<i class="fas fa-check-circle"></i>' +
            '<span id="dashToastMessage"></span>' +
            '<button class="toast-close" onclick="HideDashToast();">&times;</button>' +
            '</div>'
        );
        toast = $('#dashToastNotification');
    }

    var icon = type === 'success'
        ? 'fa-check-circle'
        : type === 'error'
            ? 'fa-exclamation-circle'
            : type === 'warning'
                ? 'fa-exclamation-triangle'
                : 'fa-info-circle';

    toast.find('i').attr('class', 'fas ' + icon);
    toast.find('#dashToastMessage').text(message);

    toast.removeClass('success error warning info');
    toast.addClass(type);
    toast.addClass('show');

    clearTimeout(toast.data('timer'));
    toast.data('timer', setTimeout(function () {
        HideDashToast();
    }, 3000));
}

function HideDashToast() {
    var toast = $('#dashToastNotification');
    toast.removeClass('show');
    if (toast.data('timer')) {
        clearTimeout(toast.data('timer'));
        toast.data('timer', null);
    }
}

function InitChangePassword() {
    console.log('ChangePassword initialized');
}