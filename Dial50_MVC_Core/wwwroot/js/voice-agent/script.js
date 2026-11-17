
var avatarParam = window.avatarParam ||
    new URLSearchParams(window.location.search).get("avatar");

window.avatarParam = avatarParam;

var REAL_AVATAR_MODE =
    window.REAL_AVATAR_MODE ||
    (avatarParam === "1");

window.REAL_AVATAR_MODE = REAL_AVATAR_MODE;

var AVATAR_IMAGE_SRC =
    window.AVATAR_IMAGE_SRC ||
    (REAL_AVATAR_MODE
        ? "assets/images/real-avatar-placeholder.jpg"
        : "/images/voice-agent/grace-avatar.jpg");

window.AVATAR_IMAGE_SRC = AVATAR_IMAGE_SRC;

function initializeAvatarUI() {

    if (document.body) {
        document.body.setAttribute(
            "data-avatar-mode",
            REAL_AVATAR_MODE ? "real" : "static"
        );
    }

    document.querySelectorAll(".avatar-img").forEach(function (img) {
        img.src = AVATAR_IMAGE_SRC;
    });
}

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", function () {
        initializeAvatarUI();
    });

} else {

    initializeAvatarUI();

}

// =========================================================
// CONFIG
// =========================================================
if (!window.APP_CONFIG) {
    console.warn("window.APP_CONFIG is missing — check that config.js is loaded before script.js.");
}

var CFG = window.APP_CONFIG || {};

var SESSION_SECONDS = Number(CFG.SESSION_SECONDS) || 180;
var SAMPLE_RATE = 24000;
var MIC_FRAME_SAMPLES = 480;

var BACKEND_HTTP = CFG.BACKEND_HTTP || '';
var BACKEND_WS = CFG.BACKEND_WS || (BACKEND_HTTP ? BACKEND_HTTP.replace(/^http/i, "ws") : '');
var PROFILE_API_URL = CFG.PROFILE_API_URL || '';

if (!BACKEND_HTTP || !BACKEND_WS) {
    console.error("APP_CONFIG.BACKEND_HTTP / BACKEND_WS are not set — calls will fail.");
}

var REGION_DIALECT = {
    US: "United States",
    GB: "United Kingdom",
    IN: "India",
    SA: "Saudi Arabia",
    AE: "UAE"
};

var widgetParams = new URLSearchParams(window.location.search);

function getWidgetUserId() {
    if (window.BedContext) {
        var b = window.BedContext.get();
        if (b && b.bedId) return b.bedId;
    }
    return sessionStorage.getItem('realBedId')
        || sessionStorage.getItem('RoomBed')
        || widgetParams.get("userId");
}

var body = null;
var countdownTimer = null;
var timeLeft = SESSION_SECONDS;

var idleBtn = null;
var endChatBtn = null;
var micBtn = null;
var speakerBtn = null;
var timerEl = null;
var homeBtn = null;
var assistantBackBtn = null;
var endedMicBtn = null;


function initializeAvatarElements() {

    body = document.body;

    idleBtn = document.getElementById("idleBtn");
    endChatBtn = document.getElementById("endChatBtn");
    micBtn = document.getElementById("micBtn");
    speakerBtn = document.getElementById("speakerBtn");
    timerEl = document.getElementById("sessionTimer");
    homeBtn = document.getElementById("homeBtn");
    assistantBackBtn = document.getElementById("assistantBackBtn");
    endedMicBtn = document.getElementById("endedMicBtn");
}

function setState(state) {
    if (!body) {
        body = document.body;
    }

    if (!body) {
        console.error("Dial50: document.body is not available.");
        return;
    }

    body.setAttribute("data-state", state);
}

function formatTime(s) {
    var m = Math.floor(s / 60);
    return m + ":" + (s % 60).toString().padStart(2, "0");
}
function renderTimer() {
    if (timerEl) timerEl.textContent = formatTime(Math.max(timeLeft, 0));
}

