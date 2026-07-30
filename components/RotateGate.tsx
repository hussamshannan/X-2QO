"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./RotateGate.module.css";

const STORAGE_KEY = "x2qo:rotate-dismissed";
const QUERY = "(max-width: 900px)";

/**
 * The source blocked every viewport under 900px with an undismissable "ROTATE" panel.
 * Two problems: 900px catches most phones in landscape too (852px is a common landscape
 * width), so the instruction cannot actually be followed; and locking content to one
 * orientation fails WCAG 1.3.4.
 *
 * The panel is visually unchanged but can now be dismissed, and the choice sticks for the
 * session. It is only mounted while it is actually shown, so there is no hidden dialog
 * sitting in the accessibility tree.
 */
export default function RotateGate() {
  // The viewport width is an external store, so it is subscribed to rather than mirrored
  // into state from an effect. getServerSnapshot returns false: on the server there is no
  // viewport, and the gate renders nothing, which is also what the client renders during
  // hydration.
  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia(QUERY);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const narrow = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );

  // Lazy initialiser rather than an effect — sessionStorage is only readable on the client.
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && window.sessionStorage.getItem(STORAGE_KEY) === "1",
  );
  const panelRef = useRef<HTMLDivElement>(null);

  const visible = narrow && !dismissed;

  useEffect(() => {
    if (visible) panelRef.current?.focus();
  }, [visible]);

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
        ROTATE
      </div>
      <div className={styles.copy}>
        X-2QO is built for the full width of a screen.
        <br />
        Turn your device sideways, or open on desktop.
      </div>
      <button type="button" className={styles.dismiss} onClick={dismiss}>
        Continue anyway
      </button>
    </div>
  );
}
