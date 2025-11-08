'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  UserProfile,
  UserProfileResponse,
  UpdateProfileRequest,
  UseUserProfileOptions,
  MutationOptions
} from '../types/user-account';
import {
  enhancedFetch,
  UserFeedbackManager,
  ErrorLogger,
  ErrorClassifier,
  FallbackManager,
  DEFAULT_RETRY_CONFIG
} from '../utils/error-handling';

// Enhanced API functions with comprehensive error handling
async function fetchUserProfile(): Promise<UserProfile> {
  const context = {
    operation: 'fetch-user-profile',
    timestamp: Date.now(),
  };

  try {
    // Use enhanced fetch with retry logic
    const data = await enhancedFetch<UserProfileResponse>(
      '/api/user/profile',
      {
        method: 'GET',
        credentials: 'include',
      },
      {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
        retryableStatuses: [408, 429, 500, 502, 503, 504],
      }
    );

    // Cache successful response for fallback
    FallbackManager.setFallbackData('user-profile', data.user);
    
    return data.user;
  } catch (error) {
    ErrorLogger.logError(error, context);
    
    // Try to use fallback data
    const fallbackData = FallbackManager.getFallbackData<UserProfile>('user-profile');
    if (fallbackData) {
      UserFeedbackManager.showError(error, 'Using cached profile data due to network error.');
      return fallbackData;
    }
    
    throw error;
  }
}

async function updateUserProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
  const context = {
    operation: 'update-user-profile',
    timestamp: Date.now(),
  };

  try {
    // Use enhanced fetch with retry logic for updates
    const data = await enhancedFetch<UserProfileResponse>(
      '/api/user/profile',
      {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(profileData),
      },
      {
        maxAttempts: 2, // Fewer retries for mutations to avoid duplicate updates
        baseDelay: 1000,
        maxDelay: 5000,
        backoffFactor: 2,
        retryableStatuses: [408, 429, 500, 502, 503, 504],
      }
    );

    // Update fallback cache with new data
    FallbackManager.setFallbackData('user-profile', data.user);
    
    return data.user;
  } catch (error) {
    ErrorLogger.logError(error, context);
    throw error;
  }
}

// Enhanced query hooks with comprehensive error handling
export function useUserProfile(options: UseUserProfileOptions = {}) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  const query = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchUserProfile,
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry: (failureCount, error) => {
      // Enhanced retry logic with error classification
      if (ErrorClassifier.isAuthenticationError(error)) {
        UserFeedbackManager.showError(error, 'Please log in to access your profile.');
        return false;
      }
      
      if (ErrorClassifier.isValidationError(error)) {
        return false; // Don't retry validation errors
      }
      
      // Use enhanced retry logic for network errors
      if (ErrorClassifier.isRetryableError(error)) {
        ErrorLogger.logRetry(failureCount + 1, 3, error, { operation: 'fetch-user-profile' });
        return failureCount < 3;
      }
      
      return false;
    },
    retryDelay: (attemptIndex) => {
      // Enhanced exponential backoff with jitter
      const baseDelay = DEFAULT_RETRY_CONFIG.baseDelay;
      const maxDelay = DEFAULT_RETRY_CONFIG.maxDelay;
      const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      return delay + jitter;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000,
    structuralSharing: true,
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
    placeholderData: (previousData): UserProfile | undefined => {
      // Try to use fallback data if no previous data
      if (!previousData) {
        return FallbackManager.getFallbackData<UserProfile>('user-profile') ?? undefined;
      }
      return previousData;
    },
    // Network mode for better offline handling
    networkMode: 'online',
  });

  // Handle errors using React Query's error boundary or useEffect
  React.useEffect(() => {
    if (query.error) {
      const error = query.error;
      const context = {
        operation: 'useUserProfile-query',
        timestamp: Date.now(),
      };
      
      ErrorLogger.logError(error, context);
      
      // Don't show error toast for authentication errors (handled by retry logic)
      if (!ErrorClassifier.isAuthenticationError(error)) {
        // Check if we have fallback data to avoid showing error
        const hasFallback = !!FallbackManager.getFallbackData<UserProfile>('user-profile');
        if (!hasFallback) {
          UserFeedbackManager.showError(error, 'Failed to load your profile. Please try refreshing the page.');
        }
      }
    }
  }, [query.error]);

  return query;
}

