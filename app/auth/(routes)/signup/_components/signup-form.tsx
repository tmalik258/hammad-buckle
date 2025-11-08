"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import { toast } from "sonner";
import { DashedSpinner } from "@/components/dashed-spinner";
import { redirect } from "next/navigation";

// Define the form schema using Zod
const formSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function SignupForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Initialize react-hook-form with Zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await signup(formData);
    if (result?.error) {
      console.log("Signup submission error:", result.error);
      toast.error(result.error);
    }
    if (result?.success) {
      toast.success(result.success);
      redirect("/auth/login");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Sign Up
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-medium">Name</FormLabel>
                  <FormControl>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      {...field}
                      className="w-full bg-transparent border border-border rounded-none rounded-tr-2xl rounded-bl-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter Email ID"
                      {...field}
                      className="w-full bg-transparent border border-border rounded-none rounded-tr-2xl rounded-bl-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs mt-1">
                    We&apos;ll send a verification link to this email.
                  </FormDescription>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a password"
                        {...field}
                        className="w-full bg-transparent border border-border rounded-none rounded-tr-2xl rounded-bl-2xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                        disabled={form.formState.isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      >
                        {showPassword ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-medium">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...field}
                        className="w-full bg-transparent border border-border rounded-none rounded-tr-2xl rounded-bl-2xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                        disabled={form.formState.isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      >
                        {showConfirmPassword ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            {/* Sign Up Button */}
            <Button
              type="submit"
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none rounded-tr-2xl rounded-bl-2xl"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <DashedSpinner invert={true} /> Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            {/* Login link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                href="/auth/login"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Log in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
