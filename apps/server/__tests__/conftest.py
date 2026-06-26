"""Shared pytest fixtures for the RSVP server's HTTP integration tests.

These are black-box tests: they drive the C++ API over HTTP, so a server must
be running and reachable at TEST_BASE_URL (default http://localhost:8080).

Start one however you like:
  * `make run`  in another terminal, then `make test` (or `pytest`) here, or
  * `./test.sh` to build, launch, test, and tear the server down in one shot.
"""
from __future__ import annotations

import os
import time
from typing import Any, Callable, Iterator
from uuid import uuid4
import random

import pytest
import requests

DEFAULT_BASE_URL = "http://localhost:8080"
# How long to wait for the server to come up before giving up. Lower it in CI
# (or to verify the "server down" path) with TEST_HEALTH_TIMEOUT.
HEALTH_TIMEOUT_SECONDS = float(os.environ.get("TEST_HEALTH_TIMEOUT", "30"))


@pytest.fixture(scope="session")
def base_url() -> str:
    # rstrip so we can build paths by simple concatenation ("<base>" + "/path").
    return os.environ.get("TEST_BASE_URL", DEFAULT_BASE_URL).rstrip("/")


class ApiClient:
    """Thin requests.Session wrapper that prefixes the server base URL."""

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()

    def _url(self, path: str) -> str:
        return self.base_url + path

    def get(self, path: str, **kwargs: Any) -> requests.Response:
        return self.session.get(self._url(path), **kwargs)

    def post(self, path: str, **kwargs: Any) -> requests.Response:
        return self.session.post(self._url(path), **kwargs)

    def delete(self, path: str, **kwargs: Any) -> requests.Response:
        return self.session.delete(self._url(path), **kwargs)


@pytest.fixture(scope="session", autouse=True)
def _wait_for_server(base_url: str) -> None:
    """Block until the server answers /health, or stop the run with guidance."""
    deadline = time.monotonic() + HEALTH_TIMEOUT_SECONDS
    last_error: Exception | None = None
    while time.monotonic() < deadline:
        try:
            resp = requests.get(base_url + "/health", timeout=2)
            if resp.status_code == 200:
                return
        except requests.RequestException as exc:
            last_error = exc
        time.sleep(0.5)
    pytest.exit(
        f"Server not reachable at {base_url} after {HEALTH_TIMEOUT_SECONDS}s "
        f"(last error: {last_error}).\n"
        f"Start it with `make run` in another terminal, or run the whole suite "
        f"with `./test.sh`.",
        returncode=1,
    )


@pytest.fixture
def api(base_url: str) -> ApiClient:
    return ApiClient(base_url)


def unique_email() -> str:
    """A fresh email so each created RSVP clears the UNIQUE(email) constraint."""
    return f"test-{uuid4().hex[:12]}@example.com"

def unique_phone() -> str:
    """A fresh email so each created RSVP clears the UNIQUE(email) constraint."""
    num = [str(int((random.random() * 10) // 1)) for _ in range(7)]
    return f"810{''.join(num)}"


@pytest.fixture
def make_rsvp(api: ApiClient) -> Iterator[Callable[..., dict[str, Any]]]:
    """Factory that POSTs an RSVP and deletes every row it created on teardown.

    Usage:
        rsvp = make_rsvp()                 # minimal: name + unique email
        rsvp = make_rsvp(guests=2, ...)    # override / add any field
    """
    created_ids: list[int] = []

    def _make(**overrides: Any) -> dict[str, Any]:
        payload: dict[str, Any] = {"name": "Test Racer", "email": unique_email(), "phone": unique_phone()}
        payload.update(overrides)
        resp = api.post("/api/rsvps", json=payload)
        assert resp.status_code == 201, f"create failed: {resp.status_code} {resp.text}"
        body = resp.json()
        created_ids.append(body["id"])
        return body

    yield _make

    # Best-effort cleanup; a row a test already deleted just 404s here.
    for rsvp_id in created_ids:
        api.delete(f"/api/rsvps/{rsvp_id}")
