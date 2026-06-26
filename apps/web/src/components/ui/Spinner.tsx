import { cn } from "@/lib/cn";

/** A spinning checkered "wheel" loader. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-7 w-7 animate-spin rounded-full border-4 border-silver border-t-mario-red",
        className,
      )}
    />
  );
}
