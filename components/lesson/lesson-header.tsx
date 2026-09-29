import { BarChart3, Bookmark, Clock3, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatCount,
  formatDuration,
  formatLevel,
  lessonLabel,
} from "@/lib/format";
import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;
type Course = NonNullable<Lesson["course"]>;

export function LessonHeader({
  lesson,
  course,
  moduleIndex,
  lessonIndex,
  summary,
}: {
  lesson: Lesson;
  course: Course | null;
  moduleIndex: number | null;
  lessonIndex: number | null;
  summary: string | null;
}) {
  return (
    <header>
      {moduleIndex !== null && lessonIndex !== null && (
        <Badge variant="popular">
          Lesson {lessonLabel(moduleIndex, lessonIndex)}
        </Badge>
      )}
      <div className="mt-3 flex items-start justify-between gap-4">
        <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
          {lesson.title}
        </h1>
        <button
          type="button"
          aria-label="Bookmark lesson"
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-canvas-line text-primary-500 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Bookmark className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {summary && (
        <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-500 sm:text-base">
          {summary}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500 sm:text-sm">
        <span className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary-500" aria-hidden="true" />
          {formatDuration(lesson.duration)}
        </span>
        {course && (
          <span className="inline-flex items-center gap-2">
            <BarChart3
              className="h-4 w-4 text-primary-500"
              aria-hidden="true"
            />
            {formatLevel(course.level)}
          </span>
        )}
        {lesson.studentCount !== null && (
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-500" aria-hidden="true" />
            {formatCount(lesson.studentCount)} students
          </span>
        )}
      </div>
    </header>
  );
}
