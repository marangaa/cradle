/**
 * Pure label matching for the spotlight (no DOM, unit-tested). The widget finds the element a
 * guide step points at by what a person can SEE: its visible text / accessible name, never by a
 * CSS selector the model could not know.
 */

export type LabelCandidate = {
  /** Accessible name: aria-label, label text, visible text, placeholder, title, ... */
  name: string;
  /** Normalized role bucket: button | link | input | tab | checkbox | menuitem | heading | other */
  role: string;
};

export function normalizeLabel(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .replace(/[​-‍﻿]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Returns the index of the best candidate or -1. Exact match beats prefix beats substring;
 * ties go to the shorter (more specific) name, then to the earlier element in the page.
 * Substring matching needs at least 3 characters so "ok" never matches half the page.
 */
export function bestLabelMatch(
  candidates: readonly LabelCandidate[],
  label: string,
  roleHint?: string,
): number {
  const wanted = normalizeLabel(label);
  if (!wanted) return -1;
  const useRole = !!roleHint && roleHint !== "any";

  let bestIndex = -1;
  let bestScore = 0;
  let bestLength = Number.POSITIVE_INFINITY;

  candidates.forEach((candidate, index) => {
    if (useRole && candidate.role !== roleHint) return;
    const name = normalizeLabel(candidate.name);
    if (!name) return;
    let score = 0;
    if (name === wanted) score = 3;
    else if (wanted.length >= 3 && name.startsWith(wanted)) score = 2;
    else if (wanted.length >= 3 && name.includes(wanted)) score = 1;
    else if (name.length >= 3 && wanted.includes(name) && name.length >= wanted.length * 0.6) score = 1;
    if (score === 0) return;
    if (score > bestScore || (score === bestScore && name.length < bestLength)) {
      bestScore = score;
      bestLength = name.length;
      bestIndex = index;
    }
  });

  return bestIndex;
}
