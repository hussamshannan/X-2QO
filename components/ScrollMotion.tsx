"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { destroyLenis, initLenis } from "@/lib/lenis";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion/dom";
import { initAnchors } from "@/lib/motion/anchors";
import { initCursor } from "@/lib/motion/cursor";
import { buildGhosts } from "@/lib/motion/ghosts";
import { buildHero, disposeSpline, resizeSpline, startSpline } from "@/lib/motion/hero";
import { runLoader } from "@/lib/motion/loader";
import { buildRows } from "@/lib/motion/rows";
import { initSpecs } from "@/lib/motion/specs";
import { buildText, splitAll } from "@/lib/motion/text";
import { initVectors } from "@/lib/motion/vectors";

/**
 * Single mount point for all motion. Renders nothing.
 *
 * The source polled window.gsap/ScrollTrigger/Lenis on an interval because the libraries
 * came from CDNs, with a 9s failsafe that unlocked the loader if they never arrived. Both
 * libraries are bundled now, so boot runs directly.
 */
export default function ScrollMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduced = prefersReducedMotion();
    const root = document.documentElement;
    if (reduced) root.setAttribute("data-reduced-motion", "");

    // First thing in the effect: the scene is the long pole, so its download runs in
    // parallel with the boot animation rather than starting after it. runLoader() gates its
    // reveal on this promise, which is what keeps the two in step.
    const sceneReady = startSpline(reduced);

    const lenis = initLenis(!reduced);
    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    const cleanups: Array<() => void> = [];

    if (hasFinePointer() && !reduced) cleanups.push(initCursor());
    cleanups.push(initAnchors(reduced));

    cleanups.push(buildHero(reduced));
    if (!reduced) {
      splitAll();
      buildText();
      buildGhosts();
      buildRows();
    }
    cleanups.push(initVectors(reduced));
    cleanups.push(initSpecs(reduced));

    ScrollTrigger.refresh();
    cleanups.push(runLoader(reduced, sceneReady));

    if (document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    // Without resizeSpline() the scene keeps rendering at its old backing-store size and
    // stretches; CSS sizing alone only scales the box.
    const onResize = () => {
      resizeSpline();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      gsap.ticker.remove(ticker);
      cleanups.forEach((fn) => fn());
      ScrollTrigger.getAll().forEach((t) => t.kill());
      disposeSpline();
      destroyLenis();
      root.removeAttribute("data-reduced-motion");
    };
  }, []);

  return null;
}
