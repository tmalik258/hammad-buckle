# Optimistic Updates and Advanced Caching

This document describes the optimistic updates and advanced caching implementation for the user profile management system, fulfilling requirements 8.2, 8.3, and 8.4.

## Overview

The optimistic updates system provides immediate UI feedback while maintaining data consistency through advanced caching strategies. It includes automatic rollback mechanisms, conflict resolution, and comprehensive error handling.

## Key Features

### 1. Optimistic Updates (Requirement 8.2)

- **Immediate UI Updates**: Changes appear instantly in the UI before server confirmation
- **Automatic Rollback**: Failed operations automatically revert to previous state
- **Conflict Resolution**: Handle conflicts between local and server data
- **Batch Operations**: Support for multiple simultaneous updates

### 2. Advanced Caching (Requirement 8.3)

- **Intelligent Cache Management**: Automatic cache invalidation and refresh strategies
- **Background Refetching**: Keep data fresh without blocking UI
- **Cache Warming**: Preload data based on user interactions
- **Memory Optimization**: Efficient cache eviction policies

### 3. Cache Invalidation Strategies (Requirement 8.4)

- **Smart Invalidation**: Context-aware cache invalidation
- **Relationship-Based**: Invalidate related data automatically
- **Performance Optimized**: Minimize unnecessary network requests
- **Error Recovery**: Robust error handling and recovery mechanisms

## Core Components

### useOptimisticProfile Hook

The main hook for managing optimistic profile updates:

```typescript
const {
  updateOptimistically,
  confirmUpdate,
  rollbackUpdate,
  hasPendingOperations,
  cacheManager,
} = useOptimisticProfile();
```

#### Key Methods

- `updateOptimistically()`: Perform optimistic update with rollback capability
- `confirmUpdate()`: Confirm optimistic update with server data
- `rollbackUpdate()`: Manually rollback specific operation
- `batchUpdate()`: Perform multiple optimistic updates
- `hasPendingOperations()`: Check for pending operations

### Cache Management System

Advanced cache management with multiple strategies:

```typescript
const cacheManager = createCacheManager(queryClient);

// Predefined strategies
cacheManager.invalidateProfile();
cacheManager.invalidateOnLogin();
cacheManager.backgroundRefresh();
cacheManager.recoverFromError();

// Custom operations
cacheManager.optimize();
cacheManager.prefetchCritical();
cacheManager.getStats();
```

## Usage Examples

### Basic Optimistic Update

```typescript
const handleUpdate = () => {
  const result = updateOptimistically(
    { name: 'New Name' },
    {
      showToast: true,
      autoRollbackDelay: 30000, // 30 seconds
      onSuccess: (data) => console.log('Confirmed:', data),
      onError: (error) => console.error('Failed:', error),
    }
  );

  // Simulate server response
  setTimeout(() => {
    result?.confirm(serverData);
  }, 1000);
};
```

### Integration with Mutations

```typescript
const updateMutation = useUpdateProfile({
  onMutate: async (variables) => {
    // Perform optimistic update
    const optimisticResult = updateOptimistically(variables, {
      showToast: false,
      autoRollbackDelay: 30000,
    });
    return { optimisticResult };
  },
  onSuccess: (data, variables, context) => {
    // Confirm optimistic update
    context?.optimisticResult?.confirm(data);
  },
  onError: (error, variables, context) => {
    // Rollback on error
    context?.optimisticResult?.rollback();
  },
});
```

### Batch Updates

```typescript
const handleBatchUpdate = () => {
  const batchResult = batchUpdate([
    { updates: { name: 'New Name' } },
    { updates: { email: 'new@email.com' } },
  ]);

  // Confirm all updates
  batchResult.confirmAll(serverData);
  
  // Or rollback all
  batchResult.rollbackAll();
};
```

## Configuration Options

### TanStack Query Configuration

Enhanced query client configuration for optimal performance:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error) => {
        // Smart retry logic
        if (error?.status >= 400 && error?.status < 500) {
          return false; // Don't retry client errors
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      networkMode: 'online',
    },
  },
});
```

### Cache Strategies

Predefined cache invalidation strategies:

```typescript
const CACHE_STRATEGIES = {
  PROFILE_UPDATE: {
    queryKeys: [['user', 'profile'], ['user']],
    options: { refetchType: 'active', delay: 100 },
  },
  USER_LOGIN: {
    queryKeys: [['user']],
    options: { refetchType: 'all', delay: 0 },
  },
  ERROR_RECOVERY: {
    queryKeys: [['user', 'profile']],
    options: { refetchType: 'active', delay: 1000 },
  },
};
```

## Performance Optimizations

### 1. Structural Sharing

```typescript
useQuery({
  queryKey: ['user', 'profile'],
  queryFn: fetchUserProfile,
  structuralSharing: true, // Enable structural sharing
  notifyOnChangeProps: ['data', 'error', 'isLoading'], // Minimize re-renders
});
```

### 2. Placeholder Data

```typescript
useQuery({
  queryKey: ['user', 'profile'],
  queryFn: fetchUserProfile,
  placeholderData: (previousData) => previousData, // Show previous data while loading
});
```

### 3. Cache Warming

```typescript
const cacheWarming = useCacheWarming();

