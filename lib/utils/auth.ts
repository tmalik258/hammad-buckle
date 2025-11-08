import { createClient } from '@/lib/utils/supabase/server';

/**
 * Extracts the authenticated user ID from the request
 * @param _request - The Next.js request object (unused in current implementation)
 * @returns Promise<string> - The user ID
 * @throws Error if user is not authenticated
 */
export async function getUserIdFromAuth(): Promise<string> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized: User not authenticated');
  }

  return user.id;
}

/**
 * Gets the authenticated user from Supabase
 * @returns Promise<User | null> - The authenticated user or null
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }

  return user;
}

/**
 * Checks if the current user is authenticated
 * @returns Promise<boolean> - True if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser();
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Middleware function to require authentication
 * @param request - The Next.js request object
 * @returns Promise<string> - The user ID if authenticated
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<string> {
  return await getUserIdFromAuth();
}