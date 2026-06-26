import type {
  ApiClient,
  Rsvp,
  RsvpCreateRequest,
  ScoreSubmitRequest,
  ScoreSubmitResponse,
  StandingEntry,
  StandingsResponse,
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

function nextId(rsvps: Rsvp[]): number {
  const localMax = rsvps.reduce((m, r) => Math.max(m, r.id), BASE_MAX_ID);
  return localMax + 1;
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
      email: body.email && body.email.length > 0 ? body.email : null,
      createdAt: new Date().toISOString(),
    };
    writeJSON(RSVP_KEY, [...rsvps, rsvp]);
    return rsvp;
  },

  async submitScore(body: ScoreSubmitRequest): Promise<ScoreSubmitResponse> {
    await delay();
    const rsvps = readJSON<Rsvp[]>(RSVP_KEY, []);
    const name = rsvps.find((r) => r.id === body.rsvpId)?.name ?? "You";

    // Persist this player's score (overwrite any prior submission).
    const stored = readJSON<StoredScore[]>(SCORE_KEY, []).filter(
      (s) => s.rsvpId !== body.rsvpId,
    );
    stored.push({ rsvpId: body.rsvpId, name, cumulativeScore: body.cumulativeScore });
    writeJSON(SCORE_KEY, stored);

    // Seed against everyone else.
    const others = fullField().filter((p) => p.rsvpId !== body.rsvpId);
    const { seed, rank, totalPlayers } = computeSeed(body.cumulativeScore, others);

    return {
      rsvpId: body.rsvpId,
      cumulativeScore: body.cumulativeScore,
      seed,
      rank,
      totalPlayers,
    };
  },

  async getStandings(): Promise<StandingsResponse> {
    await delay();
    const ranked = [...fullField()].sort(
      (a, b) => b.cumulativeScore - a.cumulativeScore,
    );
    return ranked.map(
      (p, i): StandingEntry => ({
        rsvpId: p.rsvpId,
        name: p.name,
        cumulativeScore: p.cumulativeScore,
        seed: i + 1,
        rank: i + 1,
      }),
    );
  },
};
