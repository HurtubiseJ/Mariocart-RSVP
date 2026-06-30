import { HeroSection } from "@/components/hero/HeroSection";
import { type InfoSectionProps } from "@/components/hero/InfoSection";
import { SlideDateTimeSection } from "@/components/hero/SlideDateTimeSection";

const SECTIONS: Omit<InfoSectionProps, "index">[] = [
  {
    title: "RSVP",
    blurb:
      "Lock in your spot as a player or spectator — players battle two minigames.",
    href: "/rsvp",
    cta: "Start",
    accent: "red",
  },
  {
    title: "STANDINGS",
    blurb: "See where every racer landed on the combo-score game standings.",
    href: "/standings",
    cta: "View",
    accent: "blue",
  },
  {
    title: "RULES",
    blurb:
      "How the bracket works, the format, and the all-important house rules.",
    href: "/rules",
    cta: "Read",
    accent: "green",
  },
  {
    title: "HISTORY",
    blurb: "Champions, upsets, and bragging rights from tournaments past.",
    href: "/history",
    cta: "Look back",
    accent: "yellow",
  },
  {
    title: "EVENT INFO",
    blurb: "July 25 at Luke's casa. Get the time, place, and parking.",
    href: "/info1",
    cta: "Details",
    accent: "red",
  },
];

export default function Home() {
  return (
    <main className="relative bg-asphalt/50">
      <HeroSection />

      {SECTIONS.map((s, i) => (
        <SlideDateTimeSection key={s.href} index={i} {...s} />
      ))}
    </main>
  );
}
