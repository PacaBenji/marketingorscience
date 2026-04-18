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
    else if (pathname.startsWith('/experts')) activePage = 'experts';
    else if (pathname.startsWith('/methods')) activePage = 'methods';

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

        // Favicon — injected once, site-wide
        if (!document.querySelector('link[data-mos-favicon]')) {
            var favicon = document.createElement('link');
            favicon.rel              = 'icon';
            favicon.type             = 'image/svg+xml';
            favicon.href             = assetPath + '/images/logo/mos-favicon.svg';
            favicon.dataset.mosFavicon = '1';
            document.head.appendChild(favicon);

            // PNG fallback for older browsers
            var faviconPng = document.createElement('link');
            faviconPng.rel  = 'alternate icon';
            faviconPng.type = 'image/png';
            faviconPng.href = assetPath + '/images/logo/favicon-32x32.png';
            document.head.appendChild(faviconPng);

            // Apple touch icon
            var appleTouchIcon = document.createElement('link');
            appleTouchIcon.rel  = 'apple-touch-icon';
            appleTouchIcon.href = assetPath + '/images/logo/apple-touch-icon.png';
            document.head.appendChild(appleTouchIcon);
        }

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
            searchScript.onload = function () {
                if (window.MOS_Search && typeof window.MOS_Search.init === 'function') {
                    window.MOS_Search.init();
                }
            };
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
                '<nav class="site-nav" role="navigation" aria-label="Main navigation">' +
                    '<div class="nav-zone--left">' +
                        '<a href="' + homePath + '" class="site-logo" aria-label="Marketing or Science — Home">' +
                            '<img class="logo-img logo-img--dark" src="' + assetPath + '/images/logo/mos-logo-light.svg" alt="Marketing or Science" width="58" height="36">' +
                        '</a>' +
                    '</div>' +
                    '<div class="nav-zone--right">' +
                        '<button class="nav-search-icon" aria-label="Search" aria-expanded="false">' +
                            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                                '<circle cx="11" cy="11" r="8"/>' +
                                '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
                            '</svg>' +
                        '</button>' +
                        '<button class="nav-menu-toggle" aria-label="Open menu" aria-expanded="false">' +
                            '<span class="toggle-bars">' +
                                '<span class="toggle-bar"></span>' +
                                '<span class="toggle-bar"></span>' +
                                '<span class="toggle-bar"></span>' +
                            '</span>' +
                            '<span class="toggle-label">Menu</span>' +
                        '</button>' +
                    '</div>' +
                '</nav>' +

                '<div class="mega-menu" aria-hidden="true" role="dialog" aria-label="Site navigation menu">' +
                    '<div class="mega-menu-inner">' +

                        '<button class="mega-menu-close" aria-label="Close menu">' +
                            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                                '<line x1="18" y1="6" x2="6" y2="18"/>' +
                                '<line x1="6" y1="6" x2="18" y2="18"/>' +
                            '</svg>' +
                            '<span>Close</span>' +
                        '</button>' +

                        '<a href="' + homePath + '" class="mega-menu-logo" aria-label="Marketing or Science — Home">' +
                            '<img src="' + assetPath + '/images/logo/mos-logo-dark.svg" alt="Marketing or Science" width="71" height="44">' +
                        '</a>' +

                        '<div class="mega-menu-search">' +
                            '<input id="site-search" type="search" placeholder="Search articles…"' +
                                   ' autocomplete="off" aria-label="Search articles">' +
                            '<ul class="search-results" aria-live="polite" aria-label="Search results"></ul>' +
                        '</div>' +

                        '<div class="mega-menu-columns">' +

                            '<div class="mega-col mega-col--sections">' +
                                '<p class="mega-col-heading">Browse</p>' +
                                '<ul class="mega-nav-list">' +
                                    '<li><a class="mega-nav-link" href="/articles">Latest Articles</a></li>' +
                                    '<li><a class="mega-nav-link" href="/articles?category=skincare">Skincare</a></li>' +
                                    '<li><a class="mega-nav-link" href="/articles?category=haircare">Haircare</a></li>' +
                                    '<li><a class="mega-nav-link" href="/articles?category=wellness">Wellness</a></li>' +
                                    '<li><a class="mega-nav-link" href="/articles?category=pharma">Pharma &amp; OTC</a></li>' +
                                '</ul>' +
                            '</div>' +

                            '<div class="mega-col mega-col--utility">' +
                                '<p class="mega-col-heading">Article Types</p>' +
                                '<div class="mega-tag-group">' +
                                    '<a class="mega-tag-link" href="/articles?type=ingredient-analysis">Ingredient Analysis</a>' +
                                    '<a class="mega-tag-link" href="/articles?type=product-breakdown">Product Breakdown</a>' +
                                    '<a class="mega-tag-link" href="/articles?type=trial-review">Trial Review</a>' +
                                    '<a class="mega-tag-link" href="/articles?type=regulatory-review">Regulatory Review</a>' +
                                '</div>' +
                                '<p class="mega-col-heading mega-col-heading--spaced">About</p>' +
                                '<ul class="mega-utility-list">' +
                                    '<li><a class="mega-utility-link" href="/about">About</a></li>' +
                                    '<li><a class="mega-utility-link" href="/experts">Experts</a></li>' +
                                    '<li><a class="mega-utility-link" href="/methods">Methods</a></li>' +
                                    '<li><a class="mega-utility-link" href="/contact">Contact</a></li>' +
                                    '<li><a class="mega-utility-link" href="/using-our-articles">Using Our Articles</a></li>' +
                                    '<li><a class="mega-utility-link" href="/corrections">Corrections</a></li>' +
                                    '<li><a class="mega-utility-link" href="/submit">Submit a Proposal</a></li>' +
                                '</ul>' +
                            '</div>' +

                        '</div>' +
                    '</div>' +
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

                    '<div class="footer-top">' +
                        '<a href="' + homePath + '" class="footer-wordmark" aria-label="Marketing or Science — Home">' +
                            '<img src="' + assetPath + '/images/logo/mos-logo-light.svg" alt="Marketing or Science" class="footer-logo-img">' +
                        '</a>' +
                        '<p class="footer-descriptor">Clinical evidence reviews for health &amp; beauty claims.</p>' +
                    '</div>' +

                    '<div class="footer-columns">' +

                        '<div class="footer-col footer-col--about">' +
                            '<h3 class="footer-col-heading">About</h3>' +
                            '<ul class="footer-col-links">' +
                                '<li><a href="' + aboutPath + '">Our Mission</a></li>' +
                                '<li><a href="/experts">Experts</a></li>' +
                                '<li><a href="/methods">Methods</a></li>' +
                            '</ul>' +
                        '</div>' +

                        '<div class="footer-col footer-col--topics">' +
                            '<h3 class="footer-col-heading">Topics</h3>' +
                            '<ul class="footer-col-links">' +
                                '<li><a href="/articles?category=skincare">Skincare</a></li>' +
                                '<li><a href="/articles?category=haircare">Haircare</a></li>' +
                                '<li><a href="/articles?category=wellness">Wellness</a></li>' +
                                '<li><a href="/articles?category=pharma">Pharma &amp; OTC</a></li>' +
                                '<li><a href="' + articlesPath + '">All Articles</a></li>' +
                            '</ul>' +
                        '</div>' +

                        '<div class="footer-col footer-col--newsletter">' +
                            '<h3 class="footer-col-heading">Stay Informed</h3>' +
                            '<p class="footer-newsletter-desc">Get evidence reviews delivered when it matters.</p>' +
                            '<form class="footer-newsletter-form" action="#" method="post" novalidate>' +
                                '<div class="footer-newsletter-row">' +
                                    '<input class="footer-newsletter-input" type="email" placeholder="your@email.com" aria-label="Email address" required>' +
                                    '<button class="footer-newsletter-btn" type="submit">Subscribe</button>' +
                                '</div>' +
                            '</form>' +
                        '</div>' +

                    '</div>' +

                '</div>' +

            '<div class="footer-bottom">' +
                '<p class="footer-copy">&copy; ' + year + ' Marketing or Science. All rights reserved.</p>' +
                '<nav class="footer-legal-nav" aria-label="Legal navigation">' +
                    '<a href="' + privacyPath + '">Privacy Policy</a>' +
                    '<a href="/terms">Terms of Use</a>' +
                '</nav>' +
            '</div>' +

            '</footer>';

        document.body.insertAdjacentHTML('beforeend', html);
    }

    // ─── Mega-menu ───────────────────────────────────────────────────────────
    function initMegaMenu() {
        var menuToggle  = document.querySelector('.nav-menu-toggle');
        var searchIcon  = document.querySelector('.nav-search-icon');
        var megaMenu    = document.querySelector('.mega-menu');
        var toggleLabel = document.querySelector('.toggle-label');
        var input       = document.querySelector('#site-search');
        if (!menuToggle || !megaMenu) return;

        var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        function openMenu(focusSearch) {
            megaMenu.classList.add('is-open');
            megaMenu.setAttribute('aria-hidden', 'false');
            menuToggle.setAttribute('aria-expanded', 'true');
            if (searchIcon) searchIcon.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = scrollbarWidth + 'px';
            document.documentElement.style.paddingRight = scrollbarWidth + 'px';
            if (focusSearch && input) {
                setTimeout(function () { input.focus(); }, 50);
                if (window.MOS_Search && typeof window.MOS_Search.init === 'function') {
                    window.MOS_Search.init();
                }
            } else {
                megaMenu.focus();
            }
        }

        function closeMenu() {
            megaMenu.classList.remove('is-open');
            megaMenu.setAttribute('aria-hidden', 'true');
            menuToggle.setAttribute('aria-expanded', 'false');
            if (searchIcon) searchIcon.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.documentElement.style.paddingRight = '';
            if (window.MOS_Search && typeof window.MOS_Search.clearResults === 'function') {
                window.MOS_Search.clearResults();
            }
        }

        menuToggle.addEventListener('click', function () {
            megaMenu.classList.contains('is-open') ? closeMenu() : openMenu(false);
        });

        if (searchIcon) {
            searchIcon.addEventListener('click', function () {
                megaMenu.classList.contains('is-open') ? closeMenu() : openMenu(true);
            });
        }

        // Escape key closes
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && megaMenu.classList.contains('is-open')) {
                closeMenu();
                menuToggle.focus();
            }
        });

        // Close button inside mega-menu-inner
        var closeBtn = document.querySelector('.mega-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                closeMenu();
                menuToggle.focus();
            });
        }

        // Click outside the inner panel closes (backdrop click)
        megaMenu.addEventListener('click', function (e) {
            if (e.target === megaMenu) closeMenu();
        });
    }

    // ─── Scroll animations ───────────────────────────────────────────────────
    function initScrollAnimations() {
        if (!window.IntersectionObserver) return;

        var targets = document.querySelectorAll([
            '.article-card',
            '.article-list-item',
            '.read-more-card',
            '.popular-item',
            '.about-panel-inner',
            '.site-hero-inner',
            '.fold-inner',
            '.article-figure',
            '.verdict-block',
            '.cta-block',
            '.section-header'
        ].join(','));

        if (!targets.length) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        targets.forEach(function(el, i) {
            var type = el.classList.contains('article-figure') ? 'fade-in' : 'fade-up';
            el.classList.add('will-animate', type);

            var delay = (i % 3) * 80;
            if (delay) el.style.transitionDelay = delay + 'ms';

            observer.observe(el);
        });
    }

    // ─── Bootstrap ───────────────────────────────────────────────────────────
    // Load stylesheet immediately (can run before DOM ready)
    loadStylesheet();

    function init() {
        insertNavigation();
        insertFooter();
        initMegaMenu();
        initScrollAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

