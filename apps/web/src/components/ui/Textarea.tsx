import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

/** Labelled multiline input, compatible with react-hook-form's register(). */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField({ label, hint, error, id, className, ...props }, ref) {
    const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="font-head text-sm font-semibold text-paper/90"
        >
          {label}
        </label>
        <textarea
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "min-h-28 w-full resize-y rounded-xl border-[3px] border-ink bg-paper px-4 py-3 text-base",
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
  },
);
