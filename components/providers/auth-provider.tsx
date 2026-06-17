"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/utils/supabase/client';
import { useUserStore } from '@/lib/stores/user-store';
import type { User } from '@supabase/supabase-js';
import { UserRole } from '@prisma/client';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({ isInitialized: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setProfile, logout, profile } = useUserStore();

  useEffect(() => {
    const supabase = createClient();

    // Function to sync Supabase user with Zustand store
    const syncAuthState = (user: User | null) => {
      const currentProfile = profile;
      
      if (user && !currentProfile) {
        // User is authenticated in Supabase but not in store
        const userProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          avatar: user.user_metadata?.avatar_url,
          role: (user.user_metadata?.role === 'ADMIN' ? UserRole.ADMIN : UserRole.CUSTOMER),
          isActive: true,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at || user.created_at),
        };
        setProfile(userProfile);
      } else if (!user && currentProfile) {
        // User is not authenticated in Supabase but exists in store
        logout(false); // Don't show toast for automatic logout
      } else if (user && currentProfile && user.id !== currentProfile.id) {
        // Different user logged in, update the profile
        const userProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          avatar: user.user_metadata?.avatar_url,
          role: (user.user_metadata?.role === 'ADMIN' ? UserRole.ADMIN : UserRole.CUSTOMER),
          isActive: true,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at || user.created_at),
        };
        setProfile(userProfile);
      }
    };

    // Check initial auth state
    const checkInitialAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      syncAuthState(user);
      setIsInitialized(true);
    };

    checkInitialAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        syncAuthState(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};