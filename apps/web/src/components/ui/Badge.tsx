import { cn } from "@/lib/cn";

type Tone = "red" | "blue" | "green" | "yellow" | "ink";

const TONES: Record<Tone, string> = {
  red: "bg-mario-red text-paper",
  blue: "bg-mario-blue text-paper",
  green: "bg-mario-green text-paper",
  yellow: "bg-mario-yellow text-ink",
  ink: "bg-ink text-paper",
};

export function Badge({
  tone = "ink",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-ink px-3 py-1",
        "font-head text-xs font-semibold uppercase tracking-wider",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
