/**
 * The source scoped every query to the <x-dc> custom element. There is no such element
 * here, so the scope is the document. Same helper names as the original for traceability.
 */
export function q<T extends Element = HTMLElement>(sel: string): T[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll<T>(sel));
}

export function one<T extends Element = HTMLElement>(sel: string): T | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<T>(sel);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/**
 * Whether this device should be given the Spline scene at all.
 *
 * The scene binary is 36.2 MB uncompressed. Decoding it into an ArrayBuffer and then into
 * WebGL textures overruns the per-tab memory ceiling in iOS Safari, which kills and reloads
 * the tab ("A problem repeatedly occurred"). There is no way to catch that from JS — the
 * only fix is not to load the scene on devices that cannot hold it.
 *
 * Two signals, because no single one covers every engine:
 *   - navigator.deviceMemory is the direct measure, but it is Chromium-only; Safari and
 *     Firefox do not implement it, so its absence proves nothing and is not treated as a
 *     failure on its own.
 *   - Device class is the fallback: a coarse primary pointer with no fine pointer available
 *     anywhere is a phone or a tablet. Touchscreen laptops report `any-pointer: fine`
 *     because of the trackpad, so they are not caught by this.
 *
 * A tablet with no mouse attached is excluded too. That is deliberate — the same memory
 * ceiling applies there, and a static hero is better than a tab that reloads itself.
 */
export function canRenderHeavyScene(): boolean {
  if (typeof window === "undefined") return false;

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem < 4) return false;

  const handheld =
    window.matchMedia("(pointer: coarse)").matches &&
    !window.matchMedia("(any-pointer: fine)").matches;
  return !handheld;
}
