import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { SCORING } from "@/lib/scoring";

export const metadata: Metadata = { title: "Scoring — Beerio Kart World Cup" };

// Built straight from lib/scoring.ts so the page can't drift from the real maths.
const SECTIONS = [
  {
    title: "Two ranking games",
    body: "Right after you RSVP you play two minigames: the Skill Check and Beerio Flappy. Each produces a raw score; those are weighted and added together into one cumulative combo score.",
  },
  {
    title: "Skill Check (reaction)",
    body: `Each round is a single 360° sweep — you get one pass to tap inside each red zone. The first couple of rounds are easy to learn on; it ramps up after that. A hit is worth ${SCORING.HIT_VALUE} points; every degree your taps land away from a zone centre costs ${SCORING.MISS_PENALTY}. Any zone you don't tap before the sweep finishes counts as a full miss. Raw score = hits × ${SCORING.HIT_VALUE} − missed° × ${SCORING.MISS_PENALTY} (never below 0).`,
  },
  {
    title: "Beerio Flappy",
    body: `You get two runs; each gate cleared is worth ${SCORING.GATE_VALUE} points. Your best run counts at full weight (×${SCORING.HIGHEST_SCORE_WEIGHT}) plus a half-weight (×${SCORING.LOWEST_SCORE_WEIGHT}) bonus from your other run. Raw score = best gates × ${SCORING.GATE_VALUE} + lowest gates × ${SCORING.GATE_VALUE} × ${SCORING.LOWEST_SCORE_WEIGHT}.`,
  },
  {
    title: "Combo score",
    body: `Each game contributes its raw score times its weight — Skill Check ×${SCORING.W_REACTION} and Flappy ×${SCORING.W_FLAPPY}. Your combo score is simply the sum of those two weighted contributions, and that's exactly the total shown on the game standings.`,
  },
  {
    title: "What the score is for",
    body: "Your combo score does NOT set your tournament seed — seeds come from past tournament results. The combo score is used to break ties and to give new players (with no tournament history) fair placement instead of defaulting to the bottom.",
  },
];

export default function ScoringPage() {
  return (
    <PageShell
      title="HOW SCORES WORK"
      subtitle="Full transparency on how your combo score is calculated."
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
