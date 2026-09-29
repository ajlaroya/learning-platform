import "server-only";

import { client } from "@/sanity/lib/client";
import {
  LESSONS_BY_IDS_QUERY,
  VIDEO_CHAPTER_MATCHES_QUERY,
  VIDEO_CHUNK_MATCHES_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { formatTimestamp, lessonLabel } from "@/lib/format";
import { lessonHref } from "@/lib/routes";
import type { ModelHit, SearchResult, SearchSort } from "./types";

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "can",
  "for",
  "from",
  "how",
  "into",
  "that",
  "the",
  "their",
  "then",
  "this",
  "what",
  "when",
  "where",
  "which",
  "with",
]);

type LessonDocument = {
  _id: string;
  _createdAt: string;
  title: string;
  slug: string;
  videoUrl: string | null;
  duration: number | null;
  keyPoints: string[] | null;
  notesText: string | null;
  thumbnailRef: string | null;
  course: {
    _id: string;
    title: string;
    slug: string;
    summary: string;
    coverImageRef: string | null;
    modules: Array<{
      title: string;
      lessons: Array<{ _id: string } | null>;
    }>;
  } | null;
};

type VideoChapterMatch = {
  url: string;
  matchingChapters: Array<{ startSeconds: number; label: string }>;
};

type VideoChunkMatch = {
  url: string;
  matchingChunks: Array<{ startSeconds: number; text: string }>;
};

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function queryPatterns(query: string) {
  return [
    ...new Set(
      (query.toLocaleLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
        (term) => term.length > 1 && !STOP_WORDS.has(term),
      ),
    ),
  ].map((term) => `${term}*`);
}

function containsEvidence(source: string | null | undefined, evidence: string) {
  return source ? normalize(source).includes(normalize(evidence)) : false;
}

function getImageUrl(reference: string | null, width: number, height: number) {
  if (!reference) return null;
  return urlFor({ _type: "image", asset: { _ref: reference } })
    .width(width)
    .height(height)
    .fit("crop")
    .url();
}

function findPosition(document: LessonDocument) {
  const course = document.course;
  if (!course) return null;

  for (
    let moduleIndex = 0;
    moduleIndex < course.modules.length;
    moduleIndex += 1
  ) {
    const moduleData = course.modules[moduleIndex];
    const lessonIndex = moduleData.lessons.findIndex(
      (lesson) => lesson?._id === document._id,
    );
    if (lessonIndex >= 0) {
      return {
        moduleTitle: moduleData.title,
        label: lessonLabel(moduleIndex, lessonIndex),
      };
    }
  }

  return null;
}

