"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { StandingsResponse } from "@/lib/api.types";
import { cn } from "@/lib/cn";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function StandingsPage() {
  const [rows, setRows] = useState<StandingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <PageShell title="STANDINGS" subtitle="Seeds set by skill-check + flappy performance.">
      {error ? (
        <p className="text-center font-semibold text-mario-red">{error}</p>
      ) : !rows ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {rows.map((r, i) => (
            <li key={r.rsvpId}>
              <Card
                className={cn(
                  "flex items-center gap-4 px-4 py-3",
                  i === 0 && "bg-mario-yellow",
                  i === 1 && "bg-silver/40",
                  i === 2 && "bg-mario-red/10",
                )}
              >
                <div className="flex w-10 shrink-0 items-center justify-center font-display text-2xl">
                  {i < 3 ? MEDAL[i] : <span className="text-ink/70">{r.seed}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-head text-lg font-semibold text-ink">
                    {r.name}
                  </p>
                  <p className="text-xs text-ink/50">Seed #{r.seed}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl leading-none text-ink">
                    {r.cumulativeScore.toLocaleString()}
                  </p>
                  <p className="font-head text-[10px] tracking-wider text-ink/50 uppercase">
                    pts
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </PageShell>
  );
}
