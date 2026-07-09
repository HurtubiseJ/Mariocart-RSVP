import { EVENT } from "./event";

/**
 * "Add to calendar" plumbing. Apple/Outlook users get an .ics file served
 * from /calendar.ics (iOS/macOS open it in the native Calendar sheet);
 * Google users get a prefilled event-creation URL. Times stay floating
 * (no timezone) — see the note on EVENT.startsAt.
 */
const CALENDAR_EVENT = {
  title: "Beerio Kart World Cup 🏁",
  location: EVENT.place,
  description: `${EVENT.entry}. ${EVENT.parking}`,
};

/** "2026-08-22T17:00:00" → "20260822T170000" (iCal/Google compact form). */
function compact(iso: string) {
  return iso.replace(/[-:]/g, "");
}

export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: CALENDAR_EVENT.title,
    dates: `${compact(EVENT.startsAt)}/${compact(EVENT.endsAt)}`,
    location: CALENDAR_EVENT.location,
    details: CALENDAR_EVENT.description,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** RFC 5545 TEXT escaping: backslash, comma, semicolon, newline. */
function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/[,;]/g, (m) => `\\${m}`)
    .replace(/\n/g, "\\n");
}

export function buildIcs(now: Date = new Date()) {
  const dtstamp = `${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
  return `${[
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Beerio Kart World Cup//RSVP//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:beerio-kart-2026@beerio-kart-rsvp",
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${compact(EVENT.startsAt)}`,
    `DTEND:${compact(EVENT.endsAt)}`,
    `SUMMARY:${escapeIcs(CALENDAR_EVENT.title)}`,
    `LOCATION:${escapeIcs(CALENDAR_EVENT.location)}`,
    `DESCRIPTION:${escapeIcs(CALENDAR_EVENT.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")}\r\n`;
}
