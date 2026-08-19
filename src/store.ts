import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type {
  Epic, NewEpic,
  Story, NewStory,
  Task, NewTask,
  User, NewUser,
  NewComment,
  Notification,
  Voucher, VoucherType,
  Status, FilterState, View, Progress,
} from './types'
import { POINTS, VOUCHER_COSTS } from './types'

// ── Store interface ───────────────────────────────────────────────────────────

interface AppStore {
  epics: Epic[]
  stories: Story[]
  tasks: Task[]
  users: User[]
  notifications: Notification[]

  filters: FilterState
  view: View
  darkMode: boolean

  // Selected items for detail modals
  selectedEpicId: string | null
  selectedStoryId: string | null
  selectedTaskId: string | null

  // ── Epic actions ────────────────────────────────────────────────────────────
  addEpic: (epic: NewEpic) => string          // returns new id
  updateEpic: (id: string, updates: Partial<NewEpic>) => void
  deleteEpic: (id: string) => void            // cascades to stories + tasks

  // ── Story actions ───────────────────────────────────────────────────────────
  addStory: (story: NewStory) => string       // returns new id
  updateStory: (id: string, updates: Partial<NewStory>) => void
  deleteStory: (id: string) => void           // cascades to tasks
  moveStory: (id: string, status: Status) => void
  addStoryComment: (storyId: string, comment: NewComment) => void
  deleteStoryComment: (storyId: string, commentId: string) => void

  // ── Task actions ────────────────────────────────────────────────────────────
  addTask: (task: NewTask) => string          // returns new id
  updateTask: (id: string, updates: Partial<NewTask>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, status: Status) => void
  addTaskComment: (taskId: string, comment: NewComment) => void
  deleteTaskComment: (taskId: string, commentId: string) => void

  // ── User actions ────────────────────────────────────────────────────────────
  addUser: (user: NewUser) => void
  updateUser: (id: string, updates: Partial<NewUser>) => void
  deleteUser: (id: string) => void
  awardPoints: (userId: string, points: number, reason: string) => void
  redeemVoucher: (userId: string, voucherType: VoucherType) => boolean

  // ── Notification actions ────────────────────────────────────────────────────
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'dismissed'>) => void
  dismissNotification: (id: string) => void
  clearAllNotifications: () => void

  // ── UI actions ──────────────────────────────────────────────────────────────
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  setView: (view: View) => void
  setSelectedEpicId: (id: string | null) => void
  setSelectedStoryId: (id: string | null) => void
  setSelectedTaskId: (id: string | null) => void
  toggleDarkMode: () => void

  // ── Derived helpers ─────────────────────────────────────────────────────────
  getEpicById: (id: string | null) => Epic | undefined
  getStoryById: (id: string | null) => Story | undefined
  getTaskById: (id: string | null) => Task | undefined
  getUserById: (id: string | null) => User | undefined

  storiesForEpic: (epicId: string) => Story[]
  tasksForStory: (storyId: string) => Task[]
  tasksForEpic: (epicId: string) => Task[]

  epicProgress: (epicId: string) => Progress
  storyProgress: (storyId: string) => Progress

  filteredTasks: () => Task[]
  filteredStories: () => Story[]
  filteredEpics: () => Epic[]
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterState = {
  search: '',
  priority: 'all',
  epicId: 'all',
  assigneeId: 'all',
}

function makeProgress(items: { status: Status }[]): Progress {
  const total = items.length
  const done = items.filter((i) => i.status === 'done').length
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}

// ── Store ─────────────────────────────────────────────────────────────────────

// ── Store ─────────────────────────────────────────────────────────────────────

