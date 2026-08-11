import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Edit3, Check, Plus } from 'lucide-react'
import { useTaskStore } from '../store'
import { STATUSES, PRIORITIES } from '../constants'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { UserAvatar } from './UserAvatar'
import { ProgressBar } from './ProgressBar'
import type { Status, Priority } from '../types'

const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-slate-400 mb-1'

interface Props {
  storyId: string
  onClose: () => void
  onAddTask?: (storyId: string) => void
}

export function StoryModal({ storyId, onClose, onAddTask }: Props) {
  const {
    getStoryById, getEpicById, updateStory, deleteStory,
    tasksForStory, storyProgress,
    getUserById, users,
    setSelectedTaskId,
  } = useTaskStore()

  const story = getStoryById(storyId)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('backlog')
  const [priority, setPriority] = useState<Priority>('medium')
  const [storyPoints, setStoryPoints] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [labelInput, setLabelInput] = useState('')
  const [labels, setLabels] = useState<string[]>([])

  useEffect(() => {
    if (story) {
      setTitle(story.title)
      setDescription(story.description)
      setStatus(story.status)
      setPriority(story.priority)
      setStoryPoints(story.storyPoints?.toString() ?? '')
      setAssigneeId(story.assigneeId ?? '')
      setDueDate(story.dueDate ? story.dueDate.slice(0, 10) : '')
      setLabels(story.labels)
      setEditing(false)
    }
  }, [story?.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!story) return null

  const epic = getEpicById(story.epicId)
  const tasks = tasksForStory(storyId)
  const progress = storyProgress(storyId)
  const assignee = getUserById(story.assigneeId)

  function handleSave() {
    updateStory(storyId, {
      title, description, status, priority,
      storyPoints: storyPoints ? parseInt(storyPoints, 10) : null,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      labels,
    })
    setEditing(false)
  }

  function handleDelete() {
    const msg = `Delete story "${story!.title}"?\n\nThis will also delete ${tasks.length} task${tasks.length !== 1 ? 's' : ''}. This cannot be undone.`
    if (window.confirm(msg)) { deleteStory(storyId); onClose() }
  }

  function addLabel(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = labelInput.trim().toLowerCase()
      if (val && !labels.includes(val)) setLabels([...labels, val])
      setLabelInput('')
    }
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Story: ${story.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* epic color accent */}
        <div className="h-1.5 w-full" style={{ backgroundColor: epic?.color ?? '#8b5cf6' }} />

        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* breadcrumb */}
            {epic && (
              <span className="rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: epic.color }}>
                ◆ {epic.title}
              </span>
            )}
            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
              ◈ Story
            </span>
            <StatusBadge status={editing ? status : story.status} />
            <PriorityBadge priority={editing ? priority : story.priority} />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {editing ? (
              <button type="button" onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <Check className="h-4 w-4" /> Save
              </button>
            ) : (
              <button type="button" onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            )}
            <button type="button" onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              aria-label="Delete story">
              <Trash2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* title */}
          {editing ? (
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className={fieldClass + ' text-lg font-semibold'} aria-label="Story title" />
          ) : (
            <h2 className="text-lg font-semibold text-slate-800">{story.title}</h2>
          )}

          {/* description */}
          <div>
            <label className={labelClass}>Description</label>
            {editing ? (
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={3} className={fieldClass} />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {story.description || <em className="text-slate-400">No description</em>}
              </p>
            )}
          </div>

          {/* progress */}
          {progress.total > 0 && (
            <div>
              <label className={labelClass}>Task Progress</label>
              <ProgressBar progress={progress} />
            </div>
          )}

          {/* metadata grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              {editing ? (
                <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={fieldClass}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              ) : <StatusBadge status={story.status} />}
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              {editing ? (
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={fieldClass}>
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              ) : <PriorityBadge priority={story.priority} />}
            </div>

            <div>
              <label className={labelClass}>Story Points</label>
              {editing ? (
                <input type="number" min={0} max={100} value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)} placeholder="—" className={fieldClass} />
              ) : (
                <span className="text-sm font-medium text-slate-700">{story.storyPoints ?? '—'}</span>
              )}
            </div>

            <div>
              <label className={labelClass}>Due Date</label>
              {editing ? (
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
              ) : (
                <span className="text-sm font-medium text-slate-700">
                  {story.dueDate ? new Date(story.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
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
                  <span className="text-sm font-medium text-slate-700">{assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-slate-400">Unassigned</span>
              )}
            </div>
          </div>

          {/* labels */}
          <div>
            <label className={labelClass}>Labels</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(editing ? labels : story.labels).map((l) => (
                <span key={l} className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {l}
                  {editing && (
                    <button type="button" onClick={() => setLabels(labels.filter((x) => x !== l))}
                      className="text-slate-400 hover:text-slate-700" aria-label={`Remove ${l}`}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <input value={labelInput} onChange={(e) => setLabelInput(e.target.value)} onKeyDown={addLabel}
                placeholder="Type a label and press Enter…" className={fieldClass} />
            )}
          </div>

          {/* child tasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>Tasks ({tasks.length})</label>
              {onAddTask && (
                <button type="button" onClick={() => { onClose(); onAddTask(storyId) }}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                  <Plus className="h-3.5 w-3.5" /> Add Task
                </button>
              )}
            </div>
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tasks yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {tasks.map((t) => {
                  const taskAssignee = getUserById(t.assigneeId)
                  return (
                    <li key={t.id}>
                      <button type="button"
                        onClick={() => { onClose(); setSelectedTaskId(t.id) }}
                        className="w-full text-left rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 hover:border-brand-200 hover:bg-white transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-700 truncate">✦ {t.title}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {taskAssignee && <UserAvatar user={taskAssignee} size="sm" />}
                            <StatusBadge status={t.status} />
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* timestamps */}
          <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
            <span>Created {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>Updated {new Date(story.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
