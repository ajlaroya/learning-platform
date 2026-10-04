"use client";

import { useEffect, useRef } from "react";
import { captureEvent } from "@/components/analytics/events";
import { analyticsEvents } from "@/lib/analytics/events";

type ViewEvent =
  typeof analyticsEvents.catalogViewed | typeof analyticsEvents.courseViewed;

type ViewProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export function ViewTracker({
  event,
  properties,
}: {
  event: ViewEvent;
  properties: ViewProperties;
}) {
  const lastTrackedView = useRef<string | null>(null);
  const viewKey = `${event}:${JSON.stringify(properties)}`;

  useEffect(() => {
    if (lastTrackedView.current === viewKey) return;
    lastTrackedView.current = viewKey;
    captureEvent(event, properties);
  }, [event, properties, viewKey]);

  return null;
}
