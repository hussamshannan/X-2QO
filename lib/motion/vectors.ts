import gsap from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { getLenis } from "../lenis";
import { isMobileLayout, one, q } from "./dom";
import { syncCursorLabel } from "./cursor";
import { getActiveVector, setActiveVector } from "./state";

let jumps: HTMLElement[] = [];

export function markVector(i: number): void {
  jumps.forEach((btn, k) => {
    const on = k === i;
    const num = btn.querySelector("[data-vinum]");
    const tick = btn.querySelector("[data-vitick]");
    if (num) {
      gsap.to(num, {
        color: on ? "#FF6F13" : "rgba(237,233,227,0.5)",
        duration: 0.4,
        overwrite: true,
      });
    }
    if (tick) {
      gsap.to(tick, {
        width: on ? 34 : 16,
        backgroundColor: on ? "#FF6F13" : "rgba(237,233,227,0.22)",
        duration: 0.5,
        ease: "power3.out",
        overwrite: true,
      });
    }
    btn.setAttribute("aria-current", on ? "true" : "false");
  });
  syncCursorLabel();
}

/**
 * Pinned cross-fade through the four research vectors.
 *
 * The timeline maths is load-bearing: labels sit at `i + 0.32`, the active index is derived
 * from `Math.round(tl.time() - 0.32)`, and the index buttons scroll to
 * `st.start + (st.end - st.start) * progress + 1`. gsap and lenis are pinned to the versions
 * this was authored against for exactly this reason.
 */
export function initVectors(reduced: boolean): () => void {
  const sec = one("#s-research");
  if (!sec) return () => {};

  const layers = q("#s-research [data-vec]");
  jumps = q("#s-research [data-vjump]");
  if (!layers.length) return () => {};

  setActiveVector(-1);

  // The mobile layout already flattens this section to height:auto and stacks the vectors as
  // sheets. Pinning it anyway would pin a section whose height no longer matches what the pin
  // was measured against, and every ScrollTrigger further down the page — the spec ledger
  // most visibly — would resolve against stale positions and never fire.
  const mobile = isMobileLayout();

  if (reduced || mobile) {
    // No pin, no cross-fade: ordinary stacked content, all four vectors readable at once.
    //
    // The data-flow-vectors stylesheet is the *desktop* fallback for this, and is only needed
    // when nothing else has flattened the section. Under the mobile layout something has, and
    // setting it would let `html[data-flow-vectors] #s-research` (0,2,1) outrank the design's
    // own `#s-research` rule (0,1,0) and restore desktop padding on a phone.
    if (!mobile) document.documentElement.setAttribute("data-flow-vectors", "");
    setActiveVector(0);
    markVector(0);
    const cleanups = jumps.map((btn, i) => {
      const handler = () => {
        layers[i]?.scrollIntoView({ block: "center" });
        setActiveVector(i);
        markVector(i);
      };
      btn.addEventListener("click", handler);
      return () => btn.removeEventListener("click", handler);
    });
    return () => {
      if (!mobile) document.documentElement.removeAttribute("data-flow-vectors");
      cleanups.forEach((fn) => fn());
    };
  }

  gsap.set(layers, { autoAlpha: 0, yPercent: 8 });
  gsap.set(layers[0], { autoAlpha: 1, yPercent: 0 });

  // The source read tl.time() from ScrollTrigger's onUpdate, which only fires on scroll
  // events. With scrub:0.55 the timeline keeps easing after the last scroll event, so the
  // final read is stale and the index can end up marking the wrong vector — which also
  // leaves aria-current pointing at a vector that is no longer on screen. Reading from the
  // timeline's own onUpdate fires on every scrub tick, so the index always settles correct.
  // Safe to close over `tl` before it is assigned: the timeline is empty at construction
  // time, so onUpdate cannot fire until the tweens below are added — after assignment.
  const syncIndex = () => {
    const i = Math.min(layers.length - 1, Math.max(0, Math.round(tl.time() - 0.32)));
    if (i !== getActiveVector()) {
      setActiveVector(i);
      markVector(i);
    }
  };

  const tl: gsap.core.Timeline = gsap.timeline({
    onUpdate: () => syncIndex(),
    scrollTrigger: {
      trigger: sec,
      start: "top top",
      end: `+=${layers.length * 95}%`,
      pin: true,
      scrub: 0.55,
      invalidateOnRefresh: true,
      snap: {
        snapTo: "labels",
        directional: false,
        inertia: false,
        duration: { min: 0.15, max: 0.5 },
        delay: 0.06,
        ease: "power2.inOut",
      },
    },
  });

  tl.addLabel("v0", 0);
  for (let i = 1; i < layers.length; i++) {
    tl.to(
      layers[i - 1],
      { autoAlpha: 0, yPercent: -8, duration: 0.6, ease: "power2.inOut" },
      i - 0.6,
    ).fromTo(
      layers[i],
      { autoAlpha: 0, yPercent: 8 },
      { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power2.inOut" },
      i - 0.3,
    );
    tl.addLabel(`v${i}`, i + 0.32);
  }
  tl.to({}, { duration: 0.3 });

  const st = tl.scrollTrigger as ScrollTriggerType | undefined;

  const cleanups = jumps.map((btn, i) => {
    const handler = () => {
      if (!st) return;
      const p = Math.min(1, (i ? i + 0.32 : 0) / tl.duration());
      getLenis()?.scrollTo(st.start + (st.end - st.start) * p + 1, { duration: 1.1 });
    };
    btn.addEventListener("click", handler);
    return () => btn.removeEventListener("click", handler);
  });

  setActiveVector(0);
  markVector(0);

  return () => {
    cleanups.forEach((fn) => fn());
    tl.kill();
  };
}
