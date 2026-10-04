# Video ingestion

This offline Studio tool creates internal `video` documents for YouTube lesson URLs. It reads lesson
URLs from the configured Sanity dataset, stores caption cues in a local cache, and builds importable
NDJSON. Vimeo and Bunny URLs are reported as skipped until their ingestion credentials and adapters
are configured.

## Requirements

- Run commands from `studio/`.
- Set `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` in `studio/.env.local` or the process
  environment.
- Be authenticated with the Sanity CLI (`npx sanity login`). No Sanity token is added to this tool.

## Commands

```sh
npm run ingest:videos -- --limit=1
npm run ingest:videos
npm run ingest:videos -- --force
npm run ingest:build
npm run test:ingest
npm run ingest:import -- --confirm-dataset=YOUR_DATASET
```

The import command replaces documents with matching deterministic ids in the explicitly confirmed
dataset. Review the configured project and dataset before running it.

## Behavior

- Lessons are discovered with the Sanity CLI, then deduplicated by provider and video identity.
- YouTube metadata is fetched from YouTube watch/player endpoints. Captions are requested as JSON3,
  with XML parsing supported for caption track responses. A missing or blocked transcript is an
  explicit failure; no empty transcript document is written.
- Chapters are deduplicated by start second and sorted. Transcript cues are normalized and merged
  into chunks at cue boundaries, approximately 45 seconds or 350 characters per chunk.
- Successful documents are cached immediately under `.cache/`. Subsequent runs reuse cache; use
  `--force` to fetch again. `--limit=N` limits supported YouTube videos after dataset discovery.
- `ingest:build` validates all cache entries and writes deterministic `videos.ndjson`. The cache and
  NDJSON are generated artifacts and are not committed.

If YouTube changes its unauthenticated player/caption behavior, the runner reports a failure for
that video. Check that captions are available on the source video and rerun with `--force` after
resolving provider access.
