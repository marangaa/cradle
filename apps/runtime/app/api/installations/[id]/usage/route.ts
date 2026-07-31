import { auth } from "@cradle/db";
import { store } from "../../../../lib/store";

/** Returns the monthly usage counter for an installation. Called by Studio or runtime APIs. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  if (!installation) return Response.json({ error: "Installation not found." }, { status: 404 });

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || installation.ownerId !== session.user.id) {
    return Response.json({ error: "Unauthorized access to usage metrics." }, { status: 401 });
  }

  const usage = await store.getUsage(id);
  return Response.json({
    installationId: id,
    periodStart: usage.periodStart,
    conversationCount: usage.conversationCount,
    messageCount: usage.messageCount,
    limit: 99,
  });
}
