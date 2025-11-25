
import { createClient } from '@supabase/supabase-js';

// Configuration constants for the Supabase instance.
// In a production environment, these should be loaded from environment variables (import.meta.env).
const supabaseUrl = 'https://ankoihffydjftbqmzauc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFua29paGZmeWRqZnRicW16YXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTk3NDksImV4cCI6MjA3OTQzNTc0OX0.1TzhlsKmzX9VH3V81d6EkicYHDL_bt9hIS0kTkZK72s';

/**
 * The initialized Supabase client instance.
 * Used for authentication, database interaction, and real-time subscriptions.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
