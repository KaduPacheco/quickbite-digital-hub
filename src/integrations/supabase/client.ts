
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables with proper fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qstqklpjdwptskscqxle.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdHFrbHBqZHdwdHNrc2NxeGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NDg5ODQsImV4cCI6MjA2ODAyNDk4NH0.mfmXZ3qHkjOcGhOfJTlXL1XA0PrPVgQ-rKyVBnsHttA";

console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key Available:', SUPABASE_PUBLISHABLE_KEY ? 'Yes' : 'No');

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const error = 'Supabase configuration error: Missing required environment variables';
  console.error(error);
  throw new Error(error);
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

console.log('Supabase client initialized successfully');

export { supabase };
