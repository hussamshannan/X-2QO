import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Application } from "@splinetool/runtime";
import { canRenderHeavyScene, one } from "./dom";

/**
 * Self-hosted copy of the Spline scene. The original is served from S3 uncompressed
 * (36.3 MB, no content-encoding, no cache-control); served from public/ it gzips to
 * ~6.9 MB and gets an immutable cache header (see next.config.ts).
 *
 * The filename carries a version because that cache header is `immutable, max-age=1y`:
 * overwriting the file in place would leave browsers and the CDN serving the old bytes for
 * a year. Re-exporting from Spline means bumping this to -v5 and renaming the file to match,
 * which is what actually busts it.
 */
const SCENE_URL = "/scene/x2q0-v4.splinecode";

/**
 * Spline's own hosted viewer, used on handhelds instead of the self-hosted binary.
 *
 * The runtime path costs 36.3 MB of scene data on top of the page, which overruns the per-tab
 * memory ceiling on iOS Safari — measured, and it took the tab down with it. The embed is a
 * separate document, so the scene is loaded and rendered outside this page's budget.
 *
 * Not a free swap: it carries Spline's watermark, and a cross-origin frame re-rasters on every
 * transform, which is why buildHero() drops the hero scale scrub on this path.
 */
const SCENE_EMBED_URL =
  "https://my.spline.design/nexbotrobotcharacterconcept-lu2y3wCsB8lzLePYOfMBRkUz/";

/** How long the boot screen is willing to wait for the scene before revealing anyway. */
export const SCENE_TIMEOUT_MS = 12_000;

let app: Application | null = null;
let boundCanvas: HTMLCanvasElement | null = null;

/**
 * Falls the hero back to its static treatment: the canvas is hidden and the CSS backdrop
 * behind it shows through. Used both when the scene is never loaded (memory-constrained
 * device) and when the GL context is lost after it was.
 */
function showStaticHero(): void {
  const wrap = one("#splineWrap");
  if (wrap) wrap.dataset.scene = "off";
}

/**
 * Hands the hero to Spline's hosted embed instead of the local runtime.
 *
 * Setting src here rather than in the markup is the point: the iframe ships with no src at
 * all, so desktop never requests the embed, and this is the only thing that starts it.
 *
 * Returns false if the iframe is missing, so the caller can fall back to the static frame
 * rather than leaving the hero empty.
 */
function showEmbeddedScene(): boolean {
  const wrap = one("#splineWrap");
  const frame = one<HTMLIFrameElement>("#splineFrame");
  if (!wrap || !frame) return false;

  wrap.dataset.scene = "frame";
  if (!frame.src) frame.src = SCENE_EMBED_URL;
  return true;
}

/**
 * iOS drops WebGL contexts under memory pressure and on backgrounding. Without a listener
 * the canvas is simply frozen on its last frame and the runtime throws on the next tick.
 * preventDefault() is what makes a later `webglcontextrestored` possible at all, but the
 * scene's GPU resources do not survive the loss, so the hero is switched to its static
 * treatment rather than restored.
 */
function onContextLost(e: Event): void {
  e.preventDefault();
  console.warn("[x2q0] WebGL context lost; hero falling back to its static treatment");
  app?.stop();
  showStaticHero();
}

/**
 * The scene's opening camera move starts the instant start() resolves. If the boot screen
 * is still up at that point, the animation plays out behind it and the user is shown the
 * tail of it. So the scene is frozen the moment it loads and released by the loader, which
 * makes the reveal and frame 0 of the animation the same instant.
 */
let heldForReveal = false;
let heroVisible = true;
/** releaseSpline() replays the opening animation, so it must fire exactly once per load. */
let released = false;

/**
 * Creates the Spline application and begins loading the scene.
 *
 * The returned promise resolving IS the "scene is ready" signal — it is what the loader
 * gates its reveal on. It never rejects: a failed scene resolves too, so a network error
 * can't trap the user on the boot screen forever.
 */
