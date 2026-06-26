import type { FlappyScore } from "@/lib/api.types";
import type { Game, GameContext, HudState, PointerSample } from "../engine/types";
import { FLAPPY } from "./flappyConfig";

interface Pipe {
  x: number;
  gapCenter: number;
  passed: boolean;
}

const TAU = Math.PI * 2;

/**
 * Flappy Bird with a beer-mug "bird". Constant scroll speed; gravity + a fixed
 * flap impulse per tap. Score = gates cleared. Ceiling clamps, ground/pipes
 * kill. The host runs this twice and keeps the best of two runs.
 *
 * Note: getResult() reports gates for *this* run as { bestGatesPassed }, runs:
 * [this]. The host combines both runs into the final FlappyScore via
 * lib/scoring#buildFlappyScore.
 */
export class FlappyEngine implements Game<FlappyScore> {
  private w = 0;
  private h = 0;
  private ground = 0;
  private gap = 0;

  private birdY = 0;
  private vy = 0;
  private pipes: Pipe[] = [];
  private gatesPassed = 0;
  private over = false;

  init(c: GameContext): void {
    this.w = c.width;
    this.h = c.height;
    this.ground = this.h * (1 - FLAPPY.groundFraction);
    this.gap = this.ground * FLAPPY.gapFraction;
    this.birdY = this.h * 0.42;
    this.vy = 0;
    this.gatesPassed = 0;
    this.over = false;
    this.pipes = [this.spawnPipe(this.w + FLAPPY.firstPipeDelay)];
  }

  private spawnPipe(x: number): Pipe {
    const min = FLAPPY.edgeMargin + this.gap / 2;
    const max = this.ground - FLAPPY.edgeMargin - this.gap / 2;
    const gapCenter = min + Math.random() * Math.max(1, max - min);
    return { x, gapCenter, passed: false };
  }

  update(dt: number, c: GameContext): void {
    if (this.over) return;
    // Re-read dimensions in case of a resize mid-run.
    this.w = c.width;
    this.h = c.height;
    this.ground = this.h * (1 - FLAPPY.groundFraction);
    this.gap = this.ground * FLAPPY.gapFraction;

    const dts = dt / 1000;
    const birdX = this.w * FLAPPY.birdXFraction;
    const r = FLAPPY.birdRadius;

    this.vy = Math.min(this.vy + FLAPPY.gravity * dts, FLAPPY.maxFall);
    this.birdY += this.vy * dts;

    // Ceiling clamp.
    if (this.birdY - r < 0) {
      this.birdY = r;
      this.vy = 0;
    }
    // Ground = death.
    if (this.birdY + r >= this.ground) {
      this.birdY = this.ground - r;
      this.over = true;
      return;
    }

    // Move pipes + scoring + collisions.
    let rightmost = -Infinity;
    for (const p of this.pipes) {
      p.x -= FLAPPY.scrollSpeed * dts;
      if (p.x > rightmost) rightmost = p.x;
      if (!p.passed && p.x + FLAPPY.pipeWidth < birdX) {
        p.passed = true;
        this.gatesPassed += 1;
      }
      const overlapX = birdX + r > p.x && birdX - r < p.x + FLAPPY.pipeWidth;
      if (overlapX) {
        const gapTop = p.gapCenter - this.gap / 2;
        const gapBottom = p.gapCenter + this.gap / 2;
        if (this.birdY - r < gapTop || this.birdY + r > gapBottom) {
          this.over = true;
          return;
        }
      }
    }

    // Drop the leftmost pipe once fully off-screen.
    if (this.pipes.length && this.pipes[0].x + FLAPPY.pipeWidth < -20) {
      this.pipes.shift();
    }
    // Spawn the next pipe to keep the cadence.
    if (rightmost <= this.w - FLAPPY.pipeSpacing) {
      this.pipes.push(this.spawnPipe(rightmost + FLAPPY.pipeSpacing));
    }
  }

  onPointerDown(_p: PointerSample): void {
    void _p;
    if (this.over) return;
    this.vy = FLAPPY.flapVelocity;
  }

  isOver(): boolean {
    return this.over;
  }

  getResult(): FlappyScore {
    // Single-run result; the host merges both runs (best counts).
    return { bestGatesPassed: this.gatesPassed, runs: [this.gatesPassed], score: 0 };
  }

  getHud(): HudState {
    return { gates: this.gatesPassed };
  }

  // ----------------------------------------------------------------- render
  render(c: GameContext): void {
    const { ctx, width, height } = c;
    const birdX = width * FLAPPY.birdXFraction;
    const r = FLAPPY.birdRadius;

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#1c2b46");
    sky.addColorStop(1, "#0e1726");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Pipes
    for (const p of this.pipes) {
      const gapTop = p.gapCenter - this.gap / 2;
      const gapBottom = p.gapCenter + this.gap / 2;
      this.drawPipe(ctx, p.x, 0, gapTop);
      this.drawPipe(ctx, p.x, gapBottom, this.ground - gapBottom);
    }

    // Ground
    ctx.fillStyle = "#2f7d33";
    ctx.fillRect(0, this.ground, width, height - this.ground);
    ctx.fillStyle = "#43b047";
    ctx.fillRect(0, this.ground, width, 6);

    // Bird (beer mug)
    const tilt = Math.max(-0.5, Math.min(0.9, this.vy / 900));
    ctx.save();
    ctx.translate(birdX, this.birdY);
    ctx.rotate(tilt);
    // body
    ctx.fillStyle = "#f5a623";
    ctx.strokeStyle = "#0a0a0b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // foam cap
    ctx.fillStyle = "#fdf6e3";
    ctx.beginPath();
    ctx.arc(0, -r * 0.6, r * 0.7, Math.PI, TAU);
    ctx.fill();
    // eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.15, r * 0.32, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#0a0a0b";
    ctx.beginPath();
    ctx.arc(r * 0.45, -r * 0.15, r * 0.15, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawPipe(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    h: number,
  ): void {
    if (h <= 0) return;
    const w = FLAPPY.pipeWidth;
    ctx.fillStyle = "#43b047";
    ctx.strokeStyle = "#2f7d33";
    ctx.lineWidth = 4;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    // lip at the gap-facing end
    const lipH = 16;
    const lipY = y === 0 ? y + h - lipH : y;
    ctx.fillRect(x - 5, lipY, w + 10, lipH);
    ctx.strokeRect(x - 5, lipY, w + 10, lipH);
  }
}
