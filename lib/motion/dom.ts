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
 * Whether this device is one where the Spline scene has to be treated as risky.
 *
 * The scene binary is 36.2 MB and expands well beyond that once the runtime uploads it to
 * the GPU. On iOS Safari that can overrun the per-tab memory ceiling, killing and reloading
 * the tab ("A problem repeatedly occurred"). The kill is not catchable from JS.
 *
 * This does NOT decide whether the scene loads — lib/motion/sceneGuard.ts does that. This
 * only says which branch the device is on: constrained devices still get the real scene,
 * but at a reduced render resolution and behind a crash breaker. Everything else is
 * untouched and loads exactly as it always has.
 *
 * Two signals, because no single one covers every engine:
 *   - navigator.deviceMemory is the direct measure, but it is Chromium-only; Safari and
 *     Firefox do not implement it, so its absence proves nothing and is not treated as a
 *     failure on its own.
 *   - Device class is the fallback: a coarse PRIMARY pointer means touch-first hardware.
 *     Touchscreen laptops are not caught, because their primary pointer is the trackpad
 *     and so reports `pointer: fine`.
 *
 * Within touch-first hardware, either of two things marks the device constrained:
 *
 *   - No fine pointer anywhere (`any-pointer: fine`), i.e. no mouse is attached; or
 *   - A viewport at or under PHONE_MAX_PX.
 *
 * The width term is not redundant. `any-pointer: fine` is not a trustworthy "this is a
 * desktop" signal on WebKit — it has reported fine for a paired Bluetooth mouse and, in
 * some versions, for the Apple Pencil. If that happens on a phone, the pointer term alone
 * silently stops classifying it as constrained. Width catches every iPhone in either
 * orientation (the widest is 956px in landscape) regardless of what the pointer media
 * features say, so the two terms cover each other's failure mode.
 */
export function isMemoryConstrainedDevice(): boolean {
  if (typeof window === "undefined") return true;

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem < 4) return true;

  if (!window.matchMedia("(pointer: coarse)").matches) return false;

  const noMouse = !window.matchMedia("(any-pointer: fine)").matches;
  const phoneSized = window.matchMedia(`(max-width: ${PHONE_MAX_PX}px)`).matches;
  return noMouse || phoneSized;
}
