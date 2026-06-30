import { z } from "zod";

/**
 * Zod schemas for (a) validating the RSVP form and (b) parsing API responses
 * so backend drift fails loudly instead of corrupting the UI.
 */

// --- RSVP form (client-side validation) -----------------------------------

const phoneDigits = (v: string) => v.replace(/\D/g, "").length;

export const rsvpFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell us your name")
    .max(60, "That name is a little long"),
  phone: z
    .string()
    .trim()
    .min(1, "We need a phone number")
    .refine((v) => phoneDigits(v) >= 7, "Enter a valid phone number")
    .refine((v) => /^[+\d][\d\s().-]*$/.test(v), "Digits and + ( ) - only"),
  // Optional: empty string is allowed and normalised to undefined on submit.
  email: z
    .union([z.literal(""), z.email("Enter a valid email")])
    .optional(),
});

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

// --- Un-RSVP form (client-side validation) --------------------------------

/** Count sentence-like segments (split on . ! ?). "More than 2" => at least 3. */
const sentenceCount = (v: string) =>
  v
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;

export const unrsvpFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell us your name")
    .max(60, "That name is a little long"),
  phone: z
    .string()
    .trim()
    .min(1, "We need a phone number")
    .refine((v) => phoneDigits(v) >= 7, "Enter a valid phone number")
    .refine((v) => /^[+\d][\d\s().-]*$/.test(v), "Digits and + ( ) - only"),
  reason: z
    .string()
    .trim()
    .min(40, "Tell us a bit more — at least a few sentences")
    .refine((v) => sentenceCount(v) >= 3, "Please give at least 3 sentences"),
});

export type UnrsvpFormValues = z.infer<typeof unrsvpFormSchema>;

// --- API response parsers (raw snake_case from the server) -----------------

export const rsvpResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable().optional(),
  rsvp_type: z.enum(["player", "spectator"]),
  vibes: z.number().nullable().optional(),
  num_breaths: z.number().nullable().optional(),
  rated_skill: z.number().nullable().optional(),
  created_at: z.string(),
});

export const scoreSubmitResponseSchema = z.object({
  rsvp_id: z.number(),
  cumulative_score: z.number(),
  seed: z.number(),
  rank: z.number(),
  total_players: z.number(),
});

export const gameBreakdownSchema = z.object({
  game: z.enum(["reaction", "flappy"]),
  trial: z.number(),
  score: z.number(),
  details: z.record(z.string(), z.unknown()).nullable(),
});

export const standingEntrySchema = z.object({
  rsvp_id: z.number(),
  rsvp_type: z.enum(["player", "spectator"]),
  name: z.string(),
  vibes: z.number().nullable().optional(),
  cumulative_score: z.number(),
  seed: z.number(),
  rank: z.number(),
  games: z.array(gameBreakdownSchema).optional(),
});

export const standingsResponseSchema = z.array(standingEntrySchema);
