// home-featured.js — marketingorscience.com
// Renders the homepage featured banner + article grid from MOS_ARTICLES.

(function () {
    'use strict';

    var formatDate = window.MOS_formatDate || function (iso) { return iso; };

    function getFeatured(articles) {
        // Popular articles sorted by rank, then pad with most recent
        var popular = articles
            .filter(function (a) { return a.popular === true; })
            .sort(function (a, b) { return (a.popularRank || 99) - (b.popularRank || 99); });

        var slugs = {};
        popular.forEach(function (a) { slugs[a.slug] = true; });

        var recent = articles
            .filter(function (a) { return !slugs[a.slug]; })
            .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

        return popular.concat(recent).slice(0, 7);
    }

    function renderBanner(article) {
        return '<section class="featured-banner">' +
            '<a href="' + article.url + '" class="featured-banner-link" aria-label="Read: ' + article.title + '">' +
                '<div class="featured-banner-image">' +
                    '<img src="' + article.image + '" alt="" loading="eager">' +
                    '<div class="featured-banner-overlay">' +
                        '<div class="featured-banner-overlay-inner">' +
                            '<div class="featured-banner-badge-row">' +
                                '<span class="category-badge category--' + (article.categorySlug || 'general') + '">' + (article.category || '') + '</span>' +
                                '<span class="article-type-badge">' + (article.type || '') + '</span>' +
                            '</div>' +
                            '<h2 class="featured-banner-headline">' + article.title + '</h2>' +
                            '<p class="featured-banner-deck">' + article.deck + '</p>' +
                            '<span class="featured-banner-cta">Read the breakdown &rarr;</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</a>' +
        '</section>';
    }

    function renderCard(article) {
        return '<a href="' + article.url + '" class="article-card" aria-label="Read: ' + article.title + '">' +
            (article.image
                ? '<div class="card-image-wrap">' +
                      '<img src="' + article.image + '" alt="" loading="lazy" width="600" height="340">' +
                  '</div>'
                : '') +
            '<div class="card-badge-row">' +
                '<span class="category-badge category--' + (article.categorySlug || 'general') + '">' + (article.category || '') + '</span>' +
                '<span class="article-type-badge">' + (article.type || '') + '</span>' +
            '</div>' +
            '<h2 class="card-headline">' + article.title + '</h2>' +
            '<p class="card-deck">' + article.deck + '</p>' +
            '<div class="card-meta">' +
                '<span class="card-author">' + (article.author || '') + '</span>' +
                '<span class="card-meta-dot" aria-hidden="true">&middot;</span>' +
                '<time datetime="' + article.date + '">' + formatDate(article.date) + '</time>' +
            '</div>' +
        '</a>';
    }

    function render(articles) {
        var featured = getFeatured(articles);
        if (!featured.length) return;

        // Banner — first article
        var bannerSlot = document.querySelector('.featured-banner-slot');
        if (bannerSlot) {
            bannerSlot.innerHTML = renderBanner(featured[0]);
        }

        // Grid — next 5
        var grid = document.querySelector('.article-grid');
        if (grid) {
            grid.innerHTML = featured.slice(1).map(renderCard).join('');
        }
    }

    function init() {
        if (window.MOS_ARTICLES) {
            render(window.MOS_ARTICLES);
        } else {
            window.addEventListener('articlesLoaded', function () {
                render(window.MOS_ARTICLES);
            }, { once: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
