"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FlappyEngine } from "@/games/flappy/FlappyEngine";
import type { FlappyScore } from "@/lib/api.types";
import { buildFlappyScore } from "@/lib/scoring";
import { GameCanvas } from "./GameCanvas";
import { GameHud, HudChip } from "./GameHud";

const RUNS = 2;

/**
 * Hosts two Flappy runs and keeps the best. After the first run it shows a
 * between-run card; after the last it reports the combined FlappyScore.
 */
export function FlappyGame({
  onComplete,
}: {
  onComplete: (result: FlappyScore) => void;
}) {
  const [runKey, setRunKey] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [between, setBetween] = useState(false);

  const handleRun = (result: FlappyScore) => {
    const gates = result.runs[0] ?? 0;
    const next = [...scores, gates];
    setScores(next);
    if (next.length >= RUNS) {
      onComplete(buildFlappyScore(next));
    } else {
      setBetween(true);
    }
  };

  const startNext = () => {
    setBetween(false);
    setRunKey((k) => k + 1);
  };

  const runNumber = Math.min(scores.length + 1, RUNS);
  const lastGates = scores[scores.length - 1] ?? 0;
  const bestSoFar = scores.length ? Math.max(...scores) : 0;

  return (
    <div className="relative h-[68dvh] max-h-[640px] w-full overflow-hidden rounded-pop border-[3px] border-ink shadow-[0_8px_0_0_var(--color-ink)]">
      <GameCanvas<FlappyScore>
        runKey={runKey}
        createGame={() => new FlappyEngine()}
        onComplete={handleRun}
        startTitle={`Beerio Flappy — Run ${runNumber} of ${RUNS}`}
        startHint="Tap to flap through the pipes. The speed never changes — best of two runs counts."
        renderHud={(hud) => (
          <GameHud>
            <HudChip label="Run" value={`${runNumber}/${RUNS}`} />
            <HudChip label="Gates" value={hud.gates} />
          </GameHud>
        )}
      />

      {between && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-ink/85 px-6 text-center backdrop-blur-sm"
        >
          <p className="font-head text-sm font-bold tracking-widest text-mario-yellow uppercase">
            Run {scores.length} of {RUNS} complete
          </p>
          <p className="font-display text-5xl text-paper">{lastGates} 🍺</p>
          <p className="text-paper/70">
            gates cleared — best so far: {bestSoFar} 🍺. {RUNS - scores.length} run
            {RUNS - scores.length === 1 ? "" : "s"} left.
          </p>
          <Button variant="yellow" size="lg" onClick={startNext}>
            Start run {scores.length + 1}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
