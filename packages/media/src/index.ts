import type { Familiar } from "@cradle/core";

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

/** Async work contract: generation never blocks a request/response lifecycle. */
export interface CharacterJob {
  id: string;
  installationId: string;
  revision: number;
  type: "concept" | "state-pack" | "quality-check";
  status: "queued" | "running" | "failed" | "succeeded";
  input: { familiar: Familiar; canonicalAssetId?: string; states?: AssetState[] };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterJobQueue {
  enqueue(job: Omit<CharacterJob, "id" | "status" | "createdAt" | "updatedAt">): Promise<CharacterJob>;
}
