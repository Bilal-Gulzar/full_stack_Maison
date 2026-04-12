import { defineField, defineType } from "sanity";

/**
 * Singleton shipping settings document. Edit at /studio.
 * Create exactly one document of this type with _id "shippingSettings".
 *
 * Controls the shipping fee, free-shipping threshold, and delivery
 * estimate shown on the Checkout and Order Confirmation pages.
 */
export default defineType({
  name: "shippingSettings",
  title: "Shipping Settings",
  type: "document",
  fields: [
    defineField({
      name: "standardFee",
      title: "Standard Shipping Fee (PKR)",
      type: "number",
      description: "Charged when the cart subtotal is below the free-shipping threshold.",
      initialValue: 250,
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "freeShippingThreshold",
      title: "Free Shipping Threshold (PKR)",
      type: "number",
      description: "Orders above this subtotal qualify for free shipping. Set to 0 to disable.",
      initialValue: 5000,
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "codSurcharge",
      title: "Cash on Delivery Surcharge (PKR)",
      type: "number",
      description: "Extra fee added when the customer pays via Cash on Delivery. Set to 0 for no surcharge.",
      initialValue: 0,
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "deliveryDaysMin",
      title: "Estimated Delivery — Minimum Days",
      type: "number",
      initialValue: 3,
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "deliveryDaysMax",
      title: "Estimated Delivery — Maximum Days",
      type: "number",
      initialValue: 7,
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "shippingNote",
      title: "Shipping Note",
      type: "text",
      rows: 2,
      description: "Optional message shown under the shipping line on the checkout summary.",
    }),
  ],
  preview: {
    select: { fee: "standardFee", min: "deliveryDaysMin", max: "deliveryDaysMax" },
    prepare: ({ fee, min, max }) => ({
      title: "Shipping Settings",
      subtitle: `Rs ${fee ?? 0} · ${min ?? "?"}–${max ?? "?"} days`,
    }),
  },
});
