import { useTaskStore } from '../store'
import type { Status } from '../types'

interface Stat {
  label: string
  value: number
  color: string
}

export function StatsBar() {
  const tasks = useTaskStore((s) => s.tasks)

  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const critical = tasks.filter((t) => t.priority === 'critical' && t.status !== 'done').length
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length

  const stats: Stat[] = [
    { label: 'Total Tasks', value: total, color: 'text-slate-700' },
    { label: 'In Progress', value: inProgress, color: 'text-amber-600' },
    { label: 'Done', value: done, color: 'text-emerald-600' },
    { label: 'Critical', value: critical, color: 'text-red-600' },
    { label: 'Overdue', value: overdue, color: 'text-red-500' },
  ]

  const donePercent = total > 0 ? Math.round((done / total) * 100) : 0
  const statuses: Status[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done']
  const statusColors: Record<Status, string> = {
    backlog: 'bg-slate-300',
    todo: 'bg-blue-400',
    in_progress: 'bg-amber-400',
    in_review: 'bg-purple-400',
    done: 'bg-emerald-400',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-6">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            <span className="text-xs text-slate-500">{s.label}</span>
          </div>
        ))}

        {/* progress bar */}
        <div className="ml-auto flex min-w-[200px] flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Sprint progress</span>
            <span className="font-semibold text-slate-700">{donePercent}%</span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            {statuses.map((status) => {
              const count = tasks.filter((t) => t.status === status).length
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div
                  key={status}
                  className={`${statusColors[status]} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${status}: ${count}`}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {statuses.map((status) => (
              <span key={status} className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${statusColors[status]}`} />
                {tasks.filter((t) => t.status === status).length}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
