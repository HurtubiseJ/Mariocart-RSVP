/**
 * Strip spaces, parentheses, plus, and hyphens so phone numbers are stored and
 * compared in one canonical form (e.g. "+1 (555) 123-4567" -> "15551234567").
 * Mirrors `db::normalize_phone` in the C++ backend so the frontend mock/offline
 * path canonicalises identically.
 */
export const normalizePhone = (phone: string): string =>
  phone.replace(/[\s()+-]/g, "");
