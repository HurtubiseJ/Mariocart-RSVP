import type {
  ApiClient,
  GameBreakdown,
  GameSubmitRequest,
  Rsvp,
  RsvpCreateRequest,
  ScoreSubmitRequest,
  ScoreSubmitResponse,
  StandingEntry,
  StandingsResponse,
  UnrsvpRequest,
} from "../api.types";
import { computeSeed } from "../seed";
import { BASE_MAX_ID, BASE_PLAYERS, type MockPlayer } from "./mockData";

/**
 * In-memory ApiClient used for offline demos and as the network-error fallback.
 * Players created/scored this session are persisted to sessionStorage so they
 * survive a refresh and appear in the standings alongside the seeded field.
 */

const RSVP_KEY = "bkwc.mock.rsvps";
const SCORE_KEY = "bkwc.mock.scores";
const GAMES_KEY = "bkwc.mock.games";

const hasWindow = () => typeof window !== "undefined";
const delay = (ms = 180 + Math.random() * 220) =>
  new Promise<void>((r) => setTimeout(r, ms));

function readJSON<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!hasWindow()) return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sessionStorage may be unavailable (private mode) — ignore. */
  }
}

interface StoredScore {
  rsvpId: number;
  name: string;
  cumulativeScore: number;
}

interface StoredGame extends GameBreakdown {
  rsvpId: number;
}

function nextId(rsvps: Rsvp[]): number {
  const localMax = rsvps.reduce((m, r) => Math.max(m, r.id ?? 0), BASE_MAX_ID);
  return localMax + 1;
}

/** Every stored per-game result for a player (this session). */
function gamesFor(rsvpId: number): GameBreakdown[] {
  return readJSON<StoredGame[]>(GAMES_KEY, [])
    .filter((g) => g.rsvpId === rsvpId)
    .map((g) => ({
      game: g.game,
      trial: g.trial,
      score: g.score,
      details: g.details,
    }));
}

/** Sum of a player's stored (already-weighted) game scores. */
function cumulativeFor(rsvpId: number): number {
  return gamesFor(rsvpId).reduce((sum, g) => sum + g.score, 0);
}

/** Merge the seeded field with this session's scored players, dedup by id. */
function fullField(): MockPlayer[] {
  const stored = readJSON<StoredScore[]>(SCORE_KEY, []);
  const byId = new Map<number, MockPlayer>();
  for (const p of BASE_PLAYERS) byId.set(p.rsvpId, p);
  for (const s of stored)
    byId.set(s.rsvpId, {
      rsvpId: s.rsvpId,
      name: s.name,
      cumulativeScore: s.cumulativeScore,
    });
  return [...byId.values()];
}

export const mockClient: ApiClient = {
  async health() {
    await delay(60);
    return true;
  },

  async createRsvp(body: RsvpCreateRequest): Promise<Rsvp> {
    await delay();
    const rsvps = readJSON<Rsvp[]>(RSVP_KEY, []);
    const rsvp: Rsvp = {
      id: nextId(rsvps),
      name: body.name,
      phone: body.phone,
      rsvp_type: body.rsvp_type,
      vibes: body.vibes ?? null,
      rated_skill: body.rated_skill ?? null,
      num_breaths: body.num_breaths ?? null,
      email: body.email && body.email.length > 0 ? body.email : null,
      createdAt: new Date().toISOString(),
    };
    writeJSON(RSVP_KEY, [...rsvps, rsvp]);
    return rsvp;
  },

  async submitGame(body: GameSubmitRequest): Promise<boolean> {
    await delay(120);
    // Replace any prior submission for this (player, game).
    const games = readJSON<StoredGame[]>(GAMES_KEY, []).filter(
      (g) => !(g.rsvpId === body.rsvp_id && g.game === body.game),
    );
    games.push({
      rsvpId: body.rsvp_id,
      game: body.game,
      trial: body.trial,
      score: body.score,
      details: body.details ?? null,
    });
    writeJSON(GAMES_KEY, games);
    return true;
  },

  async submitScore(body: ScoreSubmitRequest): Promise<ScoreSubmitResponse> {
    await delay();
    const rsvps = readJSON<Rsvp[]>(RSVP_KEY, []);
    const name = rsvps.find((r) => r.id === body.rsvpId)?.name ?? "You";

    // Cumulative is the sum of the stored per-game (weighted) scores, matching
    // the backend trigger; fall back to the submitted total if none were stored.
    const cumulativeScore = cumulativeFor(body.rsvpId) || body.cumulativeScore;

    // Persist this player's score (overwrite any prior submission).
    const stored = readJSON<StoredScore[]>(SCORE_KEY, []).filter(
      (s) => s.rsvpId !== body.rsvpId,
    );
    stored.push({ rsvpId: body.rsvpId, name, cumulativeScore });
    writeJSON(SCORE_KEY, stored);

    // Seed against everyone else.
    const others = fullField().filter((p) => p.rsvpId !== body.rsvpId);
    const { seed, rank, totalPlayers } = computeSeed(cumulativeScore, others);

    return { rsvpId: body.rsvpId, cumulativeScore, seed, rank, totalPlayers };
  },

  async getStandings(): Promise<StandingsResponse> {
    await delay();
    const rsvps = readJSON<Rsvp[]>(RSVP_KEY, []);

    // Players: the seeded field plus any session players who scored, ranked by
    // cumulative score. Spectators never play the games, so they never appear
    // here — they're listed separately below with no score.
    const ranked = [...fullField()].sort(
      (a, b) => b.cumulativeScore - a.cumulativeScore,
    );
    const players = ranked.map((p, i): StandingEntry => {
      const games = gamesFor(p.rsvpId);
      const rsvp = rsvps.find((r) => r.id === p.rsvpId);
      return {
        rsvpId: p.rsvpId,
        rsvp_type: "player",
        name: p.name,
        vibes: rsvp?.vibes ?? null,
        cumulativeScore: p.cumulativeScore,
        seed: i + 1,
        rank: i + 1,
        ...(games.length ? { games } : {}),
      };
    });

    const spectators = rsvps
      .filter((r) => r.rsvp_type === "spectator" && r.id != null)
      .map((r): StandingEntry => ({
        rsvpId: r.id as number,
        rsvp_type: "spectator",
        name: r.name,
        vibes: r.vibes ?? null,
        cumulativeScore: 0,
        seed: 0,
        rank: 0,
      }));

    return [...players, ...spectators];
  },

  async unrsvp(body: UnrsvpRequest): Promise<boolean> {
    await delay();
    const digits = (v: string) => v.replace(/\D/g, "");
    const rsvps = readJSON<Rsvp[]>(RSVP_KEY, []);
    const match = rsvps.find((r) => digits(r.phone) === digits(body.phone));
    if (!match) throw new Error("No RSVP found for that phone");

    writeJSON(
      RSVP_KEY,
      rsvps.filter((r) => r.id !== match.id),
    );
    writeJSON(
      SCORE_KEY,
      readJSON<StoredScore[]>(SCORE_KEY, []).filter((s) => s.rsvpId !== match.id),
    );
    writeJSON(
      GAMES_KEY,
      readJSON<StoredGame[]>(GAMES_KEY, []).filter((g) => g.rsvpId !== match.id),
    );
    return true;
  },
};
