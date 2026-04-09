// share.js — marketingorscience.com
// createShareBar(config) → HTMLElement
// config { url, title, position: 'inline' | 'footer' }

(function () {
    'use strict';

    function createShareBar(config) {
        var cfg      = config || {};
        var url      = cfg.url   || window.location.href;
        var title    = cfg.title || document.title;
        var position = cfg.position || 'inline';

        var encodedUrl   = encodeURIComponent(url);
        var encodedTitle = encodeURIComponent(title);

        var wrapper = document.createElement('div');
        wrapper.className = 'share-bar share-bar--' + position;

        var headingHTML = '<span class="share-bar-heading">Share This Story</span>';

        var buttonsHTML =
            '<div class="share-buttons">' +
                '<button class="share-btn share-btn--copy' + (position === 'footer' ? ' share-btn--footer' : '') + '" data-url="' + url.replace(/"/g, '&quot;') + '">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                        '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
                        '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
                    '</svg>' +
                    'Copy Link' +
                '</button>' +
                '<a class="share-btn' + (position === 'footer' ? ' share-btn--footer' : '') + '" href="https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle + '" target="_blank" rel="noopener noreferrer">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
                        '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' +
                    '</svg>' +
                    'Share on X' +
                '</a>' +
                '<a class="share-btn' + (position === 'footer' ? ' share-btn--footer' : '') + '" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl + '" target="_blank" rel="noopener noreferrer">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
                        '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>' +
                    '</svg>' +
                    'LinkedIn' +
                '</a>' +
                '<a class="share-btn' + (position === 'footer' ? ' share-btn--footer' : '') + '" href="mailto:?subject=' + encodedTitle + '&body=I thought you might find this article interesting: ' + encodedUrl + '">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                        '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>' +
                        '<polyline points="22,6 12,13 2,6"/>' +
                    '</svg>' +
                    'Email' +
                '</a>' +
            '</div>';

        wrapper.innerHTML = headingHTML + buttonsHTML;

        // Copy-link button handler
        var copyBtn = wrapper.querySelector('.share-btn--copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                var targetUrl = copyBtn.getAttribute('data-url');
                var btn = copyBtn;

                function showCopied() {
                    btn.textContent = 'Copied!';
                    btn.classList.add('copied');
                    setTimeout(function () {
                        btn.innerHTML =
                            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                                '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
                                '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
                            '</svg>' +
                            'Copy Link';
                        btn.classList.remove('copied');
                    }, 2000);
                }

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(targetUrl).then(showCopied).catch(function () {
                        fallbackCopy(targetUrl, showCopied);
                    });
                } else {
                    fallbackCopy(targetUrl, showCopied);
                }
            });
        }

        return wrapper;
    }

    function fallbackCopy(text, callback) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '0';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
            document.execCommand('copy');
            callback();
        } catch (e) {
            console.warn('[MoS] Copy failed:', e);
        }
        document.body.removeChild(ta);
    }

    window.createShareBar = createShareBar;
    window.dispatchEvent(new CustomEvent('shareComponentLoaded'));
})();
