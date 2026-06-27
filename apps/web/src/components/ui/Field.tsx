import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

/** Labelled text input, compatible with react-hook-form's register(). */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, id, className, ...props },
  ref,
) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-head text-sm font-semibold text-paper/90">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full rounded-xl border-[3px] border-ink bg-paper px-4 py-3 text-base",
          "text-ink placeholder:text-ink/50",
          "focus:outline-none focus-visible:border-mario-blue",
          error && "border-mario-red",
          className,
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-paper/50">{hint}</p>}
      {error && (
        <p id={errorId} className="text-xs font-semibold text-mario-red">
          {error}
        </p>
      )}
    </div>
  );
});
