import { defineField, defineType } from "sanity";

export default defineType({
  name: "newsletterSubscriber",
  title: "Newsletter Subscriber",
  type: "document",
  fields: [
    defineField({ name: "email", type: "string", validation: (r) => r.required().email() }),
    defineField({ name: "source", type: "string", description: "Where they signed up (footer, popup, etc.)" }),
    defineField({
      name: "subscribedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({ name: "unsubscribed", type: "boolean", initialValue: false }),
    defineField({ name: "unsubscribedAt", type: "datetime" }),
  ],
  preview: {
    select: { title: "email", subtitle: "subscribedAt", unsub: "unsubscribed" },
    prepare: ({ title, subtitle, unsub }) => ({
      title,
      subtitle: unsub ? "❌ unsubscribed" : new Date(subtitle || Date.now()).toLocaleString(),
    }),
  },
});