async function fetchProfileLanguage(id) {
    if (!id || !PROFILE_API_URL) return null;
    try {
        var rawTenant = new URLSearchParams(window.location.search).get("XTenantID") || "";
        var tenantId = decodeURIComponent(rawTenant);

        var payload = {
            userId: id,
            Status: "GET",
            "X-Tenant-ID": tenantId
        };

        var res = await fetch(PROFILE_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Tenant-ID": tenantId
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("HTTP " + res.status);
        var result = await res.json();
        if (!result.status || !result.data || !result.data.Language) return null;
        return result.data.Language;
    } catch (err) {
        console.warn("GetProfileOld failed — using region default language:", err.message);
        return null;
    }
}

var REGION_LANGUAGE_URL = "/data/region-language.json";
var FALLBACK_COUNTRY_CODE = "IN";

var currentLanguage = null;
var currentRegionCode = null;

function selectLanguage(lang) {
    if (lang) currentLanguage = lang;
}

async function loadRegionLanguages() {
    var data;
    try {
        var res = await fetch(REGION_LANGUAGE_URL);
        if (!res.ok) throw new Error("HTTP " + res.status);
        data = await res.json();
    } catch (err) {
        console.warn("Could not load " + REGION_LANGUAGE_URL + " — defaulting to English only:", err.message);
        data = {
            regions: [{
                countryCode: "US",
                defaultLanguage: "en-US",
                languages: [{ code: "en-US", name: "English" }]
            }]
        };
    }

    var regionParam = (widgetParams.get("region") || "").toUpperCase();
    var region =
        data.regions.find(function (r) { return r.countryCode === regionParam; }) ||
        data.regions.find(function (r) { return r.countryCode === FALLBACK_COUNTRY_CODE; }) ||
        data.regions[0];

    currentRegionCode = region.countryCode;

    var preferredLanguageName = await fetchProfileLanguage(getWidgetUserId());

    var defaultLang = null;
    if (preferredLanguageName) {
        defaultLang = region.languages.find(function (l) {
            return l.name.toUpperCase() === preferredLanguageName.toUpperCase();
        });
    }
    if (!defaultLang) {
        defaultLang =
            region.languages.find(function (l) { return l.code === region.defaultLanguage; }) ||
            region.languages[0];
    }
    selectLanguage(defaultLang);
}

var languageReady = loadRegionLanguages().catch(function (err) {
    console.warn("Language setup failed:", err);
});

async function fetchToken() {
    var widgetUserId = getWidgetUserId();
    if (!widgetUserId) {
        console.error("No bed id available — cannot start a call.");
        return null;
    }
    if (!BACKEND_HTTP) return null;

    var voice = widgetParams.get("voice") || CFG.VOICE;
    var speedParam = widgetParams.get("speed");
    var speed = speedParam !== null ? parseFloat(speedParam) : CFG.SPEED;
    var dialect = widgetParams.get("dialect") || CFG.DIALECT || REGION_DIALECT[currentRegionCode];

    var payload = { user_id: widgetUserId };
    if (currentLanguage) payload.language = currentLanguage.name;
    if (dialect) payload.dialect = dialect;
    if (voice) payload.voice = voice;
    if (speed !== undefined && speed !== null && !isNaN(speed)) payload.speed = speed;

    try {
        var res = await fetch(BACKEND_HTTP + "/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            console.error("/token returned " + res.status);
            return null;
        }
        var data = await res.json();
        return data.access_token || null;
    } catch (err) {
        console.error("/token unreachable:", err.message);
        return null;
    }
}

// =========================================================
// AUDIO
// =========================================================
var ws = null;
var audioContext = null;
var mediaStream = null;
var micNode = null;
var micSink = null;
var highPassNode = null;
var micMuted = false;
var speakerMuted = false;
var speakerGainNode = null;
var serverEnding = false;

var nextPlayTime = 0;
var activeSources = [];
var drainTimer = null;

// =========================================================
// LOCAL VAD — kept in script.js (no inline VAD code in Index.cshtml)
// =========================================================
var vadCfg = (CFG && CFG.VAD) || {};

class LocalVoiceActivityDetector {
    constructor(options) {
        options = options || {};
        this.sampleRate = options.sampleRate || 24000;
        this.energyThreshold = typeof options.threshold === "number" ? options.threshold : 0.01;
        this.endThreshold = typeof options.speechEndThreshold === "number" ? options.speechEndThreshold : 0.0072;
        this.duckingThreshold = typeof options.duckingThreshold === "number" ? options.duckingThreshold : 0.065;
        this.duckingEndThreshold = this.duckingThreshold * 0.72;
        this.silenceDurationMs = typeof options.silenceDurationMs === "number" ? options.silenceDurationMs : 600;
        this.speechStartDurationMs = typeof options.speechStartDurationMs === "number" ? options.speechStartDurationMs : 180;
        this.bargeInStartDurationMs = typeof options.bargeInStartDurationMs === "number" ? options.bargeInStartDurationMs : 220;
        this.isSpeaking = false;
        this.silenceTimeMs = 0;
        this.speechTimeMs = 0;
        this.lastRms = 0;
    }

    calculateRMS(samples) {
        if (!samples || !samples.length) return 0;
        var sumSquares = 0;
        var count = 0;
        // Sample every other value to keep the per-frame CPU cost low.
        for (var i = 0; i < samples.length; i += 2) {
            var sample = samples[i];
            sumSquares += sample * sample;
            count++;
        }
        if (!count) return 0;
        var rms = Math.sqrt(sumSquares / count);
        return samples instanceof Int16Array ? rms / 32768 : rms;
    }

    process(samples, sampleRate, onSpeechStart, onSpeechEnd, playbackActive) {
        if (!samples || !samples.length) return;
        var rms = this.calculateRMS(samples);
        this.lastRms = rms;
        var durationMs = samples.length / (sampleRate || this.sampleRate) * 1000;
        var onset = playbackActive ? this.duckingThreshold : this.energyThreshold;
        var sustain = playbackActive ? this.duckingEndThreshold : this.endThreshold;
        var debounce = playbackActive ? this.bargeInStartDurationMs : this.speechStartDurationMs;
        var voiceEnergy = rms > (this.isSpeaking ? sustain : onset);

        if (voiceEnergy) {
            this.silenceTimeMs = 0;
            if (!this.isSpeaking) {
                this.speechTimeMs += durationMs;
                if (this.speechTimeMs >= debounce) {
                    this.isSpeaking = true;
                    this.speechTimeMs = 0;
                    if (typeof onSpeechStart === "function") onSpeechStart(rms);
                }
            }
        } else if (!this.isSpeaking) {
            this.speechTimeMs = Math.max(0, this.speechTimeMs - durationMs);
        } else {
            this.silenceTimeMs += durationMs;
            if (this.silenceTimeMs >= this.silenceDurationMs) {
                this.isSpeaking = false;
                this.silenceTimeMs = 0;
                this.speechTimeMs = 0;
                if (typeof onSpeechEnd === "function") onSpeechEnd(rms);
            }
        }
    }

    reset() {
        this.isSpeaking = false;
        this.silenceTimeMs = 0;
        this.speechTimeMs = 0;
        this.lastRms = 0;
    }
}

var localVad = new LocalVoiceActivityDetector({
    sampleRate: SAMPLE_RATE,
    threshold: typeof vadCfg.threshold === "number" ? vadCfg.threshold : 0.01,
    speechEndThreshold: typeof vadCfg.speechEndThreshold === "number" ? vadCfg.speechEndThreshold : 0.0072,
    duckingThreshold: typeof vadCfg.duckingThreshold === "number" ? vadCfg.duckingThreshold : 0.065,
    silenceDurationMs: typeof vadCfg.silenceDurationMs === "number" ? vadCfg.silenceDurationMs : 600,
    speechStartDurationMs: typeof vadCfg.speechStartDurationMs === "number" ? vadCfg.speechStartDurationMs : 180,
    bargeInStartDurationMs: typeof vadCfg.bargeInStartDurationMs === "number" ? vadCfg.bargeInStartDurationMs : 220
});
var localBargeIn = vadCfg.localBargeIn === true;

function processLocalVADFrame(buffer) {
    if (!localVad || micMuted || !buffer) return;
    var samples;
    if (buffer instanceof Int16Array) samples = buffer;
    else if (buffer instanceof ArrayBuffer && buffer.byteLength >= 2) {
        samples = new Int16Array(buffer, 0, Math.floor(buffer.byteLength / 2));
    } else return;

    var playbackActive = !!(audioContext && activeSources.length > 0 && audioContext.currentTime < nextPlayTime);
    localVad.process(samples, SAMPLE_RATE, onLocalSpeechStart, onLocalSpeechEnd, playbackActive);
}

function onLocalSpeechStart(rms) {
    // Off by default: server/Azure VAD remains responsible for actual barge-in.
    if (localBargeIn) flushPlayback();
    var layer = document.getElementById("callLayer");
    if (layer) {
        var status = layer.getAttribute("data-status");
        if (status === "speaking" || status === "thinking") setCallStatus("listening");
    }
}

function onLocalSpeechEnd() {
    var layer = document.getElementById("callLayer");
    if (layer && layer.getAttribute("data-status") === "listening") setCallStatus("thinking");
}


var MIC_WORKLET_SOURCE = `
class MicProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        const o = options.processorOptions;
        this.ratio = o.inputRate / o.targetRate;
        this.frameSize = o.frameSize;
        this.buf = new Int16Array(this.frameSize);
        this.n = 0;
        this.pos = 0;
        this.prev = 0;
        this.muted = false;
        this.port.onmessage = (e) => {
            if (e.data && "muted" in e.data) this.muted = e.data.muted;
        };
    }
    push(x) {
        let v = 0;
        if (!this.muted) {
            const s = Math.max(-1, Math.min(1, x));
            v = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        this.buf[this.n++] = v;
        if (this.n === this.frameSize) {
            const out = this.buf.buffer;
            this.port.postMessage(out, [out]);
            this.buf = new Int16Array(this.frameSize);
            this.n = 0;
        }
    }
    process(inputs) {
        const ch = inputs[0] && inputs[0][0];
        if (!ch || ch.length === 0) return true;
        let pos = this.pos;
        while (pos < ch.length - 1) {
            const i = Math.floor(pos);
            const frac = pos - i;
            const a = i < 0 ? this.prev : ch[i];
            const b = ch[i + 1];
            this.push(a + (b - a) * frac);
            pos += this.ratio;
        }
        this.pos = pos - ch.length;
        this.prev = ch[ch.length - 1];
        return true;
    }
}
registerProcessor("mic-processor", MicProcessor);
`;

function playPCM16(buffer) {
    if (!audioContext) return;
    var int16Array = new Int16Array(buffer);
    var float32Array = new Float32Array(int16Array.length);
    for (var i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
    }
    var audioBuffer = audioContext.createBuffer(1, float32Array.length, SAMPLE_RATE);
    audioBuffer.getChannelData(0).set(float32Array);

    var source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(speakerGainNode);

    var currentTime = audioContext.currentTime;
    if (nextPlayTime < currentTime) nextPlayTime = currentTime;
    source.start(nextPlayTime);
    nextPlayTime += audioBuffer.duration;

    activeSources.push(source);
    source.onended = function () {
        activeSources = activeSources.filter(function (s) { return s !== source; });
        scheduleDrainCheck();
    };
}

function scheduleDrainCheck() {
    clearTimeout(drainTimer);
    drainTimer = setTimeout(function () {
        if (activeSources.length === 0 && audioContext &&
            audioContext.currentTime >= nextPlayTime - 0.02) {
            setCallStatus("listening");
        }
    }, 200);
}

function toggleSpeaker() {
    speakerMuted = !speakerMuted;
    if (speakerGainNode) speakerGainNode.gain.value = speakerMuted ? 0 : 1;
    if (speakerBtn) {
        speakerBtn.classList.toggle("muted", speakerMuted);
        speakerBtn.setAttribute("aria-label", speakerMuted ? "Turn speaker on" : "Mute speaker");
    }
}

function flushPlayback() {
    clearTimeout(drainTimer);
    activeSources.forEach(function (s) { try { s.stop(); } catch (e) { } });
    activeSources = [];
    nextPlayTime = audioContext ? audioContext.currentTime : 0;
}

async function startMicrophone() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
    if (audioContext.state === "suspended") await audioContext.resume();

    speakerGainNode = audioContext.createGain();
    speakerGainNode.gain.value = speakerMuted ? 0 : 1;
    speakerGainNode.connect(audioContext.destination);
    nextPlayTime = audioContext.currentTime;

    mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            channelCount: 1,
            sampleRate: SAMPLE_RATE,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    });

    if (audioContext.sampleRate !== SAMPLE_RATE) {
        console.warn("AudioContext runs at " + audioContext.sampleRate + " Hz — resampling mic to " + SAMPLE_RATE + " Hz.");
    }

    var blobUrl = URL.createObjectURL(new Blob([MIC_WORKLET_SOURCE], { type: "application/javascript" }));
    try {
        await audioContext.audioWorklet.addModule(blobUrl);
    } finally {
        URL.revokeObjectURL(blobUrl);
    }

    var source = audioContext.createMediaStreamSource(mediaStream);
    micNode = new AudioWorkletNode(audioContext, "mic-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
        processorOptions: {
            inputRate: audioContext.sampleRate,
            targetRate: SAMPLE_RATE,
            frameSize: MIC_FRAME_SAMPLES
        }
    });
    micNode.port.postMessage({ muted: micMuted });
    micNode.port.onmessage = function (e) {
        processLocalVADFrame(e.data);
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(e.data);
    };

    highPassNode = audioContext.createBiquadFilter();
    highPassNode.type = "highpass";
    highPassNode.frequency.value = 120;
    highPassNode.Q.value = 0.7;

    micSink = audioContext.createGain();
    micSink.gain.value = 0;
    source.connect(highPassNode);
    highPassNode.connect(micNode);
    micNode.connect(micSink);
    micSink.connect(audioContext.destination);
}

