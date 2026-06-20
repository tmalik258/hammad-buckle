"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { forgotPassword } from "@/lib/actions/auth";
import { toast } from "sonner";
import { DashedSpinner } from "@/components/dashed-spinner";
import {
  AuthFormShell,
  authInputClassName,
  authLinkClassName,
  authMutedTextClassName,
} from "../../_components/auth-form-shell";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export function ForgotPasswordForm() {
  const [success, setSuccess] = React.useState(false);
  const searchParams = useSearchParams();
  const [urlError, setUrlError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      setUrlError(decodedError);
      toast.error(decodedError);
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("email", data.email);

    const result = await forgotPassword(formData);
    if (result?.error) {
      console.log("Forgot password submission error:", result.error);
      toast.error(result.error);
      return;
    }

    if (result?.success) {
      setSuccess(true);
      toast.success(result.success);
    }
  };

  if (success) {
    return (
      <AuthFormShell
        title="Check Your Email"
        description={`We've sent a password reset link to ${form.getValues("email")}.`}
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className={`space-y-2 ${authMutedTextClassName}`}>
            <p>Please check your email and click the reset link to create a new password.</p>
            <p>If you don&apos;t see the email, check your spam folder.</p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full cursor-pointer rounded-none rounded-tr-2xl rounded-bl-2xl">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full cursor-pointer rounded-none rounded-tr-2xl rounded-bl-2xl border-zinc-200"
              onClick={() => {
                setSuccess(false);
                form.reset();
              }}
            >
              Send Another Email
            </Button>
          </div>

          <div className={`text-center ${authMutedTextClassName}`}>
            <p>Need help? Contact support at</p>
            <a
              href="mailto:support@hammadbuckle.com"
              className={authLinkClassName}
            >
              support@hammadbuckle.com
            </a>
          </div>
        </div>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Forgot Password?"
      description="Enter your email address and we'll send you a link to reset your password."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {urlError ? (
            <Alert variant="destructive">
              <AlertDescription>{urlError}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-zinc-900">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    {...field}
                    className={authInputClassName}
                    disabled={form.formState.isSubmitting}
                  />
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
                <DashedSpinner invert={true} /> Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className={`${authLinkClassName} inline-flex items-center text-sm`}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back to Login
            </Link>
          </div>

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
