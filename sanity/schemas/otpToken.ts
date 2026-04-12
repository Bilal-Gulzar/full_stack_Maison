import { defineField, defineType } from "sanity";

/**
 * Server-only document type used to store hashed OTP codes.
 * Should never be queried from the browser. Only /api/auth/* writes/reads via SANITY_WRITE_TOKEN.
 */
export default defineType({
  name: "otpToken",
  title: "OTP Token",
  type: "document",
  fields: [
    defineField({ name: "email", type: "string", validation: (r) => r.required() }),
    defineField({ name: "codeHash", type: "string", validation: (r) => r.required() }),
    defineField({ name: "expiresAt", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "attempts", type: "number", initialValue: 0 }),
    defineField({
      name: "createdAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: { select: { title: "email", subtitle: "expiresAt" } },
});
