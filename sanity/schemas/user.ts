import React from "react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "user",
  title: "User",
  type: "document",
  fields: [
    defineField({ name: "email", type: "string", validation: (r) => r.required().email() }),
    defineField({ name: "name", type: "string" }),
    defineField({ name: "avatar", type: "url" }),
    defineField({ name: "googleId", type: "string" }),
    defineField({
      name: "createdAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "wishlist",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "orders",
      type: "array",
      of: [{ type: "reference", to: [{ type: "order" }] }],
    }),
  ],
  preview: {
    select: { name: "name", email: "email", avatar: "avatar" },
    prepare: ({ name, email, avatar }) => {
      const label = (name as string) || (email as string) || "";
      // Take the first letter of the first two words → "Bilal Gulzar" → "BG"
      const initials =
        label
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((w: string) => w[0]?.toUpperCase() || "")
          .join("") || "?";

      // Deterministic color from the label so each user gets their own swatch
      let hash = 0;
      for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) | 0;
      const hue = Math.abs(hash) % 360;
      const bg = `hsl(${hue}, 55%, 45%)`;

      const initialsBadge = React.createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: bg,
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.85em",
            letterSpacing: "0.05em",
          },
        },
        initials
      );

      const isValidUrl = avatar && /^https?:\/\//.test(avatar);

      return {
        title: name || email,
        subtitle: email,
        media: isValidUrl
          ? React.createElement("img", {
              src: avatar,
              alt: initials,
              referrerPolicy: "no-referrer",
              onError: (e: { currentTarget: HTMLImageElement }) => {
                // If the image 404s, hide it so the parent shows nothing —
                // Studio doesn't let us swap React nodes after the fact.
                e.currentTarget.style.display = "none";
              },
              style: { objectFit: "cover", width: "100%", height: "100%" },
            })
          : initialsBadge,
      };
    },
  },
});
