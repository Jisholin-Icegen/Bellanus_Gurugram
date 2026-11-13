var umCurrentPage = 1;
var umRowsPerPage = 10;
var umAllUsers = [];
var umFilteredUsers = [];
var umIsEditMode = false;
var umEditUserId = null;
var umDeleteUserId = null;

$(document).ready(function () {
    var $searchInput = $('#txtSearchUser');

    $searchInput.val('');
    $searchInput.attr('autocomplete', 'off');
    $searchInput.attr('autofill', 'off');
    $searchInput.attr('data-lpignore', 'true');
    $searchInput.attr('data-form-type', 'other');
    $searchInput.attr('autocorrect', 'off');
    $searchInput.attr('autocapitalize', 'off');
    $searchInput.attr('spellcheck', 'false');

    setTimeout(function () {
        $searchInput.val('');
    }, 10);

    setTimeout(function () {
        $searchInput.val('');
    }, 50);

    setTimeout(function () {
        $searchInput.val('');
    }, 100);

    setTimeout(function () {
        $searchInput.val('');
    }, 500);

    $(window).on('load', function () {
        $searchInput.val('');
    });

    $searchInput.on('focus', function () {
        var val = $(this).val();
        if (val && val !== '') {
            $(this).val('');
            filterUsers();
        }
    });

    $searchInput.on('input', function () {
        var val = $(this).val();
        if (val && (val.toLowerCase().includes('admin') ||
            val === 'System Administrator' ||
            val === 'System' ||
            val === 'Administrator')) {
            $(this).val('');
            filterUsers();
        }
    });

    $searchInput.on('click', function () {
        var val = $(this).val();
        if (val && val !== '') {
            $(this).val('');
            filterUsers();
        }
    });

    $searchInput.on('paste', function (e) {
        e.preventDefault();
        ShowToast('Pasting is not allowed in search', 'warning');
        $(this).val('');
    });

    $searchInput.on('keydown', function () {
        $(this).data('user-typed', true);
    });

    $searchInput.on('keyup', function () {
        var val = $(this).val();
        if (val && (val.toLowerCase().includes('admin') ||
            val === 'System Administrator' ||
            val === 'System' ||
            val === 'Administrator')) {
            $(this).val('');
            filterUsers();
        }
    });

    var userName = sessionStorage.getItem('NAME') || '';
    var userRole = sessionStorage.getItem('ROLENAME') || '';

    $('#spndepNursname').text(userName);
    $('#spnUserTypeLabel').text(userRole);
    $('#spanUserName').text(userName);

    $('#hfUserName').val(userName);
    $('#hfUserRole').val(userRole);

    if (typeof InitChangePassword === 'function') {
        InitChangePassword();
    }

    loadRoles();
    loadFilterRoles();
    loadWards();
    loadKitchens();
    loadUsers();
    loadNotifications();

    $('#btnCreateUser').off('click').on('click', function (e) {
        e.preventDefault();
        umIsEditMode = false;
        umEditUserId = null;
        resetCreateUserModal();
        openCreateUserModal();
    });

    $('#closeUserModalBtn').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeCreateUserModal();
        resetCreateUserModal();
    });

    $('#cancelUserBtn').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeCreateUserModal();
        resetCreateUserModal();
    });

    $('#createUserModal').off('click').on('click', function (e) {
        if (e.target === this) {
            closeCreateUserModal();
            resetCreateUserModal();
        }
    });

    $('#createUserBtn').off('click').on('click', function () {
        if (umIsEditMode) {
            updateUser(umEditUserId);
        } else {
            createUser();
        }
    });

    $('#btnRefresh').off('click').on('click', function () {
        var btn = $(this);
        btn.find('i').addClass('fa-spin');
        loadUsers(function () {
            btn.find('i').removeClass('fa-spin');
            loadNotifications();
            ShowToast('Users refreshed successfully!', 'success');
        });
    });

    $('#btnKeepUser').off('click').on('click', function () {
        closeDeleteModal();
    });

    $('#btnYesDelete').off('click').on('click', function () {
        if (umDeleteUserId) {
            confirmDeleteUser(umDeleteUserId);
        }
        closeDeleteModal();
    });

    $('#deleteModalOverlay').off('click').on('click', function () {
        closeDeleteModal();
    });

    var searchTimer;
    $('#txtSearchUser').off('keyup').on('keyup', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            filterUsers();
        }, 300);
    });

    $('#ddlRoleFilter').off('change').on('change', function () {
        filterUsers();
    });

    $('#ddlStatusFilter').off('change').on('change', function () {
        filterUsers();
    });

    $('#prevPage').off('click').on('click', function () {
        changePage(-1);
    });

    $('#nextPage').off('click').on('click', function () {
        changePage(1);
    });

    $('#txtSearchUser').off('keypress').on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
        }
    });

    $(document).off('keydown').on('keydown', function (e) {
        if (e.key === 'Escape') {
            if ($('#createUserModal').hasClass('active')) {
                closeCreateUserModal();
                resetCreateUserModal();
            }
            if ($('#deleteModal').hasClass('show')) {
                closeDeleteModal();
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            $('#txtSearchUser').focus();
        }
    });

    $(document).on('click', '.edit-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var userId = $(this).data('userid');
        if (userId) {
            editUser(userId);
        }
        return false;
    });

    $(document).on('click', '.delete-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var userId = $(this).data('userid');
        if (userId) {
            deleteUser(userId);
        }
        return false;
    });

    $(document).on('click', '#notificationBell', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#notificationDropdown').toggleClass('show');
        if ($('#notificationDropdown').hasClass('show')) {
            loadNotifications();
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.notification-wrapper').length) {
            $('#notificationDropdown').removeClass('show');
        }
    });

    $(document).on('click', '#markAllRead', function (e) {
        e.preventDefault();
        e.stopPropagation();
        markAllNotificationsAsRead();
    });

    $(document).on('click', '.notification-item.unread', function (e) {
        var $this = $(this);
        var notificationId = $this.data('id');
        if (notificationId) {
            markNotificationAsRead(notificationId);
            $this.removeClass('unread');
            $this.find('.unread-dot').remove();

            var currentCount = parseInt($('#notificationCount').text()) || 0;
            var newCount = Math.max(0, currentCount - 1);
            $('#notificationCount').text(newCount);
            if (newCount <= 0) {
                $('#notificationCount').removeClass('show');
            }
        }
    });
});

