"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { GameBreakdown, StandingsResponse } from "@/lib/api.types";
import { cn } from "@/lib/cn";

const MEDAL = ["🥇", "🥈", "🥉"];

const GAME_LABEL: Record<GameBreakdown["game"], string> = {
  reaction: "Skill Check",
  flappy: "Beerio Flappy",
};

const num = (v: unknown): number | null => (typeof v === "number" ? v : null);

/** Friendly summary of a game's raw details for the expanded breakdown. */
function detailSummary(g: GameBreakdown): string {
  const d = g.details ?? {};
  if (g.game === "reaction") {
    const hits = num(d.hits);
    const miss = num(d.missedDistance);
    const parts: string[] = [];
    if (hits !== null) parts.push(`${hits} hits`);
    if (miss !== null) parts.push(`${Math.round(miss)}° missed`);
    return parts.join(" · ");
  }
  const runs = Array.isArray(d.runs) ? (d.runs as unknown[]).filter((r) => typeof r === "number") : [];
  const best = num(d.bestGatesPassed);
  const parts: string[] = [];
  if (best !== null) parts.push(`best ${best} 🍺`);
  if (runs.length) parts.push(`runs ${runs.join(", ")}`);
  return parts.join(" · ");
}

function Breakdown({ games }: { games?: GameBreakdown[] }) {
  if (!games || games.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-ink/50">
        No game breakdown available for this racer.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2 border-t-2 border-ink/10 px-4 py-3">
      {games.map((g) => {
        const raw = num(g.details?.rawScore);
        return (
          <li key={`${g.game}-${g.trial}`} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-head text-sm font-semibold text-ink">
                {GAME_LABEL[g.game]}
              </p>
              <p className="truncate text-xs text-ink/50">{detailSummary(g)}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg leading-none text-ink">
                +{g.score.toLocaleString()}
              </p>
              {raw !== null && (
                <p className="font-head text-[10px] tracking-wider text-ink/40 uppercase">
                  raw {raw.toLocaleString()}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function StandingsPage() {
  const [rows, setRows] = useState<StandingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Hover previews a row (desktop); a click pins it open (works on touch too).
  const [pinnedId, setPinnedId] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getStandings()
      .then((r) => alive && setRows(r))
      .catch(() => alive && setError("Could not load standings."));
    return () => {
      alive = false;
    };
  }, []);

  const players = rows?.filter((r) => r.rsvp_type !== "spectator") ?? [];
  const spectators = rows?.filter((r) => r.rsvp_type === "spectator") ?? [];

  return (
    <PageShell
      title="GAME STANDINGS"
      subtitle="Combo scores from the Skill Check + Beerio Flappy. Tournament seeds come from past tournaments — these scores just break ties and help new players."
    >
      {error ? (
        <p className="text-center font-semibold text-mario-red">{error}</p>
      ) : !rows ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      ) : (
        <>
          <ol className="flex flex-col gap-2.5">
            {players.map((r, i) => {
              const expanded = pinnedId === r.rsvpId || hoverId === r.rsvpId;
              return (
                <li key={r.rsvpId}>
                  <Card
                    className={cn(
                      "overflow-hidden p-0",
                      i === 0 && "bg-mario-yellow",
                      i === 1 && "bg-silver/40",
                      i === 2 && "bg-mario-red/10",
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setPinnedId((id) => (id === r.rsvpId ? null : r.rsvpId))
                      }
                      onMouseEnter={() => setHoverId(r.rsvpId)}
                      onMouseLeave={() => setHoverId(null)}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left focus:outline-none focus-visible:bg-black/5"
                    >
                      <div className="flex w-10 shrink-0 items-center justify-center font-display text-2xl">
                        {i < 3 ? MEDAL[i] : <span className="text-ink/70">{i + 1}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-head text-lg font-semibold text-ink">
                          {r.name}
                        </p>
                        <p className="text-xs text-ink/50">Game rank #{i + 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl leading-none text-ink">
                          {r.cumulativeScore.toLocaleString()}
                        </p>
                        <p className="font-head text-[10px] tracking-wider text-ink/50 uppercase">
                          pts
                        </p>
                      </div>
                      <motion.span
                        aria-hidden
                        animate={{ rotate: expanded ? 180 : 0 }}
                        className="ml-1 shrink-0 text-ink/40"
                      >
                        ▾
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          key="panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden bg-paper/60"
                        >
                          <Breakdown games={r.games} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </li>
              );
            })}
          </ol>

          {spectators.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-center font-display text-2xl tracking-wide text-paper">
                SPECTATORS
              </h2>
              <p className="mb-4 text-center text-sm text-paper/60">
                Cheering from the sidelines — no score, all vibes.
              </p>
              <ul className="flex flex-col gap-2.5">
                {spectators.map((r) => (
                  <li key={r.rsvpId}>
                    <Card className="flex items-center gap-4 px-4 py-3">
                      <div className="flex w-10 shrink-0 items-center justify-center text-2xl">
                        👀
                      </div>
                      <p className="min-w-0 flex-1 truncate font-head text-lg font-semibold text-ink">
                        {r.name}
                      </p>
                      {r.vibes != null && (
                        <div className="text-right">
                          <p className="font-display text-xl leading-none text-ink">
                            {r.vibes}/10
                          </p>
                          <p className="font-head text-[10px] tracking-wider text-ink/50 uppercase">
                            vibes
                          </p>
                        </div>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-8 text-center text-sm text-ink/60">
            <TransitionLink
              href="/scoring"
              className="font-head font-semibold text-mario-blue underline underline-offset-4 hover:text-mario-red"
            >
              How are scores calculated?
            </TransitionLink>
          </p>
        </>
      )}
    </PageShell>
  );
}
