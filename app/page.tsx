import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { CourseMark } from "@/components/brand/course-marks";
import { ChartDecoration } from "@/components/home/chart-decoration";
import { Hero } from "@/components/home/hero";
import { SiteHeader } from "@/components/layout/site-header";
import { PageFrame } from "@/components/layout/page-frame";
import { CourseCard } from "@/components/cards/course-card";

export default function Home() {
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
            <CourseCard
              layout="stacked"
              mark={<CourseMark type="next" />}
              title="Next.js for Production"
              description="Build scalable, high-performance web applications with Next.js."
              level="Intermediate"
              duration="18h 24m"
              modules="12 modules"
            />
            <CourseCard
              layout="stacked"
              mark={<CourseMark type="docker" />}
              title="Docker Essentials"
              description="Containerize applications and streamline your development workflow."
              level="Beginner"
              duration="10h 12m"
              modules="8 modules"
            />
            <CourseCard
              layout="stacked"
              mark={<CourseMark type="typescript" />}
              title="TypeScript Deep Dive"
              description="Go beyond the basics and write safer, more expressive code."
              level="Intermediate"
              duration="14h 36m"
              modules="10 modules"
            />
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
