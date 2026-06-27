import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { UnrsvpForm } from "@/components/unrsvp/UnrsvpForm";

export const metadata: Metadata = { title: "Un-RSVP — Beerio Kart World Cup" };

export default function UnrsvpPage() {
  return (
    <PageShell
      title="UN-RSVP"
      subtitle="Plans changed? Release your spot below."
    >
      <div className="mx-auto w-full max-w-md">
        <UnrsvpForm />
      </div>
    </PageShell>
  );
}
