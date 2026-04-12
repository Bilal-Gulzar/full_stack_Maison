/**
 * Sanity webhook — fires whenever an order's `status` field changes.
 *
 * Setup in Sanity dashboard → API → Webhooks:
 *   URL:       https://<your-site>/api/orders/status-webhook
 *   Dataset:   production
 *   Trigger:   On Create, On Update
 *   Filter:    _type == "order" && delta::changedAny(status)
 *   Projection:
 *     {
 *       "orderId": _id,
 *       "status": status,
 *       "total": total,
 *       "customerEmail": user->email,
 *       "customerName": shippingAddress.fullName,
 *       "trackingUrl": "",
 *       "trackingNumber": "",
 *       "courier": "",
 *       "estimatedDelivery": "",
 *       "cancellationReason": ""
 *     }
 *   HTTP method:   POST
 *   HTTP headers:  x-webhook-secret: <value of SANITY_WEBHOOK_SECRET env var>
 *
 * Emails only fire for transitions the customer cares about:
 *   confirmed, processing, shipped, delivered, cancelled.
 * `pending` is skipped because the initial confirmation email already
 * went out from api/orders/create.ts.
 */
import { wrap, json, readJsonBody } from "../_lib/http";
import { sendOrderStatusUpdateEmail } from "../_lib/email";
import type { OrderStatus } from "../../email_templates/OrderStatusUpdate";

const NOTIFY_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export default wrap(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  // Shared-secret check — simple header, set in the Sanity webhook config
  const expected = process.env.SANITY_WEBHOOK_SECRET;
  if (!expected) {
    console.error("[status-webhook] SANITY_WEBHOOK_SECRET not set");
    return json(res, 500, { error: "Webhook not configured" });
  }
  const provided = (req.headers["x-webhook-secret"] || req.headers["x-webhook-secret".toLowerCase()]) as
    | string
    | undefined;
  if (provided !== expected) return json(res, 401, { error: "Unauthorized" });

  const body = (await readJsonBody(req)) as {
    _id?: string;
    orderId?: string;
    status?: string;
    total?: number;
    customerEmail?: string;
    customerName?: string;
    trackingUrl?: string;
    trackingNumber?: string;
    courier?: string;
    estimatedDelivery?: string;
    cancellationReason?: string;
  };

  // Support both _id (from projection) and orderId (from manual calls)
  const docId = body._id || body.orderId;
  const status = body.status as OrderStatus | undefined;
  if (!status || !docId || !body.customerEmail) {
    console.error("[status-webhook] Missing fields. Got:", JSON.stringify(body));
    return json(res, 400, { error: "Missing required fields (_id, status, customerEmail)" });
  }

  if (!NOTIFY_STATUSES.has(status)) {
    // e.g. "pending" — nothing to do, ack so Sanity doesn't retry
    return json(res, 200, { ok: true, skipped: true, reason: `Status '${status}' does not notify` });
  }

  const orderNumber = docId.replace(/^drafts\./, "").slice(-8).toUpperCase();

  // For shipped orders, use defaults if admin didn't fill tracking fields
  const courier = body.courier || (status === "shipped" ? "TCS Express" : undefined);
  const trackingNumber = body.trackingNumber || (status === "shipped" ? `TCS-${orderNumber}` : undefined);
  const estimatedDelivery = body.estimatedDelivery || (status === "shipped"
    ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : undefined);

  try {
    await sendOrderStatusUpdateEmail(body.customerEmail, {
      customerName: body.customerName || body.customerEmail.split("@")[0],
      orderNumber,
      status,
      total: body.total ?? 0,
      currency: "PKR",
      trackingUrl: body.trackingUrl || undefined,
      trackingNumber,
      courier,
      estimatedDelivery,
      cancellationReason: body.cancellationReason || undefined,
    });
  } catch (e) {
    console.error("[status-webhook] email failed", e);
    return json(res, 500, { error: "Email send failed" });
  }

  return json(res, 200, { ok: true, status, orderNumber });
});
