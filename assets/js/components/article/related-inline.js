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

    // Tags too generic to signal topical relatedness.
    var GENERIC_TAGS = {
        skincare: 1, haircare: 1, wellness: 1, pharma: 1,
        fda: 1, otc: 1, supplements: 1
    };

    function specificTags(a) {
        return (a.tags || []).filter(function (t) { return !GENERIC_TAGS[t]; });
    }

    // Selection order: manual override → curated relatedSlugs →
    // tag-overlap score → same category (newest) → any newest.
    function pickRelated(articles, current) {
        var others = articles.filter(function (a) { return a.slug !== current.slug; });

        function bySlug(slug) {
            return others.find(function (a) { return a.slug === slug; });
        }
        function firstResolvable(slugs) {
            for (var i = 0; i < slugs.length; i++) {
                var match = bySlug(slugs[i]);
                if (match) return match;
            }
            return null;
        }
        function newest(list) {
            return list.slice().sort(function (a, b) {
                return (b.date || '').localeCompare(a.date || '');
            })[0];
        }

        // 1. Manual override wins if provided and resolvable
        var override = window.MOS_RELATED_OVERRIDE;
        if (Array.isArray(override) && override.length) {
            var ov = firstResolvable(override);
            if (ov) return ov;
        }

        // 2. Curated relatedSlugs from articles.js
        if (Array.isArray(current.relatedSlugs) && current.relatedSlugs.length) {
            var curated = firstResolvable(current.relatedSlugs);
            if (curated) return curated;
        }

        // 3. Tag-overlap score (shared specific tags, then same category)
        var curTags = {};
        specificTags(current).forEach(function (t) { curTags[t] = 1; });
        var scored = others.map(function (a) {
            var shared = specificTags(a).filter(function (t) { return curTags[t]; }).length;
            var s = shared * 3;
            if (a.categorySlug === current.categorySlug) s += 1;
            return { article: a, score: s };
        }).filter(function (x) { return x.score > 0; });
        if (scored.length) {
            scored.sort(function (x, y) {
                return (y.score - x.score) ||
                       (y.article.date || '').localeCompare(x.article.date || '');
            });
            return scored[0].article;
        }

        // 4. Same category, newest
        if (current.categorySlug) {
            var byCat = others.filter(function (a) { return a.categorySlug === current.categorySlug; });
            if (byCat.length) return newest(byCat);
        }
        // 5. Last resort: any newest
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
