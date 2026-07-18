import { createHash } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import type { BrandIdentity } from "@cradle/core";

export type AssetState = "idle" | "welcome" | "listening" | "thinking" | "resolved" | "away";
export type AssetVisibility = "private" | "published";

/** Immutable metadata for an approved generated or uploaded character asset. */
export interface CharacterAsset {
  id: string;
  installationId: string;
  revision: number;
  state: AssetState;
  objectKey: string;
  contentType: "image/png" | "image/webp";
  checksum: string;
  width: number;
  height: number;
  visibility: AssetVisibility;
  parentAssetId?: string;
  provider?: string;
  model?: string;
  promptVersion?: string;
  createdAt: string;
}

export interface AssetStore {
  put(input: { key: string; body: Uint8Array; contentType: CharacterAsset["contentType"]; visibility: AssetVisibility }): Promise<{ key: string; checksum: string }>;
  getPublicUrl(key: string): string;
  getReviewUrl(key: string, expiresInSeconds: number): Promise<string>;
}

/** Immutable local-volume store for Docker and self-hosted Cradle deployments. */
export class FilesystemAssetStore implements AssetStore {
  constructor(private readonly rootDirectory: string, private readonly publicBaseUrl: string) {}

  async put(input: { key: string; body: Uint8Array; contentType: CharacterAsset["contentType"]; visibility: AssetVisibility }) {
    const destination = resolve(this.rootDirectory, input.key);
    const root = resolve(this.rootDirectory);
    const relativePath = relative(root, destination);
    if (relativePath.startsWith("..") || isAbsolute(relativePath)) throw new Error("Asset key escapes the configured storage directory.");
    await mkdir(dirname(destination), { recursive: true });
    const temporary = `${destination}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporary, input.body, { flag: "wx" });
    await rename(temporary, destination);
    return { key: input.key, checksum: createHash("sha256").update(input.body).digest("hex") };
  }

  getPublicUrl(key: string) { return `${this.publicBaseUrl.replace(/\/$/, "")}/${key}`; }
  async getReviewUrl(key: string) { return this.getPublicUrl(key); }
}

/** Async work contract: generation never blocks a request/response lifecycle. */
export interface CharacterJob {
  id: string;
  installationId: string;
  revision: number;
  type: "concept" | "state-pack" | "quality-check";
  status: "queued" | "running" | "failed" | "succeeded";
  input: { identity: BrandIdentity; directionId: string; canonicalAssetId?: string; states?: AssetState[] };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterJobQueue {
  enqueue(job: Omit<CharacterJob, "id" | "status" | "createdAt" | "updatedAt">): Promise<CharacterJob>;
}
