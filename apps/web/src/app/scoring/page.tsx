import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { SCORING } from "@/lib/scoring";

export const metadata: Metadata = { title: "Scoring — Beerio Kart World Cup" };

// Built straight from lib/scoring.ts so the page can't drift from the real maths.
const SECTIONS = [
  {
    title: "Two seeding games",
    body: "Your tournament seed comes from two minigames played right after you RSVP: the Skill Check and Beerio Flappy. Each produces a raw score; those are weighted and added together into one cumulative total.",
  },
  {
    title: "Skill Check (reaction)",
    body: `Each round is a single 360° sweep — you get one pass to tap inside each red zone. A hit is worth ${SCORING.HIT_VALUE} points; every degree your taps land away from a zone centre costs ${SCORING.MISS_PENALTY}. Any zone you don't tap before the sweep finishes counts as a full miss. Raw score = hits × ${SCORING.HIT_VALUE} − missed° × ${SCORING.MISS_PENALTY} (never below 0).`,
  },
  {
    title: "Beerio Flappy",
    body: `You get two runs; each gate cleared is worth ${SCORING.GATE_VALUE} points. Your best run counts at full weight (×${SCORING.HIGHEST_SCORE_WEIGHT}) and your other run at half (×${SCORING.LOWEST_SCORE_WEIGHT}). Raw score = best gates × ${SCORING.GATE_VALUE} + lower gates × ${SCORING.GATE_VALUE} × ${SCORING.LOWEST_SCORE_WEIGHT}.`,
  },
  {
    title: "Cumulative score",
    body: `Each game contributes its raw score times its weight — Skill Check ×${SCORING.W_REACTION} and Flappy ×${SCORING.W_FLAPPY}. Your cumulative score is simply the sum of those two weighted contributions, and that's exactly the total shown on the standings.`,
  },
  {
    title: "Seeds",
    body: "Everyone is ranked by cumulative score, highest first. The top score is seed #1, and your seed sets your first-round matchup in the bracket.",
  },
];

export default function ScoringPage() {
  return (
    <PageShell
      title="HOW SCORES WORK"
      subtitle="Full transparency on how your seed is calculated."
    >
      <ol className="flex flex-col gap-4">
        {SECTIONS.map((s, i) => (
          <li key={s.title}>
            <Card className="flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mario-blue font-display text-xl text-paper">
                {i + 1}
              </span>
              <div>
                <h2 className="font-head text-lg font-bold text-ink">{s.title}</h2>
                <p className="mt-1 text-ink/70">{s.body}</p>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
