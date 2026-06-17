"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  Plus,
  Package,
  Users,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/utils/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUserStore } from "@/lib/stores/user-store";
import { EnhancedImage } from "@/components/ui/enhanced-image";
import { useMemo, useCallback, useState } from "react";
import CustomerFormModal from "../customers/_components/customer-form-modal";
import ProductFormModal from "../products/_components/product-form-modal";
import OrderFormModal from "../orders/_components/order-form-modal";
import { GlobalSearch } from "./global-search";

export function AdminHeader() {
  const router = useRouter();
  const supabase = createClient();
  const { logout } = useUserStore();
  const { isAuthenticated, user, profile, isLoading, isInitialized } =
    useAuth();

  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // Optimized user display data with immediate fallbacks
  const profileName = (profile as unknown as { name?: string })?.name;
  const profileAvatar = (profile as unknown as { avatar?: string | null })?.avatar || null;
  const userDisplayData = useMemo(() => {
    // Priority order: profile data -> user metadata -> email fallback -> default
    const displayName =
      profileName ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Admin User";

    const displayAvatar =
      profileAvatar || user?.user_metadata?.avatar_url || null;

    const initials = displayName
      .split(" ")
      .map((n: string[]) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      name: displayName,
      avatar: displayAvatar,
      initials,
      email: user?.email || "admin@hammadbuckle.com",
    };
  }, [profile, user]);

  // More precise loading state management
  const shouldShowLoading = useMemo(() => {
    // Don't show loading if we have any user data to display
    if (profileName || user?.email) {
      return false;
    }

    // Show loading only if we're actively loading and have no fallback data
    return isLoading && !isInitialized;
  }, [isLoading, isInitialized, profile, user]);

  // Error state management
  const hasError = !isAuthenticated && isInitialized && !isLoading;

  // Handle error recovery
  const handleRetryAuth = useCallback(async () => {
    try {
      // Trigger a fresh auth check
      window.location.reload();
    } catch (error) {
      console.error("Failed to retry authentication:", error);
      toast.error("Failed to retry authentication");
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await logout(true); // Show toast message
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-6">
      {/* Left side - Mobile hamburger space */}
      <div className="lg:hidden w-12 flex-shrink-0"></div>

      {/* Spacer to push content to the right */}
      <div className="flex-1" />

      {/* Right side - Search, Quick Actions and User Menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search moved to the right side */}
        <div className="hidden md:block md:w-[480px] lg:w-[560px] xl:w-[640px]">
          <GlobalSearch />
        </div>

        {/* Quick Add */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsAddProductOpen(true)}>
              <Package className="h-4 w-4 mr-2" />
              Add Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddUserOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Add Customer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddOrderOpen(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 p-0 bg-gradient-to-b from-[#9793FE] to-[#F93DAE] border-none shadow-2xl rounded-3xl overflow-hidden z-[1000]"
          >
          {/* User Profile Header */}
          <div className="p-6 pb-4">
            {hasError ? (
              // Error State
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-300" />
                </div>
                <div className="text-white">
                  <p className="text-lg font-medium text-red-300">
                    Authentication Error
                  </p>
                  <button
                    onClick={handleRetryAuth}
                    className="text-sm text-white/80 hover:text-white flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              // Normal State
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                  {shouldShowLoading ? (
                    <div className="w-full h-full bg-white/20 animate-pulse rounded-full" />
                  ) : (
                    <EnhancedImage
                      src={userDisplayData.avatar}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="w-full h-full"
                      fallbackInitial={userDisplayData.initials}
                      priority={true}
                    />
                  )}
                </div>
                <div className="text-white">
                  {shouldShowLoading ? (
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-white/20 animate-pulse rounded" />
                      <div className="h-4 w-40 bg-white/20 animate-pulse rounded" />
                    </div>
                  ) : (
                    <>
                      <p className="text-lg font-medium">
                        {userDisplayData.name}
                      </p>
                      <p className="text-sm text-white/80">
                        {userDisplayData.email}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-px bg-white/20 mx-6"></div>

          {/* Menu Items */}
          <div className="p-6 pt-4 space-y-2">
            <DropdownMenuItem
              asChild
              className="p-0 focus:bg-white/10 rounded-xl"
              disabled={hasError}
            >
              <button
                onClick={() => router.push("/admin/profile")}
                className="flex items-center w-full px-4 py-3 text-white text-lg font-medium hover:bg-white/10 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={hasError}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="p-0 focus:bg-white/10 rounded-xl"
              disabled={hasError}
            >
              <button
                onClick={() => router.push("/admin/settings")}
                className="flex items-center w-full px-4 py-3 text-white text-lg font-medium hover:bg-white/10 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={hasError}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="p-0 focus:bg-white/10 rounded-xl"
            >
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 text-white text-lg font-medium hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </DropdownMenuItem>
          </div>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {/* Modals */}
      <CustomerFormModal 
        open={isAddUserOpen} 
        onOpenChange={setIsAddUserOpen} 
      />
      <ProductFormModal 
        open={isAddProductOpen} 
        onOpenChange={setIsAddProductOpen}
        mode="create"
      />
      <OrderFormModal 
        open={isAddOrderOpen} 
        onOpenChange={setIsAddOrderOpen}
        mode="create"
      />
    </header>
  );
}
