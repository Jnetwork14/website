# JNetwork site

Static multi-page site for GitHub Pages. No build step.

## Who owns what
- **Code (Claude):** `assets/js/*`, `.github/workflows/pages.yml`, `data/posts.json` schema, form + tracking wiring.
- **Design (Jessey):** `assets/css/tokens.css` first, then `base.css` and the markup inside each page's `<main>`.

## Do not break these hooks when restyling
`#site-header`, `#audience-switch`, `#site-footer`, `#posts`, `[data-status]`, `data-page` on `<body>`,
`data-track` attributes (click tracking), `form[data-contact]`, `form[data-subscribe]`, and the hidden `.hp` honeypot field.

## Go live
1. Create a GitHub repo, push this folder to `main`.
2. Repo Settings → Pages → Source: **GitHub Actions**. The workflow deploys on every push.
3. Edit `assets/js/config.js`: add the Web3Forms access key, GoatCounter code, subscribe endpoint.
4. Add `assets/cv/CV.pdf` (the employer page links to it).
5. When a domain exists: add it in Settings → Pages, then update `robots.txt`.

## Adding a post
Append an object to `data/posts.json` (`slug`, `title`, `date` YYYY-MM-DD, `tag`, `summary`, `url`).

## Adding a project (screenshot card)
1. Save a screenshot as `assets/img/projects/<slug>.png` (1280x800, cropped from the top, under 200 KB; WebP also works).
2. Edit the entry in `data/projects.json`: `title`, `summary` (1-2 sentences), `tags`, `image`, `imageAlt`, optional `url` + `linkLabel`.
3. `pages` decides which door shows it (`business`, `employer`, `content`). Set `"published": true` to make it live.
   Entries with `"published": false` stay hidden. A missing image shows an initials placeholder.
4. Only publish work you are allowed to show publicly. Anonymise or leave out client and employer data.

## Limits of GitHub Pages
Static only. Anything needing a server (accounts, payments, a database) needs an external service or a separate host.
