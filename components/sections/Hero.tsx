import styles from "./Hero.module.css";

/*
 * #splineWrap must always be present in the DOM — a ScrollTrigger captures it at boot.
 * The <canvas> is server-rendered too: lib/motion/hero.ts constructs the Spline runtime
 * against it on mount, so it has to exist first. The scene binary is fetched in parallel
 * with the boot animation, and the loader holds its reveal until the scene is ready.
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
      <div id="cue" className={styles.cue}>
        <span className={styles.cueLine} aria-hidden="true" />
        <span className={styles.cueText}>Scroll</span>
      </div>
      <div className={styles.caption}>
        Embodied intelligence
        <br />
        Research platform · 2026
      </div>
    </section>
  );
}
