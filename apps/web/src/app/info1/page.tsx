import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Event Info — Beerio Kart World Cup" };

// Placeholder content — edit freely.
const DETAILS = [
  { icon: "📅", label: "Date", value: "Saturday, August 15, 2026" },
  { icon: "🕒", label: "Time", value: "Doors 2:00 PM · First race 3:00 PM" },
  { icon: "📍", label: "Place", value: "The Rec Room — 123 Rainbow Road" },
  { icon: "🎟️", label: "Entry", value: "Free with RSVP · BYO controller optional" },
];

export default function InfoPage() {
  return (
    <PageShell title="EVENT INFO" subtitle="When and where it all goes down.">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DETAILS.map((d) => (
            <Card key={d.label} className="flex items-center gap-4 p-4">
              <span className="text-3xl" aria-hidden>
                {d.icon}
              </span>
              <div>
                <p className="font-head text-[10px] font-bold tracking-wider text-ink/50 uppercase">
                  {d.label}
                </p>
                <p className="font-head font-semibold text-ink">{d.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          {/* Map placeholder */}
          <div className="flex h-44 items-center justify-center bg-asphalt text-paper/50">
            <span className="font-head text-sm">🗺️ Map coming soon</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-5 text-center">
            <p className="text-ink/70">
              Parking out back. Rideshare drop-off at the front door. Please
              don&apos;t drink and drive — line up a designated driver.
            </p>
            <TransitionLink href="/rsvp" className={buttonClasses("green", "md")}>
              RSVP now 🏁
            </TransitionLink>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
