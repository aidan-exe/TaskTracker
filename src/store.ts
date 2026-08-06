import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Task, NewTask, NewUser, User, Status, FilterState, View } from './types'

// ── Store types ─────────────────────────────────────────────────────────────

interface TaskStore {
  tasks: Task[]
  users: User[]
  filters: FilterState
  view: View
  selectedTaskId: string | null

  // Task actions
  addTask: (task: NewTask) => void
  updateTask: (id: string, updates: Partial<NewTask>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, status: Status) => void

  // User actions
  addUser: (user: NewUser) => void
  updateUser: (id: string, updates: Partial<NewUser>) => void
  deleteUser: (id: string) => void

  // UI actions
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  setView: (view: View) => void
  setSelectedTaskId: (id: string | null) => void

  // Derived
  filteredTasks: () => Task[]
  getUserById: (id: string | null) => User | undefined
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  priority: 'all',
  type: 'all',
  assigneeId: 'all',
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      users: [],
      filters: DEFAULT_FILTERS,
      view: 'kanban',
      selectedTaskId: null,

      // ── Task actions ──────────────────────────────────────────────────────

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

      // ── User actions ──────────────────────────────────────────────────────

      addUser: (user) =>
        set((state) => ({
          users: [
            ...state.users,
            {
              ...user,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          // Unassign tasks that were assigned to this user
          tasks: state.tasks.map((t) =>
            t.assigneeId === id
              ? { ...t, assigneeId: null, updatedAt: new Date().toISOString() }
              : t
          ),
        })),

      // ── UI actions ────────────────────────────────────────────────────────

      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      setView: (view) => set({ view }),

      setSelectedTaskId: (id) => set({ selectedTaskId: id }),

      // ── Derived ───────────────────────────────────────────────────────────

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
          if (filters.type !== 'all' && t.type !== filters.type)
            return false
          if (filters.assigneeId === 'unassigned' && t.assigneeId !== null)
            return false
          if (
            filters.assigneeId !== 'all' &&
            filters.assigneeId !== 'unassigned' &&
            t.assigneeId !== filters.assigneeId
          )
            return false
          return true
        })
      },

      getUserById: (id) => {
        if (!id) return undefined
        return get().users.find((u) => u.id === id)
      },
    }),
    { name: 'tasktracker-store' }
  )
)
