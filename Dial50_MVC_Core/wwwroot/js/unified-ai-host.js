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
    const testSuggestions = document.getElementById("unifiedAiTestSuggestions");
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
    let simulatedSession = false;
    let screenWakeLock = null;
    let wakeLockRequestPending = false;
    let suppressReturnClickUntil = 0;
    let dragState = null;

    function isCallActive() {
        const state = document.body.getAttribute("data-state");
        return simulatedSession || state === "connecting" || state === "connected";
    }

    function updateTestPanelState(openForActiveModule) {
        if (!testPanel || !testLauncher) return;
        if (!isLocalTestMode) {
            testPanel.hidden = true;
            testLauncher.hidden = true;
            return;
        }

        const state = document.body.getAttribute("data-state");
        const realCall = state === "connecting" || state === "connected";
        const onModule = frameLayer.classList.contains("is-open");
        const simulationButton = document.getElementById("unifiedAiTestSessionButton");
        if (simulationButton) simulationButton.hidden = realCall || simulatedSession;
        if (!onModule) {
            testLauncher.hidden = !testPanel.hidden;
            testLauncher.setAttribute("aria-expanded", String(!testPanel.hidden));
            return;
        }

        if (openForActiveModule && (realCall || simulatedSession)) {
            testPanel.hidden = false;
            testLauncher.hidden = true;
            testLauncher.setAttribute("aria-expanded", "true");
            renderTestSuggestions();
            return;
        }

        testLauncher.hidden = !testPanel.hidden;
        testLauncher.setAttribute("aria-expanded", String(!testPanel.hidden));
    }

    function homePageContext() {
        const bedContext = window.BedContext && window.BedContext.get ? window.BedContext.get() : {};
        const text = function (element) {
            let value = String(typeof element === "string" ? element : element && (
                element.getAttribute("aria-label") || element.getAttribute("title")
                || element.value || element.innerText || element.textContent) || "")
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
        const isVisible = function (element) {
            if (element.closest("[hidden], [aria-hidden='true'], #unifiedAiTestPanel, #unifiedAiTestLauncher, #unifiedAiFloatingBar")) return false;
            const style = window.getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
        };
        const actionElements = Array.from(document.querySelectorAll(
            "button, a[href], [role='button'], [role='tab'], summary, input[type='button'], input[type='submit'], input[type='reset'], [onclick], [data-action], [data-route], .navBtn, .card, .service-card, .food-card, .order-card, .selection-card, .timing-card"
        ))
            .filter(isVisible)
            .slice(0, 180);
        const actions = actionElements
            .map(function (element, index) {
                let label = text(element);
                const parent = element.closest(".card, .service-card, .food-card, .order-card, .selection-card, .timing-card");
                const parentName = parent && parent.querySelector("h3, h4, .service-title, .food-title");
                const name = parentName && text(parentName);
                if (name && label.length < 20 && !label.toLowerCase().includes(name.toLowerCase())) label += " " + name;
                if (!label) {
                    const image = element.querySelector("img[alt]");
                    label = image ? text(image) : "";
                }
                if (!label) return null;

                const targetId = "home-action-" + index;
                if (element.getAttribute("data-unified-ai-target") !== targetId) {
                    element.setAttribute("data-unified-ai-target", targetId);
                }
                const action = {
                    label: label,
                    disabled: !!element.disabled || element.getAttribute("aria-disabled") === "true",
                    targetId: targetId
                };
                const routeValue = element.getAttribute("href") || element.getAttribute("data-route")
                    || (element.dataset && element.dataset.page ? "/" + element.dataset.page : "");
                if (routeValue && routeValue.trim() !== "#") {
                    try {
                        const url = new URL(routeValue, window.location.href);
                        if (url.origin === window.location.origin) {
                            ["BedInfo", "Unified", "UnifiedAI", "token", "patient", "user", "email", "uhid"]
                                .forEach(function (name) { url.searchParams.delete(name); });
                            action.route = text(url.pathname + url.search);
                        }
                    } catch (error) { }
                }
                return action;
            })
            .filter(Boolean);
        const fields = Array.from(document.querySelectorAll(
            "input:not([type='hidden']):not([type='password']):not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio']):not([type='file']), textarea, [contenteditable='true']"
        ))
            .filter(function (element) {
                const identity = [element.id, element.name, element.getAttribute("aria-label"), element.getAttribute("placeholder")].join(" ");
                return isVisible(element)
                    && !/bed|patient|room|uhid|user|token|password|doctor|physician|provider|name|email|phone|mobile|address|birth|age/i.test(identity)
                    && !element.closest(".patient-info, .patient-details, [data-patient-info]");
            })
            .slice(0, 50)
            .map(function (field, index) {
                const labels = Array.from(field.labels || []).map(function (label) { return label.textContent; });
                const targetId = "home-field-" + index;
                if (field.getAttribute("data-unified-ai-field") !== targetId) {
                    field.setAttribute("data-unified-ai-field", targetId);
                }
                return {
                    targetId: targetId,
                    label: text(field.getAttribute("aria-label") || labels.join(" ")
                        || field.getAttribute("placeholder") || field.name || field.id || "Text field"),
                    placeholder: text(field.getAttribute("placeholder") || "")
                };
            });
        return {
            route: "/Home/Index",
            title: document.title,
            headings: Array.from(document.querySelectorAll("#pageContent h1, #pageContent h2, #pageContent h3"))
                .map(text).filter(Boolean).slice(0, 20),
            controls: Array.from(document.querySelectorAll("select"))
                .filter(isVisible)
                .filter(function (select) {
                    return !/bed|patient|room|uhid|user|token|password|doctor|physician|provider/i.test(
                        [select.id, select.name, select.getAttribute("aria-label")].join(" ")
                    );
                })
                .slice(0, 20)
                .map(function (select) {
                    const labels = Array.from(select.labels || []).map(function (label) { return label.textContent; });
                    return {
                        id: select.id || "",
                        label: text(select.getAttribute("aria-label") || labels.join(" ") || select.name || select.id),
                        selected: select.options[select.selectedIndex]
                            ? { value: text(select.value), label: text(select.options[select.selectedIndex].textContent) }
                            : null,
                        options: Array.from(select.options).slice(0, 60).map(function (option) {
                            return { value: text(option.value), label: text(option.textContent), disabled: option.disabled };
                        })
                    };
                }),
            fields: fields,
            items: Array.from(document.querySelectorAll("#pageContent .card, #pageContent [data-route], #pageContent [data-page]"))
                .filter(isVisible)
                .slice(0, 100)
                .map(function (item) {
                    const name = text(item.querySelector("h1, h2, h3, h4, .card-title") || item);
                    const route = item.getAttribute("data-route")
                        || (item.dataset && item.dataset.page ? "/" + item.dataset.page : "");
                    const result = { name: name, label: name, disabled: !!item.disabled };
                    if (route) {
                        try {
                            const url = new URL(route, window.location.href);
                            if (url.origin === window.location.origin) result.route = text(url.pathname);
                        } catch (error) { }
                    }
                    return result;
                })
                .filter(function (item) { return item.label; }),
            actions: actions
        };
    }

    function sendCurrentPageContext() {
        if (simulatedSession || document.body.getAttribute("data-state") !== "connected"
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

    async function acquireScreenWakeLock() {
        if (!navigator.wakeLock || document.visibilityState !== "visible"
            || wakeLockRequestPending || screenWakeLock && !screenWakeLock.released) return;
        wakeLockRequestPending = true;
        try {
            screenWakeLock = await navigator.wakeLock.request("screen");
            screenWakeLock.addEventListener("release", function () {
                screenWakeLock = null;
            }, { once: true });
        } catch (error) {
            console.info("Screen wake lock is unavailable:", error && error.message ? error.message : error);
        } finally {
            wakeLockRequestPending = false;
        }
    }

    function syncScreenWakeLock(active) {
        if (active) {
            acquireScreenWakeLock();
            return;
        }
        const lock = screenWakeLock;
        screenWakeLock = null;
        if (lock && !lock.released) lock.release().catch(function (error) {
            console.info("Could not release screen wake lock:", error && error.message ? error.message : error);
        });
    }

    function updateFloatingBar() {
        const realConnection = document.body.getAttribute("data-state") === "connected";
        const connected = realConnection || simulatedSession;
        syncScreenWakeLock(connected);
        if (!realConnection) lastSentContext = "";
        if (floatingBar) {
            floatingBar.hidden = !connected;
            const callStatus = document.getElementById("callStatus");
            const micButton = document.getElementById("micBtn");
            const statusText = document.getElementById("unifiedAiBarStatus");
            if (statusText) {
                statusText.textContent = simulatedSession
                    ? "Test simulation"
                    : callStatus && callStatus.textContent.trim() || "Connected";
            }
            if (barMicButton) {
                const muted = !!(micButton && micButton.classList.contains("muted"));
                barMicButton.classList.toggle("is-muted", muted);
                barMicButton.innerHTML = muted
                    ? '<i class="fa-solid fa-microphone-slash" aria-hidden="true"></i>'
                    : '<i class="fa-solid fa-microphone" aria-hidden="true"></i>';
                barMicButton.setAttribute("aria-label", muted ? "Unmute microphone" : "Mute microphone");
                barMicButton.disabled = !realConnection;
            }
        }
        updateTestPanelState(false);
        if (connected) sendCurrentPageContext();
    }

    function showChat() {
        frameLayer.classList.remove("is-open");
        frameLayer.setAttribute("aria-hidden", "true");
        if (testPanel) testPanel.hidden = true;
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
        if (simulatedSession
            || document.body.getAttribute("data-state") !== "connected"
            || typeof window.sendVoiceAgentMessage !== "function") return;

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
        updateTestPanelState(true);
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
            "fooddining/otherservices": "food_explore",
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

    function findUiTarget(attribute, targetId) {
        return Array.from(document.querySelectorAll("[" + attribute + "]")).find(function (element) {
            if (element.getAttribute(attribute) !== targetId || element.closest("#unifiedAiModuleLayer")) return false;
            const style = window.getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
        });
    }

    function executeHostUIAction(action) {
        if (action.action === "ui.click") {
            const target = findUiTarget("data-unified-ai-target", action.targetId);
            if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") {
                reportResult(action, false, null, "The selected visible action is no longer available.");
                return;
            }
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.click();
            reportResult(action, true, { clicked: target.getAttribute("aria-label") || target.innerText || target.textContent });
            return;
        }

        if (action.action === "ui.fill") {
            const target = findUiTarget("data-unified-ai-field", action.targetId);
            if (!target || target.disabled || target.readOnly) {
                reportResult(action, false, null, "The selected visible field is no longer available.");
                return;
            }
            const value = String(action.value == null ? "" : action.value).slice(0, 2000);
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.focus({ preventScroll: true });
            if (target.isContentEditable) target.textContent = value;
            else target.value = value;
            target.dispatchEvent(new Event("input", { bubbles: true }));
            target.dispatchEvent(new Event("change", { bubbles: true }));
            reportResult(action, true, { filled: action.label || target.getAttribute("aria-label") || target.name || target.id });
        }
    }

    function selectHostOption(action) {
        const key = String(action.controlId || action.control || action.controlName || "").trim().toLowerCase();
        const requested = String(action.optionValue !== undefined ? action.optionValue
            : action.option !== undefined ? action.option : action.value == null ? "" : action.value).trim().toLowerCase();
        if (!key || !requested) {
            reportResult(action, false, null, "A visible dropdown and option are required.");
            return;
        }
        const matches = Array.from(document.querySelectorAll("select")).filter(function (select) {
            const style = window.getComputedStyle(select);
            if (style.display === "none" || style.visibility === "hidden" || !select.getClientRects().length
                || /bed|patient|room|uhid|user|token|password|doctor|physician|provider/i.test(
                    [select.id, select.name, select.getAttribute("aria-label")].join(" ")
                )) return false;
            const labels = Array.from(select.labels || []).map(function (label) { return label.textContent; });
            return [select.id, select.name, select.getAttribute("aria-label")].concat(labels)
                .some(function (label) { return String(label || "").trim().toLowerCase() === key; });
        });
        if (matches.length !== 1) {
            reportResult(action, false, null, matches.length ? "Dropdown name is ambiguous." : "Visible dropdown was not found.");
            return;
        }
        const select = matches[0];
        const options = Array.from(select.options).filter(function (option) {
            return !option.disabled && (String(option.value).trim().toLowerCase() === requested
                || String(option.textContent).trim().toLowerCase() === requested);
        });
        if (options.length !== 1) {
            reportResult(action, false, { options: Array.from(select.options).filter(function (option) {
                return !option.disabled;
            }).map(function (option) { return { value: option.value, label: option.textContent.trim() }; }) },
                options.length ? "Dropdown option is ambiguous." : "Dropdown option was not found.");
            return;
        }
        select.value = options[0].value;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
        reportResult(action, true, { controlId: select.id || select.name, selected: options[0].textContent.trim() });
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
                selectHostOption(action);
                return;
            }
            sendActionToFrame(action);
            return;
        }

        if (action.action === "ui.click" || action.action === "ui.fill") {
            if (frameLayer.classList.contains("is-open")) sendActionToFrame(action);
            else executeHostUIAction(action);
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
            const currentRoute = String(latestFrameContext && latestFrameContext.route || "");
            if (frameLayer.classList.contains("is-open") && /\/FoodDining\//i.test(currentRoute)) {
                sendActionToFrame(action);
            } else {
                dispatchToModule(target, action);
            }
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
        renderTestSuggestions();
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
            if (latestFrameContext && latestFrameContext.route) {
                activeTarget = routeTargetForPath(latestFrameContext.route);
            }
            sendCurrentPageContext();
            renderTestSuggestions();
        } else if (event.data.type === "unified_ai_show_chat") {
            showChat();
        }
    });

    if (barEndButton) {
        barEndButton.addEventListener("click", function () {
            if (simulatedSession) {
                simulatedSession = false;
                showChat();
                updateFloatingBar();
                return;
            }
            if (typeof window.endChat === "function") window.endChat();
            showChat();
            updateFloatingBar();
        });
    }

    if (barChatButton) barChatButton.addEventListener("click", showChat);
    if (returnButton) returnButton.addEventListener("click", function () {
        if (Date.now() < suppressReturnClickUntil) return;
        showChat();
    });
    if (barMicButton) {
        barMicButton.addEventListener("click", function (event) {
            event.stopPropagation();
            const micButton = document.getElementById("micBtn");
            if (!simulatedSession && isCallActive() && micButton) micButton.click();
            updateFloatingBar();
        });
    }

    if (testPanel) testPanel.hidden = true;
    if (isLocalTestMode && testOutput) {
        window.addEventListener("unified-ai:action-result", function (event) {
            testOutput.textContent = JSON.stringify(event.detail, null, 2);
        });
    }

    const testCommandWords = new Set([
        "a", "an", "add", "and", "can", "change", "choose", "count", "delete", "decrease",
        "for", "food", "i", "in", "increase", "item", "make", "minus", "more", "my", "of",
        "one", "order", "please", "plus", "quantity", "raise", "remove", "request", "select",
        "set", "the", "this", "to", "want", "with"
    ]);

    function normalizeTestText(value) {
        return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    }

    function testQuantity(value, fallback, minimum) {
        const words = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5 };
        const text = String(value || "").toLowerCase();
        const parsed = Object.prototype.hasOwnProperty.call(words, text) ? words[text] : Number.parseInt(text, 10);
        return Math.max(minimum == null ? 1 : minimum, Math.min(20, Number.isNaN(parsed) ? fallback : parsed));
    }

    function buildTestSuggestions() {
        const context = frameLayer.classList.contains("is-open")
            ? latestFrameContext
            : homePageContext();
        if (!context) return [];

        const query = String(testActionInput && testActionInput.value || "").trim();
        const queryText = normalizeTestText(query);
        const tokens = queryText.split(/\s+/).filter(function (word) {
            return word && !testCommandWords.has(word);
        });
        const suggestions = [];

        function add(label, action, searchText) {
            const haystack = normalizeTestText(searchText || label);
            const score = tokens.filter(function (token) { return haystack.includes(token); }).length;
            if (tokens.length && score === 0) return;
            suggestions.push({ label: label, action: action, score: score });
        }

        (context.actions || []).forEach(function (item) {
            if (item.route && !item.disabled) {
                add("Open " + item.label, { action: "navigate", path: item.route }, item.label + " " + item.route);
            } else if (item.targetId && !item.disabled) {
                add("Click " + item.label, { action: "ui.click", targetId: item.targetId, label: item.label }, item.label);
            }
        });
        (context.items || []).forEach(function (item) {
            if (item.route && !item.disabled) {
                add("Open " + (item.name || item.label), { action: "navigate", path: item.route }, item.name || item.label);
            }
        });

        (context.controls || []).forEach(function (control) {
            (control.options || []).forEach(function (option) {
                if (option.disabled || String(option.value) === String(control.selected ? control.selected.value : "")) return;
                add("Select " + option.label + " in " + (control.label || control.id), {
                    action: "ui.select",
                    controlId: control.id || control.label,
                    optionValue: option.value
                }, (control.label || control.id) + " " + option.label);
            });
        });

        if (query) {
            (context.fields || []).forEach(function (field) {
                if (!field.targetId) return;
                const label = field.label || "the visible field";
                const fieldMatchesQuery = normalizeTestText(label + " " + (field.placeholder || ""))
                    .split(/\s+/).some(function (word) { return tokens.includes(word); });
                const isFreeTextField = /remark|comment|description|feedback|message|reason|note/i.test(label + " " + (field.placeholder || ""));
                if (!fieldMatchesQuery && !isFreeTextField) return;
                add("Enter your text in " + (field.label || "the visible field"), {
                    action: "ui.fill",
                    targetId: field.targetId,
                    label: field.label,
                    value: query
                }, (field.label || "") + " " + (field.placeholder || "") + " " + query);
            });
        }

        const route = String(context.route || "").toLowerCase();
        if (/\/home(?:\/index)?$/.test(route)
            && (context.actions || []).some(function (item) { return /food|dining/i.test(item.label); })) {
            add("Explore Food & Dining", {
                action: "food.intent",
                intent: "explore"
            }, "food dining explore");
            add("Place a food order", {
                action: "food.intent",
                intent: "order"
            }, "food dining order");
        }
        const requestModule = route.indexOf("roomcomfort") >= 0
            ? "room_comfort"
            : route.indexOf("logisitics") >= 0 ? "logistics" : null;
        if (requestModule) {
            (context.items || []).filter(function (item) { return item.categoryId && !item.disabled; }).forEach(function (item) {
                const category = item.name || item.label;
                const quantityMatch = queryText.match(/\b(?:quantity|qty|need|want|add)\s+(one|two|three|four|five|\d+)\b/);
                add("Create " + category + " request", {
                    action: "request.create",
                    module: requestModule,
                    categoryId: item.categoryId,
                    category: category,
                    remarks: query || category,
                    quantity: testQuantity(quantityMatch && quantityMatch[1], 1)
                }, category);
            });
        }

        if (route.indexOf("/fooddining/otherservices") >= 0) {
            (context.items || []).filter(function (item) {
                return item.categoryId && !item.disabled;
            }).forEach(function (item) {
                const category = item.name || item.label;
                add("Request " + category, {
                    action: "food.other_service",
                    target: "food_explore",
                    categoryId: item.categoryId,
                    category: category,
                    remarks: query
                }, category);
            });
        }

        if (route.indexOf("/overallfeedback/") >= 0) {
            (context.items || []).filter(function (item) {
                return item.feedbackQuestionId || item.feedbackDepartmentId;
            }).forEach(function (item) {
                const question = item.name || item.label;
                (item.feedbackChoices || []).forEach(function (choice) {
                    add("Answer " + question + ": " + choice, {
                        action: "feedback.answer",
                        questionId: item.feedbackQuestionId,
                        departmentId: item.feedbackDepartmentId,
                        question: question,
                        value: choice
                    }, question + " " + choice);
                });
                if (query && ["text", "comments"].includes(item.feedbackType)) {
                    add("Enter your response for " + question, {
                        action: "feedback.answer",
                        questionId: item.feedbackQuestionId,
                        departmentId: item.feedbackDepartmentId,
                        question: question,
                        value: query
                    }, question + " " + query);
                }
            });
            if ((context.actions || []).some(function (item) {
                return !item.disabled && /submit feedback/i.test(item.label);
            })) {
                add("Submit feedback", { action: "feedback.submit" }, "submit feedback");
            }
        }

        if (route.indexOf("/mydailycare/") >= 0) {
            const videoUrl = query.match(/https?:\/\/[^\s]+/i);
            if (videoUrl) {
                add("Play the supplied video", {
                    action: "video.play",
                    videoUrl: videoUrl[0],
                    title: "Video"
                }, "play video " + query);
            }
            if ((context.actions || []).some(function (item) {
                return !item.disabled && /back to my daily care/i.test(item.label);
            })) {
                add("Stop the current video", { action: "video.stop" }, "stop close video");
            }
        }

        const menuItems = (context.items || []).filter(function (item) { return item.foodId && !item.disabled; });
        if (menuItems.length) {
            const remove = /\b(remove|delete)\b/.test(queryText);
            const decrease = /\b(minus|decrease|subtract|less)\b/.test(queryText);
            const setQuantity = queryText.match(/\b(?:quantity|qty)\s*(?:to\s*)?(zero|one|two|three|four|five|\d+)\b|\bset\s+(?:to\s*)?(zero|one|two|three|four|five|\d+)\b/);
            const addCount = queryText.match(/\badd\s+(one|two|three|four|five|\d+)\b/);
            menuItems.forEach(function (item) {
                const name = item.name || item.label;
                const meal = item.meal || "";
                let action;
                let label;
                if (remove) {
                    action = { action: "food.remove_item", itemId: item.foodId, itemName: name, meal: meal };
                    label = "Remove " + name;
                } else if (decrease) {
                    const quantity = Math.max(0, (Number(item.quantity) || 0) - 1);
                    action = { action: "food.set_quantity", itemId: item.foodId, itemName: name, meal: meal, quantity: quantity };
                    label = "Decrease " + name + " to " + quantity;
                } else if (setQuantity) {
                    const quantity = testQuantity(setQuantity[1] || setQuantity[2], 0, 0);
                    action = { action: "food.set_quantity", itemId: item.foodId, itemName: name, meal: meal, quantity: quantity };
                    label = "Set " + name + " quantity to " + quantity;
                } else {
                    const quantity = testQuantity(addCount && addCount[1], 1);
                    action = { action: "food.add_item", itemId: item.foodId, itemName: name, meal: meal, quantity: quantity };
                    label = "Add " + quantity + " " + name;
                }
                add(label, action, name);
            });
            add("List the current menu", { action: "food.list_menu" }, "menu list food");
            if ((context.actions || []).some(function (item) {
                return !item.disabled && /review order|checkout|view cart/i.test(item.label);
            })) {
                add("Review the current order", { action: "food.review_order" }, "review order checkout cart");
            }
        }

        if (route.indexOf("/fooddining/revieworder") >= 0
            && (context.actions || []).some(function (item) {
                return !item.disabled && /confirm order|place order|submit order/i.test(item.label);
            })) {
            add("Place the order", { action: "food.submit_order" }, "place confirm submit order");
        }

        (context.items || []).forEach(function (item) {
            if (!item.disabled && item.orderType) {
                add("Choose " + item.name + " ordering", {
                    action: "food.select_order_type",
                    orderType: item.orderType
                }, item.name || item.label);
            }
            if (!item.disabled && item.orderMode) {
                add("Choose " + item.name, {
                    action: "food.select_mode",
                    mode: item.orderMode
                }, item.name || item.label);
            }
        });

        return suggestions.sort(function (left, right) { return right.score - left.score; }).slice(0, 200);
    }

    function runTestAction(action, label) {
        if (!isLocalTestMode || !action) return;
        action.request_id = "local-test-" + Date.now();
        if (testOutput) testOutput.textContent = "Testing: " + label + "\nThe current app backend will handle this action.";
        handleAction(action);
    }

    function renderTestSuggestions() {
        if (!testSuggestions) return;
        const suggestions = buildTestSuggestions();
        testSuggestions.replaceChildren();
        if (!suggestions.length) {
            const empty = document.createElement("p");
            empty.className = "unified-ai-test-empty";
            empty.textContent = frameLayer.classList.contains("is-open") && !latestFrameContext
                ? "Loading visible page options..."
                : "No matching actions are visible on this screen.";
            testSuggestions.appendChild(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        suggestions.forEach(function (suggestion) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "unified-ai-test-suggestion";
            button.textContent = suggestion.label;
            button.addEventListener("click", function () {
                runTestAction(suggestion.action, suggestion.label);
            });
            fragment.appendChild(button);
        });
        testSuggestions.appendChild(fragment);
    }

    const testSessionButton = document.getElementById("unifiedAiTestSessionButton");
    if (testSessionButton) {
        testSessionButton.addEventListener("click", function () {
            if (!isLocalTestMode) return;
            simulatedSession = true;
            updateFloatingBar();
            updateTestPanelState(false);
        });
    }

    if (testLauncher) {
        testLauncher.addEventListener("click", function () {
            if (!testPanel) return;
            testPanel.hidden = !testPanel.hidden;
            updateTestPanelState(false);
            renderTestSuggestions();
        });
    }
    if (testCloseButton) {
        testCloseButton.addEventListener("click", function () {
            if (testPanel) testPanel.hidden = true;
            updateTestPanelState(false);
        });
    }
    if (testActionInput) {
        testActionInput.addEventListener("input", renderTestSuggestions);
        testActionInput.addEventListener("keydown", function (event) {
            if (event.key !== "Enter") return;
            const firstSuggestion = testSuggestions && testSuggestions.querySelector("button");
            if (firstSuggestion) {
                event.preventDefault();
                firstSuggestion.click();
            }
        });
    }

    if (floatingBar && returnButton) {
        returnButton.addEventListener("pointerdown", function (event) {
            if (!event.isPrimary || event.button !== 0) return;
            const rect = floatingBar.getBoundingClientRect();
            dragState = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                left: rect.left,
                top: rect.top,
                moved: false
            };
            returnButton.setPointerCapture(event.pointerId);
        });
        returnButton.addEventListener("pointermove", function (event) {
            if (!dragState || dragState.pointerId !== event.pointerId) return;
            const dx = event.clientX - dragState.startX;
            const dy = event.clientY - dragState.startY;
            if (!dragState.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
            dragState.moved = true;
            const maxLeft = Math.max(0, window.innerWidth - floatingBar.offsetWidth);
            const maxTop = Math.max(0, window.innerHeight - floatingBar.offsetHeight);
            floatingBar.style.left = Math.max(0, Math.min(maxLeft, dragState.left + dx)) + "px";
            floatingBar.style.top = Math.max(0, Math.min(maxTop, dragState.top + dy)) + "px";
            floatingBar.style.right = "auto";
            floatingBar.style.bottom = "auto";
            floatingBar.style.transform = "none";
        });
        const finishDrag = function (event) {
            if (!dragState || dragState.pointerId !== event.pointerId) return;
            if (dragState.moved) suppressReturnClickUntil = Date.now() + 350;
            dragState = null;
        };
        returnButton.addEventListener("pointerup", finishDrag);
        returnButton.addEventListener("pointercancel", finishDrag);
    }

    document.addEventListener("visibilitychange", function () {
        updateFloatingBar();
    });

    let homeContextTimer = null;
    const homeContextObserver = new MutationObserver(function (records) {
        if (frameLayer.classList.contains("is-open")) return;
        const relevantChanges = records.some(function (record) {
            const target = record.target instanceof Element ? record.target : record.target.parentElement;
            if (target && target.closest("#unifiedAiTestPanel, #unifiedAiTestLauncher, #unifiedAiFloatingBar")) return false;
            return record.type !== "attributes"
                || !["data-unified-ai-target", "data-unified-ai-field"].includes(record.attributeName);
        });
        if (!relevantChanges) return;
        if (homeContextTimer) clearTimeout(homeContextTimer);
        homeContextTimer = setTimeout(function () {
            lastSentContext = "";
            sendCurrentPageContext();
            if (isLocalTestMode) renderTestSuggestions();
        }, 250);
    });
    homeContextObserver.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });

    document.addEventListener("click", function (event) {
        if (!isCallActive()) return;
        const element = event.target instanceof Element ? event.target : null;
        const navButton = element && element.closest(".navBtn[data-page]");
        if (navButton) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openAppPage(navButton.getAttribute("data-page"));
            return;
        }
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

    const bodyObserver = new MutationObserver(function () {
        const state = document.body.getAttribute("data-state");
        if (state === "connecting" || state === "connected") simulatedSession = false;
        updateFloatingBar();
    });
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
