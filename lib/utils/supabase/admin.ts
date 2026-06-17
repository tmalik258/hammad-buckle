import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Use new secret key, fallback to legacy service role key for backward compatibility
  const secretKey = 
    process.env.SUPABASE_SECRET_KEY || 
    process.env.SUPABASE_SECRET_KEY;
  
  if (!url || !secretKey) {
    throw new Error('Supabase admin environment variables are not set. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SECRET_KEY)');
  }
  
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}


