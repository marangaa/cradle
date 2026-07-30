import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Copies the built widget into this app's own public/ folder ahead of `next build`.
 *
 * Per Next.js's own docs on static assets: "Only assets that are in the public directory at
 * build time will be served by Next.js. Files added at runtime won't be available." A workspace
 * package's build output isn't part of apps/runtime's own source, so it has to be placed here
 * before the build runs — this script is that step, not a workaround for one.
 */
const src = resolve(import.meta.dirname, "../../../packages/widget/dist/widget.iife.js");
const destDir = resolve(import.meta.dirname, "../public");
const dest = resolve(destDir, "widget.js");

await mkdir(destDir, { recursive: true });
await copyFile(src, dest);
console.log(`[copy-widget] ${src} -> ${dest}`);