function openCreateUserModal() {
    $('#createUserModal').addClass('active');
    $('body').css('overflow', 'hidden');
}

function closeCreateUserModal() {
    $('#createUserModal').removeClass('active');
    $('body').css('overflow', '');
    if (document.activeElement) {
        document.activeElement.blur();
    }
}

function resetCreateUserModal() {
    var form = document.getElementById('createUserForm');
    if (form) {
        form.reset();
    }

    $('#userFullName').val('');
    $('#userEmail').val('');
    $('#userPassword').val('');
    $('#userRole').val('');
    $('#userWardScope').val('0');
    $('#userKitchenScope').val('0');
    $('#chkActive').prop('checked', true);

    $('#createUserForm .form-input').removeClass('error');

    $('#userPassword').attr('type', 'password');
    $('#passwordToggleIcon').removeClass('fa-eye-slash').addClass('fa-eye');
    $('#userPassword').attr('placeholder', 'Min 6 characters');
    $('#passwordLabel').text('PASSWORD');
    $('#passwordHint').text('Min 6 characters');

    $('#kitchenLabel').text('KITCHEN SCOPE');

    $('#createUserBtn').html('<i class="fas fa-plus-circle"></i> <span id="createBtnText">Create User</span>');
    $('#modalIcon').attr('src', '../images/add-user.png').removeClass('edit-icon');
    $('#modalTitleText').text('Create Staff User');

    umIsEditMode = false;
    umEditUserId = null;
}

function loadRoles() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETROLES"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            var $select = $('#userRole');
            $select.html('<option value="">Select role</option>');
            if (response && response.length > 0) {
                $.each(response, function (i, role) {
                    $select.append('<option value="' + role.Id + '">' + role.RoleName + '</option>');
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading roles:', error);
        }
    });
}

function loadFilterRoles() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETROLES"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            var $select = $('#ddlRoleFilter');
            $select.html('<option value="">All Roles</option>');
            if (response && response.length > 0) {
                $.each(response, function (i, role) {
                    $select.append('<option value="' + role.RoleName + '">' + role.RoleName + '</option>');
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading filter roles:', error);
        }
    });
}

