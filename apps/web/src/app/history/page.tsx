import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "History — Beerio Kart World Cup" };

// Placeholder content — edit freely.
const CHAMPIONS = [
  { year: "2025", champ: "Turbo Tina", runnerUp: "Drift King Dom", track: "Rainbow Road" },
  { year: "2024", champ: "Pixel Pete", runnerUp: "Hoppy Hannah", track: "Bowser's Castle" },
  { year: "2023", champ: "Lager Larry", runnerUp: "Nitro Nadia", track: "Coconut Mall" },
  { year: "2022", champ: "Banana Bea", runnerUp: "Foamy Fred", track: "Moo Moo Meadows" },
];

export default function HistoryPage() {
  return (
    <PageShell title="HISTORY" subtitle="Champions, upsets, and bragging rights.">
    <div className="flex flex-col gap-4">
        {CHAMPIONS.map((c) => (
        <Card key={c.year} className="overflow-hidden">
            <div className="flex items-center gap-3 bg-mario-blue px-5 py-2.5 text-paper">
            <span className="font-display text-2xl">{c.year}</span>
            <span className="font-head text-sm opacity-80">Final at {c.track}</span>
            </div>
            <div className="grid grid-cols-2 divide-x-2 divide-silver">
            <div className="p-4">
                <p className="font-head text-[10px] font-bold tracking-wider text-ink/50 uppercase">
                🏆 Champion
                </p>
                <p className="font-head text-lg font-bold text-ink">{c.champ}</p>
            </div>
            <div className="p-4">
                <p className="font-head text-[10px] font-bold tracking-wider text-ink/50 uppercase">
                Runner-up
                </p>
                <p className="font-head text-lg font-semibold text-ink/80">
                {c.runnerUp}
                </p>
            </div>
            </div>
        </Card>
        ))}
    </div>
    </PageShell>
  );
}
