import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "red" | "blue" | "green" | "yellow" | "ink" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  red: "bg-mario-red text-paper border-ink shadow-[0_5px_0_0_var(--color-ink)]",
  blue: "bg-mario-blue text-paper border-ink shadow-[0_5px_0_0_var(--color-ink)]",
  green: "bg-mario-green text-paper border-ink shadow-[0_5px_0_0_var(--color-ink)]",
  yellow: "bg-mario-yellow text-ink border-ink shadow-[0_5px_0_0_var(--color-ink)]",
  ink: "bg-ink text-paper border-ink shadow-[0_5px_0_0_rgba(0,0,0,0.35)]",
  outline: "bg-paper text-ink border-ink shadow-[0_5px_0_0_var(--color-ink)]",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

/** Shared class string so links can wear the button look too. */
export function buttonClasses(variant: Variant = "red", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-pop border-[3px]",
    "font-head font-semibold uppercase tracking-wide select-none",
    "transition-transform duration-100 active:translate-y-[5px] active:shadow-none",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "red", size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
});