function loadWards() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETWARDS"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            var $select = $('#userWardScope');
            $select.html('<option value="0" selected>All Wards</option>');
            if (response && response.length > 0) {
                $.each(response, function (i, ward) {
                    $select.append('<option value="' + ward.Id + '">' + ward.WardName + '</option>');
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading wards:', error);
        }
    });
}

function loadKitchens() {
    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GETKITCHENS"));
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            var $select = $('#userKitchenScope');
            $select.html('<option value="0" selected>All Kitchens</option>');
            if (response && response.length > 0) {
                $.each(response, function (i, kitchen) {
                    $select.append('<option value="' + kitchen.Id + '">' + kitchen.KitchenName + '</option>');
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading kitchens:', error);
        }
    });
}

function loadUsers(callback) {
    $('#tblUsersBody').html('<tr><td colspan="7" style="text-align:center; padding:30px; color:#888;"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>');

    var url = hurl + "Service/Service.aspx?Process=" + encodeURIComponent(Encrypt("GET"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response && response.length > 0) {
                umAllUsers = response;
                filterUsers();
                if (callback) callback();
            } else {
                $('#tblUsersBody').html('<tr><td colspan="7" style="text-align:center; padding:30px; color:#888;">No users found</td></tr>');
                if (callback) callback();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading users:', error);
            $('#tblUsersBody').html('<tr><td colspan="7" style="text-align:center; padding:30px; color:#888;">Error loading users</td></tr>');
            if (callback) callback();
        }
    });
}

function filterUsers() {
    var searchTerm = $('#txtSearchUser').val().toLowerCase().trim();
    var roleFilter = $('#ddlRoleFilter').val();
    var statusFilter = $('#ddlStatusFilter').val();

    umFilteredUsers = umAllUsers.filter(function (user) {
        var name = (user.UserName || '').toLowerCase();
        var email = (user.EmailId || '').toLowerCase();
        var role = user.RoleName || '';
        var status = user.IsActive == 1 ? 'Active' : 'Inactive';

        var matchSearch = !searchTerm ||
            name.indexOf(searchTerm) > -1 ||
            email.indexOf(searchTerm) > -1 ||
            role.toLowerCase().indexOf(searchTerm) > -1;

        var matchRole = !roleFilter || role === roleFilter;
        var matchStatus = !statusFilter || status === statusFilter;

        return matchSearch && matchRole && matchStatus;
    });

    umCurrentPage = 1;
    renderTable();
}

function renderTable() {
    var tbody = $('#tblUsersBody');
    tbody.empty();

    if (umFilteredUsers.length === 0) {
        tbody.html('<tr><td colspan="7" style="text-align:center; padding:30px; color:#888;">No users found</td></tr>');
        updatePaginationInfo(0);
        return;
    }

    var start = (umCurrentPage - 1) * umRowsPerPage;
    var end = Math.min(start + umRowsPerPage, umFilteredUsers.length);
    var pageUsers = umFilteredUsers.slice(start, end);

    $.each(pageUsers, function (i, user) {
        var name = user.UserName || '';
        var email = user.EmailId || '';
        var role = user.RoleName || '';

        var wardScope = user.WardNames || user.WardIds || 'All';
        var kitchenScope = user.KitchenNames || user.KitchenIds || 'All';

        if (wardScope === '' || wardScope === '0' || wardScope === null) {
            wardScope = 'All';
        }
        if (kitchenScope === '' || kitchenScope === '0' || kitchenScope === null) {
            kitchenScope = 'All';
        }

        var status = user.IsActive == 1 ? 'Active' : 'Inactive';
        var userId = user.Id || 0;

        var roleClass = getRoleClass(role);
        var roleIcon = getRoleIcon(role);
        var statusClass = status === 'Active' ? 'active' : 'inactive';

        // Show delete button only if user is Active
        var deleteButton = status === 'Active'
            ? '<button class="action-btn delete-btn" data-userid="' + userId + '" title="Deactivate User"><img src="../images/delete-icon.png" alt="Deactivate" /></button>'
            : '';

        var row = `
            <tr data-id="${userId}">
                <td><span class="user-name">${escapeHtml(name)}</span></td>
                <td>${escapeHtml(email)}</td>
                <td>
                    <span class="role-badge ${roleClass}">
                        <img src="${roleIcon}" alt="${escapeHtml(role)}" class="role-icon" />
                        ${escapeHtml(role)}
                    </span>
                </td>
                <td>${escapeHtml(wardScope)}</td>
                <td>${escapeHtml(kitchenScope)}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-userid="${userId}" title="Edit User">
                            <img src="../images/edit-icon.png" alt="Edit" />
                        </button>
                        ${deleteButton}
                    </div>
                </td>
            </tr>
        `;
        tbody.append(row);
    });

    updatePaginationInfo(umFilteredUsers.length);
}

