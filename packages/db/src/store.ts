import type { AssetRevision, ChatEvent, CompanionPackage, IdentityRevision, Installation, KnowledgeSnapshot } from "@cradle/core";
import { asc, desc, eq } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { assetRevisions, companionPackages, conversationEvents, identityRevisions, installations, knowledgeSnapshots } from "#schema";

const schema = { installations, knowledgeSnapshots, conversationEvents, identityRevisions, assetRevisions, companionPackages };
type CradleDatabase = NodePgDatabase<typeof schema>;

/** Storage contract shared by self-hosted and managed Cradle runtimes. */
export interface CradleStore {
  getInstallation(id: string): Promise<Installation | null>;
  saveInstallation(installation: Installation): Promise<void>;
  getKnowledge(installationId: string): Promise<KnowledgeSnapshot | null>;
  saveKnowledge(snapshot: KnowledgeSnapshot): Promise<void>;
  appendEvent(event: ChatEvent): Promise<void>;
  listMessages(conversationId: string): Promise<Array<{ role: "user" | "assistant"; content: string }>>;
  getLatestIdentityRevision(installationId: string): Promise<IdentityRevision | null>;
  saveIdentityRevision(revision: IdentityRevision): Promise<void>;
  listAssetRevisions(identityRevisionId: string): Promise<AssetRevision[]>;
  getAssetRevision(id: string): Promise<AssetRevision | null>;
  saveAssetRevision(asset: AssetRevision): Promise<void>;
  getCompanionPackage(installationId: string): Promise<CompanionPackage | null>;
  saveCompanionPackage(companion: CompanionPackage): Promise<void>;
}

/** Lightweight development store used only when a database is deliberately not configured. */
export class MemoryStore implements CradleStore {
  private readonly installations = new Map<string, Installation>();
  private readonly knowledge = new Map<string, KnowledgeSnapshot>();
  private readonly events: ChatEvent[] = [];
  private readonly identities = new Map<string, IdentityRevision>();
  private readonly assets = new Map<string, AssetRevision[]>();
  private readonly companions = new Map<string, CompanionPackage>();

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
  async getLatestIdentityRevision(installationId: string) { return this.identities.get(installationId) ?? null; }
  async saveIdentityRevision(revision: IdentityRevision) { this.identities.set(revision.installationId, revision); }
  async listAssetRevisions(identityRevisionId: string) { return this.assets.get(identityRevisionId) ?? []; }
  async getAssetRevision(id: string) { return [...this.assets.values()].flat().find((asset) => asset.id === id) ?? null; }
  async saveAssetRevision(asset: AssetRevision) {
    const assets = this.assets.get(asset.identityRevisionId) ?? [];
    const index = assets.findIndex((item) => item.id === asset.id);
    if (index >= 0) assets[index] = asset; else assets.push(asset);
    this.assets.set(asset.identityRevisionId, assets);
  }
  async getCompanionPackage(installationId: string) { return this.companions.get(installationId) ?? null; }
  async saveCompanionPackage(companion: CompanionPackage) { this.companions.set(companion.installationId, companion); }
}

/** Drizzle-backed store for local Docker, self-hosted, and Cradle Cloud deployments. */
export class PostgresStore implements CradleStore {
  constructor(private readonly database: CradleDatabase) {}

