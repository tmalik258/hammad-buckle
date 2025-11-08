# User Account TanStack Query Hooks

This module provides TanStack Query hooks for managing user profile data with caching, background refetching, optimistic updates, and comprehensive error handling.

## Features

- ✅ **Data Fetching**: Efficient user profile data fetching with caching
- ✅ **Background Refetch**: Automatic background data updates
- ✅ **Optimistic Updates**: Immediate UI feedback for mutations
- ✅ **Error Handling**: Comprehensive error handling with retry logic
- ✅ **Type Safety**: Full TypeScript support with proper type inference
- ✅ **Cache Management**: Intelligent cache invalidation and management
- ✅ **Utility Hooks**: Additional hooks for common operations

## Installation

The hooks are already set up and ready to use. Make sure you have the following dependencies:

```json
{
  "@tanstack/react-query": "^5.87.1",
  "sonner": "^2.0.7"
}
```

## Quick Start

```tsx
import { useUserProfile, useUpdateProfile } from '@/lib/hooks/useUserAccount';

function MyComponent() {
  const { data: profile, isLoading, error } = useUserProfile();
  const updateMutation = useUpdateProfile();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{profile?.name}</h1>
      <button 
        onClick={() => updateMutation.mutate({ 
          name: 'New Name' 
        })}
      >
        Update Name
      </button>
    </div>
  );
}
```

## API Reference

### Query Hooks

#### `useUserProfile(options?)`

Fetches the current user's profile data with caching and background refetch.

**Parameters:**
- `options` (optional): Configuration options
  - `enabled?: boolean` - Whether the query should run (default: `true`)
  - `staleTime?: number` - Time in ms before data is considered stale (default: `5 minutes`)
  - `cacheTime?: number` - Time in ms to keep data in cache (default: `10 minutes`)

**Returns:**
- `data: UserProfile | undefined` - The user profile data
- `isLoading: boolean` - Whether the initial fetch is loading
- `isFetching: boolean` - Whether any fetch is in progress
- `error: Error | null` - Any error that occurred
- `isError: boolean` - Whether an error occurred
- `refetch: () => void` - Function to manually refetch data

**Example:**
```tsx
const { data: profile, isLoading, error } = useUserProfile({
  staleTime: 2 * 60 * 1000, // 2 minutes
  enabled: !!userId, // Only fetch if user ID exists
});
```

### Mutation Hooks

#### `useUpdateProfile(options?)`

Updates the user's profile with optimistic updates and error handling.

**Parameters:**
- `options` (optional): Mutation callbacks
  - `onSuccess?: (data, variables) => void` - Called on successful update
  - `onError?: (error, variables) => void` - Called on update error
  - `onMutate?: (variables) => Promise<any> | any` - Called before mutation
  - `onSettled?: (data, error, variables) => void` - Called after mutation completes

**Returns:**
- `mutate: (data: UpdateProfileRequest) => void` - Function to trigger update
- `mutateAsync: (data: UpdateProfileRequest) => Promise<UserProfile>` - Async version
- `isPending: boolean` - Whether the mutation is in progress
- `error: Error | null` - Any error that occurred
- `data: UserProfile | undefined` - The updated profile data

**Example:**
```tsx
const updateProfile = useUpdateProfile({
  onSuccess: (updatedProfile) => {
    console.log('Profile updated:', updatedProfile);
  },
  onError: (error) => {
    console.error('Update failed:', error);
  },
});

// Trigger update
updateProfile.mutate({
  name: 'New Name',
  email: 'new@email.com',
});
```

### Utility Hooks

#### `useRefreshProfile()`

Returns a function to manually refresh the profile data.

```tsx
const refreshProfile = useRefreshProfile();

// Refresh data
refreshProfile();
```

#### `usePrefetchProfile()`

Returns a function to prefetch profile data (useful for hover states).

```tsx
const prefetchProfile = usePrefetchProfile();

// Prefetch on hover
<button onMouseEnter={prefetchProfile}>
  View Profile
</button>
```

#### `useCachedProfile()`

Returns cached profile data without triggering a fetch.

```tsx
const cachedProfile = useCachedProfile();

// Use cached data for quick access
if (cachedProfile) {
  console.log('Cached name:', cachedProfile.name);
}
```

#### `useIsProfileLoading()`

Returns whether any profile-related operation is loading.

```tsx
const isLoading = useIsProfileLoading();

if (isLoading) {
  return <Spinner />;
}
```

