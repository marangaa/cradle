"use server";

import { auth } from "@cradle/db";
import { headers } from "next/headers";

type RuntimeError = { error?: string };

function getRuntimeUrl() {
  return process.env.CRADLE_RUNTIME_URL || "http://localhost:3002";
}

async function studioSessionCookie() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const cookie = requestHeaders.get("cookie");
  if (!session || !cookie) throw new Error("Sign in to Studio first.");
  return cookie;
}

async function runtimeRequest<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const cookie = authenticated ? await studioSessionCookie() : null;
  const response = await fetch(new URL(path, getRuntimeUrl()), {
    ...init,
    cache: "no-store",
    headers: {
      ...init.headers,
      ...(cookie ? { cookie } : {}),
    },
  });
  const payload = await response.json() as T & RuntimeError;
  if (!response.ok) throw new Error(payload.error ?? "Runtime request failed.");
  return payload;
}

export async function getRuntimeHealth() {
  return runtimeRequest<{ ok: boolean; services: Record<string, { ok: boolean }> }>("/api/health", {}, false);
}

export async function listOwnedInstallations() {
  return runtimeRequest<{ installations: Array<{ id: string; name: string; knowledgeVersion: number }> }>("/api/installations");
}

export async function deleteOwnedInstallation(installationId: string) {
  return runtimeRequest<{ ok: boolean; deletedId: string }>(`/api/installations/${installationId}`, {
    method: "DELETE",
  });
}


export async function getPetdexCatalog(params: { page?: number; limit?: number; query?: string; kind?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.query?.trim()) query.set("query", params.query.trim());
  if (params.kind && params.kind !== "all") query.set("kind", params.kind);

  const qs = query.toString();
  const path = `/api/companions/petdex${qs ? `?${qs}` : ""}`;
  return runtimeRequest<{ companions: unknown[]; page: number; limit: number; total: number; hasMore: boolean }>(path);
}

export async function getInstallationForStudio(installationId: string) {
  const [knowledge, companion] = await Promise.all([
    runtimeRequest<unknown>(`/api/installations/${installationId}/knowledge`),
    runtimeRequest<unknown>(`/api/installations/${installationId}/companion`),
  ]);
  return { knowledge, companion };
}

export async function onboardSite(url: string) {
  return runtimeRequest<unknown>("/api/onboarding", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export async function saveInstallationKnowledge(installationId: string, includedUrls: string[]) {
  return runtimeRequest<unknown>(`/api/installations/${installationId}/knowledge`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ includedUrls }),
  });
}

export async function saveInstallationCharacter(installationId: string, character: { displayName: string; greeting: string }) {
  return runtimeRequest<unknown>(`/api/installations/${installationId}/settings`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ character }),
  });
}

export async function selectInstallationCompanion(installationId: string, slug: string) {
  return runtimeRequest<unknown>(`/api/installations/${installationId}/companion`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "petdex", slug }),
  });
}
