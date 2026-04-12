import { defineField, defineType } from "sanity";

/**
 * Per-email rate limit ledger for OTP requests.
 * Server-only doc — never exposed to the browser.
 *
 * Window: 24 hours rolling
 * Limit: 5 OTPs per window
 * Lockout: 4 hours after exceeding the limit
 */
export default defineType({
  name: "otpRateLimit",
  title: "OTP Rate Limit",
  type: "document",
  fields: [
    defineField({ name: "email", type: "string", validation: (r) => r.required() }),
    defineField({ name: "attempts", type: "number", initialValue: 0 }),
    defineField({ name: "windowStart", type: "datetime" }),
    defineField({ name: "lockedUntil", type: "datetime" }),
  ],
  preview: {
    select: { title: "email", subtitle: "attempts", description: "lockedUntil" },
    prepare: ({ title, subtitle, description }) => ({
      title,
      subtitle: `${subtitle ?? 0} attempt(s)${description ? ` · locked until ${new Date(description).toLocaleString()}` : ""}`,
    }),
  },
});
