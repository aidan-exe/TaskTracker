import { TaskCard } from './TaskCard'
import { STATUS_HEADER_COLORS, STATUSES } from '../constants'
import type { Status, Task } from '../types'

interface Props {
  status: Status
  tasks: Task[]
}

export function KanbanColumn({ status, tasks }: Props) {
  const label = STATUSES.find((s) => s.value === status)?.label ?? status

  return (
    <div
      className={`flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-xl border border-slate-200 bg-slate-50 border-t-4 ${STATUS_HEADER_COLORS[status]}`}
    >
      {/* column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs font-semibold text-slate-600">
          {tasks.length}
        </span>
      </div>

      {/* cards */}
      <div className="flex flex-col gap-3 overflow-y-auto p-3 pt-0">
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-xs text-slate-400">
            No tasks
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
