import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { BrandIdentity } from "@cradle/core";

export type AssetState = "canonical" | "idle" | "welcome" | "listening" | "thinking" | "resolved" | "away";
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
  get(key: string): Promise<Uint8Array>;
  getPublicUrl(key: string): string;
  getReviewUrl(key: string, expiresInSeconds: number): Promise<string>;
}

export interface S3AssetStoreConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
}

/** S3-protocol asset store for managed deployments, MinIO, and Cloudflare R2. */
export class S3AssetStore implements AssetStore {
  private readonly client: S3Client;
  constructor(private readonly config: S3AssetStoreConfig) {
    this.client = new S3Client({ region: config.region, endpoint: config.endpoint, forcePathStyle: Boolean(config.endpoint), credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } });
  }
  async put(input: { key: string; body: Uint8Array; contentType: CharacterAsset["contentType"]; visibility: AssetVisibility }) {
    const checksum = createHash("sha256").update(input.body).digest("hex");
    await this.client.send(new PutObjectCommand({ Bucket: this.config.bucket, Key: input.key, Body: input.body, ContentType: input.contentType, CacheControl: input.visibility === "published" ? "public, max-age=31536000, immutable" : "private, no-store", Metadata: { checksum } }));
    return { key: input.key, checksum };
  }
  async get(key: string) {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: key }));
    if (!response.Body) throw new Error("Asset object has no body.");
    return new Uint8Array(await response.Body.transformToByteArray());
  }
  getPublicUrl(key: string) {
    if (!this.config.publicBaseUrl) throw new Error("S3 publicBaseUrl is required for public asset URLs.");
    return `${this.config.publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }
  getReviewUrl(key: string, expiresInSeconds: number) { return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.config.bucket, Key: key }), { expiresIn: expiresInSeconds }); }
}

/** Resolves the configured self-hosted filesystem or managed S3-compatible asset store. */
export function createAssetStoreFromEnv(environment: NodeJS.ProcessEnv = process.env): AssetStore {
  if (environment.CRADLE_ASSET_STORAGE !== "s3") {
    return new FilesystemAssetStore(environment.CRADLE_ASSET_DIRECTORY ?? "/app/data/assets", environment.CRADLE_ASSET_PUBLIC_BASE_URL ?? "/api/assets");
  }
  const bucket = environment.CRADLE_ASSET_BUCKET;
  const region = environment.CRADLE_ASSET_REGION;
  const accessKeyId = environment.CRADLE_ASSET_ACCESS_KEY_ID;
  const secretAccessKey = environment.CRADLE_ASSET_SECRET_ACCESS_KEY;
  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("S3 asset storage requires CRADLE_ASSET_BUCKET, CRADLE_ASSET_REGION, CRADLE_ASSET_ACCESS_KEY_ID, and CRADLE_ASSET_SECRET_ACCESS_KEY.");
  }
  return new S3AssetStore({ bucket, region, endpoint: environment.CRADLE_ASSET_ENDPOINT, accessKeyId, secretAccessKey, publicBaseUrl: environment.CRADLE_ASSET_PUBLIC_BASE_URL });
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
  async get(key: string) {
    const destination = resolve(this.rootDirectory, key);
    const relativePath = relative(resolve(this.rootDirectory), destination);
    if (relativePath.startsWith("..") || isAbsolute(relativePath)) throw new Error("Asset key escapes the configured storage directory.");
    return new Uint8Array(await readFile(destination));
  }
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
