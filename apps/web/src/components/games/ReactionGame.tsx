"use client";

import { ReactionEngine } from "@/games/reaction/ReactionEngine";
import type { ReactionScore } from "@/lib/api.types";
import { GameCanvas } from "./GameCanvas";
import { GameHud, HudChip } from "./GameHud";

/** Hosts the reaction skill-check (3 rounds) and reports the final score. */
export function ReactionGame({
  onComplete,
}: {
  onComplete: (result: ReactionScore) => void;
}) {
  return (
    <div className="relative h-[68dvh] max-h-[640px] w-full overflow-hidden rounded-pop border-[3px] border-ink shadow-[0_8px_0_0_var(--color-ink)]">
      <GameCanvas<ReactionScore>
        createGame={() => new ReactionEngine()}
        onComplete={onComplete}
        startTitle="Skill Check"
        startHint="Tap anywhere the moment the spinning line is inside the red zone. First couple rounds are easy — it ramps up from there."
        renderHud={(hud) => (
          <GameHud>
            <HudChip label="Round" value={`${hud.round}/${hud.totalRounds}`} />
            <HudChip label="Hits" value={hud.hits} />
          </GameHud>
        )}
      />
    </div>
  );
}
