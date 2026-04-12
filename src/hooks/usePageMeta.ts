import { useEffect } from "react";

/**
 * Lightweight per-page meta tag manager. No external dependency.
 * Updates <title>, description, and OpenGraph/Twitter tags on mount,
 * then restores the previous title on unmount.
 */
export interface PageMeta {
  title?: string;
  description?: string;
  image?: string;
  /** Optional canonical URL override */
  url?: string;
}

const SITE_NAME = "MAISON";
const TITLE_SUFFIX = " | MAISON";
const DEFAULT_DESCRIPTION =
  "MAISON — curated luxury menswear. Tailored suits, casual essentials, and premium accessories for the modern gentleman.";
const DEFAULT_IMAGE = "/maison-logo-dark.svg";

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta({ title, description, image, url }: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title;

    const fullTitle = title ? `${title}${TITLE_SUFFIX}` : `${SITE_NAME} — Modern Men's Clothing | Luxury Menswear`;
    const desc = description || DEFAULT_DESCRIPTION;
    const img = image || DEFAULT_IMAGE;
    const canonical = url || (typeof window !== "undefined" ? window.location.href : "");

    document.title = fullTitle;
    setMeta('meta[name="description"]', "name", "description", desc);

    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", desc);
    setMeta('meta[property="og:image"]', "property", "og:image", img);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    if (canonical) setMeta('meta[property="og:url"]', "property", "og:url", canonical);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", img);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, image, url]);
}
