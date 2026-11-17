// (function () {
//     'use strict';

//     var VIDEO_CFG = window.VIDEO_AI_CONFIG || {};
//     var CFG = window.APP_CONFIG || {};

//     var SESSION_SECONDS = Number(VIDEO_CFG.SESSION_SECONDS || CFG.SESSION_SECONDS) || 180;
//     var SAMPLE_RATE = 24000;
//     var MIC_FRAME_SAMPLES = 480;
//     var MAX_QUEUED_AUDIO_SECONDS = 8;
//     var END_NOTIFY_FALLBACK_MS = 800;

//     var BACKEND_HTTP = VIDEO_CFG.BACKEND_HTTP || CFG.BACKEND_HTTP || '';
//     var BACKEND_WS = VIDEO_CFG.BACKEND_WS
//         || CFG.BACKEND_WS
//         || (BACKEND_HTTP ? BACKEND_HTTP.replace(/^http/i, 'ws') : '');
//     var PROFILE_API_URL = VIDEO_CFG.PROFILE_API_URL || CFG.PROFILE_API_URL || '';

//     var VIDEO_WS_PATH = '/video-assistant';

//     var VIDEO_WS_URL = VIDEO_CFG.wsEndpoint
//         || (BACKEND_WS ? BACKEND_WS.replace(/\/$/, '') + VIDEO_WS_PATH : '');

//     var REGION_DIALECT = {
//         US: 'United States',
//         GB: 'United Kingdom',
//         IN: 'India',
//         SA: 'Saudi Arabia',
//         AE: 'UAE'
//     };

//     var widgetParams = new URLSearchParams(window.location.search);
//     var widgetUserId = widgetParams.get('userId') || widgetParams.get('BedInfo');

//     var body = document.body;
//     var countdownTimer = null;
//     var timeLeft = SESSION_SECONDS;

//     var idleBtn = document.getElementById('idleBtn');
//     var endChatBtn = document.getElementById('endChatBtn');
//     var micBtn = document.getElementById('micBtn');
//     var speakerBtn = document.getElementById('speakerBtn');
//     var timerEl = document.getElementById('sessionTimer');
//     var homeBtn = document.getElementById('homeBtn');
//     var endedMicBtn = document.getElementById('endedMicBtn');

//     // Cached call-screen elements (avoid getElementById on every audio packet)
//     var callLayerEl = null;
//     var callStatusEl = null;
//     var callTitleEl = null;
//     var lastStatus = null;

//     function setState(state) {
//         if (body.getAttribute('data-state') !== state) body.setAttribute('data-state', state);
//     }
//     function formatTime(s) {
//         var m = Math.floor(s / 60);
//         return m + ':' + (s % 60).toString().padStart(2, '0');
//     }
//     function renderTimer() {
//         if (timerEl) timerEl.textContent = formatTime(Math.max(timeLeft, 0));
//     }

//     // =========================================================
//     // PROFILE / LANGUAGE (starts at page load, awaited on click)
//     // =========================================================
//     async function fetchProfileLanguage(id) {
//         if (!id || !PROFILE_API_URL) return null;
//         try {
//             var res = await fetch(PROFILE_API_URL, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ userId: id, Status: 'GET' })
//             });
//             if (!res.ok) throw new Error('HTTP ' + res.status);
//             var result = await res.json();
//             if (!result.status || !result.data || !result.data.Language) return null;
//             return result.data.Language;
//         } catch (err) {
//             console.warn('[VideoAI] profile fetch failed:', err.message);
//             return null;
//         }
//     }

//     var REGION_LANGUAGE_URL = '/data/region-language.json';
//     var FALLBACK_COUNTRY_CODE = 'IN';
//     var currentLanguage = null;
//     var currentRegionCode = null;

//     function selectLanguage(lang) { if (lang) currentLanguage = lang; }

//     async function loadRegionLanguages() {
//         var data;
//         try {
//             var res = await fetch(REGION_LANGUAGE_URL);
//             if (!res.ok) throw new Error('HTTP ' + res.status);
//             data = await res.json();
//         } catch (err) {
//             data = {
//                 regions: [{
//                     countryCode: 'US',
//                     defaultLanguage: 'en-US',
//                     languages: [{ code: 'en-US', name: 'English' }]
//                 }]
//             };
//         }
//         var regionParam = (widgetParams.get('region') || '').toUpperCase();
//         var region =
//             data.regions.find(function (r) { return r.countryCode === regionParam; }) ||
//             data.regions.find(function (r) { return r.countryCode === FALLBACK_COUNTRY_CODE; }) ||
//             data.regions[0];
//         currentRegionCode = region.countryCode;

//         var preferredLanguageName = await fetchProfileLanguage(widgetUserId);
//         var defaultLang = null;
//         if (preferredLanguageName) {
//             defaultLang = region.languages.find(function (l) {
//                 return l.name.toUpperCase() === preferredLanguageName.toUpperCase();
//             });
//         }
//         if (!defaultLang) {
//             defaultLang =
//                 region.languages.find(function (l) { return l.code === region.defaultLanguage; }) ||
//                 region.languages[0];
//         }
//         selectLanguage(defaultLang);
//     }

//     var languageReady = loadRegionLanguages().catch(function (err) {
//         console.warn('[VideoAI] Language setup failed:', err);
//     });

//     // =========================================================
//     // TOKEN
//     // =========================================================
//     async function fetchToken() {
//         if (!widgetUserId) return null;
//         var tokenUrl = VIDEO_CFG.tokenUrl
//             || (BACKEND_HTTP ? BACKEND_HTTP.replace(/\/$/, '') + '/token' : null);
//         if (!tokenUrl) return null;

//         var voice = widgetParams.get('voice') || CFG.VOICE;
//         var speedParam = widgetParams.get('speed');
//         var speed = speedParam !== null ? parseFloat(speedParam) : CFG.SPEED;
//         var dialect = widgetParams.get('dialect') || CFG.DIALECT || REGION_DIALECT[currentRegionCode];

//         var payload = { user_id: widgetUserId, scope: 'video-ai' };
//         if (currentLanguage) payload.language = currentLanguage.name;
//         if (dialect) payload.dialect = dialect;
//         if (voice) payload.voice = voice;
//         if (speed !== undefined && speed !== null && !isNaN(speed)) payload.speed = speed;

//         try {
//             var res = await fetch(tokenUrl, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });
//             if (!res.ok) {
//                 console.error('[VideoAI] /token returned ' + res.status);
//                 return null;
//             }
//             var data = await res.json();
//             return data.access_token || null;
//         } catch (err) {
//             console.error('[VideoAI] /token unreachable:', err.message);
//             return null;
//         }
//     }

