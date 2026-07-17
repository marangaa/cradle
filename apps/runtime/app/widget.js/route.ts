import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/** Serves the compiled portable widget from its owning workspace package. */
export async function GET() {
  const widgetPath = resolve(process.cwd(), "../../packages/widget/dist/widget.iife.js");
  const widget = await readFile(widgetPath, "utf8");
  return new Response(widget, {
    headers: {
      "cache-control": "public, max-age=0, must-revalidate",
      "content-type": "application/javascript; charset=utf-8",
    },
  });
}
