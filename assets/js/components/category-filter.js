// category-filter.js — marketingorscience.com
// Reads ?category= from URL and filters .article-list-item elements
// by their data-category attribute. Also marks the matching tab active.

(function () {
    'use strict';

    function init() {
        var params   = new URLSearchParams(window.location.search);
        var category = params.get('category') || '';

        var items = document.querySelectorAll('.article-list-item[data-category]');
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

        // Show / hide items
        items.forEach(function (item) {
            if (!category || item.getAttribute('data-category') === category) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });

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
