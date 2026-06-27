import type {
  ApiClient,
  Rsvp,
  RsvpCreateRequest,
  ScoreSubmitRequest,
  ScoreSubmitResponse,
  StandingsResponse,
} from "./api.types";
import { env } from "./env";
import { mockClient } from "./mock/mockClient";
import {
  rsvpResponseSchema,
  scoreSubmitResponseSchema,
  standingsResponseSchema,
} from "./schemas";

/**
 * Typed API client for the Beerio Kart backend.
 *
 * Policy:
 *  - NEXT_PUBLIC_USE_MOCK=true  -> always use the in-memory mock client.
 *  - otherwise                  -> call the real API, but transparently fall
 *    back to mock data on a *connection* error (server down). HTTP errors
 *    (4xx/5xx) surface as real ApiErrors so validation failures aren't hidden.
 */

export class ApiError extends Error {
  status?: number;
  /** True when the request never reached the server (offline / DNS / CORS). */
  isNetwork: boolean;

  constructor(message: string, opts: { status?: number; isNetwork?: boolean } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.isNetwork = opts.isNetwork ?? false;
  }
}

const TIMEOUT_MS = 3500;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${env.apiUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ApiError(body || `${res.status} ${res.statusText}`, {
        status: res.status,
      });
    }
    // 204 No Content
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // fetch throws TypeError on network failure, AbortError on timeout.
    throw new ApiError(err instanceof Error ? err.message : "network error", {
      isNetwork: true,
    });
  } finally {
    clearTimeout(timer);
  }
}

// --- real implementations (map snake_case <-> camelCase) -------------------

const realClient: ApiClient = {
  async health() {
    try {
      await request<unknown>("/health");
      return true;
    } catch {
      return false;
    }
  },

  async createRsvp(body: RsvpCreateRequest): Promise<Rsvp> {
    const raw = await request<unknown>("/api/rsvps", {
      method: "POST",
      body: JSON.stringify({
        name: body.name,
        phone: body.phone,
        email: body.email ?? null,
      }),
    });
    const p = rsvpResponseSchema.parse(raw);
    return {
      id: p.id,
      name: p.name,
      phone: p.phone,
      email: p.email ?? null,
      createdAt: p.created_at,
    };
  },

  async submitScore(body: ScoreSubmitRequest): Promise<ScoreSubmitResponse> {
    const raw = await request<unknown>("/api/scores", {
      method: "POST",
      body: JSON.stringify({
        rsvp_id: body.rsvpId,
        reaction: body.reaction,
        flappy: body.flappy,
        cumulative_score: body.cumulativeScore,
      }),
    });
    const p = scoreSubmitResponseSchema.parse(raw);
    return {
      rsvpId: p.rsvp_id,
      cumulativeScore: p.cumulative_score,
      seed: p.seed,
      rank: p.rank,
      totalPlayers: p.total_players,
    };
  },

  async getStandings(): Promise<StandingsResponse> {
    console.log("Get standings");
    const raw = await request<unknown>("/api/standings");
    return standingsResponseSchema.parse(raw).map((e) => ({
      rsvpId: e.rsvp_id,
      name: e.name,
      cumulativeScore: e.cumulative_score,
      seed: e.seed,
      rank: e.rank,
    }));
  },
};

// --- fallback wrapper ------------------------------------------------------

function withFallback<TArgs extends unknown[], TR>(
  real: (...args: TArgs) => Promise<TR>,
  mock: (...args: TArgs) => Promise<TR>,
): (...args: TArgs) => Promise<TR> {
  return async (...args: TArgs): Promise<TR> => {
    if (env.useMock) return mock(...args);
    try {
      return await real(...args);
    } catch (err) {
      if (err instanceof ApiError && err.isNetwork) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[api] backend unreachable — using mock data:", err.message);
        }
        return mock(...args);
      }
      throw err;
    }
  };
}

export const api: ApiClient = {
  health: withFallback(realClient.health, mockClient.health),
  createRsvp: withFallback(realClient.createRsvp, mockClient.createRsvp),
  submitScore: withFallback(realClient.submitScore, mockClient.submitScore),
  getStandings: withFallback(realClient.getStandings, mockClient.getStandings),
};
