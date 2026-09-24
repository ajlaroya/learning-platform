import {
  BarChart3,
  Code2,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
  Puzzle,
} from "lucide-react";
import type { COURSE_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Outcome =
  NonNullable<COURSE_BY_SLUG_QUERY_RESULT>["learningOutcomes"] extends infer T
    ? T extends Array<infer Item>
      ? Item
      : never
    : never;

const icons = {
  sparkles: Sparkles,
  layers: Layers3,
  code: Code2,
  rocket: Rocket,
  shield: ShieldCheck,
  gauge: BarChart3,
  puzzle: Puzzle,
  workflow: Workflow,
} as const;

export function LearningOutcomes({ outcomes }: { outcomes: Outcome[] | null }) {
  if (!outcomes?.length) return null;

  return (
    <section className="rounded-2xl border border-canvas-line p-5 sm:p-7">
      <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-neutral-900">
        What you&apos;ll learn
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {outcomes.map((outcome) => {
          const Icon = icons[outcome.icon as keyof typeof icons] ?? Sparkles;
          return (
            <article
              key={outcome._key}
              className="flex min-h-36 gap-5 rounded-xl border border-canvas-line p-6"
            >
              <Icon
                className="mt-1 h-11 w-11 shrink-0 stroke-1.5 text-primary-500"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900">
                  {outcome.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-neutral-500">
                  {outcome.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
