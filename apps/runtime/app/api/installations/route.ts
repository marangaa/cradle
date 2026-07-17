import { installationSchema } from "@cradle/core";
import { store } from "../../lib/store";

export async function POST(request: Request) {
  const installation = installationSchema.parse(await request.json());
  await store.saveInstallation(installation);
  return Response.json(installation, { status: 201 });
}
