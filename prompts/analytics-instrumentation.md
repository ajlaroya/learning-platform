# Analytics instrumentation for search, video, and progress

> [!IMPORTANT] The user's current privacy instruction overrides any older decision in this file: never
> capture raw search text or other user-authored content, and identify signed-in people only by Clerk
> user ID. Do not attach email, name, or any other person properties.

## Goal

Extend PostHog coverage to the features shipped since the base setup: intelligent search, the search
results page, and the lesson page. Add the engagement moments AGENTS.md §7 names — catalog and lesson
views, a search performed, a video play and how far it is watched, and a lesson completed — plus the
result-open and resume events the request calls out. Capture server-side where the action is
server-side. No PII beyond the Clerk user id PostHog already holds.

This is an analytics-only change. It builds no product features, no progress backend, and changes no
visual design.

## Skills and docs read

- `AGENTS.md` §5 (server/client boundaries), §7 (the engagement moments PostHog must capture), §13 (checks).
- `.claude/skills/integration-nextjs-app-router/references/COMMANDMENTS.md` — the binding framework rules.
  The ones that shape this work:
  - Capture in event handlers, not in `useEffect` reacting to state. `useEffect` is only for
    synchronising with external systems.
  - Never send PII or user-generated content in `capture()` properties; PII belongs in `identify()`.
  - `posthog-js` is browser-only; the server uses `posthog-node`.
  - A missing PostHog config must never break the app, and must fail loudly in development only.
  - **Rule 34:** `capture()` enqueues synchronously; the HTTP send happens after. Next.js route handlers
    are torn down per invocation, so a shared/singleton client MUST `await posthog.flush()` before the
    handler returns or the event is silently dropped.
- `.claude/skills/integration-nextjs-app-router/references/identify-users.md` — identity handling.
- `posthog-self-driving-report.md` — two custom scouts are already armed against events this change
  emits: `signals-scout-course-funnel` reads `lesson_completed ÷ lesson_viewed`, and
  `signals-scout-search-quality` reads search zero-result and abandonment rates. The property design
  below is chosen so both scouts actually have data to read.

## Code inspected

| File                                                  | What it already does                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `instrumentation-client.ts`                           | Initializes `posthog-js`; autocapture is enabled.                                                                            |
| `components/analytics/events.ts`                      | Existing event names and guarded client capture helper; `search_performed` is currently client-captured with raw query text. |
| `components/analytics/posthog-identity.tsx`           | Identifies Clerk users but currently sends email and full name too; remove those properties.                                 |
| `app/api/search/route.ts`                             | Owns search execution/counts; has no PostHog server capture.                                                                 |
| `components/search/search-results.tsx`                | Owns search fetch, result list, sort control, and inline result cards.                                                       |
| `components/lesson/lesson-video.tsx`                  | Owns iframe playback activation and `video_played`; no depth telemetry.                                                      |
| `lib/video.ts`                                        | Builds YouTube, Vimeo, and Bunny iframe URLs; no provider playback API is wired.                                             |
| `app/lessons/[slug]/page.tsx`                         | Resolves lesson/course metadata and `?t=` start position; renders video and navigation.                                      |
| `components/lesson/lesson-footer-nav.tsx`             | Owns Previous/Next links; no navigation event.                                                                               |
| `components/course/course-hero.tsx`                   | Captures continue-learning and bookmark clicks.                                                                              |
| `components/course/course-progress-bar.tsx`           | Server-rendered continue-learning link; no event capture.                                                                    |
| `app/courses/page.tsx`, `app/courses/[slug]/page.tsx` | Catalog/course views; no named view events.                                                                                  |
| `package.json`                                        | Includes `posthog-js`, not `posthog-node`; there is no progress API or persisted lesson-completion state.                    |

## Decisions and assumptions

The following choices follow from the requested privacy boundary and current implementation:

