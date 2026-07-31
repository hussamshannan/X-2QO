/**
 * Crash breaker for the Spline scene on memory-constrained devices.
 *
 * The scene is 36.2 MB and expands to considerably more once the runtime uploads it to the
 * GPU (measured: 151 MB of JS heap on desktop, with texture memory on top of that and not
 * observable from JS). On iOS Safari that can overrun the per-tab ceiling, and the tab is
 * killed and reloaded — "A problem repeatedly occurred". The kill is not a JS exception, so
 * it cannot be caught, only detected after the fact.
 *
 * That detection is what this module does. An attempt is recorded before the scene loads
 * and cleared once it succeeds. If a later page load finds a recorded attempt that was never
 * cleared, the only thing that can have happened is that the page went away mid-load — so
 * the scene is not tried again, and the hero falls back to its static treatment.
 *
 * The net effect is that a phone which cannot hold the scene crashes at most once instead of
 * looping, and a phone which can hold it keeps the real scene.
 *
 * localStorage rather than sessionStorage on purpose. sessionStorage is scoped to the tab
 * session, and whether it survives an OOM kill is a WebKit implementation detail this design
 * would then depend on. localStorage is disk-backed and survives unconditionally, so the
 * breaker works regardless of how the tab died.
 */

const KEY = "x2qo:scene-attempt";

/**
 * How long a tripped breaker keeps the scene off. Long enough that a user who cannot run the
 * scene is not crashed again and again, short enough that the decision is not permanent —
 * they may come back on a different device, or the scene may have been made lighter since.
 */
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

type Attempt = { state: "pending" | "failed"; at: number };

/**
 * Storage is unavailable in some privacy modes and throws rather than returning null. Every
 * access goes through these two so a throw becomes a definite answer instead of an unhandled
 * error — and, for reads, an answer that makes the caller take the safe branch.
 */
function read(): Attempt | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attempt;
    if (parsed?.state !== "pending" && parsed?.state !== "failed") return null;
    if (typeof parsed.at !== "number") return null;
    return parsed;
  } catch {
    // Unreadable storage is treated as "cannot run the breaker" by the caller.
    return null;
  }
}

function write(value: Attempt | null): boolean {
  try {
    if (value === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Whether storage works at all. Without it there is no breaker, so the scene is not risked. */
function storageUsable(): boolean {
  try {
    const probe = `${KEY}:probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * Whether the scene may be attempted on this device now.
 *
 * Also advances the state machine: a `pending` record found at boot means the previous
 * attempt never finished, which trips the breaker for COOLDOWN_MS.
 */
export function sceneAttemptAllowed(): boolean {
  if (!storageUsable()) {
    console.warn("[x2q0] localStorage unavailable; skipping scene rather than risking a crash loop");
    return false;
  }

  const prev = read();
  if (!prev) return true;

  const age = Date.now() - prev.at;
  if (age > COOLDOWN_MS) {
    // Stale either way — an ancient interrupted load or an expired cooldown. Try again.
    write(null);
    return true;
  }

  if (prev.state === "pending") {
    // The last attempt started and never reported success: the page was killed mid-load.
    console.warn("[x2q0] previous scene load did not complete; falling back to the static hero");
    write({ state: "failed", at: Date.now() });
    return false;
  }

  return false;
}

export function markSceneAttemptStarted(): void {
  write({ state: "pending", at: Date.now() });
}

export function markSceneAttemptSucceeded(): void {
  write(null);
}

/**
 * Clears an in-flight attempt without recording a failure. Bound to pagehide so that
 * navigating away mid-load is not mistaken for a crash on the next visit.
 */
export function clearPendingAttempt(): void {
  if (read()?.state === "pending") write(null);
}
