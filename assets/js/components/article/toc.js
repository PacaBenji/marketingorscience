// toc.js — marketingorscience.com
// Auto-generates a Table of Contents from .article-body h2 elements.
// Only renders if >= 3 h2s found. Inserted as first child of .article-body.

(function () {
    'use strict';

    function createTOC() {
        var articleBody = document.querySelector('.article-body');
        if (!articleBody) return null;

        var headings = Array.prototype.slice.call(articleBody.querySelectorAll('h2'));
        if (headings.length < 3) return null;

        // Assign IDs to headings
        headings.forEach(function (h, idx) {
            if (!h.id) {
                h.id = 'section-' + (idx + 1);
            }
        });

        var nav = document.createElement('nav');
        nav.className = 'article-toc';
        nav.setAttribute('aria-label', 'Table of contents');

        var label = document.createElement('span');
        label.className = 'article-toc-heading';
        label.textContent = 'In This Article';
        nav.appendChild(label);

        var ol = document.createElement('ol');
        headings.forEach(function (h) {
            var li = document.createElement('li');
            var a  = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            li.appendChild(a);
            ol.appendChild(li);
        });

        nav.appendChild(ol);
        return nav;
    }

    window.createTOC = createTOC;
    window.dispatchEvent(new CustomEvent('tocComponentLoaded'));
})();
