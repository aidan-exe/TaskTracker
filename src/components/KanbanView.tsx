import { useTaskStore } from '../store'
import { KanbanColumn } from './KanbanColumn'
import { STATUSES } from '../constants'
import type { Status } from '../types'

export function KanbanView() {
  const filteredTasks = useTaskStore((s) => s.filteredTasks)
  const tasks = filteredTasks()

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((s) => (
        <KanbanColumn
          key={s.value}
          status={s.value as Status}
          tasks={tasks.filter((t) => t.status === s.value)}
        />
      ))}
    </div>
  )
}
