import { openai } from "@ai-sdk/openai";
import { Output, generateText, isStepCount } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { analyticsEvents } from "@/lib/analytics/events";
import { captureServerEvent } from "@/lib/posthog-server";
import { createSearchMcpClient, fetchInitialContext } from "@/lib/search/mcp";
import { SEARCH_SYSTEM_PROMPT } from "@/lib/search/system-prompt";
import {
  ModelHitSchema,
  SearchRequestSchema,
  SearchResponseSchema,
  type ModelHit,
  type SearchResponse,
  type SearchRequest,
} from "@/lib/search/types";
import { groundHits } from "@/lib/search/ground";
import { client } from "@/sanity/lib/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SearchAgentOutputSchema = z.object({
  hits: z.array(ModelHitSchema),
});

function badRequest() {
  return NextResponse.json(
    { error: "Enter a search query to continue." },
    { status: 400 },
  );
}

function queryTokenCount(query: string) {
  return query.match(/[a-z0-9]+/gi)?.length ?? 0;
}

async function captureSearchPerformed({
  searchRequest,
  response,
  distinctId,
  sessionId,
  signedIn,
  durationMs,
  searchMode,
}: {
  searchRequest: SearchRequest;
  response: SearchResponse;
  distinctId: string | null;
  sessionId?: string;
  signedIn: boolean;
  durationMs: number;
  searchMode: "ai" | "fallback";
}) {
  await captureServerEvent({
    event: analyticsEvents.searchPerformed,
    distinctId,
    sessionId,
    properties: {
      query_length: searchRequest.query.length,
      query_token_count: queryTokenCount(searchRequest.query),
      sort: searchRequest.sort,
      result_count: response.count,
      lesson_result_count: response.results.filter(
        (result) => result.kind === "lesson",
      ).length,
      video_result_count: response.results.filter(
        (result) => result.kind === "video",
      ).length,
      course_count: response.courseCount,
      zero_results: response.count === 0,
      duration_ms: durationMs,
      signed_in: signedIn,
      search_mode: searchMode,
    },
  });
}

async function captureSearchFailed({
  searchRequest,
  distinctId,
  sessionId,
  durationMs,
  signedIn,
  reason,
}: {
  searchRequest: SearchRequest;
  distinctId: string | null;
  sessionId?: string;
  durationMs: number;
  signedIn: boolean;
  reason: "unconfigured" | "upstream";
}) {
  await captureServerEvent({
    event: analyticsEvents.searchFailed,
    distinctId,
    sessionId,
    properties: {
      query_length: searchRequest.query.length,
      sort: searchRequest.sort,
      reason,
      duration_ms: durationMs,
      signed_in: signedIn,
    },
  });
}

