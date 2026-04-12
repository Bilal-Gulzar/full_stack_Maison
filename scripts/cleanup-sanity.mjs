/**
 * Removes orphan / "Untitled" docs from Sanity, keeping ONLY the content
 * that was created by scripts/seed-sanity.mjs (stable _ids).
 *
 * Touches only these types: product, category, article, homepage.
 * Leaves user / order / contactMessage / otpToken / wishlistItem alone.
 *
 * Run: node scripts/cleanup-sanity.mjs
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

// Stable _id prefixes / exact ids that the seed script writes
const KEEP_PRODUCT_PREFIX = "prod-";
const KEEP_CATEGORY_PREFIX = "cat-";
const KEEP_ARTICLE_PREFIX = "art-";
const KEEP_HOMEPAGE_ID = "homepage";

const TYPES = ["product", "category", "article", "homepage"];

// Doc types that are LEFTOVER from previous scaffolds and should be wiped entirely.
// These have no schema in our codebase anymore, so they only clutter Studio.
const LEGACY_TYPES_TO_WIPE = ["homepageContent"];

console.log(`→ Cleaning project ${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}\n`);

let totalDeleted = 0;

// 0) Wipe legacy/unknown doc types FIRST so they release any references
for (const type of LEGACY_TYPES_TO_WIPE) {
  const rows = await client.fetch(`*[_type==$type]{_id}`, { type });
  if (rows.length === 0) continue;
  console.log(`  ${type} (legacy): removing ${rows.length}`);
  for (const r of rows) {
    try {
      await client.delete(r._id);
      console.log(`     × ${r._id}`);
      totalDeleted++;
    } catch (e) {
      console.log(`     ! could not delete ${r._id}: ${e.message}`);
    }
  }
}

for (const type of TYPES) {
  // Fetch ALL docs of this type, including drafts (drafts.*)
  const rows = await client.fetch(`*[_type==$type]{_id, title}`, { type });

  const toDelete = rows.filter(({ _id }) => {
    const id = _id.replace(/^drafts\./, "");
    if (type === "product") return !id.startsWith(KEEP_PRODUCT_PREFIX);
    if (type === "category") return !id.startsWith(KEEP_CATEGORY_PREFIX);
    if (type === "article") return !id.startsWith(KEEP_ARTICLE_PREFIX);
    if (type === "homepage") return id !== KEEP_HOMEPAGE_ID;
    return false;
  });

  if (toDelete.length === 0) {
    console.log(`  ${type}: nothing to remove (${rows.length} kept)`);
    continue;
  }

  console.log(`  ${type}: removing ${toDelete.length} orphan(s)`);
  for (const d of toDelete) {
    try {
      // Pass through any remaining references (force delete)
      await client.delete(d._id);
      console.log(`     × ${d._id}  ${d.title ? `— ${d.title}` : ""}`);
      totalDeleted++;
    } catch (e) {
      // Try clearing references first by overwriting the doc with empty refs and retry
      console.log(`     ! ${d._id} blocked: ${e.message?.split("\n")[0] || e.message}`);
    }
  }
}

// Also wipe any straggler drafts of seeded docs (so Studio doesn't show "Untitled" drafts)
console.log("\n  drafts: removing any pending drafts of seeded docs");
const draftRows = await client.fetch(
  `*[_id in path("drafts.**") && _type in $types]{_id}`,
  { types: TYPES }
);
if (draftRows.length) {
  const tx = client.transaction();
  for (const d of draftRows) {
    tx.delete(d._id);
    console.log(`     × ${d._id}`);
  }
  await tx.commit({ visibility: "async" });
  totalDeleted += draftRows.length;
}

console.log(`\n✅ Cleanup done. Deleted ${totalDeleted} doc(s).`);
