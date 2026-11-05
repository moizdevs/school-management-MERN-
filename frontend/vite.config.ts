import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// The backend sets an httpOnly, SameSite=Strict cookie. Proxying /api through
// Vite keeps everything same-origin in dev, so the cookie "just works".
const target = process.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5173, proxy: { "/api": { target, changeOrigin: true } } },
});