//     // =========================================================
//     // AUDIO STATE
//     // =========================================================
//     var ws = null;
//     var audioContext = null;
//     var mediaStream = null;
//     var micSource = null;
//     var micNode = null;
//     var micSink = null;
//     var highPassNode = null;
//     var micMuted = false;
//     var speakerMuted = false;
//     var speakerGainNode = null;
//     var serverEnding = false;
//     var sessionReady = false;
//     var callGeneration = 0;
//     var endingTimer = null;
//     var nextPlayTime = 0;
//     var activeSources = [];
//     var drainTimer = null;

//     // Lightweight RMS VAD moved from MyDailyCare/Index.cshtml into this module.
//     // Audio frames are analyzed on the main thread in small 20 ms packets; no Silero model.
//     (function (global) {
//             'use strict';

//             class LocalVoiceActivityDetector {
//                 constructor(options) {
//                     options = options || {};
//                     this.sampleRate = options.sampleRate || 24000;
//                     this.energyThreshold = typeof options.threshold === 'number' ? options.threshold : 0.01;
//                     this.endThreshold = typeof options.speechEndThreshold === 'number'
//                         ? options.speechEndThreshold : this.energyThreshold * 0.72;
//                     this.duckingThreshold = typeof options.duckingThreshold === 'number' ? options.duckingThreshold : 0.065;
//                     this.duckingEndThreshold = this.duckingThreshold * 0.72;
//                     this.silenceDurationMs = typeof options.silenceDurationMs === 'number' ? options.silenceDurationMs : 600;
//                     this.speechStartDurationMs = typeof options.speechStartDurationMs === 'number' ? options.speechStartDurationMs : 180;
//                     this.bargeInStartDurationMs = typeof options.bargeInStartDurationMs === 'number' ? options.bargeInStartDurationMs : 220;

//                     this.isSpeaking = false;
//                     this.silenceTimeMs = 0;
//                     this.speechTimeMs = 0;
//                     this.lastRms = 0;
//                 }

//                 // Stride-2 RMS: half the CPU cost, plenty accurate for energy gating
//                 calculateRMS(samples) {
//                     if (!samples || !samples.length) return 0;
//                     var sumSquares = 0;
//                     var count = 0;
//                     for (var i = 0; i < samples.length; i += 2) {
//                         var s = samples[i];
//                         sumSquares += s * s;
//                         count++;
//                     }
//                     if (!count) return 0;
//                     var rms = Math.sqrt(sumSquares / count);
//                     return samples instanceof Int16Array ? rms / 32768 : rms;
//                 }

//                 process(samples, sampleRate, onSpeechStart, onSpeechEnd, playbackActive) {
//                     if (!samples || !samples.length) return;

//                     var rms = this.calculateRMS(samples);
//                     this.lastRms = rms;
//                     var durationMs = samples.length / (sampleRate || this.sampleRate) * 1000;

//                     var onset = playbackActive ? this.duckingThreshold : this.energyThreshold;
//                     var sustain = playbackActive ? this.duckingEndThreshold : this.endThreshold;
//                     var debounce = playbackActive ? this.bargeInStartDurationMs : this.speechStartDurationMs;
//                     var voiceEnergy = rms > (this.isSpeaking ? sustain : onset);

//                     if (voiceEnergy) {
//                         this.silenceTimeMs = 0;
//                         if (!this.isSpeaking) {
//                             this.speechTimeMs += durationMs;
//                             if (this.speechTimeMs >= debounce) {
//                                 this.isSpeaking = true;
//                                 this.speechTimeMs = 0;
//                                 if (typeof onSpeechStart === 'function') onSpeechStart(rms);
//                             }
//                         }
//                     } else if (!this.isSpeaking) {
//                         this.speechTimeMs = Math.max(0, this.speechTimeMs - durationMs);
//                     } else {
//                         this.silenceTimeMs += durationMs;
//                         if (this.silenceTimeMs >= this.silenceDurationMs) {
//                             this.isSpeaking = false;
//                             this.silenceTimeMs = 0;
//                             this.speechTimeMs = 0;
//                             if (typeof onSpeechEnd === 'function') onSpeechEnd(rms);
//                         }
//                     }
//                 }

//                 reset() {
//                     this.isSpeaking = false;
//                     this.silenceTimeMs = 0;
//                     this.speechTimeMs = 0;
//                     this.lastRms = 0;
//                 }
//             }

//             var vadCfg = (global.VIDEO_AI_CONFIG && global.VIDEO_AI_CONFIG.VAD)
//                 || (global.APP_CONFIG && global.APP_CONFIG.VAD)
//                 || {};

//             var localBargeIn = vadCfg.localBargeIn === true;

//             var vadInstance = new LocalVoiceActivityDetector({
//                 sampleRate: 24000,
//                 threshold: vadCfg.threshold,
//                 speechEndThreshold: vadCfg.speechEndThreshold,
//                 duckingThreshold: vadCfg.duckingThreshold,
//                 silenceDurationMs: vadCfg.silenceDurationMs,
//                 speechStartDurationMs: vadCfg.speechStartDurationMs,
//                 bargeInStartDurationMs: vadCfg.bargeInStartDurationMs
//             });

//             function onLocalSpeechStart() {
//                 if (localBargeIn && typeof global.flushPlayback === 'function') {
//                     global.flushPlayback();
//                 }
//                 var s = typeof global.getCallStatus === 'function' ? global.getCallStatus() : null;
//                 if (s === 'speaking' || s === 'thinking') {
//                     global.setCallStatus('listening');
//                 }
//             }

//             function onLocalSpeechEnd() {
//                 var s = typeof global.getCallStatus === 'function' ? global.getCallStatus() : null;
//                 if (s === 'listening') {
//                     global.setCallStatus('thinking');
//                 }
//             }

//             // Called ~50x/second with each mic frame: no DOM access in here
//             function handleMicBufferForVAD(buffer) {
//                 if (!buffer || global.micMuted) return;

//                 var samples;
//                 if (buffer instanceof Int16Array) {
//                     samples = buffer;
//                 } else if (buffer instanceof ArrayBuffer && buffer.byteLength >= 2) {
//                     samples = new Int16Array(buffer, 0, buffer.byteLength >> 1);
//                 } else {
//                     return;
//                 }
//                 if (!samples.length) return;

//                 var playing = typeof global.isAssistantPlaying === 'function' && global.isAssistantPlaying();
//                 vadInstance.process(samples, 24000, onLocalSpeechStart, onLocalSpeechEnd, playing);
//             }

//             global.Dial50VAD = {
//                 Detector: LocalVoiceActivityDetector,
//                 instance: vadInstance,
//                 processFrame: handleMicBufferForVAD,
//                 reset: function () { vadInstance.reset(); },
//                 getState: function () {
//                     return {
//                         isSpeaking: vadInstance.isSpeaking,
//                         lastRms: vadInstance.lastRms,
//                         threshold: vadInstance.energyThreshold
//                     };
//                 }
//             };
//         })(window);

