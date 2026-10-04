"use client";

import posthog from "posthog-js";
import { analyticsEvents } from "@/lib/analytics/events";

export { analyticsEvents } from "@/lib/analytics/events";

type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function captureEvent(
  event: (typeof analyticsEvents)[keyof typeof analyticsEvents],
  properties?: EventProperties,
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.capture(event, properties);
}

export function getPostHogContext() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return {};

  const distinctId = posthog.get_distinct_id();
  const sessionId = posthog.get_session_id();

  return {
    distinctId: uuidPattern.test(distinctId) ? distinctId : undefined,
    sessionId: uuidPattern.test(sessionId) ? sessionId : undefined,
  };
}
