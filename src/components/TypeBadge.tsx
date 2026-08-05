import { TASK_TYPES, TYPE_COLORS, TYPE_ICONS } from '../constants'
import type { TaskType } from '../types'

interface Props {
  type: TaskType
  className?: string
}

export function TypeBadge({ type, className = '' }: Props) {
  const label = TASK_TYPES.find((t) => t.value === type)?.label ?? type
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[type]} ${className}`}
    >
      <span aria-hidden="true">{TYPE_ICONS[type]}</span>
      {label}
    </span>
  )
}
