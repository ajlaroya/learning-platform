# Implementation prompt: Intelligent search end to end

## Goal

Implement Vertex intelligent search across course and lesson content: connect the server-side search API to Sanity Context MCP, ground its results against Sanity, and build the `/search` results page with video-moment and lesson result cards. Make the existing home hero search field submit to this page. Match `design/vertex-search.png` on desktop and adapt it cleanly to mobile.

## Skills and docs read

- `AGENTS.md` — product boundaries and search requirements in sections 5-13, including server-only credentials, grounded results, chapter-first video lookup, full results and the required checks.
- `.agents/skills/sanity-best-practices/SKILL.md` — Sanity integration and GROQ practices.
- `.agents/skills/create-agent-with-sanity-context/SKILL.md` and `agent/skills/create-agent-with-sanity-context/references/nextjs-agent.md` — MCP HTTP transport, Bearer auth, tool discovery, and initial-context injection.
- `.agents/skills/dial-your-context/SKILL.md` — Context instructions must be concise schema deltas and factual.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` — current Next.js Route Handler API.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` — Client Component query-string behavior and required Suspense boundary for prerendered routes.

## Code inspected

- `package.json` — Next.js 16.3.4, React 19, `next-sanity`, PostHog, and Lucide are installed; AI SDK, OpenAI provider, MCP SDK, and Zod are not.
- `app/page.tsx`, `components/home/hero.tsx`, `components/ui/search-input.tsx` — home hero search is currently a non-form input with no search navigation.
- `app/` — no search page or API route currently exists.
- `sanity/lib/client.ts`, `fetch.ts`, `token.ts`, `env.ts` — private server-side Sanity client/read token and existing server fetch conventions.
- `sanity/lib/queries.ts` — current course and lesson projections; a lesson's parent course is derived by reverse reference, and the course modules contain ordered lesson references.
- `studio/schemaTypes/index.ts` — the Studio registers course, lesson, instructor, category, and object schemas; there is no video document schema.
- `studio/package.json`, `studio/sanity.config.ts` — Studio is Sanity 5.31 and has no Context plugin; do not add `@sanity/context/studio` unless its peer compatibility with Sanity 5 is verified.
- `lib/routes.ts`, `lib/format.ts`, `sanity/lib/image.ts` — `lessonHref(slug, startSeconds)`, positional lesson labels, timestamp formatting, and Sanity image URL construction already exist.
- `components/layout/site-header.tsx`, `page-frame.tsx`, `app/courses/page.tsx`, and `components/analytics/events.ts` — existing page shell and client-side analytics conventions.
- `prompts/intelligent-search.md` and `prompts/search-results-page.md` — prior partial proposals; they are not implementation evidence and contain assumptions contradicted by the current code. This end-to-end prompt supersedes their split/deferred scope without deleting either file.
- `design/vertex-search.png` — target search results page reference.

## Decisions and assumptions

1. The API accepts `{ query, sort }` and returns validated JSON after the model tool loop and a Sanity grounding pass. The page fetches it client-side so the shell and loading skeleton render immediately. Do not stream ungrounded model output to the browser.
2. The LLM may select only real lesson IDs returned by MCP tools. The server re-reads each selected lesson and derives every displayed title, course, module, positional label, key point, duration, image, and href from Sanity. Drop hits that cannot be resolved.
3. Search course and lesson documents. Course data supplies course context and course-level matching, while results remain the two required kinds: lesson-topic results and video moments attached to a lesson. Do not invent a standalone course-result kind.
4. No video document type or video documents exist in the current Studio/schema. Implement the discriminated video result shape and chapter-then-transcript query rules for future ingestion, but return no video-moment cards or timestamps until a real video document supports the match. Current results should therefore be lesson results only.
5. Video moments, once data exists, must join a video document to the lesson using the real video URL; match chapter labels first and inspect transcript chunks only when no chapter matches. Never expose a full transcript or whole chunks/chapters arrays to the model.
6. The result page follows the design reference. It includes query heading, result count and distinct course count, search field, relevance/newest/shortest sorting, lesson and video layouts, loading/error/empty states, and a Browse all courses action. The search reply is not rendered as chat prose.
7. The home hero input becomes an accessible search form. Query and sort are shareable URL state; changing sort updates the URL and re-requests the API. Use `Suspense` around Client Components that call `useSearchParams` where required by Next 16.
8. Use the existing browser analytics helper for a `search_performed` event, extending its typed event list if appropriate. Do not create a nonexistent server PostHog client or duplicate capture.
9. Create the Context document as importable NDJSON if Studio 5 cannot support the Context plugin. Scope it to published course, lesson, instructor, category, and video content; use slug `vertex-search`. Instructions contain only non-obvious query rules: reverse course lookup from lesson, positional module/lesson numbering, Portable Text via `pt::text`, wildcarded token matching, internal video lookup, chapter-first fallback, and no fabricated timestamp. Do not install the incompatible Studio plugin.
10. Read package/type docs for current compatible AI SDK, OpenAI provider, MCP client, and Zod APIs before implementing. Preserve existing package conventions and verify actual installed SDK types rather than relying on examples for another version.

