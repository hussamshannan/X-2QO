import styles from "./Loader.module.css";

/**
 * Boot sequence overlay. Static markup — lib/motion/loader.ts drives the counter, the log
 * lines and the exit, and is the only thing that hides it. aria-hidden because it is
 * decorative chrome: announcing a fake boot log adds nothing for a screen reader.
 */
export default function Loader() {
  return (
    <div id="loader" className={styles.loader} aria-hidden="true">
      <div data-load-inner className={styles.inner}>
        <div data-load-item className={styles.top}>
          <span className={styles.mark}>x-2q0</span>
          <span className={styles.build}>build 2q0.41 &middot; boot sequence 03</span>
        </div>

        <div data-load-item className={styles.middle}>
          <div className={styles.counter}>
            <span data-load-num className={styles.num}>
              000
            </span>
            <span className={styles.pct}>%</span>
          </div>
          <div className={styles.readout}>
            <span data-load-log className={styles.log}>
              initialising actuator bus
            </span>
            <span className={styles.timing}>sense &rarr; actuation &middot; 38 ms</span>
          </div>
        </div>

        <div data-load-item className={styles.track}>
          <span data-load-bar className={styles.bar} />
        </div>
      </div>
    </div>
  );
}
