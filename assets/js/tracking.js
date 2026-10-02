(function() {

    var SESSION_PV_COUNT_KEY = 'cvg_session_pv_count';
    var FIRED_PV2_KEY        = 'cvg_fired_pv2';
    var FIRED_PV3_KEY        = 'cvg_fired_pv3';
    var SCROLL_25_KEY        = 'cvg_scroll_25';
    var SCROLL_50_KEY        = 'cvg_scroll_50';
    var SCROLL_75_KEY        = 'cvg_scroll_75';

    var OUTBOUND_EVENTS = [
        { domain: 'getreyou.com',      eventName: 'MoS Reyou Click' }, // this maps to ReyouVisit
        { domain: 'pacagen.com',        eventName: 'MoS Pacagen Click' }, // this maps to PacagenVisit
        { domain: 'drinkwildtype.com',  eventName: 'MoS Wildtype Click' } //this maps to WildtypeVisit
    ];

    // Safe wrapper — mirrors CvgOnsite.tsx from headless repo.
    // Polls every 200ms until j4pRsz.js has loaded and set cvg.process,
    // then drains the app-level queue. Direct cvg() calls fail silently
    // if the pixel hasn't loaded yet; this guarantees delivery.
    var eventQueue = [];
    var retryInterval = null;

    function checkCvgReady() {
        if (typeof cvg !== 'undefined' && typeof cvg.process === 'function') {
            if (retryInterval) { clearInterval(retryInterval); retryInterval = null; }
            while (eventQueue.length > 0) { cvg(eventQueue.shift()); }
            return true;
        }
        return false;
    }

    function safeTrack(data) {
        if (checkCvgReady()) {
            cvg(data);
        } else {
            eventQueue.push(data);
            if (!retryInterval) { retryInterval = setInterval(checkCvgReady, 200); }
        }
    }

    function getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    }

    // Forward Converge identity onto partner domains. Inserts before any hash
    // so links like /pages/science#clinical-trial stay intact.
    function appendCvgParams(url) {
        var uid = getCookie('__cvg_uid');
        var sid = getCookie('__cvg_sid');
        var params = [];
        if (uid && url.indexOf('__cvg_uid=') === -1) params.push('__cvg_uid=' + encodeURIComponent(uid));
        if (sid && url.indexOf('__cvg_sid=') === -1) params.push('__cvg_sid=' + encodeURIComponent(sid));
        if (!params.length) return url;

        var hash = '';
        var hashIdx = url.indexOf('#');
        if (hashIdx !== -1) {
            hash = url.slice(hashIdx);
            url = url.slice(0, hashIdx);
        }
        return url + (url.indexOf('?') !== -1 ? '&' : '?') + params.join('&') + hash;
    }

    // 1. Outbound click tracking — one event per brand.
    // Holds navigation 200ms and appends __cvg_uid / __cvg_sid. Matched by
    // hostname because outbound links here are not marked with a shared class.
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href]');
        if (!link) return;
        var host = '';
        try { host = new URL(link.href).hostname; } catch(x) { return; }
        for (var i = 0; i < OUTBOUND_EVENTS.length; i++) {
            var d = OUTBOUND_EVENTS[i].domain;
            if (host === d || host.endsWith('.' + d)) {
                var finalUrl = appendCvgParams(link.href);
                safeTrack({ method: 'track', eventName: OUTBOUND_EVENTS[i].eventName, properties: {
                    outbound_url: link.href
                }});

                // Let modified clicks (new tab, etc.) proceed, with params already on the href.
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                    link.href = finalUrl;
                    break;
                }

                e.preventDefault();
                var pendingWin = link.target === '_blank' ? window.open('', '_blank') : null;
                if (pendingWin) pendingWin.opener = null;
                setTimeout(function() {
                    if (pendingWin) {
                        pendingWin.location.href = finalUrl;
                    } else {
                        window.location.href = finalUrl;
                    }
                }, 200);
                break;
            }
        }
    });

    // 2. Scroll depth 25 / 50 / 75 — once per session per threshold
    var maxScroll = 0;
    function readScrollDepth() {
        var total = document.documentElement.scrollHeight;
        if (total <= 0) return 0;
        return Math.min(1, (window.scrollY + window.innerHeight) / total);
    }
    function checkScrollThresholds() {
        var depth = readScrollDepth();
        if (depth > maxScroll) maxScroll = depth;
        var d = maxScroll;
        if (d >= 0.25 && !sessionStorage.getItem(SCROLL_25_KEY)) {
            sessionStorage.setItem(SCROLL_25_KEY, '1');
            safeTrack({ method: 'track', eventName: 'Scroll Depth 25%' });
        }
        if (d >= 0.50 && !sessionStorage.getItem(SCROLL_50_KEY)) {
            sessionStorage.setItem(SCROLL_50_KEY, '1');
            safeTrack({ method: 'track', eventName: 'Scroll Depth 50%' });
        }
        if (d >= 0.75 && !sessionStorage.getItem(SCROLL_75_KEY)) {
            sessionStorage.setItem(SCROLL_75_KEY, '1');
            safeTrack({ method: 'track', eventName: 'Scroll Depth 75%' });
        }
    }
    window.addEventListener('scroll', checkScrollThresholds, { passive: true });
    checkScrollThresholds();

    // 3. Session pageview milestones
    var raw  = sessionStorage.getItem(SESSION_PV_COUNT_KEY);
    var prev = raw ? parseInt(raw, 10) : 0;
    var next = isFinite(prev) ? prev + 1 : 1;
    sessionStorage.setItem(SESSION_PV_COUNT_KEY, String(next));

    if (next === 2 && !sessionStorage.getItem(FIRED_PV2_KEY)) {
        sessionStorage.setItem(FIRED_PV2_KEY, '1');
        safeTrack({ method: 'track', eventName: 'Session Pageviews 2', properties: { session_page_views: 2 } });
    }
    if (next === 3 && !sessionStorage.getItem(FIRED_PV3_KEY)) {
        sessionStorage.setItem(FIRED_PV3_KEY, '1');
        safeTrack({ method: 'track', eventName: 'Session Pageviews 3', properties: { session_page_views: 3 } });
    }

})();