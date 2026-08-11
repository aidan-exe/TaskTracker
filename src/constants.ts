import type { Status, Priority } from './types'

export const STATUSES: { value: Status; label: string }[] = [
  { value: 'backlog',     label: 'Backlog' },
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review',   label: 'In Review' },
  { value: 'done',        label: 'Done' },
]

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
]

// ── Status colors ─────────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<Status, string> = {
  backlog:     'bg-slate-100 text-slate-600',
  todo:        'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  in_review:   'bg-purple-100 text-purple-700',
  done:        'bg-emerald-100 text-emerald-700',
}

export const STATUS_HEADER_COLORS: Record<Status, string> = {
  backlog:     'border-t-slate-400',
  todo:        'border-t-blue-500',
  in_progress: 'border-t-amber-500',
  in_review:   'border-t-purple-500',
  done:        'border-t-emerald-500',
}

// ── Priority colors ───────────────────────────────────────────────────────────

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-slate-100 text-slate-600',
}

export const PRIORITY_DOT_COLORS: Record<Priority, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-400',
  low:      'bg-slate-400',
}

// ── Hierarchy level colors ────────────────────────────────────────────────────
// Each level gets a distinct visual identity

export const EPIC_COLORS = [
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Violet',  value: '#8b5cf6' },
  { label: 'Pink',    value: '#ec4899' },
  { label: 'Rose',    value: '#f43f5e' },
  { label: 'Blue',    value: '#3b82f6' },
  { label: 'Cyan',    value: '#06b6d4' },
  { label: 'Teal',    value: '#14b8a6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber',   value: '#f59e0b' },
  { label: 'Orange',  value: '#f97316' },
]

// ── Level badge styles ────────────────────────────────────────────────────────

export const LEVEL_STYLES = {
  epic:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  icon: '◆', label: 'Epic'  },
  story: { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  icon: '◈', label: 'Story' },
  task:  { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   icon: '✦', label: 'Task'  },
} as const
