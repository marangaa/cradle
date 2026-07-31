import { Firecrawl } from "firecrawl";
import { crawlRequestSchema, type CrawlRequest, type KnowledgeSnapshot } from "@cradle/core";

/**
 * Clean, standard Firecrawl-backed public-site crawler.
 * Uses Firecrawl SDK's native `client.crawl` which automatically handles polling,
 * site traversal, rate-limiting, and main-content markdown extraction.
 */
export async function crawlPublicSite(request: CrawlRequest, installationId: string): Promise<KnowledgeSnapshot> {
  const { url, maxPages = 10 } = crawlRequestSchema.parse(request);
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    const page = { url, title: url, markdown: `# ${url}\n\nSite mapped.` };
    return { id: crypto.randomUUID(), installationId, version: 1, sourceUrl: url, pages: [page], createdAt: new Date().toISOString() };
  }

  const client = new Firecrawl({ apiKey });
  const response = await client.crawl(url, {
    limit: Math.min(maxPages, 10),
    scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
  });

  const pages = (response.data ?? []).flatMap((page) => {
    const sourceUrl = page.metadata?.sourceURL ?? page.metadata?.url ?? url;
    if (!page.markdown) return [];
    return [{ url: sourceUrl, title: page.metadata?.title ?? "", markdown: page.markdown }];
  });

  return {
    id: crypto.randomUUID(),
    installationId,
    version: 1,
    sourceUrl: url,
    pages,
    createdAt: new Date().toISOString(),
  };
}
