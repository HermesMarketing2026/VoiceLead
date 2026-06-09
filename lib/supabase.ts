import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Service role key: bypassa RLS, usata solo server-side nelle API routes.
// Non esporre mai al client — non ha prefisso NEXT_PUBLIC_.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
