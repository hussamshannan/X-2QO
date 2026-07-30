import gsap from "gsap";
import { q } from "./dom";

/**
 * Wraps every word of a [data-split] element in an overflow-hidden mask so the inner
 * span can be translated in from below. Identical to the source implementation.
 */
export function splitAll(): void {
  q("[data-split]").forEach((el) => {
    if (el.dataset.splitDone) return;
    const mode = el.getAttribute("data-split") ?? "word";
    const words = (el.textContent ?? "").trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const mask = document.createElement("span");
      mask.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top";
      const inner = document.createElement("span");
      inner.className = "sp-w";
      inner.style.cssText = "display:inline-block;will-change:transform";
      inner.textContent = w;
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.dataset.splitDone = "1";
    el.dataset.splitMode = mode;
  });
}

export function buildText(): void {
  q("[data-split-done]").forEach((el) => {
    gsap.fromTo(
      el.querySelectorAll(".sp-w"),
      { yPercent: 118 },
      {
        yPercent: 0,
        duration: 1.05,
        ease: "expo.out",
        stagger: el.dataset.splitMode === "line" ? 0.035 : 0.018,
        scrollTrigger: { trigger: el, start: "top 86%" },
      },
    );
  });
}