export function startSpline(reduced: boolean): Promise<void> {
  const canvas = one<HTMLCanvasElement>("#splineCanvas");
  const wrap = one("#splineWrap");
  released = false;
  if (!canvas) return Promise.resolve();

  // Memory-constrained devices never touch the self-hosted scene: no fetch, no Application,
  // no GL context in this document. They get Spline's hosted embed instead, which carries the
  // same scene in its own document and so outside this page's memory budget.
  //
  // Resolving immediately is the correct signal to the loader — the boot animation still plays
  // out in full (runLoader never cuts phase 1 short), it just does not wait. There is nothing
  // to wait for: the embed is cross-origin, so its progress is not observable from here.
  if (!canRenderHeavyScene()) {
    if (!showEmbeddedScene()) showStaticHero();
    return Promise.resolve();
  }

  boundCanvas = canvas;
  canvas.addEventListener("webglcontextlost", onContextLost);

  // 'manual' renders only when requestRender() is called — under reduced motion the scene
  // is shown as a single static frame rather than an animating loop.
  app = new Application(canvas, { renderMode: reduced ? "manual" : "auto" });

  // A canvas with no width/height attributes has a 300x150 backing store; CSS sizing only
  // scales the box, not the buffer. Size it to the wrapper before anything renders.
  if (wrap) app.setSize(wrap.clientWidth, wrap.clientHeight);

  // interactive MUST stay true. In the runtime's start():
  //   async start(t, { interactive: e = !0, ... }) { … if (e) { new M1(renderer, …) } … }
  // that `M1` is the event manager, and every Spline scene animation — including this
  // scene's opening camera move — is driven by it. Passing interactive:false skips
  // constructing it entirely and the scene renders as a single static frame.
  //
  // #heroShield (z-index 2, above the canvas) is what keeps the scene from capturing
  // pointer input, so interactivity here costs us nothing.
  //
  // fetch + start() rather than load() because the asset is same-origin and this keeps the
  // buffer under our control; load() would do the same fetch internally.
  return (async () => {
    try {
      const res = await fetch(SCENE_URL);
      if (!res.ok) throw new Error(`scene ${res.status}`);
      const buf = await res.arrayBuffer();
      await app?.start(buf, { interactive: true });

      // The scene's Follow / LookAt events track the pointer, and by default the runtime
      // listens for that on the canvas itself — where nothing ever arrives, because
      // #heroShield sits above it and swallows pointer events so the scene cannot capture
      // scroll. Verified: elementFromPoint at the centre of the hero returns #heroShield,
      // and disabling its pointer-events made the figure track the cursor immediately.
      //
      // Global events move those listeners to the window, so the pointer is tracked through
      // the shield and the shield keeps doing the one job it exists for. Removing the shield
      // instead would trade this bug for the scroll-capture one it was added to fix.
      app?.setGlobalEvents(true);
      if (reduced) {
        // 'manual' render mode: one frame, no loop. Nothing to hold.
        app?.requestRender();
      } else {
        // Freeze at frame 0. stop() is called synchronously after start() resolves, before
        // rAF can tick, so the animation is held at its very beginning rather than paused
        // somewhere into it.
        heldForReveal = true;
        app?.stop();
      }
    } catch (err) {
      // Swallowed on purpose — the page must still reveal and be usable without the scene.
      console.error("[x2q0] Spline scene failed to load:", err);
      showStaticHero();
    }
  })();
}

/**
 * Starts the held scene. Called by the loader as it begins lifting, so the animation's
 * first frame and the reveal are one motion. Idempotent, and a no-op if the hero is not on
 * screen (someone scrolled down during loading) — the observer will start it on return.
 */
