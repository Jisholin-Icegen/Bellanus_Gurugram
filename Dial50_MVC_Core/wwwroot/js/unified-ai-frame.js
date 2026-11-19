(function () {
    const params = new URLSearchParams(window.location.search);
    if (window.parent === window || (params.get("UnifiedAI") !== "1" && params.get("Unified") !== "1")) return;

    function respond(action, success, result, error) {
        if (!action || !action.request_id) return;

        window.parent.postMessage({
            type: "unified_ai_action_result",
            request_id: action.request_id,
            success: !!success,
            result: result || null,
            error: error || null
        }, window.location.origin);
    }

    function keepUnifiedRoute(url) {
        const target = new URL(url, window.location.href);
        if (target.origin !== window.location.origin) return null;
        const bedInfo = target.searchParams.get("BedInfo") || sessionStorage.getItem("bedInfo");
        if (bedInfo) target.searchParams.set("BedInfo", bedInfo);
        target.searchParams.set("Unified", "1");
        target.searchParams.set("UnifiedAI", "1");
        return target;
    }

    function isUnifiedHomePath(pathname) {
        return /\/(?:home(?:\/index)?|ai\/chat)\/?$/i.test(pathname);
    }

    function resolveRequestCategory(categories, input) {
        const stopWords = new Set(["a", "an", "can", "create", "for", "i", "is", "make", "my", "on", "please", "raise", "request", "service", "submit", "the", "want", "would", "you"]);
        const normalize = function (value) {
            return String(value || "")
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, " ")
                .trim()
                .split(/\s+/)
                .filter(function (word) { return word && !stopWords.has(word); })
                .join(" ");
        };
        const requested = normalize(input);
        if (!requested) return null;

        const matches = (categories || []).filter(function (category) {
            const name = normalize(category.CategoryDescription || category.name || category.title);
            return name && (name === requested || requested.indexOf(" " + name + " ") >= 0
                || (" " + requested + " ").indexOf(" " + name + " ") >= 0);
        });
        return matches.length === 1 ? matches[0] : null;
    }

    function normalizeText(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function redactPatientIdentifiers(value) {
        let text = normalizeText(value);
        const context = window.BedContext && window.BedContext.get ? window.BedContext.get() : {};
        ["bedInfo", "bedId", "patientName", "roomNumber", "roomBed", "bedNumber", "uhid", "userId", "ward"]
            .map(function (key) { return String(context[key] || "").trim(); })
            .filter(function (identifier) { return identifier.length >= 3; })
            .forEach(function (identifier) {
                const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                text = text.replace(new RegExp(escaped, "ig"), "[redacted]");
            });
        return text.slice(0, 240);
    }

    function isSafeControl(select) {
        return !/bed|patient|room|uhid|user|token|password|doctor|physician|provider/i.test(
            [select.id, select.name, select.getAttribute("aria-label")].join(" ")
        ) && !select.closest("#headerPatientInfo, .patient-info, .patient-details, [data-patient-info]");
    }

    function isVisible(element) {
        if (!(element instanceof Element) || element.closest("[hidden], [aria-hidden='true']")) return false;
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
    }

    function safeRoute(element) {
        if (!element || !element.href) return "";
        const url = new URL(element.href, window.location.href);
        return url.origin === window.location.origin ? url.pathname : "";
    }

    function pageContext() {
        const controls = Array.from(document.querySelectorAll("select"))
            .filter(isVisible)
            .filter(isSafeControl)
            .slice(0, 20)
            .map(function (select) {
                const labels = Array.from(select.labels || []).map(function (label) { return label.textContent; });
                return {
                    id: select.id || "",
                    label: redactPatientIdentifiers(select.getAttribute("aria-label") || labels.join(" ") || select.name || select.id),
                    selected: select.options[select.selectedIndex]
                        ? { value: redactPatientIdentifiers(select.value), label: redactPatientIdentifiers(select.options[select.selectedIndex].textContent) }
                        : null,
                    options: Array.from(select.options).slice(0, 60).map(function (option) {
                        return {
                            value: redactPatientIdentifiers(option.value),
                            label: redactPatientIdentifiers(option.textContent),
                            disabled: option.disabled
                        };
                    })
                };
            });
        const itemSelector = ".service-card, .food-card, .menu-card-v2, .rec-card, .meal-select-pill, .meal-tab-box, .selection-card, .timing-card, .feedback-question, .card, [data-category-id], [data-food-id], [data-order-type], [data-order-mode]";
        const items = Array.from(document.querySelectorAll(itemSelector))
            .filter(isVisible)
            .filter(function (item) { return !item.closest("#headerPatientInfo, .patient-info, .patient-details, [data-patient-info]"); })
            .slice(0, 100)
            .map(function (item) {
                const nameElement = item.querySelector(".food-title, .rec-title, .service-title, .tab-name, .meal-label-name, .question-text, h3, h4");
                const isMenuItem = item.classList.contains("menu-card-v2") || item.classList.contains("rec-card");
                const row = {
                    label: redactPatientIdentifiers(isMenuItem && nameElement
                        ? nameElement.textContent
                        : item.innerText || item.textContent)
                };
                if (nameElement) row.name = redactPatientIdentifiers(nameElement.textContent);
                row.disabled = !!item.disabled || item.classList.contains("disabled-card")
                    || item.getAttribute("aria-disabled") === "true";
                const categoryId = item.getAttribute("data-category-id");
                const foodId = item.getAttribute("data-food-id");
                const route = item.getAttribute("data-route");
                if (categoryId) row.categoryId = categoryId;
                if (foodId) row.foodId = foodId;
                const meal = item.getAttribute("data-meal-type") || item.getAttribute("data-mealname");
                if (meal) row.meal = redactPatientIdentifiers(meal);
                if (route && route.startsWith("/")) row.route = route.split("?")[0];
                const orderType = item.getAttribute("data-order-type");
                if (orderType) row.orderType = orderType;
                const orderMode = item.getAttribute("data-order-mode");
                if (orderMode) row.orderMode = orderMode;
                if (item.classList.contains("feedback-question")) {
                    if (item.dataset.questionId) row.feedbackQuestionId = item.dataset.questionId;
                    if (item.dataset.departmentId) row.feedbackDepartmentId = item.dataset.departmentId;
                    if (item.dataset.type) row.feedbackType = item.dataset.type;
                    row.feedbackChoices = Array.from(item.querySelectorAll(".rating-option"))
                        .map(function (option) { return option.dataset.value; })
                        .filter(Boolean);
                }
                if (foodId) {
                    const cartItem = window.currentCart && window.currentCart[String(foodId) + "_" + String(meal || "")];
                    row.quantity = cartItem ? Number(cartItem.qty) || 0 : 0;
                }
                return row;
            })
            .filter(function (item) { return item.label; });
        const actions = Array.from(document.querySelectorAll("button, a[href], [role='button']"))
            .filter(isVisible)
            .slice(0, 100)
            .map(function (element) {
                const label = redactPatientIdentifiers(element.getAttribute("aria-label")
                    || element.getAttribute("title")
                    || element.innerText
                    || element.textContent);
                const route = safeRoute(element);
                const action = element.getAttribute("data-action");
                return label ? {
                    label: label,
                    disabled: !!element.disabled || element.getAttribute("aria-disabled") === "true",
                    id: element.id || undefined,
                    action: action || undefined,
                    route: route || undefined
                } : null;
            })
            .filter(Boolean);

        return {
            route: window.location.pathname,
            title: redactPatientIdentifiers(document.title),
            headings: Array.from(document.querySelectorAll("h1, h2, h3"))
                .filter(isVisible)
                .slice(0, 20)
                .map(function (heading) { return redactPatientIdentifiers(heading.innerText || heading.textContent); })
                .filter(Boolean),
            controls: controls,
            items: items,
            actions: actions
        };
    }

    let lastContextJson = "";
    let contextTimer = null;
    function sendPageContext() {
        contextTimer = null;
        const context = pageContext();
        let encoded = JSON.stringify(context);
        while (encoded.length > 18000 && context.items.length > 10) {
            context.items.pop();
            encoded = JSON.stringify(context);
        }
        if (encoded === lastContextJson) return;
        lastContextJson = encoded;
        window.parent.postMessage({ type: "unified_ai_page_context", context: context }, window.location.origin);
    }

    function schedulePageContext() {
        if (contextTimer) clearTimeout(contextTimer);
        contextTimer = setTimeout(sendPageContext, 250);
    }

    function selectVisibleOption(action) {
        const controlKey = normalizeText(action.controlId || action.control || action.controlName || action.label).toLowerCase();
        const optionWasProvided = action.optionValue !== undefined && action.optionValue !== null
            || action.option !== undefined && action.option !== null
            || action.value !== undefined && action.value !== null;
        const requestedOption = normalizeText(action.optionValue !== undefined ? action.optionValue
            : action.option !== undefined ? action.option
                : action.value).toLowerCase();
        if (!controlKey || !optionWasProvided) {
            respond(action, false, null, "A visible dropdown and option are required.");
            return;
        }

        const selects = Array.from(document.querySelectorAll("select")).filter(isVisible).filter(isSafeControl);
        const matchingSelects = selects.filter(function (select) {
            const labels = Array.from(select.labels || []).map(function (label) { return label.textContent; });
            return [select.id, select.name, select.getAttribute("aria-label")].concat(labels)
                .some(function (value) { return normalizeText(value).toLowerCase() === controlKey; });
        });
        if (matchingSelects.length !== 1) {
            respond(action, false, null, matchingSelects.length ? "Dropdown name is ambiguous." : "Visible dropdown was not found.");
            return;
        }

        const select = matchingSelects[0];
        const matchingOptions = Array.from(select.options).filter(function (option) {
            return !option.disabled && (normalizeText(option.value).toLowerCase() === requestedOption
                || normalizeText(option.textContent).toLowerCase() === requestedOption);
        });
        if (matchingOptions.length !== 1) {
            respond(action, false, {
                options: Array.from(select.options).filter(function (option) { return !option.disabled; })
                    .map(function (option) { return { value: option.value, label: redactPatientIdentifiers(option.textContent) }; })
            }, matchingOptions.length ? "Dropdown option is ambiguous." : "Dropdown option was not found.");
            return;
        }

        select.value = matchingOptions[0].value;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
        schedulePageContext();
        respond(action, true, {
            controlId: select.id || select.name,
            selected: redactPatientIdentifiers(matchingOptions[0].textContent)
        });
    }

    window.UnifiedAIChild = {
        respond: respond,
        resolveRequestCategory: resolveRequestCategory,
        sendPageContext: schedulePageContext,
        showChat: function () {
            window.parent.postMessage({ type: "unified_ai_show_chat" }, window.location.origin);
        },
        navigate: function (url) {
            const target = keepUnifiedRoute(url);
            if (!target) throw new Error("Unified AI navigation must stay on this site.");
            if (isUnifiedHomePath(target.pathname)) {
                window.UnifiedAIChild.showChat();
                return;
            }
            window.location.href = target.toString();
        }
    };

    if (window.BedContext && typeof window.BedContext.go === "function" && typeof window.BedContext.url === "function") {
        window.BedContext.go = function (page, extra) {
            window.UnifiedAIChild.navigate(window.BedContext.url(page, extra));
        };
    }

    document.addEventListener("click", function (event) {
        const element = event.target instanceof Element ? event.target : null;
        const link = element && element.closest("a[href]");
        if (!link || link.hasAttribute("download") || link.target === "_blank") return;
        const target = keepUnifiedRoute(link.href);
        if (!target) return;
        if (isUnifiedHomePath(target.pathname)) {
            event.preventDefault();
            window.UnifiedAIChild.showChat();
            return;
        }
        link.href = target.toString();
    }, true);

    document.addEventListener("submit", function (event) {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;
        const target = keepUnifiedRoute(form.action || window.location.href);
        if (!target) return;
        if (form.method.toLowerCase() === "get") {
            form.action = target.toString();
            return;
        }

        ["BedInfo", "UnifiedAI"].forEach(function (name) {
            let input = form.querySelector('input[type="hidden"][name="' + name + '"]');
            const value = target.searchParams.get(name);
            if (!input && !value) return;
            if (!input) {
                input = document.createElement("input");
                input.type = "hidden";
                input.name = name;
                form.appendChild(input);
            }
            if (value) input.value = value;
        });
    }, true);

    window.addEventListener("message", function (event) {
        if (event.source !== window.parent || event.origin !== window.location.origin) return;
        if (!event.data || event.data.type !== "unified_ai_action") return;

        window.dispatchEvent(new CustomEvent("unified-ai:action", {
            detail: event.data.action
        }));
    });

    window.addEventListener("unified-ai:action", function (event) {
        const action = event.detail;
        if (action && action.action === "ui.select") selectVisibleOption(action);
    });

    document.addEventListener("change", schedulePageContext, true);
    document.addEventListener("input", schedulePageContext, true);
    document.addEventListener("click", schedulePageContext, true);
    new MutationObserver(schedulePageContext).observe(document.body, {
        childList: true,
        attributes: true,
        subtree: true,
        characterData: true
    });

    window.addEventListener("unified-ai:action-result", function (event) {
        const detail = event.detail || {};
        respond(detail.action, detail.success, detail.result, detail.error);
    });

    window.parent.postMessage({ type: "unified_ai_frame_ready" }, window.location.origin);
    schedulePageContext();
})();
