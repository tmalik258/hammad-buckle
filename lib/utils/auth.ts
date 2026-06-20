import { UserRole, type User } from '@prisma/client';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/utils/supabase/server';

export type AuthErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN';

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Extracts the authenticated user ID from the request
 * @returns Promise<string> - The user ID
 * @throws AuthError if user is not authenticated
 */
export async function getUserIdFromAuth(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError('UNAUTHORIZED', 'User not authenticated');
  }

  return user.id;
}

/**
 * Gets the authenticated user from Supabase
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
 * Loads the Prisma user row for the current Supabase session.
 */
export async function getCurrentUser(): Promise<User | null> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) return null;

  return prisma.user.findUnique({
    where: { id: authUser.id },
  });
}

/**
 * Checks if the current user is authenticated
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
 * Requires an authenticated session and returns the user ID.
 */
export async function requireAuth(): Promise<string> {
  return getUserIdFromAuth();
}

/**
 * Requires an active admin user. Redirects to login or unauthorized for pages.
 */
export async function requireAdmin(): Promise<User> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    redirect('/auth/login?next=/admin');
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || user.role !== UserRole.ADMIN || !user.isActive) {
    redirect('/unauthorized');
  }

  return user;
}

/**
 * API-safe admin check. Returns a NextResponse on failure, or the admin user on success.
 */
export async function assertAdminApi(): Promise<User | NextResponse> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || user.role !== UserRole.ADMIN || !user.isActive) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return user;
}

/**
 * Allows the current user to access their own record, or any record for admins.
 */
export async function assertSelfOrAdminApi(
  targetUserId: string
): Promise<User | NextResponse> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    if (authUser.id === targetUserId) {
      return { id: authUser.id, role: UserRole.CUSTOMER, isActive: true } as User;
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.isActive) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.id === targetUserId) {
    return user;
  }

  if (user.role === UserRole.ADMIN) {
    return user;
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * Allows admins to manage users, or authenticated users to create their own CUSTOMER profile.
 */
export async function assertAdminOrSelfCreateApi(input: {
  userId?: string;
  role?: UserRole;
}): Promise<{ actor: User; isAdmin: boolean } | NextResponse> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const actor = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (actor?.role === UserRole.ADMIN && actor.isActive) {
    return { actor, isAdmin: true };
  }

  if (input.userId && input.userId !== authUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (input.role && input.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!actor) {
    return { actor: { id: authUser.id } as User, isAdmin: false };
  }

  return { actor, isAdmin: false };
}
