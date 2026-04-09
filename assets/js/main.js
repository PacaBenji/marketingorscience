// main.js — marketingorscience.com
// Injects navigation, stylesheet, and footer via IIFE.
// No framework dependencies; runs before DOMContentLoaded where possible.

(function () {
    'use strict';

    // ─── Path resolution ────────────────────────────────────────────────────
    // Root-relative paths throughout — works correctly at any directory depth
    // and is immune to the URL depth/file depth mismatch introduced by
    // Netlify clean URLs (extensionless serving).
    var pathname = window.location.pathname;
    var isInArticles = pathname.includes('/articles');

    var assetPath   = '/assets';
    var homePath    = '/';
    var articlesPath = '/articles';
    var aboutPath   = '/about';
    var privacyPath = '/privacy-policy';

    // ─── Determine active nav link ───────────────────────────────────────────
    var activePage = '';
    if (pathname.startsWith('/articles')) activePage = 'articles';
    else if (pathname.startsWith('/about')) activePage = 'about';

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

        // Article manifest — MOS_ARTICLES (loaded once, site-wide)
        if (!document.querySelector('script[data-mos-articles]')) {
            var manifest = document.createElement('script');
            manifest.src              = assetPath + '/js/articles.js';
            manifest.dataset.mosArticles = '1';
            document.head.appendChild(manifest);
        }

        // Search component — depends on manifest
        if (!document.querySelector('script[data-mos-search]')) {
            var searchScript = document.createElement('script');
            searchScript.src             = assetPath + '/js/components/search.js';
            searchScript.dataset.mosSearch = '1';
            document.head.appendChild(searchScript);
        }

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
                    '<div class="nav-zone--left">' +
                        '<a href="' + homePath + '" class="site-logo" aria-label="Marketing or Science — Home">' +
                            '<span class="logo-text">M<span class="logo-accent">o</span>S</span>' +
                            '<span class="logo-full">Marketing or Science</span>' +
                        '</a>' +
                    '</div>' +
                    '<div class="nav-zone--center">' +
                        '<ul class="nav-links" role="list">' +
                            '<li>' +
                                '<a class="nav-link-group' + (activePage === 'articles' ? ' active' : '') + '" href="' + articlesPath + '">' +
                                    '<span class="nav-label">Articles</span>' +
                                    '<span class="nav-verb">Read</span>' +
                                '</a>' +
                            '</li>' +
                            '<li>' +
                                '<a class="nav-link-group' + (activePage === 'about' ? ' active' : '') + '" href="' + aboutPath + '">' +
                                    '<span class="nav-label">About</span>' +
                                    '<span class="nav-verb">Learn</span>' +
                                '</a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div class="nav-zone--right">' +
                        '<button class="nav-search-toggle" aria-label="Open search" aria-expanded="false">' +
                            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                                '<circle cx="11" cy="11" r="8"/>' +
                                '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
                            '</svg>' +
                        '</button>' +
                        '<button class="nav-hamburger" aria-label="Open menu" aria-expanded="false">' +
                            '<span class="hamburger-bar"></span>' +
                            '<span class="hamburger-bar"></span>' +
                            '<span class="hamburger-bar"></span>' +
                        '</button>' +
                    '</div>' +
                '</nav>' +
                '<div class="search-overlay" role="search" aria-hidden="true">' +
                    '<div class="search-overlay-inner">' +
                        '<input id="site-search" type="search" placeholder="Search articles…" autocomplete="off" aria-label="Search articles">' +
                        '<button class="search-close" aria-label="Close search">' +
                            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                                '<line x1="18" y1="6" x2="6" y2="18"/>' +
                                '<line x1="6" y1="6" x2="18" y2="18"/>' +
                            '</svg>' +
                        '</button>' +
                    '</div>' +
                    '<ul class="search-results" aria-live="polite" aria-label="Search results"></ul>' +
                '</div>' +
                '<div class="nav-mobile-drawer" aria-hidden="true">' +
                    '<button class="drawer-close" aria-label="Close menu">' +
                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                            '<line x1="18" y1="6" x2="6" y2="18"/>' +
                            '<line x1="6" y1="6" x2="18" y2="18"/>' +
                        '</svg>' +
                    '</button>' +
                    '<ul class="drawer-links">' +
                        '<li><a href="' + articlesPath + '"' + (activePage === 'articles' ? ' class="active"' : '') + '>Articles</a></li>' +
                        '<li><a href="' + aboutPath + '"' + (activePage === 'about' ? ' class="active"' : '') + '>About</a></li>' +
                        '<li><a href="' + privacyPath + '">Privacy Policy</a></li>' +
                    '</ul>' +
                '</div>' +
                '<div class="topic-strip">' +
                    '<nav class="topic-strip-inner" aria-label="Browse by topic">' +
                        '<a class="topic-link" href="/articles?category=skincare">Skincare &amp; Beauty</a>' +
                        '<a class="topic-link" href="/articles?category=pharma">Pharma &amp; OTC Drugs</a>' +
                    '</nav>' +
                '</div>' +
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

    // ─── Search overlay toggle ───────────────────────────────────────────────
    function initSearchToggle() {
        var toggle  = document.querySelector('.nav-search-toggle');
        var overlay = document.querySelector('.search-overlay');
        var closeBtn = document.querySelector('.search-close');
        var input   = document.querySelector('#site-search');
        if (!toggle || !overlay) return;

        function openOverlay() {
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            if (input) {
                setTimeout(function () { input.focus(); }, 50);
            }
            if (window.MOS_Search && typeof window.MOS_Search.init === 'function') {
                window.MOS_Search.init();
            }
        }

        function closeOverlay() {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            if (window.MOS_Search && typeof window.MOS_Search.clearResults === 'function') {
                window.MOS_Search.clearResults();
            }
        }

        toggle.addEventListener('click', function () {
            if (overlay.classList.contains('is-open')) {
                closeOverlay();
            } else {
                openOverlay();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closeOverlay);
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
                closeOverlay();
                toggle.focus();
            }
        });
    }

    // ─── Mobile hamburger / drawer ───────────────────────────────────────────
    function initHamburger() {
        var hamburger = document.querySelector('.nav-hamburger');
        var drawer    = document.querySelector('.nav-mobile-drawer');
        if (!hamburger || !drawer) return;

        function openDrawer() {
            drawer.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.classList.add('drawer-open');
        }

        function closeDrawer() {
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('drawer-open');
        }

        hamburger.addEventListener('click', function () {
            if (drawer.classList.contains('is-open')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        var drawerClose = document.querySelector('.drawer-close');
        if (drawerClose) {
            drawerClose.addEventListener('click', closeDrawer);
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
                closeDrawer();
                hamburger.focus();
            }
        });
    }

    // ─── Bootstrap ───────────────────────────────────────────────────────────
    // Load stylesheet immediately (can run before DOM ready)
    loadStylesheet();

    function init() {
        insertNavigation();
        insertFooter();
        initSearchToggle();
        initHamburger();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