async function fallbackSearchResponse(searchRequest: SearchRequest) {
  const terms = [
    ...new Set(
      (searchRequest.query.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
        (term) => term.length > 1,
      ),
    ),
  ];

  if (terms.length === 0) {
    return SearchResponseSchema.parse({
      query: searchRequest.query,
      sort: searchRequest.sort,
      count: 0,
      courseCount: 0,
      results: [],
    });
  }

  const fallbackLessons = await client.fetch<
    Array<{
      _id: string;
      _createdAt: string;
      title: string;
      keyPoints: string[] | null;
      notesText: string | null;
      course: {
        _id: string;
        title: string;
        slug: string;
        summary: string;
      } | null;
    }>
  >(/* groq */ `
    *[_type == "lesson"] {
      _id,
      _createdAt,
      title,
      keyPoints,
      "notesText": pt::text(notes),
      "course": *[_type == "course" && references(^._id)][0]{
        _id,
        title,
        "slug": slug.current,
        summary
      }
    }
  `);

  const rankedFallbackHits = fallbackLessons.reduce<ModelHit[]>(
    (acc, lesson) => {
      const haystack = [
        lesson.title,
        lesson.notesText ?? "",
        lesson.keyPoints?.join(" ") ?? "",
        lesson.course?.title ?? "",
        lesson.course?.summary ?? "",
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      let evidence = lesson.title;

      for (const term of terms) {
        if (!haystack.includes(term)) continue;
        score += 5;

        if (lesson.title.toLowerCase().includes(term)) {
          score += 10;
          evidence = lesson.title;
        } else if (lesson.notesText?.toLowerCase().includes(term)) {
          score += 4;
          evidence = lesson.notesText;
        } else if (
          (lesson.keyPoints ?? []).some((point) =>
            point.toLowerCase().includes(term),
          )
        ) {
          score += 3;
          evidence =
            lesson.keyPoints?.find((point) =>
              point.toLowerCase().includes(term),
            ) ?? lesson.title;
        } else if (lesson.course?.title.toLowerCase().includes(term)) {
          score += 2;
          evidence = lesson.course.title;
        }
      }

      if (score > 0) {
        acc.push({
          lessonId: lesson._id,
          kind: "lesson",
          rank: score,
          startSeconds: null,
          evidence,
          evidenceType: null,
        });
      }

      return acc;
    },
    [],
  );

  const fallbackHits = rankedFallbackHits
    .sort((left, right) => right.rank - left.rank)
    .map((hit, index) => ({ ...hit, rank: index + 1 }));

  const results = await groundHits(
    fallbackHits,
    searchRequest.query,
    searchRequest.sort,
  );

  return SearchResponseSchema.parse({
    query: searchRequest.query,
    sort: searchRequest.sort,
    count: results.length,
    courseCount: new Set(results.map((result) => result.courseId)).size,
    results,
  });
}

function getProviderDiagnostic(error: unknown) {
  if (!error || typeof error !== "object" || !("responseBody" in error))
    return {};
  if (typeof error.responseBody !== "string") return {};

  try {
    const response = JSON.parse(error.responseBody) as {
      error?: { code?: unknown; type?: unknown; message?: unknown };
    };
    const details = response.error;
    const message =
      typeof details?.message === "string"
        ? details.message
            .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]")
            .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
            .slice(0, 300)
        : undefined;

    return {
      providerCode:
        typeof details?.code === "string"
          ? details.code
          : typeof details?.type === "string"
            ? details.type
            : undefined,
      providerMessage: message,
    };
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest();
  }

  const parsed = SearchRequestSchema.safeParse(body);
  if (!parsed.success) return badRequest();

  const searchRequest: SearchRequest = parsed.data;
  const startedAt = Date.now();
  const { userId } = await auth();
  const distinctId = userId ?? searchRequest.distinctId ?? null;
  const sessionId = searchRequest.sessionId;
  const signedIn = userId !== null;

  if (!process.env.OPENAI_API_KEY || !process.env.SANITY_CONTEXT_MCP_URL) {
    try {
      const response = await fallbackSearchResponse(searchRequest);
      await captureSearchPerformed({
        searchRequest,
        response,
        distinctId,
        sessionId,
        signedIn,
        durationMs: Date.now() - startedAt,
        searchMode: "fallback",
      });
      return NextResponse.json(response);
    } catch {
      await captureSearchFailed({
        searchRequest,
        distinctId,
        sessionId,
        signedIn,
        durationMs: Date.now() - startedAt,
        reason: "upstream",
      });
      return NextResponse.json(
        { error: "Search is temporarily unavailable. Please try again." },
        { status: 502 },
      );
    }
  }

  let mcpClient: Awaited<ReturnType<typeof createSearchMcpClient>> | undefined;

  try {
    mcpClient = await createSearchMcpClient();
    const [initialContext, availableTools] = await Promise.all([
      fetchInitialContext(),
      mcpClient.tools(),
    ]);
    delete availableTools.initial_context;

    const { output } = await generateText({
      model: openai(process.env.OPENAI_SEARCH_MODEL || "gpt-4.1-mini"),
      system: `${SEARCH_SYSTEM_PROMPT}\n\nSanity Context schema and tool guidance:\n${initialContext}`,
      prompt: `Find every course or lesson result relevant to this learner query: ${searchRequest.query}`,
      tools: availableTools,
      stopWhen: isStepCount(8),
      output: Output.object({
        schema: SearchAgentOutputSchema,
        name: "vertex_search_hits",
        description: "Grounded lesson and video-moment search hits",
      }),
      maxRetries: 0,
      temperature: 0.1,
      maxOutputTokens: 6000,
    });

    const { hits } = SearchAgentOutputSchema.parse(output);
    const results = await groundHits(
      hits,
      searchRequest.query,
      searchRequest.sort,
    );
    const response = SearchResponseSchema.parse({
      query: searchRequest.query,
      sort: searchRequest.sort,
      count: results.length,
      courseCount: new Set(results.map((result) => result.courseId)).size,
      results,
    });

    await captureSearchPerformed({
      searchRequest,
      response,
      distinctId,
      sessionId,
      signedIn,
      durationMs: Date.now() - startedAt,
      searchMode: "ai",
    });

    return NextResponse.json(response);
  } catch (error) {
    const cause =
      error && typeof error === "object" && "lastError" in error
        ? error.lastError
        : error;
    const providerError =
      cause && typeof cause === "object"
        ? {
            statusCode:
              "statusCode" in cause && typeof cause.statusCode === "number"
                ? cause.statusCode
                : undefined,
            code:
              "code" in cause && typeof cause.code === "string"
                ? cause.code
                : undefined,
          }
        : {};

    console.error("Search request failed", {
      errorName: error instanceof Error ? error.name : "unknown",
      ...providerError,
      ...getProviderDiagnostic(cause),
    });

    try {
      const response = await fallbackSearchResponse(searchRequest);
      await captureSearchPerformed({
        searchRequest,
        response,
        distinctId,
        sessionId,
        signedIn,
        durationMs: Date.now() - startedAt,
        searchMode: "fallback",
      });
      return NextResponse.json(response);
    } catch {
      await captureSearchFailed({
        searchRequest,
        distinctId,
        sessionId,
        signedIn,
        durationMs: Date.now() - startedAt,
        reason: "upstream",
      });
      return NextResponse.json(
        { error: "Search is temporarily unavailable. Please try again." },
        { status: 502 },
      );
    }
  } finally {
    await mcpClient?.close();
  }
}
