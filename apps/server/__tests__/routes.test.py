"""HTTP integration tests for the RSVP API.

Black-box tests against a running server. Run them with `make test` (one-shot,
builds + launches + tears down) or, against a server you already started with
`make run`, just `pytest` from apps/server. Fixtures live in conftest.py.
"""
from __future__ import annotations

import time


# --- /health ---------------------------------------------------------------

def test_health(api):
    resp = api.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


# --- POST /api/rsvps -------------------------------------------------------

def test_create_minimal_uses_defaults(make_rsvp):
    rsvp = make_rsvp()  # only name + email + phone supplied
    assert isinstance(rsvp["id"], int)
    assert rsvp["attending"] is True   # column default
    assert rsvp["guests"] == 0         # column default
    assert rsvp["favorite_character"] is None
    assert rsvp["message"] is None
    assert "created_at" in rsvp

def test_create_full_payload_round_trips(make_rsvp):
    rsvp = make_rsvp(
        name="Luigi",
        attending=True,
        guests=2,
        favorite_character="Yoshi",
        message="Bringing the green shells.",
    )
    assert rsvp["name"] == "Luigi"
    assert rsvp["attending"] is True
    assert rsvp["guests"] == 2
    assert rsvp["favorite_character"] == "Yoshi"
    assert rsvp["message"] == "Bringing the green shells."


def test_create_requires_name_and_email(api):
    assert api.post("/api/rsvps", json={"phone": "No Email"}).status_code == 400
    assert api.post("/api/rsvps", json={"email": "x@example.com"}).status_code == 400
    assert api.post("/api/rsvps", json={}).status_code == 400


def test_duplicate_email_conflicts(api, make_rsvp):
    rsvp = make_rsvp()
    dup = api.post("/api/rsvps", json={"name": "Clone", "email": rsvp["email"], "phone": rsvp["phone"]})
    assert dup.status_code == 409

def test_duplicate_phone_conflicts(api, make_rsvp):
    rsvp = make_rsvp()
    dup = api.post("/api/rsvps", json={"name": "Clone", "phone": rsvp["phone"], "email": "other@ex.com"})
    assert dup.status_code == 409

# --- GET /api/rsvps/<id> ---------------------------------------------------

def test_get_returns_created_rsvp(api, make_rsvp):
    rsvp = make_rsvp(name="Peach")
    resp = api.get(f"/api/rsvps/{rsvp['id']}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == rsvp["id"]
    assert body["name"] == "Peach"


def test_get_missing_returns_404(api):
    assert api.get("/api/rsvps/999999999").status_code == 404


# --- GET /api/rsvps (list) -------------------------------------------------

def test_list_includes_created_newest_first(api, make_rsvp):
    older = make_rsvp()
    # created_at defaults to now(); sleep so the two rows get distinct
    # timestamps and the DESC ordering is deterministic.
    time.sleep(0.05)
    newer = make_rsvp()

    resp = api.get("/api/rsvps")
    assert resp.status_code == 200
    ids = [row["id"] for row in resp.json()]

    assert older["id"] in ids
    assert newer["id"] in ids
    assert ids.index(newer["id"]) < ids.index(older["id"])  # newest first


# --- DELETE /api/rsvps/<id> ------------------------------------------------

def test_delete_removes_rsvp(api, make_rsvp):
    rsvp = make_rsvp()
    assert api.delete(f"/api/rsvps/{rsvp['id']}").status_code == 204
    assert api.get(f"/api/rsvps/{rsvp['id']}").status_code == 404


def test_delete_missing_returns_404(api):
    assert api.delete("/api/rsvps/999999999").status_code == 404
