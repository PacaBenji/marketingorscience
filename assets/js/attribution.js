// attribution.js — marketingorscience.com
// Centralized first-touch attribution for whitelisting (WL) traffic.
//
// On landing, captures traffic parameters (ad-network ids, UTMs) plus a
// generated `path_source` (landing-page slug) into one record persisted for
// 30 days (localStorage -> first-party cookie -> in-memory). On outbound
// clicks to the main (brand) domains, forwards the persisted parameters via
// buildOutboundURL()/tagLinks(). The visitor's original utm_source is NOT
// forwarded as utm_source: outbound utm_source is this site's code ("mos",
// Marketing or Science) and the original value is forwarded as `channel`.
//
// Exposed as window.MOS_Attribution (also require()-able for tests):
//   capture([url])            parse + persist params from a URL (default: current)
//   load()                    -> persisted params object | null (expiry-aware)
//   buildOutboundURL(url)     -> URL string with params appended for main domains,
//                                unchanged string for anything else
//   tagLinks([root])          rewrite main-domain <a href>s in place
//   isMainDomain(url)         -> boolean
//   getPathSource([url])      -> slug generated from a URL/pathname
//   config                    keys, main domains, WL utm_source, TTL
//
// No identifiers are logged anywhere by this module.

(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.MOS_Attribution = api;
        if (root.document) api.init();
    }
})(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    // ── Configuration ───────────────────────────────────────────────────────
    var STORAGE_KEY = 'mos_attribution_v1';
    var COOKIE_NAME = 'mos_attribution';
    var TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    var MAX_VALUE_LENGTH = 2048;

    // Main (brand) domains — mirrors OUTBOUND_EVENTS in assets/js/tracking.js,
    // which is the repo's existing outbound-click configuration. Subdomains
    // of these hosts are included (host === domain or *.domain).
    var MAIN_DOMAINS = ['getreyou.com', 'pacagen.com', 'drinkwildtype.com'];

    // WL brand: "Marketing or Science" (site <title>, MoS logo, MOS_* globals)
    // -> initials "mos". Sent as utm_source on main-domain CTAs.
    var WL_UTM_SOURCE = 'mos';

    // Parameters captured from the landing URL and persisted. utm_source is
    // captured here too, but remapped to `channel` on outbound URLs.
    var CAPTURE_KEYS = [
        'tw_source', 'tw_adid',
        'cvg_source', 'cvg_adid', 'cvg_cid',
        'fbclid',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
        'utm_term', 'utm_id',
        'campaign_id', 'ad_id',
        'path_source'
    ];

    // Identifier keys whose change signals a genuinely new ad visit.
    var AD_ID_KEYS = [
        'fbclid', 'tw_adid', 'cvg_adid', 'cvg_cid',
        'utm_id', 'campaign_id', 'ad_id'
    ];

    // Forwarding order on outbound URLs (utm_source/channel are inserted at
    // the utm_source position by buildOutboundURL).
    var FORWARD_KEYS = [
        'path_source',
        'tw_source', 'tw_adid',
        'cvg_source', 'cvg_adid', 'cvg_cid',
        'fbclid',
        'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
        'campaign_id', 'ad_id'
    ];

    // ── Value validation ────────────────────────────────────────────────────
    // Fully percent-decode (handles double-encoded macros), then reject
    // anything still containing template braces, e.g. "{{ad.id}}".
    function fullyDecode(value) {
        var out = String(value);
        for (var i = 0; i < 3; i++) {
            try {
                var decoded = decodeURIComponent(out);
                if (decoded === out) break;
                out = decoded;
            } catch (e) {
                break;
            }
        }
        return out;
    }

    function isValidValue(value) {
        if (value == null) return false;
        var v = String(value).trim();
        if (!v || v.length > MAX_VALUE_LENGTH) return false;
        var decoded = fullyDecode(v).trim();
        if (!decoded) return false;
        if (decoded.indexOf('{') !== -1 || decoded.indexOf('}') !== -1) return false;
        return true;
    }

    function cleanValue(value) {
        return String(value).trim();
    }

    // ── path_source ─────────────────────────────────────────────────────────
    // Slug = last path segment without extension; "index" for the homepage.
    function getPathSource(urlOrPath) {
        var pathname = '';
        if (urlOrPath) {
            try {
                pathname = new URL(String(urlOrPath), 'https://wl.invalid').pathname;
            } catch (e) {
                pathname = String(urlOrPath).split(/[?#]/)[0];
            }
        }
        var segments = pathname.split('/').filter(function (s) { return s !== ''; });
        if (!segments.length) return 'index';
        var last = segments[segments.length - 1];
        try { last = decodeURIComponent(last); } catch (e) { /* keep raw */ }
        last = last.replace(/\.[a-z0-9]+$/i, '');
        return last || 'index';
    }

    // ── Instance (env-injectable for tests) ─────────────────────────────────
    function create(env) {
        env = env || {};
        var win = env.window !== undefined ? env.window
            : (typeof window !== 'undefined' ? window : null);
        var doc = env.document !== undefined ? env.document
            : (win && win.document) || (typeof document !== 'undefined' ? document : null);
        var nowFn = env.now || function () { return Date.now(); };
        var memoryRecord = null;
        var initialized = false;

        function currentLocation() {
            if (env.location) return env.location;
            if (win && win.location) return win.location;
            if (doc && doc.location) return doc.location;
            return null;
        }

        function storage() {
            if (env.localStorage !== undefined) return env.localStorage;
            try { return win ? win.localStorage : null; } catch (e) { return null; }
        }

        // -- persistence: localStorage -> cookie -> memory -------------------
        function clearPersisted() {
            memoryRecord = null;
            try {
                var ls = storage();
                if (ls) ls.removeItem(STORAGE_KEY);
            } catch (e) { /* blocked */ }
            try {
                if (doc) {
                    doc.cookie = COOKIE_NAME + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
                }
            } catch (e) { /* blocked */ }
        }

        function saveRecord(record) {
            memoryRecord = record;
            try {
                var ls = storage();
                if (ls) {
                    ls.setItem(STORAGE_KEY, JSON.stringify(record));
                    return 'localStorage';
                }
            } catch (e) { /* fall through to cookie */ }
            try {
                if (doc) {
                    var secure = '';
                    var loc = currentLocation();
                    if (loc && loc.protocol === 'https:') secure = '; Secure';
                    doc.cookie = COOKIE_NAME + '=' +
                        encodeURIComponent(JSON.stringify(record)) +
                        '; expires=' + new Date(record.expiresAt).toUTCString() +
                        '; path=/; SameSite=Lax' + secure;
                    return 'cookie';
                }
            } catch (e) { /* fall through to memory */ }
            return 'memory';
        }

        function readCookieRecord() {
            if (!doc || typeof doc.cookie !== 'string') return null;
            var prefix = COOKIE_NAME + '=';
            var parts = doc.cookie.split(';');
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i].trim();
                if (part.indexOf(prefix) === 0) {
                    try { return JSON.parse(decodeURIComponent(part.slice(prefix.length))); }
                    catch (e) { return null; }
                }
            }
            return null;
        }

        function normalizeRecord(raw) {
            if (!raw || typeof raw !== 'object' || !raw.params) return null;
            var expiresAt = typeof raw.expiresAt === 'number' ? raw.expiresAt : 0;
            if (!expiresAt || expiresAt <= nowFn()) {
                clearPersisted();
                return null;
            }
            var params = {};
            Object.keys(raw.params).forEach(function (key) {
                if (CAPTURE_KEYS.indexOf(key) !== -1 && isValidValue(raw.params[key])) {
                    params[key] = cleanValue(raw.params[key]);
                }
            });
            return {
                v: 1,
                capturedAt: typeof raw.capturedAt === 'number' ? raw.capturedAt : expiresAt - TTL_MS,
                expiresAt: expiresAt,
                params: params
            };
        }

        function loadRecord() {
            try {
                var ls = storage();
                if (ls) {
                    var raw = ls.getItem(STORAGE_KEY);
                    if (raw) {
                        try { return normalizeRecord(JSON.parse(raw)); }
                        catch (e) { clearPersisted(); return null; }
                    }
                }
            } catch (e) { /* fall through to cookie */ }
            var cookieRecord = readCookieRecord();
            if (cookieRecord) return normalizeRecord(cookieRecord);
            if (memoryRecord) return normalizeRecord(memoryRecord);
            return null;
        }

        function load() {
            var record = loadRecord();
            return record ? record.params : null;
        }

        // -- capture ---------------------------------------------------------
        function capture(url) {
            var loc = currentLocation();
            var href = url || (loc ? loc.href : '');
            if (!href) return load();
            var parsed;
            try {
                parsed = new URL(String(href), loc ? loc.href : 'https://wl.invalid/');
            } catch (e) {
                return load();
            }

            var incoming = {};
            CAPTURE_KEYS.forEach(function (key) {
                var value = parsed.searchParams.get(key);
                if (value !== null && isValidValue(value)) {
                    incoming[key] = cleanValue(value);
                }
            });

            var existing = loadRecord();
            var now = nowFn();

            // Conflicting ad identifier => genuinely new ad visit: replace.
            var conflict = false;
            if (existing) {
                for (var i = 0; i < AD_ID_KEYS.length; i++) {
                    var key = AD_ID_KEYS[i];
                    if (incoming[key] && existing.params[key] &&
                        incoming[key] !== existing.params[key]) {
                        conflict = true;
                        break;
                    }
                }
            }

            if (!existing || conflict) {
                var fresh = {};
                Object.keys(incoming).forEach(function (k) { fresh[k] = incoming[k]; });
                if (!fresh.path_source) {
                    fresh.path_source = getPathSource(parsed.pathname);
                }
                saveRecord({ v: 1, capturedAt: now, expiresAt: now + TTL_MS, params: fresh });
                return fresh;
            }

            // Same visit: merge — valid new values win, missing/empty and
            // the original path_source never overwrite.
            var merged = {};
            Object.keys(existing.params).forEach(function (k) { merged[k] = existing.params[k]; });
            Object.keys(incoming).forEach(function (k) {
                if (k === 'path_source' && merged.path_source) return;
                merged[k] = incoming[k];
            });
            if (!merged.path_source) merged.path_source = getPathSource(parsed.pathname);
            saveRecord({
                v: 1,
                capturedAt: existing.capturedAt,
                expiresAt: existing.expiresAt,
                params: merged
            });
            return merged;
        }

        // -- outbound --------------------------------------------------------
        function isMainDomain(url) {
            var parsed;
            try {
                var loc = currentLocation();
                parsed = new URL(String(url), loc ? loc.href : undefined);
            } catch (e) {
                return false;
            }
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
            var host = parsed.hostname.toLowerCase();
            for (var i = 0; i < MAIN_DOMAINS.length; i++) {
                var domain = MAIN_DOMAINS[i];
                if (host === domain || host.slice(-(domain.length + 1)) === '.' + domain) {
                    return true;
                }
            }
            return false;
        }

        function buildOutboundURL(url, paramsOverride) {
            var raw = String(url);
            if (!isMainDomain(raw)) return raw;
            var loc = currentLocation();
            var parsed;
            try {
                parsed = new URL(raw, loc ? loc.href : undefined);
            } catch (e) {
                return raw;
            }
            var params = paramsOverride || load() || {};

            // Build the outbound set in documented order. utm_source is
            // remapped to this WL site's code; the visitor's original
            // utm_source moves to `channel` (omitted when never captured).
            // searchParams.set() updates in place, so pre-existing keys on
            // the destination are replaced, never duplicated, and unrelated
            // destination params/fragment are preserved.
            var outbound = {};
            FORWARD_KEYS.forEach(function (key) {
                if (params[key] && isValidValue(params[key])) outbound[key] = params[key];
            });
            outbound.utm_source = WL_UTM_SOURCE;
            if (params.utm_source && isValidValue(params.utm_source)) {
                outbound.channel = params.utm_source;
            }
            var ORDER = [
                'path_source', 'tw_source', 'tw_adid',
                'cvg_source', 'cvg_adid', 'cvg_cid', 'fbclid',
                'utm_source', 'channel',
                'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
                'utm_id', 'campaign_id', 'ad_id'
            ];
            ORDER.forEach(function (key) {
                if (outbound[key]) parsed.searchParams.set(key, outbound[key]);
            });
            return parsed.toString();
        }

        function tagLinks(scope) {
            var rootNode = scope || doc;
            if (!rootNode) return 0;
            var links = [];
            if (rootNode.querySelectorAll) {
                links = Array.prototype.slice.call(rootNode.querySelectorAll('a[href]'));
            }
            if (rootNode.tagName === 'A' && rootNode.getAttribute('href')) {
                links.unshift(rootNode);
            }
            var tagged = 0;
            links.forEach(function (link) {
                var href = link.getAttribute('href');
                if (!href) return;
                if (/^(mailto:|tel:|javascript:|#)/i.test(href.trim())) return;
                if (!isMainDomain(link.href || href)) return;
                var built = buildOutboundURL(link.href || href);
                if (built && built !== link.href && built !== href) {
                    link.setAttribute('href', built);
                    tagged++;
                }
            });
            return tagged;
        }

        // -- init: capture, route-change + dynamic-link handling ------------
        function init() {
            if (initialized || !doc) return;
            initialized = true;

            capture();

            var retag = function () { capture(); tagLinks(); };
            if (doc.readyState === 'loading') {
                doc.addEventListener('DOMContentLoaded', function () { tagLinks(); });
            } else {
                tagLinks();
            }

            // SPA route changes: popstate + patched history methods.
            if (win) {
                win.addEventListener('popstate', retag);
                win.addEventListener('hashchange', retag);
                if (win.history && !win.history.__mosAttributionPatched) {
                    ['pushState', 'replaceState'].forEach(function (method) {
                        var original = win.history[method];
                        if (typeof original !== 'function') return;
                        win.history[method] = function () {
                            var result = original.apply(this, arguments);
                            // Let the new URL/DOM settle, then re-capture
                            // (missing params never overwrite) and re-tag.
                            setTimeout(retag, 0);
                            return result;
                        };
                    });
                    try { win.history.__mosAttributionPatched = true; } catch (e) { /* frozen */ }
                }
            }

            // Dynamically rendered links.
            var Observer = win && win.MutationObserver;
            if (Observer && doc.documentElement) {
                var pending = false;
                var observer = new Observer(function () {
                    if (pending) return;
                    pending = true;
                    setTimeout(function () { pending = false; tagLinks(); }, 50);
                });
                observer.observe(doc.documentElement, { childList: true, subtree: true });
            }

            // Last-moment rewrite before navigation — covers plain hrefs,
            // target="_blank" and modified clicks (the browser resolves the
            // command/ctrl-click target from the live href). Registered in
            // the capture phase so it runs before the bubble-phase outbound
            // handler in tracking.js, which then adds its __cvg_* params.
            doc.addEventListener('click', function (e) {
                var node = e.target;
                var link = null;
                while (node && node !== doc) {
                    if (node.tagName === 'A' && node.getAttribute && node.getAttribute('href')) {
                        link = node;
                        break;
                    }
                    node = node.parentNode;
                }
                if (!link) return;
                var href = link.getAttribute('href');
                if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href.trim())) return;
                if (!isMainDomain(link.href || href)) return;
                var built = buildOutboundURL(link.href || href);
                if (built && built !== link.href) link.setAttribute('href', built);
            }, true);
        }

        return {
            capture: capture,
            load: load,
            loadRecord: loadRecord,
            buildOutboundURL: buildOutboundURL,
            buildOutboundUrl: buildOutboundURL,
            tagLinks: tagLinks,
            isMainDomain: isMainDomain,
            getPathSource: getPathSource,
            isValidValue: isValidValue,
            init: init,
            _clear: clearPersisted,
            config: {
                storageKey: STORAGE_KEY,
                cookieName: COOKIE_NAME,
                ttlMs: TTL_MS,
                mainDomains: MAIN_DOMAINS.slice(),
                wlUtmSource: WL_UTM_SOURCE,
                captureKeys: CAPTURE_KEYS.slice(),
                adIdKeys: AD_ID_KEYS.slice(),
                forwardKeys: FORWARD_KEYS.slice()
            }
        };
    }

    var api = create();
    api.create = create;
    return api;
});
