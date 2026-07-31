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

/** Widest iPhone viewport is 956px in landscape; 1024 leaves headroom without reaching laptops. */
const PHONE_MAX_PX = 1024;

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
 *   - Device class is the fallback: a coarse PRIMARY pointer means touch-first hardware.
 *     Touchscreen laptops are not caught, because their primary pointer is the trackpad
 *     and so reports `pointer: fine`.
 *
 * Within touch-first hardware, either of two things is enough to skip the scene:
 *
 *   - No fine pointer anywhere (`any-pointer: fine`), i.e. no mouse is attached; or
 *   - A viewport at or under PHONE_MAX_PX.
 *
 * The width term is not redundant. `any-pointer: fine` is not a trustworthy "this is a
 * desktop" signal on WebKit — it has reported fine for a paired Bluetooth mouse and, in
 * some versions, for the Apple Pencil. If that happens on a phone, the pointer term alone
 * silently stops gating and the tab dies again. Width catches every iPhone in either
 * orientation (the widest is 956px in landscape) regardless of what the pointer media
 * features say, so the two terms cover each other's failure mode.
 *
 * A tablet with no mouse attached is excluded too. That is deliberate — the same memory
 * ceiling applies there, and a static hero is better than a tab that reloads itself.
 */
export function canRenderHeavyScene(): boolean {
  if (typeof window === "undefined") return false;

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem < 4) return false;

  return !isHandheld();
}

/**
 * The media queries isHandheld() reads. Exported so a component can subscribe to exactly the
 * things that can change its answer, rather than guessing at a width breakpoint.
 */
export const HANDHELD_QUERIES = [
  "(pointer: coarse)",
  "(any-pointer: fine)",
  `(max-width: ${PHONE_MAX_PX}px)`,
] as const;

/**
 * Touch-first hardware at handheld size — phones and tablets.
 *
 * A coarse PRIMARY pointer means the device is touch-first; touchscreen laptops are not
 * caught because their primary pointer is the trackpad. Within that, either no mouse
 * available anywhere or a handheld-sized viewport marks it as one. See canRenderHeavyScene()
 * above for why both terms are needed rather than just the pointer one.
 */
export function isHandheld(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(pointer: coarse)").matches) return false;

  const noMouse = !window.matchMedia("(any-pointer: fine)").matches;
  const phoneSized = window.matchMedia(`(max-width: ${PHONE_MAX_PX}px)`).matches;
  return noMouse || phoneSized;
}
