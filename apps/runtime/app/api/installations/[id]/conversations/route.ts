import { auth } from "@cradle/db";
import { store } from "../../../../lib/store";

/** Returns recent conversations for an installation. Called by Studio. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  if (!installation) return Response.json({ error: "Installation not found." }, { status: 404 });

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || installation.ownerId !== session.user.id) {
    return Response.json({ error: "Unauthorized access to conversations." }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 20), 1), 50);
  const conversations = await store.listConversations(id, limit);

  return Response.json({
    installationId: id,
    conversations,
  });
}
