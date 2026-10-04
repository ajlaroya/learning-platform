const safeIdPart = /^[A-Za-z0-9_-]+$/;

export function parseVideoUrl(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password) return null;
  const hostname = url.hostname.toLowerCase();
  let provider;
  let videoId;

  if (
    hostname === "youtu.be" ||
    hostname === "youtube.com" ||
    hostname.endsWith(".youtube.com")
  ) {
    provider = "youtube";
    videoId =
      hostname === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : (url.searchParams.get("v") ??
          url.pathname.split("/").filter(Boolean).at(-1));
    if (!videoId || !safeIdPart.test(videoId)) return null;
  } else if (hostname === "vimeo.com" || hostname.endsWith(".vimeo.com")) {
    provider = "vimeo";
    videoId = url.pathname.split("/").filter(Boolean).at(-1);
    if (!videoId || !/^\d+$/.test(videoId)) return null;
  } else if (
    hostname === "bunny.net" ||
    hostname.endsWith(".bunny.net") ||
    hostname === "mediadelivery.net" ||
    hostname.endsWith(".mediadelivery.net")
  ) {
    provider = "bunny";
    const path = url.pathname.split("/").filter(Boolean);
    const embedIndex = path.findIndex(
      (part) => part === "embed" || part === "play",
    );
    const libraryId = embedIndex >= 0 ? path[embedIndex + 1] : path.at(-2);
    const assetId = embedIndex >= 0 ? path[embedIndex + 2] : path.at(-1);
    if (
      !libraryId ||
      !assetId ||
      !safeIdPart.test(libraryId) ||
      !safeIdPart.test(assetId)
    ) {
      return null;
    }
    videoId = `${libraryId}-${assetId}`;
  } else {
    return null;
  }

  const identity = `${provider}-${videoId}`.replace(/[^A-Za-z0-9._-]/g, "");

  return {
    provider,
    videoId,
    documentId: `video.${identity}`,
    url: url.href,
  };
}
