import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!databaseUrl || !secret || !baseURL) {
  throw new Error("Studio requires DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL.");
}

/** Studio account configuration shared by every Cradle deployment. */
export const auth = betterAuth({
  appName: "Cradle",
  baseURL,
  secret,
  database: new Pool({ connectionString: databaseUrl }),
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()],
});
