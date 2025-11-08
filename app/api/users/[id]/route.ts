import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, UserRole } from '@prisma/client';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { z } from 'zod';

// Validation schema for user update
const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.email('Invalid email address').optional(),
  avatar: z.url('Invalid avatar URL').optional(),
  role: z.enum(UserRole).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/users/[id] - Get a single user
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const selectExtra: Partial<Prisma.UserSelect> = {
      _count: {
        select: {
          orders: true,
          reviews: true,
          addresses: true,
          cartItems: true,
          wishlistItems: true,
        },
      },
    };

    if (includeStats === 'true') {
      (selectExtra as Prisma.UserSelect).orders = {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      };
      
      (selectExtra as Prisma.UserSelect).reviews = {
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          verified: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      };
      
      (selectExtra as Prisma.UserSelect).addresses = {
        select: {
          id: true,
          type: true,
          street: true,
          city: true,
          area: true,
          postalCode: true,
          isDefault: true,
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        ...selectExtra,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const validatedData = updateUserSchema.parse(body);
    type UpdateUserBody = z.infer<typeof updateUserSchema>;
    const { password, ...updates } = validatedData as UpdateUserBody;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is being updated and if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        );
      }
    }

    const updateData: Partial<{
      name: string;
      email: string;
      avatar: string;
      role: string;
      isActive: boolean;
      emailVerified: Date;
    }> = { ...validatedData };

    // Update auth password if provided
    if (password) {
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
      const { error: pwdError } = await supabase.auth.admin.updateUserById(id, { password });
      if (pwdError) {
        return NextResponse.json(
          { error: pwdError.message || 'Failed to update password' },
          { status: 400 }
        );
      }
    }

    let user;
    const select: Prisma.UserSelect = {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
          reviews: true,
          addresses: true,
          cartItems: true,
          wishlistItems: true,
        },
      },
    };
    try {
      user = await prisma.user.update({
        where: { id },
        data: updates as Prisma.UserUpdateInput,
        select,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      const code = err instanceof Prisma.PrismaClientKnownRequestError ? err.code : '';
      const looksLikeMissingColumn = code === 'P2022' || message.includes('column') && message.includes('isactive') && message.includes('does not exist');
      if (looksLikeMissingColumn) {
        const { isActive, ...rest } = updates;
        user = await prisma.user.update({
          where: { id },
          data: rest as Prisma.UserUpdateInput,
          select,
        });
      } else {
        throw err;
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Support PATCH method for partial updates from client
export async function PATCH(
  request: NextRequest,
  ctx: RouteParams
) {
  return PUT(request, ctx);
}

// DELETE /api/users/[id] - Delete a user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            addresses: true,
            cartItems: true,
            wishlistItems: true,
            promoCodeUsages: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has orders or reviews (prevent deletion if they do)
    if (existingUser._count.orders > 0 || existingUser._count.reviews > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing orders or reviews' },
        { status: 400 }
      );
    }

    // Delete user and related data (simplified approach without transaction)
    try {
      // Delete user's wishlist items
      await prisma.wishlistItem.deleteMany({
        where: { userId: id },
      });

      // Delete user's cart items
      await prisma.cartItem.deleteMany({
        where: { userId: id },
      });

      // Delete user's addresses
      await prisma.address.deleteMany({
        where: { userId: id },
      });

      // Delete user's promo code usages
      await prisma.promoCodeUsage.deleteMany({
        where: { userId: id },
      });

      // Delete the user
      await prisma.user.delete({ where: { id } });
    } catch (deleteError) {
      console.log('Error during user deletion:', deleteError);
      // If deletion fails, try to delete just the user (cascade should handle relations)
      await prisma.user.delete({ where: { id } });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}