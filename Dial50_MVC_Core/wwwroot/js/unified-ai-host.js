(function () {
    const frameLayer = document.getElementById("unifiedAiModuleLayer");
    const frame = document.getElementById("unifiedAiModuleFrame");
    const callPopup = document.getElementById("unifiedAiCallPopup");
    const endButton = document.getElementById("unifiedAiEndButton");
    const chatButton = document.getElementById("unifiedAiChatButton");
    const floatingBar = document.getElementById("unifiedAiFloatingBar");
    const returnButton = document.getElementById("unifiedAiReturnButton");
    const barMicButton = document.getElementById("unifiedAiBarMicButton");
    const testToggleButton = document.getElementById("unifiedAiTestToggleButton");
    const testCloseButton = document.getElementById("unifiedAiTestCloseButton");
    const testPanel = document.getElementById("unifiedAiTestPanel");
    const testActionInput = document.getElementById("unifiedAiTestAction");
    const testRunButton = document.getElementById("unifiedAiTestRunButton");
    const testOutput = document.getElementById("unifiedAiTestOutput");

    if (!frameLayer || !frame || !callPopup) return;

    const pageParams = new URLSearchParams(window.location.search);
    const isLocalTestMode = pageParams.get("UnifiedAITest") === "1"
        && ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

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

    function updateFloatingBar() {
        const active = isCallActive();
        if (floatingBar) {
            floatingBar.hidden = !active && !isLocalTestMode;
            const callStatus = document.getElementById("callStatus");
            const micButton = document.getElementById("micBtn");
            const statusText = document.getElementById("unifiedAiBarStatus");
            if (statusText) {
                statusText.textContent = active
                    ? (callStatus && callStatus.textContent.trim() || "Connected")
                    : "Test mode · AI disconnected";
            }
            if (barMicButton) {
                const muted = !!(micButton && micButton.classList.contains("muted"));
                barMicButton.classList.toggle("is-muted", muted);
                barMicButton.innerHTML = muted
                    ? '<i class="fa-solid fa-microphone-slash" aria-hidden="true"></i>'
                    : '<i class="fa-solid fa-microphone" aria-hidden="true"></i>';
                barMicButton.setAttribute("aria-label", muted ? "Unmute microphone" : "Mute microphone");
                barMicButton.disabled = !active;
            }
        }
        callPopup.classList.toggle("is-open", active && frameLayer.classList.contains("is-open"));
    }

    function showChat() {
        frameLayer.classList.remove("is-open");
        frameLayer.setAttribute("aria-hidden", "true");
        callPopup.classList.remove("is-open");
        updateFloatingBar();
    }

    function reportResult(action, success, result, error) {
        if (!action || !action.request_id) return;
        const response = {
            request_id: action.request_id,
            success: !!success,
            result: result || null,
            error: error || null
        };
        window.dispatchEvent(new CustomEvent("unified-ai:action-result", { detail: response }));
        if (isLocalTestMode || typeof window.sendVoiceAgentMessage !== "function") return;

        window.sendVoiceAgentMessage(Object.assign({ type: "app_action_result" }, response));
    }

    function loadFrameUrl(targetUrl, target, action) {
        frameLayer.classList.add("is-open");
        frameLayer.setAttribute("aria-hidden", "false");
        updateFloatingBar();

        pendingActions.forEach(function (pendingAction) {
            reportResult(pendingAction, false, null, "The module changed before this action could run.");
        });
        pendingActions = [];
        activeTarget = target;

        if (action && action.action !== "navigate") pendingActions.push(action);

        frameReady = false;
        frame.src = targetUrl.toString();
        return true;
    }

    function openModule(target, action) {
        const route = routes[target];
        if (!route) {
            reportResult(action, false, null, "Unsupported module.");
            return false;
        }

        const targetUrl = new URL(route, window.location.origin);
        const bedContext = window.BedContext && window.BedContext.get
            ? window.BedContext.get()
            : {};
        const bedInfo = bedContext.bedInfo || new URLSearchParams(window.location.search).get("BedInfo");
        if (bedInfo) targetUrl.searchParams.set("BedInfo", bedInfo);
        targetUrl.searchParams.set("UnifiedAI", "1");

        return loadFrameUrl(targetUrl, target, action);
    }

    function openAppPage(page, extra) {
        const url = new URL(window.BedContext.url(page, extra), window.location.origin);
        const bedContext = window.BedContext.get ? window.BedContext.get() : {};
        const bedInfo = bedContext.bedInfo || pageParams.get("BedInfo");
        if (bedInfo) url.searchParams.set("BedInfo", bedInfo);
        url.searchParams.set("UnifiedAI", "1");
        return loadFrameUrl(url, routeTargetForPath(url.pathname), null);
    }

    function routeTargetForPath(path) {
        const normalized = String(path || "").replace(/^\/+|\/+$/g, "").toLowerCase();
        const routeTargets = {
            "roomcomfort": "room_comfort",
            "roomcomfort/index": "room_comfort",
            "logisitics": "logistics",
            "logisitics/index": "logistics",
            "mydailycare": "video_request",
            "mydailycare/index": "video_request",
            "fooddining": "food_explore",
            "fooddining/fooddining": "food_explore",
            "fooddining/foodordering": "food_order",
            "fooddining/patientordermode": "food_order",
            "fooddining/menuitems": "food_order",
            "fooddining/revieworder": "food_order",
            "fooddining/myorders": "food_order",
            "overallfeedback": "feedback",
            "overallfeedback/index": "feedback"
        };
        return routeTargets[normalized] || ("page:" + normalized);
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
        updateFloatingBar();
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
            updateFloatingBar();
        });
    }

    if (chatButton) chatButton.addEventListener("click", showChat);
    if (returnButton) returnButton.addEventListener("click", showChat);
    if (barMicButton) {
        barMicButton.addEventListener("click", function (event) {
            event.stopPropagation();
            const micButton = document.getElementById("micBtn");
            if (isCallActive() && micButton) micButton.click();
            updateFloatingBar();
        });
    }

    if (testPanel) testPanel.hidden = !isLocalTestMode;
    if (isLocalTestMode && testOutput) {
        window.addEventListener("unified-ai:action-result", function (event) {
            testOutput.textContent = JSON.stringify(event.detail, null, 2);
        });
    }

    function runTestAction() {
        if (!isLocalTestMode || !testActionInput) return;
        try {
            const action = JSON.parse(testActionInput.value);
            if (!action || typeof action !== "object" || typeof action.action !== "string") {
                throw new Error("Enter an action object with an action name.");
            }
            action.request_id = action.request_id || ("local-test-" + Date.now());
            if (["request.create", "food.add_item", "food.submit_order", "feedback.submit"].includes(action.action)
                && !window.confirm("This test may write app data such as requests, cart items, orders, or feedback. Continue only on a test database.")) {
                return;
            }
            if (testOutput) testOutput.textContent = "Running " + action.action + "...";
            handleAction(action);
        } catch (error) {
            if (testOutput) testOutput.textContent = error.message;
        }
    }

    if (testRunButton) testRunButton.addEventListener("click", runTestAction);
    if (testToggleButton) {
        testToggleButton.hidden = !isLocalTestMode;
        testToggleButton.addEventListener("click", function () {
            if (testPanel) testPanel.hidden = !testPanel.hidden;
        });
    }
    if (testCloseButton) {
        testCloseButton.addEventListener("click", function () {
            if (testPanel) testPanel.hidden = true;
        });
    }
    if (testPanel) {
        testPanel.querySelectorAll("[data-unified-ai-sample]").forEach(function (button) {
            button.addEventListener("click", function () {
                if (testActionInput) testActionInput.value = button.getAttribute("data-unified-ai-sample");
                runTestAction();
            });
        });
    }

    document.addEventListener("click", function (event) {
        if (!isCallActive()) return;
        const element = event.target instanceof Element ? event.target : null;
        const link = element && element.closest("a[href]");
        if (!link || link.hasAttribute("download") || link.target === "_blank") return;

        const targetUrl = new URL(link.href, window.location.href);
        if (targetUrl.origin !== window.location.origin || targetUrl.hash && targetUrl.pathname === window.location.pathname) return;
        if (/\/(?:home(?:\/index)?|ai\/chat)\/?$/i.test(targetUrl.pathname)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            showChat();
            return;
        }

        const bedContext = window.BedContext && window.BedContext.get ? window.BedContext.get() : {};
        const bedInfo = bedContext.bedInfo || pageParams.get("BedInfo");
        if (bedInfo && !targetUrl.searchParams.has("BedInfo")) targetUrl.searchParams.set("BedInfo", bedInfo);
        targetUrl.searchParams.set("UnifiedAI", "1");
        event.preventDefault();
        event.stopImmediatePropagation();
        loadFrameUrl(targetUrl, routeTargetForPath(targetUrl.pathname), null);
    }, true);

    window.UnifiedAIHost = {
        openModule: openModule,
        showChat: showChat,
        handleAction: handleAction
    };

    const bodyObserver = new MutationObserver(updateFloatingBar);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["data-state"] });
    const statusElement = document.getElementById("callStatus");
    if (statusElement) {
        new MutationObserver(updateFloatingBar).observe(statusElement, {
            characterData: true,
            childList: true,
            subtree: true
        });
    }
    const micElement = document.getElementById("micBtn");
    if (micElement) {
        new MutationObserver(updateFloatingBar).observe(micElement, {
            attributes: true,
            attributeFilter: ["class"]
        });
    }
    updateFloatingBar();

    if (window.BedContext && typeof window.BedContext.go === "function") {
        const originalGo = window.BedContext.go.bind(window.BedContext);
        window.BedContext.go = function (page, extra) {
            const normalized = String(page || "").replace(/^\/+/, "").toLowerCase();
            if (isCallActive()) {
                if (normalized === "home" || normalized === "home/index" || normalized === "ai" || normalized === "ai/chat") {
                    showChat();
                    return;
                }
                openAppPage(page, extra);
                return;
            }
            originalGo(page, extra);
        };
    }
})();
