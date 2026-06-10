(function() {

    var OUTBOUND_DOMAINS = ['getreyou.com', 'pacagen.com', 'drinkwildtype.com'];

    var SESSION_PV_COUNT_KEY = 'cvg_session_pv_count';
    var FIRED_PV2_KEY        = 'cvg_fired_pv2';
    var FIRED_PV3_KEY        = 'cvg_fired_pv3';
    var SCROLL_25_KEY        = 'cvg_scroll_25';
    var SCROLL_50_KEY        = 'cvg_scroll_50';
    var SCROLL_75_KEY        = 'cvg_scroll_75';

    // 1. Outbound click tracking
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href]');
        if (!link) return;
        var host = '';
        try { host = new URL(link.href).hostname; } catch(x) { return; }
        for (var i = 0; i < OUTBOUND_DOMAINS.length; i++) {
            if (host === OUTBOUND_DOMAINS[i] || host.endsWith('.' + OUTBOUND_DOMAINS[i])) {
                cvg({ method: 'track', eventName: 'OutboundClick', properties: {
                    domain: OUTBOUND_DOMAINS[i],
                    outbound_url: link.href
                }});
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
            cvg({ method: 'track', eventName: 'Scroll Depth 25%' });
        }
        if (d >= 0.50 && !sessionStorage.getItem(SCROLL_50_KEY)) {
            sessionStorage.setItem(SCROLL_50_KEY, '1');
            cvg({ method: 'track', eventName: 'Scroll Depth 50%' });
        }
        if (d >= 0.75 && !sessionStorage.getItem(SCROLL_75_KEY)) {
            sessionStorage.setItem(SCROLL_75_KEY, '1');
            cvg({ method: 'track', eventName: 'Scroll Depth 75%' });
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
        cvg({ method: 'track', eventName: 'Session Pageviews 2', properties: { session_page_views: 2 } });
    }
    if (next === 3 && !sessionStorage.getItem(FIRED_PV3_KEY)) {
        sessionStorage.setItem(FIRED_PV3_KEY, '1');
        cvg({ method: 'track', eventName: 'Session Pageviews 3', properties: { session_page_views: 3 } });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupArticleCompletion);
    } else {
        setupArticleCompletion();
    }

})();
