import { listPetdexCatalog } from "../../../lib/petdex";

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "GET, OPTIONS", "cache-control": "public, max-age=300", vary: "Origin" };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Lists Cradle's curated Petdex starter catalog for Studio selection. */
export async function GET(request: Request) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  try {
    return Response.json({ companions: await listPetdexCatalog() }, { headers });
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : "Petdex catalog is unavailable." }, { status: 502, headers });
  }
}
