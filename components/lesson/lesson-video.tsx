"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { analyticsEvents, captureEvent } from "@/components/analytics/events";
import { parseVideoUrl } from "@/lib/video";
import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;

export function LessonVideo({
  lesson,
  startSeconds,
  thumbnailUrl,
  shouldAutoplay,
}: {
  lesson: Lesson;
  startSeconds: number;
  thumbnailUrl: string | null;
  shouldAutoplay: boolean;
}) {
  const parsedVideo = parseVideoUrl(lesson.videoUrl);
  const [playing, setPlaying] = useState(
    shouldAutoplay && parsedVideo !== null,
  );
  const trackedAutoplay = useRef(false);

  useEffect(() => {
    if (shouldAutoplay && parsedVideo && !trackedAutoplay.current) {
      captureEvent(analyticsEvents.videoPlayed, {
        lesson_id: lesson._id,
        lesson_slug: lesson.slug,
        start_seconds: startSeconds,
      });
      trackedAutoplay.current = true;
    }
  }, [lesson._id, lesson.slug, parsedVideo, shouldAutoplay, startSeconds]);

  function startPlayback() {
    if (!parsedVideo) return;
    setPlaying(true);
    captureEvent(analyticsEvents.videoPlayed, {
      lesson_id: lesson._id,
      lesson_slug: lesson.slug,
      start_seconds: startSeconds,
    });
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-950">
      {playing && parsedVideo ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={parsedVideo.embedUrl(startSeconds, true)}
          title={lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <>
          {thumbnailUrl && (
            <Image
              src={thumbnailUrl}
              alt={lesson.thumbnail?.alt ?? ""}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            {parsedVideo ? (
              <button
                type="button"
                onClick={startPlayback}
                aria-label={`Play ${lesson.title}`}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500"
              >
                <Play
                  className="ml-1 h-7 w-7 fill-current"
                  aria-hidden="true"
                />
              </button>
            ) : (
              <p className="rounded-md bg-black/70 px-4 py-2 text-sm text-white">
                Video unavailable
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
