// home-featured.js — marketingorscience.com
// Renders the homepage featured banner + article grid from MOS_ARTICLES.

(function () {
    'use strict';

    var formatDate = window.MOS_formatDate || function (iso) { return iso; };

    // Ranked list: curated popular articles first (by popularRank), then padded
    // with the newest remaining articles so the Most Read carousel always fills.
    function getRanked(articles) {
        var popular = articles
            .filter(function (a) { return a.popular === true; })
            .sort(function (a, b) { return (a.popularRank || 99) - (b.popularRank || 99); });

        var seen = {};
        popular.forEach(function (a) { seen[a.slug] = 1; });

        var filler = articles
            .filter(function (a) { return !seen[a.slug]; })
            .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

        return popular.concat(filler);
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

    // "Most Read" card — image-top, rank badge, title, author + date.
    function renderMostReadItem(article, idx) {
        var rank = idx + 1;

        var imageHTML = article.image
            ? '<div class="most-read-card-image">' +
                  '<span class="most-read-rank-badge" aria-hidden="true">' + rank + '</span>' +
                  '<img src="' + article.image + '" alt="" loading="lazy" width="600" height="340">' +
              '</div>'
            : '';

        return '<li class="most-read-item">' +
            '<a class="most-read-card" href="' + article.url + '" aria-label="Read: ' + article.title + '">' +
                imageHTML +
                '<h3 class="most-read-title">' + (article.title || '') + '</h3>' +
                '<div class="most-read-meta">' +
                    '<span class="most-read-author">' + (article.author || '') + '</span>' +
                    '<span class="most-read-dot" aria-hidden="true">&middot;</span>' +
                    '<time datetime="' + article.date + '">' + formatDate(article.date) + '</time>' +
                '</div>' +
            '</a>' +
        '</li>';
    }

    function renderMostRead(list) {
        if (!list.length) return '';
        return '<section class="most-read-section" aria-labelledby="most-read-heading">' +
            '<div class="most-read-inner">' +
                '<div class="section-header">' +
                    '<span class="section-title" id="most-read-heading">Most Read</span>' +
                '</div>' +
            '</div>' +
            '<ol class="most-read-list">' +
                list.map(renderMostReadItem).join('') +
            '</ol>' +
            '<div class="most-read-dots" aria-hidden="true"></div>' +
        '</section>';
    }

    // Build scroll-synced dot indicators beneath the Most Read carousel.
    function initMostReadDots() {
        var list = document.querySelector('.most-read-list');
        var dotsWrap = document.querySelector('.most-read-dots');
        if (!list || !dotsWrap) return;

        var items = Array.prototype.slice.call(list.querySelectorAll('.most-read-item'));
        if (items.length < 2) return;

        var dots = items.map(function (item, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'most-read-dot';
            dot.setAttribute('aria-label', 'Go to item ' + (i + 1));
            dot.addEventListener('click', function () {
                list.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
            });
            dotsWrap.appendChild(dot);
            return dot;
        });

        function setActive(idx) {
            dots.forEach(function (d, i) {
                d.classList.toggle('is-active', i === idx);
            });
        }

        function nearestIndex() {
            var target = list.scrollLeft;
            var best = 0;
            var bestDist = Infinity;
            items.forEach(function (item, i) {
                var dist = Math.abs(item.offsetLeft - target);
                if (dist < bestDist) { bestDist = dist; best = i; }
            });
            return best;
        }

        var ticking = false;
        list.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                setActive(nearestIndex());
                ticking = false;
            });
        });

        setActive(0);
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

        // Most Read — ranked top 10
        var mostReadSlot = document.querySelector('.most-read-slot');
        if (mostReadSlot) {
            mostReadSlot.innerHTML = renderMostRead(
                ranked.filter(function (a) { return a.slug !== banner.slug; }).slice(0, 10)
            );
            initMostReadDots();
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
