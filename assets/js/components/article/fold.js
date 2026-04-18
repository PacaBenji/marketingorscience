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
//         label  : 'Claim Partially Supported',
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

    function formatDate(iso) {
        try {
            var d = new Date(iso + 'T12:00:00Z');
            return d.toLocaleDateString('en-US', {
                year: 'month' !== 'year' ? 'numeric' : undefined,
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
            });
        } catch (e) {
            return iso;
        }
    }

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
            var authorPath = authorSlug ? '/authors/' + authorSlug + '/' : '';

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
                        '<div class="fold-meta-row">' +
                            '<span class="category-badge category--' + categorySlug + '">' +
                                (cfg.category || '') +
                            '</span>' +
                            '<span class="article-type-badge">' + (cfg.type || '') + '</span>' +
                            peerBadge +
                        '</div>' +
                        '<h1 class="fold-headline">' + (cfg.headline || '') + '</h1>' +
                    '</div>' +
                '</div>';
        }

        // ── Below-image: deck + byline + verdict ──────────────────────────────
        var belowHTML =
            '<div class="fold-inner' + (heroSrc ? ' fold-inner--below' : '') + '">' +
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

        var fold = document.createElement('div');
        fold.className = 'article-fold';
        fold.innerHTML = heroHTML + belowHTML;

        return fold;
    }

    window.createFold = createFold;
    window.dispatchEvent(new CustomEvent('articleComponentsLoaded'));
})();
