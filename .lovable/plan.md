
# Plan v3: Static SPA Refactor for GitHub Pages

Convert TanStack Start (SSR + Cloudflare Worker) → pure client-side React + Vite SPA, deployable to GitHub Pages at `/nebula-shift-dev/`. **Zero visual changes.**

> Note: I can't create a git branch from inside Lovable. Recommended: duplicate this project in Lovable (or create the `github-pages-static` branch on GitHub after sync) before I apply this refactor.

---

## 1. Stack swap

**Remove:** `@tanstack/react-start`, `@tanstack/start-*`, nitro, `@lovable.dev/vite-tanstack-config`, `wrangler*`, Cloudflare adapter, `src/server.ts`, `src/start.ts`, `src/lib/error-capture.ts`, `src/lib/error-page.ts`, `src/lib/config.server.ts`, `src/lib/api/example.functions.ts`, `src/lib/github.functions.ts`, `src/routes/` dir, `src/routeTree.gen.ts`.

**Add:** `vite`, `@vitejs/plugin-react`, `react-router-dom`, `@emailjs/browser`, `react-helmet-async`, `@tailwindcss/vite` (keep).

**Keep:** React 19, Tailwind v4 + `src/styles.css`, framer-motion (`motion`), three / r3f / drei (if installed), `@tanstack/react-query`, lucide-react, all shadcn `ui/`, all `components/portfolio/*`, `src/data/portfolio.ts`, `src/hooks/use-viewer-role.ts`.

## 2. Configurable base path

`src/config/site.ts` — single source of truth for repo/base config:
```ts
const RAW_BASE = import.meta.env.VITE_BASE_PATH ?? "/nebula-shift-dev/";
export const siteConfig = {
  basePath: RAW_BASE.endsWith("/") ? RAW_BASE : `${RAW_BASE}/`,
  siteUrl:  import.meta.env.VITE_SITE_URL  ?? "https://abikarthick-412.github.io/nebula-shift-dev",
};
```
Same value consumed in `vite.config.ts` via `process.env.VITE_BASE_PATH` with fallback `/nebula-shift-dev/`, in `BrowserRouter basename`, in the sitemap generator, in `site.webmanifest` generator, and in the `asset()` helper. `.env.example` documents `VITE_BASE_PATH` + `VITE_SITE_URL`.

## 3. Entry points & routing (BrowserRouter)

```
index.html                    # Vite root + SPA-redirect decode script
src/main.tsx                  # ReactDOM + QueryClientProvider + HelmetProvider + BrowserRouter basename={siteConfig.basePath}
src/App.tsx                   # <Routes>
src/pages/Home.tsx            # ex-routes/index.tsx body
src/pages/ProjectDetail.tsx   # ex-routes/projects.$id.tsx body
src/pages/NotFound.tsx
```

**GH Pages SPA fallback (spa-github-pages technique):**
- `public/404.html` rewrites the path to `?/...` and redirects to base.
- Inline decode script in `index.html <head>` restores the path via `history.replaceState` before React boots.
- `public/.nojekyll` disables Jekyll.

## 4. Vite config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const base = process.env.VITE_BASE_PATH ?? "/nebula-shift-dev/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: { outDir: "dist", sourcemap: false, target: "es2020" },
});
```

`tsconfig.json` slimmed for client-only.

## 5. EmailJS — env-driven

```ts
// src/config/email.ts
export const emailConfig = {
  serviceId:  import.meta.env.VITE_EMAIL_SERVICE_ID  ?? "",
  templateId: import.meta.env.VITE_EMAIL_TEMPLATE_ID ?? "",
  publicKey:  import.meta.env.VITE_EMAIL_PUBLIC_KEY  ?? "",
};
export const isEmailConfigured = () =>
  !!(emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey);
