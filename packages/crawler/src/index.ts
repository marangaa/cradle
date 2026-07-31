import { Firecrawl } from "firecrawl";
import { crawlRequestSchema, type CrawlRequest, type KnowledgeSnapshot } from "@cradle/core";

/**
 * Maximum time (ms) to allow Firecrawl full domain crawling before falling back to fast root page scraping.
 * Kept well under Next.js and Node Undici HTTP header timeout limits.
 */
const CRAWL_TIMEOUT_MS = 25_000;

export async function crawlPublicSite(request: CrawlRequest, installationId: string): Promise<KnowledgeSnapshot> {
  const { url, maxPages } = crawlRequestSchema.parse(request);
  const root = new URL(url);
  const apiKey = process.env.FIRECRAWL_API_KEY;

  // Return instant root snapshot if Firecrawl API key is omitted (zero credit cost)
  if (!apiKey) {
    const page = { url: root.href, title: root.hostname, markdown: `# ${root.hostname}\n\nSite mapped for ${root.hostname}.` };
    return { id: crypto.randomUUID(), installationId, version: 1, sourceUrl: root.href, pages: [page], createdAt: new Date().toISOString() };
  }

  const client = new Firecrawl({ apiKey });

  // Initiate fast single-page scrape in parallel as a guaranteed fallback (~1s latency)
  const fallbackScrapePromise = client
    .scrape(root.href, { formats: ["markdown"], onlyMainContent: true })
    .then((res) => {
      const markdown = res.markdown?.trim();
      if (!markdown) return [];
      return [{
        url: root.href,
        title: res.metadata?.title || root.hostname,
        markdown,
      }];
    })
    .catch((err) => {
      console.warn(`[Crawler] Scrape fallback warning for ${root.href}:`, err instanceof Error ? err.message : err);
      return [{
        url: root.href,
        title: root.hostname,
        markdown: `# ${root.hostname}\n\nSite mapped for ${root.hostname}.`,
      }];
    });

  let pages: Array<{ url: string; title: string; markdown: string }> = [];

  try {
    const crawlResponse = await Promise.race([
      client.crawl(root.href, {
        limit: Math.min(maxPages ?? 12, 12),
        crawlEntireDomain: true,
        allowExternalLinks: false,
        allowSubdomains: false,
        ignoreQueryParameters: true,
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Firecrawl crawl exceeded ${CRAWL_TIMEOUT_MS / 1000}s limit`)), CRAWL_TIMEOUT_MS)
      ),
    ]);

    pages = (crawlResponse.data ?? []).flatMap((page) => {
      const sourceUrl = page.metadata?.sourceURL ?? page.metadata?.url;
      if (!sourceUrl || !page.markdown) return [];
      try {
        if (new URL(sourceUrl).origin !== root.origin) return [];
      } catch {
        return [];
      }
      return [{ url: sourceUrl, title: page.metadata?.title ?? "", markdown: page.markdown }];
    });

    console.log(`[Crawler] Firecrawl domain crawl completed with ${pages.length} pages for ${root.href}`);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[Crawler] Domain crawl failed or timed out (${reason}). Using fast scrape fallback.`);
  }

  // If domain crawl produced no usable pages, use the fast single-page scrape result
  if (pages.length === 0) {
    pages = await fallbackScrapePromise;
    console.log(`[Crawler] Using fallback scrape result with ${pages.length} pages`);
  }

  return {
    id: crypto.randomUUID(),
    installationId,
    version: 1,
    sourceUrl: root.href,
    pages,
    createdAt: new Date().toISOString(),
  };
}
