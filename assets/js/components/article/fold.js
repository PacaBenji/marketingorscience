// fold.js
// Article hero ("fold") generator for marketingorscience.com
//
// Usage:
//   createFold({
//     category   : 'Skincare / Beauty',
//     type       : 'Product Breakdown',          // article type badge
//     headline   : 'Does Retinol Actually Work?',
//     deck       : 'A deep dive into the evidence behind…',
//     author     : { name: 'Dr. Jane Smith', credential: 'M.D., Dermatology' },
//     date       : '2026-04-09',                 // ISO 8601
//     verdict    : {                             // optional
//         label  : 'Partially Supported',
//         rating : 3,                            // 1–5
//         max    : 5
//     },
//     peerReviewed : true                        // optional badge
//   })

(function () {
    'use strict';

    var CATEGORY_SLUGS = {
        'Skincare / Beauty'   : 'skincare',
        'Skincare & Beauty'   : 'skincare',
        'Pharma & OTC'        : 'pharma',
        'Pharma & Supplements': 'pharma'
    };

    function buildEvidenceStars(rating, max) {
        var html = '';
        for (var i = 1; i <= max; i++) {
            html += '<span class="evidence-pip' + (i <= rating ? ' filled' : '') + '"></span>';
        }
        return html;
    }

    var formatDate = window.MOS_formatDate || function (iso) { return iso; };

    /**
     * createFold(config) → HTMLElement
     * Returns a fully constructed <div class="article-fold"> ready to inject.
     */
    function createFold(config) {
        var cfg = config || {};

        var categorySlug = CATEGORY_SLUGS[cfg.category] || 'general';
        var verdictHTML  = '';

        if (cfg.verdict) {
            verdictHTML =
                '<div class="verdict-block">' +
                    '<span class="verdict-label">Verdict</span>' +
                    '<span class="verdict-text">' + (cfg.verdict.label || '') + '</span>' +
                    '<span class="evidence-rating">' +
                        '<span class="evidence-rating-label">Evidence Strength</span>' +
                        buildEvidenceStars(cfg.verdict.rating || 0, cfg.verdict.max || 5) +
                        '<span class="evidence-rating-fraction">' +
                            (cfg.verdict.rating || 0) + '/' + (cfg.verdict.max || 5) +
                        '</span>' +
                    '</span>' +
                '</div>';
        }

        var peerBadge = cfg.peerReviewed
            ? '<span class="peer-badge">Peer Reviewed</span>'
            : '';

        // Build author display — link if authorSlug provided
        var authorHTML = '';
        if (cfg.author) {
            var authorName = cfg.author.name || '';
            var authorSlug = cfg.author.slug || '';
            var authorPath = authorSlug ? '/experts/' + authorSlug + '/' : '';

            var authorInner = authorPath
                ? '<a href="' + authorPath + '" class="author-link"><strong>' + authorName + '</strong></a>'
                : '<strong>' + authorName + '</strong>';

            authorHTML =
                '<span class="fold-author">' +
                    'By ' + authorInner +
                    (cfg.author.credential
                        ? ', <span class="author-credential">' + cfg.author.credential + '</span>'
                        : '') +
                '</span>';
        }

        var readingTimeHTML = cfg.readingTime
            ? '<span class="fold-reading-time">' + cfg.readingTime + ' min read</span>'
            : '';

        // ── Hero image: pull from og:image meta tag ───────────────────────────
        var ogImg   = document.querySelector('meta[property="og:image"]');
        var heroSrc = ogImg ? ogImg.getAttribute('content') : '';

        var heroHTML = '';
        if (heroSrc) {
            heroHTML =
                '<div class="fold-hero-image">' +
                    '<img src="' + heroSrc + '" alt="' + (cfg.headline || '') + '" loading="eager" fetchpriority="high">' +
                    '<div class="fold-hero-overlay">' +
                        '<div class="fold-hero-overlay-inner">' +
                            '<div class="fold-meta-row">' +
                                '<span class="category-badge category--' + categorySlug + '">' +
                                    (cfg.category || '') +
                                '</span>' +
                                '<span class="article-type-badge">' + (cfg.type || '') + '</span>' +
                                peerBadge +
                            '</div>' +
                            '<h1 class="fold-headline">' + (cfg.headline || '') + '</h1>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

        // ── Share buttons for fold ─────────────────────────────────────────────
        var shareUrl   = window.location.href;
        var shareTitle = document.title || (cfg.headline || '');
        var encodedUrl   = encodeURIComponent(shareUrl);
        var encodedTitle = encodeURIComponent(shareTitle);
        var safeUrl      = shareUrl.replace(/"/g, '&quot;');

        var shareFoldHTML =
            '<div class="fold-below-share share-bar">' +
                '<span class="share-bar-heading">Share Article</span>' +
                '<div class="share-buttons">' +
                    '<button class="share-btn share-btn--copy-fold" data-url="' + safeUrl + '">' +
                        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                            '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
                            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
                        '</svg>' +
                        'Copy Link' +
                    '</button>' +
                    '<a class="share-btn" href="https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle + '" target="_blank" rel="noopener noreferrer">' +
                        '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
                            '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' +
                        '</svg>' +
                        'Share on X' +
                    '</a>' +
                    '<a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl + '" target="_blank" rel="noopener noreferrer">' +
                        '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
                            '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>' +
                        '</svg>' +
                        'LinkedIn' +
                    '</a>' +
                    '<a class="share-btn" href="mailto:?subject=' + encodedTitle + '&body=I thought you might find this article interesting: ' + encodedUrl + '">' +
                        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                            '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>' +
                            '<polyline points="22,6 12,13 2,6"/>' +
                        '</svg>' +
                        'Email' +
                    '</a>' +
                '</div>' +
            '</div>';

        // ── Below-image: deck + byline + verdict ──────────────────────────────
        var belowInnerHTML =
            // If no hero image, render meta-row + headline here (graceful fallback)
            (!heroSrc
                ? '<div class="fold-meta-row">' +
                      '<span class="category-badge category--' + categorySlug + '">' +
                          (cfg.category || '') +
                      '</span>' +
                      '<span class="article-type-badge">' + (cfg.type || '') + '</span>' +
                      peerBadge +
                  '</div>' +
                  '<h1 class="fold-headline">' + (cfg.headline || '') + '</h1>'
                : '') +
            '<div class="fold-below-content">' +
                (cfg.deck
                    ? '<p class="fold-deck">' + cfg.deck + '</p>'
                    : '') +
                '<div class="fold-byline">' +
                    authorHTML +
                    (cfg.date
                        ? '<span class="fold-date">' + formatDate(cfg.date) + '</span>'
                        : '') +
                    readingTimeHTML +
                '</div>' +
                verdictHTML +
            '</div>';

        // Wrap in two-column grid (content + share) when there's a hero image
        var belowHTML;
        if (heroSrc) {
            belowHTML =
                '<div class="fold-inner fold-inner--below">' +
                    '<div class="fold-below-grid">' +
                        belowInnerHTML +
                        shareFoldHTML +
                    '</div>' +
                '</div>';
        } else {
            belowHTML =
                '<div class="fold-inner">' +
                    belowInnerHTML +
                '</div>';
        }

        var fold = document.createElement('div');
        fold.className = 'article-fold';
        fold.innerHTML = heroHTML + belowHTML;

        // ── Copy-link button handler for fold share ────────────────────────────
        var copyBtn = fold.querySelector('.share-btn--copy-fold');
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

        return fold;
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

    window.createFold = createFold;
    window.dispatchEvent(new CustomEvent('articleComponentsLoaded'));
})();