```

`src/components/portfolio/contact-form.tsx`:
- Fields: name, email, subject, message. Zod validation (required, email format; name ≤80, subject ≤120, message ≤2000).
- Submit disabled while sending; spinner; sonner toast for success/error; reset on success.
- If `!isEmailConfigured()`: DEV-only `console.warn` + inline muted notice; PROD silently falls back to `mailto:`.

## 6. GitHub API — client side w/ TanStack Query (kept)

`src/lib/github.ts` → public `fetch('https://api.github.com/users/${u}')`. Consumed via `useQuery({ queryKey: ['gh', username], staleTime: 10*60_000, gcTime: 60*60_000 })`. Username from `portfolio.github.username`. `QueryClientProvider` in `src/main.tsx`.

## 7. Asset helper (base-aware)

```ts
// src/lib/asset.ts
import { siteConfig } from "@/config/site";
export const asset = (p: string) => `${siteConfig.basePath}${p.replace(/^\//, "")}`;
```
Components wrap `/avatar.jpg`, `/resume-*.pdf`, project images, videos with `asset()`. `portfolio.ts` keeps raw paths (data layer unchanged).

## 8. Static files in `public/`

```
public/
  .nojekyll
  404.html              # SPA redirect shim (base-path placeholder swapped at build)
  robots.txt            # Allow: /; Sitemap: <siteUrl>/sitemap.xml
  sitemap.xml           # generated at build from siteConfig + portfolio project IDs
  favicon.ico
  site.webmanifest      # name, short_name, theme/background tokens, start_url = basePath
  avatar.jpg
  resume-unity.pdf  resume-unreal.pdf  resume-gameplay.pdf  resume-software.pdf
  projects/   videos/
```

`scripts/generate-static.mjs` (run via `prebuild`):
- Reads `VITE_BASE_PATH` + `VITE_SITE_URL` from env (same defaults as `site.ts`).
- Writes `public/sitemap.xml` (`/`, `/projects/<id>` for each project in `src/data/portfolio.ts`).
- Writes `public/404.html` with the correct `pathSegmentsToKeep`/base.
- Writes `public/site.webmanifest` with `start_url`/`scope` = basePath.
- `public/robots.txt` is static but includes `Sitemap: <siteUrl>/sitemap.xml`.

## 9. SEO / head

`react-helmet-async` in `Home` and `ProjectDetail` for title, meta description, OG, JSON-LD `Person` (ported from current `__root.tsx` + `routes/index.tsx`). Per-project page sets its own title from `portfolio.ts`.

## 10. GitHub Actions deployment (only mechanism)

`.github/workflows/deploy.yml` — on push to `main`:
- `actions/checkout@v4`, `actions/setup-node@v4` (Node 20, npm cache), `npm ci`, `npm run build`.
- Build env vars from repo Secrets/Variables: `VITE_EMAIL_SERVICE_ID`, `VITE_EMAIL_TEMPLATE_ID`, `VITE_EMAIL_PUBLIC_KEY`, `VITE_BASE_PATH`, `VITE_SITE_URL`.
- `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` (path: `./dist`), `actions/deploy-pages@v4`.
- Permissions: `pages: write`, `id-token: write`. Concurrency group `pages`.
- Repo Settings → Pages → Source: **GitHub Actions**.

**No `gh-pages` npm dep, no `deploy` script.** `package.json` scripts:
```json
"scripts": {
  "dev": "vite",
  "build": "node scripts/generate-static.mjs && tsc -b && vite build",
  "preview": "vite preview"
}
```

## 11. Performance

- `React.lazy` + `<Suspense>` for `ProjectDetail`, `Showcase` (itch iframes already lazy), Three.js hero.
- Existing `prefers-reduced-motion` gating preserved.
- `loading="lazy"` on images preserved.

## 12. README.md

Sections:
1. **Project Architecture** — folder tree (`src/pages`, `src/components/portfolio`, `src/data`, `src/lib`, `src/config`, `scripts/`, `public/`, `.github/workflows/`) + what each owns + customization points table.
2. **Local Development** — `npm i`, `npm run dev`.
3. **Production Build** — `npm run build`, output `dist/`.
4. **GitHub Pages Deployment** — Actions workflow is the only mechanism. Steps: push to `main` → Settings → Pages → Source = GitHub Actions → set repo Secrets (`VITE_EMAIL_*`) and optional Variables (`VITE_BASE_PATH`, `VITE_SITE_URL` if forking under a different repo name) → workflow builds + deploys automatically.
5. **EmailJS Setup** — account → service → template (vars `{{name}} {{email}} {{subject}} {{message}}`) → public key → add repo Secrets + local `.env.local`.
6. **Portfolio Customization** — table mapping every editable thing to its location in `src/data/portfolio.ts`, `src/config/site.ts`, or `public/`.
7. **Changing the Base Path / Forking** — override `VITE_BASE_PATH` and `VITE_SITE_URL` (env or repo Variables); no source edits needed.
8. **Troubleshooting** — blank page → `VITE_BASE_PATH` mismatch with repo name; 404 on refresh → confirm `404.html` + `.nojekyll` shipped.

---

## Out of scope
- No visual redesign. All Tailwind, `styles.css`, glass, scanlines, neon, hero 3D unchanged.
- No edits to `src/data/portfolio.ts` content.
- No new features beyond the contact form swap.
