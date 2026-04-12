/**
 * One-off backfill: populates `customerEmail` on every existing order
 * by reading the referenced user's email. Enables searching orders by email
 * in Sanity Studio.
 *
 * Run: node scripts/backfill-customer-emails.mjs
 * Safe to re-run — skips orders that already have customerEmail set.
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
  `*[_type == "order" && !defined(customerEmail)]{_id, "email": user->email}`
);

console.log(`Found ${orders.length} orders without customerEmail.`);

if (orders.length === 0) {
  console.log("Nothing to backfill. ✓");
  process.exit(0);
}

const tx = client.transaction();
for (const { _id, email } of orders) {
  if (!email) {
    console.log(`  ${_id}  →  ⚠ no user email found, skipping`);
    continue;
  }
  tx.patch(_id, (p) => p.set({ customerEmail: email }));
  console.log(`  ${_id}  →  ${email}`);
}

await tx.commit();
console.log(`\n✓ Backfilled customerEmail on orders.`);
