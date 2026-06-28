import { useEffect } from "react";

export interface DocMeta {
  title?: string;
  description?: string;
  canonical?: string;
  og?: Record<string, string>;
  twitter?: Record<string, string>;
  jsonLd?: Record<string, unknown>;
  robots?: string;
}

/**
 * Tiny client-side replacement for react-helmet. Sets <title>, <meta>,
 * <link rel="canonical">, and an inline JSON-LD <script>. Cleans up on
 * unmount so per-route metadata doesn't leak between pages.
 */
export function useDocumentMeta(meta: DocMeta) {
  useEffect(() => {
    const created: HTMLElement[] = [];

    const setMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        document.head.appendChild(el);
        created.push(el);
      } else {
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      }
    };

    const prevTitle = document.title;
    if (meta.title) document.title = meta.title;

    if (meta.description) {
      setMeta('meta[name="description"]', { name: "description", content: meta.description });
    }
    if (meta.robots) {
      setMeta('meta[name="robots"]', { name: "robots", content: meta.robots });
    }

    if (meta.og) {
      for (const [k, v] of Object.entries(meta.og)) {
        setMeta(`meta[property="og:${k}"]`, { property: `og:${k}`, content: v });
      }
    }
    if (meta.twitter) {
      for (const [k, v] of Object.entries(meta.twitter)) {
        setMeta(`meta[name="twitter:${k}"]`, { name: `twitter:${k}`, content: v });
      }
    }

    let canonical: HTMLLinkElement | null = null;
    if (meta.canonical) {
      canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
        created.push(canonical);
      }
      canonical.href = meta.canonical;
    }

    let ld: HTMLScriptElement | null = null;
    if (meta.jsonLd) {
      ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.text = JSON.stringify(meta.jsonLd);
      ld.dataset.dynamic = "1";
      document.head.appendChild(ld);
      created.push(ld);
    }

    return () => {
      document.title = prevTitle;
      for (const el of created) el.remove();
    };
  }, [meta]);
}
