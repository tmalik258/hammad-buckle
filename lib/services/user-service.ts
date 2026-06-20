import { prisma } from "@/lib/prisma";
import { Prisma, UserRole } from "@prisma/client";

export interface CreateUserData {
  id: string;
  email: string;
  name?: string | null;
  role?: UserRole;
}

/**
 * Check if a user exists by email
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
    return user;
  } catch (error) {
    console.log("Error checking user existence:", error);
    throw new Error("Failed to check user existence");
  }
}

/**
 * Check if a user exists by ID
 */
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    console.log("Error fetching user by ID:", error);
    throw new Error("Failed to fetch user");
  }
}

/**
 * Create a new user in the database
 */
export async function createUser(userData: CreateUserData) {
  try {
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      console.log("User already exists:", userData.email);
      return existingUser;
    }

    const newUser = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email.toLowerCase(),
        name: userData.name,
        role: userData.role || UserRole.CUSTOMER,
      },
    });

    console.log("User created successfully:", newUser.email);
    return newUser;
  } catch (error) {
    console.log("Error creating user:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const existingUser = await getUserByEmail(userData.email);
        if (existingUser) {
          console.log("User already exists (caught by unique constraint):", userData.email);
          return existingUser;
        }
      }
    }

    throw new Error("Failed to create user");
  }
}

/**
 * Update user information
 */
export async function updateUser(id: string, updateData: Partial<Omit<CreateUserData, 'id'>>) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        email: updateData.email ? updateData.email.toLowerCase() : undefined,
      },
    });

    console.log("User updated successfully:", updatedUser.email);
    return updatedUser;
  } catch (error) {
    console.log("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

/**
 * Sync user data from Supabase auth to Prisma database
 */
export async function syncUserFromAuth(authUser: {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
}) {
  if (!authUser.email) {
    throw new Error("User email is required for sync");
  }

  const existingUser = await getUserById(authUser.id);

  if (existingUser) {
    return updateUser(authUser.id, {
      name: authUser.user_metadata?.name || existingUser.name,
    });
  }

  const userData: CreateUserData = {
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name || null,
    role: UserRole.CUSTOMER,
  };

  return createUser(userData);
}
