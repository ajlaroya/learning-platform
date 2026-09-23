# Implementation prompt: Sanity-backed homepage courses

## Goal

Replace the homepage's three hardcoded course cards with the first three results from the seeded Sanity catalog.

## Code inspected

- `app/page.tsx` currently renders three static `CourseCard` instances.
- `sanity/lib/queries.ts` already provides `COURSES_LIST_QUERY`, ordered by popular status and title, with title, slug, summary, level, module count, and total duration.
- `sanity/lib/fetch.ts` provides the server-side `sanityFetch` helper.
- `components/cards/course-card.tsx` renders the existing card visual and accepts the needed display fields.
- `components/brand/course-marks.tsx` only supports hardcoded Next, Docker, and TypeScript marks, so seeded courses will use a neutral text mark derived from the course title rather than inventing a subject-specific logo.
- `lib/format.ts` already provides duration and level formatting.

## Implementation

- Keep `app/page.tsx` as a server component.
- Fetch `COURSES_LIST_QUERY` with `sanityFetch` and the generated `COURSES_LIST_QUERY_RESULT` type.
- Render up to three seeded courses, linking each card to `/courses/<slug>`.
- Use the existing `CourseCard` component and preserve the current grid/layout.
- Use the first letter of each fetched course title as a neutral card mark.
- Render a useful empty state if Sanity returns no courses.
- Do not modify seed data, schemas, or the Sanity query.

## Acceptance criteria

- Homepage cards display real seeded Sanity course titles, summaries, levels, durations, and module counts.
- Cards link to the corresponding dynamic course pages.
- No hardcoded course titles remain in `app/page.tsx`.
- Typecheck and lint pass.
- The homepage responds successfully in the dev server with seeded course content.
