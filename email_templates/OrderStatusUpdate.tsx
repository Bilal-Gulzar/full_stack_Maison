/**
 * MAISON — Generic Order Status Update Email
 *
 * Rendered when an order transitions to: confirmed, processing, shipped,
 * delivered, or cancelled. The copy changes by status; the layout doesn't.
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderStatusUpdateProps {
  customerName: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  currency?: string;
  trackingUrl?: string;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
  cancellationReason?: string;
}

interface StatusCopy {
  icon: string;
  heading: string;
  body: string;
  accentColor: string;
}

const STATUS_COPY: Record<OrderStatus, StatusCopy> = {
  pending: {
    icon: "🆕",
    heading: "Order Received",
    body: "Thank you — we've received your order and will confirm it shortly.",
    accentColor: "#c9a96e",
  },
  confirmed: {
    icon: "✔️",
    heading: "Order Confirmed",
    body: "Your order is confirmed. Our team will begin preparing it for shipment.",
    accentColor: "#c9a96e",
  },
  processing: {
    icon: "⚙️",
    heading: "Order Being Prepared",
    body: "Good news — your order is now being carefully packed at our studio. You'll hear from us again when it ships.",
    accentColor: "#c9a96e",
  },
  shipped: {
    icon: "📦",
    heading: "Your Order Is On The Way",
    body: "Your order has left our studio and is heading to you. Use the tracking details below to follow its journey.",
    accentColor: "#c9a96e",
  },
  delivered: {
    icon: "✅",
    heading: "Delivered — Thank You",
    body: "Your order has been delivered. We hope you love every piece. If anything isn't right, simply reply to this email.",
    accentColor: "#6e8f5e",
  },
  cancelled: {
    icon: "❌",
    heading: "Order Cancelled",
    body: "Your order has been cancelled. If you paid online, any applicable refund will be processed within a few business days.",
    accentColor: "#b14a4a",
  },
};

export function renderOrderStatusUpdate(props: OrderStatusUpdateProps): string {
  const {
    customerName,
    orderNumber,
    status,
    total,
    currency = "PKR",
    trackingUrl,
    trackingNumber,
    courier,
    estimatedDelivery,
    cancellationReason,
  } = props;

  const copy = STATUS_COPY[status];
  const fmt = (n: number) =>
    `${currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const trackingBlock =
    status === "shipped" && (trackingNumber || courier || trackingUrl)
      ? `
      <tr>
        <td style="padding:0 48px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="background:#faf8f5;border-radius:6px;border:1px solid #e8e4df;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">Tracking Details</p>
                ${courier ? `<p style="margin:0 0 2px;font-family:Georgia,serif;font-size:15px;color:#1a1714;">${courier}</p>` : ""}
                ${trackingNumber ? `<p style="margin:0 0 4px;font-family:Georgia,serif;font-size:14px;color:#5a554e;">Tracking #: <strong style="color:#1a1714;">${trackingNumber}</strong></p>` : ""}
                ${estimatedDelivery ? `<p style="margin:0;font-size:13px;color:#8a8279;">Estimated delivery: <strong style="color:#1a1714;">${estimatedDelivery}</strong></p>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
      : "";

  const ctaBlock = trackingUrl
    ? `
      <tr>
        <td style="padding:28px 48px 0;text-align:center;">
          <a href="${trackingUrl}"
             style="display:inline-block;padding:16px 48px;background:#1a1714;color:#c9a96e;font-family:Georgia,serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:4px;">
            ${status === "shipped" ? "Track Your Order" : "View Order"}
          </a>
        </td>
      </tr>`
    : "";

  const cancelReasonBlock =
    status === "cancelled" && cancellationReason
      ? `
      <tr>
        <td style="padding:0 48px 8px;">
          <p style="margin:0;font-size:13px;color:#8a8279;font-style:italic;text-align:center;">
            Reason: ${cancellationReason}
          </p>
        </td>
      </tr>`
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${copy.heading} — MAISON</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">

  <div style="display:none;max-height:0;overflow:hidden;">
    MAISON order #${orderNumber} — ${copy.heading}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 16px rgba(26,23,20,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1714;padding:44px 48px 36px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:34px;letter-spacing:10px;color:#c9a96e;font-weight:400;">
                MAISON
              </h1>
              <p style="margin:10px 0 0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;color:#c4b8a8;text-transform:uppercase;">
                Modern Menswear
              </p>
            </td>
          </tr>

          <!-- Gold accent -->
          <tr>
            <td style="background:linear-gradient(90deg,#c9a96e,#e2c992,#c9a96e);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Status icon + heading -->
          <tr>
            <td style="padding:48px 48px 16px;text-align:center;">
              <div style="width:72px;height:72px;margin:0 auto 24px;border-radius:50%;background:#f5f0eb;line-height:72px;font-size:32px;">
                ${copy.icon}
              </div>
              <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:26px;color:#1a1714;font-weight:400;">
                ${copy.heading}
              </h2>
              <p style="margin:0 0 8px;font-size:15px;color:#8a8279;line-height:1.7;">
                Hi <strong style="color:#1a1714;">${customerName}</strong>,
              </p>
              <p style="margin:0;font-size:15px;color:#5a554e;line-height:1.7;">
                ${copy.body}
              </p>
            </td>
          </tr>

          <!-- Order meta card -->
          <tr>
            <td style="padding:28px 48px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#faf8f5;border-radius:6px;border:1px solid #e8e4df;">
                <tr>
                  <td style="padding:20px;text-align:center;border-right:1px solid #e8e4df;" width="50%">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">Order</p>
                    <p style="margin:0;font-family:Georgia,serif;font-size:17px;color:${copy.accentColor};font-weight:600;">#${orderNumber}</p>
                  </td>
                  <td style="padding:20px;text-align:center;" width="50%">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">Total</p>
                    <p style="margin:0;font-family:Georgia,serif;font-size:17px;color:#1a1714;">${fmt(total)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${trackingBlock}
          ${cancelReasonBlock}
          ${ctaBlock}

          <!-- Help -->
          <tr>
            <td style="padding:36px 48px 44px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#8a8279;line-height:1.8;">
                Questions? Reply to this email or contact
                <a href="mailto:Maisonclothing0@gmail.com" style="color:#c9a96e;text-decoration:none;">Maisonclothing0@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1714;padding:32px 48px;text-align:center;">
              <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:18px;letter-spacing:4px;color:#c9a96e;">MAISON</p>
              <p style="margin:0 0 16px;font-size:12px;color:#c4b8a8;">
                Luxury Menswear — Crafted with Purpose
              </p>
              <p style="margin:0;font-size:11px;color:#a8a29a;">
                © ${new Date().getFullYear()} MAISON. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