// Mutation hooks
export function useUpdateProfile(options: MutationOptions<UserProfile, Error, UpdateProfileRequest> = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    onMutate,
    onSettled,
  } = options;

  return useMutation({
    mutationFn: updateUserProfile,
    onMutate: async (variables) => {
      // Generate unique operation ID for tracking
      const operationId = `profile-update-${Date.now()}`;

      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['user', 'profile'] });

      // Snapshot the previous value for rollback
      const previousProfile = queryClient.getQueryData<UserProfile>(['user', 'profile']);

      // Optimistically update the cache with new values
      if (previousProfile) {
        const optimisticProfile: UserProfile = {
          ...previousProfile,
          ...variables,
          updatedAt: new Date(),
        };

        queryClient.setQueryData<UserProfile>(['user', 'profile'], optimisticProfile);

        // Also update any related cached queries that might depend on user data
        queryClient.setQueriesData(
          { queryKey: ['user'], exact: false },
          (oldData: unknown) => {
            if (oldData && typeof oldData === 'object' && 'user' in oldData) {
              return {
                ...oldData,
                user: optimisticProfile,
              };
            }
            return oldData;
          }
        );
      }

      // Call custom onMutate if provided
      const customContext = onMutate ? await onMutate(variables) : undefined;

      // Return context with operation tracking
      return { 
        previousProfile, 
        customContext, 
        operationId,
        timestamp: Date.now()
      };
    },
    onError: (error, variables, context) => {
      const errorContext = {
        operation: 'update-user-profile-mutation',
        operationId: context?.operationId,
        timestamp: context?.timestamp,
        variables,
      };

      // Rollback optimistic updates on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['user', 'profile'], context.previousProfile);
        
        // Rollback related cached queries
        queryClient.setQueriesData(
          { queryKey: ['user'], exact: false },
          (oldData: unknown) => {
            if (oldData && typeof oldData === 'object' && 'user' in oldData) {
              return {
                ...oldData,
                user: context.previousProfile,
              };
            }
            return oldData;
          }
        );
      }

      // Enhanced error handling with classification
      ErrorLogger.logError(error, errorContext);

      // Handle different types of errors with appropriate user feedback
      if (ErrorClassifier.isValidationError(error)) {
        try {
          // Try to parse API validation errors
          const apiError = JSON.parse(error.message);
          if (apiError.details && Array.isArray(apiError.details)) {
            UserFeedbackManager.showValidationErrors(apiError.details);
          } else {
            UserFeedbackManager.showError(error, 'Please check your input and try again.');
          }
        } catch {
          UserFeedbackManager.showError(error, 'Please check your input and try again.');
        }
      } else if (ErrorClassifier.isAuthenticationError(error)) {
        UserFeedbackManager.showError(error, 'Please log in to update your profile.');
      } else if (ErrorClassifier.isNetworkError(error)) {
        const networkError = error as { status?: number };
        if (networkError.status === 429) {
          UserFeedbackManager.showError(error, 'Too many requests. Please wait a moment and try again.');
        } else if (networkError.status && networkError.status >= 500) {
          // Show retry option for server errors
          UserFeedbackManager.showRetryPrompt(error, () => {
            // Retry the mutation
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
          });
        } else {
          UserFeedbackManager.showError(error, 'Network error. Please check your connection and try again.');
        }
      } else {
        UserFeedbackManager.showError(error, 'Failed to update profile. Please try again.');
      }

      // Call custom onError if provided
      if (onError) {
        onError(error, variables);
      }
    },
    onSuccess: (data, variables, context) => {
      // Update cache with server response (this ensures data consistency)
      queryClient.setQueryData(['user', 'profile'], data);

      // Update related cached queries with fresh data
      queryClient.setQueriesData(
        { queryKey: ['user'], exact: false },
        (oldData: unknown) => {
          if (oldData && typeof oldData === 'object' && 'user' in oldData) {
            return {
              ...oldData,
              user: data,
            };
          }
          return oldData;
        }
      );

      // Show success feedback
      toast.success('Profile updated successfully');

      // Log successful operation
      console.log('Profile updated successfully:', {
        operationId: context?.operationId,
        duration: context?.timestamp ? Date.now() - context.timestamp : 0,
      });

      // Call custom onSuccess if provided
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onSettled: (data, error, variables) => {
      // Invalidate and refetch to ensure data consistency
      // Use a slight delay to prevent immediate refetch after optimistic update
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ['user', 'profile'],
          exact: true,
          refetchType: 'active' // Only refetch active queries
        });

        // Invalidate related user queries for consistency
        queryClient.invalidateQueries({
          queryKey: ['user'],
          exact: false,
          refetchType: 'none' // Don't automatically refetch, just mark as stale
        });
      }, 100);

      // Call custom onSettled if provided
      if (onSettled) {
        onSettled(data, error, variables);
      }
    },
    retry: (failureCount, error) => {
      // Enhanced retry logic with error classification
      if (ErrorClassifier.isValidationError(error) || ErrorClassifier.isAuthenticationError(error)) {
        return false; // Don't retry validation or auth errors
      }

      // Don't retry on client errors (4xx)
      if (error instanceof Error) {
        try {
          const apiError = JSON.parse(error.message);
          if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
            return false;
          }
        } catch {
          // Not a JSON error, continue with retry logic
        }
      }

      // Use enhanced retry logic for retryable errors
      if (ErrorClassifier.isRetryableError(error)) {
        ErrorLogger.logRetry(failureCount + 1, 2, error, { operation: 'update-user-profile' });
        return failureCount < 2;
      }

      return false;
    },
    retryDelay: (attemptIndex) => {
      // Enhanced exponential backoff with jitter for mutations
      const baseDelay = 1000;
      const maxDelay = 10000;
      const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      return delay + jitter;
    },
    // Enhanced mutation settings
    networkMode: 'online', // Only run when online
    gcTime: 5 * 60 * 1000, // Keep mutation in cache for 5 minutes
  });
}

