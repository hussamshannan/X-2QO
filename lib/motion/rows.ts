import gsap from "gsap";
import { q } from "./dom";

/** Development-log cards rising into place. */
export function buildRows(): void {
  q("[data-row]").forEach((r) => {
    gsap.fromTo(
      r,
      { y: 34, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: r, start: "top 92%" },
      },
    );
  });
}
