import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es", "iife"],
      name: "Cradle",
      fileName: (format) => format === "es" ? "widget.js" : "widget.iife.js",
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
