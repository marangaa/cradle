import { installationSchema, knowledgeReviewSchema } from "@cradle/core";
import { isInstallationManager } from "../../../../lib/management";
import { store } from "../../../../lib/store";

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "PATCH, OPTIONS", "access-control-allow-headers": "content-type, x-cradle-installation-key", "cache-control": "no-store", vary: "Origin" };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Saves an immutable owner-reviewed subset of the latest bounded crawl. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id: installationId } = await context.params;
  if (!await isInstallationManager(request, installationId)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  const [installation, knowledge, latestIdentity] = await Promise.all([store.getInstallation(installationId), store.getKnowledge(installationId), store.getLatestIdentityRevision(installationId)]);
  if (!installation || !knowledge) return Response.json({ error: "Unknown or unready installation." }, { status: 404, headers });
  if (latestIdentity) return Response.json({ error: "Start a new installation to change sources after identity generation has begun." }, { status: 409, headers });
  const review = knowledgeReviewSchema.parse(await request.json());
  const included = new Set(review.includedUrls);
  const pages = knowledge.pages.filter((page) => included.has(page.url));
  if (pages.length !== included.size) return Response.json({ error: "One or more reviewed pages do not belong to this crawl." }, { status: 422, headers });
  const reviewed = { ...knowledge, id: crypto.randomUUID(), version: knowledge.version + 1, pages, createdAt: new Date().toISOString() };
  await Promise.all([
    store.saveKnowledge(reviewed),
    store.saveInstallation(installationSchema.parse({ ...installation, knowledgeVersion: reviewed.version })),
  ]);
  return Response.json({ knowledge: reviewed }, { headers });
}
