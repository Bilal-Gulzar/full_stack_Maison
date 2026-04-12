import { createClient } from "@sanity/client";

/**
 * Server-only Sanity client with write token. NEVER import from src/.
 */
export const sanityServer = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});
