# Implementation prompt: audit and Sanity runtime fix

## Goal

Fix the shared browser runtime error on course pages and apply any npm audit remediations that do not require a breaking dependency change.

## Skills and docs read

- `AGENTS.md` — implementation prompt and approval workflow, server/client boundaries, private Sanity token requirements, and typecheck/lint/build gates.
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` — `NEXT_PUBLIC_*` browser values are inlined only when referenced directly; dynamic lookups are not inlined.
- `sanity-best-practices` — preserve the server-only data access boundary and use public variables only for browser-safe configuration.

## Findings and hypothesis

- The shared browser reports `Missing environment variable: NEXT_PUBLIC_SANITY_DATASET` from `sanity/env.ts`, reached by `components/course/course-hero.tsx` importing `sanity/lib/image.ts`.
- `.env.local` has the expected Sanity key names and `.env.example` documents them. Values were not printed or included here.
- `sanity/env.ts` reads `globalThis.process.env` dynamically. Next.js documentation confirms this pattern is not inlined for `NEXT_PUBLIC_*` values in browser bundles.
- Hypothesis: direct `process.env.NEXT_PUBLIC_SANITY_*` references will make the existing public project id, dataset, and API version available in the client bundle and remove this runtime error. A browser reload of the shared course URL is the discriminating check.
- `npm audit` reports 9 vulnerabilities in transitive Sanity/Vercel CLI dependencies. Its suggested full fix is `next-sanity@11.6.13`, marked semver-major. `npm audit fix --dry-run` could not fetch remote packages in this environment.

## Code inspected

- `sanity/env.ts`, `sanity/lib/image.ts`, and `sanity/lib/token.ts`.
- `components/course/course-hero.tsx` and the shared browser error stack.
- `.env.example` and local env key names only; no secret values were read or recorded.
- Root `package.json` and npm audit output.

## Decisions and expected files

- Update `sanity/env.ts` to use direct references for the public Sanity variables so Next can inline them.
- Keep `sanity/lib/token.ts` server-only and do not expose or modify `SANITY_API_READ_TOKEN`.
- Run `npm audit fix` without `--force`. Accept only compatible automatic updates; do not downgrade `next-sanity` or change major versions. If npm cannot fetch or no compatible fix exists, preserve the current dependency tree and report the remaining audit findings.
- Expected code change: `sanity/env.ts`. `package-lock.json` may change only if a compatible automatic audit fix is available. Do not edit `.env.local` or change unrelated existing lesson-page work.

## Security considerations

- Only `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `NEXT_PUBLIC_SANITY_API_VERSION` may be inlined into browser code.
- Keep all tokens and other private values server-only. Never print environment values.
- Do not use `npm audit fix --force` or add overrides to mask vulnerabilities without compatibility evidence.

## Acceptance criteria

1. Reloading `/courses/typescript-for-application-developers` no longer throws the Sanity dataset runtime error, and its course content/images render.
2. The lesson page still renders and its server-side Sanity fetch remains unaffected.
3. Any audit changes are semver-compatible; remaining advisories and the reason they cannot be safely fixed are reported accurately.
4. Typecheck, lint, and production build pass.

## Checks and manual test

1. Run `npm audit fix` without force, then `npm audit` and record the actual outcome.
2. Run `npm run typecheck`, `npm run lint`, and `npm run build` from the web workspace.
3. Restart the dev server to rebuild the browser bundle.
4. Reload `http://localhost:3000/courses/typescript-for-application-developers`; verify the course hero and image render with no missing-dataset page error.
5. Reload a seeded `/lessons/<slug>` route and verify its page and video embed path remain functional.
