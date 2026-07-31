import { google } from "@ai-sdk/google";
import { embedMany } from "ai";
import { store } from "./store";

/**
 * Google's embedding model, per AI SDK @ai-sdk/google documentation.
 */
const EMBEDDING_MODEL = google.textEmbeddingModel("text-embedding-004");

const MAX_CHUNK_CHARS = 3_000; // ≈750 tokens — small enough for precise retrieval, large enough for real context
const MIN_CHUNK_CHARS = 200; // avoid embedding near-empty fragments (nav labels, stray headings)

/** Splits one page's markdown into paragraph-bounded chunks under MAX_CHUNK_CHARS. */
function chunkMarkdown(markdown: string): string[] {
  const paragraphs = markdown.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > MAX_CHUNK_CHARS) {
      if (current.length >= MIN_CHUNK_CHARS) chunks.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
    // A single paragraph longer than the budget gets hard-split rather than embedded as one giant chunk.
    while (current.length > MAX_CHUNK_CHARS) {
      chunks.push(current.slice(0, MAX_CHUNK_CHARS));
      current = current.slice(MAX_CHUNK_CHARS);
    }
  }
  if (current.length >= MIN_CHUNK_CHARS) chunks.push(current);
  return chunks;
}

/**
 * Chunks and embeds every page in a freshly crawled knowledge snapshot, replacing the
 * installation's previous chunk set entirely. Called from onboarding right after a crawl
 * succeeds — synchronous with that request (crawls are already bounded to 90s and typically
 * modest marketing sites, so this is an acceptable v1 tradeoff over a background job).
 */
export async function embedKnowledgePages(
  installationId: string,
  pages: Array<{ url: string; title: string; markdown: string }>,
): Promise<void> {
  const jobs = pages.flatMap((page) =>
    chunkMarkdown(page.markdown).map((chunkText) => ({ pageUrl: page.url, pageTitle: page.title, chunkText }))
  );

  if (jobs.length === 0) {
    await store.replaceKnowledgeChunks(installationId, []);
    return;
  }

  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: jobs.map((job) => job.chunkText),
    maxParallelCalls: 4,
  });

  await store.replaceKnowledgeChunks(
    installationId,
    jobs.map((job, i) => ({ id: crypto.randomUUID(), ...job, embedding: embeddings[i]! })),
  );
}

/** Embeds a single query string for a knowledge search — same model as ingestion, required for meaningful cosine similarity. */
export async function embedQuery(text: string): Promise<number[]> {
  const { embeddings } = await embedMany({ model: EMBEDDING_MODEL, values: [text] });
  return embeddings[0]!;
}
