export type VideoProvider = "youtube" | "vimeo" | "bunny";

export type ParsedVideo = {
  provider: VideoProvider;
  embedUrl: (startSeconds: number, autoplay: boolean) => string;
};

const safeSegment = /^[a-zA-Z0-9_-]+$/;

export function parseVideoUrl(value: string): ParsedVideo | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "youtu.be" ||
    hostname.endsWith(".youtube.com") ||
    hostname === "youtube.com"
  ) {
    const videoId =
      hostname === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : (url.searchParams.get("v") ??
          url.pathname.split("/").filter(Boolean).at(-1));

    if (!videoId || !safeSegment.test(videoId)) return null;

    return {
      provider: "youtube",
      embedUrl(startSeconds, autoplay) {
        const params = new URLSearchParams({
          autoplay: autoplay ? "1" : "0",
          playsinline: "1",
        });
        if (startSeconds > 0) params.set("start", String(startSeconds));
        return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
      },
    };
  }

  if (hostname === "vimeo.com" || hostname.endsWith(".vimeo.com")) {
    const videoId = url.pathname.split("/").filter(Boolean).at(-1);
    if (!videoId || !/^\d+$/.test(videoId)) return null;

    return {
      provider: "vimeo",
      embedUrl(startSeconds, autoplay) {
        const params = new URLSearchParams({ autoplay: autoplay ? "1" : "0" });
        const timestamp = startSeconds > 0 ? `#t=${startSeconds}s` : "";
        return `https://player.vimeo.com/video/${videoId}?${params}${timestamp}`;
      },
    };
  }

  if (
    hostname === "bunny.net" ||
    hostname.endsWith(".bunny.net") ||
    hostname === "mediadelivery.net" ||
    hostname.endsWith(".mediadelivery.net")
  ) {
    const path = url.pathname.split("/").filter(Boolean);
    const embedIndex = path.findIndex(
      (part) => part === "embed" || part === "play",
    );
    const libraryId = embedIndex >= 0 ? path[embedIndex + 1] : path.at(-2);
    const videoId = embedIndex >= 0 ? path[embedIndex + 2] : path.at(-1);

    if (
      !libraryId ||
      !videoId ||
      !safeSegment.test(libraryId) ||
      !safeSegment.test(videoId)
    ) {
      return null;
    }

    return {
      provider: "bunny",
      embedUrl(startSeconds, autoplay) {
        const params = new URLSearchParams({
          autoplay: autoplay ? "true" : "false",
        });
        if (startSeconds > 0) params.set("t", String(startSeconds));
        return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?${params}`;
      },
    };
  }

  return null;
}
