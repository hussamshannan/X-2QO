import styles from "./Cursor.module.css";

/**
 * Custom cursor nodes. Static markup — lib/motion/cursor.ts moves them, and only wires up
 * at all on a fine pointer. The CSS hides them outright on coarse pointers, so touch users
 * keep their normal interaction model.
 */
export default function Cursor() {
  return (
    <>
      <div id="cursorRing" className={styles.ring} aria-hidden="true" />
      <div id="cursorDot" className={styles.dot} aria-hidden="true" />
      <div id="cursorLabel" className={styles.label} aria-hidden="true">
        Jump
      </div>
    </>
  );
}