function stopMicrophone() {
    if (localVad) localVad.reset();
    if (highPassNode) { highPassNode.disconnect(); highPassNode = null; }
    if (micNode) { micNode.port.onmessage = null; micNode.disconnect(); micNode = null; }
    if (micSink) { micSink.disconnect(); micSink = null; }
    if (mediaStream) { mediaStream.getTracks().forEach(function (t) { t.stop(); }); mediaStream = null; }
    if (audioContext) { audioContext.close().catch(function () { }); audioContext = null; }
}

// =========================================================
// BACKEND CONNECTION
// =========================================================
async function connectToAvatarBackend() {
    serverEnding = false;
    try {
        await languageReady;
        await startMicrophone();
        setCallStatus("ringing");

        var token = await fetchToken();
        if (!token) throw new Error("No token — cannot open /voice-assistant.");

        var socket = new WebSocket(BACKEND_WS + "/voice-assistant?token=" + encodeURIComponent(token));
        socket.binaryType = "arraybuffer";
        ws = socket;

        socket.onopen = function () {
            if (ws === socket) goConnected();
        };

        socket.onmessage = function (event) {
            if (ws !== socket) return;

            if (event.data instanceof ArrayBuffer) {
                setCallStatus("speaking");
                playPCM16(event.data);
                return;
            }

            var msg;
            try { msg = JSON.parse(event.data); } catch (e) { return; }

            switch (msg.type) {
                case "interrupt":
                case "speech_started":
                case "input_audio_buffer.speech_started":
                    flushPlayback();
                    setCallStatus("listening");
                    break;

                case "user_speaking":
                    if (msg.speaking) setCallStatus("listening");
                    break;

                case "agent_speaking":
                    if (msg.speaking) setCallStatus("speaking");
                    break;

                case "transcript":
                    var cl = document.getElementById("callLayer");
                    if (cl && cl.getAttribute("data-status") !== "speaking") {
                        setCallStatus("thinking");
                    }
                    break;

                case "transcript_delta":
                case "transcript_done":
                case "ping":
                case "pong":
                case "session.created":
                case "session.updated":
                case "response.audio_transcript.delta":
                case "response.audio_transcript.done":
                    break;

                case "call_ended": {
                    serverEnding = true;
                    var remainingMs = audioContext
                        ? Math.max(0, (nextPlayTime - audioContext.currentTime) * 1000)
                        : 0;
                    setTimeout(endChat, remainingMs + 300);
                    break;
                }

                default:
                    break;
            }
        };

        socket.onclose = function () {
            if (ws !== socket) return;

            var state = body ? body.getAttribute("data-state") : null;

            if (serverEnding) return;

            stopMicrophone();

            if (state === "connected" || state === "connecting") {
                endChat();
            }
        };

        socket.onerror = function () {
            if (ws !== socket) return;
            stopMicrophone();
            endChat();
        };
    } catch (err) {
        console.error("Could not start call:", err);
        stopMicrophone();
        endChat();
    }
}

