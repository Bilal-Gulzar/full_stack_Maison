/**
 * One-off backfill: populates `orderNumber` on every existing order that
 * doesn't yet have one. The public order number = last 8 chars of _id, uppercased.
 *
 * Run: node scripts/backfill-order-numbers.mjs
 * Safe to re-run — skips orders that already have orderNumber set.
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

const orders = await client.fetch(
  `*[_type == "order" && !defined(orderNumber)]{_id}`
);

console.log(`Found ${orders.length} orders without orderNumber.`);

if (orders.length === 0) {
  console.log("Nothing to backfill. ✓");
  process.exit(0);
}

const tx = client.transaction();
for (const { _id } of orders) {
  const publicId = _id.replace(/^drafts\./, "").slice(-8).toUpperCase();
  tx.patch(_id, (p) => p.set({ orderNumber: publicId }));
  console.log(`  ${_id}  →  #${publicId}`);
}

await tx.commit();
console.log(`\n✓ Backfilled ${orders.length} orders.`);
