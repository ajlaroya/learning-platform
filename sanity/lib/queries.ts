import { defineQuery } from "next-sanity";

const imageProjection = `{
  asset,
  alt,
  crop,
  hotspot
}`;

const lessonCardProjection = `{
  _id,
  _key,
  title,
  "slug": slug.current,
  duration,
  freePreview,
  thumbnail ${imageProjection}
}`;

export const COURSES_LIST_QUERY = defineQuery(/* groq */ `
  *[_type == "course"] | order(coalesce(popular, false) desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    level,
    price,
    popular,
    studentCount,
    coverImage ${imageProjection},
    "instructor": instructor->{name, "slug": slug.current},
    "category": category->{title, "slug": slug.current},
    "moduleCount": count(modules),
    "totalDuration": math::sum(modules[].lessons[]->duration)
  }
`);

export const COURSE_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && defined(slug.current)]{"slug": slug.current}
`);

export const COURSE_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    level,
    price,
    popular,
    studentCount,
    coverImage ${imageProjection},
    learningOutcomes[]{_key, icon, title, description},
    instructor->{_id, name, "slug": slug.current, photo ${imageProjection}, expertise, bio},
    category->{title, "slug": slug.current, description},
    modules[]{
      _key,
      title,
      summary,
      lessons[]->${lessonCardProjection}
    }
  }
`);

export const LESSON_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && defined(slug.current)]{"slug": slug.current}
`);

export const LESSON_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    thumbnail ${imageProjection},
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources[]{_key, type, title, description, url},
    "course": *[_type == "course" && references(^._id)][0]{
      _id,
      title,
      "slug": slug.current,
      level,
      coverImage ${imageProjection},
      instructor->{name, "slug": slug.current, photo ${imageProjection}},
      modules[]{
        _key,
        title,
        "durationSeconds": math::sum(lessons[]->duration),
        lessons[]->{_id, title, "slug": slug.current, duration, freePreview}
      }
    }
  }
`);

export const LESSONS_BY_IDS_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && _id in $ids] {
    _id,
    _createdAt,
    title,
    "slug": slug.current,
    videoUrl,
    duration,
    keyPoints,
    "notesText": pt::text(notes),
    "thumbnailRef": thumbnail.asset._ref,
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      summary,
      "coverImageRef": coverImage.asset._ref,
      modules[] {
        title,
        lessons[]->{_id}
      }
    }
  }
`);

export const VIDEO_CHAPTER_MATCHES_QUERY = defineQuery(/* groq */ `
  *[_type == "video" && url in $urls] {
    url,
    "matchingChapters": chapters[label match $patterns]{startSeconds, label}
  }
`);

export const VIDEO_CHUNK_MATCHES_QUERY = defineQuery(/* groq */ `
  *[_type == "video" && url in $urls] {
    url,
    "matchingChunks": chunks[text match $patterns][0..2]{startSeconds, text}
  }
`);

export const INSTRUCTORS_LIST_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    photo ${imageProjection},
    expertise,
    "courseCount": count(*[_type == "course" && instructor._ref == ^._id])
  }
`);

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    photo ${imageProjection},
    expertise,
    bio,
    "courses": *[_type == "course" && instructor._ref == ^._id] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      level,
      price,
      coverImage ${imageProjection},
      "moduleCount": count(modules),
      "totalDuration": math::sum(modules[].lessons[]->duration)
    }
  }
`);

export const CATEGORIES_LIST_QUERY = defineQuery(/* groq */ `
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    "courseCount": count(*[_type == "course" && category._ref == ^._id])
  }
`);