function goConnected() {
    timeLeft = SESSION_SECONDS;
    renderTimer();
    setState("connected");
    setCallStatus("connecting");
    setTimeout(function () {
        setCallStatus("connected");
        setTimeout(function () { setCallStatus("listening"); }, 700);
    }, 700);
    startCountdown();
}

function startCountdown() {
    clearInterval(countdownTimer);
    countdownTimer = setInterval(function () {
        timeLeft -= 1;
        renderTimer();
        if (timeLeft <= 0) endChat();
    }, 1000);
}

function setCallStatus(status) {
    var callLayer = document.getElementById("callLayer");
    var callStatus = document.getElementById("callStatus");
    var callTitle = document.getElementById("callTitle");

    if (!callLayer || !callStatus) return;
    callLayer.setAttribute("data-status", status);

    var labels = {
        dialing: "Connecting voice / audio...",
        ringing: "Connecting...",
        connecting: "Connecting...",
        connected: "Connected...",
        listening: "Listening...",
        thinking: "Thinking...",
        speaking: "Speaking..."
    };
    callStatus.textContent = labels[status] || "Listening...";

    if (callTitle) {
        callTitle.textContent = (status === "dialing" || status === "ringing")
            ? "Dial50 Room Assistant"
            : "Dial50 Demo Hospital";
    }
}

