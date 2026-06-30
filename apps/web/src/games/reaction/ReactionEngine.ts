import type { ReactionScore } from "@/lib/api.types";
import { buildReactionScore } from "@/lib/scoring";
import type { Game, GameContext, HudState, PointerSample } from "../engine/types";
import { COOLDOWN_MS, ROUNDS, TOTAL_ROUNDS, UNTAPPED_MISS_DEG } from "./reactionConfig";

interface Zone {
  center: number; // radians
  consumed: boolean;
  hit: boolean;
}

const TAU = Math.PI * 2;

function angularDistance(a: number, b: number): number {
  const d = Math.abs(((a - b) % TAU + TAU) % TAU);
  return Math.min(d, TAU - d);
}

const radToDeg = (r: number) => (r * 180) / Math.PI;

const START_ANGLE = -Math.PI / 2; // top of the ring
const norm = (a: number) => ((a % TAU) + TAU) % TAU;

/**
 * Dead-by-Daylight-style skill check. Each round is one full 360° sweep starting
 * from the top: the indicator makes a single pass and the player taps as it
 * crosses each red zone. When the revolution completes the round ends — any zone
 * left un-tapped counts as a miss — and the next round begins. Score rewards
 * accurate hits and penalises distance from the zone centre (see lib/scoring.ts).
 */
export class ReactionEngine implements Game<ReactionScore> {
  private roundIdx = 0;
  private zones: Zone[] = [];
  private halfWidth = ROUNDS[0].halfWidth;
  private speed = ROUNDS[0].speed;
  private angle = START_ANGLE;
  private rotation = 0; // radians swept this round
  private roundDone = false; // sweep finished; in the brief end-of-round hold
  private cooldown = 0;
  private over = false;

  private hits = 0;
  private missedDistance = 0; // degrees
  private flash: { hit: boolean; until: number } | null = null;

  init(): void {
    this.loadRound(0);
  }

  private loadRound(i: number) {
    const cfg = ROUNDS[i];
    this.roundIdx = i;
    this.halfWidth = cfg.halfWidth;
    this.speed = cfg.speed;
    this.angle = START_ANGLE;
    this.rotation = 0;
    this.roundDone = false;
    this.cooldown = 0;
    this.zones = this.makeZones(cfg.zones);
  }

  // Place zones ahead of the start angle within the single sweep, with a run-up
  // so the player has time to react and (for two zones) clear separation.
  //
  // The run-up must clear the zone's half-width plus a fixed reaction buffer,
  // otherwise a wide zone's leading edge can sit right on the spinner's starting
  // position (impossible to time). leadIn is measured to the zone *centre*.
  private makeZones(count: number): Zone[] {
    const REACTION_BUFFER = 1.0; // radians of clear space before the zone edge
    const leadIn = this.halfWidth + REACTION_BUFFER;
    if (count === 1) {
      const range = Math.max(0.2, TAU - leadIn - this.halfWidth - 0.3);
      const offset = leadIn + Math.random() * range;
      return [{ center: norm(START_ANGLE + offset), consumed: false, hit: false }];
    }
    const o1 = leadIn + Math.random() * Math.max(0.2, Math.PI - leadIn);
    const o2 = o1 + 0.8 + Math.random() * Math.max(0.2, TAU - o1 - 0.8 - this.halfWidth - 0.2);
    return [
      { center: norm(START_ANGLE + o1), consumed: false, hit: false },
      { center: norm(START_ANGLE + o2), consumed: false, hit: false },
    ];
  }

  update(dt: number, c: GameContext): void {
    void c;
    if (this.over) return;

    const delta = (this.speed * dt) / 1000;
    this.angle = (this.angle + delta) % TAU;

    if (this.roundDone) {
      // Brief hold (sweep keeps turning for continuity) before the next round.
      this.cooldown -= dt;
      if (this.cooldown <= 0) {
        const next = this.roundIdx + 1;
        if (next >= TOTAL_ROUNDS) this.over = true;
        else this.loadRound(next);
      }
      return;
    }

    this.rotation += delta;
    if (this.rotation >= TAU) this.finishRound();
  }

