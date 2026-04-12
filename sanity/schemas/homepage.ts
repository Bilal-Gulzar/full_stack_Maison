import { defineField, defineType } from "sanity";

/**
 * Singleton homepage document. Edit at /studio.
 * Create exactly one document of this type with _id "homepage".
 */
export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "heroSlides",
      title: "Hero Slides",
      type: "array",
      of: [
        {
          type: "object",
          name: "heroSlide",
          fields: [
            { name: "subtitle", type: "string" },
            { name: "title", type: "string", validation: (r) => r.required() },
            { name: "titleAccent", type: "string", description: "Italic accent shown after main title" },
            { name: "description", type: "text", rows: 2 },
            { name: "image", type: "image", options: { hotspot: true }, validation: (r) => r.required() },
            { name: "ctaLabel", type: "string", initialValue: "Explore Collection" },
            { name: "ctaLink", type: "string", initialValue: "/shop" },
          ],
          preview: { select: { title: "title", subtitle: "subtitle", media: "image" } },
        },
      ],
    }),
    defineField({
      name: "marqueeItems",
      title: "Marquee banner items",
      description: "Scrolling text items under the hero. Add, remove, or reorder.",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.max(8),
    }),
    defineField({
      name: "newArrivals",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "collections",
      title: "Shop By Collection",
      description: "Collection cards on homepage. Link is auto-built from wear type + filter.",
      type: "array",
      of: [
        {
          type: "object",
          name: "collectionCard",
          fields: [
            { name: "title", type: "string", validation: (r) => r.required() },
            { name: "subtitle", type: "string" },
            { name: "image", type: "image", options: { hotspot: true }, validation: (r) => r.required() },
            {
              name: "wearType",
              title: "Wear Type",
              type: "string",
              options: {
                list: [
                  { title: "All Products", value: "all" },
                  { title: "Eastern", value: "eastern" },
                  { title: "Western", value: "western" },
                ],
              },
              initialValue: "all",
              validation: (r) => r.required(),
            },
            {
              name: "stitchType",
              title: "Stitch Type",
              type: "string",
              options: {
                list: [
                  { title: "All", value: "all" },
                  { title: "Stitched", value: "stitched" },
                  { title: "Unstitched", value: "unstitched" },
                ],
              },
              initialValue: "all",
              hidden: ({ parent }) => parent?.wearType !== "eastern",
            },
            {
              name: "filterNew",
              title: "New Arrivals only?",
              type: "boolean",
              initialValue: false,
            },
          ],
          preview: { select: { title: "title", subtitle: "subtitle", media: "image" } },
        },
      ],
    }),
    defineField({
      name: "shopByCategory",
      title: "Shop By Category",
      description: "Category cards on homepage. Select a category — link is auto-built.",
      type: "array",
      of: [
        {
          type: "object",
          name: "categoryCard",
          fields: [
            { name: "title", type: "string", validation: (r) => r.required() },
            { name: "image", type: "image", options: { hotspot: true }, validation: (r) => r.required() },
            {
              name: "category",
              title: "Category",
              type: "reference",
              to: [{ type: "category" }],
              validation: (r) => r.required(),
              description: "Pick a category — the link is auto-generated from it.",
            },
          ],
          preview: { select: { title: "title", media: "image" } },
        },
      ],
    }),
    defineField({
      name: "editorialBanner",
      type: "object",
      fields: [
        { name: "subtitle", type: "string", description: "Small label above the title (e.g. 'Editorial')" },
        { name: "title", type: "string" },
        { name: "titleAccent", type: "string", description: "Italic accent shown after main title" },
        { name: "description", type: "text", rows: 2 },
        { name: "image", type: "image", options: { hotspot: true } },
        { name: "ctaLabel", type: "string" },
        { name: "ctaLink", type: "string" },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Homepage" }) },
});
