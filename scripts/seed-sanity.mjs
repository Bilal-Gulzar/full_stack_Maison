/**
 * One-off seed script: uploads the legacy static products + their image
 * assets + the article set + categories into Sanity.
 *
 * Run: node scripts/seed-sanity.mjs
 *
 * Reads SANITY_PROJECT_ID / SANITY_DATASET / SANITY_WRITE_TOKEN from .env.local.
 * Idempotent: re-running upserts existing docs by deterministic _id.
 */

import { createClient } from "@sanity/client";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "src", "assets");

// --- env loader (no extra deps) ---
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

// --- Categories ---
const CATEGORIES = [
  // Western
  { id: "cat-knitwear", title: "Knitwear", wearType: "western" },
  { id: "cat-trousers", title: "Trousers", wearType: "western" },
  { id: "cat-shirts", title: "Shirts", wearType: "western" },
  { id: "cat-footwear", title: "Footwear", wearType: "western" },
  { id: "cat-polos", title: "Polos", wearType: "western" },
  { id: "cat-outerwear", title: "Outerwear", wearType: "western" },
  // Eastern (stitched)
  { id: "cat-shalwar-kameez", title: "Shalwar Kameez", wearType: "eastern", type: "stitched", subcategory: "Basic" },
  { id: "cat-kurta-pajama", title: "Kurta Pajama", wearType: "eastern", type: "stitched", subcategory: "Formal" },
  { id: "cat-short-kurta", title: "Short Kurta", wearType: "eastern", type: "stitched", subcategory: "Casual" },
  { id: "cat-waistcoat", title: "Waistcoat", wearType: "eastern", type: "stitched", subcategory: "Waistcoat" },
  // Eastern (unstitched)
  { id: "cat-unstitched", title: "Unstitched", wearType: "eastern", type: "unstitched", subcategory: "Daily Wear" },
];

