import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "#db";
import { installations } from "#schema";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!secret || !baseURL) {
  throw new Error("BETTER_AUTH_SECRET and BETTER_AUTH_URL are required.");
}

export const auth = betterAuth({
  appName: "Cradle",
  baseURL,
  secret,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        // Re-assign all site installations owned by the temporary anonymous user to the new permanent user
        await db
          .update(installations)
          .set({ ownerId: newUser.user.id })
          .where(eq(installations.ownerId, anonymousUser.user.id));
      },
    }),
    nextCookies(),
  ],
});
