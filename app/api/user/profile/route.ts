import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/utils/auth';
import { profileUpdateSchema } from '@/lib/validations/user-account-schema';
import { z } from 'zod';
import { ErrorLogger, ErrorClassifier, ApiErrorParser } from '@/lib/utils/error-handling';

/**
 * GET /api/user/profile
 * Fetches the authenticated user's profile data with addresses
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let context = {
    operation: 'get-user-profile',
    method: 'GET',
    url: request.url,
    timestamp: Date.now(),
    userId: ""
  };

  try {
    // Extract user ID from authentication
    const userId = await getUserIdFromAuth();
    context = { ...context, userId };

    // Fetch user profile with addresses
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: [
            { isDefault: 'desc' }, // Default addresses first
            { createdAt: 'desc' },  // Then by creation date
          ],
        },
      },
    });

    if (!user) {
      const error = new Error('User not found');
      ErrorLogger.logError(error, context);
      
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          details: 'The requested user profile could not be found'
        },
        { status: 404 }
      );
    }

    // Log successful operation
    const duration = Date.now() - startTime;
    ErrorLogger.logSuccess('get-user-profile', duration, context);

    // Return user profile data
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    ErrorLogger.logError(error, context);

    // Handle authentication errors
    if (ErrorClassifier.isAuthenticationError(error)) {
      return NextResponse.json(
        { 
          error: 'Unauthorized: Please log in to access your profile',
          code: 'AUTHENTICATION_REQUIRED',
          details: 'Valid authentication is required to access this resource'
        },
        { status: 401 }
      );
    }

    // Handle database connection errors
    if (error instanceof Error && error.message.includes('database')) {
      return NextResponse.json(
        { 
          error: 'Database temporarily unavailable',
          code: 'DATABASE_ERROR',
          details: 'Please try again in a few moments'
        },
        { status: 503 }
      );
    }

    // Handle rate limiting
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          details: 'Please wait before making another request'
        },
        { status: 429 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Failed to fetch user profile',
        code: 'INTERNAL_SERVER_ERROR',
        details: 'An unexpected error occurred while fetching your profile'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Updates the authenticated user's profile data
 */
export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  let context = {
    operation: 'update-user-profile',
    method: 'PUT',
    url: request.url,
    timestamp: Date.now(),
    userId: "",
  };

  try {
    // Extract user ID from authentication
    const userId = await getUserIdFromAuth();
    context = { ...context, userId };

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      ErrorLogger.logError(parseError, context);
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
          details: 'The request body must contain valid JSON'
        },
        { status: 400 }
      );
    }

    let validatedData;
    try {
      validatedData = profileUpdateSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        ErrorLogger.logError(validationError, context);
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
      throw validationError;
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email) {
      try {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: validatedData.email,
            id: { not: userId }, // Exclude current user
          },
        });

        if (existingUser) {
          const error = new Error('Email already in use');
          ErrorLogger.logError(error, context);
          
          return NextResponse.json(
            { 
              error: 'Email address is already in use by another account',
              code: 'EMAIL_ALREADY_EXISTS',
              details: 'Please choose a different email address'
            },
            { status: 400 }
          );
        }
      } catch (dbError) {
        ErrorLogger.logError(dbError, context);
        return NextResponse.json(
          {
            error: 'Unable to verify email availability',
            code: 'DATABASE_ERROR',
            details: 'Please try again in a few moments'
          },
          { status: 503 }
        );
      }
    }

    // Update user profile
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.email && { email: validatedData.email }),
          ...(validatedData.avatar !== undefined && { avatar: validatedData.avatar }),
        },
        include: {
          addresses: {
            orderBy: [
              { isDefault: 'desc' },
              { createdAt: 'desc' },
            ],
          },
        },
      });
    } catch (updateError) {
      ErrorLogger.logError(updateError, context);
      
      // Handle Prisma unique constraint errors
      if (updateError instanceof Error && updateError.message.includes('Unique constraint')) {
        return NextResponse.json(
          { 
            error: 'Email address is already in use',
            code: 'EMAIL_CONSTRAINT_VIOLATION',
            details: 'This email address is already associated with another account'
          },
          { status: 400 }
        );
      }

      // Handle user not found during update
      if (updateError instanceof Error && updateError.message.includes('Record to update not found')) {
        return NextResponse.json(
          {
            error: 'User not found',
            code: 'USER_NOT_FOUND',
            details: 'The user profile could not be found for updating'
          },
          { status: 404 }
        );
      }

      // Handle database connection errors
      if (updateError instanceof Error && updateError.message.includes('database')) {
        return NextResponse.json(
          {
            error: 'Database temporarily unavailable',
            code: 'DATABASE_ERROR',
            details: 'Please try again in a few moments'
          },
          { status: 503 }
        );
      }

      throw updateError;
    }

    // Log successful operation
    const duration = Date.now() - startTime;
    ErrorLogger.logSuccess('update-user-profile', duration, context);

    // Return updated user data
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        addresses: updatedUser.addresses,
      },
    });
  } catch (error) {
    ErrorLogger.logError(error, context);

    // Handle authentication errors
    if (ErrorClassifier.isAuthenticationError(error)) {
      return NextResponse.json(
        { 
          error: 'Unauthorized: Please log in to update your profile',
          code: 'AUTHENTICATION_REQUIRED',
          details: 'Valid authentication is required to update your profile'
        },
        { status: 401 }
      );
    }

    // Handle rate limiting
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          details: 'Please wait before making another request'
        },
        { status: 429 }
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Request timeout',
          code: 'REQUEST_TIMEOUT',
          details: 'The request took too long to process. Please try again.'
        },
        { status: 408 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Failed to update user profile',
        code: 'INTERNAL_SERVER_ERROR',
        details: 'An unexpected error occurred while updating your profile'
      },
      { status: 500 }
    );
  }
}