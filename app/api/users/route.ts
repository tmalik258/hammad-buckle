import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { assertAdminApi, assertAdminOrSelfCreateApi } from '@/lib/utils/auth';
import { syncUserRoleToSupabase } from '@/lib/utils/user-role';

// Validation schema for user creation/update
const userSchema = z.object({
  id: z.string().optional(), // Allow optional id for user creation
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.email('Invalid email address'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.CUSTOMER),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

const updateUserSchema = userSchema.partial();

// GET /api/users - Get users with optional filtering (Admin only)
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await assertAdminApi();
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const statusParamRaw = searchParams.get('status');
    const isActiveParamRaw = searchParams.get('isActive');
    const statusParam = statusParamRaw ? statusParamRaw.toUpperCase() : '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc').toLowerCase();

    const skip = (page - 1) * limit;

    const where: { role?: UserRole; isActive?: boolean; OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }> } = {};
    
    if (role) {
      where.role = role as UserRole;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Prefer explicit isActive query flag if present
    if (typeof isActiveParamRaw === 'string') {
      if (['true', '1'].includes(isActiveParamRaw.toLowerCase())) where.isActive = true;
      else if (['false', '0'].includes(isActiveParamRaw.toLowerCase())) where.isActive = false;
    } else {
      // Status filter: ACTIVE -> isActive true, INACTIVE -> isActive false
      if (statusParam && statusParam !== 'ALL') {
        if (statusParam === 'ACTIVE') where.isActive = true;
        else if (statusParam === 'INACTIVE') where.isActive = false;
      }
    }

    // Whitelist sortable fields to avoid invalid ORDER BY (e.g., totalSpent not in schema)
    const allowedSortFields = new Set(['createdAt', 'updatedAt', 'name', 'email']);
    const finalSortBy = allowedSortFields.has(sortBy) ? sortBy : 'createdAt';
    const finalSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[finalSortBy] = finalSortOrder;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              addresses: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const access = await assertAdminOrSelfCreateApi({
      userId: validatedData.id,
      role: validatedData.role,
    });
    if (access instanceof NextResponse) return access;

    const role = access.isAdmin
      ? validatedData.role
      : UserRole.CUSTOMER;

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    let userId = validatedData.id;

    // If password provided, create auth user in Supabase and sync id
    if (validatedData.password) {
      let supabase;
      try {
        supabase = createAdminClient();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Supabase admin client not configured';
        return NextResponse.json(
          { error: message },
          { status: 500 }
        );
      }
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: validatedData.email,
        password: validatedData.password,
        email_confirm: true,
        user_metadata: {
          name: validatedData.name,
          role,
        },
      });

      if (signUpError) {
        return NextResponse.json(
          { error: signUpError.message || 'Failed to create auth user' },
          { status: 400 }
        );
      }

      userId = signUpData.user?.id || userId;
    }

    const user = await prisma.user.create({
      data: {
        id: userId, // Use id from auth if available
        name: validatedData.name,
        email: validatedData.email,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (userId) {
      await syncUserRoleToSupabase(userId, role);
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}