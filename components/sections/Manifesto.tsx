import styles from "./Manifesto.module.css";

export default function Manifesto() {
  return (
    <section
      id="s-manifesto"
      data-screen-label="Manifesto"
      tabIndex={-1}
      aria-labelledby="manifesto-heading"
      className={styles.manifesto}
    >
      <div data-ghost="1" aria-hidden="true" className={styles.ghost}>
        2q0
      </div>
      <div className={styles.grid}>
        <div className={styles.left}>
          <span className={styles.eyebrow}>01 — Manifesto</span>
          <h2
            id="manifesto-heading"
            data-split="word"
            className={styles.heading}
          >
            UNDERSTAND BEFORE YOU MOVE
          </h2>
        </div>
        <div className={styles.right}>
          <p data-split="word" className={styles.body}>
            We are not building faster machines. X–2Q0 is a research
            platform for embodied intelligence — an investigation into how
            perception, balance and reasoning collapse into one continuous
            loop, running entirely on the body.
          </p>
          <p className={styles.subline}>
            Four vectors · one loop · zero round trips
          </p>
        </div>
      </div>
    </section>
  );
}
