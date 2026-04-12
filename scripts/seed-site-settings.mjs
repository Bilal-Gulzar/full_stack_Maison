/**
 * Seeds siteSettings with all footer page content.
 * Run: node scripts/seed-site-settings.mjs
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
  _id: "siteSettings",
  _type: "siteSettings",
  aboutStory: [
    "Founded in 2018, Maison was born from a simple belief: every man deserves clothing that makes him feel extraordinary. We bridge the gap between classic tailoring and contemporary design.",
    "Our collections are crafted from the finest materials sourced from mills across Italy, Scotland, and Japan. Each piece undergoes meticulous quality control to ensure it meets our exacting standards.",
    "From our atelier in Milan to your wardrobe, every Maison garment carries the promise of enduring style and uncompromising quality.",
  ],
  aboutValues: [
    { _type: "aboutValue", _key: "quality", title: "Quality", description: "We source only the finest materials and employ master craftsmen to create garments that last a lifetime." },
    { _type: "aboutValue", _key: "sustain", title: "Sustainability", description: "From eco-conscious fabrics to ethical manufacturing, we're committed to reducing our environmental footprint." },
    { _type: "aboutValue", _key: "timeless", title: "Timelessness", description: "We design beyond trends. Our pieces are investments in style that transcend seasons and years." },
  ],
  faqs: [
    { _type: "faqItem", _key: "size", question: "How do I find my size?", answer: "Use our Size Guide available on each product page and in the Shop section. We recommend measuring your chest, waist, and inseam for the best fit." },
    { _type: "faqItem", _key: "cancel", question: "Can I modify or cancel my order?", answer: "Orders can be cancelled while they are still pending. Once we confirm and start processing, you'll need to contact support." },
    { _type: "faqItem", _key: "gift", question: "Do you offer gift wrapping?", answer: "Yes! Select 'Gift Wrap' at checkout for complimentary luxury packaging with a personalized note card." },
    { _type: "faqItem", _key: "payment", question: "What payment methods do you accept?", answer: "We accept Cash on Delivery for domestic orders. Card payments coming soon." },
    { _type: "faqItem", _key: "care", question: "How do I care for my garments?", answer: "Each item includes detailed care instructions on the label. Generally, we recommend dry cleaning for suits and cold washing for casual pieces." },
    { _type: "faqItem", _key: "intl", question: "Do you ship internationally?", answer: "Currently we ship within Pakistan. International shipping coming soon." },
    { _type: "faqItem", _key: "sale", question: "Can I return a sale item?", answer: "Items marked 'Final Sale' cannot be returned. Regular sale items follow our standard return policy." },
    { _type: "faqItem", _key: "refund", question: "How long does a refund take?", answer: "Refunds are processed within 5–7 business days after we receive your return." },
  ],
  shippingPolicies: [
    { _type: "policyItem", _key: "std", title: "Standard Shipping", content: "Free on orders over Rs 5,000. Delivery within 3–7 business days. All orders are carefully packaged to ensure your garments arrive in pristine condition." },
    { _type: "policyItem", _key: "track", title: "Order Tracking", content: "Once your order ships, you'll receive an email with tracking details. Track your order anytime from your account's Orders page." },
    { _type: "policyItem", _key: "cod", title: "Cash on Delivery", content: "Available nationwide. Pay when your order arrives at your doorstep. A small COD surcharge may apply." },
  ],
  returnPolicies: [
    { _type: "returnItem", _key: "policy", title: "Return Policy", content: "We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with all tags attached." },
    { _type: "returnItem", _key: "how", title: "How to Initiate a Return", content: "Contact us at Maisonclothing0@gmail.com with your order number. We'll guide you through the return process." },
    { _type: "returnItem", _key: "refund", title: "Refund Processing", content: "Refunds are processed within 5–7 business days after we receive and inspect the returned item." },
    { _type: "returnItem", _key: "exchange", title: "Exchanges", content: "Need a different size or color? Exchanges are free. Contact us and we'll arrange it." },
    { _type: "returnItem", _key: "final", title: "Final Sale Items", content: "Items marked as 'Final Sale' are not eligible for returns or exchanges. These are clearly marked on the product page." },
  ],
  sustainabilitySections: [
    { _type: "sustainSection", _key: "ethical", title: "Ethical Sourcing", content: "We partner exclusively with certified mills and workshops that uphold fair labor practices. Every supplier is audited annually for compliance with international labor standards." },
    { _type: "sustainSection", _key: "materials", title: "Sustainable Materials", content: "Over 60% of our collection uses organic cotton, recycled wool, or TENCEL™ fibers. We're committed to reaching 100% sustainable materials by 2028." },
    { _type: "sustainSection", _key: "waste", title: "Reduced Waste", content: "Our made-to-order program reduces overproduction by 40%. Fabric offcuts are donated to fashion schools or recycled into new textiles." },
    { _type: "sustainSection", _key: "carbon", title: "Carbon Neutral Shipping", content: "All shipments are carbon-offset through verified reforestation projects. We use recycled packaging materials and eliminate single-use plastics." },
    { _type: "sustainSection", _key: "longevity", title: "Garment Longevity Program", content: "We offer complimentary repairs and alterations for life on all Maison garments, because the most sustainable garment is the one you keep wearing." },
  ],
  careersOpenings: [
    { _type: "jobOpening", _key: "designer", title: "Senior Fashion Designer", location: "Lahore", type: "Full-time", description: "Lead the creative direction for our seasonal collections. 5+ years experience in menswear design required." },
    { _type: "jobOpening", _key: "ecom", title: "E-Commerce Manager", location: "Remote", type: "Full-time", description: "Drive our online retail strategy, optimize conversion funnels, and manage the digital shopping experience." },
    { _type: "jobOpening", _key: "social", title: "Content & Social Media Specialist", location: "Remote", type: "Contract", description: "Create compelling visual content for Instagram, TikTok, and our editorial blog. Strong photography and copywriting skills needed." },
  ],
};

const result = await client.createOrReplace(doc);
console.log("✓ siteSettings seeded:", result._id);
console.log("  About: ", doc.aboutStory.length, "paragraphs,", doc.aboutValues.length, "values");
console.log("  FAQs:", doc.faqs.length);
console.log("  Shipping:", doc.shippingPolicies.length, "policies");
console.log("  Returns:", doc.returnPolicies.length, "policies");
console.log("  Sustainability:", doc.sustainabilitySections.length, "sections");
console.log("  Careers:", doc.careersOpenings.length, "openings");
console.log("\nEdit at /studio → Site Settings");
