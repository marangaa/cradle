import { installationSchema } from "@cradle/core";
import { hashManagementKey, isInstallationManager } from "../../../../lib/management";
import { store } from "../../../../lib/store";

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "PATCH, OPTIONS", "access-control-allow-headers": "x-cradle-installation-key", "cache-control": "no-store", vary: "Origin" };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Rotates an installation owner credential and returns the new value exactly once. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id } = await context.params;
  if (!await isInstallationManager(request, id)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  const installation = await store.getInstallation(id);
  if (!installation) return Response.json({ error: "Unknown installation." }, { status: 404, headers });
  const managementKey = crypto.randomUUID().replaceAll("-", "");
  await store.saveInstallation(installationSchema.parse({ ...installation, managementKeyHash: hashManagementKey(managementKey) }));
  return Response.json({ managementKey }, { headers });
}
