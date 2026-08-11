import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Edit3, Check, MessageSquare } from 'lucide-react'
import { useTaskStore } from '../store'
import { STATUSES, PRIORITIES } from '../constants'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { UserAvatar } from './UserAvatar'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import type { Status, Priority } from '../types'

const fieldClass =
  'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20'
const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1'

interface Props {
  taskId: string
  onClose: () => void
}

export function TaskModal({ taskId, onClose }: Props) {
  const { 
    getTaskById, getStoryById, getEpicById, updateTask, deleteTask, moveTask, getUserById, users,
    addTaskComment, deleteTaskComment,
  } = useTaskStore()

  const task = getTaskById(taskId)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('todo')
  const [priority, setPriority] = useState<Priority>('medium')
  const [storyPoints, setStoryPoints] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [labelInput, setLabelInput] = useState('')
  const [labels, setLabels] = useState<string[]>([])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setStatus(task.status)
      setPriority(task.priority)
      setStoryPoints(task.storyPoints?.toString() ?? '')
      setAssigneeId(task.assigneeId ?? '')
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
      setLabels(task.labels)
      setEditing(false)
    }
  }, [task?.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!task) return null

  const story = getStoryById(task.storyId)
  const epic = story ? getEpicById(story.epicId) : undefined
  const assignee = getUserById(task.assigneeId)

  function handleSave() {
    updateTask(taskId, {
      title, description, status, priority,
      storyPoints: storyPoints ? parseInt(storyPoints, 10) : null,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      labels,
    })
    setEditing(false)
  }

  function handleDelete() {
    if (window.confirm(`Delete task "${task!.title}"? This cannot be undone.`)) {
      deleteTask(taskId)
      onClose()
    }
  }

  function addLabel(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = labelInput.trim().toLowerCase()
      if (val && !labels.includes(val)) setLabels([...labels, val])
      setLabelInput('')
    }
  }

  function handleAddComment(content: string, authorId: string) {
    addTaskComment(taskId, { content, authorId })
  }

  function handleDeleteComment(commentId: string) {
    deleteTaskComment(taskId, commentId)
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Task: ${task.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
        {/* epic accent bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: epic?.color ?? '#94a3b8' }} />

        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* breadcrumb */}
            {epic && (
              <span className="rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: epic.color }}>
                ◆ {epic.title}
              </span>
            )}
            {story && (
              <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                ◈ {story.title}
              </span>
            )}
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              ✦ Task
            </span>
            <StatusBadge status={editing ? status : task.status} />
            <PriorityBadge priority={editing ? priority : task.priority} />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {editing ? (
              <button type="button" onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <Check className="h-4 w-4" /> Save
              </button>
            ) : (
              <button type="button" onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            )}
            <button type="button" onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              aria-label="Delete task">
              <Trash2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-600 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {editing ? (
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className={fieldClass + ' text-lg font-semibold'} aria-label="Task title" />
          ) : (
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{task.title}</h2>
          )}

          <div>
            <label className={labelClass}>Description</label>
            {editing ? (
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={4} className={fieldClass} />
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {task.description || <em className="text-slate-400 dark:text-slate-500">No description</em>}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              {editing ? (
                <select value={status} onChange={(e) => {
                  const s = e.target.value as Status
                  setStatus(s)
                  moveTask(taskId, s)
                }} className={fieldClass}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              ) : <StatusBadge status={task.status} />}
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              {editing ? (
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={fieldClass}>
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              ) : <PriorityBadge priority={task.priority} />}
            </div>

            <div>
              <label className={labelClass}>Story Points</label>
              {editing ? (
                <input type="number" min={0} max={100} value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)} placeholder="—" className={fieldClass} />
              ) : (
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{task.storyPoints ?? '—'}</span>
              )}
            </div>

            <div>
              <label className={labelClass}>Due Date</label>
              {editing ? (
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
              ) : (
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
              )}
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Assignee</label>
              {editing ? (
                <div className="flex items-center gap-2">
                  {assigneeId && getUserById(assigneeId) && (
                    <UserAvatar user={getUserById(assigneeId)!} size="sm" showTooltip={false} />
                  )}
                  <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
                    className={fieldClass} aria-label="Assignee">
                    <option value="">Unassigned</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              ) : assignee ? (
                <div className="flex items-center gap-2">
                  <UserAvatar user={assignee} size="sm" showTooltip={false} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-slate-400 dark:text-slate-500">Unassigned</span>
              )}
            </div>
          </div>

          {/* labels */}
          <div>
            <label className={labelClass}>Labels</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(editing ? labels : task.labels).map((l) => (
                <span key={l} className="flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {l}
                  {editing && (
                    <button type="button" onClick={() => setLabels(labels.filter((x) => x !== l))}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" aria-label={`Remove ${l}`}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <input value={labelInput} onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={addLabel} placeholder="Type a label and press Enter…" className={fieldClass} />
            )}
          </div>

          <div className="flex flex-wrap gap-4 border-t border-slate-100 dark:border-slate-700 pt-4 text-xs text-slate-400 dark:text-slate-500">
            <span>Created {new Date(task.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            <span>Updated {new Date(task.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* comments section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Comments ({task.comments.length})
              </h3>
            </div>
            
            <div className="space-y-4">
              <CommentList comments={task.comments} onDelete={handleDeleteComment} />
              <CommentForm onSubmit={handleAddComment} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
