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
import {
  AuthFormShell,
  authInputClassName,
  authLinkClassName,
  authMutedTextClassName,
} from "../../_components/auth-form-shell";

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
    <AuthFormShell title="Sign Up">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-zinc-900">Name</FormLabel>
                <FormControl>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    {...field}
                    className={authInputClassName}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-zinc-900">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                    className={authInputClassName}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormDescription className={`${authMutedTextClassName} text-xs`}>
                  We&apos;ll send a verification link to this email.
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-zinc-900">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Choose a password"
                      {...field}
                      className={`${authInputClassName} pr-12`}
                      disabled={form.formState.isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer transition-colors"
                    >
                      {showPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-zinc-900">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...field}
                      className={`${authInputClassName} pr-12`}
                      disabled={form.formState.isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full cursor-pointer rounded-none rounded-tr-2xl rounded-bl-2xl"
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

          <div className={`text-center ${authMutedTextClassName}`}>
            <span>Already have an account? </span>
            <Link href="/auth/login" className={authLinkClassName}>
              Log in
            </Link>
          </div>
        </form>
      </Form>
    </AuthFormShell>
  );
}
