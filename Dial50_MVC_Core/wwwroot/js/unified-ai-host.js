(function () {
    const frameLayer = document.getElementById("unifiedAiModuleLayer");
    const frame = document.getElementById("unifiedAiModuleFrame");
    const floatingBar = document.getElementById("unifiedAiFloatingBar");
    const returnButton = document.getElementById("unifiedAiReturnButton");
    const barMicButton = document.getElementById("unifiedAiBarMicButton");
    const barChatButton = document.getElementById("unifiedAiBarChatButton");
    const barEndButton = document.getElementById("unifiedAiBarEndButton");
    const testLauncher = document.getElementById("unifiedAiTestLauncher");
    const testCloseButton = document.getElementById("unifiedAiTestCloseButton");
    const testPanel = document.getElementById("unifiedAiTestPanel");
    const testActionInput = document.getElementById("unifiedAiTestAction");
    const testRunButton = document.getElementById("unifiedAiTestRunButton");
    const testOutput = document.getElementById("unifiedAiTestOutput");

    if (!frameLayer || !frame) return;

    const pageParams = new URLSearchParams(window.location.search);
    const isLocalTestMode = pageParams.get("UnifiedAITest") === "1"
        && ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

    const routes = {
        room_comfort: "/RoomComfort/Index",
        logistics: "/Logisitics/Index",
        video_request: "/MyDailyCare/Index",
        my_daily_care: "/MyDailyCare/Index",
        medications: "/Medication/Index",
        appointments: "/Appointments/Index",
        my_library: "/MyLibrary/Index",
        discharge: "/Discharge/Index",
        food_explore: "/FoodDining/FoodDining",
        food_order: "/FoodDining/FoodOrdering",
        feedback: "/OverAllFeedback/Index"
    };

    let frameReady = false;
    let pendingActions = [];
    let activeTarget = null;
    let latestFrameContext = null;
    let lastSentContext = "";

    function isCallActive() {
        const state = document.body.getAttribute("data-state");
        return state === "connecting" || state === "connected";
    }

    function homePageContext() {
        const bedContext = window.BedContext && window.BedContext.get ? window.BedContext.get() : {};
        const text = function (element) {
            let value = String(element.getAttribute("aria-label") || element.innerText || element.textContent || "")
                .replace(/\s+/g, " ").trim();
            ["bedInfo", "bedId", "patientName", "roomNumber", "roomBed", "bedNumber", "uhid", "userId", "ward"]
                .map(function (key) { return String(bedContext[key] || "").trim(); })
                .filter(function (identifier) { return identifier.length >= 3; })
                .forEach(function (identifier) {
                    const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    value = value.replace(new RegExp(escaped, "ig"), "[redacted]");
                });
            return value.slice(0, 180);
        };
        const actions = Array.from(document.querySelectorAll(".navBtn, #pageContent button, #pageContent a[href]"))
            .filter(function (element) {
                const style = window.getComputedStyle(element);
                return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length;
            })
            .slice(0, 80)
            .map(function (element) {
                const label = text(element);
                const action = { label: label, disabled: !!element.disabled };
                if (element instanceof HTMLAnchorElement) {
                    const url = new URL(element.href, window.location.href);
                    if (url.origin === window.location.origin) action.route = url.pathname;
                }
                return label ? action : null;
            })
            .filter(Boolean);
        return {
            route: "/Home/Index",
            title: document.title,
            headings: Array.from(document.querySelectorAll("#pageContent h1, #pageContent h2, #pageContent h3"))
                .map(text).filter(Boolean).slice(0, 20),
            controls: [],
            items: [],
            actions: actions
        };
    }

    function sendCurrentPageContext() {
        if (document.body.getAttribute("data-state") !== "connected"
            || typeof window.sendVoiceAgentMessage !== "function") return;
        const context = frameLayer.classList.contains("is-open") ? latestFrameContext : homePageContext();
        if (frameLayer.classList.contains("is-open") && context && frame.contentWindow) {
            try {
                if (context.route !== frame.contentWindow.location.pathname) return;
            } catch (error) {
                return;
            }
        }
        if (!context) return;
        const signature = JSON.stringify(context);
        if (signature === lastSentContext) return;
        if (window.sendVoiceAgentMessage({ type: "app_context", context: context })) {
            lastSentContext = signature;
        }
    }

    function updateFloatingBar() {
        const connected = document.body.getAttribute("data-state") === "connected";
        if (!connected) lastSentContext = "";
        if (floatingBar) {
            floatingBar.hidden = !connected;
            const callStatus = document.getElementById("callStatus");
            const micButton = document.getElementById("micBtn");
            const statusText = document.getElementById("unifiedAiBarStatus");
            if (statusText) {
                statusText.textContent = callStatus && callStatus.textContent.trim() || "Connected";
            }
            if (barMicButton) {
                const muted = !!(micButton && micButton.classList.contains("muted"));
                barMicButton.classList.toggle("is-muted", muted);
                barMicButton.innerHTML = muted
                    ? '<i class="fa-solid fa-microphone-slash" aria-hidden="true"></i>'
                    : '<i class="fa-solid fa-microphone" aria-hidden="true"></i>';
                barMicButton.setAttribute("aria-label", muted ? "Unmute microphone" : "Mute microphone");
                barMicButton.disabled = !connected;
            }
        }
        if (connected) sendCurrentPageContext();
    }

    function showChat() {
        frameLayer.classList.remove("is-open");
        frameLayer.setAttribute("aria-hidden", "true");
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
        latestFrameContext = null;
        lastSentContext = "";
        activeTarget = target;
        frameLayer.classList.add("is-open");
        frameLayer.setAttribute("aria-hidden", "false");

        pendingActions.forEach(function (pendingAction) {
            reportResult(pendingAction, false, null, "The module changed before this action could run.");
        });
        pendingActions = [];

        if (action && action.action !== "navigate") pendingActions.push(action);

        frameReady = false;
        updateFloatingBar();
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
        targetUrl.searchParams.set("Unified", "1");
        targetUrl.searchParams.set("UnifiedAI", "1");

        return loadFrameUrl(targetUrl, target, action);
    }

    function openAppPage(page, extra) {
        const url = new URL(window.BedContext.url(page, extra), window.location.origin);
        const bedContext = window.BedContext.get ? window.BedContext.get() : {};
        const bedInfo = bedContext.bedInfo || pageParams.get("BedInfo");
        if (bedInfo) url.searchParams.set("BedInfo", bedInfo);
        url.searchParams.set("Unified", "1");
        url.searchParams.set("UnifiedAI", "1");
        return loadFrameUrl(url, routeTargetForPath(url.pathname), null);
    }

    function openAppUrl(value) {
        const path = String(value || "").trim();
        if (!path) return null;
        let targetUrl;
        try {
            targetUrl = new URL(path, window.location.origin);
        } catch (error) {
            return null;
        }
        if (targetUrl.origin !== window.location.origin || !targetUrl.pathname.startsWith("/")) return null;
        if (/\/(?:home(?:\/index)?|ai\/chat)\/?$/i.test(targetUrl.pathname)) {
            showChat();
            return { target: "home" };
        }

        const bedContext = window.BedContext && window.BedContext.get ? window.BedContext.get() : {};
        const bedInfo = bedContext.bedInfo || pageParams.get("BedInfo");
        targetUrl.searchParams.delete("BedInfo");
        if (bedInfo) targetUrl.searchParams.set("BedInfo", bedInfo);
        targetUrl.searchParams.set("Unified", "1");
        targetUrl.searchParams.set("UnifiedAI", "1");
        loadFrameUrl(targetUrl, routeTargetForPath(targetUrl.pathname), null);
        return { path: targetUrl.pathname };
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
            "medication": "medications",
            "medication/index": "medications",
            "appointments": "appointments",
            "appointments/index": "appointments",
            "mylibrary": "my_library",
            "mylibrary/index": "my_library",
            "discharge": "discharge",
            "discharge/index": "discharge",
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
            let opened = false;
            if (routes[action.target]) {
                opened = openModule(action.target);
            } else {
                const destination = action.path || action.url || action.target;
                const result = openAppUrl(destination);
                if (result) {
                    opened = true;
                    reportResult(action, true, result);
                } else {
                    reportResult(action, false, null, "The requested page is not a valid same-site route.");
                }
            }
            if (opened && routes[action.target]) reportResult(action, true, { target: action.target });
            return;
        }

        if (action.action === "ui.select") {
            if (!frameLayer.classList.contains("is-open")) {
                reportResult(action, false, null, "Open the requested module before changing a dropdown.");
                return;
            }
            sendActionToFrame(action);
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
        } else if (event.data.type === "unified_ai_page_context") {
            latestFrameContext = event.data.context;
            sendCurrentPageContext();
        } else if (event.data.type === "unified_ai_show_chat") {
            showChat();
        }
    });

    if (barEndButton) {
        barEndButton.addEventListener("click", function () {
            if (typeof window.endChat === "function") window.endChat();
            showChat();
            updateFloatingBar();
        });
    }

    if (barChatButton) barChatButton.addEventListener("click", showChat);
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
    if (testLauncher) {
        testLauncher.hidden = !isLocalTestMode || !testPanel || !testPanel.hidden;
        testLauncher.addEventListener("click", function () {
            if (!testPanel) return;
            testPanel.hidden = !testPanel.hidden;
            testLauncher.hidden = !testPanel.hidden;
            testLauncher.setAttribute("aria-expanded", String(!testPanel.hidden));
        });
    }
    if (testCloseButton) {
        testCloseButton.addEventListener("click", function () {
            if (testPanel) testPanel.hidden = true;
            if (testLauncher) {
                testLauncher.hidden = !isLocalTestMode;
                testLauncher.setAttribute("aria-expanded", "false");
            }
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

    let homeContextTimer = null;
    const homeContextObserver = new MutationObserver(function () {
        if (frameLayer.classList.contains("is-open")) return;
        if (homeContextTimer) clearTimeout(homeContextTimer);
        homeContextTimer = setTimeout(function () {
            lastSentContext = "";
            sendCurrentPageContext();
        }, 250);
    });
    const pageContent = document.getElementById("pageContent");
    if (pageContent) {
        homeContextObserver.observe(pageContent, { childList: true, subtree: true, characterData: true, attributes: true });
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
        targetUrl.searchParams.set("Unified", "1");
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
