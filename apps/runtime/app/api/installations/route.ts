import { auth } from "@cradle/db";
import { store } from "../../lib/store";

/** Lists the installations owned by the signed-in Studio account. */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in to Studio to see your sites." }, { status: 401 });

  const installations = await store.listInstallationsByOwner(session.user.id);
  return Response.json({
    installations: installations.map((installation) => ({ id: installation.id, name: installation.name, knowledgeVersion: installation.knowledgeVersion })),
  });
}
