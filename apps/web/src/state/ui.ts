import { create } from "zustand";

/**
 * Tiny UI store for cross-component signals that drive the top-nav reveal:
 *  - introComplete: the home hero's opening animation has finished.
 *  - pastHero: the user has scrolled past the hero section.
 *
 * The nav on the home page appears only when BOTH are true; on every other
 * route the nav is always shown (see useNavVisibility).
 */
interface UiState {
  introComplete: boolean;
  pastHero: boolean;
  setIntroComplete: (v: boolean) => void;
  setPastHero: (v: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  introComplete: false,
  pastHero: false,
  setIntroComplete: (v) => set({ introComplete: v }),
  setPastHero: (v) => set({ pastHero: v }),
}));
