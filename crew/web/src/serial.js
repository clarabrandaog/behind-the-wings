// serial.js — Web Serial integration.
//
// Single responsibility: open a serial port to the Arduino, read newline-
// delimited messages, and surface them as structured callbacks. Knows
// nothing about the DOM or about audio.
//
// Protocol (matches `crew/arduino-crew/arduino-crew.ino`):
//   READY                      — sent once on boot
//   STATE:<pin>:<ON|OFF>       — sent on boot for each switch and on every
//                                debounced state change

const BAUD = 115200;
const STATE_LINE = /^STATE:(\d+):(ON|OFF)$/;

/**
 * Prompt the user for a port and start streaming switch-state events.
 *
 * @param {Object}   handlers
 * @param {(pin:number, isOn:boolean) => void} handlers.onState
 *        Fires for every STATE line.
 * @param {(msg:string) => void}               [handlers.onStatus]
 *        Fires with human-readable status updates.
 * @param {() => void}                         [handlers.onReady]
 *        Fires when the Arduino sends "READY".
 *
 * @returns {Promise<{ stop: () => Promise<void> }>}
 *          Resolves once the port is open. The returned `stop` function
 *          closes the port and ends the read loop.
 */
export async function connectArduino({ onState, onStatus, onReady }) {
  if (!("serial" in navigator)) {
    throw new Error("Web Serial API not supported. Use Chrome, Edge, or Arc.");
  }

  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: BAUD });
  onStatus?.("Connected.");

  // Decode bytes -> text. We pipe through TextDecoderStream so we can read
  // strings without managing a Uint8Array buffer ourselves.
  const decoder = new TextDecoderStream();
  port.readable.pipeTo(decoder.writable).catch(() => {});
  const reader = decoder.readable.getReader();

  let active = true;

  async function stop() {
    if (!active) return;
    active = false;
    try { reader.releaseLock(); } catch {}
    try { await port.close(); } catch {}
    onStatus?.("Disconnected.");
  }

  // Run the read loop on a separate microtask so the caller can await
  // connectArduino() without blocking on the loop itself.
  (async () => {
    let buffer = "";
    try {
      while (active) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        let nl;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          dispatch(line, { onState, onReady });
        }
      }
    } catch (err) {
      onStatus?.(`Read error: ${err.message}`);
    } finally {
      await stop();
    }
  })();

  return { stop };
}

function dispatch(line, { onState, onReady }) {
  if (!line) return;
  if (line === "READY") {
    onReady?.();
    return;
  }
  const match = STATE_LINE.exec(line);
  if (match && onState) {
    onState(parseInt(match[1], 10), match[2] === "ON");
  }
}
