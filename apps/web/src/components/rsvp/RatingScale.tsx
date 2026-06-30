"use client";

import { cn } from "@/lib/cn";

/**
 * A 1-10 rating selector rendered as a row of tappable chips. Controlled:
 * the parent owns the selected value.
 */
export function RatingScale({
  value,
  onChange,
  lowLabel,
  highLabel,
  name = "rating",
}: {
  value: number | null;
  onChange: (value: number) => void;
  lowLabel?: string;
  highLabel?: string;
  name?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={selected}
              aria-label={`${name} ${n}`}
              onClick={() => onChange(n)}
              className={cn(
                "flex h-11 items-center justify-center rounded-xl border-[3px] border-ink font-head text-lg font-bold transition-transform active:translate-y-0.5",
                selected
                  ? "bg-mario-yellow text-ink shadow-[0_4px_0_0_var(--color-ink)]"
                  : "bg-paper text-ink/70 hover:bg-cream",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      {(lowLabel || highLabel) && (
        <div className="flex justify-between px-1 font-head text-xs font-semibold text-paper/60">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  );
}
