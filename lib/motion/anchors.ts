import { getLenis, startScroll } from "../lenis";
import { one, q } from "./dom";

/**
 * Smooth in-page navigation.
 *
 * The source called preventDefault() then lenis.scrollTo(), which scrolls the page but
 * leaves focus where it was — a keyboard user activating a menu link ends up with focus
 * still inside the overlay. Focus is moved to the target section here.
 *
 * Under reduced motion the handler does nothing at all: native anchor navigation runs,
 * which jumps instantly and moves focus for free.
 */
export function initAnchors(reduced: boolean, onNavigate?: () => void): () => void {
  if (reduced) return () => {};

  const links = q<HTMLAnchorElement>('a[href^="#"]');
  const handlers: Array<[HTMLAnchorElement, (e: MouseEvent) => void]> = [];

  links.forEach((a) => {
    const handler = (e: MouseEvent) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = one(href);
      if (!el) return;
      e.preventDefault();
      onNavigate?.();
      // Lenis drops scrollTo outright while stopped:
      //   if ((this.isStopped || this.isLocked) && !force) return
      // The menu overlay stops it on open, so a link clicked inside the menu closed the
      // overlay and never moved the page. Releasing the scroll lock first means the guard
      // can never apply; force:true covers the locked case too.
      startScroll();
      getLenis()?.scrollTo(el, { offset: -10, duration: 1.4, force: true });
      // Deferred by a macrotask on purpose. When the link lives in the menu overlay, React
      // has not yet run the effect that removes `inert` from <main>, and focusing an
      // element inside an inert subtree is silently refused — the keyboard user would be
      // scrolled to the section with focus left behind. By the time a timeout runs, React
      // has flushed its state update and its effects, so the target is focusable.
      window.setTimeout(() => el.focus({ preventScroll: true }), 0);
    };
    a.addEventListener("click", handler);
    handlers.push([a, handler]);
  });

  return () => {
    handlers.forEach(([a, handler]) => a.removeEventListener("click", handler));
  };
}
