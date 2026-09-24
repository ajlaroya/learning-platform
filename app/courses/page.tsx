import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { ChartDecoration } from "@/components/home/chart-decoration";
import { CourseCard } from "@/components/cards/course-card";
import { PageFrame } from "@/components/layout/page-frame";
import { SiteHeader } from "@/components/layout/site-header";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
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

export const metadata: Metadata = {
  title: "All Courses | Vertex",
  description: "Browse every course in the Vertex catalog.",
};

export default async function CoursesPage() {
  const courses = await sanityFetch<COURSES_LIST_QUERY_RESULT>({
    query: COURSES_LIST_QUERY,
    tags: ["course", "lesson"],
  });

  return (
    <PageFrame>
      <SiteHeader />
      <main className="relative overflow-hidden px-5 pb-10 pt-7 sm:px-10 sm:pt-9">
        <div className="relative z-10 space-y-8">
          <Breadcrumbs items={[{ label: "All Courses", current: true }]} />

          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display text-[32px] font-bold tracking-[-0.045em] text-neutral-900 sm:text-[42px]">
              All Courses
            </h1>
            <p className="text-sm text-neutral-500">{courses.length} courses</p>
          </div>

          {courses.length === 0 ? (
            <p className="rounded-xl border border-canvas-line bg-white p-6 text-sm text-neutral-500">
              Courses are being updated. Check back soon.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
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
            </div>
          )}
        </div>
        <ChartDecoration />
      </main>
    </PageFrame>
  );
}
