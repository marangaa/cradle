import { auth } from "@cradle/db";
import { listPetdexCatalog } from "../../../lib/petdex";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  /** Use limit=4500 or all=true to receive the full catalog for client-side filtering. */
  limit: z.coerce.number().int().min(1).max(4_500).default(48),
  /** Convenience shorthand — returns every approved pet in one response. */
  all: z.coerce.boolean().default(false),
  query: z.string().trim().max(80).default(""),
  kind: z.enum(["character", "creature", "object"]).optional(),
});

/** Lists approved Petdex entries for a signed-in Studio account. */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return Response.json({ error: "Sign in to Studio to browse companions." }, { status: 401 });
    const input = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const normalizedQuery = input.query.toLocaleLowerCase();
    const filtered = (await listPetdexCatalog()).filter((companion) => {
      if (input.kind && companion.kind !== input.kind) return false;
      return !normalizedQuery || [companion.displayName, companion.slug, companion.submittedBy, companion.kind]
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
    });

    // When ?all=true is set, skip pagination and return every matching companion.
    if (input.all) {
      return Response.json({
        companions: filtered,
        page: 1,
        limit: filtered.length,
        total: filtered.length,
        hasMore: false,
      });
    }

    const offset = (input.page - 1) * input.limit;
    return Response.json({
      companions: filtered.slice(offset, offset + input.limit),
      page: input.page,
      limit: input.limit,
      total: filtered.length,
      hasMore: offset + input.limit < filtered.length,
    });
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : "Petdex catalog is unavailable." }, { status: 502 });
  }
}
