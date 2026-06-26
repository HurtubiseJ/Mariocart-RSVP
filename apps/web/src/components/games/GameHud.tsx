import { cn } from "@/lib/cn";

/** Non-interactive overlay row pinned to the top of the game canvas. */
export function GameHud({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A single labelled HUD chip. */
export function HudChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-ink bg-paper/95 px-3 py-1.5 text-center shadow-[0_3px_0_0_var(--color-ink)]",
        className,
      )}
    >
      <div className="font-head text-[10px] font-bold tracking-wider text-ink/60 uppercase">
        {label}
      </div>
      <div className="font-display text-lg leading-none text-ink">{value}</div>
    </div>
  );
}