//     var MIC_WORKLET_SOURCE = `
//         class MicProcessor extends AudioWorkletProcessor {
//             constructor(options) {
//                 super();
//                 const o = (options && options.processorOptions) || {};
//                 this.frameSize = (o.frameSize && o.frameSize > 0) ? o.frameSize : 480;
//                 const inRate = (o.inputRate && o.inputRate > 0) ? o.inputRate : 24000;
//                 const tgtRate = (o.targetRate && o.targetRate > 0) ? o.targetRate : 24000;
//                 this.ratio = inRate / tgtRate;
//                 if (!isFinite(this.ratio) || this.ratio <= 0) this.ratio = 1;
//                 this.buf = new Int16Array(this.frameSize);
//                 this.n = 0;
//                 this.pos = 0;
//                 this.prev = 0;
//                 this.muted = false;
//                 this.port.onmessage = (e) => {
//                     if (e.data && "muted" in e.data) this.muted = Boolean(e.data.muted);
//                 };
//             }
//             push(x) {
//                 let v = 0;
//                 if (!this.muted) {
//                     const s = Math.max(-1, Math.min(1, x));
//                     v = s < 0 ? s * 0x8000 : s * 0x7FFF;
//                 }
//                 this.buf[this.n++] = v;
//                 if (this.n >= this.frameSize) {
//                     const out = this.buf.slice(0, this.frameSize).buffer;
//                     this.port.postMessage(out, [out]);
//                     this.n = 0;
//                 }
//             }
//             process(inputs) {
//                 const ch = inputs[0] && inputs[0][0];
//                 if (!ch || ch.length === 0) return true;
//                 if (Math.abs(this.ratio - 1) < 0.001) {
//                     for (let i = 0; i < ch.length; i++) this.push(ch[i]);
//                     return true;
//                 }
//                 let pos = this.pos;
//                 let iters = 0;
//                 const maxIters = (ch.length * 4) + 16;
//                 while (pos < ch.length - 1 && iters++ < maxIters) {
//                     const i = Math.floor(pos);
//                     const frac = pos - i;
//                     const a = i < 0 ? this.prev : ch[i];
//                     const b = ch[i + 1];
//                     this.push(a + (b - a) * frac);
//                     pos += this.ratio;
//                 }
//                 this.pos = Math.max(0, pos - ch.length);
//                 this.prev = ch[ch.length - 1];
//                 return true;
//             }
//         }
//         registerProcessor("mic-processor", MicProcessor);
//     `;

//     function isAssistantPlaying() {
//         return !!(audioContext && activeSources.length > 0 && audioContext.currentTime < nextPlayTime);
//     }

//     function playPCM16(buffer) {
//         if (!audioContext || !buffer || buffer.byteLength < 2) return;
//         if (nextPlayTime - audioContext.currentTime > MAX_QUEUED_AUDIO_SECONDS) {
//             flushPlayback();
//         }
//         var int16Array = new Int16Array(buffer, 0, buffer.byteLength >> 1);
//         var audioBuffer = audioContext.createBuffer(1, int16Array.length, SAMPLE_RATE);
//         var out = audioBuffer.getChannelData(0);
//         for (var i = 0; i < int16Array.length; i++) out[i] = int16Array[i] / 32768.0;
//         var source = audioContext.createBufferSource();
//         source.buffer = audioBuffer;
//         source.connect(speakerGainNode);
//         var currentTime = audioContext.currentTime;
//         if (nextPlayTime < currentTime) nextPlayTime = currentTime;
//         source.start(nextPlayTime);
//         nextPlayTime += audioBuffer.duration;
//         activeSources.push(source);
//         source.onended = function () {
//             source.onended = null;
//             try { source.disconnect(); } catch (e) { }
//             var idx = activeSources.indexOf(source);
//             if (idx !== -1) activeSources.splice(idx, 1);
//             scheduleDrainCheck();
//         };
//     }

//     function scheduleDrainCheck() {
//         clearTimeout(drainTimer);
//         drainTimer = setTimeout(function () {
//             if (activeSources.length === 0 && audioContext &&
//                 audioContext.currentTime >= nextPlayTime - 0.02) {
//                 setCallStatus('listening');
//             }
//         }, 200);
//     }

//     function toggleSpeaker() {
//         speakerMuted = !speakerMuted;
//         if (speakerGainNode) speakerGainNode.gain.value = speakerMuted ? 0 : 1;
//         if (speakerBtn) {
//             speakerBtn.classList.toggle('muted', speakerMuted);
//             speakerBtn.setAttribute('aria-label', speakerMuted ? 'Turn speaker on' : 'Mute speaker');
//         }
//     }

//     function flushPlayback() {
//         clearTimeout(drainTimer);
//         activeSources.forEach(function (s) { try { s.stop(); } catch (e) { } });
//         activeSources = [];
//         nextPlayTime = audioContext ? audioContext.currentTime : 0;
//     }

//     async function startMicrophone() {
//         audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
//         if (audioContext.state === 'suspended') await audioContext.resume();
//         speakerGainNode = audioContext.createGain();
//         speakerGainNode.gain.value = speakerMuted ? 0 : 1;
//         speakerGainNode.connect(audioContext.destination);
//         nextPlayTime = audioContext.currentTime;

//         mediaStream = await navigator.mediaDevices.getUserMedia({
//             audio: {
//                 channelCount: 1,
//                 sampleRate: SAMPLE_RATE,
//                 echoCancellation: true,
//                 noiseSuppression: true,
//                 autoGainControl: true
//             }
//         });

//         var blobUrl = URL.createObjectURL(new Blob([MIC_WORKLET_SOURCE], { type: 'application/javascript' }));
//         try {
//             await audioContext.audioWorklet.addModule(blobUrl);
//         } finally {
//             URL.revokeObjectURL(blobUrl);
//         }

//         micSource = audioContext.createMediaStreamSource(mediaStream);
//         micNode = new AudioWorkletNode(audioContext, 'mic-processor', {
//             numberOfInputs: 1,
//             numberOfOutputs: 1,
//             outputChannelCount: [1],
//             processorOptions: {
//                 inputRate: audioContext.sampleRate,
//                 targetRate: SAMPLE_RATE,
//                 frameSize: MIC_FRAME_SAMPLES
//             }
//         });
//         micNode.port.postMessage({ muted: micMuted });
//         micNode.port.onmessage = function (e) {
//             if (!sessionReady || !ws || ws.readyState !== WebSocket.OPEN || serverEnding) return;
//             var vad = window.Dial50VAD;
//             if (vad && typeof vad.processFrame === 'function') vad.processFrame(e.data);
//             if (ws.bufferedAmount < 65536) ws.send(e.data);
//         };

//         highPassNode = audioContext.createBiquadFilter();
//         highPassNode.type = 'highpass';
//         highPassNode.frequency.value = 120;
//         highPassNode.Q.value = 0.7;

