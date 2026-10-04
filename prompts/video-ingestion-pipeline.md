# Video ingestion pipeline

Implement offline tooling that creates one Sanity `video` document per unique lesson video URL. Each
document stores chapter markers and short, timestamped transcript chunks for search. Follow
`AGENTS.md` sections 7-9 and keep all ingestion outside the web request path.

## Goal

Populate the internal `video` data used by search's chapter-first, transcript-second timestamp
resolution. Do not change the web request path or expose transcripts to the browser.

## Skills and guidance read

- `AGENTS.md` sections 7-9, 12, and 13.
- `.agents/skills/sanity-best-practices/SKILL.md` and its `references/schema.md` guide.

## Code and tooling inspected

- `studio/schemaTypes/documents/lesson.ts`: `videoUrl` is required and restricted to HTTPS YouTube,
  Vimeo, and Bunny URLs.
- `studio/schemaTypes/index.ts`, `studio/structure.ts`, `studio/sanity.cli.ts`, and
  `studio/package.json`: no video schema or ingestion commands exist yet; TypeGen writes to the root
  `sanity.types.ts`.
- `studio/scripts/context/import-context.mjs`: existing pattern loads `studio/.env.local` and invokes
  the Sanity CLI with `spawnSync`.
- Installed Sanity CLI 8.13.0 supports authenticated `sanity documents query` and
  `sanity datasets import` commands.
- `lib/video.ts`: web-side YouTube/Vimeo/Bunny URL and playback parsing. Studio is a separate npm
  workspace, so ingestion scripts should remain self-contained and must not import web modules.
- `lib/search/system-prompt.ts`, `lib/search/types.ts`, and
  `studio/scripts/context/vertex-search.ndjson`: search already expects the `video` contract with
  `videoId`, `url`, `chapters[].startSeconds/label`, and `chunks[].startSeconds/text`.
- `studio/scripts/` currently contains Context tooling only. The existing prompt's references to
  `studio/scripts/seed/resolve-videos.mjs` and `build-ndjson.mjs` are stale and must not be treated as
  existing house patterns.
- `videos.json` contains the seeded lesson-video catalog; the runner must query Sanity lessons as
  the source of truth so hand-authored lessons are included too.

## Decisions and assumptions

- Implement a YouTube ingestion adapter first. Vimeo and Bunny playback exists, but ingestion needs
  provider credentials or caption sources not configured in this project. Report those videos as
  skipped with a clear reason; do not emit incomplete video documents or claim those providers are
  fully supported. Keep the provider adapter boundary extensible.
- Discover lessons through authenticated `sanity documents query`, configured by the Studio's
  project and dataset settings. Deduplicate by parsed provider/video identity so shared URLs create
  one video document.
- Derive deterministic Sanity document ids from the video URL as required by `AGENTS.md` section 9;
  retain only datastore-safe characters. Keep the original canonical URL in the `url` field.
- Fetch YouTube caption cues and chapter metadata through a provider-specific adapter. Validate the
  chosen unauthenticated YouTube endpoints against one real catalog video during implementation;
  failures, blocked captions, and videos without captions must be reported rather than silently
  producing empty transcripts. Chapter metadata may legitimately be empty.
- Merge caption cues into short chunks, bounded by approximately 45 seconds or 350 characters,
  never splitting a cue. Floor the first cue timestamp to integer seconds, decode entities, normalize
  whitespace, and drop empty text.
- Store cache entries under `studio/scripts/ingest/.cache/` and generated NDJSON under
  `studio/scripts/ingest/videos.ndjson`; ignore both in git. Cached entries allow resume without
  repeat network requests; `--force` re-fetches.
- A small `.mjs` URL parser may mirror the provider/id portion of `lib/video.ts`; it must not duplicate
  embed-building behavior.
- Preserve the existing seed catalog and unrelated Studio scripts.

## Files expected to change

New files:

- `studio/schemaTypes/documents/video.ts`: read-only pipeline-owned video document.
- `studio/schemaTypes/objects/videoChapter.ts`: `{ startSeconds, label }` object.
- `studio/schemaTypes/objects/videoChunk.ts`: `{ startSeconds, text }` object.
- `studio/scripts/ingest/parse-video-url.mjs`: supported provider and identity parsing.
- `studio/scripts/ingest/providers/youtube.mjs`: captions and chapter extraction.
- `studio/scripts/ingest/chunk.mjs`: cue normalization and timestamped chunking.
- `studio/scripts/ingest/ingest-videos.mjs`: dataset query, deduplication, provider dispatch, cache,
  throttling, and per-video reporting.
