import { listPetdexCatalog } from "../../../lib/petdex";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(96).default(48),
  query: z.string().trim().max(80).default(""),
  kind: z.enum(["character", "creature", "object"]).optional(),
});

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "GET, OPTIONS", "cache-control": "public, max-age=300", vary: "Origin" };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Lists approved Petdex entries with server-side filtering and pagination. */
export async function GET(request: Request) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  try {
    const input = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const normalizedQuery = input.query.toLocaleLowerCase();
    const all = (await listPetdexCatalog()).filter((companion) => {
      if (input.kind && companion.kind !== input.kind) return false;
      return !normalizedQuery || [companion.displayName, companion.slug, companion.submittedBy, companion.kind]
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
    });
    const offset = (input.page - 1) * input.limit;
    return Response.json({
      companions: all.slice(offset, offset + input.limit),
      page: input.page,
      limit: input.limit,
      total: all.length,
      hasMore: offset + input.limit < all.length,
    }, { headers });
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : "Petdex catalog is unavailable." }, { status: 502, headers });
  }
}