  private finishRound(): void {
    // Any zone not tapped during the sweep is a miss.
    for (const z of this.zones) {
      if (!z.consumed) {
        z.consumed = true;
        z.hit = false;
        this.missedDistance += UNTAPPED_MISS_DEG;
      }
    }
    this.roundDone = true;
    this.cooldown = COOLDOWN_MS;
  }

  onPointerDown(_p: PointerSample): void {
    void _p;
    // Taps only count during the active sweep; the round ends on completion, not
    // on a tap, so the player gets exactly one pass per zone.
    if (this.over || this.roundDone) return;
    const target = this.nearestUnconsumed();
    if (!target) return;

    const dist = angularDistance(this.angle, target.center);
    const within = dist <= this.halfWidth;
    if (within) this.hits += 1;
    this.missedDistance += radToDeg(dist);
    target.consumed = true;
    target.hit = within;
    this.flash = { hit: within, until: performance.now() + 280 };
  }

  private nearestUnconsumed(): Zone | null {
    let best: Zone | null = null;
    let bestDist = Infinity;
    for (const z of this.zones) {
      if (z.consumed) continue;
      const d = angularDistance(this.angle, z.center);
      if (d < bestDist) {
        bestDist = d;
        best = z;
      }
    }
    return best;
  }

  isOver(): boolean {
    return this.over;
  }

  getResult(): ReactionScore {
    return buildReactionScore(this.hits, Math.round(this.missedDistance));
  }

  getHud(): HudState {
    return {
      round: Math.min(this.roundIdx + 1, TOTAL_ROUNDS),
      totalRounds: TOTAL_ROUNDS,
      hits: this.hits,
    };
  }

  // ----------------------------------------------------------------- render
  render(c: GameContext): void {
    const { ctx, width, height } = c;
    ctx.fillStyle = "#161619";
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height * 0.54;
    const r = Math.min(width, height) * 0.34;
    const track = Math.max(14, r * 0.16);

    // Track ring
    ctx.lineCap = "butt";
    ctx.strokeStyle = "#2b2b30";
    ctx.lineWidth = track;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.stroke();

    // Zones
    for (const z of this.zones) {
      ctx.strokeStyle = z.consumed
        ? z.hit
          ? "#43b047"
          : "#7a2b2b"
        : "#e52521";
      ctx.lineWidth = track;
      ctx.beginPath();
      ctx.arc(cx, cy, r, z.center - this.halfWidth, z.center + this.halfWidth);
      ctx.stroke();
    }

    // Indicator hand
    const tipX = cx + Math.cos(this.angle) * (r + track * 0.1);
    const tipY = cy + Math.sin(this.angle) * (r + track * 0.1);
    ctx.strokeStyle = "#fbd000";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(5, r * 0.05);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Indicator tip glow
    ctx.fillStyle = "#fbd000";
    ctx.beginPath();
    ctx.arc(tipX, tipY, Math.max(6, r * 0.06), 0, TAU);
    ctx.fill();

    // Centre hub with round number
    const flashing = this.flash && performance.now() < this.flash.until;
    ctx.fillStyle = flashing ? (this.flash!.hit ? "#43b047" : "#e52521") : "#0a0a0b";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.42, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // NB: canvas font shorthand can't resolve CSS vars — use a concrete stack.
    ctx.font = `700 ${Math.round(r * 0.34)}px "Trebuchet MS", system-ui, sans-serif`;
    ctx.fillText(`${Math.min(this.roundIdx + 1, TOTAL_ROUNDS)}`, cx, cy - r * 0.04);
    ctx.font = `600 ${Math.round(r * 0.12)}px "Trebuchet MS", system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(`OF ${TOTAL_ROUNDS}`, cx, cy + r * 0.22);
  }
}
