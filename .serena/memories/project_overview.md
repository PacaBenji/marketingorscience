# marketingorscience.com — Project Overview

## Purpose
Static HTML/CSS/JS publication (clinical evidence reviews for health & beauty claims) deployed on GitHub Pages / Netlify. Zero build-step dependencies.

## Tech Stack
- Pure HTML5, CSS3, vanilla JS (ES5-compatible)
- No frameworks, no bundlers
- Fonts from Google Fonts (Playfair Display, Lora, Inter)
- Hosted on Netlify (netlify.toml present)

## File Structure
```
/
├── index.html               ← homepage
├── about.html               ← about page
├── privacy-policy.html      ← privacy page
├── articles/
│   ├── index.html           ← article listing
│   └── skincare/2026/04/retinol-paradox.html  ← article page
├── assets/
│   ├── css/style.css        ← single global stylesheet (20 sections)
│   └── js/
│       ├── head-components.js   ← FOUC prevention (injected in <head>)
│       ├── component-init.js    ← async readiness helper
│       ├── main.js              ← nav + footer injection IIFE
│       └── components/
│           └── article/
│               ├── fold.js          ← article hero component
│               └── article-footer.js ← article footer component
```

## Code Style
- Vanilla JS, ES5 patterns (var, function declarations, IIFEs)
- No TypeScript, no transpilation
- Components exposed as `window.createXxx` globals
- CSS: single file with numbered sections, BEM-like class names
- Path strategy: root-relative paths (/assets/...) via `assetPath = '/assets'`
- Nav/footer injected by main.js using insertAdjacentHTML

## Key Patterns
- `initComponentsWhenReady(callback)` polls until `window.createFold` and `window.createArticleFooter` are defined
- Components fire CustomEvents when loaded (e.g. `articleComponentsLoaded`)
- CSS custom properties in :root for design tokens
- Nav height: 60px, max-width: 1200px, content-width: 740px

## No build commands — static files served directly
