import tailwindcss from "@tailwindcss/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  ssr: {
    noExternal: [
      "sanitize-html",
      "htmlparser2",
      "escape-string-regexp",
      "is-plain-object",
      "deepmerge",
      "parse-srcset",
      "postcss",
      "launder",
      "dayjs",
      "nanoid",
      "picocolors",
      "source-map-js",
    ],
    optimizeDeps: {
      include: [
        "sanitize-html",
        "escape-string-regexp",
        "is-plain-object",
        "deepmerge",
        "parse-srcset",
        "postcss",
        "launder",
        "dayjs",
        "nanoid",
        "picocolors",
        "source-map-js",
      ],
    },
  },
});
