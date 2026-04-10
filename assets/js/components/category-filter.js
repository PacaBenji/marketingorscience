// category-filter.js — marketingorscience.com
// Reads ?category= and ?type= from URL and filters .article-list-item elements
// by their data-category and data-type attributes. Also marks the matching tab
// active and updates the page heading dynamically.

(function () {
    'use strict';

    function init() {
        var params   = new URLSearchParams(window.location.search);
        var category = params.get('category') || '';
        var type     = params.get('type') || '';

        var items = document.querySelectorAll('.article-list-item');
        var tabs  = document.querySelectorAll('.filter-tab');

        // Update tab active states
        tabs.forEach(function (tab) {
            tab.classList.remove('active');
            var href = tab.getAttribute('href') || '';
            if (!category && !type && (href === '/articles' || href === '/articles/' || href === '../articles')) {
                tab.classList.add('active');
            } else if (category && href.indexOf('category=' + category) !== -1) {
                tab.classList.add('active');
            }
            // Note: type tabs are not in the filter-bar, so no type tab activation needed here
        });

        // Show / hide items by category AND/OR type
        items.forEach(function (item) {
            var itemCat  = item.getAttribute('data-category') || '';
            var itemType = item.getAttribute('data-type') || '';
            var catMatch  = !category || itemCat === category;
            var typeMatch = !type     || itemType === type;
            item.style.display = (catMatch && typeMatch) ? '' : 'none';
        });

        // Update page heading based on active filter
        var heading = document.querySelector('.page-header-title');
        if (heading) {
            var categoryLabels = {
                ''         : 'All Articles',
                'skincare' : 'Skincare',
                'haircare' : 'Haircare',
                'wellness' : 'Wellness',
                'otc'      : 'OTC Drugs',
                'pharma'   : 'Pharma'
            };
            var typeLabels = {
                'ingredient-analysis' : 'Ingredient Analyses',
                'product-breakdown'   : 'Product Breakdowns',
                'trial-review'        : 'Trial Reviews',
                'regulatory-review'   : 'Regulatory Reviews'
            };
            if (type && typeLabels[type]) {
                heading.textContent = typeLabels[type];
            } else if (category && categoryLabels[category]) {
                heading.textContent = categoryLabels[category];
            } else {
                heading.textContent = 'All Articles';
            }
        }

        // Intercept tab clicks to update URL without full reload where possible
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function (e) {
                var href = tab.getAttribute('href') || '';
                // Allow normal navigation — browser handles it.
                // The filter runs on load, so the URL change is sufficient.
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
