/**
 * One-way latch between the advisory panel and the boot screen.
 *
 * On handheld devices the panel in components/RotateGate.tsx is shown before anything else.
 * The boot sequence must not run behind it — if it did, it would play out and finish while
 * the panel was still up, and dismissing would drop the user straight into the page with the
 * boot screen already gone.
 *
 * So ScrollMotion awaits open() rather than starting the loader directly. RotateGate opens it
 * on dismissal, or immediately when it has nothing to show, which is every device that is not
 * handheld.
 *
 * Deliberately never resets. Once the user is past the panel they are past it for the life of
 * the page, including a React remount in development — re-latching there would leave the boot
 * screen waiting on a panel that has already been dismissed.
 */

let resolveOpen: (() => void) | null = null;
let opened: Promise<void> | null = null;

function latch(): Promise<void> {
  if (!opened) {
    opened = new Promise<void>((resolve) => {
      resolveOpen = resolve;
    });
  }
  return opened;
}

/** Resolves once the boot sequence is allowed to start. */
export function bootAllowed(): Promise<void> {
  return latch();
}

/** Lets the boot sequence start. Safe to call more than once. */
export function allowBoot(): void {
  latch();
  resolveOpen?.();
}
