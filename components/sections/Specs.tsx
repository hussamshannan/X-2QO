import type { CSSProperties } from "react";
import styles from "./Specs.module.css";

/*
 * [data-metric] ships its FINAL value as text (see port conventions §5) — the motion
 * layer zeroes it on mount and animates up to data-to. [data-bar] ships at its final
 * width from data-pct for the same reason. Both attributes are kept on the elements
 * so the motion layer can still find and drive them.
 */

const LEFT_CELLS = [
  {
    label: "Height",
    to: "1.86",
    dec: "2",
    unit: "m",
    value: "1.86",
    subLabel: "of 2.00 m envelope",
    subTo: "93",
    subDec: "0",
    subValue: "93%",
  },
  {
    label: "Mass",
    to: "74",
    dec: "0",
    unit: "kg",
    value: "74",
    subLabel: "of 90 kg budget",
    subTo: "82",
    subDec: "0",
    subValue: "82%",
  },
  {
    label: "Degrees of freedom",
    to: "41",
    dec: "0",
    unit: "",
    value: "41",
    subLabel: "of 48 planned",
    subTo: "85",
    subDec: "0",
    subValue: "85%",
  },
  {
    label: "Sensor channels",
    to: "14",
    dec: "0",
    unit: "",
    value: "14",
    subLabel: "of 16 bus lanes",
    subTo: "88",
    subDec: "0",
    subValue: "88%",
  },
];

const RIGHT_CELLS = [
  {
    label: "Peak torque",
    to: "380",
    dec: "0",
    unit: "Nm",
    value: "380",
    subLabel: "of 450 Nm ceiling",
    subTo: "84",
    subDec: "0",
    subValue: "84%",
  },
  {
    label: "Runtime",
    to: "6.5",
    dec: "1",
    unit: "h",
    value: "6.5",
    subLabel: "of 8.0 h target",
    subTo: "81",
    subDec: "0",
    subValue: "81%",
  },
  {
    label: "On-board compute",
    to: "1.2",
    dec: "1",
    unit: "PF",
    value: "1.2",
    subLabel: "of 1.5 PF module",
    subTo: "80",
    subDec: "0",
    subValue: "80%",
  },
  {
    label: "Decision loop",
    to: "38",
    dec: "0",
    unit: "ms",
    value: "38",
    subLabel: "of 120 ms budget",
    subTo: "32",
    subDec: "0",
    subValue: "32%",
  },
];

const LATENCY_ROWS = [
  {
    label: "X–2Q0 on-device",
    pct: "16",
    barClass: styles.lrowBarAccent,
    to: "38",
    dec: "0",
    value: "38",
  },
  {
    label: "Human startle reflex",
    pct: "42",
    barClass: styles.lrowBarMid,
    to: "100",
    dec: "0",
    value: "100",
  },
  {
    label: "Cloud round trip",
    pct: "100",
    barClass: styles.lrowBarLine22,
    to: "240",
    dec: "0",
    value: "240",
  },
];

