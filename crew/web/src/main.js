// main.js — entry point and state machine.
//
// Composes feature modules:
//   • data.js     — async loader for crew.json
//   • render.js   — DOM updates for profile / entry views
//   • keyboard.js — random id selection on keypress
//   • audio.js    — per-profile audio (Howler)
//
// Glue: load data on boot, unlock audio on first Space, show a random crew
// member for 15 s when Space is pressed.

import { loadCrew } from "./data.js";
import { setStatus, showProfile, hideProfile } from "./render.js";
import { attachKeyboardInput } from "./keyboard.js";
import {
  primeAudio,
  unlockAudio,
  playProfileAudio,
  stopProfileAudio,
} from "./audio.js";

import "./style.css";

const HOLD_MS = 15000;

let peopleById = new Map();
let holdTimer = null;
let audioUnlocked = false;

async function init() {
  try {
    peopleById = await loadCrew("crew.json");
    primeAudio(
      [...peopleById.values()].map((p) => p.audio).filter(Boolean)
    );
    setStatus("Press Space for a random profile · Esc to close");
  } catch (err) {
    setStatus(`Failed to load crew: ${err.message}`);
    return;
  }

  attachKeyboardInput({
    getIds: () => [...peopleById.keys()],
    onPickId: (id) => {
      if (!audioUnlocked) {
        unlockAudio();
        audioUnlocked = true;
      }
      onProfileById(id);
    },
    onDismiss: endHold,
    randomKey: " ",
  });
}

function onProfileById(id) {
  const person = peopleById.get(id);
  if (!person) return;

  showProfile(person);
  playProfileAudio(person.audio);

  clearTimeout(holdTimer);
  holdTimer = setTimeout(endHold, HOLD_MS);
}

function endHold() {
  clearTimeout(holdTimer);
  holdTimer = null;
  hideProfile();
  stopProfileAudio();
}

window.addEventListener("beforeunload", endHold);

init();
