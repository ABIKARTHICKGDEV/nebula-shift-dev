// Centralized site configuration.
// `basePath` is driven by Vite's `base` (set via VITE_BASE_PATH at build time
// in vite.config.ts) and is always exposed as import.meta.env.BASE_URL with a
// trailing slash. `siteUrl` is the public origin where the site is served.
// Override either via env vars; no source edits required when forking.

const rawBase = import.meta.env.BASE_URL || "/";
const basePath = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

export const siteConfig = {
  /** Always ends with a slash, e.g. "/nebula-shift-dev/" or "/". */
  basePath,
  /** Public origin + base, no trailing slash. Used for OG/canonical/sitemap. */
  siteUrl: (
    import.meta.env.VITE_SITE_URL ??
    "https://abikarthick-412.github.io/nebula-shift-dev"
  ).replace(/\/$/, ""),
  name: "Abikarthick G — Game Developer Portfolio",
  shortName: "Abikarthick G",
  description:
    "Portfolio of Abikarthick G — Unity game developer, gameplay programmer, and game designer.",
  themeColor: "#0b0b13",
  backgroundColor: "#0b0b13",
};