- `studio/scripts/ingest/build-ndjson.mjs`: validate cached documents and write deterministic
  importable NDJSON.
- `studio/scripts/ingest/README.md`: prerequisites, commands, provider limits, cache behavior, and
  troubleshooting.

Existing files:

- `studio/schemaTypes/index.ts`: register video and its object types.
- `studio/structure.ts`: add a separate read-only Videos list for internal lookup documents.
- `studio/package.json`: add `ingest:videos`, `ingest:build`, and `ingest:import` scripts.
- `.gitignore`: ignore generated ingestion cache and NDJSON.
- `sanity.types.ts` and `studio/schema.json`: regenerate with TypeGen; do not hand-edit generated
  types.

## Requirements

1. The `video` schema has required `videoId`, HTTPS `url`, provider, chapters, chunks, and `ingestedAt`
   fields. Mark the document read-only with a description that the ingestion pipeline owns it. Its
   preview identifies the video and displays chapter/chunk counts.
2. Chapter and chunk object schemas require a non-negative integer `startSeconds` and non-empty
   `label` or `text`. Previews show timestamps in `mm:ss`; chapter preview includes its label.
3. Generate stable array `_key`s (`chapter-<startSeconds>` and `chunk-<index>`) so re-imports are
   deterministic.
4. The runner supports cache resume, `--force`, `--limit=N`, a modest inter-video delay, and
   persist-as-you-go. Print a per-video outcome and exit non-zero with a summary of failures. Never
   write a partial video document when caption retrieval fails or returns no usable cues.
5. The builder refuses to emit NDJSON if ids or required fields are invalid, timestamps are not
   non-negative integers and monotonic, text is empty, or chapters are unsorted. Deduplicate chapters
   by start time, trim labels, sort ascending, and drop markers beyond known video duration.
6. The pipeline writes data only to generated files until the explicit import command is run; no
   network ingestion work runs in the web request path.

## Security and operational boundaries

- Use Sanity CLI authentication for dataset reads and imports; do not add a Sanity token or put
  credentials in generated files.
- Parse and allowlist the provider/video id before constructing any outbound request. The YouTube
  adapter must only fetch YouTube endpoints, not arbitrary stored URLs.
- Keep transcript chunks in Sanity's internal lookup documents. Do not expose them through a web page
  or client-side module.
- Do not run a production dataset import or deploy the Studio during implementation without first
  confirming the selected dataset and operation; local validation and generated NDJSON are safe
  checks.

## Acceptance criteria

- The Studio exposes a read-only Videos list and TypeGen emits a `Video` type.
- A limited run against configured lesson data creates cached, complete documents for supported
  videos and clearly reports unsupported providers or unavailable captions.
- A rerun without `--force` performs no provider network requests for cached videos; generated NDJSON
  is byte-identical for identical cache contents.
- The generated NDJSON validates against the schema and imports through the documented Sanity CLI
  command.
- A filtered Vision query can find real chapter labels and transcript chunks by keyword.
- No web runtime imports or request-path changes are introduced.

## Checks

- In `studio`: `npx tsc --noEmit` and `npm run typegen`.
- In the web workspace: `npm run typecheck` and `npm run lint`; run `npm run build` if regenerated
  types or imports affect web routes/server code.
- Run a one-video live YouTube smoke test only after validating network access, then test cache reuse
  and NDJSON generation locally. Do not import into a remote dataset during checks without explicit
  confirmation of the target dataset.

## Manual test steps

1. From `studio`, run `npm run ingest:videos -- --limit=1` and confirm the output identifies the
   supported video, saves a cache entry, and reports chapter/chunk counts.
2. Repeat without `--force` and confirm it uses cache; run again with `--force` and confirm it
   re-fetches.
3. Run `npm run ingest:build`; verify the NDJSON contains one complete video document per unique
   supported URL, with integer timestamped chunks and sorted chapters.
4. Run the documented import command only after confirming the intended dataset. In Studio, inspect
   Videos and confirm the documents are read-only.
5. Use Vision to query a known chapter/transcript keyword and verify its real `startSeconds`.
