"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/utils/supabase/client';
import { useUserStore } from '@/lib/stores/user-store';
import { UserProfile } from '@/lib/types/user-account';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@prisma/client';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  const { profile: storeProfile, setProfile, logout } = useUserStore();
  const supabase = createClient();

  
  // Create user profile in Prisma database with immediate store sync
  const createUserProfile = useCallback(async (user: User, mounted: boolean) => {
    try {
      // Create basic profile immediately for UI
      const basicProfile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar: user.user_metadata?.avatar_url,
        role: (user.user_metadata?.role === 'ADMIN' ? UserRole.ADMIN : UserRole.CUSTOMER),
        isActive: true,
        stripeCustomerId: user.user_metadata?.stripeCustomerId,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at || user.created_at),
      };

      // Update store immediately
      setProfile(basicProfile);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || null,
          avatar: user.user_metadata?.avatar_url || null,
          role: 'CUSTOMER', // Use valid UserRole enum value
        }),
      });

      if (response.ok) {
        const profile = await response.json();
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            user,
            profile,
            isLoading: false,
            error: null,
            isInitialized: true,
          }));
          setProfile(profile);
        }
      } else {
        throw new Error('Failed to create user profile');
      }
    } catch (err) {
      console.log('Error creating user profile:', err);
      if (mounted) {
        setAuthState(prev => ({
          ...prev,
          user,
          profile: null,
          isLoading: false,
          error: 'Failed to create user profile',
          isInitialized: true,
        }));
      }
    }
  }, [setProfile]);

  // Optimized profile fetching with immediate store sync and cache-busting
  const fetchUserProfile = useCallback(async (user: User, mounted: boolean, forceRefresh = false) => {
    try {
      // First, sync basic user data to store immediately for UI responsiveness
      const basicProfile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar: user.user_metadata?.avatar_url || null,
        role: (user.user_metadata?.role === 'ADMIN' ? UserRole.ADMIN : UserRole.CUSTOMER),
        isActive: true,
        stripeCustomerId: user.user_metadata?.stripeCustomerId || null,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at || user.created_at),
      };

      // Update store immediately for instant UI updates
      setProfile(basicProfile);

      // Update local state with user info and basic profile
      if (mounted) {
        setAuthState(prev => ({
          ...prev,
          user,
          profile: basicProfile,
          isLoading: false,
          error: null,
          isInitialized: true,
        }));
      }

      // Then fetch full profile from database with cache-busting headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add cache-busting headers for force refresh or after profile updates
      if (forceRefresh) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }

      const response = await fetch(`/api/users/${user.id}?t=${Date.now()}`, {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        const fullProfile = await response.json();
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            profile: fullProfile,
          }));
          setProfile(fullProfile);
        }
      } else if (response.status === 404) {
        // User doesn't exist in database, create them
        await createUserProfile(user, mounted);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (err) {
      console.log('Error fetching user profile:', err);
      if (mounted) {
        setAuthState(prev => ({
          ...prev,
          user,
          profile: null,
          isLoading: false,
          error: 'Failed to fetch user profile',
          isInitialized: true,
        }));
      }
    }
  }, [setProfile, createUserProfile]);

  useEffect(() => {
    let mounted = true;

    // Get initial session with optimized loading
    const getInitialSession = async () => {
      try {
        // Check if we already have a profile in store
        const currentStoreProfile = storeProfile;
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Error getting session:', error);
          if (mounted) {
            setAuthState(prev => ({ 
              ...prev, 
              error: error.message, 
              isLoading: false,
              isInitialized: true 
            }));
          }
          return;
        }

        if (session?.user) {
          // If we have a store profile that matches, use it immediately
          if (currentStoreProfile && currentStoreProfile.id === session.user.id) {
            if (mounted) {
              setAuthState(prev => ({
                ...prev,
                user: session.user as User,
                profile: currentStoreProfile,
                isLoading: false,
                isInitialized: true,
                error: null,
              }));
            }
            // Still fetch fresh data in background
            await fetchUserProfile(session.user, mounted);
          } else {
            await fetchUserProfile(session.user, mounted);
          }
        } else {
          if (mounted) {
            setAuthState(prev => ({ 
              ...prev, 
              user: null, 
              profile: null, 
              isLoading: false,
              isInitialized: true 
            }));
            logout(false); // Don't show toast for automatic logout
          }
        }
      } catch (err) {
        console.log('Error in getInitialSession:', err);
        if (mounted) {
          setAuthState(prev => ({ 
            ...prev, 
            error: 'Failed to get session', 
            isLoading: false,
            isInitialized: true 
          }));
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Immediate UI update with basic user data
          const basicProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata?.avatar_url || null,
            role: (session.user.user_metadata?.role === 'ADMIN' ? UserRole.ADMIN : UserRole.CUSTOMER),
            isActive: true,
            stripeCustomerId: session.user.user_metadata?.stripeCustomerId || null,
            createdAt: new Date(session.user.created_at),
            updatedAt: new Date(session.user.updated_at || session.user.created_at),
          };

          if (mounted) {
            setAuthState(prev => ({
              ...prev,
              user: session.user,
              profile: basicProfile,
              isLoading: false,
              isInitialized: true,
              error: null,
            }));
            setProfile(basicProfile);
          }

          // Fetch full profile in background
          await fetchUserProfile(session.user, mounted);
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              isLoading: false,
              error: null,
              isInitialized: true,
            });
            logout(false); // Don't show toast for automatic logout
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Update user data but keep existing profile
          if (mounted) {
            setAuthState(prev => ({
              ...prev,
              user: session.user,
              isInitialized: true,
            }));
          }
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, setProfile, logout, fetchUserProfile]);

  // Force refresh profile data with cache-busting
  const refreshProfile = useCallback(async () => {
    const { user } = authState;
    if (user) {
      await fetchUserProfile(user, true, true);
    }
  }, [authState.user, fetchUserProfile]);

  return {
    ...authState,
    isAuthenticated: !!authState.user,
    refreshProfile,
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.log('Error signing out:', error);
          setAuthState(prev => ({ ...prev, error: error.message }));
        }
      } catch (err) {
        console.log('Error in signOut:', err);
        setAuthState(prev => ({ ...prev, error: 'Failed to sign out' }));
      }
    },
  };
}