// Utility hooks for common operations
export function useRefreshProfile() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
  };
}

export function usePrefetchProfile() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['user', 'profile'],
      queryFn: fetchUserProfile,
      staleTime: 5 * 60 * 1000,
    });
  };
}

// Hook to get cached profile data without triggering a fetch
export function useCachedProfile(): UserProfile | undefined {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<UserProfile>(['user', 'profile']);
}

// Hook to check if profile data is loading
export function useIsProfileLoading(): boolean {
  const { isLoading, isFetching } = useUserProfile({ enabled: false });
  return isLoading || isFetching;
}

// Hook to clear profile cache (useful for logout)
export function useClearProfileCache() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: ['user', 'profile'] });
  };
}

// Enhanced cache management hooks for optimistic updates

// Hook to perform optimistic profile update without mutation
export function useOptimisticProfileUpdate() {
  const queryClient = useQueryClient();

  return (updates: Partial<UserProfile>) => {
    const currentProfile = queryClient.getQueryData<UserProfile>(['user', 'profile']);
    
    if (currentProfile) {
      const optimisticProfile: UserProfile = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date(),
      };

      queryClient.setQueryData(['user', 'profile'], optimisticProfile);
      
      // Return rollback function
      return () => {
        queryClient.setQueryData(['user', 'profile'], currentProfile);
      };
    }
    
    return () => {}; // No-op rollback if no current profile
  };
}

// Hook to invalidate all user-related queries
export function useInvalidateUserQueries() {
  const queryClient = useQueryClient();

  return (options: { refetch?: boolean } = {}) => {
    const { refetch = true } = options;
    
    queryClient.invalidateQueries({
      queryKey: ['user'],
      exact: false,
      refetchType: refetch ? 'active' : 'none',
    });
  };
}

// Hook to prefetch user profile with custom options
export function useAdvancedPrefetchProfile() {
  const queryClient = useQueryClient();

  return (options: {
    force?: boolean;
    staleTime?: number;
    gcTime?: number;
  } = {}) => {
    const { force = false, staleTime = 5 * 60 * 1000, gcTime = 10 * 60 * 1000 } = options;

    return queryClient.prefetchQuery({
      queryKey: ['user', 'profile'],
      queryFn: fetchUserProfile,
      staleTime,
      gcTime,
      // Force refetch if requested
      ...(force && { staleTime: 0 }),
    });
  };
}

// Hook to get cache statistics for debugging
export function useProfileCacheStats() {
  const queryClient = useQueryClient();

  return () => {
    const cache = queryClient.getQueryCache();
    const profileQuery = cache.find({ queryKey: ['user', 'profile'] });
    
    return {
      exists: !!profileQuery,
      dataUpdatedAt: profileQuery?.state.dataUpdatedAt,
      errorUpdatedAt: profileQuery?.state.errorUpdatedAt,
      fetchStatus: profileQuery?.state.fetchStatus,
      status: profileQuery?.state.status,
      isStale: profileQuery ? Date.now() - (profileQuery.state.dataUpdatedAt || 0) > 5 * 60 * 1000 : true,
      gcTime: 10 * 60 * 1000, // 10 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
    };
  };
}

