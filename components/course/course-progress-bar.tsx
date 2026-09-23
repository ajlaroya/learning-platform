import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function CourseProgressBar({ resumeHref }: { resumeHref: string }) {
  return (
    <aside className="sticky bottom-4 z-20 flex flex-col gap-4 rounded-2xl border border-canvas-line bg-canvas/95 p-5 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="shrink-0">
        <p className="text-xs text-neutral-500">Your Progress</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900">
          Not started
        </p>
      </div>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-200 sm:mx-8">
        <div className="h-full w-0 rounded-full bg-primary-500" />
      </div>
      <ButtonLink
        href={resumeHref}
        variant="primary"
        size="xl"
        className="h-14 shrink-0 px-6 text-base"
      >
        Continue Learning <ArrowRight className="h-4 w-4" />
      </ButtonLink>
    </aside>
  );
}
