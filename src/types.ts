// ── Shared enums ──────────────────────────────────────────────────────────────

export type Status = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'critical' | 'high' | 'medium' | 'low'

// ── Gamification ──────────────────────────────────────────────────────────────

export type VoucherType = 'coffee' | 'cappuccino'

export interface Voucher {
  id: string
  type: VoucherType
  redeemedAt: string
  expiresAt: string
}

export interface Notification {
  id: string
  type: 'status_change' | 'points_awarded' | 'voucher_redeemed'
  message: string
  userId: string          // who triggered the change
  itemType: 'story' | 'task' | 'voucher'
  itemId: string
  oldStatus?: Status
  newStatus?: Status
  createdAt: string
  dismissed: boolean
}

// Points awarded for completing items
export const POINTS = {
  COMPLETE_TASK: 10,
  COMPLETE_STORY: 50,
  COMPLETE_EPIC: 200,
} as const

// Points required to redeem vouchers
export const VOUCHER_COSTS = {
  coffee: 100,
  cappuccino: 150,
} as const

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  avatarColor: string
  points: number
  vouchers: Voucher[]
  createdAt: string
}

export type NewUser = Omit<User, 'id' | 'createdAt' | 'points' | 'vouchers'>

// ── Comment ───────────────────────────────────────────────────────────────────
// Comments can be added to Stories or Tasks

export interface Comment {
  id: string
  authorId: string      // User who wrote the comment
  content: string
  createdAt: string
}

export type NewComment = Omit<Comment, 'id' | 'createdAt'>

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
  comments: Comment[]    // comments on this story
  createdAt: string
  updatedAt: string
}

export type NewStory = Omit<Story, 'id' | 'createdAt' | 'updatedAt' | 'comments'>

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
  comments: Comment[]    // comments on this task
  createdAt: string
  updatedAt: string
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>

// ── UI ────────────────────────────────────────────────────────────────────────

export type View = 'hierarchy' | 'kanban' | 'list' | 'analytics'

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
