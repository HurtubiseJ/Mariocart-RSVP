import { cn } from "@/lib/cn";

/** Page section wrapper: constrains width and adds responsive padding. */
export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("w-full px-5 py-12 sm:px-8 sm:py-16", className)} {...props}>
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </section>
  );
}
