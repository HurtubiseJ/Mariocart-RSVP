# Beerio Kart World Cup — Web

Mobile-first Next.js front-end for the annual **Beerio Kart World Cup** RSVP
site. Players sign up, play two seeding minigames, and get a tournament seed.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (theme tokens in `src/app/globals.css` `@theme`)
- **Framer Motion** — hero animation + the kart page transition
- **Canvas** — the two minigames (no game framework, hand-rolled loop)
- **Zustand** — RSVP flow + transition state · **React Hook Form + Zod** — the form
- Fonts via `next/font`: **Lilita One** (titles), **Fredoka** (subheads), **Inter** (body)

## Run

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Config (`.env.local`, see `.env.example`):

| Variable               | Default                 | Purpose                                  |
| ---------------------- | ----------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8080` | Base URL of the C++ API (`apps/server`)  |
| `NEXT_PUBLIC_USE_MOCK` | `false`                 | Force the in-memory mock client          |

**Backend optional.** With `USE_MOCK=false` the app calls the real API but
transparently falls back to in-memory mock data on a *connection* error, so the
whole site is demoable with no server running. HTTP 4xx errors still surface.

## Routes

| Route        | What                                                              |
| ------------ | ---------------------------------------------------------------- |
| `/`          | Animated hero (per-letter colour-cycling title) + scroll sections |
| `/rsvp`      | Form → reaction game (3 rounds) → flappy (2 runs) → seed reveal   |
| `/standings` | Ranked players (fetch + mock fallback)                           |
| `/rules`, `/history`, `/info1` | Static placeholder content                     |

## Structure

```
src/app/         routes + layout.tsx (persistent transition) + template.tsx (reveal)
src/components/   hero/ transition/ games/ rsvp/ layout/ ui/
src/games/        engine/ (loop, canvas, input) · reaction/ · flappy/   ← pure TS, no React
src/lib/          api.ts (+ mock fallback) · scoring.ts · seed.ts · schemas.ts
src/state/        rsvpFlow.ts · transition.ts · ui.ts                    ← zustand stores
```

## Minigames

Engines are **pure TypeScript** (`src/games/`) with zero React; `GameCanvas`
hosts them with a fixed-timestep loop, high-DPI canvas, and pointer input.

- **Reaction** (`games/reaction`) — a sweeping needle; tap inside the red zone.
  3 rounds; round 3 has two zones. Tune in `reactionConfig.ts`.
- **Flappy** (`games/flappy`) — constant speed, tap to flap, best of two runs.
  Tune in `flappyConfig.ts`.

### Scoring (tunable — `src/lib/scoring.ts`)

`reactionScore = clamp(hits·HIT_VALUE − missedDistance·MISS_PENALTY, 0)`,
`flappyScore = bestGates·GATE_VALUE`, combined 50/50 into the cumulative score.
The seed is computed client-side (`lib/seed.ts`) against a mock field, then
overridden by the server's authoritative seed when the backend is live.

> The reaction formula treats missed distance as a *penalty* (PLAN.md phrased it
> ambiguously). The raw `{hits, missedDistance}` are sent to the backend so it
> can recompute under the canonical formula. Adjust the constants freely.

## Backend deltas (for the C++ API re-sync)

The current `apps/server` keys RSVPs on `email`. This front-end's contract
(`src/lib/api.types.ts`) needs:

1. `rsvps`: add required `phone`; make `email` nullable + non-unique.
2. `POST /api/scores` accepting `{ rsvp_id, reaction, flappy, cumulative_score }`,
   storing the result and computing the seed.
3. `GET /api/standings` returning players ordered by `cumulative_score`.

CORS (`*`) and the `:8080` default already match.

## Assets

`public/assets/title.jpeg` + `public/assets/mario.webp` are the provided art
(the mario sprite doubles as the transition kart). All other art is drawn on
Canvas. For richer sprites/SFX later, drop CC0 packs into `public/assets/game/`
— see Kenney.nl (Tappy Plane, New Platformer Pack, Particle Pack, Digital Audio).

## Known follow-ups

- Sound effects are not wired (no audio assets sourced) — add behind a mute toggle.
- Placeholder copy throughout `/rules`, `/history`, `/info1`, and standings.
