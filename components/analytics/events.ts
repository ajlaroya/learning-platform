"use client";

import posthog from "posthog-js";

export const analyticsEvents = {
  coursesExploreClicked: "courses_explore_clicked",
  signInStarted: "sign_in_started",
  signUpStarted: "sign_up_started",
  courseContinueClicked: "course_continue_clicked",
  courseBookmarkClicked: "course_bookmark_clicked",
  courseModuleToggled: "course_module_toggled",
  courseLessonSelected: "course_lesson_selected",
} as const;

type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export function captureEvent(
  event: (typeof analyticsEvents)[keyof typeof analyticsEvents],
  properties?: EventProperties,
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.capture(event, properties);
}
