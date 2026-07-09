import { buttonClasses } from "@/components/ui/Button";
import { googleCalendarUrl } from "@/lib/calendar";

/**
 * Pair of "add to calendar" links: the .ics route for Apple/Outlook and a
 * prefilled event URL for Google Calendar. Plain anchors so it works in
 * server and client components alike.
 */
export function AddToCalendar() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a href="/calendar.ics" className={buttonClasses("outline", "sm")}>
        📅 Apple Calendar
      </a>
      <a
        href={googleCalendarUrl()}
        target="_blank"
        rel="noreferrer"
        className={buttonClasses("outline", "sm")}
      >
        🗓️ Google Calendar
      </a>
    </div>
  );
}
