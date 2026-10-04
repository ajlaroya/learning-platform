import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildNdjson } from "./build-ndjson.mjs";
import { chunkTranscript, normalizeText } from "./chunk.mjs";
import { parseVideoUrl } from "./parse-video-url.mjs";
import {
  parseChapters,
  parseJson3Captions,
  parseXmlCaptions,
} from "./providers/youtube.mjs";
import { validateVideoDocument } from "./validate-video-document.mjs";

test("parses allowed video URLs and rejects unsafe or unsupported hosts", () => {
  assert.equal(
    parseVideoUrl("https://youtu.be/dQw4w9WgXcQ")?.documentId,
    "video.youtube-dQw4w9WgXcQ",
  );
  assert.equal(
    parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.provider,
    "youtube",
  );
  assert.equal(parseVideoUrl("https://vimeo.com/123456")?.provider, "vimeo");
  assert.equal(
    parseVideoUrl("https://iframe.mediadelivery.net/embed/123/abc")?.videoId,
    "123-abc",
  );
  assert.equal(parseVideoUrl("http://youtube.com/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(
    parseVideoUrl("https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ"),
    null,
  );
  assert.equal(
    parseVideoUrl("https://youtube.com@evil.test/watch?v=dQw4w9WgXcQ"),
    null,
  );
});

test("normalizes transcript entities and groups cues at boundaries", () => {
  assert.equal(normalizeText("  A&nbsp; &amp;  B &#x1F680; "), "A & B 🚀");

  const chunks = chunkTranscript([
    { startSeconds: 0.7, text: "First." },
    { startSeconds: 15, text: "Second." },
    { startSeconds: 46, text: "Third." },
  ]);

  assert.deepEqual(chunks, [
    { startSeconds: 0, text: "First. Second." },
    { startSeconds: 46, text: "Third." },
  ]);
});

test("splits chunks before exceeding the character bound", () => {
  const chunks = chunkTranscript([
    { startSeconds: 0, text: "a".repeat(200) },
    { startSeconds: 1, text: "b".repeat(200) },
  ]);
  assert.equal(chunks.length, 2);
});

test("parses JSON3 and XML caption cues", () => {
  assert.deepEqual(
    parseJson3Captions({
      events: [
        { tStartMs: 1250, segs: [{ utf8: "Hello " }, { utf8: "world" }] },
      ],
    }),
    [{ startSeconds: 1.25, text: "Hello world" }],
  );
  assert.deepEqual(
    parseXmlCaptions(
      '<transcript><text start="2.5">A &amp; B</text></transcript>',
    ),
    [{ startSeconds: 2.5, text: "A & B" }],
  );
});

test("deduplicates and sorts YouTube chapter renderers", () => {
  const chapters = parseChapters(
    {
      first: {
        chapterRenderer: {
          timeRangeStartMillis: 120000,
          title: { simpleText: "Later" },
        },
      },
      duplicate: {
        macroMarkersListItemRenderer: {
          timeRangeStartMillis: 120000,
          title: { simpleText: "Later copy" },
        },
      },
      start: {
        chapterRenderer: {
          timeRangeStartMillis: 0,
          title: { simpleText: " Intro " },
        },
      },
    },
    180,
  );

  assert.deepEqual(chapters, [
    { startSeconds: 0, label: "Intro" },
    { startSeconds: 120, label: "Later" },
  ]);
});

test("validates the complete cache document and rejects invalid ordering or identity", () => {
  const document = {
    _id: "video.youtube-dQw4w9WgXcQ",
    _type: "video",
    videoId: "dQw4w9WgXcQ",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    provider: "youtube",
    chapters: [
      {
        _key: "chapter-0",
        _type: "videoChapter",
        startSeconds: 0,
        label: "Intro",
      },
      {
        _key: "chapter-30",
        _type: "videoChapter",
        startSeconds: 30,
        label: "Topic",
      },
    ],
    chunks: [
      {
        _key: "chunk-0",
        _type: "videoChunk",
        startSeconds: 0,
        text: "First cue.",
      },
      {
        _key: "chunk-1",
        _type: "videoChunk",
        startSeconds: 30,
        text: "Second cue.",
      },
    ],
    ingestedAt: "2026-09-30T00:00:00.000Z",
  };

  assert.equal(validateVideoDocument(document), true);
  assert.throws(
    () =>
      validateVideoDocument({
        ...document,
        chapters: [...document.chapters].reverse(),
      }),
    /chapters must be sorted/,
  );
  assert.throws(
    () => validateVideoDocument({ ...document, videoId: "other" }),
    /videoId does not match url/,
  );
});

test("builds byte-identical NDJSON from the same cache", () => {
  const root = mkdtempSync(join(tmpdir(), "vertex-ingest-test-"));
  const cacheDirectory = join(root, "cache");
  const outputPath = join(root, "videos.ndjson");
  mkdirSync(cacheDirectory);
  const document = {
    _id: "video.youtube-dQw4w9WgXcQ",
    _type: "video",
    videoId: "dQw4w9WgXcQ",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    provider: "youtube",
    chapters: [],
    chunks: [
      {
        _key: "chunk-0",
        _type: "videoChunk",
        startSeconds: 0,
        text: "A real transcript cue.",
      },
    ],
    ingestedAt: "2026-09-30T00:00:00.000Z",
  };

  try {
    writeFileSync(
      join(cacheDirectory, "video.youtube-dQw4w9WgXcQ.json"),
      JSON.stringify(document),
    );
    buildNdjson({ cacheDirectory, outputPath });
    const firstBuild = readFileSync(outputPath, "utf8");
    buildNdjson({ cacheDirectory, outputPath });
    assert.equal(readFileSync(outputPath, "utf8"), firstBuild);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
