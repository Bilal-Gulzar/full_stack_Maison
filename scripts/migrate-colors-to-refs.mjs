/**
 * One-off migration: converts existing product `color` string values into
 * `color` document references.
 *
 * Steps:
 *  1. Read all products with a string-valued color
 *  2. Create a color doc for each unique value (Title Cased) if missing
 *  3. Patch each product's color field to a reference
 *
 * Run: node scripts/migrate-colors-to-refs.mjs
 * Idempotent: re-running is safe.
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

const toTitleCase = (s) =>
  s.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function run() {
  // 1. Find products where color is still a string (not a reference)
  const products = await client.fetch(
    `*[_type=="product" && defined(color) && !defined(color._ref)]{ _id, color }`
  );
  console.log(`Found ${products.length} products with string color values.`);

  if (products.length === 0) {
    console.log("Nothing to migrate. Exiting.");
    return;
  }

  // 2. Unique normalized color names
  const uniqueNames = [
    ...new Set(products.map((p) => toTitleCase(p.color))),
  ].filter(Boolean);
  console.log(`Unique colors: ${uniqueNames.join(", ")}`);

  // 3. Create color docs (idempotent via deterministic _id)
  const nameToId = new Map();
  for (const name of uniqueNames) {
    const id = `color-${slugify(name)}`;
    await client.createIfNotExists({
      _id: id,
      _type: "color",
      name,
    });
    nameToId.set(name, id);
    console.log(`  ✓ ${name} → ${id}`);
  }

  // 4. Patch each product
  let patched = 0;
  for (const p of products) {
    const refId = nameToId.get(toTitleCase(p.color));
    if (!refId) continue;
    await client
      .patch(p._id)
      .set({ color: { _type: "reference", _ref: refId } })
      .commit();
    patched++;
  }
  console.log(`Patched ${patched} product(s).`);
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
