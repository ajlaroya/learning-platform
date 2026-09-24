import { SeverityNumber } from "@opentelemetry/api-logs";
import { loggerProvider, posthogLogger } from "@/instrumentation";
import { client } from "./client";

type SanityFetchOptions<QueryParams extends Record<string, unknown>> = {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
};

export async function sanityFetch<
  QueryResult,
  QueryParams extends Record<string, unknown> = Record<string, never>,
>({
  query,
  params,
  tags = [],
  revalidate = tags.length > 0 ? false : 3600,
}: SanityFetchOptions<QueryParams>): Promise<QueryResult> {
  const startedAt = Date.now();

  try {
    const result = await client.fetch<QueryResult>(
      query,
      params ?? ({} as QueryParams),
      {
        next: { tags, revalidate },
      },
    );

    posthogLogger.emit({
      body: "Content fetch completed",
      severityNumber: SeverityNumber.INFO,
      severityText: "INFO",
      attributes: {
        event: "content_fetch_completed",
        status: "success",
        duration_ms: Date.now() - startedAt,
        tag_count: tags.length,
      },
    });
    await loggerProvider.forceFlush();

    return result;
  } catch (error) {
    posthogLogger.emit({
      body: "Content fetch failed",
      severityNumber: SeverityNumber.ERROR,
      severityText: "ERROR",
      attributes: {
        event: "content_fetch_completed",
        status: "failed",
        duration_ms: Date.now() - startedAt,
        tag_count: tags.length,
        error_type: error instanceof Error ? error.name : "unknown",
      },
    });
    await loggerProvider.forceFlush();
    throw error;
  }
}
