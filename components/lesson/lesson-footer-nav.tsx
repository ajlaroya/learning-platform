"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { analyticsEvents, captureEvent } from "@/components/analytics/events";
import { formatDuration } from "@/lib/format";
import { lessonHref } from "@/lib/routes";
import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;
type Course = NonNullable<Lesson["course"]>;
type CurriculumLesson = Course["modules"][number]["lessons"][number];

export function LessonFooterNav({
  currentLessonSlug,
  previous,
  next,
}: {
  currentLessonSlug: string;
  previous: CurriculumLesson | null;
  next: CurriculumLesson | null;
}) {
  if (!previous && !next) return null;

  return (
    <footer className="border-t border-canvas-line px-4 py-4 sm:px-6 lg:col-span-2 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {previous ? (
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href={lessonHref(previous.slug)}
              onClick={() =>
                captureEvent(analyticsEvents.lessonNavigated, {
                  from_lesson_slug: currentLessonSlug,
                  to_lesson_slug: previous.slug,
                  direction: "previous",
                })
              }
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-canvas-line px-3 text-xs font-medium text-neutral-900 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous
              Lesson
            </Link>
            <span className="min-w-0">
              <span className="block truncate text-xs text-neutral-500">
                {previous.title}
              </span>
              <span className="mt-1 block text-[11px] text-neutral-500">
                {formatDuration(previous.duration)}
              </span>
            </span>
          </div>
        ) : (
          <span />
        )}
        {next && (
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="min-w-0 text-right">
              <span className="block truncate text-xs text-neutral-500">
                {next.title}
              </span>
              <span className="mt-1 block text-[11px] text-neutral-500">
                {formatDuration(next.duration)}
              </span>
            </span>
            <Link
              href={lessonHref(next.slug)}
              onClick={() =>
                captureEvent(analyticsEvents.lessonNavigated, {
                  from_lesson_slug: currentLessonSlug,
                  to_lesson_slug: next.slug,
                  direction: "next",
                })
              }
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary-500 px-4 text-xs font-semibold text-white hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Next Lesson <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
}