export const useTaskStore = create<AppStore>()(
  persist(
    (set, get) => ({
      epics: [],
      stories: [],
      tasks: [],
      users: [],
      notifications: [],
      filters: DEFAULT_FILTERS,
      view: 'kanban', // Start in kanban view
      darkMode: false,
      selectedEpicId: null,
      selectedStoryId: null,
      selectedTaskId: null,

      // ── Epic actions ──────────────────────────────────────────────────────

      addEpic: (epic) => {
        const id = uuidv4()
        set((s) => ({
          epics: [
            ...s.epics,
            { ...epic, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        }))
        return id
      },

      updateEpic: (id, updates) =>
        set((s) => ({
          epics: s.epics.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        })),

      deleteEpic: (id) =>
        set((s) => {
          const storyIds = s.stories.filter((st) => st.epicId === id).map((st) => st.id)
          return {
            epics: s.epics.filter((e) => e.id !== id),
            stories: s.stories.filter((st) => st.epicId !== id),
            tasks: s.tasks.filter((t) => !storyIds.includes(t.storyId)),
            selectedEpicId: s.selectedEpicId === id ? null : s.selectedEpicId,
          }
        }),

      // ── Story actions ─────────────────────────────────────────────────────

      addStory: (story) => {
        const id = uuidv4()
        set((s) => ({
          stories: [
            ...s.stories,
            { ...story, comments: [], id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        }))
        return id
      },

      updateStory: (id, updates) =>
        set((s) => ({
          stories: s.stories.map((st) =>
            st.id === id ? { ...st, ...updates, updatedAt: new Date().toISOString() } : st
          ),
        })),

      deleteStory: (id) =>
        set((s) => ({
          stories: s.stories.filter((st) => st.id !== id),
          tasks: s.tasks.filter((t) => t.storyId !== id),
          selectedStoryId: s.selectedStoryId === id ? null : s.selectedStoryId,
        })),

      moveStory: (id, status) =>
        set((s) => {
          const story = s.stories.find((st) => st.id === id)
          const oldStatus = story?.status
          const wasCompleted = oldStatus === 'done'
          const isNowCompleted = status === 'done'
          
          // Award points if story is being marked as done (and wasn't before)
          if (story && isNowCompleted && !wasCompleted && story.assigneeId) {
            get().awardPoints(story.assigneeId, POINTS.COMPLETE_STORY, `Completed story: ${story.title}`)
          }

          // Create notification for status change
          if (story && oldStatus !== status) {
            get().addNotification({
              type: 'status_change',
              message: `Story "${story.title}" moved from ${oldStatus} to ${status}`,
              userId: story.assigneeId || '',
              itemType: 'story',
              itemId: id,
              oldStatus,
              newStatus: status,
            })
          }

          return {
            stories: s.stories.map((st) =>
              st.id === id ? { ...st, status, updatedAt: new Date().toISOString() } : st
            ),
          }
        }),

      addStoryComment: (storyId, comment) =>
        set((s) => ({
          stories: s.stories.map((st) =>
            st.id === storyId
              ? {
                  ...st,
                  comments: [
                    ...st.comments,
                    { ...comment, id: uuidv4(), createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : st
          ),
        })),

      deleteStoryComment: (storyId, commentId) =>
        set((s) => ({
          stories: s.stories.map((st) =>
            st.id === storyId
              ? {
                  ...st,
                  comments: st.comments.filter((c) => c.id !== commentId),
                  updatedAt: new Date().toISOString(),
                }
              : st
          ),
        })),

      // ── Task actions ──────────────────────────────────────────────────────

      addTask: (task) => {
        const id = uuidv4()
        set((s) => ({
          tasks: [
            ...s.tasks,
            { ...task, comments: [], id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        }))
        return id
      },

      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId,
        })),

      moveTask: (id, status) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === id)
          const oldStatus = task?.status
          const wasCompleted = oldStatus === 'done'
          const isNowCompleted = status === 'done'
          
          // Award points if task is being marked as done (and wasn't before)
          if (task && isNowCompleted && !wasCompleted && task.assigneeId) {
            get().awardPoints(task.assigneeId, POINTS.COMPLETE_TASK, `Completed task: ${task.title}`)
          }

          // Create notification for status change
          if (task && oldStatus !== status) {
            get().addNotification({
              type: 'status_change',
              message: `Task "${task.title}" moved from ${oldStatus} to ${status}`,
              userId: task.assigneeId || '',
              itemType: 'task',
              itemId: id,
              oldStatus,
              newStatus: status,
            })
          }

          return {
            tasks: s.tasks.map((t) =>
              t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
            ),
          }
        }),

      addTaskComment: (taskId, comment) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  comments: [
                    ...t.comments,
                    { ...comment, id: uuidv4(), createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      deleteTaskComment: (taskId, commentId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  comments: t.comments.filter((c) => c.id !== commentId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      // ── User actions ──────────────────────────────────────────────────────

      addUser: (user) =>
        set((s) => ({
          users: [
            ...s.users,
            { ...user, id: uuidv4(), points: 0, vouchers: [], createdAt: new Date().toISOString() },
          ],
        })),

      updateUser: (id, updates) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),

      deleteUser: (id) =>
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
          stories: s.stories.map((st) =>
            st.assigneeId === id ? { ...st, assigneeId: null, updatedAt: new Date().toISOString() } : st
          ),
          tasks: s.tasks.map((t) =>
            t.assigneeId === id ? { ...t, assigneeId: null, updatedAt: new Date().toISOString() } : t
          ),
        })),

      awardPoints: (userId, points, reason) =>
        set((s) => {
          const user = s.users.find((u) => u.id === userId)
          if (!user) return s

          // Add notification for points awarded
          get().addNotification({
            type: 'points_awarded',
            message: `+${points} points: ${reason}`,
            userId,
            itemType: 'task',
            itemId: '',
          })

          return {
            users: s.users.map((u) =>
              u.id === userId ? { ...u, points: u.points + points } : u
            ),
          }
        }),

      redeemVoucher: (userId, voucherType) => {
        const user = get().users.find((u) => u.id === userId)
        if (!user) return false

        const cost = VOUCHER_COSTS[voucherType]
        if (user.points < cost) return false

        const voucher: Voucher = {
          id: uuidv4(),
          type: voucherType,
          redeemedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        }

        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? { ...u, points: u.points - cost, vouchers: [...u.vouchers, voucher] }
              : u
          ),
        }))

        get().addNotification({
          type: 'voucher_redeemed',
          message: `Redeemed ${voucherType} voucher!`,
          userId,
          itemType: 'voucher',
          itemId: voucher.id,
        })

        return true
      },

      // ── Notification actions ──────────────────────────────────────────────

      addNotification: (notification) =>
        set((s) => ({
          notifications: [
            ...s.notifications,
            { ...notification, id: uuidv4(), createdAt: new Date().toISOString(), dismissed: false },
          ],
        })),

      dismissNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, dismissed: true } : n
          ),
        })),

      clearAllNotifications: () =>
        set({ notifications: [] }),

      // ── UI actions ────────────────────────────────────────────────────────

      setFilters: (filters) =>
        set((s) => ({ filters: { ...s.filters, ...filters } })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      setView: (view) => set({ view }),

      setSelectedEpicId: (id) => set({ selectedEpicId: id }),
      setSelectedStoryId: (id) => set({ selectedStoryId: id }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // ── Derived helpers ───────────────────────────────────────────────────

      getEpicById: (id) => (id ? get().epics.find((e) => e.id === id) : undefined),
      getStoryById: (id) => (id ? get().stories.find((s) => s.id === id) : undefined),
      getTaskById: (id) => (id ? get().tasks.find((t) => t.id === id) : undefined),
      getUserById: (id) => (id ? get().users.find((u) => u.id === id) : undefined),

      storiesForEpic: (epicId) => get().stories.filter((s) => s.epicId === epicId),
      tasksForStory: (storyId) => get().tasks.filter((t) => t.storyId === storyId),
      tasksForEpic: (epicId) => {
        const storyIds = new Set(get().stories.filter((s) => s.epicId === epicId).map((s) => s.id))
        return get().tasks.filter((t) => storyIds.has(t.storyId))
      },

      epicProgress: (epicId) => {
        // Progress based on tasks inside this epic
        const { tasksForEpic, storiesForEpic } = get()
        const epicTasks = tasksForEpic(epicId)
        if (epicTasks.length > 0) return makeProgress(epicTasks)
        // Fall back to story-level if no tasks yet
        return makeProgress(storiesForEpic(epicId))
      },

      storyProgress: (storyId) => makeProgress(get().tasks.filter((t) => t.storyId === storyId)),

      // ── Filtered collections ──────────────────────────────────────────────

      filteredTasks: () => {
        const { tasks, stories, filters } = get()
        return tasks.filter((t) => {
          // search across title + description
          if (filters.search) {
            const q = filters.search.toLowerCase()
            if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q))
              return false
          }
          if (filters.priority !== 'all' && t.priority !== filters.priority) return false
          if (filters.assigneeId === 'unassigned' && t.assigneeId !== null) return false
          if (
            filters.assigneeId !== 'all' &&
            filters.assigneeId !== 'unassigned' &&
            t.assigneeId !== filters.assigneeId
          )
            return false
          // epic filter — resolve via story
          if (filters.epicId !== 'all') {
            const story = stories.find((s) => s.id === t.storyId)
            if (!story || story.epicId !== filters.epicId) return false
          }
          return true
        })
      },

      filteredStories: () => {
        const { stories, filters } = get()
        return stories.filter((st) => {
          if (filters.search) {
            const q = filters.search.toLowerCase()
            if (!st.title.toLowerCase().includes(q) && !st.description.toLowerCase().includes(q))
              return false
          }
          if (filters.priority !== 'all' && st.priority !== filters.priority) return false
          if (filters.epicId !== 'all' && st.epicId !== filters.epicId) return false
          if (filters.assigneeId === 'unassigned' && st.assigneeId !== null) return false
          if (
            filters.assigneeId !== 'all' &&
            filters.assigneeId !== 'unassigned' &&
            st.assigneeId !== filters.assigneeId
          )
            return false
          return true
        })
      },

      filteredEpics: () => {
        const { epics, filters } = get()
        return epics.filter((e) => {
          if (filters.search) {
            const q = filters.search.toLowerCase()
            if (!e.title.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q))
              return false
          }
          if (filters.priority !== 'all' && e.priority !== filters.priority) return false
          if (filters.epicId !== 'all' && e.id !== filters.epicId) return false
          return true
        })
      },
    }),
    { name: 'tasktracker-store-v2' }  // new key so old flat data doesn't conflict
  )
)
