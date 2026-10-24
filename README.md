# JobFit

Open-source resume tailoring that never invents experience. No accounts: your resumes and
applications live in your browser. Bring your own free Gemini API key.

## How it works
1. Drop in your resume (PDF/DOCX) or type it in.
2. Paste a job description. JobFit matches it against your real experience and prints a tailored resume.
3. Track every application and its status.
Coming later: AI interview and technical-interview practice.

## Privacy
- Resumes, applications and your key are stored only in your browser (IndexedDB).
- The API is stateless and stores nothing. Request bodies and keys are never logged.
- Resume text and job descriptions are sent to Google's Gemini API using your key. On Gemini's free
  tier, Google may use requests to improve its products — use a paid key if that matters to you.

## Structure
- `web/` React + TypeScript + Vite (frontend)
- `api/` Python FastAPI (stateless backend)

## Develop
    cd api && python -m venv .venv && source .venv/bin/activate
    pip install -r requirements-dev.txt && pytest -q
    uvicorn main:app --reload        # http://localhost:8000

    cd web && cp ../.env.example .env.local && npm install && npm run dev

## Deploy on Vercel (two projects, one repo)
1. **API:** new Vercel project, Root Directory `api`, env `ALLOWED_ORIGINS` = your frontend URL.
2. **Web:** new Vercel project, Root Directory `web`, env `VITE_API_URL` = the API project's URL.
Vercel Functions cap request bodies at 4.5 MB, so uploads are limited to 4 MB.

## License
MIT
