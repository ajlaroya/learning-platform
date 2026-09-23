import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChartDecoration } from "@/components/home/chart-decoration";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { CourseContent } from "@/components/course/course-content";
import { CourseHero } from "@/components/course/course-hero";
import { CourseProgressBar } from "@/components/course/course-progress-bar";
import { LearningOutcomes } from "@/components/course/learning-outcomes";
import { PageFrame } from "@/components/layout/page-frame";
import { SiteHeader } from "@/components/layout/site-header";
import { coursesHref, lessonHref } from "@/lib/routes";
import { sanityFetch } from "@/sanity/lib/fetch";
import { COURSE_BY_SLUG_QUERY, COURSE_SLUGS_QUERY } from "@/sanity/lib/queries";
import type {
  COURSE_BY_SLUG_QUERY_RESULT,
  COURSE_SLUGS_QUERY_RESULT,
} from "@/sanity.types";

type CourseParams = { params: Promise<{ slug: string }> };

async function getCourse(slug: string) {
  return sanityFetch<COURSE_BY_SLUG_QUERY_RESULT, { slug: string }>({
    query: COURSE_BY_SLUG_QUERY,
    params: { slug },
    tags: ["course", "lesson"],
  });
}

export async function generateStaticParams() {
  const courses = await sanityFetch<COURSE_SLUGS_QUERY_RESULT>({
    query: COURSE_SLUGS_QUERY,
  });
  return courses.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CourseParams): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  return course
    ? { title: `${course.title} | Vertex`, description: course.summary }
    : {};
}

export default async function CoursePage({ params }: CourseParams) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  const firstLesson = course.modules[0]?.lessons[0];

  return (
    <PageFrame>
      <SiteHeader />
      <main className="relative overflow-hidden px-5 pb-8 pt-7 sm:px-10 sm:pt-9">
        <div className="relative z-10 space-y-10 sm:space-y-12">
          <Breadcrumbs
            items={[
              { label: "All Courses", href: coursesHref },
              { label: course.title, current: true },
            ]}
          />
          <CourseHero course={course} />
          <LearningOutcomes outcomes={course.learningOutcomes} />
          <CourseContent course={course} />
          {firstLesson && (
            <CourseProgressBar resumeHref={lessonHref(firstLesson.slug)} />
          )}
        </div>
        <ChartDecoration />
      </main>
    </PageFrame>
  );
}
