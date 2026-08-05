import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Task, NewTask, Status, FilterState, View } from './types'

// ── Seed data ──────────────────────────────────────────────────────────────

const SEED_TASKS: Task[] = [
  {
    id: uuidv4(),
    title: 'User authentication flow',
    description: 'Implement JWT-based auth with refresh tokens, password reset via email, and OAuth support.',
    status: 'in_review',
    priority: 'critical',
    type: 'feature',
    labels: ['auth', 'security'],
    storyPoints: 13,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Dashboard analytics widgets',
    description: 'Build reusable chart components (line, bar, pie) powered by the metrics API.',
    status: 'in_progress',
    priority: 'high',
    type: 'feature',
    labels: ['frontend', 'analytics'],
    storyPoints: 8,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'As a user I can filter search results by date range',
    description: 'Add date range picker to the search page so users can narrow results to a specific time window.',
    status: 'todo',
    priority: 'medium',
    type: 'user_story',
    labels: ['search', 'frontend'],
    storyPoints: 5,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Fix N+1 query in /api/projects',
    description: 'The projects list endpoint fires a separate DB query per project to fetch members. Needs eager loading.',
    status: 'in_progress',
    priority: 'critical',
    type: 'bug',
    labels: ['backend', 'performance'],
    storyPoints: 3,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'As a user I can export reports as CSV',
    description: 'Users should be able to export any report table to CSV with a single click from the reports page.',
    status: 'todo',
    priority: 'medium',
    type: 'user_story',
    labels: ['reports', 'export'],
    storyPoints: 5,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    dueDate: null,
  },
  {
    id: uuidv4(),
    title: 'Notifications service',
    description: 'Real-time in-app notifications via WebSocket plus configurable email digest.',
    status: 'backlog',
    priority: 'medium',
    type: 'feature',
    labels: ['backend', 'realtime'],
    storyPoints: 8,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Modal closes unexpectedly on mobile tap outside',
    description: 'On iOS Safari, tapping the backdrop to close a modal sometimes triggers a click on elements beneath it.',
    status: 'backlog',
    priority: 'high',
    type: 'bug',
    labels: ['mobile', 'ui'],
    storyPoints: 2,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    dueDate: null,
  },
  {
    id: uuidv4(),
    title: 'Settings page — account preferences',
    description: 'Build the account settings page covering profile info, notification preferences, and connected apps.',
    status: 'done',
    priority: 'low',
    type: 'feature',
    labels: ['settings', 'frontend'],
    storyPoints: 5,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    dueDate: null,
  },
]

// ── Store types ─────────────────────────────────────────────────────────────

interface TaskStore {
  tasks: Task[]
  filters: FilterState
  view: View
  selectedTaskId: string | null

  // Task actions
  addTask: (task: NewTask) => void
  updateTask: (id: string, updates: Partial<NewTask>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, status: Status) => void

  // UI actions
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  setView: (view: View) => void
  setSelectedTaskId: (id: string | null) => void

  // Derived
  filteredTasks: () => Task[]
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  priority: 'all',
  type: 'all',
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,
      filters: DEFAULT_FILTERS,
      view: 'kanban',
      selectedTaskId: null,

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          selectedTaskId:
            state.selectedTaskId === id ? null : state.selectedTaskId,
        })),

      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status, updatedAt: new Date().toISOString() }
              : t
          ),
        })),

      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      setView: (view) => set({ view }),

      setSelectedTaskId: (id) => set({ selectedTaskId: id }),

      filteredTasks: () => {
        const { tasks, filters } = get()
        return tasks.filter((t) => {
          if (
            filters.search &&
            !t.title.toLowerCase().includes(filters.search.toLowerCase()) &&
            !t.description.toLowerCase().includes(filters.search.toLowerCase())
          )
            return false
          if (filters.priority !== 'all' && t.priority !== filters.priority)
            return false
          if (filters.type !== 'all' && t.type !== filters.type) return false
          return true
        })
      },
    }),
    { name: 'tasktracker-store' }
  )
)