// --- Products ---
const PRODUCTS = [
  // Western
  { id: "merino-turtleneck", name: "Merino Turtleneck", price: 285, priceFormatted: "$285", asset: "product-1.jpg", category: "cat-knitwear", categoryLabel: "Knitwear", isNew: true, description: "Crafted from the finest Australian merino wool, this turtleneck offers unparalleled softness against the skin. A refined staple that transitions effortlessly from office to evening.", sizes: ["S","M","L","XL"], colors: ["Charcoal","Ivory","Navy"], wearType: "western", featured: true },
  { id: "tailored-wool-trousers", name: "Tailored Wool Trousers", price: 420, priceFormatted: "$420", asset: "product-2.jpg", category: "cat-trousers", categoryLabel: "Trousers", isNew: true, description: "Impeccably tailored from Italian wool with a contemporary slim fit. Features a hidden clasp closure and pressed crease for a sharp silhouette.", sizes: ["28","30","32","34","36"], colors: ["Black","Charcoal","Navy"], wearType: "western", featured: true },
  { id: "oxford-cotton-shirt", name: "Oxford Cotton Shirt", price: 195, priceFormatted: "$195", asset: "product-3.jpg", category: "cat-shirts", categoryLabel: "Shirts", isNew: false, description: "A wardrobe essential crafted from premium Oxford cotton. The relaxed collar and mother-of-pearl buttons add subtle sophistication.", sizes: ["S","M","L","XL","XXL"], colors: ["White","Light Blue","Pale Pink"], wearType: "western" },
  { id: "chelsea-suede-boots", name: "Chelsea Suede Boots", price: 560, priceFormatted: "$560", asset: "product-4.jpg", category: "cat-footwear", categoryLabel: "Footwear", isNew: true, description: "Hand-stitched Italian suede Chelsea boots with Goodyear welt construction. The leather sole develops a beautiful patina with wear.", sizes: ["7","8","9","10","11","12"], colors: ["Tan","Dark Brown","Black"], wearType: "western", featured: true },
  { id: "knit-polo-shirt", name: "Knit Polo Shirt", price: 245, priceFormatted: "$245", asset: "product-5.jpg", category: "cat-polos", categoryLabel: "Polos", isNew: false, description: "A textured knit polo in organic cotton blend. The open collar and ribbed cuffs create a relaxed yet polished aesthetic.", sizes: ["S","M","L","XL"], colors: ["Olive","Cream","Slate"], wearType: "western" },
  { id: "camel-wool-overcoat", name: "Camel Wool Overcoat", price: 890, priceFormatted: "$890", asset: "product-6.jpg", category: "cat-outerwear", categoryLabel: "Outerwear", isNew: true, description: "A statement overcoat in luxurious camel wool-cashmere blend. Double-breasted silhouette with notch lapels and a half-lined interior.", sizes: ["S","M","L","XL"], colors: ["Camel","Charcoal"], wearType: "western", featured: true },

  // Eastern stitched
  { id: "white-shalwar-kameez", name: "Classic White Shalwar Kameez", price: 4500, priceFormatted: "Rs. 4,500", asset: "eastern-kurta-1.jpg", category: "cat-shalwar-kameez", categoryLabel: "Shalwar Kameez", subcategory: "Basic", isNew: false, description: "Timeless white shalwar kameez in premium wash & wear fabric. Perfect for daily wear and Friday prayers with a clean, crisp finish.", sizes: ["S","M","L","XL","XXL"], colors: ["White","Off White"], fabric: "Wash & Wear", occasion: "Daily", season: "All Season", fit: "Regular Fit", type: "stitched", wearType: "eastern" },
  { id: "embroidered-navy-kurta", name: "Embroidered Navy Kurta Pajama", price: 8900, priceFormatted: "Rs. 8,900", asset: "eastern-kurta-2.jpg", category: "cat-kurta-pajama", categoryLabel: "Kurta Pajama", subcategory: "Formal", isNew: true, description: "Exquisite navy kurta pajama with intricate gold thread embroidery. A statement piece for Eid celebrations and formal gatherings.", sizes: ["S","M","L","XL"], colors: ["Navy","Black"], fabric: "Silk Blend", occasion: "Eid", season: "All Season", fit: "Slim Fit", type: "stitched", wearType: "eastern", featured: true },
  { id: "charcoal-short-kurta", name: "Charcoal Short Kurta Trouser", price: 5200, priceFormatted: "Rs. 5,200", asset: "eastern-kurta-3.jpg", category: "cat-short-kurta", categoryLabel: "Short Kurta", subcategory: "Casual", isNew: true, description: "Modern slim-fit short kurta in charcoal with matching trouser. Perfect for casual outings with a contemporary edge.", sizes: ["S","M","L","XL"], colors: ["Charcoal","Black","Navy"], fabric: "Cotton", occasion: "Casual", season: "Summer", fit: "Slim Fit", type: "stitched", wearType: "eastern" },
  { id: "khaddar-winter-kurta", name: "Khaddar Winter Kurta Shalwar", price: 6800, priceFormatted: "Rs. 6,800", asset: "eastern-kurta-4.jpg", category: "cat-shalwar-kameez", categoryLabel: "Shalwar Kameez", subcategory: "Basic", isNew: false, description: "Warm khaddar kurta shalwar in rich olive tone. Crafted for winter comfort with a traditional loose fit and premium stitching.", sizes: ["M","L","XL","XXL"], colors: ["Olive","Brown","Maroon"], fabric: "Khaddar", occasion: "Daily", season: "Winter", fit: "Loose Fit", type: "stitched", wearType: "eastern" },
  { id: "designer-eid-kurta", name: "Designer Eid Kurta Pajama", price: 12500, priceFormatted: "Rs. 12,500", asset: "eastern-kurta-5.jpg", category: "cat-kurta-pajama", categoryLabel: "Kurta Pajama", subcategory: "Formal", isNew: true, description: "Luxurious maroon designer kurta pajama set with gold zardozi embroidery. Crafted for Eid festivities with a regal, festive feel.", sizes: ["S","M","L","XL"], colors: ["Maroon","Gold","Green"], fabric: "Silk Blend", occasion: "Eid", season: "All Season", fit: "Slim Fit", type: "stitched", wearType: "eastern", featured: true },
  { id: "maroon-jamawar-waistcoat", name: "Maroon Jamawar Waistcoat Set", price: 9800, priceFormatted: "Rs. 9,800", asset: "eastern-waistcoat-1.jpg", category: "cat-waistcoat", categoryLabel: "Waistcoat", subcategory: "Waistcoat", isNew: true, description: "Rich maroon jamawar waistcoat paired with a white kurta pajama. The perfect festive ensemble with intricate traditional weaving.", sizes: ["S","M","L","XL"], colors: ["Maroon","Gold","Blue"], fabric: "Jamawar", occasion: "Eid", season: "All Season", fit: "Regular Fit", type: "stitched", wearType: "eastern" },
  { id: "emerald-velvet-waistcoat", name: "Emerald Velvet Waistcoat Set", price: 11500, priceFormatted: "Rs. 11,500", asset: "eastern-waistcoat-2.jpg", category: "cat-waistcoat", categoryLabel: "Waistcoat", subcategory: "Waistcoat", isNew: true, description: "Luxurious emerald green velvet waistcoat with gold embroidery, paired with matching kurta. A showstopper for formal and festive occasions.", sizes: ["S","M","L","XL"], colors: ["Green","Black","Maroon"], fabric: "Velvet", occasion: "Formal", season: "Winter", fit: "Slim Fit", type: "stitched", wearType: "eastern", featured: true },

  // Eastern unstitched
  { id: "boski-premium-suit", name: "Premium Boski Unstitched Suit", price: 7500, priceFormatted: "Rs. 7,500", asset: "eastern-unstitched-1.jpg", category: "cat-unstitched", categoryLabel: "Unstitched", subcategory: "Premium", isNew: false, description: "Premium Boski fabric unstitched 3-piece suit in elegant beige. Finest weave with a luxurious drape ideal for formal tailoring.", sizes: ["3 Piece Suit","2 Piece Suit"], colors: ["Beige","White","Grey"], fabric: "Boski", occasion: "Formal", season: "All Season", fit: "Unstitched", type: "unstitched", wearType: "eastern" },
  { id: "wash-wear-navy-suit", name: "Wash & Wear Navy Unstitched", price: 3200, priceFormatted: "Rs. 3,200", asset: "eastern-unstitched-2.jpg", category: "cat-unstitched", categoryLabel: "Unstitched", subcategory: "Daily Wear", isNew: true, description: "Versatile wash & wear fabric in rich navy. Easy care, wrinkle-resistant unstitched suit perfect for daily wear shalwar kameez.", sizes: ["4.5 Meter Suit","3 Piece Suit","2 Piece Suit"], colors: ["Navy","Black","Charcoal","White"], fabric: "Wash & Wear", occasion: "Daily", season: "All Season", fit: "Unstitched", type: "unstitched", wearType: "eastern" },
];

