import { defineConfig } from "vite";

export default defineConfig({ build: { lib: { entry: "src/index.ts", formats: ["iife"], name: "Cradle" }, outDir: "dist", emptyOutDir: true } });
