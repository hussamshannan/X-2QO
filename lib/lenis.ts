import Lenis from "lenis";

/**
 * Module singleton replacing the source's `window.__lenis`.
 * Every consumer (menu overlay, anchor navigation, vector index jumps) goes through here.
 */
let instance: Lenis | null = null;

export function initLenis(smooth: boolean): Lenis {
  destroyLenis();
  instance = new Lenis({
    duration: smooth ? 1.25 : 0.01,
    smoothWheel: true,
    wheelMultiplier: 1,
  });
  return instance;
}

export function getLenis(): Lenis | null {
  return instance;
}

export function destroyLenis(): void {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}

/** Stop/start guards so callers do not have to null-check. */
export function stopScroll(): void {
  instance?.stop();
}

export function startScroll(): void {
  instance?.start();
}
