"use client";

import { ArrowRight } from "lucide-react";
import { analyticsEvents, captureEvent } from "@/components/analytics/events";
import { ButtonLink } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";

export function Hero() {
  return (
    <section className="flex flex-col items-center px-6 pb-12 pt-16 text-center sm:pt-20">
      <span className="rounded-lg border border-primary-200 bg-primary-100/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-500">
        Intelligent learning
      </span>
      <h1 className="mt-7 max-w-180 font-display text-[44px] font-bold leading-[1.12] tracking-[-0.055em] text-neutral-900 sm:text-[60px]">
        Search your learning
        <br />
        in plain English.
      </h1>
      <p className="mt-5 max-w-142.5 text-[16px] leading-7 text-neutral-500 sm:text-[18px]">
        Vertex understands what you want to learn and
        <br className="hidden sm:block" /> finds the exact lessons across all
        your courses.
      </p>
      <ButtonLink
        href="/courses"
        size="xl"
        className="mt-8 gap-5 bg-primary-500 shadow-md"
        onClick={() =>
          captureEvent(analyticsEvents.coursesExploreClicked, {
            cta_location: "home_hero",
          })
        }
      >
        Explore Courses <ArrowRight className="h-5 w-5" />
      </ButtonLink>
      <div className="mt-8 w-full max-w-187.5">
        <SearchInput
          size="lg"
          placeholder="Ask anything about your learning..."
        />
      </div>
    </section>
  );
}
