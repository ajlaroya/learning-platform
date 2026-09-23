"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDuration, lessonLabel } from "@/lib/format";
import { lessonHref } from "@/lib/routes";
import type { COURSE_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Course = NonNullable<COURSE_BY_SLUG_QUERY_RESULT>;

export function CourseContent({ course }: { course: Course }) {
  const [openModule, setOpenModule] = useState<number | null>(null);

  return (
    <section id="course-content" className="scroll-mt-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-neutral-900">
          Course Content
        </h2>
        <span className="text-xs text-neutral-500">
          {course.modules.length} modules <span aria-hidden="true">•</span>{" "}
          {formatDuration(
            course.modules.reduce(
              (total, module) =>
                total +
                module.lessons.reduce(
                  (sum, lesson) => sum + lesson.duration,
                  0,
                ),
              0,
            ),
          )}
        </span>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-canvas-line">
        {course.modules.map((module, moduleIndex) => {
          const isOpen = openModule === moduleIndex;
          const duration = module.lessons.reduce(
            (total, lesson) => total + lesson.duration,
            0,
          );
          return (
            <div
              key={module._key}
              className="border-b border-canvas-line last:border-b-0"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`module-${module._key}`}
                onClick={() => setOpenModule(isOpen ? null : moduleIndex)}
                className="flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 sm:px-6"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-canvas-line text-xs text-neutral-700"
                  aria-hidden="true"
                >
                  {moduleIndex + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-bold text-neutral-900">
                    {module.title}
                  </span>
                  {module.summary && (
                    <span className="mt-0.5 block truncate text-xs text-neutral-500">
                      {module.summary}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {formatDuration(duration)}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div
                  id={`module-${module._key}`}
                  className="border-t border-canvas-line bg-white/40 px-6 py-3 pl-16"
                >
                  {module.lessons.map((lesson, lessonIndex) => (
                    <Link
                      key={lesson._id}
                      href={lessonHref(lesson.slug)}
                      className="flex items-center gap-3 border-b border-canvas-line py-3 text-sm last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      <span className="w-8 shrink-0 text-xs text-neutral-400">
                        {lessonLabel(moduleIndex, lessonIndex)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-neutral-900">
                        {lesson.title}
                      </span>
                      {lesson.freePreview && (
                        <Badge variant="lesson">Preview</Badge>
                      )}
                      <span className="shrink-0 text-xs text-neutral-500">
                        {formatDuration(lesson.duration)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {course.modules.length > 6 && (
        <button
          type="button"
          className="mx-auto mt-[-1px] flex h-11 items-center gap-3 rounded-xl border border-canvas-line bg-canvas px-5 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Show all {course.modules.length} modules{" "}
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}
