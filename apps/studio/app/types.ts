export const ROOT_CRADLE_SITE_ID = "819f999b-fa84-4b53-81d9-b08fc707b315";

export const STATE_ROWS = {
  idle: 0,
  "running-right": 1,
  "running-left": 2,
  waving: 3,
  jumping: 4,
  failed: 5,
  waiting: 6,
  running: 7,
  review: 8,
} as const;

export const STATE_ORDER = Object.keys(STATE_ROWS) as PetdexState[];
export type PetdexState = keyof typeof STATE_ROWS;

export type Page = { url: string; title: string; markdown: string };

export type Character = {
  displayName: string;
  greeting?: string;
  theme?: "neobrutalist" | "modern" | "cyberpunk" | "terminal" | "minimal" | "synthwave" | "paper";
};

export type Installation = { id: string; name: string };

export type OwnedInstallation = {
  id: string;
  name: string;
  origin: string;
  knowledgeVersion?: number;
  updatedAt?: string;
  companionSlug?: string;
  character?: Character | null;
};

export type Knowledge = { pages: Page[]; sourceUrl: string; version: number };

export type BrandProfile = {
  name: string;
  colors: Array<{ hex: string; usage?: string }>;
  logos: Array<{ url: string; alt?: string }>;
  backdrops: Array<{ url: string; description?: string }>;
  source: "openbrand" | "manual";
};

export type StudioSession = {
  installation: Installation;
  knowledge: Knowledge;
  character: Character;
  brandProfile: BrandProfile | null;
};

export interface UIMessagePart {
  type: string;
  text?: string;
  [key: string]: unknown;
}

export interface UIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: UIMessagePart[];
}

export interface ConversationRecord {
  id: string;
  installationId: string;
  visitorId: string;
  messages: UIMessage[];
  createdAt: string;
  updatedAt: string;
}

export type CatalogCompanion = {
  slug: string;
  displayName: string;
  description: string;
  kind: "character" | "creature" | "object";
  submittedBy: string;
  spritesheetUrl: string;
  petJsonUrl: string;
};

export type ImportedCompanion = CatalogCompanion & {
  id: string;
  installationId: string;
  provider: "petdex";
  sourceUrl: string;
  objectKey: string;
  checksum: string;
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
};

export type HealthPayload = { ok: boolean; services: Record<string, { ok: boolean }> };

export type Screen = "connect" | "review" | "shape" | "live";
export type PreviewState = PetdexState;
export type KindFilter = "all" | "character" | "creature" | "object";
