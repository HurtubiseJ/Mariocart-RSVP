"use client";

import { useEffect } from "react";
import { useTransition } from "@/state/transition";

/**
 * template.tsx remounts on every navigation (unlike layout.tsx). That remount
 * is our signal that the new route has committed, so we trigger the reveal half
 * of the kart transition. reveal() is a no-op unless we're in the "covered"
 * phase, so direct loads and back/forward navigations are unaffected.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reveal = useTransition((s) => s.reveal);

  useEffect(() => {
    reveal();
  }, [reveal]);

  return <>{children}</>;
}
