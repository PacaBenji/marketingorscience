// category-filter.js — marketingorscience.com
// Reads ?category= from URL for category tabs.
// Tag dropdown filters in-page without URL changes.
// Filters .article-list-item by data-category and data-tags (AND logic).

(function () {
    'use strict';

    var activeTag = '';

    function populateTagDropdown(select) {
        var tags = {};
        (window.MOS_ARTICLES || []).forEach(function (a) {
            (a.tags || []).forEach(function (t) { tags[t] = true; });
        });
        Object.keys(tags).sort().forEach(function (tag) {
            var opt = document.createElement('option');
            opt.value = tag;
            opt.textContent = tag.replace(/-/g, ' ');
            select.appendChild(opt);
        });
    }

    function applyFilters() {
        var params   = new URLSearchParams(window.location.search);
        var category = params.get('category') || '';

        var items = document.querySelectorAll('.article-list-item');
        var tabs  = document.querySelectorAll('.filter-tab');

        // Update tab active states
        tabs.forEach(function (tab) {
            tab.classList.remove('active');
            var href = tab.getAttribute('href') || '';
            if (!category && (href === '/articles' || href === '/articles/' || href === '../articles')) {
                tab.classList.add('active');
            } else if (category && href.indexOf('category=' + category) !== -1) {
                tab.classList.add('active');
            }
        });

        // Show / hide items by category AND tag
        items.forEach(function (item) {
            var itemCat  = item.getAttribute('data-category') || '';
            var itemTags = item.getAttribute('data-tags') || '';
            var catMatch = !category || itemCat === category;
            var tagMatch = !activeTag || itemTags.split(' ').indexOf(activeTag) !== -1;
            item.style.display = (catMatch && tagMatch) ? '' : 'none';
        });

        // Update page heading
        var heading = document.querySelector('.page-header-title');
        if (heading) {
            var categoryLabels = {
                ''         : 'All Articles',
                'skincare' : 'Skincare',
                'haircare' : 'Haircare',
                'wellness' : 'Wellness',
                'pharma'   : 'Pharma & OTC'
            };
            if (activeTag) {
                heading.textContent = activeTag.replace(/-/g, ' ');
            } else if (category && categoryLabels[category]) {
                heading.textContent = categoryLabels[category];
            } else {
                heading.textContent = 'All Articles';
            }
        }
    }

    function init() {
        var select = document.getElementById('tag-filter');
        if (select && select.options.length <= 1) {
            populateTagDropdown(select);
        }
        if (select) {
            select.addEventListener('change', function () {
                activeTag = select.value;
                applyFilters();
            });
        }
        applyFilters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-run after dynamic article list is rendered
    window.addEventListener('articleListRendered', init, { once: true });
})();
