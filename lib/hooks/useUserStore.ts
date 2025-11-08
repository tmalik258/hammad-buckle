import { useUserStore } from '../stores/user-store';
import { UserProfile } from '../types/user-account';

/**
 * Hook for profile-related operations with optimistic updates
 */
export const useUserProfile = () => {
  const profile = useUserStore((state) => state.getDisplayProfile());
  const isLoadingProfile = useUserStore((state) => state.isLoadingProfile);
  const isSavingProfile = useUserStore((state) => state.isSavingProfile);
  const error = useUserStore((state) => state.error);
  const formData = useUserStore((state) => state.getFormData());
  
  const updateProfileOptimistic = useUserStore((state) => state.updateProfileOptimistic);
  const confirmProfileUpdate = useUserStore((state) => state.confirmProfileUpdate);
  const revertProfileUpdate = useUserStore((state) => state.revertProfileUpdate);
  const setLoadingProfile = useUserStore((state) => state.setLoadingProfile);
  const setSavingProfile = useUserStore((state) => state.setSavingProfile);
  const setError = useUserStore((state) => state.setError);

  return {
    profile,
    formData,
    isLoadingProfile,
    isSavingProfile,
    error,
    updateProfileOptimistic,
    confirmProfileUpdate,
    revertProfileUpdate,
    setLoadingProfile,
    setSavingProfile,
    setError,
  };
};



/**
 * Hook for form validation and error handling
 */
export const useUserFormValidation = () => {
  const validationErrors = useUserStore((state) => state.validationErrors);
  const hasValidationErrors = useUserStore((state) => state.hasValidationErrors());
  const getValidationError = useUserStore((state) => state.getValidationError);
  const setValidationError = useUserStore((state) => state.setValidationError);
  const clearValidationErrors = useUserStore((state) => state.clearValidationErrors);

  return {
    validationErrors,
    hasValidationErrors,
    getValidationError,
    setValidationError,
    clearValidationErrors,
  };
};

/**
 * Hook for UI state management
 */
export const useUserUIState = () => {
  const isEditing = useUserStore((state) => state.isEditing);
  const error = useUserStore((state) => state.error);
  
  const setEditing = useUserStore((state) => state.setEditing);
  const setError = useUserStore((state) => state.setError);
  const clearError = useUserStore((state) => state.clearError);
  const resetUIState = useUserStore((state) => state.resetUIState);

  return {
    isEditing,
    error,
    setEditing,
    setError,
    clearError,
    resetUIState,
  };
};

/**
 * Hook for optimistic update management
 */
export const useOptimisticUpdates = () => {
  const pendingOperations = useUserStore((state) => state.pendingOperations);
  const hasAnyPendingOperations = useUserStore((state) => state.hasAnyPendingOperations());
  const isOperationPending = useUserStore((state) => state.isOperationPending);
  
  const addPendingOperation = useUserStore((state) => state.addPendingOperation);
  const removePendingOperation = useUserStore((state) => state.removePendingOperation);
  const clearPendingOperations = useUserStore((state) => state.clearPendingOperations);

  return {
    pendingOperations,
    hasAnyPendingOperations,
    isOperationPending,
    addPendingOperation,
    removePendingOperation,
    clearPendingOperations,
  };
};

/**
 * Hook for authentication state
 */
export const useUserAuth = () => {
  const profile = useUserStore((state) => state.profile);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated());
  const logout = useUserStore((state) => state.logout);
  const reset = useUserStore((state) => state.reset);

  return {
    profile,
    isAuthenticated,
    logout,
    reset,
  };
};

/**
 * Hook for loading states
 */
export const useUserLoadingStates = () => {
  const isLoading = useUserStore((state) => state.isLoading);
  const isLoadingProfile = useUserStore((state) => state.isLoadingProfile);
  const isSaving = useUserStore((state) => state.isSaving);
  const isSavingProfile = useUserStore((state) => state.isSavingProfile);

  const setLoading = useUserStore((state) => state.setLoading);
  const setLoadingProfile = useUserStore((state) => state.setLoadingProfile);
  const setSaving = useUserStore((state) => state.setSaving);
  const setSavingProfile = useUserStore((state) => state.setSavingProfile);

  return {
    isLoading,
    isLoadingProfile,
    isSaving,
    isSavingProfile,
    setLoading,
    setLoadingProfile,
    setSaving,
    setSavingProfile,
  };
};

/**
 * Utility hook for common user operations
 */
export const useUserOperations = () => {
  const {
    updateProfileOptimistic,
    confirmProfileUpdate,
    revertProfileUpdate,
    setSavingProfile,
    setError,
  } = useUserProfile();

  const {
    addPendingOperation,
    removePendingOperation,
  } = useOptimisticUpdates();

  const {
    clearValidationErrors,
  } = useUserFormValidation();

  // Helper function to handle profile updates with optimistic UI
  const handleProfileUpdate = async (
    updates: Partial<UserProfile>,
    apiCall: () => Promise<UserProfile>,
    operationId: string = `profile-update-${Date.now()}`
  ) => {
    try {
      // Start optimistic update
      updateProfileOptimistic(updates);
      setSavingProfile(true);
      addPendingOperation(operationId);
      clearValidationErrors();

      // Make API call
      const updatedProfile = await apiCall();

      // Confirm update
      confirmProfileUpdate(updatedProfile);
      removePendingOperation(operationId);
    } catch (error) {
      // Revert on error
      revertProfileUpdate();
      removePendingOperation(operationId);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to update profile');
      }
      
      throw error;
    }
  };

  return {
    handleProfileUpdate,
  };
};