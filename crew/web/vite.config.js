import { defineConfig } from "vite";

// Vite config — see https://vitejs.dev/config/
//
// `base: "./"` produces relative asset URLs in the built HTML so that the
// `dist/` output works whether it is served from a domain root, a subpath,
// or just opened from the file system.
//
// Anything under `public/` (crew.json, photos, sounds, etc.) is copied into
// `dist/` verbatim by Vite, so we don't need to import each asset by hand.
export default defineConfig({
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false, // if 5173 is busy, Vite tries 5174, 5175, …
    open: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
