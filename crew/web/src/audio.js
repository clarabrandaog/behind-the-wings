// audio.js — audio playback wrapper around Howler.js.
//
// Why Howler instead of the native <audio> element?
//   • Howler unlocks the WebAudio context on the first user gesture for us,
//     so we no longer need the manual prime/timeout dance the project used to
//     have around `audio.play()`.
//   • A single Howl per file is cached and reused across plays, so re-firing
//     the same profile during the 15-second hold is instant.
//   • Built-in fade and stop semantics, consistent across browsers.
//
// Howler.js — MIT licensed — https://howlerjs.com/

import { Howl, Howler } from "howler";

const cache = new Map(); // src -> Howl
let current = null; // Howl currently playing (if any)

function load(src) {
  if (cache.has(src)) return cache.get(src);
  const howl = new Howl({
    src: [src],
    html5: true, // stream large files instead of decoding entire buffer
    preload: true,
  });
  cache.set(src, howl);
  return howl;
}

/**
 * Pre-load every audio file we know about so the first play is instant.
 * Called once after crew.json is loaded.
 */
export function primeAudio(sources) {
  for (const src of sources) {
    if (typeof src === "string" && src) load(src);
  }
}

/**
 * Resume the WebAudio context on a user gesture. Must be called from inside
 * a click/keypress handler. Safe to call multiple times.
 */
export function unlockAudio() {
  if (Howler.ctx && Howler.ctx.state !== "running") {
    Howler.ctx.resume().catch(() => {});
  }
}

/**
 * Play a profile's audio file. If something is already playing, it stops
 * first. Always rewinds to start (no loop).
 */
export function playProfileAudio(src) {
  stopProfileAudio();
  if (!src) return;
  const howl = load(src);
  howl.stop();
  howl.play();
  current = howl;
}

/** Stop whatever is currently playing and rewind it. */
export function stopProfileAudio() {
  if (current) {
    current.stop();
    current = null;
  }
}