function updatePaginationInfo(total) {
    var totalPages = Math.ceil(total / umRowsPerPage) || 1;
    var start = (umCurrentPage - 1) * umRowsPerPage + 1;
    var end = Math.min(umCurrentPage * umRowsPerPage, total);

    $('#startRecord').text(total > 0 ? start : 0);
    $('#endRecord').text(end);
    $('#totalRecords').text(total);

    var controls = $('.pagination-controls');
    controls.find('.page-btn:not(#prevPage):not(#nextPage)').remove();

    for (var i = 1; i <= totalPages; i++) {
        var btn = $('<button class="page-btn' + (i === umCurrentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>');
        btn.on('click', function () {
            umCurrentPage = parseInt($(this).data('page'));
            renderTable();
        });
        controls.find('#nextPage').before(btn);
    }

    $('#prevPage').prop('disabled', umCurrentPage <= 1);
    $('#nextPage').prop('disabled', umCurrentPage >= totalPages);
}

function changePage(direction) {
    var total = umFilteredUsers.length;
    var totalPages = Math.ceil(total / umRowsPerPage) || 1;
    umCurrentPage += direction;
    if (umCurrentPage < 1) umCurrentPage = 1;
    if (umCurrentPage > totalPages) umCurrentPage = totalPages;
    renderTable();
}

function togglePassword() {
    var input = $('#userPassword');
    var icon = $('#passwordToggleIcon');
    if (input.attr('type') === 'password') {
        input.attr('type', 'text');
        icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
        input.attr('type', 'password');
        icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
}

function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function createUser() {
    var fullName = $('#userFullName').val().trim();
    var email = $('#userEmail').val().trim();
    var password = $('#userPassword').val().trim();
    var roleId = $('#userRole').val();
    var wardId = $('#userWardScope').val();
    var kitchenId = $('#userKitchenScope').val();
    var isActive = $('#chkActive').is(':checked') ? '1' : '0';

    var isValid = true;
    var errorMsg = '';

    if (!fullName) {
        $('#userFullName').addClass('error');
        isValid = false;
        errorMsg = 'Please enter full name.';
    } else {
        $('#userFullName').removeClass('error');
    }

    if (!email) {
        $('#userEmail').addClass('error');
        isValid = false;
        if (!errorMsg) errorMsg = 'Please enter email address.';
    } else if (!validateEmail(email)) {
        $('#userEmail').addClass('error');
        isValid = false;
        errorMsg = 'Please enter a valid email address.';
    } else {
        $('#userEmail').removeClass('error');
    }

    if (!password || password.length < 6) {
        $('#userPassword').addClass('error');
        isValid = false;
        if (!errorMsg) errorMsg = 'Password must be at least 6 characters.';
    } else {
        $('#userPassword').removeClass('error');
    }

    if (!roleId) {
        $('#userRole').addClass('error');
        isValid = false;
        if (!errorMsg) errorMsg = 'Please select a role.';
    } else {
        $('#userRole').removeClass('error');
    }

    if (!isValid) {
        ShowToast(errorMsg || 'Please fill in all required fields.', 'error');
        return;
    }

    $('#createUserBtn').html('<i class="fas fa-spinner fa-spin"></i> Creating...').prop('disabled', true);

    var wardIdsStr = wardId === '0' ? '' : wardId;
    var kitchenIdsStr = kitchenId === '0' ? '' : kitchenId;

    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("CREATE")) +
        "&UserName=" + encodeURIComponent(Encrypt(fullName)) +
        "&MID=" + encodeURIComponent(Encrypt(fullName)) +
        "&Password=" + encodeURIComponent(Encrypt(password)) +
        "&RoleId=" + encodeURIComponent(Encrypt(roleId)) +
        "&EmailId=" + encodeURIComponent(Encrypt(email)) +
        "&WardIds=" + encodeURIComponent(Encrypt(wardIdsStr)) +
        "&KitchenIds=" + encodeURIComponent(Encrypt(kitchenIdsStr)) +
        "&IsActive=" + encodeURIComponent(Encrypt(isActive)) +
        "&ServiceId=" + encodeURIComponent(Encrypt("1"));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            $('#createUserBtn').html('<i class="fas fa-plus-circle"></i> <span id="createBtnText">Create User</span>').prop('disabled', false);

            if (response && response.length > 0 && response[0].Result === 'Success') {
                ShowToast('User "' + fullName + '" created successfully!', 'success');
                closeCreateUserModal();
                resetCreateUserModal();
                loadUsers();
                loadNotifications();
            } else {
                ShowToast(response[0]?.Message || 'Failed to create user.', 'error');
            }
        },
        error: function (xhr, status, error) {
            $('#createUserBtn').html('<i class="fas fa-plus-circle"></i> <span id="createBtnText">Create User</span>').prop('disabled', false);
            console.error('Error creating user:', error);
            ShowToast('Error creating user. Please try again.', 'error');
        }
    });
}

