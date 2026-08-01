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
          <span className={styles.mark}>x-2qo</span>
          <span className={styles.build}>
            build 2qo.41 &middot; boot sequence 03
          </span>
        </div>

        <div data-load-item className={styles.middle}>
          <div className={styles.counter}>
            <span data-load-num className={styles.num}>
              000
            </span>
            <span className={styles.pct}>%</span>
          </div>
          <div data-load-side className={styles.readout}>
            {/* One tick per entry in LOGS (lib/motion/loader.ts), lit as the boot advances.
                display:none until the mobile block reveals it — on desktop the counter and
                log line already carry progress and the ticks would be noise. */}
            <span data-load-steps className={styles.steps} aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} data-step className={styles.step} />
              ))}
            </span>
            <span data-load-log className={styles.log}>
              initialising actuator bus
            </span>
            <span data-load-sense className={styles.timing}>
              sense &rarr; actuation &middot; 38 ms
            </span>
          </div>
        </div>

        <div data-load-item className={styles.track}>
          <span data-load-bar className={styles.bar} />
        </div>
      </div>
    </div>
  );
}
