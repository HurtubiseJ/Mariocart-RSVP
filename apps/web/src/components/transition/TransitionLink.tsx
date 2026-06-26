"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTransition } from "@/state/transition";

export interface TransitionLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "href"> {
  href: string;
}

/**
 * A next/link that plays the kart cover-then-navigate transition. Falls back to
 * normal navigation for modified clicks, reduced-motion users, and same-page
 * links. The actual router.push happens in RouteTransition once covered.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, onClick, ...rest }, ref) {
    const pathname = usePathname();
    const beginCover = useTransition((s) => s.beginCover);
    const phase = useTransition((s) => s.phase);
    const reduced = usePrefersReducedMotion();

    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      // Let the browser handle new-tab / modified clicks.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // Same page → do nothing fancy.
      if (href === pathname) {
        e.preventDefault();
        return;
      }
      // Reduced motion → plain navigation (no overlay).
      if (reduced) return;
      // Mid-transition → ignore extra clicks.
      if (phase !== "idle") {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      beginCover(href);
    };

    return <Link ref={ref} href={href} onClick={handleClick} {...rest} />;
  },
);
