import { CANONICAL_ASSET_QUEUE, createCradleBoss, IDENTITY_GENERATION_QUEUE, type CradleBoss } from "@cradle/jobs";

let queuePromise: Promise<CradleBoss> | undefined;

async function startQueue(): Promise<CradleBoss> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for Cradle background work.");
  const queue = createCradleBoss(databaseUrl);
  queue.on("error", (error) => console.error("Cradle job queue error", error));
  await queue.start();
  await queue.createQueue(IDENTITY_GENERATION_QUEUE);
  await queue.createQueue(CANONICAL_ASSET_QUEUE);
  return queue;
}

/** Lazily starts the shared durable queue used by Runtime request handlers. */
export function getCradleQueue(): Promise<CradleBoss> {
  queuePromise ??= startQueue();
  return queuePromise;
}
