"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const MEDAL = ["🥇", "🥈", "🥉"];

type Outcome = "Won" | "Loss" | "Tie";

type Game = {
  result: Outcome;
  opponent: string;
  /** Opponent whose name was uncertain — rendered greyed out. */
  uncertain?: boolean;
};

type Tournament = {
  year: string;
  /** Ordinal finish, e.g. 1 for 1st place. */
  place: number;
  record: string;
  games: Game[];
};

type Player = {
  name: string;
  record: string;
  /** True if they won 1st place in any tournament — earns a Mario star. */
  loser?: boolean;
  champion?: boolean;
  tournaments: Tournament[];
};

/** Ordered by all-time ranking (best first). */
const PLAYERS: Player[] = [
  {
    name: "Matthew L",
    record: "5-2",
    champion: true,
    tournaments: [
      {
        year: "2024",
        place: 1,
        record: "4-0",
        games: [
          { result: "Won", opponent: "Adam R" },
          { result: "Won", opponent: "Owen V" },
          { result: "Won", opponent: "Curtis S" },
          { result: "Won", opponent: "Luke C" },
        ],
      },
      {
        year: "2025",
        place: 4,
        record: "1-2",
        games: [
          { result: "Won", opponent: "Faith F" },
          { result: "Loss", opponent: "John H" },
          { result: "Loss", opponent: "Ashley U" },
        ],
      },
    ],
  },
  {
    name: "John H",
    record: "3-0",
    champion: true,
    tournaments: [
      {
        year: "2025",
        place: 1,
        record: "3-0",
        games: [
          { result: "Won", opponent: "Stephen O" },
          { result: "Won", opponent: "Matthew L" },
          { result: "Won", opponent: "Luke C" },
        ],
      },
    ],
  },
  {
    name: "Luke C",
    record: "6-3",
    tournaments: [
      {
        year: "2024",
        place: 2,
        record: "4-2",
        games: [
          { result: "Loss", opponent: "Owen V" },
          { result: "Won", opponent: "Adam R" },
          { result: "Won", opponent: "Owen V" },
          { result: "Won", opponent: "Michael W" },
          { result: "Won", opponent: "Curtis S" },
          { result: "Loss", opponent: "Matthew L" },
        ],
      },
      {
        year: "2025",
        place: 2,
        record: "2-1",
        games: [
          { result: "Won", opponent: "Alyssa L" },
          { result: "Won", opponent: "Kameryn" },
          { result: "Loss", opponent: "John H" },
        ],
      },
    ],
  },
  {
    name: "Ashley U",
    record: "4-1",
    tournaments: [
      {
        year: "2025",
        place: 3,
        record: "4-1",
        games: [
          { result: "Loss", opponent: "Faith F" },
          { result: "Won", opponent: "Jesse B" },
          { result: "Won", opponent: "Faith F" },
          { result: "Won", opponent: "Matthew L" },
        ],
      },
    ],
  },
  {
    name: "Curtis S",
    record: "2-2",
    tournaments: [
      {
        year: "2024",
        place: 3,
        record: "2-2",
        games: [
          { result: "Won", opponent: "Michael W" },
          { result: "Won", opponent: "Emily S" },
          { result: "Loss", opponent: "Matthew L" },
          { result: "Loss", opponent: "Luke C" },
        ],
      },
    ],
  },
  {
    name: "Michael W",
    record: "1-2",
    tournaments: [
      {
        year: "2024",
        place: 4,
        record: "1-2",
        games: [
          { result: "Loss", opponent: "Curtis S" },
          { result: "Won", opponent: "Emily S" },
          { result: "Loss", opponent: "Luke C" },
        ],
      },
    ],
  },
  {
    name: "Owen V",
    record: "1-2",
    tournaments: [
      {
        year: "2024",
        place: 5,
        record: "1-2",
        games: [
          { result: "Won", opponent: "Luke C" },
          { result: "Loss", opponent: "Matthew L" },
          { result: "Loss", opponent: "Luke C" },
        ],
      },
    ],
  },
  {
    name: "Faith F",
    record: "1-2",
    tournaments: [
      {
        year: "2025",
        place: 5,
        record: "1-2",
        games: [
          { result: "Won", opponent: "Ashley U" },
          { result: "Loss", opponent: "Matthew L" },
          { result: "Loss", opponent: "Ashley U" },
        ],
      },
    ],
  },
  {
    name: "Alyssa L",
    record: "1-1-1",
    tournaments: [
      {
        year: "2025",
        place: 6,
        record: "1-1-1",
        games: [
          { result: "Won", opponent: "Jesse B" },
          { result: "Loss", opponent: "Luke C" },
          { result: "Tie", opponent: "Jesse B" },
        ],
      },
    ],
  },
  {
    name: "Jesse B",
    record: "1-1-1",
    tournaments: [
      {
        year: "2025",
        place: 6,
        record: "1-1-1",
        games: [
          { result: "Loss", opponent: "Alyssa L" },
          { result: "Won", opponent: "Emily S" },
          { result: "Tie", opponent: "Alyssa L" },
        ],
      },
    ],
  },
  {
    name: "Adam R",
    record: "0-2",
    tournaments: [
      {
        year: "2024",
        place: 6,
        record: "0-2",
        games: [
          { result: "Loss", opponent: "Matthew L" },
          { result: "Loss", opponent: "Luke C" },
        ],
      },
    ],
  },
  {
    name: "Stephen O",
    record: "0-2",
    tournaments: [
      {
        year: "2025",
        place: 7,
        record: "0-2",
        games: [
          { result: "Loss", opponent: "John H" },
          { result: "Loss", opponent: "Ashley U" },
        ],
      },
    ],
  },
  {
    name: "Emily S",
    record: "0-4",
    loser: true,
    tournaments: [
      {
        year: "2024",
        place: 6,
        record: "0-2",
        games: [
          { result: "Loss", opponent: "Curtis S" },
          { result: "Loss", opponent: "Michael W" },
        ],
      },
      {
        year: "2025",
        place: 7,
        record: "0-2",
        games: [
          { result: "Loss", opponent: "Kameryn" },
          { result: "Loss", opponent: "Jesse B" },
        ],
      },
    ],
  },
];

