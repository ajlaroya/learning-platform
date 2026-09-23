export const coursesHref = "/courses";

export function courseHref(slug: string) {
  return `/courses/${slug}`;
}

export function lessonHref(slug: string) {
  return `/lessons/${slug}`;
}
