import { openai } from "@ai-sdk/openai";
import { Output, generateText, isStepCount } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSearchMcpClient, fetchInitialContext } from "@/lib/search/mcp";
import { SEARCH_SYSTEM_PROMPT } from "@/lib/search/system-prompt";
import {
  ModelHitSchema,
  SearchRequestSchema,
  SearchResponseSchema,
  type SearchRequest,
} from "@/lib/search/types";
import { groundHits } from "@/lib/search/ground";

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

  const missingVariable = [
    "OPENAI_API_KEY",
    "SANITY_CONTEXT_MCP_URL",
    "SANITY_API_READ_TOKEN",
  ].find((name) => !process.env[name]);
  if (missingVariable) {
    return NextResponse.json(
      { error: "Search is not configured on this server." },
      { status: 500 },
    );
  }

  const searchRequest: SearchRequest = parsed.data;
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
    return NextResponse.json(
      { error: "Search is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  } finally {
    await mcpClient?.close();
  }
}
