// category-filter.js — marketingorscience.com
// Reads ?category= from URL for category tabs.
// Type dropdown filters in-page without URL changes.
// Filters .article-list-item by data-category and data-type (AND logic).

(function () {
    'use strict';

    var activeType = '';

    function populateTypeDropdown(select) {
        var types = {};
        (window.MOS_ARTICLES || []).forEach(function (a) {
            if (a.type) { types[a.type] = true; }
        });
        Object.keys(types).sort().forEach(function (type) {
            var opt = document.createElement('option');
            opt.value = type.toLowerCase().replace(/\s+/g, '-');
            opt.textContent = type;
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

        // Show / hide items by category AND type
        items.forEach(function (item) {
            var itemCat  = item.getAttribute('data-category') || '';
            var itemType = item.getAttribute('data-type') || '';
            var catMatch  = !category || itemCat === category;
            var typeMatch = !activeType || itemType === activeType;
            item.style.display = (catMatch && typeMatch) ? '' : 'none';
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
            if (activeType) {
                // Find the display label from the select options
                var select = document.getElementById('type-filter');
                var selectedOpt = select && select.options[select.selectedIndex];
                heading.textContent = selectedOpt ? selectedOpt.textContent : activeType.replace(/-/g, ' ');
            } else if (category && categoryLabels[category]) {
                heading.textContent = categoryLabels[category];
            } else {
                heading.textContent = 'All Articles';
            }
        }
    }

    function init() {
        var select = document.getElementById('type-filter');
        if (select && select.options.length <= 1) {
            populateTypeDropdown(select);
        }
        if (select) {
            select.addEventListener('change', function () {
                activeType = select.value;
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