export function releaseSpline(): void {
  if (released) return;
  released = true;
  heldForReveal = false;
  if (!heroVisible || !app) return;
  app.play();

  // stop()/play() gate rendering, not the scene's animation clock — resuming shows the
  // animation wherever wall-clock time has carried it, which by reveal time is the end.
  // Re-firing the scene's own Start event replays it "from first state to last state"
  // (the runtime's words), so the opening move actually begins at the reveal.
  //
  // Measured: fetch 78ms (cached) vs start() 518ms, so deferring start() to the reveal
  // instead would mean half a second of empty hero. Replaying the event is the cheap path.
  // getSplineEvents() is keyed EVENT NAME -> { OBJECT UUID: ... }, not the other way round.
  // Verified against this scene, which returns:
  //   { lookAt: { <Head Pivot> }, start: { <look at>, <Camera 2> }, follow: { <look at> } }
  //
  // This previously read the outer key as an object uuid and looked for "start" inside the
  // inner map, which matched nothing — so the replay silently never fired and play() resumed
  // the scene wherever its clock had drifted to, which showed up as the opening move snapping
  // rather than playing. The warning below never fired either, because the empty result came
  // from the wrong lookup rather than from a scene with no start event.
  const targets = Object.keys(app.getSplineEvents().start ?? {});

  if (!targets.length) {
    console.warn("[x2q0] no Spline 'start' event found; opening animation will not replay");
    return;
  }
  targets.forEach((uuid) => app?.emitEvent("start", uuid));
}

export function resizeSpline(): void {
  const wrap = one("#splineWrap");
  if (app && wrap) app.setSize(wrap.clientWidth, wrap.clientHeight);
}

export function disposeSpline(): void {
  boundCanvas?.removeEventListener("webglcontextlost", onContextLost);
  boundCanvas = null;
  app?.dispose();
  app = null;
  released = false;
  heldForReveal = false;
}

/**
 * No pin on the hero: it simply scrolls away. The scene scales UP (a push-in, not a shrink)
 * while a solid veil fades over it.
 *
 * Transform + opacity only, so this stays on the compositor. Scaling a <canvas> transforms
 * an already-rasterised texture — unlike the cross-origin iframe this replaced, where any
 * transform forced a full re-raster of live content every frame.
 */
export function buildHero(reduced: boolean): () => void {
  const wrap = one("#splineWrap");
  const hero = one("#hero");

  // Render only while the hero is actually on screen.
  //
  // Deliberately an IntersectionObserver rather than ScrollTrigger onEnter/onLeave: a
  // trigger with start:'top top' is not active at scrollY === 0 (its start boundary), so
  // returning to the very top left the scene stopped and the hero frozen on its last
  // frame. "Is the hero intersecting the viewport" is the actual condition we want and has
  // no boundary ambiguity.
  const io = hero
    ? new IntersectionObserver(
        ([entry]) => {
          heroVisible = entry.isIntersecting;
          // Never start the scene while it is being held for the reveal — that is the
          // loader's call, not the observer's.
          if (heroVisible) {
            if (!heldForReveal) app?.play();
          } else {
            app?.stop();
          }
        },
        { threshold: 0 },
      )
    : null;
  if (hero && io) io.observe(hero);

  const cleanup = () => {
    io?.disconnect();
    if (wrap) wrap.style.willChange = "auto";
  };

  if (reduced) {
    gsap.set("#heroVeil", { opacity: 0 });
    return cleanup;
  }

  // The push-in is dropped when the hero is an embed. Scaling a <canvas> transforms a texture
  // that has already been rasterised, which is cheap; scaling a cross-origin iframe re-rasters
  // live content every frame, which is the exact cost this file moved away from. The veil and
  // cue still animate — opacity stays on the compositor either way.
  const embedded = wrap?.dataset.scene === "frame";

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
  if (!embedded) tl.fromTo("#splineWrap", { scale: 1 }, { scale: 1.18, ease: "none" }, 0);
  tl.fromTo("#heroVeil", { opacity: 0 }, { opacity: 1, ease: "none" }, 0).to(
    "#cue",
    { opacity: 0, duration: 0.2, ease: "none" },
    0,
  );

  // will-change is set only while the hero is being scrubbed, so the promoted layer isn't
  // held in GPU memory for the rest of the session. Skipped for the embed, which is not
  // being transformed and would only be promoted for nothing.
  if (!embedded) {
    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      onToggle: ({ isActive }) => {
        if (wrap) wrap.style.willChange = isActive ? "transform" : "auto";
      },
    });
  }

  return cleanup;
}
