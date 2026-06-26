/**
 * Validated access to the public env vars. Centralised so a typo or missing
 * value is caught in one place rather than scattered `process.env` reads.
 *
 * Only `NEXT_PUBLIC_*` vars are referenced — these are inlined at build time
 * and safe to read on the client.
 */

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(
  /\/+$/,
  "",
);

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const env = {
  /** Base URL of the Beerio Kart API, no trailing slash. */
  apiUrl,
  /** When true, always use the in-memory mock client. */
  useMock,
} as const;
