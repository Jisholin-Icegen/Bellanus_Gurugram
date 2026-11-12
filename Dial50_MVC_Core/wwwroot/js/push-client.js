(function (w, d) {
    'use strict';

    var cfg = w.PUSH_CONFIG || {
        swUrl: '/sw.js',
        scope: '/',
        api: '/api/Push'
    };

    var SYNC_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

    var state = {
        room: '',
        reg: null,
        installEvt: null,
        started: false
    };

    function supported() {
        return 'serviceWorker' in navigator &&
            'PushManager' in w &&
            'Notification' in w;
    }

    function isIos() {
        return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    function isStandalone() {
        return (w.matchMedia && w.matchMedia('(display-mode: standalone)').matches) ||
            w.navigator.standalone === true;
    }

    function needsIosInstall() {
        return isIos() && !isStandalone();
    }

    function b64ToU8(b64) {
        var pad = '='.repeat((4 - b64.length % 4) % 4);
        var raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
        var out = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) {
            out[i] = raw.charCodeAt(i);
        }
        return out;
    }

    function getBedInfo() {
        var v = '';
        try { v = sessionStorage.getItem('bedInfo') || ''; } catch (e) { }
        if (!v) {
            try { v = new URLSearchParams(w.location.search).get('BedInfo') || ''; } catch (e) { }
        }
        return v;
    }

    function api(path, method, body) {
        return fetch(cfg.api + path, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'same-origin'
        }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + path);
            return r.json();
        });
    }

    function withTimeout(promise, ms, label) {
        return new Promise(function (resolve, reject) {
            var t = setTimeout(function () { reject(new Error(label + ' timed out')); }, ms);
            promise.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
        });
    }

    function getPromptData() {
        return { RoomNo: state.room, BedInfo: getBedInfo() };
    }

    function getReg() {
        if (state.reg) return Promise.resolve(state.reg);
        return navigator.serviceWorker.register(cfg.swUrl, { scope: cfg.scope })
            .then(function () { return withTimeout(navigator.serviceWorker.ready, 10000, 'service worker ready'); })
            .then(function (reg) { state.reg = reg; return reg; });
    }

    function createSubscription(reg) {
        return api('/PublicKey', 'GET').then(function (r) {
            return withTimeout(reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: b64ToU8(r.key)
            }), 15000, 'push subscribe');
        });
    }

    function ensureSubscription(reg) {
        return reg.pushManager.getSubscription().then(function (sub) {
            if (sub) return sub;
            return createSubscription(reg);
        });
    }

    function subscribe() {
        return getReg().then(function (reg) {
            return ensureSubscription(reg);
        }).then(function (sub) {
            return api('/Subscribe', 'POST', {
                RoomNo: state.room,
                BedInfo: getBedInfo(),
                Subscription: sub.toJSON()
            }).then(function () { return sub; });
        });
    }

    function completePrompt() {
        return api('/CompletePrompt', 'POST', getPromptData()).catch(function () { });
    }

    function deferPrompt() {
        return api('/DeferPrompt', 'POST', getPromptData()).catch(function () { });
    }

    function removeModal() {
        var modal = d.getElementById('pushBlockedModal');
        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    }

    function showPromptModal(iosMode) {
        removeModal();

        var bodyText = iosMode
            ? 'To get real-time updates, tap your browser\'s <strong>Share</strong> icon and select <strong>Add to Home Screen</strong>, then open the app from the new icon.'
            : 'Get real-time updates on your orders and requests directly on your device.';

        var allowDisplay = iosMode ? 'none' : 'block';

        var modalHtml = `
            <div id="pushBlockedModal" style="position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <div style="background:white;width:90%;max-width:400px;border-radius:24px;padding:32px 24px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);animation:slideUp 0.3s ease-out;">
                    <div style="width:64px;height:64px;background:#eef2ff;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
                        <svg width="32" height="32" fill="none" stroke="#4f46e5" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </div>
                    <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Enable Notifications</h2>
                    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.5;">${bodyText}</p>
                    <button id="modalAllowBtn" style="display:${allowDisplay};width:100%;background:#4f46e5;color:white;border:none;border-radius:12px;padding:14px;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:8px;">
                        Allow
                    </button>
                    <button id="modalCloseBtn" style="width:100%;background:transparent;color:#64748b;border:none;padding:14px;font-size:14px;font-weight:600;cursor:pointer;">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;

        d.body.insertAdjacentHTML('beforeend', modalHtml);

        d.getElementById('modalAllowBtn').addEventListener('click', function () {
            var btn = this;
            btn.disabled = true;
            btn.textContent = 'Please wait...';

            enable().then(function () {
                completePrompt().then(function () {
                    removeModal();
                });
            }).catch(function () {
                completePrompt().then(function () {
                    removeModal();
                });
            });
        });

        d.getElementById('modalCloseBtn').addEventListener('click', function () {
            removeModal();
            deferPrompt();
        });
    }

    function updateUi() {
        if (needsIosInstall()) {
            if (!d.getElementById('pushBlockedModal')) showPromptModal(true);
            return;
        }

        if (!supported()) return;

        if (Notification.permission === 'granted') {
            removeModal();
            return;
        }

        if (d.getElementById('pushBlockedModal')) return;

        fetch(cfg.api + '/GetPromptStatus?roomNo=' + encodeURIComponent(state.room) + '&bedInfo=' + encodeURIComponent(getBedInfo()))
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (status) {
                if (status && status.success) {
                    if (status.status === 'ENABLED') return;
                    if (status.status === 'DEFERRED' && status.shouldShow === false) return;
                }
                showPromptModal(false);
            })
            .catch(function () {
                showPromptModal(false);
            });
    }

    function enable() {
        if (needsIosInstall()) return Promise.resolve('ios-install');
        if (!supported()) return Promise.resolve('unsupported');

        return Notification.requestPermission().then(function (p) {
            if (p !== 'granted') return p;

            return subscribe().then(function () {
                return completePrompt();
            }).then(function () {
                updateUi();
                return 'granted';
            });
        });
    }

    function init(roomNo) {
        state.room = roomNo || '';
        if (state.started) { updateUi(); return; }

        if (needsIosInstall()) {
            state.started = true;
            updateUi();
            return;
        }

        if (!supported() || !state.room) return;
        state.started = true;

        getReg().catch(function () { });

        if (Notification.permission === 'granted') {
            subscribe().then(completePrompt).catch(function () { });
        }

        updateUi();
    }

    w.PushClient = {
        init: init,
        enable: enable
    };
})(window, document);