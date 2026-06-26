# Mariocart-RSVP

RSVP website for the annual Mario Kart tournament.

A small C++ backend (the goal of this repo is to learn C++), with a Next.js /
React frontend planned separately.

## Architecture

```
apps/
  server/        C++ HTTP API (Crow + libpqxx)
    src/
      main.cpp   routes + server bootstrap
      db.hpp     env config + row→JSON helpers
  web/           Next.js + React front-end (mobile-first, see apps/web/README.md)
db/
  migrations/    SQL migrations applied with psql
```

## Web frontend

The `apps/web` Next.js app is the player-facing site (RSVP, two seeding
minigames, standings). It runs independently and falls back to in-memory mock
data when the API is down, so you can develop it without the backend:

```sh
cd apps/web
npm install
npm run dev      # http://localhost:3000
```

It expects the API at `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`).
See `apps/web/README.md` for the typed API contract and the backend changes the
RSVP/score/standings flow will need (a `phone` column, `POST /api/scores`, and
`GET /api/standings`).

- **HTTP:** [Crow](https://crowcpp.org) — Flask-like routing, minimal setup.
- **Database:** PostgreSQL via [libpqxx](https://pqxx.org).
- **Dependencies:** [vcpkg](https://vcpkg.io) (manifest mode, see `apps/server/vcpkg.json`).
- **Build:** CMake + presets.

## Prerequisites

- A C++17 compiler, CMake ≥ 3.21, git
- PostgreSQL (the `psql` / `createdb` client tools must be on `PATH`)

`vcpkg` is cloned and bootstrapped automatically by `make setup` — no global
install needed.

## Quickstart

```sh
make setup       # one time: clone & bootstrap vcpkg (downloads + builds deps later)
make db-create   # one time: create the local "mariokart_rsvp" database
make migrate     # apply db/migrations/*.sql
make run         # configure + build + start the API on :8080
```

`make run` configures and builds on first use, so the very first run takes a
while (vcpkg compiles Crow, asio, and libpqxx). Subsequent runs are fast.

Configuration is read from `.env` (gitignored):

| Variable       | Default                                        |
| -------------- | ---------------------------------------------- |
| `DATABASE_URL` | `postgresql://localhost:5432/mariokart_rsvp`   |
| `PORT`         | `8080`                                          |

## API

| Method   | Path              | Description           |
| -------- | ----------------- | --------------------- |
| `GET`    | `/health`         | Liveness check        |
| `GET`    | `/api/rsvps`      | List RSVPs            |
| `GET`    | `/api/rsvps/{id}` | Get one RSVP          |
| `POST`   | `/api/rsvps`      | Create an RSVP        |
| `DELETE` | `/api/rsvps/{id}` | Delete an RSVP        |

`POST` body:

```json
{
  "name": "Luigi",
  "email": "luigi@example.com",
  "attending": true,
  "guests": 2,
  "favorite_character": "Yoshi",
  "message": "Bringing the green shells."
}
```

Only `name` and `email` are required. Example:

```sh
curl -s localhost:8080/api/rsvps \
  -H 'Content-Type: application/json' \
  -d '{"name":"Luigi","email":"luigi@example.com","guests":2}'
```

CORS is open (`*`) so the Next.js dev server can call the API directly.

## Testing

Black-box HTTP tests live in `apps/server/__tests__/` (pytest + `requests`). They
drive the running API over HTTP — no C++ test harness required.

One-shot (builds, launches the server, runs the suite, tears it down):

```sh
make db-create migrate   # one time: database must exist and be migrated
make test
```

Or, for a faster inner loop, run the server and tests in separate terminals:

```sh
make run                 # terminal 1
make test                # terminal 2 — reuses the already-running server
```

`make test` (via `test.sh`) creates a local virtualenv at
`apps/server/__tests__/.venv` and installs `apps/server/requirements-dev.txt`
on first run. Point the suite at a non-default server with `TEST_BASE_URL`:

```sh
TEST_BASE_URL=http://localhost:9000 make test
```
