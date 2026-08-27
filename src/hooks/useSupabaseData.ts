/**
 * Supabase Data Hook
 * 
 * Manages fetching and syncing data from Supabase for the current workspace.
 * Replaces localStorage with real-time database queries.
 */

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Epic = Database['public']['Tables']['epics']['Row']
type Story = Database['public']['Tables']['stories']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Comment = Database['public']['Tables']['comments']['Row']
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
type Workspace = Database['public']['Tables']['workspaces']['Row']

export interface SupabaseData {
  workspace: Workspace | null
  workspaceMember: WorkspaceMember | null
  epics: Epic[]
  stories: Story[]
  tasks: Task[]
  comments: Comment[]
  members: WorkspaceMember[]
  loading: boolean
  error: string | null
}

export function useSupabaseData(workspaceId: string | null) {
  const [data, setData] = useState<SupabaseData>({
    workspace: null,
    workspaceMember: null,
    epics: [],
    stories: [],
    tasks: [],
    comments: [],
    members: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!workspaceId) {
      setData({
        workspace: null,
        workspaceMember: null,
        epics: [],
        stories: [],
        tasks: [],
        comments: [],
        members: [],
        loading: false,
        error: null,
      })
      return
    }

    let mounted = true

    async function loadData() {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }))

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Not authenticated')
        }

        // Fetch all data in parallel
        // @ts-ignore - Database types need regeneration
        const [
          workspaceResult,
          workspaceMemberResult,
          epicsResult,
          storiesResult,
          tasksResult,
          commentsResult,
          membersResult,
        ] = await Promise.all([
          supabase.from('workspaces').select('*').eq('id', workspaceId).single(),
          supabase.from('workspace_members').select('*').eq('workspace_id', workspaceId).eq('user_id', user.id).single(),
          supabase.from('epics').select('*').eq('workspace_id', workspaceId).order('created_at' as any, { ascending: false }),
          supabase.from('stories').select('*').eq('workspace_id', workspaceId).order('created_at' as any, { ascending: false }),
          supabase.from('tasks').select('*').eq('workspace_id', workspaceId).order('created_at' as any, { ascending: false }),
          supabase.from('comments').select('*').eq('workspace_id', workspaceId).order('created_at' as any, { ascending: true }),
          supabase.from('workspace_members').select('*').eq('workspace_id', workspaceId),
        ])

        if (!mounted) return

        // Check for errors
        if (workspaceResult.error) throw workspaceResult.error
        if (workspaceMemberResult.error) throw workspaceMemberResult.error
        if (epicsResult.error) throw epicsResult.error
        if (storiesResult.error) throw storiesResult.error
        if (tasksResult.error) throw tasksResult.error
        if (commentsResult.error) throw commentsResult.error
        if (membersResult.error) throw membersResult.error

        setData({
          workspace: workspaceResult.data,
          workspaceMember: workspaceMemberResult.data,
          epics: epicsResult.data || [],
          stories: storiesResult.data || [],
          tasks: tasksResult.data || [],
          comments: commentsResult.data || [],
          members: membersResult.data || [],
          loading: false,
          error: null,
        })
      } catch (err: any) {
        if (mounted) {
          console.error('Failed to load workspace data:', err)
          setData((prev) => ({
            ...prev,
            loading: false,
            error: err.message || 'Failed to load data',
          }))
        }
      }
    }

    loadData()

    // Set up real-time subscriptions
    const epicsChannel = supabase
      .channel(`epics:${workspaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'epics', filter: `workspace_id=eq.${workspaceId}` },
        () => loadData()
      )
      .subscribe()

    const storiesChannel = supabase
      .channel(`stories:${workspaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stories', filter: `workspace_id=eq.${workspaceId}` },
        () => loadData()
      )
      .subscribe()

    const tasksChannel = supabase
      .channel(`tasks:${workspaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${workspaceId}` },
        () => loadData()
      )
      .subscribe()

    return () => {
      mounted = false
      epicsChannel.unsubscribe()
      storiesChannel.unsubscribe()
      tasksChannel.unsubscribe()
    }
  }, [workspaceId])

  return data
}

/**
 * Hook to get user's workspaces
 */
export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadWorkspaces() {
      try {
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Not authenticated')
        }

        // Get workspaces where user is a member
        // @ts-ignore - Database types need regeneration
        const { data: members, error: membersError } = await supabase
          .from('workspace_members')
          .select('workspace_id' as any)
          .eq('user_id', user.id)

        if (membersError) throw membersError

        if (!members || members.length === 0) {
          if (mounted) {
            setWorkspaces([])
            setLoading(false)
          }
          return
        }

        // @ts-ignore - Database types need regeneration
        const workspaceIds = members.map((m) => m.workspace_id)

        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', workspaceIds)

        if (workspacesError) throw workspacesError

        if (mounted) {
          setWorkspaces(workspacesData || [])
          setLoading(false)
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Failed to load workspaces:', err)
          setError(err.message || 'Failed to load workspaces')
          setLoading(false)
        }
      }
    }

    loadWorkspaces()

    return () => {
      mounted = false
    }
  }, [])

  return { workspaces, loading, error }
}
