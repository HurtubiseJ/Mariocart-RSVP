/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/cn";

/**
 * The Mario-in-a-kart sprite (the provided asset) used as the transition kart
 * and as a floating mascot. Plain <img> on purpose — it's a small decorative
 * sprite that gets transformed by Framer Motion, so next/image adds no value.
 */
export function KartSprite({
  className,
  alt = "",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/assets/mario.webp"
      alt={alt}
      draggable={false}
      className={cn("h-auto w-full select-none object-contain", className)}
    />
  );
}