// --- Articles ---
const ARTICLES = [
  { id: "art-art-of-layering", title: "The Art of Layering: A Modern Man's Guide", slug: "art-of-layering", description: "Master the technique of layering to create depth, texture, and effortless style through every season.", imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80", body: "Layering is one of the most versatile tools in a modern gentleman's wardrobe. It's not just about warmth — it's about creating visual depth, texture, and a sense of effortless sophistication.\n\nEvery great layered look begins with a well-fitted base layer. A crisp white tee or a slim merino crew neck sets the stage for everything that follows. Add a mid layer — a knitted cardigan, a lightweight overshirt, or a tailored vest — to bring personality. Finish with an outer layer that complements the textures beneath.\n\nKeep inner layers slim and outer layers relaxed. Mix materials: cotton with wool, denim with cashmere, linen with leather. The interplay of textures is what makes layering an art form." },
  { id: "art-sustainable-fashion", title: "Sustainable Fashion: Why Quality Over Quantity Wins", slug: "sustainable-fashion", description: "Investing in fewer, better-made pieces isn't just good for the planet — it's the smartest way to dress.", imageUrl: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&q=80", body: "The fashion industry is one of the largest polluters in the world. But as consumers, we have the power to change that — one purchase at a time.\n\nA well-made garment lasts years, not months. Premium fabrics hold their shape, colors stay true, and construction withstands daily wear. The cost-per-wear of a quality piece is often lower than its fast fashion equivalent.\n\nFocus on versatile, timeless pieces that work together. A navy blazer, well-cut trousers, quality knitwear, and a few premium basics can create dozens of outfits." },
  { id: "art-perfect-suit", title: "The Perfect Suit: From Boardroom to Evening", slug: "perfect-suit", description: "How to transition your tailored look from a professional setting to a sophisticated evening out.", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80", body: "A truly great suit is the most versatile garment a man can own. With the right approach, it takes you from the boardroom to dinner without missing a beat.\n\nNavy and charcoal are the most versatile colors. Opt for a modern slim fit in a year-round weight fabric like a Super 120s wool. For day, pair with a crisp dress shirt and polished Oxford shoes. For evening, swap to a fine-knit polo, add a pocket square, and switch to suede loafers.\n\nMake sure your suit fits impeccably. The shoulders should sit naturally, the jacket should button without pulling, and trousers should break just once at the shoe." },
  { id: "art-essential-accessories", title: "Essential Accessories Every Gentleman Needs", slug: "essential-accessories", description: "From timepieces to pocket squares, discover the accessories that elevate any outfit.", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=80", body: "Accessories are the punctuation marks of menswear. They complete the sentence your outfit is trying to make.\n\nA quality watch is the single most important accessory a man can own. Match your belt to your shoes — always. Pocket squares are the easiest way to add personality to a blazer; start with a white linen square and expand from there. Classic sunglasses — aviators, wayfarers — never go out of style. A slim, leather, well-organized wallet is something you use every day; make it count." },
  { id: "art-fabric-guide", title: "Fabric Guide: Understanding What You Wear", slug: "fabric-guide", description: "Linen, cashmere, merino — learn how fabric choice defines comfort, drape, and longevity.", imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80", body: "Understanding fabrics transforms how you shop, how you dress, and how long your clothes last.\n\nCotton is the workhorse of menswear: breathable, versatile, and available in countless weaves. Wool regulates temperature, resists wrinkles, and drapes beautifully — merino is the gold standard for knitwear. Linen is the king of summer fabrics; its natural texture and breathability make it perfect for warm weather. Cashmere is the ultimate luxury fiber: incredibly soft and warm. Silk is unmatched for ties, pocket squares, and evening wear." },
  { id: "art-spring-2026-trends", title: "Spring 2026: Trends Worth Adopting", slug: "spring-2026-trends", description: "Our edit of the season's most wearable trends — relaxed tailoring, earth tones, and textural contrast.", imageUrl: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=1200&q=80", body: "Spring 2026 brings a welcome shift toward relaxed elegance.\n\nRelaxed tailoring — unstructured blazers, wider trousers, and gentle draping — replaces the rigid fits of recent years. Earth tones (terracotta, olive, sand, clay) dominate the palette and complement most skin tones. Mix textures: a suede jacket over a silk shirt, or a knitted tie with a crisp cotton shirt. The vest returns, worn alone over a shirt or as part of a three-piece. And luxury fabrics in casual silhouettes blur the line between dressed up and dressed down." },
];

// --- helpers ---
async function uploadImageFromFile(filename) {
  const buf = await fs.readFile(path.join(ASSETS, filename));
  const asset = await client.assets.upload("image", buf, { filename });
  return asset._id;
}

async function uploadImageFromUrl(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buf, { filename });
  return asset._id;
}

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// --- run ---
console.log(`→ Connecting to Sanity project ${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}`);

console.log("\n[1/3] Categories");
for (const c of CATEGORIES) {
  await client.createOrReplace({
    _id: c.id,
    _type: "category",
    title: c.title,
    slug: { _type: "slug", current: slugify(c.title) },
    wearType: c.wearType,
    // Eastern-only fields — undefined for western
    ...(c.wearType === "eastern" && {
      type: c.type,
      subcategory: c.subcategory,
    }),
  });
  console.log(`  ✓ ${c.title}`);
}

console.log("\n[2/3] Products");
for (const p of PRODUCTS) {
  process.stdout.write(`  · ${p.name} … `);
  const assetId = await uploadImageFromFile(p.asset);
  await client.createOrReplace({
    _id: `prod-${p.id}`,
    _type: "product",
    title: p.name,
    slug: { _type: "slug", current: p.id },
    price: p.price,
    priceFormatted: p.priceFormatted,
    images: [
      {
        _type: "image",
        _key: `img-${p.id}`,
        asset: { _type: "reference", _ref: assetId },
      },
    ],
    description: p.description,
    category: { _type: "reference", _ref: p.category },
    categoryLabel: p.categoryLabel,
    subcategory: p.subcategory || undefined,
    wearType: p.wearType,
    type: p.type || undefined,
    fabric: p.fabric || undefined,
    occasion: p.occasion || undefined,
    season: p.season || undefined,
    fit: p.fit || undefined,
    sizes: p.sizes,
    colors: p.colors,
    stock: 50,
    featured: !!p.featured,
    isNew: !!p.isNew,
  });
  console.log("ok");
}

console.log("\n[3/3] Articles");
for (const a of ARTICLES) {
  process.stdout.write(`  · ${a.title} … `);
  const assetId = await uploadImageFromUrl(a.imageUrl, `${a.slug}.jpg`);
  await client.createOrReplace({
    _id: a.id,
    _type: "article",
    title: a.title,
    slug: { _type: "slug", current: a.slug },
    description: a.description,
    coverImage: { _type: "image", asset: { _type: "reference", _ref: assetId } },
    content: a.body.split(/\n\n+/).map((para, i) => ({
      _type: "block",
      _key: `b-${i}`,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `s-${i}`, text: para, marks: [] }],
    })),
    publishedAt: new Date().toISOString(),
  });
  console.log("ok");
}

console.log("\n[4/4] Homepage (hero + sections)");
const HERO_SLIDES = [
  { asset: "hero-main.jpg", subtitle: "Spring / Summer 2026", title: "The Art of", titleAccent: "Refinement", description: "Discover our latest collection of meticulously crafted menswear, where timeless elegance meets contemporary design." },
  { asset: "hero-2.jpg", subtitle: "New Season", title: "Mediterranean", titleAccent: "Elegance", description: "Sun-kissed linen suits and relaxed tailoring for the modern traveler." },
  { asset: "hero-3.jpg", subtitle: "Outerwear Edit", title: "Bold", titleAccent: "Statements", description: "Signature overcoats and layering pieces crafted for lasting impression." },
  { asset: "hero-4-new.jpg", subtitle: "Essentials", title: "Effortless", titleAccent: "Sophistication", description: "Wardrobe foundations built on quality fabrics and impeccable fit." },
];
const heroSlides = [];
for (const s of HERO_SLIDES) {
  process.stdout.write(`  · hero ${s.title} ${s.titleAccent} … `);
  const assetId = await uploadImageFromFile(s.asset);
  heroSlides.push({
    _type: "heroSlide",
    _key: `slide-${slugify(s.titleAccent)}`,
    subtitle: s.subtitle,
    title: s.title,
    titleAccent: s.titleAccent,
    description: s.description,
    image: { _type: "image", asset: { _type: "reference", _ref: assetId } },
    ctaLabel: "Explore Collection",
    ctaLink: "/shop",
  });
  console.log("ok");
}

const featuredIds = PRODUCTS.filter((p) => p.featured).map((p) => `prod-${p.id}`);
const newIds = PRODUCTS.filter((p) => p.isNew).map((p) => `prod-${p.id}`);

process.stdout.write("  · editorial banner image … ");
const editorialAssetId = await uploadImageFromFile("hero-secondary.jpg");
console.log("ok");

await client.createOrReplace({
  _id: "homepage",
  _type: "homepage",
  heroSlides,
  marqueeText: "Complimentary worldwide shipping on orders over $300 · Free returns within 30 days",
  featuredProducts: featuredIds.map((id, i) => ({ _type: "reference", _ref: id, _key: `f-${i}` })),
  newArrivals: newIds.map((id, i) => ({ _type: "reference", _ref: id, _key: `n-${i}` })),
  editorialBanner: {
    subtitle: "Editorial",
    title: "Dressing is a Way of",
    titleAccent: "Life",
    description: "Explore the intersection of craftsmanship and modern masculinity in our latest editorial.",
    image: { _type: "image", asset: { _type: "reference", _ref: editorialAssetId } },
    ctaLabel: "Read the Story",
    ctaLink: "/articles",
  },
});
console.log("  ✓ homepage doc");

console.log("\n✅ Seed complete.");
