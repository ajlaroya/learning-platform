import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { ChartDecoration } from "@/components/home/chart-decoration";
import { Hero } from "@/components/home/hero";
import { SiteHeader } from "@/components/layout/site-header";
import { PageFrame } from "@/components/layout/page-frame";
import { CourseCard } from "@/components/cards/course-card";
import { formatDuration, formatLevel } from "@/lib/format";
import { courseHref } from "@/lib/routes";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import { COURSES_LIST_QUERY } from "@/sanity/lib/queries";
import type { COURSES_LIST_QUERY_RESULT } from "@/sanity.types";

type CourseCoverImageData = NonNullable<
  COURSES_LIST_QUERY_RESULT[number]["coverImage"]
>;

function CourseCoverImage({
  title,
  image,
}: {
  title: string;
  image: CourseCoverImageData;
}) {
  if (!image?.asset) {
    return (
      <span
        className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-900 text-2xl font-bold text-white"
        aria-hidden="true"
      >
        {title.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-neutral-100">
      <Image
        src={urlFor(image).width(160).height(160).fit("crop").url()}
        alt={image.alt ?? title}
        fill
        className="object-cover"
        sizes="56px"
      />
    </div>
  );
}

export default async function Home() {
  const courses = await sanityFetch<COURSES_LIST_QUERY_RESULT>({
    query: COURSES_LIST_QUERY,
    tags: ["course", "lesson"],
  });

  return (
    <PageFrame>
      <SiteHeader />
      <main>
        <Hero />
        <section className="border-t border-canvas-line px-6 pb-20 pt-10 sm:px-10 sm:pt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[28px] font-bold tracking-[-0.045em] text-neutral-900">
              All Courses
            </h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              View all courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <Link
                key={course._id}
                href={courseHref(course.slug)}
                className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <CourseCard
                  layout="stacked"
                  mark={
                    <CourseCoverImage
                      title={course.title}
                      image={course.coverImage}
                    />
                  }
                  title={course.title}
                  description={course.summary}
                  level={formatLevel(course.level)}
                  duration={formatDuration(course.totalDuration)}
                  modules={`${course.moduleCount} modules`}
                />
              </Link>
            ))}
            {courses.length === 0 && (
              <p className="col-span-full rounded-xl border border-canvas-line p-6 text-sm text-neutral-500">
                Courses are being updated. Check back soon.
              </p>
            )}
          </div>
        </section>
        <section className="relative flex min-h-62.5 items-start justify-center overflow-hidden border-t border-canvas-line pt-10">
          <div className="relative z-10 flex items-center gap-4 text-[16px] text-neutral-500">
            <Star className="h-5 w-5 text-primary-500" /> New courses and
            lessons added every week.
          </div>
          <ChartDecoration />
        </section>
      </main>
    </PageFrame>
  );
}
