<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Login.aspx.cs" Inherits="Login" %>

<html lang="en">
<head>
    <title>DIAL 50 | AI Healthcare System</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <link rel="icon" href="favicon.png" />
    <link rel="stylesheet" href="fontawesome/css/all.min.css">

<style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; overflow: hidden; }

    body.login-screen {
        font-family: 'Segoe UI', 'SF Pro Text', 'Helvetica Neue', sans-serif;
        font-weight: 500;
        min-height: 100vh;
        background-image: url('images/login-img_old.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        position: relative;
        overflow: hidden;
    }

    body.login-screen::before {
        content: '';
        position: fixed; inset: 0; z-index: 0;
        background: rgba(0, 0, 0, 0.4);
    }

    body.login-screen::after {
        content: '';
        position: fixed; inset: 0; z-index: 0;
        background-image: linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px);
        background-size: 52px 52px;
    }

    .orb { position: fixed; border-radius: 50%; filter: blur(100px); z-index: 0; pointer-events: none; animation: driftOrb 22s ease-in-out infinite; }
    .orb-a { width: 600px; height: 600px; background: rgba(29,78,216,0.24); top: -18%; left: -15%; animation-delay: 0s; }
    .orb-b { width: 450px; height: 450px; background: rgba(59,130,246,0.16); bottom: -10%; right: -2%; animation-delay: -9s; }
    .orb-c { width: 300px; height: 300px; background: rgba(99,102,241,0.12); top: 30%; right: 20%; animation-delay: -16s; }
    @keyframes driftOrb {
        0%,100% { transform: translate(0,0) scale(1); }
        33% { transform: translate(28px,-20px) scale(1.04); }
        66% { transform: translate(-20px,16px) scale(0.97); }
    }

    .page-wrapper { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }

    .card-shell {
        display: flex; width: 100%; max-width: 1100px;
        height: calc(100vh - 80px); max-height: 820px;
        border-radius: 28px; overflow: hidden;
        box-shadow: 0 0 0 1px rgba(59,130,246,0.22), 0 40px 90px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05);
        animation: riseCard 0.65s cubic-bezier(.22,.68,0,1.15) both;
    }
    @keyframes riseCard {
        from { opacity: 0; transform: translateY(30px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .panel-left {
        flex: 0 0 420px; padding: 52px 44px;
        background: rgba(4, 10, 26, 0.65);
        backdrop-filter: blur(32px) saturate(150%);
        -webkit-backdrop-filter: blur(32px) saturate(150%);
        border-right: 1px solid rgba(59,130,246,0.15);
        display: flex; flex-direction: column; justify-content: space-between;
        position: relative; overflow: hidden;
    }

    .ring { position: absolute; border-radius: 50%; pointer-events: none; border: 1px solid rgba(59,130,246,0.10); }
    .ring-1 { width: 300px; height: 300px; bottom: -100px; right: -100px; animation: spinRing 40s linear infinite; }
    .ring-2 { width: 200px; height: 200px; bottom: -52px; right: -52px; animation: spinRing 28s linear infinite reverse; }
    @keyframes spinRing { to { transform: rotate(360deg); } }

    .logo-wrap { width: 100%; display: flex; justify-content: center; margin-top: -38px; margin-bottom: 12px; position: relative; z-index: 2; }
    .logo-wrap img { width: 200px; height: 200px; object-fit: contain; filter: drop-shadow(0 0 24px rgba(59,130,246,0.70)) drop-shadow(0 0 8px rgba(59,130,246,0.50)) brightness(1.15); animation: floatLogo 4s ease-in-out infinite; }
    @keyframes floatLogo { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

    .brand { display: flex; align-items: center; gap: 14px; position: relative; z-index: 2; margin-bottom: 24px; }
    .brand-title { font-family: 'Segoe UI', 'SF Pro Display', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 4px; color: #ffffff; text-transform: uppercase; line-height: 1; margin-left: -70px !important; }
    .brand-sub { display: block; font-size: 10px; font-weight: 600; letter-spacing: 3px; color: #6a85b0; text-transform: uppercase; margin-top: 5px; margin-left: -70px; }

    .left-body { flex: 1; position: relative; z-index: 2; }
    .panel-headline { font-size: 32px; font-weight: 800; line-height: 1.25; color: #ffffff; margin-bottom: 12px; }
    .panel-headline em { font-style: normal; color: #60a5fa; }
    .panel-desc { font-size: 14px; color: #8a9ec0; line-height: 1.78; margin-bottom: 36px; font-weight: 400; }

    .feat-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .feat-item { display: flex; align-items: center; gap: 14px; padding: 13px 17px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.18); border-radius: 12px; transition: all .25s ease; cursor: default; }
    .feat-item:hover { background: rgba(59,130,246,0.18); border-color: rgba(59,130,246,0.40); }
    .feat-icon { width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(59,130,246,0.25); color: #80b4ff; font-size: 14px; }
    .feat-copy strong { display: block; font-size: 14px; font-weight: 700; color: #e0e8f5; }
    .feat-copy span { font-size: 12px; font-weight: 500; color: #7a8eb0; }

    .left-foot { position: relative; z-index: 2; padding-top: 24px; border-top: 1px solid rgba(59,130,246,0.15); font-size: 11px; font-weight: 500; color: #ffffff; letter-spacing: 0.5px; }

    .panel-right {
        flex: 1; padding: 40px 68px;
        background: rgba(5, 12, 30, 0.55);
        backdrop-filter: blur(32px) saturate(150%);
        -webkit-backdrop-filter: blur(32px) saturate(150%);
        display: flex; flex-direction: column; justify-content: center;
        overflow: hidden;
    }

    .eyebrow {
        display: inline-flex; align-items: center; gap: 9px;
        font-family: 'Segoe UI', 'SF Pro Text', sans-serif;
        font-size: 11px; font-weight: 600; letter-spacing: 2.5px;
        color: #80b4ff; text-transform: uppercase;
        background: rgba(59,130,246,0.12);
        border: 1px solid rgba(59,130,246,0.25);
        padding: 6px 16px; border-radius: 100px;
        margin-bottom: 16px; width: fit-content;
    }
    .eyebrow::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #3b82f6; animation: blinkDot 1.8s ease-in-out infinite; }
    @keyframes blinkDot { 0%,100% { opacity: 1; } 50% { opacity: 0.15; } }

    .form-title { font-size: 38px; font-weight: 800; line-height: 1.2; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 10px; }
    .form-subtitle { font-size: 15px; color: #8a9ec0; margin-bottom: 16px; font-weight: 400; line-height: 1.6; }

    .error-bar {
        display: none; align-items: center; gap: 12px;
        background: rgba(220, 38, 38, 0.14);
        border: 1px solid rgba(248,113,113,0.40);
        border-left: 4px solid #ef4444;
        border-radius: 10px; padding: 14px 18px;
        color: #fca5a5; font-size: 14px; font-weight: 500;
        margin-bottom: 26px;
        animation: shakeIn 0.4s cubic-bezier(.36,.07,.19,.97);
    }
    .error-bar i { font-size: 16px; color: #f87171; flex-shrink: 0; }
    @keyframes shakeIn {
        0% { transform: translateX(-8px); opacity: 0; }
        40% { transform: translateX(6px); }
        70% { transform: translateX(-4px); }
        100% { transform: translateX(0); opacity: 1; }
    }

    .field { margin-bottom: 18px; }
    .field-label {
        display: flex; align-items: center; gap: 9px;
        font-family: 'Segoe UI', 'SF Pro Text', sans-serif;
        font-size: 11px; font-weight: 600; letter-spacing: 2px;
        text-transform: uppercase; color: #ffffff; margin-bottom: 11px;
    }
    .field-label i { color: #3b82f6; font-size: 12px; }

    body.login-screen input.dial-input {
        display: block !important; width: 100% !important;
        padding: 16px 20px !important;
        background: rgba(3, 7, 18, 0.85) !important;
        border: 1px solid rgba(59,130,246,0.30) !important;
        border-radius: 12px !important;
        font-family: 'Segoe UI', 'SF Pro Text', sans-serif !important;
        font-size: 15px !important; font-weight: 500 !important;
        color: #ffffff !important; letter-spacing: 0.3px !important;
        outline: none !important; transition: all .25s ease !important;
    }
    body.login-screen input.dial-input:focus {
        border-color: #3b82f6 !important;
        background: rgba(3, 7, 18, 0.95) !important;
        box-shadow: 0 0 0 4px rgba(59,130,246,0.15) !important;
    }
    body.login-screen input.dial-input.input-error {
        border-color: rgba(239,68,68,0.60) !important;
        box-shadow: 0 0 0 4px rgba(239,68,68,0.10) !important;
    }
    body.login-screen input.dial-input::placeholder { color: #3a4a6e; font-weight: 400; font-size: 14px; }

    body.login-screen input.dial-btn {
        display: block !important; width: 100% !important;
        padding: 17px 24px !important;
        background: #2563eb !important; border: none !important;
        border-radius: 12px !important;
        font-family: 'Segoe UI', 'SF Pro Text', sans-serif !important;
        font-size: 14px !important; font-weight: 700 !important;
        letter-spacing: 3px !important; text-transform: uppercase !important;
        color: #ffffff !important; cursor: pointer !important;
        transition: all .25s ease !important; margin-top: 10px !important;
    }
    body.login-screen input.dial-btn:hover {
        background: #1d4ed8 !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 12px 32px rgba(37,99,235,0.45) !important;
    }
    body.login-screen input.dial-btn:active { transform: translateY(0) !important; }
    body.login-screen input.dial-btn:disabled {
        background: #1a2a4a !important; color: #3a4a6e !important;
        cursor: not-allowed !important; transform: none !important;
        box-shadow: none !important; opacity: 0.5 !important;
    }

    .sec-row {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        margin-top: 26px;
        font-family: 'Segoe UI', 'SF Pro Text', sans-serif;
        font-size: 11px; font-weight: 500; color: #ffffff; letter-spacing: 0.5px;
    }
    .sec-row i { color: #22c55e; font-size: 12px; }

    .modern-loader { padding: 50px 60px; }
    .spinner-wrap { position: relative; width: 70px; height: 70px; margin: 0 auto 20px; }
    .spin-ring { position: absolute; inset: 0; border-radius: 50%; border: 3px solid rgba(59,130,246,0.15); }
    .spin-ring.ring1 { border-top: 3px solid #3b82f6; animation: spinFast 1s linear infinite; box-shadow: 0 0 15px rgba(59,130,246,0.4); }
    .spin-ring.ring2 { inset: 6px; border-top: 3px solid #60a5fa; animation: spinSlow 1.6s linear infinite reverse; }
    @keyframes spinFast { to { transform: rotate(360deg); } }
    @keyframes spinSlow { to { transform: rotate(-360deg); } }

    .loading-title { font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: 1px; margin-top: 10px; }
    .loading-sub { display: block; margin-top: 6px; font-size: 12px; color: #7a8eb0; }

    .page-loader { position: fixed; inset: 0; z-index: 9999; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }

    #LblLoginError { color: #fca5a5; font-weight: 500; }

    #errorBar { display: flex !important; opacity: 1 !important; visibility: hidden; }
    #errorBar:has(#LblLoginError[style*="visible"]) { visibility: visible; }

    .auth-modal {
        display: none; position: fixed; inset: 0; z-index: 10000;
        background: rgba(2,4,14,0.90);
        backdrop-filter: blur(22px);
        align-items: center; justify-content: center;
    }
    .auth-modal-box {
        background: rgba(4,10,26,0.90);
        border: 1px solid rgba(59,130,246,0.30);
        border-radius: 24px; padding: 50px 64px; text-align: center;
        box-shadow: 0 0 70px rgba(37,99,235,0.22);
    }
    .auth-modal-box img { width: 54px; border-radius: 4px; filter: drop-shadow(0 0 10px #3b82f6); }
    .auth-modal-box p {
        font-family: 'Segoe UI', 'SF Pro Text', sans-serif;
        font-size: 12px; font-weight: 600; letter-spacing: 3px;
        text-transform: uppercase; color: #6a85b0; margin-top: 20px;
    }

    @media (max-width:960px) {
        .panel-left { flex: 0 0 340px; padding: 44px 28px; }
        .panel-right { padding: 50px 40px; }
        .form-title { font-size: 30px; }
    }

    @media (max-width:700px) {
        .panel-left { display: none; }
        .panel-right { padding: 44px 28px; }
        body.login-screen { overflow: auto; }
        .page-wrapper { align-items: flex-start; min-height: 100vh; padding: 28px 14px; }
        .card-shell { height: auto; }
    }

    .hospital-select-wrap { margin-bottom: 12px; }

    .hospital-label {
        display: flex; align-items: center; gap: 9px;
        font-family: 'Segoe UI', 'SF Pro Text', sans-serif;
        font-size: 11px; font-weight: 600; letter-spacing: 2px;
        text-transform: uppercase; color: #ffffff; margin-bottom: 10px;
    }
    .hospital-label i { color: #3b82f6; font-size: 12px; }

    .hospital-options { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    .hospital-option { cursor: pointer; display: block; position: relative; min-width: 0; }
    .hospital-option input[type="radio"],
    .hospital-option input[type="checkbox"] { position: absolute; opacity: 0; pointer-events: none; }

    .hospital-card {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 9px; padding: 13px 12px;
        min-height: 190px; height: auto;
        background: rgba(3, 7, 18, 0.85);
        border: 1px solid rgba(59,130,246,0.30);
        border-radius: 15px;
        transition: all .25s ease;
        position: relative;
    }
    .hospital-card img {
        display: block;
        width: 150px !important; max-width: 100%;
        height: 85px !important;
        object-fit: cover !important; object-position: center;
        border-radius: 10px; padding: 0;
        filter: drop-shadow(0 0 8px rgba(59,130,246,0.40));
        transition: transform .25s ease;
    }
    .hospital-name { font-family: 'Segoe UI', sans-serif; font-size: 14px; font-weight: 700; color: #e0e8f5; letter-spacing: .8px; text-align: center; margin-top: 3px; }
    .hospital-sub { font-size: 9px; font-weight: 600; color: #7a8eb0; text-transform: uppercase; letter-spacing: 1.8px; }

    .hospital-option:hover .hospital-card {
        transform: translateY(-3px);
        border-color: rgba(59,130,246,0.70);
        background: rgba(59,130,246,0.10);
        box-shadow: 0 7px 20px rgba(37,99,235,0.15);
    }
    .hospital-option:hover .hospital-card img { transform: scale(1.04); }

    .hospital-option input:checked + .hospital-card {
        border: 1.5px solid #3b82f6;
        background: rgba(59,130,246,0.18);
        box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 8px 22px rgba(37,99,235,0.25);
    }
    .hospital-option input:checked + .hospital-card img { filter: drop-shadow(0 0 9px rgba(59,130,246,0.55)); }
    .hospital-option input:checked + .hospital-card .hospital-name { color: #93c5fd; }
    .hospital-option input:checked + .hospital-card::after {
        content: '\f00c';
        font-family: 'Font Awesome 5 Free'; font-weight: 900;
        position: absolute; top: 9px; right: 10px;
        width: 25px; height: 25px;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; color: #ffffff;
        background: #3b82f6; border-radius: 50%;
        box-shadow: 0 3px 10px rgba(37,99,235,0.35);
    }

    @media (max-width: 480px) {
        .hospital-options { gap: 10px; }
        .hospital-card { min-height: 165px; padding: 11px 8px; gap: 8px; }
        .hospital-card img { width: 125px !important; height: 72px !important; }
        .hospital-name { font-size: 12px; }
        .hospital-sub { font-size: 8px; }
    }
</style>

    <script src="js/jquery-3.6.4.min.js"></script>
    <script language="javascript" type="text/javascript">
        var ServiceURL = '<%=ConfigurationManager.AppSettings["HTTP"].ToString()%>' + '://' + '<%=ConfigurationManager.AppSettings["EPEServer"].ToString()%>' + ':' + '<%=ConfigurationManager.AppSettings["AppPort"].ToString()%>' + "/Login/Service/",
            CryptoKey = '<%=ConfigurationManager.AppSettings["CryptoKey"].ToString()%>',
            ConProtocol = '<%=ConfigurationManager.AppSettings["HTTP"].ToString()%>',
            CryptoPwd = '<%=ConfigurationManager.AppSettings["CryptoIV"].ToString()%>';

        var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } };

        $(document).ready(function () {
            $('#pageLoader').fadeOut(200);

            function disableBack() { window.history.forward(); }
            window.onload = disableBack();
            window.onpageshow = function (evt) { if (evt.persisted) disableBack(); };

            var protocol = location.protocol.replace(":", "");
            if ((typeof ConProtocol === "undefined") || (ConProtocol !== protocol)) {
                window.location = ((typeof ConProtocol === "undefined") ? "https" : ConProtocol) + "://" + window.location.host + "/Login.aspx";
            }

            $('#userid').focus();
        });
    </script>
</head>

<body class="login-screen" ondragstart="return false;" ondrop="return false;">

    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    <div class="orb orb-c"></div>

    <div id="pageLoader" class="page-loader">
        <img src="images/Traczo.svg" alt="DIAL 50">
        <div class="loader-track">
            <div class="loader-fill"></div>
        </div>
    </div>

    <div class="page-wrapper">
        <div class="card-shell">

            <div class="panel-left">
                <div class="ring ring-1"></div>
                <div class="ring ring-2"></div>

                <div class="logo-wrap">
                    <img src="images/login-img.png" alt="DIAL 50 Logo">
                    <div class="brand">
                        <div>
                            <div class="brand-title">DIAL 50</div>
                            <span class="brand-sub">AI Healthcare System</span>
                        </div>
                    </div>
                </div>
                <div class="left-body">
                    <h2 class="panel-headline">Intelligent care,<br>
                        <em>precisely delivered.</em></h2>
                    <p class="panel-desc">A unified clinical intelligence platform engineered for modern healthcare operations across the globe.</p>

                    <ul class="feat-list">
                        <li class="feat-item">
                            <div class="feat-icon"><i class="fas fa-microchip"></i></div>
                            <div class="feat-copy">
                                <strong>Neural Task Allocation</strong>
                                <span>AI-driven workflow distribution</span>
                            </div>
                        </li>
                        <li class="feat-item">
                            <div class="feat-icon"><i class="fas fa-chart-line"></i></div>
                            <div class="feat-copy">
                                <strong>Predictive Analytics</strong>
                                <span>Real-time clinical decision support</span>
                            </div>
                        </li>
                        <li class="feat-item">
                            <div class="feat-icon"><i class="fas fa-shield-alt"></i></div>
                            <div class="feat-copy">
                                <strong>Encrypted Infrastructure</strong>
                                <span>End-to-end data protection</span>
                            </div>
                        </li>
                        <li class="feat-item">
                            <div class="feat-icon"><i class="fas fa-brain"></i></div>
                            <div class="feat-copy">
                                <strong>AI Decision Engine</strong>
                                <span>Adaptive intelligence at the core</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="left-foot">ICEGEN &copy; 2026 &nbsp;&middot;&nbsp; v5.0 AI Core</div>
            </div>

            <div class="panel-right">

                <div class="eyebrow">Authenticated Access</div>
                <h1 class="form-title">Sign In to<br>
                    Your Account</h1>
                <p class="form-subtitle">Enter your credentials to access the DIAL 50 clinical platform.</p>

                <div class="hospital-select-wrap" id="hospitalWrap" style="display: none;">
                    <label class="hospital-label">
                        <i class="fas fa-hospital"></i> Select Hospital
                    </label>

                    <div class="hospital-options" id="hospitalList">
                    </div>
                </div>

                <div id="errorBar" class="error-bar" style="display: none;">
                    <i class="fas fa-exclamation-circle"></i>
                    <span id="errorMsg">
                        <label id="LblLoginError">Incorrect username or password. Please try again.</label></span>
                </div>

                <form id="formLogin" onsubmit="return false;">
                    <div class="field">
                        <label class="field-label" for="userid">
                            <i class="fas fa-id-badge"></i>User Identifier
                        </label>
                        <input id="userid" class="dial-input" type="text"
                            placeholder="Enter your user identifier"
                            autocomplete="username" spellcheck="false">
                    </div>

                    <div class="field">
                        <label class="field-label" for="password">
                            <i class="fas fa-lock"></i>Access Key
                        </label>
                        <input id="password" class="dial-input" type="password"
                            placeholder="Enter your access key"
                            autocomplete="current-password">
                    </div>

                    <input id="authBtn" type="submit" class="dial-btn" value="AUTHENTICATE"
                        onclick="ValidateLogin(); return false;">
                </form>

                <div class="sec-row">
                    <i class="fas fa-lock"></i>
                    256-bit encrypted &nbsp;&middot;&nbsp; Secure session &nbsp;&middot;&nbsp; Compliance-ready
                </div>
            </div>

        </div>
    </div>

    <div id="ModalLoading" class="auth-modal" role="dialog" style="display: none;">
        <div class="auth-modal-box modern-loader">
            <div class="spinner-wrap">
                <div class="spin-ring ring1"></div>
                <div class="spin-ring ring2"></div>
            </div>
            <p class="loading-title">Authenticating...</p>
            <span class="loading-sub">Securing your session</span>
        </div>
    </div>

</body>
    <script type="text/javascript">
        var ISMULTITENANT = 0;
        $(document).ready(function () {
            $.ajax({
                type: 'POST',
                url: 'Login.aspx/GetIsMultiTenant',
                data: '{}',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                async: false, 
                success: function (res) {
                    ISMULTITENANT = res.d;
                },
                error: function () {
                    ISMULTITENANT = 0;
                }
            });
        });
    </script>
<script src="Scripts/bootstrap.min.js" type="text/javascript"></script>
<script src="js/aes.js" type="text/javascript"></script>
<script src="js/Login.js" type="text/javascript"></script>

</html>