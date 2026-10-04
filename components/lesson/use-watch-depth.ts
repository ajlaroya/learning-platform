"use client";

import { useEffect } from "react";
import { captureEvent } from "@/components/analytics/events";
import { analyticsEvents } from "@/lib/analytics/events";
import type { VideoProvider } from "@/lib/video";

export function useWatchDepth({
  active,
  lessonSlug,
  courseSlug,
  provider,
  durationSeconds,
  startSeconds,
}: {
  active: boolean;
  lessonSlug: string;
  courseSlug: string | null;
  provider: VideoProvider | null;
  durationSeconds: number;
  startSeconds: number;
}) {
  useEffect(() => {
    if (!active || durationSeconds <= 0 || !provider) return;

    let watchedSeconds = 0;
    let lastTick = Date.now();
    let completed = false;
    const milestones = new Set<number>();
    const thresholds = [25, 50, 75, 95];

    function recordProgress() {
      const now = Date.now();
      if (document.visibilityState === "visible") {
        watchedSeconds += (now - lastTick) / 1000;
      }
      lastTick = now;

      const positionSeconds = Math.min(
        durationSeconds,
        startSeconds + watchedSeconds,
      );
      const percentWatched = Math.min(
        100,
        Math.floor((positionSeconds / durationSeconds) * 100),
      );

      for (const threshold of thresholds) {
        if (percentWatched < threshold || milestones.has(threshold)) continue;
        milestones.add(threshold);
        captureEvent(analyticsEvents.videoProgress, {
          lesson_slug: lessonSlug,
          course_slug: courseSlug,
          provider,
          percent_watched: threshold,
          position_seconds: Math.floor(positionSeconds),
          duration_seconds: durationSeconds,
          measurement: "foreground_elapsed_time_estimate",
        });
      }

      if (percentWatched >= 95 && !completed) {
        completed = true;
        captureEvent(analyticsEvents.lessonCompleted, {
          lesson_slug: lessonSlug,
          course_slug: courseSlug,
          duration_seconds: durationSeconds,
          completion_method: "watch_depth_estimate",
        });
      }
    }

    function resetTick() {
      lastTick = Date.now();
    }

    const timer = window.setInterval(recordProgress, 1000);
    document.addEventListener("visibilitychange", resetTick);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", resetTick);
    };
  }, [active, courseSlug, durationSeconds, lessonSlug, provider, startSeconds]);
}
