// articles.js — marketingorscience.com
// Central article manifest. Powers search, read-more, category filter, and author pages.
// Exposed as window.MOS_ARTICLES.

window.MOS_ARTICLES = [
  {
    slug         : 'retinol-paradox',
    url          : '/articles/skincare/2026/04/retinol-paradox',
    title        : 'The Retinol Paradox: Does Concentration Actually Predict Efficacy?',
    deck         : 'The serum aisle promises \u201cclinical-strength\u201d at every price point. The randomized trial literature is more equivocal.',
    category     : 'Skincare & Beauty',
    categorySlug : 'skincare',
    type         : 'Ingredient Analysis',
    tags         : ['retinol', 'vitamin-a', 'anti-aging'],
    author       : 'Editorial',
    authorSlug   : 'editorial',
    date         : '2026-04-09',
    verdict      : 'Partially Supported',
    verdictClass : 'partial',
    searchText   : 'retinol paradox concentration efficacy skincare ingredient analysis vitamin a anti-aging serum clinical strength',
    popular      : true,
    popularRank  : 1,
    readingTime  : 12,
  }
];

window.dispatchEvent(new CustomEvent('articlesLoaded'));
