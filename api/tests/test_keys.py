import httpx
import pytest
from fastapi.testclient import TestClient

import main


FAKE_KEY = "AIzaTEST_FAKE_KEY_0000"
client = TestClient(main.app)


class FakeResponse:
    def __init__(self, status_code: int):
        self.status_code = status_code


class FakeClient:
    def __init__(self, response: FakeResponse | None = None, error: Exception | None = None, **_: object):
        self.response = response
        self.error = error

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_: object):
        return None

    async def get(self, *_: object, **__: object):
        if self.error:
            raise self.error
        return self.response


@pytest.mark.parametrize(
    ("status_code", "expected_status", "expected_code"),
    [
        (200, 200, None),
        (400, 400, "invalid_key"),
        (401, 400, "invalid_key"),
        (403, 400, "invalid_key"),
        (429, 429, "rate_limit"),
        (500, 502, "upstream"),
    ],
)
def test_key_test_maps_google_responses(monkeypatch, status_code, expected_status, expected_code):
    monkeypatch.setattr(main.httpx, "AsyncClient", lambda **kwargs: FakeClient(FakeResponse(status_code), **kwargs))

    response = client.post("/api/key/test", headers={"X-Gemini-Key": FAKE_KEY})

    assert response.status_code == expected_status
    if expected_code is None:
        assert response.json() == {"ok": True}
    else:
        assert response.json()["detail"]["code"] == expected_code


def test_key_test_maps_network_errors(monkeypatch):
    monkeypatch.setattr(
        main.httpx,
        "AsyncClient",
        lambda **kwargs: FakeClient(error=httpx.ConnectError("offline"), **kwargs),
    )

    response = client.post("/api/key/test", headers={"X-Gemini-Key": FAKE_KEY})

    assert response.status_code == 502
    assert response.json()["detail"]["code"] == "network"


def test_key_test_requires_header():
    response = client.post("/api/key/test")

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "missing_key"


def test_key_is_not_logged_on_failure(monkeypatch, caplog):
    monkeypatch.setattr(main.httpx, "AsyncClient", lambda **kwargs: FakeClient(FakeResponse(500), **kwargs))

    client.post("/api/key/test", headers={"X-Gemini-Key": FAKE_KEY})

    assert FAKE_KEY not in caplog.text
