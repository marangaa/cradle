"use client";

import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

/** Browser client for Studio's same-origin, HttpOnly Better Auth session. */
export const authClient = createAuthClient({
  plugins: [anonymousClient()],
});
