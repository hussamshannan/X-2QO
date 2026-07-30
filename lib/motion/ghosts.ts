import gsap from "gsap";
import { q } from "./dom";

/** Parallax drift on the oversized decorative background type. */
export function buildGhosts(): void {
  q("[data-ghost]").forEach((g) => {
    if (!g.parentElement) return;
    gsap.fromTo(
      g,
      { yPercent: 16 },
      {
        yPercent: -16,
        ease: "none",
        scrollTrigger: {
          trigger: g.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}
