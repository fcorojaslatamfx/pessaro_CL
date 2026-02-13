import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ldlflxujrjihiybrcree.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbGZseHVqcmppaGl5YnJjcmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDEzMTksImV4cCI6MjA4NTM3NzMxOX0._P7GGsOBMnG3xzGVWi9FZX4z3a12txMX52nKwNYgquE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
