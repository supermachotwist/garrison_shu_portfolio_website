# GitHub Repos Showcase — supermachotwist

This is a simple static site that lists public GitHub repositories for the user `supermachotwist` and lets you view each repository's README rendered as HTML.

Files created:

- `index.html` — main page and UI
- `styles.css` — styling
- `app.js` — fetches repositories and README content from the GitHub API

How to run:

Option 1 — This webiste is hosted online https://garrison-shu-portfolio.web.app/

Option 2 — open locally (may be blocked by some browsers' CORS settings):

1. Open `index.html` in your browser.

Option 3 — serve with a simple static server (recommended):

Python 3:

```powershell
python -m http.server 8000

# then open http://localhost:8000 in your browser
```

Node (http-server):

```powershell
npm install -g http-server
http-server -p 8000
```
