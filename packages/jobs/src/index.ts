import { PgBoss } from "pg-boss";
import { z } from "zod";

export type CradleBoss = PgBoss;

export const IDENTITY_GENERATION_QUEUE = "cradle.identity.generate";
export const CANONICAL_ASSET_QUEUE = "cradle.asset.generate-canonical";
export const STATE_PACK_QUEUE = "cradle.asset.generate-state-pack";
export const identityGenerationJobSchema = z.object({
  installationId: z.string().uuid(),
  revisionId: z.string().uuid(),
});
export type IdentityGenerationJob = z.infer<typeof identityGenerationJobSchema>;

export const canonicalAssetJobSchema = z.object({
  installationId: z.string().uuid(),
  identityRevisionId: z.string().uuid(),
  directionId: z.string().uuid(),
});
export type CanonicalAssetJob = z.infer<typeof canonicalAssetJobSchema>;

export const statePackJobSchema = canonicalAssetJobSchema.extend({ canonicalAssetId: z.string().uuid() });
export type StatePackJob = z.infer<typeof statePackJobSchema>;

/** Creates the Postgres-backed queue used by the Runtime producer and worker consumers. */
export function createCradleBoss(databaseUrl: string) {
  return new PgBoss({ connectionString: databaseUrl, schema: "cradle_jobs" });
}
