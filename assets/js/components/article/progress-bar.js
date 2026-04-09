// progress-bar.js — marketingorscience.com
// Appends a reading progress bar to .site-header.
// Only activates on article pages (checks for .article-body).

(function () {
    'use strict';

    function init() {
        // Only activate on article pages
        if (!document.querySelector('.article-body')) return;

        var header = document.querySelector('.site-header');
        if (!header) return;

        var bar = document.createElement('div');
        bar.className = 'reading-progress-bar';
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-label', 'Reading progress');
        // Note: .site-header is already position:sticky — the bar's
        // position:absolute + bottom:0 is relative to that.
        // Do NOT override with 'relative' or sticky breaks.
        header.appendChild(bar);

        var rafId = null;

        function updateProgress() {
            var scrollTop    = window.scrollY || window.pageYOffset;
            var docHeight    = document.documentElement.scrollHeight - window.innerHeight;
            var progress     = docHeight > 0 ? scrollTop / docHeight : 0;
            bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, progress)) + ')';
            rafId = null;
        }

        window.addEventListener('scroll', function () {
            if (rafId === null) {
                rafId = requestAnimationFrame(updateProgress);
            }
        }, { passive: true });

        // Initialize on load
        updateProgress();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.createProgressBar = init;
    window.dispatchEvent(new CustomEvent('progressBarComponentLoaded'));
})();
