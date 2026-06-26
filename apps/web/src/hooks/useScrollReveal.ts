import { useEffect, useRef, useState } from "react";

interface Options {
  /** Fraction of the element visible before it counts as revealed. */
  threshold?: number;
  /** Reveal only once, then stop observing. Default true. */
  once?: boolean;
  /** Margin around the root (e.g. "-10% 0px"). */
  rootMargin?: string;
}

/**
 * IntersectionObserver-based reveal. Returns a ref to attach and a boolean that
 * flips true when the element scrolls into view. Avoids raw scroll listeners.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.2,
  once = true,
  rootMargin = "0px 0px -10% 0px",
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return { ref, visible };
}
