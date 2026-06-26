import { TransitionLink } from "@/components/transition/TransitionLink";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-display text-7xl text-mario-red sm:text-8xl">404</p>
      <p className="max-w-sm text-lg text-ink/70">
        Wrong turn! That page spun off the track.
      </p>
      <TransitionLink href="/" className={buttonClasses("blue", "lg")}>
        Back to the start line 🏁
      </TransitionLink>
    </main>
  );
}