// Hook for batch cache operations
export function useBatchCacheOperations() {
  const queryClient = useQueryClient();

  return {
    // Batch invalidate multiple query patterns
    invalidateMultiple: (queryKeys: string[][]) => {
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey, exact: false });
      });
    },

    // Batch prefetch multiple queries
    prefetchMultiple: async (queries: Array<{
      queryKey: string[];
      queryFn: () => Promise<unknown>;
      staleTime?: number;
    }>) => {
      const promises = queries.map(({ queryKey, queryFn, staleTime }) =>
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: staleTime || 5 * 60 * 1000,
        })
      );
      
      return Promise.allSettled(promises);
    },

    // Clear multiple query patterns
    clearMultiple: (queryKeys: string[][]) => {
      queryKeys.forEach(queryKey => {
        queryClient.removeQueries({ queryKey, exact: false });
      });
    },
  };
}

// Hook for cache warming strategies
export function useCacheWarming() {
  const queryClient = useQueryClient();

  return {
    // Warm cache on user interaction
    warmOnHover: () => {
      queryClient.prefetchQuery({
        queryKey: ['user', 'profile'],
        queryFn: fetchUserProfile,
        staleTime: 10 * 60 * 1000, // 10 minutes
      });
    },

    // Warm cache on focus
    warmOnFocus: () => {
      if (!document.hidden) {
        queryClient.prefetchQuery({
          queryKey: ['user', 'profile'],
          queryFn: fetchUserProfile,
          staleTime: 5 * 60 * 1000,
        });
      }
    },

    // Background cache refresh
    backgroundRefresh: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', 'profile'],
        refetchType: 'active',
      });
    },
  };
}

// Hook for advanced cache management with strategies
export function useAdvancedCacheManagement() {
  const queryClient = useQueryClient();

  return {
    // Optimistic update with rollback capability
    performOptimisticUpdate: <T>(
      queryKey: string[],
      updater: (oldData: T | undefined) => T,
      rollbackDelay: number = 30000 // 30 seconds
    ) => {
      const previousData = queryClient.getQueryData<T>(queryKey);
      const newData = updater(previousData);
      
      queryClient.setQueryData(queryKey, newData);
      
      // Auto-rollback after delay if no confirmation
      const rollbackTimer = setTimeout(() => {
        const currentData = queryClient.getQueryData<T>(queryKey);
        if (currentData === newData) {
          queryClient.setQueryData(queryKey, previousData);
        }
      }, rollbackDelay);
      
      // Return confirmation function
      return {
        confirm: () => {
          clearTimeout(rollbackTimer);
        },
        rollback: () => {
          clearTimeout(rollbackTimer);
          queryClient.setQueryData(queryKey, previousData);
        },
      };
    },

    // Smart cache invalidation based on data relationships
    smartInvalidate: (changedData: unknown, relationships: string[][]) => {
      relationships.forEach(queryKey => {
        queryClient.invalidateQueries({
          queryKey,
          exact: false,
          refetchType: 'active',
        });
      });
    },

    // Cache health check
    checkCacheHealth: () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      const now = Date.now();
      
      return {
        total: queries.length,
        healthy: queries.filter(q => q.state.status === 'success').length,
        stale: queries.filter(q => {
          const staleTime = (q.options as { staleTime?: number })?.staleTime ?? 0;
          return q.state.dataUpdatedAt && now - q.state.dataUpdatedAt > staleTime;
        }).length,
        errors: queries.filter(q => q.state.status === 'error').length,
        loading: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      };
    },

    // Preload related data
    preloadRelatedData: async () => {
      const preloadQueries = [
        {
          queryKey: ['user', 'profile'],
          queryFn: fetchUserProfile,
        },
        // Add more related queries as needed
      ];

      const results = await Promise.allSettled(
        preloadQueries.map(({ queryKey, queryFn }) =>
          queryClient.prefetchQuery({
            queryKey,
            queryFn,
            staleTime: 5 * 60 * 1000,
          })
        )
      );

      return results;
    },
  };
}