import { HeroSection } from "@/components/hero/HeroSection";
import { InfoSection, type InfoSectionProps } from "@/components/hero/InfoSection";

const SECTIONS: Omit<InfoSectionProps, "index">[] = [
  {
    icon: "🏁",
    title: "RSVP",
    blurb: "Lock in your spot, then earn your tournament seed in two minigames.",
    href: "/rsvp",
    cta: "Start",
    accent: "red",
  },
  {
    icon: "🏆",
    title: "STANDINGS",
    blurb: "See where every racer landed after the seeding games.",
    href: "/standings",
    cta: "View",
    accent: "blue",
  },
  {
    icon: "📜",
    title: "RULES",
    blurb: "How the bracket works, the format, and the all-important house rules.",
    href: "/rules",
    cta: "Read",
    accent: "green",
  },
  {
    icon: "🕹️",
    title: "HISTORY",
    blurb: "Champions, upsets, and bragging rights from tournaments past.",
    href: "/history",
    cta: "Look back",
    accent: "yellow",
  },
  {
    icon: "📍",
    title: "EVENT INFO",
    blurb: "When and where it all goes down. Get the date, time, and place.",
    href: "/info1",
    cta: "Details",
    accent: "red",
  },
];

export default function Home() {
  return (
    <main>
      <HeroSection />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-5 py-16 sm:py-20">
        <header className="text-center">
          <h2 className="font-display text-3xl tracking-wide sm:text-4xl">THE LINEUP</h2>
          <p className="mt-1 text-ink/60">Everything you need before race day.</p>
        </header>

        {SECTIONS.map((s, i) => (
          <InfoSection key={s.href} index={i} {...s} />
        ))}
      </div>
    </main>
  );
}
