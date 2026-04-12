/**
 * Seeds collections + shopByCategory on the homepage document.
 * Collections use wearType/stitchType dropdowns (no manual links).
 * Categories use references to existing category documents.
 * Run: node scripts/seed-collections.mjs
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const text = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
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

loadEnv();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function uploadImage(filePath, label) {
  const fullPath = path.join(ROOT, "src", "assets", filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ Image not found: ${filePath}, skipping`);
    return null;
  }
  const buffer = fs.readFileSync(fullPath);
  const asset = await client.assets.upload("image", buffer, { filename: filePath });
  console.log(`  ✓ Uploaded ${label}: ${asset._id}`);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

// Find category documents by title
async function findCategory(title) {
  const cat = await client.fetch(
    `*[_type=="category" && title==$title][0]{_id}`,
    { title }
  );
  if (!cat) {
    console.log(`  ⚠ Category "${title}" not found in Sanity`);
    return null;
  }
  return { _type: "reference", _ref: cat._id };
}

console.log("Uploading collection images...");
const colImages = {
  eastern: await uploadImage("collection-eastern.jpg", "Eastern Wear"),
  stitched: await uploadImage("eastern-kurta-2.jpg", "Stitched"),
  unstitched: await uploadImage("collection-suits.jpg", "Unstitched"),
  western: await uploadImage("eastern-waistcoat-1.jpg", "Western"),
};

console.log("\nUploading category images...");
const catImages = {
  kurtaPajama: await uploadImage("eastern-kurta-2.jpg", "Kurta Pajama"),
  shalwarKameez: await uploadImage("eastern-kurta-1.jpg", "Shalwar Kameez"),
  waistcoat: await uploadImage("eastern-waistcoat-1.jpg", "Waistcoat"),
  casual: await uploadImage("eastern-kurta-3.jpg", "Casual"),
};

console.log("\nLooking up categories...");
const catRefs = {
  kurtaPajama: await findCategory("Kurta Pajama"),
  shalwarKameez: await findCategory("Shalwar Kameez"),
  waistcoat: await findCategory("Waistcoat"),
  casualWear: await findCategory("Casual Wear"),
};

const collections = [
  { _type: "collectionCard", _key: "eastern", title: "Eastern Wear", subtitle: "Heritage & Elegance", image: colImages.eastern, wearType: "eastern", stitchType: "all", filterNew: false },
  { _type: "collectionCard", _key: "stitched", title: "Stitched Collection", subtitle: "Ready to Wear", image: colImages.stitched, wearType: "eastern", stitchType: "stitched", filterNew: false },
  { _type: "collectionCard", _key: "unstitched", title: "Unstitched", subtitle: "Premium Fabrics", image: colImages.unstitched, wearType: "eastern", stitchType: "unstitched", filterNew: false },
  { _type: "collectionCard", _key: "western", title: "Western Wear", subtitle: "Modern Classics", image: colImages.western, wearType: "western", stitchType: "all", filterNew: false },
].filter(c => c.image);

const shopByCategory = [
  catRefs.kurtaPajama && { _type: "categoryCard", _key: "kurta", title: "Kurta Pajama", image: catImages.kurtaPajama, category: catRefs.kurtaPajama },
  catRefs.shalwarKameez && { _type: "categoryCard", _key: "shalwar", title: "Shalwar Kameez", image: catImages.shalwarKameez, category: catRefs.shalwarKameez },
  catRefs.waistcoat && { _type: "categoryCard", _key: "waistcoat", title: "Waistcoat Sets", image: catImages.waistcoat, category: catRefs.waistcoat },
  catRefs.casualWear && { _type: "categoryCard", _key: "casual", title: "Casual Wear", image: catImages.casual, category: catRefs.casualWear },
].filter(Boolean);

await client.patch("homepage").set({ collections, shopByCategory }).commit();

console.log(`\n✓ Seeded ${collections.length} collections + ${shopByCategory.length} categories`);
console.log("Edit at /studio → Homepage");
