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

        var badgeRow =
            '<div class="card-badge-row">' +
                '<span class="category-badge category--' + (article.categorySlug || 'general') + '">' +
                    (article.category || '') +
                '</span>' +
                '<span class="article-type-badge">' + (article.type || '') + '</span>' +
            '</div>';

        var headline =
            '<h3 class="read-more-card-headline">' + (article.title || '') + '</h3>';

        var deck = article.deck
            ? '<p class="read-more-card-deck">' + article.deck + '</p>'
            : '';

        var meta =
            '<div class="read-more-card-meta">' +
                '<span>' + (article.author || '') + '</span>' +
                (article.date
                    ? '<span aria-hidden="true">&middot;</span><time datetime="' + article.date + '">' + formatDate(article.date) + '</time>'
                    : '') +
            '</div>';

        a.innerHTML = badgeRow + headline + deck + meta;
        return a;
    }

    function createReadMore(config) {
        var cfg = config || {};
        var currentSlug     = cfg.currentSlug     || '';
        var currentCategory = cfg.currentCategory || '';
        var currentAuthor   = cfg.currentAuthor   || '';
        var limit           = cfg.limit           || 3;

        function build(articles) {
            var tabs = [
                { id: 'popular', label: 'Most Popular' },
                { id: 'author',  label: 'By the Author' },
                { id: 'topic',   label: 'More on the Topic' }
            ];

            // Pre-compute each tab's articles
            var tabData = {};
            tabs.forEach(function (tab) {
                tabData[tab.id] = getArticles(articles, currentSlug, tab.id, {
                    currentCategory: currentCategory,
                    currentAuthor:   currentAuthor,
                    limit:           limit
                });
            });

            // Hide tabs with 0 results
            var visibleTabs = tabs.filter(function (tab) {
                return tabData[tab.id].length > 0;
            });

            if (visibleTabs.length === 0) return null;

            var section = document.createElement('section');
            section.className = 'read-more-section';

            var inner = document.createElement('div');
            inner.className = 'read-more-inner';

            var heading = document.createElement('p');
            heading.className = 'read-more-heading';
            heading.textContent = 'Continue Reading';
            inner.appendChild(heading);

            // Tab bar
            var tabBar = document.createElement('div');
            tabBar.className = 'read-more-tabs';
            tabBar.setAttribute('role', 'tablist');

            var panels = {};

            visibleTabs.forEach(function (tab, idx) {
                var btn = document.createElement('button');
                btn.className = 'read-more-tab' + (idx === 0 ? ' active' : '');
                btn.textContent = tab.label;
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
                btn.setAttribute('aria-controls', 'read-more-panel-' + tab.id);
                btn.dataset.tab = tab.id;
                tabBar.appendChild(btn);
            });

            inner.appendChild(tabBar);

            // Panels
            visibleTabs.forEach(function (tab, idx) {
                var panel = document.createElement('div');
                panel.className = 'read-more-panel';
                panel.id = 'read-more-panel-' + tab.id;
                panel.setAttribute('role', 'tabpanel');
                if (idx !== 0) panel.setAttribute('hidden', '');

                tabData[tab.id].forEach(function (article) {
                    panel.appendChild(renderCard(article));
                });

                panels[tab.id] = panel;
                inner.appendChild(panel);
            });

            // Tab switching logic
            tabBar.addEventListener('click', function (e) {
                var btn = e.target.closest('.read-more-tab');
                if (!btn) return;

                var tabId = btn.dataset.tab;

                // Update tab states
                var allBtns = tabBar.querySelectorAll('.read-more-tab');
                allBtns.forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                // Show/hide panels
                visibleTabs.forEach(function (tab) {
                    if (panels[tab.id]) {
                        if (tab.id === tabId) {
                            panels[tab.id].removeAttribute('hidden');
                        } else {
                            panels[tab.id].setAttribute('hidden', '');
                        }
                    }
                });
            });

            section.appendChild(inner);
            return section;
        }

        // If articles already loaded, build synchronously
        if (window.MOS_ARTICLES) {
            return build(window.MOS_ARTICLES);
        }

        // Otherwise, create a placeholder and fill it when ready
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
