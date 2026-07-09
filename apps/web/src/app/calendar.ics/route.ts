import { buildIcs } from "@/lib/calendar";

/** Serves the event as an iCalendar file — the URL Apple devices open natively. */
export function GET() {
  return new Response(buildIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="beerio-kart.ics"',
    },
  });
}
