import styles from "./Hero.module.css";

/*
 * #splineWrap must always be present in the DOM — a ScrollTrigger captures it at boot.
 *
 * The <canvas> is server-rendered because the Spline runtime is constructed against it on
 * mount. Handhelds never get that far: lib/motion/hero.ts leaves the canvas alone and shows a
 * captured frame of the scene instead, so the 36 MB binary is never fetched there.
 *
 * #heroScrim and #heroMobile are the mobile treatment and are display:none until the
 * max-width:768px block in globals.css reveals them, so desktop is unaffected by their
 * presence rather than by a runtime check.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      data-screen-label="Hero"
      tabIndex={-1}
      aria-labelledby="hero-heading"
      className={styles.hero}
    >
      <h1 id="hero-heading" className="srOnly">
        X–2QO — Embodied intelligence research platform
      </h1>
      <div id="splineWrap" className={styles.splineWrap}>
        {/* Decorative: #heroShield makes it non-interactive and the visually hidden <h1>
            above already names the hero. */}
        <canvas id="splineCanvas" className={styles.splineCanvas} aria-hidden="true" />
      </div>
      <div id="heroShield" className={styles.heroShield} />
      <div id="heroVeil" className={styles.heroVeil} />

      {/* Lifts the scene off the type below it. Bottom-weighted so the figure stays legible
          in the upper field while the copy sits on solid ground. */}
      <div id="heroScrim" className={styles.heroScrim} aria-hidden="true" />

      {/* The mobile hero. Not aria-hidden — the copy here is real content — but the heading is
          an h2 rather than an h1, because #hero-heading above is already the page's h1 and two
          would be worse than one in the wrong place. */}
      <div id="heroMobile" className={styles.heroMobile}>
        <div id="heroRailAnchor" className={styles.heroRailAnchor}>
          <span id="heroRail" className={styles.heroRail}>
            Research platform
          </span>
        </div>

        <div className={styles.heroMobileBody}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowRule} aria-hidden="true" />
            <span className={styles.heroEyebrowText}>Embodied intelligence</span>
          </div>

          <h2 className={styles.heroMobileHeading}>
            INTELLIGENCE
            <br />
            THAT RUNS ON
            <br />
            THE <span className={styles.heroMobileAccent}>BODY</span>
          </h2>

          <p className={styles.heroMobileCopy}>
            A research platform where perception, balance and reasoning close in one loop —
            38&nbsp;ms, entirely on the chassis.
          </p>
        </div>

        <div className={styles.heroMobileFoot}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroMobileCueLine} aria-hidden="true" />
            <span className={styles.heroMobileCueText}>Scroll</span>
          </div>
          <span className={styles.heroMobileYear}>2026</span>
        </div>
      </div>

      <div id="cue" className={styles.cue}>
        <span className={styles.cueLine} aria-hidden="true" />
        <span className={styles.cueText}>Scroll</span>
      </div>
      <div id="heroMeta" className={styles.caption}>
        Embodied intelligence
        <br />
        Research platform · 2026
      </div>
    </section>
  );
}
