# Abikarthick G — Game Developer Portfolio

A static, single-page React portfolio for Unity / Unreal / Gameplay programmer
recruitment. Built with **React 19 + Vite + TypeScript + Tailwind v4 + Framer
Motion**, deployed to **GitHub Pages** via GitHub Actions. No server runtime.

Live: <https://abikarthick-412.github.io/nebula-shift-dev/>

---

## Project Architecture

```
.
├── .github/workflows/deploy.yml   # CI → builds + publishes to GitHub Pages
├── public/                        # Copied verbatim into dist/
│   ├── .nojekyll                  # Disables GH Pages Jekyll processing
│   ├── 404.html                   # SPA redirect shim (generated)
│   ├── robots.txt                 # (generated from VITE_SITE_URL)
│   ├── sitemap.xml                # (generated from portfolio.ts)
│   ├── site.webmanifest           # PWA manifest (generated)
│   ├── favicon.svg
│   ├── avatar.jpg                 # ← drop your photo here
│   ├── resume-unity.pdf           # ← drop each resume variant here
│   ├── resume-unreal.pdf
│   ├── resume-gameplay.pdf
│   └── resume-software.pdf
├── scripts/
│   └── generate-static.mjs        # Writes 404.html / sitemap / manifest / robots
├── src/
│   ├── main.tsx                   # ReactDOM root + providers + BrowserRouter
│   ├── App.tsx                    # <Routes>
│   ├── pages/
│   │   ├── Home.tsx               # Landing (/)
│   │   ├── ProjectDetail.tsx      # /projects/:id
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── portfolio/             # Hero, RoleSwitcher, Projects, Showcase…
│   │   └── ui/                    # shadcn primitives
│   ├── config/
│   │   ├── site.ts                # basePath + siteUrl (env-driven)
│   │   └── email.ts               # EmailJS env wrapper
│   ├── data/
│   │   └── portfolio.ts           # ★ Single source of truth for all content
│   ├── hooks/
│   │   └── use-viewer-role.ts     # Role-switcher persistence
│   ├── lib/
│   │   ├── asset.ts               # base-path-aware /public asset URLs
│   │   └── github.ts              # Public GitHub REST fetcher
│   └── styles.css                 # Tailwind v4 theme + design tokens
├── index.html                     # Vite root + SPA-redirect decode script
├── vite.config.ts                 # base = VITE_BASE_PATH
└── package.json
```

### Customization points (where to edit what)

| Want to change…              | File                                                      |
| ---------------------------- | --------------------------------------------------------- |
| Name, tagline, location      | `src/data/portfolio.ts` → `profile`                       |
| Bio, education               | `src/data/portfolio.ts` → `about`                         |
| Role-switcher viewers        | `src/data/portfolio.ts` → `viewerRoles`                   |
| Projects, metrics, impact    | `src/data/portfolio.ts` → `projects`                      |
| Skills (chip-only, no bars)  | `src/data/portfolio.ts` → `skillGroups`                   |
| Hero highlights / quick view | `src/data/portfolio.ts` → `highlights`, `quickView`       |
| GitHub username (live stats) | `src/data/portfolio.ts` → `github.username`               |
| Resume PDFs                  | `public/resume-*.pdf` (filenames must match `resumes` keys) |
| Avatar / project images      | `public/avatar.jpg`, `public/projects/…`                  |
| Base path / public URL       | `VITE_BASE_PATH`, `VITE_SITE_URL` env vars                |
| Design tokens, colors        | `src/styles.css`                                          |

---

## Local Development

```bash
npm install
cp .env.example .env.local        # fill in your EmailJS keys
npm run dev                       # → http://localhost:8080
```

Vite serves from `/` in dev regardless of `base`, so `npm run dev` always
works locally even when `VITE_BASE_PATH` is set to a subpath.

## Production Build

```bash
npm run build                     # → dist/
npm run preview                   # local preview of the built dist/
```

The build runs `scripts/generate-static.mjs` (writes `404.html`, `sitemap.xml`,
`site.webmanifest`, `robots.txt` from the current base path) then `vite build`.

The generated `dist/` folder is fully static. You can host it anywhere — but
GitHub Actions handles deployment for you (see below).

---

## GitHub Pages Deployment

Deployment is **fully automatic** via `.github/workflows/deploy.yml`.

### One-time setup

1. Push the repo to `github.com/<you>/<repo>`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. (Optional but recommended) Add these to **Settings → Secrets and variables → Actions**:
   - **Secrets**: `VITE_EMAIL_SERVICE_ID`, `VITE_EMAIL_TEMPLATE_ID`, `VITE_EMAIL_PUBLIC_KEY`.
   - **Variables** (only if you forked under a different repo name or custom domain):
     - `VITE_BASE_PATH` — e.g. `/my-fork-name/`
     - `VITE_SITE_URL` — e.g. `https://<you>.github.io/my-fork-name`

### Every push to `main`

1. Workflow checks out the repo, runs `npm ci`, `npm run build`.
2. The built `dist/` is uploaded as a Pages artifact and deployed.
3. Your site is live ~1–2 minutes later at the URL printed in the workflow summary.

### Manual trigger

Go to **Actions → Deploy to GitHub Pages → Run workflow**.

### Why no `gh-pages` package?

Actions is the only deployment mechanism — no `npm run deploy`, no
`gh-pages` branch to manage. Simpler, atomic, auditable.

---

## EmailJS Setup

The contact form sends through [EmailJS](https://www.emailjs.com) — a
client-side service, no backend required.

1. **Create a free EmailJS account** at <https://dashboard.emailjs.com>.
2. **Add an Email Service** (Gmail, Outlook, etc.) under **Email Services**.
   Copy the **Service ID** (e.g. `service_abc123`).
3. **Create an Email Template** under **Email Templates**. Use these template
   variables in the body so they get populated from the form:

   ```
   From: {{name}} <{{email}}>
   Subject: {{subject}}

   {{message}}
   ```

   Copy the **Template ID** (e.g. `template_xyz789`).
4. **Copy your Public Key** from **Account → General → Public Key**.
5. **Set the three values:**
   - Local dev: in `.env.local`
     ```env
     VITE_EMAIL_SERVICE_ID=service_abc123
     VITE_EMAIL_TEMPLATE_ID=template_xyz789
     VITE_EMAIL_PUBLIC_KEY=YOUR_PUBLIC_KEY
     ```
   - Production: add the same names as **repo Secrets** (see deployment section above).
6. Push to `main`. The contact form now sends real emails.

If any of the three env vars are missing, the form falls back to opening the
user's mail client (`mailto:`) — so the site keeps working either way. In dev,
you'll see a console warning + inline notice on the form.

---

## Troubleshooting

| Symptom                                         | Fix                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| Blank white page on GitHub Pages                | `VITE_BASE_PATH` doesn't match your repo name. Update in workflow / vars.  |
| 404 when refreshing `/projects/...`             | Ensure `public/.nojekyll` and `public/404.html` shipped in `dist/`.        |
| Resume / avatar 404s                            | Files must live in `public/`. Components use the `asset()` helper to prefix. |
| Contact form shows "EmailJS not configured"     | Set the `VITE_EMAIL_*` env vars (see EmailJS Setup).                       |
| Workflow fails on `actions/deploy-pages`        | Confirm Settings → Pages → Source is set to **GitHub Actions**.            |

---

## License

MIT
