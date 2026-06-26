/**
 * Attach a discrete pointer-down handler to an element using Pointer Events
 * (unifies mouse + touch, no 300ms tap delay, no double-fire). Returns a detach
 * function. Callers set `touch-action: none` on the element to stop scrolling.
 */
export function attachPointerDown(
  el: HTMLElement,
  onDown: (clientX: number, clientY: number) => void,
): () => void {
  const handler = (e: PointerEvent) => {
    // Ignore secondary mouse buttons; allow touch/pen (button === 0 or -1).
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    onDown(e.clientX, e.clientY);
  };
  el.addEventListener("pointerdown", handler);
  // Block the context menu on long-press so games stay tappable.
  const noMenu = (e: Event) => e.preventDefault();
  el.addEventListener("contextmenu", noMenu);
  return () => {
    el.removeEventListener("pointerdown", handler);
    el.removeEventListener("contextmenu", noMenu);
  };
}
