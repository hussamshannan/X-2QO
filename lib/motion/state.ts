/**
 * The source kept `this._vi` (active vector) and `this._cursorRow` on the component
 * instance, shared between the cursor and the vector timeline. Both live here now.
 */
let activeVector = -1;

export function setActiveVector(i: number): void {
  activeVector = i;
}

export function getActiveVector(): number {
  return activeVector;
}
