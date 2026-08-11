import { Coins } from 'lucide-react'

interface Props {
  points: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function PointsBadge({ points, size = 'md', showLabel = true }: Props) {
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      points: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      points: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      points: 'text-base',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div
      className={`${classes.container} flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold border-2 border-amber-300 dark:border-amber-700`}
    >
      <Coins className={`${classes.icon} shrink-0`} />
      <span className={classes.points}>{points.toLocaleString()}</span>
      {showLabel && <span className="text-xs font-normal opacity-75">pts</span>}
    </div>
  )
}
