import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "../sanity/schemas";
import { structure } from "./structure";

export default defineConfig({
  name: "maison-studio",
  title: "Maison Studio",
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID as string,
  dataset: (import.meta.env.VITE_SANITY_DATASET as string) || "production",
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
