"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/hero-section";
import { ErrorComponent } from "@/components/ui/error-component";
import { MyAccountSkeleton } from "./_components/my-account-skeleton";
import {
  useUserProfile,
  useUpdateProfile,
  useCacheWarming,
} from "@/lib/hooks/useUserAccount";
import { useOptimisticProfile } from "@/lib/hooks/useOptimisticProfile";
import { useUserStore } from "@/lib/stores/user-store";
import { type UserAccountFormData } from "@/lib/validations/user-account-schema";
import { userProfileFormToApi } from "@/lib/utils/user-account-utils";
import {
  UserFeedbackManager,
  ErrorLogger,
  ErrorClassifier,
  FallbackManager,
} from "@/lib/utils/error-handling";
import {
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { PictureChangeModal } from "./_components/picture-change-modal";
import { ChangePasswordModal } from "./_components/change-password-modal";
import { ProfileEditModal } from "./_components/profile-edit-modal";
import ProfileHeader from "./_components/profile-header";
import ProfileOverview from "./_components/profile-overview";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProfileInfoCard } from "./_components/profile-info-card";
import { PaymentMethods } from "./_components/payment-methods";
import { UserProfile } from "@/lib/types";
import { AxiosError } from "axios";

export default function MyAccountPage() {
  const { profile, isAuthenticated, refreshProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // State for error handling and network status
  const [lastError, setLastError] = useState<Error | null>(null);

  // Enhanced useUserProfile with cache-busting
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
    isRefetching,
  } = useUserProfile({
    enabled: !!profile?.id,
    staleTime: 0, // Always consider data stale for fresh fetches
  });

  // Optimistic updates hook
  const { updateOptimistically, cacheManager } = useOptimisticProfile();

  // Cache warming strategies
  const cacheWarming = useCacheWarming();

  const updateProfileMutation = useUpdateProfile({
    onMutate: async (variables) => {
      // Clear previous errors
      setLastError(null);

      // Perform optimistic update before mutation
      const optimisticResult = updateOptimistically(variables, {
        showToast: false, // We'll handle toasts in the mutation callbacks
        autoRollbackDelay: 30000, // 30 seconds auto-rollback
      });

      return { optimisticResult };
    },
    onSuccess: async (data) => {
      setLastError(null);

      // Invalidate cache for consistency
      cacheManager.invalidateProfile();

      // Invalidate and refetch profile data with cache-busting
      await refetchProfile();

      // Also refresh auth profile data
      if (refreshProfile) {
        await refreshProfile();
      }

      // Clear any cached data
      if (typeof window !== "undefined") {
        localStorage.removeItem("user-storage");
      }

      toast.success("Profile updated successfully");

      // Log successful operation
      ErrorLogger.logSuccess("profile-update", undefined, {
        operation: "my-account-page-profile-update",
        userId: data.id,
      });
    },
    onError: (error) => {
      setLastError(error);

      // Enhanced error handling with classification
      ErrorLogger.logError(error, {
        operation: "my-account-page-profile-update",
        timestamp: Date.now(),
      });

      // Handle different types of errors appropriately
      if (ErrorClassifier.isValidationError(error)) {
        // Validation errors are handled by the form component
        return;
      }

      if (ErrorClassifier.isAuthenticationError(error)) {
        UserFeedbackManager.showError(
          error,
          "Please log in to update your profile."
        );
        return;
      }

      if (ErrorClassifier.isNetworkError(error)) {
        const networkError = error as AxiosError;
        if (networkError.status === 429) {
          UserFeedbackManager.showError(
            error,
            "Too many requests. Please wait a moment and try again."
          );
        } else if (networkError.status && networkError.status >= 500) {
          UserFeedbackManager.showRetryPrompt(
            error,
            () => formData && handleProfileRetry(formData)
          );
        } else {
          UserFeedbackManager.showError(
            error,
            "Network error. Please check your connection and try again."
          );
        }
        return;
      }

      // Default error handling
      UserFeedbackManager.showError(
        error,
        "Failed to update profile. Please try again."
      );

      // Trigger error recovery cache strategy
      cacheManager.recoverFromError();
    },
  });

  // Zustand store for UI state management
  const { getFormData, getDisplayProfile } = useUserStore();

  // State for picture change modal
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);

  // State for change password modal
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  // State for profile edit modal
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Account", isActive: true },
  ];

  // Get form data from Zustand store (includes optimistic updates)
  const formData = getFormData();

  const fallbackProfile = FallbackManager.getFallbackData<UserProfile>("user-profile");

  // Use fallback data if main data is not available
  const displayUserProfile: UserProfile | null = userProfile || fallbackProfile;

  // Get display profile (includes optimistic updates)
  const displayProfile: UserProfile | null = getDisplayProfile() || displayUserProfile;

  // Handle profile form submission with comprehensive error handling
  const handleProfileSubmit = async (data: UserAccountFormData) => {
    const context = {
      operation: "profile-form-submit",
      timestamp: Date.now(),
    };

    try {
      // Clear previous errors
      setLastError(null);

      // Validate required fields with enhanced error messages
      if (!data.name.trim()) {
        const validationError = new Error("Full name is required");
        setLastError(validationError);
        UserFeedbackManager.showError(validationError);
        return;
      }

      if (!data.email.trim()) {
        const validationError = new Error("Email is required");
        setLastError(validationError);
        UserFeedbackManager.showError(validationError);
        return;
      }

      // Combine name for API
      const fullName = data.name.trim();

      const updateData = {
        name: fullName,
        email: data.email.trim(),
        // Preserve existing avatar if not provided in form data
        avatar: data.avatar?.trim() || displayProfile?.avatar || null,
      };

      // Update profile using TanStack Query mutation with optimistic updates
      await updateProfileMutation.mutateAsync(updateData);
    } catch (error) {
      setLastError(error as Error);
      ErrorLogger.logError(error, context);

      // Error handling is primarily done in the mutation hook
      // but we log here for additional context
    }
  };

  // Enhanced profile refresh with cache-busting
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);

      // Force cache invalidation and refresh
      if (typeof window !== "undefined") {
        // Clear any cached profile data
        localStorage.removeItem("user-storage");

        // Add cache-busting to the refetch
        await refetchProfile();

        // Also refresh auth profile data
        if (refreshProfile) {
          await refreshProfile();
        }
      }

      toast.success("Profile refreshed successfully");
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast.error("Failed to refresh profile");
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchProfile, refreshProfile]);

  // Handle retry for profile loading errors
  const handleRetry = () => {
    setLastError(null);

    ErrorLogger.logSuccess("retry-attempt", undefined, {
      operation: "my-account-page-retry",
    });

    refetchProfile();
    // Also warm the cache for better performance
    cacheWarming.warmOnFocus();
  };

  // Handle retry for profile update errors
  const handleProfileRetry = (variables: UserAccountFormData) => {
    setLastError(null);
    updateProfileMutation.mutate(userProfileFormToApi(variables));
  };

  // Handle picture update from modal
  const handlePictureUpdate = async (newImageUrl: string) => {
    if (!displayProfile) return;

    const updatedData: UserAccountFormData = {
      name: displayProfile.name || "", // Preserve full name instead of truncating to first word
      email: displayProfile.email,
      avatar: newImageUrl,
    };

    try {
      await updateProfileMutation.mutateAsync(
        userProfileFormToApi(updatedData)
      );
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  // Get fallback data if available
  const hasAnyProfileData = userProfile || fallbackProfile;

  // Loading state - show skeleton while loading profile
  if (isLoadingProfile && !hasAnyProfileData) {
    return <MyAccountSkeleton />;
  }

  // If no profile data and not loading, show error with fallback handling
  if (!hasAnyProfileData && !isLoadingProfile) {
    return (
      <ErrorComponent
        title="Profile not found"
        message="Unable to load your profile data. Please try logging in again."
        onRefresh={handleRetry}
      />
    );
  }

  return (
    <div className="min-h-screen md:pt-20">
      {/* Error Alert */}
      {lastError && !isLoadingProfile && (
        <div className="bg-red-600 text-white p-2 text-center text-sm">
          <div className="container mx-auto flex items-center justify-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>
              {ErrorClassifier.isNetworkError(lastError)
                ? "Network error detected. Some data may be outdated."
                : "An error occurred. Some features may not work properly."}
            </span>
            {ErrorClassifier.isRetryableError(lastError) && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="ml-2 h-6 text-xs border-white text-white hover:bg-white hover:text-red-600"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="container mx-auto py-8">
        <HeroSection
          title="Welcome back!"
          subtitle='"Manage your account, order, and preferences"'
          description=""
          imageSrc="/images/fizzy-avatar.png"
          imageAlt="Welcome back illustration"
          breadcrumbItems={breadcrumbItems}
          showBreadcrumb={true}
          showToggleButton={false}
        />
      </div>

      {/* Welcome Header */}
      <ProfileHeader
        avatar={displayProfile?.avatar}
        name={displayProfile?.name?.split(" ")[0]}
        onEditClick={() => setIsPictureModalOpen(true)}
      />

      {/* Profile Overview */}
      <ProfileOverview
        avatar={displayProfile?.avatar}
        name={displayProfile?.name || undefined}
        email={displayProfile?.email}
        onEditProfileClick={() => setIsProfileEditModalOpen(true)}
        onChangePasswordClick={() => setIsChangePasswordModalOpen(true)}
      />

      {/* Profile Overview */}
      <ProfileInfoCard displayProfile={displayProfile} />

      {/* Payment Methods */}
      <PaymentMethods />

      {/* Picture Change Modal */}
      <PictureChangeModal
        isOpen={isPictureModalOpen}
        onClose={() => setIsPictureModalOpen(false)}
        currentImageUrl={displayProfile?.avatar}
        onImageUpdate={handlePictureUpdate}
        isLoading={updateProfileMutation.isPending}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditModalOpen}
        onClose={() => setIsProfileEditModalOpen(false)}
        currentProfile={displayProfile || undefined}
        onProfileUpdate={handleProfileSubmit}
        isLoading={updateProfileMutation.isPending}
      />
    </div>
  );
}
