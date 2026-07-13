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
            if (document.body) {
                document.body.style.visibility = 'visible';
                document.body.style.opacity    = '1';
            }
        };

        // Hard fallback: never leave the page invisible
        setTimeout(function () {
            if (document.body) {
                document.body.style.visibility = 'visible';
                document.body.style.opacity    = '1';
            }
        }, 2000);

        document.head.appendChild(link);

        // Favicon — injected once, site-wide
        if (!document.querySelector('link[data-mos-favicon]')) {
            var favicon = document.createElement('link');
            favicon.rel              = 'icon';
            favicon.type             = 'image/svg+xml';
            favicon.href             = assetPath + '/images/logo/favicon.svg';
            favicon.dataset.mosFavicon = '1';
            document.head.appendChild(favicon);
        }

        // Article manifest — MOS_ARTICLES (loaded once, site-wide)
        if (!document.querySelector('script[data-mos-articles]')) {
            var manifest = document.createElement('script');
            manifest.src              = assetPath + '/js/articles.js';
            manifest.dataset.mosArticles = '1';
            manifest.onload = function () {
                if (!document.querySelector('script[data-mos-sd]')) {
                    var sd = document.createElement('script');
                    sd.src          = assetPath + '/js/structured-data.js';
                    sd.dataset.mosSd = '1';
                    document.head.appendChild(sd);
                }
            };
            document.head.appendChild(manifest);
        }

        // Shared date formatter — loaded before component scripts
        if (!document.querySelector('script[data-mos-formatdate]')) {
            var fmtDate = document.createElement('script');
            fmtDate.src                  = assetPath + '/js/utils/format-date.js';
            fmtDate.dataset.mosFormatdate = '1';
            document.head.appendChild(fmtDate);
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

        // Converge custom event tracking
        if (!document.querySelector('script[data-mos-tracking]')) {
            var trackingScript = document.createElement('script');
            trackingScript.src = assetPath + '/js/tracking.js';
            trackingScript.dataset.mosTracking = '1';
            document.head.appendChild(trackingScript);
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
                            '<img class="logo-img logo-img--dark" src="' + assetPath + '/images/logo/MoS-logo-b.svg" alt="Marketing or Science" width="48" height="36">' +
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
                            '<img src="' + assetPath + '/images/logo/MoS-logo-w.svg" alt="Marketing or Science" width="56" height="42">' +
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
                            '<img src="' + assetPath + '/images/logo/MoS-logo-b.svg" alt="Marketing or Science" class="footer-logo-img">' +
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

                        '<div class="footer-col footer-col--resources">' +
                            '<h3 class="footer-col-heading">Resources</h3>' +
                            '<ul class="footer-col-links">' +
                                '<li><a href="/contact">Contact</a></li>' +
                                '<li><a href="/using-our-articles">Using Our Articles</a></li>' +
                                '<li><a href="/corrections">Corrections</a></li>' +
                                '<li><a href="/submit">Submit a Proposal</a></li>' +
                            '</ul>' +
                        '</div>' +

                        '<div class="footer-col footer-col--newsletter">' +
                            '<h3 class="footer-col-heading">Stay Informed</h3>' +
                            '<div class="footer-social" aria-label="Follow us">' +
                                '<a class="footer-social-link" href="https://www.instagram.com/marketingorscience/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' +
                                    '<svg class="footer-social-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">' +
                                        '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 01-1.38-.9 3.72 3.72 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.36 2.67.94 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.38.66-.66 1.08-1.33 1.38-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.12A5.92 5.92 0 0019.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 105.84 12 6.16 6.16 0 0012 5.84zm0 10.16A4 4 0 1116 12a4 4 0 01-4 4zm6.41-10.4a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44z"/>' +
                                    '</svg>' +
                                '</a>' +
                                '<a class="footer-social-link" href="https://www.youtube.com/@marketingorscience/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">' +
                                    '<svg class="footer-social-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">' +
                                        '<path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 00.5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 002.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 002.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>' +
                                    '</svg>' +
                                '</a>' +
                                '<a class="footer-social-link" href="https://x.com/marketingorsci" target="_blank" rel="noopener noreferrer" aria-label="X">' +
                                    '<svg class="footer-social-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">' +
                                        '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' +
                                    '</svg>' +
                                '</a>' +
                            '</div>' +
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
                '<p class="footer-copy">&copy; ' + year + ' marketingorscience.com. All rights reserved.</p>' +
                '<nav class="footer-legal-nav" aria-label="Legal navigation">' +
                    '<a href="' + privacyPath + '">Privacy Policy</a>' +
                    '<a href="/terms">Terms of Use</a>' +
                '</nav>' +
            '</div>' +

            '</footer>';

        document.body.insertAdjacentHTML('beforeend', html);

        var form = document.querySelector('.footer-newsletter-form');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var confirm = document.createElement('span');
                confirm.className = 'footer-newsletter-confirm';
                confirm.innerHTML = '<span class="footer-newsletter-check">&#10003;</span> Thanks \u2014 we\'ll be in touch.';
                form.parentNode.replaceChild(confirm, form);
            });
        }
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

        // Grid items: stagger resets every 3 columns
        var gridSelectors = ['.article-card', '.read-more-card', '.popular-item'];
        // List items: sequential stagger capped at 300ms
        var listSelectors = ['.article-list-item', '.quick-rank-item'];
        // Single/fade-in items: no stagger
        var fadeInSelectors = ['.article-figure', '.toc-block', '.author-card'];
        // Other fade-up items: no stagger
        var singleSelectors = ['.about-panel-inner', '.site-hero-inner', '.fold-inner',
            '.verdict-block', '.cta-block', '.section-header', '.claim-block'];

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        function observe(els, type, staggerFn) {
            els.forEach(function(el, i) {
                el.classList.add('will-animate', type);
                var delay = staggerFn ? staggerFn(i) : 0;
                if (delay) el.style.transitionDelay = delay + 'ms';
                observer.observe(el);
            });
        }

        observe(
            Array.from(document.querySelectorAll(gridSelectors.join(','))),
            'fade-up',
            function(i) { return (i % 3) * 80; }
        );
        observe(
            Array.from(document.querySelectorAll(listSelectors.join(','))),
            'fade-up',
            function(i) { return Math.min(i * 60, 300); }
        );
        observe(
            Array.from(document.querySelectorAll(fadeInSelectors.join(','))),
            'fade-in',
            null
        );
        observe(
            Array.from(document.querySelectorAll(singleSelectors.join(','))),
            'fade-up',
            null
        );
    }

    // ─── Image skeleton loaders ──────────────────────────────────────────────
    function initImageLoaders() {
        // For card/banner wrappers: add img-wrap class directly (no figcaption inside)
        var directWrappers = document.querySelectorAll(
            '.card-image-wrap, .featured-banner-image'
        );
        directWrappers.forEach(function(wrap) {
            var img = wrap.querySelector('img');
            if (!img) return;
            wrap.classList.add('img-wrap');
            markLoaded(img);
        });

        // For article figures: wrap just the img, not the figcaption
        var figures = document.querySelectorAll('.article-figure');
        figures.forEach(function(figure) {
            var img = figure.querySelector('img');
            if (!img) return;
            var wrapper = document.createElement('div');
            wrapper.className = 'img-wrap';
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            markLoaded(img);
        });
    }

    function markLoaded(img) {
        var wrap = img.closest('.img-wrap');
        function done() { if (wrap) wrap.classList.add('is-loaded'); }
        if (img.complete && img.naturalWidth) {
            done();
        } else {
            img.addEventListener('load',  done, { once: true });
            img.addEventListener('error', done, { once: true });
        }
    }

    // ─── Bootstrap ───────────────────────────────────────────────────────────
    // Load stylesheet immediately (can run before DOM ready)
    loadStylesheet();

    function init() {
        insertNavigation();
        insertFooter();
        initMegaMenu();
        initScrollAnimations();
        initImageLoaders();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

