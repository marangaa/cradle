import { createHash, timingSafeEqual } from "node:crypto";
import { store } from "./store";

/** Creates the hash stored for an installation-scoped owner credential. */
export function hashManagementKey(key: string) {
  return `sha256:${createHash("sha256").update(key).digest("hex")}`;
}

/** Verifies the installation-scoped owner key required by Studio management routes. */
export async function isInstallationManager(request: Request, installationId: string) {
  const installation = await store.getInstallation(installationId);
  const key = request.headers.get("x-cradle-installation-key");
  if (!installation || !key) return false;
  const expected = Buffer.from(installation.managementKeyHash);
  const actual = Buffer.from(hashManagementKey(key));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
