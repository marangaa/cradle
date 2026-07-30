import { defineConfig } from "tsup";

export default defineConfig([
  {
    // The npm/bundler entry point — plain ESM, importable by any modern bundler. The "use
    // client" banner is the officially documented pattern for component libraries with
    // client-only entry points (nextjs.org/docs/app/getting-started/server-and-client-components):
    // it lets consumers `import { Cradle } from "@maranga/cradle"` directly into a Server
    // Component file without needing to write their own client wrapper around it — Next.js
    // treats the import as a client reference automatically. Harmless for any other bundler;
    // it's just an unrecognized-but-valid directive prologue everywhere else.
    entry: { widget: "src/index.ts" },
    format: ["esm"],
    platform: "browser",
    dts: true,
    clean: true,
    banner: { js: '"use client";' },
  },
  {
    // The <script src> embed target — a self-contained global script, no module system, no
    // bundler-directive semantics involved. Deliberately no `globalName`: the module already
    // self-registers `window.Cradle` as an internal side effect (see src/index.ts) — giving
    // esbuild's IIFE wrapper its own globalName here would create a second, colliding
    // `window.Cradle` assignment (the wrapper's own export object) that overwrites the real one.
    entry: { "widget.iife": "src/index.ts" },
    format: ["iife"],
    platform: "browser",
    clean: false,
    // tsup's default IIFE naming appends ".global" (dist/widget.iife.global.js) — every reference
    // to this file elsewhere in the repo (package.json exports/unpkg/jsdelivr,
    // apps/runtime/scripts/copy-widget.mjs) expects plain "widget.iife.js", so force it.
    outExtension: () => ({ js: ".js" }),
  },
]);
