// read-more.js — marketingorscience.com
// createReadMore(config) → HTMLElement | null
// Three-tab read-more section powered by window.MOS_ARTICLES

(function () {
    'use strict';

    function formatDate(iso) {
        try {
            var d = new Date(iso + 'T12:00:00Z');
            return d.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
            });
        } catch (e) { return iso; }
    }

    function sortByDateDesc(a, b) {
        return (b.date || '').localeCompare(a.date || '');
    }

    function getArticles(articles, currentSlug, tab, config) {
        var filtered = articles.filter(function (a) {
            return a.slug !== currentSlug;
        });

        switch (tab) {
            case 'popular':
                return filtered
                    .filter(function (a) { return a.popular === true; })
                    .sort(function (a, b) { return (a.popularRank || 99) - (b.popularRank || 99); })
                    .slice(0, config.limit || 3);
            case 'author':
                return filtered
                    .filter(function (a) { return a.authorSlug === config.currentAuthor; })
                    .sort(sortByDateDesc)
                    .slice(0, config.limit || 3);
            case 'topic':
                return filtered
                    .filter(function (a) { return a.categorySlug === config.currentCategory; })
                    .sort(sortByDateDesc)
                    .slice(0, config.limit || 3);
            default:
                return [];
        }
    }

    function renderCard(article) {
        var a = document.createElement('a');
        a.className = 'read-more-card';
        a.href = article.url || '#';

        var categoryLine =
            '<span class="read-more-card-category">' + (article.category || '') + '</span>';

        var headline =
            '<h3 class="read-more-card-headline">' + (article.title || '') + '</h3>';

        var deck = article.deck
            ? '<p class="read-more-card-deck">' + article.deck + '</p>'
            : '';

        var meta =
            '<div class="read-more-card-meta">' +
                '<span class="read-more-card-author">' + (article.author || '') + '</span>' +
                (article.readingTime
                    ? '<span class="read-more-card-dot" aria-hidden="true">&middot;</span>' +
                      '<span class="read-more-card-time">' + article.readingTime + ' min read</span>'
                    : '') +
            '</div>';

        var imageHTML = article.image
            ? '<div class="read-more-card-image-wrap">' +
                  '<img src="' + article.image + '" alt="" loading="lazy" aria-hidden="true">' +
              '</div>'
            : '';

        a.innerHTML = imageHTML + categoryLine + headline + deck + meta;
        return a;
    }

    function createReadMore(config) {
        var cfg = config || {};
        var currentSlug     = cfg.currentSlug     || '';
        var currentCategory = cfg.currentCategory || '';
        var currentAuthor   = cfg.currentAuthor   || '';
        var limit           = cfg.limit           || 3;

        function build(articles) {
            // Auto-resolve author from manifest if not explicitly provided
            if (!currentAuthor) {
                var self = articles.find(function(a) { return a.slug === currentSlug; });
                if (self) currentAuthor = self.authorSlug;
            }
            var allOthers = articles.filter(function (a) {
                return a.slug !== currentSlug;
            });

            // ── Left column: Most Popular (ranked list) ──────────────────────
            var popular = allOthers
                .filter(function (a) { return a.popular === true; })
                .sort(function (a, b) { return (a.popularRank || 99) - (b.popularRank || 99); })
                .slice(0, 5);

            // ── Right column: More from Author OR Topic ───────────────────────
            var moreLabel  = '';
            var moreArticles = [];

            // Try author first
            var byAuthor = allOthers
                .filter(function (a) { return currentAuthor && a.authorSlug === currentAuthor; })
                .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); })
                .slice(0, 3);

            if (byAuthor.length > 0) {
                moreArticles = byAuthor;
                // Build a readable author name from the slug
                moreLabel = 'More From ' + (byAuthor[0].author || currentAuthor);
            } else {
                // Fall back to topic
                var byTopic = allOthers
                    .filter(function (a) { return a.categorySlug === currentCategory; })
                    .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); })
                    .slice(0, 3);
                moreArticles = byTopic;
                moreLabel = 'More From ' + (byTopic[0] ? byTopic[0].category : currentCategory);
            }

            // Need at least one column to render
            if (popular.length === 0 && moreArticles.length === 0) return null;

            var section = document.createElement('section');
            section.className = 'read-more-section';
            section.setAttribute('aria-label', 'Continue reading');

            var inner = document.createElement('div');
            inner.className = 'read-more-inner';

            // ── Two-column layout ─────────────────────────────────────────────
            var grid = document.createElement('div');
            grid.className = 'read-more-grid';

            // ── LEFT: Most Popular ────────────────────────────────────────────
            if (popular.length > 0) {
                var leftCol = document.createElement('div');
                leftCol.className = 'read-more-col read-more-col--popular';

                var leftHeader = document.createElement('div');
                leftHeader.className = 'read-more-col-header';
                leftHeader.innerHTML =
                    '<h2 class="read-more-col-title">Most Popular</h2>';
                leftCol.appendChild(leftHeader);

                var rankList = document.createElement('ol');
                rankList.className = 'popular-list';

                popular.forEach(function (article, idx) {
                    var li = document.createElement('li');
                    li.className = 'popular-item';

                    var verdictDot = article.verdictClass
                        ? '<span class="popular-verdict-dot popular-verdict-dot--' + article.verdictClass + '" aria-hidden="true"></span>'
                        : '';

                    li.innerHTML =
                        '<a class="popular-item-link" href="' + (article.url || '#') + '">' +
                            '<span class="popular-rank" aria-hidden="true">' + (idx + 1) + '</span>' +
                            '<span class="popular-body">' +
                                '<span class="popular-title">' + (article.title || '') + '</span>' +
                                '<span class="popular-meta">' +
                                    verdictDot +
                                    '<span class="popular-author">' + (article.author || '') + '</span>' +
                                    (article.readingTime
                                        ? '<span class="popular-dot" aria-hidden="true">&middot;</span>' +
                                          '<span class="popular-time">' + article.readingTime + ' min</span>'
                                        : '') +
                                '</span>' +
                            '</span>' +
                        '</a>';

                    rankList.appendChild(li);
                });

                leftCol.appendChild(rankList);
                grid.appendChild(leftCol);
            }

            // ── RIGHT: More From Author/Topic ─────────────────────────────────
            if (moreArticles.length > 0) {
                var rightCol = document.createElement('div');
                rightCol.className = 'read-more-col read-more-col--more';

                var rightHeader = document.createElement('div');
                rightHeader.className = 'read-more-col-header';
                rightHeader.innerHTML =
                    '<h2 class="read-more-col-title">' + moreLabel + '</h2>' +
                    '<a class="read-more-see-all" href="' +
                        (currentCategory ? '/articles?category=' + currentCategory : '/articles') +
                    '">See All</a>';
                rightCol.appendChild(rightHeader);

                var cardGrid = document.createElement('div');
                cardGrid.className = 'read-more-card-grid';

                moreArticles.forEach(function (article) {
                    cardGrid.appendChild(renderCard(article));
                });

                rightCol.appendChild(cardGrid);
                grid.appendChild(rightCol);
            }

            inner.appendChild(grid);
            section.appendChild(inner);
            return section;
        }

        if (window.MOS_ARTICLES) {
            return build(window.MOS_ARTICLES);
        }

        var placeholder = document.createElement('div');
        placeholder.id = 'read-more-placeholder';

        window.addEventListener('articlesLoaded', function () {
            if (!window.MOS_ARTICLES) return;
            var section = build(window.MOS_ARTICLES);
            if (section && placeholder.parentNode) {
                placeholder.parentNode.replaceChild(section, placeholder);
            }
        }, { once: true });

        return placeholder;
    }

    window.createReadMore = createReadMore;
    window.dispatchEvent(new CustomEvent('readMoreComponentLoaded'));
})();
