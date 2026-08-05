import type { Status, Priority, TaskType } from './types'

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

export const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'feature',    label: 'Feature' },
  { value: 'user_story', label: 'User Story' },
  { value: 'bug',        label: 'Bug' },
]

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

export const TYPE_COLORS: Record<TaskType, string> = {
  feature:    'bg-indigo-100 text-indigo-700',
  user_story: 'bg-violet-100 text-violet-700',
  bug:        'bg-red-100 text-red-700',
}

export const TYPE_ICONS: Record<TaskType, string> = {
  feature:    '✦',
  user_story: '◈',
  bug:        '⬡',
}
