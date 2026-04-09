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

    // Run immediately — this is called synchronously from <head>
    initFOUCPrevention();
})();
