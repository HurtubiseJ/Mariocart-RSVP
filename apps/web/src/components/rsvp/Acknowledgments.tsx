"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { EVENT } from "@/lib/event";
import { useRsvpFlow } from "@/state/rsvpFlow";

interface Ack {
  /** When set, this label contains a rules link that opens in a new tab. */
  rulesLink?: boolean;
  text: React.ReactNode;
}

/** Acknowledgements: 2 checks for spectators, 3 (incl. rules) for players. */
export function Acknowledgments() {
  const rsvpType = useRsvpFlow((s) => s.rsvp_type);
  const status = useRsvpFlow((s) => s.status);
  const error = useRsvpFlow((s) => s.error);
  const accept = useRsvpFlow((s) => s.acceptAcknowledgments);

  const isPlayer = rsvpType === "player";

  const acks: Ack[] = useMemo(() => {
    const base: Ack[] = [
      {
        text: `I acknowledge that by checking this box I will show up unless I contact ${EVENT.host} at the latest one week before the event (${EVENT.cancelBy}). A consistent head count matters.`,
      },
      {
        text: `I acknowledge that if I do not show up without warning or contacting ${EVENT.host} one week before (${EVENT.cancelBy}), I owe $20 to ${EVENT.host}, I am a bad friend, and I have permanently hurt the friendship.`,
      },
    ];
    if (isPlayer) {
      base.push({
        rulesLink: true,
        text: (
          <>
            I acknowledge that I have read the{" "}
            <a
              href="/rules"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-mario-blue underline underline-offset-2"
            >
              rules
            </a>{" "}
            and will be on time.
          </>
        ),
      });
    }
    return base;
  }, [isPlayer]);

  const [checked, setChecked] = useState<boolean[]>(() => acks.map(() => false));

  const allChecked = checked.length === acks.length && checked.every(Boolean);
  const submitting = status === "submitting";

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)));

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {acks.map((ack, i) => (
          <li key={i}>
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-pop border-[3px] border-ink bg-paper p-4 transition-colors",
                checked[i] && "bg-cream",
              )}
            >
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="mt-1 h-5 w-5 shrink-0 accent-mario-green"
              />
              <span className="text-sm text-ink/80">{ack.text}</span>
            </label>
          </li>
        ))}
      </ul>

      {status === "error" && (
        <p className="text-sm font-semibold text-mario-red">
          {error ?? "Could not save your RSVP."}
        </p>
      )}

      <Button
        variant={isPlayer ? "green" : "red"}
        size="lg"
        disabled={!allChecked || submitting}
        onClick={() => void accept()}
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="h-5 w-5" /> Saving…
          </span>
        ) : isPlayer ? (
          "Agree & play 🏁"
        ) : (
          "Agree & RSVP 🏁"
        )}
      </Button>
    </div>
  );
}
