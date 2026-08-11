// ── Shared enums ──────────────────────────────────────────────────────────────

export type Status = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'critical' | 'high' | 'medium' | 'low'

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  avatarColor: string
  createdAt: string
}

export type NewUser = Omit<User, 'id' | 'createdAt'>

// ── Epic (Feature) ────────────────────────────────────────────────────────────
// Top-level initiative. Contains one or more User Stories.

export interface Epic {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  color: string          // accent color for visual grouping
  labels: string[]
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export type NewEpic = Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>

// ── Story (User Story) ────────────────────────────────────────────────────────
// Belongs to an Epic. Contains one or more Tasks.

export interface Story {
  id: string
  epicId: string         // required — every story belongs to an epic
  title: string
  description: string
  status: Status
  priority: Priority
  labels: string[]
  storyPoints: number | null
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export type NewStory = Omit<Story, 'id' | 'createdAt' | 'updatedAt'>

// ── Task ──────────────────────────────────────────────────────────────────────
// Belongs to a Story. The actual unit of work on the board.

export interface Task {
  id: string
  storyId: string        // required — every task belongs to a story
  title: string
  description: string
  status: Status
  priority: Priority
  labels: string[]
  storyPoints: number | null
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

// ── UI ────────────────────────────────────────────────────────────────────────

export type View = 'hierarchy' | 'kanban' | 'list'

export interface FilterState {
  search: string
  priority: Priority | 'all'
  epicId: string | 'all'
  assigneeId: string | 'all' | 'unassigned'
}

// ── Progress helpers ──────────────────────────────────────────────────────────

export interface Progress {
  total: number
  done: number
  percent: number
}
