import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schema } from "./schemaTypes";
import { structure } from "./structure";

const projectId = assertValue(
  process.env.SANITY_STUDIO_PROJECT_ID,
  "Missing SANITY_STUDIO_PROJECT_ID",
);
const dataset = assertValue(
  process.env.SANITY_STUDIO_DATASET,
  "Missing SANITY_STUDIO_DATASET",
);

export default defineConfig({
  name: "vertex-studio",
  title: "Vertex Studio",
  projectId,
  dataset,
  basePath: "/studio",
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: "2026-09-21" }),
  ],
});

function assertValue<T>(value: T | undefined, name: string): T {
  if (value === undefined)
    throw new Error(`Missing environment variable: ${name}`);
  return value;
}
