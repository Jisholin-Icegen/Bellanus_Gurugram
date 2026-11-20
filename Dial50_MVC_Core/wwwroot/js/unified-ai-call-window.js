(function () {
    "use strict";

    var ownerParameter = "UnifiedVoiceCallOwner";
    var pageParameters = new URLSearchParams(window.location.search);
    var isOwner = pageParameters.get(ownerParameter) === "1";
    var isUnifiedFrame = pageParameters.get("UnifiedAI") === "1" || pageParameters.get("Unified") === "1";
    var bedContext = window.BedContext && typeof window.BedContext.get === "function"
        ? window.BedContext.get() || {}
        : {};
    var bedInfo = bedContext.bedInfo || pageParameters.get("BedInfo") || "";
    var tenantId = bedContext.tenantId || pageParameters.get("XTenantID") || "";
    var identity = window.location.origin + "|" + tenantId + "|" + bedInfo;
    var windowName = "Dial50UnifiedVoiceCall_" + hash(identity);
    var channel = typeof window.BroadcastChannel === "function"
        ? new window.BroadcastChannel("dial50-unified-voice-call-" + hash(identity))
        : null;
    var callBar = document.getElementById("unifiedVoiceCallBar");
    var callBarStatus = document.getElementById("unifiedVoiceCallBarStatus");
    var notice = document.getElementById("unifiedVoiceCallNotice");
    var noticeTimer = null;

    if (isOwner) {
        window.__dial50UnifiedVoiceCallOwner = true;
    }

    function hash(value) {
        var result = 2166136261;
        for (var index = 0; index < value.length; index++) {
            result ^= value.charCodeAt(index);
            result = Math.imul(result, 16777619);
        }
        return (result >>> 0).toString(36);
    }

    function callState() {
        var state = document.body && document.body.getAttribute("data-state") || "idle";
        var active = state === "connecting" || state === "connected";
        var status = document.getElementById("callStatus");
        return {
            type: "state",
            active: active,
            state: state,
            status: status && status.textContent.trim() || (active ? "Connecting..." : "Call ended.")
        };
    }

    function publishCallState() {
        if (isOwner && channel) channel.postMessage(callState());
    }

    function showNotice(message) {
        if (!notice) return;
        notice.textContent = message;
        notice.hidden = false;
        window.clearTimeout(noticeTimer);
        noticeTimer = window.setTimeout(function () {
            notice.hidden = true;
        }, 7000);
    }

    function normalizeOwnerUrl(startUrl) {
        var target = new URL(startUrl, window.location.href);
        if (target.origin !== window.location.origin) {
            console.error("Unified AI call window must use the current app origin.");
            return null;
        }

        target.searchParams.delete("Unified");
        target.searchParams.delete("UnifiedAI");
        if (pageParameters.get("UnifiedAITest") === "1") {
            target.searchParams.set("UnifiedAITest", "1");
        }
        target.searchParams.set(ownerParameter, "1");
        target.searchParams.set("autoStartCall", "1");
        return target.href;
    }

    function openCallWindow(startUrl) {
        if (!bedInfo) {
            showNotice("The patient session is unavailable, so the AI call could not start.");
            return false;
        }

        var ownerUrl = normalizeOwnerUrl(startUrl);
        if (!ownerUrl) {
            showNotice("The AI call window could not open on this app page.");
            return false;
        }

        var popup = window.open("", windowName,
            "popup=yes,width=420,height=700,resizable=yes,scrollbars=no");
        if (!popup) {
            showNotice("Allow pop-ups for this site to keep the AI call open while you navigate.");
            return false;
        }

        var existingOwner = false;
        try {
            existingOwner = popup.__dial50UnifiedVoiceCallOwner === true
                || new URL(popup.location.href).searchParams.get(ownerParameter) === "1";
        } catch (error) {
            existingOwner = false;
        }

        if (existingOwner) {
            popup.focus();
            if (channel) channel.postMessage({ type: "start" });
            return true;
        }

        popup.location.replace(ownerUrl);
        popup.focus();
        return true;
    }

    function homeUrl() {
        var target;
        if (window.BedContext && typeof window.BedContext.url === "function") {
            target = new URL(window.BedContext.url("Home"), window.location.href);
        } else {
            target = new URL("/Home", window.location.href);
            if (bedInfo) target.searchParams.set("BedInfo", bedInfo);
            if (tenantId) target.searchParams.set("XTenantID", tenantId);
            if (bedContext.region || pageParameters.get("region")) {
                target.searchParams.set("region", bedContext.region || pageParameters.get("region"));
            }
        }

        var testMode = pageParameters.get("UnifiedAITest");
        if (testMode === "1") target.searchParams.set("UnifiedAITest", "1");
        return target.href;
    }

    function isHomePath(pathname) {
        return /^\/(?:Home(?:\/Index)?|)$/i.test(pathname);
    }

    function wrapBedContextNavigation() {
        var context = window.BedContext;
        if (!context || typeof context.go !== "function" || typeof context.url !== "function"
            || context.go.__dial50CallWindowWrapped) return;

        var originalGo = context.go;
        var wrappedGo = function (page, extra) {
            if (!isOwner && extra && String(extra.autoStartCall) === "1") {
                var target = new URL(context.url(page, extra), window.location.href);
                if (isHomePath(target.pathname)) {
                    openCallWindow(target.href);
                    return;
                }
            }
            return originalGo.apply(this, arguments);
        };
        wrappedGo.__dial50CallWindowWrapped = true;
        context.go = wrappedGo;
    }

    function updateCallBar(message) {
        if (!callBar || isOwner || isUnifiedFrame) return;
        callBar.hidden = !message.active;
        if (callBarStatus && message.active) {
            callBarStatus.textContent = message.status || "Call in progress";
        }
    }

    if (channel) {
        channel.addEventListener("message", function (event) {
            var message = event.data;
            if (!message || typeof message.type !== "string") return;

            if (isOwner) {
                if (message.type === "state-request") {
                    publishCallState();
                } else if (message.type === "focus") {
                    window.focus();
                } else if (message.type === "start") {
                    var state = document.body && document.body.getAttribute("data-state");
                    if (state !== "connecting" && state !== "connected") {
                        var startButton = document.getElementById("idleBtn");
                        if (startButton) startButton.click();
                    }
                    window.focus();
                } else if (message.type === "end") {
                    if (typeof window.endChat === "function") {
                        window.endChat();
                    } else {
                        console.error("Unified AI call owner cannot end the call because the voice client is unavailable.");
                    }
                }
                return;
            }

            if (message.type === "state") updateCallBar(message);
        });
    } else {
        console.error("BroadcastChannel is unavailable; cross-page call controls will not be synchronized.");
    }

    if (isOwner) {
        var body = document.body;
        var callStatus = document.getElementById("callStatus");
        var ownerObserver = new MutationObserver(publishCallState);
        if (body) ownerObserver.observe(body, { attributes: true, attributeFilter: ["data-state"] });
        if (callStatus) ownerObserver.observe(callStatus, {
            subtree: true,
            childList: true,
            characterData: true
        });

        publishCallState();
        window.addEventListener("pagehide", function () {
            if (channel) channel.postMessage({
                type: "state",
                active: false,
                state: "closed",
                status: "Call window closed."
            });
        });
        window.addEventListener("beforeunload", function (event) {
            var state = document.body && document.body.getAttribute("data-state");
            if (state !== "connecting" && state !== "connected") return;
            event.preventDefault();
            event.returnValue = "";
        });
    } else {
        wrapBedContextNavigation();
        if (isHomePath(window.location.pathname)) {
            document.addEventListener("click", function (event) {
                var target = event.target instanceof Element
                    ? event.target.closest("#idleBtn, #endedMicBtn")
                    : null;
                if (!target) return;

                event.preventDefault();
                event.stopImmediatePropagation();
                openCallWindow(homeUrl());
            }, true);
        }

        if (callBar && !isUnifiedFrame) {
            var focusButton = document.getElementById("unifiedVoiceCallBarFocus");
            var endButton = document.getElementById("unifiedVoiceCallBarEnd");
            if (focusButton && channel) {
                focusButton.addEventListener("click", function () {
                    channel.postMessage({ type: "focus" });
                });
            }
            if (endButton && channel) {
                endButton.addEventListener("click", function () {
                    channel.postMessage({ type: "end" });
                });
            }
        }

        if (channel) {
            var requestState = function () { channel.postMessage({ type: "state-request" }); };
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", requestState, { once: true });
            } else {
                requestState();
            }
        }
    }
})();
