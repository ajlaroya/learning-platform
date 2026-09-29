"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  FileText,
  Link2,
  Presentation,
} from "lucide-react";
import { analyticsEvents, captureEvent } from "@/components/analytics/events";
import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;
type Resource = NonNullable<Lesson["resources"]>[number];

const resourceIcons = {
  code: Code2,
  link: Link2,
  pdf: FileText,
  repo: Code2,
  slides: Presentation,
} satisfies Record<Resource["type"], typeof Code2>;

function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function LessonResources({
  lessonId,
  lessonSlug,
  resources,
}: {
  lessonId: string;
  lessonSlug: string;
  resources: Lesson["resources"];
}) {
  const safeResources = (resources ?? []).flatMap((resource) => {
    const href = safeExternalUrl(resource.url);
    return href ? [{ ...resource, href }] : [];
  });

  if (safeResources.length === 0) return null;

  return (
    <section className="border-t border-canvas-line pt-5">
      <h2 className="font-display text-xl font-semibold text-neutral-900">
        Resources
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {safeResources.map((resource) => {
          const Icon = resourceIcons[resource.type] ?? BookOpen;
          return (
            <li key={resource._key}>
              <Link
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  captureEvent(analyticsEvents.lessonResourceClicked, {
                    lesson_id: lessonId,
                    lesson_slug: lessonSlug,
                    resource_type: resource.type,
                  })
                }
                className="group flex min-h-24 items-start gap-3 rounded-lg border border-canvas-line bg-white/40 p-3 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold leading-5 text-neutral-900">
                    {resource.title}
                  </span>
                  {resource.description && (
                    <span className="mt-1 block text-[11px] leading-4 text-neutral-500">
                      {resource.description}
                    </span>
                  )}
                </span>
                <ArrowUpRight
                  className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 group-hover:text-primary-600"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
