import type { User } from '../types'

interface Props {
  user: User
  size?: 'sm' | 'md'
  showTooltip?: boolean
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function UserAvatar({ user, size = 'sm', showTooltip = true }: Props) {
  const dim = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs'

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${dim}`}
      style={{ backgroundColor: user.avatarColor }}
      title={showTooltip ? user.name : undefined}
      aria-label={user.name}
    >
      {getInitials(user.name)}
    </span>
  )
}
