import { defineField, defineType } from "sanity";

/**
 * Category schema mirrors the legacy static taxonomy exactly:
 *
 *   Western → just a name (e.g. Knitwear, Trousers, Shirts)
 *   Eastern → name + type (stitched/unstitched) + subcategory bucket
 *
 * `type` and `subcategory` are HIDDEN in Studio unless wearType === "eastern".
 */
export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "wearType",
      title: "Wear Type",
      type: "string",
      options: {
        list: [
          { title: "Western", value: "western" },
          { title: "Eastern", value: "eastern" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
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
      // Only Eastern categories carry stitched/unstitched
      hidden: ({ parent }) => parent?.wearType !== "eastern",
      validation: (r) =>
        r.custom((value, ctx) => {
          const parent = ctx.parent as { wearType?: string } | undefined;
          if (parent?.wearType === "eastern" && !value) {
            return "Eastern categories must specify stitched or unstitched";
          }
          return true;
        }),
    }),
    defineField({
      name: "subcategory",
      type: "string",
      description: "e.g. Basic, Formal, Casual, Waistcoat, Premium, Daily Wear, Winter",
      hidden: ({ parent }) => parent?.wearType !== "eastern",
    }),
  ],
  preview: {
    select: { title: "title", wearType: "wearType", type: "type", subcategory: "subcategory" },
    prepare: ({ title, wearType, type, subcategory }) => ({
      title,
      subtitle:
        wearType === "eastern"
          ? `EASTERN · ${type || "?"}${subcategory ? ` · ${subcategory}` : ""}`
          : "WESTERN",
    }),
  },
});
