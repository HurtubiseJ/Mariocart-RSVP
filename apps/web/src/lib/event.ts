/**
 * Single source of truth for the event details shown across the site
 * (hero, event-info page, RSVP acknowledgements). Edit here once.
 */
export const EVENT = {
  /** Display date. */
  date: "Saturday, July 25, 2026",
  /** Short date for tight spots. */
  dateShort: "July 25, 2026",
  /** RSVP cancellation cutoff (one week before). */
  cancelBy: "July 18, 2026",
  time: "Plan on 5:00 PM (TBD)",
  place: "Luke's casa",
  entry: "Free with RSVP",
  parking: "Park at the Marysville Library and walk over",
  host: "Luke",
} as const;
