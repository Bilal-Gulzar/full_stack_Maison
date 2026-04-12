/**
 * One-off seed: creates the singleton shippingSettings document so the
 * client can see real shipping numbers on Checkout immediately.
 *
 * Run: node scripts/seed-shipping.mjs
 *
 * Idempotent — uses createOrReplace with a fixed _id.
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

const doc = {
  _id: "shippingSettings",
  _type: "shippingSettings",
  standardFee: 250,
  freeShippingThreshold: 5000,
  codSurcharge: 0,
  deliveryDaysMin: 3,
  deliveryDaysMax: 7,
  shippingNote: "Free shipping on orders over Rs 5,000. Delivered nationwide via TCS.",
};

const result = await client.createOrReplace(doc);
console.log("✓ shippingSettings created:", result._id);
console.log("  Standard fee:    Rs", doc.standardFee);
console.log("  Free over:       Rs", doc.freeShippingThreshold);
console.log("  Delivery:        ", `${doc.deliveryDaysMin}–${doc.deliveryDaysMax} days`);
console.log("\nEdit it any time at /studio → Shipping Settings");
