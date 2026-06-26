import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-pop border-[3px] border-ink bg-paper",
        "shadow-[0_8px_0_0_var(--color-ink)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
