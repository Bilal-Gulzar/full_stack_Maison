import { defineField, defineType } from "sanity";

export default defineType({
  name: "color",
  title: "Color",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Display name (e.g. Navy, Dark Brown)",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
