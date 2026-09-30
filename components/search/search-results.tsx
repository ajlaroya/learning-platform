"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Play,
  SearchX,
} from "lucide-react";
import { analyticsEvents, captureEvent } from "@/components/analytics/events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/lib/format";
import { SearchResponseSchema, SORTS } from "@/lib/search/types";
import type {
  SearchResponse,
  SearchResult,
  SearchSort,
} from "@/lib/search/types";

const sortLabels: Record<SearchSort, string> = {
  relevance: "Most relevant",
  newest: "Newest",
  duration: "Shortest first",
};

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; response: SearchResponse };

function CourseMark({ result }: { result: SearchResult }) {
  if (!result.courseIconUrl) {
    return (
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-sm font-semibold text-white"
      >
        {result.courseTitle.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-md bg-neutral-100">
      <Image
        src={result.courseIconUrl}
        alt=""
        fill
        sizes="32px"
        className="object-cover"
      />
    </span>
  );
}

function CourseHeading({ result }: { result: SearchResult }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <CourseMark result={result} />
      <span className="truncate text-sm font-medium text-neutral-600">
        {result.courseTitle}
      </span>
    </div>
  );
}

function VideoResultCard({
  result,
}: {
  result: Extract<SearchResult, { kind: "video" }>;
}) {
  return (
    <Link
      href={result.href}
      className="block overflow-hidden rounded-xl border border-canvas-line bg-white transition-colors hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <article className="grid md:grid-cols-[276px_minmax(0,1fr)]">
        <div className="relative aspect-video bg-neutral-900 md:aspect-auto md:min-h-52">
          {result.thumbnailUrl ? (
            <Image
              src={result.thumbnailUrl}
              alt={result.lessonTitle}
              fill
              sizes="(max-width: 768px) 100vw, 276px"
              className="object-cover"
            />
          ) : null}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-primary-500 shadow-sm">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
          </span>
          {result.durationSeconds !== null && (
            <span className="absolute bottom-3 right-3 rounded-md bg-neutral-950/85 px-2 py-1 text-xs font-medium tabular-nums text-white">
              {formatTimestamp(result.durationSeconds)}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <CourseHeading result={result} />
            <Badge variant="video">Video</Badge>
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-neutral-900">
            {result.lessonTitle}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
            {result.reason}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 text-sm">
            <span className="text-neutral-500">
              Lesson {result.label} in {result.moduleTitle}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary-500">
              Watch from {formatTimestamp(result.startSeconds)}
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function LessonResultCard({
  result,
}: {
  result: Extract<SearchResult, { kind: "lesson" }>;
}) {
  return (
    <Link
      href={result.href}
      className="block overflow-hidden rounded-xl border border-canvas-line bg-white transition-colors hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <article className="grid md:grid-cols-[276px_minmax(0,1fr)]">
        <div className="flex min-h-52 flex-col bg-primary-50/70 p-5 sm:p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-600">
            Key points
          </h3>
          {result.keyPoints.length > 0 ? (
            <ul className="mt-3 space-y-2.5">
              {result.keyPoints.slice(0, 3).map((point, index) => (
                <li
                  key={`${index}-${point}`}
                  className="flex gap-2 text-sm leading-5 text-neutral-700"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-5 text-neutral-600">
              {result.reason}
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <CourseHeading result={result} />
            <Badge variant="lesson">Lesson</Badge>
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-neutral-900">
            {result.lessonTitle}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
            {result.reason}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 text-sm">
            <span className="text-neutral-500">
              Lesson {result.label} in {result.moduleTitle}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary-500">
              View lesson
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SearchSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-label="Loading search results"
      aria-busy="true"
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="grid animate-pulse overflow-hidden rounded-xl border border-canvas-line bg-white md:grid-cols-[276px_minmax(0,1fr)]"
        >
          <div className="aspect-video bg-neutral-100 md:aspect-auto md:min-h-52" />
          <div className="space-y-4 p-5 sm:p-6">
            <div className="h-8 w-40 rounded bg-neutral-100" />
            <div className="h-6 w-3/4 rounded bg-neutral-100" />
            <div className="h-4 w-full rounded bg-neutral-100" />
            <div className="h-4 w-2/3 rounded bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchEmptyState() {
  return (
    <div className="flex flex-col items-start gap-5 rounded-xl border border-primary-200 bg-primary-50/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary-500">
          <SearchX className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            No matches yet
          </h2>
          <p className="mt-1 text-sm leading-6 text-neutral-600">
            Try a different phrase, or browse the full course catalog.
          </p>
        </div>
      </div>
      <Link
        href="/courses"
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary-500 px-4 text-sm font-semibold text-white hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        Browse all courses
      </Link>
    </div>
  );
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q")?.trim() ?? "";
  const requestedSort = searchParams.get("sort");
  const sort: SearchSort = SORTS.includes(requestedSort as SearchSort)
    ? (requestedSort as SearchSort)
    : "relevance";
  const [retryKey, setRetryKey] = useState(0);
  const requestKey = `${query}\u0000${sort}\u0000${retryKey}`;
  const [requestState, setRequestState] = useState<{
    key: string;
    state: LoadState;
  }>({ key: "", state: { status: "idle" } });

  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();

    async function loadResults() {
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, sort }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search request failed");

        const parsed = SearchResponseSchema.safeParse(await response.json());
        if (!parsed.success) throw new Error("Invalid search response");

        captureEvent(analyticsEvents.searchPerformed, {
          query,
          result_count: parsed.data.count,
          course_count: parsed.data.courseCount,
          sort,
        });
        setRequestState({
          key: requestKey,
          state: { status: "success", response: parsed.data },
        });
      } catch {
        if (!controller.signal.aborted) {
          setRequestState({ key: requestKey, state: { status: "error" } });
        }
      }
    }

    void loadResults();
    return () => controller.abort();
  }, [query, requestKey, sort]);

  if (!query) return null;
  const state =
    requestState.key === requestKey
      ? requestState.state
      : ({ status: "loading" } as const);
  if (state.status === "loading" || state.status === "idle")
    return <SearchSkeleton />;
  if (state.status === "error") {
    return (
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <CircleAlert className="h-4 w-4 text-primary-500" />
          Search is temporarily unavailable. Please try again.
        </p>
        <Button
          variant="secondary"
          size="md"
          onClick={() => setRetryKey((key) => key + 1)}
        >
          Retry
        </Button>
      </div>
    );
  }

  const { response } = state;
  const queryParams = new URLSearchParams(searchParams.toString());

  function changeSort(nextSort: SearchSort) {
    queryParams.set("q", query);
    if (nextSort === "relevance") queryParams.delete("sort");
    else queryParams.set("sort", nextSort);
    router.replace(`/search?${queryParams.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-canvas-line pb-4">
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {response.count} {response.count === 1 ? "result" : "results"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Found across {response.courseCount}{" "}
            {response.courseCount === 1 ? "course" : "courses"}
          </p>
        </div>
        <label className="relative block w-48">
          <span className="sr-only">Sort search results</span>
          <select
            value={sort}
            onChange={(event) => changeSort(event.target.value as SearchSort)}
            className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {SORTS.map((value) => (
              <option key={value} value={value}>
                {sortLabels[value]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        </label>
      </div>

      {response.results.length === 0 ? (
        <SearchEmptyState />
      ) : (
        <div className="space-y-4">
          {response.results.map((result) =>
            result.kind === "video" ? (
              <VideoResultCard
                key={`${result.lessonId}-video-${result.startSeconds}`}
                result={result}
              />
            ) : (
              <LessonResultCard
                key={`${result.lessonId}-lesson`}
                result={result}
              />
            ),
          )}
          <SearchEmptyState />
        </div>
      )}
    </div>
  );
}

export function SearchResultsFallback() {
  return <SearchSkeleton />;
}
