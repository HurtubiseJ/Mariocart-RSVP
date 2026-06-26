import { usePathname } from "next/navigation";
import { useUi } from "@/state/ui";

/**
 * Whether the top nav should be visible.
 *  - On the home page: only after the intro animation completes AND the user
 *    has scrolled past the hero.
 *  - On every other route: always.
 */
export function useNavVisibility(): boolean {
  const pathname = usePathname();
  const introComplete = useUi((s) => s.introComplete);
  const pastHero = useUi((s) => s.pastHero);

  if (pathname !== "/") return true;
  return introComplete && pastHero;
}
