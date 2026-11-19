(function () {
    const params = new URLSearchParams(window.location.search);
    if (window.parent === window || params.get("UnifiedAI") !== "1") return;

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
        target.searchParams.set("UnifiedAI", "1");
        return target;
    }

    function isUnifiedHomePath(pathname) {
        return /\/(?:home(?:\/index)?|ai\/chat)\/?$/i.test(pathname);
    }

    window.UnifiedAIChild = {
        respond: respond,
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

    window.addEventListener("unified-ai:action-result", function (event) {
        const detail = event.detail || {};
        respond(detail.action, detail.success, detail.result, detail.error);
    });

    window.parent.postMessage({ type: "unified_ai_frame_ready" }, window.location.origin);
})();
