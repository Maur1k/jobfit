# JobFit Rebuild Plan

Status: **Draft v1.0**, October 2026
Owner: Maurik Angelo Fernandez
Repository: `Maur1k/JobFit-TailorUrResume-` (new clean repo; the old one is retired after cleanup)
Live domain: `pagawa-resume.lovable.app` (Lovable-hosted, to be re-pointed at the rebuilt frontend)

---

## 1. Summary

JobFit helps job seekers produce a resume tailored to a specific job, without inventing experience. The rebuild simplifies the existing Lovable app into an open-source tool with no user accounts, where:

- the user's data lives only in their browser,
- AI runs on the user's own free Google Gemini API key (Bring Your Own Key, "BYOK"),
- the frontend is React and the backend is Python (FastAPI), deployed on Vercel.

The core promise is unchanged: **the tailored resume only presents experience the user actually has.**

## 2. Goals and non-goals

### Goals

1. A user can drop in a resume (PDF or DOCX), or type one in, and keep it as a Master Resume.
2. A user can paste a job description and receive a tailored, printable resume.
3. A user can track applications and edit each one's status.
4. Setup takes minutes and needs no account, password, or payment.
5. The code is open source (MIT) and easy for others to run themselves.
6. The architecture leaves room for AI interview and technical interview practice later.

### Non-goals (version 1)

- User accounts, sign-in, or cloud sync.
- Storing user data on the server.
- Cover letters and combined application packages (may return later).
- AI interview features (planned, not built).
- Mobile apps.
- Hosted AI for everyone. Version 1 requires each user's own key.

## 3. Decisions

| Area | Decision | Reason |
|---|---|---|
| Accounts | None | Privacy and simplicity; no password recovery needed |
| Data storage | Browser IndexedDB (via Dexie) | Keeps data local; handles structured records |
| Backups | JSON export and import | Replaces sync when there are no accounts |
| AI access | BYOK, starting with Gemini's free tier | No server cost; the user controls their key |
| Backend | Python FastAPI, stateless | Good fit for file parsing and future AI features; required by the brief |
| Frontend | React, TypeScript, Vite | Standard, well-supported, easy to open-source |
| Hosting | Vercel (two projects from one repo) | Simple deploys; both parts run on Vercel |
| Database | None on the server | No accounts means nothing to store |
| Domain | Lovable domain kept; the rebuilt frontend is served there | Preserves the current address |
| License | MIT | Permissive, widely used for open-source tools |
| Source control | New clean repo; old repo retired | Clean history; removes the committed `.env` |

### Assumptions to confirm

- **Evidence-first core is kept.** The Master Resume and evidence-linked matching from the current app are carried into the rebuild. If the user prefers a simple "rewrite my resume" flow, this section changes.
- **Cover letters are out of version 1.**
- **The domain can point at the rebuilt frontend.** The Lovable host must allow this; if it doesn't, the domain forwards to a new host.

## 4. User experience

### 4.1 Main flow

1. **Set up** (first visit, optional): a five-screen wizard that walks through getting a Gemini key (see §5). Every screen has "Skip for now."
2. **Build the Master Resume**: upload a PDF or DOCX to fill it in, or enter details by hand. Edit it any time.
3. **Tailor**: paste a job description. The app matches it to the Master Resume, selects and rewords relevant experience, and shows the result with evidence links for every changed line.
4. **Review and print**: check the tailored resume, then print it or save it as a PDF from the browser.
5. **Track**: record the application, its status (Saved, Applied, Interview, Offer, Rejected, Withdrawn), and the tailored version used.
6. **Back up**: export all data to a file, and import it on another device.

### 4.2 Screens

| Screen | Purpose |
|---|---|
| Resume | Master Resume editor with live A4 preview and print |
| Tailor | Job description input and tailored result |
| Applications | Tracker of applied jobs, with status editing |
| Settings | Gemini key management, data export/import, delete all data |
| Setup wizard | Key onboarding (five steps, screenshots) |

### 4.3 Key onboarding (five steps)

Each step has a screenshot and a "What you should see" checkpoint. Google's interface changes, so every label and screenshot is checked against the live AI Studio page before launch.

1. **Why you need a key.** A plain explanation: AI tailoring uses Google's Gemini, and the free key takes about two minutes.
2. **Privacy notice.** The user must tick "I understand" before continuing. The notice states:
   - Resumes and applications stay in the browser; nothing is stored on a server.
   - Resume text and job descriptions are sent to Google using the user's key.
   - On the free tier, Google may use requests to improve its products. Users who object should use a paid key.
3. **Open Google AI Studio.** A button opens the site in a new tab; the user returns when done.
4. **Accept terms and create a key.** Accept the terms (check the required box), click **Get API key**, then **Create API key**, and choose a new project.
5. **Paste and test.** The user pastes the key (it starts with `AIza`). The app makes one small test request. On success the key is saved on the device; on failure it shows the specific reason and fix.

