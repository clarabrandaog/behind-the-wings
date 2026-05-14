# Behind the Wings

An interactive **keyboard-driven** web app: press **Space** to show a **random**
crew member (picked from numeric `id` values in `crew.json`) for fifteen
seconds—photo, role, location, bio, and an ambient sound.

No backend. **No Web Serial / Arduino required** for the current experience
(the `crew/arduino-crew/` sketch remains in the repo as reference hardware).

```
+------------------+                    +----------------------+
|  Keyboard        |   fetch crew.json  |  Vite + ES modules |
|  Space = random  |  ----------------->  |  Howler + DOM      |
+------------------+                    +----------------------+
```

## Project layout

```
behind-wings/
├── README.md                  this file
├── .gitignore
├── crew/
│   ├── arduino-crew/
│   │   └── arduino-crew.ino    optional reference (6 switches, pins 2–7)
│   └── web/                    Vite frontend (the submission)
│       ├── package.json
│       ├── vite.config.js
│       ├── index.html          markup only — no inline JS / CSS
│       ├── src/
│       │   ├── main.js         entry point, 15 s hold timer
│       │   ├── data.js         async fetch / parse of crew.json
│       │   ├── render.js       DOM rendering of profile + entry views
│       │   ├── keyboard.js     Space = random id, Esc dismiss
│       │   ├── audio.js        Howler.js wrapper for per-profile sound
│       │   └── style.css
│       └── public/             copied verbatim into dist/ at build time
│           ├── crew.json       each person has a numeric `id`
│           ├── pic/            crew photos + title.gif + instructions.gif
│           └── sounds/         per-role audio clips
└── dist/                       (build output, gitignored)
```

The folders `gyroscopes/`, `switch/`, and `dual-switch/` are earlier
prototypes; they are **not** part of the submission.

## Modules (ES6) and what each one owns

| Module        | Responsibility                                                      |
|---------------|---------------------------------------------------------------------|
| `data.js`     | Async fetch and parse of `crew.json`. Returns a `Map<id, person>`. |
| `render.js`   | DOM rendering: write a person's data into the profile card.         |
| `keyboard.js` | Listen for **Space** → random existing `id`; **Esc** / **0** dismiss. |
| `audio.js`    | Wrap [Howler.js](https://howlerjs.com/) for per-profile playback.   |
| `main.js`     | Entry point: wires events, holds the 15-second profile state.       |

## Data shape (`crew.json`)

Each object in `people` must include a numeric **`id`** (used for random
selection). Other fields: `name`, `function`, `location`, `description`,
`social`, `pastWork`, `color`, `photo`, `audio`.

## External library

[Howler.js](https://howlerjs.com/) (MIT) — audio playback with sensible
autoplay / unlock behaviour across browsers.

## Running it

```bash
cd crew/web
npm install
npm run dev        # http://127.0.0.1:5173 — see crew/web/README.md if npm errors
npm run build      # outputs to crew/web/dist/
npm run preview    # serves dist for a smoke test
```

- **Space** — pick a random `id` from the roster and show that profile (+ audio) for 15 s.
- **Esc** or **0** — hide the profile early.

Works in any modern browser; Web Serial is **not** used.

## Optional Arduino reference

`crew/arduino-crew/arduino-crew.ino` still emits `STATE:<pin>:ON|OFF` for
pins 2–7. It can be wired to matching **`id`** values in JSON if you revive
a hardware build later.

## Attribution

- **Howler.js** — © James Simpson / GoldFire Studios, MIT.
- **Space Grotesk** — Florian Karsten, OFL (Google Fonts).
- **Vite** — VoidZero Inc. and contributors, MIT.
- Audio and photography in `crew/web/public/` belong to the people pictured /
  are used with permission.
