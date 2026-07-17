import type { ChatEvent, Installation, KnowledgeSnapshot } from "@cradle/core";
import { asc, desc, eq } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { conversationEvents, installations, knowledgeSnapshots } from "./schema.js";

const schema = { installations, knowledgeSnapshots, conversationEvents };
type CradleDatabase = NodePgDatabase<typeof schema>;

/** Storage contract shared by self-hosted and managed Cradle runtimes. */
export interface CradleStore {
  getInstallation(id: string): Promise<Installation | null>;
  saveInstallation(installation: Installation): Promise<void>;
  getKnowledge(installationId: string): Promise<KnowledgeSnapshot | null>;
  saveKnowledge(snapshot: KnowledgeSnapshot): Promise<void>;
  appendEvent(event: ChatEvent): Promise<void>;
  listMessages(conversationId: string): Promise<Array<{ role: "user" | "assistant"; content: string }>>;
}

/** Lightweight development store used only when a database is deliberately not configured. */
export class MemoryStore implements CradleStore {
  private readonly installations = new Map<string, Installation>();
  private readonly knowledge = new Map<string, KnowledgeSnapshot>();
  private readonly events: ChatEvent[] = [];

  async getInstallation(id: string) { return this.installations.get(id) ?? null; }
  async saveInstallation(installation: Installation) { this.installations.set(installation.id, installation); }
  async getKnowledge(installationId: string) { return this.knowledge.get(installationId) ?? null; }
  async saveKnowledge(snapshot: KnowledgeSnapshot) { this.knowledge.set(snapshot.installationId, snapshot); }
  async appendEvent(event: ChatEvent) { this.events.push(event); }
  async listMessages(conversationId: string) {
    return this.events
      .filter((event) => event.conversationId === conversationId && event.type === "message.created")
      .map((event) => ({
        role: event.payload.role === "assistant" ? "assistant" as const : "user" as const,
        content: String(event.payload.content ?? ""),
      }));
  }
}

/** Drizzle-backed store for local Docker, self-hosted, and Cradle Cloud deployments. */
export class PostgresStore implements CradleStore {
  constructor(private readonly database: CradleDatabase) {}

  async getInstallation(id: string): Promise<Installation | null> {
    const row = await this.database.query.installations.findFirst({ where: eq(installations.id, id) });
    if (!row) return null;

    return {
      id: row.id,
      publicKey: row.publicKey,
      origin: row.origin,
      name: row.name,
      instructions: row.instructions,
      knowledgeVersion: row.knowledgeVersion,
      runtime: row.runtime,
      ...(row.familiar ? { familiar: row.familiar } : {}),
    };
  }

  async saveInstallation(installation: Installation): Promise<void> {
    await this.database.insert(installations).values({
      ...installation,
      familiar: installation.familiar ?? null,
    }).onConflictDoUpdate({
      target: installations.id,
      set: {
        publicKey: installation.publicKey,
        origin: installation.origin,
        name: installation.name,
        instructions: installation.instructions,
        knowledgeVersion: installation.knowledgeVersion,
        runtime: installation.runtime,
        familiar: installation.familiar ?? null,
        updatedAt: new Date(),
      },
    });
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

  async appendEvent(event: ChatEvent): Promise<void> {
    await this.database.insert(conversationEvents).values({
      ...event,
      occurredAt: new Date(event.occurredAt),
    }).onConflictDoNothing();
  }

  async listMessages(conversationId: string): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
    const rows = await this.database.select({ payload: conversationEvents.payload })
      .from(conversationEvents)
      .where(eq(conversationEvents.conversationId, conversationId))
      .orderBy(asc(conversationEvents.occurredAt));

    return rows
      .filter(({ payload }) => payload.role === "user" || payload.role === "assistant")
      .map(({ payload }) => ({
        role: payload.role === "assistant" ? "assistant" as const : "user" as const,
        content: String(payload.content ?? ""),
      }));
  }
}

/** Builds the configured durable store, defaulting to ephemeral memory only for local exploration. */
export function createCradleStore(databaseUrl = process.env.DATABASE_URL): CradleStore {
  if (!databaseUrl) return new MemoryStore();

  const pool = new Pool({ connectionString: databaseUrl, max: 10 });
  return new PostgresStore(drizzle(pool, { schema }));
}
