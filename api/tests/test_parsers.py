from pathlib import Path

from fastapi.testclient import TestClient

from main import app


FIXTURES = Path(__file__).parent / "fixtures"
client = TestClient(app)


def parse_fixture(name: str, filename: str = "resume.pdf"):
    data = (FIXTURES / name).read_bytes()
    return client.post("/api/resume/parse", files={"file": (filename, data, "application/octet-stream")})


def test_parse_text_pdf():
    response = parse_fixture("text.pdf", "resume.docx")
    assert response.status_code == 200
    assert "Evidence-first product designer" in response.json()["text"]
    assert "Reduced onboarding time by 40%" in response.json()["text"]


def test_parse_docx_headings_and_bullets():
    response = parse_fixture("headings.docx", "resume.pdf")
    assert response.status_code == 200
    text = response.json()["text"]
    assert "Experience" in text
    assert "Built an accessible design system" in text


def test_parse_rejects_encrypted_pdf():
    response = parse_fixture("encrypted.pdf")
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "encrypted"


def test_parse_rejects_scanned_pdf_without_text():
    response = parse_fixture("scanned.pdf")
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "no_text"


def test_parse_detects_content_not_extension():
    response = parse_fixture("text.pdf", "resume.txt")
    assert response.status_code == 200


def test_parse_rejects_file_over_limit():
    data = b"%PDF-" + b"0" * (4 * 1024 * 1024)
    response = client.post(
        "/api/resume/parse",
        files={"file": ("resume.pdf", data, "application/octet-stream")},
    )
    assert response.status_code == 413
