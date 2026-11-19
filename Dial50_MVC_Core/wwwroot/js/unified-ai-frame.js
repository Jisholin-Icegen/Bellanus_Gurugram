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

    window.UnifiedAIChild = {
        respond: respond
    };

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
