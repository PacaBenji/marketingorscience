// home-featured.js — marketingorscience.com
// Renders the homepage featured banner + article grid from MOS_ARTICLES.

(function () {
    'use strict';

    var formatDate = window.MOS_formatDate || function (iso) { return iso; };

    // Popular articles ranked by popularRank (undark-style 01–05 list).
    function getRanked(articles) {
        return articles
            .filter(function (a) { return a.popular === true; })
            .sort(function (a, b) { return (a.popularRank || 99) - (b.popularRank || 99); });
    }

    // The single lead story for the banner — top-ranked popular, else newest.
    function getBanner(articles, ranked) {
        if (ranked.length) return ranked[0];
        return articles
            .slice()
            .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); })[0];
    }

    // Grid = most recent by date, distinct from the ranked block above it.
    function getLatest(articles, count) {
        return articles
            .slice()
            .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); })
            .slice(0, count);
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

    // Numbered "Most Read" ranking row — mirrors read-more.js .popular-item.
    function renderMostReadItem(article, idx) {
        var rank = idx + 1;
        var rankStr = rank < 10 ? '0' + rank : String(rank);

        var verdictDot = article.verdictClass
            ? '<span class="popular-verdict-dot popular-verdict-dot--' + article.verdictClass + '" aria-hidden="true"></span>'
            : '';

        var time = article.readingTime
            ? '<span class="popular-dot" aria-hidden="true">&middot;</span>' +
              '<span class="most-read-time">' + article.readingTime + ' min</span>'
            : '';

        return '<li class="most-read-item">' +
            '<a class="most-read-link" href="' + article.url + '">' +
                '<span class="most-read-rank" aria-hidden="true">' + rankStr + '</span>' +
                '<span class="most-read-body">' +
                    '<span class="most-read-title">' + (article.title || '') + '</span>' +
                    '<span class="most-read-meta">' +
                        verdictDot +
                        '<span class="most-read-author">' + (article.author || '') + '</span>' +
                        time +
                    '</span>' +
                '</span>' +
            '</a>' +
        '</li>';
    }

    function renderMostRead(list) {
        if (!list.length) return '';
        return '<section class="most-read-section" aria-labelledby="most-read-heading">' +
            '<div class="most-read-inner">' +
                '<div class="section-header">' +
                    '<span class="section-title" id="most-read-heading">Most Read</span>' +
                    '<a href="/articles" class="section-link">View All &rarr;</a>' +
                '</div>' +
                '<ol class="most-read-list">' +
                    list.map(renderMostReadItem).join('') +
                '</ol>' +
            '</div>' +
        '</section>';
    }

    function render(articles) {
        if (!articles || !articles.length) return;

        var ranked = getRanked(articles);
        var banner = getBanner(articles, ranked);

        // Banner — lead story
        var bannerSlot = document.querySelector('.featured-banner-slot');
        if (bannerSlot && banner) {
            bannerSlot.innerHTML = renderBanner(banner);
        }

        // Most Read — ranked 01–05
        var mostReadSlot = document.querySelector('.most-read-slot');
        if (mostReadSlot) {
            mostReadSlot.innerHTML = renderMostRead(ranked.slice(0, 5));
        }

        // Grid — most recent by date (distinct from ranked block)
        var grid = document.querySelector('.article-grid');
        if (grid) {
            grid.innerHTML = getLatest(articles, 6).map(renderCard).join('');
        }

        // Late-injected content: register with the shared observer + image loaders
        if (typeof window.MOS_initScrollAnimations === 'function') {
            window.MOS_initScrollAnimations();
        }
        if (typeof window.MOS_initImageLoaders === 'function') {
            window.MOS_initImageLoaders();
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
