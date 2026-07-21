import { petdexCatalogItemSchema, type PetdexCatalogItem } from "@cradle/core";

const manifestUrl = "https://petdex.dev/api/manifest";
const cacheTtlMs = 5 * 60 * 1_000;
let cachedCatalog: { expiresAt: number; items: PetdexCatalogItem[] } | null = null;

/** Fetches every approved Petdex entry from its public manifest. */
export async function listPetdexCatalog(): Promise<PetdexCatalogItem[]> {
  if (cachedCatalog && cachedCatalog.expiresAt > Date.now()) return cachedCatalog.items;
  const response = await fetch(manifestUrl, { signal: AbortSignal.timeout(10_000), next: { revalidate: 300 } });
  if (!response.ok) throw new Error("Petdex catalog is unavailable.");
  const payload = await response.json() as { pets?: unknown[] };
  const items = (payload.pets ?? [])
    .map((pet) => petdexCatalogItemSchema.safeParse(pet))
    .filter((result): result is { success: true; data: PetdexCatalogItem } => result.success)
    .map((result) => result.data)
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
  cachedCatalog = { items, expiresAt: Date.now() + cacheTtlMs };
  return items;
}

/** Gets a curated Petdex companion by its stable upstream slug. */
export async function getPetdexCompanion(slug: string) {
  return (await listPetdexCatalog()).find((pet) => pet.slug === slug) ?? null;
}
