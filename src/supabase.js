import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rwisbuntbhsovzvadnfa.supabase.co";

// ⚠️ ta clé anon public ici
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3aXNidW50Ymhzb3Z6dmFkbmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNDY2MDYsImV4cCI6MjA5MTYyMjYwNn0.J2AlL4CjMvTfOD5KtXjEJ6wxbOWWkQtDhvarMhQdVno";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);