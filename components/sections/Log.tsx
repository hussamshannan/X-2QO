import styles from "./Log.module.css";

const ROWS = [
  {
    year: "2023",
    quarter: "q2",
    text: "First unassisted gait. Four hundred metres, no fall, no operator.",
  },
  {
    year: "2024",
    quarter: "q1",
    text: "Perception stack unified. Fourteen streams, one latent field, 12 ms.",
  },
  {
    year: "2025",
    quarter: "q3",
    text: "Zero-shot transfer to unmapped terrain. Training ends, learning does not.",
  },
  {
    year: "2026",
    quarter: "q3",
    text: "X–2Q0 revealed. Research access opens to twelve partner labs.",
  },
];

export default function Log() {
  return (
    <section
      id="s-log"
      data-screen-label="Log"
      tabIndex={-1}
      aria-labelledby="log-heading"
      className={styles.log}
    >
      <div data-ghost="1" aria-hidden="true" className={styles.ghost}>
        log 04
      </div>
      <div className={styles.eyebrowRow}>
        <span className={styles.eyebrowNum}>04</span>
        <span id="log-heading" className={styles.eyebrowText}>
          Development log
        </span>
        <span className={styles.eyebrowRule} />
      </div>
      <div data-m="loggrid" className={styles.grid}>
        {ROWS.map((r) => (
          <div key={r.year + r.quarter} data-row="" className={styles.row}>
            <span className={styles.date}>
              {r.year}
              <span className={styles.slash}>/</span>
              {r.quarter}
            </span>
            <span className={styles.text}>{r.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