const ORDINAL = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
 
const IMG_SRC = {
    loser: "/assets/mario_drunk.jpg",
    star: "/assets/MKW_Super_Star_Roulette.webp",
}

const BRACKETS = [
  { year: "2024", src: "/assets/2024_beeriokart_bracket.jpg" },
  { year: "2025", src: "/assets/2025_beeriokart_bracket.jpg" },
];

const OUTCOME_STYLE: Record<Outcome, string> = {
  Won: "bg-mario-green/15 text-mario-green",
  Loss: "bg-mario-red/10 text-mario-red",
  Tie: "bg-silver/50 text-ink/60",
};

/** A single game result: outcome pill + opponent. */
function GameRow({ game }: { game: Game }) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <span
        className={cn(
          "w-14 shrink-0 rounded-full py-0.5 text-center font-head text-xs font-bold",
          OUTCOME_STYLE[game.result],
        )}
      >
        {game.result}
      </span>
      <span
        className={cn(
          "font-head text-sm",
          game.uncertain ? "text-ink/40 italic" : "text-ink/80",
        )}
      >
        {game.opponent}
        {game.uncertain && "?"}
      </span>
    </li>
  );
}

/** One tournament for a player — its own collapsible sub-dropdown. */
function TournamentBlock({ t }: { t: Tournament }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border-2 border-ink/10 bg-paper">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-3 py-2 text-left focus:outline-none focus-visible:bg-black/5"
      >
        <span className="font-display text-lg text-ink">{t.year}</span>
        <span className="flex-1 font-head text-sm font-semibold text-ink/70">
          {t.place <= 3 && MEDAL[t.place - 1]} {ORDINAL[t.place]} place
        </span>
        <span className="font-head text-sm font-bold text-ink/50">({t.record})</span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          className="text-ink/40"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="border-t-2 border-ink/10 px-3 py-1.5">
              {t.games.map((g, i) => (
                <GameRow key={i} game={g} />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HistoryPage() {
  // Hover previews a row (desktop); a click pins it open (works on touch too).
  const [pinned, setPinned] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  // Bracket tapped open in the full-screen lightbox (null = closed).
  const [zoomed, setZoomed] = useState<(typeof BRACKETS)[number] | null>(null);

  // Close the lightbox on Escape and lock body scroll while it's open.
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomed(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomed]);

  return (
    <PageShell title="HISTORY" subtitle="Previous tournament records.">
      <h2 className="mb-3 text-center font-display text-2xl tracking-wide text-paper">
        RANKINGS
      </h2>

      <ol className="flex flex-col gap-2.5">
        {PLAYERS.map((p, i) => {
          const expanded = pinned === p.name || hover === p.name;
          const places = p.tournaments
            .map((t) => `${ORDINAL[t.place]} ’${t.year.slice(2)}`)
            .join(" · ");
          return (
            <li key={p.name}>
              <Card
                className={cn(
                  "overflow-hidden p-0",
                  i === 0 && "bg-mario-yellow",
                  i === 1 && "bg-silver/40",
                  i === 2 && "bg-mario-red/20",
                )}
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setPinned((id) => (id === p.name ? null : p.name))}
                  onMouseEnter={() => setHover(p.name)}
                  onMouseLeave={() => setHover(null)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left focus:outline-none focus-visible:bg-black/5"
                >
                  <div className="flex w-10 shrink-0 items-center justify-center font-display text-2xl">
                    <span className="text-ink/70">{i + 1}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {p.champion && (
                        <Image
                            src={IMG_SRC.star}
                            alt={`Star`}
                            width={42}
                            height={42}
                            className="h-auto w-auto"
                        />
                    )}
                    {p.loser && (
                        <Image
                            src={IMG_SRC.loser}
                            alt={`Loser`}
                            width={42}
                            height={42}
                            className="h-auto w-auto"
                        />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-head text-lg font-semibold text-ink">
                        {p.name}
                      </p>
                      <p className="truncate text-xs text-ink/50">{places}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl leading-none text-ink">
                      {p.record}
                    </p>
                    <p className="font-head text-[10px] tracking-wider text-ink/50 uppercase">
                      W-L{p.record.split("-").length > 2 && "-T"}
                    </p>
                  </div>
                  <motion.span
                    aria-hidden
                    animate={{ rotate: expanded ? 180 : 0 }}
                    className="ml-1 shrink-0 text-ink/40 text-[36px]"
                  >
                    ▾
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden bg-paper/60"
                    >
                      <div className="flex flex-col gap-2 border-t-2 border-ink/10 p-3">
                        {p.tournaments.map((t) => (
                          <TournamentBlock key={t.year} t={t} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </li>
          );
        })}
      </ol>

      <section className="mt-12">
        <h2 className="mb-4 text-center font-display text-2xl tracking-wide text-paper">
          BRACKETS
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BRACKETS.map((b) => (
            <Card key={b.year} className="overflow-hidden p-0">
              <div className="bg-mario-blue px-4 py-2 text-paper">
                <span className="font-display text-xl">{b.year}</span>
              </div>
              <button
                type="button"
                onClick={() => setZoomed(b)}
                aria-label={`View the ${b.year} bracket full screen`}
                className="group relative block w-full cursor-zoom-in bg-cream focus:outline-none focus-visible:ring-4 focus-visible:ring-mario-blue/50"
              >
                <Image
                  src={b.src}
                  alt={`${b.year} Beerio Kart tournament bracket`}
                  width={2825}
                  height={2160}
                  className="h-auto w-full"
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
                <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-ink/70 px-3 py-1 font-head text-xs font-bold text-paper opacity-80 transition group-hover:opacity-100">
                  ⤢ Tap to enlarge
                </span>
              </button>
            </Card>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setZoomed(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${zoomed.year} bracket`}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={() => setZoomed(null)}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border-2 border-paper/40 bg-ink/60 font-display text-2xl text-paper transition hover:bg-mario-red focus:outline-none focus-visible:ring-4 focus-visible:ring-paper/50"
            >
              ✕
            </button>
            <span className="mb-3 font-display text-2xl tracking-wide text-paper">
              {zoomed.year} BRACKET
            </span>
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative min-h-0 w-full max-w-6xl flex-1 cursor-zoom-out overflow-auto rounded-lg"
            >
              <Image
                src={zoomed.src}
                alt={`${zoomed.year} Beerio Kart tournament bracket`}
                width={2825}
                height={2160}
                className="h-auto w-full"
                sizes="100vw"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
