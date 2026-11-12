(function () {
    "use strict";

    var root = document.getElementById("langSwitcher");
    var btn = document.getElementById("langBtn");
    var menu = document.getElementById("langMenu");
    var btnCode = document.getElementById("langBtnCode");
    if (!root || !btn || !menu) return;

    var LANGUAGES = [
        { value: "en-IN", code: "EN", label: "English" },
        { value: "hi-IN", code: "HI", label: "हिन्दी" },
        { value: "ta-IN", code: "TA", label: "தமிழ்" },
        { value: "te-IN", code: "TE", label: "తెలుగు" },
        { value: "ml-IN", code: "ML", label: "മലയാളം" },
        { value: "ar-SA", code: "AR", label: "العربية" }
    ];

    var SUPPORTED = "hi,ta,te,ml,ar";

    function readStored() {
        try { return sessionStorage.getItem("__culture"); } catch (_) { return null; }
    }

    var urlCulture = new URL(location.href).searchParams.get("culture");
    var culture = urlCulture || root.getAttribute("data-current-culture") || readStored() || "en-IN";
    var lang = culture.split("-")[0].toLowerCase();

    window.addEventListener("error", function (e) {
        if (e && e.message && e.message.indexOf("Maximum call stack size exceeded") > -1) {
            e.preventDefault();
        }
    }, true);

    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
        meta = document.createElement("meta");
        meta.name = "viewport";
        document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

    function cookieDomains() {
        var host = location.hostname;
        var list = [null];
        if (host.indexOf(".") > 0 && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
            var parts = host.split(".");
            for (var i = 0; i <= parts.length - 2; i++) {
                var d = parts.slice(i).join(".");
                list.push(d);
                list.push("." + d);
            }
        }
        return list;
    }

    function cookiePaths() {
        var list = ["/", ""];
        var segs = location.pathname.split("/").filter(Boolean);
        var acc = "";
        for (var i = 0; i < segs.length; i++) {
            acc += "/" + segs[i];
            list.push(acc);
        }
        return list;
    }

    function clearGoogTrans() {
        var domains = cookieDomains();
        var paths = cookiePaths();
        for (var i = 0; i < domains.length; i++) {
            for (var j = 0; j < paths.length; j++) {
                var c = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
                if (paths[j]) c += "; path=" + paths[j];
                if (domains[i]) c += "; domain=" + domains[i];
                document.cookie = c;
            }
        }
    }

    function setGoogTrans(target) {
        clearGoogTrans();
        if (target) {
            document.cookie = "googtrans=/en/" + target + "; path=/";
        }
    }

    function forceLanguage(target) {
        var tries = 0;
        var timer = setInterval(function () {
            tries++;
            var combo = document.querySelector("select.goog-te-combo");
            if (combo) {
                clearInterval(timer);
                if (combo.value !== target) {
                    combo.value = target;
                    combo.dispatchEvent(new Event("change", { bubbles: true }));
                }
                return;
            }
            if (tries > 48) clearInterval(timer);
        }, 250);
    }

    function renderOptions() {
        var current = culture.split("-")[0].toLowerCase();
        var html = "";
        for (var i = 0; i < LANGUAGES.length; i++) {
            var l = LANGUAGES[i];
            var isSel = l.value.split("-")[0].toLowerCase() === current;
            html += '<li class="lang-option" role="option" value="' + l.value + '"' +
                ' aria-selected="' + (isSel ? "true" : "false") + '" tabindex="0">' +
                l.label + '</li>';
        }
        menu.innerHTML = html;
    }

    function syncButtonLabel() {
        if (!btnCode) return;
        var cur = culture.split("-")[0].toLowerCase();
        for (var i = 0; i < LANGUAGES.length; i++) {
            if (LANGUAGES[i].value.split("-")[0].toLowerCase() === cur) {
                btnCode.textContent = LANGUAGES[i].code;
                return;
            }
        }
        btnCode.textContent = "EN";
    }

    function positionMenu() {
        var r = btn.getBoundingClientRect();
        var vw = window.innerWidth;
        var vh = window.innerHeight;

        menu.style.display = "block";
        var mWidth = Math.max(180, r.width);
        menu.style.minWidth = mWidth + "px";

        var isRTL = document.documentElement.dir === "rtl";

        if (isRTL) {
            var right = vw - r.right;
            if (right + mWidth > vw - 12) right = vw - mWidth - 12;
            menu.style.right = Math.max(12, right) + "px";
            menu.style.left = "auto";
        } else {
            var left = r.left;
            if (left + mWidth > vw - 12) left = vw - mWidth - 12;
            menu.style.left = Math.max(12, left) + "px";
            menu.style.right = "auto";
        }

        var spaceBelow = vh - r.bottom - 12;
        var spaceAbove = r.top - 12;

        if (spaceBelow < 250 && spaceAbove > spaceBelow) {
            menu.style.top = "auto";
            menu.style.bottom = (vh - r.top + 6) + "px";
            menu.style.maxHeight = Math.max(120, spaceAbove) + "px";
        } else {
            menu.style.bottom = "auto";
            menu.style.top = (r.bottom + 6) + "px";
            menu.style.maxHeight = Math.max(120, spaceBelow) + "px";
        }
    }

    function onScrollResize() { positionMenu(); }

    function initDropdown() {
        function setOpen(open) {
            root.classList.toggle("open", open);
            btn.setAttribute("aria-expanded", String(open));
            if (open) {
                positionMenu();
                window.addEventListener("scroll", onScrollResize, { passive: true, capture: true });
                window.addEventListener("resize", onScrollResize);
            } else {
                window.removeEventListener("scroll", onScrollResize, { capture: true });
                window.removeEventListener("resize", onScrollResize);
                if (menu) menu.style.display = "none";
            }
        }

        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!root.classList.contains("open"));
        });

        root.addEventListener("click", function (e) {
            if (e.target === root) return;
            var opt = e.target.closest ? e.target.closest(".lang-option") : null;
            if (opt) {
                e.preventDefault();
                e.stopPropagation();
                var value = opt.getAttribute("value") || "en-IN";
                var picked = value.split("-")[0].toLowerCase();
                try { sessionStorage.setItem("__culture", value); } catch (_) { }
                setGoogTrans(picked === "en" ? null : picked);
                var url = new URL(location.href);
                url.searchParams.set("culture", value);
                location.replace(url.toString());
                return;
            }
        });

        document.addEventListener("click", function (e) {
            if (!root.classList.contains("open")) return;
            if (!root.contains(e.target)) setOpen(false);
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && root.classList.contains("open")) {
                setOpen(false);
                btn.focus();
            }
        });
    }

    function showLoader(show) {
        var el = document.getElementById("i18n-loader");
        if (el) el.style.display = show ? "flex" : "none";
    }

    function injectCss() {
        var css =
            ".goog-te-banner-frame,.goog-te-balloon-frame,#goog-gt-tt,.goog-tooltip,.goog-tooltip:hover," +
            ".VIpgJd-ZVi9od-ORHb-OEVmcd,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf,.VIpgJd-yAWNEb-L7lbkb,body>.skiptranslate{display:none!important;}" +
            "body{top:0!important;position:static!important;margin-top:0!important;}" +
            "html{margin-top:0!important;padding-top:0!important;overflow-x:hidden!important;}" +
            ".goog-text-highlight{background:none!important;box-shadow:none!important;}" +
            "font{background:transparent!important;box-shadow:none!important;font-size:inherit!important;font-family:inherit!important;line-height:inherit!important;letter-spacing:inherit!important;}" +
            "#google_translate_element{position:absolute!important;left:-9999px!important;top:0!important;width:0!important;height:0!important;overflow:hidden!important;}";
        var s = document.createElement("style");
        s.className = "notranslate";
        s.setAttribute("translate", "no");
        s.textContent = css;
        document.head.appendChild(s);
    }

    function startTranslation() {
        if (lang === "en") {
            setGoogTrans(null);
            showLoader(false);
            return;
        }

        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

        setGoogTrans(lang);
        injectCss();
        showLoader(true);

        var finished = false;
        var startTime = Date.now();

        var MAX_WAIT_MS = 8000;
        var AFTER_TRANSLATION_MS = 2500;

        var checkTimer = null;
        var finishTimer = null;

        function isTranslated() {
            var cls = document.documentElement.className || "";
            return (
                cls.indexOf("translated-ltr") !== -1 ||
                cls.indexOf("translated-rtl") !== -1
            );
        }

        function finish() {
            if (finished) return;
            finished = true;

            if (checkTimer) {
                clearInterval(checkTimer);
                checkTimer = null;
            }

            if (finishTimer) {
                clearTimeout(finishTimer);
                finishTimer = null;
            }

            setTimeout(function () {
                showLoader(false);
            }, 200);
        }

        function translationStarted() {
            if (finished) return;

            if (isTranslated()) {
                if (!finishTimer) {
                    finishTimer = setTimeout(function () {
                        finish();
                    }, AFTER_TRANSLATION_MS);
                }
                return;
            }

            if (Date.now() - startTime >= MAX_WAIT_MS) {
                finish();
            }
        }

        var holder = document.getElementById("google_translate_element");
        if (!holder) {
            holder = document.createElement("div");
            holder.id = "google_translate_element";
            holder.className = "notranslate";
            holder.setAttribute("translate", "no");
            document.body.appendChild(holder);
        }

        window.__gtInit = function () {
            try {
                new google.translate.TranslateElement({
                    pageLanguage: "en",
                    includedLanguages: SUPPORTED,
                    autoDisplay: false,
                    multilanguagePage: true
                }, "google_translate_element");
                forceLanguage(lang);
            } catch (e) {
                console.error("[i18n] Google Translate initialization failed:", e);
                finish();
            }
        };

        checkTimer = setInterval(function () {
            translationStarted();
        }, 200);

        var existingScript = document.querySelector(
            'script[src*="translate.google.com/translate_a/element.js"]'
        );

        if (!existingScript) {
            var sc = document.createElement("script");
            sc.src = "https://translate.google.com/translate_a/element.js?cb=__gtInit";
            sc.async = true;
            sc.onerror = function () {
                console.error("[i18n] Google Translate failed to load.");
                finish();
            };
            document.head.appendChild(sc);
        } else if (window.google && google.translate && google.translate.TranslateElement) {
            window.__gtInit();
        }

        setTimeout(function () {
            finish();
        }, MAX_WAIT_MS);
    }

    function init() {
        syncButtonLabel();
        renderOptions();
        initDropdown();
        startTranslation();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();