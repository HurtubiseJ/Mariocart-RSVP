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
  /** When to show up. */
  arrivalTime: "Plan on 5 (TBD) (Late = potential disqualification)",
  /** When the tournament itself kicks off. */
  tournamentStart: "(TBD)",
  place: "Luke's casa",
  entry: "Free with RSVP",
  parking: "Park at the Marysville Library and walk over",
  host: "Luke",
} as const;
