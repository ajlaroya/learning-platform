import { readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import { validateVideoDocument } from "./validate-video-document.mjs";

const cacheDirectory = fileURLToPath(new URL("./.cache/", import.meta.url));
const outputPath = fileURLToPath(new URL("./videos.ndjson", import.meta.url));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function buildNdjson({
  cacheDirectory: sourceDirectory = cacheDirectory,
  outputPath: targetPath = outputPath,
} = {}) {
  let entries;
  try {
    entries = readdirSync(sourceDirectory)
      .filter((name) => name.endsWith(".json"))
      .sort();
  } catch (error) {
    if (error.code === "ENOENT")
      throw new Error(
        "No ingestion cache found; run npm run ingest:videos first",
      );
    throw error;
  }
  assert(
    entries.length > 0,
    "No cached video documents found; run npm run ingest:videos first",
  );

  const documents = entries
    .map((name) => {
      const document = JSON.parse(
        readFileSync(`${sourceDirectory}/${name}`, "utf8"),
      );
      validateVideoDocument(document, name);
      return document;
    })
    .sort((left, right) => left._id.localeCompare(right._id));

  const seenIds = new Set();
  for (const document of documents) {
    assert(
      !seenIds.has(document._id),
      `Duplicate document id: ${document._id}`,
    );
    seenIds.add(document._id);
  }

  const temporaryPath = `${targetPath}.tmp`;
  writeFileSync(
    temporaryPath,
    `${documents.map((document) => JSON.stringify(document)).join("\n")}\n`,
    "utf8",
  );
  renameSync(temporaryPath, targetPath);
  return { count: documents.length, outputPath: targetPath };
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  try {
    const { count, outputPath: targetPath } = buildNdjson();
    console.log(`Wrote ${count} validated video documents to ${targetPath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
