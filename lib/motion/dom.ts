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
