import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { UserProfile, UserProfileFormData } from '../types/user-account';

export interface UserPreferences {
  newsletter: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
}

// Enhanced loading states for granular control
export interface LoadingStates {
  isLoading: boolean;
  isLoadingProfile: boolean;
  isSaving: boolean;
  isSavingProfile: boolean;
}

// UI state management
export interface UIState {
  isEditing: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
}

// Optimistic update tracking
export interface OptimisticState {
  optimisticProfile: Partial<UserProfile> | null;
  pendingOperations: Set<string>;
}

export interface UserState extends LoadingStates, UIState, OptimisticState {
  profile: UserProfile | null;
  preferences: UserPreferences;

  // Enhanced Profile Actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateProfileOptimistic: (updates: Partial<UserProfile>) => void;
  confirmProfileUpdate: (profile: UserProfile) => void;
  revertProfileUpdate: () => void;



  // Preferences Actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;

  // Enhanced Loading State Actions
  setLoading: (loading: boolean) => void;
  setLoadingProfile: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setSavingProfile: (saving: boolean) => void;

  // Enhanced Error Handling
  setError: (error: string | null) => void;
  setValidationError: (field: string, error: string) => void;
  clearValidationErrors: () => void;
  clearError: () => void;

  // UI State Actions
  setEditing: (editing: boolean) => void;

  // Optimistic Update Management
  addPendingOperation: (operationId: string) => void;
  removePendingOperation: (operationId: string) => void;
  clearPendingOperations: () => void;

  // Enhanced Computed Values
  isAuthenticated: () => boolean;
  getDisplayProfile: () => UserProfile | null;
  getFormData: () => UserProfileFormData | null;
  hasValidationErrors: () => boolean;
  getValidationError: (field: string) => string | undefined;
  isOperationPending: (operationId: string) => boolean;
  hasAnyPendingOperations: () => boolean;

  // Cache Management Actions
  invalidateCache: () => void;
  refreshProfile: () => Promise<void>;
  forceRefresh: () => void;

  // Utility Actions
  reset: () => void;
  resetUIState: () => void;
  logout: (showToast?: boolean) => void;
}

const defaultPreferences: UserPreferences = {
  newsletter: false,
  smsNotifications: false,
  emailNotifications: true,
  currency: 'USD',
  language: 'en',
  theme: 'system',
};

const initialLoadingStates: LoadingStates = {
  isLoading: false,
  isLoadingProfile: false,
  isSaving: false,
  isSavingProfile: false,
};

const initialUIState: UIState = {
  isEditing: false,
  error: null,
  validationErrors: {},
};

