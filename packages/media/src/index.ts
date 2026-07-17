import type { Familiar } from "@cradle/core";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHash } from "node:crypto";

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

/** S3-compatible asset storage for AWS S3, Cloudflare R2, and MinIO. */
export class S3AssetStore implements AssetStore {
  private readonly client: S3Client;
  constructor(private readonly config: { bucket: string; endpoint?: string; region: string; accessKeyId: string; secretAccessKey: string; publicBaseUrl: string }) {
    this.client = new S3Client({ region: config.region, endpoint: config.endpoint, forcePathStyle: Boolean(config.endpoint), credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } });
  }
  async put(input: { key: string; body: Uint8Array; contentType: CharacterAsset["contentType"]; visibility: AssetVisibility }) {
    const checksum = createHash("sha256").update(input.body).digest("hex");
    await this.client.send(new PutObjectCommand({ Bucket: this.config.bucket, Key: input.key, Body: input.body, ContentType: input.contentType, CacheControl: input.visibility === "published" ? "public, max-age=31536000, immutable" : "private, no-store", Metadata: { checksum } }));
    return { key: input.key, checksum };
  }
  getPublicUrl(key: string) { return `${this.config.publicBaseUrl.replace(/\/$/, "")}/${key}`; }
  getReviewUrl(key: string, expiresInSeconds: number) { return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.config.bucket, Key: key }), { expiresIn: expiresInSeconds }); }
}
