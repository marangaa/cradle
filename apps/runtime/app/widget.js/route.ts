import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Serves the compiled portable widget from its owning workspace package. */
export async function GET() {
  const widgetPath = require.resolve("@cradle/widget/widget.js");
  const widget = await readFile(widgetPath, "utf8");
  return new Response(widget, {
    headers: {
      "cache-control": "public, max-age=0, must-revalidate",
      "content-type": "application/javascript; charset=utf-8",
    },
  });
}
