import gsap from "gsap";
import { one, q } from "./dom";

/**
 * Spec matrix: counters run up, bars fill, cells stagger in, hovering a cell dims its siblings.
 *
 * The markup ships the FINAL metric values and FINAL bar widths (so the numbers are real
 * without JS). Here they are reset to zero and animated back up. Under reduced motion
 * nothing is touched — the served markup is already the finished state.
 */
export function initSpecs(reduced: boolean): () => void {
  const cells = q("[data-cell]");
  const cleanups: Array<() => void> = [];

  // The blueprint and the mobile ledger both ship, and one of them is always display:none.
  // The stagger below has to hang off whichever is actually laid out — triggering on a
  // display:none element gives ScrollTrigger a zero-height target that never resolves, which
  // would leave the mobile cells stuck at the opacity:0 they start from. offsetParent is null
  // exactly when an element is display:none, so it is the cheapest way to ask.
  const grid = one("#specGrid");
  const revealTrigger = grid?.offsetParent ? grid : (one("#specMobile") ?? grid);

  if (!reduced) {
    q("[data-metric]").forEach((el) => {
      const to = parseFloat(el.getAttribute("data-to") ?? "0");
      const dec = parseInt(el.getAttribute("data-dec") ?? "0", 10);
      const suffix = el.getAttribute("data-suffix") ?? "";
      const o = { v: 0 };
      el.textContent = (0).toFixed(dec) + suffix;
      gsap.to(o, {
        v: to,
        ease: "none",
        onUpdate: () => {
          el.textContent = o.v.toFixed(dec) + suffix;
        },
        scrollTrigger: {
          trigger: el.closest("[data-cell]") ?? el.closest("[data-lrow]") ?? el,
          start: "top 88%",
          end: "top 46%",
          scrub: 0.5,
        },
      });
    });

    q("[data-bar]").forEach((bar) => {
      gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: `${bar.getAttribute("data-pct")}%`,
          ease: "none",
          scrollTrigger: {
            trigger: bar.closest("[data-cell]") ?? bar.closest("[data-lrow]") ?? bar,
            start: "top 88%",
            end: "top 46%",
            scrub: 0.5,
          },
        },
      );
    });

    gsap.fromTo(
      cells,
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { trigger: revealTrigger ?? "#specGrid", start: "top 86%" },
      },
    );

    q("[data-lrow]").forEach((r) => {
      gsap.fromTo(
        r,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: r, start: "top 92%" },
        },
      );
    });
  }

  // Sibling dimming stays on under reduced motion — it is an opacity change, not travel.
  cells.forEach((cell) => {
    const val = cell.querySelector<HTMLElement>("[data-metric]");
    const enter = () => {
      gsap.to(
        cells.filter((c) => c !== cell),
        { opacity: 0.42, duration: 0.4, ease: "power2.out", overwrite: "auto" },
      );
      if (val) gsap.to(val, { color: "#FF6F13", duration: 0.4, overwrite: "auto" });
    };
    const leave = () => {
      gsap.to(cells, { opacity: 1, duration: 0.45, ease: "power2.out", overwrite: "auto" });
      if (val) gsap.to(val, { color: "#EDE9E3", duration: 0.4, overwrite: "auto" });
    };
    cell.addEventListener("mouseenter", enter);
    cell.addEventListener("mouseleave", leave);
    cleanups.push(() => {
      cell.removeEventListener("mouseenter", enter);
      cell.removeEventListener("mouseleave", leave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
