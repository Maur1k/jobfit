from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.parsers import ResumeParseError, extract_docx, extract_pdf

MAX_UPLOAD_BYTES = 4 * 1024 * 1024

router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)) -> dict:
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, {"code": "too_large", "message": "File is over 4 MB. Export a smaller PDF or DOCX."})
    try:
        if data.startswith(b"%PDF-"):
            text = extract_pdf(data)
        elif data.startswith(b"PK"):
            text = extract_docx(data)
        else:
            raise HTTPException(400, {"code": "unsupported", "message": "Upload a PDF or DOCX file."})
    except HTTPException:
        raise
    except ResumeParseError:
        raise HTTPException(400, {"code": "unreadable", "message": "This file couldn't be read. Try re-exporting it."})
    if not text:
        raise HTTPException(422, {"code": "no_text", "message": "No text found. Scanned images aren't supported yet."})
    return {"text": text, "chars": len(text)}
