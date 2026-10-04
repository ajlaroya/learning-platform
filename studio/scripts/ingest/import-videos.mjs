import { existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";

const studioRoot = fileURLToPath(new URL("../../", import.meta.url));
const sourcePath = fileURLToPath(new URL("./videos.ndjson", import.meta.url));
const sanityCliPath = fileURLToPath(
  new URL("../../node_modules/@sanity/cli/bin/run.js", import.meta.url),
);

try {
  process.loadEnvFile(`${studioRoot}/.env.local`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
if (!projectId || !dataset)
  throw new Error(
    "Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET first",
  );
if (!process.argv.includes(`--confirm-dataset=${dataset}`)) {
  throw new Error(
    `Refusing import. Re-run with --confirm-dataset=${dataset} to target this configured dataset.`,
  );
}
if (!existsSync(sourcePath) || statSync(sourcePath).size === 0) {
  throw new Error(
    "Generated NDJSON is missing or empty; run npm run ingest:build first",
  );
}

const result = spawnSync(
  process.execPath,
  [
    sanityCliPath,
    "datasets",
    "import",
    sourcePath,
    "--dataset",
    dataset,
    "--project-id",
    projectId,
    "--replace",
  ],
  {
    cwd: studioRoot,
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