**Error states shown to the user:**

| Problem | Message | Fix |
|---|---|---|
| Invalid key | Google didn't recognize this key | Copy it again from AI Studio |
| Free tier unavailable in their country | The free tier isn't available in your region | Enable billing in AI Studio, or skip AI for now |
| Rate limit | You've reached the free limit for now | Wait a minute; try again |
| Network | Couldn't reach Google | Check connection and retry |

### 4.4 Empty and error states

Empty screens explain the next action. Errors say what happened and how to fix it, without apologizing. Example: "No jobs yet. Add one to start building evidence."

## 5. Technical architecture

```
Browser (React + TypeScript)
 ├─ IndexedDB (Dexie): Master Resume, tailored versions, applications, settings, onboarding state
 ├─ Onboarding wizard and Settings (key handling)
 └─ HTTPS ──► Python API (FastAPI, stateless, Vercel)
                ├─ POST /api/resume/parse   PDF or DOCX → text
                ├─ POST /api/key/test       verifies a key with one small request
                ├─ POST /api/tailor         Master Resume + job description + key → tailored output
                └─ GET  /api/health
                      │
                      └─ HTTPS ──► Google Gemini API (using the user's key)
```

### 5.1 Key handling

- The user's key is kept in the browser's IndexedDB.
- The key is sent to the API in a request header (`X-Gemini-Key`) only for the call that needs it.
- The API uses the key for that request and does not store, cache, or log it.
- Settings can show a masked key (`AIza••••Xk9`) and remove it from the device. Removing a key does not delete resumes or applications.

### 5.2 Privacy design

- The server is stateless. Request bodies are never logged.
- Export files contain user data. The export offers the key as an option, off by default, with a warning that a backup containing a key should not be shared.
- "Delete all my data" clears the browser database.
- Private or incognito windows lose data when closed. The app says so.

### 5.3 Tailoring rules

- The Master Resume is never changed by tailoring.
- Tailoring may reword, reorder, and select content. It may not add experience, skills, dates, or metrics that aren't in the Master Resume.
- Every changed line links to the evidence it came from.
- The model's output is validated against a schema before it is shown.
- Generated claims are checked against their cited evidence. Anything that doesn't match is flagged for review or reverted to the original wording.

### 5.4 Data model

| Store | Key fields |
|---|---|
| `resumes` | id, name, source (`upload` or `manual`), content (structured Master Resume), updatedAt |
| `tailored` | id, resumeId, jobDescription, output, createdAt |
| `applications` | id, company, role, url, status, appliedAt, tailoredId, notes |
| `settings` | key, value (Gemini key, onboarding progress, preferences) |

The Master Resume holds evidence records. Each achievement has a stable ID so tailored output can reference it.

### 5.5 Backend API

| Endpoint | Input | Output | Notes |
|---|---|---|---|
| `GET /api/health` | none | `{status}` | Uptime check |
| `POST /api/key/test` | key in header | `{ok}` or typed error | Single small request to Google |
| `POST /api/resume/parse` | PDF or DOCX, max 4 MB | plain text | File type detected by content, not extension |
| `POST /api/tailor` | Master Resume JSON, job description, key in header | tailored JSON with evidence links | Milestone 5 |

### 5.6 Platform limits

- **Vercel request body limit: 4.5 MB.** Uploads are capped at 4 MB. Larger files return a clear message asking the user to export a smaller file.
- **Vercel function duration.** Tailoring calls to Gemini may take several seconds. Default Vercel limits are sufficient, but the API should time out cleanly and show a retry message.
- **Gemini free-tier limits** are strict and not fully published. The app handles rate-limit errors gracefully.

### 5.7 Security

- File checks: content-type detection, 4 MB size limit, and rejection of password-protected or corrupt files.
- CORS allows only the frontend origin, set through `ALLOWED_ORIGINS`.
- Per-IP rate limiting on the tailoring endpoint.
- Input length caps on job descriptions and resume text.
- HTTPS only; security headers set.
- Dependencies pinned. CI runs the tests and the build on every push.
- The repository never contains secrets. `.env` is ignored by Git, and `.env.example` documents the variables.

## 6. Repository layout

```
jobfit/
├─ api/                    Python (FastAPI)
│  ├─ main.py
│  ├─ tests/
│  ├─ requirements.txt
│  └─ requirements-dev.txt
├─ web/                    React + TypeScript + Vite
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ db/               Dexie schema
│  │  ├─ lib/              API client
│  │  └─ resume/           types, evidence logic, store, editor, preview
│  └─ package.json
├─ docs/
│  ├─ REBUILD_PLAN.md      this document
│  └─ old-repo-cleanup.md  steps to clean the old repository
├─ .github/workflows/ci.yml
├─ .env.example
├─ .gitignore
├─ LICENSE                 MIT
└─ README.md
```

Planned additions: `web/src/onboarding/` (wizard and screenshots), `web/src/tailor/`, `web/src/applications/`, `web/src/settings/`, and `api/app/services/` for Gemini calls and prompts.

