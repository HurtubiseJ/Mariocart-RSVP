import type { Canvas2D } from "./Canvas2D";
import type { Game } from "./types";

interface LoopCallbacks<TResult> {
  onOver: (result: TResult) => void;
  /** Called once per rendered frame (use for throttled HUD reads). */
  onTick?: () => void;
}

/**
 * Fixed-timestep game loop. Logic advances in deterministic FIXED-ms steps via
 * an accumulator (stable across 60/90/120Hz displays); rendering happens once
 * per animation frame. Auto-pauses when the tab is hidden and clamps long
 * frames so returning from background doesn't fast-forward the simulation.
 */
export class GameLoop<TResult> {
  private static readonly FIXED = 1000 / 120;
  private static readonly MAX_FRAME = 250;

  private raf = 0;
  private last = 0;
  private acc = 0;
  private elapsed = 0;
  private running = false;
  private over = false;
  // When true the loop keeps rendering but does not advance game logic — used to
  // show the (static) game scene behind the pre-game countdown.
  private logicPaused = false;

  constructor(
    private readonly game: Game<TResult>,
    private readonly canvas: Canvas2D,
    private readonly cb: LoopCallbacks<TResult>,
  ) {}

  /** Freeze/unfreeze logic while still rendering (e.g. during a countdown). */
  setLogicPaused(paused: boolean) {
    this.logicPaused = paused;
    // Drop any accumulated time so unpausing doesn't fast-forward the sim.
    this.acc = 0;
    this.last = performance.now();
  }

  start() {
    if (this.running || this.over) return;
    this.canvas.observe();
    this.game.init(this.canvas.context);
    this.running = true;
    this.last = performance.now();
    document.addEventListener("visibilitychange", this.onVisibility);
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    if (!this.running) return;
    let delta = now - this.last;
    this.last = now;
    if (delta > GameLoop.MAX_FRAME) delta = GameLoop.MAX_FRAME;

    const ctx = this.canvas.context;
    if (!this.logicPaused) {
      this.acc += delta;
      while (this.acc >= GameLoop.FIXED && !this.over) {
        this.elapsed += GameLoop.FIXED;
        ctx.t = this.elapsed;
        this.game.update(GameLoop.FIXED, ctx);
        this.acc -= GameLoop.FIXED;
        if (this.game.isOver()) this.over = true;
      }
    }

    ctx.t = this.elapsed;
    this.game.render(ctx);
    this.cb.onTick?.();

    if (this.over) {
      const result = this.game.getResult();
      this.stop();
      this.cb.onOver(result);
      return;
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  private onVisibility = () => {
    if (document.hidden) this.pause();
    else this.resume();
  };

  pause() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resume() {
    if (this.running || this.over) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.canvas.disconnect();
    this.game.teardown?.();
  }
}
