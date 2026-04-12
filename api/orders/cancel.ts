/**
 * Customer self-cancel endpoint.
 *
 * Rules:
 *   - Must be authenticated
 *   - Must own the order
 *   - Order must still be in 'pending' or 'confirmed' status
 *   - Restocks the items (inverse of create.ts decrement)
 *   - Sets status to 'cancelled' — the Sanity webhook then fires the
 *     cancellation email, so no email logic duplicated here.
 */
import { wrap, json, readJsonBody } from "../_lib/http";
import { sanityServer } from "../_lib/sanityServer";
import { requireSession } from "../_lib/jwt";
import { sendOrderCancelledAdminEmail } from "../_lib/email";

const CANCELLABLE_STATUSES = new Set(["pending"]);

interface OrderDoc {
  _id: string;
  status: string;
  user: { _ref: string };
  items?: Array<{ product?: { _ref?: string }; quantity?: number }>;
}

export default wrap(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const session = requireSession(req);
  const body = (await readJsonBody(req)) as { orderId?: string; reason?: string };

  const orderId = String(body.orderId || "").trim();
  if (!orderId) return json(res, 400, { error: "Missing orderId" });

  const reason = String(body.reason || "").trim().slice(0, 500);

  const order = await sanityServer.fetch<OrderDoc & { total?: number; customerName?: string; customerEmail?: string } | null>(
    `*[_type=="order" && _id==$id][0]{
      _id, status, user, total,
      items[]{product, quantity, title, price, size, color},
      "customerName": shippingAddress.fullName,
      "customerEmail": user->email
    }`,
    { id: orderId }
  );
  if (!order) return json(res, 404, { error: "Order not found" });
  if (order.user?._ref !== session.sub) return json(res, 403, { error: "Not your order" });

  if (!CANCELLABLE_STATUSES.has(order.status)) {
    return json(res, 409, {
      error: `Order cannot be cancelled once it is ${order.status}. Please contact support.`,
    });
  }

  // Patch the order first — this is the single source of truth
  await sanityServer
    .patch(order._id)
    .set({
      status: "cancelled",
      cancellationReason: reason || "Cancelled by customer",
    })
    .commit();

  // Restock — aggregate quantities per product (handles multi-line same product)
  const qtyByProduct = new Map<string, number>();
  for (const item of order.items || []) {
    const pid = item.product?._ref;
    const qty = item.quantity || 0;
    if (pid && qty > 0) qtyByProduct.set(pid, (qtyByProduct.get(pid) || 0) + qty);
  }
  if (qtyByProduct.size > 0) {
    try {
      const tx = sanityServer.transaction();
      for (const [pid, qty] of qtyByProduct) {
        tx.patch(pid, (p) => p.inc({ stock: qty }));
      }
      await tx.commit();
    } catch (e) {
      // Order is already cancelled; log so we can reconcile manually
      console.error("[order-cancel] restock failed for", order._id, e);
    }
  }

  // Notify admin that a customer self-cancelled
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const orderNumber = order._id.slice(-8).toUpperCase();
    try {
      await sendOrderCancelledAdminEmail(adminEmail, {
        orderNumber,
        customerName: order.customerName || session.email.split("@")[0],
        customerEmail: order.customerEmail || session.email,
        total: order.total ?? 0,
        reason: reason || "No reason given",
      });
    } catch (e) {
      console.error("[order-cancel] admin email failed", e);
    }
  }

  return json(res, 200, { ok: true, status: "cancelled" });
});
