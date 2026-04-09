// main.js — marketingorscience.com
// Injects navigation, stylesheet, and footer via IIFE.
// No framework dependencies; runs before DOMContentLoaded where possible.

(function () {
    'use strict';

    // ─── Path resolution ────────────────────────────────────────────────────
    var isInArticles = window.location.pathname.includes('/articles/');
    var pageType     = isInArticles ? 'articles' : 'root';
    var assetPath    = isInArticles ? '../assets' : 'assets';
    var homePath     = isInArticles ? '../index.html'          : 'index.html';
    var articlesPath = isInArticles ? 'index.html'             : 'articles/index.html';
    var aboutPath    = isInArticles ? '../about.html'          : 'about.html';
    var privacyPath  = isInArticles ? '../privacy-policy.html' : 'privacy-policy.html';

    // ─── Determine active nav link ───────────────────────────────────────────
    var pathname = window.location.pathname;
    var activePage = '';
    if (pathname.includes('/articles/')) activePage = 'articles';
    else if (pathname.includes('about.html'))   activePage = 'about';

    function activeClass(page) {
        return activePage === page ? ' class="active"' : '';
    }

    // ─── Stylesheet loader ───────────────────────────────────────────────────
    function loadStylesheet() {
        if (document.querySelector('link[data-mos-css]')) return;

        var link = document.createElement('link');
        link.rel            = 'stylesheet';
        link.dataset.mosCss = '1';
        link.href           = assetPath + '/css/style.css';

        link.onload = link.onerror = function () {
            document.body.style.visibility = 'visible';
            document.body.style.opacity    = '1';
        };

        // Hard fallback: never leave the page invisible
        setTimeout(function () {
            document.body.style.visibility = 'visible';
            document.body.style.opacity    = '1';
        }, 2000);

        document.head.appendChild(link);

        // Google Fonts — Playfair Display, Lora, Inter
        if (!document.querySelector('link[data-mos-fonts]')) {
            var fonts = document.createElement('link');
            fonts.rel          = 'stylesheet';
            fonts.dataset.mosFonts = '1';
            fonts.href         =
                'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap';
            document.head.appendChild(fonts);
        }
    }

    // ─── Navigation ─────────────────────────────────────────────────────────
    function insertNavigation() {
        if (document.querySelector('header.site-header')) return;

        var html =
            '<header class="site-header">' +
                '<nav class="site-nav">' +
                    '<a href="' + homePath + '" class="site-logo" aria-label="Marketing or Science — Home">' +
                        '<span class="logo-text">M<span class="logo-accent">o</span>S</span>' +
                        '<span class="logo-full">Marketing or Science</span>' +
                    '</a>' +
                    '<ul class="nav-links" role="list">' +
                        '<li><a href="' + articlesPath + '"' + activeClass('articles') + '>Articles</a></li>' +
                        '<li><a href="' + aboutPath + '"'   + activeClass('about')    + '>About</a></li>' +
                    '</ul>' +
                '</nav>' +
            '</header>';

        document.body.insertAdjacentHTML('afterbegin', html);
    }

    // ─── Footer ──────────────────────────────────────────────────────────────
    function insertFooter() {
        if (document.querySelector('footer.site-footer')) return;

        var year = new Date().getFullYear();
        var html =
            '<footer class="site-footer">' +
                '<div class="footer-inner">' +
                    '<div class="footer-brand">' +
                        '<span class="footer-logo-text">Marketing or Science</span>' +
                        '<p class="footer-tagline">Clinical evidence reviews for health professionals.</p>' +
                    '</div>' +
                    '<nav class="footer-nav" aria-label="Footer navigation">' +
                        '<a href="' + articlesPath + '">Articles</a>' +
                        '<a href="' + aboutPath + '">About</a>' +
                        '<a href="' + privacyPath + '">Privacy Policy</a>' +
                    '</nav>' +
                    '<p class="footer-copy">&copy; ' + year + ' Marketing or Science. All rights reserved.</p>' +
                '</div>' +
            '</footer>';

        document.body.insertAdjacentHTML('beforeend', html);
    }

    // ─── Bootstrap ───────────────────────────────────────────────────────────
    // Load stylesheet immediately (can run before DOM ready)
    loadStylesheet();

    function init() {
        insertNavigation();
        insertFooter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
