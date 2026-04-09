// search.js — marketingorscience.com
// Typeahead search over window.MOS_ARTICLES
// Exposed as window.MOS_Search

(function () {
    'use strict';

    var initialized = false;
    var input, resultsList;
    var MAX_RESULTS = 6;
    var MIN_QUERY   = 2;

    function search(q) {
        var query = q.trim().toLowerCase();
        if (!query || query.length < MIN_QUERY || !window.MOS_ARTICLES) {
            clearResults();
            return;
        }

        var terms = query.split(/\s+/);
        var results = window.MOS_ARTICLES.filter(function (article) {
            var haystack = [
                article.title       || '',
                article.deck        || '',
                article.searchText  || '',
                article.category    || '',
                article.type        || ''
            ].join(' ').toLowerCase();

            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        }).slice(0, MAX_RESULTS);

        renderResults(results, q.trim());
    }

    function renderResults(results, originalQuery) {
        if (!resultsList) return;
        resultsList.innerHTML = '';

        if (results.length === 0) {
            var empty = document.createElement('li');
            empty.className = 'search-no-results';
            empty.textContent = 'No articles found for "' + originalQuery + '"';
            resultsList.appendChild(empty);
            return;
        }

        results.forEach(function (article) {
            var li = document.createElement('li');
            li.className = 'search-result-item';

            var a = document.createElement('a');
            a.href = article.url;
            a.tabIndex = 0;

            var titleEl = document.createElement('span');
            titleEl.className = 'search-result-title';
            titleEl.textContent = article.title;

            var metaEl = document.createElement('span');
            metaEl.className = 'search-result-meta';
            metaEl.textContent = article.category + ' \u00b7 ' + article.type;

            a.appendChild(titleEl);
            a.appendChild(metaEl);
            li.appendChild(a);
            resultsList.appendChild(li);
        });
    }

    function clearResults() {
        if (resultsList) resultsList.innerHTML = '';
    }

    function onKeydown(e) {
        var items = resultsList
            ? Array.prototype.slice.call(resultsList.querySelectorAll('a'))
            : [];

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            var focused = document.activeElement;
            var idx = items.indexOf(focused);
            if (idx === -1 && items.length > 0) {
                items[0].focus();
            } else if (idx < items.length - 1) {
                items[idx + 1].focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            var focused = document.activeElement;
            var idx = items.indexOf(focused);
            if (idx > 0) {
                items[idx - 1].focus();
            } else if (idx === 0) {
                input.focus();
            }
        } else if (e.key === 'Enter') {
            var focused = document.activeElement;
            if (items.indexOf(focused) !== -1) {
                window.location.href = focused.getAttribute('href');
            } else if (input && document.activeElement === input && items.length > 0) {
                window.location.href = items[0].getAttribute('href');
            }
        }
    }

    function init() {
        if (initialized) return;

        input = document.querySelector('#site-search');
        resultsList = document.querySelector('.search-results');

        if (!input || !resultsList) return;

        input.addEventListener('input', function () {
            search(input.value);
        });

        input.addEventListener('keydown', onKeydown);

        if (resultsList) {
            resultsList.addEventListener('keydown', onKeydown);
        }

        initialized = true;
    }

    window.MOS_Search = {
        init         : init,
        search       : search,
        clearResults : clearResults
    };
})();
