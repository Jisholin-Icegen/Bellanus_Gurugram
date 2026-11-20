(function () {
    const host = window.UnifiedAIHost;
    const launcher = document.getElementById("unifiedAiTestLauncher");
    const panel = document.getElementById("unifiedAiTestPanel");
    const closeButton = document.getElementById("unifiedAiTestCloseButton");
    const sessionButton = document.getElementById("unifiedAiTestSessionButton");
    const status = document.getElementById("unifiedAiTestStatus");
    const input = document.getElementById("unifiedAiTestAction");
    const suggestionsElement = document.getElementById("unifiedAiTestSuggestions");
    const output = document.getElementById("unifiedAiTestOutput");
    if (!host || !host.isLocalTestMode || !launcher || !panel) return;

    let requestSequence = 0;
    let riskyActionsConfirmed = false;
    launcher.hidden = false;

    function normalize(value) {
        return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    }

    function testQuantity(value, fallback, minimum) {
        const words = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5 };
        const text = String(value || "").toLowerCase();
        const parsed = Object.prototype.hasOwnProperty.call(words, text) ? words[text] : Number.parseInt(text, 10);
        return Math.max(minimum == null ? 1 : minimum, Math.min(20, Number.isNaN(parsed) ? fallback : parsed));
    }

    function syncSessionButton() {
        if (!sessionButton) return;
        const active = host.isLocalTestSessionActive();
        sessionButton.dataset.active = String(active);
        sessionButton.textContent = active
            ? "End simulated assistant session"
            : "Start simulated assistant session";
    }

    function isRiskyAction(action) {
        if (/^(request\.create|food\.(add_item|set_quantity|remove_item|submit_order)|notification\.mark_(read|all_read)|notification\.open|feedback\.(answer|submit))$/.test(action.action)) {
            return true;
        }
        return action.action === "ui.click";
    }

    function addSuggestion(list, label, action, query) {
        const searchText = normalize(label + " " + (action.path || action.optionValue || ""));
        const tokens = query.split(/\s+/).filter(function (word) {
            return word && !["a", "an", "can", "for", "i", "in", "is", "my", "of", "on", "please", "the", "to", "want", "with"].includes(word);
        });
        if (tokens.length && !tokens.some(function (word) { return searchText.includes(word); })) return;
        list.push({ label: label, action: action });
    }

    function buildSuggestions() {
        const context = host.getCurrentContext();
        if (!context) return [];

        const query = normalize(input && input.value);
        const list = [];
        (context.actions || []).forEach(function (item) {
            if (item.disabled) return;
            if (item.route) {
                addSuggestion(list, "Open " + item.label, { action: "navigate", path: item.route }, query);
            } else if (item.targetId) {
                addSuggestion(list, "Click " + item.label, {
                    action: "ui.click",
                    targetId: item.targetId,
                    label: item.label
                }, query);
            }
        });

        (context.controls || []).forEach(function (control) {
            (control.options || []).forEach(function (option) {
                if (option.disabled || String(option.value) === String(control.selected && control.selected.value || "")) return;
                addSuggestion(list, "Select " + option.label + " in " + (control.label || control.id), {
                    action: "ui.select",
                    controlId: control.id || control.label,
                    optionValue: option.value
                }, query);
            });
        });
        (context.choices || []).forEach(function (choice) {
            if (choice.disabled || !choice.targetId) return;
            addSuggestion(list, "Select " + (choice.label || choice.value || "choice"), {
                action: "ui.set_choice",
                targetId: choice.targetId,
                checked: true
            }, query);
        });

        if (input && input.value.trim()) {
            (context.fields || []).forEach(function (field) {
                const fieldName = normalize(field.label + " " + field.placeholder);
                if (!field.targetId || fieldName && !query.split(" ").some(function (word) { return fieldName.includes(word); })
                    && !/remark|comment|description|feedback|message|reason|note/.test(fieldName)) return;
                list.push({
                    label: "Fill " + (field.label || "visible field"),
                    action: { action: "ui.fill", targetId: field.targetId, label: field.label, value: input.value.trim() }
                });
            });
        }

        const route = String(context.route || "").toLowerCase();
        if (/\/home(?:\/index)?$/.test(route)) {
            addSuggestion(list, "Explore Food & Dining", { action: "food.intent", intent: "explore" }, query);
            addSuggestion(list, "Start a food order", { action: "food.intent", intent: "order" }, query);
        }

        const requestModule = route.includes("roomcomfort") ? "room_comfort"
            : route.includes("logisitics") ? "logistics"
                : route.includes("/fooddining/otherservices") ? "food_other_services" : "";
        if (requestModule) {
            (context.items || []).filter(function (item) {
                const category = item.name || item.label || "";
                return item.categoryId && !item.disabled
                    && !(requestModule === "logistics" && /prepare guest pass/i.test(category));
            }).forEach(function (item) {
                const category = item.name || item.label || "request";
                const quantityMatch = query.match(/\b(?:quantity|qty|need|want|add)\s+(one|two|three|four|five|\d+)\b/);
                addSuggestion(list, "Create " + category + " request", {
                    action: "request.create",
                    module: requestModule,
                    categoryId: item.categoryId,
                    category: category,
                    quantity: testQuantity(quantityMatch && quantityMatch[1], 1),
                    remarks: input && input.value.trim() || category
                }, query);
            });
        }

        const notificationItems = (context.items || []).filter(function (item) {
            return item.notificationId;
        });
        if (query.includes("notification") || query.includes("alert")) {
            addSuggestion(list, "Load latest notifications", { action: "notification.list" }, query);
        }
        notificationItems.forEach(function (item) {
            const name = item.name || item.label || "notification";
            addSuggestion(list, "Open notification: " + name, {
                action: "notification.open",
                notificationId: item.notificationId
            }, query);
            if (!item.notificationRead) {
                addSuggestion(list, "Mark notification as read: " + name, {
                    action: "notification.mark_read",
                    notificationId: item.notificationId
                }, query);
            }
        });
        if (query.includes("mark all")) {
            addSuggestion(list, "Mark all notifications as read", { action: "notification.mark_all_read" }, query);
        }

        if (route.includes("/overallfeedback/")) {
            (context.items || []).filter(function (item) {
                return item.feedbackQuestionId || item.feedbackDepartmentId;
            }).forEach(function (item) {
                const question = item.name || item.label || "feedback question";
                (item.feedbackChoices || []).forEach(function (choice) {
                    addSuggestion(list, "Answer " + question + ": " + choice, {
                        action: "feedback.answer",
                        questionId: item.feedbackQuestionId,
                        departmentId: item.feedbackDepartmentId,
                        question: question,
                        value: choice
                    }, query);
                });
                if (input && input.value.trim() && ["text", "comments"].includes(item.feedbackType)) {
                    addSuggestion(list, "Enter your response for " + question, {
                        action: "feedback.answer",
                        questionId: item.feedbackQuestionId,
                        departmentId: item.feedbackDepartmentId,
                        question: question,
                        value: input.value.trim()
                    }, query);
                }
            });
            if ((context.actions || []).some(function (item) {
                return !item.disabled && /submit feedback/i.test(item.label);
            })) {
                addSuggestion(list, "Submit feedback", { action: "feedback.submit" }, query);
            }
        }

        if (route.includes("/mydailycare/")) {
            const videoUrl = input && input.value.match(/https?:\/\/[^\s]+/i);
            if (videoUrl) {
                addSuggestion(list, "Play the supplied video", {
                    action: "video.play",
                    videoUrl: videoUrl[0],
                    title: "Video"
                }, query);
            }
            if ((context.actions || []).some(function (item) {
                return !item.disabled && /back to my daily care/i.test(item.label);
            })) {
                addSuggestion(list, "Stop the current video", { action: "video.stop" }, query);
            }
        }

        (context.items || []).forEach(function (item) {
            const route = item.voiceRoute || (!item.disabled && item.route);
            if (!route) return;
            addSuggestion(list, "Open " + (item.name || item.label), {
                action: "navigate",
                path: route
            }, query);
        });

        const menuItems = (context.items || []).filter(function (item) {
            return item.foodId && !item.disabled;
        }).slice(0, 30);
        if (menuItems.length) {
            const remove = /\b(remove|delete)\b/.test(query);
            const decrease = /\b(minus|decrease|subtract|less)\b/.test(query);
            const setQuantity = query.match(/\b(?:quantity|qty)\s*(?:to\s*)?(zero|one|two|three|four|five|\d+)\b|\bset\s+(?:to\s*)?(zero|one|two|three|four|five|\d+)\b/);
            const addCount = query.match(/\badd\s+(one|two|three|four|five|\d+)\b/);
            menuItems.forEach(function (item) {
                const name = item.name || item.label || "menu item";
                const action = remove
                    ? { action: "food.remove_item", itemId: item.foodId, itemName: name, meal: item.meal || "" }
                    : decrease
                        ? { action: "food.set_quantity", itemId: item.foodId, itemName: name, meal: item.meal || "", quantity: Math.max(0, (Number(item.quantity) || 0) - 1) }
                        : setQuantity
                            ? { action: "food.set_quantity", itemId: item.foodId, itemName: name, meal: item.meal || "", quantity: testQuantity(setQuantity[1] || setQuantity[2], 0, 0) }
                            : { action: "food.add_item", itemId: item.foodId, itemName: name, meal: item.meal || "", quantity: testQuantity(addCount && addCount[1], 1) };
                const label = remove ? "Remove " + name
                    : decrease ? "Decrease " + name + " quantity"
                        : setQuantity ? "Set " + name + " quantity"
                            : "Add " + action.quantity + " " + name;
                addSuggestion(list, label, action, query || normalize(name));
            });
            addSuggestion(list, "List the current menu", { action: "food.list_menu" }, query);
            if ((context.actions || []).some(function (item) {
                return !item.disabled && /review order|checkout|view cart/i.test(item.label);
            })) {
                addSuggestion(list, "Review the current order", { action: "food.review_order" }, query);
            }
            if (route.includes("/fooddining/menuitems")
                && menuItems.some(function (item) { return Number(item.quantity) > 0; })) {
                addSuggestion(list, "Submit the current order", { action: "food.submit_order" }, query);
            }
        }

        if (route.includes("/fooddining/revieworder")
            && (context.actions || []).some(function (item) {
                return !item.disabled && /confirm order|place order|submit order/i.test(item.label);
            })) {
            addSuggestion(list, "Place the order", { action: "food.submit_order" }, query);
        }

        (context.items || []).forEach(function (item) {
            if (!item.disabled && item.orderType) {
                addSuggestion(list, "Choose " + (item.name || item.label) + " ordering", {
                    action: "food.select_order_type",
                    orderType: item.orderType
                }, query);
            }
            if (!item.disabled && item.orderMode) {
                addSuggestion(list, "Choose " + (item.name || item.label), {
                    action: "food.select_mode",
                    mode: item.orderMode
                }, query);
            }
        });
        if (route.includes("/fooddining/menuitems")) {
            addSuggestion(list, "List current menu", { action: "food.list_menu" }, query);
            addSuggestion(list, "Review current order", { action: "food.review_order" }, query);
        }

        return list.slice(0, 80);
    }

    function renderSuggestions() {
        if (!suggestionsElement) return;
        const suggestions = buildSuggestions();
        suggestionsElement.replaceChildren();
        if (!suggestions.length) {
            const empty = document.createElement("p");
            empty.className = "unified-ai-test-empty";
            empty.textContent = "No matching actions are visible on this screen.";
            suggestionsElement.appendChild(empty);
            return;
        }
        const fragment = document.createDocumentFragment();
        suggestions.forEach(function (suggestion) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "unified-ai-test-suggestion";
            button.textContent = suggestion.label;
            button.addEventListener("click", function () {
                runAction(suggestion.action, suggestion.label);
            });
            fragment.appendChild(button);
        });
        suggestionsElement.appendChild(fragment);
    }

    function runAction(action, label) {
        if (isRiskyAction(action) && !riskyActionsConfirmed) {
            if (!window.confirm("This test action may change app data. Continue only if this is a confirmed test database.")) return;
            riskyActionsConfirmed = true;
        }
        action.request_id = "local-test-" + Date.now() + "-" + (++requestSequence);
        status.textContent = "Running";
        output.textContent = "Testing: " + label;
        host.handleAction(action);
    }

    launcher.addEventListener("click", function () {
        panel.hidden = !panel.hidden;
        launcher.setAttribute("aria-expanded", String(!panel.hidden));
        if (!panel.hidden) renderSuggestions();
    });
    if (closeButton) closeButton.addEventListener("click", function () {
        panel.hidden = true;
        launcher.setAttribute("aria-expanded", "false");
    });
    if (sessionButton) sessionButton.addEventListener("click", function () {
        if (sessionButton.dataset.active === "true") {
            host.endLocalTestSession();
            sessionButton.dataset.active = "false";
            sessionButton.textContent = "Start simulated assistant session";
        } else if (host.startLocalTestSession()) {
            sessionButton.dataset.active = "true";
            sessionButton.textContent = "End simulated assistant session";
            panel.hidden = false;
            launcher.setAttribute("aria-expanded", "true");
        } else {
            status.textContent = "A real call is already active";
        }
        syncSessionButton();
        renderSuggestions();
    });
    if (input) {
        input.addEventListener("input", renderSuggestions);
        input.addEventListener("keydown", function (event) {
            if (event.key !== "Enter") return;
            const firstSuggestion = suggestionsElement && suggestionsElement.querySelector("button");
            if (firstSuggestion) {
                event.preventDefault();
                firstSuggestion.click();
            }
        });
    }

    window.addEventListener("unified-ai:test-context-changed", function () {
        syncSessionButton();
        renderSuggestions();
    });
    window.addEventListener("unified-ai:action-result", function (event) {
        const result = event.detail || {};
        status.textContent = result.success ? "Success" : "Failed";
        output.textContent = JSON.stringify(result, null, 2);
        renderSuggestions();
    });
    new MutationObserver(function () {
        const state = document.body.getAttribute("data-state");
        if ((state === "connecting" || state === "connected") && sessionButton) {
            sessionButton.dataset.active = "false";
            sessionButton.textContent = "Start simulated assistant session";
            status.textContent = "Real call active";
        }
    }).observe(document.body, { attributes: true, attributeFilter: ["data-state"] });
    syncSessionButton();
    renderSuggestions();
})();
