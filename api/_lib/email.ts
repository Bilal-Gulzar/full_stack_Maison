import nodemailer from "nodemailer";
import { renderVerificationCode } from "../../email_templates/VerificationCodeEmail";
import {
  renderOrderConfirmationUser,
  OrderItem as TemplateOrderItem,
} from "../../email_templates/OrderConfirmationUser";
import { renderOrderConfirmationAdmin } from "../../email_templates/OrderConfirmationAdmin";
import {
  renderOrderStatusUpdate,
  OrderStatus,
  OrderStatusUpdateProps,
} from "../../email_templates/OrderStatusUpdate";

/**
 * Gmail SMTP transport via Nodemailer (free).
 * Requires:
 *   ADMIN_EMAIL          — the Gmail address to send from
 *   NODMAILER_API_KEY    — Gmail app password (16-char, spaces allowed)
 */
const GMAIL_USER = process.env.ADMIN_EMAIL || "";
const GMAIL_PASS = (process.env.NODMAILER_API_KEY || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
const FROM = process.env.RESEND_FROM || `Maison <${GMAIL_USER}>`;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

const wrap = (title: string, body: string) => `<!doctype html><html><body style="margin:0;padding:0;background:#f5f3ef;font-family:Georgia,serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;padding:40px;border:1px solid #e8e4dc;">
        <tr><td>
          <h1 style="margin:0 0 8px;font-weight:300;letter-spacing:0.15em;font-size:28px;">MAISON</h1>
          <div style="height:1px;background:#1a1a1a;width:40px;margin:16px 0 24px;"></div>
          <h2 style="margin:0 0 16px;font-weight:400;font-size:20px;">${title}</h2>
          <div style="font-size:14px;line-height:1.7;">${body}</div>
          <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e8e4dc;font-size:11px;color:#888;letter-spacing:0.1em;text-transform:uppercase;">Maison · Timeless Style</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

export async function sendOtpEmail(to: string, code: string) {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: `Your Maison sign-in code: ${code}`,
    html: renderVerificationCode({ code, expiryMinutes: 10, purpose: "login" }),
  });
}

export interface OrderEmailPayload {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: TemplateOrderItem[];
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
  estimatedDelivery: string;
  trackingUrl?: string;
  currency?: string;
}

export async function sendOrderConfirmationEmail(to: string, order: OrderEmailPayload) {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: `Order confirmed — #${order.orderNumber}`,
    html: renderOrderConfirmationUser({
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      surcharge: order.surcharge,
      total: order.total,
      shippingAddress: order.shippingAddress,
      estimatedDelivery: order.estimatedDelivery,
      trackingUrl: order.trackingUrl,
      currency: order.currency,
    }),
  });
}

const STATUS_SUBJECTS: Record<OrderStatus, string> = {
  pending: "Order received",
  confirmed: "Order confirmed",
  processing: "Your order is being prepared",
  shipped: "Your order has shipped",
  delivered: "Your order has been delivered",
  cancelled: "Your order was cancelled",
};

export async function sendOrderStatusUpdateEmail(to: string, props: OrderStatusUpdateProps) {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: `${STATUS_SUBJECTS[props.status]} — #${props.orderNumber}`,
    html: renderOrderStatusUpdate(props),
  });
}

export async function sendOrderConfirmationAdminEmail(to: string, order: OrderEmailPayload) {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: `New order #${order.orderNumber} — ${order.currency || "PKR"} ${order.total.toLocaleString()}`,
    html: renderOrderConfirmationAdmin({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      surcharge: order.surcharge,
      total: order.total,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      currency: order.currency,
    }),
  });
}

export interface OrderCancelledAdminPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  reason: string;
  currency?: string;
}

export async function sendOrderCancelledAdminEmail(to: string, data: OrderCancelledAdminPayload) {
  const cur = data.currency || "PKR";
  return transporter.sendMail({
    from: FROM,
    to,
    subject: `Order #${data.orderNumber} cancelled by customer`,
    html: wrap(
      "Order Cancelled by Customer",
      `<p style="margin:0 0 16px;padding:12px 16px;background:#fdf2f2;border-left:3px solid #b14a4a;font-size:14px;color:#b14a4a;">
        <strong>#${data.orderNumber}</strong> was cancelled by the customer.
      </p>
      <table style="width:100%;font-size:14px;line-height:1.8;border-collapse:collapse;">
        <tr><td style="color:#888;padding:4px 0;">Customer</td><td style="padding:4px 0;"><strong>${data.customerName}</strong> &lt;${data.customerEmail}&gt;</td></tr>
        <tr><td style="color:#888;padding:4px 0;">Order Total</td><td style="padding:4px 0;">${cur} ${data.total.toLocaleString()}</td></tr>
        <tr><td style="color:#888;padding:4px 0;">Reason</td><td style="padding:4px 0;">${data.reason}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:13px;color:#888;">Items have been automatically restocked.</p>`
    ),
  });
}

export async function sendContactNotificationEmail(
  to: string,
  msg: { name: string; email: string; subject?: string; message: string }
) {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: `New contact message from ${msg.name}`,
    html: wrap(
      "New contact form submission",
      `<p><strong>From:</strong> ${msg.name} &lt;${msg.email}&gt;</p>
       ${msg.subject ? `<p><strong>Subject:</strong> ${msg.subject}</p>` : ""}
       <p style="white-space:pre-wrap;">${msg.message}</p>`
    ),
  });
}
