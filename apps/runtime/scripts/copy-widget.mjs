import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "../../../packages/widget/dist/widget.iife.js");
const destination = resolve(here, "../public/widget.js");

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
