/**
 * Generates public/sitemap.xml from Sanity products + articles + static routes.
 *
 * Usage:
 *   SITEMAP_BASE_URL=https://yourdomain.com node scripts/generate-sitemap.mjs
 * If SITEMAP_BASE_URL is not set, falls back to APP_URL from .env.local.
 */

import { createClient } from "@sanity/client";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

async function loadEnv() {
  const text = await fs.readFile(path.join(ROOT, ".env.local"), "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
await loadEnv();

const BASE = (process.env.SITEMAP_BASE_URL || process.env.APP_URL || "https://maison.pk").replace(/\/+$/, "");

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
});

console.log(`→ Base URL: ${BASE}`);

const STATIC_ROUTES = [
  { loc: "/",                   changefreq: "daily",   priority: "1.0" },
  { loc: "/shop",               changefreq: "daily",   priority: "0.9" },
  { loc: "/articles",           changefreq: "weekly",  priority: "0.7" },
  { loc: "/about",              changefreq: "monthly", priority: "0.6" },
  { loc: "/contact",            changefreq: "monthly", priority: "0.6" },
  { loc: "/shipping-returns",   changefreq: "monthly", priority: "0.5" },
  { loc: "/faq",                changefreq: "monthly", priority: "0.5" },
  { loc: "/sustainability",     changefreq: "monthly", priority: "0.5" },
  { loc: "/careers",            changefreq: "monthly", priority: "0.5" },
];

const products = await client.fetch(`*[_type=="product" && defined(slug.current)]{"slug": slug.current, _updatedAt}`);
const articles = await client.fetch(`*[_type=="article" && defined(slug.current)]{"slug": slug.current, _updatedAt}`);

console.log(`  · ${products.length} products`);
console.log(`  · ${articles.length} articles`);

const iso = (d) => (d ? new Date(d).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_ROUTES.map((r) => `  <url>
    <loc>${BASE}${r.loc}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("\n")}
${products.map((p) => `  <url>
    <loc>${BASE}/product/${p.slug}</loc>
    <lastmod>${iso(p._updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
${articles.map((a) => `  <url>
    <loc>${BASE}/article/${a.slug}</loc>
    <lastmod>${iso(a._updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n")}
</urlset>
`;

await fs.writeFile(path.join(ROOT, "public", "sitemap.xml"), xml);
console.log(`\n✓ Wrote public/sitemap.xml (${STATIC_ROUTES.length + products.length + articles.length} URLs)`);
