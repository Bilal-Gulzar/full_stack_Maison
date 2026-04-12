/**
 * One-off: seeds marqueeItems on the homepage document.
 * Run: node scripts/seed-marquee.mjs
 * Safe to re-run — only sets if marqueeItems is missing.
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
    const v = line.slice(eq + 1).trim().replace(/^"(.*)"$/, "$1");
    if (!process.env[k]) process.env[k] = v;
  }
}

await loadEnv();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const items = [
  "Free Shipping on Orders Over Rs 5,000",
  "New Collection Available",
  "Complimentary Alterations",
  "Members Get 10% Off",
];

await client
  .patch("homepage")
  .setIfMissing({ marqueeItems: items })
  .commit();

console.log("✓ marqueeItems seeded:", items);
