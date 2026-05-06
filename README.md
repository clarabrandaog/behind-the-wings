# Behind the Wings

An interactive frontend installation that pairs an Arduino with a web app.
Six physical switches on a board correspond to six theatrical crew members;
flipping a switch reveals that person's profile (photo, role, location, bio,
and an ambient sound from their craft) for fifteen seconds.

The browser talks to the Arduino over the **Web Serial API**. No backend.

```
+--------------------+    USB    +--------------------+
|  Arduino (6 pins,  | --------> |  Vite + ES modules |
|  switches to GND)  |  Serial   |  Web Serial in JS  |
+--------------------+           +--------------------+
                                          |
                                       crew.json
                                          |
                                       Howler.js
```

## Project layout

```
behind-wings/
├── README.md                  this file
├── .gitignore
├── crew/
│   ├── arduino-crew/
│   │   └── arduino-crew.ino    Arduino sketch (6 switches, debounced)
│   └── web/                    Vite frontend (the submission)
│       ├── package.json
│       ├── vite.config.js
│       ├── index.html          markup only — no inline JS / CSS
│       ├── src/
│       │   ├── main.js         entry point, wires modules together
│       │   ├── data.js         async fetch / parse of crew.json
│       │   ├── render.js       DOM rendering of profile + entry views
│       │   ├── serial.js       Web Serial API integration
│       │   ├── audio.js        Howler.js wrapper for per-profile sound
│       │   └── style.css
│       └── public/             copied verbatim into dist/ at build time
│           ├── crew.json       data source (async fetched on boot)
│           ├── pic/            crew photos + title.gif + instructions.gif
│           └── sounds/         per-role audio clips
└── dist/                       (build output, gitignored)
```

The folders `gyroscopes/`, `switch/`, and `dual-switch/` are earlier
prototypes that led up to this final project; they are kept for reference
but are **not** part of the submission.

## Modules (ES6) and what each one owns

The brief asks for at least three pure modules with a single `main.js`
entry point. We use four:

| Module       | Responsibility                                                      |
|--------------|---------------------------------------------------------------------|
| `data.js`    | Async fetch and parse of `crew.json`. Returns a `Map<pin, person>`. |
| `render.js`  | DOM rendering: write a person's data into the profile card.         |
| `serial.js`  | Open a Web Serial port, parse `STATE:<pin>:<ON\|OFF>` lines.        |
| `audio.js`   | Wrap [Howler.js](https://howlerjs.com/) for per-profile playback.   |
| `main.js`    | Entry point: wires events, holds the 15-second profile state.       |

Each non-entry module exports pure functions. None of them touch globals
beyond their own private cache (`audio.js` keeps a `Map` of preloaded
Howls; `render.js` lazily caches DOM lookups).

## External library

[Howler.js](https://howlerjs.com/) (MIT) is the only runtime dependency.
It is used because vanilla `<audio>` plus the browser autoplay policy
turned out to need a manual prime/timeout dance to work reliably across
Chrome and Arc. Howler unlocks the WebAudio context on first user gesture
for us, caches preloaded buffers, and exposes a uniform `play / stop / fade`
API across browsers — exactly the kind of "where core JS falls short"
case the brief mentions.

## Running it

You need Node 18+ and an Arduino with the sketch in
`crew/arduino-crew/arduino-crew.ino` flashed on it.

```bash
cd crew/web
npm install
npm run dev        # http://localhost:5173 with hot module reloading
```

For a production bundle:

```bash
npm run build      # outputs to crew/web/dist/
npm run preview    # serves the dist/ folder for a final smoke test
```

Open the page in **Chrome, Edge, or Arc** (Web Serial isn't in Safari or
Firefox). Click **Connect Arduino**, pick the device from the picker, then
flip a switch on the board.

### Without the hardware

Each profile is keyed to a number key 2–7 in the page (the same numbers as
the Arduino pins). Press a number to preview that profile; press `Esc` or
`0` to dismiss.

## Hardware

| Pin | Crew member        | Role               |
|-----|--------------------|--------------------|
| 2   | Alyzandra Pessanha | Stage Manager      |
| 3   | Alexandre Queiroz  | Musical Director   |
| 4   | Andre Ferreira     | Technical Manager  |
| 5   | Guilherme Penedo   | Light Operator     |
| 6   | Isabela Millo      | Usher              |
| 7   | Sumalee Eaton      | Theatrical Stitcher|

Each switch wires from its digital pin to GND. The sketch enables
`INPUT_PULLUP` so no external resistors are needed.

Serial protocol (115200 baud):

```
READY                       once on boot
STATE:<pin>:ON              switch closed
STATE:<pin>:OFF             switch released
```

## Attribution

- **Howler.js** — © James Simpson / GoldFire Studios, MIT-licensed.
  https://howlerjs.com/
- **Space Grotesk** typeface — designed by Florian Karsten, OFL-licensed.
  Loaded from Google Fonts.
- **Vite** — © VoidZero Inc. and Vite contributors, MIT-licensed.
- All audio and photography in `crew/web/public/` belongs to the people
  pictured / used with permission.
- The Arduino sketch and Web Serial code in this repository are original
  work for the Frontend final project.