function editUser(userId) {
    var user = umAllUsers.find(function (u) {
        var id = u.Id || 0;
        return id == userId;
    });

    if (!user) {
        ShowToast('User not found.', 'error');
        return;
    }

    umIsEditMode = true;
    umEditUserId = userId;

    var name = user.UserName || '';
    var email = user.EmailId || '';
    var roleId = user.RoleId || '';
    var wardIds = user.WardIds || '0';
    var kitchenIds = user.KitchenIds || '0';
    var isActive = user.IsActive == 1;
    var password = user.Password || '';

    // Populate form fields
    $('#userFullName').val(name);
    $('#userEmail').val(email);
    $('#userRole').val(roleId);
    $('#userWardScope').val(wardIds);
    $('#userKitchenScope').val(kitchenIds);
    $('#chkActive').prop('checked', isActive);

    if (password) {
        var maskedPassword = '••••••••';
        $('#userPassword').val(maskedPassword);
        $('#userPassword').attr('placeholder', '');
    } else {
        $('#userPassword').val('').attr('placeholder', 'No password set');
    }

    $('#passwordLabel').text('NEW PASSWORD (LEAVE BLANK TO KEEP)');
    $('#passwordHint').text('Leave blank to keep current password');

    $('#kitchenLabel').html('KITCHEN SCOPE <span class="important-text">(IMPORTANT FOR THIS ROLE)</span>');

    $('#createUserBtn').html('<i class="fas fa-save"></i> <span id="createBtnText">Save Changes</span>');
    $('#modalIcon').attr('src', '../images/edit-icon.png').addClass('edit-icon');
    $('#modalTitleText').text('Edit: ' + name);

    openCreateUserModal();
}

