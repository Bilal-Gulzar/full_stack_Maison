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

    defineField({ name: "description", type: "text", rows: 4, validation: (r) => r.required().min(20) }),

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
      validation: (r) => r.custom((v, ctx) => {
        const p = ctx.document as { wearType?: string } | undefined;
        if (p?.wearType === "eastern" && !v) return "Fabric is required for Eastern products";
        return true;
      }),
    }),
    defineField({
      name: "occasion",
      type: "string",
      options: {
        list: ["Daily", "Casual", "Formal", "Eid", "Friday"],
      },
      hidden: ({ parent }) => parent?.wearType !== "eastern",
      validation: (r) => r.custom((v, ctx) => {
        const p = ctx.document as { wearType?: string } | undefined;
        if (p?.wearType === "eastern" && !v) return "Occasion is required for Eastern products";
        return true;
      }),
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
      validation: (r) => r.required(),
    }),
    // Variants — predefined options matching shop filters
    defineField({
      name: "sizes",
      type: "array",
      of: [
        {
          type: "string",
          options: {
            list: [
              // Stitched (clothing + trouser waist)
              { title: "Stitched — S",   value: "S" },
              { title: "Stitched — M",   value: "M" },
              { title: "Stitched — L",   value: "L" },
              { title: "Stitched — XL",  value: "XL" },
              { title: "Stitched — XXL", value: "XXL" },
              { title: "Stitched — 28", value: "28" },
              { title: "Stitched — 30", value: "30" },
              { title: "Stitched — 32", value: "32" },
              { title: "Stitched — 34", value: "34" },
              { title: "Stitched — 36", value: "36" },
              { title: "Stitched — 38", value: "38" },
              { title: "Stitched — 40", value: "40" },
              { title: "Stitched — 42", value: "42" },
              // Unstitched
              { title: "Unstitched — 2 Piece Suit",   value: "2 Piece Suit" },
              { title: "Unstitched — 3 Piece Suit",   value: "3 Piece Suit" },
              { title: "Unstitched — 3.5 Meter Suit", value: "3.5 Meter Suit" },
              { title: "Unstitched — 4.5 Meter Suit", value: "4.5 Meter Suit" },
              { title: "Unstitched — 5 Meter Suit",   value: "5 Meter Suit" },
              { title: "Unstitched — 5.5 Meter Suit", value: "5.5 Meter Suit" },
              // Footwear
              { title: "Footwear — 6",  value: "6" },
              { title: "Footwear — 7",  value: "7" },
              { title: "Footwear — 8",  value: "8" },
              { title: "Footwear — 9",  value: "9" },
              { title: "Footwear — 10", value: "10" },
              { title: "Footwear — 11", value: "11" },
              { title: "Footwear — 12", value: "12" },
              { title: "Footwear — 13", value: "13" },
            ],
          },
        },
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "color",
      title: "Color",
      type: "string",
      description: "Each product has one color. Create separate products for other color options.",
      options: {
        list: ["White", "Black", "Charcoal", "Navy", "Ivory", "Tan", "Olive", "Cream", "Maroon", "Green", "Gold", "Brown", "Beige", "Yellow", "Red", "Blue", "Slate", "Camel", "Light Blue", "Pale Pink", "Dark Brown", "Off White", "Grey"],
      },
      validation: (r) => r.required(),
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
