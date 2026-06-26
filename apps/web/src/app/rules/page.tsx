import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Rules — Beerio Kart World Cup" };

// Placeholder content — edit freely.
const RULES = [
  {
    n: 1,
    title: "Seeding",
    body: "Your seed comes from the two RSVP minigames. Higher combined score = better seed = easier first-round draw.",
  },
  {
    n: 2,
    title: "Format",
    body: "Single-elimination bracket. Best of 3 races per match. Win and advance; lose and you're on bottle duty.",
  },
  {
    n: 3,
    title: "The Beerio Rule",
    body: "You may only drive between sips — finish your drink before the final lap. Empties at the line.",
  },
  {
    n: 4,
    title: "Items",
    body: "All items legal. Blue shells are karma. No rage-quitting; rage is the point.",
  },
  {
    n: 5,
    title: "Conduct",
    body: "Trash talk encouraged, hands on your own controller, and a designated driver gets you home.",
  },
];

export default function RulesPage() {
  return (
    <PageShell title="RULES" subtitle="The format, the bracket, and the house rules.">
      <ol className="flex flex-col gap-4">
        {RULES.map((r) => (
          <li key={r.n}>
            <Card className="flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mario-red font-display text-xl text-paper">
                {r.n}
              </span>
              <div>
                <h2 className="font-head text-lg font-bold text-ink">{r.title}</h2>
                <p className="mt-1 text-ink/70">{r.body}</p>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
