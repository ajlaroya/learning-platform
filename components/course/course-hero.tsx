"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Bookmark, Clock3, Users } from "lucide-react";
import { analyticsEvents, captureEvent } from "@/components/analytics/events";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { urlFor } from "@/sanity/lib/image";
import { formatCount, formatDuration, formatLevel } from "@/lib/format";
import { lessonHref } from "@/lib/routes";
import type { COURSE_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Course = NonNullable<COURSE_BY_SLUG_QUERY_RESULT>;

export function CourseHero({ course }: { course: Course }) {
  const firstLesson = course.modules[0]?.lessons[0];
  const totalDuration = course.modules.reduce(
    (total, module) =>
      total +
      module.lessons.reduce(
        (moduleTotal, lesson) => moduleTotal + lesson.duration,
        0,
      ),
    0,
  );

  return (
    <section className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-15">
      <div className="relative aspect-280/328 overflow-hidden rounded-2xl bg-neutral-100">
        {course.coverImage.asset && (
          <Image
            src={urlFor(course.coverImage)
              .width(560)
              .height(656)
              .fit("crop")
              .url()}
            alt={course.coverImage.alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 280px"
          />
        )}
      </div>
      <div className="flex flex-col justify-center">
        {course.popular && <Badge variant="popular">Popular</Badge>}
        <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-tight tracking-tighter text-neutral-900 sm:text-5xl">
          {course.title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-neutral-500 sm:text-[17px]">
          {course.summary}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {formatLevel(course.level)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {formatDuration(totalDuration)}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-base">▤</span>
            {course.modules.length} modules
          </span>
          {course.studentCount !== null && (
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {formatCount(course.studentCount)} students
            </span>
          )}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {firstLesson && (
            <ButtonLink
              href={lessonHref(firstLesson.slug)}
              variant="primary"
              size="xl"
              onClick={() =>
                captureEvent(analyticsEvents.courseContinueClicked, {
                  course_id: course._id,
                  course_slug: course.slug,
                  lesson_id: firstLesson._id,
                  lesson_slug: firstLesson.slug,
                })
              }
            >
              Continue Learning <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          )}
          <Link
            href="#course-content"
            onClick={() =>
              captureEvent(analyticsEvents.courseBookmarkClicked, {
                course_id: course._id,
                course_slug: course.slug,
              })
            }
            className="inline-flex h-16 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-6 text-[17px] font-medium text-neutral-900 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <Bookmark className="h-4 w-4" /> Bookmark
          </Link>
        </div>
      </div>
    </section>
  );
}