const initialOptimisticState: OptimisticState = {
  optimisticProfile: null,
  pendingOperations: new Set(),
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      preferences: defaultPreferences,
      ...initialLoadingStates,
      ...initialUIState,
      ...initialOptimisticState,

      // Enhanced Profile Actions
      setProfile: (profile) => {
        set({
          profile,
          optimisticProfile: null,
          error: null
        });
      },

      updateProfile: (updates) => {
        const { profile } = get();
        if (!profile) return;

        const updatedProfile = {
          ...profile,
          ...updates,
          updatedAt: new Date(),
        };

        set({ profile: updatedProfile, optimisticProfile: null });
        toast.success('Profile updated successfully');
      },

      updateProfileOptimistic: (updates) => {
        const { profile, pendingOperations } = get();
        if (!profile) return;

        const operationId = `optimistic-${Date.now()}`;
        const newPendingOperations = new Set(pendingOperations);
        newPendingOperations.add(operationId);

        set({
          optimisticProfile: { ...get().optimisticProfile, ...updates },
          error: null,
          validationErrors: {},
          pendingOperations: newPendingOperations,
          isSavingProfile: true,
        });

        // Return operation ID for tracking
        return operationId;
      },

      confirmProfileUpdate: (profile) => {
        set({
          profile,
          optimisticProfile: null,
          isSavingProfile: false,
          error: null,
          pendingOperations: new Set(), // Clear all pending operations
        });
        toast.success('Profile updated successfully');
      },

      revertProfileUpdate: () => {
        set({
          optimisticProfile: null,
          isSavingProfile: false,
          pendingOperations: new Set(), // Clear pending operations on revert
        });
      },



      // Preferences Actions
      updatePreferences: (updates) => {
        const { preferences } = get();
        const updatedPreferences = { ...preferences, ...updates };

        set({ preferences: updatedPreferences });
        toast.success('Preferences updated successfully');
      },

      // Enhanced Loading State Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setLoadingProfile: (loading) => set({ isLoadingProfile: loading }),
      setSaving: (saving) => set({ isSaving: saving }),
      setSavingProfile: (saving) => set({ isSavingProfile: saving }),

      // Enhanced Error Handling
      setError: (error) => set({ error, validationErrors: {} }),
      setValidationError: (field, error) => {
        const { validationErrors } = get();
        set({
          validationErrors: { ...validationErrors, [field]: error }
        });
      },
      clearValidationErrors: () => set({ validationErrors: {} }),
      clearError: () => set({ error: null, validationErrors: {} }),

      // UI State Actions
      setEditing: (editing) => set({ isEditing: editing }),

      // Optimistic Update Management
      addPendingOperation: (operationId) => {
        const { pendingOperations } = get();
        const newPendingOperations = new Set(pendingOperations);
        newPendingOperations.add(operationId);
        set({ pendingOperations: newPendingOperations });
      },

      removePendingOperation: (operationId) => {
        const { pendingOperations } = get();
        const newPendingOperations = new Set(pendingOperations);
        newPendingOperations.delete(operationId);
        set({ pendingOperations: newPendingOperations });
      },

      clearPendingOperations: () => {
        set({ pendingOperations: new Set() });
      },

      // Enhanced Computed Values
      isAuthenticated: () => {
        const { profile } = get();
        return profile !== null;
      },

      getDisplayProfile: () => {
        const { profile, optimisticProfile } = get();
        if (!profile) return null;

        return optimisticProfile
          ? { ...profile, ...optimisticProfile }
          : profile;
      },

      getFormData: () => {
        const { profile, optimisticProfile } = get();
        const displayProfile = profile && optimisticProfile
          ? { ...profile, ...optimisticProfile }
          : profile;

        if (!displayProfile) return null;

        return {
          name: displayProfile.name || '',
          email: displayProfile.email || '',
        };
      },



      hasValidationErrors: () => {
        const { validationErrors } = get();
        return Object.keys(validationErrors).length > 0;
      },

      getValidationError: (field) => {
        const { validationErrors } = get();
        return validationErrors[field];
      },

      isOperationPending: (operationId) => {
        const { pendingOperations } = get();
        return pendingOperations.has(operationId);
      },

      hasAnyPendingOperations: () => {
        const { pendingOperations } = get();
        return pendingOperations.size > 0;
      },

      // Cache Management Actions
      invalidateCache: () => {
        set({
          profile: null,
          optimisticProfile: null,
          error: null,
          validationErrors: {},
          pendingOperations: new Set(),
          isLoadingProfile: false,
          isSavingProfile: false,
        });
        
        // Clear localStorage cache
        localStorage.removeItem('user-storage');
        
        // Force a fresh fetch on next access
        set({ isLoadingProfile: true });
      },

      refreshProfile: async () => {
        const { profile } = get();
        if (!profile?.id) return;

        set({ isLoadingProfile: true, error: null });

        try {
          const response = await fetch(`/api/users/${profile.id}`, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to refresh profile');
          }

          const freshProfile = await response.json();
          
          set({
            profile: freshProfile,
            optimisticProfile: null,
            isLoadingProfile: false,
            error: null,
          });

          toast.success('Profile refreshed successfully');
        } catch (error) {
          console.error('Error refreshing profile:', error);
          set({
            isLoadingProfile: false,
            error: 'Failed to refresh profile',
          });
          toast.error('Failed to refresh profile');
        }
      },

      forceRefresh: () => {
        // Clear all cached data and force a complete refresh
        get().invalidateCache();
        
        // Trigger a fresh profile fetch
        setTimeout(() => {
          get().refreshProfile();
        }, 100);
      },

      // Utility Actions
      reset: () => {
        set({
          profile: null,
          preferences: defaultPreferences,
          ...initialLoadingStates,
          ...initialUIState,
          ...initialOptimisticState,
        });
      },

      resetUIState: () => {
        set({
          ...initialUIState,
          ...initialLoadingStates,
        });
      },

      logout: (showToast = false) => {
        set({
          profile: null,
          preferences: defaultPreferences,
          ...initialLoadingStates,
          ...initialUIState,
          ...initialOptimisticState,
        });
        if (showToast) {
          toast.success('Logged out successfully');
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
        // Don't persist UI state, loading states, or optimistic updates
      }),
    }
  )
);