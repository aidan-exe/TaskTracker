/**
 * Supabase API Layer
 *
 * CRUD operations for epics, stories, tasks, and comments.
 * All operations include workspace context.
 */

import { supabase } from './supabase'
import type { TablesInsert, TablesUpdate } from './database.types'

type EpicInsert = Omit<TablesInsert<'epics'>, 'workspace_id'>
type EpicUpdate = TablesUpdate<'epics'>
type StoryInsert = Omit<TablesInsert<'stories'>, 'workspace_id'>
type StoryUpdate = TablesUpdate<'stories'>
type TaskInsert = Omit<TablesInsert<'tasks'>, 'workspace_id'>
type TaskUpdate = TablesUpdate<'tasks'>
type CommentInsert = Omit<TablesInsert<'comments'>, 'workspace_id'>
type NotificationInsert = Omit<TablesInsert<'notifications'>, 'workspace_id'>

// ──────────────────────────────────────────────────────────────────────────────
// Epics
// ──────────────────────────────────────────────────────────────────────────────

export async function createEpic(workspaceId: string, epic: EpicInsert) {
  const { data, error } = await supabase
    .from('epics')
    .insert({ ...epic, workspace_id: workspaceId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEpic(id: string, updates: EpicUpdate) {
  const { data, error } = await supabase
    .from('epics')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEpic(id: string) {
  // Note: Cascading deletes should be handled by database foreign key constraints
  const { error } = await supabase.from('epics').delete().eq('id', id)
  if (error) throw error
}

// ──────────────────────────────────────────────────────────────────────────────
// Stories
// ──────────────────────────────────────────────────────────────────────────────

export async function createStory(workspaceId: string, story: StoryInsert) {
  const { data, error } = await supabase
    .from('stories')
    .insert({ ...story, workspace_id: workspaceId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStory(id: string, updates: StoryUpdate) {
  const { data, error } = await supabase
    .from('stories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteStory(id: string) {
  const { error } = await supabase.from('stories').delete().eq('id', id)
  if (error) throw error
}

// ──────────────────────────────────────────────────────────────────────────────
// Tasks
// ──────────────────────────────────────────────────────────────────────────────

export async function createTask(workspaceId: string, task: TaskInsert) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...task, workspace_id: workspaceId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: TaskUpdate) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// ──────────────────────────────────────────────────────────────────────────────
// Comments
// ──────────────────────────────────────────────────────────────────────────────

export async function createComment(workspaceId: string, comment: CommentInsert) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ ...comment, workspace_id: workspaceId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}

// ──────────────────────────────────────────────────────────────────────────────
// Workspace Members
// ──────────────────────────────────────────────────────────────────────────────

export async function updateWorkspaceMemberPoints(memberId: string, pointsDelta: number) {
  const { data: member, error: fetchError } = await supabase
    .from('workspace_members')
    .select('points')
    .eq('id', memberId)
    .single()

  if (fetchError) throw fetchError

  const newPoints = (member.points || 0) + pointsDelta

  const { data, error } = await supabase
    .from('workspace_members')
    .update({ points: newPoints })
    .eq('id', memberId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ──────────────────────────────────────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────────────────────────────────────

export async function createNotification(
  workspaceId: string,
  notification: NotificationInsert
) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ ...notification, workspace_id: workspaceId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function dismissNotification(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ dismissed: true })
    .eq('id', id)

  if (error) throw error
}
