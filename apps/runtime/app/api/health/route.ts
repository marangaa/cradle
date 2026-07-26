import { store } from "../../lib/store";

/**
 * Unauthenticated, uncached status probe for the services Runtime depends on.
 * Studio (and any future dashboard) can poll this to show "system is down" instead of
 * letting people discover it via a failed onboarding request.
 */
export async function GET() {
  const startedAt = Date.now();

  const [database, firecrawl] = await Promise.allSettled([
    store.ping(),
    checkFirecrawl(),
  ]);

  const services = {
    database: database.status === "fulfilled"
      ? { ok: true as const }
      : { ok: false as const, error: describeError(database.reason) },
    firecrawl: firecrawl.status === "fulfilled"
      ? firecrawl.value
      : { ok: false as const, error: describeError(firecrawl.reason) },
  };

  const ok = services.database.ok && services.firecrawl.ok;
  return Response.json(
    { ok, checkedInMs: Date.now() - startedAt, services },
    { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}

async function checkFirecrawl(): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return { ok: false, error: "FIRECRAWL_API_KEY is not configured." };

  try {
    const response = await fetch("https://api.firecrawl.dev/v2/team/credit-usage", {
      headers: { authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return { ok: false, error: `Firecrawl responded with ${response.status}.` };
    return { ok: true };
  } catch (cause) {
    return { ok: false, error: describeError(cause) };
  }
}

function describeError(cause: unknown) {
  return cause instanceof Error ? cause.message : "Unknown error.";
}