## 7. Deployment

Two Vercel projects, both built from the same repository:

| Project | Root directory | Environment variable |
|---|---|---|
| `jobfit-api` | `api` | `ALLOWED_ORIGINS` = the frontend URL |
| `jobfit-web` | `web` | `VITE_API_URL` = the API project URL |

The frontend's domain is set in Vercel. Once it is live and verified, `pagawa-resume.lovable.app` is re-pointed to it. If Lovable's domain cannot be redirected, a small static page on that address forwards visitors to the new URL.

## 8. Migration from the current app

- The current app stores data in Supabase with accounts. The rebuild does not carry those accounts over.
- Before switching the domain, existing users (if any besides the owner) receive a notice to export their data from the old app, where possible, and set up again.
- The old repository's `.env` is handled first: rotate any secret that isn't a public Supabase value, then stop tracking the file. Steps are in `docs/old-repo-cleanup.md`.
- The old README's live-app link (`maujobfit.lovable.app`) is corrected to `pagawa-resume.lovable.app` before the repository is archived.
- The old UI components and copy are reused where they fit. The data layer and AI calls are rewritten.

## 9. Roadmap and milestones

| # | Milestone | Done when | Status |
|---|---|---|---|
| 1 | Repository, CI, license, README skeleton, API and web starters | CI builds and tests pass | Complete (verified locally; CI pending) |
| 2 | Master Resume editor with local saving, validation, and live preview | Create, edit, reload, and print a resume | Complete (verified locally; CI pending) |
| 3 | Resume upload and parsing (PDF, DOCX) | Parsed text matches test files | Complete (verified locally; CI pending) |
| 4 | Key onboarding wizard with screenshots, key test, error states | Every error state shows the right message | Planned |
| 5 | Tailoring with evidence links and validation | Output validates; no invented content in tests | Planned |
| 6 | Print-ready tailored resume | Print to PDF looks clean on A4 | Planned |
| 7 | Applications tracker with status editing | Status changes persist after reload | Planned |
| 8 | Export and import backup | Round trip restores all data | Planned |
| 9 | Deployment and domain change | Live over HTTPS on the chosen domain | Planned |

**Later:** AI interview and technical-interview modules, built on the same API and data model. Each will need its own design pass covering question generation, answer scoring, and how feedback is shown.

## 10. Testing and quality

- **Backend:** pytest for endpoints (health, key test requirements, parse type and size checks), and unit tests for tailoring validation once milestone 5 is built.
- **Frontend:** Vitest for the data logic (evidence IDs, reordering, validation, counting). Component tests for the editor and onboarding arrive with their milestones.
- **Manual checks:** each onboarding screenshot and label is checked against the live Google AI Studio page before release. Print output is checked on A4 in two browsers.
- **CI:** runs API tests, web tests, and the web build on every push and pull request.

## 11. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Google changes AI Studio's interface | Onboarding screenshots go out of date | Screenshots checked before each release; text labels kept generic where possible |
| Free-tier limits or data-use terms change | Users hit limits or misunderstand privacy | Clear rate-limit messages; privacy notice reviewed before each release |
| The model invents experience | Users send false claims to employers | Evidence links, schema validation, claim checking, and revert-to-original |
| Users lose data on a shared or cleared browser | Lost work | Export reminder; export and import; warning about private windows |
| Vercel body-size limit | Large resumes fail to upload | 4 MB cap with clear message; suggest exporting a smaller file |
| Secret exposure in the old repo | Account compromise | Rotate first; stop tracking `.env`; document the cleanup |
| Domain can't be redirected from the Lovable host | Old link stops working | Static forwarding page on a domain the owner controls |
| Users without a Google account | Can't use AI features | Manual editing and tracking still work without a key |

## 12. Open questions

1. Confirm the evidence-first core is kept (see §3, assumptions).
2. Confirm cover letters are out of version 1.
3. Confirm the domain plan if Lovable's host can't redirect.
4. Decide whether the export file may include the API key (currently: off by default).
5. Choose the Vercel project names and the GitHub repository name.

## 13. Glossary

- **BYOK:** Bring Your Own Key. Users supply their own AI API key.
- **Master Resume:** The user's complete, editable career record. Tailoring never changes it.
- **Evidence:** An achievement or project item in the Master Resume, with a stable ID that tailored output can cite.
- **Tailored resume:** A version of the Master Resume selected and reworded for one job description, with evidence links.
- **Stateless API:** A server that keeps nothing between requests.
- **IndexedDB:** The browser's built-in database, used here to store data on the user's device.

## Implementation notes

- Repository: https://github.com/Maur1k/jobfit
- Dependency audit: six npm development findings and Python findings were deferred; production npm dependencies had no findings. See [SECURITY.md](SECURITY.md).
- Milestone 3 baseline issues fixed: added Vite `ImportMeta.env` typings and added `uvicorn` to development requirements.
