// component-init.js
// Async readiness helper for marketingorscience.com
// Waits for article components (createFold, createArticleFooter) to be
// available, then fires a callback. Falls back after 2.5 s.

(function () {
    'use strict';

    function areArticleComponentsLoaded() {
        return (
            typeof window.createFold !== 'undefined' &&
            typeof window.createArticleFooter !== 'undefined'
        );
    }

    /**
     * Execute `callback` once article components are ready.
     *
     * @param {Function} callback
     * @param {Object}   [options]
     * @param {boolean}  [options.waitForArticle=true]
     * @param {number}   [options.maxRetries=50]
     * @param {number}   [options.retryDelay=50]   ms between polls
     */
    function initComponentsWhenReady(callback, options) {
        var opts = options || {};
        var waitForArticle = opts.waitForArticle !== false;
        var maxRetries     = opts.maxRetries  || 50;
        var retryDelay     = opts.retryDelay  || 50;

        var retries          = 0;
        var rafId            = null;
        var callbackExecuted = false;

        function executeCallback() {
            if (callbackExecuted) return;
            callbackExecuted = true;
            if (rafId !== null) cancelAnimationFrame(rafId);
            try {
                callback();
            } catch (err) {
                console.error('[MoS] Error initializing components:', err);
            }
        }

        function isReady() {
            return !waitForArticle || areArticleComponentsLoaded();
        }

        // Fast path — components already present
        if (isReady()) {
            executeCallback();
            return;
        }

        function poll() {
            if (callbackExecuted) return;
            retries++;
            if (isReady()) {
                executeCallback();
            } else if (retries < maxRetries) {
                rafId = requestAnimationFrame(function () {
                    setTimeout(poll, retryDelay);
                });
            } else {
                console.warn('[MoS] Component init timeout — proceeding anyway.');
                executeCallback();
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                requestAnimationFrame(poll);
            });
        } else {
            requestAnimationFrame(poll);
        }
    }

    window.initComponentsWhenReady = initComponentsWhenReady;
})();
