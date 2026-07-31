import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embedMany } from "ai";
import { google } from "./google";
import { store } from "./store";

/**
 * Google's embedding model, using gemini-embedding-001 per Google API v1beta support.
 */
const EMBEDDING_MODEL = google.textEmbeddingModel("gemini-embedding-001");

/**
 * LangChain RecursiveCharacterTextSplitter configured for Markdown parsing
 * splits along headers (#, ##, ###), lists, code blocks, and double newlines with overlap.
 */
const markdownSplitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  chunkSize: 2_000,
  chunkOverlap: 200,
});

/**
 * Chunks and embeds every page in a freshly crawled knowledge snapshot, replacing the
 * installation's previous chunk set entirely. Called from onboarding right after a crawl succeeds.
 */
export async function embedKnowledgePages(
  installationId: string,
  pages: Array<{ url: string; title: string; markdown: string }>,
): Promise<void> {
  const jobs: Array<{ pageUrl: string; pageTitle: string; chunkText: string }> = [];

  for (const page of pages) {
    if (!page.markdown || !page.markdown.trim()) continue;
    const docs = await markdownSplitter.createDocuments([page.markdown]);
    for (const doc of docs) {
      if (doc.pageContent && doc.pageContent.trim().length >= 20) {
        jobs.push({
          pageUrl: page.url,
          pageTitle: page.title,
          chunkText: doc.pageContent.trim(),
        });
      }
    }
  }

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
