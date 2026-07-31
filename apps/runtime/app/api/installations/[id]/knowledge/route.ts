import { createDefaultCharacter, installationSchema, knowledgeReviewSchema } from "@cradle/core";
import { auth } from "@cradle/db";
import { embedKnowledgePages } from "../../../../lib/embeddings";
import { store } from "../../../../lib/store";

/** Restores the latest reviewed source snapshot. Called only by Studio's server. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || installation?.ownerId !== session.user.id) return Response.json({ error: "You do not have access to this installation." }, { status: 401 });
  const knowledge = await store.getKnowledge(id);
  if (!installation || !knowledge) return Response.json({ error: "Unknown or unready installation." }, { status: 404 });
  return Response.json({
    installation: { id: installation.id, name: installation.name },
    character: installation.character ?? createDefaultCharacter(installation.name),
    brandProfile: installation.brandProfile ?? null,
    knowledge,
  });
}

/** Saves an immutable owner-reviewed subset of the latest bounded crawl. Called only by Studio's server. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: installationId } = await context.params;
  const installation = await store.getInstallation(installationId);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || installation?.ownerId !== session.user.id) return Response.json({ error: "You do not have access to this installation." }, { status: 401 });
  const knowledge = await store.getKnowledge(installationId);
  if (!installation || !knowledge) return Response.json({ error: "Unknown or unready installation." }, { status: 404 });
  const review = knowledgeReviewSchema.parse(await request.json());
  const included = new Set(review.includedUrls);
  const pages = knowledge.pages.filter((page) => included.has(page.url));
  if (pages.length !== included.size) return Response.json({ error: "One or more reviewed pages do not belong to this crawl." }, { status: 422 });
  const reviewed = { ...knowledge, id: crypto.randomUUID(), version: knowledge.version + 1, pages, createdAt: new Date().toISOString() };
  await Promise.all([
    store.saveKnowledge(reviewed),
    store.saveInstallation(installationSchema.parse({ ...installation, knowledgeVersion: reviewed.version })),
    embedKnowledgePages(installationId, pages),
  ]);
  return Response.json({ knowledge: reviewed });
}
