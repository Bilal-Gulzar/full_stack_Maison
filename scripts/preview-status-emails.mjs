// Render all 5 status-change email variants to HTML for preview.
// Run: npx tsx scripts/preview-status-emails.mjs
// Then open email_templates/preview/status-*.html in a browser.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const { renderOrderStatusUpdate } = await import("../email_templates/OrderStatusUpdate.tsx");

const outDir = join(process.cwd(), "email_templates", "preview");
mkdirSync(outDir, { recursive: true });

const base = {
  customerName: "Bilal Gul",
  orderNumber: "D8KSND11",
  total: 32550,
  currency: "PKR",
};

const variants = [
  { status: "confirmed" },
  { status: "processing" },
  {
    status: "shipped",
    courier: "TCS Express",
    trackingNumber: "TCS-998877665",
    trackingUrl: "https://tcs.com.pk/track/TCS-998877665",
    estimatedDelivery: "Apr 15, 2026",
  },
  { status: "delivered" },
  {
    status: "cancelled",
    cancellationReason: "Customer changed their mind",
  },
];

for (const v of variants) {
  const props = { ...base, ...v };
  const html = renderOrderStatusUpdate(props);
  const filename = `status-${v.status}.html`;
  writeFileSync(join(outDir, filename), html);
  console.log(`  ${filename}`);
}

console.log(`\nWrote ${variants.length} status email previews to ${outDir}`);
