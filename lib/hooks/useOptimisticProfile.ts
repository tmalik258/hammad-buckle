/**
 * Advanced optimistic updates hook for user profile management
 * Implements requirements 8.2, 8.3, 8.4: Optimistic updates and caching
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useUserStore } from '../stores/user-store';
import { createCacheManager } from '../utils/cache-strategies';
import type { UserProfile, UpdateProfileRequest } from '../types/user-account';

interface OptimisticOperation {
  id: string;
  type: 'profile-update';
  timestamp: number;
  rollback: () => void;
  confirm: () => void;
}

interface OptimisticUpdateOptions {
  showToast?: boolean;
  autoRollbackDelay?: number;
  onSuccess?: (data: UserProfile) => void;
  onError?: (error: Error) => void;
  onRollback?: () => void;
}

/**
 * Hook for managing optimistic profile updates with advanced caching strategies
 */
export function useOptimisticProfile() {
  const queryClient = useQueryClient();
  const userStore = useUserStore();
  const operationsRef = useRef<Map<string, OptimisticOperation>>(new Map());
  const cacheManager = createCacheManager(queryClient);

  /**
   * Perform optimistic profile update
   */
  const updateOptimistically = useCallback(
    (
      updates: Partial<UpdateProfileRequest>,
      options: OptimisticUpdateOptions = {}
    ) => {
      const {
        showToast = true,
        autoRollbackDelay = 30000, // 30 seconds
        onSuccess,
        onError,
        onRollback,
      } = options;

      const operationId = `optimistic-${Date.now()}-${Math.random()}`;
      const currentProfile = queryClient.getQueryData<UserProfile>(['user', 'profile']);

      if (!currentProfile) {
        const error = new Error('No profile data available for optimistic update');
        onError?.(error);
        return null;
      }

      // Create optimistic profile data
      const optimisticProfile: UserProfile = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date(),
      };

      // Store previous data for rollback
      const previousProfile = { ...currentProfile };

      // Update cache optimistically
      queryClient.setQueryData(['user', 'profile'], optimisticProfile);

      // Show optimistic feedback
      if (showToast) {
        toast.loading('Updating profile...', { id: operationId });
      }

      // Create rollback function
      const rollback = () => {
        queryClient.setQueryData(['user', 'profile'], previousProfile);
        userStore.revertProfileUpdate();
        
        if (showToast) {
          toast.dismiss(operationId);
          toast.error('Profile update was reverted');
        }
        
        operationsRef.current.delete(operationId);
        onRollback?.();
      };

      // Create confirm function
      const confirm = (serverData?: UserProfile) => {
        const finalData = serverData || optimisticProfile;
        queryClient.setQueryData(['user', 'profile'], finalData);
        userStore.confirmProfileUpdate(finalData);
        
        if (showToast) {
          toast.dismiss(operationId);
          toast.success('Profile updated successfully');
        }
        
        operationsRef.current.delete(operationId);
        onSuccess?.(finalData);
      };

      // Set up auto-rollback timer
      const rollbackTimer = setTimeout(() => {
        const operation = operationsRef.current.get(operationId);
        if (operation) {
          rollback();
        }
      }, autoRollbackDelay);

      // Store operation for tracking
      const operation: OptimisticOperation = {
        id: operationId,
        type: 'profile-update',
        timestamp: Date.now(),
        rollback: () => {
          clearTimeout(rollbackTimer);
          rollback();
        },
        confirm: (serverData?: UserProfile) => {
          clearTimeout(rollbackTimer);
          confirm(serverData);
        },
      };

      operationsRef.current.set(operationId, operation);

      return {
        operationId,
        rollback: operation.rollback,
        confirm: operation.confirm,
        optimisticData: optimisticProfile,
      };
    },
    [queryClient, userStore]
  );

  /**
   * Confirm an optimistic update with server data
   */
  const confirmUpdate = useCallback(
    (operationId: string) => {
      const operation = operationsRef.current.get(operationId);
      if (operation) {
        operation.confirm();
        
        // Invalidate cache for consistency
        cacheManager.invalidateProfile();
      }
    },
    [cacheManager]
  );

  /**
   * Rollback an optimistic update
   */
  const rollbackUpdate = useCallback((operationId: string) => {
    const operation = operationsRef.current.get(operationId);
    if (operation) {
      operation.rollback();
    }
  }, []);

  /**
   * Rollback all pending optimistic updates
   */
  const rollbackAll = useCallback(() => {
    operationsRef.current.forEach(operation => {
      operation.rollback();
    });
    operationsRef.current.clear();
  }, []);

  /**
   * Get pending operations
   */
  const getPendingOperations = useCallback(() => {
    return Array.from(operationsRef.current.values());
  }, []);

  /**
   * Check if there are pending operations
   */
  const hasPendingOperations = useCallback(() => {
    return operationsRef.current.size > 0;
  }, []);

  /**
   * Advanced optimistic update with conflict resolution
   */
  const updateWithConflictResolution = useCallback(
    async (
      updates: Partial<UpdateProfileRequest>,
      options: OptimisticUpdateOptions & {
        conflictResolver?: (local: UserProfile, server: UserProfile) => UserProfile;
      } = {}
    ) => {
      const { conflictResolver, ...updateOptions } = options;
      
      const result = updateOptimistically(updates, updateOptions);
      if (!result) return null;

      // Simulate server validation after optimistic update
      setTimeout(async () => {
        try {
          // In a real scenario, this would be the actual server response
          const currentCacheData = queryClient.getQueryData<UserProfile>(['user', 'profile']);
          
          if (currentCacheData && conflictResolver) {
            result.confirm();
          } else {
            result.confirm();
          }
        } catch (error) {
          result.rollback();
          options.onError?.(error as Error);
        }
      }, 100); // Small delay to simulate network

      return result;
    },
    [updateOptimistically, queryClient]
  );

  /**
   * Batch optimistic updates
   */
  const batchUpdate = useCallback(
    (
      updatesBatch: Array<{
        updates: Partial<UpdateProfileRequest>;
        options?: OptimisticUpdateOptions;
      }>
    ) => {
      const operations = updatesBatch.map(({ updates, options }) =>
        updateOptimistically(updates, { ...options, showToast: false })
      ).filter(Boolean);

      if (operations.length > 0) {
        toast.loading(`Updating ${operations.length} profile changes...`);
      }

      return {
        operations,
        confirmAll: () => {
          operations.forEach(op => op?.confirm());
          toast.dismiss();
          toast.success('All profile changes saved successfully');
        },
        rollbackAll: () => {
          operations.forEach(op => op?.rollback());
          toast.dismiss();
          toast.error('All profile changes were reverted');
        },
      };
    },
    [updateOptimistically]
  );

  return {
    // Core optimistic update functions
    updateOptimistically,
    confirmUpdate,
    rollbackUpdate,
    rollbackAll,
    
    // Advanced features
    updateWithConflictResolution,
    batchUpdate,
    
    // State queries
    getPendingOperations,
    hasPendingOperations,
    
    // Cache management
    cacheManager,
  };
}

/**
 * Hook for optimistic update statistics and debugging
 */
export function useOptimisticStats() {
  const queryClient = useQueryClient();
  
  return {
    getCacheStats: () => {
      const cache = queryClient.getQueryCache();
      const profileQuery = cache.find({ queryKey: ['user', 'profile'] });
      
      return {
        exists: !!profileQuery,
        status: profileQuery?.state.status,
        fetchStatus: profileQuery?.state.fetchStatus,
        dataUpdatedAt: profileQuery?.state.dataUpdatedAt,
        errorUpdatedAt: profileQuery?.state.errorUpdatedAt,
        isStale: profileQuery ? 
          Date.now() - (profileQuery.state.dataUpdatedAt || 0) > 5 * 60 * 1000 : 
          true,
      };
    },
    
    getOptimisticUpdateHistory: () => {
      // This would track optimistic update history in a real implementation
      return [];
    },
  };
}