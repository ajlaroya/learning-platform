import { parseVideoUrl } from "./parse-video-url.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateVideoDocument(document, sourceName = "document") {
  assert(
    document && typeof document === "object",
    `${sourceName}: expected a JSON object`,
  );
  assert(
    /^video\.[A-Za-z0-9._-]{1,120}$/.test(document._id),
    `${sourceName}: invalid Sanity document id`,
  );
  assert(document._type === "video", `${sourceName}: _type must be video`);
  assert(
    typeof document.videoId === "string" && document.videoId.trim(),
    `${sourceName}: videoId is required`,
  );
  assert(
    ["youtube", "vimeo", "bunny"].includes(document.provider),
    `${sourceName}: unsupported provider`,
  );
  assert(typeof document.url === "string", `${sourceName}: url is required`);
  const parsedUrl = parseVideoUrl(document.url);
  assert(parsedUrl, `${sourceName}: url is not a supported HTTPS video URL`);
  assert(
    parsedUrl.documentId === document._id,
    `${sourceName}: id does not match url`,
  );
  assert(
    parsedUrl.provider === document.provider,
    `${sourceName}: provider does not match url`,
  );
  assert(
    parsedUrl.videoId === document.videoId,
    `${sourceName}: videoId does not match url`,
  );
  assert(
    Array.isArray(document.chapters),
    `${sourceName}: chapters must be an array`,
  );
  assert(
    Array.isArray(document.chunks) && document.chunks.length > 0,
    `${sourceName}: at least one chunk is required`,
  );
  assert(
    !Number.isNaN(Date.parse(document.ingestedAt)),
    `${sourceName}: ingestedAt must be a datetime`,
  );

  let lastChapterStart = -1;
  for (const [index, chapter] of document.chapters.entries()) {
    assert(
      chapter._type === "videoChapter",
      `${sourceName}: chapter ${index} has wrong _type`,
    );
    assert(
      Number.isInteger(chapter.startSeconds) && chapter.startSeconds >= 0,
      `${sourceName}: chapter ${index} has invalid startSeconds`,
    );
    assert(
      chapter._key === `chapter-${chapter.startSeconds}`,
      `${sourceName}: chapter ${index} has unstable _key`,
    );
    assert(
      chapter.startSeconds > lastChapterStart,
      `${sourceName}: chapters must be sorted and unique`,
    );
    assert(
      typeof chapter.label === "string" &&
        chapter.label.trim() &&
        chapter.label === chapter.label.trim(),
      `${sourceName}: chapter ${index} must have a trimmed non-empty label`,
    );
    lastChapterStart = chapter.startSeconds;
  }

  let lastChunkStart = -1;
  for (const [index, chunk] of document.chunks.entries()) {
    assert(
      chunk._type === "videoChunk",
      `${sourceName}: chunk ${index} has wrong _type`,
    );
    assert(
      Number.isInteger(chunk.startSeconds) && chunk.startSeconds >= 0,
      `${sourceName}: chunk ${index} has invalid startSeconds`,
    );
    assert(
      chunk._key === `chunk-${index}`,
      `${sourceName}: chunk ${index} has unstable _key`,
    );
    assert(
      chunk.startSeconds >= lastChunkStart,
      `${sourceName}: chunks must have monotonic timestamps`,
    );
    assert(
      typeof chunk.text === "string" && chunk.text.trim(),
      `${sourceName}: chunk ${index} has empty text`,
    );
    lastChunkStart = chunk.startSeconds;
  }

  return true;
}
