/**
 * Supabase Store Bridge
 * 
 * Bridges Supabase data with the existing store interface.
 * Provides the same API as the localStorage store but backed by Supabase.
 */

import { useWorkspace } from '../components/WorkspaceProvider'
import { updateStory, updateTask } from '../lib/supabase-api'
import type { Status } from '../types'

/**
 * Hook that provides Supabase-backed data with the same interface as useTaskStore
 */
export function useSupabaseStore() {
  const {
    epics,
    stories,
    tasks,
    comments,
    members,
    workspaceId,
    workspaceMember,
  } = useWorkspace()

  // Convert Supabase data to app format
  const appStories = stories.map((story) => ({
    id: story.id,
    epicId: story.epic_id,
    title: story.title,
    description: story.description || '',
    status: story.status as Status,
    priority: story.priority as 'critical' | 'high' | 'medium' | 'low',
    labels: story.labels || [],
    storyPoints: story.story_points || null,
    assigneeId: story.assignee_id,
    dueDate: story.due_date || null,
    createdAt: story.created_at,
    updatedAt: story.updated_at,
    comments: comments
      .filter((c) => c.story_id === story.id)
      .map((c) => ({
        id: c.id,
        authorId: c.author_id,
        content: c.content,
        createdAt: c.created_at,
      })),
  }))

  const appTasks = tasks.map((task) => ({
    id: task.id,
    storyId: task.story_id,
    title: task.title,
    description: task.description || '',
    status: task.status as Status,
    priority: task.priority as 'critical' | 'high' | 'medium' | 'low',
    labels: task.labels || [],
    storyPoints: task.story_points || null,
    assigneeId: task.assignee_id,
    dueDate: task.due_date || null,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    comments: comments
      .filter((c) => c.task_id === task.id)
      .map((c) => ({
        id: c.id,
        authorId: c.author_id,
        content: c.content,
        createdAt: c.created_at,
      })),
  }))

  const appEpics = epics.map((epic) => ({
    id: epic.id,
    title: epic.title,
    description: epic.description || '',
    status: epic.status as Status,
    priority: epic.priority as 'critical' | 'high' | 'medium' | 'low',
    color: epic.color || '#6366f1',
    labels: epic.labels || [],
    dueDate: epic.due_date || null,
    createdAt: epic.created_at,
    updatedAt: epic.updated_at,
  }))

  const appMembers = members.map((member) => ({
    id: member.id,
    userId: member.user_id,
    role: member.role as 'owner' | 'admin' | 'member',
    points: member.points || 0,
  }))

  // Move story action
  async function moveStory(storyId: string, status: Status) {
    try {
      await updateStory(storyId, { status })
      // Optimistic update happens via real-time subscription
    } catch (error) {
      console.error('Failed to move story:', error)
      // TODO: Show error toast
    }
  }

  // Move task action
  async function moveTask(taskId: string, status: Status) {
    try {
      await updateTask(taskId, { status })
      // Optimistic update happens via real-time subscription
    } catch (error) {
      console.error('Failed to move task:', error)
      // TODO: Show error toast
    }
  }

  // Filtered stories (simplified for now - just return all)
  function filteredStories() {
    return appStories
  }

  // Filtered tasks (simplified for now - just return all)
  function filteredTasks() {
    return appTasks
  }

  // Filtered epics (simplified for now - just return all)
  function filteredEpics() {
    return appEpics
  }

  // Get story by ID
  function getStoryById(id: string | null) {
    if (!id) return undefined
    return appStories.find((s) => s.id === id)
  }

  // Get task by ID
  function getTaskById(id: string | null) {
    if (!id) return undefined
    return appTasks.find((t) => t.id === id)
  }

  // Get epic by ID
  function getEpicById(id: string | null) {
    if (!id) return undefined
    return appEpics.find((e) => e.id === id)
  }

  // Stories for epic
  function storiesForEpic(epicId: string) {
    return appStories.filter((s) => s.epicId === epicId)
  }

  // Tasks for story
  function tasksForStory(storyId: string) {
    return appTasks.filter((t) => t.storyId === storyId)
  }

  // Tasks for epic
  function tasksForEpic(epicId: string) {
    const storyIds = new Set(appStories.filter((s) => s.epicId === epicId).map((s) => s.id))
    return appTasks.filter((t) => storyIds.has(t.storyId))
  }

  // Progress calculations
  function makeProgress(items: { status: Status }[]) {
    const total = items.length
    const done = items.filter((i) => i.status === 'done').length
    return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
  }

  function epicProgress(epicId: string) {
    const epicTasks = tasksForEpic(epicId)
    if (epicTasks.length > 0) return makeProgress(epicTasks)
    return makeProgress(storiesForEpic(epicId))
  }

  function storyProgress(storyId: string) {
    return makeProgress(tasksForStory(storyId))
  }

  return {
    // Data
    epics: appEpics,
    stories: appStories,
    tasks: appTasks,
    members: appMembers,
    workspaceId,
    workspaceMember,

    // Actions
    moveStory,
    moveTask,

    // Queries
    filteredStories,
    filteredTasks,
    filteredEpics,
    getStoryById,
    getTaskById,
    getEpicById,
    storiesForEpic,
    tasksForStory,
    tasksForEpic,
    epicProgress,
    storyProgress,
  }
}
