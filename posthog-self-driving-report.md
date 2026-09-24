# PostHog Self-driving setup

## Summary
PostHog Self-driving is configured for this Next.js learning platform. Session Replay and Error Tracking were already enabled; Support (Conversations) was enabled. Health, error-tracking, and support signal sources are enabled, and findings should begin appearing in the [Self-driving inbox](https://us.posthog.com/project/257064/inbox) within about 30 minutes.

## AI data processing
Approved by the wizard's organization-level gate.

## GitHub
GitHub was already connected before this setup. No issue-tracker responder was enabled because no connected tools were selected.

## Products enabled

| Product | Status | SDK check |
|---|---|---|
| Session Replay | Already enabled | `posthog.init` has no recording opt-out. |
| Error Tracking | Already enabled | `capture_exceptions: true` is configured. |
| Support / Conversations | Enabled | Connect an inbound email, inbox, or Slack channel before tickets can arrive. |

## Signal sources

| Signal source | Action |
|---|---|
| `health_checks` / `health_issue` | Enabled (`01a0d0e2-ec4e-73a3-b45f-6d99d125cbc8`) |
| `error_tracking` / `issue_created` | Enabled (`01a0d0e2-ec65-7879-9049-c4cdc616bee8`) |
| `error_tracking` / `issue_reopened` | Enabled (`01a0d0e2-ec08-731c-96b1-94b9b44f34a5`) |
| `error_tracking` / `issue_spiking` | Enabled (`01a0d0e2-ec15-77d1-8e5b-f1fe56c903dd`) |
| `conversations` / `ticket` | Enabled (`01a0d0e2-ece9-7857-b0bd-8b0200dd48d8`) |
| `signals_scout` / `cross_source_issue` | On by default; no opt-out row was created. |
| Session replay responder | Deliberately skipped; Replay Vision scanners provide this coverage. |

## Connected tools
No external issue tracker, support desk, error tracker, security scanner, review, or search-analytics tool was selected. No connected-tool responders were added.

## Scout troop

**Enabled (6):**
- **General** — cross-product correlations and otherwise-unowned surfaces.
- **Product analytics** — saved behavioral-flow conversion and retention regressions.
- **Web analytics** — traffic, attribution, landing-page, bounce, and 404 changes.
- **Observability gaps** — high-value events that lack insight, dashboard, or alert coverage.
- **Learning entry funnel** — course discovery or course-entry traffic that no longer turns into lesson selection while discovery volume holds.
- **Course choice friction** — rising module exploration or bookmarking without lesson selection for a specific course.

**Disabled (23):** surface-specific scouts without current evidence of active use (AI observability, APM, conversations, CSP, customer analytics, data pipelines/warehouse, experiments, feature flags, logs, revenue, surveys, tasks, skills store, MCP calls, insight alerts, PR follow-up, web vitals); anomaly detection is deferred until meaningful saved time-series exist. The Error Tracking and Session Replay scouts remain disabled because those surfaces are covered respectively by their native source and the Replay Vision scanners. Inbox validation is deferred until Self-driving has resolved reports to validate.

The verified budget is **100 runs/day**, with **0 used** and **100 remaining** at setup time. The current banner says: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

## Custom scouts

| Scout | What it watches | Discriminator / coverage rationale |
|---|---|---|
| `signals-scout-learning-entry-funnel` | Catalog and course entry through lesson selection | Speaks up only when lesson-entry conversion falls while course discovery holds. It specializes the catalog-to-lesson seam that the general and saved-flow scouts do not target directly. |
| `signals-scout-course-choice-friction` | Course-content exploration and bookmarks before lesson selection | Speaks up when hesitation rises relative to lesson selection at useful course-level volume. It identifies course or module choice friction rather than generic traffic changes. |

Both scouts include low-volume, incomplete-window, broad-traffic-change, duplicate-report, and intentional-content-change disqualifiers. If either becomes noisy, set its `emit` setting to `false` in PostHog to run it in dry-run mode.

## Replay Vision scanners
A scanner is an LLM that watches individual session recordings on a schedule and pushes high-confidence observations to the inbox. These are the only items in this setup that spend Replay Vision quota. Findings start at half weight and need corroboration before promotion into a report.

| Scanner | Status | Scope | Sampling | Estimated monthly spend |
|---|---|---|---:|---:|
| **Vertex course access breakage** | Created | URLs containing `/courses`, covering catalog, course detail, module expansion, and lesson-entry breakage | 50% | 0 observations / 0 credits |
| **Vertex learner frustration** | Created | Sessions containing `$rageclick`; no URL filter | 100% | 0 observations / 0 credits |

The Replay Vision budget has 2,500 credits remaining and is not exhausted. No recordings currently exist, so both scanners are armed and will begin working once recorded sessions arrive. Rate scanner observations in Replay Vision to generate configuration recommendations for review.

## Follow-ups
- [ ] Connect a Support inbound channel (email, inbox, or Slack) so the enabled Conversations responder can receive tickets.
- [ ] Generate real browser sessions; Replay Vision scanners will start observing once Session Replay has recordings.

## What happens next
Fresh scouts are picked up by the coordinator within about 30 minutes and use the daily run budget. Their findings cluster into reports in the Self-driving inbox, where actionable reports can begin coding tasks.

## Repository changes
- Created `posthog-self-driving-report.md`.
- No application source, dependency, or environment file was changed.
