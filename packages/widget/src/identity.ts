/**
 * Identity the widget presents to a chat backend.
 *
 * - `visitorId`: random id kept in the visitor's localStorage. Anonymous. Always sent.
 * - `user`: optional host-asserted identity. The host's BACKEND signs the user id and renders
 *   `user-id` + `user-hash` (plus optional `user-email`, `user-name`) as attributes. The widget
 *   only forwards them; it cannot verify anything. Backends must verify `user-hash` themselves
 *   (Qualra: HMAC-SHA256 of the user id with a per-workspace secret) and ignore an unverified
 *   `user-id`.
 *
 * Header values are percent-encoded UTF-8 so names and ids outside Latin-1 survive HTTP.
 */

export type HostUser = {
  id: string;
  hash?: string;
  email?: string;
  name?: string;
};

export const HEADER_INSTALLATION = "x-cradle-installation-id";
export const HEADER_VISITOR = "x-cradle-visitor";
/** Sent as well because Cradle 0.1.x backends only read this spelling. */
export const HEADER_VISITOR_LEGACY = "x-cradle-visitor-id";
export const HEADER_USER_ID = "x-cradle-user-id";
export const HEADER_USER_HASH = "x-cradle-user-hash";
export const HEADER_USER_EMAIL = "x-cradle-user-email";
export const HEADER_USER_NAME = "x-cradle-user-name";

export function buildIdentityHeaders(input: {
  siteId: string;
  visitorId: string;
  user?: HostUser | null;
}): Record<string, string> {
  const headers: Record<string, string> = {
    [HEADER_INSTALLATION]: input.siteId,
    [HEADER_VISITOR]: input.visitorId,
    [HEADER_VISITOR_LEGACY]: input.visitorId,
  };
  const user = input.user;
  if (user?.id) {
    headers[HEADER_USER_ID] = encodeURIComponent(user.id);
    if (user.hash) headers[HEADER_USER_HASH] = encodeURIComponent(user.hash);
    if (user.email) headers[HEADER_USER_EMAIL] = encodeURIComponent(user.email);
    if (user.name) headers[HEADER_USER_NAME] = encodeURIComponent(user.name);
  }
  return headers;
}

/** Reads the host user from the element's attributes. No `user-id` means anonymous. */
export function readHostUser(get: (name: string) => string | null): HostUser | null {
  const id = get("user-id")?.trim();
  if (!id) return null;
  const hash = get("user-hash")?.trim();
  const email = get("user-email")?.trim();
  const name = get("user-name")?.trim();
  return {
    id,
    ...(hash ? { hash } : {}),
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
  };
}

/** Fallback shown when the backend's manifest provides no disclosure text. */
export const DEFAULT_DISCLOSURE = "You're chatting with an AI assistant, not a person.";
