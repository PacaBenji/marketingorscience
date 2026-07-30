// related-inline.js — marketingorscience.com
// Floated inline "Related" card injected mid-article (after the 2nd h2).
// Self-resolves the current article from the URL, auto-picks a related post
// (same author → fallback same category), and honors an optional override:
//   window.MOS_RELATED_OVERRIDE = ['some-slug', ...]
// Loaded centrally by main.js on article pages — no per-article HTML edits.

(function () {
    'use strict';

    // Normalize a path for comparison: strip origin, trailing slash, .html
    function normalizePath(p) {
        if (!p) return '';
        return p.replace(/^https?:\/\/[^/]+/, '')
                .replace(/\.html$/, '')
                .replace(/\/+$/, '');
    }

    function findCurrent(articles) {
        var here = normalizePath(window.location.pathname);
        return articles.find(function (a) {
            return normalizePath(a.url) === here;
        }) || null;
    }

    // Selection order mirrors read-more.js: same author first, then category.
    function pickRelated(articles, current) {
        var others = articles.filter(function (a) { return a.slug !== current.slug; });

        // Manual override wins if provided and resolvable
        var override = window.MOS_RELATED_OVERRIDE;
        if (Array.isArray(override) && override.length) {
            for (var i = 0; i < override.length; i++) {
                var match = others.find(function (a) { return a.slug === override[i]; });
                if (match) return match;
            }
        }

        function newest(list) {
            return list.slice().sort(function (a, b) {
                return (b.date || '').localeCompare(a.date || '');
            })[0];
        }

        // Same author
        if (current.authorSlug) {
            var byAuthor = others.filter(function (a) { return a.authorSlug === current.authorSlug; });
            if (byAuthor.length) return newest(byAuthor);
        }
        // Fallback: same category
        if (current.categorySlug) {
            var byCat = others.filter(function (a) { return a.categorySlug === current.categorySlug; });
            if (byCat.length) return newest(byCat);
        }
        // Last resort: any newest
        return others.length ? newest(others) : null;
    }

    function createRelatedInline(article) {
        var aside = document.createElement('aside');
        aside.className = 'related-inline';

        var imageHTML = article.image
            ? '<span class="related-inline-image">' +
                  '<img src="' + article.image + '" alt="" loading="lazy" aria-hidden="true">' +
              '</span>'
            : '';

        aside.innerHTML =
            '<a class="related-inline-link" href="' + article.url + '">' +
                imageHTML +
                '<span class="related-inline-label">Related</span>' +
                '<span class="related-inline-headline">' + (article.title || '') + '</span>' +
            '</a>';

        return aside;
    }

    function injectRelatedInline() {
        var articleBody = document.querySelector('.article-body');
        if (!articleBody) return;

        var articles = window.MOS_ARTICLES;
        if (!articles || !articles.length) return;

        var current = findCurrent(articles);
        if (!current) return;

        var related = pickRelated(articles, current);
        if (!related) return;

        var headings = Array.prototype.slice.call(articleBody.querySelectorAll('h2'));
        if (headings.length < 2) return;  // need room; CTA uses the 3rd h2

        // Avoid double-injection
        if (articleBody.querySelector('.related-inline')) return;

        var secondH2 = headings[1];
        var card = createRelatedInline(related);

        if (secondH2.nextSibling) {
            articleBody.insertBefore(card, secondH2.nextSibling);
        } else {
            articleBody.appendChild(card);
        }

        // Register with shared scroll-animation observer if available
        if (typeof window.MOS_initScrollAnimations === 'function') {
            window.MOS_initScrollAnimations();
        }
    }

    function init() {
        if (window.MOS_ARTICLES) {
            injectRelatedInline();
        } else {
            window.addEventListener('articlesLoaded', injectRelatedInline, { once: true });
        }
    }

    window.createRelatedInline = createRelatedInline;
    window.injectRelatedInline = injectRelatedInline;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
