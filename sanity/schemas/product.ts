import { defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "price", type: "number", validation: (r) => r.required().min(0) }),
    defineField({
      name: "priceFormatted",
      type: "string",
      description: "Display price (e.g. 'Rs. 4,500')",
    }),

    defineField({
      name: "images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (r) => r.min(1),
    }),

    defineField({ name: "description", type: "text", rows: 4 }),

    // Wear type first — other fields depend on it
    defineField({
      name: "wearType",
      type: "string",
      options: {
        list: [
          { title: "Western", value: "western" },
          { title: "Eastern", value: "eastern" },
        ],
        layout: "radio",
      },
    }),

    // Category — dropdown of existing categories, not free text
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Select from existing categories.",
    }),

    // Stitched/Unstitched — only for Eastern
    defineField({
      name: "type",
      title: "Stitched / Unstitched",
      type: "string",
      options: {
        list: [
          { title: "Stitched", value: "stitched" },
          { title: "Unstitched", value: "unstitched" },
        ],
        layout: "radio",
      },
      hidden: ({ parent }) => parent?.wearType !== "eastern",
    }),

    // Eastern-specific attributes — hidden for Western
    defineField({
      name: "fabric",
      type: "string",
      options: {
        list: ["Wash & Wear", "Cotton", "Lawn", "Linen", "Boski", "Egyptian Cotton", "Silk Blend", "Khaddar", "Wool", "Marina", "Jamawar", "Velvet"],
      },
      hidden: ({ parent }) => parent?.wearType !== "eastern",
    }),
    defineField({
      name: "occasion",
      type: "string",
      options: {
        list: ["Daily", "Casual", "Formal", "Eid", "Friday"],
      },
      hidden: ({ parent }) => parent?.wearType !== "eastern",
    }),
    defineField({
      name: "season",
      type: "string",
      options: {
        list: ["Summer", "Winter", "All Season"],
      },
    }),
    defineField({
      name: "fit",
      type: "string",
      options: {
        list: ["Slim Fit", "Regular Fit", "Loose Fit", "Unstitched"],
      },
    }),
    defineField({ name: "subcategory", type: "string", hidden: ({ parent }) => parent?.wearType !== "eastern" }),

    // Variants — predefined options matching shop filters
    defineField({
      name: "sizes",
      type: "array",
      of: [
        {
          type: "string",
          options: {
            list: ["S", "M", "L", "XL", "XXL"],
          },
        },
      ],
    }),
    defineField({
      name: "colors",
      type: "array",
      of: [
        {
          type: "string",
          options: {
            list: ["White", "Black", "Charcoal", "Navy", "Ivory", "Tan", "Olive", "Cream", "Maroon", "Green", "Gold", "Brown", "Beige"],
          },
        },
      ],
    }),

    // Inventory + flags
    defineField({ name: "stock", type: "number", initialValue: 0 }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({ name: "isNew", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", subtitle: "priceFormatted", media: "images.0" },
  },
});
