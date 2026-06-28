import { siteConfig } from "@/config/site";

/**
 * Resolves a public/ asset path under the configured GitHub Pages base.
 * Accepts both "/avatar.jpg" and "avatar.jpg".
 */
export function asset(path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `${siteConfig.basePath}${clean}`;
}
