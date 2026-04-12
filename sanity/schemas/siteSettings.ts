import { defineField, defineType } from "sanity";

/**
 * Singleton site settings — footer page content editable from Studio.
 * Create one document with _id "siteSettings" at /studio.
 */
export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "general", title: "General" },
    { name: "about", title: "About Page" },
    { name: "faq", title: "FAQ Page" },
    { name: "shipping", title: "Shipping & Returns" },
    { name: "sustainability", title: "Sustainability" },
    { name: "careers", title: "Careers" },
  ],
  fields: [
    // ─── General ───
    defineField({
      name: "brandTagline",
      title: "Brand tagline",
      type: "text",
      rows: 2,
      description: "Short brand description shown below the logo in the footer.",
      group: "general",
    }),

    // ─── About Page ───
    defineField({
      name: "aboutStory",
      title: "About — Story paragraphs",
      type: "array",
      of: [{ type: "text", rows: 3 }],
      group: "about",
    }),
    defineField({
      name: "aboutValues",
      title: "About — Values",
      type: "array",
      of: [
        {
          type: "object",
          name: "aboutValue",
          fields: [
            { name: "title", type: "string" },
            { name: "description", type: "text", rows: 2 },
          ],
          preview: { select: { title: "title" } },
        },
      ],
      group: "about",
    }),

    // ─── FAQ Page ───
    defineField({
      name: "faqs",
      title: "FAQ — Questions & Answers",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqItem",
          fields: [
            { name: "question", type: "string", validation: (r) => r.required() },
            { name: "answer", type: "text", rows: 3, validation: (r) => r.required() },
          ],
          preview: { select: { title: "question" } },
        },
      ],
      group: "faq",
    }),

    // ─── Shipping & Returns Page ───
    defineField({
      name: "shippingPolicies",
      title: "Shipping — Policies",
      type: "array",
      of: [
        {
          type: "object",
          name: "policyItem",
          fields: [
            { name: "title", type: "string", validation: (r) => r.required() },
            { name: "content", type: "text", rows: 3, validation: (r) => r.required() },
          ],
          preview: { select: { title: "title" } },
        },
      ],
      group: "shipping",
    }),
    defineField({
      name: "returnPolicies",
      title: "Returns — Policies",
      type: "array",
      of: [
        {
          type: "object",
          name: "returnItem",
          fields: [
            { name: "title", type: "string", validation: (r) => r.required() },
            { name: "content", type: "text", rows: 3, validation: (r) => r.required() },
          ],
          preview: { select: { title: "title" } },
        },
      ],
      group: "shipping",
    }),

    // ─── Sustainability Page ───
    defineField({
      name: "sustainabilitySections",
      title: "Sustainability — Sections",
      type: "array",
      of: [
        {
          type: "object",
          name: "sustainSection",
          fields: [
            { name: "title", type: "string", validation: (r) => r.required() },
            { name: "content", type: "text", rows: 3, validation: (r) => r.required() },
          ],
          preview: { select: { title: "title" } },
        },
      ],
      group: "sustainability",
    }),

    // ─── Careers Page ───
    defineField({
      name: "careersOpenings",
      title: "Careers — Job Openings",
      type: "array",
      of: [
        {
          type: "object",
          name: "jobOpening",
          fields: [
            { name: "title", type: "string", validation: (r) => r.required() },
            { name: "location", type: "string" },
            { name: "type", type: "string", description: "e.g. Full-time, Part-time, Contract" },
            { name: "description", type: "text", rows: 3 },
          ],
          preview: {
            select: { title: "title", subtitle: "location" },
          },
        },
      ],
      group: "careers",
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