#### `useClearProfileCache()`

Returns a function to clear the profile cache (useful for logout).

```tsx
const clearCache = useClearProfileCache();

// Clear on logout
const handleLogout = () => {
  clearCache();
  // ... other logout logic
};
```

## Error Handling

The hooks implement comprehensive error handling:

### Automatic Retry Logic

- **Authentication errors** (401, Unauthorized): No retry
- **Validation errors** (400, Validation failed): No retry
- **Network errors**: Retry up to 3 times with exponential backoff
- **Server errors** (500): Retry up to 2 times

### Error Types

```tsx
const { error } = useUserProfile();

if (error) {
  if (error.message.includes('Unauthorized')) {
    // Handle authentication error
    redirectToLogin();
  } else if (error.message.includes('Validation failed')) {
    // Handle validation error
    showValidationErrors();
  } else {
    // Handle other errors
    showGenericError();
  }
}
```

## Optimistic Updates

The `useUpdateProfile` hook implements optimistic updates for better UX:

1. **Immediate UI Update**: UI updates immediately when mutation is triggered
2. **Rollback on Error**: Changes are rolled back if the mutation fails
3. **Server Confirmation**: Final state is updated with server response

```tsx
const updateProfile = useUpdateProfile();

// This will immediately update the UI, then confirm with server
updateProfile.mutate({ name: 'New Name' });
```

## Caching Strategy

### Cache Configuration

- **Stale Time**: 5 minutes (data is fresh for 5 minutes)
- **Garbage Collection**: 10 minutes (data is kept in memory for 10 minutes)
- **Background Refetch**: Every 5 minutes when data is stale
- **Refetch on Focus**: Yes (when user returns to tab)
- **Refetch on Reconnect**: Yes (when network reconnects)

### Cache Invalidation

The hooks automatically invalidate cache when:
- Profile is updated successfully
- Manual refresh is triggered
- User logs out (when using `useClearProfileCache`)

## TypeScript Support

All hooks are fully typed with TypeScript:

```tsx
import type { 
  UserProfile, 
  UpdateProfileRequest 
} from '@/lib/types/user-account';

// Fully typed profile data
const { data: profile }: { data: UserProfile | undefined } = useUserProfile();

// Fully typed update request
const updateData: UpdateProfileRequest = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null, // Can be null
};
```

## Best Practices

### 1. Use Optimistic Updates for Better UX

```tsx
const updateProfile = useUpdateProfile({
  onMutate: async (newData) => {
    // Show loading state immediately
    setIsUpdating(true);
  },
  onSettled: () => {
    // Hide loading state
    setIsUpdating(false);
  },
});
```

### 2. Handle Errors Gracefully

```tsx
const updateProfile = useUpdateProfile({
  onError: (error) => {
    if (error.message.includes('Unauthorized')) {
      // Redirect to login
      router.push('/login');
    } else {
      // Show user-friendly error
      toast.error('Failed to update profile. Please try again.');
    }
  },
});
```

### 3. Use Conditional Fetching

```tsx
// Only fetch when user is authenticated
const { data: profile } = useUserProfile({
  enabled: !!user && !!user.id,
});
```

### 4. Prefetch for Better Performance

```tsx
const prefetchProfile = usePrefetchProfile();

// Prefetch on route change or user interaction
useEffect(() => {
  if (shouldPrefetch) {
    prefetchProfile();
  }
}, [shouldPrefetch, prefetchProfile]);
```

### 5. Clear Cache on Logout

```tsx
const clearProfileCache = useClearProfileCache();

const handleLogout = () => {
  clearProfileCache();
  // Clear other caches
  queryClient.clear();
};
```

## Testing

The hooks come with comprehensive tests. Run them with:

```bash
npm test lib/hooks/__tests__/useUserAccount.test.ts
```

## Examples

See `lib/hooks/examples/useUserAccount.example.tsx` for complete usage examples including:

- Basic profile display
- Profile editing form
- Advanced cache management
- Error handling patterns
- Custom hook composition

## Requirements Satisfied

This implementation satisfies the following requirements:

- **4.1**: ✅ TanStack Query integration for data fetching
- **4.2**: ✅ Background refetch and caching with 5-minute stale time
- **4.3**: ✅ Optimistic updates for profile mutations
- **4.4**: ✅ Comprehensive error handling with retry logic
- **4.5**: ✅ Proper loading states and user feedback
- **4.6**: ✅ Cache invalidation and consistency management