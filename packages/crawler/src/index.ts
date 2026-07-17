import { Firecrawl } from "firecrawl";
import { crawlRequestSchema, type CrawlRequest, type KnowledgeSnapshot } from "@cradle/core";

/**
 * Bounded Firecrawl-backed public-site crawler. It keeps the provider's robots
 * behavior enabled and returns reviewable content rather than publishing it.
 */
export async function crawlPublicSite(request: CrawlRequest, installationId: string): Promise<KnowledgeSnapshot> {
  const { url, maxPages } = crawlRequestSchema.parse(request);
  const root = new URL(url);
  const client = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
  const response = await client.crawl(root.href, {
    limit: maxPages,
    crawlEntireDomain: true,
    allowExternalLinks: false,
    allowSubdomains: false,
    ignoreQueryParameters: true,
    scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
  });
  const pages = (response.data ?? []).flatMap((page) => {
    const sourceUrl = page.metadata?.sourceURL ?? page.metadata?.url;
    if (!sourceUrl || new URL(sourceUrl).origin !== root.origin || !page.markdown) return [];
    return [{ url: sourceUrl, title: page.metadata?.title ?? "", markdown: page.markdown }];
  });
  return { id: crypto.randomUUID(), installationId, version: 1, sourceUrl: root.href, pages, createdAt: new Date().toISOString() };
}
