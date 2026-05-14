# Behind the Wings — web app

## Run the dev server

Use **this folder** as the current directory (not the repo root, and not a nested `crew/web/crew/web`).

From anywhere in Terminal:

```bash
cd /Users/clarabrandao/Documents/GitHub/behind-wings/crew/web
npm install
npm run dev
```

Then open the URL Vite prints (usually **http://127.0.0.1:5173** or **http://localhost:5173**).

This project is **not** served with `python -m http.server` anymore — Vite bundles ES modules.

## If `npm` fails with `EPERM` / `process.cwd` / `uv_cwd`

Your shell’s working directory is broken (folder was moved, deleted, or closed in Finder). Fix:

1. Close that Terminal tab.
2. Open a **new** tab.
3. `cd` using the **full path** above, then run `npm run dev` again.

## If localhost “doesn’t load”

- Use **`http://127.0.0.1:5173`** (not port `8000` — that was the old static server).
- If something already uses `5173`, Vite will pick the next free port — read the terminal output for the exact URL.

## Production build

```bash
npm run build
npx vite preview
```

Output is in `dist/`.
