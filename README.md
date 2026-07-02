# FixMySpeaker

Free browser-based tool site that "fixes" phone speakers by playing calibrated
sound frequencies (water eject, dust removal, mic clearing, volume recovery).
Pure HTML/CSS/JS — zero build step, ready for GitHub Pages.

## Structure

```
index.html              → homepage
css/style.css            → shared design system
js/tool-engine.js        → shared Web Audio API engine (used by every tool page)
pages/*.html             → 14 tool pages + about/contact/privacy
blog/*.html              → blog post(s)
sitemap.xml, robots.txt  → SEO
```

## Deploy to GitHub Pages

1. Create a new repo, e.g. `fixmyspeaker` (or `<username>.github.io` for a root domain).
2. Push everything in this folder to the repo root:
   ```
   git init
   git add .
   git commit -m "Initial FixMySpeaker site"
   git branch -M main
   git remote add origin https://github.com/<username>/fixmyspeaker.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Source → Deploy from branch → main / (root)**.
4. Site goes live at `https://<username>.github.io/fixmyspeaker/`
   (or `https://<username>.github.io/` if you used the special repo name).

## Before going live

- Replace `fixmyspeaker.github.io` in every `<link rel="canonical">`, schema
  `url`, and `sitemap.xml` with your actual GitHub Pages URL.
- Update the email on `pages/contact.html`.
- Submit `sitemap.xml` in Google Search Console after launch.

## Notes

- No dependencies, no npm, no build — every file can be edited directly.
- All 14 tool pages share `js/tool-engine.js`; each page only sets
  `window.TOOL_MODES` and `window.TOOL_DEFAULT` inline before loading it.
- Everything runs client-side via the Web Audio API — no data collected.
