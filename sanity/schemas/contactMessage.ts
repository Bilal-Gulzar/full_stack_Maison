import { defineField, defineType } from "sanity";

export default defineType({
  name: "contactMessage",
  title: "Contact Message",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "email", type: "string", validation: (r) => r.required().email() }),
    defineField({ name: "subject", type: "string" }),
    defineField({ name: "message", type: "text", rows: 5, validation: (r) => r.required() }),
    defineField({
      name: "createdAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: { select: { title: "name", subtitle: "email", description: "subject" } },
});
