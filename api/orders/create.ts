import { wrap, json, readJsonBody } from "../_lib/http";
import { sanityServer } from "../_lib/sanityServer";
import { requireSession } from "../_lib/jwt";
import { sendOrderConfirmationEmail, sendOrderConfirmationAdminEmail, OrderEmailPayload } from "../_lib/email";
import { verifyPhone } from "../_lib/phoneVerify";

interface CartItemInput {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export default wrap(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const session = requireSession(req);
  const body = (await readJsonBody(req)) as {
    items?: CartItemInput[];
    paymentMethod?: string;
    shippingAddress?: Record<string, unknown>;
  };
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return json(res, 400, { error: "Cart is empty" });

  // Verify phone number via Veriphone (no-op if VERIPHONE_API_KEY is unset)
  const phone = (body.shippingAddress as { phone?: string } | undefined)?.phone;
  const phoneCheck = await verifyPhone(phone);
  if (!phoneCheck.ok) return json(res, 400, { error: phoneCheck.reason || "Invalid phone number" });

  // Validate prices/stock against Sanity to prevent client tampering
  const ids = items.map((i) => i.productId);
  const products = await sanityServer.fetch<Array<{ _id: string; title: string; price: number; stock?: number }>>(
    `*[_type=="product" && _id in $ids]{_id,title,price,stock}`,
    { ids }
  );
  const byId = new Map(products.map((p) => [p._id, p]));

  // Aggregate quantities by product so multiple cart lines for the same
  // product (different size/color) share a single stock check
  const qtyByProduct = new Map<string, number>();
  for (const i of items) {
    qtyByProduct.set(i.productId, (qtyByProduct.get(i.productId) || 0) + (i.quantity || 0));
  }
  for (const [pid, qty] of qtyByProduct) {
    const p = byId.get(pid);
    if (!p) throw Object.assign(new Error(`Unknown product ${pid}`), { statusCode: 400 });
    if (typeof p.stock === "number" && p.stock < qty) {
      throw Object.assign(new Error(`Insufficient stock for ${p.title}`), { statusCode: 400 });
    }
  }

  const validatedItems = items.map((i) => {
    const p = byId.get(i.productId);
    if (!p) throw Object.assign(new Error(`Unknown product ${i.productId}`), { statusCode: 400 });
    if (i.quantity <= 0) throw Object.assign(new Error("Invalid quantity"), { statusCode: 400 });
    return {
      _key: `${p._id}-${i.size || ""}-${i.color || ""}`,
      _type: "orderItem",
      product: { _type: "reference", _ref: p._id },
      title: p.title,
      price: p.price,
      quantity: i.quantity,
      size: i.size || "",
      color: i.color || "",
    };
  });

  const subtotal = validatedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // Authoritative shipping calculation — fetched server-side from Sanity so the
  // client can't tamper with the fee. Falls back to safe defaults if missing.
  const shipping = await sanityServer.fetch<{
    standardFee?: number;
    freeShippingThreshold?: number;
    codSurcharge?: number;
  } | null>(
    `*[_type=="shippingSettings"][0]{standardFee, freeShippingThreshold, codSurcharge}`
  );
  const standardFee = shipping?.standardFee ?? 250;
  const freeThreshold = shipping?.freeShippingThreshold ?? 5000;
  const codSurchargeRate = shipping?.codSurcharge ?? 0;
  const paymentMethod = body.paymentMethod === "card" ? "card" : "cod";
  const baseShipping = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : standardFee;
  const codSurcharge = paymentMethod === "cod" ? codSurchargeRate : 0;
  const shippingFee = baseShipping + codSurcharge;
  const total = subtotal + shippingFee;

  const order = await sanityServer.create({
    _type: "order",
    user: { _type: "reference", _ref: session.sub },
    customerEmail: session.email,
    items: validatedItems,
    subtotal,
    shippingFee: baseShipping,
    codSurcharge,
    total,
    status: "pending",
    paymentMethod,
    shippingAddress: body.shippingAddress || {},
    createdAt: new Date().toISOString(),
  });

  // Set the public order number — last 8 chars of the _id, uppercased.
  // Stored as a real field so Sanity's search bar can find it.
  const publicOrderNumber = order._id.slice(-8).toUpperCase();
  await sanityServer.patch(order._id).set({ orderNumber: publicOrderNumber }).commit();

  // Decrement stock — one transaction so either all products update or none do.
  // If this fails after the order was created, the catch below logs it so we
  // can reconcile manually (rare — but the order exists and email went out).
  try {
    const tx = sanityServer.transaction();
    for (const [pid, qty] of qtyByProduct) {
      tx.patch(pid, (p) => p.dec({ stock: qty }));
    }
    await tx.commit();
  } catch (e) {
    console.error("[order] stock decrement failed for", order._id, e);
  }

  // Append to user.orders
  await sanityServer
    .patch(session.sub)
    .setIfMissing({ orders: [] })
    .append("orders", [{ _type: "reference", _ref: order._id, _key: order._id }])
    .commit({ autoGenerateArrayKeys: true });

  // Build shared payload for customer + admin emails
  const addr = (body.shippingAddress || {}) as {
    fullName?: string;
    phone?: string;
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  const orderNumber = publicOrderNumber;
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const estimatedDeliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const estimatedDelivery = estimatedDeliveryDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const siteUrl = process.env.SITE_URL || "";
  const emailPayload: OrderEmailPayload = {
    orderId: order._id,
    orderNumber,
    orderDate,
    customerName: addr.fullName || session.email.split("@")[0],
    customerEmail: session.email,
    customerPhone: addr.phone,
    items: validatedItems.map((i) => ({
      name: i.title,
      size: i.size || "—",
      color: i.color || "—",
      quantity: i.quantity,
      price: i.price,
    })),
    subtotal,
    shipping: baseShipping,
    surcharge: codSurcharge,
    total,
    shippingAddress: {
      street: addr.line1 || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.postalCode || "",
      country: addr.country || "",
    },
    paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Card",
    estimatedDelivery,
    trackingUrl: siteUrl ? `${siteUrl}/orders/${order._id}` : undefined,
    currency: "PKR",
  };

  // Confirmation emails — fire & forget (customer + admin)
  const adminEmail = process.env.ADMIN_EMAIL;
  await Promise.allSettled([
    sendOrderConfirmationEmail(session.email, emailPayload),
    adminEmail ? sendOrderConfirmationAdminEmail(adminEmail, emailPayload) : Promise.resolve(),
  ]).then((results) => {
    results.forEach((r) => {
      if (r.status === "rejected") console.error("[order] email failed", r.reason);
    });
  });

  json(res, 200, { orderId: order._id, total });
});