//         micSink = audioContext.createGain();
//         micSink.gain.value = 0;
//         micSource.connect(highPassNode);
//         highPassNode.connect(micNode);
//         micNode.connect(micSink);
//         micSink.connect(audioContext.destination);
//     }

//     function stopMicrophoneCapture() {
//         clearTimeout(drainTimer);
//         drainTimer = null;
//         if (micSource) { micSource.disconnect(); micSource = null; }
//         if (highPassNode) { highPassNode.disconnect(); highPassNode = null; }
//         if (micNode) { micNode.port.onmessage = null; micNode.disconnect(); micNode = null; }
//         if (micSink) { micSink.disconnect(); micSink = null; }
//         if (mediaStream) { mediaStream.getTracks().forEach(function (t) { t.stop(); }); mediaStream = null; }
//     }

//     function stopMicrophone() {
//         stopMicrophoneCapture();
//         if (audioContext) {
//             var context = audioContext;
//             audioContext = null;
//             context.close().catch(function () { });
//         }
//         speakerGainNode = null;
//     }

//     // =========================================================
//     // BACKEND CONNECTION
//     // =========================================================
//     async function connectToAvatarBackend() {
//         var generation = ++callGeneration;
//         serverEnding = false;
//         sessionReady = false;
//         lastStatus = null;
//         try {
//             // Mic startup and (language -> token) run in parallel
//             var results = await Promise.all([
//                 startMicrophone(),
//                 languageReady.then(fetchToken)
//             ]);
//             if (generation !== callGeneration) {
//                 stopMicrophone();
//                 return;
//             }
//             setCallStatus('ringing');

//             var token = results[1];
//             if (!token) throw new Error('No token - cannot open /video-assistant.');
//             if (!VIDEO_WS_URL) throw new Error('VIDEO_AI_CONFIG.wsEndpoint not set');

//             var socket = new WebSocket(VIDEO_WS_URL + '?token=' + encodeURIComponent(token));
//             socket.binaryType = 'arraybuffer';
//             ws = socket;

//             socket.onopen = function () {
//                 if (ws !== socket) return;
//                 goConnected();
//             };

//             socket.onmessage = function (event) {
//                 if (ws !== socket || serverEnding) return;

//                 if (event.data instanceof ArrayBuffer) {
//                     sessionReady = true;
//                     setCallStatus('speaking');
//                     playPCM16(event.data);
//                     return;
//                 }

//                 var msg;
//                 try { msg = JSON.parse(event.data); } catch (e) { return; }

//                 switch (msg.type) {
//                     case 'ready':
//                     case 'session.ready':
//                     case 'session.created':
//                     case 'session.updated':
//                         sessionReady = true;
//                         setCallStatus('listening');
//                         break;

//                     case 'interrupt':
//                     case 'speech_started':
//                     case 'input_audio_buffer.speech_started':
//                         flushPlayback();
//                         setCallStatus('listening');
//                         break;

//                     case 'user_speaking':
//                         if (msg.speaking) setCallStatus('listening');
//                         break;

//                     case 'agent_speaking':
//                         if (msg.speaking) setCallStatus('speaking');
//                         break;

//                     case 'transcript':
//                         if (lastStatus !== 'speaking') setCallStatus('thinking');
//                         break;

//                     case 'transcript_delta':
//                     case 'transcript_done':
//                     case 'ping':
//                     case 'pong':
//                     case 'response.audio_transcript.delta':
//                     case 'response.audio_transcript.done':
//                         break;

//                     case 'video.play':
//                         if (msg.videoUrl && window.openVideoOverlay) {
//                             window.openVideoOverlay(msg.videoUrl, msg.requestId || '');
//                         }
//                         break;

//                     case 'video.stop':
//                         if (window.closeVideoOverlay) window.closeVideoOverlay();
//                         break;

//                     case 'call_ended': {
//                         serverEnding = true;
//                         sessionReady = false;
//                         stopMicrophoneCapture();
//                         var remainingMs = audioContext
//                             ? Math.max(0, (nextPlayTime - audioContext.currentTime) * 1000)
//                             : 0;
//                         ws = null;
//                         socket.onopen = null;
//                         socket.onmessage = null;
//                         socket.onclose = null;
//                         socket.onerror = null;
//                         try { socket.close(1000, 'call ended'); } catch (e) { }
//                         endingTimer = setTimeout(function () {
//                             endingTimer = null;
//                             endChat('server');
//                         }, remainingMs + 300);
//                         break;
//                     }

//                     default:
//                         break;
//                 }
//             };

//             socket.onclose = function (evt) {
//                 if (ws !== socket) return;
//                 var state = body.getAttribute('data-state');
//                 if (serverEnding) return;
//                 if (state === 'ended') return;
//                 stopMicrophone();
//                 if (state === 'connected' || state === 'connecting') {
//                     endChat('socket-closed-' + (evt && evt.code));
//                 }
//             };

//             socket.onerror = function () {
//                 if (ws !== socket) return;
//                 stopMicrophone();
//                 endChat('socket-error');
//             };
//         } catch (err) {
//             if (generation !== callGeneration) return;
//             console.error('[VideoAI] Could not start call:', err);
//             stopMicrophone();
//             endChat('exception');
//         }
//     }

//     function goConnected() {
//         timeLeft = SESSION_SECONDS;
//         renderTimer();
//         setState('connected');
//         setCallStatus('connecting');
//         setTimeout(function () {
//             setCallStatus('connected');
//             setTimeout(function () { setCallStatus('listening'); }, 700);
//         }, 700);
//         startCountdown();
//     }

//     function startCountdown() {
//         clearInterval(countdownTimer);
//         countdownTimer = setInterval(function () {
//             timeLeft -= 1;
//             renderTimer();
//             if (timeLeft <= 0) endChat('timeout');
//         }, 1000);
//     }

//     function notifyCallEnded(reason) {
//         // Page is being left: do not pop up anything
//         if (window.__noPopups) return;

//         try {
//             window.dispatchEvent(new CustomEvent('video-ai:call-ended', {
//                 detail: { bedId: widgetUserId, reason: reason || 'unknown' }
//             }));
//         } catch (e) { }

//         if (typeof window.flushPendingPopups === 'function') {
//             try { window.flushPendingPopups(); } catch (e) { }
//         }
//     }

//     var STATUS_LABELS = {
//         dialing: 'Connecting voice / audio...',
//         ringing: 'Connecting...',
//         connecting: 'Connecting...',
//         connected: 'Connected...',
//         listening: 'Listening...',
//         thinking: 'Thinking...',
//         speaking: 'Speaking...'
//     };

