import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

// Create Supabase client with type safety disabled due to incomplete database.types.ts
// TODO: Regenerate database types with: npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
}) as any

// Helper: Get current workspace member ID
export async function getCurrentWorkspaceMember(workspaceId: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) return null
  return (data as { id: string }).id
}

// Helper: Get user's workspaces
export async function getUserWorkspaces() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      id,
      role,
      points,
      workspace:workspaces(*)
    `)
    .eq('user_id', user.id)

  if (error) return []
  return data || []
}
