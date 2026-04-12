/**
 * MAISON — Order Confirmation Email (Customer)
 *
 * Usage:
 *   import { renderOrderConfirmationUser } from './OrderConfirmationUser';
 *   const html = renderOrderConfirmationUser({ ...orderData });
 *   // Send `html` via your email service (Resend, Nodemailer, etc.)
 */

export interface OrderItem {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderConfirmationUserProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  surcharge: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  estimatedDelivery: string;
  trackingUrl?: string;
  currency?: string;
}

export function renderOrderConfirmationUser(props: OrderConfirmationUserProps): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    items,
    subtotal,
    shipping,
    surcharge,
    total,
    shippingAddress,
    estimatedDelivery,
    trackingUrl,
    currency = "PKR",
  } = props;

  const fmt = (n: number) =>
    `${currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #e8e4df;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${
                item.image
                  ? `<td width="80" style="vertical-align:top;">
                      <img src="${item.image}" alt="${item.name}" width="80" height="100"
                           style="display:block;border-radius:4px;object-fit:cover;background:#f5f0eb;" />
                    </td>
                    <td width="16"></td>`
                  : ""
              }
              <td style="vertical-align:top;">
                <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:16px;color:#1a1714;font-weight:600;">
                  ${item.name}
                </p>
                <p style="margin:0 0 2px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#8a8279;">
                  Size: ${item.size} &nbsp;·&nbsp; Color: ${item.color}
                </p>
                <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#8a8279;">
                  Qty: ${item.quantity}
                </p>
              </td>
              <td style="vertical-align:top;text-align:right;">
                <p style="margin:0;font-family:'Georgia',serif;font-size:16px;color:#1a1714;font-weight:600;">
                  ${fmt(item.price * item.quantity)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation — MAISON</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;">
    Your MAISON order #${orderNumber} has been confirmed. Thank you for your purchase.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Main Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 16px rgba(26,23,20,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1714;padding:44px 48px 36px;text-align:center;">
              <h1 style="margin:0;font-family:'Georgia','Times New Roman',serif;font-size:34px;letter-spacing:10px;color:#c9a96e;font-weight:400;">
                MAISON
              </h1>
              <p style="margin:10px 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#c4b8a8;text-transform:uppercase;">
                Modern Menswear
              </p>
            </td>
          </tr>

          <!-- Gold Accent Line -->
          <tr>
            <td style="background:linear-gradient(90deg,#c9a96e,#e2c992,#c9a96e);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Confirmation Icon & Heading -->
          <tr>
            <td style="padding:48px 48px 24px;text-align:center;">
              <div style="width:64px;height:64px;margin:0 auto 24px;border-radius:50%;background:#f5f0eb;line-height:64px;font-size:28px;">
                ✓
              </div>
              <h2 style="margin:0 0 8px;font-family:'Georgia',serif;font-size:24px;color:#1a1714;font-weight:400;">
                Order Confirmed
              </h2>
              <p style="margin:0;font-size:15px;color:#8a8279;line-height:1.6;">
                Thank you, <strong style="color:#1a1714;">${customerName}</strong>. Your order has been received and is being prepared.
              </p>
            </td>
          </tr>

          <!-- Order Meta -->
          <tr>
            <td style="padding:0 48px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#faf8f5;border-radius:6px;border:1px solid #e8e4df;">
                <tr>
                  <td style="padding:20px;text-align:center;border-right:1px solid #e8e4df;" width="50%">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">Order Number</p>
                    <p style="margin:0;font-family:'Georgia',serif;font-size:16px;color:#c9a96e;font-weight:600;">#${orderNumber}</p>
                  </td>
                  <td style="padding:20px;text-align:center;" width="50%">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">Order Date</p>
                    <p style="margin:0;font-family:'Georgia',serif;font-size:16px;color:#1a1714;">${orderDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:0 48px;">
              <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;border-bottom:2px solid #1a1714;padding-bottom:12px;">
                Items Ordered
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:24px 48px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#8a8279;">Subtotal</td>
                  <td style="padding:6px 0;font-size:14px;color:#1a1714;text-align:right;">${fmt(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#8a8279;">Shipping</td>
                  <td style="padding:6px 0;font-size:14px;color:#1a1714;text-align:right;">${shipping === 0 ? "Free" : fmt(shipping)}</td>
                </tr>
                ${
                  surcharge > 0
                    ? `<tr>
                  <td style="padding:6px 0;font-size:14px;color:#8a8279;">Surcharge</td>
                  <td style="padding:6px 0;font-size:14px;color:#1a1714;text-align:right;">${fmt(surcharge)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td colspan="2" style="padding:12px 0 0;border-top:2px solid #1a1714;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:'Georgia',serif;font-size:18px;color:#1a1714;font-weight:600;">Total</td>
                        <td style="font-family:'Georgia',serif;font-size:18px;color:#c9a96e;font-weight:600;text-align:right;">${fmt(total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping & Delivery -->
          <tr>
            <td style="padding:36px 48px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="vertical-align:top;background:#faf8f5;border-radius:6px;padding:20px;border:1px solid #e8e4df;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">Shipping To</p>
                    <p style="margin:0;font-size:14px;color:#1a1714;line-height:1.6;">
                      ${customerName}<br/>
                      ${shippingAddress.street}<br/>
                      ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}<br/>
                      ${shippingAddress.country}
                    </p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align:top;background:#faf8f5;border-radius:6px;padding:20px;border:1px solid #e8e4df;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">Estimated Delivery</p>
                    <p style="margin:0;font-family:'Georgia',serif;font-size:18px;color:#1a1714;">
                      ${estimatedDelivery}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Help Section -->
          <tr>
            <td style="padding:36px 48px 48px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#8a8279;line-height:1.8;">
                Questions about your order? Contact us at
                <a href="mailto:Maisonclothing0@gmail.com" style="color:#c9a96e;text-decoration:none;">Maisonclothing0@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1714;padding:32px 48px;text-align:center;">
              <p style="margin:0 0 8px;font-family:'Georgia',serif;font-size:18px;letter-spacing:4px;color:#c9a96e;">MAISON</p>
              <p style="margin:0 0 16px;font-size:12px;color:#c4b8a8;">
                Luxury Menswear — Crafted with Purpose
              </p>
              <p style="margin:0;font-size:11px;color:#a8a29a;">
                © ${new Date().getFullYear()} MAISON. All rights reserved.<br/>
                <a href="#" style="color:#c9a96e;text-decoration:none;">Unsubscribe</a> &nbsp;·&nbsp;
                <a href="#" style="color:#c9a96e;text-decoration:none;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Main Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}
