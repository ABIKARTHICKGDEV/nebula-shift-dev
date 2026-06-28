import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Repository base path. Configurable via VITE_BASE_PATH env var
// (e.g. set in the GitHub Actions workflow or .env.local).
// Defaults to the current repo name.
const base = process.env.VITE_BASE_PATH ?? "/nebula-shift-dev/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
  },
  server: { port: 8080, host: true },
});