## Expected files

Likely additions:

- `app/api/search/route.ts`
- `app/search/page.tsx`
- `components/search/search-results.tsx`, search form, result cards, course icon, and loading/empty/error UI as needed
- `lib/search/types.ts`, `mcp.ts`, `system-prompt.ts`, and grounding helper(s)
- `studio/scripts/context/vertex-search.ndjson` and a short import README if the plugin is not compatible

Likely changes:

- `package.json` and `.env.example` for server-only MCP/OpenAI configuration and dependencies
- `sanity/lib/queries.ts` for a typed lesson/course enrichment query
- `components/home/hero.tsx` and `components/analytics/events.ts`
- `lib/routes.ts` only if a search URL helper is useful
- `sanity.types.ts` only through Studio TypeGen if query/schema changes require it; never hand-edit generated types

Keep the final set of files minimal and do not add unrelated features.

## Requirements and security

- Validate request body with Zod before contacting MCP or the model; trim and cap query length at 200 characters. Validate sort against `relevance`, `newest`, and `duration`.
- Keep `SANITY_API_READ_TOKEN`, MCP URL, and `OPENAI_API_KEY` server-only. Browser code calls only `/api/search` and never sees model tools, raw MCP output, credentials, or the Context endpoint.
- Fetch and cache `/initial-context` server-side; omit `initial_context` from tools passed to the model when its content is already injected into the system prompt. Close the MCP client in `finally`.
- Repeat critical grounding, wildcard token matching, Portable Text, no-cap-to-a-handful, chapter-first lookup, and no-fabrication rules in both inline system prompt and the Context document.
- Sort relevance by model rank and sort newest/duration deterministically after Sanity grounding. Return all relevant results, not a small curated sample. `count` must equal result length and `courseCount` must use distinct grounded course IDs.
- Return generic API errors with appropriate 400/500/502 status; never return stack traces, secrets, raw MCP errors, or untrusted model fields.
- Keep search public, consistent with current browsing behavior. The route is read-only and uses no write token or mutation tool.
- Empty results link to `/courses`; errors offer a retry action; do not display fabricated sample data.

## Acceptance criteria

1. Submitting a query from the home hero navigates to `/search?q=...`; direct navigation and reload preserve query and sort.
2. `/api/search` validates malformed/oversized input with 400 and returns a typed response for a valid query when MCP and model credentials are configured.
3. Every result ID resolves to a real lesson; its lesson/course/module names, ordered `module.lesson` label, key points, image, duration, and href are Sanity-derived.
4. Current data returns lesson-topic results only. No video result or `startSeconds` is fabricated. When a real video document exists, a video result links to its lesson with the actual matched second.
5. Results show total result count and distinct course count, default to relevance, and support newest and shortest-first server sorting.
6. Empty and error states are usable, and the empty state has a working link to all courses. Loading renders stable skeleton cards.
7. The desktop page matches `design/vertex-search.png`; cards stack without horizontal overflow at 375px.
8. The Context MCP is reachable with `initial-context` and `tools/list` after Studio deployment, and the `vertex-search` Context document is imported with the intended content filter and instructions.
9. No Sanity read token, MCP response, or OpenAI key is exposed to client bundles or API responses.
10. `npm run typecheck`, `npm run lint`, and `npm run build` pass. Run a live MCP/API smoke test when credentials and the deployed Studio are available; report any external prerequisite that blocks it.

## Checks and manual test

From the repository root run:

```bash
npm run typecheck
npm run lint
npm run build
npm run dev
```

From `studio/`, inspect available scripts and environment before running Studio build/deploy, typegen, or Context import. Deploying the Studio application is required for MCP access; do not claim live MCP validation unless the endpoint succeeds.

Manual test:

1. Open the home page, enter a real course topic in the hero, and submit.
2. Confirm the results shell and skeleton render, followed by grounded cards and correct count/course count.
3. Reload the results URL and confirm the query remains; switch sort and confirm URL plus result order update.
4. Search a nonsense term and confirm the empty state and `/courses` link.
5. Test malformed API JSON and a query over 200 characters; both should return a safe 400 response.
6. At 375px, confirm cards stack and no content overflows.
7. If credentials or Studio deployment are unavailable, verify the generic error state and report the missing prerequisite without exposing secret values.
