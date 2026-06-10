// head-components.js
// FOUC prevention for marketingorscience.com
// Include in <head> before other scripts

(function () {
    'use strict';

    /**
     * Initialize FOUC (Flash of Unstyled Content) prevention.
     * Hides body until the stylesheet is confirmed loaded, with a
     * 2-second hard fallback so the page is never permanently blank.
     */
    function initFOUCPrevention() {
        if (document.querySelector('#fouc-prevention')) return;

        const style = document.createElement('style');
        style.id = 'fouc-prevention';
        style.textContent = [
            'body {',
            '    visibility: hidden;',
            '    opacity: 0;',
            '    transition: opacity 0.25s ease;',
            '}',
            '.no-js body {',
            '    visibility: visible;',
            '    opacity: 1;',
            '}'
        ].join('\n');
        document.head.insertBefore(style, document.head.firstChild);

        // Mark JS available
        if (!document.documentElement.classList.contains('js')) {
            document.documentElement.classList.add('js');
        }
    }

    function injectConverge() {
        var s = document.createElement('script');
        s.src = 'https://static.runconverge.com/pixels/j4pRsz.js';
        s.async = true;
        document.head.appendChild(s);

        window.cvg || (cvg = function () {
            cvg.process ? cvg.process.apply(cvg, arguments) : cvg.queue.push(arguments);
        }, cvg.queue = []);
        cvg({ method: 'track', eventName: '$page_load' });
    }

    // Run immediately — this is called synchronously from <head>
    initFOUCPrevention();
    injectConverge();
})();
