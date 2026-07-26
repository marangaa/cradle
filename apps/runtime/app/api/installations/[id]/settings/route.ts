import { brandProfileSchema, characterSchema, createDefaultCharacter, installationSchema } from "@cradle/core";
import { auth } from "@cradle/db";
import { z } from "zod";
import { store } from "../../../../lib/store";

const updateSchema = z.object({
  name: installationSchema.shape.name.optional(),
  instructions: installationSchema.shape.instructions.optional(),
  character: characterSchema.optional(),
  brandProfile: brandProfileSchema.optional(),
}).refine((value) => Object.keys(value).length > 0, "Provide at least one setting to update.");

/** Updates settings for the signed-in account's installation. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || installation?.ownerId !== session.user.id) {
    return Response.json({ error: "You do not have access to this installation." }, { status: 401 });
  }

  const update = updateSchema.parse(await request.json());
  const name = update.name ?? installation.name;
  const character = update.character ?? installation.character ?? createDefaultCharacter(name);
  const next = installationSchema.parse({ ...installation, ...update, name, character, runtime: "cradle" });
  await store.saveInstallation(next);
  return Response.json({ installation: { id: next.id, name: next.name }, character: next.character, brandProfile: next.brandProfile ?? null });
}
