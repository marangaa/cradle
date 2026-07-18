import sharp from "sharp";

export const CODEX_PET_COLUMNS = 8;
export const CODEX_PET_ROWS = 9;
export const CODEX_PET_CELL_WIDTH = 192;
export const CODEX_PET_CELL_HEIGHT = 208;
export const CODEX_PET_SHEET_WIDTH = CODEX_PET_COLUMNS * CODEX_PET_CELL_WIDTH;
export const CODEX_PET_SHEET_HEIGHT = CODEX_PET_ROWS * CODEX_PET_CELL_HEIGHT;
export const PET_LAYOUT_WIDTH = 1536;
export const PET_LAYOUT_HEIGHT = 1024;
export const PET_LAYOUT_TOP = Math.floor((PET_LAYOUT_HEIGHT - CODEX_PET_CELL_HEIGHT) / 2);
export const PET_CHROMA_KEY = { red: 255, green: 0, blue: 255 } as const;

export const codexPetStates = [
  "idle",
  "running-right",
  "running-left",
  "waving",
  "jumping",
  "failed",
  "waiting",
  "running",
  "review",
] as const;

export type CodexPetState = (typeof codexPetStates)[number];

/** Rejects an upstream spritesheet that cannot be rendered by Cradle's runtime contract. */
export async function validatePetAtlas(source: Uint8Array): Promise<void> {
  const metadata = await sharp(source).metadata();
  if (metadata.width !== CODEX_PET_SHEET_WIDTH || metadata.height !== CODEX_PET_SHEET_HEIGHT) {
    throw new Error(`Pet spritesheet must be ${CODEX_PET_SHEET_WIDTH}x${CODEX_PET_SHEET_HEIGHT}; received ${metadata.width ?? "unknown"}x${metadata.height ?? "unknown"}.`);
  }
}

export const codexPetStateMetadata: Record<
  CodexPetState,
  { row: number; frames: number; durationMs: number }
> = {
  idle: { row: 0, frames: 6, durationMs: 1_100 },
  "running-right": { row: 1, frames: 8, durationMs: 1_060 },
  "running-left": { row: 2, frames: 8, durationMs: 1_060 },
  waving: { row: 3, frames: 4, durationMs: 700 },
  jumping: { row: 4, frames: 5, durationMs: 840 },
  failed: { row: 5, frames: 8, durationMs: 1_220 },
  waiting: { row: 6, frames: 6, durationMs: 1_010 },
  running: { row: 7, frames: 6, durationMs: 820 },
  review: { row: 8, frames: 6, durationMs: 1_030 },
};

export type WebPetState =
  | "idle"
  | "greeting"
  | "listening"
  | "thinking"
  | "responding"
  | "resolved"
  | "error";

export const webPetStateMap: Record<WebPetState, CodexPetState> = {
  idle: "idle",
  greeting: "waving",
  listening: "review",
  thinking: "running",
  responding: "waving",
  resolved: "jumping",
  error: "failed",
};

