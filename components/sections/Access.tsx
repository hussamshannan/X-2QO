import styles from "./Access.module.css";

export default function Access() {
  return (
    <section
      id="s-access"
      data-screen-label="Access"
      tabIndex={-1}
      aria-labelledby="access-heading"
      className={styles.access}
    >
      <div data-ghost="1" aria-hidden="true" className={styles.ghost}>
        x–2q0
      </div>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>05 — Access</span>
        <h2 id="access-heading" data-split="word" className={styles.heading}>
          RESEARCH ACCESS OPENS TO TWELVE PARTNER LABS.
        </h2>
        <a
          href="mailto:research@x2q0.systems"
          data-cursor="cta"
          className={styles.cta}
        >
          Request research access
          <span className={styles.ctaArrow} aria-hidden="true">
            →
          </span>
        </a>
      </div>
      {/* Explicit role because a <footer> nested inside <section> gets no implicit
          contentinfo role — without it the page has no contentinfo landmark at all.
          It stays inside the section: its margin-top/border-top positioning depends on it. */}
      <footer role="contentinfo" className={styles.footer}>
        <span className={styles.footerText}>
          X–2Q0 · Embodied intelligence research platform
        </span>
        <span className={styles.footerText}>Concept · 2026</span>
      </footer>
    </section>
  );
}
