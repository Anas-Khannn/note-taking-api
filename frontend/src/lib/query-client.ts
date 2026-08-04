import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Never retry requests rejected for invalid/expired credentials.
        if (error instanceof ApiError && error.status === 401) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
