import { config } from "dotenv";
import { openai } from "@ai-sdk/openai";
import {
  brandIdentitySchema,
  identityRevisionSchema,
} from "@cradle/core";
import { createCradleStore } from "@cradle/db";
import { identityDraftSchema, toBrandIdentity } from "./identity.js";
import { buildIdentitySource } from "@cradle/identity";
import {
  CANONICAL_ASSET_QUEUE,
  canonicalAssetJobSchema,
  createCradleBoss,
  IDENTITY_GENERATION_QUEUE,
  identityGenerationJobSchema,
  STATE_PACK_QUEUE,
  statePackJobSchema,
  type CanonicalAssetJob,
  type IdentityGenerationJob,
  type StatePackJob,
} from "@cradle/jobs";
import { createAssetStoreFromEnv } from "@cradle/media";
import {
  codexPetStateMetadata,
  codexPetStates,
  composePetAtlas,
  createPetContactSheet,
  createRowLayoutGuide,
  extractPetRow,
  removePetChroma,
  type CodexPetState,
} from "@cradle/pet";
import { generateImage, generateText, Output } from "ai";

config({
  path: new URL("../../runtime/.env.local", import.meta.url),
  quiet: true,
});
config({ path: new URL("../../runtime/.env", import.meta.url), quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL is required to start the Cradle worker.");

const store = createCradleStore(databaseUrl);
const queue = createCradleBoss(databaseUrl);
const assetStore = createAssetStoreFromEnv();

async function generateIdentity(
  installationName: string,
  knowledge: Awaited<ReturnType<typeof store.getKnowledge>>,
) {
  if (!knowledge) throw new Error("Knowledge snapshot is unavailable.");
  const result = await generateText({
    model: openai(
      process.env.CRADLE_IDENTITY_MODEL ??
        process.env.CRADLE_MODEL_ID ??
        "gpt-5.6-sol",
    ),
    output: Output.object({
      schema: identityDraftSchema,
      name: "cradle_identity",
    }),
    system:
      "You create a grounded identity for a company's website. Use only supplied public website evidence. Do not invent facts, customers, outcomes, or visual brand attributes. Return exactly three materially distinct directions. Every direction needs two to four traits, one to five evidence entries, three CSS colour values in palette, and sourceUrl values copied exactly from the supplied sources. Image prompts must describe a single original, non-infringing character on a plain transparent-friendly background; never include text, logos, UI, or a named copyrighted character.",
    prompt: JSON.stringify({
      installationName,
      sources: buildIdentitySource(knowledge),
    }),
  });
  return toBrandIdentity(result.output);
}

queue.on("error", (error) => console.error("Cradle worker queue error", error));
await queue.start();
await queue.createQueue(IDENTITY_GENERATION_QUEUE);
await queue.createQueue(CANONICAL_ASSET_QUEUE);
await queue.createQueue(STATE_PACK_QUEUE);
await queue.work<IdentityGenerationJob>(
  IDENTITY_GENERATION_QUEUE,
  { localConcurrency: 1 },
  async (jobs) => {
    for (const job of jobs) {
      const payload = identityGenerationJobSchema.parse(job.data);
      const revision = await store.getLatestIdentityRevision(
        payload.installationId,
      );
      const installation = await store.getInstallation(payload.installationId);
      const knowledge = await store.getKnowledge(payload.installationId);
      if (
        !revision ||
        revision.id !== payload.revisionId ||
        !installation ||
        !knowledge
      )
        continue;

      const started = identityRevisionSchema.parse({
        ...revision,
        status: "generating",
        updatedAt: new Date().toISOString(),
      });
      await store.saveIdentityRevision(started);
      try {
        const identity = await generateIdentity(installation.name, knowledge);
        await store.saveIdentityRevision(
          identityRevisionSchema.parse({
            ...started,
            status: "ready",
            identity,
            updatedAt: new Date().toISOString(),
          }),
        );
      } catch (error) {
        await store.saveIdentityRevision(
          identityRevisionSchema.parse({
            ...started,
            status: "failed",
            error:
              error instanceof Error
                ? error.message.slice(0, 1_000)
                : "Identity generation failed.",
            updatedAt: new Date().toISOString(),
          }),
        );
        throw error;
      }
    }
  },
);

await queue.work<CanonicalAssetJob>(
  CANONICAL_ASSET_QUEUE,
  { localConcurrency: 1 },
  async (jobs) => {
    for (const job of jobs) {
      const payload = canonicalAssetJobSchema.parse(job.data);
      const revision = await store.getLatestIdentityRevision(
        payload.installationId,
      );
      if (
        !revision ||
        revision.id !== payload.identityRevisionId ||
        revision.status !== "selected" ||
        !revision.identity
      )
        continue;
      const direction = revision.identity.directions.find(
        (item) => item.id === payload.directionId,
      );
      if (!direction)
        throw new Error(
          "The selected direction no longer exists on this identity revision.",
        );
      const existing = await store.listAssetRevisions(revision.id);
      if (
        existing.some(
          (asset) =>
            asset.directionId === direction.id &&
            asset.state === "canonical" &&
            asset.status === "draft",
        )
      )
        continue;

      const imageModel = process.env.CRADLE_IMAGE_MODEL ?? "gpt-image-2";
      try {
        const generated = await generateImage({
          model: openai.image(imageModel),
          prompt: `${direction.imagePrompt}\n\nCreate one centered full-body character on a perfectly flat #ff00ff chroma-key background. Keep clean edges and generous padding. Do not use #ff00ff in the character. No scenery, floor, shadow, glow, text, logo, or watermark.`,
          size: "1024x1024",
          providerOptions: {
            openai: {
              outputFormat: "png",
              quality: "high",
            },
          },
        });
        const assetId = crypto.randomUUID();
        const objectKey = `installations/${payload.installationId}/identity/${revision.id}/${direction.id}/canonical/${assetId}.png`;
        const stored = await assetStore.put({
          key: objectKey,
          body: await removePetChroma(generated.image.uint8Array),
          contentType: "image/png",
          visibility: "private",
        });
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
        await queue.send(
          STATE_PACK_QUEUE,
          statePackJobSchema.parse({ ...payload, canonicalAssetId: assetId }),
          { retryLimit: 2, retryBackoff: true, expireInSeconds: 600 },
        );
      } catch (error) {
        await store.saveIdentityRevision(
          identityRevisionSchema.parse({
            ...revision,
            error:
              error instanceof Error
                ? error.message.slice(0, 1_000)
                : "Canonical asset generation failed.",
            updatedAt: new Date().toISOString(),
          }),
        );
        throw error;
      }
    }
  },
);

const statePrompts: Record<CodexPetState, string> = {
  idle: "quiet micro-animation: a small blink, soft breathing, or gentle body bob",
  "running-right": "a readable right-facing movement cycle with alternating strides",
  "running-left": "a readable left-facing movement cycle with alternating strides",
  waving: "a warm, readable greeting wave using only the character's body or existing prop",
  jumping: "a vertical celebratory hop shown through body position only",
  failed: "a contained, readable setback reaction without detached symbols or text",
  waiting: "an expectant, attentive pose that clearly asks for a visitor's next input",
  running: "focused processing or work activity, not literal running",
  review: "a close, thoughtful review or listening pose using only face and body language",
};

async function generatePetRow(input: {
  canonical: Uint8Array;
  state: CodexPetState;
  imageModel: string;
}) {
  const guide = await createRowLayoutGuide(input.state);
  const generated = await generateImage({
    model: openai.image(input.imageModel),
    prompt: {
      images: [input.canonical, guide],
      text: `Create one animation-row source image for the supplied canonical character. The second image is an invisible construction guide only. Return exactly a ${1536}x${1024} image. Use the central horizontal guide band to place eight separate, complete frame cells with the same character identity, scale, baseline, palette, materials, and prop placement. The ${input.state} state is: ${statePrompts[input.state]}. The first ${codexPetStateMetadata[input.state].frames} cells must contain distinct sequential poses; unused cells must contain only a perfectly flat #ff00ff background. The entire canvas background must be perfectly flat #ff00ff. Do not render guide boxes, grid lines, text, logos, scenery, floor, shadow, blur, aura, detached effects, or #ff00ff anywhere in the character.`,
    },
    size: "1536x1024",
    providerOptions: {
      openai: {
        outputFormat: "png",
        quality: "high",
        ...(input.imageModel === "gpt-image-1.5" ? { inputFidelity: "high" as const } : {}),
      },
    },
  });
  return extractPetRow(generated.image.uint8Array);
}

async function saveGeneratedAsset(input: {
  installationId: string;
  identityRevisionId: string;
  directionId: string;
  state: CodexPetState | "atlas" | "contact-sheet";
  body: Uint8Array;
  contentType: "image/png" | "image/webp";
  parentAssetId: string;
  model: string;
  promptVersion: string;
}) {
  const assetId = crypto.randomUUID();
  const extension = input.contentType === "image/webp" ? "webp" : "png";
  const objectKey = `installations/${input.installationId}/identity/${input.identityRevisionId}/${input.directionId}/${input.state}/${assetId}.${extension}`;
  const stored = await assetStore.put({ key: objectKey, body: input.body, contentType: input.contentType, visibility: "private" });
  await store.saveAssetRevision({
    id: assetId,
    installationId: input.installationId,
    identityRevisionId: input.identityRevisionId,
    directionId: input.directionId,
    state: input.state,
    status: "draft",
    objectKey,
    contentType: input.contentType,
    checksum: stored.checksum,
    parentAssetId: input.parentAssetId,
    provider: "openai",
    model: input.model,
    promptVersion: input.promptVersion,
    createdAt: new Date().toISOString(),
  });
}

await queue.work<StatePackJob>(
  STATE_PACK_QUEUE,
  { localConcurrency: 1 },
  async (jobs) => {
    for (const job of jobs) {
      const payload = statePackJobSchema.parse(job.data);
      const revision = await store.getLatestIdentityRevision(
        payload.installationId,
      );
      if (!revision || revision.id !== payload.identityRevisionId) continue;
      try {
        const assets = await store.listAssetRevisions(
          payload.identityRevisionId,
        );
        const canonical = assets.find(
          (asset) =>
            asset.id === payload.canonicalAssetId &&
            asset.status === "draft" &&
            asset.state === "canonical",
        );
        if (!canonical)
          throw new Error(
            "Canonical asset is unavailable for state generation.",
          );
        const existingStates = new Set(assets.filter((asset) => asset.parentAssetId === canonical.id).map((asset) => asset.state));
        const imageModel = process.env.CRADLE_IMAGE_MODEL ?? "gpt-image-2";
        const canonicalBytes = await assetStore.get(canonical.objectKey);
        for (let index = 0; index < codexPetStates.length; index += 2) {
          const batch = codexPetStates.slice(index, index + 2).filter((state) => !existingStates.has(state));
          await Promise.all(batch.map(async (state) => {
            const row = await generatePetRow({ canonical: canonicalBytes, state, imageModel });
            await saveGeneratedAsset({
              installationId: payload.installationId,
              identityRevisionId: payload.identityRevisionId,
              directionId: payload.directionId,
              state,
              body: row,
              contentType: "image/png",
              parentAssetId: canonical.id,
              model: imageModel,
              promptVersion: "hatch-pet-row-v1",
            });
          }));
        }
        const completedAssets = await store.listAssetRevisions(payload.identityRevisionId);
        if (!existingStates.has("atlas") || !existingStates.has("contact-sheet")) {
          const rows = Object.fromEntries(await Promise.all(codexPetStates.map(async (state) => {
            const row = completedAssets.find((asset) => asset.parentAssetId === canonical.id && asset.state === state && asset.status === "draft");
            if (!row) throw new Error(`The ${state} animation row is unavailable for atlas composition.`);
            return [state, await assetStore.get(row.objectKey)] as const;
          }))) as Record<CodexPetState, Uint8Array>;
          const atlas = await composePetAtlas(rows);
          const contactSheet = await createPetContactSheet(atlas);
          if (!existingStates.has("atlas")) await saveGeneratedAsset({ installationId: payload.installationId, identityRevisionId: payload.identityRevisionId, directionId: payload.directionId, state: "atlas", body: atlas, contentType: "image/webp", parentAssetId: canonical.id, model: imageModel, promptVersion: "hatch-pet-atlas-v1" });
          if (!existingStates.has("contact-sheet")) await saveGeneratedAsset({ installationId: payload.installationId, identityRevisionId: payload.identityRevisionId, directionId: payload.directionId, state: "contact-sheet", body: contactSheet, contentType: "image/webp", parentAssetId: canonical.id, model: imageModel, promptVersion: "hatch-pet-contact-sheet-v1" });
        }
        await store.saveIdentityRevision(
          identityRevisionSchema.parse({
            ...revision,
            error: undefined,
            updatedAt: new Date().toISOString(),
          }),
        );
      } catch (error) {
        await store.saveIdentityRevision(
          identityRevisionSchema.parse({
            ...revision,
            error:
              error instanceof Error
                ? error.message.slice(0, 1_000)
                : "State pack generation failed.",
            updatedAt: new Date().toISOString(),
          }),
        );
        throw error;
      }
    }
  },
);

const shutdown = async () => queue.stop();
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
