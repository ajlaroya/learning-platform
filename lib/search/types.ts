import { z } from "zod";

export const MAX_QUERY_LENGTH = 200;
export const SORTS = ["relevance", "newest", "duration"] as const;

export const SearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(MAX_QUERY_LENGTH),
  sort: z.enum(SORTS).default("relevance"),
  distinctId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
});

export const ModelHitSchema = z
  .object({
    lessonId: z.string().min(1),
    kind: z.enum(["lesson", "video"]),
    rank: z.number().int().nonnegative(),
    startSeconds: z.number().int().nonnegative().nullable(),
    evidence: z.string().trim().min(1).max(240),
    evidenceType: z.enum(["chapter", "transcript"]).nullable(),
  })
  .superRefine((hit, context) => {
    if (hit.kind === "video" && hit.startSeconds === null) {
      context.addIssue({
        code: "custom",
        message: "Video hits require a timestamp",
        path: ["startSeconds"],
      });
    }
    if (hit.kind === "video" && !hit.evidence) {
      context.addIssue({
        code: "custom",
        message: "Video hits require matching source text",
        path: ["evidence"],
      });
    }
    if (hit.kind === "video" && hit.evidenceType === null) {
      context.addIssue({
        code: "custom",
        message: "Video hits require a source type",
        path: ["evidenceType"],
      });
    }
    if (hit.kind === "lesson" && hit.startSeconds !== null) {
      context.addIssue({
        code: "custom",
        message: "Lesson hits cannot include a timestamp",
        path: ["startSeconds"],
      });
    }
  });

const SearchResultBaseSchema = z.object({
  lessonId: z.string(),
  lessonTitle: z.string(),
  lessonSlug: z.string(),
  label: z.string(),
  moduleTitle: z.string(),
  courseId: z.string(),
  courseTitle: z.string(),
  courseSlug: z.string(),
  durationSeconds: z.number().nullable(),
  keyPoints: z.array(z.string()),
  thumbnailUrl: z.string().nullable(),
  courseIconUrl: z.string().nullable(),
  reason: z.string(),
  href: z.string(),
  rank: z.number().int().nonnegative(),
});

export const SearchResultSchema = z.discriminatedUnion("kind", [
  SearchResultBaseSchema.extend({ kind: z.literal("lesson") }),
  SearchResultBaseSchema.extend({
    kind: z.literal("video"),
    startSeconds: z.number().int().nonnegative(),
    momentLabel: z.string(),
  }),
]);

export const SearchResponseSchema = z.object({
  query: z.string(),
  sort: z.enum(SORTS),
  count: z.number().int().nonnegative(),
  courseCount: z.number().int().nonnegative(),
  results: z.array(SearchResultSchema),
});

export type SearchSort = (typeof SORTS)[number];
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type ModelHit = z.infer<typeof ModelHitSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