function updateUser(userId) {
    var fullName = $('#userFullName').val().trim();
    var email = $('#userEmail').val().trim();
    var password = $('#userPassword').val().trim();
    var roleId = $('#userRole').val();
    var wardId = $('#userWardScope').val();
    var kitchenId = $('#userKitchenScope').val();
    var isActive = $('#chkActive').is(':checked') ? '1' : '0';

    var isValid = true;
    var errorMsg = '';

    if (!fullName) {
        $('#userFullName').addClass('error');
        isValid = false;
        errorMsg = 'Please enter full name.';
    } else {
        $('#userFullName').removeClass('error');
    }

    if (!email) {
        $('#userEmail').addClass('error');
        isValid = false;
        if (!errorMsg) errorMsg = 'Please enter email address.';
    } else if (!validateEmail(email)) {
        $('#userEmail').addClass('error');
        isValid = false;
        errorMsg = 'Please enter a valid email address.';
    } else {
        $('#userEmail').removeClass('error');
    }

    if (!roleId) {
        $('#userRole').addClass('error');
        isValid = false;
        if (!errorMsg) errorMsg = 'Please select a role.';
    } else {
        $('#userRole').removeClass('error');
    }

    if (!isValid) {
        ShowToast(errorMsg || 'Please fill in all required fields.', 'error');
        return;
    }

    $('#createUserBtn').html('<i class="fas fa-spinner fa-spin"></i> Updating...').prop('disabled', true);

    var wardIdsStr = wardId === '0' ? '' : wardId;
    var kitchenIdsStr = kitchenId === '0' ? '' : kitchenId;

    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("UPDATE")) +
        "&UserId=" + encodeURIComponent(Encrypt(userId.toString())) +
        "&UserName=" + encodeURIComponent(Encrypt(fullName)) +
        "&MID=" + encodeURIComponent(Encrypt(fullName)) +
        "&RoleId=" + encodeURIComponent(Encrypt(roleId)) +
        "&EmailId=" + encodeURIComponent(Encrypt(email)) +
        "&WardIds=" + encodeURIComponent(Encrypt(wardIdsStr)) +
        "&KitchenIds=" + encodeURIComponent(Encrypt(kitchenIdsStr)) +
        "&IsActive=" + encodeURIComponent(Encrypt(isActive)) +
        "&ServiceId=" + encodeURIComponent(Encrypt("1"));

    if (password && password !== '••••••••') {
        url += "&Password=" + encodeURIComponent(Encrypt(password));
    }

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            $('#createUserBtn').html('<i class="fas fa-save"></i> <span id="createBtnText">Save Changes</span>').prop('disabled', false);

            if (response && response.length > 0 && response[0].Result === 'Success') {
                ShowToast('User "' + fullName + '" updated successfully!', 'success');
                closeCreateUserModal();
                resetCreateUserModal();
                loadUsers();
                loadNotifications();
            } else {
                ShowToast(response[0]?.Message || 'Failed to update user.', 'error');
            }
        },
        error: function (xhr, status, error) {
            $('#createUserBtn').html('<i class="fas fa-save"></i> <span id="createBtnText">Save Changes</span>').prop('disabled', false);
            console.error('Error updating user:', error);
            ShowToast('Error updating user. Please try again.', 'error');
        }
    });
}

function openDeleteModal(userId, userName) {
    umDeleteUserId = userId;
    $('#deleteUserName').text(userName);
    $('#deleteModal').addClass('show');
    $('#deleteModalOverlay').addClass('show');
    $('body').css('overflow', 'hidden');
}

function closeDeleteModal() {
    $('#deleteModal').removeClass('show');
    $('#deleteModalOverlay').removeClass('show');
    $('body').css('overflow', '');
    umDeleteUserId = null;
}

function deleteUser(userId) {
    var user = umAllUsers.find(function (u) {
        var id = u.Id || 0;
        return id == userId;
    });

    if (!user) {
        ShowToast('User not found.', 'error');
        return;
    }

    var name = user.UserName || '';
    openDeleteModal(userId, name);
}

function confirmDeleteUser(userId) {
    var user = umAllUsers.find(function (u) {
        var id = u.Id || 0;
        return id == userId;
    });

    if (!user) {
        ShowToast('User not found.', 'error');
        return;
    }

    var name = user.UserName || '';

    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("DELETE")) +
        "&UserId=" + encodeURIComponent(Encrypt(userId.toString()));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response && response.length > 0 && response[0].Result === 'Success') {
                ShowToast('User "' + name + '" deactivated successfully!', 'success');
                loadUsers();
                loadNotifications();
            } else {
                ShowToast(response[0]?.Message || 'Failed to deactivate user.', 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error deactivating user:', error);
            ShowToast('Error deactivating user. Please try again.', 'error');
        }
    });
}

function getNotificationIcon(type) {
    type = (type || '').toLowerCase();

    switch (type) {
        case "error":
            return "../images/notification/warning.png";
        case "info":
            return "../images/notification/shield.png";
        case "success":
            return "../images/notification/thumbs-up.png";
        default:
            return "../images/notification/bell-icon.png";
    }
}

function getOrderDashRoleId() {
    return (sessionStorage.getItem('ROLE') || sessionStorage.getItem('ROLEID') || '0').toString();
}

