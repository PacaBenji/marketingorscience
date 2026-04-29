// article-list-render.js — marketingorscience.com
// Renders all articles into .article-list from MOS_ARTICLES.
// Replaces hardcoded cards; works with category-filter.js for filtering.

(function () {
    'use strict';

    var formatDate = window.MOS_formatDate || function (iso) { return iso; };

    function slugifyType(type) {
        return (type || '').toLowerCase().replace(/\s+/g, '-');
    }

    function renderArticleItem(article) {
        var verdictClass = article.verdictClass
            ? 'verdict-pill verdict-pill--' + article.verdictClass
            : 'verdict-pill';

        return '<a href="' + (article.url || '#') + '" class="article-list-item"' +
            ' data-category="' + (article.categorySlug || '') + '"' +
            ' data-type="' + slugifyType(article.type) + '"' +
            ' aria-label="Read: ' + (article.title || '') + '">' +
            (article.image
                ? '<img class="list-item-thumb" src="' + article.image + '" alt="" loading="lazy">'
                : '') +
            '<div class="list-item-body">' +
                '<div class="card-badge-row">' +
                    '<span class="category-badge category--' + (article.categorySlug || 'general') + '">' +
                        (article.category || '') +
                    '</span>' +
                    '<span class="article-type-badge">' + (article.type || '') + '</span>' +
                '</div>' +
                '<h2 class="list-item-headline">' + (article.title || '') + '</h2>' +
                (article.deck
                    ? '<p class="list-item-deck">' + article.deck + '</p>'
                    : '') +
                '<div class="list-item-meta">' +
                    '<span>' + (article.author || '') + '</span>' +
                    (article.date
                        ? '<span aria-hidden="true">&middot;</span>' +
                          '<time datetime="' + article.date + '">' + formatDate(article.date) + '</time>'
                        : '') +
                    (article.readingTime
                        ? '<span aria-hidden="true">&middot;</span>' +
                          '<span>' + article.readingTime + ' min read</span>'
                        : '') +
                '</div>' +
            '</div>' +
            '<div class="list-item-side">' +
                (article.verdict
                    ? '<span class="' + verdictClass + '">' + article.verdict + '</span>'
                    : '') +
            '</div>' +
        '</a>';
    }

    function render(articles) {
        var container = document.querySelector('.article-list');
        if (!container) return;

        var sorted = articles.slice().sort(function (a, b) {
            return (b.date || '').localeCompare(a.date || '');
        });

        container.innerHTML = sorted.map(renderArticleItem).join('');

        // Notify category-filter that cards are ready
        window.dispatchEvent(new CustomEvent('articleListRendered'));
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
