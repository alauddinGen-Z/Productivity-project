import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ankoihffydjftbqmzauc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFua29paGZmeWRqZnRicW16YXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTk3NDksImV4cCI6MjA3OTQzNTc0OX0.1TzhlsKmzX9VH3V81d6EkicYHDL_bt9hIS0kTkZK72s';

export const supabase = createClient(supabaseUrl, supabaseKey);