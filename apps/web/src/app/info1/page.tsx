import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = { title: "Event Info — Beerio Kart World Cup" };

const DETAILS = [
  { icon: "📅", label: "Date", value: EVENT.date },
  { icon: "⏰", label: "Arrival Time", value: EVENT.arrivalTime },
  { icon: "🏁", label: "Tournament Start", value: EVENT.tournamentStart },
  { icon: "📍", label: "Place", value: EVENT.place },
  { icon: "🎟️", label: "Entry", value: EVENT.entry },
  { icon: "🅿️", label: "Parking", value: EVENT.parking },
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
      </div>
    </PageShell>
  );
}
