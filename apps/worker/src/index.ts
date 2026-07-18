import { openai } from "@ai-sdk/openai";
import { brandIdentitySchema, identityRevisionSchema, type BrandIdentity } from "@cradle/core";
import { createCradleStore } from "@cradle/db";
import { buildIdentitySource } from "@cradle/identity";
import { CANONICAL_ASSET_QUEUE, canonicalAssetJobSchema, createCradleBoss, IDENTITY_GENERATION_QUEUE, identityGenerationJobSchema, STATE_PACK_QUEUE, statePackJobSchema, type CanonicalAssetJob, type IdentityGenerationJob, type StatePackJob } from "@cradle/jobs";
import { createAssetStoreFromEnv } from "@cradle/media";
import { generateImage, generateText, Output } from "ai";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to start the Cradle worker.");

const store = createCradleStore(databaseUrl);
const queue = createCradleBoss(databaseUrl);
const assetStore = createAssetStoreFromEnv();

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
await queue.createQueue(CANONICAL_ASSET_QUEUE);
await queue.createQueue(STATE_PACK_QUEUE);
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

await queue.work<CanonicalAssetJob>(CANONICAL_ASSET_QUEUE, { localConcurrency: 1 }, async (jobs) => {
  for (const job of jobs) {
    const payload = canonicalAssetJobSchema.parse(job.data);
    const revision = await store.getLatestIdentityRevision(payload.installationId);
    if (!revision || revision.id !== payload.identityRevisionId || revision.status !== "selected" || !revision.identity) continue;
    const direction = revision.identity.directions.find((item) => item.id === payload.directionId);
    if (!direction) throw new Error("The selected direction no longer exists on this identity revision.");
    const existing = await store.listAssetRevisions(revision.id);
    if (existing.some((asset) => asset.directionId === direction.id && asset.state === "canonical" && asset.status === "draft")) continue;

    const imageModel = process.env.CRADLE_IMAGE_MODEL ?? "gpt-image-2";
    const generated = await generateImage({
      model: openai.image(imageModel),
      prompt: direction.imagePrompt,
      size: "1024x1024",
      providerOptions: { openai: { background: "transparent", outputFormat: "png", quality: "high" } },
    });
    const assetId = crypto.randomUUID();
    const objectKey = `installations/${payload.installationId}/identity/${revision.id}/${direction.id}/canonical/${assetId}.png`;
    const stored = await assetStore.put({ key: objectKey, body: generated.image.uint8Array, contentType: "image/png", visibility: "private" });
    await store.saveAssetRevision({
      id: assetId,
      installationId: payload.installationId,
      identityRevisionId: revision.id,
      directionId: direction.id,
      state: "canonical",
      status: "draft",
      objectKey,
      contentType: "image/png",
      checksum: stored.checksum,
      provider: "openai",
      model: imageModel,
      promptVersion: "canonical-v1",
      createdAt: new Date().toISOString(),
    });
    await queue.send(STATE_PACK_QUEUE, statePackJobSchema.parse({ ...payload, canonicalAssetId: assetId }), { retryLimit: 2, retryBackoff: true, expireInSeconds: 600 });
  }
});

const statePrompts = {
  idle: "same character, quiet resting pose, gentle neutral expression",
  welcome: "same character, welcoming gesture and warm attentive expression",
  listening: "same character, subtly leaning in with focused listening expression",
  thinking: "same character, reflective thinking pose with a small soft glow",
  resolved: "same character, calm satisfied expression after helping",
  away: "same character, peaceful low-energy resting pose",
} as const;

await queue.work<StatePackJob>(STATE_PACK_QUEUE, { localConcurrency: 1 }, async (jobs) => {
  for (const job of jobs) {
    const payload = statePackJobSchema.parse(job.data);
    const assets = await store.listAssetRevisions(payload.identityRevisionId);
    const canonical = assets.find((asset) => asset.id === payload.canonicalAssetId && asset.status === "draft" && asset.state === "canonical");
    if (!canonical) throw new Error("Canonical asset is unavailable for state generation.");
    const existingStates = new Set(assets.filter((asset) => asset.parentAssetId === canonical.id).map((asset) => asset.state));
    const imageModel = process.env.CRADLE_IMAGE_MODEL ?? "gpt-image-2";
    const canonicalBytes = await assetStore.get(canonical.objectKey);
    for (const [state, instruction] of Object.entries(statePrompts)) {
      if (existingStates.has(state as keyof typeof statePrompts)) continue;
      const generated = await generateImage({ model: openai.image(imageModel), prompt: { images: [canonicalBytes], text: `${instruction}. Preserve the exact same character design, silhouette, palette, and transparent background. No text or logos.` }, size: "1024x1024", providerOptions: { openai: { background: "transparent", outputFormat: "png", quality: "high", inputFidelity: "high" } } });
      const assetId = crypto.randomUUID();
      const objectKey = `installations/${payload.installationId}/identity/${payload.identityRevisionId}/${payload.directionId}/${state}/${assetId}.png`;
      const stored = await assetStore.put({ key: objectKey, body: generated.image.uint8Array, contentType: "image/png", visibility: "private" });
      await store.saveAssetRevision({ id: assetId, installationId: payload.installationId, identityRevisionId: payload.identityRevisionId, directionId: payload.directionId, state: state as keyof typeof statePrompts, status: "draft", objectKey, contentType: "image/png", checksum: stored.checksum, parentAssetId: canonical.id, provider: "openai", model: imageModel, promptVersion: "state-pack-v1", createdAt: new Date().toISOString() });
    }
  }
});

const shutdown = async () => queue.stop();
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
