import { CalendarDays, Tag } from 'lucide-react'
import { PriorityBadge } from './PriorityBadge'
import { UserAvatar } from './UserAvatar'
import { useTaskStore } from '../store'
import type { Task } from '../types'

interface Props {
  task: Task
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function TaskCard({ task }: Props) {
  const { setSelectedTaskId, getUserById, getStoryById, getEpicById } = useTaskStore()
  const overdue = isOverdue(task.dueDate)
  const assignee = getUserById(task.assigneeId)
  const story = getStoryById(task.storyId)
  const epic = story ? getEpicById(story.epicId) : undefined

  return (
    <button
      type="button"
      onClick={() => setSelectedTaskId(task.id)}
      className="group w-full text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-brand-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {/* breadcrumb */}
      <div className="mb-2 flex items-center gap-1.5 flex-wrap">
        {epic && (
          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: epic.color }}>
            ◆ {epic.title}
          </span>
        )}
        {story && (
          <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
            ◈ {story.title}
          </span>
        )}
      </div>

      {/* priority */}
      <div className="mb-2">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* title */}
      <p className="mb-1 text-sm font-semibold text-slate-800 leading-snug group-hover:text-brand-700 line-clamp-2">
        {task.title}
      </p>

      {/* description */}
      {task.description && (
        <p className="mb-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* labels */}
      {task.labels.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* footer */}
      <div className="flex items-center justify-between gap-2">
        {/* left side - story points, labels, assignee */}
        <div className="flex items-center gap-2">
          {task.storyPoints !== null && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
              {task.storyPoints}
            </span>
          )}
          {task.labels.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Tag className="h-3 w-3" aria-hidden="true" />
              {task.labels.length}
            </span>
          )}
          {assignee && (
            <UserAvatar user={assignee} size="sm" />
          )}
        </div>

        {/* right side - due date */}
        {task.dueDate && (
          <span
            className={`flex items-center gap-0.5 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}
          >
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </button>
  )
}
