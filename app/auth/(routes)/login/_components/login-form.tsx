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
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { toast } from "sonner";
import { DashedSpinner } from "@/components/dashed-spinner";
import { useSearchParams } from "next/navigation";
import {
  AuthFormShell,
  authInputClassName,
  authLinkClassName,
  authMutedTextClassName,
} from "../../_components/auth-form-shell";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("next", next);

    const result = await login(formData);
    if (result?.error) {
      console.log("Login submission error:", result.error);
      toast.error(result.error);
    }
  };

  return (
    <AuthFormShell title="Log In">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      placeholder="Enter your password"
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

          <div className="flex items-center justify-end">
            <Link href="/auth/forgot-password" className={authLinkClassName}>
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer rounded-none rounded-tr-2xl rounded-bl-2xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <DashedSpinner invert={true} /> Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>

          <div className={`text-center ${authMutedTextClassName}`}>
            <span>Don&apos;t have an account? </span>
            <Link href="/auth/signup" className={authLinkClassName}>
              Sign up
            </Link>
          </div>
        </form>
      </Form>
    </AuthFormShell>
  );
}
