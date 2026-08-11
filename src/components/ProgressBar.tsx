import type { Progress } from '../types'

interface Props {
  progress: Progress
  size?: 'sm' | 'md'
}

export function ProgressBar({ progress, size = 'md' }: Props) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2'
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className={`font-medium text-slate-600 ${textSize}`}>
          {progress.done} / {progress.total} complete
        </span>
        <span className={`font-semibold text-slate-700 ${textSize}`}>
          {progress.percent}%
        </span>
      </div>
      <div className={`w-full rounded-full bg-slate-100 ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-300 ${
            progress.percent === 100
              ? 'bg-emerald-500'
              : progress.percent >= 66
              ? 'bg-blue-500'
              : progress.percent >= 33
              ? 'bg-amber-500'
              : 'bg-slate-400'
          }`}
          style={{ width: `${progress.percent}%` }}
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