//     // Called for every audio packet, so it must be cheap: cached nodes + no-op when unchanged
//     function setCallStatus(status) {
//         if (status === lastStatus) return;
//         callLayerEl = callLayerEl || document.getElementById('callLayer');
//         callStatusEl = callStatusEl || document.getElementById('callStatus');
//         callTitleEl = callTitleEl || document.getElementById('callTitle');
//         if (!callLayerEl || !callStatusEl) return;

//         lastStatus = status;
//         callLayerEl.setAttribute('data-status', status);
//         callStatusEl.textContent = STATUS_LABELS[status] || 'Listening...';
//         if (callTitleEl) {
//             callTitleEl.textContent = (status === 'dialing' || status === 'ringing')
//                 ? 'Dial50 Video Assistant'
//                 : 'Dial50 Demo Hospital';
//         }
//     }

//     function endChat(reason) {
//         callGeneration++;
//         clearTimeout(endingTimer);
//         endingTimer = null;
//         clearInterval(countdownTimer);
//         clearTimeout(drainTimer);
//         micMuted = false;
//         speakerMuted = false;
//         sessionReady = false;
//         lastStatus = null;
//         if (micBtn) micBtn.classList.remove('muted');
//         if (speakerBtn) speakerBtn.classList.remove('muted');
//         if (speakerGainNode) speakerGainNode.gain.value = 1;
//         flushPlayback();
//         stopMicrophone();

//         var callEndedNotified = false;
//         var notifyOnce = function () {
//             if (callEndedNotified) return;
//             callEndedNotified = true;
//             notifyCallEnded(reason);
//         };

//         if (ws) {
//             var old = ws;
//             ws = null;

//             if (old.readyState === WebSocket.CLOSED) {
//                 notifyOnce();
//             } else {
//                 old.addEventListener('close', notifyOnce, { once: true });
//                 // Fallback: never lose the post-call popups if 'close' is slow or never arrives
//                 setTimeout(notifyOnce, END_NOTIFY_FALLBACK_MS);
//                 try { old.close(); } catch (e) { notifyOnce(); }
//             }
//         } else {
//             notifyOnce();
//         }
//         setState('ended');

//         if (window.Dial50VAD && typeof window.Dial50VAD.reset === 'function') {
//             try { window.Dial50VAD.reset(); } catch (e) { }
//         }
//     }

//     // =========================================================
//     // EVENTS
//     // =========================================================
//     if (endChatBtn) endChatBtn.addEventListener('click', function () { endChat('user'); });
//     if (homeBtn) homeBtn.addEventListener('click', function () { setState('idle'); });
//     if (micBtn) {
//         micBtn.addEventListener('click', function () {
//             micMuted = !micMuted;
//             micBtn.classList.toggle('muted', micMuted);
//             if (micNode) micNode.port.postMessage({ muted: micMuted });
//         });
//     }
//     if (speakerBtn) speakerBtn.addEventListener('click', toggleSpeaker);

//     function startCallFromIdle() {
//         var state = body.getAttribute('data-state');
//         if (state === 'connecting' || state === 'connected') return;
//         setState('connecting');
//         setCallStatus('dialing');
//         connectToAvatarBackend();
//     }

//     // This script is loaded at the end of the page, so the button already exists
//     if (idleBtn) idleBtn.addEventListener('click', startCallFromIdle);

//     if (endedMicBtn) {
//         endedMicBtn.addEventListener('click', function () {
//             if (idleBtn) idleBtn.click();
//         });
//     }

//     // Single pagehide handler (the page no longer has its own)
//     window.addEventListener('pagehide', function () {
//         var st = body.getAttribute('data-state');
//         if (st === 'connecting' || st === 'connected') {
//             window.__noPopups = true;
//             try { endChat('pagehide'); } catch (e) { }
//         }
//     });

//     // =========================================================
//     // EXPORTS
//     // =========================================================
//     window.setState = setState;
//     window.setCallStatus = setCallStatus;
//     window.connectToAvatarBackend = connectToAvatarBackend;
//     window.endChat = endChat;
//     window.toggleSpeaker = toggleSpeaker;
//     window.flushPlayback = flushPlayback;
//     window.isAssistantPlaying = isAssistantPlaying;
//     window.getCallStatus = function () { return lastStatus; };
//     try {
//         Object.defineProperty(window, 'micMuted', { get: function () { return micMuted; }, configurable: true });
//     } catch (e) {
//         window.videoAiMicMuted = function () { return micMuted; };
//     }
// })();

////claude code///////

