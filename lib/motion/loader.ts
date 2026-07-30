import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { startScroll, stopScroll } from "../lenis";
import { one, q } from "./dom";
import { releaseSpline, SCENE_TIMEOUT_MS } from "./hero";

const LOGS = [
  "initialising actuator bus",
  "zeroing joint encoders",
  "loading latent policy",
  "fusing sensor channels",
  "closing the loop on-body",
];

let loadTl: gsap.core.Timeline | null = null;

/**
 * Hides the loader and releases the page. Every path that ends the boot sequence must run
 * this, otherwise #loader (position:fixed, z-index:10001) stays over the page forever with
 * scrolling stopped.
 */
export function unlockLoad(): void {
  const el = one("#loader");
  if (el) el.style.display = "none";
  startScroll();
  ScrollTrigger.refresh();
  // Fallback only: the exit timeline already released the scene as it began lifting. This
  // covers the paths that have no exit timeline at all — no #loader in the tree, and
  // reduced motion. releaseSpline() is once-only, so it does nothing on the normal path.
  releaseSpline();
}

/**
 * Boot sequence, gated on the Spline scene.
 *
 * Three phases:
 *   1. the boot animation runs, counter easing to 99 (not 100)
 *   2. hold until the scene reports ready, capped at SCENE_TIMEOUT_MS
 *   3. snap to 100, slide away, unlock
 *
 * Reveal lands at max(bootAnimation, min(sceneReady, cap)) — the boot sequence is never cut
 * short, and the hero is never revealed empty. Holding the counter at 100 while still
 * waiting would read as broken, hence 99.
 */
export function runLoader(reduced: boolean, sceneReady: Promise<void>): () => void {
  const el = one("#loader");
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    loadTl?.kill();
    loadTl = null;
  };

  if (!el) {
    unlockLoad();
    return cancel;
  }

  const nums = q("[data-load-num]");
  const bar = one("[data-load-bar]");
  const logEl = one("[data-load-log]");

  const setCount = (n: number) => {
    const s = String(n).padStart(3, "0");
    nums.forEach((num) => {
      num.textContent = s;
    });
    if (bar) bar.style.width = `${n}%`;
  };

  /** Waits for the scene, but never longer than the cap. */
  const holdForScene = () =>
    new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(finish, SCENE_TIMEOUT_MS);
      sceneReady.then(finish, finish);
    });

  if (reduced) {
    // No tweens. Text still updates — changing text is not motion, and a frozen panel with
    // no feedback for up to 12s is worse than none.
    stopScroll();
    setCount(99);
    if (logEl) logEl.textContent = LOGS[LOGS.length - 1];
    holdForScene().then(() => {
      if (cancelled) return;
      setCount(100);
      unlockLoad();
    });
    return cancel;
  }

  loadTl?.kill();

  gsap.set(el, { display: "block", yPercent: 0, opacity: 1 });
  window.scrollTo(0, 0);
  stopScroll();

  let logIndex = -1;
  const showLog = (i: number) => {
    if (!logEl || i === logIndex) return;
    logIndex = i;
    logEl.textContent = LOGS[i];
    gsap.fromTo(
      logEl,
      { opacity: 0, y: 5 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
    );
  };

  // Phase 1 — boot animation, counter to 99.
  const boot = gsap.timeline();
  loadTl = boot;

  boot.from(
    "[data-load-item]",
    { y: 22, opacity: 0, duration: 0.8, stagger: 0.09, ease: "power3.out" },
    0,
  );

  const p = { v: 0 };
  boot.to(
    p,
    {
      v: 99,
      duration: 2.1,
      ease: "power2.inOut",
      onUpdate: () => {
        setCount(Math.round(p.v));
        showLog(Math.min(LOGS.length - 1, Math.floor(p.v / (100 / LOGS.length))));
      },
    },
    0.35,
  );

  // Phase 2 — hold, then phase 3 — reveal.
  let cycling = 0;
  boot.eventCallback("onComplete", () => {
    if (cancelled) return;

    // Keep the screen alive while waiting on the scene.
    cycling = window.setInterval(() => {
      showLog((logIndex + 1) % LOGS.length);
    }, 900);

    holdForScene().then(() => {
      window.clearInterval(cycling);
      if (cancelled) return;
      setCount(100);

      // Replay the scene's opening animation the moment the panel starts lifting, so the
      // reveal and the animation run together as one motion. releaseSpline() is once-only,
      // so the unlockLoad() call at the end of this timeline is a no-op.
      releaseSpline();

      const out = gsap.timeline({ onComplete: () => unlockLoad() });
      loadTl = out;
      out
        .to("[data-load-item]", {
          opacity: 0,
          duration: 0.35,
          stagger: 0.05,
          ease: "power2.in",
        })
        .to(el, { yPercent: -100, duration: 1.05, ease: "power4.inOut" }, "-=0.1")
        .set(el, { display: "none" });
    });
  });

  return () => {
    window.clearInterval(cycling);
    cancel();
  };
}
