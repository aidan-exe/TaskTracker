import { STATUSES, STATUS_COLORS } from '../constants'
import type { Status } from '../types'

interface Props {
  status: Status
  className?: string
}

export function StatusBadge({ status, className = '' }: Props) {
  const label = STATUSES.find((s) => s.value === status)?.label ?? status
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]} ${className}`}
    >
      {label}
    </span>
  )
}
