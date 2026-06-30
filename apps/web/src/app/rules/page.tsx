import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Rules — Beerio Kart World Cup" };

const SEEDING = [
    {
        n: 1,
        title: "Previous Tournaments",
        body: "Seeding is based off of prior tournaments. Your past results are the primary factor — skill placement and the RSVP games do NOT set your seed.",
    },
    {
        n: 2,
        title: "A Boost for New Players",
        body: "Brand-new players have no tournament history, so the combo score from your RSVP games gives them fair placement and better consideration instead of defaulting to the bottom.",
    },
    {
        n: 3,
        title: "Breaking Ties",
        body: "When two racers are otherwise even, the combo score from the 'Skill Check' and 'Flappy' games breaks the tie. Important for honor — but it does not by itself determine your seed.",
    },
]

// Placeholder content — edit freely.
const RULES = [
  {
    n: 1,
    title: "Don't Drink and Drive",
    body: "The most important rule is no drinking and driving. Violation results in automatic loss and a DUI charge. The kart must be at a complete stop on the track before you are able to drink.",
  },
  {
    n: 2,
    title: "Time to Drink",
    body: "You are only able to drink while you are actively in the race. You may begin drinking as soon as the race count down FINISHES, meaning once you are able to move. You then MUST finish your drink before the final lap. Failure to finish your drink before completing a race results in a automatic loss.",
  },
  {
    n: 3,
    title: "BYOB",
    body: "If you are brining a personal supply of drinks for participation, they MUST be carbonated.",
  },
  {
    n: 4,
    title: "Slow Ur Role",
    body: "No shotgunning. (obviously)",
  },
  {
    n: 5,
    title: "Inclusion",
    body: "You are allowed to use a straw - The Jesse Law.",
  },
  {
    n: 6,
    title: "Two Hand Touch",
    body: "This is a non-contact sport. You cannot interfier with your opponents drink at any point.",
  },
  {
    n: 7,
    title: "Dictatory Luke",
    body: "Luke can (and will) change, add, and or remove rules as he sees fit.",
  },
];

const FORMAT = [
    {
        n: 1,
        title: "March Madness Style",
        body: "The bracket is March Madness style — a seeded, single-elimination bracket. Higher seeds are matched against lower seeds in the opening round.",
    },
    {
        n: 2,
        title: "Best of 3",
        body: "Every 'match' in the bracket is a single best-of-3. Win two races and you advance.",
    },
    {
        n: 3,
        title: "The Final Count Down",
        body: "The last race of every best-of-3 will always be Rainbow Road.",
    },
    {
        n: 4,
        title: "Win or Go Home",
        body: "It's single elimination — lose your match and your tournament run is over. No second chances, so make every race count.",
    },
]

export default function RulesPage() {
  return (
    <div className="flex flex-col">
        <PageShell title="RULES" subtitle="The house rules." className="-mb-24">
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
        <PageShell title="FORMAT" subtitle="The play by play proceedings" className="-mb-120">
            <ol className="flex flex-col gap-4">
                {FORMAT.map((r) => (
                <li key={r.n}>
                    <Card className="flex gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mario-blue font-display text-xl text-paper">
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
        <PageShell title="SEEDS" subtitle="The creation of the bracket and your placement." className="-pb-12">
            <ol className="flex flex-col gap-4">
                {SEEDING.map((r) => (
                <li key={r.n}>
                    <Card className="flex gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mario-green font-display text-xl text-paper">
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
    </div>
  );
}
