// Render email templates to HTML for visual preview.
// Run: npx tsx scripts/preview-emails.mjs
// Then open email_templates/preview/*.html in a browser.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const { renderVerificationCode } = await import("../email_templates/VerificationCodeEmail.tsx");
const { renderOrderConfirmationUser } = await import("../email_templates/OrderConfirmationUser.tsx");
const { renderOrderConfirmationAdmin } = await import("../email_templates/OrderConfirmationAdmin.tsx");

const outDir = join(process.cwd(), "email_templates", "preview");
mkdirSync(outDir, { recursive: true });

const items = [
  { name: "Linen Tailored Blazer", size: "M", color: "Charcoal", quantity: 1, price: 18500 },
  { name: "Cotton Oxford Shirt", size: "L", color: "Ivory", quantity: 2, price: 6800 },
];
const address = {
  street: "12-B Gulberg Main Boulevard",
  city: "Lahore",
  state: "Punjab",
  zip: "54000",
  country: "Pakistan",
};

writeFileSync(
  join(outDir, "verification.html"),
  renderVerificationCode({ code: "482917", userName: "Bilal", purpose: "login" })
);
writeFileSync(
  join(outDir, "order-user.html"),
  renderOrderConfirmationUser({
    customerName: "Bilal Gul",
    orderNumber: "A1B2C3D4",
    orderDate: "April 10, 2026",
    items,
    subtotal: 32100,
    shipping: 250,
    surcharge: 200,
    total: 32550,
    shippingAddress: address,
    estimatedDelivery: "Apr 15, 2026",
    trackingUrl: "https://maison.example/orders/A1B2C3D4",
  })
);
writeFileSync(
  join(outDir, "order-admin.html"),
  renderOrderConfirmationAdmin({
    customerName: "Bilal Gul",
    customerEmail: "bilal@example.com",
    customerPhone: "+92 300 1234567",
    orderNumber: "A1B2C3D4",
    orderDate: "April 10, 2026",
    items,
    subtotal: 32100,
    shipping: 250,
    surcharge: 200,
    total: 32550,
    shippingAddress: address,
    paymentMethod: "Cash on Delivery",
  })
);

console.log("Wrote preview HTML to", outDir);
