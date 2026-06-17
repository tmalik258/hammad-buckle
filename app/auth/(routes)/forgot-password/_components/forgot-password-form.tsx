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

// Define the form schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export function ForgotPasswordForm() {
  const [success, setSuccess] = React.useState(false);
  const searchParams = useSearchParams();
  const [urlError, setUrlError] = React.useState<string | null>(null);

  // Check for error parameter from URL (e.g., from confirm route redirect)
  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      setUrlError(decodedError);
      toast.error(decodedError);
    }
  }, [searchParams]);

  // Initialize react-hook-form with Zod validation
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
      <div className="w-full max-w-md mx-auto">
        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-400/30">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-300 text-sm">
              We&apos;ve sent a password reset link to{' '}
              <span className="font-medium text-white">{form.getValues("email")}</span>
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-sm text-gray-300 space-y-2">
              <p>Please check your email and click the reset link to create a new password.</p>
              <p>If you don&apos;t see the email, check your spam folder.</p>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full cursor-pointer">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full bg-transparent border border-purple-400/50 text-white hover:bg-purple-500/10 rounded-3xl py-3 cursor-pointer"
                onClick={() => {
                  setSuccess(false);
                  form.reset();
                }}
              >
                Send Another Email
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              <p>Need help? Contact support at</p>
              <a 
                href="mailto:support@hammadbuckle.com" 
                className="text-purple-300 hover:text-purple-200 underline cursor-pointer"
              >
                support@hammadbuckle.com
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-300 text-sm">
            No worries! Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert from URL */}
            {urlError && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                <AlertDescription className="text-red-200">{urlError}</AlertDescription>
              </Alert>
            )}
            
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                      className="w-full bg-transparent border border-purple-400/50 rounded-none rounded-tr-2xl rounded-bl-2xl px-4 py-3 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full cursor-pointer"
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

            {/* Back to login link */}
            <div className="text-center">
              <Link 
                href="/auth/login"
                className="text-white text-sm hover:text-purple-300 transition-colors inline-flex items-center cursor-pointer"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to Login
              </Link>
            </div>

            {/* Sign up link */}
            <div className="text-center text-sm">
              <span className="text-gray-300">Don&apos;t have an account? </span>
              <Link
                href="/auth/signup"
                className="text-white font-medium hover:text-purple-300 transition-colors cursor-pointer"
              >
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}