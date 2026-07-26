"use client";

import { createAuthClient } from "better-auth/react";

/** Browser client for Studio's same-origin, HttpOnly Better Auth session. */
export const authClient = createAuthClient();
