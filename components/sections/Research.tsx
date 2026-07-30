import styles from "./Research.module.css";

const VECTORS = [
  {
    num: "01",
    vec: "0",
    title: "LOCOMOTION",
    label: "Locomotion",
    text: "Whole-body control resolved at 1 kHz. Dynamic balance across terrain the system has never mapped, recovered from a single unlabelled contact event.",
    stats: [
      { label: "Control rate", value: "1 kHz" },
      { label: "Recovery", value: "1 contact" },
    ],
  },
  {
    num: "02",
    vec: "1",
    title: "PERCEPTION",
    label: "Perception",
    text: "Fourteen sensors — depth, thermal, acoustic — fused into one latent field, rewritten every 12 ms. No modality is privileged.",
    stats: [
      { label: "Sensors", value: "14" },
      { label: "Field refresh", value: "12 ms" },
    ],
  },
  {
    num: "03",
    vec: "2",
    title: "COGNITION",
    label: "Cognition",
    text: "A 4.2B-parameter world model runs on-device. No cloud, no round trip. The decision loop closes in 38 ms — faster than a human startle reflex.",
    stats: [
      { label: "Parameters", value: "4.2 B" },
      { label: "Decision loop", value: "38 ms" },
    ],
  },
  {
    num: "04",
    vec: "3",
    title: "EMBODIMENT",
    label: "Embodiment",
    text: "Actuator arrays with force feedback resolved to 0.1 N. The body is not the output of the reasoning — it is part of it.",
    stats: [
      { label: "Force resolution", value: "0.1 N" },
      { label: "Freedom", value: "41 dof" },
    ],
  },
];

export default function Research() {
  return (
    <section
      id="s-research"
      data-screen-label="Research"
      tabIndex={-1}
      aria-labelledby="research-heading"
      className={styles.research}
    >
      <div data-ghost="1" aria-hidden="true" className={styles.ghost}>
        VECTORS
      </div>

      <div className={styles.eyebrowRow}>
        <span className={styles.eyebrowNum}>02</span>
        <span id="research-heading" className={styles.eyebrowText}>
          Research vectors
        </span>
      </div>

      {/* data-vec-grid / data-vec-stack are layout hooks for the "no pinned timeline"
          fallback in globals.css (reduced motion, and no-JS). Not styling attributes. */}
      <div data-vec-grid className={styles.contentGrid}>
        <div data-vec-stack className={styles.vecStack}>
          {VECTORS.map((v) => (
            <div key={v.vec} data-vec={v.vec} className={styles.vec}>
              <span className={styles.vecNum}>{v.num}</span>
              <div className={styles.vecBody}>
                <h3 className={styles.vecTitle}>{v.title}</h3>
                <p className={styles.vecText}>{v.text}</p>
                <div className={styles.statsRow}>
                  {v.stats.map((s) => (
                    <div key={s.label} className={styles.stat}>
                      <span className={styles.statLabel}>{s.label}</span>
                      <span className={styles.statValue}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.indexCol}>
          <span className={styles.indexLabel}>Index</span>
          {VECTORS.map((v) => (
            <button
              key={v.vec}
              type="button"
              data-vjump={v.vec}
              data-cursor="expand"
              aria-label={`Jump to vector ${v.num} — ${v.label}`}
              className={styles.vjumpBtn}
            >
              <span data-vinum="" className={styles.vinum}>
                {v.num}
              </span>
              <span data-vitick="" aria-hidden="true" className={styles.vitick} />
            </button>
          ))}
        </div>
      </div>

      {/* <div className={styles.scrollHint}>
        <span aria-hidden="true" className={styles.scrollLine} />
        <span className={styles.scrollText}>
          Scroll to advance · click index to jump
        </span>
      </div> */}
    </section>
  );
}
