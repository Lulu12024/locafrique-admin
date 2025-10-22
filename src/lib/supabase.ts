// admin/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nvcgijtnwnbgxzuclbhy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Y2dpanRud25iZ3h6dWNsYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTM4MjEsImV4cCI6MjA3MjU4OTgyMX0.vybd5mCZUKZccLN2toyzz9z6yoQs0FXWEaYPb4S2nck";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage // IMPORTANT
  }
});