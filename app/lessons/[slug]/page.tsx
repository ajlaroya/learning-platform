import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonFooterNav } from "@/components/lesson/lesson-footer-nav";
import { LessonHeader } from "@/components/lesson/lesson-header";
import { LessonKeyPoints } from "@/components/lesson/lesson-key-points";
import { LessonNotes } from "@/components/lesson/lesson-notes";
import { LessonResources } from "@/components/lesson/lesson-resources";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { LessonTabs } from "@/components/lesson/lesson-tabs";
import { LessonVideo } from "@/components/lesson/lesson-video";
import { PageFrame } from "@/components/layout/page-frame";
import { SiteHeader } from "@/components/layout/site-header";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { courseHref, coursesHref } from "@/lib/routes";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/fetch";
import { LESSON_BY_SLUG_QUERY, LESSON_SLUGS_QUERY } from "@/sanity/lib/queries";
import type {
  LESSON_BY_SLUG_QUERY_RESULT,
  LESSON_SLUGS_QUERY_RESULT,
} from "@/sanity.types";

type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;
type Notes = NonNullable<Lesson["notes"]>;
type LessonPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getLesson(slug: string) {
  return sanityFetch<LESSON_BY_SLUG_QUERY_RESULT, { slug: string }>({
    query: LESSON_BY_SLUG_QUERY,
    params: { slug },
    tags: ["lesson", "course"],
  });
}

function splitLeadParagraph(notes: Notes | null) {
  if (!notes) return { summary: null, overview: null };

  const leadIndex = notes.findIndex(
    (block) =>
      block._type === "block" &&
      (block.style === undefined || block.style === "normal"),
  );
  if (leadIndex < 0) return { summary: null, overview: notes };

  const lead = notes[leadIndex];
  const summary =
    lead._type === "block"
      ? (lead.children ?? [])
          .flatMap((child) =>
            child._type === "span" ? [child.text ?? ""] : [],
          )
          .join("")
          .trim()
      : "";

  return {
    summary: summary || null,
    overview: notes.filter((_, index) => index !== leadIndex),
  };
}

function getStartPosition(
  value: string | string[] | undefined,
  duration: number,
) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return { seconds: 0, autoplay: false };
  }

  const requestedSeconds = Number(value);
  if (!Number.isSafeInteger(requestedSeconds)) {
    return { seconds: 0, autoplay: false };
  }

  return {
    seconds: Math.min(requestedSeconds, duration),
    autoplay: true,
  };
}

export async function generateStaticParams() {
  const lessons = await sanityFetch<LESSON_SLUGS_QUERY_RESULT>({
    query: LESSON_SLUGS_QUERY,
  });
  return lessons.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: Pick<LessonPageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) return {};

  const { summary } = splitLeadParagraph(lesson.notes);
  return {
    title: `${lesson.title} | Vertex`,
    description: summary ?? undefined,
  };
}

export default async function LessonPage({
  params,
  searchParams,
}: LessonPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const lesson = await getLesson(slug);
  if (!lesson) notFound();

  const course = lesson.course;
  const moduleIndex =
    course?.modules.findIndex((module) =>
      module.lessons.some((item) => item.slug === lesson.slug),
    ) ?? -1;
  const currentModule =
    moduleIndex >= 0 ? course?.modules[moduleIndex] : undefined;
  const lessonIndex =
    currentModule?.lessons.findIndex((item) => item.slug === lesson.slug) ?? -1;
  const curriculum = course?.modules.flatMap((module) => module.lessons) ?? [];
  const currentPosition = curriculum.findIndex(
    (item) => item.slug === lesson.slug,
  );
  const previous = currentPosition > 0 ? curriculum[currentPosition - 1] : null;
  const next =
    currentPosition >= 0 && currentPosition < curriculum.length - 1
      ? curriculum[currentPosition + 1]
      : null;
  const start = getStartPosition(query.t, lesson.duration);
  const { summary, overview } = splitLeadParagraph(lesson.notes);
  const thumbnailUrl = lesson.thumbnail?.asset
    ? urlFor(lesson.thumbnail).width(1280).height(720).fit("crop").url()
    : null;
  const coverImageUrl = course?.coverImage?.asset
    ? urlFor(course.coverImage).width(96).height(96).fit("crop").url()
    : null;

  const breadcrumbs = [
    { label: "All Courses", href: coursesHref },
    ...(course ? [{ label: course.title, href: courseHref(course.slug) }] : []),
    ...(currentModule ? [{ label: currentModule.title }] : []),
    { label: lesson.title, current: true },
  ];

  return (
    <PageFrame className="flex flex-col">
      <SiteHeader />
      <main
        className={`grid flex-1 content-start ${course ? "lg:grid-cols-[264px_minmax(0,1fr)]" : "grid-cols-1"}`}
      >
        {course && moduleIndex >= 0 && (
          <LessonSidebar
            course={course}
            coverImageUrl={coverImageUrl}
            activeLessonSlug={lesson.slug}
            activeModuleIndex={moduleIndex}
          />
        )}
        <div className="min-w-0 px-5 py-5 sm:px-8 sm:py-7 lg:px-9">
          <Breadcrumbs items={breadcrumbs} className="mb-5 overflow-hidden" />
          <LessonHeader
            lesson={lesson}
            course={course}
            moduleIndex={moduleIndex >= 0 ? moduleIndex : null}
            lessonIndex={lessonIndex >= 0 ? lessonIndex : null}
            summary={summary}
          />
          <div className="mt-5">
            <LessonVideo
              lesson={lesson}
              startSeconds={start.seconds}
              thumbnailUrl={thumbnailUrl}
              shouldAutoplay={start.autoplay}
            />
          </div>
          <div className="mt-4">
            <LessonTabs lessonId={lesson._id} lessonSlug={lesson.slug}>
              <div className="space-y-5">
                <LessonNotes notes={overview} />
                <LessonKeyPoints
                  keyPoints={lesson.keyPoints}
                  proTip={lesson.proTip}
                />
                <LessonResources
                  lessonId={lesson._id}
                  lessonSlug={lesson.slug}
                  resources={lesson.resources}
                />
              </div>
            </LessonTabs>
          </div>
        </div>
        <LessonFooterNav previous={previous} next={next} />
      </main>
    </PageFrame>
  );
}
