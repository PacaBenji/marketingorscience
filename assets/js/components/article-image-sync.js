// article-image-sync.js — marketingorscience.com
// Sets article card thumbnail src from the MOS_ARTICLES manifest,
// keyed by each card's href. Eliminates hardcoded image paths in HTML.

(function () {
    'use strict';

    function sync() {
        var articles = window.MOS_ARTICLES;
        if (!articles) return;

        var lookup = {};
        articles.forEach(function (a) { if (a.url) lookup[a.url] = a.image; });

        document.querySelectorAll('.article-list-item').forEach(function (card) {
            var href = card.getAttribute('href');
            if (href && lookup[href]) {
                var img = card.querySelector('.list-item-thumb');
                if (img) img.src = lookup[href];
            }
        });
    }

    if (window.MOS_ARTICLES) {
        sync();
    } else {
        window.addEventListener('articlesLoaded', sync, { once: true });
    }
})();
