import tailwindcss from "@tailwindcss/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  // Keep the server bundle self-contained. This avoids runtime-only module
  // resolution failures in serverless environments while Node built-ins stay
  // external through Vite's default `ssr.target: "node"` behavior.
  ssr: {
    noExternal: true,
  },
});
