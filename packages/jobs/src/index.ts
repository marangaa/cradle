import { PgBoss } from "pg-boss";
import { z } from "zod";

export type CradleBoss = PgBoss;

export const IDENTITY_GENERATION_QUEUE = "cradle.identity.generate";
export const identityGenerationJobSchema = z.object({
  installationId: z.string().uuid(),
  revisionId: z.string().uuid(),
});
export type IdentityGenerationJob = z.infer<typeof identityGenerationJobSchema>;

/** Creates the Postgres-backed queue used by the Runtime producer and worker consumers. */
export function createCradleBoss(databaseUrl: string) {
  return new PgBoss({ connectionString: databaseUrl, schema: "cradle_jobs" });
}
