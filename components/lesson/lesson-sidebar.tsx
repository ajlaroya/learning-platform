"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Play } from "lucide-react";
import { analyticsEvents, captureEvent } from "@/components/analytics/events";
import { formatDuration, lessonLabel } from "@/lib/format";
import { courseHref, lessonHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;
type Course = NonNullable<Lesson["course"]>;

function CourseSummary({
  course,
  coverImageUrl,
}: {
  course: Course;
  coverImageUrl: string | null;
}) {
  return (
    <Link
      href={courseHref(course.slug)}
      className="flex items-center gap-3 border-b border-canvas-line px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-900 text-xl font-semibold text-white">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={course.coverImage.alt ?? ""}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          course.title.slice(0, 1)
        )}
      </div>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-neutral-900">
          {course.title}
        </span>
        <span className="mt-1 block text-xs text-neutral-500">Not started</span>
        <span
          aria-label="Course progress: 0 percent"
          className="mt-1.5 block h-0.5 w-14 overflow-hidden rounded-full bg-neutral-200"
        >
          <span className="block h-full w-0 bg-primary-500" />
        </span>
      </span>
    </Link>
  );
}

function Curriculum({
  course,
  activeLessonSlug,
  activeModuleIndex,
}: {
  course: Course;
  activeLessonSlug: string;
  activeModuleIndex: number;
}) {
  const [openModule, setOpenModule] = useState<number | null>(
    activeModuleIndex,
  );

  return (
    <div>
      <div className="flex items-center justify-between border-b border-canvas-line px-5 py-3 text-xs font-semibold text-neutral-900">
        <span>
          Module {activeModuleIndex + 1} of {course.modules.length}
        </span>
        <ChevronDown className="h-4 w-4 text-primary-500" aria-hidden="true" />
      </div>
      <ol className="divide-y divide-canvas-line">
        {course.modules.map((module, moduleIndex) => {
          const isOpen = openModule === moduleIndex;
          const moduleDuration =
            module.durationSeconds ??
            module.lessons.reduce((sum, item) => sum + item.duration, 0);

          return (
            <li key={module._key}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`lesson-module-${module._key}`}
                onClick={() => {
                  setOpenModule(isOpen ? null : moduleIndex);
                  captureEvent(analyticsEvents.courseModuleToggled, {
                    course_id: course._id,
                    course_slug: course.slug,
                    module_index: moduleIndex,
                    module_state: isOpen ? "collapsed" : "expanded",
                  });
                }}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500",
                  isOpen && "bg-primary-100/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-canvas-line text-xs text-neutral-700",
                    isOpen &&
                      "border-primary-500 bg-primary-500 font-semibold text-white",
                  )}
                  aria-hidden="true"
                >
                  {moduleIndex + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-neutral-900">
                    {module.title}
                  </span>
                  <span className="mt-1 block text-[11px] text-neutral-500">
                    {formatDuration(moduleDuration)}
                  </span>
                </span>
                {isOpen ? (
                  <ChevronUp
                    className="h-4 w-4 shrink-0 text-primary-500"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-neutral-500"
                    aria-hidden="true"
                  />
                )}
              </button>
              {isOpen && (
                <ol
                  id={`lesson-module-${module._key}`}
                  className="relative border-t border-canvas-line bg-white/40 py-1 pl-7 pr-3 before:absolute before:bottom-4 before:left-5 before:top-4 before:w-px before:bg-canvas-line"
                >
                  {module.lessons.map((item, lessonIndex) => {
                    const isCurrent = item.slug === activeLessonSlug;
                    return (
                      <li key={item._id} className="relative">
                        <Link
                          href={lessonHref(item.slug)}
                          aria-current={isCurrent ? "page" : undefined}
                          className={cn(
                            "relative flex min-h-12 items-center gap-3 py-2 pl-3 pr-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                            isCurrent && "text-primary-600",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute -left-2.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-neutral-300 bg-canvas",
                              isCurrent && "border-primary-500 bg-primary-500",
                            )}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-neutral-900">
                              {item.title}
                            </span>
                            {isCurrent ? (
                              <span className="mt-0.5 block text-primary-600">
                                Now playing
                              </span>
                            ) : (
                              <span className="mt-0.5 block text-neutral-500">
                                {formatDuration(item.duration)}
                              </span>
                            )}
                          </span>
                          {isCurrent ? (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                              <Play
                                className="h-3.5 w-3.5 fill-current"
                                aria-hidden="true"
                              />
                            </span>
                          ) : (
                            <span className="sr-only">
                              Lesson {lessonLabel(moduleIndex, lessonIndex)}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function LessonSidebar({
  course,
  coverImageUrl,
  activeLessonSlug,
  activeModuleIndex,
}: {
  course: Course;
  coverImageUrl: string | null;
  activeLessonSlug: string;
  activeModuleIndex: number;
}) {
  return (
    <aside className="lg:row-span-2 lg:border-r lg:border-canvas-line">
      <div className="hidden lg:block">
        <Link
          href={courseHref(course.slug)}
          className="flex items-center gap-2 px-5 py-5 text-xs text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to course
        </Link>
        <CourseSummary course={course} coverImageUrl={coverImageUrl} />
        <Curriculum
          course={course}
          activeLessonSlug={activeLessonSlug}
          activeModuleIndex={activeModuleIndex}
        />
      </div>
      <details className="border-b border-canvas-line lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm font-semibold text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          Course content
          <ChevronDown
            className="h-4 w-4 text-primary-500"
            aria-hidden="true"
          />
        </summary>
        <Link
          href={courseHref(course.slug)}
          className="flex items-center gap-2 px-5 py-3 text-xs text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to course
        </Link>
        <CourseSummary course={course} coverImageUrl={coverImageUrl} />
        <Curriculum
          course={course}
          activeLessonSlug={activeLessonSlug}
          activeModuleIndex={activeModuleIndex}
        />
      </details>
    </aside>
  );
}
