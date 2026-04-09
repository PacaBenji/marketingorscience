// author-page.js — marketingorscience.com
// Reads author slug from URL, filters MOS_ARTICLES, and populates
// .author-articles-list on /authors/{slug}/ pages.

(function () {
    'use strict';

    function getAuthorSlug() {
        // Expect URL pattern: /authors/{slug}/
        var match = window.location.pathname.match(/\/authors\/([^\/]+)/);
        return match ? match[1] : '';
    }

    function formatDate(iso) {
        try {
            var d = new Date(iso + 'T12:00:00Z');
            return d.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
            });
        } catch (e) { return iso; }
    }

    function renderArticleItem(article) {
        var a = document.createElement('a');
        a.className = 'article-list-item';
        a.href = article.url || '#';
        a.setAttribute('data-category', article.categorySlug || '');
        a.setAttribute('aria-label', 'Read: ' + article.title);

        var verdictClass = article.verdictClass
            ? 'verdict-pill verdict-pill--' + article.verdictClass
            : 'verdict-pill';

        a.innerHTML =
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
            '</div>';

        return a;
    }

    function populate(authorSlug) {
        var container = document.querySelector('.author-articles-list');
        if (!container) return;

        if (!window.MOS_ARTICLES || !window.MOS_ARTICLES.length) {
            container.innerHTML = '<p style="color:var(--color-muted)">No articles found.</p>';
            return;
        }

        var articles = window.MOS_ARTICLES
            .filter(function (a) { return a.authorSlug === authorSlug; })
            .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

        if (articles.length === 0) {
            container.innerHTML = '<p style="color:var(--color-muted)">No articles found for this author.</p>';
            return;
        }

        container.innerHTML = '';
        articles.forEach(function (article) {
            container.appendChild(renderArticleItem(article));
        });
    }

    function init() {
        var authorSlug = getAuthorSlug();
        if (!authorSlug) return;

        if (window.MOS_ARTICLES) {
            populate(authorSlug);
        } else {
            window.addEventListener('articlesLoaded', function () {
                populate(authorSlug);
            }, { once: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
