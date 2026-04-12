import { defineField, defineType } from "sanity";

const STATUS_META: Record<string, { title: string; emoji: string }> = {
  pending: { title: "Pending", emoji: "🆕" },
  confirmed: { title: "Confirmed", emoji: "✔️" },
  processing: { title: "Processing", emoji: "⚙️" },
  shipped: { title: "Shipped", emoji: "📦" },
  delivered: { title: "Delivered", emoji: "✅" },
  cancelled: { title: "Cancelled", emoji: "❌" },
};

export default defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order #",
      type: "string",
      description: "8-character public order ID (shown to customers on receipts & emails). Searchable. Auto-set on new orders, editable on old ones.",
    }),
    defineField({
      name: "user",
      type: "reference",
      to: [{ type: "user" }],
    }),
    defineField({
      name: "customerEmail",
      title: "Customer email",
      type: "string",
      description: "Denormalized from user — enables searching orders by email in Studio.",
    }),
    defineField({
      name: "items",
      type: "array",
      of: [
        {
          type: "object",
          name: "orderItem",
          fields: [
            { name: "product", type: "reference", to: [{ type: "product" }] },
            { name: "title", type: "string" },
            { name: "price", type: "number" },
            { name: "quantity", type: "number" },
            { name: "size", type: "string" },
            { name: "color", type: "string" },
          ],
          preview: {
            select: { title: "title", quantity: "quantity", price: "price" },
            prepare: ({ title, quantity, price }) => ({
              title: title || "Item",
              subtitle: `${quantity ?? 0} × Rs ${price ?? 0}`,
            }),
          },
        },
      ],
    }),
    defineField({ name: "subtotal", type: "number", validation: (r) => r.min(0) }),
    defineField({ name: "shippingFee", type: "number", validation: (r) => r.min(0) }),
    defineField({ name: "codSurcharge", type: "number", validation: (r) => r.min(0) }),
    defineField({ name: "total", type: "number", validation: (r) => r.min(0) }),
    defineField({
      name: "status",
      title: "Order Status",
      description:
        "Change here to move the order through its lifecycle. Saving will (eventually) trigger customer emails.",
      type: "string",
      options: {
        list: Object.entries(STATUS_META).map(([value, { title, emoji }]) => ({
          title: `${emoji}  ${title}`,
          value,
        })),
        layout: "radio",
      },
      initialValue: "pending",
    }),
    defineField({
      name: "paymentMethod",
      type: "string",
      options: {
        list: [
          { title: "Cash on Delivery", value: "cod" },
          { title: "Card", value: "card" },
          { title: "Bank Transfer", value: "bank" },
        ],
      },
      initialValue: "cod",
    }),
    defineField({
      name: "shippingAddress",
      type: "object",
      fields: [
        { name: "fullName", type: "string" },
        { name: "phone", type: "string" },
        { name: "line1", type: "string" },
        { name: "line2", type: "string" },
        { name: "city", type: "string" },
        { name: "state", type: "string" },
        { name: "postalCode", type: "string" },
        { name: "country", type: "string" },
      ],
    }),
    defineField({
      name: "courier",
      title: "Courier",
      type: "string",
      description: "e.g. TCS, Leopards, M&P — shown to customer when status is Shipped.",
      hidden: ({ document }) => !document?.status || document.status === "pending",
    }),
    defineField({
      name: "trackingNumber",
      title: "Tracking number",
      type: "string",
      hidden: ({ document }) => !document?.status || document.status === "pending",
    }),
    defineField({
      name: "trackingUrl",
      title: "Tracking URL",
      type: "url",
      description: "Optional — courier's public tracking page for this shipment.",
      hidden: ({ document }) => !document?.status || document.status === "pending",
    }),
    defineField({
      name: "estimatedDelivery",
      title: "Estimated delivery",
      type: "string",
      description: "Free-text, e.g. 'Apr 15, 2026' or 'In 3-5 business days'.",
      hidden: ({ document }) => !document?.status || document.status === "pending",
    }),
    defineField({
      name: "cancellationReason",
      title: "Cancellation reason",
      type: "string",
      description: "Shown to customer when status is Cancelled.",
      hidden: ({ document }) => document?.status !== "cancelled",
    }),
    defineField({
      name: "adminNotes",
      title: "Internal notes",
      type: "text",
      rows: 3,
      description: "Private — only visible in Studio.",
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],

  // Sort options in the Studio sidebar
  // Prioritize orderNumber in Sanity's global search index
  __experimental_search: [
    { path: "orderNumber", weight: 10 },
    { path: "shippingAddress.fullName", weight: 5 },
    { path: "shippingAddress.phone", weight: 3 },
    { path: "shippingAddress.city", weight: 2 },
    { path: "customerEmail", weight: 8 },
  ],

  orderings: [
    {
      title: "Newest first",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Oldest first",
      name: "createdAtAsc",
      by: [{ field: "createdAt", direction: "asc" }],
    },
    {
      title: "Highest total",
      name: "totalDesc",
      by: [{ field: "total", direction: "desc" }],
    },
    {
      title: "Status (Pending → Delivered)",
      name: "statusAsc",
      by: [{ field: "status", direction: "asc" }],
    },
  ],

  preview: {
    select: {
      id: "_id",
      orderNumber: "orderNumber",
      status: "status",
      total: "total",
      createdAt: "createdAt",
      customerName: "shippingAddress.fullName",
      customerEmail: "customerEmail",
      city: "shippingAddress.city",
    },
    prepare: ({ id, orderNumber, status, total, createdAt, customerName, customerEmail, city }) => {
      const meta = STATUS_META[status as string] || STATUS_META.pending;
      const orderNo = (orderNumber as string) || (id as string).replace(/^drafts\./, "").slice(-8).toUpperCase();
      const when = createdAt ? new Date(createdAt as string).toLocaleDateString() : "";
      const who = customerName || customerEmail || "Unknown customer";
      return {
        title: `${meta.emoji}  #${orderNo}  ·  ${who}`,
        subtitle: `Rs ${(total ?? 0).toLocaleString()}  ·  ${meta.title}${city ? `  ·  ${city}` : ""}${when ? `  ·  ${when}` : ""}`,
      };
    },
  },
});
