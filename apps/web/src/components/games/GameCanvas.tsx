"use client";

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

/**
 * React host for a Canvas game. Owns the canvas element, wires pointer input,
 * and runs a GameLoop. The engine lives in refs (never React state); only the
 * throttled HUD snapshot and the start-gate flag are React state.
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
  const [started, setStarted] = useState(false);
  const [hud, setHud] = useState<HudState | null>(null);

  // Keep latest callbacks in refs so the loop effect can stay minimal.
  const createGameRef = useRef(createGame);
  createGameRef.current = createGame;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // New run → reset gate + HUD.
  useEffect(() => {
    setStarted(false);
    setHud(null);
  }, [runKey]);

  useEffect(() => {
    if (!started) return;
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

    const detach = attachPointerDown(el, (cx, cy) =>
      game.onPointerDown(c2d.toLogical(cx, cy)),
    );
    loop.start();

    return () => {
      detach();
      loop.stop();
    };
  }, [started, runKey]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-asphalt", className)}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ touchAction: "none" }}
      />
      {started && hud && renderHud?.(hud)}
      {!started && (
        <GameStartGate
          title={startTitle}
          hint={startHint}
          onStart={() => setStarted(true)}
        />
      )}
    </div>
  );
}