  async getInstallation(id: string): Promise<Installation | null> {
    const row = await this.database.query.installations.findFirst({ where: eq(installations.id, id) });
    if (!row) return null;

    return {
      id: row.id,
      managementKeyHash: row.managementKeyHash,
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
        managementKeyHash: installation.managementKeyHash,
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

  async getLatestIdentityRevision(installationId: string): Promise<IdentityRevision | null> {
    const row = await this.database.query.identityRevisions.findFirst({
      where: eq(identityRevisions.installationId, installationId),
      orderBy: [desc(identityRevisions.version)],
    });
    if (!row) return null;
    return {
      id: row.id,
      installationId: row.installationId,
      version: row.version,
      status: row.status,
      ...(row.identity ? { identity: row.identity } : {}),
      ...(row.selectedDirectionId ? { selectedDirectionId: row.selectedDirectionId } : {}),
      ...(row.error ? { error: row.error } : {}),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async saveIdentityRevision(revision: IdentityRevision): Promise<void> {
    await this.database.insert(identityRevisions).values({
      id: revision.id,
      installationId: revision.installationId,
      version: revision.version,
      status: revision.status,
      identity: revision.identity ?? null,
      selectedDirectionId: revision.selectedDirectionId ?? null,
      error: revision.error ?? null,
      createdAt: new Date(revision.createdAt),
      updatedAt: new Date(revision.updatedAt),
    }).onConflictDoUpdate({
      target: identityRevisions.id,
      set: {
        status: revision.status,
        identity: revision.identity ?? null,
        selectedDirectionId: revision.selectedDirectionId ?? null,
        error: revision.error ?? null,
        updatedAt: new Date(revision.updatedAt),
      },
    });
  }

  async listAssetRevisions(identityRevisionId: string): Promise<AssetRevision[]> {
    const rows = await this.database.query.assetRevisions.findMany({
      where: eq(assetRevisions.identityRevisionId, identityRevisionId),
      orderBy: [asc(assetRevisions.createdAt)],
    });
    return rows.map((row) => ({
      id: row.id,
      installationId: row.installationId,
      identityRevisionId: row.identityRevisionId,
      directionId: row.directionId,
      state: row.state,
      status: row.status,
      objectKey: row.objectKey,
      contentType: row.contentType,
      checksum: row.checksum,
      ...(row.parentAssetId ? { parentAssetId: row.parentAssetId } : {}),
      provider: row.provider,
      model: row.model,
      promptVersion: row.promptVersion,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async getAssetRevision(id: string): Promise<AssetRevision | null> {
    const row = await this.database.query.assetRevisions.findFirst({ where: eq(assetRevisions.id, id) });
    if (!row) return null;
    return {
      id: row.id,
      installationId: row.installationId,
      identityRevisionId: row.identityRevisionId,
      directionId: row.directionId,
      state: row.state,
      status: row.status,
      objectKey: row.objectKey,
      contentType: row.contentType,
      checksum: row.checksum,
      ...(row.parentAssetId ? { parentAssetId: row.parentAssetId } : {}),
      provider: row.provider,
      model: row.model,
      promptVersion: row.promptVersion,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async saveAssetRevision(asset: AssetRevision): Promise<void> {
    await this.database.insert(assetRevisions).values({
      ...asset,
      parentAssetId: asset.parentAssetId ?? null,
      createdAt: new Date(asset.createdAt),
    }).onConflictDoUpdate({
      target: assetRevisions.id,
      set: { status: asset.status },
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
      description: row.description,
      kind: row.kind,
      submittedBy: row.submittedBy,
      sourceUrl: row.sourceUrl,
      petJsonUrl: row.petJsonUrl,
      objectKey: row.objectKey,
      checksum: row.checksum,
      contentType: row.contentType,
      columns: row.columns as 8,
      rows: row.rows,
      cellWidth: row.cellWidth as 192,
      cellHeight: row.cellHeight as 208,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async saveCompanionPackage(companion: CompanionPackage): Promise<void> {
    await this.database.insert(companionPackages).values({ ...companion, createdAt: new Date(companion.createdAt) }).onConflictDoUpdate({
      target: companionPackages.installationId,
      set: { provider: companion.provider, slug: companion.slug, displayName: companion.displayName, description: companion.description, kind: companion.kind, submittedBy: companion.submittedBy, sourceUrl: companion.sourceUrl, petJsonUrl: companion.petJsonUrl, objectKey: companion.objectKey, checksum: companion.checksum, contentType: companion.contentType, columns: companion.columns, rows: companion.rows, cellWidth: companion.cellWidth, cellHeight: companion.cellHeight, createdAt: new Date(companion.createdAt) },
    });
  }
}

/** Builds the configured durable store, defaulting to ephemeral memory only for local exploration. */
export function createCradleStore(databaseUrl = process.env.DATABASE_URL): CradleStore {
  if (!databaseUrl) return new MemoryStore();

  const pool = new Pool({ connectionString: databaseUrl, max: 10 });
  return new PostgresStore(drizzle(pool, { schema }));
}
