import { normalizeText } from "../chunk.mjs";

const YOUTUBE_ORIGIN = "https://www.youtube.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const ANDROID_CLIENT_VERSION = "20.10.38";
const ANDROID_USER_AGENT =
  "com.google.android.youtube/20.10.38 (Linux; U; Android 15; en_US; Pixel 9 Build/AP3A.241005.015)";

function extractAssignedJson(source, variableName) {
  const assignment = new RegExp(`(?:var\\s+)?${variableName}\\s*=`).exec(
    source,
  );
  if (!assignment) return null;

  let start = assignment.index + assignment[0].length;
  while (/\s/.test(source[start] ?? "")) start += 1;
  if (source[start] !== "{") return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(source.slice(start, index + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function collectChapterEntries(value, entries = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectChapterEntries(item, entries);
    return entries;
  }
  if (!value || typeof value !== "object") return entries;

  for (const [key, item] of Object.entries(value)) {
    if (
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      Number.isFinite(Number(item.timeRangeStartMillis))
    ) {
      const title = item.title;
      const label =
        typeof title === "string"
          ? title
          : (title?.simpleText ??
            title?.runs?.map((run) => run.text ?? "").join(""));
      const startSeconds = Math.floor(Number(item.timeRangeStartMillis) / 1000);
      const normalizedLabel = normalizeText(label);
      if (normalizedLabel)
        entries.push({ startSeconds, label: normalizedLabel });
    }
    collectChapterEntries(item, entries);
    if (key === "chapterRenderer" && item && typeof item === "object") {
      collectChapterEntries(item, entries);
    }
  }
  return entries;
}

export function parseChapters(initialData, durationSeconds = Infinity) {
  const byStart = new Map();
  for (const chapter of collectChapterEntries(initialData)) {
    if (
      chapter.startSeconds > durationSeconds ||
      byStart.has(chapter.startSeconds)
    )
      continue;
    byStart.set(chapter.startSeconds, chapter);
  }
  return [...byStart.values()].sort(
    (left, right) => left.startSeconds - right.startSeconds,
  );
}

function captionTracks(playerResponse) {
  return (
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks ??
    []
  );
}

function chooseCaptionTrack(tracks) {
  return (
    tracks.find((track) => /^en(?:-|$)/i.test(track.languageCode ?? "")) ??
    tracks[0]
  );
}

export function parseJson3Captions(payload) {
  return (payload?.events ?? [])
    .filter(
      (event) =>
        Number.isFinite(Number(event.tStartMs)) && Array.isArray(event.segs),
    )
    .map((event) => ({
      startSeconds: Number(event.tStartMs) / 1000,
      text: normalizeText(
        event.segs.map((segment) => segment.utf8 ?? "").join(""),
      ),
    }))
    .filter((cue) => cue.text);
}

export function parseXmlCaptions(source) {
  const cues = [];
  for (const match of source.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/gi)) {
    const start = /\bstart="([\d.]+)"/.exec(match[1])?.[1];
    if (start === undefined) continue;
    const text = match[2]
      .replace(/<[^>]*>/g, " ")
      .replace(/&#x([\da-f]+);/gi, (_, hex) =>
        String.fromCodePoint(Number.parseInt(hex, 16)),
      );
    const normalized = normalizeText(text);
    if (normalized)
      cues.push({ startSeconds: Number(start), text: normalized });
  }
  return cues;
}

function validateCaptionUrl(value) {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    !(hostname === "youtube.com" || hostname.endsWith(".youtube.com"))
  ) {
    throw new Error("YouTube returned a caption URL outside youtube.com");
  }
  return url;
}

async function fetchCaptionTrack(track) {
  if (!track?.baseUrl) return [];
  const captionUrl = validateCaptionUrl(track.baseUrl);
  captionUrl.searchParams.set("fmt", "json3");
  const response = await fetch(captionUrl, {
    headers: { "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    throw new Error(`YouTube captions returned HTTP ${response.status}`);
  const body = await response.text();
  if (!body.trim()) return [];

  try {
    const cues = parseJson3Captions(JSON.parse(body));
    if (cues.length) return cues;
  } catch {
    const cues = parseXmlCaptions(body);
    if (cues.length) return cues;
  }
  return parseXmlCaptions(body);
}

async function fetchPlayerResponse(videoId, apiKey) {
  if (!apiKey)
    throw new Error("YouTube watch configuration did not include an API key");
  const endpoint = new URL(`${YOUTUBE_ORIGIN}/youtubei/v1/player`);
  endpoint.searchParams.set("key", apiKey);
  endpoint.searchParams.set("prettyPrint", "false");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: YOUTUBE_ORIGIN,
      "user-agent": ANDROID_USER_AGENT,
      "x-youtube-client-name": "3",
      "x-youtube-client-version": ANDROID_CLIENT_VERSION,
    },
    body: JSON.stringify({
      videoId,
      context: {
        client: {
          clientName: "ANDROID",
          clientVersion: ANDROID_CLIENT_VERSION,
          androidSdkVersion: 35,
          deviceModel: "Pixel 9",
          hl: "en",
          gl: "US",
          osName: "Android",
          osVersion: "15",
        },
      },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    throw new Error(`YouTube player returned HTTP ${response.status}`);
  return response.json();
}

export async function fetchYoutubeVideo(videoId, fallbackDurationSeconds = 0) {
  if (!/^[A-Za-z0-9_-]+$/.test(videoId))
    throw new Error("Invalid YouTube video id");

  let watchHtml = "";
  let watchPlayer = null;
  let initialData = null;
  let apiKey;
  try {
    const response = await fetch(
      `${YOUTUBE_ORIGIN}/watch?v=${encodeURIComponent(videoId)}`,
      {
        headers: { "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(20_000),
      },
    );
    if (response.ok) {
      watchHtml = await response.text();
      watchPlayer = extractAssignedJson(watchHtml, "ytInitialPlayerResponse");
      initialData = extractAssignedJson(watchHtml, "ytInitialData");
      apiKey = /"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/.exec(watchHtml)?.[1];
    }
  } catch {
    watchHtml = "";
  }

  let player = watchPlayer;
  let cues = [];
  let captionError;
  const initialTrack = chooseCaptionTrack(captionTracks(player));
  if (initialTrack) {
    try {
      cues = await fetchCaptionTrack(initialTrack);
    } catch (error) {
      captionError = error;
    }
  }

  if (!cues.length) {
    try {
      const fallbackPlayer = await fetchPlayerResponse(videoId, apiKey);
      player ??= fallbackPlayer;
      const fallbackTrack = chooseCaptionTrack(captionTracks(fallbackPlayer));
      if (fallbackTrack) cues = await fetchCaptionTrack(fallbackTrack);
    } catch (error) {
      captionError ??= error;
    }
  }

  if (!cues.length) {
    const detail =
      captionError instanceof Error ? ` (${captionError.message})` : "";
    throw new Error(`No usable YouTube captions found for ${videoId}${detail}`);
  }

  const parsedDuration = Number(player?.videoDetails?.lengthSeconds);
  const durationSeconds =
    Number.isFinite(parsedDuration) && parsedDuration > 0
      ? parsedDuration
      : fallbackDurationSeconds;

  return {
    durationSeconds,
    chapters: parseChapters(initialData, durationSeconds || Infinity),
    cues,
  };
}
