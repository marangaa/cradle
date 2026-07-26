"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

/**
 * Instantiates a QueryClient per browser session (not a module-level singleton,
 * which would be shared across server requests in SSR).
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't retry on 4xx errors — they're usually auth/config problems, not transient
            retry: (failureCount, error) => {
              if (error instanceof Error && error.message.includes("401")) return false;
              if (error instanceof Error && error.message.includes("403")) return false;
              return failureCount < 2;
            },
            // Treat background refetches as non-urgent so they don't flash loaders
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
