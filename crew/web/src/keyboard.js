// keyboard.js — keyboard input for random profile selection.
//
// Single responsibility: listen for a key, pick a random `id` from the set of
// known crew ids, and call the handler with that id. Escape dismisses via
// optional callback.

/**
 * Attach global keydown listeners.
 *
 * @param {Object} opts
 * @param {() => number[]}           opts.getIds - returns all valid person ids
 * @param {(id: number) => void}     opts.onPickId - called with a random id
 * @param {() => void}               [opts.onDismiss] - Esc / 0
 * @param {string}                   [opts.randomKey=" "] - e.g. Space triggers random
 */
export function attachKeyboardInput({
  getIds,
  onPickId,
  onDismiss,
  randomKey = " ",
}) {
  function onKeydown(e) {
    if (e.key === "Escape" || e.key === "0") {
      onDismiss?.();
      return;
    }
    if (e.key !== randomKey) return;
    if (e.repeat) return;

    const ids = getIds();
    if (!ids.length) return;

    e.preventDefault();
    const id = ids[Math.floor(Math.random() * ids.length)];
    onPickId(id);
  }

  window.addEventListener("keydown", onKeydown);
  return function detach() {
    window.removeEventListener("keydown", onKeydown);
  };
}
