"""JobFit API — stateless. Stores nothing; never logs request bodies or keys.

Deploy on Vercel with Root Directory = api/ (FastAPI is detected from `app`).
"""
import os

import httpx
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.routers.resume import router as resume_router

GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models"

app = FastAPI(title="JobFit API", version="0.1.0", docs_url=None, redoc_url=None)
app.include_router(resume_router)

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Gemini-Key"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/key/test")
async def test_key(x_gemini_key: str = Header(default="")) -> dict:
    """Verify a user's Gemini key with one cheap request. The key is never stored."""
    if not x_gemini_key:
        raise HTTPException(400, {"code": "missing_key", "message": "No key was sent."})
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(GEMINI_MODELS_URL, headers={"x-goog-api-key": x_gemini_key})
    except httpx.HTTPError:
        raise HTTPException(502, {"code": "network", "message": "Couldn't reach Google. Check your connection and try again."})
    if r.status_code == 200:
        return {"ok": True}
    if r.status_code == 429:
        raise HTTPException(429, {"code": "rate_limit", "message": "You've reached the free limit for now. Wait a minute and try again."})
    if r.status_code in (400, 401, 403):
        raise HTTPException(400, {"code": "invalid_key", "message": "Google didn't recognize this key. Copy it again from AI Studio."})
    raise HTTPException(502, {"code": "upstream", "message": "Google returned an unexpected error. Try again shortly."})


@app.post("/api/tailor")
async def tailor() -> dict:
    # Milestone 5: evidence-first tailoring (Master Resume -> match -> validate).
    raise HTTPException(501, {"code": "not_implemented", "message": "Tailoring arrives in milestone 5."})
