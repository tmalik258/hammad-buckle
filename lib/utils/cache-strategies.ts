/**
 * Cache invalidation and optimization strategies for TanStack Query
 * Implements requirement 8.4: Add cache invalidation strategies for data consistency
 */

import { QueryClient } from '@tanstack/react-query';

export interface CacheInvalidationOptions {
  refetchType?: 'active' | 'inactive' | 'all' | 'none';
  exact?: boolean;
  delay?: number;
}

export interface CacheStrategy {
  queryKeys: readonly (readonly string[])[];
  options?: CacheInvalidationOptions;
}

/**
 * Predefined cache invalidation strategies for different operations
 */
export const CACHE_STRATEGIES = {
  // Profile update strategies
  PROFILE_UPDATE: {
    queryKeys: [
      ['user', 'profile'],
      ['user'], // Catch-all for user-related queries
    ],
    options: {
      refetchType: 'active' as const,
      exact: false,
      delay: 100,
    },
  },

  // User authentication strategies
  USER_LOGIN: {
    queryKeys: [
      ['user'],
    ],
    options: {
      refetchType: 'all' as const,
      exact: false,
      delay: 0,
    },
  },

  USER_LOGOUT: {
    queryKeys: [
      ['user'],
    ],
    options: {
      refetchType: 'none' as const,
      exact: false,
      delay: 0,
    },
  },

  // Background refresh strategies
  BACKGROUND_REFRESH: {
    queryKeys: [
      ['user', 'profile'],
    ],
    options: {
      refetchType: 'active' as const,
      exact: true,
      delay: 0,
    },
  },

  // Error recovery strategies
  ERROR_RECOVERY: {
    queryKeys: [
      ['user', 'profile'],
    ],
    options: {
      refetchType: 'active' as const,
      exact: true,
      delay: 1000, // Delay to prevent immediate retry
    },
  },
} as const;

/**
 * Cache invalidation utility class
 */
export class CacheInvalidationManager {
  constructor(private queryClient: QueryClient) {}

  /**
   * Execute a cache strategy
   */
  async executeStrategy(strategy: CacheStrategy): Promise<void> {
    const { queryKeys, options = {} } = strategy;
    const { refetchType = 'active', exact = false, delay = 0 } = options;

    const invalidateQuery = (queryKey: readonly string[]) => {
      this.queryClient.invalidateQueries({
        queryKey,
        exact,
        refetchType,
      });
    };

    if (delay > 0) {
      setTimeout(() => {
        queryKeys.forEach(invalidateQuery);
      }, delay);
    } else {
      queryKeys.forEach(invalidateQuery);
    }
  }

  /**
   * Execute multiple strategies in sequence
   */
  async executeStrategies(strategies: CacheStrategy[]): Promise<void> {
    for (const strategy of strategies) {
      await this.executeStrategy(strategy);
    }
  }

  /**
   * Smart invalidation based on operation type
   */
  async smartInvalidate(operationType: keyof typeof CACHE_STRATEGIES): Promise<void> {
    const strategy = CACHE_STRATEGIES[operationType];
    const mutableStrategy: CacheStrategy = {
      queryKeys: [...strategy.queryKeys],
      options: { ...strategy.options }
    };
    await this.executeStrategy(mutableStrategy);
  }

  /**
   * Conditional invalidation based on data changes
   */
  async conditionalInvalidate(
    queryKey: string[],
    condition: (currentData: unknown) => boolean,
    options: CacheInvalidationOptions = {}
  ): Promise<void> {
    const currentData = this.queryClient.getQueryData(queryKey);
    
    if (condition(currentData)) {
      this.queryClient.invalidateQueries({
        queryKey,
        exact: options.exact ?? true,
        refetchType: options.refetchType ?? 'active',
      });
    }
  }

  /**
   * Batch invalidation with deduplication
   */
  async batchInvalidate(
    queryKeys: string[][],
    options: CacheInvalidationOptions = {}
  ): Promise<void> {
    // Deduplicate query keys
    const uniqueQueryKeys = Array.from(
      new Set(queryKeys.map(key => JSON.stringify(key)))
    ).map(key => JSON.parse(key));

    const { delay = 0 } = options;

    const invalidateAll = () => {
      uniqueQueryKeys.forEach(queryKey => {
        this.queryClient.invalidateQueries({
          queryKey,
          exact: options.exact ?? false,
          refetchType: options.refetchType ?? 'active',
        });
      });
    };

    if (delay > 0) {
      setTimeout(invalidateAll, delay);
    } else {
      invalidateAll();
    }
  }
}

/**
 * Cache optimization utilities
 */
export class CacheOptimizer {
  constructor(private queryClient: QueryClient) {}

  /**
   * Optimize cache by removing stale queries
   */
  optimizeCache(): void {
    const cache = this.queryClient.getQueryCache();
    const now = Date.now();
    
    cache.getAll().forEach(query => {
      const { state, options } = query;
      const gcTime = options.gcTime ?? 5 * 60 * 1000;
      
      // Remove queries that are beyond their garbage collection time
      if (state.dataUpdatedAt && now - state.dataUpdatedAt > gcTime) {
        cache.remove(query);
      }
    });
  }

  /**
   * Prefetch critical queries
   */
  async prefetchCritical(): Promise<void> {
    const criticalQueries = [
      {
        queryKey: ['user', 'profile'],
        queryFn: async () => {
          const response = await fetch('/api/user/profile');
          if (!response.ok) throw new Error('Failed to fetch profile');
          return response.json();
        },
      },
    ];

    const promises = criticalQueries.map(({ queryKey, queryFn }) =>
      this.queryClient.prefetchQuery({
        queryKey,
        queryFn,
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalQueries: number;
    activeQueries: number;
    staleQueries: number;
    errorQueries: number;
  } {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    const now = Date.now();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      staleQueries: queries.filter(q => {
        const staleTime = 5 * 60 * 1000; // Default 5 minutes
        return q.state.dataUpdatedAt && now - q.state.dataUpdatedAt > staleTime;
      }).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
    };
  }
}

/**
 * Hook factory for cache management
 */
export function createCacheManager(queryClient: QueryClient) {
  const invalidationManager = new CacheInvalidationManager(queryClient);
  const optimizer = new CacheOptimizer(queryClient);

  return {
    invalidationManager,
    optimizer,
    
    // Convenience methods
    invalidateProfile: () => invalidationManager.smartInvalidate('PROFILE_UPDATE'),
    invalidateOnLogin: () => invalidationManager.smartInvalidate('USER_LOGIN'),
    invalidateOnLogout: () => invalidationManager.smartInvalidate('USER_LOGOUT'),
    backgroundRefresh: () => invalidationManager.smartInvalidate('BACKGROUND_REFRESH'),
    recoverFromError: () => invalidationManager.smartInvalidate('ERROR_RECOVERY'),
    
    // Optimization methods
    optimize: () => optimizer.optimizeCache(),
    prefetchCritical: () => optimizer.prefetchCritical(),
    getStats: () => optimizer.getCacheStats(),
  };
}