export async function groundHits(
  hits: ModelHit[],
  query: string,
  sort: SearchSort,
) {
  const lessonIds = [...new Set(hits.map((hit) => hit.lessonId))];
  if (lessonIds.length === 0) return [] as SearchResult[];

  const documents = await client.fetch<LessonDocument[]>(LESSONS_BY_IDS_QUERY, {
    ids: lessonIds,
  });
  const documentsById = new Map(
    documents.map((document) => [document._id, document]),
  );
  const videoHits = hits.filter((hit) => hit.kind === "video");
  const videoUrls = [
    ...new Set(
      videoHits
        .map((hit) => documentsById.get(hit.lessonId)?.videoUrl)
        .filter((url): url is string => Boolean(url)),
    ),
  ];
  const patterns = queryPatterns(query);
  const chapterMatches =
    videoUrls.length > 0 && patterns.length > 0
      ? await client.fetch<VideoChapterMatch[]>(VIDEO_CHAPTER_MATCHES_QUERY, {
          urls: videoUrls,
          patterns,
        })
      : [];
  const chapterMatchesByUrl = new Map(
    chapterMatches.map((video) => [video.url, video.matchingChapters]),
  );
  const urlsWithoutChapterMatches = videoUrls.filter(
    (url) => (chapterMatchesByUrl.get(url)?.length ?? 0) === 0,
  );
  const chunkMatches =
    urlsWithoutChapterMatches.length > 0 && patterns.length > 0
      ? await client.fetch<VideoChunkMatch[]>(VIDEO_CHUNK_MATCHES_QUERY, {
          urls: urlsWithoutChapterMatches,
          patterns,
        })
      : [];
  const chunksByUrl = new Map(
    chunkMatches.map((video) => [video.url, video.matchingChunks]),
  );

  const grounded: Array<{ result: SearchResult; createdAt: string }> = [];

  for (const hit of hits) {
    const document = documentsById.get(hit.lessonId);
    if (!document?.course) continue;
    const position = findPosition(document);
    if (!position) continue;

    const keyPoints = (document.keyPoints ?? []).filter(Boolean);
    const course = document.course;
    let result: SearchResult;

    if (hit.kind === "lesson") {
      const supported =
        containsEvidence(document.title, hit.evidence) ||
        containsEvidence(document.notesText, hit.evidence) ||
        keyPoints.some((point) => containsEvidence(point, hit.evidence)) ||
        containsEvidence(course.title, hit.evidence) ||
        containsEvidence(course.summary, hit.evidence);
      if (!supported) continue;

      result = {
        kind: "lesson",
        lessonId: document._id,
        lessonTitle: document.title,
        lessonSlug: document.slug,
        label: position.label,
        moduleTitle: position.moduleTitle,
        courseId: course._id,
        courseTitle: course.title,
        courseSlug: course.slug,
        durationSeconds: document.duration,
        keyPoints,
        thumbnailUrl: getImageUrl(document.thumbnailRef, 560, 315),
        courseIconUrl: getImageUrl(course.coverImageRef, 96, 96),
        reason: hit.evidence,
        href: lessonHref(document.slug),
        rank: hit.rank,
      };
    } else {
      const videoUrl = document.videoUrl;
      if (!videoUrl || hit.startSeconds === null || !document.duration)
        continue;
      const matchingChapters = chapterMatchesByUrl.get(videoUrl) ?? [];
      const matchingChunks = chunksByUrl.get(videoUrl) ?? [];
      if (hit.startSeconds >= document.duration) continue;

      const chapter = matchingChapters.find(
        (item) =>
          item.startSeconds === hit.startSeconds &&
          normalize(item.label) === normalize(hit.evidence),
      );
      const chunk = matchingChunks.find(
        (item) =>
          item.startSeconds === hit.startSeconds &&
          containsEvidence(item.text, hit.evidence),
      );

      let momentLabel: string;
      if (hit.evidenceType === "chapter" && chapter) {
        momentLabel = chapter.label;
      } else if (
        hit.evidenceType === "transcript" &&
        matchingChapters.length === 0 &&
        chunk
      ) {
        momentLabel = formatTimestamp(hit.startSeconds);
      } else {
        continue;
      }

      result = {
        kind: "video",
        lessonId: document._id,
        lessonTitle: document.title,
        lessonSlug: document.slug,
        label: position.label,
        moduleTitle: position.moduleTitle,
        courseId: course._id,
        courseTitle: course.title,
        courseSlug: course.slug,
        durationSeconds: document.duration,
        keyPoints,
        thumbnailUrl: getImageUrl(document.thumbnailRef, 560, 315),
        courseIconUrl: getImageUrl(course.coverImageRef, 96, 96),
        reason:
          hit.evidenceType === "chapter"
            ? (chapter?.label ?? hit.evidence)
            : hit.evidence,
        href: lessonHref(document.slug, hit.startSeconds),
        rank: hit.rank,
        startSeconds: hit.startSeconds,
        momentLabel,
      };
    }

    grounded.push({ result, createdAt: document._createdAt });
  }

  if (sort === "newest") {
    grounded.sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  } else if (sort === "duration") {
    grounded.sort(
      (left, right) =>
        (left.result.durationSeconds ?? Number.MAX_SAFE_INTEGER) -
        (right.result.durationSeconds ?? Number.MAX_SAFE_INTEGER),
    );
  } else {
    grounded.sort((left, right) => left.result.rank - right.result.rank);
  }

  const seen = new Set<string>();
  return grounded
    .filter(({ result }) => {
      const key =
        result.kind === "video"
          ? `${result.lessonId}:video:${result.startSeconds}`
          : `${result.lessonId}:lesson`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ result }) => result);
}
