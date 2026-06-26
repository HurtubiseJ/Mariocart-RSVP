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

// --- API response parsers (raw snake_case from the server) -----------------

export const rsvpResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable().optional(),
  created_at: z.string(),
});

export const scoreSubmitResponseSchema = z.object({
  rsvp_id: z.number(),
  cumulative_score: z.number(),
  seed: z.number(),
  rank: z.number(),
  total_players: z.number(),
});

export const standingEntrySchema = z.object({
  rsvp_id: z.number(),
  name: z.string(),
  cumulative_score: z.number(),
  seed: z.number(),
  rank: z.number(),
});

export const standingsResponseSchema = z.array(standingEntrySchema);
