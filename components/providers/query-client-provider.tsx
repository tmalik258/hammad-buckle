"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ErrorLogger, ErrorClassifier, UserFeedbackManager } from "@/lib/utils/error-handling";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: unknown) => {
              // Enhanced retry logic with error classification
              if (ErrorClassifier.isAuthenticationError(error)) {
                return false; // Don't retry auth errors
              }
              
              if (ErrorClassifier.isValidationError(error)) {
                return false; // Don't retry validation errors
              }
              
              // Use enhanced retry logic for retryable errors
              if (ErrorClassifier.isRetryableError(error)) {
                ErrorLogger.logRetry(failureCount + 1, 3, error, { operation: 'query-retry' });
                return failureCount < 3;
              }
              
              return false;
            },
            retryDelay: (attemptIndex) => {
              // Enhanced exponential backoff with jitter
              const baseDelay = 1000;
              const maxDelay = 30000;
              const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
              // Add jitter to prevent thundering herd
              const jitter = Math.random() * 0.1 * delay;
              return delay + jitter;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchIntervalInBackground: false,
            networkMode: 'online',
          },
          mutations: {
            retry: (failureCount, error: unknown) => {
              // Enhanced retry logic for mutations
              if (ErrorClassifier.isValidationError(error) || ErrorClassifier.isAuthenticationError(error)) {
                return false; // Don't retry validation or auth errors
              }

              // Don't retry on client errors (4xx) except for specific retryable ones
              if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as { status: number }).status;
                if (status >= 400 && status < 500) {
                  // Only retry on 408 (timeout) and 429 (rate limit)
                  if (status === 408 || status === 429) {
                    ErrorLogger.logRetry(failureCount + 1, 2, error, { operation: 'mutation-retry' });
                    return failureCount < 2;
                  }
                  return false;
                }
              }

              // Retry server errors (5xx)
              if (ErrorClassifier.isRetryableError(error)) {
                ErrorLogger.logRetry(failureCount + 1, 2, error, { operation: 'mutation-retry' });
                return failureCount < 2;
              }

              return false;
            },
            retryDelay: (attemptIndex) => {
              // Enhanced exponential backoff for mutations
              const baseDelay = 1000;
              const maxDelay = 10000;
              const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
              // Add jitter to prevent thundering herd
              const jitter = Math.random() * 0.1 * delay;
              return delay + jitter;
            },
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}