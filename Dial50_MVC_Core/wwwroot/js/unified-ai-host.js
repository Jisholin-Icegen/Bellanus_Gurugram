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
            if (realCall || simulatedSession) testPanel.hidden = true;
            testLauncher.hidden = realCall || simulatedSession || !testPanel.hidden;
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
                } else if (element.dataset && element.dataset.page) {
                    action.route = "/" + element.dataset.page;
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

    function updateFloatingBar() {
        const realConnection = document.body.getAttribute("data-state") === "connected";
        const connected = realConnection || simulatedSession;
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
    if (returnButton) returnButton.addEventListener("click", showChat);
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

        const route = String(context.route || "").toLowerCase();
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

        return suggestions.sort(function (left, right) { return right.score - left.score; }).slice(0, 24);
    }

    function runTestAction(action, label) {
        if (!isLocalTestMode || !action) return;
        action.request_id = "local-test-" + Date.now();
        const writesData = [
            "request.create", "food.add_item", "food.set_quantity", "food.remove_item",
            "food.other_service", "food.review_order", "food.submit_order", "feedback.submit"
        ].includes(action.action);
        if (writesData && !window.confirm("This test can change app data. Continue only with a test database?")) return;
        if (testOutput) testOutput.textContent = "Testing: " + label;
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
