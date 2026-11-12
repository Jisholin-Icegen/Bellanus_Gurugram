document.addEventListener('DOMContentLoaded', function () {
    var roomInput = document.getElementById('roomNumber');
    if (!roomInput) return;

    roomInput.focus();

    roomInput.addEventListener('input', function () {
        this.classList.remove('input-error');

        var errorBox = document.querySelector('.error-message');
        if (errorBox) {
            errorBox.style.display = 'none';
        }
    });
});