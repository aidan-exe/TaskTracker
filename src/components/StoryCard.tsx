import { CalendarDays, Tag, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'
import { UserAvatar } from './UserAvatar'
import { ProgressBar } from './ProgressBar'
import { useTaskStore } from '../store'
import type { Story } from '../types'

interface Props {
  story: Story
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function StoryCard({ story }: Props) {
  const { setSelectedStoryId, setSelectedTaskId, getEpicById, getUserById, tasksForStory, storyProgress } = useTaskStore()
  const [expanded, setExpanded] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  const epic = getEpicById(story.epicId)
  const assignee = getUserById(story.assigneeId)
  const tasks = tasksForStory(story.id)
  const progress = storyProgress(story.id)
  const overdue = isOverdue(story.dueDate)

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* story header */}
      <div className="p-4">
        {/* drag handle + epic breadcrumb */}
        <div className="flex items-start gap-2 mb-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors mt-0.5"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex-1">
            {epic && (
              <span className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: epic.color }}>
                ◆ {epic.title}
              </span>
            )}
          </div>
        </div>

        {/* story badge + priority */}
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-violet-100 dark:bg-violet-900 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
            ◈ Story
          </span>
          <PriorityBadge priority={story.priority} />
        </div>

        {/* title - clickable */}
        <button
          type="button"
          onClick={() => setSelectedStoryId(story.id)}
          className="w-full text-left mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug hover:text-brand-700 dark:hover:text-brand-400 line-clamp-2"
        >
          {story.title}
        </button>

        {/* description */}
        {story.description && (
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {story.description}
          </p>
        )}

        {/* progress */}
        {progress.total > 0 && (
          <div className="mb-3">
            <ProgressBar progress={progress} size="sm" />
          </div>
        )}

        {/* labels */}
        {story.labels.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {story.labels.map((label) => (
              <span key={label} className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {label}
              </span>
            ))}
          </div>
        )}

        {/* footer row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {story.storyPoints !== null && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                {story.storyPoints}
              </span>
            )}
            {story.labels.length > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                <Tag className="h-3 w-3" aria-hidden="true" />
                {story.labels.length}
              </span>
            )}
            {assignee && <UserAvatar user={assignee} size="sm" />}
          </div>

          <div className="flex items-center gap-2">
            {story.dueDate && (
              <span className={`flex items-center gap-0.5 text-xs ${overdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                {formatDate(story.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* expand/collapse tasks button */}
        {tasks.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </button>
        )}
      </div>

      {/* tasks list (when expanded) */}
      {expanded && tasks.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-3 space-y-1.5">
          {tasks.map((task) => {
            const taskAssignee = getUserById(task.assigneeId)
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTaskId(task.id)}
                className="w-full text-left flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <span className="text-slate-400 dark:text-slate-500 text-xs">✦</span>
                <span className="flex-1 text-xs text-slate-700 dark:text-slate-200 truncate">{task.title}</span>
                <div className="shrink-0 flex items-center gap-1.5">
                  {taskAssignee && <UserAvatar user={taskAssignee} size="sm" />}
                  <StatusBadge status={task.status} />
                  {task.storyPoints !== null && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
                      {task.storyPoints}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
