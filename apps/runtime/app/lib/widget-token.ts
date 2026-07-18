import { createHmac, timingSafeEqual } from "node:crypto";

type Claims = { installationId: string; origin: string; exp: number };
const secret = () => { const value = process.env.CRADLE_WIDGET_TOKEN_SECRET; if (value) return value; if (process.env.NODE_ENV === "production") throw new Error("CRADLE_WIDGET_TOKEN_SECRET is required in production."); return "development-only-widget-secret"; };
const encode = (value: string) => Buffer.from(value).toString("base64url");
const decode = (value: string) => Buffer.from(value, "base64url").toString();
export function issueWidgetToken(installationId: string, origin: string) { const payload = encode(JSON.stringify({ installationId, origin, exp: Date.now() + 300_000 } satisfies Claims)); return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`; }
export function verifyWidgetToken(token: string, installationId: string, origin: string) { const [payload, signature] = token.split("."); if (!payload || !signature) return false; const expected = createHmac("sha256", secret()).update(payload).digest("base64url"); if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return false; try { const claims = JSON.parse(decode(payload)) as Claims; return claims.installationId === installationId && claims.origin === origin && claims.exp > Date.now(); } catch { return false; } }
