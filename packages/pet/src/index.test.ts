import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import {
  CODEX_PET_CELL_HEIGHT,
  CODEX_PET_CELL_WIDTH,
  CODEX_PET_SHEET_HEIGHT,
  CODEX_PET_SHEET_WIDTH,
  codexPetStates,
  composePetAtlas,
  validatePetRow,
} from "./index.js";

async function row() {
  return new Uint8Array(await sharp({ create: { width: CODEX_PET_SHEET_WIDTH, height: CODEX_PET_CELL_HEIGHT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(Array.from({ length: 8 }, (_, index) => ({ input: { create: { width: 80, height: 80, channels: 4, background: { r: 255, g: 120, b: 80, alpha: 1 } } }, left: index * CODEX_PET_CELL_WIDTH + 56, top: 64 })))
    .png()
    .toBuffer());
}

test("composes a transparent Codex-compatible atlas", async () => {
  const source = await row();
  const rows = Object.fromEntries(codexPetStates.map((state) => [state, source])) as Record<(typeof codexPetStates)[number], Uint8Array>;
  const atlas = await composePetAtlas(rows);
  const metadata = await sharp(atlas).metadata();
  assert.equal(metadata.width, CODEX_PET_SHEET_WIDTH);
  assert.equal(metadata.height, CODEX_PET_SHEET_HEIGHT);
  assert.equal(metadata.hasAlpha, true);
});

test("rejects an empty animation frame", async () => {
  const empty = new Uint8Array(await sharp({ create: { width: CODEX_PET_SHEET_WIDTH, height: CODEX_PET_CELL_HEIGHT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer());
  await assert.rejects(validatePetRow("idle", empty));
});
