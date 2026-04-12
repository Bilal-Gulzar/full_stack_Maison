import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

/**
 * Browser-side Sanity client. READ-ONLY. No token shipped to client.
 * Mutations must go through /api/* serverless functions.
 */
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID as string,
  dataset: (import.meta.env.VITE_SANITY_DATASET as string) || "production",
  apiVersion: (import.meta.env.VITE_SANITY_API_VERSION as string) || "2024-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: unknown) => builder.image(source as never);