function endChat() {
    clearInterval(countdownTimer);
    clearTimeout(drainTimer);

    micMuted = false;
    speakerMuted = false;
    if (micBtn) micBtn.classList.remove("muted");
    if (speakerBtn) speakerBtn.classList.remove("muted");
    if (speakerGainNode) speakerGainNode.gain.value = 1;

    flushPlayback();
    stopMicrophone();

    if (ws) {
        var old = ws;
        ws = null;
        try { old.close(); } catch (e) { }
    }

    setState("ended");

    if (typeof window.flushPendingPopups === "function") {
        try { window.flushPendingPopups(); } catch (e) { }
    }
}

// =========================================================
// EVENTS
// =========================================================

function initializeAvatarEvents() {

    initializeAvatarElements();

    if (!body) {
        console.error("Dial50: document.body not available.");
        return;
    }

    if (endChatBtn) {
        endChatBtn.addEventListener("click", function () {
            console.log("Dial50: End Chat clicked");
            endChat();
        });
    }

    if (homeBtn) {
        homeBtn.addEventListener("click", function () {
            console.log("Dial50: Home clicked");
            setState("idle");
        });
    }

    if (micBtn) {
        micBtn.addEventListener("click", function () {

            console.log("Dial50: Mic clicked");

            micMuted = !micMuted;

            micBtn.classList.toggle("muted", micMuted);

            if (micNode) {
                micNode.port.postMessage({
                    muted: micMuted
                });
            }
        });
    }

    if (speakerBtn) {
        speakerBtn.addEventListener("click", function () {
            console.log("Dial50: Speaker clicked");
            toggleSpeaker();
        });
    }

    if (assistantBackBtn) {
        assistantBackBtn.addEventListener("click", function () {

            console.log("Dial50: Assistant Back clicked");

            if (body.getAttribute("data-state") !== "idle") {
                endChat();
            }

            setState("idle");
        });
    }

    if (idleBtn) {
        idleBtn.addEventListener("click", function () {

            console.log("Dial50: Start Call clicked");

            var state = body.getAttribute("data-state");

            if (state === "connecting" || state === "connected") {
                return;
            }

            setState("connecting");
            setCallStatus("dialing");

            connectToAvatarBackend();
        });
    }

    if (endedMicBtn) {
        endedMicBtn.addEventListener("click", function () {

            console.log("Dial50: Ended Mic / Start Again clicked");

            if (idleBtn) {
                idleBtn.click();
            }
        });
    }

//    console.log("Dial50: All avatar events initialized", {
//        idleBtn: !!idleBtn,
//        micBtn: !!micBtn,
//        speakerBtn: !!speakerBtn,
//        endChatBtn: !!endChatBtn,
//        endedMicBtn: !!endedMicBtn,
//        body: !!body
//    });
}


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
        initializeAvatarUI();
        initializeAvatarEvents();
    });

} else {

    initializeAvatarUI();
    initializeAvatarEvents();

}

window.setState = setState;
window.setCallStatus = setCallStatus;
window.connectToAvatarBackend = connectToAvatarBackend;
window.endChat = endChat;
window.Dial50VAD = {
    Detector: LocalVoiceActivityDetector,
    instance: localVad,
    processFrame: processLocalVADFrame,
    reset: function () { localVad.reset(); },
    getState: function () { return { isSpeaking: localVad.isSpeaking, lastRms: localVad.lastRms, threshold: localVad.energyThreshold }; }
};
