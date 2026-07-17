import type { ChatEvent, Installation, KnowledgeSnapshot } from "@cradle/core";

/**
 * Storage contract for Cradle. The in-memory implementation lets a fresh
 * self-hosted deployment run immediately; production adapters implement it
 * with Postgres and object storage without changing the runtime API.
 */
export interface CradleStore {
  getInstallation(id: string): Promise<Installation | null>;
  saveInstallation(installation: Installation): Promise<void>;
  getKnowledge(installationId: string): Promise<KnowledgeSnapshot | null>;
  saveKnowledge(snapshot: KnowledgeSnapshot): Promise<void>;
  appendEvent(event: ChatEvent): Promise<void>;
  listMessages(conversationId: string): Promise<Array<{ role: "user" | "assistant"; content: string }>>;
}

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
    return this.events.filter((event) => event.conversationId === conversationId && event.type === "message.created")
      .map((event) => ({ role: event.payload.role === "assistant" ? "assistant" as const : "user" as const, content: String(event.payload.content ?? "") }));
  }
}
