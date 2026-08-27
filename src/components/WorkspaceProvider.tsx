/**
 * Workspace Provider
 * 
 * Manages the current workspace selection and provides Supabase data to the app.
 * Replaces localStorage-based store with real-time database queries.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { useWorkspaces, useSupabaseData, type SupabaseData } from '../hooks/useSupabaseData'

interface WorkspaceContextValue extends SupabaseData {
  workspaceId: string | null
  setWorkspaceId: (id: string) => void
  allWorkspaces: Array<{ id: string; name: string; slug: string }>
  workspacesLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { workspaces, loading: workspacesLoading } = useWorkspaces()
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  // Auto-select first workspace
  useEffect(() => {
    if (!workspacesLoading && workspaces.length > 0 && !workspaceId) {
      setWorkspaceId(workspaces[0].id)
    }
  }, [workspaces, workspacesLoading, workspaceId])

  // Load data for selected workspace
  const supabaseData = useSupabaseData(workspaceId)

  const value: WorkspaceContextValue = {
    ...supabaseData,
    workspaceId,
    setWorkspaceId,
    allWorkspaces: workspaces,
    workspacesLoading,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}
