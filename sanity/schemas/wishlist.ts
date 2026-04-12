import { defineField, defineType } from "sanity";

export default defineType({
  name: "wishlistItem",
  title: "Wishlist Item",
  type: "document",
  fields: [
    defineField({
      name: "user",
      type: "reference",
      to: [{ type: "user" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "addedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: "product.title", subtitle: "user.email" },
  },
});