(function () {
    'use strict';

    // If the voice script.js is also loaded on this page, every click starts TWO calls
    // (two mics, two AudioContexts, two sockets). Make that visible instead of silent.
    if (typeof window.connectToAvatarBackend === 'function') {
        console.error('[VideoAI] window.connectToAvatarBackend already exists - another assistant script (voice script.js?) is loaded on this page.');
    }

    // =========================================================
    // CONFIG
    // =========================================================
    var VIDEO_CFG = window.VIDEO_AI_CONFIG || {};
    var CFG = window.APP_CONFIG || {};

    var SESSION_SECONDS = Number(VIDEO_CFG.SESSION_SECONDS || CFG.SESSION_SECONDS) || 180;
    var SAMPLE_RATE = 24000;
    var MIC_FRAME_SAMPLES = 480;
    var MAX_WS_BUFFER_BYTES = 65536;
    var END_NOTIFY_FALLBACK_MS = 800;

    var BACKEND_HTTP = VIDEO_CFG.BACKEND_HTTP || CFG.BACKEND_HTTP || '';
    var BACKEND_WS = VIDEO_CFG.BACKEND_WS
        || CFG.BACKEND_WS
        || (BACKEND_HTTP ? BACKEND_HTTP.replace(/^http/i, 'ws') : '');
    var PROFILE_API_URL = VIDEO_CFG.PROFILE_API_URL || CFG.PROFILE_API_URL || '';

    var VIDEO_WS_URL = VIDEO_CFG.wsEndpoint
        || (BACKEND_WS ? BACKEND_WS.replace(/\/$/, '') + '/video-assistant' : '');

    var REGION_DIALECT = {
        US: 'United States',
        GB: 'United Kingdom',
        IN: 'India',
        SA: 'Saudi Arabia',
        AE: 'UAE'
    };

    function DecryptAESZ(cipherText) {
        try {
            var key = CryptoJS.enc.Utf8.parse(CryptoKey);
            var iv = CryptoJS.lib.WordArray.create([0, 0, 0, 0]);

            var decrypted = CryptoJS.AES.decrypt(cipherText, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return decrypted.toString(CryptoJS.enc.Utf8) || "Invalid Input";
        } catch (ex) {
            console.error("AES decryption error:", ex);
            return "Invalid Input";
        }
    }


    var widgetParams = new URLSearchParams(window.location.search);
    function getWidgetUserId() {
        if (window.BedContext) {
            var b = window.BedContext.get();
            if (b && b.bedId) return b.bedId;
        }
        return sessionStorage.getItem('realBedId')
            || sessionStorage.getItem('BedId')
            || widgetParams.get('userId');
    }


    var body = document.body;
    var countdownTimer = null;
    var timeLeft = SESSION_SECONDS;

    var idleBtn = document.getElementById('idleBtn');
    var endChatBtn = document.getElementById('endChatBtn');
    var micBtn = document.getElementById('micBtn');
    var speakerBtn = document.getElementById('speakerBtn');
    var timerEl = document.getElementById('sessionTimer');
    var homeBtn = document.getElementById('homeBtn');
    var endedMicBtn = document.getElementById('endedMicBtn');

    var callLayerEl = null;
    var callStatusEl = null;
    var callTitleEl = null;
    var lastStatus = null;

    function setState(state) {
        if (body.getAttribute('data-state') !== state) body.setAttribute('data-state', state);
    }
    function formatTime(s) {
        var m = Math.floor(s / 60);
        return m + ':' + (s % 60).toString().padStart(2, '0');
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

    var REGION_LANGUAGE_URL = '/data/region-language.json';
    var FALLBACK_COUNTRY_CODE = 'IN';
    var currentLanguage = null;
    var currentRegionCode = null;

    function selectLanguage(lang) { if (lang) currentLanguage = lang; }

    async function loadRegionLanguages() {
        var data;
        try {
            var res = await fetch(REGION_LANGUAGE_URL);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            data = await res.json();
        } catch (err) {
            data = {
                regions: [{
                    countryCode: 'US',
                    defaultLanguage: 'en-US',
                    languages: [{ code: 'en-US', name: 'English' }]
                }]
            };
        }

        var regionParam = (widgetParams.get('region') || '').toUpperCase();
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
        console.warn('[VideoAI] Language setup failed:', err);
    });

    async function fetchToken() {
        var widgetUserId = getWidgetUserId();
        if (!widgetUserId) return null;
        var tokenUrl = VIDEO_CFG.tokenUrl
            || (BACKEND_HTTP ? BACKEND_HTTP.replace(/\/$/, '') + '/token' : null);
        if (!tokenUrl) return null;

        var voice = widgetParams.get('voice') || CFG.VOICE;
        var speedParam = widgetParams.get('speed');
        var speed = speedParam !== null ? parseFloat(speedParam) : CFG.SPEED;
        var dialect = widgetParams.get('dialect') || CFG.DIALECT || REGION_DIALECT[currentRegionCode];

        var payload = { user_id: widgetUserId, scope: 'video-ai' };
        if (currentLanguage) payload.language = currentLanguage.name;
        if (dialect) payload.dialect = dialect;
        if (voice) payload.voice = voice;
        if (speed !== undefined && speed !== null && !isNaN(speed)) payload.speed = speed;

        try {
            var res = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                console.error('[VideoAI] /token returned ' + res.status);
                return null;
            }
            var data = await res.json();
            return data.access_token || null;
        } catch (err) {
            console.error('[VideoAI] /token unreachable:', err.message);
            return null;
        }
    }

    // =========================================================
    // AUDIO STATE
    // =========================================================
    var ws = null;
    var audioContext = null;
    var mediaStream = null;
    var micSource = null;
    var micNode = null;
    var micSink = null;
    var highPassNode = null;
    var micMuted = false;
    var speakerMuted = false;
    var speakerGainNode = null;
    var serverEnding = false;
    var callInProgress = false;   // blocks a second start while one is running
    var callGeneration = 0;
    var endingTimer = null;

    var nextPlayTime = 0;
    var activeSources = [];
    var drainTimer = null;

    // =========================================================
    // LOCAL VAD (identical logic and defaults to the voice assistant)
    // =========================================================
    var vadCfg = VIDEO_CFG.VAD || CFG.VAD || {};

    class LocalVoiceActivityDetector {
        constructor(options) {
            options = options || {};
            this.sampleRate = options.sampleRate || 24000;
            this.energyThreshold = typeof options.threshold === 'number' ? options.threshold : 0.01;
            this.endThreshold = typeof options.speechEndThreshold === 'number' ? options.speechEndThreshold : 0.0072;
            this.duckingThreshold = typeof options.duckingThreshold === 'number' ? options.duckingThreshold : 0.065;
            this.duckingEndThreshold = this.duckingThreshold * 0.72;
            this.silenceDurationMs = typeof options.silenceDurationMs === 'number' ? options.silenceDurationMs : 600;
            this.speechStartDurationMs = typeof options.speechStartDurationMs === 'number' ? options.speechStartDurationMs : 180;
            this.bargeInStartDurationMs = typeof options.bargeInStartDurationMs === 'number' ? options.bargeInStartDurationMs : 220;
            this.isSpeaking = false;
            this.silenceTimeMs = 0;
            this.speechTimeMs = 0;
            this.lastRms = 0;
        }

        calculateRMS(samples) {
            if (!samples || !samples.length) return 0;
            var sumSquares = 0;
            var count = 0;
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
                        if (typeof onSpeechStart === 'function') onSpeechStart(rms);
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
                    if (typeof onSpeechEnd === 'function') onSpeechEnd(rms);
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
        threshold: typeof vadCfg.threshold === 'number' ? vadCfg.threshold : 0.01,
        speechEndThreshold: typeof vadCfg.speechEndThreshold === 'number' ? vadCfg.speechEndThreshold : 0.0072,
        duckingThreshold: typeof vadCfg.duckingThreshold === 'number' ? vadCfg.duckingThreshold : 0.065,
        silenceDurationMs: typeof vadCfg.silenceDurationMs === 'number' ? vadCfg.silenceDurationMs : 600,
        speechStartDurationMs: typeof vadCfg.speechStartDurationMs === 'number' ? vadCfg.speechStartDurationMs : 180,
        bargeInStartDurationMs: typeof vadCfg.bargeInStartDurationMs === 'number' ? vadCfg.bargeInStartDurationMs : 220
    });
    var localBargeIn = vadCfg.localBargeIn === true;

    function isAssistantPlaying() {
        return !!(audioContext && activeSources.length > 0 && audioContext.currentTime < nextPlayTime);
    }

    function processLocalVADFrame(buffer) {
        if (micMuted || !buffer) return;
        var samples;
        if (buffer instanceof Int16Array) samples = buffer;
        else if (buffer instanceof ArrayBuffer && buffer.byteLength >= 2) {
            samples = new Int16Array(buffer, 0, buffer.byteLength >> 1);
        } else return;
        localVad.process(samples, SAMPLE_RATE, onLocalSpeechStart, onLocalSpeechEnd, isAssistantPlaying());
    }

    function onLocalSpeechStart() {
        // Off by default: the server VAD stays responsible for real barge-in.
        if (localBargeIn) flushPlayback();
        if (lastStatus === 'speaking' || lastStatus === 'thinking') setCallStatus('listening');
    }

    function onLocalSpeechEnd() {
        if (lastStatus === 'listening') setCallStatus('thinking');
    }

    // =========================================================
    // MIC WORKLET (same as the voice assistant)
    // =========================================================
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

    // =========================================================
    // PLAYBACK
    // =========================================================
    function playPCM16(buffer) {
        if (!audioContext || !buffer || buffer.byteLength < 2) return;

        var int16Array = new Int16Array(buffer, 0, buffer.byteLength >> 1);
        var audioBuffer = audioContext.createBuffer(1, int16Array.length, SAMPLE_RATE);
        var out = audioBuffer.getChannelData(0);
        for (var i = 0; i < int16Array.length; i++) out[i] = int16Array[i] / 32768.0;

        var source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(speakerGainNode);

        var currentTime = audioContext.currentTime;
        if (nextPlayTime < currentTime) nextPlayTime = currentTime;
        source.start(nextPlayTime);
        nextPlayTime += audioBuffer.duration;

        activeSources.push(source);
        source.onended = function () {
            source.onended = null;
            try { source.disconnect(); } catch (e) { }
            var idx = activeSources.indexOf(source);
            if (idx !== -1) activeSources.splice(idx, 1);
            scheduleDrainCheck();
        };
    }

    function scheduleDrainCheck() {
        clearTimeout(drainTimer);
        drainTimer = setTimeout(function () {
            if (activeSources.length === 0 && audioContext &&
                audioContext.currentTime >= nextPlayTime - 0.02) {
                setCallStatus('listening');
            }
        }, 200);
    }

    function toggleSpeaker() {
        speakerMuted = !speakerMuted;
        if (speakerGainNode) speakerGainNode.gain.value = speakerMuted ? 0 : 1;
        if (speakerBtn) {
            speakerBtn.classList.toggle('muted', speakerMuted);
            speakerBtn.setAttribute('aria-label', speakerMuted ? 'Turn speaker on' : 'Mute speaker');
        }
    }

    function flushPlayback() {
        clearTimeout(drainTimer);
        activeSources.forEach(function (s) {
            s.onended = null;
            try { s.stop(); } catch (e) { }
            try { s.disconnect(); } catch (e) { }
        });
        activeSources = [];
        nextPlayTime = audioContext ? audioContext.currentTime : 0;
    }

    // =========================================================
    // MICROPHONE
    // =========================================================
    async function startMicrophone() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
        if (audioContext.state === 'suspended') await audioContext.resume();

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

        var blobUrl = URL.createObjectURL(new Blob([MIC_WORKLET_SOURCE], { type: 'application/javascript' }));
        try {
            await audioContext.audioWorklet.addModule(blobUrl);
        } finally {
            URL.revokeObjectURL(blobUrl);
        }

        micSource = audioContext.createMediaStreamSource(mediaStream);
        micNode = new AudioWorkletNode(audioContext, 'mic-processor', {
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
            var sock = ws;
            if (!sock || sock.readyState !== WebSocket.OPEN || serverEnding) return;
            processLocalVADFrame(e.data);
            // Never let the socket send queue grow without limit
            if (sock.bufferedAmount < MAX_WS_BUFFER_BYTES) sock.send(e.data);
        };

        highPassNode = audioContext.createBiquadFilter();
        highPassNode.type = 'highpass';
        highPassNode.frequency.value = 120;
        highPassNode.Q.value = 0.7;

        micSink = audioContext.createGain();
        micSink.gain.value = 0;
        micSource.connect(highPassNode);
        highPassNode.connect(micNode);
        micNode.connect(micSink);
        micSink.connect(audioContext.destination);
    }

    function stopMicrophoneCapture() {
        if (micSource) { try { micSource.disconnect(); } catch (e) { } micSource = null; }
        if (highPassNode) { try { highPassNode.disconnect(); } catch (e) { } highPassNode = null; }
        if (micNode) { micNode.port.onmessage = null; try { micNode.disconnect(); } catch (e) { } micNode = null; }
        if (micSink) { try { micSink.disconnect(); } catch (e) { } micSink = null; }
        if (mediaStream) { mediaStream.getTracks().forEach(function (t) { t.stop(); }); mediaStream = null; }
    }

    function stopMicrophone() {
        if (localVad) localVad.reset();
        stopMicrophoneCapture();
        if (audioContext) {
            var context = audioContext;
            audioContext = null;
            context.close().catch(function () { });
        }
        speakerGainNode = null;
    }

    // =========================================================
    // BACKEND CONNECTION
    // =========================================================
    async function connectToAvatarBackend() {
        // A second start while one is running would overwrite audioContext / mediaStream
        // and leak the first mic + AudioContext. Ignore it.
        if (callInProgress) return;
        callInProgress = true;

        var generation = ++callGeneration;
        serverEnding = false;
        lastStatus = null;

        try {
            // Mic startup and (language -> token) run in parallel
            var results = await Promise.all([
                startMicrophone(),
                languageReady.then(fetchToken)
            ]);

            if (generation !== callGeneration) {
                if (!callInProgress) stopMicrophone();
                return;
            }
            setCallStatus('ringing');

            var token = results[1];
            if (!token) throw new Error('No token - cannot open /video-assistant.');
            if (!VIDEO_WS_URL) throw new Error('VIDEO_AI_CONFIG.wsEndpoint not set');

            var socket = new WebSocket(VIDEO_WS_URL + '?token=' + encodeURIComponent(token));
            socket.binaryType = 'arraybuffer';
            ws = socket;

            socket.onopen = function () {
                if (ws === socket) goConnected();
            };

            socket.onmessage = function (event) {
                if (ws !== socket || serverEnding) return;

                if (event.data instanceof ArrayBuffer) {
                    setCallStatus('speaking');
                    playPCM16(event.data);
                    return;
                }

                var msg;
                try { msg = JSON.parse(event.data); } catch (e) { return; }

                switch (msg.type) {
                    case 'interrupt':
                    case 'speech_started':
                    case 'input_audio_buffer.speech_started':
                        flushPlayback();
                        setCallStatus('listening');
                        break;

                    case 'user_speaking':
                        if (msg.speaking) setCallStatus('listening');
                        break;

                    case 'agent_speaking':
                        if (msg.speaking) setCallStatus('speaking');
                        break;

                    case 'transcript':
                        if (lastStatus !== 'speaking') setCallStatus('thinking');
                        break;

                    case 'video.play':
                        if (msg.videoUrl && window.openVideoOverlay) {
                            window.openVideoOverlay(msg.videoUrl, msg.categoryName || '');
                        }
                        break;

                    case 'video.stop':
                        if (window.closeVideoOverlay) window.closeVideoOverlay();
                        break;

                    case 'call_ended': {
                        serverEnding = true;
                        stopMicrophoneCapture();
                        var remainingMs = audioContext
                            ? Math.max(0, (nextPlayTime - audioContext.currentTime) * 1000)
                            : 0;
                        ws = null;
                        socket.onopen = null;
                        socket.onmessage = null;
                        socket.onclose = null;
                        socket.onerror = null;
                        try { socket.close(1000, 'call ended'); } catch (e) { }
                        endingTimer = setTimeout(function () {
                            endingTimer = null;
                            endChat('server');
                        }, remainingMs + 300);
                        break;
                    }

                    default:
                        // transcript_delta/done, ping/pong, session.*, ready, response.audio_transcript.*
                        break;
                }
            };

            socket.onclose = function (evt) {
                if (ws !== socket) return;
                var state = body.getAttribute('data-state');
                if (serverEnding || state === 'ended') return;
                if (state === 'connected' || state === 'connecting') {
                    endChat('socket-closed-' + (evt && evt.code));
                }
            };

            socket.onerror = function () {
                if (ws !== socket) return;
                endChat('socket-error');
            };
        } catch (err) {
            if (generation !== callGeneration) return;
            console.error('[VideoAI] Could not start call:', err);
            endChat('exception');
        }
    }

    function goConnected() {
        timeLeft = SESSION_SECONDS;
        renderTimer();
        setState('connected');
        setCallStatus('connecting');
        setTimeout(function () {
            setCallStatus('connected');
            setTimeout(function () { setCallStatus('listening'); }, 700);
        }, 700);
        startCountdown();
    }

    function startCountdown() {
        clearInterval(countdownTimer);
        countdownTimer = setInterval(function () {
            timeLeft -= 1;
            renderTimer();
            if (timeLeft <= 0) endChat('timeout');
        }, 1000);
    }

    function notifyCallEnded(reason) {
        // Page is being left: do not pop anything up
        if (window.__noPopups) return;
        try {
            window.dispatchEvent(new CustomEvent('video-ai:call-ended', {
                detail: { bedId: widgetUserId, reason: reason || 'unknown' }
            }));
        } catch (e) { }
        if (typeof window.flushPendingPopups === 'function') {
            try { window.flushPendingPopups(); } catch (e) { }
        }
    }

    var STATUS_LABELS = {
        dialing: 'Connecting voice / audio...',
        ringing: 'Connecting...',
        connecting: 'Connecting...',
        connected: 'Connected...',
        listening: 'Listening...',
        thinking: 'Thinking...',
        speaking: 'Speaking...'
    };

    // Runs for every audio packet: cached nodes, and a no-op when nothing changed
    function setCallStatus(status) {
        if (status === lastStatus) return;
        callLayerEl = callLayerEl || document.getElementById('callLayer');
        callStatusEl = callStatusEl || document.getElementById('callStatus');
        callTitleEl = callTitleEl || document.getElementById('callTitle');
        if (!callLayerEl || !callStatusEl) return;

        lastStatus = status;
        callLayerEl.setAttribute('data-status', status);
        callStatusEl.textContent = STATUS_LABELS[status] || 'Listening...';
        if (callTitleEl) {
            callTitleEl.textContent = (status === 'dialing' || status === 'ringing')
                ? 'Dial50 Video Assistant'
                : 'Dial50 Demo Hospital';
        }
    }

    function endChat(reason) {
        callGeneration++;
        callInProgress = false;
        clearTimeout(endingTimer);
        endingTimer = null;
        clearInterval(countdownTimer);
        clearTimeout(drainTimer);

        micMuted = false;
        speakerMuted = false;
        lastStatus = null;
        if (micBtn) micBtn.classList.remove('muted');
        if (speakerBtn) speakerBtn.classList.remove('muted');
        if (speakerGainNode) speakerGainNode.gain.value = 1;

        flushPlayback();
        stopMicrophone();

        var callEndedNotified = false;
        var notifyOnce = function () {
            if (callEndedNotified) return;
            callEndedNotified = true;
            notifyCallEnded(reason);
        };

        if (ws) {
            var old = ws;
            ws = null;
            if (old.readyState === WebSocket.CLOSED) {
                notifyOnce();
            } else {
                old.addEventListener('close', notifyOnce, { once: true });
                // Never lose the post-call popups if 'close' is slow or never arrives
                setTimeout(notifyOnce, END_NOTIFY_FALLBACK_MS);
                try { old.close(); } catch (e) { notifyOnce(); }
            }
        } else {
            notifyOnce();
        }

        setState('ended');
    }

    // =========================================================
    // EVENTS
    // =========================================================
    if (endChatBtn) endChatBtn.addEventListener('click', function () { endChat('user'); });
    if (homeBtn) homeBtn.addEventListener('click', function () { setState('idle'); });

    if (micBtn) {
        micBtn.addEventListener('click', function () {
            micMuted = !micMuted;
            micBtn.classList.toggle('muted', micMuted);
            if (micNode) micNode.port.postMessage({ muted: micMuted });
        });
    }

    if (speakerBtn) speakerBtn.addEventListener('click', toggleSpeaker);

    function startCallFromIdle() {
        var state = body.getAttribute('data-state');
        if (state === 'connecting' || state === 'connected') return;
        setState('connecting');
        setCallStatus('dialing');
        connectToAvatarBackend();
    }

    // This script is loaded at the end of the page, so the buttons already exist
    if (idleBtn) idleBtn.addEventListener('click', startCallFromIdle);

    if (endedMicBtn) {
        endedMicBtn.addEventListener('click', function () {
            if (idleBtn) idleBtn.click();
        });
    }

    // Leaving the page mid-call: end it quietly (no popups)
    window.addEventListener('pagehide', function () {
        var st = body.getAttribute('data-state');
        if (st === 'connecting' || st === 'connected') {
            window.__noPopups = true;
            try { endChat('pagehide'); } catch (e) { }
        }
    });

    // =========================================================
    // EXPORTS
    // =========================================================
    window.setState = setState;
    window.setCallStatus = setCallStatus;
    window.connectToAvatarBackend = connectToAvatarBackend;
    window.endChat = endChat;
    window.toggleSpeaker = toggleSpeaker;
    window.flushPlayback = flushPlayback;
    window.isAssistantPlaying = isAssistantPlaying;
    window.getCallStatus = function () { return lastStatus; };
    window.Dial50VAD = {
        Detector: LocalVoiceActivityDetector,
        instance: localVad,
        processFrame: processLocalVADFrame,
        reset: function () { localVad.reset(); },
        getState: function () {
            return { isSpeaking: localVad.isSpeaking, lastRms: localVad.lastRms, threshold: localVad.energyThreshold };
        }
    };

    // After every script on the page has run: did another script replace our entry point?
    window.addEventListener('load', function () {
        if (window.connectToAvatarBackend !== connectToAvatarBackend) {
            console.error('[VideoAI] window.connectToAvatarBackend was replaced by another script after video-script.js loaded. The wrong assistant will start.');
        }
    });
})();