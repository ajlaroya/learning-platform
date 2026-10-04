import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { chunkTranscript } from "./chunk.mjs";
import { parseVideoUrl } from "./parse-video-url.mjs";
import { fetchYoutubeVideo } from "./providers/youtube.mjs";

const studioRoot = fileURLToPath(new URL("../../", import.meta.url));
const cacheDirectory = fileURLToPath(new URL("./.cache/", import.meta.url));
const sanityCliPath = fileURLToPath(
  new URL("../../node_modules/@sanity/cli/bin/run.js", import.meta.url),
);

loadLocalEnvironment();

function loadLocalEnvironment() {
  try {
    process.loadEnvFile(`${studioRoot}/.env.local`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function runSanity(args) {
  const result = spawnSync(process.execPath, [sanityCliPath, ...args], {
    cwd: studioRoot,
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      (result.stderr || result.stdout || "Sanity CLI failed").trim(),
    );
  }
  return result.stdout;
}

function parseOptions(args) {
  const options = { force: false, limit: Infinity };
  for (const argument of args) {
    if (argument === "--force") options.force = true;
    else if (argument.startsWith("--limit=")) {
      options.limit = Number(argument.slice("--limit=".length));
      if (!Number.isInteger(options.limit) || options.limit < 1) {
        throw new Error("--limit must be a positive integer");
      }
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  return options;
}

function getConfiguration() {
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
  const dataset = process.env.SANITY_STUDIO_DATASET;
  if (!projectId || !dataset) {
    throw new Error(
      "Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET in studio/.env.local or the environment",
    );
  }
  return { projectId, dataset };
}

function queryLessons({ projectId, dataset }) {
  const query = "*[_type == 'lesson' && defined(videoUrl)]{videoUrl, duration}";
  const output = runSanity([
    "documents",
    "query",
    query,
    "--project-id",
    projectId,
    "--dataset",
    dataset,
  ]);
  const parsed = JSON.parse(output);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.result)) return parsed.result;
  throw new Error("Sanity lesson query did not return a document array");
}

function buildVideoList(lessons, failures) {
  const videos = new Map();
  for (const lesson of lessons) {
    const parsed = parseVideoUrl(lesson.videoUrl);
    if (!parsed) {
      failures.push(
        `Invalid lesson video URL: ${lesson.videoUrl ?? "(missing)"}`,
      );
      continue;
    }
    const existing = videos.get(parsed.documentId);
    if (!existing || Number(lesson.duration) > existing.durationSeconds) {
      videos.set(parsed.documentId, {
        ...parsed,
        durationSeconds: Number(lesson.duration) || 0,
      });
    }
  }
  return [...videos.values()].sort((left, right) =>
    left.documentId.localeCompare(right.documentId),
  );
}

function cachePath(documentId) {
  return `${cacheDirectory}/${documentId.replace(/[^A-Za-z0-9._-]/g, "_")}.json`;
}

function readCache(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(`Could not read cache ${path}: ${error.message}`);
  }
}

function toDocument(video, ingested) {
  const chapters = ingested.chapters.map((chapter) => ({
    _key: `chapter-${chapter.startSeconds}`,
    _type: "videoChapter",
    startSeconds: chapter.startSeconds,
    label: chapter.label,
  }));
  const chunks = ingested.chunks.map((chunk, index) => ({
    _key: `chunk-${index}`,
    _type: "videoChunk",
    startSeconds: chunk.startSeconds,
    text: chunk.text,
  }));

  return {
    _id: video.documentId,
    _type: "video",
    videoId: video.videoId,
    url: video.url,
    provider: video.provider,
    chapters,
    chunks,
    ingestedAt: new Date().toISOString(),
  };
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const config = getConfiguration();
  const failures = [];
  const videos = buildVideoList(queryLessons(config), failures);
  const unsupported = videos.filter((video) => video.provider !== "youtube");
  for (const video of unsupported) {
    console.log(
      `SKIP ${video.documentId}: ${video.provider} caption ingestion is not configured`,
    );
  }

  const supported = videos
    .filter((video) => video.provider === "youtube")
    .slice(0, options.limit);
  mkdirSync(cacheDirectory, { recursive: true });

  for (let index = 0; index < supported.length; index += 1) {
    const video = supported[index];
    const path = cachePath(video.documentId);
    try {
      const cached = options.force ? null : readCache(path);
      if (cached) {
        console.log(
          `CACHED ${video.documentId}: ${cached.chapters.length} chapters, ${cached.chunks.length} chunks`,
        );
      } else {
        const source = await fetchYoutubeVideo(
          video.videoId,
          video.durationSeconds,
        );
        const chapters = source.chapters
          .filter(
            (chapter) =>
              chapter.startSeconds <=
              (source.durationSeconds || video.durationSeconds || Infinity),
          )
          .map((chapter) => ({
            startSeconds: chapter.startSeconds,
            label: chapter.label.trim(),
          }));
        const chunks = chunkTranscript(source.cues);
        if (!chunks.length)
          throw new Error(
            "Caption response contained no usable transcript cues",
          );
        const document = toDocument(video, { chapters, chunks });
        writeFileSync(path, `${JSON.stringify(document, null, 2)}\n`, "utf8");
        console.log(
          `SAVED ${video.documentId}: ${chapters.length} chapters, ${chunks.length} chunks`,
        );
      }
    } catch (error) {
      failures.push(`${video.documentId}: ${error.message}`);
      console.error(`FAIL ${video.documentId}: ${error.message}`);
    }

    if (index < supported.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  console.log(
    `Processed ${supported.length} YouTube videos; skipped ${unsupported.length} unsupported videos.`,
  );
  if (failures.length) {
    console.error(
      `Failures (${failures.length}):\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
