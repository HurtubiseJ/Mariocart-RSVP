"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Canvas2D } from "@/games/engine/Canvas2D";
import { GameLoop } from "@/games/engine/GameLoop";
import { attachPointerDown } from "@/games/engine/input";
import type { Game, HudState } from "@/games/engine/types";
import { cn } from "@/lib/cn";
import { GameStartGate } from "./GameStartGate";

interface GameCanvasProps<T> {
  createGame: () => Game<T>;
  onComplete: (result: T) => void;
  renderHud?: (hud: HudState) => React.ReactNode;
  startTitle: string;
  startHint: string;
  /** Change to force a brand-new run (resets the start gate + engine). */
  runKey?: string | number;
  className?: string;
}

type Phase = "gate" | "countdown" | "playing";
const COUNT_FROM = 3;

/**
 * React host for a Canvas game. The game is created and starts rendering the
 * moment the player taps start, but logic stays frozen through a 3-2-1 countdown
 * so the player can see what the game looks like before it actually begins.
 *
 * The engine lives in refs (never React state); only the throttled HUD snapshot,
 * the phase, and the countdown number are React state.
 */
export function GameCanvas<T>({
  createGame,
  onComplete,
  renderHud,
  startTitle,
  startHint,
  runKey,
  className,
}: GameCanvasProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("gate");
  const [count, setCount] = useState<number | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);

  // Keep latest callbacks/phase in refs so the loop effect can stay minimal.
  const createGameRef = useRef(createGame);
  createGameRef.current = createGame;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  const loopRef = useRef<GameLoop<T> | null>(null);

  // New run → back to the start gate.
  useEffect(() => {
    setPhase("gate");
    setCount(null);
    setHud(null);
  }, [runKey]);

  // Drive the 3-2-1-GO countdown, then hand control to the player. At 0 we hold
  // on "GO!" for a beat, then start — never rendering a negative number.
  useEffect(() => {
    if (phase !== "countdown" || count === null) return;
    if (count === 0) {
      const t = setTimeout(() => setPhase("playing"), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => (c ?? 1) - 1), 800);
    return () => clearTimeout(t);
  }, [phase, count]);

  // Pause/unpause game logic as the phase changes (loop keeps rendering).
  useEffect(() => {
    loopRef.current?.setLogicPaused(phase !== "playing");
  }, [phase]);

  // Create + run the loop as soon as we leave the start gate, so the scene is
  // visible (frozen) during the countdown.
  const active = phase !== "gate";
  useEffect(() => {
    if (!active) return;
    const el = canvasRef.current;
    if (!el) return;

    const c2d = new Canvas2D(el);
    const game = createGameRef.current();
    let completed = false;
    let lastHud = 0;

    const loop = new GameLoop<T>(game, c2d, {
      onTick: () => {
        if (!game.getHud) return;
        const now = performance.now();
        if (now - lastHud > 90) {
          lastHud = now;
          setHud(game.getHud());
        }
      },
      onOver: (result) => {
        if (completed) return;
        completed = true;
        onCompleteRef.current(result);
      },
    });
    loopRef.current = loop;
    loop.setLogicPaused(phaseRef.current !== "playing");

    const detach = attachPointerDown(el, (cx, cy) => {
      // Ignore taps until the countdown finishes.
      if (phaseRef.current !== "playing") return;
      game.onPointerDown(c2d.toLogical(cx, cy));
    });
    loop.start();

    return () => {
      detach();
      loop.stop();
      loopRef.current = null;
    };
  }, [active, runKey]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-asphalt", className)}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ touchAction: "none" }}
      />

      {phase === "playing" && hud && renderHud?.(hud)}

      {phase === "gate" && (
        <GameStartGate
          title={startTitle}
          hint={startHint}
          onStart={() => {
            setCount(COUNT_FROM);
            setPhase("countdown");
          }}
        />
      )}

      {phase === "countdown" && count !== null && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="font-display text-8xl leading-none text-mario-yellow drop-shadow-[0_4px_0_rgba(0,0,0,0.6)] sm:text-9xl"
            >
              {count === 0 ? "GO!" : count}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
