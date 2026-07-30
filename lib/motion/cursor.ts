import gsap from "gsap";
import { one } from "./dom";
import { getActiveVector } from "./state";

const ACCENT_RGB = "255,111,19";
const RING_IDLE = "rgba(237,233,227,0.55)";

let cursorRow: HTMLElement | null = null;

/** Called by vectors.markVector() so the "Jump"/"Viewing" label stays truthful. */
export function syncCursorLabel(): void {
  const label = one("#cursorLabel");
  if (!label || !cursorRow) return;
  const custom = cursorRow.getAttribute("data-cursor-label");
  label.textContent = custom
    ? custom
    : Number(cursorRow.getAttribute("data-vjump")) === getActiveVector()
      ? "Viewing"
      : "Jump";
}

export function initCursor(): () => void {
  const dot = one("#cursorDot");
  const ring = one("#cursorRing");
  const label = one("#cursorLabel");
  if (!dot || !ring || !label) return () => {};

  const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
  const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
  const rx = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" });
  const ry = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });
  const lx = gsap.quickTo(label, "x", { duration: 0.5, ease: "power3" });
  const ly = gsap.quickTo(label, "y", { duration: 0.5, ease: "power3" });

  let cursorKind: string | null = null;

  const onMove = (e: MouseEvent) => {
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
    lx(e.clientX);
    ly(e.clientY);

    const target = e.target as Element | null;
    const hit = target?.closest?.("[data-cursor]") as HTMLElement | null;
    const kind = hit ? hit.getAttribute("data-cursor") : null;
    const labelled = kind === "expand";
    const rowChanged = labelled && hit !== cursorRow;
    cursorRow = labelled ? hit : null;
    if (kind === cursorKind && !rowChanged) return;
    cursorKind = kind;

    if (labelled) {
      syncCursorLabel();
      gsap.to(label, { opacity: 1, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(label, { opacity: 0, duration: 0.2, ease: "power2.in" });
    }

    const scale =
      kind === "expand"
        ? 2.9
        : kind === "cta"
          ? 2.5
          : kind === "cell"
            ? 2.2
            : kind
              ? 1.9
              : 1;

    gsap.to(ring, {
      scale,
      duration: 0.45,
      ease: "power3.out",
      borderColor: kind ? `rgba(${ACCENT_RGB},0.9)` : RING_IDLE,
      backgroundColor: kind === "expand" ? `rgba(${ACCENT_RGB},1)` : `rgba(${ACCENT_RGB},0)`,
    });
    gsap.to(dot, { scale: kind ? 0.3 : 1, duration: 0.35, ease: "power3.out" });
  };

  window.addEventListener("mousemove", onMove);
  return () => {
    window.removeEventListener("mousemove", onMove);
    cursorRow = null;
  };
}