1. **Watch depth is measured by an elapsed-time heuristic** (user's choice over provider SDKs and raw
   postMessage). No player SDK or third-party script is added. Depth is derived
   from wall-clock time since play, offset by the deep-link start second, against the lesson's stored
   duration.
   - **Accepted inaccuracy, stated plainly:** the iframe emits nothing, so a pause, a seek, or a speed
     change is invisible. A learner who presses play and walks away will be counted as having watched.
   - Two cheap mitigations are in scope because they cost nothing: accumulate time only while
     `document.visibilityState === "visible"`, and stamp every depth event with
     `measurement: "elapsed_time"` so the imprecision is legible in PostHog rather than implied to be
     player-truth.
   - Ceiling: depth never exceeds 100, and no milestone fires more than once per mount.
2. **`lesson_completed` is derived from watch depth ≥ 95%.** There is no progress record and no server
   write route, so there is no stored completion to report. This is the analytics proxy the
   `signals-scout-course-funnel` scout already expects. It inherits the heuristic's inaccuracy — noted
   in the report, not hidden.
3. **Never capture the raw search query or other user-authored content.** Search events may include
   query length, bounded token count, sort, result counts, duration, and zero-result status, but never
   the query, notes, transcript text, resource URLs, or error details. Do not hash or transform query
   text into an event property.

Further decisions taken without asking, because they follow from the code:

4. **`course_continue_clicked` remains the event name.** Instrument both the course hero and progress
   bar actions with `location: "hero" | "progress_bar"`.