// Warm cache on hover
onMouseEnter={() => cacheWarming.warmOnHover()}

// Background refresh
useEffect(() => {
  const interval = setInterval(cacheWarming.backgroundRefresh, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

## Error Handling

### Automatic Rollback

```typescript
const result = updateOptimistically(updates, {
  autoRollbackDelay: 30000, // Auto-rollback after 30 seconds
  onRollback: () => {
    toast.info('Changes were reverted due to timeout');
  },
});
```

### Conflict Resolution

```typescript
const result = updateWithConflictResolution(updates, {
  conflictResolver: (local, server) => {
    // Custom conflict resolution logic
    return { ...server, ...local };
  },
});
```

### Network Error Recovery

```typescript
const updateMutation = useUpdateProfile({
  retry: (failureCount, error) => {
    // Don't retry on validation errors
    if (error.message.includes('Validation failed')) {
      return false;
    }
    return failureCount < 2;
  },
  onError: () => {
    // Trigger error recovery cache strategy
    cacheManager.recoverFromError();
  },
});
```

## Testing

### Unit Tests

```typescript
it('should perform optimistic update', () => {
  const { result } = renderHook(() => useOptimisticProfile(), { wrapper });

  act(() => {
    const updateResult = result.current.updateOptimistically(
      { name: 'Jane Doe' },
      { showToast: false }
    );

    expect(updateResult).toBeTruthy();
    expect(updateResult?.operationId).toBeTruthy();
  });
});
```

### Integration Tests

```typescript
it('should rollback on error', async () => {
  const { result } = renderHook(() => useOptimisticProfile(), { wrapper });

  let updateResult: any;
  act(() => {
    updateResult = result.current.updateOptimistically(
      { name: 'Jane Doe' },
      { showToast: false }
    );
  });

  // Simulate error and rollback
  act(() => {
    updateResult.rollback();
  });

  const profile = queryClient.getQueryData(['user', 'profile']);
  expect(profile?.name).toBe('John Doe'); // Original name
});
```

## Best Practices

### 1. Use Optimistic Updates for Immediate Feedback

```typescript
// ✅ Good: Immediate feedback
const result = updateOptimistically(updates, { showToast: true });

// ❌ Bad: No immediate feedback
await updateMutation.mutateAsync(updates);
```

### 2. Always Handle Rollbacks

```typescript
// ✅ Good: Handle rollback scenarios
const result = updateOptimistically(updates, {
  onRollback: () => {
    toast.info('Changes were reverted');
    // Additional cleanup logic
  },
});

// ❌ Bad: No rollback handling
updateOptimistically(updates);
```

### 3. Use Appropriate Cache Strategies

```typescript
// ✅ Good: Context-aware invalidation
cacheManager.smartInvalidate('PROFILE_UPDATE');

// ❌ Bad: Blanket invalidation
queryClient.invalidateQueries();
```

### 4. Monitor Performance

```typescript
// ✅ Good: Monitor cache health
const stats = cacheManager.getStats();
console.log('Cache health:', stats);

// Optimize when needed
if (stats.staleQueries > 10) {
  cacheManager.optimize();
}
```

## Troubleshooting

### Common Issues

1. **Optimistic Updates Not Showing**
   - Check if `structuralSharing` is enabled
   - Verify query key consistency
   - Ensure proper cache updates

2. **Memory Leaks**
   - Implement proper cleanup in `useEffect`
   - Use appropriate `gcTime` settings
   - Monitor cache size with `getStats()`

3. **Race Conditions**
   - Use `cancelQueries` before optimistic updates
   - Implement proper operation tracking
   - Handle concurrent updates gracefully

### Debug Tools

```typescript
// Enable debug logging
const cacheStats = useProfileCacheStats();
console.log('Cache stats:', cacheStats());

// Monitor pending operations
const pendingOps = getPendingOperations();
console.log('Pending operations:', pendingOps);
```

## Migration Guide

### From Basic Updates to Optimistic Updates

1. **Replace direct mutations**:
   ```typescript
   // Before
   await updateMutation.mutateAsync(data);
   
   // After
   const result = updateOptimistically(data);
   const serverData = await updateMutation.mutateAsync(data);
   result?.confirm(serverData);
   ```

2. **Add error handling**:
   ```typescript
   try {
     const serverData = await updateMutation.mutateAsync(data);
     result?.confirm(serverData);
   } catch (error) {
     result?.rollback();
   }
   ```

3. **Implement cache strategies**:
   ```typescript
   const cacheManager = createCacheManager(queryClient);
   cacheManager.invalidateProfile();
   ```

This implementation provides a robust foundation for optimistic updates with comprehensive caching strategies, ensuring excellent user experience while maintaining data consistency.