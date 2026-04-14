/**
 * Reverts product.color from reference back to string.
 * Run: node scripts/revert-colors-to-strings.mjs
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

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Fetch products whose color is a reference, resolve the name
const rows = await client.fetch(`
  *[_type=="product" && defined(color._ref)]{
    _id,
    "name": color->name
  }
`);
console.log(`Found ${rows.length} products with reference color.`);

for (const r of rows) {
  if (!r.name) {
    console.log(`  ! ${r._id} — no name on referenced color, skipping`);
    continue;
  }
  await client.patch(r._id).set({ color: r.name }).commit();
  console.log(`  ✓ ${r._id} → "${r.name}"`);
}

// Delete orphaned color docs
const colors = await client.fetch(`*[_type=="color"]{ _id, name }`);
console.log(`\nDeleting ${colors.length} color doc(s)...`);
for (const c of colors) {
  await client.delete(c._id);
  console.log(`  ✓ deleted ${c.name}`);
}
console.log("Done.");
