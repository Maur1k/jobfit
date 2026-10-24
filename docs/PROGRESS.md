# JobFit rebuild progress

Updated: 2026-10-24

Repository: https://github.com/Maur1k/jobfit

## Project starting point

JobFit was rebuilt as an open-source resume tailoring app with:

- React, TypeScript, Vite, and Dexie in `web/`
- FastAPI in `api/`
- IndexedDB-only browser storage
- A stateless API with no server database or user accounts
- Bring Your Own Gemini key
- MIT licensing

The rebuild plan in [REBUILD_PLAN.md](REBUILD_PLAN.md) is the source of truth. Milestone 4 is currently implemented on the `milestone-4` branch and is proposed in pull request [#1](https://github.com/Maur1k/jobfit/pull/1).

## Work completed from the beginning

### Initial scaffold and repository setup

- Created the FastAPI and React/Vite starters.
- Added the MIT license, README, `.env.example`, `.gitignore`, CI workflow, and rebuild plan.
- Added the Master Resume data model, Dexie schema, evidence helpers, editor, validation, local saving, live preview, and print styling.
- Added the API health endpoint, Gemini key-test endpoint, and resume parsing endpoint.
- Initialized Git with `main` as the default branch.
- Added the GitHub remote and pushed the initial history to `Maur1k/jobfit`.

### Baseline verification

The first verification found:

- Backend tests passed locally.
- Frontend tests passed locally.
- Frontend build initially failed because Vite’s `ImportMeta.env` type was missing.
- The FastAPI development server initially could not start because `uvicorn` was absent from development requirements.

Fixes:

- Added `web/src/vite-env.d.ts`.
- Added `uvicorn[standard]` to `api/requirements-dev.txt`.

### Milestone 3: upload and parsing

Backend:

- Moved parsing into `api/app/services/parsers.py`.
- Moved the upload route into `api/app/routers/resume.py`.
- Preserved content-signature detection rather than trusting file extensions.
- Preserved the 4 MB cap, encrypted-PDF rejection, unreadable-file error, and scanned-PDF/no-text error.
- Added fixtures for text PDF, DOCX headings/bullets, encrypted PDF, scanned-style PDF, and renamed PDF content.
- Changed the oversized-file test to generate its payload in memory.
- Regenerated the scanned fixture as a real blank PDF page.

Frontend:

- Added PDF/DOCX upload to the Resume tab.
- Added review-before-save behavior.
- Added “Use this text” and “Discard”.
- Added `MasterResume.rawText`.
- Added compatibility normalization for older IndexedDB records.
- Added API error handling through `web/src/lib/api.ts`.

### Dependency audit and repository publication

- Ran full and production npm audits.
- Production npm audit reported no vulnerabilities.
- Full npm audit reported six development-only findings.
- Ran `npm audit fix` without `--force`; no same-major fixes were available.
- Ran one-time `pip-audit` in the API virtualenv.
- Documented audit findings and deferred upgrades in [SECURITY.md](SECURITY.md).
- Added ignored audit-report patterns and removed temporary audit JSON files.
- Checked for `.env` files and staged-file bloat before Git publication.
- Confirmed no tracked `.env` file and no tracked file over 1 MB.

### Milestone 4: key onboarding and management

Backend:

- Added mocked tests for the existing `/api/key/test` endpoint.
- Covered success, invalid key, rate limit, upstream failure, network failure, and missing header.
- Added a `caplog` test ensuring the fake key never appears in logs.
- Added `api/tests/conftest.py` after CI exposed a Linux import-path issue.

Frontend:

- Added the Dexie settings repository:
  - Gemini key get/set/remove
  - onboarding state get/set
  - clear-all-data across all four tables
- Added `fake-indexeddb` and Vitest setup.
- Added the five-step onboarding wizard.
- Added privacy acknowledgement gating.
- Added AI Studio link with `noopener noreferrer`.
- Added password key input with Show/Hide.
- Added test-before-save behavior.
- Added shared API error-code mapping.
- Added screenshot fallback placeholders and development-only warnings.
- Added heading focus management and live error announcements.
- Added Settings key masking, replacement, removal confirmation, setup-again flow, and typed `DELETE` confirmation.
- Added the no-key Tailor notice.
- Added the screenshot capture checklist in [SCREENSHOTS.md](SCREENSHOTS.md).

## Git history

The original `main` history:

| Commit | Message |
|---|---|
| `2967f94` | Scaffold API, web app, CI, and docs |
| `418b948` | Add master resume editor with local saving and preview |
| `1ab217b` | Add PDF and DOCX upload with review step |
| `d27e6b5` | Add security audit and fixes |
| `50e3db4` | Update plan status and implementation notes |

Milestone 4 branch commits:

| Commit | Message |
|---|---|
| `c57a2e8` | Add Gemini key endpoint tests |
| `b055a98` | Add local key and onboarding data store |
| `09d312b` | Add five-step Gemini key onboarding |
| `e90fb58` | Add key management settings screen |
| `6cecbd5` | Document Milestone 4 screenshot checklist |
| `83edb74` | Fix API test imports in CI |

## Current verification

Local verification on `milestone-4`:

- API: 19 tests passed.
- Frontend: 20 tests passed.
- Frontend TypeScript/Vite build passed.
- FastAPI health endpoint responded successfully.
- Vite development server responded successfully.
- Browser checks confirmed first-visit onboarding, screenshot fallback, skip behavior, and Settings loading.

GitHub Actions for pull request [#1](https://github.com/Maur1k/jobfit/pull/1):

- API check: passed.
- Web check: passed.
- Pull request: open, mergeable, and not merged.

## Current branch and pull request

- Current branch: `milestone-4`
- Remote branch: `origin/milestone-4`
- Base branch: `main`
- Pull request: https://github.com/Maur1k/jobfit/pull/1
- PR status: open and mergeable
- PR checks: API and web passing
- No merge has been performed.

## Not completed yet

### Milestone 4 remaining work

- Capture and add the four real Google AI Studio screenshots:
  - `web/public/onboarding/step-1.png`
  - `web/public/onboarding/step-2.png`
  - `web/public/onboarding/step-3.png`
  - `web/public/onboarding/step-4.png`
- Review each screenshot in light and dark mode.
- Confirm screenshots contain no API keys, account details, project identifiers, or other personal information.
- Manually verify the complete five-step flow with a real test key only when the user supplies and controls that key. No real key has been used or committed.
- Merge PR #1 after review and approval.

### Planned milestones

- Milestone 5: evidence-first tailoring, Gemini tailoring calls, schema validation, evidence links, and anti-invention checks.
- Milestone 6: print-ready tailored resume output and A4 validation.
- Milestone 7: applications tracker and status persistence.
- Milestone 8: JSON export/import backup.
- Milestone 9: deployment, HTTPS, Vercel configuration, and domain change.

### Project-level work still outstanding

- Key onboarding screenshots and final live-AI-Studio copy review.
- Final decisions for the open questions in §12 of the rebuild plan:
  1. Evidence-first core confirmation.
  2. Cover letters remaining out of version 1.
  3. Domain redirect plan if the Lovable host cannot redirect.
  4. Whether exports may include the API key, currently off by default.
  5. Final Vercel project names and repository naming decisions.
- Old-repository migration and cleanup actions described in [old-repo-cleanup.md](old-repo-cleanup.md).
- Production deployment and live-domain verification.
- Future interview and technical-interview modules.

## Important constraints still in force

- No accounts or server-side user data.
- No server-side key storage.
- Gemini keys are stored only in browser IndexedDB and sent only in the `X-Gemini-Key` header for key-dependent API calls.
- No real API keys belong in source, tests, screenshots, logs, commits, or documentation.
- Milestone 4 does not implement tailoring, export/import, tracker, onboarding screenshots, or deployment.
