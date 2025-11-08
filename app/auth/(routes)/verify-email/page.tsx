'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/utils/supabase/client';

function VerifyEmailContent() {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const supabase = createClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address is required to resend verification email.');
      return;
    }

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Verification email sent successfully! Please check your inbox.');
        setResendCooldown(60); // 60 second cooldown
        toast.success('Verification email sent!');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We&apos;ve sent a verification link to{' '}
            {email && (
              <span className="font-medium text-gray-900">{email}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>Please check your email and click the verification link to activate your account.</p>
              <p>If you don&apos;t see the email, check your spam folder.</p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0 || !email}
                className="w-full"
                variant="outline"
              >
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : 'Resend Verification Email'
                }
              </Button>
              
              <Button asChild variant="ghost" className="w-full">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Need help? Contact support at</p>
              <a 
                href="mailto:support@wizza.com" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                support@wizza.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-600" />
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}