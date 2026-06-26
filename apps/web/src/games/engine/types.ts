/** Shared types for the Canvas minigame engines. No React here. */

export interface GameContext {
  ctx: CanvasRenderingContext2D;
  /** Logical (CSS-pixel) drawing dimensions — already DPR-corrected. */
  width: number;
  height: number;
  dpr: number;
  /** Total elapsed game time in milliseconds. */
  t: number;
}

/** A pointer/tap position in logical canvas coordinates. */
export interface PointerSample {
  x: number;
  y: number;
}

/** Live data a game exposes for the React HUD overlay. */
export type HudState = Record<string, number | string>;

/**
 * A self-contained game. The loop drives init → (update*, render)* and reports
 * the result when isOver() flips true. Implementations must not allocate in
 * update/render hot paths.
 */
export interface Game<TResult> {
  init(c: GameContext): void;
  /** Advance logic by a fixed `dt` (ms). Pure logic — no drawing. */
  update(dt: number, c: GameContext): void;
  /** Draw the current state. No mutation. */
  render(c: GameContext): void;
  /** Discrete tap input, in logical coordinates. */
  onPointerDown(p: PointerSample): void;
  isOver(): boolean;
  getResult(): TResult;
  /** Optional snapshot for the HUD. */
  getHud?(): HudState;
  teardown?(): void;
}
