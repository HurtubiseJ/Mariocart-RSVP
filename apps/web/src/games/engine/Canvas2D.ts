import type { GameContext, PointerSample } from "./types";

/**
 * Wraps a <canvas>, handling high-DPI sizing and client→logical coordinate
 * mapping. Exposes a single stable GameContext object (mutated in place) so the
 * loop never allocates per frame.
 */
export class Canvas2D {
  readonly el: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly context: GameContext;
  private ro?: ResizeObserver;

  constructor(el: HTMLCanvasElement) {
    const ctx = el.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D canvas context unavailable");
    this.el = el;
    this.ctx = ctx;
    this.context = { ctx, width: 0, height: 0, dpr: 1, t: 0 };
    this.resize();
  }

  resize = () => {
    const rect = this.el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    this.el.width = Math.round(w * dpr);
    this.el.height = Math.round(h * dpr);
    // Draw in logical pixels; the transform scales to device pixels.
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.context.width = w;
    this.context.height = h;
    this.context.dpr = dpr;
  };

  observe() {
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(this.el);
    window.addEventListener("orientationchange", this.resize);
  }

  disconnect() {
    this.ro?.disconnect();
    this.ro = undefined;
    window.removeEventListener("orientationchange", this.resize);
  }

  /** Map a client (event) coordinate to logical canvas space. */
  toLogical(clientX: number, clientY: number): PointerSample {
    const rect = this.el.getBoundingClientRect();
    const sx = rect.width === 0 ? 0 : this.context.width / rect.width;
    const sy = rect.height === 0 ? 0 : this.context.height / rect.height;
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  }
}
