// cta-block.js — marketingorscience.com
// createCTABlock() → HTMLElement
// Dark editorial CTA injected after the 3rd h2 in .article-body

(function () {
    'use strict';

    function createCTABlock() {
        var block = document.createElement('div');
        block.className = 'cta-block';

        block.innerHTML =
            '<span class="cta-block-kicker">About This Publication</span>' +
            '<p>' +
                'Marketing or Science publishes independent clinical evidence reviews — ' +
                'examining the gap between health and beauty marketing claims and the ' +
                'peer-reviewed literature.' +
            '</p>' +
            '<a href="/about" class="cta-block-link">Learn about our methodology &rarr;</a>';

        return block;
    }

    function injectCTABlock() {
        var articleBody = document.querySelector('.article-body');
        if (!articleBody) return;

        var headings = Array.prototype.slice.call(articleBody.querySelectorAll('h2'));
        if (headings.length < 3) return;

        var thirdH2 = headings[2];
        var cta = createCTABlock();

        // Insert *after* the 3rd h2 element
        if (thirdH2.nextSibling) {
            articleBody.insertBefore(cta, thirdH2.nextSibling);
        } else {
            articleBody.appendChild(cta);
        }
    }

    window.createCTABlock = createCTABlock;
    window.injectCTABlock = injectCTABlock;
    window.dispatchEvent(new CustomEvent('ctaBlockComponentLoaded'));
})();
