(function () {
    const frameLayer = document.getElementById("unifiedAiModuleLayer");
    const frame = document.getElementById("unifiedAiModuleFrame");
    const callPopup = document.getElementById("unifiedAiCallPopup");
    const endButton = document.getElementById("unifiedAiEndButton");
    const chatButton = document.getElementById("unifiedAiChatButton");

    if (!frameLayer || !frame || !callPopup) return;

    const routes = {
        room_comfort: "/RoomComfort/Index",
        logistics: "/Logisitics/Index",
        video_request: "/MyDailyCare/Index",
        food_explore: "/FoodDining/FoodDining",
        food_order: "/FoodDining/FoodOrdering",
        feedback: "/OverAllFeedback/Index"
    };

    let frameReady = false;
    let pendingActions = [];
    let activeTarget = null;

    function isCallActive() {
        const state = document.body.getAttribute("data-state");
        return state === "connecting" || state === "connected";
    }

    function showChat() {
        frameLayer.classList.remove("is-open");
        callPopup.classList.remove("is-open");
    }

    function reportResult(action, success, result, error) {
        if (!action || !action.request_id) return;
        if (typeof window.sendVoiceAgentMessage !== "function") return;

        window.sendVoiceAgentMessage({
            type: "app_action_result",
            request_id: action.request_id,
            success: !!success,
            result: result || null,
            error: error || null
        });
    }

    function openModule(target, action) {
        const route = routes[target];
        if (!route) {
            reportResult(action, false, null, "Unsupported module.");
            return false;
        }

        frameLayer.classList.add("is-open");
        if (isCallActive()) callPopup.classList.add("is-open");

        pendingActions.forEach(function (pendingAction) {
            reportResult(pendingAction, false, null, "The module changed before this action could run.");
        });
        pendingActions = [];
        activeTarget = target;

        const targetUrl = new URL(route, window.location.origin);
        const bedContext = window.BedContext && window.BedContext.get
            ? window.BedContext.get()
            : {};
        const bedInfo = bedContext.bedInfo || new URLSearchParams(window.location.search).get("BedInfo");
        if (bedInfo) targetUrl.searchParams.set("BedInfo", bedInfo);
        targetUrl.searchParams.set("UnifiedAI", "1");

        if (action && action.action !== "navigate") pendingActions.push(action);

        frameReady = false;
        frame.src = targetUrl.toString();
        return true;
    }

    function dispatchToModule(target, action) {
        if (frameLayer.classList.contains("is-open") && activeTarget === target) {
            sendActionToFrame(action);
        } else {
            openModule(target, action);
        }
    }

    function sendActionToFrame(action) {
        if (!frame.contentWindow || !frameReady) {
            pendingActions.push(action);
            return;
        }

        frame.contentWindow.postMessage({
            type: "unified_ai_action",
            action: action
        }, window.location.origin);
    }

    function handleAction(action) {
        if (!action || typeof action !== "object" || typeof action.action !== "string") return;

        if (action.action === "video.play" || action.action === "video.stop") {
            dispatchToModule("video_request", action);
            return;
        }

        if (action.action === "food.intent") {
            const target = action.intent === "explore"
                ? "food_explore"
                : action.intent === "order"
                    ? "food_order"
                    : null;
            if (!target) {
                reportResult(action, false, null, "Food intent must be 'explore' or 'order'.");
                return;
            }
            const opened = openModule(target);
            if (opened) reportResult(action, true, { target: target });
            return;
        }

        if (action.action === "navigate") {
            const opened = openModule(action.target);
            if (opened) reportResult(action, true, { target: action.target });
            return;
        }

        if (action.action === "request.options" || action.action === "request.create") {
            if (action.module !== "room_comfort" && action.module !== "logistics") {
                reportResult(action, false, null, "Request module must be room_comfort or logistics.");
                return;
            }
            dispatchToModule(action.module, action);
            return;
        }

        if (action.action === "feedback.start") {
            dispatchToModule("feedback", action);
            return;
        }

        if (action.action.indexOf("feedback.") === 0) {
            dispatchToModule("feedback", action);
            return;
        }

        if (action.action.indexOf("food.") === 0) {
            const target = action.target === "food_explore" ? "food_explore" : "food_order";
            dispatchToModule(target, action);
            return;
        }

        reportResult(action, false, null, "Unsupported app action.");
    }

    frame.addEventListener("load", function () {
        frameReady = true;
        while (pendingActions.length) {
            frame.contentWindow.postMessage({
                type: "unified_ai_action",
                action: pendingActions.shift()
            }, window.location.origin);
        }
    });

    window.addEventListener("voice-agent:app-action", function (event) {
        handleAction(event.detail);
    });

    window.addEventListener("message", function (event) {
        if (event.origin !== window.location.origin || event.source !== frame.contentWindow) return;
        if (!event.data || typeof event.data !== "object") return;

        if (event.data.type === "unified_ai_action_result") {
            reportResult(event.data, event.data.success, event.data.result, event.data.error);
        } else if (event.data.type === "unified_ai_show_chat") {
            showChat();
        }
    });

    if (endButton) {
        endButton.addEventListener("click", function () {
            if (typeof window.endChat === "function") window.endChat();
            callPopup.classList.remove("is-open");
        });
    }

    if (chatButton) chatButton.addEventListener("click", showChat);

    window.UnifiedAIHost = {
        openModule: openModule,
        showChat: showChat,
        handleAction: handleAction
    };

    if (window.BedContext && typeof window.BedContext.go === "function") {
        const originalGo = window.BedContext.go.bind(window.BedContext);
        window.BedContext.go = function (page, extra) {
            const normalized = String(page || "").replace(/^\/+/, "").toLowerCase();
            const routeTargets = {
                "roomcomfort": "room_comfort",
                "logisitics": "logistics",
                "mydailycare": "video_request",
                "fooddining": "food_explore",
                "fooddining/fooddining": "food_explore",
                "fooddining/foodordering": "food_order",
                "overallfeedback/index": "feedback"
            };
            const target = routeTargets[normalized];
            if (isCallActive() && target) {
                openModule(target);
                return;
            }
            originalGo(page, extra);
        };
    }
})();
