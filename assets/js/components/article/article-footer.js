// article-footer.js
// Generates the per-article footer block (disclaimer + citation note)
// Optionally renders a correction/update notice when config.correction is provided.

(function () {
    'use strict';

    /**
     * createArticleFooter(config) → HTMLElement
     *
     * config {
     *   disclaimer   : string  — optional override of standard disclaimer text
     *   citationNote : string  — optional "How to cite this article" block
     *   correction   : {       — optional; only pass when article has been corrected/updated
     *     date  : string       — ISO date of the correction (e.g. '2026-05-01')
     *     text  : string       — explanation of what changed and why
     *   }
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

        var correctionHtml = '';
        if (cfg.correction && cfg.correction.date && cfg.correction.text) {
            var formatDate = window.MOS_formatDate || function (iso) { return iso; };
            correctionHtml =
                '<div class="claim-block claim-block--evidence" style="margin-top:0">' +
                    '<p class="claim-block-label">Correction \u2014 ' + formatDate(cfg.correction.date) + '</p>' +
                    '<p>' + cfg.correction.text + '</p>' +
                '</div>';
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'article-footer-block';
        wrapper.innerHTML =
            correctionHtml +
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
