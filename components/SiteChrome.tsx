"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { startScroll, stopScroll } from "@/lib/lenis";
import styles from "./SiteChrome.module.css";

const LINKS = [
  { num: "01", label: "MANIFESTO", href: "#s-manifesto" },
  { num: "02", label: "RESEARCH", href: "#s-research" },
  { num: "03", label: "SPEC", href: "#s-specs" },
  { num: "04", label: "LOG", href: "#s-log" },
  { num: "05", label: "ACCESS", href: "#s-access", accent: true },
] as const;

export default function SiteChrome() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Overlay show/hide. Mirrors the source's setMenu(): the overlay is display:none when
  // closed so it is out of the accessibility tree and cannot be tabbed into.
  useEffect(() => {
    const ov = overlayRef.current;
    if (!ov) return;

    if (open) {
      ov.style.display = "flex";
      gsap.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
      gsap.fromTo(
        ov.querySelectorAll(`.${styles.link}`),
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.06,
          ease: "power4.out",
          delay: 0.05,
        },
      );
      stopScroll();
      ov.querySelector<HTMLAnchorElement>("a")?.focus();
      document.getElementById("main")?.setAttribute("inert", "");
    } else {
      gsap.to(ov, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          ov.style.display = "none";
        },
      });
      startScroll();
      document.getElementById("main")?.removeAttribute("inert");
    }
  }, [open]);

  // Escape closes and returns focus; Tab is trapped inside the overlay while it is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      const ov = overlayRef.current;
      if (!ov) return;
      const focusables = Array.from(
        ov.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      if (!focusables.length) return;

      // The menu button stays in the loop so the overlay can always be closed by keyboard.
      const loop = buttonRef.current ? [...focusables, buttonRef.current] : focusables;
      const first = loop[0];
      const last = loop[loop.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      <header>
        <nav className={styles.nav} aria-label="Primary">
          <a href="#hero" data-cursor="link" className={styles.mark}>
            x-2q0
          </a>
          <button
            id="menuBtn"
            ref={buttonRef}
            type="button"
            data-cursor="link"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="menuOverlay"
            onClick={() => setOpen((v) => !v)}
          >
            <span id="menuBtnLabel">{open ? "Close" : "Menu"}</span>
            <span className={styles.bars} aria-hidden="true">
              <span className={styles.bar} />
              <span className={styles.bar} />
            </span>
          </button>
        </nav>
      </header>

      <div id="menuOverlay" ref={overlayRef} className={styles.overlay}>
        <div className={styles.indexLabel}>Index</div>
        <div className={styles.links}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              className={`${styles.link}${"accent" in l && l.accent ? ` ${styles.linkAccent}` : ""}`}
              href={l.href}
              data-cursor="link"
              onClick={close}
            >
              <span className={styles.linkNum}>{l.num}</span>
              {l.label}
            </a>
          ))}
        </div>
        <div className={styles.contact}>research@x2q0.systems</div>
      </div>
    </>
  );
}