function loadNotifications() {
    var roleId = getOrderDashRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETNOTIFICATIONSLIST")) +
        "&MAXCOUNT=" + encodeURIComponent(Encrypt("20")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            renderNotifications(res || []);
            getUnreadCount();
        },
        error: function (xhr, status, error) {
            console.log("Error loading notifications:", error);
        }
    });
}
function renderNotifications(notifications) {
    var html = '';
    var unreadCount = 0;

    if (notifications && notifications.length > 0) {
        $.each(notifications, function (i, item) {
            var isRead = item.IS_READ === true || item.IS_READ === 1;

            if (!isRead)
                unreadCount++;

            var iconClass = (item.NOTIFICATION_TYPE || 'info').toLowerCase();
            var icon = getNotificationIcon(iconClass);

            var notificationId = item.NOTIFICATION_ID || item.ID || i;

            html +=
                '<div class="notification-item' + (isRead ? ' read' : ' unread') + '" data-id="' + notificationId + '">' +
                '<div class="notification-icon ' + iconClass + '">' +
                '<img src="' + icon + '" alt="' + iconClass + '">' +
                '</div>' +
                '<div class="notification-content">' +
                '<div class="notification-text">' +
                '<h4>' + escapeHtml(item.NOTIFICATION_HEADER || '') + '</h4>' +
                '<p>' + escapeHtml(item.NOTIFICATION_MESSAGE || '') + '</p>' +
                '</div>' +
                '<div class="notification-time">' +
                escapeHtml(item.TIME_AGO || '') +
                '</div>' +
                '</div>' +
                (!isRead ? '<span class="unread-dot"></span>' : '') +
                '</div>';
        });
    } else {
        html = '<div class="notification-item" style="text-align:center;color:#888;padding:20px;">No new notifications</div>';
    }

    $('#notificationList').html(html);
    $('#notificationCount').text(unreadCount);

    if (unreadCount > 0) {
        $('#notificationCount').addClass('show');
    } else {
        $('#notificationCount').removeClass('show');
    }
}

function markNotificationAsRead(NotificationID) {
    var roleId = getOrderDashRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKNOTIFICATIONASREAD")) +
        "&NOTIFICATIONID=" + encodeURIComponent(Encrypt(NotificationID)) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            getUnreadCount();
        },
        error: function (xhr, status, error) {
            console.log("Error marking notification as read:", error);
            loadNotifications();
        }
    });
}

function getUnreadCount() {
    var roleId = getOrderDashRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("GETUNREADNOTIFICATIONCOUNTS")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            if (res && res.length > 0) {
                var count = res[0].UNREAD_COUNT || 0;
                var $orderBadge = $('#notificationCount');
                if ($orderBadge.length > 0) {
                    $orderBadge.text(count);
                    if (count > 0) {
                        $orderBadge.addClass('show');
                    } else {
                        $orderBadge.removeClass('show');
                    }
                }
            } else {
                $('#notificationCount').removeClass('show');
            }
        },
        error: function (xhr, status, error) {
            console.log("Error getting unread count:", error);
        }
    });
}
function markAllNotificationsAsRead() {
    var roleId = getOrderDashRoleId();
    var url = hurl + "Service/Service.aspx?Process=" +
        encodeURIComponent(Encrypt("MARKALLNOTIFICATIONSASREAD")) +
        "&ROLEID=" + encodeURIComponent(Encrypt(roleId));

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (res) {
            loadNotifications();
            ShowToast('All notifications marked as read');
        },
        error: function (xhr, status, error) {
            console.log("Error marking all notifications as read:", error);
            ShowToast('Failed to mark all as read', 'error');
        }
    });
}

function getRoleClass(role) {
    var colors = [
        'color-1', 'color-2', 'color-3', 'color-4', 'color-5',
        'color-6', 'color-7', 'color-8', 'color-9', 'color-10',
        'color-11', 'color-12', 'color-13', 'color-14', 'color-15',
        'color-16', 'color-17', 'color-18', 'color-19', 'color-20',
        'color-21', 'color-22', 'color-23', 'color-24', 'color-25'
    ];

    var index = getRoleColorIndex(role);
    return colors[index % colors.length];
}

function getRoleIcon(role) {
    return '../images/shield.png';
}

function getRoleColorIndex(role) {
    var hash = 0;
    var cleanRole = role.toLowerCase().trim();
    for (var i = 0; i < cleanRole.length; i++) {
        hash = cleanRole.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 25;
}

function Encrypt(Value) {
    if (typeof CryptoKey === 'undefined' || typeof CryptoPwd === 'undefined') return Value;
    try {
        var key = CryptoJS.enc.Utf8.parse(CryptoKey);
        var iv = CryptoJS.enc.Utf8.parse(CryptoPwd);
        var encryptedVal = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(Value), key, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encryptedVal;
    } catch (e) {
        return Value;
    }
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