/** Creates the invisible construction reference used to anchor one generated animation row. */
export async function createRowLayoutGuide(state: CodexPetState): Promise<Uint8Array> {
  const { frames } = codexPetStateMetadata[state];
  const cells = Array.from({ length: CODEX_PET_COLUMNS }, (_, index) => {
    const opacity = index < frames ? "0.55" : "0.2";
    return `<rect x="${index * CODEX_PET_CELL_WIDTH + 4}" y="${PET_LAYOUT_TOP + 4}" width="${CODEX_PET_CELL_WIDTH - 8}" height="${CODEX_PET_CELL_HEIGHT - 8}" fill="none" stroke="#00ffff" stroke-width="3" opacity="${opacity}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PET_LAYOUT_WIDTH}" height="${PET_LAYOUT_HEIGHT}" viewBox="0 0 ${PET_LAYOUT_WIDTH} ${PET_LAYOUT_HEIGHT}"><rect width="100%" height="100%" fill="#ff00ff"/>${cells}</svg>`;
  return new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer());
}

/** Extracts and keys the guide-aligned animation band from a generated row image. */
export async function extractPetRow(source: Uint8Array): Promise<Uint8Array> {
  const metadata = await sharp(source).metadata();
  if (metadata.width !== PET_LAYOUT_WIDTH || metadata.height !== PET_LAYOUT_HEIGHT) {
    throw new Error(`Generated pet row must be ${PET_LAYOUT_WIDTH}x${PET_LAYOUT_HEIGHT}; received ${metadata.width ?? "unknown"}x${metadata.height ?? "unknown"}.`);
  }
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .extract({ left: 0, top: PET_LAYOUT_TOP, width: CODEX_PET_SHEET_WIDTH, height: CODEX_PET_CELL_HEIGHT })
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += info.channels) {
    const distance = Math.hypot(
      data[index]! - PET_CHROMA_KEY.red,
      data[index + 1]! - PET_CHROMA_KEY.green,
      data[index + 2]! - PET_CHROMA_KEY.blue,
    );
    if (distance <= 18) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
    }
  }

  return new Uint8Array(await sharp(data, { raw: info }).png().toBuffer());
}

/** Removes the flat construction background from canonical art before it becomes a row reference. */
export async function removePetChroma(source: Uint8Array): Promise<Uint8Array> {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let index = 0; index < data.length; index += info.channels) {
    const distance = Math.hypot(
      data[index]! - PET_CHROMA_KEY.red,
      data[index + 1]! - PET_CHROMA_KEY.green,
      data[index + 2]! - PET_CHROMA_KEY.blue,
    );
    if (distance <= 18) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
    }
  }
  return new Uint8Array(await sharp(data, { raw: info }).png().toBuffer());
}

/** Rejects empty frames before an animation row can enter a published atlas. */
export async function validatePetRow(state: CodexPetState, row: Uint8Array): Promise<void> {
  const metadata = await sharp(row).metadata();
  if (metadata.width !== CODEX_PET_SHEET_WIDTH || metadata.height !== CODEX_PET_CELL_HEIGHT || !metadata.hasAlpha) {
    throw new Error(`The ${state} row is not a transparent ${CODEX_PET_SHEET_WIDTH}x${CODEX_PET_CELL_HEIGHT} strip.`);
  }
  const { data, info } = await sharp(row).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { frames } = codexPetStateMetadata[state];
  for (let frame = 0; frame < frames; frame += 1) {
    let opaquePixels = 0;
    const xStart = frame * CODEX_PET_CELL_WIDTH;
    for (let y = 0; y < CODEX_PET_CELL_HEIGHT; y += 1) {
      for (let x = xStart; x < xStart + CODEX_PET_CELL_WIDTH; x += 1) {
        if (data[(y * CODEX_PET_SHEET_WIDTH + x) * info.channels + 3]! > 24) opaquePixels += 1;
      }
    }
    if (opaquePixels < 64) throw new Error(`The ${state} row has an empty frame at position ${frame + 1}.`);
  }
}

/** Composes validated Codex-compatible rows into one transparent WebP spritesheet. */
export async function composePetAtlas(rows: Record<CodexPetState, Uint8Array>): Promise<Uint8Array> {
  await Promise.all(codexPetStates.map((state) => validatePetRow(state, rows[state])));
  const composites = codexPetStates.map((state) => ({ input: Buffer.from(rows[state]), left: 0, top: codexPetStateMetadata[state].row * CODEX_PET_CELL_HEIGHT }));
  return new Uint8Array(await sharp({ create: { width: CODEX_PET_SHEET_WIDTH, height: CODEX_PET_SHEET_HEIGHT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composites)
    .webp({ quality: 90, alphaQuality: 100 })
    .toBuffer());
}

/** Creates a small opaque review image so owners can inspect every generated state together. */
export async function createPetContactSheet(atlas: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await sharp(atlas)
    .flatten({ background: "#fff8ef" })
    .resize({ width: 768 })
    .webp({ quality: 88 })
    .toBuffer());
}
