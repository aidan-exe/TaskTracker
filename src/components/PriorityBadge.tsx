import { PRIORITIES, PRIORITY_COLORS, PRIORITY_DOT_COLORS } from '../constants'
import type { Priority } from '../types'

interface Props {
  priority: Priority
  showLabel?: boolean
  className?: string
}

export function PriorityBadge({ priority, showLabel = true, className = '' }: Props) {
  const label = PRIORITIES.find((p) => p.value === priority)?.label ?? priority
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[priority]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT_COLORS[priority]}`} />
      {showLabel && label}
    </span>
  )
}
