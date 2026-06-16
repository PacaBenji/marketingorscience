// structured-data.js — marketingorscience.com
// Injects JSON-LD structured data derived from window.MOS_ARTICLES.
// Loaded by main.js after articles.js resolves.

(function () {
    'use strict';

    var BASE = 'https://marketingorscience.com';

    function getOG(prop) {
        var el = document.querySelector('meta[property="og:' + prop + '"]');
        return el ? el.getAttribute('content') : '';
    }
    function getCanonical() {
        var el = document.querySelector('link[rel="canonical"]');
        return el ? el.getAttribute('href') : BASE + window.location.pathname;
    }
    function injectSchema(obj) {
        if (document.querySelector('script[type="application/ld+json"]')) return;
        var s = document.createElement('script');
        s.type = 'application/ld+json';
        s.text = JSON.stringify(obj);
        document.head.appendChild(s);
    }
    function absoluteImage() {
        var img = getOG('image');
        if (!img) return null;
        // Strip query string cache-busters before storing in schema
        img = img.split('?')[0];
        return img.startsWith('http') ? img : BASE + img;
    }

    var pathname = window.location.pathname;

    // ── Homepage ────────────────────────────────────────────────────────────
    if (pathname === '/') {
        injectSchema({
            '@context' : 'https://schema.org',
            '@type'    : 'WebSite',
            'name'     : 'Marketing or Science',
            'url'      : BASE
        });
        return;
    }

    // ── Expert / author pages ────────────────────────────────────────────────
    if (pathname.startsWith('/experts/') && pathname.replace(/\/$/, '').split('/').length >= 3) {
        var h1 = document.querySelector('h1');
        if (h1) {
            injectSchema({
                '@context'  : 'https://schema.org',
                '@type'     : 'Person',
                'name'      : h1.textContent.trim(),
                'url'       : getCanonical(),
                'worksFor'  : {
                    '@type' : 'Organization',
                    'name'  : 'Marketing or Science',
                    'url'   : BASE
                }
            });
        }
        return;
    }

    // ── Article pages ────────────────────────────────────────────────────────
    if (!pathname.startsWith('/articles/')) return;

    // articles/index.html — listing page, no article schema needed
    if (pathname === '/articles/' || pathname === '/articles') return;

    var slug = pathname.replace(/\/$/, '').split('/').pop();

    if (!window.MOS_ARTICLES) return; // articles.js onload guarantees this — safety guard only

    var article = null;
    for (var i = 0; i < window.MOS_ARTICLES.length; i++) {
        if (window.MOS_ARTICLES[i].slug === slug) {
            article = window.MOS_ARTICLES[i];
            break;
        }
    }
    if (!article) return;

    var isEditorial = article.authorSlug === 'editorial';
    var author = isEditorial
        ? { '@type': 'Organization', 'name': 'Marketing or Science Editorial Team', 'url': BASE + '/experts/editorial/' }
        : { '@type': 'Person', 'name': article.author, 'url': BASE + '/experts/' + article.authorSlug + '/' };

    var schema = {
        '@context'      : 'https://schema.org',
        '@type'         : 'Article',
        'headline'      : article.title,
        'description'   : article.deck,
        'url'           : BASE + article.url,
        'datePublished' : article.date,
        'author'        : author,
        'publisher'     : {
            '@type' : 'Organization',
            'name'  : 'Marketing or Science',
            'url'   : BASE,
            'logo'  : { '@type': 'ImageObject', 'url': BASE + '/assets/images/logo/MoS-logo-b.svg' }
        }
    };

    var img = absoluteImage();
    if (img) schema['image'] = { '@type': 'ImageObject', 'url': img };
    if (article.tags && article.tags.length) schema['keywords'] = article.tags.join(', ');

    injectSchema(schema);
})();
