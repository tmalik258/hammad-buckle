import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { z } from 'zod';

// Validation schema for password change request
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter, and one number'),
});

/**
 * POST /api/user/change-password
 * Changes the authenticated user's password
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    // Validate the request data
    let validatedData;
    try {
      validatedData = changePasswordSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.log('Validation errors:', validationError.issues);
        return NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: validationError.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          { status: 400 }
        );
      }
      console.log('Validation errors:', validationError);
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: "Error occurred while validating the form",
        },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Verify current password by attempting to sign in with it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validatedData.currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        {
          error: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD',
        },
        { status: 400 }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.newPassword,
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to update password',
          code: 'UPDATE_FAILED',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Password updated successfully',
        success: true,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error in change password:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}