import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const dataset = process.env.SANITY_STUDIO_DATASET;
if (!dataset) {
  console.error(
    "Set SANITY_STUDIO_DATASET before importing the Context document.",
  );
  process.exit(1);
}

const executable = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(
  executable,
  [
    "sanity",
    "datasets",
    "import",
    "scripts/context/vertex-search.ndjson",
    "--dataset",
    dataset,
    "--replace",
    "--allow-system-documents",
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);

process.exit(result.status ?? 1);
