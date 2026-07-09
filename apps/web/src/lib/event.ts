/**
 * Single source of truth for the event details shown across the site
 * (hero, event-info page, RSVP acknowledgements). Edit here once.
 */
export const EVENT = {
  /** Display date. */
  date: "Saturday, August 22, 2026",
  /** Short date for tight spots. */
  dateShort: "August 22, 2026",
  /** RSVP cancellation cutoff (one week before). */
  cancelBy: "August 15, 2026",
  /**
   * Machine-readable start/end for "add to calendar" links (5–11 PM).
   * Floating local time on purpose: every guest is local, so we skip
   * timezone handling entirely.
   */
  startsAt: "2026-08-22T17:00:00",
  endsAt: "2026-08-22T23:00:00",
  /** When to show up. */
  arrivalTime: "Plan on 5 (TBD) (Late = potential disqualification)",
  /** When the tournament itself kicks off. */
  tournamentStart: "(TBD)",
  place: "Luke's casa",
  entry: "Free with RSVP",
  parking: "Park at Luke's Casa but please carpool!",
  host: "Luke",
} as const;
