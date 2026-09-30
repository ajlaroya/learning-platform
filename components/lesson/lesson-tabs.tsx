"use client";

import { useEffect, useRef, useState } from "react";
import { analyticsEvents, captureEvent } from "@/components/analytics/events";

const tabs = [
  { id: "content", label: "Lesson Content" },
  { id: "notes", label: "Notes" },
] as const;

export function LessonTabs({
  lessonId,
  lessonSlug,
  children,
}: {
  lessonId: string;
  lessonSlug: string;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["id"]>("content");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  useEffect(() => {
    captureEvent(analyticsEvents.lessonViewed, {
      lesson_id: lessonId,
      lesson_slug: lessonSlug,
    });
  }, [lessonId, lessonSlug]);

  function selectTab(index: number, focus = false) {
    const selected = tabs[index];
    if (!selected) return;
    setActiveTab(selected.id);
    captureEvent(analyticsEvents.lessonTabChanged, {
      lesson_id: lessonId,
      lesson_slug: lessonSlug,
      tab: selected.id,
    });
    if (focus) tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectTab((activeIndex + 1) % tabs.length, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab((activeIndex - 1 + tabs.length) % tabs.length, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab(tabs.length - 1, true);
    }
  }

  return (
    <section>
      <div
        role="tablist"
        aria-label="Lesson sections"
        onKeyDown={handleKeyDown}
        className="flex gap-7 border-b border-canvas-line"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            id={`lesson-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`lesson-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => selectTab(index)}
            className={`min-h-11 border-b-2 px-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${activeTab === tab.id ? "border-primary-500 font-medium text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`lesson-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`lesson-tab-${activeTab}`}
        tabIndex={0}
        className="pt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {activeTab === "content" ? (
          children
        ) : (
          <div className="min-h-36 py-8 text-sm text-neutral-500">
            Your notes live here soon.
          </div>
        )}
      </div>
    </section>
  );
}
