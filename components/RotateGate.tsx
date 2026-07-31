"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { allowBoot } from "@/lib/motion/bootGate";
import { HANDHELD_QUERIES, isHandheld } from "@/lib/motion/dom";
import styles from "./RotateGate.module.css";

const STORAGE_KEY = "x2qo:rotate-dismissed";

/**
 * Advisory panel shown to handheld devices before the boot screen.
 *
 * Phones and tablets do not get the live 3D hero — the scene is 36.2 MB and overruns the
 * per-tab memory ceiling in iOS Safari, so they are served a captured frame of it instead
 * (see lib/motion/hero.ts). This says so up front rather than letting the difference go
 * unexplained, and points at the device the site was actually built for.
 *
 * It sits above the boot screen and holds it back until dismissed, so the order the user
 * sees is panel first, then boot sequence — see lib/motion/bootGate.ts.
 *
 * The source blocked every viewport under 900px with an undismissable "ROTATE" panel. Two
 * problems: 900px catches most phones in landscape too, so the instruction could not actually
 * be followed; and locking content to one orientation fails WCAG 1.3.4. This is dismissible,
 * the choice sticks for the session, and it is only mounted while it is actually shown, so
 * there is no hidden dialog sitting in the accessibility tree.
 */
export default function RotateGate() {
  // Device class is an external store, so it is subscribed to rather than mirrored into state
  // from an effect. getServerSnapshot returns false: on the server there is no device, and the
  // panel renders nothing, which is also what the client renders during hydration.
  const subscribe = useCallback((onChange: () => void) => {
    const lists = HANDHELD_QUERIES.map((q) => window.matchMedia(q));
    lists.forEach((mq) => mq.addEventListener("change", onChange));
    return () => lists.forEach((mq) => mq.removeEventListener("change", onChange));
  }, []);
  const handheld = useSyncExternalStore(subscribe, isHandheld, () => false);

  // Lazy initialiser rather than an effect — sessionStorage is only readable on the client.
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && window.sessionStorage.getItem(STORAGE_KEY) === "1",
  );
  const panelRef = useRef<HTMLDivElement>(null);

  const visible = handheld && !dismissed;

  useEffect(() => {
    if (visible) {
      panelRef.current?.focus();
      return;
    }

    // `visible` is false for one commit during hydration, because getServerSnapshot has to
    // report false and the store only switches to the real device on the next render. Opening
    // the latch on that transient would let the boot screen start behind a panel that is about
    // to appear — which is the whole thing this is meant to prevent. So the live value is read
    // here rather than trusting the render-time one.
    if (isHandheld() && !dismissed) return;

    // Nothing to show, or the user is done with it — release the boot screen.
    allowBoot();
  }, [visible, dismissed]);

  if (!visible) return null;

  const dismiss = () => {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  return (
    <div
      id="rotate"
      ref={panelRef}
      className={styles.rotate}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rotateTitle"
      tabIndex={-1}
    >
      <div className={styles.device} aria-hidden="true" />
      <div id="rotateTitle" className={styles.title}>
        BEST ON DESKTOP
      </div>
      <div className={styles.copy}>
        X-2QO is built for the full width of a laptop screen.
        <br />
        For the complete experience, including the live 3D hero,
        <br />
        open it on a laptop or desktop.
      </div>
      <button type="button" className={styles.dismiss} onClick={dismiss}>
        Continue anyway
      </button>
    </div>
  );
}
