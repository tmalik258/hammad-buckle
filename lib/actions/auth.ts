"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { createClient } from "@/lib/utils/supabase/server";
import { syncUserFromAuth, getUserById } from "@/lib/services/user-service";
import { getSiteUrl } from "@/lib/utils/site-url";
import { syncUserRoleToSupabase } from "@/lib/utils/user-role";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const next = (formData.get("next") as string) || "/";

  const { data: signInData, error } = await supabase.auth.signInWithPassword(
    data
  );

  console.log("User signed in:", signInData?.user?.email)

  if (error) {
    console.log("Login error:", error.message);
    return { error: error.message };
  }

  let redirectTo = next;

  if (signInData.user) {
    try {
      await syncUserFromAuth(signInData.user);
      console.log("User synced to database:", signInData.user.email);

      const dbUser = await getUserById(signInData.user.id);
      if (dbUser?.role === UserRole.ADMIN && dbUser.isActive) {
        await syncUserRoleToSupabase(signInData.user.id, UserRole.ADMIN);
        redirectTo = next.startsWith("/admin") ? next : "/admin";
      }
    } catch (syncError) {
      console.log("Error syncing user to database:", syncError);
    }
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    fullName: (formData.get("fullName") as string) || null,
  };

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.fullName,
      }
    }
  });

  if (signUpError) {
    console.log("Sign up error:", signUpError.message);
    return { error: signUpError.message };
  }

  if (signUpData.user) {
    console.log("User signed up:", signUpData?.user?.email);
    
    // Sync user data to Prisma database after successful signup
    try {
      await syncUserFromAuth(signUpData.user);
      console.log("User synced to database:", signUpData.user.email);
    } catch (syncError) {
      console.log("Error syncing user to database:", syncError);
      // Don't fail the signup if sync fails, just log the error
    }
  } else {
    console.log("No user data in session:", data);
    return { error: "No user data in session" };
  }

  return { success: "Verification email sent. Please check your inbox." };
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const siteUrl = await getSiteUrl();
  if (!siteUrl) {
    console.log(
      "Forgot password error: unable to resolve site URL (set NEXT_PUBLIC_SITE_URL or ensure request host headers are available)"
    );
    return { error: "Server configuration error. Please contact support." };
  }

  // Redirect through confirm route to verify token first
  const redirectTo = `${siteUrl}/auth/confirm?next=/auth/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.log("Forgot password error:", error.message);
    return { error: error.message };
  }

  console.log("Password reset email sent to:", email);
  return { success: "Password reset email sent successfully" };
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log("Sign out error:", error.message);
    return { error: error.message };
  }

  console.log("User signed out successfully");

  revalidatePath("/", "layout");
  return { success: "Signed out successfully" };
}
