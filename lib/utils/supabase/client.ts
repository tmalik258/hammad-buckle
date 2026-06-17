import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use new publishable key, fallback to legacy anon key for backward compatibility
  const publishableKey = 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('Supabase publishable key is not set. Please set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey
  )
}