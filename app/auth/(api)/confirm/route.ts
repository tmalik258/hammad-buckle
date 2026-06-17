import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // For recovery type, ensure we redirect to reset password page
      const redirectPath = type === 'recovery' && next === '/' 
        ? '/auth/reset-password' 
        : next;
      
      // redirect user to specified redirect URL or reset password page
      redirect(redirectPath)
    }

    // Improved error handling for different token types
    const errorMessage = type === 'recovery' 
      ? `Password reset link is invalid or has expired. ${error.message}`
      : error.message;
    
    console.log(`[auth/confirm] Invalid token_hash or type provided for ${type}:`, error.message)
    
    // For recovery type errors, redirect to forgot password page
    if (type === 'recovery') {
      redirect(`/auth/forgot-password?error=${encodeURIComponent(errorMessage)}`)
    }
    
    redirect(`/auth/login?error=${encodeURIComponent(errorMessage)}`)
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/login?error=${encodeURIComponent('Invalid or missing token. Please request a new password reset link.')}`)
}