export default function Specs() {
  return (
    <section
      id="s-specs"
      data-screen-label="Spec"
      tabIndex={-1}
      aria-labelledby="specs-heading"
      className={styles.specs}
    >
      <div className={styles.eyebrowRow}>
        <span className={styles.eyebrowNum}>03</span>
        <span id="specs-heading" className={styles.eyebrowText}>
          Platform spec
        </span>
        <span className={styles.eyebrowRule} />
        <span className={styles.eyebrowNote}>Matrix fills with scroll</span>
      </div>

      <div id="specGrid" className={styles.specGrid}>
        <div className={styles.sideColumn}>
          {LEFT_CELLS.map((cell) => (
            <div
              key={cell.label}
              data-cell=""
              data-cursor="cell"
              className={styles.cellLeft}
            >
              <div className={styles.valueStackEnd}>
                <span className={styles.label}>{cell.label}</span>
                <div className={styles.metricRow}>
                  <span
                    data-metric=""
                    data-to={cell.to}
                    data-dec={cell.dec}
                    className={styles.metricValue}
                  >
                    {cell.value}
                  </span>
                  <span className={styles.metricUnit}>{cell.unit}</span>
                </div>
                <div className={styles.subRow}>
                  <span className={styles.subLabel}>{cell.subLabel}</span>
                  <span
                    data-metric=""
                    data-to={cell.subTo}
                    data-dec={cell.subDec}
                    data-suffix="%"
                    className={styles.subMetric}
                  >
                    {cell.subValue}
                  </span>
                </div>
              </div>
              <div className={styles.barDotWrap}>
                <span
                  data-bar=""
                  data-pct="100"
                  className={styles.bar}
                />
                <span className={styles.dot} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.drawing}>
          <div className={styles.drawingLineTop} />
          <div className={styles.drawingLineBottom} />
          <div className={`${styles.measureRow} ${styles.measureShoulder}`}>
            <span className={styles.measureRule} />
            <span className={styles.measureLabel}>shoulder 1.42</span>
          </div>
          <div className={`${styles.measureRow} ${styles.measureHip}`}>
            <span className={styles.measureRule} />
            <span className={styles.measureLabel}>hip 0.98</span>
          </div>
          <div className={`${styles.measureRow} ${styles.measureKnee}`}>
            <span className={styles.measureRule} />
            <span className={styles.measureLabel}>knee 0.52</span>
          </div>
          <div className={styles.centerDivider} />
          <span data-ghost="1" aria-hidden="true" className={styles.ghostCenter}>
            2q0
          </span>
          <div className={styles.heightMarker}>
            <div className={styles.heightMarkerInner}>
              <span className={styles.heightAccentLine} />
              <span className={styles.heightLabel}>1.86 m</span>
            </div>
          </div>
          <span className={styles.footLabel}>
            elevation · front · scale 1:12
          </span>
          <span className={styles.sheetLabel}>sheet 03 / a</span>
        </div>

        <div className={styles.sideColumn}>
          {RIGHT_CELLS.map((cell) => (
            <div
              key={cell.label}
              data-cell=""
              data-cursor="cell"
              className={styles.cellRight}
            >
              <div className={styles.barDotWrap}>
                <span className={styles.dot} />
                <span
                  data-bar=""
                  data-pct="100"
                  className={styles.bar}
                />
              </div>
              <div className={styles.valueStackStart}>
                <span className={styles.label}>{cell.label}</span>
                <div className={styles.metricRow}>
                  <span
                    data-metric=""
                    data-to={cell.to}
                    data-dec={cell.dec}
                    className={styles.metricValue}
                  >
                    {cell.value}
                  </span>
                  <span className={styles.metricUnit}>{cell.unit}</span>
                </div>
                <div className={styles.subRow}>
                  <span className={styles.subLabel}>{cell.subLabel}</span>
                  <span
                    data-metric=""
                    data-to={cell.subTo}
                    data-dec={cell.subDec}
                    data-suffix="%"
                    className={styles.subMetric}
                  >
                    {cell.subValue}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.latencyGrid}>
        <div className={styles.latencyIntro}>
          <h3 className={styles.latencyHeading}>DECISION LATENCY</h3>
          <p className={styles.latencyText}>
            The loop closes on the body. Nothing leaves the chassis, so
            nothing waits for a network.
          </p>
        </div>
        <div className={styles.latencyRows}>
          {LATENCY_ROWS.map((row) => (
            <div key={row.label} data-lrow="" className={styles.lrow}>
              <span className={styles.lrowLabel}>{row.label}</span>
              <div className={styles.lrowTrack}>
                <span className={styles.lrowTrackBg} />
                <div
                  data-bar=""
                  data-pct={row.pct}
                  className={`${styles.lrowBar} ${row.barClass}`}
                  style={{ "--pct": `${row.pct}%` } as CSSProperties}
                />
                <span className={styles.lrowTick} />
              </div>
              <span className={styles.lrowValue}>
                <span
                  data-metric=""
                  data-to={row.to}
                  data-dec={row.dec}
                  className={styles.lrowNumber}
                >
                  {row.value}
                </span>
                <span className={styles.lrowUnit}>ms</span>
              </span>
            </div>
          ))}
          <div className={styles.latencyCloseRule} />
        </div>
      </div>
    </section>
  );
}
