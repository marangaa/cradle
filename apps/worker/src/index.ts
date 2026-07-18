import { openai } from "@ai-sdk/openai";
import { brandIdentitySchema, identityRevisionSchema, type BrandIdentity } from "@cradle/core";
import { createCradleStore } from "@cradle/db";
import { buildIdentitySource } from "@cradle/identity";
import { createCradleBoss, IDENTITY_GENERATION_QUEUE, identityGenerationJobSchema, type IdentityGenerationJob } from "@cradle/jobs";
import { generateText, Output } from "ai";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to start the Cradle worker.");

const store = createCradleStore(databaseUrl);
const queue = createCradleBoss(databaseUrl);

async function generateIdentity(installationName: string, knowledge: Awaited<ReturnType<typeof store.getKnowledge>>) {
  if (!knowledge) throw new Error("Knowledge snapshot is unavailable.");
  const result = await generateText({
    model: openai(process.env.CRADLE_IDENTITY_MODEL ?? process.env.CRADLE_MODEL_ID ?? "gpt-5.6-sol"),
    output: Output.object<BrandIdentity>({ schema: brandIdentitySchema as never, name: "cradle_identity" }),
    system: "You create a grounded identity for a company's website. Use only supplied public website evidence. Do not invent facts, customers, outcomes, or visual brand attributes. Return three materially distinct directions. Each direction must cite the URLs that support its rationale. Image prompts must describe a single original, non-infringing character on a plain transparent-friendly background; never include text, logos, UI, or a named copyrighted character.",
    prompt: JSON.stringify({ installationName, sources: buildIdentitySource(knowledge) }),
  });
  return brandIdentitySchema.parse(result.output);
}

queue.on("error", (error) => console.error("Cradle worker queue error", error));
await queue.start();
await queue.createQueue(IDENTITY_GENERATION_QUEUE);
await queue.work<IdentityGenerationJob>(IDENTITY_GENERATION_QUEUE, { localConcurrency: 1 }, async (jobs) => {
  for (const job of jobs) {
    const payload = identityGenerationJobSchema.parse(job.data);
    const revision = await store.getLatestIdentityRevision(payload.installationId);
    const installation = await store.getInstallation(payload.installationId);
    const knowledge = await store.getKnowledge(payload.installationId);
    if (!revision || revision.id !== payload.revisionId || !installation || !knowledge) continue;

    const started = identityRevisionSchema.parse({ ...revision, status: "generating", updatedAt: new Date().toISOString() });
    await store.saveIdentityRevision(started);
    try {
      const identity = await generateIdentity(installation.name, knowledge);
      await store.saveIdentityRevision(identityRevisionSchema.parse({ ...started, status: "ready", identity, updatedAt: new Date().toISOString() }));
    } catch (error) {
      await store.saveIdentityRevision(identityRevisionSchema.parse({ ...started, status: "failed", error: error instanceof Error ? error.message.slice(0, 1_000) : "Identity generation failed.", updatedAt: new Date().toISOString() }));
      throw error;
    }
  }
});

const shutdown = async () => queue.stop();
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
