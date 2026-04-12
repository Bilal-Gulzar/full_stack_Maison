/**
 * MAISON — New Order Notification (Admin)
 *
 * Usage:
 *   import { renderOrderConfirmationAdmin } from './OrderConfirmationAdmin';
 *   const html = renderOrderConfirmationAdmin({ ...orderData });
 */

import { OrderItem } from "./OrderConfirmationUser";

export interface OrderConfirmationAdminProps {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
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
  paymentMethod: string;
  currency?: string;
}

export function renderOrderConfirmationAdmin(props: OrderConfirmationAdminProps): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    orderNumber,
    orderDate,
    items,
    subtotal,
    shipping,
    surcharge,
    total,
    shippingAddress,
    paymentMethod,
    currency = "PKR",
  } = props;

  const fmt = (n: number) =>
    `${currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const itemRows = items
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? "#ffffff" : "#faf8f5"};">
        <td style="padding:12px 16px;border-bottom:1px solid #e8e4df;">
          <p style="margin:0 0 2px;font-family:'Georgia',serif;font-size:15px;color:#1a1714;font-weight:600;">${item.name}</p>
          <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#8a8279;">${item.size} / ${item.color}</p>
        </td>
        <td style="padding:12px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#1a1714;text-align:center;border-bottom:1px solid #e8e4df;">
          ${item.quantity}
        </td>
        <td style="padding:12px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#1a1714;text-align:right;border-bottom:1px solid #e8e4df;">
          ${fmt(item.price)}
        </td>
        <td style="padding:12px 16px;font-family:'Georgia',serif;font-size:15px;color:#1a1714;text-align:right;border-bottom:1px solid #e8e4df;font-weight:600;">
          ${fmt(item.price * item.quantity)}
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
  <title>New Order #${orderNumber} — MAISON Admin</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="640" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 16px rgba(26,23,20,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1714;padding:28px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-family:'Georgia','Times New Roman',serif;font-size:24px;letter-spacing:6px;color:#c9a96e;font-weight:400;">MAISON</p>
                    <p style="margin:6px 0 0;font-size:10px;letter-spacing:2px;color:#c4b8a8;text-transform:uppercase;">Admin Dashboard</p>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="display:inline-block;padding:6px 16px;background:#c9a96e;color:#1a1714;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:3px;font-weight:700;">
                      New Order
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold line -->
          <tr>
            <td style="background:linear-gradient(90deg,#c9a96e,#e2c992,#c9a96e);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#1a1714;border-radius:6px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">New Order Received</p>
                    <p style="margin:0;font-family:'Georgia',serif;font-size:28px;color:#c9a96e;font-weight:400;">
                      #${orderNumber}
                    </p>
                  </td>
                  <td style="padding:20px 24px;text-align:right;vertical-align:bottom;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">Total</p>
                    <p style="margin:0;font-family:'Georgia',serif;font-size:28px;color:#ffffff;font-weight:600;">
                      ${fmt(total)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding:0 40px 24px;">
              <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;border-bottom:2px solid #1a1714;padding-bottom:10px;">
                Customer Details
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="padding:16px;background:#faf8f5;border-radius:6px;border:1px solid #e8e4df;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;color:#8a8279;text-transform:uppercase;">Contact</p>
                    <p style="margin:0 0 2px;font-family:'Georgia',serif;font-size:15px;color:#1a1714;font-weight:600;">${customerName}</p>
                    <p style="margin:0 0 2px;font-size:13px;color:#5a554e;">${customerEmail}</p>
                    ${customerPhone ? `<p style="margin:0;font-size:13px;color:#5a554e;">${customerPhone}</p>` : ""}
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding:16px;background:#faf8f5;border-radius:6px;border:1px solid #e8e4df;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;color:#8a8279;text-transform:uppercase;">Shipping Address</p>
                    <p style="margin:0;font-size:13px;color:#1a1714;line-height:1.6;">
                      ${shippingAddress.street}<br/>
                      ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}<br/>
                      ${shippingAddress.country}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items Table -->
          <tr>
            <td style="padding:0 40px 24px;">
              <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;border-bottom:2px solid #1a1714;padding-bottom:10px;">
                Order Items
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="border:1px solid #e8e4df;border-radius:6px;overflow:hidden;">
                <tr style="background:#1a1714;">
                  <td style="padding:10px 16px;font-size:11px;letter-spacing:1.5px;color:#c9a96e;text-transform:uppercase;">Item</td>
                  <td style="padding:10px 16px;font-size:11px;letter-spacing:1.5px;color:#c9a96e;text-transform:uppercase;text-align:center;">Qty</td>
                  <td style="padding:10px 16px;font-size:11px;letter-spacing:1.5px;color:#c9a96e;text-transform:uppercase;text-align:right;">Price</td>
                  <td style="padding:10px 16px;font-size:11px;letter-spacing:1.5px;color:#c9a96e;text-transform:uppercase;text-align:right;">Total</td>
                </tr>
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="280" cellpadding="0" cellspacing="0" align="right">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#8a8279;">Subtotal</td>
                  <td style="padding:6px 0;font-size:13px;color:#1a1714;text-align:right;">${fmt(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#8a8279;">Shipping</td>
                  <td style="padding:6px 0;font-size:13px;color:#1a1714;text-align:right;">${shipping === 0 ? "Free" : fmt(shipping)}</td>
                </tr>
                ${
                  surcharge > 0
                    ? `<tr>
                  <td style="padding:6px 0;font-size:13px;color:#8a8279;">Surcharge</td>
                  <td style="padding:6px 0;font-size:13px;color:#1a1714;text-align:right;">${fmt(surcharge)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#8a8279;">Payment</td>
                  <td style="padding:6px 0;font-size:13px;color:#1a1714;text-align:right;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top:2px solid #1a1714;padding-top:12px;">
                    <table role="presentation" width="100%"><tr>
                      <td style="font-family:'Georgia',serif;font-size:18px;color:#1a1714;font-weight:600;">Total</td>
                      <td style="font-family:'Georgia',serif;font-size:18px;color:#c9a96e;font-weight:600;text-align:right;">${fmt(total)}</td>
                    </tr></table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1714;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a8a29a;">
                MAISON Admin · Auto-generated notification · ${orderDate}
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
