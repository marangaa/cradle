import type { CompanionPackage, ConversationRecord, Installation, KnowledgeChunk, KnowledgeSnapshot, UsageCounter, Visitor, VisitorMemoryFact } from "@cradle/core";
import { and, cosineDistance, desc, eq, sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { companionPackages, conversations, installations, knowledgeChunks, knowledgeSnapshots, usageCounters, visitorMemories, visitors } from "#schema";

const schema = { installations, knowledgeSnapshots, companionPackages, visitors, conversations, visitorMemories, knowledgeChunks, usageCounters };
type CradleDatabase = NodePgDatabase<typeof schema>;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const USAGE_PERIOD_DAYS = 30;

/** Storage contract shared by self-hosted and managed Cradle runtimes. */
export interface CradleStore {
  getInstallation(id: string): Promise<Installation | null>;
  saveInstallation(installation: Installation): Promise<void>;
  deleteInstallation(id: string, ownerId: string): Promise<boolean>;
  listInstallationsByOwner(ownerId: string): Promise<(Installation & { updatedAt?: string })[]>;

  getKnowledge(installationId: string): Promise<KnowledgeSnapshot | null>;
  saveKnowledge(snapshot: KnowledgeSnapshot): Promise<void>;
  getCompanionPackage(installationId: string): Promise<CompanionPackage | null>;
  saveCompanionPackage(companion: CompanionPackage): Promise<void>;

  /** Creates the visitor row if it doesn't exist yet (id is client-generated), else touches lastSeenAt. */
  touchVisitor(installationId: string, visitorId: string): Promise<Visitor>;
  getConversation(visitorId: string): Promise<ConversationRecord | null>;
  saveConversation(record: ConversationRecord): Promise<void>;

  getVisitorMemories(visitorId: string): Promise<VisitorMemoryFact[]>;
  setVisitorMemory(visitorId: string, key: string, value: string): Promise<void>;
  deleteVisitorMemory(visitorId: string, key: string): Promise<void>;

  /** Replaces all chunks for an installation (re-crawl invalidates the previous set entirely). */
  replaceKnowledgeChunks(installationId: string, chunks: Array<{ id: string; pageUrl: string; pageTitle: string; chunkText: string; embedding: number[] }>): Promise<void>;
  /** Cosine-similarity search over that installation's chunks, most relevant first. */
  searchKnowledgeChunks(installationId: string, queryEmbedding: number[], topK: number): Promise<KnowledgeChunk[]>;

  /** Retrieves the installation's current usage counter for the active 30-day billing cycle. */
  getUsage(installationId: string): Promise<UsageCounter>;
  /** Atomically increments the installation's counter (rolling over stale periods), returning the post-increment state. */
  incrementUsage(installationId: string, isNewConversation?: boolean): Promise<UsageCounter>;

  /** Cheap connectivity probe used by the health-check route — throws if the store is unreachable. */
  ping(): Promise<void>;
}

/** Lightweight development store used only when a database is deliberately not configured. */
export class MemoryStore implements CradleStore {
  private readonly installations = new Map<string, Installation>();
  private readonly knowledge = new Map<string, KnowledgeSnapshot>();
  private readonly companions = new Map<string, CompanionPackage>();
  private readonly visitorsById = new Map<string, Visitor>();
  private readonly conversationsByVisitor = new Map<string, ConversationRecord>();
  private readonly memoriesByVisitor = new Map<string, Map<string, VisitorMemoryFact>>();
  private readonly chunksByInstallation = new Map<string, Array<KnowledgeChunk & { embedding: number[] }>>();
  private readonly usage = new Map<string, UsageCounter>();

  async getInstallation(id: string) { return this.installations.get(id) ?? null; }
  async saveInstallation(installation: Installation) { this.installations.set(installation.id, installation); }
  async deleteInstallation(id: string, ownerId: string) {
    const inst = this.installations.get(id);
    if (!inst || inst.ownerId !== ownerId) return false;
    this.installations.delete(id);
    this.knowledge.delete(id);
    this.companions.delete(id);
    return true;
  }
  async listInstallationsByOwner(ownerId: string) { return [...this.installations.values()].filter((installation) => installation.ownerId === ownerId); }
  async getKnowledge(installationId: string) { return this.knowledge.get(installationId) ?? null; }
  async saveKnowledge(snapshot: KnowledgeSnapshot) { this.knowledge.set(snapshot.installationId, snapshot); }
  async getCompanionPackage(installationId: string) { return this.companions.get(installationId) ?? null; }
  async saveCompanionPackage(companion: CompanionPackage) { this.companions.set(companion.installationId, companion); }

  async touchVisitor(installationId: string, visitorId: string) {
    const now = new Date().toISOString();
    const existing = this.visitorsById.get(visitorId);
    const visitor: Visitor = existing ? { ...existing, lastSeenAt: now } : { id: visitorId, installationId, createdAt: now, lastSeenAt: now };
    this.visitorsById.set(visitorId, visitor);
    return visitor;
  }
  async getConversation(visitorId: string) { return this.conversationsByVisitor.get(visitorId) ?? null; }
  async saveConversation(record: ConversationRecord) { this.conversationsByVisitor.set(record.visitorId, record); }

  async getVisitorMemories(visitorId: string) { return [...(this.memoriesByVisitor.get(visitorId)?.values() ?? [])]; }
  async setVisitorMemory(visitorId: string, key: string, value: string) {
    const bucket = this.memoriesByVisitor.get(visitorId) ?? new Map<string, VisitorMemoryFact>();
    bucket.set(key, { key, value, updatedAt: new Date().toISOString() });
    this.memoriesByVisitor.set(visitorId, bucket);
  }
  async deleteVisitorMemory(visitorId: string, key: string) { this.memoriesByVisitor.get(visitorId)?.delete(key); }

  async replaceKnowledgeChunks(installationId: string, chunks: Array<{ id: string; pageUrl: string; pageTitle: string; chunkText: string; embedding: number[] }>) {
    const now = new Date().toISOString();
    this.chunksByInstallation.set(installationId, chunks.map((c) => ({ ...c, installationId, createdAt: now })));
  }
  async searchKnowledgeChunks(installationId: string, queryEmbedding: number[], topK: number) {
    const chunks = this.chunksByInstallation.get(installationId) ?? [];
    const cosine = (a: number[], b: number[]) => {
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < a.length; i += 1) { dot += a[i]! * b[i]!; normA += a[i]! ** 2; normB += b[i]! ** 2; }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
    };
    return chunks
      .map((chunk) => ({ chunk, score: cosine(chunk.embedding, queryEmbedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ chunk }) => chunk);
  }

  async getUsage(installationId: string): Promise<UsageCounter> {
    const now = new Date();
    const existing = this.usage.get(installationId);
    if (!existing || now.getTime() - new Date(existing.periodStart).getTime() > USAGE_PERIOD_DAYS * MS_PER_DAY) {
      return { installationId, periodStart: now.toISOString(), conversationCount: 0, messageCount: 0 };
    }
    return existing;
  }

  async incrementUsage(installationId: string, isNewConversation = false): Promise<UsageCounter> {
    const now = new Date();
    const existing = this.usage.get(installationId);
    const stale = !existing || now.getTime() - new Date(existing.periodStart).getTime() > USAGE_PERIOD_DAYS * MS_PER_DAY;
    const next: UsageCounter = stale
      ? { installationId, periodStart: now.toISOString(), conversationCount: isNewConversation ? 1 : 0, messageCount: 1 }
      : {
          ...existing,
          conversationCount: (existing.conversationCount ?? 0) + (isNewConversation ? 1 : 0),
          messageCount: existing.messageCount + 1,
        };
    this.usage.set(installationId, next);
    return next;
  }

  async ping() {}
}

/** Drizzle-backed store for durable local and self-hosted Cradle deployments. */
export class PostgresStore implements CradleStore {
  constructor(private readonly database: CradleDatabase) {}

  async getInstallation(id: string): Promise<Installation | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return null;
    const row = await this.database.query.installations.findFirst({ where: eq(installations.id, id) });
    if (!row) return null;


    return {
      id: row.id,
      ownerId: row.ownerId,
      origin: row.origin,
      name: row.name,
      instructions: row.instructions,
      knowledgeVersion: row.knowledgeVersion,
      runtime: "cradle",
      ...(row.character ? { character: row.character } : {}),
      ...(row.brandProfile ? { brandProfile: row.brandProfile } : {}),
    };
  }

  async listInstallationsByOwner(ownerId: string): Promise<(Installation & { updatedAt?: string })[]> {

    const rows = await this.database.query.installations.findMany({ where: eq(installations.ownerId, ownerId), orderBy: [desc(installations.updatedAt)] });
    return rows.map((row) => ({
      id: row.id,
      ownerId: row.ownerId,
      origin: row.origin,
      name: row.name,
      instructions: row.instructions,
      knowledgeVersion: row.knowledgeVersion,
      runtime: "cradle",
      updatedAt: row.updatedAt ? row.updatedAt.toISOString() : undefined,
      ...(row.character ? { character: row.character } : {}),
      ...(row.brandProfile ? { brandProfile: row.brandProfile } : {}),
    }));
  }


  async saveInstallation(installation: Installation): Promise<void> {
    await this.database.insert(installations).values({
      ...installation,
      character: installation.character ?? null,
      brandProfile: installation.brandProfile ?? null,
    }).onConflictDoUpdate({
      target: installations.id,
      set: {
        ownerId: installation.ownerId,
        origin: installation.origin,
        name: installation.name,
        instructions: installation.instructions,
        knowledgeVersion: installation.knowledgeVersion,
        runtime: "cradle",
        character: installation.character ?? null,
        brandProfile: installation.brandProfile ?? null,
        updatedAt: new Date(),
      },
    });
  }

  async deleteInstallation(id: string, ownerId: string): Promise<boolean> {
    const result = await this.database.delete(installations)
      .where(sql`${installations.id} = ${id} AND ${installations.ownerId} = ${ownerId}`);
    return (result.rowCount ?? 0) > 0;
  }

  /** Cheap connectivity probe used by the health-check route. */
  async ping(): Promise<void> {
    await this.database.execute(sql`select 1`);
  }

  async getKnowledge(installationId: string): Promise<KnowledgeSnapshot | null> {
    const row = await this.database.query.knowledgeSnapshots.findFirst({
      where: eq(knowledgeSnapshots.installationId, installationId),
      orderBy: [desc(knowledgeSnapshots.version)],
    });
    if (!row) return null;

    return {
      id: row.id,
      installationId: row.installationId,
      version: row.version,
      sourceUrl: row.sourceUrl,
      pages: row.pages,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async saveKnowledge(snapshot: KnowledgeSnapshot): Promise<void> {
    await this.database.insert(knowledgeSnapshots).values({
      id: snapshot.id,
      installationId: snapshot.installationId,
      version: snapshot.version,
      sourceUrl: snapshot.sourceUrl,
      pages: snapshot.pages,
      createdAt: new Date(snapshot.createdAt),
    }).onConflictDoUpdate({
      target: [knowledgeSnapshots.installationId, knowledgeSnapshots.version],
      set: {
        id: snapshot.id,
        sourceUrl: snapshot.sourceUrl,
        pages: snapshot.pages,
        createdAt: new Date(snapshot.createdAt),
      },
    });
  }

  async getCompanionPackage(installationId: string): Promise<CompanionPackage | null> {
    const row = await this.database.query.companionPackages.findFirst({ where: eq(companionPackages.installationId, installationId) });
    if (!row) return null;
    return {
      id: row.id,
      installationId: row.installationId,
      provider: row.provider,
      slug: row.slug,
      displayName: row.displayName,
      ...(row.description ? { description: row.description } : {}),
      kind: row.kind,
      submittedBy: row.submittedBy,
      sourceUrl: row.sourceUrl,
      petJsonUrl: row.petJsonUrl,
      objectKey: row.objectKey,
      checksum: row.checksum,
      contentType: row.contentType,
      columns: row.columns as 8,
      rows: row.rows as 9 | 11,
      cellWidth: row.cellWidth as 192,
      cellHeight: row.cellHeight as 208,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async saveCompanionPackage(companion: CompanionPackage): Promise<void> {
    await this.database.insert(companionPackages).values({ ...companion, description: companion.description ?? "", createdAt: new Date(companion.createdAt) }).onConflictDoUpdate({
      target: companionPackages.installationId,
      set: { provider: companion.provider, slug: companion.slug, displayName: companion.displayName, description: companion.description ?? "", kind: companion.kind, submittedBy: companion.submittedBy, sourceUrl: companion.sourceUrl, petJsonUrl: companion.petJsonUrl, objectKey: companion.objectKey, checksum: companion.checksum, contentType: companion.contentType, columns: companion.columns, rows: companion.rows, cellWidth: companion.cellWidth, cellHeight: companion.cellHeight, createdAt: new Date(companion.createdAt) },
    });
  }

  async touchVisitor(installationId: string, visitorId: string): Promise<Visitor> {
    const now = new Date();
    const rows = await this.database.insert(visitors)
      .values({ id: visitorId, installationId, createdAt: now, lastSeenAt: now })
      .onConflictDoUpdate({ target: visitors.id, set: { lastSeenAt: now } })
      .returning();
    const row = rows[0]!;
    return { id: row.id, installationId: row.installationId, createdAt: row.createdAt.toISOString(), lastSeenAt: row.lastSeenAt.toISOString() };
  }

  async getConversation(visitorId: string): Promise<ConversationRecord | null> {
    const row = await this.database.query.conversations.findFirst({ where: eq(conversations.visitorId, visitorId), orderBy: [desc(conversations.updatedAt)] });
    if (!row) return null;
    return { id: row.id, installationId: row.installationId, visitorId: row.visitorId, messages: row.messages as unknown[], createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
  }

  async saveConversation(record: ConversationRecord): Promise<void> {
    await this.database.insert(conversations).values({
      id: record.id, installationId: record.installationId, visitorId: record.visitorId,
      messages: record.messages, createdAt: new Date(record.createdAt), updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: conversations.id,
      set: { messages: record.messages, updatedAt: new Date() },
    });
  }

  async getVisitorMemories(visitorId: string): Promise<VisitorMemoryFact[]> {
    const rows = await this.database.query.visitorMemories.findMany({ where: eq(visitorMemories.visitorId, visitorId) });
    return rows.map((row) => ({ key: row.key, value: row.value, updatedAt: row.updatedAt.toISOString() }));
  }

  async setVisitorMemory(visitorId: string, key: string, value: string): Promise<void> {
    await this.database.insert(visitorMemories).values({ visitorId, key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: [visitorMemories.visitorId, visitorMemories.key], set: { value, updatedAt: new Date() } });
  }

  async deleteVisitorMemory(visitorId: string, key: string): Promise<void> {
    await this.database.delete(visitorMemories).where(and(eq(visitorMemories.visitorId, visitorId), eq(visitorMemories.key, key)));
  }

  private vectorDimEnsured = 0;

  private async ensureVectorDimension(dim: number) {
    if (this.vectorDimEnsured === dim) return;
    try {
      await this.database.execute(sql`ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE vector(${sql.raw(String(dim))});`);
      this.vectorDimEnsured = dim;
    } catch (err) {
      console.warn(`[PostgresStore] Could not alter vector dimension to ${dim}:`, err);
    }
  }

  async replaceKnowledgeChunks(installationId: string, chunks: Array<{ id: string; pageUrl: string; pageTitle: string; chunkText: string; embedding: number[] }>): Promise<void> {
    if (chunks.length > 0 && chunks[0]?.embedding) {
      await this.ensureVectorDimension(chunks[0].embedding.length);
    }
    await this.database.transaction(async (tx) => {
      await tx.delete(knowledgeChunks).where(eq(knowledgeChunks.installationId, installationId));
      if (chunks.length === 0) return;
      await tx.insert(knowledgeChunks).values(chunks.map((c) => ({
        id: c.id, installationId, pageUrl: c.pageUrl, pageTitle: c.pageTitle, chunkText: c.chunkText, embedding: c.embedding, createdAt: new Date(),
      })));
    });
  }

  async searchKnowledgeChunks(installationId: string, queryEmbedding: number[], topK: number): Promise<KnowledgeChunk[]> {
    const similarity = sql<number>`1 - (${cosineDistance(knowledgeChunks.embedding, queryEmbedding)})`;
    const rows = await this.database.select({
      id: knowledgeChunks.id, installationId: knowledgeChunks.installationId, pageUrl: knowledgeChunks.pageUrl,
      pageTitle: knowledgeChunks.pageTitle, chunkText: knowledgeChunks.chunkText, createdAt: knowledgeChunks.createdAt,
    })
      .from(knowledgeChunks)
      .where(eq(knowledgeChunks.installationId, installationId))
      .orderBy(desc(similarity))
      .limit(topK);
    return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
  }

  private conversationColumnEnsured = false;

  private async ensureConversationCountColumn() {
    if (this.conversationColumnEnsured) return;
    try {
      await this.database.execute(sql`ALTER TABLE usage_counters ADD COLUMN IF NOT EXISTS conversation_count INTEGER DEFAULT 0 NOT NULL;`);
      this.conversationColumnEnsured = true;
    } catch (err) {
      console.warn("[PostgresStore] Could not auto-add conversation_count column:", err);
    }
  }

  async getUsage(installationId: string): Promise<UsageCounter> {
    await this.ensureConversationCountColumn();
    try {
      const existing = await this.database.query.usageCounters.findFirst({ where: eq(usageCounters.installationId, installationId) });
      const now = new Date();
      if (!existing || now.getTime() - existing.periodStart.getTime() > USAGE_PERIOD_DAYS * MS_PER_DAY) {
        return { installationId, periodStart: now.toISOString(), conversationCount: 0, messageCount: 0 };
      }
      return {
        installationId,
        periodStart: existing.periodStart.toISOString(),
        conversationCount: existing.conversationCount ?? 0,
        messageCount: existing.messageCount ?? 0,
      };
    } catch (err) {
      console.warn("[PostgresStore] getUsage error fallback:", err);
      return { installationId, periodStart: new Date().toISOString(), conversationCount: 0, messageCount: 0 };
    }
  }

  async incrementUsage(installationId: string, isNewConversation = false): Promise<UsageCounter> {
    await this.ensureConversationCountColumn();
    try {
      return await this.database.transaction(async (tx) => {
        const existing = await tx.query.usageCounters.findFirst({ where: eq(usageCounters.installationId, installationId) });
        const now = new Date();
        const stale = !existing || now.getTime() - existing.periodStart.getTime() > USAGE_PERIOD_DAYS * MS_PER_DAY;

        if (!existing) {
          const [row] = await tx.insert(usageCounters).values({
            installationId,
            periodStart: now,
            conversationCount: isNewConversation ? 1 : 0,
            messageCount: 1,
          }).returning();
          return {
            installationId,
            periodStart: row!.periodStart.toISOString(),
            conversationCount: row!.conversationCount ?? (isNewConversation ? 1 : 0),
            messageCount: row!.messageCount ?? 1,
          };
        }
        if (stale) {
          const [row] = await tx.update(usageCounters).set({
            periodStart: now,
            conversationCount: isNewConversation ? 1 : 0,
            messageCount: 1,
          }).where(eq(usageCounters.installationId, installationId)).returning();
          return {
            installationId,
            periodStart: row!.periodStart.toISOString(),
            conversationCount: row!.conversationCount ?? (isNewConversation ? 1 : 0),
            messageCount: row!.messageCount ?? 1,
          };
        }
        const [row] = await tx.update(usageCounters).set({
          conversationCount: (existing.conversationCount ?? 0) + (isNewConversation ? 1 : 0),
          messageCount: existing.messageCount + 1,
        }).where(eq(usageCounters.installationId, installationId)).returning();
        return {
          installationId,
          periodStart: row!.periodStart.toISOString(),
          conversationCount: row!.conversationCount ?? 0,
          messageCount: row!.messageCount ?? 0,
        };
      });
    } catch (err) {
      console.warn("[PostgresStore] incrementUsage error fallback:", err);
      return { installationId, periodStart: new Date().toISOString(), conversationCount: 1, messageCount: 1 };
    }
  }
}

/** Builds the configured durable store, defaulting to ephemeral memory only for local exploration. */
export function createCradleStore(databaseUrl = process.env.DATABASE_URL): CradleStore {
  if (!databaseUrl) return new MemoryStore();

  const pool = new Pool({ connectionString: databaseUrl, max: 10 });
  return new PostgresStore(drizzle(pool, { schema }));
}