5. **The browser sends its PostHog distinct id and session id to `/api/search`.** Without them, every
   signed-out search lands on the literal `distinctId: "anonymous"`, collapsing all anonymous learners
   into one person and leaving the server event unjoined to the client session. The
   `signals-scout-search-quality` abandonment metric ("a search with results and no subsequent lesson
   view _in the same session_") is unmeasurable without `$session_id`. Both are validated by Zod, both
   are optional, and the Clerk user id still wins as `distinctId` whenever the learner is signed in —
   a client-supplied id is never trusted over server-known identity.
6. **Naming follows the existing convention and PostHog's guidance:** lowercase `snake_case`,
   `object_verb` in the past tense (`lesson_viewed`, `video_played`), snake_case properties, seconds as
   `*_seconds`. New events match what is already there rather than introducing a second style.

## Event catalogue

Existing events kept as-is: `module_expanded`, `module_collapsed`, `lesson_clicked`,
`course_content_show_all_toggled`, `course_bookmarked`, `lesson_bookmarked`, `lesson_tab_changed`,
`lesson_resource_clicked`.

### New — client

| Event                  | Fires on                                            | Properties                                                                                                                                             |
| ---------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `catalog_viewed`       | `/courses` mount                                    | `course_count`                                                                                                                                         |
| `course_viewed`        | `/courses/[slug]` mount                             | `course_slug`, `module_count`, `lesson_count`, `level`                                                                                                 |
| `search_result_opened` | Click on any search result card                     | `sort`, `result_kind` (`video`\|`lesson`), `rank`, `result_count`, `course_slug`, `lesson_slug`, `start_seconds` (video only); no query text           |
| `video_progress`       | Crossing 25 / 50 / 75 / 95% estimated watch depth   | `lesson_slug`, `course_slug`, `provider`, `percent_watched`, `position_seconds`, `duration_seconds`, `measurement: "foreground_elapsed_time_estimate"` |
| `lesson_completed`     | Crossing estimated 95% depth, once per lesson mount | `lesson_slug`, `course_slug`, `duration_seconds`, `completion_method: "watch_depth_estimate"`                                                          |
| `lesson_resumed`       | Lesson opens with `?t=` > 0                         | `lesson_slug`, `course_slug`, `start_seconds`, `source: "deep_link"`                                                                                   |
| `lesson_navigated`     | Footer Next / Previous                              | `from_lesson_slug`, `to_lesson_slug`, `direction` (`next`\|`previous`)                                                                                 |
| `search_sort_changed`  | Sort control changes                                | `previous_sort`, `sort`, `result_count`                                                                                                                |

### Changed — client

| Event                     | Change                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `video_played`            | Include `lesson_slug`, `course_slug`, `provider`, `duration_seconds`, `start_seconds`, and `source` (`deep_link`\|`poster_click`).       |
| `course_continue_clicked` | Keep the existing name; include `course_slug` and `location` (`hero`\|`progress_bar`) so both Continue Learning affordances are covered. |

### New / changed — server (`posthog-node`)

| Event              | Change                                                                                                                                                                                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search_performed` | Capture once in the API route with `query_length`, bounded `query_token_count`, `sort`, `result_count`, `course_count`, `zero_results`, `duration_ms`, and `signed_in`; never include query text. Use authenticated Clerk ID when available; do not pool anonymous users under a literal ID. |
| `search_failed`    | Capture route failures with `query_length`, `sort`, coarse `reason` (`unconfigured`\|`upstream`), and `duration_ms`; never send query or provider/error details.                                                                                                                             |

Both server captures are followed by `await posthog.flush()` (rule 34).
Server capture uses `posthog-node` in the Node.js route and awaits `flush()` before returning. No
provider diagnostics or user-entered content are sent to PostHog.

## Files to touch

**Web — new**

- `lib/posthog-server.ts` — server-only `posthog-node` helper with awaited flush and optional config.
- `components/analytics/view-tracker.tsx` — client tracker for catalog, course, and lesson views.
- `components/lesson/use-watch-depth.ts` — foreground-time estimate with milestone latching and cleanup.
- A small client link wrapper for server-rendered navigation controls only where needed.

**Web — changed**

- `package.json` and lockfile — add `posthog-node` if not already available.
- `app/api/search/route.ts` — server-side search success/failure events; no raw query or error details.
- `components/analytics/posthog-identity.tsx` — identify by Clerk ID only; remove email and full name.
- `components/analytics/events.ts` — add names for client events and preserve existing conventions.
- `components/search/search-results.tsx` — remove query properties; capture result opens and sort changes with metadata only.
- `components/lesson/lesson-video.tsx`, `app/lessons/[slug]/page.tsx` — play, resume, and watch-depth metadata.
- `components/lesson/lesson-footer-nav.tsx` — capture Next/Previous navigation.
- `components/course/course-hero.tsx`, `components/course/course-progress-bar.tsx` — capture Continue Learning actions.
- `app/courses/page.tsx`, `app/courses/[slug]/page.tsx` — add catalog/course view tracking.
- `instrumentation-client.ts` — approved privacy extension: mask text/attributes in autocapture, restrict autocapture to link/button clicks, mask URL query/hash properties (including `q`), disable IP geolocation, and preserve replay input masking.
- `components/search/search-form.tsx` — exclude the search form from autocapture.
- `components/layout/site-header.tsx` — exclude the Clerk profile control from replay/autocapture.
- `app/search/page.tsx` — mark the rendered query text for replay masking.

## Requirements

1. Every capture sits in an event handler, except the three that are genuinely mount-scoped views
   (`catalog_viewed`, `course_viewed`, `lesson_viewed`/`lesson_resumed`) and the depth timer, which is
   a browser-API subscription — both are the sanctioned `useEffect` uses.
2. Add only `posthog-node` for server capture; add no third-party player script and do not change
3. Add only `posthog-node` for server capture; add no third-party player script. The user separately
   approved privacy controls in `instrumentation-client.ts`.
4. Client components stay client; server pages stay server. No `posthog-js` import reaches a server
   component, and no token or server module reaches the browser.
5. Depth milestones latch: each of 25/50/75/95 fires at most once per mount, and `lesson_completed`
   at most once per mount. Remounting on a new lesson resets them (the slug is the key).
6. The depth timer clears on unmount and does not run when the lesson has no duration or no video.
7. Only Clerk user ID may identify a signed-in person. Never send email, name, raw search query,
   notes, transcript, resource URL, or other user-authored content in event/person properties.
   Mask URL query/hash values, autocaptured text/attributes, session replay input values, and Clerk
   profile UI; disable IP geolocation.
8. Missing PostHog config still cannot break a page or the search route.

## Security considerations

- Any client-supplied PostHog distinct/session IDs are attribution only, never authorization; validate
  and length-bound them, and always prefer the server-verified Clerk ID for signed-in users.
- Never use a shared literal anonymous ID. Omit server attribution if there is no valid anonymous
  PostHog distinct ID available.
- `search_failed` sends a coarse reason, never the caught error message or provider response.
- No write token, read token, or server module reaches a client component.
- The raw query remains only in search execution and is never passed to PostHog.

## Acceptance criteria

- Searching captures one `search_performed` server-side with query length/token count, result counts, `zero_results`, and `duration_ms`; the raw query is absent and the event is flushed before the handler returns.
- A failing search captures `search_failed` with a coarse reason and no query/provider detail.
- Clicking a result captures `search_result_opened` with `result_kind`, `rank`, and result metadata, without query text.
- Opening a lesson captures `lesson_viewed`; opening it with `?t=` also captures `lesson_resumed`.
- Pressing play captures `video_played` with `source: "poster_click"`; a deep link captures it with
  `source: "deep_link"`.
- Watching captures `video_progress` at 25/50/75/95 exactly once each, and `lesson_completed` once.
- `/courses` captures `catalog_viewed`; a course page captures `course_viewed`.
- Both "Continue Learning" buttons capture `course_continue_clicked` with distinct `location` values.
- Footer Next/Previous capture `lesson_navigated`.
- With `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` unset, every page and the search route still work.

## Checks to run

From the web workspace: `npm run typecheck`, `npm run lint`, and `npm run build` (server route and
config-adjacent modules change). Then `npm run dev` for the manual pass below.

## Manual test steps

1. `npm run dev`, open the browser console — `debug: true` in development makes every capture print.
2. Visit `/courses` → console shows `catalog_viewed` with a `course_count`.
3. Open a course → `course_viewed`. Click "Continue Learning" in the hero → `course_continue_clicked` with
   `location: "hero"`. Go back, scroll to the sticky bar, click its "Continue Learning" →
   `course_continue_clicked` with `location: "progress_bar"`.
4. On a lesson, confirm `lesson_viewed`. Press play → `video_played` with `source: "poster_click"`.
5. Leave it playing past a quarter of the lesson duration → `video_progress` with
   `percent_watched: 25`. Switch to another browser tab for a while and come back — the next milestone
   must not have jumped forward by the time spent away.
6. Reach 95% → a final `video_progress` and one `lesson_completed`. Reload and confirm they fire again
   from a clean mount, and only once each.
7. Click Next Lesson in the footer → `lesson_navigated` with `direction: "next"`.
8. Search from the header. In the PostHog activity view (server events do not print to the browser
   console), confirm one `search_performed` with `query_length`, `result_count`, `course_count`,
   `zero_results`, and `duration_ms`, attributed to your Clerk user when signed in.
9. Click a video result → `search_result_opened` with `result_kind: "video"`, a `rank`, and a
   `start_seconds`; the lesson opens deep-linked and also captures `lesson_resumed` plus `video_played`
   with `source: "deep_link"`.
10. Click a lesson result → `search_result_opened` with `result_kind: "lesson"` and
    `start_seconds: null`.
11. Search for nonsense ("qwertyuiop asdfgh") → `search_performed` with `zero_results: true`.
12. Verify no raw query, email, or name appears in captured event/person properties.
13. Temporarily unset `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, restart, and confirm the catalog, a lesson,
    and a search all still work, with the loud development-only console error and no captures.
