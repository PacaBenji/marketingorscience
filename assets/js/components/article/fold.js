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
        'Pharma & OTC Drugs'  : 'pharma'
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

        var fold = document.createElement('div');
        fold.className = 'article-fold';
        fold.innerHTML =
            '<div class="fold-inner">' +
                '<div class="fold-meta-row">' +
                    '<span class="category-badge category--' + categorySlug + '">' +
                        (cfg.category || '') +
                    '</span>' +
                    '<span class="article-type-badge">' + (cfg.type || '') + '</span>' +
                    peerBadge +
                '</div>' +
                '<h1 class="fold-headline">' + (cfg.headline || '') + '</h1>' +
                (cfg.deck
                    ? '<p class="fold-deck">' + cfg.deck + '</p>'
                    : '') +
                '<div class="fold-byline">' +
                    (cfg.author
                        ? '<span class="fold-author">' +
                              'By <strong>' + cfg.author.name + '</strong>' +
                              (cfg.author.credential
                                  ? ', <span class="author-credential">' + cfg.author.credential + '</span>'
                                  : '') +
                          '</span>'
                        : '') +
                    (cfg.date
                        ? '<span class="fold-date">' + formatDate(cfg.date) + '</span>'
                        : '') +
                '</div>' +
                verdictHTML +
            '</div>';

        return fold;
    }

    window.createFold = createFold;
    window.dispatchEvent(new CustomEvent('articleComponentsLoaded'));
})();
