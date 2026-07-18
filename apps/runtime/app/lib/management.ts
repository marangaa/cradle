import { store } from "./store";

/** Verifies the installation-scoped owner key required by Studio management routes. */
export async function isInstallationManager(request: Request, installationId: string) {
  const installation = await store.getInstallation(installationId);
  const key = request.headers.get("x-cradle-installation-key");
  return Boolean(installation && key && key === installation.publicKey);
}
