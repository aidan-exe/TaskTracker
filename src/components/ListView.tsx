import { CalendarDays, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import { useTaskStore } from '../store'
import { STATUSES } from '../constants'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { UserAvatar } from './UserAvatar'
import type { Task } from '../types'

type SortKey = 'title' | 'status' | 'priority' | 'dueDate' | 'storyPoints'
type SortDir = 'asc' | 'desc'

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
}
const STATUS_ORDER: Record<string, number> = Object.fromEntries(
  STATUSES.map((s, i) => [s.value, i])
)

function sortTasks(tasks: Task[], key: SortKey, dir: SortDir): Task[] {
  return [...tasks].sort((a, b) => {
    let cmp = 0
    if (key === 'title')       cmp = a.title.localeCompare(b.title)
    else if (key === 'status') cmp = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
    else if (key === 'priority') cmp = (PRIORITY_ORDER[a.priority] ?? 0) - (PRIORITY_ORDER[b.priority] ?? 0)
    else if (key === 'storyPoints') cmp = (a.storyPoints ?? -1) - (b.storyPoints ?? -1)
    else if (key === 'dueDate') {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      cmp = da - db
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

export function ListView() {
  const { filteredTasks, setSelectedTaskId, getUserById, getStoryById, getEpicById } = useTaskStore()
  const tasks = filteredTasks()

  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = sortTasks(tasks, sortKey, sortDir)

  const ColHeader = ({ col, label }: { col: SortKey; label: string }) => (
    <th scope="col" className="px-3 py-3 first:pl-4">
      <button
        type="button"
        onClick={() => handleSort(col)}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
      >
        {label}
        <ArrowUpDown
          className={`h-3 w-3 transition-opacity ${sortKey === col ? 'opacity-100 text-brand-500' : 'opacity-30'}`}
          aria-hidden="true"
        />
      </button>
    </th>
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm mt-1">Try adjusting your filters or create a new task.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[600px] text-sm">
        <thead className="border-b border-slate-100 bg-slate-50">
          <tr className="text-left">
            <th scope="col" className="px-3 py-3 first:pl-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Epic / Story
            </th>
            <ColHeader col="title"       label="Title" />
            <ColHeader col="status"      label="Status" />
            <ColHeader col="priority"    label="Priority" />
            <ColHeader col="storyPoints" label="SP" />
            <th scope="col" className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Assignee
            </th>
            <ColHeader col="dueDate"     label="Due" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((task) => {
            const overdue =
              task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
            return (
              <tr
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="cursor-pointer transition-colors hover:bg-slate-50 focus-within:bg-slate-50"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedTaskId(task.id)
                }}
              >
                <td className="px-3 py-3 whitespace-nowrap pl-4">
                  {(() => {
                    const story = getStoryById(task.storyId)
                    const epic = story ? getEpicById(story.epicId) : undefined
                    return (
                      <div className="flex flex-col gap-1">
                        {epic && (
                          <span className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white w-fit" style={{ backgroundColor: epic.color }}>
                            ◆ {epic.title}
                          </span>
                        )}
                        {story && (
                          <span className="inline-flex rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 w-fit">
                            ◈ {story.title}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                </td>
                <td className="max-w-xs py-3 px-3">
                  <span className="block font-medium text-slate-800 truncate">{task.title}</span>
                  {task.labels.length > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {task.labels.map((l) => (
                        <span key={l} className="rounded-sm bg-slate-100 px-1 text-[10px] text-slate-500">
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-3 py-3 text-center text-xs font-medium text-slate-600 whitespace-nowrap">
                  {task.storyPoints ?? '—'}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {(() => {
                    const assignee = getUserById(task.assigneeId)
                    return assignee ? (
                      <div className="flex items-center gap-1.5">
                        <UserAvatar user={assignee} size="sm" />
                        <span className="text-xs text-slate-600 truncate max-w-[80px]">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )
                  })()}
                </td>
                <td className="py-3 pl-3 pr-4 whitespace-nowrap">
                  {task.dueDate ? (
                    <span className={`flex items-center gap-1 text-xs ${overdue ? 'font-semibold text-red-500' : 'text-slate-500'}`}>
                      <CalendarDays className="h-3 w-3" aria-hidden="true" />
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
