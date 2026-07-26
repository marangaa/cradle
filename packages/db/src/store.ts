import type { CompanionPackage, Installation, KnowledgeSnapshot } from "@cradle/core";
import { desc, eq, sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { companionPackages, installations, knowledgeSnapshots } from "#schema";

const schema = { installations, knowledgeSnapshots, companionPackages };
type CradleDatabase = NodePgDatabase<typeof schema>;

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
  /** Cheap connectivity probe used by the health-check route — throws if the store is unreachable. */
  ping(): Promise<void>;
}

/** Lightweight development store used only when a database is deliberately not configured. */
export class MemoryStore implements CradleStore {
  private readonly installations = new Map<string, Installation>();
  private readonly knowledge = new Map<string, KnowledgeSnapshot>();
  private readonly companions = new Map<string, CompanionPackage>();

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
  async ping() {}
}

/** Drizzle-backed store for durable local and self-hosted Cradle deployments. */
export class PostgresStore implements CradleStore {
  constructor(private readonly database: CradleDatabase) {}

  async getInstallation(id: string): Promise<Installation | null> {
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
      rows: row.rows,
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
}

/** Builds the configured durable store, defaulting to ephemeral memory only for local exploration. */
export function createCradleStore(databaseUrl = process.env.DATABASE_URL): CradleStore {
  if (!databaseUrl) return new MemoryStore();

  const pool = new Pool({ connectionString: databaseUrl, max: 10 });
  return new PostgresStore(drizzle(pool, { schema }));
}
