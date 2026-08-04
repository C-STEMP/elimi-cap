/**
 * lib/query-client.ts
 * Singleton QueryClient with sensible defaults for the CAP platform.
 */

import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      retry: (failureCount, error) => {
        // Never retry on auth/validation errors
        if (error instanceof ApiError) {
          if ([401, 403, 404, 409, 422].includes(error.statusCode)) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
