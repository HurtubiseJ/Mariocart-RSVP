import { TransitionLink } from "@/components/transition/TransitionLink";

const LINKS = [
  { href: "/rsvp", label: "RSVP" },
  { href: "/standings", label: "Standings" },
  { href: "/rules", label: "Rules" },
  { href: "/history", label: "History" },
  { href: "/info1", label: "Event Info" },
  { href: "/scoring", label: "Scoring" },
  { href: "/unrsvp", label: "Un-RSVP" },
];

export function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-asphalt text-paper">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-5 py-10 text-center">
        <div className="h-3 w-full max-w-xs bg-checker" aria-hidden />
        <p className="font-display text-2xl tracking-wide">BEERIO KART WORLD CUP</p>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          {LINKS.map((l) => (
            <TransitionLink
              key={l.href}
              href={l.href}
              className="font-head font-semibold text-paper/80 transition-colors hover:text-mario-yellow"
            >
              {l.label}
            </TransitionLink>
          ))}
        </nav>
        <p className="text-xs text-paper/40">
          Drink responsibly &amp; remember: never drink and drive.
        </p>
      </div>
    </footer>
  );
}
