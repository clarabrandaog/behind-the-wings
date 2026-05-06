// main.js — entry point and state machine.
//
// Composes the four feature modules:
//   • data.js   — async loader for crew.json
//   • render.js — DOM updates for profile / entry views
//   • serial.js — Web Serial connection to the Arduino
//   • audio.js  — per-profile audio (Howler)
//
// Everything else (CSS, network, hardware) lives in those modules. This file
// is just glue: load data on boot, wire up the Connect button, and react to
// switch events with a 15-second hold timer.

import { loadCrew } from "./data.js";
import { setStatus, showProfile, hideProfile } from "./render.js";
import { connectArduino } from "./serial.js";
import {
  primeAudio,
  unlockAudio,
  playProfileAudio,
  stopProfileAudio,
} from "./audio.js";

import "./style.css";

const HOLD_MS = 15000;

let peopleByPin = new Map();
let holdTimer = null;
let activeStop = null; // returned by connectArduino, used to disconnect on errors

// ---------- Boot ----------

async function init() {
  const connectBtn = document.getElementById("connect");
  connectBtn.addEventListener("click", onConnectClick);

  try {
    peopleByPin = await loadCrew("crew.json");
    primeAudio(
      [...peopleByPin.values()].map((p) => p.audio).filter(Boolean)
    );
  } catch (err) {
    setStatus(`Failed to load crew: ${err.message}`);
    connectBtn.disabled = true;
    return;
  }

  // Bonus: keyboard preview for design work without the Arduino.
  // 2..7 show the matching profile, Esc / 0 dismisses it.
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "0") {
      endHold();
      return;
    }
    const pin = parseInt(e.key, 10);
    if (peopleByPin.has(pin)) {
      onSwitch(pin, true);
    }
  });
}

// ---------- Switch -> profile state machine ----------

function onSwitch(pin, isOn) {
  if (!isOn) return; // off events are ignored; the hold timer drives hide
  const person = peopleByPin.get(pin);
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

// ---------- Connect button ----------

async function onConnectClick() {
  const connectBtn = document.getElementById("connect");
  connectBtn.disabled = true;

  // Howler unlocks on this gesture. Doing it here means the very first
  // STATE:ON event from the Arduino can play audio without a separate prime.
  unlockAudio();

  try {
    activeStop = (
      await connectArduino({
        onState: onSwitch,
        onStatus: (msg) => {
          setStatus(msg);
          if (msg.startsWith("Disconnected") || msg.startsWith("Read error")) {
            connectBtn.disabled = false;
            endHold();
            activeStop = null;
          }
        },
      })
    ).stop;
  } catch (err) {
    setStatus(`Connection failed: ${err.message}`);
    connectBtn.disabled = false;
  }
}

// Tear down the port if the user closes the tab.
window.addEventListener("beforeunload", () => {
  if (activeStop) activeStop();
});

init();
