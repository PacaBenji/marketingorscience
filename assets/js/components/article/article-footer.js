// article-footer.js
// Generates the per-article footer block (disclaimer + citation note)

(function () {
    'use strict';

    /**
     * createArticleFooter(config) → HTMLElement
     *
     * config {
     *   disclaimer   : string  — optional override of standard disclaimer text
     *   citationNote : string  — optional "How to cite this article" block
     * }
     */
    function createArticleFooter(config) {
        var cfg = config || {};

        var disclaimer = cfg.disclaimer || (
            'This analysis is produced for health professionals and informed consumers. ' +
            'It does not constitute medical advice. Clinical evidence cited reflects ' +
            'the state of the literature at time of publication; consult primary sources ' +
            'before making clinical decisions.'
        );

        var wrapper = document.createElement('div');
        wrapper.className = 'article-footer-block';
        wrapper.innerHTML =
            '<div class="article-disclaimer">' +
                '<p class="disclaimer-label">Editorial Disclaimer</p>' +
                '<p>' + disclaimer + '</p>' +
            '</div>' +
            (cfg.citationNote
                ? '<div class="article-citation-note"><p class="disclaimer-label">Citation</p><p>' + cfg.citationNote + '</p></div>'
                : ''
            );

        return wrapper;
    }

    window.createArticleFooter = createArticleFooter;
    window.dispatchEvent(new CustomEvent('articleFooterComponentLoaded'));
})();
