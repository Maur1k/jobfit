import io

from fastapi import HTTPException
from pypdf import PdfReader
from pypdf.errors import PdfReadError


class ResumeParseError(Exception):
    """Raised when a supported resume cannot be read."""


def extract_pdf(data: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(data))
    except (PdfReadError, ValueError, OSError) as exc:
        raise ResumeParseError from exc
    if reader.is_encrypted:
        raise HTTPException(400, {"code": "encrypted", "message": "This PDF is password-protected. Remove the password and try again."})
    return "\n".join((page.extract_text() or "") for page in reader.pages).strip()


def extract_docx(data: bytes) -> str:
    try:
        from docx import Document

        doc = Document(io.BytesIO(data))
    except (ValueError, OSError, KeyError, TypeError) as exc:
        raise ResumeParseError from exc
    return "\n".join(paragraph.text for paragraph in doc.paragraphs).strip()
