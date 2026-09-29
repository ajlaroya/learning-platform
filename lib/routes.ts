export const coursesHref = "/courses";

export function courseHref(slug: string) {
  return `/courses/${slug}`;
}

export function lessonHref(slug: string, startSeconds?: number) {
  const href = `/lessons/${slug}`;
  return startSeconds === undefined
    ? href
    : `${href}?t=${Math.max(0, Math.floor(startSeconds))}`;
}
