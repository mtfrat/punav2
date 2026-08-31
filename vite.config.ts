import tailwindcss from "@tailwindcss/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  ssr: {
    noExternal: ["sanitize-html", "htmlparser2"],
    optimizeDeps: {
      include: ["sanitize-html"],
    },
  },
});
