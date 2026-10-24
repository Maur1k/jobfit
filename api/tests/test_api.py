from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_parse_rejects_unsupported():
    r = client.post("/api/resume/parse", files={"file": ("a.txt", b"hello", "text/plain")})
    assert r.status_code == 400
    assert r.json()["detail"]["code"] == "unsupported"


def test_parse_rejects_oversize():
    big = b"%PDF-" + b"0" * (4 * 1024 * 1024 + 10)
    r = client.post("/api/resume/parse", files={"file": ("a.pdf", big, "application/pdf")})
    assert r.status_code == 413


def test_key_test_requires_key():
    assert client.post("/api/key/test").status_code == 400
